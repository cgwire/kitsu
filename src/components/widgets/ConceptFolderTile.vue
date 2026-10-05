<template>
  <span class="folder" :class="{ highlighted }">
    <folder-icon :size="20" />
    <span class="folder-name">{{ name }}</span>
    <span class="folder-count" v-if="count !== null">{{ count }}</span>
  </span>
</template>

<script setup>
import { FolderIcon } from 'lucide-vue-next'

defineProps({
  count: { type: Number, default: null },
  highlighted: { type: Boolean, default: false },
  name: { type: String, required: true }
})
</script>

<style lang="scss" scoped>
.folder {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  background: var(--background-alt);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  cursor: pointer;
  padding: 0.6em 1em;

  &:hover,
  &.highlighted {
    background: var(--background-selectable);
  }

  &.highlighted {
    border-color: var(--background-selected);
  }
}

.folder-name {
  font-weight: 600;
}

.folder-count {
  color: var(--text-alt);
}
</style>
