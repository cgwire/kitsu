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
    width: {
      default: 0,
      type: Number
    }
  },

  methods: {
    getAnnotationPosition (annotation) {
      const factor = annotation.time / this.maxDurationRaw
      let width = this.width
      if (width === 0) {
        const progressBar = this.$parent.progress
        const progressCoordinates = progressBar.getBoundingClientRect()
        width = progressCoordinates.width
      }
      let left = width * factor - 3
      if (left >= width) {
        left -= this.isFullScreen() ? 9 : 6
      }
      return left
    },

    isFullScreen () {
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
  height: 20px;
  position: relative;
  background: $dark-grey;
  overflow: hidden;
}

.annotation-mark {
  background: #ff3860;
  width: 8px;
  height: 8px;
  display: inline-block;
  top: 6px;
  position: absolute;
  border-radius: 50%;
  cursor: pointer;
}
</style>
