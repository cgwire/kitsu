<template>
  <div
    class="model-container"
    :class="{
      light: light && !readOnly
    }"
    :style="{
      height: defaultHeight ? defaultHeight + 'px' : '100%',
      width: '100%'
    }"
  >
    <model-viewer
      autoplay
      camera-controls
      class="model-viewer"
      loading="eager"
      :skybox-image="skyboxUrl"
      :src="previewUrl"
    />
  </div>
</template>

<script>
import('@google/model-viewer')

export default {
  name: 'object-viewer',

  props: {
    previewUrl: {
      default: '',
      type: String
    },
    light: {
      default: false,
      type: Boolean
    },
    readOnly: {
      default: false,
      type: Boolean
    },
    defaultHeight: {
      default: 0,
      type: Number
    },
    skyboxUrl: {
      type: String
    }
  }
}
</script>

<style lang="scss" scoped>
.model-viewer {
  height: 100%;
  width: 100%;
  background-color: #333;
  --progress-bar-color: #999;

  &.light {
    height: 200px;
  }
}
</style>
