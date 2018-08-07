<template>
  <div class="timesheets page fixed-page" v-if="isCurrentUserManager">
    <div class="page-header flexrow">
      <page-title class="flexrow-item" :text="$t('timesheets.title')"/>
      <combobox
        class="flexrow-item"
        :label="$t('timesheets.detail_level')"
        :options="detailOptions"
        v-model="detailLevel"
      >
      </combobox>

      <combobox
        class="flexrow-item"
        :label="$t('timesheets.year')"
        :options="yearOptions"
        v-model="year"
      >
      </combobox>

      <combobox
        class="flexrow-item"
        :label="$t('timesheets.month')"
        :options="monthOptions"
        v-model="month"
        v-if="detailLevel === 'day'"
      >
      </combobox>
    </div>

    <people-timesheet-list
      :people="people"
      :timesheet="timesheet"
      :detail-level="detailLevel"
      :month="month"
      :year="year"
      :is-loading="isLoading"
      :is-error="isLoadingError"
    ></people-timesheet-list>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'

import Combobox from './widgets/Combobox'
import PeopleTimesheetList from './lists/PeopleTimesheetList'
import PageTitle from './widgets/PageTitle'
import { range, monthToString } from '../lib/helpers'

export default {
  name: 'people',
  components: {
    Combobox,
    PeopleTimesheetList,
    PageTitle
  },

  data () {
    return {
      detailOptions: [
        {
          label: 'Day',
          value: 'day'
        },
        {
          label: 'Week',
          value: 'week'
        },
        {
          label: 'Month',
          value: 'month'
        }
      ],

      detailLevel: 'day',
      year: `${moment().year()}`,
      month: `${moment().month()}`,
      currentYear: moment().year(),
      currentMonth: moment().month(),

      isLoading: false,
      isLoadingError: false
    }
  },

  created () {
    this.isLoading = true
    this.loadPeople(() => {
      this.reloadTimesheet()
    })
  },

  computed: {
    ...mapGetters([
      'isCurrentUserManager',
      'people',
      'timesheet'
    ]),

    yearOptions () {
      const year = 2018
      const currentYear = moment().year()
      return range(year, currentYear)
        .map(year => ({
          label: year,
          value: year
        }))
    },

    monthOptions () {
      const month = 0
      const currentMonth = moment().month()
      return range(month, currentMonth)
        .map(month => ({
          label: monthToString(month),
          value: `${month}`
        }))
    }
  },

  methods: {
    ...mapActions([
      'loadPeople',
      'loadTimesheets'
    ]),

    reloadTimesheet () {
      this.isLoading = true
      this.loadTimesheets({
        detailLevel: this.detailLevel,
        year: this.year,
        month: this.month
      })
        .then((table) => {
          this.isLoading = false
        })
        .catch(() => {
          this.isLoading = false
          this.isLoadingError = true
        })
    }
  },

  watch: {
    detailLevel () {
      this.reloadTimesheet()
    },
    month () {
      this.reloadTimesheet()
    },
    year () {
      this.reloadTimesheet()
    }
  },

  metaInfo () {
    return {
      title: `${this.$t('timesheets.title')} - Kitsu`
    }
  }
}
</script>

<style scoped>
</style>
