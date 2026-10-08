<template>
  <div class="loading-wrapper" v-if="isLoading">
    <spinner />
  </div>
  <div class="user-calendar mt1" v-else>
    <div class="calendar-toolbar">
      <div class="calendar-toolbar-group">
        <button
          class="calendar-button calendar-nav-button"
          data-action="prev"
          type="button"
          :aria-label="t('main.previous')"
          @click="getApi().prev()"
        >
          <chevron-left-icon :size="18" />
        </button>
        <button
          class="calendar-button calendar-nav-button"
          data-action="next"
          type="button"
          :aria-label="t('main.next')"
          @click="getApi().next()"
        >
          <chevron-right-icon :size="18" />
        </button>
        <button
          class="calendar-button"
          data-action="today"
          type="button"
          :disabled="isTodayInView"
          @click="getApi().today()"
        >
          {{ t('schedule.today') }}
        </button>
      </div>
      <h2 class="calendar-title">{{ title }}</h2>
      <div class="calendar-toolbar-group">
        <span class="calendar-total" v-if="periodTotal">
          {{ periodTotal }}
        </span>
        <div class="calendar-segmented">
          <button
            class="calendar-button"
            :class="{ active: currentViewType === view.type }"
            :data-action="view.type"
            :key="view.type"
            type="button"
            @click="getApi().changeView(view.type)"
            v-for="view in views"
          >
            {{ view.label }}
          </button>
        </div>
      </div>
    </div>
    <div class="calendar-body" ref="rootRef">
      <div class="week-rail" v-if="weekRows.length">
        <div
          class="week-total"
          :class="{ attached: row.attached, 'attached-next': row.attachedNext }"
          :key="`${row.top}-${row.label}`"
          :style="{ top: `${row.top}px`, height: `${row.height}px` }"
          v-for="row in weekRows"
        >
          {{ row.label }}
        </div>
      </div>
      <full-calendar
        ref="calendarRef"
        class="app-calendar"
        :options="calendarOptions"
      >
        <template #dayCellContent="arg">
          <span class="day-cell-content">
            <span>{{ arg.dayNumberText }}</span>
            <span
              class="day-hours"
              role="button"
              tabindex="0"
              @click.stop="emit('time-clicked', toDateKey(arg.date))"
              @keydown.enter.stop.prevent="
                emit('time-clicked', toDateKey(arg.date))
              "
              v-if="timeByDay.get(toDateKey(arg.date))"
            >
              {{ formatHours(timeByDay.get(toDateKey(arg.date))) }}
            </span>
          </span>
        </template>
        <template #eventContent="{ event }">
          <div
            class="calendar-day-off"
            v-if="event.extendedProps.isOff"
            :title="event.extendedProps.description"
          >
            <span class="calendar-day-off-title" v-if="event.title">
              <briefcase-icon :size="14" />
              {{ event.title }}
            </span>
          </div>
          <div
            class="calendar-event"
            :class="{
              selected: currentTask?.id === event.extendedProps.taskId
            }"
            :style="{
              background: `${event.extendedProps.typeColor}26`,
              '--event-color': event.extendedProps.typeColor
            }"
            :title="getEventTooltip(event)"
            role="button"
            tabindex="0"
            @click="onEventClicked(event)"
            @keydown.enter.prevent="onEventClicked(event)"
            @keydown.space.prevent="onEventClicked(event)"
            v-else
          >
            <span class="event-thumbnail">
              <img
                loading="lazy"
                :src="event.extendedProps.previewPath"
                alt=""
                v-if="event.extendedProps.previewPath"
              />
            </span>
            <span
              class="status-dot"
              :style="{
                background: getStatusColor(event.extendedProps.taskStatus)
              }"
              :title="event.extendedProps.taskStatus.name"
            ></span>
            <div class="event-title">
              <span class="ellipsis">{{ event.extendedProps.title[0] }}</span>
              <span class="ellipsis" v-if="event.extendedProps.title[1]">
                / {{ event.extendedProps.title[1] }}
              </span>
              <span class="ellipsis" v-if="event.extendedProps.title[2]">
                / {{ event.extendedProps.title[2] }}
              </span>
            </div>
          </div>
        </template>
      </full-calendar>
    </div>
  </div>
