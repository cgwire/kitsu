<template>
  <div
    class="entity-line child-line"
    :class="{ multiline }"
    :style="{
      ...(multiline && timelineMultilineStyle(childElement)),
      ...(subchildren && timelineSubchildrenStyle(childElement))
    }"
    v-show="!rootElement.loading"
  >
    <template v-if="withStatuses">
      <template :key="field" v-for="{ field, status } in STATUS_DATES">
        <span
          class="status-date"
          :class="[
            `status-date-${status}`,
            { 'status-date-gap': hasDateGap(field) }
          ]"
          :style="dateStatusStyle(childElement[field])"
          :title="statuses[status].name"
          v-if="childElement[field]"
        >
        </span>
      </template>
    </template>

    <template v-if="withTimesheets && rootElement.timesheet">
      <div
        class="timesheet"
        :style="
          timesheetStyle(timesheet, childElement, rootElement, withEstimations)
        "
        :title="`${formatDuration(timesheet.duration)} ${isDurationInHours ? $t('main.hours_spent', { count: formatDuration(timesheet.duration, false) }) : $t('main.days_spent', { count: formatDuration(timesheet.duration, false) })}`"
        :key="timesheet.id"
        v-for="timesheet in taskTimesheets(rootElement, childElement.id)"
      ></div>
    </template>

    <div
      class="timebar timebar-ghost timebar-ghost-before"
      :title="`${childElement.previousElement.name} (${displayDate(childElement.previousElement.startDate)} - ${displayDate(childElement.previousElement.endDate)})`"
      :class="{
        'with-timesheets': withTimesheets
      }"
      :style="
        timebarChildStyle(
          childElement.previousElement,
          rootElement,
          multiline,
          50
        )
      "
      v-if="withGhosts && childElement.previousElement"
    ></div>

    <div
      class="timebar timebar-ghost timebar-ghost-after"
      :title="`${childElement.nextElement.name} (${displayDate(childElement.nextElement.startDate)} - ${displayDate(childElement.nextElement.endDate)})`"
      :class="{
        'with-timesheets': withTimesheets
      }"
      :style="
        timebarChildStyle(childElement.nextElement, rootElement, multiline, 50)
      "
      v-if="withGhosts && childElement.nextElement"
    ></div>

    <div
      class="timebar"
      :class="{
        selected,
        'timebar-subchildren': subchildren,
        'with-timesheets': withTimesheets,
        invalid: isOverlapping(childElement)
      }"
      :title="`${multiline && childElement.project_name ? `${childElement.project_name} - ` : ''}${childElement.name} (${displayDate(childElement.startDate)} - ${displayDate(childElement.endDate)})`"
      :style="
        timebarChildStyle(
          childElement,
          rootElement,
          multiline,
          withTimesheets && 25,
          isDarkTheme ? 'black' : 'white'
        )
      "
      v-show="subchildren || isVisible(childElement)"
      role="button"
      tabindex="0"
      @click="$emit('bar-click')"
      @keydown.enter.prevent="$emit('bar-enter')"
      v-if="withEstimations"
    >
      <div
        class="timebar-left-hand"
        @mousedown="$emit('left-handle-down', childElement, $event)"
        @touchstart="$emit('left-handle-down', childElement, $event)"
        v-if="hasHandles"
      ></div>
      <div
        class="timebar-center"
        :class="{
          ellipsis: multiline || subchildren,
          'has-text-centered': subchildren
        }"
        @mousedown="$emit('bar-down', childElement, $event)"
        @touchstart="$emit('bar-down', childElement, $event)"
      >
        <template v-if="multiline && childElement.project_name">
          <b>{{ childElement.project_name }}</b>
          <br />
        </template>
        <template v-if="multiline || subchildren">
          {{ childElement.name }}
        </template>
      </div>
      <div
        class="timebar-right-hand"
        @mousedown="$emit('right-handle-down', childElement, $event)"
        @touchstart="$emit('right-handle-down', childElement, $event)"
        v-if="hasHandles"
      ></div>
    </div>

    <div v-if="subchildren && childElement.children.size" class="subchildren">
      <schedule-person-row
        :key="personId"
        v-for="[personId, subchild] in childElement.children"
        :person-id="personId"
        :tasks="subchild"
        :root-element="rootElement"
        :child-element="childElement"
        :days-off-range="
          cachedDayOffRange(rootElement.people[personId].daysOff)
        "
        :reassignable="reassignable"
        :selected-key="selectedKey"
        :with-handles="withHandles"
        @bar-down="(task, event) => $emit('bar-down', task, event)"
        @left-handle-down="
          (task, event) => $emit('left-handle-down', task, event)
        "
        @right-handle-down="
          (task, event) => $emit('right-handle-down', task, event)
        "
        @bar-click="task => $emit('task-click', task)"
        @bar-enter="task => $emit('task-enter', task)"
      />
    </div>
  </div>
</template>

<script setup>
/*
 * One entity row of the schedule widget: the bar of a sequence, asset type
 * or episode and, under it, one person row per assignee. A component of
 * its own so a drag frame or a selection change re-renders this row alone.
 */
import { computed, inject } from 'vue'

import SchedulePersonRow from '@/components/schedule/SchedulePersonRow.vue'

// the status dates shown as marks on the row, by task status
const STATUS_DATES = [
  { field: 'real_start_date', status: 'wip' },
  { field: 'end_date', status: 'wfa' },
  { field: 'done_date', status: 'done' }
]

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  rootElement: { type: Object, default: () => ({}) },
  childElement: { type: Object, default: () => ({}) },
  multiline: { type: Boolean, default: false },
  subchildren: { type: Boolean, default: false },
  reassignable: { type: Boolean, default: false },
  withEstimations: { type: Boolean, default: true },
  withGhosts: { type: Boolean, default: false },
  withStatuses: { type: Boolean, default: false },
  withTimesheets: { type: Boolean, default: false },
  // ids selected among the entity and its tasks, and whether the single
  // selected item is one of them: the other rows never update on a
  // selection or a drag
  selectedKey: { type: String, default: '' },
  withHandles: { type: Boolean, default: false }
})

defineEmits([
  'bar-click',
  'bar-down',
  'bar-enter',
  'left-handle-down',
  'right-handle-down',
  'task-click',
  'task-enter'
])

// The style and title helpers close over the widget state (zoom, dates,
// selection): the widget provides them rather than passing a dozen
// function props down two levels.
const {
  cachedDayOffRange,
  dateStatusStyle,
  displayDate,
  formatDuration,
  isDarkTheme,
  isDurationInHours,
  isOverlapping,
  isVisible,
  statuses,
  taskTimesheets,
  timebarChildStyle,
  timelineMultilineStyle,
  timelineSubchildrenStyle,
  timesheetStyle
} = inject('scheduleRowHelpers')

// Computed
// --------------------------------------------------------------------------
const selected = computed(() =>
  props.selectedKey.split(',').includes(props.childElement.id)
)

const hasHandles = computed(
  () =>
    props.withHandles &&
    selected.value &&
    props.childElement.editable &&
    !props.childElement.unresizable
)

// Functions
// --------------------------------------------------------------------------
// two marks on the same day: the mark steps aside so both show
const hasDateGap = field => {
  const day = props.childElement[field].slice(0, 10)
  return STATUS_DATES.some(
    other =>
      other.field !== field &&
      props.childElement[other.field]?.slice(0, 10) === day
  )
}
</script>
