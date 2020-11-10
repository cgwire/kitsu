<template>
<div ref="container" class="preview-player dark">

  <div class="preview" :style="{height: defaultHeight + 'px'}">
    <div
      class="canvas-wrapper"
      ref="canvas-wrapper"
      oncontextmenu="return false;"
    >
      <canvas
        id="annotation-canvas"
        ref="annotation-canvas"
        class="canvas"
      >
      </canvas>
    </div>

    <preview-viewer
      ref="preview-viewer"
      name="player1"
      class="preview-viewer"
      :big="big"
      :default-height="defaultHeight"
      :full-screen="fullScreen"
      :is-ordering="isOrdering"
      :is-comparing="isComparing"
      :is-muted="isMuted"
      :is-repeating="isRepeating"
      :light="light"
      :preview="currentPreview"
      @size-changed="fixCanvasSize"
      @duration-changed="changeMaxDuration"
      @time-update="updateTime"
      @play-ended="pause"
    />

    <preview-viewer
      ref="comparison-preview-viewer"
      name="player2"
      class="comparison-preview-viewer"
      :big="big"
      :default-height="defaultHeight"
      :full-screen="fullScreen"
      :is-comparing="isComparing"
      :is-muted="true"
      :is-repeating="isRepeating"
      :light="light"
      :preview="previewToCompare"
      v-show="isComparing && previewToCompare"
    />

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

    <div class="buttons flexrow pull-bottom" ref="buttons">
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
      </div>

      <div class="flexrow flexrow-item">
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
              v-show="isTyping && (!light || fullScreen)"
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
            v-if="!readOnly && (!light || fullScreen)"
          />

          <transition name="slide">
            <div
              class="annotation-tools"
              v-show="isDrawing && (!light || fullScreen)"
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
            v-if="!readOnly && (!light || fullScreen)"
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
          @current-index-clicked="isOrdering = !isOrdering"
          v-if="currentPreview"
        />

        <div class="flexrow">
          <div class="flexrow" v-if="fullScreen">
            <span
              :class="{
                'previous-preview-file': true,
                'current-preview-file': isCurrentRevision(previewFile)
              }"
              :key="`last-preview-${previewFile.id}`"
              :title="getRevisionTitle(previewFile)"
              @click="changeCurrentPreview(previewFile)"
              v-for="previewFile in lastPreviewFiles"
            >
              {{ previewFile.revision }}
            </span>
          </div>
        </div>

        <div
          class="separator"
          v-if="lastPreviewFiles.length > 1"
        >
        </div>

        <a
          class="button flexrow-item"
          :href="originalDlPath"
          :title="$t('playlists.actions.download_file')"
          v-if="big || fullScreen"
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

  <div
    class="flexrow revision-previews"
    ref="revision-previews"
    v-if="(!light || fullScreen) && isOrdering"
  >
    <div
      class="flexrow-item revision-preview"
      :key="preview.id"
      v-for="(preview, index) in previews"
    >
      <revision-preview
        :preview-file="preview"
        :index="index"
        :is-selected="currentPreview.id === preview.id"
        @selected="onRevisionPreviewSelected(index + 1)"
        @preview-dropped="onRevisionPreviewDropped"
      />
    </div>
  </div>
</div>
</template>

<script>
import { fabric } from 'fabric'
import { mapGetters, mapActions } from 'vuex'
import { formatFrame, formatTime, roundToFrame } from '@/lib/video'

import { annotationMixin } from '@/components/mixins/annotation_mixin'
import { fullScreenMixin } from '@/components/mixins/fullscreen'
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
import PencilPicker from '@/components/widgets/PencilPicker'
import RevisionPreview from '@/components/previews/RevisionPreview'
import PreviewViewer from '@/components/previews/PreviewViewer'

