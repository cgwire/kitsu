<template>
<div ref="container" class="preview-player dark">

  <div class="preview">
    <div class="canvas-wrapper" ref="canvas-wrapper" oncontextmenu="return false;">
      <canvas
        id="annotation-canvas"
        ref="annotation-canvas"
        class="canvas"
      >
      </canvas>
    </div>

    <video-player
      ref="video-player"
      class="video-player"
      :big="big"
      :default-height="defaultHeight"
      :is-comparing="isComparing"
      :is-drawing="isDrawing"
      :is-muted="isMuted"
      :is-repeating="isRepeating"
      :is-typing="isTyping"
      :light="light"
      :preview="currentPreview"
      :preview-to-compare-id="previewToCompareId"
      @size-changed="fixCanvasSize"
      @duration-changed="changeMaxDuration"
      @time-update="updateTime"
      @play-ended="pause"
      v-show="isMovie"
    />

    <picture-viewer
      ref="picture-player"
      :default-height="defaultHeight"
      :big="big"
      :full-screen="fullScreen"
      :is-drawing="isDrawing"
      :is-typing="isTyping"
      :light="light"
      :preview="currentPreview"
      :read-only="readOnly"
      @size-changed="fixCanvasSize"
      v-show="isPicture"
    />

    <!--model-viewer
      class="model-viewer"
      :default-height="defaultHeight"
      :preview-url="originalPath"
      :light="light"
      :empty="!is3DModel"
      :full-screen="fullScreen"
      v-show="is3DModel"
    />

    <pdf
      class="pdf-viewer"
      :height="defaultHeight"
      :src="originalPath"
      v-if="isPdf"
    /-->

    <div
      class="center"
      :style="{ height: defaultHeight + 'px' }"
    >
      <a
        class="button mt2"
        ref="preview-file"
        :href="originalDlPath"
        v-if="isFile"
      >
        <download-icon class="icon" />
        <span class="text">
          {{ $t('tasks.download_pdf_file', {extension}) }}
        </span>
      </a>
    </div>
  </div>

  <div class="button-bar" ref="button-bar">
    <div class="video-progress pull-bottom" v-show="isMovie">
      <progress
        ref="progress"
        value="0"
        min="0"
        @click="onProgressClicked"
      >
      </progress>
    </div>

    <annotation-bar
      :annotations="annotations"
      :maxDurationRaw="videoDuration"
      :width="width"
      @select-annotation="onAnnotationClicked"
      ref="annotation-bar"
      v-show="isMovie"
    />

    <div class="buttons flexrow pull-bottom">
      <div class="left flexrow" v-if="isMovie">
        <button-simple
          class="flexrow-item"
          :title="$t('playlists.actions.play')"
          icon="play"
          @click="onPlayPauseClicked"
          v-if="!isPlaying"
        />
        <button-simple
          class="flexrow-item"
          :title="$t('playlists.actions.pause')"
          icon="pause"
          @click="onPlayPauseClicked"
          v-else
        />

        <button-simple
          :active="isRepeating"
          :title="$t('playlists.actions.looping')"
          icon="repeat"
          @click="onRepeatClicked"
          v-if="fullScreen"
        />

        <button-simple
          class="flexrow-item"
          :title="$t('playlists.actions.unmute')"
          icon="soundoff"
          @click="onToggleSoundClicked"
          v-if="isMuted"
        />
        <button-simple
          class="flexrow-item"
          :title="$t('playlists.actions.mute')"
          icon="soundon"
          @click="onToggleSoundClicked"
          v-else
        />

        <span
          class="flexrow-item time-indicator"
          :title="$t('playlists.actions.current_time')"
        >
          {{ currentTime }}
        </span>
        <span
          class="flexrow-item time-indicator"
          v-if="!light || readOnly || fullScreen"
        >
        /
        </span>
        <span
          class="flexrow-item time-indicator"
          :title="$t('playlists.actions.max_duration')"
          v-if="!light || readOnly || fullScreen"
        >
         {{ maxDuration }}
        </span>

        <span
          class="flexrow-item time-indicator mr1"
          :title="$t('playlists.actions.frame_number')"
        >
          ({{ currentFrame }})
        </span>

        <button-simple
          class="ml1"
          :active="isComparing"
          icon="compare"
          :title="$t('playlists.actions.split_screen')"
          @click="onCompareClicked"
          v-if="taskTypeOptions.length > 0 && fullScreen"
        />

        <combobox
          class="comparison-combobox dark"
          :options="taskTypeOptions"
          :is-dark="true"
          :thin="true"
          v-model="taskTypeId"
          v-if="isComparing && (!light || fullScreen)"
        />
        <combobox
          class="comparison-combobox dark"
          :options="previewFileOptions"
          :is-dark="true"
          :thin="true"
          v-model="previewToCompareId"
          v-if="isComparing && (!light || fullScreen)"
        />
      </div>

      <div class="filler"></div>
      <div class="flexrow">

        <div class="flexrow" v-if="isMovie || isPicture">
          <button-simple
            class="flexrow-item"
            icon="undo"
            :title="$t('playlists.actions.annotation_undo')"
            v-if="!readOnly && fullScreen"
            @click="undoLastAction"
          />

          <button-simple
            class="flexrow-item flexrow-item"
            :title="$t('playlists.actions.annotation_redo')"
            icon="redo"
            v-if="!readOnly && fullScreen"
            @click="redoLastAction"
          />

          <button-simple
            class="flexrow-item"
            icon="remove"
            :title="$t('playlists.actions.annotation_delete')"
            @click="onDeleteClicked"
            v-if="!readOnly && fullScreen"
          />

          <transition name="slide">
            <div
              class="annotation-tools"
              v-show="isTyping && fullScreen"
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

          <button-simple
            class="flexrow-item"
            icon="type"
            :active="isTyping"
            :title="$t('playlists.actions.annotation_text')"
            @click="onTypeClicked"
            v-if="!readOnly && fullScreen"
          />

          <transition name="slide">
            <div
              class="annotation-tools"
              v-show="isDrawing && fullScreen"
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

          <button-simple
            class="flexrow-item"
            icon="pencil"
            :active="isDrawing"
            :title="$t('playlists.actions.annotation_draw')"
            @click="onPencilAnnotateClicked"
            v-if="!readOnly && fullScreen"
          />
        </div>

        <div
          class="separator"
          v-if="!readOnly && fullScreen && isPicture"
        >
        </div>

        <a
          class="button flexrow-item"
          :href="originalPath"
          :title="$t('playlists.actions.see_original_file')"
          target="blank"
          v-if="!readOnly && isPicture"
        >
          <arrow-up-right-icon class="icon is-small" />
        </a>

        <div
          class="separator"
          v-if="!fullScreen || (fullScreen &&
                                (previews.length > 1 ||
                                lastPreviewFiles.length > 1))"
        >
        </div>

        <browsing-bar
          :current-index="currentIndex"
          :previews="previews"
          :read-only="readOnly"
          :light="light"
          :full-screen="fullScreen"
          @add-preview-clicked="$emit('add-extra-preview')"
          @next-clicked="onNextClicked"
          @previous-clicked="onPreviousClicked"
          @remove-preview-clicked="onRemovePreviewClicked"
          v-if="currentPreview"
        />

        <div class="flexrow">
          <div class="flexrow" v-if="fullScreen">
            <span
              :class="{
                'previous-preview-file': true,
                'current-preview-file': previewFile.revision === currentPreview.revision
              }"
              :key="`last-preview-${previewFile.id}`"
              @click="changeCurrentPreview(previewFile)"
              v-for="previewFile in lastPreviewFiles"
            >
              {{ previewFile.revision }}
            </span>
          </div>
        </div>

        <div
          class="separator"
          v-if="!fullScreen || (fullScreen && previews.length > 1)"
        >
        </div>

        <a
          class="button flexrow-item"
          :href="originalDlPath"
          :title="$t('playlists.actions.download_file')"
        >
          <download-icon class="icon is-small" />
        </a>

        <button-simple
          class="flexrow-item"
          :title="$t('playlists.actions.fullscreen')"
          icon="maximize"
          v-if="isFullScreenEnabled"
          @click="onFullscreenClicked"
        />
      </div>
    </div>
  </div>
