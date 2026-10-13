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
      <span
        class="status-date status-date-wip"
        :class="{
          'status-date-gap':
            childElement.real_start_date.slice(0, 10) ===
              childElement.end_date?.slice(0, 10) ||
            childElement.real_start_date.slice(0, 10) ===
              childElement.done_date?.slice(0, 10)
        }"
        :style="dateStatusStyle(childElement.real_start_date)"
        :title="statuses.wip.name"
        v-if="childElement.real_start_date"
      >
      </span>
      <span
        class="status-date status-date-wfa"
        :class="{
          'status-date-gap':
            childElement.end_date.slice(0, 10) ===
              childElement.real_start_date?.slice(0, 10) ||
            childElement.end_date.slice(0, 10) ===
              childElement.done_date?.slice(0, 10)
        }"
        :style="dateStatusStyle(childElement.end_date)"
        :title="statuses.wfa.name"
        v-if="childElement.end_date"
      >
      </span>
      <span
        class="status-date status-date-done"
        :class="{
          'status-date-gap':
            childElement.done_date.slice(0, 10) ===
              childElement.real_start_date?.slice(0, 10) ||
            childElement.done_date.slice(0, 10) ===
              childElement.end_date?.slice(0, 10)
        }"
        :style="dateStatusStyle(childElement.done_date)"
        :title="statuses.done.name"
        v-if="childElement.done_date"
      >
      </span>
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
        :bar-style="timebarSubchildStyle"
        :bar-title="timebarSubchildTitle"
        :day-off-style="dayOffStyle"
        :nb-lines="getNbLines"
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
import { computed, inject } from 'vue'

import SchedulePersonRow from '@/components/schedule/SchedulePersonRow.vue'

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
  dayOffStyle,
  displayDate,
  formatDuration,
  getNbLines,
  isDarkTheme,
  isDurationInHours,
  isOverlapping,
  isVisible,
  statuses,
  taskTimesheets,
  timebarChildStyle,
  timebarSubchildStyle,
  timebarSubchildTitle,
  timelineMultilineStyle,
  timelineSubchildrenStyle,
  timesheetStyle
} = inject('scheduleRowHelpers')

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
</script>