export default {
  name: 'preview-player',
  mixins: [annotationMixin, domMixin, fullScreenMixin],

  components: {
    ArrowUpRightIcon,
    AnnotationBar,
    ButtonSimple,
    BrowsingBar,
    ColorPicker,
    Combobox,
    DownloadIcon,
    PencilPicker,
    PreviewViewer,
    RevisionPreview
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
      isLoading: false,
      isMuted: false,
      isPlaying: false,
      isOrdering: false,
      isRepeating: false,
      isTyping: false,
      maxDuration: '00:00.000',
      palette: ['#ff3860', '#008732', '#5E60BA', '#f57f17'],
      pencil: 'big',
      pencilPalette: ['big', 'medium', 'small'],
      previewToCompare: null,
      previewToCompareId: null,
      taskTypeId: this.entityPreviewFIles
        ? Object.keys(this.entityPreviewFiles)[0] : null,
      textColor: '#ff3860',
      videoDuration: 0,
      width: 0
    }
  },

  mounted () {
    if (!this.container) return
    this.configureEvents()
    this.setupFabricCanvas()
    this.reloadAnnotations()
    if (this.isPicture) this.loadAnnotation(this.getAnnotation(0))
    this.resetPreviewFileMap()
  },

  beforeDestroy () {
    this.removeEvents()
  },

  computed: {
    ...mapGetters([
      'currentProduction'
    ]),

    // Elements

    container () {
      return this.$refs.container
    },

    canvasWrapper () {
      return this.$refs['canvas-wrapper']
    },

    previewViewer () {
      return this.$refs['preview-viewer']
    },

    comparisonViewer () {
      return this.$refs['comparison-preview-viewer']
    },

    progress () {
      return this.$refs.progress
    },

    progressBar () {
      return this.$refs['progress-bar']
    },

    // Utils

    currentFrame () {
      return formatFrame(this.currentTimeRaw, this.fps)
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
        let height = screen.height
        if (this.isOrdering) height -= 140
        if (this.isMovie) height -= 60
        else height -= 30
        return height
      } else {
        let bigHeight = screen.height > 800 ? 470 : 300
        if (this.isMovie) bigHeight = screen.height > 800 ? 442 : 272
        return screen.width > 1300 && (
          !this.light || this.big
        ) ? bigHeight : 200
      }
    },

    fps () {
      return this.currentProduction.fps || 24
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

    taskTypeOptions () {
      if (!this.entityPreviewFiles) return []
      const taskTypeIds = Object.keys(this.entityPreviewFiles)
      return taskTypeIds
        .filter((taskTypeId) => {
          const previewFiles = this.entityPreviewFiles[taskTypeId]
            .filter(p => ['mp4', 'png'].includes(p.extension))
          return previewFiles.length > 0 && this.taskTypeMap[taskTypeId]
        })
        .map(taskTypeId => {
          const taskType = this.taskTypeMap[taskTypeId]
          return {
            label: taskType.name,
            value: taskType.id
          }
        })
    },

    previewFileOptions () {
      if (!this.entityPreviewFiles) return []
      const previewFiles = this.entityPreviewFiles[this.taskTypeId]
      if (previewFiles && previewFiles.length > 0) {
        return previewFiles.map(previewFile => {
          return {
            label: `v${previewFile.revision}`,
            value: previewFile.id
          }
        })
      } else {
        return []
      }
    }
  },

  methods: {
    ...mapActions([
      'updateRevisionPreviewPosition'
    ]),
    formatFrame,
    formatTime,

    isCurrentRevision (previewFile) {
      return previewFile.revision === this.currentPreview.revision
    },

    getRevisionTitle (previewFile) {
      return `${this.$t('playlists.actions.display_revision')}` +
             ` ${previewFile.revision}`
    },

    updateTime (time) {
      this.updateProgressBar(time)
      this.currentTimeRaw = time
      this.currentTime = this.formatTime(this.currentTimeRaw)
      if (!this.isPlaying) this.loadAnnotation()
    },

    // Video

    configureVideo () {
      this.isPlaying = false
      this.isMuted = false
      this.isRepeating = false
    },

    changeMaxDuration (duration) {
      if (duration) {
        this.maxDuration = this.formatTime(duration)
        this.videoDuration = duration
        this.progress.setAttribute('max', this.videoDuration)
      } else {
        this.maxDuration = '00:00.000'
        this.videoDuration = 0
        this.progress.setAttribute('max', 0)
      }
    },

    play () {
      this.isPlaying = true
      this.isDrawing = false
      if (this.previewViewer) {
        this.clearCanvas()
        this.previewViewer.play()
        if (this.comparisonViewer) this.comparisonViewer.play()
      }
    },

    pause () {
      this.isPlaying = false
      if (this.previewViewer) this.previewViewer.pause()
      if (this.comparisonViewer) this.comparisonViewer.pause()
    },

    goPreviousFrame () {
      this.previewViewer.goPreviousFrame()
      if (this.comparisonViewer) this.comparisonViewer.goPreviousFrame()
      this.clearCanvas()
    },

    goNextFrame () {
      this.previewViewer.goNextFrame()
      if (this.comparisonViewer) this.comparisonViewer.goNextFrame()
      this.clearCanvas()
    },

    onVideoEnd () {
      this.isPlaying = false
      if (this.isRepeating) {
        this.setCurrentTime(0)
        this.play()
      }
    },

    onPlayPauseClicked () {
      this.clearFocus()
      if (!this.isPlaying) {
        this.play()
      } else {
        this.pause()
      }
    },

    onRepeatClicked () {
      this.clearFocus()
      if (this.isRepeating) {
        this.isRepeating = false
      } else {
        this.isRepeating = true
      }
    },

    onToggleSoundClicked () {
      this.clearFocus()
      this.isMuted = !this.isMuted
    },

    // Sizing

    getDimensions () {
      const dimensions = { width: 0, height: 0 }
      if (this.container) {
        dimensions.width = this.container.offsetWidth
        dimensions.height = this.container.offsetHeight
      }
      return dimensions
    },

    getCurrentPreviewDimensions () {
      const dim = this.previewViewer.getPreviewDimensions()
      return dim
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

    fixCanvasSize (dimensions) {
      const width = dimensions.width
      const height = dimensions.height
      if (this.fabricCanvas) {
        this.fabricCanvas.setDimensions({ width, height })
        this.fabricCanvas.width = width
        this.fabricCanvas.height = height
        const containerWidth = this.container.offsetWidth
        const containerHeight = this.container.offsetHeight
        let margin = Math.round((containerWidth - width) / 2)
        if (this.isComparing) {
          margin = Math.round(((containerWidth / 2) - width) / 2)
        }
        let corrector = this.isMovie ? 60 : 32
        if (this.isOrdering) corrector += 140
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

    // Screen

    setFullScreen () {
      this.documentSetFullScreen(this.container)
      this.container.setAttribute('data-fullscreen', !!true)
      this.fullScreen = true
      this.fixCanvasSize(this.getCurrentPreviewDimensions())
      this.$nextTick(() => {
        // Needed to avoid fullsceen button to be called with space bar.
        this.clearFocus()
        this.reloadAnnotations()
        this.loadAnnotation()
      })
    },

    exitFullScreen () {
      this.documentExitFullScreen()
      this.container.setAttribute('data-fullscreen', !!false)
      this.isComparing = false
      this.fullScreen = false
      this.fixCanvasSize(this.getCurrentPreviewDimensions())
      this.$nextTick(() => {
        // Needed to avoid fullsceen button to be called with space bar.
        this.clearFocus()
        this.reloadAnnotations()
        this.loadAnnotation()
      })
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

    onFullScreenChange () {
      if (
        this.fullScreen &&
        !this.isFullScreen()
      ) {
        this.isComparing = false
        this.fullScreen = false
        this.$nextTick(() => {
          this.previewViewer.resetVideo()
          this.previewViewer.resetPicture()
          this.fixCanvasSize(this.getCurrentPreviewDimensions())
          this.reloadAnnotations()
          this.loadAnnotation()
        })
      }
    },

    // Comparison

    onCompareClicked () {
      this.clearFocus()
      if (this.isComparing) {
        this.isComparing = false
      } else {
        this.isComparing = true
        this.taskTypeId = this.taskTypeOptions[0].value
        this.previewToCompareId = ''
        this.$nextTick(() => {
          this.previewToCompareId = this.previewFileOptions[0].value
        })
        this.isDrawing = false
      }
    },

    setDefaultComparisonTaskType () {
      if (!this.entityPreviewFiles) return ''
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
      if (!this.entityPreviewFiles) return ''
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

    resetPreviewFileMap () {
      this.previewFileMap = {}
      if (this.entityPreviewFiles) {
        const previewFiles = this.entityPreviewFiles[this.taskTypeId]
        if (previewFiles) {
          previewFiles.forEach(previewFile => {
            this.previewFileMap[previewFile.id] = previewFile
          })
        }
      }
    },

    // Annotations

    onDeleteClicked () {
      this.clearFocus()
      this.deleteSelection()
    },

    onChangeColor (newValue) {
      this.color = newValue
      this.fabricCanvas.freeDrawingBrush.color = this.color
      this.isShowingPalette = false
    },

    onPencilAnnotateClicked () {
      this.clearFocus()
      if (this.isDrawing) {
        this.isDrawing = false
      } else {
        this.isTyping = false
        this.isDrawing = true
      }
    },

    onTypeClicked () {
      this.clearFocus()
      if (this.isTyping) {
        this.isTyping = false
      } else {
        this.isDrawing = false
        this.isTyping = true
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

    saveAnnotations () {
      let currentTime = 0
      if (this.isMovie) {
        const currentTimeRaw = this.previewViewer.getCurrentTimeRaw()
        currentTime = roundToFrame(currentTimeRaw, this.fps) || 0
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
        this.previewViewer.pause()
        currentTime = roundToFrame(currentTime, this.fps)
        this.setCurrentTime(currentTime)
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

    // Events

    onKeyDown (event) {
      if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        if (event.keyCode === 46) {
          this.deleteSelection()
        } else if (event.keyCode === 37) { // arrow left
          this.goPreviousFrame()
        } else if (event.keyCode === 39) { // arrow right
          this.goNextFrame()
        } else if (event.keyCode === 32) { // space
          this.onPlayPauseClicked()
          this.pauseEvent(event)
          return false
        } else if (event.keyCode === 68) { // d
          this.container.focus()
          this.pauseEvent(event)
          this.onPencilAnnotateClicked()
        } else if (event.ctrlKey && event.altKey && event.keyCode === 68) {
          // ctrl + alt + d
          this.onPencileAnnotateClicked()
        } else if (event.ctrlKey && event.keyCode === 90) { // ctrl + z
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

    configureEvents () {
      window.addEventListener('keydown', this.onKeyDown, false)
      this.container.addEventListener(
        'fullscreenchange', this.onFullScreenChange, false)
      this.container.addEventListener(
        'mozfullscreenchange', this.onFullScreenChange, false)
      this.container.addEventListener(
        'MSFullscreenChange', this.onFullScreenChange, false)
      this.container.addEventListener(
        'webkitfullscreenchange', this.onFullScreenChange, false)
    },

    removeEvents () {
      window.removeEventListener('keydown', this.onKeyDown)
    },

    // Browsing

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

    // Loupe

    onCanvasMouseMoved (event) {
      if (this.isPicture && this.$options.loupe) {
        const width = this.canvasWrapper.style.width
        const height = this.canvasWrapper.style.height
        this.previewViewer.updateLoupePosition(event, { width, height })
      }
    },

    onCanvasClicked (event) {
      if (event.button > 1 && this.isPicture && this.fullScreen) {
        this.$options.loupe = true
        this.previewViewer.showLoupe()
        const width = this.canvasWrapper.style.width
        const height = this.canvasWrapper.style.height
        this.previewViewer.updateLoupePosition(event, { width, height })
        return false
      }
    },

    onCanvasReleased (event) {
      if (this.isPicture && this.$options.loupe) {
        this.previewViewer.hideLoupe()
        this.$options.loupe = false
        return false
      }
    },

    // Video progress

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

    onProgressClicked (e) {
      let left = this.progress.offsetLeft
      if (left === 0 && !this.fullScreen) {
        left = this.progress.parentElement.offsetParent.offsetLeft
      }
      const pos = (e.pageX - left) / this.progress.offsetWidth
      const currentTime = roundToFrame(pos * this.videoDuration, this.fps)
      this.setCurrentTime(currentTime)
    },

    setCurrentTime (time) {
      this.previewViewer.setCurrentTime(time)
      if (this.comparisonViewer) this.comparisonViewer.setCurrentTime(time)
    },

    updateProgressBar (currentTime) {
      if (!this.progress.getAttribute('max')) {
        this.progress.setAttribute('max', this.videoDuration)
      }
      this.progress.value = currentTime
    },

    // Revision previews

    onRevisionPreviewSelected (index) {
      this.currentIndex = index
    },

    onRevisionPreviewDropped ({ previousIndex, newIndex }) {
      const preview = this.previews[previousIndex]
      this.updateRevisionPreviewPosition({
        previousIndex,
        newIndex,
        revision: this.currentPreview.revision,
        taskId: this.currentPreview.task_id,
        previewId: preview.id
      })
        .catch(console.error)
      this.$nextTick(() => {
        this.currentIndex = newIndex + 1
      })
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
      } else if (this.isPicture) {
        this.pause()
        this.isDrawing = false
        this.refreshCanvas()
        setTimeout(this.previewViewer.resetPicture, 10)
        if (this.comparisonViewer) {
          setTimeout(this.comparisonViewer.resetPicture, 20)
        }
      }
      this.setDefaultComparisonTaskType()
    },

    'currentPreview.revision' () {
      this.currentIndex = 1
    },

    previewToCompareId () {
      this.$nextTick(() => {
        if (this.comparisonViewer) this.comparisonViewer.pause()
        this.previewToCompare = this.previewFileMap[this.previewToCompareId]
        this.setCurrentTime(0)
        if (this.isComparing) {
          this.pause()
        }
      })
    },

    taskTypeId () {
      this.resetPreviewFileMap()
      this.setDefaultComparisonPreview()
    },

    isComparing () {
      if (!this.isComparing) {
        if (this.comparisonViewer) this.comparisonViewer.pause()
        this.taskTypeId = ''
        this.previewToCompareId = ''
      }
      this.$nextTick(() => {
        this.fixCanvasSize(this.getCurrentPreviewDimensions())
      })
    },

    isDrawing () {
      if (this.fabricCanvas) this.fabricCanvas.isDrawingMode = this.isDrawing
    },

    isOrdering () {
      this.$nextTick(() => {
        this.fixCanvasSize(this.getCurrentPreviewDimensions())
        this.previewViewer.resetVideo()
        this.previewViewer.resetPicture()
      })
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

.annotation-movie {
  margin: auto;
  width: 100%;
}

.time-indicator {
  color: $light-grey;
  padding-left: 0.8em;
  margin-right: 0;
}

.preview-viewer {
  width: 100%;
  text-align: center;
  background: #36393F;
}

.buttons {
  background: $dark-grey-2;
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
  background: $dark-grey-2;
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

.preview-viewer {
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
    display: flex;
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

.revision-previews {
  overflow-x: auto;
  height: 140px;
  padding-left: 10px;
  padding-top: 10px;
  box-shadow: inset 0px 0px 10px 1px #0008;
  align-items: flex-start;

  .flexrow-item.revision-preview {
    margin-right: 0px;
  }
}

.comparision-preview-viewer,
.preview-viewer {
  flex: 1 1 0;
}

.separator {
  background: $dark-grey-2;
}
</style>
