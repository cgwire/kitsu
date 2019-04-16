<template>

<div ref="container" class="playlist-player dark">
  <div class="playlist-header flexrow" ref="header">
    <span class="flexrow-item playlist-name">
      {{ playlist.name }}
    </span>
    <button-simple
      @click="showEditModal"
      class="edit-button playlist-button flexrow-item"
      icon="edit"
    />
    <button-simple
      @click="showDeleteModal"
      class="delete-button playlist-button flexrow-item"
      icon="delete"
    />
  </div>

  <div class="filler flexrow" ref="video-container">
    <raw-video-player
      class="raw-player"
      ref="raw-player"
      :shots="shotList"
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

  <div class="progress-cursor" ref="progress-cursor"></div>
  <div class="playlist-progress" ref="playlist-progress">
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

  <div class="playlist-footer flexrow" ref="button-bar">
    <button-simple
      class="button playlist-button flexrow-item"
      @click="onPlayClicked"
      icon="play"
      v-if="!isPlaying"
    />
    <button-simple
      class="button playlist-button flexrow-item"
      @click="onPlayClicked"
      icon="pause"
      v-else
    />
    <span class="flexrow-item time-indicator">
      {{ currentTime }}
    </span>
    <span class="flexrow-item time-indicator">
    /
    </span>
    <span class="flexrow-item time-indicator mr1">
      {{ maxDuration }}
    </span>
    <button-simple
      class="button playlist-button flexrow-item"
      @click="onPreviousFrameClicked"
      icon="left"
    />
    <button-simple
      class="button playlist-button flexrow-item"
      @click="onNextFrameClicked"
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
      icon="back"
    />
    <button-simple
      class="playlist-button flexrow-item"
      @click="onPlayNextShotClicked"
      icon="forward"
    />
    <button-simple
      :class="{
        'comparison-button': true,
        'flexrow-item': true,
        'playlist-button': true,
        active: isComparing
      }"
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
      class="button playlist-button flexrow-item"
      @click="onCommentClicked"
      icon="comment"
    />
    <button-simple
      class="button playlist-button flexrow-item"
      @click="onFilmClicked"
      icon="film"
    />
    <button-simple
      class="button playlist-button flexrow-item"
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
  >
    <div
      class="flexrow-item has-text-centered"
      :key="shot.id"
      v-for="(shot, index) in shotList"
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

  <edit-playlist-modal
    :active="modals.edit"
    :is-loading="loading.editPlaylist"
    :is-error="errors.editError"
    :playlist-to-edit="playlist"
    @cancel="hideEditModal"
    @confirm="confirmEditPlaylist"
  />

  <delete-modal
    :active="modals.delete"
    :is-loading="loading.deletePlaylist"
    :is-error="errors.deletePlaylist"
    :text="deleteText"
    :error-text="$t('playlists.delete_error')"
    @confirm="confirmRemovePlaylist"
    @cancel="hideDeleteModal"
  />
</div>
</template>

<script>
/*
 * This modules manages all the options available while playing a playlist.
 * It is made to work with a single playlist.
 */
import { mapActions, mapGetters } from 'vuex'
import { removeModelFromList } from '../../../lib/helpers'

import ButtonSimple from '../../widgets/ButtonSimple'
import Combobox from '../../widgets/Combobox'
import DeleteModal from '../../widgets/DeleteModal'
import EditPlaylistModal from '../../modals/EditPlaylistModal'
import PlaylistedShot from './PlaylistedShot'
import RawVideoPlayer from './RawVideoPlayer'
import Spinner from '../../widgets/Spinner'
import TaskInfo from '../../sides/TaskInfo'

