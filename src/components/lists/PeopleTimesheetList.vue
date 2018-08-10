<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="name">
            {{ $t("people.list.name") }}
          </th>

          <th
            class="time"
            :key="'month-' + month"
            v-for="month in monthRange"
            v-if="detailLevel === 'month'"
          >
            {{ monthToString(month) }}
          </th>

          <th
            class="daytime"
            :key="'week-' + week"
            v-for="week in weekRange"
            v-if="detailLevel === 'week'"
          >
            {{ week }}
          </th>

          <th
            class="daytime"
            :key="'day-' + day"
            v-for="day in dayRange"
            v-if="detailLevel === 'day'"
          >
            {{ day }}
          </th>
          <th class="actions"></th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <div class="table-body" v-scroll="onBodyScroll" v-if="!isLoading">
    <table class="table">
      <tbody>
        <tr v-for="person in people" :key="person.id">
          <people-name-cell class="name" :entry="person" />
          <td
            class="time"
            :key="'month-' + month + '-' + person.id"
            v-for="month in monthRange"
            v-if="detailLevel === 'month'"
          >
            <router-link
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
            class="daytime"
            :key="'week-' + week + '-' + person.id"
            v-for="week in weekRange"
            v-if="detailLevel === 'week'"
          >
            <router-link
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
            :key="'day-' + day + '-' + person.id"
            v-for="day in dayRange"
            v-if="detailLevel === 'day'"
          >
            <router-link
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

  <p class="has-text-centered footer-info" v-if="!isLoading">
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
  getDayRange
} from '../../lib/helpers'
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
      detailOptions: [
        {
          label: 'Day',
          value: 'day'
        },
        {
          label: 'Month',
          value: 'month'
        }
      ],
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
      'isCurrentUserManager'
    ]),

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

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    },

    monthToString,

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
    }
  }
}
</script>

<style scoped>
.name {
  width: 230px;
  min-width: 230px;
}

.time {
  width: 60px;
  min-width: 60px;
}

.daytime {
  width: 50px;
  min-width: 50px;
}

.time,
.daytime {
  text-align: center;
  vertical-align: middle;
}

th.actions {
  padding: 0;
}

th.actions,
.table td.actions {
  width: 100%;
  min-width: auto;
}

a,
a:hover{
  color: inherit;
}
</style>
