<template>
<a
  class="preview-wrapper preview-picture"
  target="_blank"
  :style="{
    width: emptyWidth + 'px',
    'min-width': emptyWidth + 'px',
    height: emptyHeight + 'px'
  }"
  @click="onClicked"
>
  <img
    class="thumbnail-picture"
    :style="{
      width: 'auto',
      'max-height': emptyHeight + 'px'
    }"
    :width="width || ''"
    v-lazy="thumbnailPath"
    :key="thumbnailKey"
  />
</a>
</template>

<script>
export default {
  name: 'entity-preview',

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
    maxWidth: {
      default: null,
      type: Number
    },
    maxHeight: {
      default: null,
      type: Number
    },
    emptyHeight: {
      default: 30,
      type: Number
    },
    emptyWidth: {
      default: 50,
      type: Number
    },
    previewFileId: {
      default: null,
      type: String
    }
  },

  computed: {
    originalPath() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return '/api/pictures/originals/preview-files/' + previewFileId + '.png'
    },

    isPreview() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return previewFileId && previewFileId.length > 0
    },

    imgStyle() {
      const style = {}
      const height = this.maxHeight || this.emptyHeight
      const width = this.maxWidth || this.emptyWidth
      style['max-height'] = height
      style['min-height'] = height
      style.height = height
      style['max-width'] = width
      style['min-width'] = width
      style.width = width
      return style
    },

    thumbnailPath() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return (
        '/api/pictures/previews/preview-files/' + previewFileId + '.png'
      )
    },

    thumbnailKey() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return `preview-${previewFileId}`
    }
  },

  methods: {
    onClicked() {
      if (this.noPreview) return
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      this.$store.commit('SHOW_PREVIEW_FILE', previewFileId)
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  table .thumbnail-picture.thumbnail-empty {
    background: $dark-grey-lighter;
    border-color: $dark-grey-light;
  }
}

a {
  background: $black;
  display: flex;
  align-items: center;
  justify-content: center;
}

img {
  display: block;
  border: 0;
  border-radius: 0;
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
  background: $white-grey;
  border: 1px solid $light-grey;
  margin: 0px;
}

table .thumbnail-wrapper {
}

table .thumbnail-picture {
  background-color: black;
  border: 0;
  margin: 0px;
  padding: 0px;
}

.thumbnail-wrapper {
  padding: 0px;
  border: 0;
  border-radius: 4px;
  display: inline-block;
}
</style>
