<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="flexrow project-dates">
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.start_date') }}
          </label>
          <datepicker
            wrapper-class="datepicker"
            input-class="date-input input"
            :language="locale"
            :disabled-dates="{ days: [6, 0] }"
            :monday-first="true"
            format="yyyy-MM-dd"
            v-model="selectedStartDate"
            disabled
          />
        </div>
        <div class="flexrow-item field">
          <label class="label">
            {{ $t('main.end_date') }}
          </label>
          <datepicker
            wrapper-class="datepicker"
            input-class="date-input input"
            :language="locale"
            :disabled-dates="{ days: [6, 0] }"
            :monday-first="true"
            format="yyyy-MM-dd"
            v-model="selectedEndDate"
            disabled
          />
        </div>
        <combobox-number
          class="flexrow-item zoom-level"
          :label="$t('schedule.zoom_level')"
          :options="zoomOptions"
          v-model="zoomLevel"
        />
      </div>

      <schedule
        :end-date="endDate"
        :hide-man-days="true"
        :hierarchy="scheduleItems"
        :is-error="errors.schedule"
        :is-loading="loading.schedule"
        :multiline="true"
        :start-date="startDate"
        :zoom-level="zoomLevel"
        @root-element-expanded="expandPersonElement"
      />
    </div>
  </div>
</template>

<script>
/*
 * Page to manage the schedule of all the people in the studio
 */
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import { en, fr } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'
import { getPersonTabPath } from '@/lib/path'

import { getFirstStartDate, getLastEndDate, parseDate } from '@/lib/time'
import colors from '@/lib/colors'

import { formatListMixin } from '@/components/mixins/format'
import ComboboxNumber from '@/components/widgets/ComboboxNumber'
import Schedule from '@/components/pages/schedule/Schedule'
import { firstBy } from 'thenby'

export default {
  name: 'team-schedule',
  mixins: [formatListMixin],
  components: {
    ComboboxNumber,
    Datepicker,
    Schedule
  },

  data() {
    return {
      scheduleItems: [],
      startDate: moment(),
      endDate: moment().add(1, 'months'),
      selectedStartDate: null,
      selectedEndDate: null,
      zoomLevel: 1,
      zoomOptions: [
        // { label: 'Week', value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 }
      ],
      loading: {
        schedule: false
      },
      errors: {
        schedule: false
      }
    }
  },

  mounted() {
    this.reset()
  },

  computed: {
    ...mapGetters(['displayedPeople', 'taskTypeMap', 'user']),

    locale() {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
    }
  },

  methods: {
    ...mapActions(['fetchPersonTasks', 'loadPeople']),

    async reset() {
      this.loading.schedule = true
      await this.loadPeople()
      this.scheduleItems = this.convertScheduleItems(this.displayedPeople)
      this.startDate = moment()
      this.endDate = moment().add(1, 'months')
      this.selectedStartDate = this.startDate.toDate()
      this.selectedEndDate = this.endDate.toDate()
      // this.loading.schedule = false
    },

    convertScheduleItems(scheduleItems) {
      return scheduleItems.map(item => {
        return {
          ...item,
          avatar: true,
          color: item.color || colors.fromString(item.name, true),
          startDate: moment(),
          endDate: moment(),
          expanded: false,
          loading: false,
          editable: true,
          route: getPersonTabPath(item.id, 'schedule'),
          children: []
        }
      })
    },

    buildTaskScheduleItem(task) {
      let startDate = moment()
      let endDate

      if (
        !task.start_date &&
        !task.real_start_date &&
        !task.due_date &&
        !task.end_date
      )
        return null

      if (task.start_date) {
        startDate = parseDate(task.start_date)
      } else if (task.real_start_date) {
        startDate = parseDate(task.real_start_date)
      }

      const estimation = this.formatDuration(task.estimation)
      if (task.due_date) {
        endDate = parseDate(task.due_date)
      } else if (task.end_date) {
        endDate = parseDate(task.end_date)
      } else if (task.estimation) {
        endDate = startDate.clone().add(estimation, 'days')
      }

      if (!endDate || endDate.isBefore(startDate)) {
        endDate = startDate.clone().add(1, 'days')
      }
      const taskType = this.taskTypeMap.get(task.task_type_id)
      return {
        ...task,
        name: `${task.full_entity_name} / ${taskType.name}`,
        startDate: startDate,
        endDate: endDate,
        loading: false,
        man_days: estimation,
        editable: false,
        unresizable: false,
        color: taskType.color
      }
    },

    async expandPersonElement(element) {
      element.expanded = !element.expanded

      if (!element.expanded) {
        return
      }

      element.loading = true
      element.children = []
      try {
        const tasks = await this.fetchPersonTasks(element.id)
        element.children = tasks
          .map(task => this.buildTaskScheduleItem(task))
          .filter(Boolean)
          .sort(firstBy('startDate').thenBy('project_name').thenBy('name'))

        const startDate = element.children.length
          ? getFirstStartDate(element.children)
          : moment()
        const endDate = element.children.length
          ? getLastEndDate(element.children)
          : moment().add(1, 'months')

        if (startDate.isBefore(this.startDate)) {
          this.startDate = startDate
          this.selectedStartDate = this.startDate.toDate()
        }

        if (endDate.isAfter(this.endDate)) {
          this.endDate = endDate
          this.selectedEndDate = this.endDate.toDate()
        }
      } catch (err) {
        console.error(err)
      }
      element.loading = false
    }
  },

  socket: {},

  watch: {},

  metaInfo() {
    return {
      title: `${this.$t('team_schedule.title_main')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .project-dates {
    color: $white-grey;
    border-bottom: 1px solid $grey;
  }
}

.project-dates {
  border-bottom: 1px solid #eee;
  padding-bottom: 1em;

  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .overall-man-days {
    width: 120px;
    font-size: 0.9em;
    margin-right: 1em;
  }
}

.fixed-page {
  padding: 1em;
  padding-top: 90px;
  padding-left: 2em;
}

.main-column {
  display: flex;
  border: 0;
  overflow: hidden;
  flex-direction: column;
}

.zoom-level {
  margin-top: -10px;
}
</style>
