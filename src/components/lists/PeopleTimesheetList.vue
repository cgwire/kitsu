<template>
<div class="data-list">
  <div
    class="datatable-wrapper"
    ref="body"
  >
    <table class="datatable">
      <thead class="datatable-head">
        <tr>
          <th scope="col" class="name datatable-row-header">
            {{ $t("people.list.name") }}
          </th>

          <th
            scope="col"
            class="time year"
            :key="'year-' + year"
            v-for="year in yearRange"
            v-if="detailLevel === 'year'"
          >
            {{ year }}
          </th>

          <th
            scope="col"
            class="time month"
            :key="'month-' + month"
            v-for="month in monthRange"
            v-if="detailLevel === 'month'"
          >
            {{ monthToString(month) }}
          </th>

          <th
            scope="col"
            class="daytime"
            :title="getWeekTitle(week)"
            :key="'week-' + week"
            v-for="week in weekRange"
            v-if="detailLevel === 'week'"
          >
            {{ week }}
          </th>

          <th
            scope="col"
            class="daytime"
            :key="'day-' + day"
            v-for="day in dayRange"
            v-if="detailLevel === 'day'"
          >
            {{ day }}
          </th>
          <th scope="col" class="actions"></th>
        </tr>
      </thead>
      <tbody
        class="datatable-body"
        v-if="!isLoading"
      >
        <tr
          class="datatable-row"
          v-for="person in people"
          :key="person.id"
        >
          <people-name-cell class="name" :person="person" />

          <td
            :class="{
              time: true,
              year: true,
              selected: isYearSelected(person.id, year)
            }"
            :key="'year-' + year + '-' + person.id"
            v-for="year in yearRange"
            v-if="detailLevel === 'year'"
          >
            <router-link
              class="duration"
              :to="{
                name: 'timesheets-year-person',
                params: {
                  person_id: person.id,
                  year: year
                }
              }"
              v-if="yearDuration(year, person.id) > 0"
            >
              {{ yearDuration(year, person.id) }}
            </router-link>
            <span v-else>
            -
            </span>
          </td>

          <td
            :class="{
              time: true,
              month: true,
              selected: isMonthSelected(person.id, year, month)
            }"
            :key="'month-' + month + '-' + person.id"
            v-for="month in monthRange"
            v-if="detailLevel === 'month'"
          >
            <router-link
              class="duration"
              :to="{
                name: 'timesheets-month-person',
                params: {
                  person_id: person.id,
                  year: year,
                  month: month
                }
              }"
              v-if="monthDuration(month, person.id) > 0"
            >
              {{ monthDuration(month, person.id) }}
            </router-link>
            <span v-else>
            -
            </span>
          </td>

          <td
            :class="{
              daytime: true,
              selected: isWeekSelected(person.id, year, week)
            }"
            :key="'week-' + week + '-' + person.id"
            v-for="week in weekRange"
            v-if="detailLevel === 'week'"
          >
            <router-link
              :class="{
                duration: true,
                'warning': weekDuration(week, person.id) > 5 * organisation.hours_by_day
              }"
              :to="{
                name: 'timesheets-week-person',
                params: {
                  person_id: person.id,
                  year: year,
                  week: week
                }
              }"
              v-if="weekDuration(week, person.id) > 0"
            >
              {{ weekDuration(week, person.id) }}
            </router-link>
            <span v-else>
            -
            </span>
          </td>

          <td
            class="daytime"
            :class="{
              daytime: true,
              weekend: isWeekend(year, month, day),
              selected: isDaySelected(person.id, year, month, day)
            }"
            :key="'day-' + day + '-' + person.id"
            v-for="day in dayRange"
            v-if="detailLevel === 'day'"
          >
            <router-link
              class="duration"
              :to="{
                name: 'timesheets-day-person',
                params: {
                  person_id: person.id,
                  year: year,
                  month: month,
                  day: day
                }
              }"
              v-if="dayDuration(day, person.id) > 0"
            >
              {{ dayDuration(day, person.id) }}
            </router-link>
            <span v-else>
            -
            </span>
          </td>

          <td class="actions"></td>
         </tr>
      </tbody>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <p
    class="has-text-centered footer-info"
    v-if="!isLoading"
  >
    {{ people.length }} {{ $tc('people.persons', people.length) }}
  </p>
