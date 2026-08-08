<template>
  <div class="loading-wrapper" v-if="isLoading">
    <spinner />
  </div>
  <div class="user-calendar mt1" ref="rootRef" v-else>
    <full-calendar
      ref="calendarRef"
      class="app-calendar"
      :options="calendarOptions"
    >
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
              :src="`/api/pictures/previews/preview-files/${event.extendedProps.previewFileId}.png`"
              alt=""
              v-if="event.extendedProps.previewFileId"
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
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { BriefcaseIcon } from 'lucide-vue-next'

import FullCalendar from '@fullcalendar/vue3'
import allLocales from '@fullcalendar/core/locales-all'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'

import { localeCode } from '@/lib/lang'

import Spinner from '@/components/widgets/Spinner.vue'

const { t } = useI18n()
const store = useStore()

const isDarkTheme = computed(() => store.getters.isDarkTheme)
const productionMap = computed(() => store.getters.productionMap)
const taskMap = computed(() => store.getters.taskMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  },
  daysOff: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: true
  }
})

const currentTask = ref(null)
const calendarRef = ref(null)
const rootRef = ref(null)

// FullCalendar only tracks window resizes: when the task side panel opens,
// the container shrinks and the grid keeps its stale width (the calendar
// then scrolls sideways). Nudge it on every container resize.
const resizeObserver = new ResizeObserver(() => {
  calendarRef.value?.getApi().updateSize()
})

const calendarOptions = ref({
  plugins: [dayGridPlugin, multiMonthPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    // multiMonthYear stays wired up, only its button is hidden for now
    right: 'dayGridMonth,dayGridWeek'
  },
  initialView: 'dayGridMonth',
  firstDay: 1,
  locales: allLocales,
  locale: localeCode.value
})

const resetEvents = () => {
  if (!calendarRef.value) {
    return
  }
  const calendarApi = calendarRef.value.getApi()
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
      const start = task.start_date
      const end = new Date(task.due_date)
      end.setDate(end.getDate() + 1)
      const event = {
        title: task.full_entity_name,
        allDay: true,
        start,
        end,
        // the tinted chip in the eventContent slot paints itself
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        extendedProps: {
          previewFileId: task.entity_preview_file_id,
          taskStatus,
          taskId: task.id,
          title: task.full_entity_name.split(' / '),
          production,
          typeColor: taskType.color,
          typeName: taskType.name
        }
      }
      calendarApi.addEvent(event)
    })

  props.daysOff.forEach(dayOff => {
    const description = getDayOffInfo(dayOff)
    const startDate = new Date(dayOff.date)
    const endDate = new Date(dayOff.end_date)
    while (startDate <= endDate) {
      calendarApi.addEvent({
        title: t('timesheets.day_off'),
        display: 'background',
        start: startDate.toISOString().slice(0, 10),
        backgroundColor: 'var(--calendar-day-off)',
        extendedProps: {
          isOff: true,
          description
        }
      })
      startDate.setDate(startDate.getDate() + 1)
    }
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

const getStatusColor = status => {
  if (status.name === 'Todo' && isDarkTheme.value) {
    return '#5F626A'
  } else {
    return status.color
  }
}

const getEventTooltip = event => {
  const { production, taskStatus, typeName } = event.extendedProps
  return [production?.name, event.title, typeName, taskStatus.name]
    .filter(Boolean)
    .join(' · ')
}

const getDayOffInfo = dayOff => {
  const { description, date, end_date } = dayOff
  const period = end_date && date !== end_date ? `${date} - ${end_date}` : date
  return `${description || t('timesheets.day_off')} (${period})`
}

onMounted(() => {
  resetEvents()
})

// the root div sits behind a v-else on isLoading, so it can appear after
// mount: observe whenever the element actually exists
watch(rootRef, el => {
  resizeObserver.disconnect()
  if (el) {
    resizeObserver.observe(el)
  }
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
})

watch(
  () => props.tasks,
  () => {
    resetEvents()
  },
  { deep: true }
)

watch(
  () => props.daysOff,
  () => {
    resetEvents()
  }
)

watch(localeCode, code => {
  calendarOptions.value.locale = code
  calendarRef.value?.getApi().setOption('locale', code)
})
</script>

<style lang="scss" scoped>
.user-calendar {
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

.app-calendar {
  width: 100%;
  height: 100%;
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

// the grid becomes a panel surface, like the kanban board columns
:deep(.fc-view-harness) {
  background: var(--background-panel);
  border-radius: 12px;
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
  opacity: 0.7;
  padding: 6px 8px;
  text-decoration: none;
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  background: var(--background-selected);
  border-radius: 999px;
  color: var(--text-strong);
  font-weight: 700;
  margin: 3px;
  min-width: 26px;
  opacity: 1;
  padding: 4px 8px;
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

:deep(.fc-toolbar-chunk) {
  h2 {
    text-decoration: none;
    border-bottom: none;
  }

  .fc-button-active,
  .fc-button-primary:not(:disabled).fc-button-active,
  .fc-button {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    outline: none;
    text-transform: capitalize;

    &:not(:disabled):active,
    &:not(:disabled):focus {
      outline: none;
      box-shadow: none;
      border: 1px solid var(--border);
    }

    &:not(:disabled):active:focus {
      box-shadow: none;
      background: var(--background-selectable);
    }

    &:hover {
      color: var(--text);
      background: var(--background-selectable);
      border: 1px solid var(--border);
    }
  }

  .fc-button-primary:not(:disabled).fc-button-active {
    background: var(--background-selected);
  }

  .fc-button-primary:disabled {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
  }
}

:deep(.fc-header-toolbar) {
  margin-bottom: 1em;

  .fc-toolbar-title {
    color: var(--text-strong);
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: capitalize;
  }

  .fc-button {
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.35em 0.9em;
  }

  // ghost chevrons: plain icon buttons, the border only weighs them down
  .fc-prev-button,
  .fc-next-button {
    border: none;
    padding: 0.35em 0.5em;

    &:hover,
    &:not(:disabled):active,
    &:not(:disabled):focus {
      border: none;
    }
  }

  // segmented groups: round the outer corners only
  .fc-button-group {
    .fc-button {
      border-radius: 0;
    }

    .fc-button:first-child {
      border-radius: 8px 0 0 8px;
    }

    .fc-button:last-child {
      border-radius: 0 8px 8px 0;
    }
  }
}
</style>