export default {
  name: 'playlist-player',

  components: {
    ButtonSimple,
    Combobox,
    DeleteModal,
    EditPlaylistModal,
    PlaylistedShot,
    RawVideoPlayer,
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
    }
  },

  data () {
    return {
      currentTime: '00:00.00',
      currentTimeRaw: 0,
      isCommentsHidden: true,
      isComparing: false,
      isLoading: false,
      isPlaying: false,
      isShotsHidden: false,
      maxDuration: '00:00.00',
      maxDurationRaw: 0,
      playingShotIndex: 0,
      shotList: [],
      shotListToCompare: [],
      task: null,
      taskTypeOptions: [],
      taskTypeToCompare: null,
      modals: {
        edit: false,
        delete: false
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
      }
    }
  },

  mounted () {
    this.shotList = Object.values(this.shots)
    this.updateProgressBar()
    setTimeout(() => {
      window.addEventListener('keydown', this.onKeyDown, false)
      window.addEventListener('resize', this.onWindowResize)
      this.$el.onmousemove = this.onMouseMove
    }, 0)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onWindowResize)
  },

  computed: {
    ...mapGetters([
      'taskMap',
      'taskTypeMap'
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

    container () {
      return this.$refs.container
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
    }
  },

  methods: {
    ...mapActions([
      'deletePlaylist',
      'editPlaylist'
    ]),

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

    displayBars () {
      this.$refs['header'].style.display = 'flex'
      this.$refs['button-bar'].style.display = 'flex'
      this.$refs['playlist-progress'].style.display = 'flex'
      this.$refs['header'].style.opacity = 1
      this.$refs['button-bar'].style.opacity = 1
      this.$refs['playlist-progress'].style.opacity = 1
      this.$refs['container'].style.cursor = 'default'
    },

    hideBars () {
      this.$refs['header'].style.opacity = 0
      this.$refs['button-bar'].style.opacity = 0
      this.$refs['playlist-progress'].style.opacity = 0
      setTimeout(() => {
        this.$refs['header'].style.display = 'none'
        this.$refs['button-bar'].style.display = 'none'
        this.$refs['playlist-progress'].style.display = 'none'
        this.$refs['container'].style.cursor = 'none'
      }, 500)
    },

    showEditModal () {
      this.modals.edit = true
    },

    hideEditModal () {
      this.modals.edit = false
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

    confirmEditPlaylist (form) {
      this.loading.editPlaylist = true
      this.errors.editPlaylist = false
      this.editPlaylist({
        data: {
          name: form.name,
          id: this.playlist.id
        },
        callback: (err) => {
          if (err) this.errors.editPlaylist = true
          this.loading.editPlaylist = false
          this.modals.edit = false
          this.playlist.name = form.name
        }
      })
    },

    updateProgressBar () {
      const factor = this.currentTimeRaw / this.maxDurationRaw
      this.progress.value = this.currentTimeRaw
      this.progressBar.style.width = Math.floor(factor * 100) + '%'
      const progressCoordinates = this.progress.getBoundingClientRect()
      const x = progressCoordinates.width * factor + progressCoordinates.x
      this.progressCursor.style.left = Math.round(x - 7) + 'px'
      this.progressCursor.style.top = Math.round(progressCoordinates.y - 3) + 'px'
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
      const shotWidget = this.$refs['shot-' + index][0].$el
      const playlistEl = this.$refs['playlisted-shots']
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
    },

    play () {
      this.rawPlayer.play()
      if (this.isComparing) {
        this.$refs['raw-player-comparison'].play()
      }
      this.isPlaying = true
    },

    pause () {
      this.rawPlayer.pause()
      if (this.isComparing) this.$refs['raw-player-comparison'].pause()
      this.isPlaying = false
    },

    playShot (shotIndex) {
      if (this.shotList[shotIndex].preview_file_extension === 'mp4') {
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
      }
    },

    goPreviousFrame () {
      this.rawPlayer.goPreviousFrame()
      if (this.isComparing) {
        this.$refs['raw-player-comparison'].goPreviousFrame()
      }
    },

    goNextFrame () {
      this.rawPlayer.goNextFrame()
      if (this.isComparing) {
        this.$refs['raw-player-comparison'].goNextFrame()
      }
    },

    removeShot (shot) {
      this.$emit('remove-shot', shot)
      this.shotList = removeModelFromList(this.shotList, shot)
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
        if (event.keyCode === 37) {
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
        }
      }
    },

    onWindowResize () {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 600) {
        this.lastCall = now
        this.$nextTick(this.resetHeight)
      }
    },

    onFilmClicked () {
      this.isShotsHidden = !this.isShotsHidden
      this.$nextTick(() => {
        this.resetHeight()
        this.scrollToShot(this.playingShotIndex)
      })
    },

    onCommentClicked () {
      let height = this.$refs['video-container'].offsetHeight
      this.isCommentsHidden = !this.isCommentsHidden
      if (!this.isCommentsHidden) {
        this.$refs['task-info'].$el.style.height = `${height}px`
      }
      this.$nextTick(() => {
        this.$refs['task-info'].focusCommentTextarea()
        this.resetHeight()
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
      this.progress.setAttribute('max', this.maxDurationRaw)
    },

    onMouseMove () {
      if (this.$refs['button-bar'].style.opacity !== 1) {
        this.displayBars()
      }
      let isMovieFullScreen =
        this.isFullScreen() && this.isShotsHidden && this.isCommentsHidden
      if (isMovieFullScreen) {
        if (this.timer) clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          let isMovieFullScreen =
            this.isFullScreen() && this.isShotsHidden && this.isCommentsHidden
          if (isMovieFullScreen) this.hideBars()
        }, 2000)
      }
    },

    onShotChange (shotIndex) {
      this.playingShotIndex = shotIndex
      this.scrollToShot(this.playingShotIndex)
    },

    onPreviewChanged (shot, previewFileId) {
      this.$emit('preview-changed', shot, previewFileId)
    },

    onShotDropped (info) {
      this.$emit('order-change', info)
    },

    resetHeight () {
      this.$nextTick(() => {
        let height = this.$refs['container'].offsetHeight
        height -= this.$refs['header'].offsetHeight
        height -= this.$refs['playlist-progress'].offsetHeight
        height -= this.$refs['button-bar'].offsetHeight
        height -= this.$refs['playlisted-shots'].offsetHeight
        this.$refs['video-container'].style.height = `${height}px`
        if (!this.isCommentsHidden) {
          this.$refs['task-info'].$el.style.height = `${height}px`
        }
        this.rawPlayer.resetHeight()
        if (this.isComparing) {
          this.$refs['raw-player-comparison'].resetHeight()
        }
        this.$nextTick(() => {
          this.updateProgressBar()
        })
      })
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
    }
  },

  watch: {
    playingShotIndex () {
      this.updateTaskPanel()
    },

    isComparing () {
      if (this.isComparing) {
        this.resetComparison()
      }
    },

    taskTypeToCompare () {
      if (this.isComparing) {
        this.resetComparison()
      }
    },

    shots () {
      this.shotList = Object.values(this.shots)
      this.playingShotIndex = 0
      this.pause()
      this.rawPlayer.setCurrentTime(0)
      this.updateTaskPanel()
      this.rebuildComparisonOptions()
      if (this.shotList.length === 0) {
        this.rawPlayer.clear()
        if (this.isComparing) {
          this.$refs['raw-player-comparison'].clear()
        }
        this.maxDurationRaw = 0
        this.maxDuration = '00:00.00'
      } else {
        this.$nextTick(() => {
          this.playShot(0)
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.playlist-player {
  background: $dark-grey;
  height: 100%;
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
  padding: 0.5em;
  overflow-x: auto;
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

#annotation-canvas {
  display: block;
  width: 0;
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

.progress  span#progress-bar {
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
</style>