</div>
</template>

<script>
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'

import {
  monthToString,
  getMonthRange,
  getWeekRange,
  getDayRange,
  range
} from '../../lib/time'
import PeopleNameCell from '../cells/PeopleNameCell'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'people-timesheet-list',

  components: {
    PeopleNameCell,
    TableInfo
  },

  data () {
    return {
      currentMonth: moment().month() + 1,
      currentYear: moment().year(),
      currentWeek: moment().week()
    }
  },

  props: {
    timesheet: {
      type: Object,
      default: () => {}
    },

    people: {
      type: Array,
      default: () => []
    },

    detailLevel: {
      type: String,
      default: 'day'
    },

    year: {
      type: Number,
      default: 0
    },

    month: {
      type: Number,
      default: 0
    },

    isLoading: {
      type: Boolean,
      default: false
    },

    isError: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
      'isCurrentUserManager',
      'organisation',
      'route'
    ]),

    yearRange () {
      return range(2018, moment().year())
    },

    monthRange () {
      return getMonthRange(this.year, this.currentYear, this.currentMonth)
    },

    dayRange () {
      return getDayRange(
        this.year,
        this.month,
        this.currentYear,
        this.currentMonth
      )
    },

    weekRange () {
      return getWeekRange(this.year, this.currentYear, this.currentWeek)
    }
  },

  methods: {
    ...mapActions([
    ]),

    monthToString,

    yearDuration (year, personId) {
      const yearString = `${year}`
      return this.getDuration(yearString, personId)
    },

    monthDuration (month, personId) {
      const monthString = `${month}`
      return this.getDuration(monthString, personId)
    },

    weekDuration (week, personId) {
      return this.getDuration(week, personId)
    },

    dayDuration (day, personId) {
      return this.getDuration(day, personId)
    },

    getDuration (index, personId) {
      if (this.timesheet &&
          this.timesheet[index] &&
          this.timesheet[index][personId]) {
        return this.timesheet[index][personId] / 60
      } else {
        return '-'
      }
    },

    isWeekend (year, month, day) {
      let date = moment(`${year}-${month}-${day}`)
      if (day < 10) date = moment(`${year}-${month}-0${day}`)
      return [0, 6].includes(date.day())
    },

    isDaySelected (personId, year, month, day) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        this.$route.params.year === year &&
        this.$route.params.month === month &&
        this.$route.params.day === day
      )
    },

    isWeekSelected (personId, year, week) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        this.$route.params.year === year &&
        this.$route.params.week === week
      )
    },

    isMonthSelected (personId, year, month) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        this.$route.params.year === year &&
        this.$route.params.month === month
      )
    },

    isYearSelected (personId, year) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        this.$route.params.year === year
      )
    },

    getWeekTitle (week) {
      const beginning = moment(this.currentYear + '-' + week, 'YYYY-W')
      const end = beginning.clone().add(6, 'days')
      return beginning.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD')
    }
  },

  watch: {
    route () {
      const els = document.getElementsByClassName('selected')
      if (els.length === 0) { // selected element is not visible
        this.$refs.body.scrollLeft += 350
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}
.dark .weekend {
  background-color: $dark-grey;
}

.dark .duration:hover {
  color: #333;
}

.selected .duration {
  color: #333;
}

.name {
  width: 230px;
  min-width: 230px;
}

.time {
  width: 70px;
  min-width: 70px;

  &.month {
    width: 80px;
    min-width: 80px;
  }

  &.year {
    width: 90px;
    min-width: 90px;
  }
}

.daytime {
  width: 60px;
  min-width: 60px;
}

.time,
.daytime {
  text-align: center;
  vertical-align: middle;
}

th.actions {
  padding: 0;
  width: 100%;
  min-width: auto;
}

a,
a:hover {
  color: inherit;
}

.warning {
  color: #ff3860;
}

.warning:hover {
  color: red;
}

.weekend {
  background-color: $white-grey;
}

.selected .duration {
  background: $purple;
}

.duration {
  border-radius: 0.3em;
  padding: 0.5em;
}

.selected .duration.warning {
  background: #ff9890;
  color: black;
}

.duration:hover {
  background: var(--background-selectable-selectable);
}
</style>
