<template>
  <teleport to="body">
    <div
      class="milestone-popover"
      :class="{ dark: isDarkTheme }"
      :style="position"
      @mouseenter="keep"
      @mouseleave="hide"
      v-if="group"
    >
      <div class="milestone-popover-date">{{ group.date }}</div>
      <div
        class="milestone-popover-item"
        :class="{ pointer: canEdit }"
        :key="`milestone-popover-${milestone.id}`"
        @click="emit('edit', milestone)"
        v-for="milestone in group.milestones"
      >
        <span
          class="milestone-popover-color"
          :style="{ background: getMilestoneColor(milestone) }"
        ></span>
        <span class="milestone-popover-name">{{ milestone.name }}</span>
        <span class="milestone-popover-type">
          {{ $t(`schedule.milestone.types.${milestone.milestone_type}`) }}
        </span>
        <span class="milestone-popover-status" :class="milestone.status">
          {{ $t(`schedule.milestone.statuses.${milestone.status}`) }}
        </span>
      </div>
    </div>
  </teleport>
</template>

<script setup>
/*
 * Lists the milestones of a schedule header flag. It owns its hover state so
 * showing it does not re-render the whole schedule.
 */
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useStore } from 'vuex'

import { getMilestoneColor } from '@/lib/milestones'

const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------

defineProps({
  canEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['edit'])

// State
// --------------------------------------------------------------------------

const group = shallowRef(null)
const position = shallowRef({})
let hideTimeout = null

// Computed
// --------------------------------------------------------------------------

const isDarkTheme = computed(() => store.getters.isDarkTheme)

// Functions
// --------------------------------------------------------------------------

const show = (newGroup, target) => {
  clearTimeout(hideTimeout)
  const rect = target.getBoundingClientRect()
  group.value = newGroup
  position.value = { left: `${rect.left}px`, top: `${rect.bottom + 4}px` }
}

// Delayed so the pointer can travel from the flag into the popover.
const hide = ({ immediate = false } = {}) => {
  clearTimeout(hideTimeout)
  if (immediate === true) {
    group.value = null
  } else {
    hideTimeout = setTimeout(() => {
      group.value = null
    }, 200)
  }
}

const keep = () => {
  clearTimeout(hideTimeout)
}

defineExpose({ hide, show })

// Lifecycle
// --------------------------------------------------------------------------

onBeforeUnmount(() => {
  clearTimeout(hideTimeout)
})
</script>

<style lang="scss" scoped>
.milestone-popover {
  background: $white;
  border: 1px solid #eee;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  color: $grey-strong;
  font-size: 0.8em;
  min-width: 200px;
  padding: 6px 0;
  position: fixed;
  z-index: 1000;

  &.dark {
    background: $dark-grey-lighter;
    border-color: $dark-grey;
    color: $white;
  }
}

.milestone-popover-date {
  color: $grey;
  padding: 0 10px 4px;
}

.milestone-popover-item {
  align-items: center;
  display: flex;
  gap: 6px;
  padding: 3px 10px;

  &.pointer:hover {
    background: rgba(200, 200, 200, 0.2);
  }
}

.milestone-popover-color {
  border-radius: 2px;
  flex-shrink: 0;
  height: 12px;
  width: 4px;
}

.milestone-popover-name {
  flex: 1;
  font-weight: bold;
}

.milestone-popover-type {
  color: $grey;
}

.milestone-popover-status {
  background: rgba(150, 150, 150, 0.2);
  border-radius: 6px;
  font-size: 0.9em;
  padding: 0 5px;
  text-transform: uppercase;

  &.wfa {
    background: $purple-strong;
    color: $white;
  }

  &.done {
    background: $green;
    color: $white;
  }
}
</style>
