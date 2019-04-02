<template>
<a
  :href="originalPath"
  target="_blank"
  :style="{
    width: emptyWidth + 'px',
    height: emptyHeight + 'px',
  }"
  v-if="isPreview && withLink"
>
  <img
    class="thumbnail-picture"
    :style="imgStyle"
    v-lazy="thumbnailPath"
    :key="thumbnailKey"
  />
</a>

<img
  class="thumbnail-picture"
  style="imgStyle"
  v-lazy="thumbnailPath"
  :key="thumbnailKey"
  v-else-if="isPreview && !withLink"
/>

<span
  :class="{
    'thumbnail-picture': true,
    'thumbnail-empty': true,
    square: square
  }"
  :style="{
    width: emptyWidth + 'px',
    height: emptyHeight + 'px',
  }"
  v-else>
</span>
</template>

<script>
export default {
  name: 'entity-thumbnail',

  props: {
    entity: {
      default: () => {},
      type: Object
    },
    square: {
      default: false,
      type: Boolean
    },
    width: {
      default: null,
      type: Number
    },
    height: {
      default: null,
      type: Number
    },
    emptyWidth: {
      default: 50,
      type: Number
    },
    emptyHeight: {
      default: 30,
      type: Number
    },
    previewFileId: {
      default: null,
      type: String
    },
    withLink: {
      default: true,
      type: Boolean
    }
  },

  computed: {
    originalPath () {
      return '/api/pictures/originals/preview-files/' +
             this.entity.preview_file_id + '.png'
    },

    isPreview () {
      return this.entity.preview_file_id &&
             this.entity.preview_file_id.length > 0
    },

    imgStyle () {
      const style = {}
      if (this.width) {
        style.width = this.width + 'px'
      }

      if (this.height) {
        style.height = this.height + 'px'
      }
      return style
    },

    thumbnailPath () {
      const previewFileId = this.previewFileId || this.entity.preview_file_id

      if (this.square) {
        return '/api/pictures/thumbnails-square/preview-files/' +
               previewFileId + '.png'
      } else {
        return '/api/pictures/thumbnails/preview-files/' +
               previewFileId + '.png'
      }
    },

    thumbnailKey () {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return `thumbnail-${previewFileId}`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .thumbnail-picture {
  background-color: $dark-grey-lighter;
  border-color: $dark-grey-light;
}

.thumbnail-picture {
  margin: 0;
}

span.thumbnail-empty {
  background: $white-grey;
  display: block;
  margin: 0;
}

.thumbnail-picture.square {
  width: 100px;
  height: 100px;
}

table .thumbnail-picture.thumbnail-empty {
  margin: 5px;
}

table .thumbnail-picture {
  margin: 7px 5px 0 5px;
}

</style>
