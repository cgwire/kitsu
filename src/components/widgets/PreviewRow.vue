<template>
<div :class="{
  'preview-row': true,
  'has-text-center': true,
  selected: selected
}">
  <button-link
    :text="label"
    :path="previewPath"
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
  props: {
    preview: {
      type: Object,
      default: () => {}
    },
    selected: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    },

    previewPath: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    label () {
      let label = `v${this.preview.revision}`
      return label
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.preview-row {
  margin-right: 0.5em;
}

.preview-row a {
  border: 3px solid $light-grey;
}

.preview-row:hover a {
  border: 3px solid #E1D4F9;
}

.preview-row.selected a {
  border: 3px solid #8F91EB;
}
</style>
