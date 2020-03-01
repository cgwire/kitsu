<template>

<div
  ref="container"
  :class="{
    dark: true,
    'full-height': !isAddingShot,
    'playlist-player': true
  }"
>
  <div class="playlist-header flexrow" ref="header" v-if="!tempMode">
    <div class="flexrow-item for-client" v-if="playlist && playlist.for_client">
      {{ $t('playlists.client_playlist') }}
    </div>
    <span class="flexrow-item playlist-name">
      {{ playlist.name }}
    </span>
    <button-simple
      @click="$emit('show-add-shots')"
      class="playlist-button add-shots-button flexrow-item"
      icon="plus"
      text="Add Shots"
      v-if="isCurrentUserManager && !isAddingShot"
    />
    <button-simple
      @click="$emit('edit-clicked')"
      class="edit-button playlist-button flexrow-item"
      :title="$t('playlists.actions.rename')"
      icon="edit"
      v-if="isCurrentUserManager"
    />
    <button-simple
      @click="showDeleteModal"
      class="delete-button playlist-button flexrow-item"
      :title="$t('playlists.actions.delete')"
      icon="delete"
      v-if="isCurrentUserManager"
    />
  </div>

  <div
    class="filler flexrow video-container"
    ref="video-container"
    v-if="!isAddingShot"
  >
    <raw-video-player
      class="raw-player"
      ref="raw-player"
      :shots="shotList"
      @metadata-loaded="onMetadataLoaded"
      @shot-change="onShotChange"
      @time-update="onTimeUpdate"
      @max-duration-update="onMaxDurationUpdate"
    />
    <raw-video-player
      class="raw-player"
      ref="raw-player-comparison"
      :shots="shotListToCompare"
      v-if="isComparing"
    />
    <div class="canvas-wrapper" ref="canvas-wrapper">
      <canvas
        id="playlist-annotation-canvas"
        ref="annotation-canvas"
        class="canvas"
      >
      </canvas>
    </div>

    <task-info
      ref="task-info"
      :class="{
        'flexrow-item': true,
        'task-info-column': true,
        'hidden': isCommentsHidden
      }"
      :task="task"
      :is-preview="false"
    />
  </div>

  <div
    class="playlist-progress"
    ref="playlist-progress"
    v-if="!isAddingShot"
  >
    <div class="video-progress">
      <progress
        ref="progress"
        value="0"
        min="0"
        @click="onProgressBarClicked"
      >
        <span
          id="progress-bar"
          ref="progress-bar"
        ></span>
      </progress>
    </div>
  </div>

  <annotation-bar
    class="playlist-annotations"
    ref="playlist-annotation"
    :annotations="annotations"
    :max-duration-raw="maxDurationRaw"
    @select-annotation="loadAnnotation"
    v-if="playlist.id && !isAddingShot"
  />

  <div
    class="playlist-footer flexrow"
    ref="button-bar"
    v-if="playlist.id && !isAddingShot"
  >
    <button-simple
      class="button playlist-button flexrow-item"
      @click="onPlayClicked"
      :title="$t('playlists.actions.play')"
      icon="play"
      v-if="!isPlaying"
    />
    <button-simple
      class="button playlist-button flexrow-item"
      @click="onPlayClicked"
      :title="$t('playlists.actions.pause')"
      icon="pause"
      v-else
    />
    <span class="flexrow-item time-indicator">
      {{ currentTime }}
    </span>
    <span class="flexrow-item time-indicator">
    /

    </span>
    <span class="flexrow-item time-indicator">
      {{ maxDuration }}
    </span>
    <span class="flexrow-item time-indicator mr1">
      ({{ currentFrame }})
    </span>
    <button-simple
      class="button playlist-button flexrow-item"
      @click="onPreviousFrameClicked"
      :title="$t('playlists.actions.previous_frame')"
      icon="left"
    />
    <button-simple
      class="button playlist-button flexrow-item"
      @click="onNextFrameClicked"
      :title="$t('playlists.actions.next_frame')"
      icon="right"
    />

    <span class="flexrow-item time-indicator">
      {{ shotList.length > 0 ? playingShotIndex + 1 : 0 }}
    </span>
    <span class="flexrow-item time-indicator">
    /
    </span>
    <span class="flexrow-item time-indicator mr1">
      {{ shotList.length }}
    </span>
    <button-simple
      class="button playlist-button flexrow-item"
      @click="onPlayPreviousShotClicked"
      :title="$t('playlists.actions.previous_shot')"
      icon="back"
    />
    <button-simple
      class="playlist-button flexrow-item"
      @click="onPlayNextShotClicked"
      :title="$t('playlists.actions.next_shot')"
      icon="forward"
    />
    <button-simple
      :class="{
        'comparison-button': true,
        'flexrow-item': true,
        'playlist-button': true,
        active: isComparing
      }"
      :title="$t('playlists.actions.split_screen')"
      icon="compare"
      @click="onCompareClicked"
      v-if="taskTypeOptions"
    />
    <combobox
      class="playlist-button flexrow-item comparison-list"
      :options="taskTypeOptions"
      v-model="taskTypeToCompare"
      v-if="isComparing"
    />
    <span class="filler"></span>

    <button-simple
      class="playlist-button flexrow-item"
      icon="undo"
      :title="$t('playlists.actions.annotation_undo')"
      @click="undoLastAction"
    />

    <button-simple
      class="playlist-button flexrow-item"
      :title="$t('playlists.actions.annotation_redo')"
      icon="redo"
      @click="redoLastAction"
    />

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
    <button-simple
      :class="{
        'playlist-button': true,
        'flexrow-item': true,
        active: isDrawing
      }"
      :title="$t('playlists.actions.annotation')"
      @click="onAnnotateClicked"
      icon="pencil"
    />
    <button-simple
      class="playlist-button flexrow-item"
      icon="remove"
      :title="$t('playlists.actions.annotation_delete')"
      @click="onDeleteClicked"
    />
    <div class="separator"></div>
    <button-simple
      class="playlist-button flexrow-item"
      :title="$t('playlists.actions.change_task_type')"
      icon="layers"
      @click="showTaskTypeModal"
    />
    <button-simple
      class="button playlist-button flexrow-item"
      :title="$t('playlists.actions.comments')"
      @click="onCommentClicked"
      icon="comment"
    />
    <button-simple
      class="playlist-button flexrow-item"
      :title="$t('playlists.actions.shotlist')"
      @click="onFilmClicked"
      icon="film"
    />

    <div
      class="flexrow-item playlist-button"
      style="position: relative"
      v-if="!tempMode"
    >
      <a
        :class="{
          'dl-button': true,
          'zip-button': true,
          hidden: isDlButtonsHidden
        }"
        :href="zipDlPath"
      >
        {{ $t('playlists.download_zip') }}
      </a>
      <span
        :class="{
          'dl-button': true,
          'mp4-button': true,
          hidden: isDlButtonsHidden
        }"
        @click="onBuildClicked"
        v-if="isCurrentUserManager"
      >
        {{ $t('playlists.build_mp4') }}
      </span>
      <div
        :class="{
          'build-list': true,
          hidden: isDlButtonsHidden
        }"
      >
        <span v-if="!playlist.build_jobs || playlist.build_jobs.length === 0">
        {{ $t('playlists.no_build') }}
        </span>
        <div
          v-else
        >
          <div class="build-title">
            {{ $t('playlists.available_build') }}
          </div>
          <div
            class="flexrow"
            :key="job.id"
            v-for="job in playlist.build_jobs"
          >
            <a
              class="flexrow-item"
              :href="getBuildPath(job)"
            >
              {{ formatDate(job.created_at) }}
            </a>
            <span class="filler"></span>
            <spinner
              class="build-spinner"
              v-if="job.status === 'running'"
            />
            <button
              class="delete-job-button"
              @click="onRemoveBuildJob(job)"
              v-else
            >
              x
            </button>
          </div>
        </div>
      </div>
      <button-simple
        class="playlist-button"
        :title="$t('playlists.actions.download')"
        icon="download"
        @click="toggleDlButtons"
      />
    </div>

    <button-simple
      class="button playlist-button flexrow-item"
      :title="$t('playlists.actions.fullscreen')"
      @click="onFullscreenClicked"
      icon="maximize"
      v-if="isFullScreenEnabled"
    />
  </div>

  <div
    :class="{
      'playlisted-shots': true,
      flexrow: true,
      hidden: isShotsHidden
    }"
    ref="playlisted-shots"
    v-if="playlist.id"
  >
    <spinner class="spinner" v-if="isLoading" />
    <div
      class="flexrow-item has-text-centered playlisted-wrapper"
      :key="shot.id"
      v-for="(shot, index) in shotList"
      v-else
    >
      <playlisted-shot
        :ref="'shot-' + index"
        :index="index"
        :shot="shot"
        :is-playing="playingShotIndex === index"
        @play-click="playShot"
        @remove-shot="removeShot"
        @preview-changed="onPreviewChanged"
        @shot-dropped="onShotDropped"
      />
    </div>
  </div>

  <delete-modal
    :active="modals.delete"
    :is-loading="loading.deletePlaylist"
    :is-error="errors.deletePlaylist"
    :text="deleteText"
    :error-text="$t('playlists.delete_error')"
    @confirm="confirmRemovePlaylist"
    @cancel="hideDeleteModal"
  />

  <select-task-type-modal
    :active="modals.taskType"
    :task-type-list="shotTaskTypes"
    @confirm="confirmChangeTaskType"
    @cancel="hideTaskTypeModal"
  />

