<template>
  <div class="annotation-bar" ref="playlist-annotation">
    <span
      :key="`annotation-${index}`"
      class="annotation-mark"
      :style="{
        left: getAnnotationPosition(annotation) + 'px'
      }"
      @click="$emit('select-annotation', annotation)"
      v-for="(annotation, index) in annotations"
    >
    </span>
  </div>
</template>

<script>
export default {
  name: 'annotation-bar',
  props: {
    annotations: {
      default: () => [],
      type: Array
    },
    maxDurationRaw: {
      default: 0,
      type: Number
    },
    nbFrames: {
      default: 0,
      type: Number
    },
    width: {
      default: 0,
      type: Number
    }
  },

  methods: {
    getAnnotationPosition(annotation) {
      const factor = annotation.time / this.maxDurationRaw
      let width = this.width
      const progressBar = this.$parent.progress
      if (width === 0 && progressBar) {
        const progressCoordinates = progressBar.getBoundingClientRect()
        width = progressCoordinates.width
      }
      const dotWidth = 6
      const frameSize = this.width / this.nbFrames
      let left = width * factor - frameSize / 2 - 3
      if (left >= width) {
        left -= this.isFullScreen() ? 1.5 * dotWidth : dotWidth
      }
      return Math.round(left)
    },

    isFullScreen() {
      return !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.annotation-bar {
  width: 100%;
  height: 10px;
  position: relative;
  background: $dark-grey;
  overflow: hidden;
  flex-shrink: 0;
}

.annotation-mark {
  background: #ff3860;
  width: 8px;
  height: 8px;
  display: inline-block;
  top: 1px;
  position: absolute;
  border-radius: 50%;
  cursor: pointer;
}
</style>
