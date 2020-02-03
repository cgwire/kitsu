<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="timesheets page" v-if="isCurrentUserManager">
        <div class="page-header flexrow">
          <page-title class="flexrow-item" :text="$t('timesheets.title')"/>
          <combobox
            class="flexrow-item"
            :label="$t('timesheets.detail_level')"
            :options="detailOptions"
            v-model="detailLevelString"
          />

          <combobox
            class="flexrow-item"
            :label="$t('timesheets.year')"
            :options="yearOptions"
            v-model="yearString"
            v-if="detailLevelString !== 'year'"
          />

          <combobox
            class="flexrow-item"
            :label="$t('timesheets.month')"
            :options="monthOptions"
            v-model="monthString"
            v-if="detailLevelString === 'day'"
          />
          <div class="filler"></div>
          <button-simple
            class="flexrow-item"
            :title="$t('timesheets.export_timesheet')"
            icon="download"
            @click="exportTimesheet"
          />
        </div>

        <people-timesheet-list
          class="data-list"
          :people="filteredPeople"
          :timesheet="timesheet"
          :detail-level="detailLevel"
          :month="currentMonth"
          :year="currentYear"
          :is-loading="isLoading"
          :is-error="isLoadingError"
        />
      </div>
    </div>
    <div
      class="column side-column"
      v-if="showInfo"
    >
      <people-timesheet-info
        :person="currentPerson"
        :year="currentYear"
        :month="currentMonth"
        :week="currentWeek"
        :day="currentDay"
        :is-loading="isInfoLoading"
        :is-loading-error="isInfoLoadingError"
        :tasks="tasks"
        @close="hideSideInfo"
      />
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'

import ButtonSimple from '../widgets/ButtonSimple'
import Combobox from '../widgets/Combobox'
import PeopleTimesheetList from '../lists/PeopleTimesheetList'
import PeopleTimesheetInfo from '../sides/PeopleTimesheetInfo'
import PageTitle from '../widgets/PageTitle'
import csv from '../../lib/csv'
import { monthToString, range } from '../../lib/time'
import { slugify } from '../../lib/string'

