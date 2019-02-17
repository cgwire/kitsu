<template>
<div ref="container" class="video-player">
  <div ref="video-wrapper" class="video-wrapper">
    <div class="loading-background" v-if="isLoading" >
      <spinner class="spinner" />
    </div>
    <video
      id="annotation-movie"
      ref="movie"
      class="annotation-movie"
      preload="auto"
      :src="moviePath"
      :poster="posterPath"
    >
    </video>
    <video
      id="comparison-movie"
      ref="comparison-movie"
      class="annotation-movie"
      preload="auto"
      :src="comparisonMoviePath"
      :poster="comparisonPosterPath"
      v-if="isComparing && previewToCompareId"
    >
    </video>
    <canvas
      id="annotation-canvas"
      ref="annotation-canvas"
      style="display: none;"
      class="canvas"
    >
    </canvas>
  </div>

  <div class="button-bar" ref="button-bar">
    <div class="video-progress pull-bottom">
      <progress
        ref="progress"
        value="0"
        min="0"
        @click="onProgressClicked"
      >
        <span
          id="progress-bar"
          ref="progress-bar"
        ></span>
      </progress>
    </div>
    <div
      class="video-annotation pull-bottom"
      ref="annotation-bar"
    >
      <span
        class="annotation-mark"
        :key="`annotation-${annotation.time}`"
        :style="getAnnotationStyles(annotation, index)"
        @click="loadAnnotation(annotation.time)"
        v-for="(annotation, index) in annotations"
      >
      </span>
    </div>

    <div class="buttons flexrow pull-bottom">
      <div class="left flexrow">
        <button
          class="button flexrow-item"
          @click="onPlayPauseClicked"
        >
          <pause-icon class="icon" v-if="isPlaying" />
          <play-icon class="icon" v-else />
        </button>

        <button
          :class="{
            button: true,
            'flexrow-item': true,
            active: isRepeating
          }"
          @click="onRepeatClicked"
          v-if="!light"
        >
          <repeat-icon class="icon smaller" />
        </button>

        <span class="flexrow-item time-indicator">
          {{ currentTime }}
        </span>
        <span class="flexrow-item time-indicator" v-if="!light">
          / {{ maxDuration }}
        </span>

        <button
          :class="{
            button: true,
            'flexrow-item': true,
            active: isComparing
          }"
          @click="onCompareClicked"
          v-if="taskTypeOptions.length > 0"
        >
          <copy-icon class="icon smaller" />
        </button>

        <combobox
          class="comparison-combobox"
          :options="taskTypeOptions"
          :is-dark="true"
          v-model="taskTypeId"
          v-if="isComparing"
        />
        <combobox
          class="comparison-combobox"
          :options="previewFileOptions"
          :is-dark="true"
          v-model="previewToCompareId"
          v-if="isComparing"
        />
      </div>

      <div class="right flexrow">
        <button
          class="button flexrow-item"
          @click="onDeleteClicked"
          v-if="isFullScreenEnabled"
        >
          <x-icon class="icon" />
        </button>

        <button
          :class="{
            button: true,
            'flexrow-item': true,
            active: isDrawing
          }"
          @click="onPencilAnnotateClicked"
          v-if="isFullScreenEnabled"
        >
          <edit-2-icon class="icon" />
        </button>

        <button
          class="button flexrow-item"
          @click="onFullscreenClicked"
          v-if="isFullScreenEnabled"
        >
          <maximize-icon class="icon" />
        </button>

        <a
          class="button flexrow-item"
          :href="movieDlPath"
        >
          <download-icon class="icon" />
        </a>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { fabric } from 'fabric'
import {
  CircleIcon,
  CopyIcon,
  DownloadIcon,
  Edit2Icon,
  MaximizeIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  SquareIcon,
  XIcon
} from 'vue-feather-icons'
import Combobox from '../widgets/Combobox'
import Spinner from '../widgets/Spinner'

