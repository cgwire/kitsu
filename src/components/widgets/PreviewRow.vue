<template>
  <div
    :class="{
      'preview-row': true,
      'has-text-center': true,
      selected: selected,
      green: preview.validation_status === 'validated'
    }"
  >
    <button-link :text="label" :path="previewPath" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import ButtonLink from '@/components/widgets/ButtonLink.vue'

const props = defineProps({
  preview: {
    type: Object,
    default: () => {}
  },
  selected: {
    type: Boolean,
    default: false
  },
  previewPath: {
    type: Object,
    default: () => {}
  }
})

const label = computed(() => {
  const label = `v${props.preview.revision}`
  return label
})
</script>

<style lang="scss" scoped>
.preview-row {
  margin-right: 0.5em;
}

.preview-row a {
  border: 3px solid $light-grey;
}

.preview-row:hover a {
  border: 3px solid #e1d4f9;
}

.preview-row.green a {
  border: 3px solid $light-green;
}

.preview-row.red a {
  border: 3px solid $dark-red;
}

.preview-row.selected a {
  border: 3px solid #8f91eb;
}
</style>
