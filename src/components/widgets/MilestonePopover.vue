<template>
  <teleport to="body">
    <div
      ref="popoverRef"
      class="milestone-popover"
      :class="{ dark: isDarkTheme }"
      :style="position"
      @focusin="keep"
      @focusout="hide"
      @keydown.esc.stop="close"
      @mouseenter="keep"
      @mouseleave="hide"
      v-if="group"
    >
      <div class="milestone-popover-date">{{ group.date }}</div>
      <div
        class="milestone-popover-item"
        :class="{ pointer: canEdit }"
        :key="`milestone-popover-${milestone.id}`"
        :role="canEdit ? 'button' : undefined"
        :tabindex="canEdit ? 0 : undefined"
        @click="edit(milestone)"
        @keydown.enter.prevent="edit(milestone)"
        @keydown.space.prevent="edit(milestone)"
        v-for="milestone in group.milestones"
      >
        <span
          class="milestone-popover-color"
          :style="{ background: getMilestoneColor(milestone) }"
        ></span>
        <span class="milestone-popover-name">{{ milestone.name }}</span>
        <department-name
          :department="departmentMap.get(milestone.department_id)"
          no-padding
          v-if="departmentMap.get(milestone.department_id)"
        />
        <span class="milestone-popover-type">
          {{ $t(`schedule.milestone.types.${milestone.milestone_type}`) }}
        </span>
      </div>
    </div>
  </teleport>
</template>

<script setup>
/*
 * Lists the milestones of a schedule header flag. It owns its hover state so
 * showing it does not re-render the whole schedule.
 *
 * shortcut: Tab past the last item sends the focus to the end of the page, not
 * to the next flag. Add a focus trap if keyboard users report it.
 */
import { computed, nextTick, onBeforeUnmount, ref, shallowRef } from 'vue'
import { useStore } from 'vuex'

import { getMilestoneColor } from '@/lib/milestones'

import DepartmentName from '@/components/widgets/DepartmentName.vue'

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
const popoverRef = ref(null)
let flag = null
let hideTimeout = null

// Computed
// --------------------------------------------------------------------------

const departmentMap = computed(() => store.getters.departmentMap)
const isDarkTheme = computed(() => store.getters.isDarkTheme)

// Functions
// --------------------------------------------------------------------------

const show = (newGroup, target, { moveFocus = false } = {}) => {
  clearTimeout(hideTimeout)
  const rect = target.getBoundingClientRect()
  flag = target
  group.value = newGroup
  position.value = { left: `${rect.left}px`, top: `${rect.bottom + 4}px` }
  if (moveFocus) {
    nextTick(() => popoverRef.value?.querySelector('[role="button"]')?.focus())
  }
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

const close = () => {
  flag?.focus()
  hide({ immediate: true })
}

// The focus goes back to the flag first: the modal opening next restores it
// on close, and the popover items are gone by then.
const edit = milestone => {
  close()
  emit('edit', milestone)
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
  background: var(--background-alt-2);
  border: 1px solid var(--border);
  border-radius: 5px;
  box-shadow: 0 2px 6px var(--box-shadow);
  color: var(--text-strong);
  font-size: 0.8em;
  min-width: 200px;
  padding: 6px 0;
  position: fixed;
  z-index: 1000;
}

.milestone-popover-date {
  color: var(--text-alt);
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
  color: var(--text-alt);
}
</style>
