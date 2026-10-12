<template>
  <div
    class="subchild"
    :class="{ 'drop-item-target': reassignable }"
    :style="{ height: `${40 * nbLines(tasks)}px` }"
    :data-entity-type-id="childElement.object_id"
    :data-person-id="personId"
  >
    <div
      class="day-off"
      :key="`dayoff-${dayOff.id}-${index}`"
      :style="dayOffStyle(dayOff)"
      :title="dayOff.description"
      v-for="(dayOff, index) in daysOffRange"
    >
      <briefcase-icon class="day-off-icon" :size="14" />
    </div>
    <div
      class="timebar"
      :class="{ selected: isSelected(task) }"
      :key="index"
      :style="barStyle(task, rootElement, isSelected(task))"
      :title="barTitle(task)"
      v-for="(task, index) in tasks"
    >
      <div
        class="timebar-left-hand"
        @mousedown="$emit('left-handle-down', task, $event)"
        @touchstart="$emit('left-handle-down', task, $event)"
        v-if="hasHandles(task)"
      ></div>
      <div
        class="timebar-center ellipsis"
        role="button"
        tabindex="0"
        @mousedown="$emit('bar-down', task, $event)"
        @touchstart="$emit('bar-down', task, $event)"
        @click="$emit('bar-click', task)"
        @keydown.enter.prevent="$emit('bar-enter', task)"
      >
        {{ task.entity.name }}
      </div>
      <div
        class="timebar-right-hand"
        @mousedown="$emit('right-handle-down', task, $event)"
        @touchstart="$emit('right-handle-down', task, $event)"
        v-if="hasHandles(task)"
      ></div>
    </div>
  </div>
</template>

<script setup>
/*
 * One person row of the schedule widget: the task bars of one assignee
 * under an entity row. A component of its own so a frame of drag or a
 * selection change re-renders this row alone, not every bar of the
 * schedule. The geometry helpers stay in Schedule.vue (they read its zoom
 * and date range) and come in as props; the selection comes in as the ids
 * of this row only, so the rows of the other people never follow it.
 */
import { BriefcaseIcon } from 'lucide-vue-next'
import { computed } from 'vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  personId: { type: String, default: '' },
  tasks: { type: Array, default: () => [] },
  rootElement: { type: Object, default: () => ({}) },
  childElement: { type: Object, default: () => ({}) },
  daysOffRange: { type: Array, default: () => [] },
  reassignable: { type: Boolean, default: false },
  // ids of the selected tasks of this row, comma separated
  selectedKey: { type: String, default: '' },
  withHandles: { type: Boolean, default: false },
  barStyle: { type: Function, default: () => ({}) },
  barTitle: { type: Function, default: () => '' },
  dayOffStyle: { type: Function, default: () => ({}) },
  nbLines: { type: Function, default: () => 1 }
})

defineEmits([
  'bar-click',
  'bar-down',
  'bar-enter',
  'left-handle-down',
  'right-handle-down'
])

// Computed
// --------------------------------------------------------------------------
const selectedIds = computed(
  () => new Set(props.selectedKey.split(',').filter(Boolean))
)

// Functions
// --------------------------------------------------------------------------
const isSelected = task => selectedIds.value.has(task.id)

const hasHandles = task =>
  props.withHandles && isSelected(task) && task.editable && !task.unresizable
</script>
