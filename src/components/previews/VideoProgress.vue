<template>
  <div
    class="unselectable"
    @mouseenter="isFrameNumberVisible = true"
    @mouseout="isFrameNumberVisible = false"
    @touchstart="isFrameNumberVisible = true"
    @touchend="isFrameNumberVisible = false"
    @touchcancel="isFrameNumberVisible = false"
  >
    <div
      class="progress-wrapper"
      :style="{
        'background-size': backgroundSize
      }"
    >
      <span
        class="handle-in"
        :style="{
          width: handleInWidth,
          'padding-right': handleIn > 1 ? '5px' : 0
        }"
        @mousedown="startHandleInDrag"
        @touchstart="startHandleInDrag"
        v-if="handleIn >= 0"
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
        v-if="handleOut >= 0"
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
      <span
        class="frame-number"
        :style="getFrameNumberStyle(hoverFrame)"
        v-show="isFrameNumberVisible && hoverFrame > 0 && !progressDragging"
      >
        <span>
          {{ hoverFrame }}
        </span>
        <span
          :style="getFrameBackgroundStyle(hoverFrame)"
          v-if="!isTileLoading"
        ></span>
        <spinner class="mt2" v-else />
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
    frameDuration: {
      default: 0,
      type: Number
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
      progressDragging: false,
      width: 0,
      domEvents: [
        ['mousemove', this.doProgressDrag],
        ['touchmove', this.doProgressDrag],
        ['mouseup', this.stopProgressDrag],
        ['mouseleave', this.stopProgressDrag],
        ['touchend', this.stopProgressDrag],
        ['touchcancel', this.stopProgressDrag],
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

    progress() {
      return this.$refs.progress
    },

    videoDuration() {
      return this.nbFrames * this.frameDuration
    },

    handleInWidth() {
      return Math.max(this.frameSize * this.handleIn, 0) + 'px'
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

    updateProgressBar(frameNumber) {
      this.progress.value = (frameNumber + 1) * this.frameDuration
    },

    startProgressDrag(event) {
      this.progressDragging = true
      this.$emit('start-scrub')
    },

    stopProgressDrag(event) {
      this.progressDragging = false
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
        this.handleInDragging ||
        this.handleOutDragging ||
        this.isFrameNumberVisible
      ) {
        this.currentMouseFrame = this._getMouseFrame(event)
        const { frameNumber } = this.currentMouseFrame
        this.hoverFrame = frameNumber + 1
        this.frameNumberLeftPosition =
          (this.width / this.nbFrames) * frameNumber
        if (this.progressDragging) {
          this.$emit('progress-changed', frameNumber)
        }
        if (this.handleInDragging) {
          this.$emit('handle-in-changed', { frameNumber, save: false })
        }
        if (this.handleOutDragging) {
          let { frameNumber, position } = this.currentMouseFrame
          if (this.width - position < 4) frameNumber += 1
          this.$emit('handle-out-changed', { frameNumber, save: false })
        }
      }
    },

    onProgressClicked(event) {
      this._emitProgressEvent(event)
    },

    _getMouseFrame(event, annotation) {
      let left = this.progress.getBoundingClientRect().left
      if (left === 0 && !this.isFullScreen) {
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
      if (duration > this.videoDuration - change) {
        duration = this.videoDuration - change
      }
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
     * 5 frames wide.
     * @param {number} frame
     */
    getFrameBackgroundStyle(frame) {
      if (!frame) return {}
      const frameX = frame % 8
      const frameY = Math.floor(frame / 8)
      const ratio = this.movieDimensions.width / this.movieDimensions.height
      const frameHeight = 100
      const frameWidth = Math.ceil(frameHeight * ratio)
      const style = {
        background: `url(/api/movies/tiles/preview-files/${this.previewId}.png)`,
        'background-repeat': 'no-repeat',
        'background-size': `${8 * frameWidth}px auto`,
        'background-position': `-${frameX * frameWidth}px -${
          frameY * frameHeight
        }px`,
        height: `${frameHeight}px`,
        width: `${frameWidth}px`,
        display: 'inline-block'
      }
      return style
    },

    getFrameNumberStyle(frame) {
      const frameHeight = 100
      const height = frameHeight + 30
      const ratio = this.movieDimensions.width / this.movieDimensions.height
      const frameWidth = Math.ceil(frameHeight * ratio)
      const width = frameWidth + 10
      const left = Math.min(
        Math.max(this.frameNumberLeftPosition - frameWidth / 2, 0),
        this.width - frameWidth - 10
      )

      return {
        height: height + 'px',
        width: width + 'px',
        top: this.isFullScreen ? `-${height}px` : '30px',
        left: left + 'px'
      }
    }
  },

  watch: {
    videoDuration() {
      const progressCoordinates = this.progress.getBoundingClientRect()
      this.width = progressCoordinates.width
      this.progress.setAttribute('max', this.videoDuration)
      this.updateProgressBar(0)
    },

    previewId() {
      const path = `/api/movies/tiles/preview-files/${this.previewId}.png`
      const img = new Image()
      this.isTileLoading = true
      img.src = path
      img.onload = () => {
        this.isTileLoading = false
      }
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
  top: 30px;
  width: 110px;
  z-index: 800;

  img {
    width: 100px;
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
</style>
