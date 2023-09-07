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
      :environment-image="backgroundUrl"
      :skybox-image="isEnvironmentSkybox ? backgroundUrl : ''"
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
    backgroundUrl: {
      type: String
    },
    isEnvironmentSkybox: {
      default: false,
      type: Boolean
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
