<template>
<div class="data-list">
  <div style="overflow: hidden">
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
  >
  </table-info>

  <div class="table-body" v-scroll="onBodyScroll">
    <table class="table">
      <tbody>
        <tr v-for="person in people" :key="person.id">
          <people-name-cell class="name" :entry="person" />
          <td
            class="time"
            v-for="month in monthRange"
            v-if="detailLevel === 'month'"
            :key="'month-' + month"
          >
            {{ monthDuration(month, person.id) }}
          </td>
          <td
            class="daytime"
            :key="'day-' + day"
            v-for="day in dayRange"
            v-if="detailLevel === 'day'"
          >
            {{ dayDuration(day, person.id) }}
          </td>
          <td class="actions">
          </td>
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

import { range, monthToString } from '../../lib/helpers'
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
      currentMonth: moment().month(),
      currentYear: moment().year()
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
      type: String,
      default: ''
    },

    month: {
      type: String,
      default: ''
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
      if (`${this.currentYear}` === this.year) {
        return range(0, this.currentMonth)
      } else {
        return range(0, 11)
      }
    },

    dayRange () {
      if (`${this.currentYear}` === this.year &&
          `${this.currentMonth}` === this.month) {
        return range(1, moment().date())
      } else {
        const currentDate = moment(
          `${this.year}-${Number(this.month) + 1}`, 'YYYY-M'
        )
        return range(0, currentDate.endOf('month').date())
      }
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
      const monthString = `${month + 1}`
      if (this.timesheet &&
          this.timesheet[monthString] &&
          this.timesheet[monthString][personId]) {
        return this.timesheet[monthString][personId] / 60
      } else {
        return '-'
      }
    },

    dayDuration (day, personId) {
      if (this.timesheet &&
          this.timesheet[day] &&
          this.timesheet[day][personId]) {
        return this.timesheet[day][personId] / 60
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
  width: 40px;
  min-width: 40px;
}

.time,
.daytime {
  text-align: center;
  vertical-align: middle;
}
</style>
