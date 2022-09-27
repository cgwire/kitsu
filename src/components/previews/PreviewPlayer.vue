<template>
<div ref="container" class="preview-player dark" tabindex="-1">
  <div
    class="preview"
    :style="{height: defaultHeight + 'px'}"
  >
    <div class="flexrow filler">
      <div class="preview-container filler" ref="preview-container">
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
        <div class="viewers">
          <preview-viewer
            ref="preview-viewer"
            name="player1"
            class="preview-viewer"
            :big="big"
            :default-height="defaultHeight"
            :full-screen="fullScreen"
            :is-hd="isHd"
            :is-comparing="isComparing && isComparisonEnabled"
            :is-muted="isMuted"
            :is-ordering="isOrdering"
            :is-repeating="isRepeating"
            :light="light"
            :preview="currentPreview"
            @duration-changed="changeMaxDuration"
            @play-ended="pause"
            @size-changed="fixCanvasSize"
            @frame-update="updateFrame"
            @video-end="onVideoEnd"
          />

          <preview-viewer
            ref="comparison-preview-viewer"
            name="player2"
            class="comparison-preview-viewer"
            :big="big"
            :default-height="defaultHeight"
            :full-screen="fullScreen"
            :is-comparing="isComparing && isComparisonEnabled"
            :is-muted="true"
            :is-repeating="isRepeating"
            :light="light"
            :preview="previewToCompare"
            v-show="isComparing && previewToCompare"
          />
        </div>
      </div>

      <task-info
        name="task-info"
        ref="task-info-player"
        :class="{
          'flexrow-item': true,
          'task-info-column': true,
          'hidden': isCommentsHidden
        }"
        :task="task"
        :is-preview="false"
        :current-time-raw="currentTimeRaw"
        :current-parent-preview="currentPreview"
        @comment-added="$emit('comment-added')"
        @time-code-clicked="timeCodeClicked"
      />
    </div>

  </div>
  <div class="button-bar" ref="button-bar">
    <video-progress
      ref="progress"
      class="video-progress pull-bottom"
      :annotations="annotations"
      :frame-duration="frameDuration"
      :nb-frames="nbFrames"
      :width="width"
      :handle-in="-1"
      :handle-out="-1"
      @start-scrub="$refs['button-bar'].classList.add('unselectable')"
      @end-scrub="$refs['button-bar'].classList.remove('unselectable')"
      @progress-changed="onProgressChanged"
      v-show="isMovie"
    />

    <div class="buttons flexrow pull-bottom" ref="buttons">
      <div class="left flexrow" v-if="isMovie || isSound">
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
      </div>

      <div class="left flexrow" v-if="isMovie">
        <button-simple
          :active="isRepeating"
          :title="$t('playlists.actions.looping')"
          icon="repeat"
          @click="onRepeatClicked"
          v-if="!light || fullScreen"
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
          v-if="fullScreen"
        >
        /
        </span>
        <span
          class="flexrow-item time-indicator"
          :title="$t('playlists.actions.max_duration')"
          v-if="fullScreen"
        >
         {{ maxDuration }}
        </span>

        <div
          class="flexrow-item time-indicator mr1"
          :title="$t('playlists.actions.frame_number')"
        >
          ({{ currentFrame }} / {{ (nbFrames + '').padStart(3, '0') }})
        </div>
      </div>

      <div class="flexrow flexrow-item">
        <button-simple
          class="ml1"
          :active="isComparing"
          icon="compare"
          :title="$t('playlists.actions.split_screen')"
          @click="onCompareClicked"
          v-if="taskTypeOptions.length > 0 && isComparisonEnabled"
        />

        <combobox
          class="comparison-combobox dark"
          :options="taskTypeOptions"
          :is-dark="true"
          :thin="true"
          v-model="taskTypeId"
          v-if="isComparing && (!light || isComparisonEnabled)"
        />
        <combobox
          class="comparison-combobox dark"
          :options="previewFileOptions"
          :is-dark="true"
          :thin="true"
          v-model="previewToCompareId"
          v-if="isComparing && (!light || isComparisonEnabled)"
        />
      </div>

      <div class="filler"></div>

      <div
        class="entity-name mr1"
        v-if="fullScreen && task"
      >
        {{ task.entity_name }}
      </div>

      <div
        class="separator"
        v-if="fullScreen"
      >
      </div>

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

          <button-simple
            class="button playlist-button flexrow-item"
            :title="$t('playlists.actions.comments')"
            @click="onCommentClicked"
            icon="comment"
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
          :is-assigned="isAssigned"
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
          v-if="lastPreviewFiles.length > 1 && fullScreen"
        >
        </div>

        <button-simple
          class="flexrow-item"
          :title="$t('playlists.actions.' + (isHd ? 'switch_ld' : 'switch_hd'))"
          :text="isHd ? 'HD' : 'LD'"
          @click="isHd = !isHd"
          v-if="fullScreen && isMovie"
        />

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

  <!-- used only for picture saving purpose, it is not displayed -->
  <canvas id="annotation-snapshot" ref="annotation-snapshot">
  </canvas>
  <canvas id="resize-annotation-canvas" ref="resize-annotation-canvas">
  </canvas>
  <!-- end -->
