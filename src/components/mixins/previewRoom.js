export const previewRoomMixin = {
  emits: [],

  computed: {
    joinedRoom() {
      return this.room.people.find(id => id === this.user.id)
    }
  },

  methods: {
    isValidRoomId(room) {
      return room?.id && room.id !== 'temp'
    },

    openRoom(playlistId) {
      this.$socket.emit('preview-room:open-playlist', {
        playlist_id: playlistId || this.room.id,
        user_id: this.user.id
      })
    },

    closeRoom(playlistId) {
      this.$socket.emit('preview-room:close-playlist', {
        playlist_id: playlistId,
        user_id: this.user.id
      })
    },

    joinRoom() {
      if (!this.isValidRoomId(this.room)) return
      if (this.isFullMode) this.isFullMode = false

      this.$socket.emit('preview-room:join', {
        user_id: this.user.id,
        playlist_id: this.room.id,
        is_playing: this.isPlaying,
        current_entity_id: this.currentEntity?.id,
        current_entity_index: this.playingEntityIndex,
        current_preview_file_id: this.currentPreview
          ? this.currentPreview.id
          : null,
        current_preview_file_index: this.currentPreviewIndex,
        current_frame: this.currentFrameMovieOrPicture,
        is_repeating: this.isRepeating,
        is_laser_mode: this.isLaserModeOn,
        is_annotations_displayed: this.isAnnotationsDisplayed,
        is_waveform_displayed: this.isWaveformDisplayed,
        is_zoom_enabled: this.isZoomEnabled,
        handle_in: this.handleIn,
        handle_out: this.handleOut,
        speed: this.speed,
        comparing: {
          enable: this.isComparing,
          task_type: this.taskTypeToCompare,
          revision: this.revisionToCompare,
          mode: this.comparisonMode,
          comparison_preview_index: this.currentComparisonPreviewIndex
        }
      })
    },

    leaveRoom(playlistId) {
      if (!this.user) {
        return
      }
      this.$socket.emit('preview-room:leave', {
        user_id: this.user.id,
        playlist_id: playlistId || this.room.id
      })
    },

    sendUpdatePlayingStatus() {
      if (this.isCurrentPreviewMovie) {
        // we need to wait that the video player finished updating before
        // sending the event on the websocket
        this.onNextTimeUpdateActions.push(this.updateRoomStatus)
      } else {
        this.updateRoomStatus()
      }
    },

    updateRoomStatus() {
      if (!this.isValidRoomId(this.room) || !this.joinedRoom) return
      const data = {
        user_id: this.user.id,
        local_id: this.room.localId,
        playlist_id: this.room.id,
        is_playing: this.isPlaying,
        current_entity_id: this.currentEntity.id,
        current_entity_index: this.playingEntityIndex,
        current_preview_file_index: this.currentPreviewIndex,
        current_preview_file_id: this.currentPreview
          ? this.currentPreview.id
          : null,
        current_frame: this.currentFrameMovieOrPicture,
        is_repeating: this.isRepeating,
        is_laser_mode: this.isLaserModeOn,
        is_annotations_displayed: this.isAnnotationsDisplayed,
        is_waveform_displayed: this.isWaveformDisplayed,
        is_zoom_enabled: this.isZoomEnabled,
        handle_in: this.handleIn,
        handle_out: this.handleOut,
        speed: this.speed,
        comparing: {
          enable: this.isComparing,
          task_type: this.taskTypeToCompare,
          revision: this.revisionToCompare,
          mode: this.comparisonMode,
          comparison_preview_index: this.currentComparisonPreviewIndex
        }
      }
      this.$socket.emit('preview-room:room-updated', data)
    },

    postPanZoomChanged(x, y, zoom) {
      if (!this.isValidRoomId(this.room) || !this.joinedRoom) return
      this.$socket.emit('preview-room:panzoom-changed', {
        playlist_id: this.room.id,
        data: {
          local_id: this.room.localId,
          user_id: this.user.id,
          x,
          y,
          zoom
        }
      })
    },

    postComparisonPanZoomChanged(x, y, zoom) {
      if (!this.isValidRoomId(this.room) || !this.joinedRoom) return
      this.$socket.emit('preview-room:comparison-panzoom-changed', {
        playlist_id: this.room.id,
        data: {
          local_id: this.room.localId,
          user_id: this.user.id,
          x,
          y,
          zoom
        }
      })
    },

    postAnnotationAddition(time, serializedObj) {
      if (!this.isValidRoomId(this.room)) return
      this.$socket.emit('preview-room:add-annotation', {
        playlist_id: this.room.id,
        data: {
          local_id: this.localId,
          user_id: this.user.id,
          time,
          obj: serializedObj
        }
      })
    },

    postAnnotationDeletion(time, serializedObj) {
      if (!this.isValidRoomId(this.room)) return
      this.$socket.emit('preview-room:remove-annotation', {
        playlist_id: this.room.id,
        data: {
          local_id: this.localId,
          user_id: this.user.id,
          time,
          obj: serializedObj
        }
      })
    },

    postAnnotationUpdate(time, serializedObj) {
      if (!this.isValidRoomId(this.room)) return
      this.$socket.emit('preview-update-annotation', {
        playlist_id: this.room.id,
        data: {
          local_id: this.localId,
          user_id: this.user.id,
          time,
          obj: serializedObj
        }
      })
    },

    getPreviewFileFromEntity(entity, previewFileId) {
      if (!entity) return null
      let previewFile = null
      const taskTypeIds = Object.keys(entity.preview_files)
      let i = 0
      while (i < taskTypeIds.length && !previewFile) {
        const taskTypeId = taskTypeIds[i]
        const previewFiles = entity.preview_files[taskTypeId]
        previewFile = previewFiles.find(file => file.id === previewFileId)
        i++
      }
      return previewFile
    },

    loadRoomCurrentState(eventData) {
      if (eventData.is_playing !== this.isPlaying && !eventData.is_playing) {
        // pause, if needed, to prevent screen flickering
        this.pause()
      }

      const currentPreviewFileId = this.currentPreview
        ? this.currentPreview.id
        : null

      let isEntityChanged = false
      // A shot or an asset is selected
      if (
        this.exists(eventData.current_entity_index) &&
        eventData.current_entity_index !== this.playingEntityIndex
      ) {
        this.playEntity(eventData.current_entity_index)
        isEntityChanged = true

        // The preview for the current entity has changed
      } else if (
        this.exists(eventData.current_preview_file_id) &&
        eventData.current_preview_file_id !== currentPreviewFileId &&
        eventData.current_preview_file_index === 0
      ) {
        const previewFileId = eventData.current_preview_file_id
        const entity = this.entities[eventData.current_entity_id]
        const previewFile = this.getPreviewFileFromEntity(entity, previewFileId)
        const task = this.taskMap.get(previewFile.task_id)
        const taskTypeId = task.task_type_id
        // Update selection
        this.changePreviewFile(entity, previewFile)
        // Update related widget
        const playlistedEntityWidget =
          this.$refs['entity-' + this.playingEntityIndex][0]
        playlistedEntityWidget.setPreviewFileId(previewFileId)
        playlistedEntityWidget.setTaskTypeId(taskTypeId)
      }

      // The sub preview for the current entity has changed
      if (
        this.exists(eventData.current_preview_file_index) &&
        eventData.current_preview_index !== this.currentPreviewIndex
      ) {
        this.currentPreviewIndex = eventData.current_preview_file_index
        isEntityChanged = true
      }

      // The frame for the current entity has changed
      if (this.exists(eventData.current_frame)) {
        this.$nextTick(() => {
          this.loadRoomCurrentFrame(eventData)
          if (isEntityChanged) {
            this.$nextTick(() => {
              this.updateProgressBar()
              this.onWindowResize() // needed due to a progress bar display bug
            })
          }
        })
      }

      // Repeating option has changed
      if (
        this.exists(eventData.is_repeating) &&
        eventData.is_repeating !== this.isRepeating
      ) {
        this.isRepeating = eventData.is_repeating
      }

      // Speed options has changed
      if (this.exists(eventData.speed) && eventData.speed !== this.speed) {
        this.speed = eventData.speed
        let rate = 1
        if (this.speed === 2) rate = 0.5
        if (this.speed === 1) rate = 0.25
        this.setPlayerSpeed(rate)
      }

      // Comparison options has changed
      if (this.exists(eventData.comparing)) {
        this.isComparing = eventData.comparing.enable
        this.taskTypeToCompare = eventData.comparing.task_type
        this.revisionToCompare = eventData.comparing.revision
        this.comparisonMode = eventData.comparing.mode
        this.currentComparisonPreviewIndex =
          eventData.comparing.comparison_preview_index
      }

      // Playback options has changed
      if (eventData.is_playing !== this.isPlaying) {
        if (eventData.is_playing) {
          this.play()
        } else {
          this.pause()
        }
      }

      // Waveform display has changed
      if (
        this.exists(eventData.is_waveform_displayed) &&
        eventData.is_waveform_displayed !== this.isWaveformDisplayed
      ) {
        this.isWaveformDisplayed = eventData.is_waveform_displayed
      }

      // Laser mode has changed
      if (
        this.exists(eventData.is_laser_mode) &&
        eventData.is_laser_mode !== this.isLaserModeOn
      ) {
        this.isLaserModeOn = eventData.is_laser_mode
      }

      // Annotations display has changed
      if (
        this.exists(eventData.is_annotations_displayed) &&
        eventData.is_annotations_displayed !== this.isAnnotationsDisplayed
      ) {
        this.isAnnotationsDisplayed = eventData.is_annotations_displayed
      }

      // Zoom mode has changed
      if (
        this.exists(eventData.is_zoom_enabled) &&
        eventData.is_zoom_enabled !== this.isZoomEnabled
      ) {
        this.isZoomEnabled = eventData.is_zoom_enabled
      }

      // Handle in has changed
      if (
        this.exists(eventData.handle_in) &&
        eventData.handle_in !== this.handleIn
      ) {
        this.handleIn = eventData.handle_in
      }

      // Handle out has changed
      if (
        this.exists(eventData.handle_out) &&
        eventData.handle_out !== this.handleOut
      ) {
        this.handleOut = eventData.handle_out
      }
    },

    loadRoomCurrentFrame(eventData) {
      if (eventData.current_frame !== this.currentFrameMovieOrPicture) {
        const frameNumber = eventData.current_frame - 1
        this.rawPlayer.setCurrentFrame(frameNumber)
        this.currentTimeRaw = frameNumber * this.frameDuration + 0.01
        if (this.syncComparisonPlayer) this.syncComparisonPlayer()
        this.updateProgressBar()

        this.clearCanvas()
        const annotation = this.getAnnotation(frameNumber * this.frameDuration)
        if (annotation) this.loadAnnotation(annotation)
      } else if (
        this.isCurrentPreviewPicture &&
        eventData.current_frame !== this.framesSeenOfPicture
      ) {
        this.framesSeenOfPicture = eventData.current_frame
      }
    },

    onPreviousFrameClicked() {
      this.clearFocus()
      this.goPreviousFrame()
      this.sendUpdatePlayingStatus()
    },

    onNextFrameClicked() {
      this.clearFocus()
      this.goNextFrame()
      this.sendUpdatePlayingStatus()
    }
  },

  /* N.B.: socket.events are not part of Vue's mixin boilerplate and
   * must be included explicitly in each component using preview !
   */
  socket: {
    events: {
      'preview-room:room-people-updated'(eventData) {
        if (!this.isValidRoomId(this.room)) return
        this.room.people = eventData.people
        if (this.joinedRoom) {
          this.room.newComer = false
        }
      },

      'preview-room:room-updated'(eventData) {
        if (!this.isValidRoomId(this.room)) return
        if (this.room.localId === eventData.local_id) return
        this.people = eventData.people
        if (!this.joinedRoom) return
        if (this.room.localId === eventData.local_id) return
        if (eventData.only_newcomer && !this.newComer) return
        this.loadRoomCurrentState(eventData)
      },

      'preview-room:panzoom-changed'(eventData) {
        if (!this.isValidRoomId(this.room) || !this.joinedRoom) return
        if (this.room.localId === eventData.local_id) return
        const x = eventData.data.x
        const y = eventData.data.y
        const zoom = eventData.data.zoom
        this.setPanZoom(x, y, zoom)
      },

      'preview-room:comparison-panzoom-changed'(eventData) {
        if (!this.isValidRoomId(this.room) || !this.joinedRoom) return
        if (this.room.localId === eventData.local_id) return
        const x = eventData.data.x
        const y = eventData.data.y
        const zoom = eventData.data.zoom
        this.setComparisonPanZoom(x, y, zoom)
      },

      'preview-room:add-annotation'(eventData) {
        if (!this.isValidRoomId(this.room) || !this.joinedRoom) return
        const annotation = this.getAnnotation(eventData.time)
        const obj = eventData.data.obj
        if (this.getObjectById(obj)) return
        if (this.isLaserModeOn) {
          this.addObjectToCanvas(annotation, obj).then(o => this.fadeObject(o))
        } else {
          this.addObjectToCanvas(annotation, obj)
        }
      },

      'preview-room:remove-annotation'(eventData) {
        if (!this.isValidRoomId(this.room) || !this.joinedRoom) return
        const obj = eventData.data.obj
        if (!this.getObjectById(obj)) return
        this.removeObjectFromCanvas(obj)
      },

      'preview-room:update-annotation'(eventData) {
        if (!this.isValidRoomId(this.room) || !this.joinedRoom) return
        const annotation = this.getAnnotation(eventData.time)
        const obj = eventData.data.obj
        this.updateObjectInCanvas(annotation, obj)
      }
    }
  }
}
