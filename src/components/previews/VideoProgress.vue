<template>
  <div class="unselectable">
    <div
      class="progress-wrapper"
      :style="{
        'background-size': backgroundSize
      }"
      @mouseenter="isFrameNumberVisible = true"
      @mouseleave="isFrameNumberVisible = false"
      @touchstart="isFrameNumberVisible = true"
      @touchend="isFrameNumberVisible = false"
      @touchcancel="isFrameNumberVisible = false"
    >
      <span
        class="handle-in"
        :style="{
          width: handleInWidth,
          'padding-right': handleIn > 1 ? '5px' : 0
        }"
        @mousedown="startHandleInDrag"
        @touchstart="startHandleInDrag"
        v-if="handleIn >= 0 && !isFullMode"
      >
        {{ handleIn !== 0 ? handleIn + 1 : '' }}
      </span>

      <span
        class="handle-out"
        :style="{
          width: frameSize * (nbFrames - handleOut) + 'px'
        }"
        @mousedown="startHandleOutDrag"
        @touchstart="startHandleOutDrag"
        v-if="handleOut >= 0 && !isFullMode"
      >
        {{ handleOut + 1 }}
      </span>

      <progress
        ref="progress"
        value="0"
        min="0"
        @click="onProgressClicked"
        @mousedown="startProgressDrag"
        @touchstart="startProgressDrag"
      ></progress>
      <span
        :key="`annotation-${index}`"
        class="annotation-mark"
        :style="{
          left: getAnnotationPosition(annotation) + 'px',
          width: Math.max(frameSize - 1, 5) + 'px'
        }"
        @mouseenter="isFrameNumberVisible = true"
        @mouseleave="isFrameNumberVisible = true"
        @touchstart="isFrameNumberVisible = true"
        @touchend="isFrameNumberVisible = false"
        @touchcancel="isFrameNumberVisible = false"
        @click="_emitProgressEvent($event, annotation)"
        v-for="(annotation, index) in annotations"
      >
      </span>
      <span
        :key="`annotation-comparison-${index}`"
        class="annotation-mark comparison-mark"
        :style="{
          left: getAnnotationPosition(annotation) + 'px',
          width: Math.max(frameSize - 1, 5) + 'px'
        }"
        @mouseenter="isFrameNumberVisible = true"
        @mouseleave="isFrameNumberVisible = true"
        @touchstart="isFrameNumberVisible = true"
        @touchend="isFrameNumberVisible = false"
        @touchcancel="isFrameNumberVisible = false"
        @click="_emitProgressEvent($event, annotation)"
        v-for="(annotation, index) in comparisonAnnotations"
      >
      </span>
    </div>
    <div class="frame-number-rail">
      <span
        class="frame-number"
        :style="frameNumberStyle"
        v-show="
          isFrameNumberVisible &&
          hoverFrame > 0 &&
          !progressDragging &&
          !playlistProgressDragging
        "
      >
        {{ hoverFrame }}
        <span
          class="frame-tile"
          :style="getFrameBackgroundStyle(hoverFrame)"
          v-if="!isTileLoading"
        ></span>
        <spinner class="mt2" v-else />
      </span>
    </div>
    <div
      ref="playlist-progress"
      class="playlist-progress"
      @click="onPlaylistProgressClicked"
      @mouseenter="isFrameNumberVisible = true"
      @mouseleave="isFrameNumberVisible = false"
      @touchend="isFrameNumberVisible = false"
      @touchcancel="isFrameNumberVisible = false"
      @mousedown="startPlaylistProgressDrag"
      @touchstart="
        startProgressDrag()
        isFrameNumberVisible = true
      "
      v-show="entityList.length > 1 && playlistDuration > 0"
    >
      <div
        class="entity-status"
        :key="`progress-entity-${entity.id}`"
        :style="{
          left: getEntityPosition(entity) + '%',
          width: getEntityWidth(entity) + '%',
          'background-color': getEntityColor(entity)
        }"
        @mouseenter="isFrameNumberVisible = true"
        @mouseleave="isFrameNumberVisible = false"
        @touchend="isFrameNumberVisible = false"
        @touchcancel="isFrameNumberVisible = false"
        @mousedown="startPlaylistProgressDrag"
        @touchstart="
          startProgressDrag
          isFrameNumberVisible = true
        "
        v-for="entity in entityList"
      >
        <span>
          {{ getFullEntityName(entity) }}
        </span>
      </div>
      <span
        class="playlist-progress-position"
        :style="{
          left:
            'calc(' + (100 * playlistProgress) / playlistDuration + '% - 3px)'
        }"
        @mouseenter="isFrameNumberVisible = true"
        @mouseleave="isFrameNumberVisible = false"
        @touchstart="isFrameNumberVisible = true"
        @touchend="isFrameNumberVisible = false"
        @touchcancel="isFrameNumberVisible = false"
      >
      </span>
    </div>
  </div>
