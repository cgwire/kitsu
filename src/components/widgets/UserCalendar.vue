<template>
  <div class="user-calendar mt1">
    <full-calendar
      ref="calendar"
      class="app-calendar"
      :options="calendarOptions"
    >
      <template v-slot:eventContent="arg">
        <div
          class="calendar-event"
          :style="{
            background: arg.event.backgroundColor
          }"
          :title="arg.event.title"
          @click="onEventClicked(arg.event)"
        >
          <entity-thumbnail
            :preview-file-id="arg.event.extendedProps.previewFileId"
          />
          <span
            class="tag"
            :style="{
              background: getStatusColor(arg.event.extendedProps.taskStatus),
              color: getStatusTextColor(arg.event.extendedProps.taskStatus)
            }"
            :title="arg.event.extendedProps.taskStatus.name"
          >
            {{ arg.event.extendedProps.taskStatus.short_name }}
          </span>
          <div class="event-title">
            <span class="ellipsis">{{ arg.event.extendedProps.title[0] }}</span>
            <span class="ellipsis" v-if="arg.event.extendedProps.title[1]">
              / {{ arg.event.extendedProps.title[1] }}
            </span>
            <span class="ellipsis" v-if="arg.event.extendedProps.title[2]">
              / {{ arg.event.extendedProps.title[2] }}
            </span>
          </div>
        </div>
      </template>
    </full-calendar>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'

export default {
  name: 'user-calendar',

  components: {
    EntityThumbnail,
    FullCalendar
  },

  props: {
    tasks: {
      type: Array,
      default: () => []
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
    ...mapGetters(['taskMap', 'taskStatusMap', 'taskTypeMap'])
  },

  methods: {
    ...mapActions(['addSelectedTasks', 'clearSelectedTasks']),

    resetEvents() {
      this.calendarEvents = []
      if (!this.$refs.calendar) {
        return
      }
      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.removeAllEvents()
      this.tasks
        .filter(task => task.start_date && task.due_date)
        .map(task => {
          const taskType = this.taskTypeMap.get(task.task_type_id)
          const taskStatus = this.taskStatusMap.get(task.task_status_id)
          const start = task.start_date
          const end = new Date(task.due_date)
          end.setDate(end.getDate() + 1) // end date is exclusive
          return {
            title: task.full_entity_name,
            allDay: true,
            start,
            end,
            color: '#666',
            borderColor: '#666',
            backgroundColor: taskType.color,
            extendedProps: {
              previewFileId: task.entity_preview_file_id,
              taskStatus,
              taskId: task.id,
              title: task.full_entity_name.split(' / ')
            }
          }
        })
        .forEach(event => {
          const calendarEvent = calendarApi.addEvent(event)
          this.calendarEvents.push(calendarEvent)
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
    }
  },

  watch: {
    tasks() {
      this.resetEvents()
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
