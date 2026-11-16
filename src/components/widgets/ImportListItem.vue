<template>
  <div
    class="import-list-item"
    role="button"
    tabindex="0"
    :title="$t('main.click_to_add')"
    @click="emit('add')"
    @keydown.enter.prevent="emit('add')"
    @keydown.space.prevent="emit('add')"
  >
    <div class="item-line">
      <slot />
    </div>
    <plus-icon class="add-icon" :size="16" />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { PlusIcon } from 'lucide-vue-next'

// Emits
// --------------------------------------------------------------------------
const emit = defineEmits(['add'])
</script>

<style lang="scss" scoped>
.import-list-item {
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  gap: 0.5em;
  justify-content: space-between;
  padding: 0.3em 0.5em;

  & + & {
    margin-top: 2px;
  }

  .item-line {
    align-items: center;
    display: flex;
    min-width: 0;

    // The task type tags set a default cursor of their own.
    :deep(*) {
      cursor: pointer;
    }
  }

  &:hover,
  &:focus-visible {
    background: var(--background-selectable);
    color: var(--text-strong);

    .add-icon {
      opacity: 1;
    }
  }
}

.add-icon {
  color: var(--text-strong);
  flex: 0 0 auto;
  opacity: 0;
}
</style>
