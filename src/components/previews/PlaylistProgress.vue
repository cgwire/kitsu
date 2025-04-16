<template>
  <div class="unselectable">
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
        () => {
          startPlaylistProgressDrag()
          isFrameNumberVisible = true
        }
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
          () => {
            startPlaylistProgressDrag()
            isFrameNumberVisible = true
          }
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
import { domMixin } from '@/components/mixins/dom'

import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'playlist-progress',

  mixins: [domMixin],

  components: {
    Spinner
  },

  props: {
    entityList: {
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
    nbFrames: {
      default: 0,
      type: Number
    },
    movieDimensions: {
      default: () => ({}),
      type: Object
    },
    previewId: {
      default: '',
      type: String
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
    }
  },

  emits: ['end-scrub', 'progress-playlist-changed', 'start-scrub'],

  data() {
    return {
      currentMouseFrame: {},
      frameNumberHeight: 0,
      frameNumberLeftPosition: 0,
      isFrameNumberVisible: false,
      isTileLoading: false,
      hoverFrame: 0,
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
        ['touchcancel', this.stopPlaylistProgressDrag]
      ]
    }
  },

  mounted() {
    this.addEvents(this.domEvents)
    new ResizeObserver(this.onWindowResize).observe(this.playlistProgressWidget)
    this.resetWidth()
  },

  beforeUnmount() {
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
      let frameWidth = 150
      const preview = this.playlistShotPosition[this.hoverFrame]
      if (!preview) return {}
      if (preview.extension === 'mp4') {
        const ratio = preview.width / preview.height
        frameWidth = Math.ceil(frameHeight * ratio)
      } else if (preview.extension === 'png') {
        frameWidth = 150
      }
      const width = frameWidth + 10
      const left = Math.min(
        Math.max(this.frameNumberLeftPosition - frameWidth / 2, 0),
        this.width - frameWidth - 10
      )
      const top = this.isFullScreen ? `-${height + 2}px` : '16px'

      return {
        height: `${height}px`,
        width: `${width}px`,
        top,
        left: `${left}px`
      }
    },

    tilePath() {
      return `/api/movies/tiles/preview-files/${this.previewId}.png`
    },

    videoDuration() {
      return this.nbFrames * this.frameDuration
    },

    handleInWidth() {
      return Math.max(this.frameSize * this.handleIn, 0) + 'px'
    },

    playlistProgressWidget() {
      return this.$refs['playlist-progress']
    }
  },

  methods: {
    resetWidth() {
      if (this.playlistProgressWidget) {
        const progressCoordinates =
          this.playlistProgressWidget.getBoundingClientRect()
        this.width = progressCoordinates.width
        setTimeout(() => {
          this.width = progressCoordinates.width
        })
      }
    },

    onWindowResize() {
      this.resetWidth()
    },

    updatePlaylistProgressBar(time) {},

    startPlaylistProgressDrag(event) {
      this.playlistProgressDragging = true
      this.$emit('start-scrub')
    },

    stopPlaylistProgressDrag(event) {
      this.playlistProgressDragging = false
      this.$emit('end-scrub')
    },

    doProgressDrag(event) {
      if (
        this.playlistProgressDragging ||
        this.isFrameNumberVisible ||
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
        this.frameNumberLeftPosition = (this.width / allDuration) * frameNumber
        if (this.playlistProgressDragging) {
          this.$emit('progress-playlist-changed', frameNumber)
        }
      }
    },

    onPlaylistProgressClicked(event) {
      const { frameNumber } = this._getPlaylistMouseFrame(event)
      this.$emit('progress-playlist-changed', frameNumber)
    },

    _getPlaylistMouseFrame(event) {
      if (this.width === 0) this.resetWidth()
      const left = this.playlistProgressWidget.getBoundingClientRect().left
      let position = this.getClientX(event) - left
      if (position > this.width) position = this.width - 1
      const ratio = position / this.width
      let duration = this.playlistDuration * ratio
      if (duration < 0) duration = 0
      const frameNumber = Math.floor(duration / this.frameDuration)
      return { frameNumber, position }
    },

    /**
     * Returns the background style for a given frame, calculating the
     * background position depending on the frame number. The tile background is
     * 8 frames wide.
     * @param {number} frame
     */
    getFrameBackgroundStyle(frame) {
      if (!frame || !this.playlistShotPosition[frame]) return {}
      const { id, extension, width, height } = this.playlistShotPosition[frame]

      frame = frame - this.playlistShotPosition[frame].start * this.fps
      if (this.nbFrames >= 3840) {
        frame = Math.ceil(frame / Math.ceil(this.nbFrames / 3840))
      }
      const frameX = frame % 8
      const frameY = Math.floor(frame / 8)
      const frameHeight = 100

      if (extension === 'png') {
        const tilePath = `/api/pictures/thumbnails/preview-files/${id}.png`
        return {
          background: `url(${tilePath})`,
          'background-position': '0 0',
          width: '150px'
        }
      } else if (extension === 'mp4') {
        const ratio = width / height
        const frameWidth = Math.ceil(frameHeight * ratio)
        const tilePath = `/api/movies/tiles/preview-files/${id}.png`
        return {
          background: `url(${tilePath})`,
          'background-position': `-${frameX * frameWidth}px -${
            frameY * frameHeight
          }px`,
          width: `${frameWidth}px`
        }
      } else {
        return {
          background: 'transparent'
        }
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
      const top = this.isFullScreen ? `-${height + 32}px` : '42px'

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
      let ratio = 0
      if (entity.preview_file_extension === 'mp4') {
        ratio = entity.preview_file_duration / this.playlistDuration
      } else if (entity.preview_nb_frames) {
        const duration = entity.preview_nb_frames * this.frameDuration
        ratio = duration / this.playlistDuration
      } else {
        ratio = (2 * this.fps * this.frameDuration) / this.playlistDuration
      }
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
    previewId: {
      immediate: true,
      handler() {
        if (this.previewId) {
          const preview = this.playlistShotPosition[this.hoverFrame]
          if (preview.extension === 'mp4') {
            this.isTileLoading = true
            const img = new Image()
            img.src = this.tilePath
            img.onload = () => {
              this.isTileLoading = false
            }
          }
        }
      }
    },

    entityList() {
      this.resetWidth()
    },

    playlistProgress() {
      this.updatePlaylistProgressBar(this.playlistProgress)
    }
  }
}
</script>

<style lang="scss" scoped>
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
  display: flex;
  flex-direction: column;

  .frame-tile {
    display: inline-block;
    background-repeat: no-repeat;
    height: 100px;
  }
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