</template>

<script setup>
import allLocales from '@fullcalendar/core/locales-all'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import multiMonthPlugin from '@fullcalendar/multimonth'
import FullCalendar from '@fullcalendar/vue3'
import {
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { localeCode } from '@/lib/lang'
import { hasPreviewFilePicture } from '@/lib/preview'
import { getStatusColor } from '@/lib/stats'
import { getDayOffRange } from '@/lib/time'

import Spinner from '@/components/widgets/Spinner.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  },
  daysOff: {
    type: Array,
    default: () => []
  },
  timeSpents: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['dates-changed', 'time-clicked'])

// State
// --------------------------------------------------------------------------
const currentTask = ref(null)
const calendarRef = ref(null)
const rootRef = ref(null)
const weekRows = ref([])
const currentRange = ref(null)
const currentViewType = ref('')
const periodTotal = ref('')
const title = ref('')

// a month grid leaves a few pixels per event on a phone: the list reads
const isPhone = Boolean(window.matchMedia?.('(max-width: 768px)').matches)

const calendarOptions = ref({
  plugins: [dayGridPlugin, listPlugin, multiMonthPlugin],
  headerToolbar: false,
  initialView: isPhone ? 'listWeek' : 'dayGridMonth',
  firstDay: 1,
  locales: allLocales,
  locale: localeCode.value,
  // day numbers and week-view day headers open the timesheet of that day
  navLinks: true,
  navLinkDayClick: date => emit('time-clicked', toDateKey(date)),
  datesSet: info => onDatesSet(info)
})

// FullCalendar only tracks window resizes: when the task side panel opens,
// the container shrinks and the grid keeps its stale width (the calendar
// then scrolls sideways). Nudge it on every container resize.
const resizeObserver = new ResizeObserver(() => {
  calendarRef.value?.getApi().updateSize()
  computeWeekRows()
})

// Computed
// --------------------------------------------------------------------------
const previewFileStatusMap = computed(() => store.getters.previewFileStatusMap)
const productionMap = computed(() => store.getters.productionMap)
const taskMap = computed(() => store.getters.taskMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const timeByDay = computed(() => {
  const byDay = new Map()
  props.timeSpents.forEach(timeSpent => {
    const key = timeSpent.date?.slice(0, 10)
    byDay.set(key, (byDay.get(key) || 0) + timeSpent.duration)
  })
  return byDay
})

// multiMonthYear stays wired up, only its button is left out for now
const views = computed(() => [
  { type: 'listWeek', label: t('main.list') },
  { type: 'dayGridMonth', label: t('main.month') },
  { type: 'dayGridWeek', label: t('main.week') }
])

const isTodayInView = computed(() => {
  const today = toDateKey(new Date())
  return Boolean(
    currentRange.value &&
    today >= currentRange.value.start &&
    today < currentRange.value.end
  )
})

const previewFileStatuses = computed(() =>
  props.tasks.map(task =>
    previewFileStatusMap.value?.get(task.entity_preview_file_id)
  )
)

// Functions
// --------------------------------------------------------------------------
const toDateKey = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-` +
  `${String(date.getDate()).padStart(2, '0')}`

// time spent durations are stored in minutes
const formatHours = minutes => {
  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`
}

const getApi = () => calendarRef.value.getApi()

// the dedicated week column lives outside the FullCalendar table, so its
// cells are aligned by measuring the rendered week rows
const computeWeekRows = () => {
  // the dedicated column only makes sense on the month grid
  if (
    !rootRef.value ||
    !props.timeSpents.length ||
    currentViewType.value !== 'dayGridMonth'
  ) {
    weekRows.value = []
    return
  }
  const rootRect = calendarRef.value.$el.getBoundingClientRect()
  const rows = rootRef.value.querySelectorAll('.fc-daygrid-body tbody tr')
  const cells = []
  Array.from(rows).forEach(row => {
    const rect = row.getBoundingClientRect()
    const total = Array.from(
      row.querySelectorAll('.fc-daygrid-day[data-date]')
    ).reduce(
      (sum, cell) => sum + (timeByDay.value.get(cell.dataset.date) || 0),
      0
    )
    if (total) {
      const top = rect.top - rootRect.top
      const previous = cells[cells.length - 1]
      // contiguous cells fuse into one block: square the shared corners
      // and draw a separator instead
      const attached =
        Boolean(previous) && Math.abs(previous.top + previous.height - top) < 2
      if (attached) {
        previous.attachedNext = true
      }
      cells.push({
        top,
        height: rect.height,
        label: formatHours(total),
        attached,
        attachedNext: false
      })
    }
  })
  weekRows.value = cells
}

