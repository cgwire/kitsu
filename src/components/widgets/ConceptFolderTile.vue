<template>
  <span class="folder" :class="{ highlighted }">
    <component :is="highlighted ? FolderOpenIcon : FolderIcon" :size="20" />
    <span class="folder-name">{{ name }}</span>
    <span class="folder-count" v-if="count !== null">{{ count }}</span>
  </span>
</template>

<script setup>
import { FolderIcon, FolderOpenIcon } from 'lucide-vue-next'

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
  // alt-2 is white in light: the tile must stand out from the panel
  background: var(--background-alt-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  color: var(--text);
  cursor: pointer;
  padding: 0.6em 1em;
  transition:
    background 150ms ease-out,
    border-color 150ms ease-out;

  &:hover {
    background: var(--background-hover);
    border-color: var(--text-alt);
  }

  // same soft wash as the hover, the ring carries the drop target
  &.highlighted {
    background: rgba(var(--background-selectable-rgb), 0.35);
    border-color: var(--background-selected);
    box-shadow: 0 0 0 2px var(--background-selected);
  }
}

.folder-name {
  font-weight: 600;
}

.folder-count {
  background: var(--background-tag);
  border-radius: 999px;
  color: var(--text-alt);
  font-size: 0.85em;
  font-weight: 600;
  line-height: 1;
  min-width: 1.6em;
  padding: 0.3em 0.5em;
  text-align: center;
}
</style>
