<template>
  <div class="user-calendar mt1">
    <full-calendar
      ref="calendar"
      class="app-calendar"
      :options="calendarOptions"
    >
      <template v-slot:eventContent="arg">
        <div
          class="flexrow pl1 calendar-event"
          :style="{
            background: arg.event.backgroundColor
          }"
          :title="arg.event.title"
          @click="onEventClicked(arg.event, arg.event.extendedProps.task_id)"
        >
          <entity-thumbnail
            class="flexrow-item mr1"
            :preview-file-id="arg.event.extendedProps.preview_file_id"
          />
          <span class="flexrow-item event-title">
            {{ arg.event.title }}
          </span>
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

import EntityThumbnail from '@/components/widgets/EntityThumbnail'

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
      currentTask: {},
      calendarOptions: {
        plugins: [dayGridPlugin, multiMonthPlugin],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,multiMonthYear'
        },
        initialView: 'dayGridMonth'
      }
    }
  },

  mounted() {
    this.resetEvents()
  },

  computed: {
    ...mapGetters(['taskMap', 'taskTypeMap'])
  },

  methods: {
    ...mapActions(['addSelectedTasks', 'clearSelectedTasks']),

    resetEvents() {
      this.calendarEvents = []
      if (this.$refs.calendar) {
        const calendarApi = this.$refs.calendar.getApi()
        calendarApi.removeAllEvents()
        this.tasks
          .filter(task => task.start_date && task.due_date)
          .map(task => {
            const taskType = this.taskTypeMap.get(task.task_type_id)
            return {
              title: task.full_entity_name,
              start: task.start_date.substring(0, 10),
              end: task.due_date.substring(0, 10),
              color: '#666',
              borderColor: '#666',
              backgroundColor: taskType.color,
              preview_file_id: task.entity_preview_file_id,
              selected: false,
              task_status_id: task.task_status_id,
              task_id: task.id
            }
          })
          .forEach(event => {
            const ev = calendarApi.addEvent(event)
            this.calendarEvents.push(ev)
          })
      }
    },

    onEventClicked(event, taskId) {
      const task = this.taskMap.get(taskId)
      if (task === this.currentTask) {
        this.currentTask = {}
        this.clearSelectedTasks()
        event.setProp('selected', false)
      } else {
        this.currentTask = task
        this.clearSelectedTasks()
        this.addSelectedTasks([{ task }])
        event.setProp('extendedProps.selected', true)
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

<style lang="scss">
.user-calendar {
  width: 100%;
  max-height: 80%;
}

.app-calendar {
  width: 100%;
  height: 100%;
}

.fc-toolbar-chunk {
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

.calendar-event {
  overflow: auto;
  padding: 0.2em;
}

.event-title {
  padding-left: 0.6em;
}
</style>
