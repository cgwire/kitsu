<template>
<a
  :href="originalPath"
  target="_blank"
  v-if="isPreview"
>
  <img
    class="thumbnail-picture"
    v-lazy="thumbnailPath"
  />
</a>
<span :class="{
  'thumbnail-picture': true,
  'thumbnail-empty': true,
  square: square
}" v-else>
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
    thumbnailPath () {
      if (this.square) {
        return '/api/pictures/thumbnails-square/preview-files/' +
               this.entity.preview_file_id + '.png'
      } else {
        return '/api/pictures/thumbnails/preview-files/' +
               this.entity.preview_file_id + '.png'
      }
    }
  }
}
</script>

<style scoped>
span.thumbnail-empty {
  width: 50px;
  height: 30px;
  background: #F3F3F3;
  display: block;
}

span.square {
  width: 100px;
  height: 100px;
}
</style>