export default {
  name: 'video-player',

  components: {
    CircleIcon,
    CopyIcon,
    Combobox,
    DownloadIcon,
    Edit2Icon,
    MaximizeIcon,
    PauseIcon,
    PlayIcon,
    RepeatIcon,
    Spinner,
    SquareIcon,
    XIcon
  },

  props: {
    preview: {
      type: Object,
      default: () => {}
    },
    entityPreviewFiles: {
      type: Object,
      default: () => {}
    },
    taskTypeMap: {
      type: Object,
      default: () => {}
    },
    light: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      annotations: [],
      currentTime: '00:00.00',
      fabricCanvas: null,
      isComparing: false,
      isDrawing: false,
      isLoading: false,
      isPlaying: false,
      isRepeating: false,
      maxDuration: '00:00.00',
      previewToCompareId: null,
      taskTypeId:
        this.entityPreviewFIles ? Object.keys(this.entityPreviewFiles)[0] : null,
      videoDuration: 0
    }
  },

  mounted () {
    this.reloadAnnotations()
    this.container.style.height = this.getDefaultHeight() + 'px'
    this.isLoading = true
    setTimeout(() => {
      if (this.video) {
        this.video.addEventListener('loadedmetadata', () => {
          this.configureVideo()
          this.isLoading = false
          this.setDefaultComparisonTaskType()
        })

        window.addEventListener('keydown', this.onKeyDown, false)
        window.addEventListener('resize', this.onWindowResize)
      }
    }, 0)
  },

  beforeDestroy () {
    this.clearCanvas()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onWindowResize)
  },

  computed: {
    canvas () {
      return this.$refs['annotation-canvas']
    },

    container () {
      return this.$refs.container
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

    isVideo () {
      return this.$refs.movie && this.videoDuration && this.videoDuration > 0
    },

    moviePath () {
      return `/api/movies/originals/preview-files/${this.preview.id}.mp4`
    },

    movieDlPath () {
      return `/api/movies/originals/preview-files/${this.preview.id}/download`
    },

    posterPath () {
      return `/api/pictures/previews/preview-files/${this.preview.id}.png`
    },

    comparisonMoviePath () {
      return `/api/movies/originals/preview-files/${this.previewToCompareId}.mp4`
    },

    comparisonPosterPath () {
      return `/api/pictures/originals/preview-files/${this.previewToCompareId}.png`
    },

    progress () {
      return this.$refs.progress
    },

    progressBar () {
      return this.$refs['progress-bar']
    },

    video () {
      return this.$refs.movie
    },

    comparisonVideo () {
      return this.$refs['comparison-movie']
    },

    videoWrapper () {
      return this.$refs['video-wrapper']
    },

    taskTypeOptions () {
      const taskTypeIds = Object.keys(this.entityPreviewFiles)
      return taskTypeIds
        .filter((taskTypeId) => {
          if (this.entityPreviewFiles[taskTypeId].length > 1) {
            return true
          } else if (this.entityPreviewFiles[taskTypeId].length === 1) {
            return (
              this.entityPreviewFiles[taskTypeId][0].id !== this.preview.id
            )
          } else {
            return false
          }
        })
        .map((taskTypeId) => {
          const taskType = this.taskTypeMap[taskTypeId]
          return {
            label: taskType.name,
            value: taskType.id
          }
        })
    },

    previewFileOptions () {
      let previewFiles = this.entityPreviewFiles[this.taskTypeId]
      if (previewFiles) {
        previewFiles = previewFiles.filter(p => p.id !== this.preview.id)
        if (previewFiles && previewFiles.length > 0) {
          return previewFiles.map((previewFile) => {
            return {
              label: `v${previewFile.revision}`,
              value: previewFile.id
            }
          })
        } else {
          return []
        }
      } else {
        return []
      }
    }
  },

  methods: {
    isFullScreen () {
      return !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement
      )
    },

    getDefaultHeight () {
      if (this.isFullScreen()) {
        return screen.height
      } else {
        return screen.width > 1300 && !this.light ? 500 : 200
      }
    },

    getDimensions () {
      const ratio = this.video.videoHeight / this.video.videoWidth
      let width = this.container.offsetWidth - 1
      let height = Math.floor(width * ratio)
      height = Math.min(height, this.getDefaultHeight()) - 55
      width = Math.floor(height / ratio)
      return { width, height }
    },

    getTimelinePosition (time, index) {
      if (this.$refs.movie) {
        let position = Math.round(
          (time / this.$refs.movie.duration) * this.progress.offsetWidth
        )
        position = position - index * 10 - 5
        if (position < 0) position = 0
        if (position + 10 > this.progress.offsetWidth) {
          position = position - 5
        }
        return position
      } else {
        return 0
      }
    },

    setCurrentTime (currentTime) {
      this.progress.value = currentTime
      this.progressBar.style.width = Math.floor(
        (currentTime / this.video.duration) * 100
      ) + '%'
      this.clearAnnotations()
      this.video.currentTime = currentTime
      if (this.isComparing) {
        const comparisonVideo = document.getElementById('comparison-movie')
        if (comparisonVideo) comparisonVideo.currentTime = currentTime
      }
      this.showVideo()
    },

    configureVideo () {
      this.reloadAnnotations()
      this.video.addEventListener('timeupdate', this.updateProgressBar)
      this.video.onended = this.onVideoEnd
      this.showVideo()
      if (this.video.currentTime === 0) {
        this.clearCanvas()
        this.$nextTick(() => {
          this.mountVideo()
          this.isLoading = false
        })
      }
    },

    showCanvas (callback) {
      if (this.isVideoShown) {
        this.isComparing = false
        this.canvas.style.display = 'block'
        this.video.style.display = 'none'
        this.mountVideo()
        this.isVideoShown = false
        this.loadAnnotation(this.video.currentTime)
        if (callback) callback()
      } else if (callback) {
        callback()
      }
    },

    showVideo () {
      if (!this.isVideoShown) {
        this.canvas.style.display = 'none'
        this.video.style.display = 'block'
        let elements = document.getElementsByClassName('canvas-container')
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i]
          element.style.display = 'none'
        }
      }
      this.isVideoShown = true
    },

    mountVideo () {
      this.clearCanvas()

      this.video.mute = true
      this.videoDuration = this.video.duration
      this.progress.setAttribute('max', this.videoDuration)
      this.maxDuration = this.formatTime(this.videoDuration)
      this.isLoading = false
      this.isPlaying = false
      this.isRepeating = false

      if (this.container) {
        const dimensions = this.getDimensions()
        const width = dimensions.width
        const height = dimensions.height

        if (height > 0) {
          if (!this.isComparing) {
            this.container.style.height = this.getDefaultHeight() + 'px'
            this.video.style.width = width + 'px'
            this.video.style.height = height + 'px'
            this.videoWrapper.style.width = width + 'px'
            this.videoWrapper.style.height = height + 'px'

            this.fabricCanvas = this.setupFabricVideo(width, height)
            this.fabricCanvas.on('object:moved', this.saveAnnotations)
            this.fabricCanvas.on('object:scaled', this.saveAnnotations)
            this.fabricCanvas.on('mouse:up', () => {
              if (this.isDrawing) this.saveAnnotations()
            })
            this.fixCanvasSize()
          } else {
            this.container.style.height = this.getDefaultHeight() + 'px'
            this.video.style.width = (width / 2) + 'px'
            this.video.style.height = (height / 2) + 'px'
            const comparisonVideo = document.getElementById('comparison-movie')
            if (comparisonVideo) {
              comparisonVideo.style.width = (width / 2) + 'px'
              comparisonVideo.style.height = (height / 2) + 'px'
            }
            this.videoWrapper.style.width = width + 'px'
            this.videoWrapper.style.height = height + 'px'
          }
        }
      }
    },

    clearCanvas () {
      if (this.fabricCanvas) {
        this.fabricCanvas.getObjects().forEach((obj) => {
          this.fabricCanvas.remove(obj)
        })
      }
      try {
        if (this.fabricCanvas) this.fabricCanvas.clear()
      } catch (err) { }
      try {
        if (this.fabricCanvas) this.fabricCanvas.dispose()
      } catch (err) { }
    },

    setupFabricVideo (width, height, update = false) {
      let fabricCanvas = this.fabricCanvas
      if (!update) {
        fabricCanvas = new fabric.Canvas('annotation-canvas')
        fabricCanvas.setDimensions({
          width: width,
          height: height
        })
      }
      const fabricVideo = new fabric.Image(this.video, {
        left: 0,
        top: 0,
        width: this.video.videoWidth,
        height: this.video.videoHeight,
        objectCaching: false,
        selectable: false
      })
      fabricVideo.scaleToWidth(width)
      fabricVideo.scaleToHeight(height)
      fabricCanvas.add(fabricVideo)
      fabricVideo.sendToBack()
      this.fabricVideo = fabricVideo

      fabricCanvas.freeDrawingBrush.color = '#ff3860'
      fabricCanvas.freeDrawingBrush.width = 4

      fabricCanvas.off('object:scaling', this.onScaled)
      fabricCanvas.on('object:scaling', this.onScaled)
      fabricCanvas.off('object:scaled', this.onScaled)
      fabricCanvas.on('object:scaled', this.onScaled)

      fabric.util.requestAnimFrame(function render () {
        try {
          fabricCanvas.renderAll()
        } catch (err) { }
        fabric.util.requestAnimFrame(render)
      })

      return fabricCanvas
    },

    play () {
      this.clearAnnotations()
      this.isPlaying = true
      this.showVideo()
      this.fabricCanvas.isDrawingMode = false
      this.isDrawing = false
      this.video.play()
      if (this.isComparing) {
        const comparisonVideo = document.getElementById('comparison-movie')
        if (comparisonVideo) comparisonVideo.play()
      }
    },

    pause () {
      this.isPlaying = false
      this.video.pause()
      if (this.isComparing) {
        const comparisonVideo = document.getElementById('comparison-movie')
        if (comparisonVideo) comparisonVideo.pause()
      }
    },

    goPreviousFrame () {
      let newTime = this.video.currentTime - 1 / 25
      if (newTime < 0) {
        this.setCurrentTime(0)
      } else {
        this.setCurrentTime(newTime)
      }
    },

    goNextFrame () {
      let newTime = this.video.currentTime + 1 / 25
      if (newTime > this.video.duration) {
        this.setCurrentTime(this.video.duration)
      } else {
        this.setCurrentTime(newTime)
      }
    },

    formatTime (seconds) {
      let milliseconds = `.${Math.round((seconds % 1) * 100)}`
      if (milliseconds.length === 2) milliseconds += '0'
      try {
        return new Date(1000 * seconds)
          .toISOString()
          .substr(14, 5) + milliseconds
      } catch (err) {
        console.log(err)
        return '00:00.00'
      }
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
    },

    onDeleteClicked () {
      this.deleteSelection()
    },

    onVideoEnd () {
      this.isPlaying = false
      if (this.isRepeating) {
        this.video.currentTime = 0
        if (this.isComparing) {
          const comparisonVideo = document.getElementById('comparison-movie')
          if (comparisonVideo) comparisonVideo.currentTime = 0
        }
        this.progress.value = 0
        this.play()
      }
    },

    onPlayPauseClicked () {
      if (this.video.paused || this.video.ended) {
        this.play()
      } else {
        this.pause()
      }
    },

    onRepeatClicked () {
      if (this.isRepeating) {
        this.isRepeating = false
      } else {
        this.isRepeating = true
      }
    },

    onCompareClicked () {
      if (this.isComparing) {
        this.isComparing = false
        this.mountVideo()
      } else {
        this.isComparing = true
        if (this.fabricCanvas) this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
        this.$nextTick(() => {
          if (!this.isVideoShown) this.showVideo()
          this.mountVideo()
        })
      }
    },

    onProgressClicked (e) {
      var pos =
        (e.pageX - this.progress.offsetLeft) / this.progress.offsetWidth
      const currentTime = pos * this.video.duration
      this.setCurrentTime(currentTime)
    },

    updateProgressBar () {
      if (!this.progress.getAttribute('max')) {
        this.progress.setAttribute('max', this.video.duration)
      }
      this.progress.value = this.video.currentTime * 1
      const width = Math.floor(
        (this.video.currentTime / this.video.duration) * 100
      )
      this.progressBar.style.width = width + '%'
      this.currentTime = this.formatTime(this.video.currentTime)
    },

    onFullscreenClicked () {
      if (this.isFullScreen()) {
        this.exitFullScreen()
      } else {
        this.setFullScreen()
      }
    },

    onScaled (event) {
      const obj = event.target
      if (obj) obj.set({ strokeWidth: 8 / (obj.scaleX + obj.scaleY) })
    },

    onRectAnnotateClicked () {
      this.showCanvas(() => {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
        const rect = new fabric.Rect({
          left: this.fabricCanvas.width / 2 - 25,
          top: this.fabricCanvas.height / 2 - 25,
          fill: 'transparent',
          strokeWidth: 4,
          stroke: '#ff3860',
          width: 50,
          height: 50
        })
        this.fabricCanvas.add(rect)
        this.fabricCanvas.setActiveObject(rect)
        this.saveAnnotations()
      })
    },

    onCircleAnnotateClicked () {
      this.showCanvas(() => {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
        const circle = new fabric.Circle({
          left: this.fabricCanvas.width / 2 - 25,
          top: this.fabricCanvas.height / 2 - 25,
          radius: 20,
          fill: 'transparent',
          strokeWidth: 4,
          stroke: '#ff3860',
          width: 50,
          height: 50
        })
        this.fabricCanvas.add(circle)
        this.fabricCanvas.setActiveObject(circle)
        this.saveAnnotations()
      })
    },

    onPencilAnnotateClicked () {
      this.showCanvas(() => {
        if (this.fabricCanvas.isDrawingMode) {
          this.fabricCanvas.isDrawingMode = false
          this.isDrawing = false
        } else {
          this.fabricCanvas.isDrawingMode = true
          this.isDrawing = true
        }
      })
    },

    onWindowResize (callback) {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 600) {
        this.lastCall = now
        this.$nextTick(() => {
          this.mountVideo()
          this.reloadAnnotations()
          this.loadAnnotation(this.video.currentTime)
          if (this.isVideoShown) {
            this.canvas.style.display = 'none'
            let elements = document.getElementsByClassName('canvas-container')
            for (let i = 0; i < elements.length; i++) {
              const element = elements[i]
              element.style.display = 'none'
            }
          }
          if (callback && typeof callback === 'function') callback()
        })
      }
    },

    onKeyDown (event) {
      if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        if (event.keyCode === 46 && this.fabricCanvas) {
          this.deleteSelection()
        } else if (event.keyCode === 37) {
          this.goPreviousFrame()
        } else if (event.keyCode === 39) {
          this.goNextFrame()
        } else if (event.keyCode === 32) {
          this.onPlayPauseClicked()
        }
      }
    },

    getAnnotation (time) {
      return this.annotations.find(
        (annotation) => annotation.time === time
      )
    },

    clearAnnotations () {
      if (this.fabricCanvas && this.fabricCanvas.getObjects().length > 0) {
        this.fabricCanvas.getObjects().forEach((obj) => {
          if (['rect', 'circle', 'path'].includes(obj.type)) {
            this.fabricCanvas.remove(obj)
          }
        })
      }
    },

    saveAnnotations () {
      const currentTime = this.video.currentTime
      const annotation = this.getAnnotation(currentTime)

      this.fabricCanvas.getObjects().forEach((obj) => {
        if (obj.type === 'path') {
          if (!obj.canvasWidth) obj.canvasWidth = this.fabricCanvas.width
          obj.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            bl: false,
            br: false,
            tl: false,
            tr: false,
            mtr: false
          })
        }
      })

      if (annotation) {
        annotation.drawing = this.fabricCanvas.toJSON(['canvasWidth'])
        annotation.width = this.fabricCanvas.width
        if (annotation.drawing && annotation.drawing.objects.length === 1) {
          const index = this.annotations.findIndex(
            (annotation) => annotation.time === currentTime
          )
          this.annotations.splice(index, 1)
        }
      } else {
        this.annotations.push({
          time: currentTime,
          width: this.fabricCanvas.width,
          drawing: this.fabricCanvas.toJSON(['canvasWidth'])
        })
        this.annotations = this.annotations.sort((a, b) => {
          return a.time < b.time
        }) || []
      }
      const annotations = []
      this.annotations.forEach(a => annotations.push({...a}))
      this.$emit('annotationchanged', {
        preview: this.preview,
        annotations: annotations
      })
    },

    loadAnnotation (time) {
      const annotation = this.getAnnotation(time)
      if (!annotation) return

      this.video.pause()
      this.video.currentTime = time
      this.fabricCanvas.isDrawingMode = false
      this.isDrawing = false

      this.clearAnnotations()

      let scaleMultiplier = 1
      if (annotation.width) {
        scaleMultiplier = this.fabricCanvas.width / annotation.width
      }

      annotation.drawing.objects.forEach((obj) => {
        const base = {
          left: obj.left * scaleMultiplier,
          top: obj.top * scaleMultiplier,
          fill: 'transparent',
          stroke: '#ff3860',
          strokeWidth: 4,
          radius: obj.radius,
          width: obj.width,
          height: obj.height,
          scaleX: obj.scaleX * scaleMultiplier,
          scaleY: obj.scaleY * scaleMultiplier
        }
        if (obj.type === 'rect') {
          const rect = new fabric.Rect({
            ...base
          })
          this.fabricCanvas.add(rect)
          rect.set({strokeWidth: 4})
        } else if (obj.type === 'circle') {
          const circle = new fabric.Circle({
            ...base
          })
          this.fabricCanvas.add(circle)
          circle.set({strokeWidth: 2})
        } else if (obj.type === 'path') {
          let strokeMultiplier = 1
          if (obj.canvasWidth) {
            strokeMultiplier = obj.canvasWidth / this.fabricCanvas.width
          }
          const path = new fabric.Path(
            obj.path,
            {
              ...base,
              strokeWidth: 3 * strokeMultiplier,
              canvasWidth: obj.canvasWidth
            }
          )
          path.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            bl: false,
            br: false,
            tl: false,
            tr: false,
            mtr: false
          })
          this.fabricCanvas.add(path)
        }
      })

      if (this.isVideoShown) this.showCanvas()
    },

    reloadAnnotations () {
      this.annotations = []
      if (this.preview.annotations) {
        const annotations = []
        this.preview.annotations.forEach(a => annotations.push({...a}))
        this.annotations = annotations.sort((a, b) => {
          return a.time < b.time
        }) || []
      } else {
        this.annotations = []
      }
      return this.annotations
    },

    getAnnotationStyles (annotation, index) {
      return {
        cursor: 'pointer',
        position: 'relative',
        display: 'inline-block',
        'left': this.getTimelinePosition(annotation.time, index) + 'px'
      }
    },

    deleteSelection () {
      this.fabricCanvas.remove(this.fabricCanvas.getActiveObject())
      this.saveAnnotations()
    },

    fixCanvasSize () {
      if (this.fabricVideo) {
        const dimensions = this.getDimensions()
        const width = dimensions.width
        const height = dimensions.height
        if (height > 0) {
          let elements = document.getElementsByClassName('canvas-container')
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i]
            element.style.width = width + 'px'
            element.style.height = height + 'px'
          }
          elements = document.getElementsByClassName('upper-canvas')
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i]
            element.style.width = width + 'px'
            element.style.height = height + 'px'
            element.setAttribute('width', width)
            element.setAttribute('height', height)
          }

          setTimeout(() => {
            this.fabricCanvas.calcOffset()
            this.fabricVideo.scaleToWidth(width)
            this.fabricVideo.scaleToHeight(height)
          }, 10)
        }
      }
    },

    setDefaultComparisonTaskType () {
      const taskTypeIds = Object.keys(this.entityPreviewFiles)
      if (taskTypeIds && taskTypeIds.length > 0) {
        const taskTypeOption = this.taskTypeOptions.find((option) => {
          return this.entityPreviewFiles[option.value].findIndex(
            p => p.id === this.preview.id
          ) >= 0
        })
        if (taskTypeOption) {
          this.taskTypeId = taskTypeOption.value
        } else if (this.taskTypeOptions.length > 0) {
          this.taskTypeId = this.taskTypeOptions[0].value
        }

        if (this.taskTypeId) this.setDefaultComparisonPreview()
      } else {
        this.previewToCompareId = null
      }
    },

    setDefaultComparisonPreview () {
      let previewFiles = this.entityPreviewFiles[this.taskTypeId]
      if (previewFiles) {
        previewFiles = previewFiles.filter(p => p.id !== this.preview.id)
        if (previewFiles.length > 0) {
          this.previewToCompareId = previewFiles[0].id
        } else {
          this.previewToCompareId = null
        }
      } else {
        this.previewToCompareId = null
      }
    }
  },

  watch: {
    preview () {
      this.maxDuration = '00:00.00'
      this.isLoading = true
      this.reloadAnnotations()
      if (this.isComparing) {
        this.isComparing = false
        this.mountVideo()
      }
      this.setDefaultComparisonTaskType()
    },

    previewToCompareId () {
      if (this.isComparing) {
        this.pause()
        const currentTime = this.video.currentTime
        this.$nextTick(() => {
          const comparisonVideo = document.getElementById('comparison-movie')
          if (comparisonVideo) comparisonVideo.currentTime = currentTime
        })
      }
    },

    taskTypeId () {
      this.setDefaultComparisonPreview()
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-background {
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  background: black;
  align-items: center;
  justify-content: center;
}

.icon {
  margin-top: -4px;
  height: 20px;
}

.smaller {
  height: 16px;
}

.right {
  margin-left: auto;
}

.video-player {
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  height: 100%;
}

.video-wrapper {
  flex: 1;
  display: flex;
  background: black;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: auto;
  width: 100%;
}

.annotation-movie {
  margin: auto;
}

.pull-bottom {
}

.time-indicator {
  color: #CCC;
  padding-left: 0.8em;
}

#annotation-canvas {
  display: block;
  width: 0;
}

#annotation-movie {
  width: 100%;
}

.video-player {
  width: 100%;
  text-align: center;
  background: #36393F;
}

.progress {
  padding: 0;
  margin: 0;
  height: 8px;
}

.video-progress {
  cursor: pointer;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: #999;
  height: 8px;
}

progress::-moz-progress-bar {
  background-color: #43B581;
}

progress::-webkit-progress-value {
  background-color: #43B581;
}

progress {
  width: 100%;
  border-radius: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: #999;
  height: 8px;
  display: block;
}

.progress progress#progress span#progress-bar {
  border-radius: 0;
  margin: 0;
  padding: 0;
  background-color: #43B581;
}

.video-annotation {
  background: #26292F;
  height: 12px;
  text-align: left;
  margin-top: 0px;
  padding: 0;
}

.annotation-mark {
  display: flex;
  background: #ff3860;
  width: 8px;
  height: 8px;
  display: inline-block;
  top: -6px;
}

.buttons {
  height: 32px;
}

.buttons .button {
  background: #26292F;
  border-radius: 0;
  color: #BBB;
  border: 0;
  margin: 0;
}

.buttons .button.active,
.buttons .button:hover {
  color: #43B581;
}

.comparison-combobox {
  margin-bottom: 0;
}
</style>