</template>

<script>
import Spinner from '@/components/widgets/Spinner'
import { domMixin } from '@/components/mixins/dom'

export default {
  name: 'video-progress',
  mixins: [domMixin],

  components: {
    Spinner
  },

  props: {
    annotations: {
      default: () => [],
      type: Array
    },
    comparisonAnnotations: {
      default: () => [],
      type: Array
    },
    fps: {
      default: 0,
      type: Number
    },
    frameDuration: {
      default: 0,
      type: Number
    },
    isFullMode: {
      default: false,
      type: Boolean
    },
    isFullScreen: {
      default: false,
      type: Boolean
    },
    movieDimensions: {
      default: () => ({}),
      type: Object
    },
    nbFrames: {
      default: 0,
      type: Number
    },
    handleIn: {
      default: 3,
      type: Number
    },
    handleOut: {
      default: 3,
      type: Number
    },
    previewId: {
      default: '',
      type: String
    },
    isPlaylist: {
      default: false,
      type: Boolean
    },
    playlistDuration: {
      default: 0,
      type: Number
    },
    playlistProgress: {
      default: 0,
      type: Number
    },
    playlistShotPosition: {
      default: () => {},
      type: Object
    },
    entityList: {
      default: () => [],
      type: Array
    }
  },

  data() {
    return {
      currentMouseFrame: {},
      frameNumberHeight: 0,
      frameNumberLeftPosition: 0,
      isFrameNumberVisible: false,
      isTileLoading: false,
      hoverFrame: 0,
      isPlaylistHover: false,
      progressDragging: false,
      playlistProgressDragging: false,
      width: 0,
      domEvents: [
        ['mousemove', this.doProgressDrag],
        ['touchmove', this.doProgressDrag],
        ['mouseup', this.stopProgressDrag],
        ['mouseleave', this.stopProgressDrag],
        ['touchend', this.stopProgressDrag],
        ['touchcancel', this.stopProgressDrag],
        ['mouseup', this.stopPlaylistProgressDrag],
        ['mouseleave', this.stopPlaylistProgressDrag],
        ['touchend', this.stopPlaylistProgressDrag],
        ['touchcancel', this.stopPlaylistProgressDrag],
        ['mouseup', this.stopHandleInDrag],
        ['mouseleave', this.stopHandleInDrag],
        ['touchend', this.stopHandleInDrag],
        ['touchcancel', this.stopHandleInDrag],
        ['mouseup', this.stopHandleOutDrag],
        ['mouseleave', this.stopHandleOutDrag],
        ['touchend', this.stopHandleOutDrag],
        ['touchcancel', this.stopHandleOutDrag],
        ['resize', this.resetScheduleSize]
      ]
    }
  },

  mounted() {
    this.addEvents(this.domEvents)
    new ResizeObserver(this.onWindowResize).observe(this.progress)
    const progressCoordinates = this.progress.getBoundingClientRect()
    this.width = progressCoordinates.width
    setTimeout(() => {
      this.width = progressCoordinates.width
    })
    this.progress.setAttribute('max', this.videoDuration)
  },

  beforeDestroy() {
    this.removeEvents(this.domEvents)
  },

  computed: {
    backgroundSize() {
      if (this.videoDuration) {
        return 200 / this.nbFrames + '% 100%'
      } else {
        return '300%'
      }
    },

    frameSize() {
      return this.width / this.nbFrames
    },

    frameNumberStyle() {
      const frameHeight = 100
      const height = frameHeight + 30
      const frameWidth = Math.ceil(frameHeight * this.videoRatio)
      const width = frameWidth + 10
      const left = Math.min(
        Math.max(this.frameNumberLeftPosition - frameWidth / 2, 0),
        this.width - frameWidth - 10
      )
      const top = this.isFullScreen
        ? `-${height + 30}px`
        : this.isPlaylist
          ? '16px'
          : '0px'

      return {
        height: `${height}px`,
        width: `${width}px`,
        top,
        left: `${left}px`
      }
    },

    progress() {
      return this.$refs.progress
    },

    tilePath() {
      return `/api/movies/tiles/preview-files/${this.previewId}.png`
    },

    videoDuration() {
      return this.nbFrames * this.frameDuration
    },

    videoRatio() {
      return this.movieDimensions.width
        ? this.movieDimensions.width / this.movieDimensions.height
        : 1
    },

    handleInWidth() {
      return Math.max(this.frameSize * this.handleIn, 0) + 'px'
    },

    playlistProgressWidget() {
      return this.$refs['playlist-progress']
    }
  },

  methods: {
    onWindowResize() {
      const progressCoordinates = this.progress.getBoundingClientRect()
      this.width = progressCoordinates.width
    },

    getAnnotationPosition(annotation) {
      if (this.nbFrames === 0) return 0
      const frameNumber = Math.round(annotation.time / this.frameDuration)
      return frameNumber * this.frameSize
    },

    updatePlaylistProgressBar(time) {},

    updateProgressBar(frameNumber) {
      this.progress.value = (frameNumber + 1) * this.frameDuration
    },

    startProgressDrag(event) {
      if (this.playlistProgressDragging) return
      this.progressDragging = true
      this.$emit('start-scrub')
    },

    stopProgressDrag(event) {
      this.progressDragging = false
      this.$emit('end-scrub')
    },

    startPlaylistProgressDrag(event) {
      if (this.progressDragging) return
      this.playlistProgressDragging = true
      this.$emit('start-scrub')
    },

    stopPlaylistProgressDrag(event) {
      this.playlistProgressDragging = false
      this.$emit('end-scrub')
    },

    startHandleInDrag(event) {
      this.handleInDragging = true
    },

    stopHandleInDrag(event) {
      if (this.handleInDragging) {
        this.handleInDragging = false
        const { frameNumber } = this.currentMouseFrame
        this.$emit('handle-in-changed', { frameNumber, save: true })
      }
    },

    startHandleOutDrag(event) {
      this.handleOutDragging = true
    },

    stopHandleOutDrag(event) {
      if (this.handleOutDragging) {
        this.handleOutDragging = false
        let { frameNumber, position } = this.currentMouseFrame
        if (this.width - position < 4) frameNumber += 1
        this.$emit('handle-out-changed', { frameNumber, save: true })
      }
    },

    doProgressDrag(event) {
      if (
        this.progressDragging ||
        this.playlistProgressDragging ||
        this.handleInDragging ||
        this.handleOutDragging ||
        this.isFrameNumberVisible
      ) {
        if (
          this.playlistProgressDragging ||
          (!this.progressDragging &&
            event.target.classList &&
            (event.target.classList.contains('playlilst-progress') ||
              event.target.classList.contains('entity-status') ||
              event.target.classList.contains('playlist-progress-position')))
        ) {
          this.currentMouseFrame = this._getPlaylistMouseFrame(event)
          const { frameNumber } = this.currentMouseFrame
          this.hoverFrame = frameNumber + 1
          const allDuration = Math.round(this.playlistDuration * this.fps)
          this.frameNumberLeftPosition =
            (this.width / allDuration) * frameNumber
          this.isPlaylistHover = true
        } else {
          this.currentMouseFrame = this._getMouseFrame(event)
          const { frameNumber } = this.currentMouseFrame
          this.hoverFrame = frameNumber + 1
          this.frameNumberLeftPosition =
            (this.width / this.nbFrames) * frameNumber
          this.isPlaylistHover = false
        }
        const { frameNumber } = this.currentMouseFrame
        if (this.progressDragging) {
          this.$emit('progress-changed', frameNumber)
        } else if (this.playlistProgressDragging) {
          this.$emit('progress-playlist-changed', frameNumber)
        } else if (this.handleInDragging) {
          this.$emit('handle-in-changed', { frameNumber, save: false })
        } else if (this.handleOutDragging) {
          let { frameNumber, position } = this.currentMouseFrame
          if (this.width - position < 4) frameNumber += 1
          this.$emit('handle-out-changed', { frameNumber, save: false })
        }
      }
    },

    onPlaylistProgressClicked(event) {
      const { frameNumber } = this._getPlaylistMouseFrame(event)
      this.$emit('progress-playlist-changed', frameNumber)
    },

    onProgressClicked(event) {
      this._emitProgressEvent(event)
    },

    _getMouseFrame(event, annotation) {
      let left = this.progress.getBoundingClientRect().left
      if (
        left === 0 &&
        !this.isFullScreen &&
        this.progress.parentElement.offsetParent
      ) {
        left = this.progress.parentElement.offsetParent.offsetLeft
      }
      let position = this.getClientX(event) - left
      if (position > this.width) position = this.width - 1
      const ratio = position / this.width
      let duration =
        annotation && this.frameSize < 3
          ? annotation.time
          : this.videoDuration * ratio
      if (duration < 0) duration = 0

      const isChromium = !!window.chrome
      const change = isChromium ? this.frameDuration : 0
      const videoDuration = this.nbFrames * this.frameDuration
      if (duration > videoDuration) {
        duration = videoDuration - change
      }
      const frameNumber = Math.floor(duration / this.frameDuration)
      return { frameNumber, position }
    },

    _getPlaylistMouseFrame(event) {
      const left = this.playlistProgressWidget.getBoundingClientRect().left
      let position = this.getClientX(event) - left
      if (position > this.width) position = this.width - 1
      const ratio = position / this.width
      let duration = this.playlistDuration * ratio
      if (duration < 0) duration = 0
      const frameNumber = Math.floor(duration / this.frameDuration)
      return { frameNumber, position }
    },

    _emitProgressEvent(event, annotation) {
      const { frameNumber } = this._getMouseFrame(event, annotation)
      this.$emit('progress-changed', frameNumber)
    },

    /**
     * Returns the background style for a given frame, calculating the
     * background position depending on the frame number. The tile background is
     * 8 frames wide.
     * @param {number} frame
     */
    getFrameBackgroundStyle(frame) {
      if (!frame) return {}
      let previewId = this.previewId
      if (this.isPlaylistHover) {
        previewId = this.playlistShotPosition[frame].id
        frame = frame - this.playlistShotPosition[frame].start * this.fps
      } else {
        frame = frame - 1
      }
      if (this.nbFrames >= 3840) {
        frame = Math.ceil(frame / Math.ceil(this.nbFrames / 3840))
      }
      const frameX = frame % 8
      const frameY = Math.floor(frame / 8)
      const frameHeight = 100
      const frameWidth = Math.ceil(frameHeight * this.videoRatio)
      const tilePath = `/api/movies/tiles/preview-files/${previewId}.png`
      return {
        background: `url(${tilePath})`,
        'background-position': `-${frameX * frameWidth}px -${
          frameY * frameHeight
        }px`,
        width: `${frameWidth}px`
      }
    },

    getFrameNumberStyle(frame) {
      const frameHeight = 100
      const height = frameHeight + 30
      const ratio = this.movieDimensions.width
        ? this.movieDimensions.width / this.movieDimensions.height
        : 1
      const frameWidth = Math.ceil(frameHeight * ratio)
      const width = frameWidth + 10
      const left = Math.min(
        Math.max(this.frameNumberLeftPosition - frameWidth / 2, 0),
        this.width - frameWidth - 10
      )
      const top = this.isFullScreen
        ? this.isPlaylist
          ? `-${height + 32}px`
          : `-${height}px`
        : this.isPlaylist
          ? '42px'
          : '30px'

      return {
        height: `${height}px`,
        width: `${width}px`,
        top,
        left: `${left}px`
      }
    },

    getEntityPosition(entity) {
      const ratio =
        (entity.start_duration - this.frameDuration) / this.playlistDuration
      return ratio * 100
    },

    getEntityWidth(entity) {
      const ratio = entity.preview_file_duration / this.playlistDuration
      return ratio * 100
    },

    getEntityColor(entity) {
      return entity.task_status_color
    },

    getFullEntityName(entity) {
      return `${entity.parent_name} / ${entity.name}`.replaceAll(' ', ' ')
    }
  },

  watch: {
    videoDuration() {
      const progressCoordinates = this.progress.getBoundingClientRect()
      this.width = progressCoordinates.width
      this.progress.setAttribute('max', this.videoDuration)
      this.updateProgressBar(0)
    },

    previewId: {
      immediate: true,
      handler() {
        if (this.previewId) {
          this.isTileLoading = true
          const img = new Image()
          img.src = this.tilePath
          img.onload = () => {
            this.isTileLoading = false
          }
        }
      }
    },

    playlistProgress() {
      this.updatePlaylistProgressBar(this.playlistProgress)
    }
  }
}
</script>