const refreshPeriodTotal = () => {
  const range = currentRange.value
  const total = range
    ? Array.from(timeByDay.value)
        .filter(([date]) => date >= range.start && date < range.end)
        .reduce((sum, [, minutes]) => sum + minutes, 0)
    : 0
  periodTotal.value = total ? formatHours(total) : ''
}

const refreshTimeDisplays = () => {
  computeWeekRows()
  refreshPeriodTotal()
}

const onDatesSet = info => {
  currentViewType.value = info.view.type
  title.value = info.view.title
  // currentStart/currentEnd cover the actual month or week, without the
  // leading and trailing days of the neighbour months
  currentRange.value = {
    start: toDateKey(info.view.currentStart),
    end: toDateKey(info.view.currentEnd)
  }
  const endDate = new Date(info.end)
  endDate.setDate(endDate.getDate() - 1)
  emit('dates-changed', {
    start: toDateKey(info.start),
    end: toDateKey(endDate)
  })
  nextTick(refreshTimeDisplays)
}

// Zou answers 404 for the picture of a preview file until a job has built
// it. Once ready, a new URL gets past any 404 kept for the plain one.
const getPreviewPath = previewFileId => {
  const status = previewFileStatusMap.value?.get(previewFileId)
  if (!previewFileId || !hasPreviewFilePicture(status)) {
    return null
  }
  const path = `/api/pictures/previews/preview-files/${previewFileId}.png`
  return status === 'ready' ? `${path}?ready` : path
}

const getDayOffInfo = dayOff => {
  const { description, date, end_date } = dayOff
  const period = end_date && date !== end_date ? `${date} - ${end_date}` : date
  return `${description || t('timesheets.day_off')} (${period})`
}

const resetEvents = () => {
  if (!calendarRef.value) {
    return
  }
  const calendarApi = getApi()
  calendarApi.removeAllEvents()

  calendarApi.addEvent({
    display: 'background',
    daysOfWeek: [0, 6],
    // resolved against the local theme-aware palette defined in the styles
    backgroundColor: 'var(--calendar-weekend)',
    extendedProps: {
      isOff: true
    }
  })

  props.tasks
    .filter(task => task.start_date && task.due_date)
    .forEach(task => {
      const production = productionMap.value.get(task.project_id)
      const taskType = taskTypeMap.value.get(task.task_type_id)
      const taskStatus = taskStatusMap.value.get(task.task_status_id)
      const end = new Date(task.due_date)
      end.setDate(end.getDate() + 1)
      calendarApi.addEvent({
        title: task.full_entity_name,
        allDay: true,
        start: task.start_date,
        end,
        // the tinted chip in the eventContent slot paints itself
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        extendedProps: {
          previewPath: getPreviewPath(task.entity_preview_file_id),
          taskStatus,
          taskId: task.id,
          title: task.full_entity_name.split(' / '),
          production,
          typeColor: taskType.color,
          typeName: taskType.name
        }
      })
    })

  props.daysOff.forEach(dayOff => {
    const description = getDayOffInfo(dayOff)
    getDayOffRange([dayOff]).forEach(({ date }) => {
      calendarApi.addEvent({
        title: t('timesheets.day_off'),
        display: 'background',
        start: date,
        backgroundColor: 'var(--calendar-day-off)',
        extendedProps: {
          isOff: true,
          description
        }
      })
    })
  })
}

const onEventClicked = event => {
  const task = taskMap.value.get(event.extendedProps.taskId)
  if (!task || task === currentTask.value) {
    currentTask.value = null
    store.dispatch('clearSelectedTasks')
  } else {
    currentTask.value = task
    store.dispatch('clearSelectedTasks')
    store.dispatch('addSelectedTasks', [{ task }])
  }
}

