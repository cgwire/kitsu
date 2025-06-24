<template>
  <div class="data-list">
    <div class="datatable-wrapper" ref="body">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name datatable-row-header">
              {{ $t('people.list.name') }}
            </th>

            <!-- Year columns -->
            <template v-if="detailLevel === 'year'">
              <th
                :key="`year-${year}`"
                scope="col"
                class="time year"
                v-for="year in yearRange"
              >
                {{ year }}
              </th>
            </template>

            <!-- Month columns -->
            <template v-if="detailLevel === 'month'">
              <th
                :key="`month-${month}`"
                scope="col"
                class="time month"
                v-for="month in monthRange"
              >
                {{ monthToString(month) }}
              </th>
            </template>

            <!-- Week columns -->
            <template v-if="detailLevel === 'week'">
              <th
                :key="`week-${week}`"
                scope="col"
                class="daytime"
                :title="getWeekTitle(week)"
                v-for="week in weekRange"
              >
                {{ week }}
              </th>
            </template>

            <!-- Day columns -->
            <template v-if="detailLevel === 'day'">
              <th
                :key="`day-${day}`"
                scope="col"
                class="daytime"
                v-for="day in dayRange"
              >
                {{ day }}
              </th>
            </template>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="!isLoading">
          <tr class="datatable-row" v-for="person in people" :key="person.id">
            <th class="datatable-row-header name">
              <div class="flexrow">
                <people-avatar class="flexrow-item" :person="person" />
                <people-name class="flexrow-item" with-link :person="person" />
              </div>
            </th>

            <!-- Year cells -->
            <template v-if="detailLevel === 'year'">
              <td
                :key="`year-${year}-${person.id}`"
                class="time year"
                :class="{
                  selected: isYearSelected(person.id, year)
                }"
                v-for="year in yearRange"
              >
                <router-link
                  v-if="yearDuration(year, person.id) > 0"
                  class="duration"
                  :to="getYearDetailRoute(person, year)"
                >
                  {{ yearDuration(year, person.id) }}
                </router-link>
                <template v-else> - </template>
              </td>
            </template>

            <!-- Month cells -->
            <template v-if="detailLevel === 'month'">
              <td
                :key="`month-${month}-${person.id}`"
                class="time month"
                :class="{
                  selected: isMonthSelected(person.id, year, month)
                }"
                v-for="month in monthRange"
              >
                <router-link
                  v-if="monthDuration(month, person.id) > 0"
                  class="duration"
                  :to="getMonthDetailRoute(person, year, month)"
                >
                  {{ monthDuration(month, person.id) }}
                </router-link>
                <template v-else> - </template>
              </td>
            </template>

            <!-- Week cells -->
            <template v-if="detailLevel === 'week'">
              <td
                :key="`week-${week}-${person.id}`"
                class="daytime"
                :class="{
                  selected: isWeekSelected(person.id, year, week)
                }"
                v-for="week in weekRange"
              >
                <router-link
                  v-if="weekDuration(week, person.id) > 0"
                  class="duration"
                  :class="{
                    warning:
                      weekDuration(week, person.id) >
                      5 * organisation.hours_by_day
                  }"
                  :to="getWeekDetailRoute(person, year, week)"
                >
                  {{ weekDuration(week, person.id) }}
                </router-link>
                <template v-else> - </template>
              </td>
            </template>

            <!-- Day cells -->
            <template v-if="detailLevel === 'day'">
              <td
                :key="`day-${day}-${person.id}`"
                class="daytime"
                :class="{
                  weekend: isWeekend(year, month, day),
                  selected: isDaySelected(person.id, year, month, day)
                }"
                v-for="day in dayRange"
              >
                <router-link
                  v-if="dayDuration(day, person.id) > 0"
                  class="duration"
                  :to="getDayDetailRoute(person, year, month, day)"
                >
                  {{ dayDuration(day, person.id) }}
                </router-link>
                <template v-else-if="isDayOff(person.id, day)">
                  {{ $t('timesheets.off').toUpperCase() }}
                </template>
                <template v-else> - </template>
              </td>
            </template>
            <td class="actions"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <p class="has-text-centered footer-info" v-if="!isLoading">
      {{ people.length }} {{ $tc('people.persons', people.length) }}
    </p>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import { mapGetters } from 'vuex'

