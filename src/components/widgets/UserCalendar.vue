<template>
  <div class="user-calendar mt1">
    <full-calendar
      ref="calendar"
      class="app-calendar"
      :options="calendarOptions"
    >
      <template v-slot:eventContent="arg">
        <b>{{ arg.timeText }}</b>
        <i>{{ arg.event.title }}</i>
      </template>
    </full-calendar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'

export default {
  name: 'user-calendar',
  components: {
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
      calendarOptions: {
        plugins: [dayGridPlugin],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
        },
        initialView: 'dayGridMonth'
      }
    }
  },

  mounted() {
    this.resetEvents()
  },

  computed: {
    ...mapGetters(['taskTypeMap'])
  },

  methods: {
    resetEvents() {
      if (this.$refs.calendar) {
        const calendarApi = this.$refs.calendar.getApi()
        calendarApi.removeAllEvents()
        this.tasks
          .filter(task => task.start_date && task.due_date)
          .map(task => {
            const taskType = this.taskTypeMap.get(task.task_type_id)
            return {
              title: task.entity_name,
              start: task.start_date.substring(0, 10),
              end: task.due_date.substring(0, 10),
              color: taskType.color
            }
          })
          .forEach(event => {
            calendarApi.addEvent(event)
          })
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
    color: var(--text);
    border: 1px solid var(--border);
    &:hover {
      background: var(--background-selectable);
    }
  }

  .fc-button-primary:not(:disabled).fc-button-active {
    background: var(--background-selected);
  }

  .fc-button-primary:disabled {
    background: transparent;
    border: 1px solid var(--border);
  }
}
</style>
