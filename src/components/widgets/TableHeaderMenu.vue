<template>
  <div class="header-menu hidden">
    <div
      class="menu-item"
      role="button"
      tabindex="0"
      @click="$emit('minimize-clicked')"
      @keydown.enter.prevent="$emit('minimize-clicked')"
      @keydown.space.prevent="$emit('minimize-clicked')"
    >
      <maximize2-icon class="menu-icon" :size="14" v-if="isMinimized" />
      <minimize2-icon class="menu-icon" :size="14" v-else />
      <span v-if="isMinimized">
        {{ $t('main.maximize') }}
      </span>
      <span v-else>{{ $t('main.minimize') }}</span>
    </div>
    <div
      class="menu-item"
      role="button"
      tabindex="0"
      @click="$emit('sort-by-clicked')"
      @keydown.enter.prevent="$emit('sort-by-clicked')"
      @keydown.space.prevent="$emit('sort-by-clicked')"
    >
      <arrow-up-down-icon class="menu-icon" :size="14" />
      {{ $t('main.sort_by') }}
    </div>
    <div
      class="menu-item"
      role="button"
      tabindex="0"
      @click="$emit('select-column')"
      @keydown.enter.prevent="$emit('select-column')"
      @keydown.space.prevent="$emit('select-column')"
    >
      <mouse-pointer-click-icon class="menu-icon" :size="14" />
      {{ $t('main.select_column') }}
    </div>
    <div
      class="menu-item"
      role="button"
      tabindex="0"
      @click="$emit('toggle-stick')"
      @keydown.enter.prevent="$emit('toggle-stick')"
      @keydown.space.prevent="$emit('toggle-stick')"
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
      @click="$emit('delete-all-clicked')"
      @keydown.enter.prevent="$emit('delete-all-clicked')"
      @keydown.space.prevent="$emit('delete-all-clicked')"
      v-if="isEditAllowed"
    >
      <trash2-icon class="menu-icon" :size="14" />
      {{ $t('main.delete_all') }}
    </div>
  </div>
</template>

<script setup>
import {
  ArrowUpDownIcon,
  Maximize2Icon,
  Minimize2Icon,
  MousePointerClickIcon,
  PinIcon,
  PinOffIcon,
  Trash2Icon
} from 'lucide-vue-next'

defineProps({
  isMinimized: {
    type: Boolean,
    default: false
  },
  isEditAllowed: {
    type: Boolean,
    default: false
  },
  isSticked: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'delete-all-clicked',
  'minimize-clicked',
  'select-column',
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
  z-index: 100;
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
