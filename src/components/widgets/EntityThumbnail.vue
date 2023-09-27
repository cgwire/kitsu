<template>
  <a
    class="thumbnail-wrapper thumbnail-picture"
    target="_blank"
    :style="{
      width: emptyWidth + 'px',
      'min-width': emptyWidth + 'px',
      height: emptyHeight + 'px'
    }"
    @click="onClicked"
    v-if="isPreview && withLink"
  >
    <img
      class="thumbnail-picture"
      loading="lazy"
      :key="thumbnailKey"
      :src="thumbnailPath"
      :style="imgStyle"
      :width="width || ''"
    />
  </a>

  <img
    v-else-if="isPreview && !withLink"
    class="thumbnail-picture"
    loading="lazy"
    :key="thumbnailKey"
    :src="thumbnailPath"
    :style="imgStyle"
  />

  <span
    :class="{
      'thumbnail-picture': true,
      'thumbnail-empty': true,
      square: square
    }"
    :style="imgStyle"
    v-else
  >
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
    maxWidth: {
      default: null,
      type: Number
    },
    maxHeight: {
      default: null,
      type: Number
    },
    noPreview: {
      default: false,
      type: Boolean
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
    },
    withLink: {
      default: true,
      type: Boolean
    }
  },

  data() {
    return {
      timer: ''
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
      if (this.emptyWidth) {
        style['max-width'] = this.emptyWidth + 'px'
        style['min-width'] = this.emptyWidth + 'px'
      } else if (this.maxWidth) {
        style['max-width'] = this.maxWidth + 'px'
      } else if (this.width) {
        style.width = this.width + 'px'
        style['min-width'] = this.width + 'px'
      }
      if (this.emptyHeight) {
        style['max-height'] = this.emptyHeight + 'px'
        style['min-height'] = this.emptyHeight + 'px'
      } else if (this.maxHeight) {
        style['max-height'] = this.maxHeight + 'px'
      } else if (this.height) {
        style.height = this.height + 'px'
      }
      return style
    },

    thumbnailPath() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id

      if (this.square) {
        return (
          '/api/pictures/thumbnails-square/preview-files/' +
          previewFileId +
          '.png'
        )
      } else {
        if (this.width && this.width > 150) {
          return (
            '/api/pictures/previews/preview-files/' +
            previewFileId +
            '.png' +
            this.timer
          )
        } else {
          return (
            '/api/pictures/thumbnails/preview-files/' +
            previewFileId +
            '.png' +
            this.timer
          )
        }
      }
    },

    thumbnailKey() {
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      return `thumbnail-${previewFileId}`
    }
  },

  methods: {
    onClicked() {
      if (this.noPreview) return
      const previewFileId = this.previewFileId || this.entity.preview_file_id
      this.$store.commit('SHOW_PREVIEW_FILE', previewFileId)
    }
  },

  watch: {
    previewFileId() {
      this.timer = '?t=' + new Date().valueOf()
    },

    'entity.preview_file_id'() {
      this.timer = '?t=' + new Date().valueOf()
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

.thumbnail-picture {
  border-radius: 4px;
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
