<template>
  <div class="people-timesheet-info">
    <div class="close">
      <router-link class="close-button" :to="closeRoute">
        <x-icon />
      </router-link>
    </div>

    <div class="flexrow">
      <people-avatar class="flexrow-item" :person="person" :is-lazy="false" />
      <page-title class="flexrow-item" :text="person.full_name" />
    </div>

    <div class="info-date" v-if="isYearInfo">
      {{ year }}
    </div>

    <div class="info-date" v-if="isMonthInfo">{{ monthString }} {{ year }}</div>

    <div class="info-date" v-else-if="isWeekInfo">
      {{ $t('main.week') }}
      {{ week }}, {{ startDay }} - {{ endDay }} {{ weekMonth }} {{ year }}
    </div>

    <div class="info-day-off" v-if="!isDayInfo">
      {{ dayOffCount }}
      {{ $tc('days_off.nb_days_off', dayOffCount) }}
    </div>

    <div class="info-date" v-else-if="isDayInfo">
      {{ day }} {{ monthString }} {{ year }}
    </div>

    <time-spent-task-list
      class="time-spent-list"
      :tasks="tasks"
      :is-loading="isLoading"
      :is-error="isLoadingError"
      :unit="unit"
    />
  </div>
</template>

<script>
import { XIcon } from 'lucide-vue-next'
import moment from 'moment-timezone'

import { monthToString } from '@/lib/time'

import PageTitle from '@/components/widgets/PageTitle.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TimeSpentTaskList from '@/components/lists/TimeSpentTaskList.vue'

export default {
  name: 'people-timesheet-info',

  components: {
    PageTitle,
    PeopleAvatar,
    TimeSpentTaskList,
    XIcon
  },

  props: {
    person: {
      type: Object,
      default: () => {}
    },
    year: {
      type: Number,
      default: 0
    },
    month: {
      type: Number,
      default: 0
    },
    week: {
      type: Number,
      default: 0
    },
    day: {
      type: Number,
      default: 0
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isLoadingError: {
      type: Boolean,
      default: false
    },
    tasks: {
      type: Array,
      default: () => []
    },
    dayOffCount: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: 'hour'
    }
  },

  emits: ['close'],

  computed: {
    startDay() {
      return moment().day('Monday').year(this.year).week(this.week).date()
    },

    endDay() {
      return moment()
        .day('Monday')
        .year(this.year)
        .week(this.week)
        .add(6, 'days')
        .date()
    },

    weekMonth() {
      return moment()
        .day('Monday')
        .year(this.year)
        .week(this.week)
        .format('MMM')
    },

    monthString() {
      return monthToString(this.month)
    },

    isYearInfo() {
      return !this.isMonthInfo && !this.isWeekInfo && !this.isDayInfo
    },

    isMonthInfo() {
      return this.$route.path.indexOf('month') > 0
    },

    isWeekInfo() {
      return this.$route.path.indexOf('week') > 0
    },

    isDayInfo() {
      return this.$route.path.indexOf('day') > 0
    },

    closeRoute() {
      const query = {
        productionId: this.$route.query.productionId,
        studioId: this.$route.query.studioId
      }
      if (this.isYearInfo) {
        return {
          name: 'timesheets-year',
          params: {
            year: this.year
          },
          query
        }
      } else if (this.isMonthInfo) {
        return {
          name: 'timesheets-month',
          params: {
            year: this.year,
            month: this.month
          },
          query
        }
      } else if (this.isWeekInfo) {
        return {
          name: 'timesheets-week',
          params: {
            year: this.year,
            week: this.week
          },
          query
        }
      } else if (this.isDayInfo) {
        return {
          name: 'timesheets-day',
          params: {
            year: this.year,
            month: this.month,
            day: this.day
          },
          query
        }
      } else {
        return {
          name: 'timesheets',
          query
        }
      }
    }
  },

  methods: {
    onCloseClicked() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.data-list {
  padding-bottom: 5em;
}

.people-timesheet-info {
  padding: 1em;
}

.info-date {
  font-size: 1.5em;
  margin-top: 1em;
  text-transform: capitalize;
}

.close {
  text-align: right;
}
</style>
