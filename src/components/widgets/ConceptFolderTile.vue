<template>
  <span class="folder">
    <folder-icon :size="20" />
    <span class="folder-name">{{ name }}</span>
    <span class="folder-count" v-if="count !== null">{{ count }}</span>
  </span>
</template>

<script setup>
import { FolderIcon } from 'lucide-vue-next'

defineProps({
  count: { type: Number, default: null },
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

  &:hover {
    background: var(--background-selectable);
  }
}

.folder-name {
  font-weight: 600;
}

.folder-count {
  color: var(--text-alt);
}
</style>
