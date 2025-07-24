<template>
  <div class="loading-wrapper" v-if="isLoading">
    <spinner />
  </div>
  <div class="user-calendar mt1" v-else>
    <full-calendar
      ref="calendar"
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
          :style="{
            background: event.backgroundColor
          }"
          :title="event.title"
          @click="onEventClicked(event)"
          v-else
        >
          <production-name
            only-avatar
            :production="event.extendedProps.production"
            :size="25"
          />
          <entity-thumbnail
            :preview-file-id="event.extendedProps.previewFileId"
          />
          <span
            class="tag"
            :style="{
              background: getStatusColor(event.extendedProps.taskStatus),
              color: getStatusTextColor(event.extendedProps.taskStatus)
            }"
            :title="event.extendedProps.taskStatus.name"
          >
            {{ event.extendedProps.taskStatus.short_name }}
          </span>
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

<script>
import { BriefcaseIcon } from 'lucide-vue-next'
import { mapActions, mapGetters } from 'vuex'

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'user-calendar',

  components: {
    BriefcaseIcon,
    EntityThumbnail,
    FullCalendar,
    ProductionName,
    Spinner
  },

  props: {
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
  },

  data() {
    return {
      currentTask: null,
      calendarOptions: {
        plugins: [dayGridPlugin, multiMonthPlugin],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,multiMonthYear'
        },
        initialView: 'dayGridMonth',
        firstDay: 1
      }
    }
  },

  mounted() {
    this.resetEvents()
  },

  computed: {
    ...mapGetters([
      'isDarkTheme',
      'productionMap',
      'taskMap',
      'taskStatusMap',
      'taskTypeMap'
    ])
  },

  methods: {
    ...mapActions(['addSelectedTasks', 'clearSelectedTasks']),

    resetEvents() {
      if (!this.$refs.calendar) {
        return
      }
      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.removeAllEvents()

      calendarApi.addEvent({
        display: 'background',
        daysOfWeek: [0, 6], // Sunday + Saturday
        backgroundColor: '#ddd',
        extendedProps: {
          isOff: true
        }
      })

      this.tasks
        .filter(task => task.start_date && task.due_date)
        .forEach(task => {
          const production = this.productionMap.get(task.project_id)
          const taskType = this.taskTypeMap.get(task.task_type_id)
          const taskStatus = this.taskStatusMap.get(task.task_status_id)
          const start = task.start_date
          const end = new Date(task.due_date)
          end.setDate(end.getDate() + 1) // end date is exclusive
          const event = {
            title: task.full_entity_name,
            allDay: true,
            start,
            end,
            borderColor: '#666',
            backgroundColor: taskType.color,
            extendedProps: {
              previewFileId: task.entity_preview_file_id,
              taskStatus,
              taskId: task.id,
              title: task.full_entity_name.split(' / '),
              production
            }
          }
          calendarApi.addEvent(event)
        })

      this.daysOff.forEach(dayOff => {
        const description = this.getDayOffInfo(dayOff)
        const startDate = new Date(dayOff.date)
        const endDate = new Date(dayOff.end_date)
        while (startDate <= endDate) {
          calendarApi.addEvent({
            title: this.$t('timesheets.day_off'),
            display: 'background',
            start: startDate.toISOString().slice(0, 10),
            backgroundColor: '#ffffe0',
            extendedProps: {
              isOff: true,
              description
            }
          })
          startDate.setDate(startDate.getDate() + 1)
        }
      })
    },

    onEventClicked(event) {
      const task = this.taskMap.get(event.extendedProps.taskId)
      if (!task || task === this.currentTask) {
        this.currentTask = null
        this.clearSelectedTasks()
      } else {
        this.currentTask = task
        this.clearSelectedTasks()
        this.addSelectedTasks([{ task }])
      }
    },

    getStatusColor(status) {
      if (status.name === 'Todo' && this.isDarkTheme) {
        return '#5F626A'
      } else {
        return status.color
      }
    },

    getStatusTextColor(status) {
      if (status.name === 'Todo' && !this.isDarkTheme) {
        return '#333'
      } else {
        return 'white'
      }
    },

    getDayOffInfo(dayOff) {
      const { description, date, end_date } = dayOff
      const period =
        end_date && date !== end_date ? `${date} - ${end_date}` : date
      return `${description || this.$t('timesheets.day_off')} (${period})`
    }
  },

  watch: {
    tasks: {
      deep: true,
      handler() {
        this.resetEvents()
      }
    },
    daysOff: {
      handler() {
        this.resetEvents()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-calendar {
  width: 100%;
  max-height: 80%;
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
  color: $black;
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  overflow-x: auto;
  padding: 0.25em;
}

.tag {
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.event-title {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.25em;
  overflow: hidden;
  font-weight: 500;

  > .ellipsis {
    white-space: nowrap;
  }
}

// Customize style of FullCalendar
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
    color: var(--text);
    outline: none;

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
</style>
