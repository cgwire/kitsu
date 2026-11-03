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
      <div class="milestone-popover-header">
        <span class="milestone-popover-date">{{ displayDate }}</span>
        <department-name
          :department="departmentOf(group.milestones[0])"
          no-padding
          v-if="
            group.milestones.length === 1 && departmentOf(group.milestones[0])
          "
        />
      </div>
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
        <div class="milestone-popover-body">
          <div class="milestone-popover-name">{{ milestone.name }}</div>
          <div class="milestone-popover-meta">
            <span>
              {{ $t(`schedule.milestone.types.${milestone.milestone_type}`) }}
            </span>
            <department-name
              :department="departmentOf(milestone)"
              no-padding
              v-if="group.milestones.length > 1 && departmentOf(milestone)"
            />
          </div>
        </div>
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
import { formatDisplayDate } from '@/lib/time'

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

const displayDate = computed(() =>
  formatDisplayDate(group.value?.date, store.getters.dateFormat)
)
const isDarkTheme = computed(() => store.getters.isDarkTheme)

// Functions
// --------------------------------------------------------------------------

const departmentOf = milestone =>
  store.getters.departmentMap.get(milestone.department_id)

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
  max-width: 280px;
  min-width: 200px;
  padding: 6px 0;
  position: fixed;
  z-index: 1000;
}

.milestone-popover-header {
  align-items: center;
  border-bottom: 1px solid var(--border-alt);
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin-bottom: 4px;
  padding: 0 12px 6px;
}

.milestone-popover-date {
  color: var(--text-alt);
  flex: 1;
  font-size: 1.1em;
  white-space: nowrap;
}

.milestone-popover-item {
  display: flex;
  gap: 8px;
  padding: 5px 12px;

  &.pointer:hover {
    background: var(--background-hover);
  }
}

.milestone-popover-color {
  border-radius: 2px;
  flex-shrink: 0;
  width: 4px;
}

.milestone-popover-body {
  min-width: 0;
}

.milestone-popover-name {
  font-size: 1.1em;
  font-weight: bold;
  overflow-wrap: anywhere;
}

.milestone-popover-meta {
  align-items: center;
  color: var(--text-alt);
  display: flex;
  gap: 8px;
  margin-top: 2px;
}
</style>
