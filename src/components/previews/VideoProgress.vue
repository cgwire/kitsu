<template>
  <div
    class="unselectable"
    @mouseenter="isFrameNumberVisible = true"
    @mouseout="isFrameNumberVisible = false"
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
        @mousedown="startHandleInDrag($event)"
        v-if="handleIn >= 0"
      >
        {{ handleIn !== 0 ? handleIn + 1 : '' }}
      </span>

      <span
        class="handle-out"
        :style="{
          width: frameSize * (nbFrames - handleOut) + 'px'
        }"
        @mousedown="startHandleOutDrag($event)"
        v-if="handleOut >= 0"
      >
        {{ handleOut + 1 }}
      </span>

      <progress
        ref="progress"
        value="0"
        min="0"
        @click="onProgressClicked"
        @mousedown="startProgressDrag($event)"
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
        @click="_emitProgressEvent(annotation)"
        v-for="(annotation, index) in annotations"
      >
      </span>
      <span
        class="frame-number"
        :style="{
          display: isFrameNumberVisible ? null : 'none',
          left: frameNumberLeftPosition + 'px'
        }"
      >
        {{ hoverFrame }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'video-progress',
  props: {
    annotations: {
      default: () => [],
      type: Array
    },
    frameDuration: {
      default: 0,
      type: Number
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
    }
  },

  data() {
    return {
      frameNumberLeftPosition: 0,
      isFrameNumberVisible: false,
      hoverFrame: 0,
      width: 0
    }
  },

  mounted() {
    window.addEventListener('mousemove', this.doProgressDrag)
    window.addEventListener('mouseup', this.stopProgressDrag)
    window.addEventListener('mouseup', this.stopHandleInDrag)
    window.addEventListener('mouseup', this.stopHandleOutDrag)
    window.addEventListener('resize', this.onWindowResize)
    new ResizeObserver(this.onWindowResize).observe(this.progress)
    const progressCoordinates = this.progress.getBoundingClientRect()
    this.width = progressCoordinates.width
    setTimeout(() => {
      this.width = progressCoordinates.width
    })
    this.progress.setAttribute('max', this.videoDuration)
  },

  beforeDestroy() {
    window.removeEventListener('mousemove', this.doProgressDrag)
    window.removeEventListener('mouseup', this.stopProgressDrag)
    window.removeEventListener('mouseup', this.stopHandleInDrag)
    window.removeEventListener('mouseup', this.stopHandleOutDrag)
    window.removeEventListener('resize', this.onWindowResize)
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
        const { frameNumber } = this._getMouseFrame()
        this.$emit('handle-in-changed', { frameNumber, save: true })
      }
    },

    startHandleOutDrag(event) {
      this.handleOutDragging = true
    },

    stopHandleOutDrag(event) {
      if (this.handleOutDragging) {
        this.handleOutDragging = false
        let { frameNumber, position } = this._getMouseFrame()
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
        const { frameNumber } = this._getMouseFrame()
        this.hoverFrame = frameNumber + 1
        this.frameNumberLeftPosition =
          (this.width / this.nbFrames) * frameNumber
        if (this.progressDragging) {
          this.$emit('progress-changed', frameNumber)
        }
        if (this.handleInDragging) {
          const { frameNumber } = this._getMouseFrame()
          this.$emit('handle-in-changed', { frameNumber, save: false })
        }
        if (this.handleOutDragging) {
          let { frameNumber, position } = this._getMouseFrame()
          if (this.width - position < 4) frameNumber += 1
          this.$emit('handle-out-changed', { frameNumber, save: false })
        }
      }
    },

    onProgressClicked() {
      this._emitProgressEvent()
    },

    _getMouseFrame(annotation) {
      let left = this.progress.getBoundingClientRect().left
      if (left === 0 && !this.fullScreen) {
        left = this.progress.parentElement.offsetParent.offsetLeft
      }
      const position = event.x - left
      const ratio = position / this.width
      let duration =
        annotation && this.frameSize < 3
          ? annotation.time
          : this.videoDuration * ratio
      if (duration < 0) duration = 0
      if (duration > this.videoDuration - this.frameDuration) {
        duration = this.videoDuration - this.frameDuration
      }
      const frameNumber = Math.floor(duration / this.frameDuration)
      return { frameNumber, position }
    },

    _emitProgressEvent(annotation) {
      const { frameNumber } = this._getMouseFrame(annotation)
      this.$emit('progress-changed', frameNumber)
    }
  },

  watch: {
    videoDuration() {
      const progressCoordinates = this.progress.getBoundingClientRect()
      this.width = progressCoordinates.width
      this.progress.setAttribute('max', this.videoDuration)
      this.updateProgressBar(0)
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
  border: 1px solid $white;
  border-radius: 5px;
  position: relative;
  padding: 0.3em;
  top: 8px;
  color: $white;
  z-index: 800;
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
