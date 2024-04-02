<template>
  <div class="user-calendar mt1">
    <full-calendar
      ref="calendar"
      class="app-calendar"
      :options="calendarOptions"
    >
      <template #eventContent="{ event }">
        <div
          class="calendar-event"
          :style="{
            background: event.backgroundColor
          }"
          :title="event.title"
          @click="onEventClicked(event)"
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
import { mapActions, mapGetters } from 'vuex'

import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'

export default {
  name: 'user-calendar',

  components: {
    EntityThumbnail,
    FullCalendar,
    ProductionName
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
    ...mapGetters(['productionMap', 'taskMap', 'taskStatusMap', 'taskTypeMap'])
  },

  methods: {
    ...mapActions(['addSelectedTasks', 'clearSelectedTasks']),

    resetEvents() {
      if (!this.$refs.calendar) {
        return
      }
      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.removeAllEvents()
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
            color: '#666',
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
    tasks: {
      deep: true,
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