export default {
  name: 'people',
  components: {
    ButtonSimple,
    Combobox,
    PageTitle,
    PeopleTimesheetList,
    PeopleTimesheetInfo
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
        },
        {
          label: 'Year',
          value: 'year'
        }
      ],

      detailLevelString: 'day',
      detailLevel: 'day',

      yearString: `${moment().year()}`,
      monthString: `${moment().month() + 1}`,

      currentYear: moment().year(),
      currentMonth: moment().month() + 1,
      currentWeek: moment().week(),
      currentDay: moment().date(),
      currentPerson: this.getCurrentPerson(),

      isLoading: false,
      isLoadingError: false,

      showInfo: true,
      isInfoLoading: false,
      isInfoLoadingError: false,
      tasks: []
    }
  },

  created () {
    this.isLoading = true
    if (this.people.length === 0) {
      this.loadPeople(() => {
        this.loadRoute()
      })
    } else {
      this.loadRoute()
    }
  },

  computed: {
    ...mapGetters([
      'isCurrentUserManager',
      'people',
      'personMap',
      'timesheet'
    ]),

    filteredPeople () {
      return this.people.filter((person) => {
        const keys = Object.keys(this.timesheet)
        let isThere = false
        let i = 0
        do {
          if (this.timesheet[keys[i]]) {
            isThere = this.timesheet[keys[i]][person.id] !== undefined
          }
          i++
        } while (!isThere && i < keys.length)

        return person.active && isThere
      })
    },

    yearOptions () {
      const year = 2018
      const currentYear = moment().year()
      return range(year, currentYear)
        .map(year => ({
          label: year,
          value: `${year}`
        }))
    },

    monthOptions () {
      const currentYear = `${moment().year()}`
      const month = 1
      const currentMonth = moment().month() + 1
      let monthRange = range(month, 12)
      if (currentYear === this.yearString) {
        monthRange = range(month, currentMonth)
      }

      return monthRange.map(month => ({
        label: monthToString(month),
        value: `${month}`
      }))
    }
  },

  methods: {
    ...mapActions([
      'loadPeople',
      'loadAggregatedPersonTimeSpents',
      'loadTimesheets'
    ]),

    reloadTimesheet () {
      this.isLoading = true
      this.loadTimesheets({
        detailLevel: this.detailLevel,
        year: this.currentYear,
        month: this.currentMonth
      })
        .then((table) => {
          this.isLoading = false
        })
        .catch(() => {
          this.isLoading = false
          this.isLoadingError = true
        })
    },

    showSideInfo () {
      this.showInfo = true
    },

    hideSideInfo () {
      this.showInfo = false
    },

    loadRoute () {
      const { month, year, week, day } = this.$route.params

      const previousDetailLevel = `${this.detailLevel}`
      const previousMonth = `${this.currentMonth}`
      const previousYear = `${this.currentYear}`
      if (this.$route.path.indexOf('week') > 0) this.detailLevel = 'week'
      if (this.$route.path.indexOf('month') > 0) this.detailLevel = 'month'
      if (this.$route.path.indexOf('day') > 0) this.detailLevel = 'day'
      if (this.$route.path.indexOf('year') > 0) this.detailLevel = 'year'

      this.currentPerson = this.getCurrentPerson()
      this.detailLevelString = this.detailLevel
      if (month) {
        this.currentMonth = Number(month)
        this.monthString = `${month}`
      }
      if (year) {
        this.currentYear = Number(year)
        this.yearString = `${year}`
      }
      if (week) {
        this.currentWeek = Number(week)
        this.weekString = `${week}`
      }
      if (day) {
        this.currentDay = Number(day)
      }

      const detailLevelHasChanged = previousDetailLevel !== this.detailLevel
      const monthHasChanged =
        previousMonth.localeCompare(`${this.currentMonth}`) !== 0
      const yearHasChanged =
        previousYear.localeCompare(`${this.currentYear}`) !== 0

      if (this.$route.path.indexOf('person') > 0) {
        this.showSideInfo()
        this.loadAggregate()
        if (this.isLoading) {
          this.reloadTimesheet()
        }
      } else {
        this.hideSideInfo()
        if (
          this.isLoading ||
          monthHasChanged ||
          yearHasChanged ||
          detailLevelHasChanged
        ) {
          this.reloadTimesheet()
        }
      }
    },

    loadAggregate () {
      this.isInfoLoading = true
      this.isInfoLoadingError = false
      this.tasks = []
      this.loadAggregatedPersonTimeSpents({
        personId: this.$route.params.person_id,
        detailLevel: this.detailLevel,
        year: this.$route.params.year,
        month: this.$route.params.month,
        week: this.$route.params.week,
        day: this.$route.params.day
      }).then((tasks) => {
        this.isInfoLoading = false
        this.tasks = tasks.filter((task) => task.duration > 0)
      }).catch((err) => {
        console.error(err)
        this.isInfoLoadingError = true
      })
    },

    getCurrentPerson () {
      const personId = this.$route.params.person_id
      if (personId && this.personMap) {
        return this.personMap[personId]
      } else {
        return {}
      }
    },

    exportTimesheet () {
      const nameData = [
        'timesheet',
        this.detailLevel,
        this.currentYear
      ]
      if (this.detailLevel === 'day') nameData.push(this.currentMonth)
      const name = slugify(nameData.join('_'))
      csv.generateTimesheet(
        name,
        this.timesheet,
        this.filteredPeople,
        this.detailLevel,
        this.currentYear,
        this.currentMonth,
        moment().month() + 1,
        moment().year(),
        moment().week()
      )
    }
  },

  watch: {
    detailLevelString () {
      if (this.detailLevel !== this.detailLevelString) {
        if (this.detailLevelString === 'month') {
          this.$router.push({
            name: 'timesheets-month',
            params: {
              year: this.currentYear
            }
          })
        } else if (this.detailLevelString === 'week') {
          this.$router.push({
            name: 'timesheets-week',
            params: {
              year: this.currentYear
            }
          })
        } else if (this.detailLevelString === 'day') {
          this.$router.push({
            name: 'timesheets-day',
            params: {
              year: this.currentYear,
              month: this.currentMonth
            }
          })
        } else if (this.detailLevelString === 'year') {
          this.$router.push({
            name: 'timesheets-year',
            params: {
              year: this.currentYear
            }
          })
        }
      }
    },

    yearString () {
      const year = Number(this.yearString)
      const currentMonth = moment().month()
      if (this.currentYear !== year) {
        if (this.detailLevel === 'month') {
          this.$router.push({
            name: 'timesheets-month',
            params: { year }
          })
        } else if (this.detailLevel === 'week') {
          this.$router.push({
            name: 'timesheets-week',
            params: { year }
          })
        } else {
          this.$router.push({
            name: 'timesheets-day',
            params: {
              year: year,
              month: Math.min(Number(this.monthString), currentMonth)
            }
          })
        }
      }
    },

    monthString () {
      if (this.currentMonth !== Number(this.monthString)) {
        this.$router.push({
          name: 'timesheets-day',
          params: {
            year: this.currentYear,
            month: Number(this.monthString)
          }
        })
      }
    },

    $route () {
      this.loadRoute()
    }
  },

  metaInfo () {
    return {
      title: `${this.$t('timesheets.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .main-column {
  border-color: $dark-grey-lightest;
}

.data-list {
  margin-top: 0;
}

.timesheets {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 1em;
}

.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.main-column {
  border-right: 3px solid $light-grey;
  margin: 0;
}
</style>
