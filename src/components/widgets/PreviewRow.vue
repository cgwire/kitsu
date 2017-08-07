<template>
<div class="preview-row has-text-center">
  <button-link
    :text="'Preview ' + preview.revision"
    icon="fa-eye"
    :path="'/tasks/' + taskId + '/previews/' + preview.id"
  >
  </button-link>
</div>
</template>

<script>
import ButtonLink from './ButtonLink.vue'

export default {
  name: 'preview-row',
  components: {
    ButtonLink
  },
  props: [
    'preview',
    'taskId'
  ],
  methods: {
  }
}
</script>

<style scoped>
.preview-row a {
  display: block;
  width: 100%;
  display: flex;
  margin-bottom: 1em;
}
</style>