import {
  getMonthRange,
  getWeekRange,
  getDayRange,
  hoursToDays,
  monthToString,
  range
} from '@/lib/time'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'people-timesheet-list',

  components: {
    PeopleAvatar,
    PeopleName,
    TableInfo
  },

  data() {
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

    unit: {
      type: String,
      default: 'hour'
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
    ...mapGetters(['dayOffMap', 'organisation', 'route']),

    yearRange() {
      return range(2018, moment().year())
    },

    monthRange() {
      return getMonthRange(this.year, this.currentYear, this.currentMonth)
    },

    dayRange() {
      return getDayRange(
        this.year,
        this.month,
        this.currentYear,
        this.currentMonth
      )
    },

    weekRange() {
      return getWeekRange(this.year, this.currentYear, this.currentWeek)
    },

    isHours() {
      return this.unit === 'hour'
    }
  },

  methods: {
    monthToString,

    yearDuration(year, personId) {
      const yearString = `${year}`
      const duration = this.getDuration(yearString, personId)
      return this.isHours
        ? duration
        : hoursToDays(this.organisation, duration).toFixed(2)
    },

    monthDuration(month, personId) {
      const monthString = `${month}`
      const duration = this.getDuration(monthString, personId)
      return this.isHours
        ? duration
        : hoursToDays(this.organisation, duration).toFixed(2)
    },

    weekDuration(week, personId) {
      const duration = this.getDuration(week, personId)
      return this.isHours
        ? duration
        : hoursToDays(this.organisation, duration).toFixed(2)
    },

    dayDuration(day, personId) {
      if (this.dayOffMap[personId]?.[`${day}`] === true) {
        return this.$t('timesheets.off').toUpperCase()
      } else {
        const duration = this.getDuration(day, personId)
        return this.isHours
          ? duration
          : hoursToDays(this.organisation, duration).toFixed(2)
      }
    },

    getDuration(index, personId) {
      if (
        this.timesheet &&
        this.timesheet[index] &&
        this.timesheet[index][personId]
      ) {
        return this.timesheet[index][personId] / 60
      } else {
        return '-'
      }
    },

    isWeekend(year, month, day) {
      const date = moment(`${year}-${month}-${day}`, 'YYYY-M-D')
      return [0, 6].includes(date.day())
    },

    isDaySelected(personId, year, month, day) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        parseInt(this.$route.params.year) === year &&
        parseInt(this.$route.params.month) === month &&
        parseInt(this.$route.params.day) === day
      )
    },

    isWeekSelected(personId, year, week) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        parseInt(this.$route.params.year) === year &&
        parseInt(this.$route.params.week) === week
      )
    },

    isMonthSelected(personId, year, month) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        parseInt(this.$route.params.year) === year &&
        parseInt(this.$route.params.month) === month
      )
    },

    isYearSelected(personId, year) {
      return (
        this.$route.params.person_id &&
        this.$route.params.person_id === personId &&
        parseInt(this.$route.params.year) === year
      )
    },

    getWeekTitle(week) {
      const beginning = moment(this.currentYear + '-' + week, 'YYYY-W')
      const end = beginning.clone().add(6, 'days')
      return beginning.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD')
    },

    getYearDetailRoute(person, year) {
      return {
        name: 'timesheets-year-person',
        params: {
          person_id: person.id,
          year: year
        },
        query: {
          productionId: this.$route.query.productionId,
          studioId: this.$route.query.studioId
        }
      }
    },

    getMonthDetailRoute(person, year, month) {
      return {
        name: 'timesheets-month-person',
        params: {
          person_id: person.id,
          year: year,
          month: month
        },
        query: {
          productionId: this.$route.query.productionId,
          studioId: this.$route.query.studioId
        }
      }
    },

    getWeekDetailRoute(person, year, week) {
      return {
        name: 'timesheets-week-person',
        params: {
          person_id: person.id,
          year: year,
          week: week
        },
        query: {
          productionId: this.$route.query.productionId,
          studioId: this.$route.query.studioId
        }
      }
    },

    getDayDetailRoute(person, year, month, day) {
      return {
        name: 'timesheets-day-person',
        params: {
          person_id: person.id,
          year: year,
          month: month,
          day: day
        },
        query: {
          productionId: this.$route.query.productionId,
          studioId: this.$route.query.studioId
        }
      }
    },

    isDayOff(personId, day) {
      const dayString = `${day}`.padStart(2, '0')
      return this.dayOffMap[personId] && this.dayOffMap[personId][dayString]
    }
  },

  watch: {
    route() {
      const els = document.getElementsByClassName('selected')
      if (els.length === 0) {
        // selected element is not visible
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
  color: $white;
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

.duration:hover {
  background: var(--background-selectable);
}

.selected .duration {
  background: var(--background-selected);
  color: var(--text);

  &:hover {
    background: var(--background-selected);
    color: var(--text);
    cursor: default;
  }
}

.duration {
  border-radius: 0.3em;
  padding: 0.5em;
}

.selected .duration.warning {
  background: $red;
  color: black;
}
</style>
