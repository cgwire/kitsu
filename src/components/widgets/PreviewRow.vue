<template>
<div class="preview-row has-text-center">
  <button-link
    :text="label"
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
  computed: {
    label () {
      let label = `Preview ${this.preview.revision}`
      if (this.preview.feedback) {
        label = `${label} (${this.$tc('tasks.feedback')})`
      }
      return label
    }
  },
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
