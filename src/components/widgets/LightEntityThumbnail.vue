<template>
  <img
    class="thumbnail-picture"
    draggable="false"
    loading="lazy"
    alt=""
    :key="previewFileId"
    :src="`/api/pictures/${type}/preview-files/${previewFileId}.png`"
    :style="{
      width,
      height,
      'max-width': maxWidth,
      'max-height': maxHeight
    }"
    v-if="isPreviewWithThumbnail"
  />
  <span
    class="thumbnail-picture thumbnail-empty"
    :style="{
      width: emptyWidth ? emptyWidth : width,
      height: emptyHeight ? emptyHeight : height
    }"
    v-else
  >
  </span>
</template>

<script>
export default {
  name: 'light-entity-thumbnail',

  props: {
    previewFileId: {
      type: String
    },
    extension: {
      type: String
    },
    width: {
      default: '150px',
      type: String
    },
    height: {
      default: '50px',
      type: String
    },
    maxHeight: {
      default: 'auto',
      type: String
    },
    maxWidth: {
      default: 'auto',
      type: String
    },
    emptyHeight: {
      type: String
    },
    emptyWidth: {
      type: String
    },
    type: {
      default: 'thumbnails',
      type: String
    }
  },

  computed: {
    isPreviewWithThumbnail() {
      return (
        this.previewFileId &&
        (!this.extension || ['mp4', 'png'].includes(this.extension))
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .thumbnail-picture {
  background-color: $dark-grey-lighter;
  border-color: $dark-grey-light;
}

span.thumbnail-empty {
  background: $white-grey;
  display: block;
  flex-shrink: 0;
  margin: 0;
}
</style>