</div>
</template>

<script>
/*
 * This modules manages all the options available while playing a playlist.
 * It is made to work with a single playlist.
 */
import moment from 'moment-timezone'
import { mapActions, mapGetters } from 'vuex'
import { fabric } from 'fabric'

import { roundToFrame } from '../../../lib/video'
import AnnotationBar from './AnnotationBar'
import ButtonSimple from '../../widgets/ButtonSimple'
import ColorPicker from '../../widgets/ColorPicker'
import Combobox from '../../widgets/Combobox'
import DeleteModal from '../../modals/DeleteModal'
import PencilPicker from '../../widgets/PencilPicker'
import PlaylistedShot from './PlaylistedShot'
import RawVideoPlayer from './RawVideoPlayer'
import SelectTaskTypeModal from '../../modals/SelectTaskTypeModal'
import Spinner from '../../widgets/Spinner'
import TaskInfo from '../../sides/TaskInfo'

import { annotationMixin } from '../../previews/annotation_mixin'

export default {
  name: 'playlist-player',
  mixins: [annotationMixin],

  components: {
    AnnotationBar,
    ButtonSimple,
    ColorPicker,
    Combobox,
    DeleteModal,
    PencilPicker,
    PlaylistedShot,
    RawVideoPlayer,
    SelectTaskTypeModal,
    Spinner,
    TaskInfo
  },

  props: {
    playlist: {
      type: Object,
      default: () => {}
    },
    shots: {
      type: Object,
      default: () => {}
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isAddingShot: {
      type: Boolean,
      default: false
    },
    tempMode: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      annotations: [],
      color: '#ff3860',
      currentTime: '00:00.00',
      currentTimeRaw: 0,
      fabricCanvas: null,
      isDlButtonsHidden: true,
      isCommentsHidden: true,
      isComparing: false,
      isDrawing: false,
      isShowingPalette: false,
      isShowingPencilPalette: false,
      isPlaying: false,
      isShotsHidden: false,
      maxDuration: '00:00.00',
      maxDurationRaw: 0,
      palette: ['#ff3860', '#008732', '#5E60BA', '#f57f17'],
      pencil: 'big',
      pencilPalette: ['big', 'medium', 'small'],
      playingShotIndex: 0,
      shotList: [],
      shotListToCompare: [],
      task: null,
      taskTypeOptions: [],
      taskTypeToCompare: null,
      modals: {
        edit: false,
        delete: false,
        taskType: false
      },
      loading: {
        playlists: false,
        editPlaylist: false,
        deletePlaylist: false
      },
      errors: {
        playlists: false,
        editPlaylist: false,
        deletePlaylist: false
      },
      forClientOptions: [
        { label: this.$t('playlists.for_client'), value: 'true' },
        { label: this.$t('playlists.for_studio'), value: 'false' }
      ]
    }
  },

  mounted () {
    this.shotList = Object.values(this.shots)
    this.updateProgressBar()
    this.$nextTick(() => {
      window.addEventListener('keydown', this.onKeyDown, false)
      window.addEventListener('resize', this.onWindowResize)
      if (!this.$el.nomousemove) this.$el.onmousemove = this.onMouseMove
      this.setupFabricCanvas()
      this.resetCanvas()
    })
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onWindowResize)
    this.$el.onmousemove = null
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'taskMap',
      'taskTypeMap',
      'shotTaskTypes',
      'user'
    ]),

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

    zipDlPath () {
      return `/api/data/playlists/${this.playlist.id}/download/zip`
    },

    canvas () {
      return this.$refs['canvas-wrapper']
    },

    container () {
      return this.$refs.container
    },

    currentFrame () {
      return `${Math.floor(this.currentTimeRaw * this.fps)}`.padStart(3, '0')
    },

    fps () {
      return this.currentProduction.fps || 24
    },

    rawPlayer () {
      return this.$refs['raw-player']
    },

    rawPlayerComparison () {
      return this.$refs['raw-player-comparison']
    },

    progress () {
      return this.$refs.progress
    },

    progressBar () {
      return this.$refs['progress-bar']
    },

    progressCursor () {
      return this.$refs['progress-cursor']
    },

    video () {
      return this.$refs.movie
    },

    deleteText () {
      if (this.playlist) {
        return this.$t('playlists.delete_text', { name: this.playlist.name })
      } else {
        return ''
      }
    },

    timezone () {
      return this.user.timezone || moment.tz.guess()
    },

    nbCommentedShots () {
      const isCommentedByClient = shot => shot.is_commented
      return this.shotList.filter(isCommentedByClient).length
    }
  },

  methods: {
    ...mapActions([
      'changePlaylistType',
      'deletePlaylist',
      'editPlaylist',
      'removeBuildJob',
      'runPlaylistBuild'
    ]),

    getBuildPath (job) {
      return `/api/data/playlists/${this.playlist.id}/jobs/${job.id}/build/mp4`
    },

    formatDate (creationDate) {
      const date = moment.tz(creationDate, 'UTC').tz(this.timezone)
      return date.format('YYYY-MM-DD HH:mm')
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

    getTimelinePosition (time, index) {
      if (this.$refs.movie && this.progress) {
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

    displayBars () {
      if (this.$refs['button-bar']) {
        if (this.$refs.header) {
          this.$refs.header.style.display = 'flex'
          this.$refs.header.style.opacity = 1
        }
        if (this.$refs['button-bar']) {
          this.$refs['button-bar'].style.display = 'flex'
          this.$refs['button-bar'].style.opacity = 1
          this.$refs['playlist-progress'].style.display = 'flex'
          this.$refs['playlist-progress'].style.opacity = 1
        }
        this.container.style.cursor = 'default'
      }
    },

    hideBars () {
      this.$refs.header.style.opacity = 0
      this.$refs['button-bar'].style.opacity = 0
      this.$refs['playlist-progress'].style.opacity = 0
      setTimeout(() => {
        this.$refs.header.style.display = 'none'
        this.$refs['button-bar'].style.display = 'none'
        this.$refs['playlist-progress'].style.display = 'none'
        this.container.style.cursor = 'none'
      }, 500)
    },

    showDeleteModal () {
      this.modals.delete = true
    },

    hideDeleteModal () {
      this.modals.delete = false
    },

    confirmRemovePlaylist () {
      this.loading.deletePlaylist = true
      this.errors.deletePlaylist = false
      this.deletePlaylist({
        playlist: this.playlist,
        callback: (err) => {
          if (err) this.errors.deletePlaylist = true
          this.loading.deletePlaylist = false
          this.$emit('playlist-deleted')
          this.modals.delete = false
        }
      })
    },

    updateProgressBar () {
      if (this.progress) {
        const factor = this.currentTimeRaw / this.maxDurationRaw
        this.progress.value = this.currentTimeRaw
        this.progressBar.style.width = Math.floor(factor * 100) + '%'
        /*
        const progressCoordinates = this.progress.getBoundingClientRect()
        const x = progressCoordinates.width * factor + progressCoordinates.x
        this.progressCursor.style.left = Math.round(x - 7) + 'px'
        this.progressCursor.style.top = Math.round(progressCoordinates.y - 3) + 'px'
        */
      }
    },

    updateTaskPanel () {
      if (this.shotList.length > 0) {
        const shot = this.shotList[this.playingShotIndex]
        if (shot) this.task = this.taskMap[shot.preview_file_task_id]
        else this.task = null
      } else {
        this.task = null
      }
    },

    scrollToShot (index) {
      const shotEl = this.$refs['shot-' + index]
      if (shotEl && shotEl[0]) {
        const shotWidget = shotEl[0].$el
        const playlistEl = this.$refs['playlisted-shots']
        const shot = this.shotList[index]
        this.annotations = shot.preview_file_annotations || []
        if (shotWidget) {
          const margin = 30
          const rect = shotWidget.getBoundingClientRect()
          const listRect = playlistEl.getBoundingClientRect()
          const isRight = rect.right > listRect.right - margin
          const isLeft = rect.left < listRect.left - margin

          if (isLeft) {
            const scrollingRequired = rect.left - listRect.left - margin
            playlistEl.scrollLeft = playlistEl.scrollLeft + scrollingRequired
          } else if (isRight) {
            const scrollingRequired = rect.right - listRect.right + margin
            playlistEl.scrollLeft = playlistEl.scrollLeft + scrollingRequired
          }
        }
      }
    },

    scrollToRight () {
      if (this.shotList.length > 0) {
        this.scrollToShot(this.shotList.length - 1)
      }
    },

    play () {
      this.rawPlayer.play()
      if (this.isComparing) {
        this.$refs['raw-player-comparison'].play()
      }
      this.isPlaying = this.$refs['raw-player'].isPlaying
      this.hideCanvas()
      this.clearCanvas()
    },

    pause () {
      this.showCanvas()
      if (this.rawPlayer) this.rawPlayer.pause()
      if (this.isComparing) this.$refs['raw-player-comparison'].pause()
      this.isPlaying = false
    },

    playShot (shotIndex) {
      const shot = this.shotList[shotIndex]
      this.hideCanvas()
      this.clearCanvas()
      if (shot.preview_file_extension === 'mp4') {
        this.annotations = shot.preview_file_annotations || []
        this.playingShotIndex = shotIndex
        this.scrollToShot(this.playingShotIndex)
        this.rawPlayer.loadShot(shotIndex)
        if (this.isComparing) {
          this.$refs['raw-player-comparison'].loadShot(shotIndex)
        }
        if (this.isPlaying) {
          this.rawPlayer.play()
          if (this.isComparing) this.$refs['raw-player-comparison'].play()
        }
      } else {
        this.annotations = []
      }
    },

    goPreviousFrame () {
      this.clearCanvas()
      this.rawPlayer.goPreviousFrame()
      if (this.isComparing) {
        this.$refs['raw-player-comparison'].goPreviousFrame()
      }
      const annotation = this.getAnnotation(this.rawPlayer.getCurrentTime())
      if (annotation) this.loadAnnotation(annotation)
    },

    goNextFrame () {
      this.clearCanvas()
      this.rawPlayer.goNextFrame()
      if (this.isComparing) {
        this.$refs['raw-player-comparison'].goNextFrame()
      }
      const annotation = this.getAnnotation(this.rawPlayer.getCurrentTime())
      if (annotation) this.loadAnnotation(annotation)
    },

    removeShot (shot) {
      this.$emit('remove-shot', shot)
      this.$options.silent = true
      const shotIndex = this.shotList.findIndex(s => s.id === shot.id)
      this.shotList.splice(shotIndex, 1)
      setTimeout(() => {
        this.$options.silent = false
      }, 1000)
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

    isFullScreen () {
      return !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement
      )
    },

    onProgressBarClicked (e) {
      this.clearCanvas()
      var pos =
        (e.pageX - this.progress.offsetLeft) / this.progress.offsetWidth
      const currentTime = pos * this.maxDurationRaw
      this.rawPlayer.setCurrentTime(currentTime)
      if (this.isComparing) {
        this.$refs['raw-player-comparison'].setCurrentTime(currentTime)
      }
    },

    onPreviousFrameClicked () {
      this.goPreviousFrame()
    },

    onNextFrameClicked () {
      this.goNextFrame()
    },

    onPlayPreviousShotClicked () {
      this.rawPlayer.loadPreviousShot()
      if (this.isComparing) {
        this.$refs['raw-player-comparison'].loadPreviousShot()
      }
      if (this.isPlaying) this.play()
    },

    onPlayNextShotClicked () {
      this.rawPlayer.loadNextShot()
      if (this.isComparing) {
        this.$refs['raw-player-comparison'].loadNextShot()
      }
      if (this.isPlaying) this.play()
    },

    onPlayPauseClicked () {
      if (!this.isPlaying) {
        this.play()
      } else {
        this.pause()
      }
    },

    onFullscreenClicked () {
      if (this.isFullScreen()) {
        this.exitFullScreen()
      } else {
        this.setFullScreen()
      }
    },

    onKeyDown (event) {
      this.displayBars()
      if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        if (event.keyCode === 46 && this.fabricCanvas) {
          this.deleteSelection()
        } else if (event.keyCode === 37) {
          event.preventDefault()
          event.stopPropagation()
          this.goPreviousFrame()
        } else if (event.keyCode === 39) {
          event.preventDefault()
          event.stopPropagation()
          this.goNextFrame()
        } else if (event.keyCode === 32) {
          event.preventDefault()
          event.stopPropagation()
          this.onPlayPauseClicked()
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
          this.reloadAnnotations()
        }, 100)
      }
    },

    reloadAnnotations () {
      const annotations = this.annotations.map(a => ({ ...a }))
      this.annotations = []
      setTimeout(() => {
        this.annotations = annotations
        this.reloadCurrentAnnotation()
      }, 200)
    },

    onFilmClicked () {
      this.isShotsHidden = !this.isShotsHidden
      this.$nextTick(() => {
        this.resetHeight()
        this.scrollToShot(this.playingShotIndex)
      })
    },

    reloadCurrentAnnotation () {
      const annotation = this.getAnnotation(this.currentTimeRaw)
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
        setTimeout(this.reloadCurrentAnnotation, 300)
      })
    },

    onCompareClicked () {
      this.isComparing = !this.isComparing
    },

    onPlayClicked () {
      if (this.rawPlayer.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    },

    onTimeUpdate () {
      if (this.rawPlayer.currentPlayer) {
        this.currentTimeRaw = this.rawPlayer.currentPlayer.currentTime
      } else {
        this.currentTimeRaw = 0
      }
      this.currentTime = this.formatTime(this.currentTimeRaw)
      this.updateProgressBar()
    },

    onMaxDurationUpdate (duration) {
      this.maxDurationRaw = duration
      this.maxDuration = this.formatTime(duration)
      if (this.progress) {
        this.progress.setAttribute('max', this.maxDurationRaw)
      }
    },

    onMouseMove () {
      const buttonBar = this.$refs['button-bar']
      if (buttonBar && buttonBar.style.opacity !== 1) {
        this.displayBars()
      }
      const isMovieFullScreen =
        this.isFullScreen() && this.isShotsHidden && this.isCommentsHidden
      if (isMovieFullScreen) {
        if (this.timer) clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          const isMovieFullScreen =
            this.isFullScreen() && this.isShotsHidden && this.isCommentsHidden
          if (isMovieFullScreen) this.hideBars()
        }, 2000)
      }
    },

    onShotChange (shotIndex) {
      this.playingShotIndex = shotIndex
      if (this.rawPlayerComparison) {
        const comparisonIndex = this.rawPlayerComparison.playingIndex
        if (comparisonIndex < shotIndex) {
          this.rawPlayerComparison.playNext()
        } else {
          this.rawPlayerComparison.setCurrentTime(0)
          this.rawPlayerComparison.play()
        }
      }
      if (!this.$options.silent) this.scrollToShot(this.playingShotIndex)
    },

    onPreviewChanged (shot, previewFileId) {
      this.pause()
      this.$emit('preview-changed', shot, previewFileId)
      const localShot = this.shotList.find(s => s.id === shot.id)
      localShot.preview_file_id = previewFileId
      this.rawPlayer.reloadCurrentShot()
    },

    onShotDropped (info) {
      const playlistEl = this.$refs['playlisted-shots']
      const scrollLeft = playlistEl.scrollLeft

      const shotToMove = this.shotList.find(s => s.id === info.after)
      const toMoveIndex = this.shotList.findIndex(s => s.id === info.after)
      let targetIndex = this.shotList.findIndex(s => s.id === info.before)
      if (toMoveIndex >= 0 && targetIndex >= 0) {
        this.shotList.splice(toMoveIndex, 1)
        if (toMoveIndex > targetIndex) targetIndex++
        this.shotList.splice(targetIndex, 0, shotToMove)
      }

      this.$nextTick(() => {
        playlistEl.scrollLeft = scrollLeft
      })
      this.$emit('order-change', info)
    },

    resetHeight () {
      this.$nextTick(() => {
        let height = window.innerHeight - 90
        if (!this.tempMode) {
          height = this.container ? this.container.offsetHeight : 0
        }
        height -= this.$refs.header ? this.$refs.header.offsetHeight : 0
        if (this.$refs['playlist-progress']) {
          height -= this.$refs['playlist-progress'].offsetHeight
        }
        if (this.$refs['button-bar']) {
          height -= this.$refs['button-bar'].offsetHeight
        }
        if (this.$refs['playlisted-shots']) {
          height -= this.$refs['playlisted-shots'].offsetHeight
        }
        if (this.$refs['playlist-annotation']) {
          height -= this.$refs['playlist-annotation'].$el.offsetHeight
        }
        if (this.$refs['video-container']) {
          this.$refs['video-container'].style.height = `${height}px`
        }
        if (!this.isCommentsHidden) {
          this.$refs['task-info'].$el.style.height = `${height}px`
        }
        if (this.rawPlayer) this.rawPlayer.resetHeight()
        if (this.isComparing) {
          this.$refs['raw-player-comparison'].resetHeight()
        }
        this.$nextTick(() => {
          this.resetCanvas()
          this.updateProgressBar()
        })
      })
    },

    resetCanvas () {
      this.resetCanvasSize()
      this.fabricCanvas.renderAll()
      this.clearCanvas()
    },

    resetCanvasSize () {
      if (this.rawPlayer && this.fabricCanvas) {
        this.$nextTick(() => {
          if (this.$refs['canvas-wrapper']) {
            const ratio = this.rawPlayer.getVideoRatio()
            const fullWidth = this.rawPlayer.$el.offsetWidth
            const fullHeight = this.rawPlayer.$el.offsetHeight
            const width = ratio ? fullHeight * ratio : fullWidth
            if (fullWidth > width) {
              const left = Math.round((fullWidth - width) / 2)
              this.$refs['canvas-wrapper'].style.left = left + 'px'
              this.$refs['canvas-wrapper'].style.top = '0px'
              this.fabricCanvas.setDimensions({ width, height: fullHeight })
            } else {
              const height = ratio ? Math.round(fullWidth / ratio) : fullHeight
              const top = Math.round((fullHeight - height) / 2)
              this.$refs['canvas-wrapper'].style.left = '0px'
              this.$refs['canvas-wrapper'].style.top = top + 'px'
              this.fabricCanvas.setDimensions({ width: fullWidth, height })
            }
          }
        })
      }
    },

    rebuildComparisonOptions () {
      const shots = Object.values(this.shots)
      if (shots.length > 0) {
        let taskTypeIds = Object.keys(shots[0].preview_files)
        Object.values(this.shots).forEach((shot) => {
          const shotTaskTypeIds = Object.keys(shot.preview_files)
          taskTypeIds = taskTypeIds.filter(
            value => shotTaskTypeIds.includes(value)
          )
        })
        this.taskTypeOptions = taskTypeIds.map((taskTypeId) => {
          return {
            label: this.taskTypeMap[taskTypeId].name,
            value: this.taskTypeMap[taskTypeId].id
          }
        })
        if (this.taskTypeOptions.length > 0) {
          this.taskTypeToCompare = this.taskTypeOptions[0].value
        }
      } else {
        this.taskTypeOptions = []
      }
    },

    rebuildShotListToCompare () {
      if (this.taskTypeToCompare) {
        this.shotListToCompare = this.shotList.map((shot) => {
          const preview = shot.preview_files[this.taskTypeToCompare][0]
          return ({
            preview_file_id: preview.id,
            preview_file_extension: 'mp4'
          })
        })
      } else {
        this.buildShotListToCompare = []
      }
    },

    resetComparison () {
      this.rebuildShotListToCompare()
      this.$nextTick(() => {
        this.pause()
        const player = this.$refs['raw-player-comparison']
        player.loadShot(this.playingShotIndex)
        player.setCurrentTime(this.currentTimeRaw)
      })
    },

    clearCanvas () {
      if (this.fabricCanvas) {
        this.fabricCanvas.clear()
      }
    },

    onAnnotateClicked () {
      this.showCanvas()
      if (this.isDrawing) {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
      } else {
        this.fabricCanvas.isDrawingMode = true
        this.isDrawing = true
      }
    },

    showCanvas () {
      if (this.canvas) this.canvas.style.display = 'block'
    },

    hideCanvas () {
      if (this.canvas) this.canvas.style.display = 'none'
    },

    loadAnnotation (annotation) {
      this.pause()
      const currentTime = annotation.time || 0
      if (this.rawPlayer) {
        this.rawPlayer.setCurrentTime(currentTime)
        if (this.isComparing) {
          this.$refs['raw-player-comparison'].setCurrentTime(currentTime)
        }
        this.currentTimeRaw = currentTime
        this.updateProgressBar()

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
            radius: obj.radius,
            width: obj.width,
            height: obj.height,
            scaleX: obj.scaleX * scaleMultiplierX,
            scaleY: obj.scaleY * scaleMultiplierY
          }
          if (obj.type === 'path') {
            let strokeMultiplier = 1
            if (obj.canvasWidth) {
              strokeMultiplier = obj.canvasWidth / this.fabricCanvas.width
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
          }
        })
      }
    },

    saveAnnotations () {
      const currentTime = roundToFrame(this.currentTimeRaw, this.fps) || 0
      if (!this.annotations) return
      const annotation = this.getAnnotation(currentTime)
      const annotations = this.getNewAnnotations(currentTime, annotation)
      const shot = this.shotList[this.playingShotIndex]
      const preview = {
        id: shot.preview_file_id,
        task_id: shot.preview_file_task_id,
        annotations: shot.preview_file_annotations
      }
      this.$emit('annotationchanged', {
        preview: preview,
        annotations: annotations
      })
    },

    onDeleteClicked () {
      this.deleteSelection()
    },

    getAnnotation (time) {
      time = roundToFrame(time, this.fps)
      if (this.annotations) {
        return this.annotations.find(
          (annotation) => annotation.time === time
        )
      } else {
        return null
      }
    },

    toggleDlButtons () {
      this.isDlButtonsHidden = !this.isDlButtonsHidden
    },

    onBuildClicked () {
      this.runPlaylistBuild(this.playlist)
    },

    onRemoveBuildJob (job) {
      job.playlist_id = this.playlist.id
      this.removeBuildJob(job)
    },

    onMetadataLoaded (event) {
      this.$nextTick(() => {
        this.resetCanvasSize()
      })
    },

    showTaskTypeModal () {
      this.modals.taskType = true
    },

    hideTaskTypeModal () {
      this.modals.taskType = false
    },

    confirmChangeTaskType (taskTypeId) {
      this.$emit('task-type-changed', taskTypeId)
      this.modals.taskType = false
    }
  },

  watch: {
    playingShotIndex () {
      this.updateTaskPanel()
      this.resetUndoStacks()
    },

    isComparing () {
      if (this.isComparing) {
        this.resetComparison()
      }
      this.$nextTick(this.resetCanvas)
    },

    taskTypeToCompare () {
      if (this.isComparing) {
        this.resetComparison()
      }
    },

    shots () {
      const playlistEl = this.$refs['playlisted-shots']
      const scrollLeft = playlistEl ? playlistEl.scrollLeft : 0
      this.shotList = Object.values(this.shots)
      this.playingShotIndex = 0
      this.pause()
      if (this.rawPlayer) this.rawPlayer.setCurrentTime(0)
      this.currentTimeRaw = 0
      this.updateProgressBar()
      this.updateTaskPanel()
      this.rebuildComparisonOptions()
      this.clearCanvas()
      this.annotations = []
      if (this.shotList.length === 0) {
        if (this.rawPlayer) this.rawPlayer.clear()
        if (this.isComparing) {
          this.$refs['raw-player-comparison'].clear()
        }
        this.maxDurationRaw = 0
        this.maxDuration = '00:00.00'
      } else {
        if (
          this.shotList[0].preview_file_extension !== 'mp4'
        ) {
          this.$nextTick(() => {
            this.rawPlayer.loadNextShot()
          })
        }
        this.$nextTick(() => {
          if (playlistEl) playlistEl.scrollLeft = scrollLeft
        })
      }
      this.resetHeight()
      this.resetCanvas()
    },

    playlist () {
      this.forClient = Boolean(this.playlist.for_client).toString()
      this.$nextTick(() => {
        this.updateProgressBar()
        this.clearCanvas()
      })
    },

    isAddingShot () {
      this.$nextTick(() => {
        this.updateProgressBar()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.full-height {
  height: 100%;
}

.playlist-player {
  background: $dark-grey;
  display: flex;
  flex-direction: column;

  .playlist-button {
    margin: 0;
    background: $dark-grey-light;
    border: 0;
    border-radius: 0;
    color: $white-grey;

    &:hover {
      background: $dark-grey-lighter;
    }

    &.active {
      color: $green;
    }

    &.add-shots-button {
      border: 1px solid $dark-grey-strong;
      border-radius: 10px;
      margin-right: 0.5em;
    }
  }
}

.playlist-header {
  color: $white-grey;
  background: $dark-grey-light;

  .playlist-name {
    flex: 1;
    font-size: 1.5em;
    padding: 10px;
    padding-left: 1em;
  }

  .edit-button,
  .delete-button {
    height: 50px;
    width: 50px;
  }
}

.playlisted-shots,
.playlist-progress,
.playlist-footer {
  background: $dark-grey-light;
  color: $white-grey;
}

.playlisted-shots {
  border-top: 1px solid $dark-grey-strong;
  padding: 0.4em 0em 0 0.4em;
  overflow-x: auto;
  min-height: 600px;
  align-items: flex-start;
  height: 240px;
  min-height: 240px;
}

.task-info-column {
  min-width: 450px;
  max-width: 450px;
  overflow-y: auto;
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
  width: 100%;
}

.time-indicator {
  color: $light-grey;
  padding-left: 0.8em;
  margin-right: 0;
}

.video-container {
  position: relative;
}

.canvas-wrapper {
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
}

.buttons {
  height: 32px;
}

.comparison-combobox {
  margin-bottom: 0;
}

.buttons .comparison-button {
  margin-left: 1em;
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

.progress span#progress-bar {
  width: 100%;
  border-radius: 0;
  margin: 0;
  padding: 0;
  background-color: #43B581;
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

.mr1 {
  margin-right: 1em;
}

.playlist-progress {
  width: 100%;
}

.playlist-header,
.playlist-progress,
.playlist-progress {
  transition: opacity 0.5s ease
}

.progress-cursor {
  position: absolute;
  display: block;
  background-color: #43B581;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  z-index: 200;
  cursor: pointer;
}

.comparison-list,
.comparison-list p,
.comparison-list select {
  font-size: 0.8em;
}
.comparison-list select {
  height: 2.2em;
}

.dl-button {
  background: $dark-grey;
  border: 1px solid $dark-grey;
  color: $white;
  position: absolute;
  width: 180px;
  padding: 8px;

  &:hover {
    background: $dark-grey-light;
  }

  &.zip-button {
    left: -110px;
    top: -200px;
  }

  &.mp4-button {
    left: -110px;
    top: -160px;
    cursor: pointer;
  }
}

.build-list {
  background: $dark-grey;
  border: 1px solid $dark-grey;
  position: absolute;
  width: 180px;
  left: -110px;
  top: -120px;
  height: 120px;
  overflow-y: auto;
  padding: 8px;
  z-index: 300;
}

.build-title {
  margin-bottom: 0.5em;
}

.delete-job-button {
  background: transparent;
  border-radius: 50%;
  color: $light-grey-light;
  cursor: pointer;
  padding: 3px;

  &:hover {
    background: $dark-grey-light;
  }
}

.build-spinner {
  width: 15px;
  max-width: 15px;
}

.spinner {
  margin-top: 80px;
  margin-left: 1em;
}

.progress {
  width: 100px;
  height: 10px;
  margin-right: 1em;
  border-radius: 5px;
  background: $grey;

  span {
    background: $dark-purple;
    height: 10px;
    display: block;

    &.complete {
      background: $green;
    }
  }
}

.separator {
  margin: .5rem;
  &:before {
    content: '';
    border-left: 1px solid $dark-grey-lightest;
    height: .5rem;
  }
}

.annotation-tools {
  display: flex;
  align-items: stretch;
  height: 100%;
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

.for-client {
  background: $dark-purple-strong;
  border: 2px solid $dark-purple-strong;
  color: $white;
  padding: 0.3em;
  margin-left: 1em;
  margin-right: 0;
  border-radius: 5px;
}

#playlist-annotation-canvas {
  margin: auto;
}

.playlisted-wrapper {
  margin-right: 0;
}
</style>
