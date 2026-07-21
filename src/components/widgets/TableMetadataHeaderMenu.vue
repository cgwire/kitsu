<template>
  <div class="header-menu hidden">
    <div
      class="menu-item"
      role="button"
      tabindex="0"
      @click="$emit('edit-clicked')"
      @keydown.enter.prevent="$emit('edit-clicked')"
      @keydown.space.prevent="$emit('edit-clicked')"
      v-if="isEditAllowed"
    >
      <pencil-icon class="menu-icon" :size="14" />
      {{ $t('main.edit') }}
    </div>
    <div
      class="menu-item"
      role="button"
      tabindex="0"
      @click="$emit('sort-by-clicked')"
      @keydown.enter.prevent="$emit('sort-by-clicked')"
      @keydown.space.prevent="$emit('sort-by-clicked')"
      v-if="showSort"
    >
      <arrow-up-down-icon class="menu-icon" :size="14" />
      {{ $t('main.sort_by') }}
    </div>
    <div
      class="menu-item"
      role="button"
      tabindex="0"
      @click="$emit('toggle-stick')"
      @keydown.enter.prevent="$emit('toggle-stick')"
      @keydown.space.prevent="$emit('toggle-stick')"
      v-if="showStick"
    >
      <pin-off-icon class="menu-icon" :size="14" v-if="isSticked" />
      <pin-icon class="menu-icon" :size="14" v-else />
      <template v-if="isSticked">
        {{ $t('main.unstick') }}
      </template>
      <template v-else>
        {{ $t('main.stick') }}
      </template>
    </div>
    <div
      class="menu-item destructive"
      role="button"
      tabindex="0"
      @click="$emit('delete-clicked')"
      @keydown.enter.prevent="$emit('delete-clicked')"
      @keydown.space.prevent="$emit('delete-clicked')"
      v-if="isEditAllowed"
    >
      <trash2-icon class="menu-icon" :size="14" />
      {{ $t('main.delete') }}
    </div>
  </div>
</template>

<script setup>
import {
  ArrowUpDownIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  Trash2Icon
} from 'lucide-vue-next'

defineProps({
  isEditAllowed: {
    type: Boolean,
    default: false
  },
  isSticked: {
    type: Boolean,
    default: false
  },
  showSort: {
    type: Boolean,
    default: true
  },
  showStick: {
    type: Boolean,
    default: true
  }
})

defineEmits([
  'delete-clicked',
  'edit-clicked',
  'sort-by-clicked',
  'toggle-stick'
])
</script>

<style lang="scss" scoped>
.header-menu {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 2px 6px var(--box-shadow);
  color: var(--text);
  overflow: hidden;
  padding: 0.3em 0;
  position: absolute;
  top: 90px;
  width: 128px;
  z-index: 1001; // Needed to be above the sticky cells
}

.menu-item {
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 0.6em;
  padding: 0.5em 0.9em;

  &:hover {
    background: var(--background-selectable);
  }

  &:focus-visible {
    outline: 2px solid $green;
    outline-offset: -2px;
  }

  // "destructive" and not "delete": Bulma globally styles .delete as a
  // round close button and hijacks the entry rendering.
  &.destructive {
    color: $red;

    &:hover {
      background: rgba($red, 0.1);
    }
  }
}

.menu-icon {
  flex-shrink: 0;
  opacity: 0.7;
}
</style>