</div>
</template>

<script>
// import pdf from 'vue-pdf'
import { fabric } from 'fabric'
import { mapGetters } from 'vuex'
import { formatFrame, formatTime, roundToFrame } from '@/lib/video'

import { annotationMixin } from '@/components/mixins/annotation_mixin'
import { domMixin } from '@/components/mixins/dom'

import {
  ArrowUpRightIcon,
  DownloadIcon
} from 'vue-feather-icons'
import AnnotationBar from '@/components/pages/playlists/AnnotationBar'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import BrowsingBar from '@/components/previews/BrowsingBar'
import ColorPicker from '@/components/widgets/ColorPicker'
import Combobox from '@/components/widgets/Combobox'
// import ModelViewer from '@/components/previews/ModelViewer'
import PencilPicker from '@/components/widgets/PencilPicker'
import PictureViewer from '@/components/previews/PictureViewer'
import VideoPlayer from '@/components/previews/VideoPlayer'

export default {
  name: 'preview-player',
  mixins: [annotationMixin, domMixin],

  components: {
    ArrowUpRightIcon,
    AnnotationBar,
    ButtonSimple,
    BrowsingBar,
    ColorPicker,
    Combobox,
    DownloadIcon,
    // ModelViewer,
    // pdf,
    PencilPicker,
    PictureViewer,
    VideoPlayer
  },

  props: {
    previews: {
      type: Array,
      default: () => []
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
    },
    big: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      annotations: [],
      currentIndex: 1,
      fullScreen: false,
      color: '#ff3860',
      currentTime: '00:00.000',
      currentTimeRaw: 0,
      isComparing: false,
      isDrawing: false,
      isTyping: false,
      isLoading: false,
      isPlaying: false,
      isMuted: false,
      isRepeating: false,
      maxDuration: '00:00.000',
      palette: ['#ff3860', '#008732', '#5E60BA', '#f57f17'],
      pencil: 'big',
      pencilPalette: ['big', 'medium', 'small'],
      previewToCompareId: null,
      taskTypeId:
        this.entityPreviewFIles ? Object.keys(this.entityPreviewFiles)[0] : null,
      textColor: '#ff3860',
      videoDuration: 0,
      width: 0
    }
  },

  mounted () {
    if (!this.container) return
    this.configureEvents()
    if (this.isMovie) this.configureVideo()
    this.setupFabricCanvas()
    this.reloadAnnotations()
    if (this.isPicture) this.loadAnnotation(this.getAnnotation(0))
  },

  beforeDestroy () {
    if (this.container) {
      console.log('remove key listener')
      window.removeEventListener('keydown', this.onKeyDown)
    }
    window.removeEventListener('resize', this.onWindowResize)
    document.removeEventListener(
      'fullscreenchange', this.onExitFullScreen)
    document.removeEventListener(
      'mozfullscreenchange', this.onExitFullScreen)
    document.removeEventListener(
      'MSFullscreenChange', this.onExitFullScreen)
    document.removeEventListener(
      'webkitfullscreenchange', this.onExitFullScreen)
  },

  computed: {
    ...mapGetters([
      'currentProduction'
    ]),

    originalPath () {
      if (this.currentPreview) {
        const previewId = this.currentPreview.id
        const extension = this.extension ? this.extension : 'png'
        const type = this.isMovie ? 'movies' : 'pictures'
        return `/api/${type}/originals/preview-files/${previewId}.${extension}`
      } else {
        return ''
      }
    },

    originalDlPath () {
      if (this.currentPreview) {
        const type = this.isMovie ? 'movies' : 'pictures'
        return `/api/${type}/originals/preview-files/` +
               `${this.currentPreview.id}/download`
      } else {
        return ''
      }
    },

    extension () {
      return this.currentPreview ? this.currentPreview.extension : ''
    },

    isPicture () {
      return ['gif', 'png', 'jpg', 'jpeg'].includes(this.extension)
    },

    isMovie () {
      return this.extension === 'mp4'
    },

    is3DModel () {
      return this.extension === 'obj'
    },

    isPdf () {
      return this.extension === 'pdf'
    },

    isFile () {
      return !this.isPicture && !this.isMovie // && !this.is3DModel && !this.isPdf
    },

    container () {
      return this.$refs.container
    },

    canvasWrapper () {
      return this.$refs['canvas-wrapper']
    },

    videoPlayer () {
      return this.$refs['video-player']
    },

    progress () {
      return this.$refs.progress
    },

    progressBar () {
      return this.$refs['progress-bar']
    },

    picturePlayer () {
      return this.$refs['picture-player']
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

    currentFrame () {
      return formatFrame(this.currentTimeRaw, this.fps)
    },

    fps () {
      return this.currentProduction.fps || 24
    },

    taskTypeOptions () {
      if (!this.entityPreviewFiles) return []
      const taskTypeIds = Object.keys(this.entityPreviewFiles)
      return taskTypeIds
        .filter((taskTypeId) => {
          if (this.entityPreviewFiles[taskTypeId].length > 1) {
            return true
          } else if (this.entityPreviewFiles[taskTypeId].length === 1) {
            return (
              this.entityPreviewFiles[taskTypeId][0].id !== this.currentPreview.id
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
        previewFiles = previewFiles.filter(p => p.id !== this.currentPreview.id)
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
    },

    currentPreview () {
      if (this.previews &&
          this.previews.length > 0 &&
          this.currentIndex - 1 < this.previews.length) {
        return this.previews[this.currentIndex - 1]
      } else {
        return {}
      }
    },

    defaultHeight () {
      if (this.fullScreen) {
        if (this.isMovie) {
          return screen.height - 90
        } else {
          return screen.height - 30
        }
      } else {
        let bigHeight = screen.height > 800 ? 470 : 300
        if (this.isMovie) bigHeight = screen.height > 800 ? 442 : 272
        return screen.width > 1300 && (
          !this.light || this.big
        ) ? bigHeight : 170
      }
    }

  },

  methods: {
    formatFrame,
    formatTime,

    updateTime (time) {
      this.updateProgressBar(time)
      this.currentTimeRaw = time
      this.currentTime = this.formatTime(this.currentTimeRaw)
    },

    changeMaxDuration (duration) {
      if (duration) {
        this.maxDuration = this.formatTime(duration)
        this.videoDuration = duration
      } else {
        this.maxDuration = '00:00.000'
        this.videoDuration = 0
      }
    },

    play () {
      this.isPlaying = true
      this.isDrawing = false
      if (this.videoPlayer) {
        this.clearCanvas()
        this.videoPlayer.play()
      }
    },

    pause () {
      this.isPlaying = false
      if (this.videoPlayer) this.videoPlayer.pause()
    },

    goPreviousFrame () {
      this.videoPlayer.goPreviousFrame()
    },

    goNextFrame () {
      this.videoPlayer.goNextFrame()
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
      this.isComparing = false
      this.fullScreen = false
      // this.fixCanvasSize(this.getCurrentPreviewDimensions())
      this.$nextTick(() => {
        this.reloadAnnotations()
        this.loadAnnotation()
      })
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
      this.fullScreen = true
      // this.fixCanvasSize(this.getCurrentPreviewDimensions())
      this.$nextTick(() => {
        this.reloadAnnotations()
        this.loadAnnotation()
      })
      this.$refs['button-bar'].focus()
    },

    onDeleteClicked () {
      this.deleteSelection()
    },

    onVideoEnd () {
      this.isPlaying = false
      if (this.isRepeating) {
        this.videoPlayer.currentTime = 0
        this.play()
      }
    },

    onPlayPauseClicked () {
      if (!this.isPlaying) {
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

    onToggleSoundClicked () {
      this.isMuted = !this.isMuted
    },

    onCompareClicked () {
      if (this.isComparing) {
        this.isComparing = false
      } else {
        this.isComparing = true
        this.isDrawing = false
      }
    },

    onFullscreenClicked () {
      if (this.fullScreen) {
        this.removeTypeArea()
        this.exitFullScreen()
      } else {
        this.addTypeArea()
        this.setFullScreen()
      }
    },

    onPencilAnnotateClicked () {
      if (this.isDrawing) {
        this.isDrawing = false
      } else {
        this.isTyping = false
        this.isDrawing = true
      }
    },

    onTypeClicked () {
      if (this.isTyping) {
        this.isTyping = false
      } else {
        this.isDrawing = false
        this.isTyping = true
      }
    },

    saveAnnotations () {
      let currentTime = 0
      if (this.isMovie) {
        currentTime = roundToFrame(this.videoPlayer.currentTimeRaw, this.fps) || 0
      }
      const annotation = this.getAnnotation(currentTime)
      const annotations = this.getNewAnnotations(currentTime, annotation)
      if (!this.readOnly) {
        this.$emit('annotation-changed', {
          preview: this.currentPreview,
          annotations: annotations
        })
      }
    },

    loadAnnotation (annotation) {
      let currentTime = 0
      if (!annotation) {
        currentTime = roundToFrame(this.currentTimeRaw, this.fps)
        annotation = this.getAnnotation(currentTime)
        if (!annotation) {
          if (!this.isMovie) {
            console.error(
              'Annotations are malformed and cannot be loaded.', currentTime
            )
          }
          return
        }
      }
      this.isDrawing = false

      if (!this.fabricCanvas) this.setupFabricCanvas()
      if (this.isMovie) {
        currentTime = annotation.time || 0
        this.videoPlayer.pause()
        currentTime = roundToFrame(currentTime, this.fps)
        this.videoPlayer.setCurrentTime(currentTime)
      }

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
      this.annotations = []
      if (this.currentPreview.annotations) {
        const annotations = []
        this.currentPreview.annotations.forEach(a => annotations.push({ ...a }))
        this.annotations = annotations.sort((a, b) => {
          return a.time < b.time
        }) || []
      } else {
        this.annotations = []
      }
      return this.annotations
    },

    /*
    onWindowResize () {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 600) {
        this.lastCall = now
        // this.fixCanvasSize(this.getDimensions())
        this.width = this.getDimensions().width
      }
    },
    */

    onKeyDown (event) {
      console.log(event.keyCode)
      if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        if (event.keyCode === 46) {
          this.deleteSelection()
        } else if (event.keyCode === 37) { // arrow left
          this.goPreviousFrame()
        } else if (event.keyCode === 39) { // arrow right
          this.goNextFrame()
        } else if (event.keyCode === 32) { // space
          this.onPlayPauseClicked()
        } else if (event.keyCode === 68) { // d
          this.container.focus()
          this.pauseEvent(event)
          this.onPencilAnnotateClicked()
        } else if (event.ctrlKey && event.altKey && event.keyCode === 68) {
          // ctrl + alt + d
          this.onPencileAnnotateClicked()
        } else if (event.ctrlKey && event.keyCode === 90) { // ctrl + z
          console.log('undo')
          this.undoLastAction()
        } else if (event.altKey && event.keyCode === 82) { // alt + r
          this.redoLastAction()
        } else if (event.keyCode === 27) { // Esc
          if (this.fullScreen) {
            this.isComparing = false
            this.fullScreen = false
            this.$nextTick(() => {
              this.reloadAnnotations()
              this.loadAnnotation()
            })
          }
        }
      }
    },

    setDefaultComparisonTaskType () {
      const taskTypeIds = Object.keys(this.entityPreviewFiles)
      if (taskTypeIds && taskTypeIds.length > 0) {
        const taskTypeOption = this.taskTypeOptions.find((option) => {
          return this.entityPreviewFiles[option.value].findIndex(
            p => p.id === this.currentPreview.id
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
        previewFiles = previewFiles.filter(p => p.id !== this.currentPreview.id)
        if (previewFiles.length > 0) {
          this.previewToCompareId = previewFiles[0].id
        } else {
          this.previewToCompareId = null
        }
      } else {
        this.previewToCompareId = null
      }
    },

    changeCurrentPreview (previewFile) {
      this.$emit('change-current-preview', previewFile)
    },

    onAddPreviewClicked () {
      this.$emit('add-preview')
    },

    onRemovePreviewClicked () {
      this.$emit('remove-extra-preview', this.currentPreview)
    },

    onPreviousClicked () {
      if (this.currentIndex > 1) {
        this.currentIndex--
      } else {
        this.currentIndex = this.previews.length
      }
    },

    onNextClicked () {
      if (this.currentIndex < this.previews.length) {
        this.currentIndex++
      } else {
        this.currentIndex = 1
      }
    },

    displayFirst () {
      if (this.currentIndex > 1) this.currentIndex = 1
    },

    displayLast () {
      this.currentIndex = this.previews.length
    },

    configureVideo () {
      this.isPlaying = false
      this.isMuted = false
      this.isRepeating = false
      /*
      this.container.addEventListener('keydown', (event) => {
        this.pauseEvent(event)
        return false
      })
      */
    },

    configureEvents () {
      console.log('add key listener')
      window.addEventListener('keydown', this.onKeyDown, false)
      window.addEventListener('resize', this.onWindowResize)
      document.addEventListener(
        'fullscreenchange', this.onExitFullScreen, false)
      document.addEventListener(
        'mozfullscreenchange', this.onExitFullScreen, false)
      document.addEventListener(
        'MSFullscreenChange', this.onExitFullScreen, false)
      document.addEventListener(
        'webkitfullscreenchange', this.onExitFullScreen, false)
    },

    onExitFullScreen () {
      if (
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        this.fullScreen = false
      }
    },

    getDimensions () {
      const dimensions = { width: 0, height: 0 }
      if (this.container) {
        dimensions.width = this.container.offsetWidth
        dimensions.height = this.container.offsetHeight
      }
      return dimensions
    },

    getCurrentPreviewDimensions () {
      if (this.isMovie) return this.videoPlayer.getDimensions()
      else if (this.isPicture) return this.picturePlayer.getDimensions()
      else return { width: 0, height: 0 }
    },

    setupFabricCanvas () {
      const fabricCanvas = new fabric.Canvas('annotation-canvas', {
        fireRightClick: true
      })
      const dimensions = this.getDimensions()
      const width = dimensions.width
      const height = dimensions.height
      fabricCanvas.setDimensions({
        width: width,
        height: height
      })

      fabricCanvas.freeDrawingBrush.color = this.color
      fabricCanvas.freeDrawingBrush.width = 4

      fabricCanvas.off('object:added', this.stackAddAction)
      fabricCanvas.on('object:added', this.stackAddAction)
      fabricCanvas.off('object:moved', this.saveAnnotations)
      fabricCanvas.on('object:moved', this.saveAnnotations)
      fabricCanvas.on('mouse:up', () => {
        // this.$refs.loupe.style.display = 'none'
        // this.$options.loupe = false
        if (this.isDrawing) {
          this.clearUndoneStack()
          this.saveAnnotations()
        }
      })
      fabricCanvas.on('mouse:move', this.onCanvasMouseMoved)
      fabricCanvas.on('mouse:down', this.onCanvasClicked)
      fabricCanvas.on('mouse:up', this.onCanvasReleased)
      this.fabricCanvas = fabricCanvas
    },

    onCanvasMouseMoved (event) {
      if (this.isPicture && this.$options.loupe) {
        const width = this.canvasWrapper.style.width
        const height = this.canvasWrapper.style.height
        this.picturePlayer.updateLoupePosition(event, { width, height })
      }
    },

    onCanvasClicked (event) {
      console.log('mouse down')
      if (event.button > 1 && this.isPicture && this.fullScreen) {
        this.$options.loupe = true
        this.picturePlayer.showLoupe()
        const width = this.canvasWrapper.style.width
        const height = this.canvasWrapper.style.height
        this.picturePlayer.updateLoupePosition(event, { width, height })
        return false
      }
    },

    onCanvasReleased (event) {
      console.log('mouse up')
      if (this.isPicture && this.$options.loupe) {
        this.picturePlayer.hideLoupe()
        this.$options.loupe = false
        return false
      }
    },

    fixCanvasSize (dimensions) {
      const width = dimensions.width
      const height = dimensions.height
      if (this.fabricCanvas) {
        this.fabricCanvas.setDimensions({ width, height })
        this.fabricCanvas.width = width
        this.fabricCanvas.height = height
        const containerWidth = this.container.offsetWidth
        const containerHeight = this.container.offsetHeight
        const margin = Math.round((containerWidth - width) / 2)
        const corrector = this.isMovie ? 60 : 32
        const top = Math.round((containerHeight - corrector - height) / 2)
        if (this.canvasWrapper) {
          this.canvasWrapper.style.top = top + 'px'
          this.canvasWrapper.style.left = margin + 'px'
          this.canvasWrapper.style.width = width + 'px'
          this.canvasWrapper.style.height = height + 'px'
          setTimeout(() => {
            this.fabricCanvas.calcOffset()
            this.fabricCanvas.setDimensions({ width, height })
            this.width = this.getDimensions().width
            this.$nextTick(this.refreshCanvas())
          }, 10)
        }
      }
    },

    refreshCanvas () {
      this.clearCanvas()
      if (this.annotations.length > 0) {
        if (this.isMovie) {
          this.loadAnnotation()
        } else if (this.isPicture) {
          this.loadAnnotation(this.getAnnotation(0))
        }
      }
    },

    onChangeColor (newValue) {
      this.color = newValue
      this.fabricCanvas.freeDrawingBrush.color = this.color
      this.isShowingPalette = false
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

    getAnnotation (time) {
      if (this.isMovie) {
        time = roundToFrame(time, this.fps)
        return this.annotations.find(
          (annotation) => annotation.time === time
        )
      } else if (this.isPicture) {
        return this.annotations[0]
      }
    },

    getAnnotationStyles (annotation, index) {
      return {
        cursor: 'pointer',
        position: 'relative',
        display: 'inline-block',
        left: this.getTimelinePosition(annotation.time, index) + 'px'
      }
    },

    onAnnotationClicked (annotation) {
      this.loadAnnotation(annotation)
    },

    onProgressClicked (e) {
      let left = this.progress.offsetLeft
      if (left === 0 && !this.fullScreen) {
        left = this.progress.parentElement.offsetParent.offsetLeft - 10
      }
      const pos = (e.pageX - left) / this.progress.offsetWidth
      const currentTime = pos * this.videoDuration
      this.videoPlayer.setCurrentTime(currentTime)
    },

    updateProgressBar (currentTime) {
      if (!this.progress.getAttribute('max')) {
        this.progress.setAttribute('max', this.videoDuration)
      }
      this.progress.value = currentTime * 1
    }
  },

  watch: {
    currentPreview () {
      this.reloadAnnotations()
      if (this.isMovie) {
        this.configureVideo()
        this.pause()
        this.maxDuration = '00:00.000'
        this.isDrawing = false
        if (this.isComparing) this.isComparing = false
        this.setDefaultComparisonTaskType()
      } else if (this.isPicture) {
        this.pause()
        this.isDrawing = false
        this.refreshCanvas()
        setTimeout(this.picturePlayer.resetPicture, 10)
      }
    },

    previewToCompareId () {
      if (this.isComparing) {
        this.pause()
        const currentTime = this.videoPlayer.currentTime
        const comparisonVideo = document.getElementById('comparison-movie')
        if (comparisonVideo) comparisonVideo.currentTime = currentTime
      }
    },

    taskTypeId () {
      this.setDefaultComparisonPreview()
    },

    light () {
      this.onWindowResize()
    },

    isDrawing () {
      if (this.fabricCanvas) this.fabricCanvas.isDrawingMode = this.isDrawing
    },

    isTyping () {
      const clickarea =
        this.canvasWrapper.getElementsByClassName('upper-canvas')[0]
      if (this.isTyping && clickarea) {
        clickarea.addEventListener('dblclick', this.addText)
      } else {
        clickarea.removeEventListener('dblclick', this.addText)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .preview-player {
    box-shadow: 0px 0px 4px #0008;
  }
}

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

.video-player {
  width: 100%;
  text-align: center;
  background: #36393F;
}

.buttons {
  background: #36393F;
  height: 32px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.buttons .button:first-child {
  border-bottom-left-radius: 5px;
}
.buttons .button:last-child {
  border-bottom-right-radius: 5px;
}

.buttons .button {
  background: transparent;
  border-radius: 0;
  color: #BBB;
  border: 0;
  margin: 0;
  transition: all 0.3s ease;
}

.buttons .button.active,
.buttons .button:hover {
  color: #43B581;
}

.buttons .button:hover {
  border-radius: 5px;
  transform: scale(1.2);
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
  color: $grey;
}

.current-preview-file {
  padding: 1px 8px;
  margin-right: 0.4em;
  border: 1px solid $grey;
  border-radius: 50%;
  cursor: pointer;
  color: white;
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

.buttons .button.ml1 {
  margin-left: 1em;
}

.video-player {
  background: $dark-grey-stronger;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.canvas-wrapper {
  width: 100%;
  position: absolute;
  left: 0;
  z-index: 500;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-player {
  background: $dark-grey-light;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  box-shadow: 0px 0px 4px #0007;
  min-height: 200px;

  .preview {
    position: relative;
    align-items: center;
    background: black;
    // box-shadow: inset 4px 2px 20px 4px #000A;
    display: flex;
    flex: 1;
    justify-content: center;

    .button {
      padding: 1.5em;
      transition: background 0.3s ease;

      &:hover {
        background: $dark-grey-lightest;
      }
    }
  }
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

progress::progress-value,
progress::-o-progress-value,
progress::-moz-progress-value,
progress::-webkit-progress-value {
  transition: all 0.25s linear;
}
</style>
