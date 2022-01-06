<template>
<div class="unselectable">
  <div
    class="progress-wrapper"
    :style="{
      'background-size': backgroundSize
    }"
  >
    <progress
      ref="progress"
      value="0"
      min="0"
      @click="onProgressClicked"
      @mousedown="startProgressDrag($event)"
    >
    </progress>
    <span
      :key="`annotation-${index}`"
      class="annotation-mark"
      :style="{
        left: getAnnotationPosition(annotation) + 'px',
        width: Math.max(frameSize - 1, 5) + 'px'
      }"
      @click="_emitProgressEvent(annotation)"
      v-for="(annotation, index) in annotations"
    >
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
    }
  },

  data () {
    return {
      width: 0
    }
  },

  mounted () {
    window.addEventListener('mousemove', this.doProgressDrag)
    window.addEventListener('mouseup', this.stopProgressDrag)
    window.addEventListener('resize', this.onWindowResize)
    new ResizeObserver(this.onWindowResize).observe(this.progress)

    const progressCoordinates = this.progress.getBoundingClientRect()
    this.width = progressCoordinates.width
    this.progress.setAttribute('max', this.videoDuration)
  },

  beforeDestroy () {
    window.removeEventListener('mousemove', this.doProgressDrag)
    window.removeEventListener('mouseup', this.stopProgressDrag)
    window.removeEventListener('resize', this.onWindowResize)
  },

  computed: {
    backgroundSize () {
      if (this.videoDuration) {
        return (200 / this.nbFrames) + '% 100%'
      } else {
        return '300%'
      }
    },

    frameSize () {
      return this.width / this.nbFrames
    },

    progress () {
      return this.$refs.progress
    },

    videoDuration () {
      return this.nbFrames * this.frameDuration
    }
  },

  methods: {
    onWindowResize () {
      const progressCoordinates = this.progress.getBoundingClientRect()
      this.width = progressCoordinates.width
    },

    getAnnotationPosition (annotation) {
      if (this.nbFrames === 0) return 0
      const frameNumber = Math.round(annotation.time / this.frameDuration)
      return frameNumber * this.frameSize
    },

    updateProgressBar (frameNumber) {
      this.progress.value = (frameNumber + 1) * this.frameDuration
    },

    startProgressDrag (event) {
      this.progressDragging = true
      this.$emit('start-scrub')
    },

    stopProgressDrag (event) {
      this.progressDragging = false
      this.$emit('end-scrub')
    },

    doProgressDrag (event) {
      if (this.progressDragging) this._emitProgressEvent()
    },

    onProgressClicked () {
      this._emitProgressEvent()
    },

    _emitProgressEvent (annotation) {
      let left = this.progress.parentElement.offsetLeft
      if (left === 0 && !this.fullScreen) {
        left = this.progress.parentElement.offsetParent.offsetLeft
      }
      const position = event.x - left
      const ratio = position / this.width
      let duration = annotation
        ? annotation.time
        : this.videoDuration * ratio
      if (duration < 0) duration = 0
      const frameNumber = Math.floor(duration / this.frameDuration)
      this.$emit('progress-changed', frameNumber)
    }
  },

  watch: {
    videoDuration () {
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
  height: 24px;
  position: absolute;
  top: 2px;
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
  background-color: #43B581;
  opacity: 0.6;
}

progress::-webkit-progress-value {
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
</style>
