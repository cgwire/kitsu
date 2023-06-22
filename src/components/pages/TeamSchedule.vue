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
            :monday-first="true"
            :typeable="true"
            format="yyyy-MM-dd"
            @selected="onUpdateSelectedStartDate"
            v-model="selectedStartDate"
          />
        </div>
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.end_date') }}
          </label>
          <datepicker
            wrapper-class="datepicker"
            input-class="date-input input"
            :language="locale"
            :monday-first="true"
            :typeable="true"
            format="yyyy-MM-dd"
            @selected="onUpdateSelectedEndDate"
            v-model="selectedEndDate"
          />
        </div>
        <combobox-number
          class="flexrow-item zoom-level"
          :label="$t('schedule.zoom_level')"
          :options="zoomOptions"
          v-model="zoomLevel"
        />
        <combobox-department
          class="flexrow-item"
          :label="$t('main.department')"
          v-model="selectedDepartment"
        />
        <div class="flexrow-item people-filter">
          <label class="label">
            {{ $t('main.person') }}
          </label>
          <people-field
            ref="people-field"
            :people="selectablePeople"
            :placeholder="$t('team_schedule.person_placeholder')"
            wide
            v-model="selectedPerson"
          />
        </div>
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
import { firstBy } from 'thenby'
import { en, fr } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'

import { getPersonTabPath } from '@/lib/path'
import { parseSimpleDate } from '@/lib/time'
import colors from '@/lib/colors'

import { formatListMixin } from '@/components/mixins/format'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment'
import ComboboxNumber from '@/components/widgets/ComboboxNumber'
import PeopleField from '@/components/widgets/PeopleField'
import Schedule from '@/components/pages/schedule/Schedule'

export default {
  name: 'team-schedule',
  mixins: [formatListMixin],
  components: {
    ComboboxDepartment,
    ComboboxNumber,
    Datepicker,
    PeopleField,
    Schedule
  },

  data() {
    return {
      endDate: moment().add(3, 'months'),
      personDates: {},
      scheduleItems: [],
      selectedDepartment: null,
      selectedEndDate: null,
      selectedPerson: null,
      selectedStartDate: null,
      startDate: moment(),
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
    this.init()
  },

  computed: {
    ...mapGetters(['displayedPeople', 'taskTypeMap', 'user']),

    locale() {
      if (this.user.locale === 'fr_FR') {
        return fr
      } else {
        return en
      }
    },

    selectablePeople() {
      if (this.selectedDepartment) {
        return this.displayedPeople.filter(person =>
          person.departments.includes(this.selectedDepartment)
        )
      }
      return this.displayedPeople
    }
  },

  methods: {
    ...mapActions([
      'fetchPersonTasks',
      'getPersonsTasksDates',
      'loadPeople'
    ]),

    async init() {
      this.loading.schedule = true
      const personDatesList = await this.getPersonsTasksDates()
      this.personDates = {}
      personDatesList.forEach(p => {
        this.personDates[p.person_id] = {
          endDate: parseSimpleDate(p.max_date),
          startDate: parseSimpleDate(p.min_date)
        }
      })
      await this.loadPeople()

      this.refreshSchedule()

      this.startDate = moment()
      this.endDate = moment().add(3, 'months')
      Object.values(this.personDates).forEach(dates => {
        if (dates.startDate.isBefore(this.startDate)) {
          this.startDate = dates.startDate.clone()
        }
        if (dates.endDate.isAfter(this.endDate)) {
          this.endDate = dates.endDate.clone()
        }
      })

      this.selectedStartDate = this.startDate.toDate()
      this.selectedEndDate = this.endDate.toDate()
    },

    refreshSchedule() {
      const people = this.selectedPerson
        ? [this.selectedPerson]
        : this.selectablePeople
      this.scheduleItems = this.convertScheduleItems(people)
    },

    convertScheduleItems(scheduleItems) {
      return scheduleItems.map(item => {
        let startDate = moment()
        let endDate = moment()
        const personDates = this.personDates[item.id]
        if (personDates && personDates.startDate && personDates.endDate) {
          startDate = parseSimpleDate(personDates.startDate)
          endDate = parseSimpleDate(personDates.endDate)
        }
        return {
          ...item,
          avatar: true,
          color: item.color || colors.fromString(item.name, true),
          startDate,
          endDate,
          expanded: false,
          loading: false,
          editable: false,
          route: getPersonTabPath(item.id, 'schedule'),
          children: []
        }
      })
    },

    buildTaskScheduleItem(task) {
      let startDate = moment()
      let endDate

      if (!task.start_date || !task.due_date) {
        return null
      }

      if (task.start_date) {
        startDate = parseSimpleDate(task.start_date)
      }
      const estimation = this.formatDuration(task.estimation)
      if (task.due_date) {
        endDate = parseSimpleDate(task.due_date)
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

    async expandPersonElement(element, refreshScheduleCallBack) {
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

        if (refreshScheduleCallBack) {
          refreshScheduleCallBack(element)
        }
      } catch (err) {
        console.error(err)
      }
      element.loading = false
    },

    onUpdateSelectedStartDate(date) {
      this.startDate = parseSimpleDate(date)
    },

    onUpdateSelectedEndDate(date) {
      this.endDate = parseSimpleDate(date)
    }
  },

  socket: {},

  watch: {
    selectedDepartment() {
      if (
        this.selectedPerson &&
        !this.selectablePeople.includes(this.selectedPerson)
      ) {
        this.$refs['people-field'].clear()
      }
      this.refreshSchedule()
    },
    selectedPerson() {
      this.refreshSchedule()
    }
  },

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
  white-space: nowrap;
}

.people-filter {
  min-width: 250px;
}
</style>
