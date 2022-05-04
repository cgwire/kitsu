import { mapActions, mapGetters } from 'vuex'
import { fabric } from 'fabric'

import { formatTime, formatFrame, roundToFrame, floorToFrame } from '@/lib/video'

export const playerMixin = {

  data () {
    return {
      annotations: [],
      color: '#ff3860',
      currentPreviewIndex: 0,
      currentTime: '00:00.000',
      currentTimeRaw: 0,
      entityList: [],
      entityListToCompare: [],
      fabricCanvas: null,
      framesPerImage: [],
      framesSeenOfPicture: 0,
      fullScreen: false,
      isCommentsHidden: true,
      isComparing: false,
      isDrawing: false,
      isEntitiesHidden: false,
      isHd: false,
      isMuted: false,
      isPlaying: false,
      isRepeating: false,
      isTyping: false,
      maxDuration: '00:00.000',
      maxDurationRaw: 0,
      onNextTimeUpdateActions: [],
      pencil: 'big',
      pencilPalette: ['big', 'medium', 'small'],
      playingEntityIndex: 0,
      playingPreviewFileId: null,
      speed: 3,
      task: null,
      textColor: '#ff3860'
    }
  },

  mounted () {
  },

  beforeDestroy () {
    this.endAnnotationSaving()
    this.removeEvents()
    this.leaveRoom()
  },

  computed: {
    ...mapGetters([
      'isCurrentUserArtist',
      'isCurrentUserClient',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    extension () {
      if (!this.currentPreview) return ''
      if (this.currentPreview.extension) {
        return this.currentPreview.extension
      }
      return ''
    },

    isCurrentPreviewMovie () {
      return this.extension === 'mp4'
    },

    isCurrentPreviewPicture () {
      return this.isPicture(this.extension)
    },

    isCurrentPreviewModel () {
      return this.isModel(this.extension)
    },

    isCurrentPreviewSound () {
      return this.isSound(this.extension)
    },

    isCurrentPreviewPdf () {
      return this.isPdf(this.extension)
    },

    isCurrentPreviewFile () {
      return (
        !this.isCurrentPreviewMovie &&
        !this.isCurrentPreviewPicture &&
        !this.isCurrentPreviewSound &&
        !this.isCurrentPreviewModel
      )
    },

    isComparisonOverlay () {
      return this.comparisonMode !== 'sidebyside'
    },

    overlayOpacity () {
      if (this.isComparing && this.isComparisonOverlay) {
        switch (this.comparisonMode) {
          case 'overlay25':
            return 0.25
          case 'overlay50':
            return 0.5
          case 'overlay75':
            return 0.75
          default:
            return 1
        }
      } else {
        return 1
      }
    },

    currentPreviewPath () {
      if (this.currentPreview) {
        let previewId = this.currentPreview.id
        let extension = this.currentPreview.extension
        if (this.currentPreviewIndex > 0) {
          const index = this.currentPreviewIndex - 1
          const preview = this.currentEntity.preview_file_previews[index]
          previewId = preview.id
          extension = preview.extension
        }
        return `/api/pictures/originals/preview-files/${previewId}.${extension}`
      } else {
        return ''
      }
    },

    currentComparisonPreviewPath () {
      if (this.currentPreviewToCompare && this.isPictureComparison) {
        const extension = this.currentPreviewToCompare.extension
        const previewId = this.currentPreviewToCompare.id
        return `/api/pictures/originals/preview-files/${previewId}.${extension}`
      } else {
        return ''
      }
    },

    currentPreviewDlPath () {
      if (!this.currentPreview) return ''
      const previewId = this.currentPreview.id
      return `/api/pictures/originals/preview-files/${previewId}/download`
    },

    currentEntity () {
      return this.entityList[this.playingEntityIndex]
    },

    currentPreview () {
      if (!this.currentEntity) return null
      if (this.currentPreviewIndex === 0) {
        return {
          id: this.currentEntity.preview_file_id,
          extension: this.currentEntity.preview_file_extension,
          task_id: this.currentEntity.preview_file_task_id,
          annotations: this.currentEntity.preview_file_annotations || []
        }
      } else {
        return this.currentEntity.preview_file_previews[
          this.currentPreviewIndex - 1
        ]
      }
    },

    currentEntityPreviewLength () {
      if (!this.currentEntity || !this.currentEntity.preview_file_previews) {
        return 0
      }
      return this.currentEntity.preview_file_previews.length + 1
    },

    isFullScreenEnabled () {
      return !!(
        document.fullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled ||
        document.webkitSupportsFullscreen ||

        document.webkitFullscreenEnabled ||
        document.createElement('video').webkitRequestFullScreen
      )
    },

    frameNumber () {
      let frameNumber = this.currentTimeRaw / this.frameDuration
      if (frameNumber >= this.nbFrames) {
        frameNumber = this.nbFrames
      }
      return Math.round(frameNumber) - 1
    },

    currentFrame () {
      return formatFrame(this.frameNumber + 2)
    },

    currentFrameMovieOrPicture () {
      if (this.isCurrentPreviewMovie) {
        return parseInt(this.currentFrame)
      } else if (this.isCurrentPreviewPicture) {
        return this.framesSeenOfPicture
      }
      return 0
    },

    frameDuration () {
      return Math.round((1 / this.fps) * 10000) / 10000
    },

    fps () {
      return this.currentProduction
        ? parseInt(this.currentProduction.fps || '24')
        : 24
    },

    // Elements

    container () {
      return this.$refs.container
    },

    rawPlayer () {
      return this.$refs['raw-player']
    },

    rawPlayerComparison () {
      return this.$refs['raw-player-comparison']
    },

    picturePlayer () {
      return this.$refs['picture-player']
    },

    soundPlayer () {
      return this.$refs['sound-player']
    },

    canvas () {
      return this.$refs['canvas-wrapper']
    },

    progress () {
      return this.$refs['video-progress']
    },

    video () {
      return this.$refs.movie
    },

    nbFrames () {
      return Math.round(this.maxDurationRaw * this.fps)
    }
  },

  methods: {
    ...mapActions([
      'refreshPreview'
    ]),

    isMovie (extension) {
      return extension === 'mp4'
    },

    isPicture (extension) {
      return ['gif', 'png', 'jpg', 'jpeg'].includes(extension)
    },

    isModel (extension) {
      return ['glb', 'gltf'].includes(extension)
    },

    isSound (extension) {
      return ['mp3', 'wav'].includes(extension)
    },

    isPdf (extension) {
      return extension === 'pdf'
    },

    exists (variable) {
      return variable !== null && variable !== undefined
    },

    configureEvents () {
      window.addEventListener('keydown', this.onKeyDown, false)
      window.addEventListener('resize', this.onWindowResize)
      if (!this.$el.nomousemove) this.$el.onmousemove = this.onMouseMove
      if (this.container) {
        this.container.addEventListener(
          'fullscreenchange', this.onFullScreenChange, false)
        this.container.addEventListener(
          'mozfullscreenchange', this.onFullScreenChange, false)
        this.container.addEventListener(
          'MSFullscreenChange', this.onFullScreenChange, false)
        this.container.addEventListener(
          'webkitfullscreenchange', this.onFullScreenChange, false)
      }
      window.addEventListener('beforeunload', this.onWindowsClosed)
    },

    removeEvents () {
      window.removeEventListener('keydown', this.onKeyDown)
      window.removeEventListener('resize', this.onWindowResize)
      window.removeEventListener('beforeunload', this.onWindowsClosed)
      this.$el.onmousemove = null
      if (this.container) {
        this.container.removeEventListener(
          'fullscreenchange', this.onFullScreenChange, false)
        this.container.removeEventListener(
          'mozfullscreenchange', this.onFullScreenChange, false)
        this.container.removeEventListener(
          'MSFullscreenChange', this.onFullScreenChange, false)
        this.container.removeEventListener(
          'webkitfullscreenchange', this.onFullScreenChange, false)
      }
    },
    formatTime,

    displayBars () {
      if (this.$refs['button-bar']) {
        if (this.$refs.header) {
          this.$refs.header.style.opacity = 1
        }
        if (this.$refs['button-bar']) {
          this.$refs['button-bar'].style.opacity = 1
        }
        if (this.$refs['video-progress']) {
          this.$refs['video-progress'].$el.style.opacity = 1
        }
        this.container.style.cursor = 'default'
      }
    },

    hideBars () {
      this.$refs.header.style.opacity = 0
      this.$refs['button-bar'].style.opacity = 0
      this.$refs['video-progress'].$el.style.opacity = 0
    },

    updateProgressBar () {
      if (this.progress) {
        this.progress.updateProgressBar(this.frameNumber)
      }
    },

    updateTaskPanel () {
      if (this.entityList.length > 0) {
        const entity = this.entityList[this.playingEntityIndex]
        if (entity) this.task = this.taskMap.get(entity.preview_file_task_id)
        else this.task = null
      } else {
        this.task = null
      }
    },

    playClicked () {
      this.play()
      this.updatePlayingStatus()
    },

    pauseClicked () {
      this.pause()
      this.updatePlayingStatus()
    },

    play () {
      if (this.isCurrentPreviewPicture) {
        this.playPicture()
      } else if (this.isCurrentPreviewSound) {
        this.playSound()
      } else {
        this.rawPlayer.play()
        if (this.isComparing) {
          this.rawPlayerComparison.play()
        }
        this.isPlaying = this.rawPlayer.isPlaying
      }
      this.hideCanvas()
      this.clearCanvas()
    },

    pause () {
      this.showCanvas()
      if (this.isCurrentPreviewMovie) {
        const comparisonPlayer = this.$refs['raw-player-comparison']
        if (this.rawPlayer) this.rawPlayer.pause()
        if (comparisonPlayer) comparisonPlayer.pause()
      } else if (this.isCurrentPreviewSound) {
        this.soundPlayer.pause()
      }
      this.isPlaying = false
    },

    playEntity (entityIndex) {
      const entity = this.entityList[entityIndex]
      const wasDrawing = this.isDrawing === true
      this.hideCanvas()
      this.clearCanvas()
      this.framesSeenOfPicture = 0
      this.playingEntityIndex = entityIndex
      if (entity && this.isMovie(entity.preview_file_extension)) {
        this.$nextTick(() => {
          this.scrollToEntity(this.playingEntityIndex)
          this.rawPlayer.loadEntity(entityIndex)
          this.annotations = entity.preview_file_annotations || []
          if (this.isComparing) {
            this.$refs['raw-player-comparison'].loadEntity(entityIndex)
          }
          if (this.isPlaying) {
            this.rawPlayer.play()
            if (this.isComparing) this.$refs['raw-player-comparison'].play()
          } else {
            this.showCanvas()
          }
        })
      } else {
        const annotation = this.getAnnotation(0)
        if (!this.isPlaying) this.loadAnnotation(annotation)
        if (wasDrawing) {
          setTimeout(() => {
            this.isDrawing = true
            this.fabricCanvas.isDrawingMode = true
          }, 100)
        }
        if (this.isPlaying && this.isPicture(entity.preview_file_extension)) {
          this.playPicture()
        }
      }
      this.scrollToEntity(this.playingEntityIndex)
    },

    syncComparisonPlayer () {
      if (
        this.rawPlayerComparison &&
        this.isComparing &&
        this.rawPlayerComparison.currentPlayer
      ) {
        const currentTimeRaw = this.rawPlayer.getCurrentTimeRaw()
        this.rawPlayerComparison.currentPlayer.currentTime = currentTimeRaw
      }
    },

    goPreviousFrame () {
      this.clearCanvas()
      this.rawPlayer.goPreviousFrame()
      if (this.isComparing) this.syncComparisonPlayer()
      const annotation = this.getAnnotation(
        this.rawPlayer.getCurrentTime() - this.frameDuration)
      if (annotation) this.loadSingleAnnotation(annotation)
    },

    goNextFrame () {
      this.clearCanvas()
      this.rawPlayer.goNextFrame()
      if (this.isComparing) this.syncComparisonPlayer()
      const annotation = this.getAnnotation(
        this.rawPlayer.getCurrentTime() - this.frameDuration)
      if (annotation) this.loadSingleAnnotation(annotation)
    },

    setFullScreen () {
      if (this.container.requestFullscreen) {
        this.container.requestFullscreen()
      } else if (this.container.mozRequestFullScreen) {
        this.container.mozRequestFullScreen()
      } else if (this.container.webkitRequestFullScreen) {
        this.container.webkitRequestFullScreen()
      } else if (this.container.msRequestFullscreen) {
        this.container.msRequestFullscreen()
      }
      this.container.setAttribute('data-fullscreen', !!true)
      document.activeElement.blur()
      this.fullScreen = true
    },

    exitFullScreen () {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
      this.container.setAttribute('data-fullscreen', !!false)
      document.activeElement.blur()
      this.fullScreen = false
    },

    isFullScreen () {
      return !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement
      )
    },

    onScrubStart () {
      if (this.$refs['button-bar']) {
        this.$refs['button-bar'].classList.add('unselectable')
      }
    },

    onScrubEnd () {
      if (this.$refs['button-bar']) {
        this.$refs['button-bar'].classList.remove('unselectable')
      }
    },

    onProgressChanged (frameNumber) {
      this.clearCanvas()
      this.rawPlayer.setCurrentFrame(frameNumber)
      this.syncComparisonPlayer()
      const annotation = this.getAnnotation(
        frameNumber * this.frameDuration
      )
      if (annotation) this.loadAnnotation(annotation)
      this.sendUpdatePlayingStatus()
      this.onFrameUpdate(frameNumber)
    },

    onPreviousFrameClicked () {
      this.clearFocus()
      this.goPreviousFrame()
      this.sendUpdatePlayingStatus()
    },

    onNextFrameClicked () {
      this.clearFocus()
      this.goNextFrame()
      this.sendUpdatePlayingStatus()
    },

    onPlayPauseClicked () {
      this.clearFocus()
      if (!this.isPlaying) {
        this.playClicked()
      } else {
        this.pauseClicked()
        const annotation = this.getAnnotation(this.rawPlayer.getCurrentTime())
        if (annotation) this.loadAnnotation(annotation)
      }
    },

    onVideoRepeated () {
      if (!this.isCommentsHidden && !this.isFocusTextarea()) {
        this.clearFocus()
      }
      if (this.rawPlayerComparison) {
        this.syncComparisonPlayer()
        this.rawPlayerComparison.play()
      }
    },

    onRepeatClicked () {
      this.clearFocus()
      this.isRepeating = !this.isRepeating
      this.updatePlayingStatus()
    },

    onToggleSoundClicked () {
      this.clearFocus()
      this.isMuted = !this.isMuted
    },

    onFullScreenChange () {
      if (
        this.fullScreen &&
        !this.isFullScreen()
      ) {
        this.fullScreen = false
      }
    },

    onFullscreenClicked () {
      /** @lends fabric.IText.prototype */
      // fix for : IText not editable when canvas is in a fullscreen
      // element on chrome
      // https://github.com/fabricjs/fabric.js/issues/5126
      const originalInitHiddenTextarea =
        fabric.IText.prototype.initHiddenTextarea
      if (this.isFullScreen()) {
        fabric.util.object.extend(fabric.IText.prototype, {
          initHiddenTextarea: function () {
            originalInitHiddenTextarea.call(this)
            fabric.document.body.appendChild(this.hiddenTextarea)
          }
        })
        this.exitFullScreen()
      } else {
        fabric.util.object.extend(fabric.IText.prototype, {
          initHiddenTextarea: function () {
            originalInitHiddenTextarea.call(this)
            this.canvas.wrapperEl.appendChild(this.hiddenTextarea)
          }
        })
        this.setFullScreen()
      }
    },

    onKeyDown (event) {
      this.displayBars()
      if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        if ((event.keyCode === 46 || event.keyCode === 8) && this.fabricCanvas) {
          this.deleteSelection()
        } else if (event.keyCode === 37) {
          event.preventDefault()
          event.stopPropagation()
          this.onPreviousFrameClicked()
        } else if (event.keyCode === 39) {
          event.preventDefault()
          event.stopPropagation()
          this.onNextFrameClicked()
        } else if (event.keyCode === 32) {
          event.preventDefault()
          event.stopPropagation()
          this.onPlayPauseClicked()
        } else if (event.altKey && event.keyCode === 74) { // alt+j
          event.preventDefault()
          event.stopPropagation()
          this.onPlayPreviousEntityClicked()
        } else if (event.altKey && event.keyCode === 75) { // alt+k
          event.preventDefault()
          event.stopPropagation()
          this.onPlayNextEntityClicked()
        } else if (event.ctrlKey && event.keyCode === 67) { // ctrl + c
          this.copyAnnotations()
        } else if (event.ctrlKey && event.keyCode === 86) { // ctrl + v
          this.pasteAnnotations()
        } else if (event.ctrlKey && event.altKey && event.keyCode === 68) {
          this.onAnnotateClicked()
        } else if (event.ctrlKey && event.keyCode === 90) {
          this.undoLastAction()
        } else if (event.altKey && event.keyCode === 82) {
          this.redoLastAction()
        }
      }
    },

    onWindowResize () {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 600) {
        this.lastCall = now
        setTimeout(() => {
          this.resetHeight()
          this.resetCanvas()
            .then(() => {
              this.reloadAnnotations()
            })
        }, 200)
      }
    },

    reloadAnnotations (current = true) {
      if (!this.annotations) return
      const annotations = this.annotations.map(a => ({ ...a }))
      this.annotations = []
      setTimeout(() => {
        this.annotations = annotations
        if (current) {
          this.reloadCurrentAnnotation()
        }
      }, 200)
    },

    onFilmClicked () {
      this.isEntitiesHidden = !this.isEntitiesHidden
      this.$nextTick(() => {
        this.resetHeight()
        this.reloadAnnotations()
        this.scrollToEntity(this.playingEntityIndex)
      })
    },

    getCurrentTime () {
      return roundToFrame(this.currentTimeRaw, this.fps) || 0
    },

    reloadCurrentAnnotation () {
      let currentTime = roundToFrame(this.currentTimeRaw, this.fps) || 0
      if (this.isCurrentPreviewPicture) currentTime = 0
      const annotation = this.getAnnotation(currentTime)
      if (annotation) this.loadAnnotation(annotation)
    },

    onCommentClicked () {
      const height = this.$refs['video-container'].offsetHeight
      this.isCommentsHidden = !this.isCommentsHidden
      if (!this.isCommentsHidden) {
        this.$refs['task-info'].$el.style.height = `${height}px`
      }
      this.$nextTick(() => {
        this.$refs['task-info'].focusCommentTextarea()
        this.resetHeight()
        this.reloadAnnotations()
      })
    },

    onCompareClicked () {
      this.isComparing = !this.isComparing
      this.$nextTick(() => {
        this.saveUserComparisonChoice()
        this.comparisonEntityMissing = false
      })
      this.updatePlayingStatus()
    },

    onSpeedClicked () {
      this.speed = this.speed + 1 > 3 ? 1 : this.speed + 1
      let rate = 1
      if (this.speed === 2) rate = 0.5
      if (this.speed === 1) rate = 0.25
      this.setPlayerSpeed(rate)
      this.updatePlayingStatus()
    },

    setPlayerSpeed (rate) {
      this.rawPlayer.setSpeed(rate)
      if (this.rawPlayerComparison) this.rawPlayerComparison.setSpeed(rate)
    },

    onFrameUpdate (frame) {
      this.currentTimeRaw = frame * this.frameDuration
      this.currentTime = this.formatTime(this.currentTimeRaw)
      this.updateProgressBar()
      const actions = this.onNextTimeUpdateActions
      actions.forEach(action => action())
      this.onNextTimeUpdateActions = []
    },

    onMaxDurationUpdate (duration) {
      if (duration) {
        duration = floorToFrame(duration, this.fps)
        this.maxDurationRaw = duration
        this.maxDuration = this.formatTime(duration)
      } else {
        this.maxDurationRaw = 0
        this.maxDuration = '00.00.000'
      }
    },

    onMouseMove () {
      const buttonBar = this.$refs['button-bar']
      if (buttonBar && buttonBar.style.opacity !== 1) {
        this.displayBars()
      }
      const isMovieFullScreen =
        this.isFullScreen() && this.isEntitiesHidden && this.isCommentsHidden
      if (isMovieFullScreen) {
        if (this.timer) clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          const isMovieFullScreen =
            this.isFullScreen() && this.isEntitiesHidden && this.isCommentsHidden
          if (isMovieFullScreen) this.hideBars()
        }, 2000)
      }
    },

    playPicture () {
      if (this.isPlaying) clearTimeout(this.playingPictureTimeout)
      this.isPlaying = true
      this.playingPictureTimeout = setTimeout(
        this.continuePlayingPlaylist,
        100,
        this.playingEntityIndex,
        Date.now() - 1000 * this.framesSeenOfPicture / this.fps
      )
    },

    playSound () {
      this.isPlaying = true
      this.soundPlayer.play()
    },

    resetCanvas () {
      this.clearCanvas()
      return this.resetCanvasSize()
        .then(() => {
          if (this.fabricCanvas) this.fabricCanvas.renderAll()
          return Promise.resolve(this.fabricCanvas)
        })
    },

    resetCanvasSize () {
      return this.$nextTick()
        .then(() => {
          if (this.isCurrentPreviewMovie && this.fabricCanvas) {
            if (this.canvas) {
              // Video Ratio
              const ratio = this.rawPlayer.getVideoRatio()

              // Container size
              const fullWidth = this.rawPlayer.$el.offsetWidth
              const fullHeight = this.rawPlayer.$el.offsetHeight
              const width = ratio ? fullHeight * ratio : fullWidth

              if (fullWidth > width) {
                // Case where canvas is less big than the container
                const left = Math.round((fullWidth - width) / 2)
                this.canvas.style.left = left + 'px'
                this.canvas.style.top = '0px'
                this.fabricCanvas.setDimensions({ width, height: fullHeight })
              } else {
                // Case where canvas is bigger than the container
                const height = ratio ? Math.round(fullWidth / ratio) : fullHeight
                const top = Math.round((fullHeight - height) / 2)
                this.canvas.style.left = '0px'
                this.canvas.style.top = top + 'px'
                this.fabricCanvas.setDimensions({ width: fullWidth, height })
              }
            }
          } else if (this.isCurrentPreviewPicture && this.fabricCanvas) {
            if (this.canvas) {
              // Picture ratio
              const naturalWidth = this.picturePlayer.naturalWidth
              const naturalHeight = this.picturePlayer.naturalHeight
              const ratio = naturalWidth / naturalHeight

              if (!this.$refs['video-container']) return Promise.resolve()

              // Container size
              let fullWidth = this.$refs['video-container'].offsetWidth
              const fullHeight = this.$refs['video-container'].offsetHeight
              if (this.isComparing && !this.isComparisonOverlay) {
                fullWidth = Math.round(fullWidth / 2)
              }

              // Init canvas values
              let width = ratio ? fullHeight * ratio : fullWidth
              let height = ratio ? Math.round(fullWidth / ratio) : fullHeight
              let top = 0
              let left = 0
              this.canvas.style.top = '0px'
              this.canvas.style.left = '0px'

              // Set Canvas width and left position
              if (fullWidth > naturalWidth) {
                // Case where picture is less wide than the container
                // We adapt left position, because there will be margins
                left = Math.round((fullWidth - naturalWidth) / 2)
                this.canvas.style.left = left + 'px'
                width = naturalWidth
              } else if (fullWidth > width) {
                // Case where canvas is less wide than the container
                // We adapt left position
                const left = Math.round((fullWidth - width) / 2)
                this.canvas.style.left = left + 'px'
              } else {
                // Case where canvas is wider than the container
                // We set the width to the container size
                width = fullWidth
              }

              // Set Canvas height and top position
              if (fullHeight > naturalHeight) {
                // Case where picture is less high than the container
                // We adapt top position, because there will be margins
                top = Math.round((fullHeight - naturalHeight) / 2)
                this.canvas.style.top = top + 'px'
                height = naturalHeight
              } else if (fullHeight > height) {
                // Case where canvas is less high than the container
                // We adapt top position
                top = Math.round((fullHeight - height) / 2)
                this.canvas.style.top = top + 'px'
              } else {
                // Height is bigger than the container. So we put it
                // inside the container and adapt width parameters accordingly.
                height = fullHeight
                width = Math.round(height * ratio)
                const left = Math.round((fullWidth - width) / 2)
                this.canvas.style.left = left + 'px'
              }
              this.fabricCanvas.setDimensions({ width, height })
            }
          }
          return Promise.resolve()
        })
    },

    onAnnotateClicked () {
      this.showCanvas()
      if (this.isDrawing) {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
      } else {
        this.isTyping = false
        if (this.fabricCanvas) {
          this.fabricCanvas.isDrawingMode = true
        }
        this.isDrawing = true
      }
    },

    onTypeClicked () {
      const clickarea = this.canvas.getElementsByClassName('upper-canvas')[0]
      this.showCanvas()
      if (this.isTyping) {
        this.isTyping = false
        clickarea.removeEventListener('dblclick', this.addText)
      } else {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
        this.isTyping = true
        clickarea.addEventListener('dblclick', this.addText)
      }
    },

    showCanvas () {
      if (this.canvas) this.canvas.style.display = 'block'
    },

    hideCanvas () {
      if (this.canvas) this.canvas.style.display = 'none'
    },

    loadAnnotation (annotation) {
      if (!annotation) return
      this.pause()
      const currentTime = annotation ? annotation.time || 0 : 0
      if (this.rawPlayer || this.picturePlayer) {
        if (this.rawPlayer) {
          const frameNumber = currentTime / this.frameDuration
          this.rawPlayer.setCurrentFrame(frameNumber)
          this.syncComparisonPlayer()
          this.currentTimeRaw = currentTime
          this.updateProgressBar()
        }
        this.clearCanvas()
        this.loadSingleAnnotation(annotation)
      }
    },

    saveAnnotations () {
      let currentTime = roundToFrame(this.currentTimeRaw, this.fps) || 0
      if (currentTime < 0) currentTime = 0
      if (this.isCurrentPreviewPicture) currentTime = 0
      if (!this.annotations) return

      // Get annotations currently stored
      const annotation = this.getAnnotation(currentTime)
      // Get annotation set on the canvas
      const annotations = this.getNewAnnotations(currentTime, annotation)
      // Retrieved current entity.
      const entity = this.entityList[this.playingEntityIndex]
      if (!entity) return

      // Build a preview object to handle update
      let preview = {
        id: entity.preview_file_id,
        task_id: entity.preview_file_task_id,
        annotations: entity.preview_file_annotations || []
      }
      // If we are working on a subpreview build the preview object from it.
      if (this.currentPreviewIndex > 0) {
        const index = this.currentPreviewIndex - 1
        const previewFile = this.currentEntity.preview_file_previews[index]
        preview = {
          id: previewFile.id,
          task_id: entity.preview_file_task_id,
          annotations: previewFile.annotations || []
        }
      }
      if (!this.isCurrentUserArtist) { // Artists are not allowed to draw
        // Emit an event for remote and store update
        if (!this.notSaved) {
          this.startAnnotationSaving(preview, annotations)
        } else {
          this.$options.changesToSave = { preview, annotations }
        }

        // Update information locally
        entity.preview_file_annotations = annotations
        Object.keys(entity.preview_files).forEach(taskTypeId => {
          let revPreview = null
          entity.preview_files[taskTypeId].forEach(p => {
            if (p.id === preview.id) revPreview = p
            if (!revPreview && p.previews) {
              p.previews.forEach(subPreview => {
                if (subPreview.id === preview.id) revPreview = p
              })
            }
          })
          if (revPreview) revPreview.annotations = annotations
        })
      }
    },

    onDeleteClicked () {
      this.deleteSelection()
    },

    getAnnotation (time) {
      if (!this.annotations) {
        this.annotations = this.currentEntity.preview_file_annotations
      }
      time = roundToFrame(time, this.fps)

      if (this.annotations && this.annotations.find) {
        let annotation = this.annotations.find(
          (annotation) => annotation.time === time
        )
        if (!annotation) {
          annotation = this.annotations.find(
            (annotation) => annotation.time > time - 0.02 && annotation.time <
            time + 0.02
          )
        }
        if (!annotation &&
          this.isCurrentPreviewPicture &&
          this.annotations.length > 0
        ) {
          annotation = this.annotations[0]
          annotation.time = 0
        }
        return annotation
      } else {
        this.annotations = []
        return null
      }
    },

    onMetadataLoaded (event) {
      this.$nextTick(() => {
        this.resetCanvasSize()
      })
    },

    clearPlayer () {
      if (this.rawPlayer) this.rawPlayer.clear()
      if (this.isComparing) {
        this.$refs['raw-player-comparison'].clear()
      }
      this.maxDurationRaw = 0
      this.maxDuration = '00:00.000'
    },

    resetPictureCanvas () {
      this.annotations = this.currentPreview.annotations || []
      return this.resetCanvas()
        .then(() => {
          this.showCanvas()
          if (this.isCurrentPreviewPicture) {
            if (!this.isPlaying) this.loadAnnotation(this.getAnnotation(0))
          }
        })
    },

    // Scrubbing

    onCanvasMouseMoved (event) {
      if (this.isCurrentPreviewMovie && this.$options.scrubbing) {
        const x = event.e.clientX
        if (x - this.$options.scrubStartX < 0) {
          this.goPreviousFrame()
        } else {
          this.goNextFrame()
        }
        this.$options.scrubStartX = x
      }
    },

    onCanvasClicked (event) {
      if (event.button > 1 && this.isCurrentPreviewMovie) {
        this.$options.scrubbing = true
        this.$options.scrubStartX = event.e.clientX
        this.$options.scrubStartTime = Number(this.currentTimeRaw)
      }
      return false
    },

    onCanvasReleased (event) {
      if (this.isCurrentPreviewMovie && this.$options.scrubbing) {
        this.$options.scrubbing = false
      }
      return false
    },

    onTimeCodeClicked (
      { versionRevision, minutes, seconds, milliseconds, frame }
    ) {
      const previews = this.currentEntity.preview_files[this.task.task_type_id]
      const previewFile = previews.find(
        p => p.revision === parseInt(versionRevision)
      )
      this.onPreviewChanged(this.currentEntity, previewFile)
      const time = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000
      setTimeout(() => {
        const frameNumber = time / this.frameDuration
        this.rawPlayer.setCurrentFrame(frameNumber)
        this.onFrameUpdate(frameNumber)
        this.syncComparisonPlayer()
      }, 20)
    }
  },

  watch: {
    isCommentsHidden () {
      if (!this.isCommentsHidden) this.$refs['task-info'].loadTaskData()
      if (this.isCurrentPreviewSound) {
        this.soundPlayer.redraw()
      }
    }
  },

  /* N.B.: socket.events are not part of Vue's mixin boilerplate and
   * must be included explicitly in each component using preview rooms!
   */
  socket: {
    events: {
      'preview-file:annotation-update' (eventData) {
        if (
          !this.tempMode &&
          this.previewFileMap.get(eventData.preview_file_id)
        ) {
          this.refreshPreview({
            previewId: eventData.preview_file_id,
            taskId: this.currentPreview.task_id
          }).then(preview => {
            if (
              !this.notSaved &&
              this.currentPreview.id === eventData.preview_file_id &&
              !this.isWriting(eventData.updated_at)
            ) {
              const isAnnotationSizeChanged =
                this.annotations.length !== preview.annotations.length
              this.annotations = preview.annotations
              const isLiveRoom =
                !this.room.people || this.room.people.length === 0
              if (isAnnotationSizeChanged) this.reloadAnnotations(isLiveRoom)
            }
            this.$emit('annotations-refreshed', preview)
          })
        }
      }
    }
  }
}
