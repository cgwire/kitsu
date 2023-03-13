export const previewRoomMixin = {
  created() {},

  mounted() {},

  beforeDestroy() {},

  computed: {
    room() {
      return this.previewRoom().room
    },

    joinedRoom() {
      return this.previewRoom().joinedRoom
    }
  },

  methods: {
    previewRoom() {
      // N.B.: computed won't work in this case because it will
      // cache the invalid value before component is rendered.
      return this.$refs[this.previewRoomRef]
    },

    isValidRoomId(value) {
      if (!value || value === 'temp') {
        return false
      }
      return true
    },

    joinRoom() {
      if (!this.previewRoom()) return

      this.$socket.emit('preview-room:join', {
        user_id: this.user.id,
        playlist_id: this.previewRoom().roomId,
        is_playing: this.isPlaying,
        current_entity_index: this.playingEntityIndex,
        current_preview_file_id: this.playingPreviewFileId,
        current_frame: this.currentFrameMovieOrPicture,
        is_repeating: this.isRepeating,
        is_laser_mode: this.isLaserModeOn,
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

    leaveRoom() {
      if (!this.previewRoom()) return

      this.$socket.emit('preview-room:leave', {
        user_id: this.user.id,
        playlist_id: this.previewRoom().roomId
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
      if (!this.previewRoom()) return
      if (!this.joinedRoom) return

      this.$socket.emit('preview-room:update-playing-status', {
        playlist_id: this.previewRoom().roomId,
        is_playing: this.isPlaying,
        current_entity_index: this.playingEntityIndex,
        current_preview_file_id: this.playingPreviewFileId,
        current_frame: this.currentFrameMovieOrPicture,
        is_repeating: this.isRepeating,
        is_laser_mode: this.isLaserModeOn,
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

    postAnnotationAddition(time, serializedObj) {
      if (!this.previewRoom()) return
      this.$socket.emit('preview-room:add-annotation', {
        playlist_id: this.previewRoom().roomId,
        data: {
          user_id: this.user.id,
          time,
          obj: serializedObj
        }
      })
    },

    postAnnotationDeletion(time, serializedObj) {
      if (!this.previewRoom()) return
      this.$socket.emit('preview-room:remove-annotation', {
        playlist_id: this.previewRoom().roomId,
        data: {
          user_id: this.user.id,
          time,
          obj: serializedObj
        }
      })
    },

    postAnnotationUpdate(time, serializedObj) {
      if (!this.previewRoom()) return
      this.$socket.emit('preview-room:update-annotation', {
        playlist_id: this.previewRoom().roomId,
        data: {
          user_id: this.user.id,
          time,
          obj: serializedObj
        }
      })
    },

    loadRoomCurrentState(eventData) {
      if (eventData.is_playing !== this.isPlaying && !eventData.is_playing) {
        // pause if needed to prevent screen flickering
        this.pause()
      }

      let isEntityChanged = false
      if (
        this.exists(eventData.current_entity_index) &&
        eventData.current_entity_index !== this.playingEntityIndex
      ) {
        this.playEntity(eventData.current_entity_index)
        isEntityChanged = true
      }

      if (
        this.exists(eventData.current_preview_file_id) &&
        eventData.current_preview_file_id !== this.playingPreviewFileId
      ) {
        this.playingPreviewFileId = eventData.current_preview_file_id
        isEntityChanged = true
      }

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

      if (
        this.exists(eventData.is_repeating) &&
        eventData.is_repeating !== this.isRepeating
      ) {
        this.isRepeating = eventData.is_repeating
      }

      if (this.exists(eventData.speed) && eventData.speed !== this.speed) {
        this.speed = eventData.speed
        let rate = 1
        if (this.speed === 2) rate = 0.5
        if (this.speed === 1) rate = 0.25
        this.setPlayerSpeed(rate)
      }

      if (this.exists(eventData.comparing)) {
        this.isComparing = eventData.comparing.enable
        this.taskTypeToCompare = eventData.comparing.task_type
        this.revisionToCompare = eventData.comparing.revision
        this.comparisonMode = eventData.comparing.mode
        this.currentComparisonPreviewIndex =
          eventData.comparing.comparison_preview_index
      }

      if (eventData.is_playing !== this.isPlaying) {
        if (eventData.is_playing) {
          this.play()
        } else {
          this.pause()
        }
      }

      if (
        this.exists(eventData.is_laser_mode) &&
        eventData.is_laser_mode !== this.isLaserModeOn
      ) {
        this.isLaserModeOn = eventData.is_laser_mode
      }

      if (
        this.exists(eventData.handle_in) &&
        eventData.handle_in !== this.handleIn
      ) {
        this.handleIn = eventData.handle_in
      }

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
   * must be included explicitly in each component using preview rooms!
   */
  socket: {
    events: {
      'preview-room:room-people-updated'(eventData) {
        // someone joined the room
        if (!this.previewRoom()) return

        if (this.joinedRoom) {
          this.room.people = eventData.people
        } else {
          this.room.people = eventData.people
          if (this.joinedRoom) {
            this.room.newComer = false
            this.loadRoomCurrentState(eventData)
          }
        }
      },

      'preview-room:room-updated'(eventData) {
        if (!this.previewRoom()) return

        this.room.people = eventData.people
        if (!this.joinedRoom) return
        if (eventData.only_newcomer && !this.room.newComer) return
        this.loadRoomCurrentState(eventData)
      },

      'preview-room:add-annotation'(eventData) {
        if (!this.previewRoom()) return
        if (!this.joinedRoom) return
        const annotation = this.getAnnotation(eventData.time)
        const obj = eventData.data.obj
        if (this.getObjectById(obj)) return
        if (this.isLaserModeOn) {
          const o = this.addObjectToCanvas(annotation, obj)
          this.fadeObject(o)
        } else {
          this.addObjectToCanvas(annotation, obj)
        }
      },

      'preview-room:remove-annotation'(eventData) {
        if (!this.previewRoom()) return

        if (!this.joinedRoom) return
        const obj = eventData.data.obj
        if (!this.getObjectById(obj)) return
        this.removeObjectFromCanvas(obj)
      },

      'preview-room:update-annotation'(eventData) {
        if (!this.previewRoom()) return
        if (!this.joinedRoom) return
        // if (this.user.id === eventData.data.user_id) return
        const annotation = this.getAnnotation(eventData.time)
        const obj = eventData.data.obj
        this.updateObjectInCanvas(annotation, obj)
      }
    }
  }
}