<style lang="scss" scoped>
.annotation-mark {
  background: #ee2750;
  border-radius: 2px;
  cursor: pointer;
  display: inline-block;
  height: 20px;
  position: absolute;
  top: 4px;

  &.comparison-mark {
    opacity: 0.5;
  }
}

.progress-wrapper {
  background-repeat: repeat-x;
  background: $grey;
  background-image: url('../../assets/background/player-timeslider.png');
  border: 0;
  cursor: pointer;
  flex-shrink: 0;
  margin: 0;
  height: 28px;
  padding: 0;
  position: relative;
  width: 100%;
}

progress::-moz-progress-bar {
  background-color: #43b581;
  opacity: 0.6;
}

progress::-webkit-progress-value {
  background-color: #43b581;
  opacity: 0.6;
}

progress[value]::-webkit-progress-bar,
progress {
  background-color: transparent;
  border: 0;
  border-top: 1px solid $dark-grey-light;
  border-bottom: 1px solid $dark-grey-light;
  border-radius: 0;
  display: block;
  height: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
}

.frame-number {
  background: $black;
  border-radius: 5px;
  color: $white;
  position: absolute;
  padding: 0.3em;
  text-align: center;
  top: -300px;
  width: 110px;
  z-index: 800;

  .frame-tile {
    display: inline-block;
    background-repeat: no-repeat;
    height: 100px;
  }
}