</div>
</template>

<script>
import { fabric } from 'fabric'
import { mapGetters, mapActions } from 'vuex'
import { formatFrame, formatTime, roundToFrame, floorToFrame } from '@/lib/video'
import localPreferences from '@/lib/preferences'

import { annotationMixin } from '@/components/mixins/annotation'
import { fullScreenMixin } from '@/components/mixins/fullscreen'
import { domMixin } from '@/components/mixins/dom'

import {
  ArrowUpRightIcon,
  DownloadIcon
} from 'vue-feather-icons'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import BrowsingBar from '@/components/previews/BrowsingBar'
import ColorPicker from '@/components/widgets/ColorPicker'
import Combobox from '@/components/widgets/Combobox'
import PencilPicker from '@/components/widgets/PencilPicker'
import PreviewViewer from '@/components/previews/PreviewViewer'
import RevisionPreview from '@/components/previews/RevisionPreview'
import VideoProgress from '@/components/previews/VideoProgress'
const TaskInfo = () => import('@/components/sides/TaskInfo')

export default {
  name: 'preview-player',
  mixins: [annotationMixin, domMixin, fullScreenMixin],

  components: {
    ArrowUpRightIcon,
    VideoProgress,
    ButtonSimple,
    BrowsingBar,
    ColorPicker,
    Combobox,
    DownloadIcon,
    PencilPicker,
    PreviewViewer,
    RevisionPreview,
    TaskInfo
  },

  props: {
    big: {
      type: Boolean,
      default: false
    },
    entityPreviewFiles: {
      type: Object,
      default: () => {}
    },
    isAssigned: {
      type: Boolean,
      default: false
    },
    lastPreviewFiles: {
      type: Array,
      default: () => []
    },
    light: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    previews: {
      type: Array,
      default: () => []
    },
    task: {
      type: Object,
      default: () => {}
    },
    taskTypeMap: {
      type: Map,
      default: () => new Map()
    },
    extraWide: {
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
      isCommentsHidden: true,
      isComparing: false,
      isDrawing: false,
      isHd: false,
      isLoading: false,
      isMuted: false,
      isPlaying: false,
      isOrdering: false,
      isRepeating: false,
      isTyping: false,
      maxDuration: '00:00.000',
      pencil: 'big',
      pencilPalette: ['big', 'medium', 'small'],
      previewToCompare: null,
      previewToCompareId: null,
      taskTypeId:
        this.entityPreviewFIles
          ? Object.keys(this.entityPreviewFiles)[0]
          : null,
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
    this.initPreferences()
    if (this.isSound || this.is3DModel || this.isFile) {
      this.fixCanvasSize({ width: 0, height: 0 })
    }
  },

  beforeDestroy () {
    this.endAnnotationSaving()
    this.removeEvents()
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'isCurrentUserArtist',
      'organisation',
      'user'
    ]),

    // Elements

    container () {
      return this.$refs.container
    },

    comparisonViewer () {
      return this.$refs['comparison-preview-viewer']
    },

    canvasWrapper () {
      return this.$refs['canvas-wrapper']
    },

    previewViewer () {
      return this.$refs['preview-viewer']
    },

    previewContainer () {
      return this.$refs['preview-container']
    },

    progress () {
      return this.$refs.progress
    },

    // Utils

    frameNumber () {
      let frameNumber = this.currentTimeRaw / this.frameDuration
      if (frameNumber >= this.nbFrames) {
        frameNumber = this.nbFrames
      }
      return Math.round(frameNumber)
    },

    currentFrame () {
      return formatFrame(this.frameNumber + 1)
    },

    currentPreview () {
      if (
        this.previews &&
        this.previews.length > 0 &&
        this.currentIndex - 1 < this.previews.length
      ) {
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
        return screen.width > 1300 && (!this.light || this.big)
          ? bigHeight
          : 200
      }
    },

    fps () {
      return this.currentProduction.fps
        ? parseFloat(this.currentProduction.fps)
        : 24
    },

    frameDuration () {
      return Math.round((1 / this.fps) * 10000) / 10000
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
      return ['glb', 'gltf'].includes(this.extension)
    },

    isSound () {
      return ['mp3', 'wav'].includes(this.extension)
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
          return previewFiles.length > 0 && this.taskTypeMap.get(taskTypeId)
        })
        .map(taskTypeId => {
          const taskType = this.taskTypeMap.get(taskTypeId)
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
    },

    isComparisonEnabled () {
      return this.fullScreen || this.extraWide
    },

    nbFrames () {
      return Math.round(this.videoDuration * this.fps)
    }
  },

  methods: {
    ...mapActions([
      'refreshPreview',
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

    updateFrame (frameNumber) {
      const time = frameNumber * this.frameDuration
      if (this.frameNumber !== frameNumber) {
        this.progress.updateProgressBar(frameNumber)
        this.currentTimeRaw = time
        this.currentTime = this.formatTime(this.currentTimeRaw)
        this.$emit('time-updated', time)
        if (!this.isPlaying) this.loadAnnotation()
      }
    },

    initPreferences () {
      const isRepeating =
        localPreferences.getBoolPreference('player:repeating')
      this.isRepeating = isRepeating
      this.isHd = this.organisation
        ? this.organisation.hd_by_default === 'true'
        : false
    },

    focus () {
      this.$refs.container.focus()
    },

    timeCodeClicked (
      { versionRevision, minutes, seconds, milliseconds, frame }
    ) {
      const preview = this.lastPreviewFiles.find(
        p => p.revision === parseInt(versionRevision)
      )
      if (!preview) {
        return
      }
      this.changeCurrentPreview(preview)
      const time = parseInt(minutes) * 60 +
        parseInt(seconds) +
        parseInt(milliseconds) / 1000
      const frameNumber = Math.round(time / this.frameDuration)
      setTimeout(this.setCurrentFrame, 20, frameNumber)
    },

    // Video

    configureVideo () {
      this.isPlaying = false
      this.isMuted = false
      this.isRepeating = false
    },

    changeMaxDuration (duration) {
      if (duration) {
        duration = floorToFrame(duration, this.fps)
        this.videoDuration = duration
        this.maxDuration =
          this.formatTime(this.videoDuration - this.frameDuration)
      } else {
        this.maxDuration = '00:00.000'
        this.videoDuration = 0
      }
    },

    getCurrentTime () {
      const currentTimeRaw = this.previewViewer.getCurrentTimeRaw()
      return roundToFrame(currentTimeRaw, this.fps) || 0
    },

    play () {
      this.isPlaying = true
      this.isDrawing = false
      if (this.previewViewer) {
        this.clearCanvas()
        if (this.currentFrame >= this.nbFrames - 1) {
          this.previewViewer.setCurrentFrame(1)
          this.syncComparisonViewer()
        }
        this.previewViewer.play()
        if (this.comparisonViewer && this.isComparing) {
          this.comparisonViewer.play()
        }
      }
    },

    pause () {
      if (this.isPlaying) {
        this.isPlaying = false
        if (this.previewViewer) this.previewViewer.pause()
        if (this.comparisonViewer) this.comparisonViewer.pause()
        this.syncComparisonViewer()
      }
    },

    goPreviousFrame () {
      this.clearCanvas()
      this.previewViewer.goPreviousFrame()
      this.syncComparisonViewer()
    },

    goNextFrame () {
      this.clearCanvas()
      this.previewViewer.goNextFrame()
      this.syncComparisonViewer()
    },

    syncComparisonViewer () {
      if (this.comparisonViewer && this.isComparing) {
        // Dirty fix: add a missing frame to the comparaison video
        this.comparisonViewer.setCurrentTimeRaw(
          this.previewViewer.getCurrentTimeRaw() + this.frameDuration
        )
      }
    },

    onProgressChanged (frameNumber) {
      if (frameNumber !== this.frameNumber) {
        this.clearCanvas()
        this.setCurrentFrame(frameNumber)
      }
    },

    onVideoEnd () {
      this.isPlaying = false
      if (this.isRepeating) {
        this.setCurrentFrame(1)
        this.syncComparisonViewer()
        this.$nextTick(() => {
          this.play()
        })
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
      localPreferences.setPreference('player:repeating', this.isRepeating)
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
      const dimensions = this.getDimensions()
      const width = dimensions.width
      const height = dimensions.height
      this.fabricCanvas = new fabric.Canvas('annotation-canvas', {
        fireRightClick: true,
        width: width,
        height: height
      })
      this.configureCanvas()
    },

    fixCanvasSize (dimensions) {
      const width = dimensions.width
      const height = dimensions.height
      if (this.fabricCanvas) {
        this.fabricCanvas.setDimensions({ width, height })
        this.fabricCanvas.width = width
        this.fabricCanvas.height = height
        const containerWidth = this.previewContainer.offsetWidth
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
      this.endAnnotationSaving()
      this.documentSetFullScreen(this.container)
      this.container.setAttribute('data-fullscreen', !!true)
      this.fullScreen = true
      this.$nextTick(() => {
        this.fixCanvasSize(this.getCurrentPreviewDimensions())
        // Needed to avoid fullsceen button to be called with space bar.
        this.clearFocus()
        this.previewViewer.resize()
      })
    },

    exitFullScreen () {
      this.endAnnotationSaving()
      this.documentExitFullScreen()
      this.container.setAttribute('data-fullscreen', !!false)
      this.isComparing = false
      this.fullScreen = false
      this.isCommentsHidden = true
      this.fixCanvasSize(this.getCurrentPreviewDimensions())
      this.$nextTick(() => {
        // Needed to avoid fullsceen button to be called with space bar.
        this.clearFocus()
        this.previewViewer.resize()
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
        this.isCommentsHidden = true
        this.endAnnotationSaving()
        this.$nextTick(() => {
          this.previewViewer.resetVideo()
          this.previewViewer.resetPicture()
          this.fixCanvasSize(this.getCurrentPreviewDimensions())
          this.clearFocus()
          this.$nextTick(() => {
            this.loadAnnotation()
          })
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
        const preview = this.currentPreview
        if (!this.notSaved) {
          this.startAnnotationSaving(preview, annotations)
        }
      }
    },

    loadAnnotation (annotation) {
      let currentTime = 0
      if (!annotation) {
        currentTime = roundToFrame(this.currentTimeRaw, this.fps)
        annotation = this.getAnnotation(currentTime)
        if (!annotation) {
          if (!this.isMovie) {
            console.warn(
              'Annotations are malformed or empty.'
            )
          }
          return
        }
      }

      if (!this.fabricCanvas) this.setupFabricCanvas()
      if (this.isMovie && this.previewViewer && this.isPlaying) {
        this.previewViewer.pause()
      }
      this.clearCanvas()
      this.loadSingleAnnotation(annotation)
    },

    reloadAnnotations () {
      this.annotations = []
      if (this.currentPreview.annotations) {
        const annotations = []
        if (this.currentPreview.annotations.forEach) {
          this.currentPreview.annotations.forEach(
            a => annotations.push({ ...a })
          )
        }
        this.annotations = annotations.sort((a, b) => {
          return a.time < b.time
        }) || []
      } else {
        this.annotations = []
      }
      return this.annotations
    },

    getFileFromCanvas (canvas, filename) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          const file = new File(
            [blob],
            filename,
            { type: 'image/png', lastModified: new Date().getTime() }
          )
          return resolve(file)
        })
      })
    },

    extractVideoFrame (canvas, frameNumber) {
      return new Promise(resolve => {
        this.setCurrentFrame(frameNumber)
        this.$nextTick(() => {
          setTimeout(() => {
            this.previewViewer.extractFrame(canvas, frameNumber)
            resolve()
          }, 500)
        })
      })
    },

    copyAnnotationCanvas (canvas, annotation) {
      return new Promise(resolve => {
        this.clearCanvas()
        this.loadSingleAnnotation(annotation)
        setTimeout(() => {
          const context = canvas.getContext('2d')
          const scaleRatio = canvas.width / this.fabricCanvas.width
          const tmpSource = document.getElementById('resize-annotation-canvas')
          const tmpCanvas = new fabric.Canvas('resize-annotation-canvas', {
            width: canvas.width,
            height: canvas.height
          })
          this.fabricCanvas.getObjects().find(obj => {
            if (obj._objects) {
              obj._objects.forEach(obj => {
                tmpCanvas.add(obj)
                obj.strokeWidth = 8 / scaleRatio
              })
            } else {
              tmpCanvas.add(obj)
              obj.strokeWidth = 8 / scaleRatio
            }
          })
          tmpCanvas.setZoom(scaleRatio)
          setTimeout(() => {
            context.drawImage(tmpSource, 0, 0, canvas.width, canvas.height)
            setTimeout(() => {
              tmpCanvas.dispose()
            }, 100)
            return resolve()
          }, 100)
        }, 100)
      })
    },

    async extractAnnotationSnapshots () {
      const currentFrame = this.currentFrame
      const annotations = this.annotations.sort((a, b) => b.time < a.time)
      const files = []
      let index = 1
      for (const annotation of annotations) {
        const canvas = document.getElementById('annotation-snapshot')
        const filename = `annotation ${index}.png`
        const frameNumber =
          roundToFrame(annotation.time, this.fps) / this.frameDuration
        await this.extractVideoFrame(canvas, frameNumber)
        await this.copyAnnotationCanvas(canvas, annotation)
        const file = await this.getFileFromCanvas(canvas, filename)
        files.push(file)
        index++
      }
      this.previewViewer.setCurrentFrame(currentFrame - 1)
      this.$nextTick(() => {
        this.clearCanvas()
      })
      return files
    },

    // Events

    onKeyDown (event) {
      if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        if (event.keyCode === 46 || event.keyCode === 8) {
          this.deleteSelection()
        } else if (event.keyCode === 37) { // arrow left
          this.goPreviousFrame()
        } else if (event.keyCode === 39) { // arrow right
          this.goNextFrame()
        } else if (event.keyCode === 32) { // space
          let styles
          const playlistModal = document.getElementById('temp-playlist-modal')
          if (playlistModal) styles = window.getComputedStyle(playlistModal)
          if (styles && styles.display === 'none') {
            this.onPlayPauseClicked()
            this.pauseEvent(event)
          }
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
        } else if (event.altKey && event.keyCode === 74) { // alt+j
          this.onPreviousClicked()
        } else if (event.altKey && event.keyCode === 75) { // alt+k
          this.onNextClicked()
        } else if (event.ctrlKey && event.keyCode === 67) { // ctrl + c
          this.copyAnnotations()
        } else if (event.ctrlKey && event.keyCode === 86) { // ctrl + v
          this.pasteAnnotations()
        } else if (event.keyCode === 27) { // Esc
          if (this.fullScreen) {
            this.onFullScreenChange()
          }
        }
      }
    },

    onCommentClicked () {
      const height = this.previewContainer.offsetHeight
      this.isCommentsHidden = !this.isCommentsHidden
      this.$nextTick(() => {
        if (!this.isCommentsHidden) {
          this.$refs['task-info-player'].$el.style.height = `${height}px`
        }
        if (this.$refs['task-info-player']) {
          this.$refs['task-info-player'].focusCommentTextarea()
        }
        this.previewViewer.resetVideo()
        this.previewViewer.resetPicture()
        this.fixCanvasSize(this.getCurrentPreviewDimensions())
        this.endAnnotationSaving()
        this.$nextTick(() => {
          this.reloadAnnotations()
          this.loadAnnotation()
        })
      })
    },

    configureEvents () {
      window.addEventListener('keydown', this.onKeyDown, false)
      window.addEventListener('beforeunload', this.onWindowsClosed)
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
      window.removeEventListener('beforeunload', this.onWindowsClosed)
      this.container.removeEventListener(
        'fullscreenchange', this.onFullScreenChange, false)
      this.container.removeEventListener(
        'mozfullscreenchange', this.onFullScreenChange, false)
      this.container.removeEventListener(
        'MSFullscreenChange', this.onFullScreenChange, false)
      this.container.removeEventListener(
        'webkitfullscreenchange', this.onFullScreenChange, false)
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
      } else if (this.isMovie && this.$options.scrubbing) {
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
      if (event.button > 1 && this.isPicture && this.fullScreen) {
        this.$options.loupe = true
        this.previewViewer.showLoupe()
        const width = this.canvasWrapper.style.width
        const height = this.canvasWrapper.style.height
        this.previewViewer.updateLoupePosition(event, { width, height })
      } else if (event.button > 1 && this.isMovie) {
        this.$options.scrubbing = true
        this.$options.scrubStartX = event.e.clientX
        this.$options.scrubStartTime = Number(this.currentTimeRaw)
      }
      return false
    },

    onCanvasReleased (event) {
      if (this.isPicture && this.$options.loupe) {
        this.previewViewer.hideLoupe()
        this.$options.loupe = false
      } else if (this.isMovie && this.$options.scrubbing) {
        this.$options.scrubbing = false
      }
      return false
    },

    // Video progress

    setCurrentFrame (frameNumber) {
      if (frameNumber !== this.frameNumber) {
        this.previewViewer.setCurrentFrame(frameNumber)
        this.syncComparisonViewer()
        setTimeout(this.syncComparisonViewer(), this.frameDuration)
      }
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
    },

    isValidPreviewModification (previewId, updatedAt) {
      return (
        !this.notSaved &&
        this.currentPreview &&
        previewId === this.currentPreview.id &&
        !this.isWriting(updatedAt)
      )
    }
  },

  watch: {
    currentPreview () {
      this.endAnnotationSaving()
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
      } else if (this.isSound || this.isFile || this.is3DModel) {
        this.fixCanvasSize({ width: 0, height: 0 })
      }
      this.$nextTick(() => {
        if (this.previewViewer && this.previewViewer.isBroken) {
          this.clearCanvas()
        }
      })
      this.setDefaultComparisonTaskType()
    },

    'currentPreview.revision' () {
      this.endAnnotationSaving()
      this.currentIndex = 1
    },

    previewToCompareId () {
      this.$nextTick(() => {
        const currentFrame = this.currentFrame
        if (this.comparisonViewer) this.comparisonViewer.pause()
        this.previewToCompare = this.previewFileMap[this.previewToCompareId]
        if (this.isComparing) {
          this.setCurrentFrame(currentFrame - 1)
          setTimeout(this.syncComparisonViewer, 200)
          this.pause()
        }
      })
    },

    taskTypeId () {
      this.resetPreviewFileMap()
      this.setDefaultComparisonPreview()
    },

    isComparing () {
      this.endAnnotationSaving()
      if (!this.isComparing) {
        if (this.comparisonViewer) this.comparisonViewer.pause()
        this.taskTypeId = ''
        this.previewToCompareId = ''
      }
      this.$nextTick(() => {
        this.fixCanvasSize(this.getCurrentPreviewDimensions())
      })
    },

    light () {
      this.endAnnotationSaving()
      this.previewViewer.resize()
      this.$nextTick(() => {
        this.fixCanvasSize(this.getCurrentPreviewDimensions())
      })
    },

    extraWide () {
      this.endAnnotationSaving()
      this.previewViewer.resize()
      this.$nextTick(() => {
        this.fixCanvasSize(this.getCurrentPreviewDimensions())
      })
    },

    isDrawing () {
      if (this.fabricCanvas) this.fabricCanvas.isDrawingMode = this.isDrawing
      else this.endAnnotationSaving()
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
    },

    isCommentsHidden () {
      this.$nextTick(() => {
        this.fixCanvasSize(this.getCurrentPreviewDimensions())
      })
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

.entity-name {
  color: $light-grey;
}

.task-info-column {
  min-width: 450px;
  max-width: 450px;
  overflow-y: auto;
  height: 90vh;
}

.preview-container {
  position: relative;
}

.viewers {
  display: flex;
}

#resize-annotation-canvas,
#annotation-snapshot {
  display: none;
}
</style>
