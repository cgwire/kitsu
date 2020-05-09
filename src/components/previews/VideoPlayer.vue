<template>
<div ref="container" class="video-player">
  <div ref="video-wrapper" class="video-wrapper">
    <div class="loading-background" v-if="isLoading" >
      <spinner class="spinner" />
    </div>
    <div class="canvas-wrapper" ref="canvas-wrapper">
      <canvas
        id="annotation-canvas"
        ref="annotation-canvas"
        class="canvas"
        v-if="!readOnly"
      >
      </canvas>
    </div>
    <video
      id="annotation-movie"
      ref="movie"
      class="annotation-movie"
      preload="auto"
      :style="{
        display: isLoading ? 'none' : 'block'
      }"
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

    <annotation-bar
      :annotations="annotations"
      :maxDurationRaw="videoDuration"
      @select-annotation="loadAnnotation"
      ref="annotation-bar"
      v-if="!readOnly"
    />

    <div class="buttons flexrow pull-bottom">
      <div class="left flexrow">
        <button
          class="button flexrow-item"
          @click="onPlayPauseClicked"
        >
          <pause-icon class="icon" v-if="isPlaying" />
          <play-icon class="icon" v-if="!isPlaying" />
        </button>

        <button
          :class="{
            button: true,
            'flexrow-item': true,
            active: isRepeating
          }"
          @click="onRepeatClicked"
          v-if="isFullScreen()"
        >
          <repeat-icon class="icon smaller" />
        </button>

        <span class="flexrow-item time-indicator">
          {{ currentTime }}
        </span>
        <span class="flexrow-item time-indicator" v-if="!light || readOnly|| isFullScreen()">
        /
        </span>
        <span class="flexrow-item time-indicator" v-if="!light || readOnly || isFullScreen()">
         {{ maxDuration }}
        </span>

        <span class="flexrow-item time-indicator mr1">
          ({{ currentFrame }})
        </span>

        <button
          :class="{
            button: true,
            'flexrow-item': true,
            active: isComparing,
            'comparison-button': true
          }"
          @click="onCompareClicked"
          v-if="!readOnly && taskTypeOptions.length > 0 && (!light || isFullScreen())"
        >
          <copy-icon class="icon smaller" />
        </button>

        <combobox
          class="comparison-combobox"
          :options="taskTypeOptions"
          :is-dark="true"
          v-model="taskTypeId"
          v-if="!readOnly && isComparing && (!light || isFullScreen())"
        />
        <combobox
          class="comparison-combobox"
          :options="previewFileOptions"
          :is-dark="true"
          v-model="previewToCompareId"
          v-if="!readOnly && isComparing && (!light || isFullScreen())"
        />
      </div>

      <div class="right flexrow">
        <div class="flexrow flexrow-item" v-if="isFullScreen()">
          <span
            :class="{
              'previous-preview-file': true,
              'current-preview-file': previewFile.revision === preview.revision
            }"
            :key="`last-preview-${previewFile.id}`"
            @click="changeCurrentPreview(previewFile)"
            v-for="previewFile in lastPreviewFiles"
          >
            {{ previewFile.revision }}
          </span>
        </div>

        <button
          class="button flexrow-item"
          @click="undoLastAction"
          v-if="!readOnly && isFullScreen()"
        >
          <corner-left-down-icon class="icon" />
        </button>

        <button
          class="button flexrow-item"
          @click="redoLastAction"
          v-if="!readOnly && isFullScreen()"
        >
          <corner-right-down-icon class="icon" />
        </button>

        <button
          class="button flexrow-item"
          @click="onDeleteClicked"
          v-if="!readOnly && isFullScreenEnabled"
        >
          <x-icon class="icon" />
        </button>

        <transition name="slide">
          <div
            class="annotation-tools"
            v-show="isTyping"
          >
            <color-picker
              :isOpen="isShowingPalette"
              :color="this.textColor"
              :palette="this.palette"
              @TogglePalette="onPickColor"
              @change="onChangeTextColor"
            />
          </div>
        </transition>
        <button
          :class="{
            button: true,
            'flexrow-item': true,
            active: isTyping
          }"
          :title="$t('playlists.actions.annotation_text')"
          @click="onTypeClicked"
          v-if="!readOnly && isFullScreen()"
        >
          <type-icon class="icon" />
        </button>

        <transition name="slide">
          <div
            class="annotation-tools"
            v-show="isDrawing"
          >
            <pencil-picker
              :isOpen="isShowingPencilPalette"
              :pencil="pencil"
              :sizes="this.pencilPalette"
              @toggle-palette="onPickPencil"
              @change="onChangePencil"
            />

            <color-picker
              :isOpen="isShowingPalette"
              :color="this.color"
              :palette="this.palette"
              @TogglePalette="onPickColor"
              @change="onChangeColor"
            />
          </div>
        </transition>

        <button
          :class="{
            button: true,
            'flexrow-item': true,
            active: isDrawing
          }"
          @click="onPencilAnnotateClicked"
          v-if="!readOnly && isFullScreenEnabled"
        >
          <edit-2-icon class="icon" />
        </button>

        <a
          :href="movieDlPath"
          class="button flexrow-item"
          v-if="!readOnly"
        >
          <download-icon class="icon" />
        </a>

        <button
          class="button flexrow-item"
          @click="onFullscreenClicked"
          v-if="isFullScreenEnabled"
        >
          <maximize-icon class="icon" />
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fabric } from 'fabric'
import {
  CopyIcon,
  CornerLeftDownIcon,
  CornerRightDownIcon,
  DownloadIcon,
  Edit2Icon,
  MaximizeIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  TypeIcon,
  XIcon
} from 'vue-feather-icons'

