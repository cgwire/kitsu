<template>
<a
  :href="'/api/pictures/originals/preview-files/' + entity.preview_file_id + '.png'"
  target="_blank"
  v-if="entity.preview_file_id && entity.preview_file_id.length > 0"
>
  <img
    class="thumbnail-picture"
    v-lazy="'/api/pictures/thumbnails/preview-files/' + entity.preview_file_id + '.png'"
  />
</a>
<span class="thumbnail-picture thumbnail-empty" v-else>
</span>
</template>

<script>
export default {
  name: 'entity-thumbnail',
  props: {
    entity: {
      default: () => {},
      type: Object
    }
  }
}
</script>

<style scoped>
span.thumbnail-empty {
  display: block;
  width: 50px;
  height: 30px;
  background: #F3F3F3;
}
</style>