.handle-in {
  background: $black;
  color: $grey;
  display: inline-block;
  height: 28px;
  left: 0;
  opacity: 0.9;
  padding-top: 3px;
  position: absolute;
  z-index: 100;
  text-align: right;
}

.handle-in::after {
  bottom: 0;
  background: $dark-purple;
  content: ' ';
  cursor: pointer;
  height: 34px;
  position: absolute;
  right: -5px;
  top: -2px;
  width: 5px;
  z-index: 120;
}

.handle-out {
  background: $black;
  color: $grey;
  display: inline-block;
  height: 28px;
  overflow: hidden;
  padding-left: 10px;
  padding-top: 3px;
  position: absolute;
  opacity: 0.9;
  right: 0;
  z-index: 100;
}

.handle-out::before {
  bottom: 0;
  background: $dark-purple;
  content: ' ';
  cursor: pointer;
  height: 34px;
  left: 0px;
  position: absolute;
  top: -2px;
  width: 5px;
  z-index: 120;
}

.playlist-progress {
  background: $dark-grey;
  border-bottom: 1px solid $dark-grey-light;
  border-top: 1px solid $dark-grey-light;
  cursor: pointer;
  height: 18px;
  width: 100%;
  position: relative; /* Relative positioning for pseudo-element placement */
  overflow: visible;
  transition: height 0.2s ease-in-out;

  &:hover {
    height: 18px;
  }
}

.playlist-progress-position {
  border-left: 5px solid $green;
  position: absolute;
  height: 6px;
  border-radius: 50%;
  z-index: 3;
  top: -2px;
}

.frame-number-rail {
  position: relative;
}

.entity-status {
  border-left: 0;
  border-right: 3px solid $dark-grey;
  position: absolute;
  bottom: 0;
  transition: height 0.3s ease-in-out;
  height: 16px;
  z-index: 2;
  opacity: 0.4;

  span {
    background: $dark-grey;
    border-radius: 5px;
    color: $white;
    display: none;
    padding: 0.2em 0.5em;
    position: absolute;
    top: -30px;
  }

  &:hover {
    opacity: 1;
    span {
      display: block;
    }
  }
}
</style>