import { roundToFrame } from '../../lib/video'
import AnnotationBar from '../pages/playlists/AnnotationBar'
import ColorPicker from '../widgets/ColorPicker'
import PencilPicker from '../widgets/PencilPicker'
import Combobox from '../widgets/Combobox'
import Spinner from '../widgets/Spinner'

import { annotationMixin } from './annotation_mixin'

export default {
  name: 'video-player',
  mixins: [annotationMixin],

  components: {
    AnnotationBar,
    ColorPicker,
    CornerLeftDownIcon,
    CornerRightDownIcon,
    PencilPicker,
    CopyIcon,
    Combobox,
    DownloadIcon,
    Edit2Icon,
    MaximizeIcon,
    PauseIcon,
    PlayIcon,
    RepeatIcon,
    Spinner,
    TypeIcon,
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
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    lastPreviewFiles: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      annotations: [],
      palette: ['#ff3860', '#008732', '#5E60BA', '#f57f17'],
      pencilPalette: ['big', 'medium', 'small'],
      color: '#ff3860',
      pencil: 'big',
      currentTime: '00:00.00',
      currentTimeRaw: 0,
      fabricCanvas: null,
      isComparing: false,
      isDrawing: false,
      isTyping: false,
      isLoading: false,
      isPlaying: false,
      isRepeating: false,
      maxDuration: '00:00.00',
      previewToCompareId: null,
      taskTypeId:
        this.entityPreviewFIles ? Object.keys(this.entityPreviewFiles)[0] : null,
      textColor: '#ff3860',
      videoDuration: 0
    }
  },

  mounted () {
    this.reloadAnnotations()
    this.container.style.height = this.getDefaultHeight() + 'px'
    this.isLoading = true
    this.setupFabricCanvas()
    setTimeout(() => {
      if (this.video) {
        this.video.addEventListener('loadedmetadata', () => {
          this.configureVideo()
          this.onWindowResize()
          this.isLoading = false
          this.setDefaultComparisonTaskType()
        })

        this.video.addEventListener('ended', () => {
          this.isLoading = false
        })

        this.video.addEventListener('error', () => {
          this.$refs.movie.style.height = (this.getDefaultHeight() - 90) + 'px'
          this.isLoading = false
        })

        window.addEventListener('keydown', this.onKeyDown, false)
        window.addEventListener('resize', this.onWindowResize)
        this.video.addEventListener('timeupdate', this.onTimeUpdate)
      }
    }, 0)
  },

  beforeDestroy () {
    this.clearCanvas()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onWindowResize)
  },

  computed: {
    ...mapGetters([
      'currentProduction'
    ]),

    currentFrame () {
      return `${Math.ceil(this.currentTimeRaw * this.fps)}`.padStart(3, '0')
    },

    canvasWrapper () {
      return this.$refs['canvas-wrapper']
    },

    canvas () {
      return this.$refs['annotation-canvas']
    },

    container () {
      return this.$refs.container
    },

    fps () {
      return this.currentProduction.fps || 24
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
          if (taskType) {
            return {
              label: taskType.name,
              value: taskType.id
            }
          } else {
            return {
              label: '',
              value: ''
            }
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
        return screen.width > 1300 && (!this.light || this.readOnly) ? 500 : 200
      }
    },

    getDimensions () {
      const ratio = this.video.videoHeight / this.video.videoWidth
      let width = this.container.offsetWidth - 1
      let height = Math.floor(width * ratio)
      height = Math.min(height, this.getDefaultHeight() - 60)
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
      currentTime = roundToFrame(currentTime, this.fps)
      this.progress.value = currentTime
      this.progressBar.style.width = Math.floor(
        (currentTime / this.video.duration) * 100
      ) + '%'
      this.clearCanvas()
      this.video.currentTime = currentTime
      if (this.isComparing) {
        const comparisonVideo = document.getElementById('comparison-movie')
        if (comparisonVideo) comparisonVideo.currentTime = currentTime
      }
    },

    configureVideo () {
      this.reloadAnnotations()
      this.video.addEventListener('timeupdate', this.updateProgressBar)
      this.video.onended = this.onVideoEnd
      if (this.video.currentTime === 0) {
        this.clearCanvas()
        this.mountVideo()
      }
    },

    mountVideo () {
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
        if (!this.readOnly) this.resetCanvas()
      }
    },

    onTimeUpdate (time) {
      if (this.video) {
        this.currentTimeRaw = this.video.currentTime
      } else {
        this.currentTimeRaw = 0
      }
    },

    clearCanvas () {
      if (this.fabricCanvas) {
        this.fabricCanvas.clear()
      }
    },

    play () {
      this.clearCanvas()
      this.isPlaying = true
      if (!this.readOnly) {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
      }
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
      const newTime = this.video.currentTime - 1 / this.fps
      if (newTime < 0) {
        this.setCurrentTime(0)
      } else {
        this.setCurrentTime(newTime)
      }
      const annotation = this.getAnnotation(this.video.currentTime)
      if (annotation) this.loadAnnotation(annotation)
    },

    goNextFrame () {
      const newTime = this.video.currentTime + 1 / this.fps
      if (newTime > this.video.duration) {
        this.setCurrentTime(this.video.duration)
      } else {
        this.setCurrentTime(newTime)
      }
      const annotation = this.getAnnotation(this.video.currentTime)
      if (annotation) this.loadAnnotation(annotation)
    },

    formatTime (seconds) {
      let milliseconds = `.${Math.round((seconds % 1) * 100)}`
      if (milliseconds.length === 2) milliseconds += '0'
      try {
        return new Date(1000 * seconds)
          .toISOString()
          .substr(14, 5) + milliseconds
      } catch (err) {
        console.error(err)
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
          this.mountVideo()
          this.$nextTick(() => {
            const annotation = this.getAnnotation(this.video.currentTime)
            if (annotation) this.loadAnnotation(annotation)
          })
        })
      }
    },

    onProgressClicked (e) {
      let left = this.progress.offsetLeft
      if (left === 0 && !this.isFullScreen()) {
        left = this.progress.parentElement.offsetParent.offsetLeft - 10
      }
      const pos = (e.pageX - left) / this.progress.offsetWidth
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

    onPencilAnnotateClicked () {
      if (this.isDrawing) {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
      } else {
        this.isTyping = false
        this.fabricCanvas.isDrawingMode = true
        this.isDrawing = true
      }
    },

    onTypeClicked () {
      const clickarea =
        this.canvasWrapper.getElementsByClassName('upper-canvas')[0]
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

    onWindowResize (callback) {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 600) {
        this.lastCall = now
        this.$nextTick(() => {
          this.mountVideo()
          this.reloadAnnotations()
          const annotation = this.getAnnotation(this.video.currentTime)
          this.$nextTick(() => {
            if (annotation) this.loadAnnotation(annotation)
          })
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
        } else if (event.keyCode === 68) {
          this.onPencilAnnotateClicked()
        } else if (event.ctrlKey && event.altKey && event.keyCode === 68) {
          this.onAnnotateClicked()
        } else if (event.ctrlKey && event.keyCode === 90) {
          this.undoLastAction()
        } else if (event.altKey && event.keyCode === 82) {
          this.redoLastAction()
        }
      }
    },

    getAnnotation (time) {
      time = roundToFrame(time, this.fps)
      return this.annotations.find(
        (annotation) => annotation.time === time
      )
    },

    saveAnnotations () {
      const currentTime = roundToFrame(this.video.currentTime, this.fps) || 0
      const annotation = this.getAnnotation(currentTime)
      const annotations = this.getNewAnnotations(currentTime, annotation)
      this.$emit('annotationchanged', {
        preview: this.preview,
        annotations: annotations
      })
    },

    loadAnnotation (annotation) {
      if (!annotation) {
        console.error('Annotations are malformed and cannot be loaded.')
        return
      }
      let currentTime = annotation.time || 0
      currentTime = roundToFrame(currentTime, this.fps)
      this.video.pause()

      if (!this.fabricCanvas) this.setupFabricCanvas()
      this.resetCanvasSize()

      this.video.currentTime = currentTime
      this.fabricCanvas.isDrawingMode = false
      this.isDrawing = false

      this.clearCanvas()

      let scaleMultiplierX = 1
      let scaleMultiplierY = 1
      if (annotation.width) {
        scaleMultiplierX = this.fabricCanvas.width / annotation.width
        scaleMultiplierY = this.fabricCanvas.width / annotation.width
      }
      if (annotation.height) {
        scaleMultiplierY = this.fabricCanvas.height / annotation.height
      }

      annotation.drawing.objects.forEach((obj) => {
        const base = {
          left: obj.left * scaleMultiplierX,
          top: obj.top * scaleMultiplierY,
          fill: 'transparent',
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
          radius: obj.radius * scaleMultiplierX,
          width: obj.width,
          height: obj.height,
          scaleX: obj.scaleX * scaleMultiplierX,
          scaleY: obj.scaleY * scaleMultiplierY
        }
        if (obj.type === 'path') {
          let strokeMultiplier = 1
          if (obj.canvasWidth) {
            strokeMultiplier = annotation.width / this.fabricCanvas.width
          }
          const path = new fabric.Path(
            obj.path,
            {
              ...base,
              strokeWidth: obj.strokeWidth * strokeMultiplier,
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
        } else if ((obj.type === 'i-text') || (obj.type === 'text')) {
          const text = new fabric.Text(
            obj.text,
            {
              ...base,
              fill: obj.fill,
              left: obj.left * scaleMultiplierX,
              top: obj.top * scaleMultiplierY,
              fontFamily: obj.fontFamily,
              fontSize: obj.fontSize,
              width: obj.width * scaleMultiplierX
            }
          )
          this.fabricCanvas.add(text)
        }
      })
    },

    reloadAnnotations () {
      if (this.readOnly) return
      this.annotations = []
      if (this.preview.annotations) {
        const annotations = []
        this.preview.annotations.forEach(a => annotations.push({ ...a }))
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
        left: this.getTimelinePosition(annotation.time, index) + 'px'
      }
    },

    setDefaultComparisonTaskType () {
      if (this.readOnly) return
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
    },

    resetCanvas () {
      if (!this.fabricCanvas) this.setupFabricCanvas()
      this.resetCanvasSize()
      this.fabricCanvas.renderAll()
      this.clearCanvas()
      const annotation = this.getAnnotation(this.video.currentTime)
      if (annotation) this.loadAnnotation(annotation)
    },

    resetCanvasSize () {
      if (this.$refs.movie) {
        const width = this.$refs.movie.offsetWidth
        const height = this.$refs.movie.offsetHeight
        this.fabricCanvas.setDimensions({ width, height })
      }
    },

    changeCurrentPreview (previewFile) {
      this.$emit('change-current-preview', previewFile)
    }
  },

  watch: {
    preview () {
      this.maxDuration = '00:00.00'
      this.fabricCanvas.isDrawingMode = false
      this.isDrawing = false
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
    },

    light () {
      this.onWindowResize()
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
  align-items: center;
  justify-content: center;
  text-align: center;
}

.spinner {
  margin: auto;
}

.icon {
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
  position: relative;
}

.annotation-movie {
  margin: auto;
  width: 100%;
}

.time-indicator {
  color: $light-grey;
  padding-left: 0.8em;
  margin-right: 0;
}

.canvas-wrapper {
  margin: auto;
  position: absolute;
  left: 0;
  z-index: 300;
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
  background: $grey;
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
  background: $grey;
  height: 8px;
  display: block;
}

.progress progress#progress span#progress-bar {
  border-radius: 0;
  margin: 0;
  padding: 0;
  background-color: #43B581;
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

.buttons .comparison-button {
  margin-left: 1em;
}

.previous-preview-file {
  padding: 1px 8px;
  margin-right: 0.4em;
  border: 1px solid $grey;
  border-radius: 50%;
  cursor: pointer;
}

.current-preview-file {
  padding: 1px 8px;
  margin-right: 0.4em;
  border: 1px solid $grey;
  border-radius: 50%;
  cursor: pointer;
  background: $purple-strong;
  transition: 0.3s background ease;
}

.annotation-tools {
  align-items: stretch;
  display: flex;
  height: 33px;
  background: $dark-grey;
}

.slide-enter-active {
  transition: all .3s ease;
}

.slide-leave-active {
  transition: all .3s ease;
}

.slide-enter, .slide-leave-to {
  transform: translateX(100%);
}
</style>