const getEventTooltip = event => {
  const { production, taskStatus, typeName } = event.extendedProps
  return [production?.name, event.title, typeName, taskStatus.name]
    .filter(Boolean)
    .join(' · ')
}

// Watchers
// --------------------------------------------------------------------------
// the root div sits behind a v-else on isLoading, so it can appear after
// mount: observe whenever the element actually exists
watch(rootRef, el => {
  resizeObserver.disconnect()
  if (el) {
    resizeObserver.observe(el)
  }
})

watch([() => props.tasks, previewFileStatuses], () => resetEvents(), {
  deep: true
})

watch(
  () => props.daysOff,
  () => resetEvents()
)

watch(
  () => props.timeSpents,
  () => nextTick(refreshTimeDisplays)
)

watch(localeCode, code => {
  calendarOptions.value.locale = code
  calendarRef.value?.getApi().setOption('locale', code)
  title.value = calendarRef.value?.getApi().view.title || ''
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(resetEvents)

onBeforeUnmount(() => {
  resizeObserver.disconnect()
})
</script>

<style lang="scss" scoped>
.user-calendar {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 80%;
  // local theme-aware palette, consumed by FullCalendar through the
  // backgroundColor values passed in resetEvents
  --calendar-weekend: rgba(0, 0, 0, 0.045);
  --calendar-day-off: rgba(235, 170, 0, 0.14);
}

.dark .user-calendar {
  --calendar-weekend: rgba(0, 0, 0, 0.16);
  --calendar-day-off: rgba(255, 200, 80, 0.09);
}

// the week totals and the grid share one panel
.calendar-body {
  background: var(--background-panel);
  border-radius: 12px;
  display: flex;
  flex: 1;
  gap: 8px;
  min-height: 0;
  padding: 1em;
}

.app-calendar {
  flex: 1;
  height: 100%;
  min-width: 0;
}

.week-rail {
  flex-shrink: 0;
  position: relative;
  width: 52px;
}

.week-total {
  align-items: center;
  background: var(--background);
  border-radius: 8px;
  color: var(--text);
  display: flex;
  font-size: 0.75rem;
  font-weight: 600;
  justify-content: center;
  left: 0;
  position: absolute;
  right: 0;

  &.attached {
    border-top: 1px solid rgba(var(--skeleton-rgb), 0.25);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  &.attached-next {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.calendar-day-off {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 4px;
  color: var(--text);
  font-weight: 500;
  cursor: default;

  .calendar-day-off-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5em;
  }
}

.calendar-event {
  align-items: center;
  border-radius: 5px;
  color: var(--text-strong);
  cursor: pointer;
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow: hidden;
  padding: 4px 8px 4px 12px;
  position: relative;
  width: 100%;

  > * {
    flex-shrink: 0;
  }

  // inset rounded rail: a border-left would square the left corners
  &::before {
    background: var(--event-color);
    border-radius: 2px;
    bottom: 3px;
    content: '';
    left: 3px;
    position: absolute;
    top: 3px;
    width: 3px;
  }

  // inset ring: an outer ring would be clipped by the calendar rows
  &.selected {
    box-shadow: inset 0 0 0 2px var(--background-selected);
  }
}

.status-dot {
  border-radius: 50%;
  height: 9px;
  width: 9px;
}

.event-thumbnail {
  background: rgba(var(--border-rgb), 0.5);
  border-radius: 3px;
  height: 18px;
  overflow: hidden;
  width: 32px;

  img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
}

.event-title {
  display: flex;
  flex-shrink: 1;
  flex-wrap: nowrap;
  gap: 0 0.25em;
  min-width: 0;
  overflow: hidden;
  font-weight: 500;

  > .ellipsis {
    white-space: nowrap;
  }
}

// Customize style of FullCalendar
:deep(.fc) {
  // --border matches the panel background in dark theme, so the day grid
  // needs its own visible hairline value
  --fc-border-color: rgba(var(--skeleton-rgb), 0.25);
  --fc-today-bg-color: transparent;
  // defaults to white: the multimonth (year) view paints its month tiles
  // with it, which breaks dark theme
  --fc-page-bg-color: transparent;
  --fc-neutral-bg-color: rgba(var(--skeleton-rgb), 0.15);
  // our background colors already carry their alpha
  --fc-bg-event-opacity: 1;
}

// the grid stands out from the panel that holds it
:deep(.fc-view-harness) {
  background: var(--background);
  border-radius: 10px;
  overflow: hidden;
}

:deep(.fc-scrollgrid) {
  border: none;
}

:deep(.fc-col-header-cell) {
  padding: 8px 0 6px;

  .fc-col-header-cell-cushion {
    color: var(--text);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    opacity: 0.6;
    text-decoration: none;
    text-transform: uppercase;
  }
}

:deep(.fc-daygrid-day-number) {
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 700;
  opacity: 0.7;
  padding: 6px 8px;
  text-decoration: none;
  width: 100%;
}

:deep(.fc-daygrid-day-top) {
  // fc defaults to row-reverse, which parks the day number on the right
  flex-direction: row;
}

:deep(.day-cell-content) {
  align-items: center;
  display: flex;
  gap: 4px;
  justify-content: space-between;
  width: 100%;
}

:deep(.day-hours) {
  background: var(--background-selectable);
  border-radius: 4px;
  color: var(--text-strong);
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0 4px;

  &:hover {
    background: var(--background-selected);
  }
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  opacity: 1;
}

// the today pill hugs the day number, not the hours badge next to it
:deep(.fc-day-today .day-cell-content > span:first-child) {
  background: var(--background-selected);
  border-radius: 999px;
  color: var(--text-strong);
  font-weight: 700;
  min-width: 22px;
  padding: 2px 7px;
  text-align: center;
}

:deep(.fc-h-event) {
  background: transparent;
  border: none;
}

:deep(.fc-daygrid-event) {
  border-radius: 5px;
  margin-left: 2px;
  margin-right: 2px;
  // vertical gap between stacked bars: fc positions harnesses from their
  // MEASURED height (margins excluded), so the gap must be padding
  padding-bottom: 3px;
}

.calendar-toolbar {
  align-items: center;
  background: var(--background-panel);
  border-radius: 12px;
  display: flex;
  gap: 1em;
  justify-content: space-between;
  margin-bottom: 1em;
  padding: 1em;
}

.calendar-toolbar-group {
  align-items: center;
  display: flex;
  gap: 0.5em;
}

.calendar-title {
  border: none;
  color: var(--text-strong);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: capitalize;
}

.calendar-total {
  color: var(--text-strong);
  font-size: 0.85rem;
  font-weight: 700;
  margin-right: 0.5em;
}

.calendar-button {
  align-items: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  display: inline-flex;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35em 0.9em;
  text-transform: capitalize;

  &:hover:not(:disabled) {
    background: var(--background-selectable);
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  &.active {
    background: var(--background-selected);
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px var(--background-selectable);
    outline: none;
  }
}

// ghost chevrons: plain icon buttons, the border only weighs them down
.calendar-nav-button {
  border: none;
  padding: 0.35em 0.5em;
}

// segmented group: round the outer corners only
.calendar-segmented {
  display: flex;

  .calendar-button {
    border-radius: 0;
  }

  .calendar-button:first-child {
    border-radius: 8px 0 0 8px;
  }

  .calendar-button:last-child {
    border-left: none;
    border-radius: 0 8px 8px 0;
  }
}

@media screen and (max-width: 768px) {
  .calendar-toolbar {
    column-gap: 0.5em;
    flex-wrap: wrap;
    padding: 0.5em;
    row-gap: 0.5em;
  }

  .calendar-title {
    font-size: 1.1rem;
    order: -1;
    text-align: center;
    width: 100%;
  }

  // navigation on the left, total and views on the right
  .calendar-toolbar-group:last-child {
    margin-left: auto;
  }

  // the grid needs every pixel of a phone: the week totals stay on desktop
  .week-rail {
    display: none;
  }

  .calendar-body {
    padding: 0.5em;
  }

  // the bars are a few dozen pixels wide: the text gets their whole width
  // and the day off label, which wraps over the bars below, goes
  :deep(.event-thumbnail),
  :deep(.calendar-day-off-title) {
    display: none;
  }
}
</style>
