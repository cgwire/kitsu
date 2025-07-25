<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="timesheets page">
        <div class="page-header flexrow">
          <page-title
            class="flexrow-item title"
            :text="$t('timesheets.title')"
          />
          <combobox-production
            class="flexrow-item"
            :label="$t('main.production')"
            :production-list="productionList"
            v-model="productionIdString"
          />
          <combobox-studio
            class="flexrow-item field"
            :label="$t('main.studio')"
            v-model="studioIdString"
          />
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
          <combobox
            class="flexrow-item"
            :label="$t('timesheets.unit')"
            :options="unitOptions"
            v-model="unit"
          />
          <div class="filler"></div>
          <button-simple
            class="flexrow-item"
            :title="$t('timesheets.export_timesheet')"
            icon="export"
            @click="exportTimesheet"
          />
          <button-href-link
            class="flexrow-item"
            :title="$t('timesheets.export_timespents')"
            path="/api/export/csv/time-spents.csv"
            icon="export-lines"
            v-if="isCurrentUserAdmin"
          />
        </div>

        <people-timesheet-list
          class="data-list"
          :people="filteredPeople"
          :timesheet="timesheet"
          :detail-level="detailLevel"
          :month="currentMonth"
          :year="currentYear"
          :unit="unit"
          :is-loading="isLoading"
          :is-error="isLoadingError"
        />
      </div>
    </div>
    <div class="column side-column" v-if="showInfo">
      <people-timesheet-info
        :person="currentPerson"
        :production="productionId"
        :year="currentYear"
        :month="currentMonth"
        :week="currentWeek"
        :day="currentDay"
        :unit="unit"
        :is-loading="isInfoLoading"
        :is-loading-error="isInfoLoadingError"
        :tasks="tasks"
        :day-off-count="dayOffCount"
        @close="hideSideInfo"
      />
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import { monthToString, range } from '@/lib/time'
import { sortByName } from '@/lib/sorting'
import stringHelpers from '@/lib/string'

import ButtonHrefLink from '@/components/widgets/ButtonHrefLink.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import PeopleTimesheetList from '@/components/lists/PeopleTimesheetList.vue'
import PeopleTimesheetInfo from '@/components/sides/PeopleTimesheetInfo.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

export default {
  name: 'timesheets',

  components: {
    ButtonSimple,
    ButtonHrefLink,
    Combobox,
    ComboboxProduction,
    ComboboxStudio,
    PageTitle,
    PeopleTimesheetList,
    PeopleTimesheetInfo
  },

  data() {
    return {
      detailOptions: [
        {
          label: this.$t('main.day'),
          value: 'day'
        },
        {
          label: this.$t('main.week'),
          value: 'week'
        },
        {
          label: this.$t('main.month'),
          value: 'month'
        },
        {
          label: this.$t('main.year'),
          value: 'year'
        }
      ],
      unitOptions: [
        {
          label: this.$t('main.hour'),
          value: 'hour'
        },
        {
          label: this.$t('main.day'),
          value: 'day'
        }
      ],

      detailLevelString: 'day',
      detailLevel: 'day',
      productionId: '',
      productionIdString: '',
      studioId: '',
      studioIdString: '',
      yearString: `${moment().year()}`,
      monthString: `${moment().month() + 1}`,
      unit: 'hour',

      currentYear: moment().year(),
      currentMonth: moment().month() + 1,
      currentWeek: moment().week(),
      currentDay: moment().date(),
      currentPerson: this.getCurrentPerson(),

      isLoading: false,
      isLoadingError: false,

      dayOffCount: 0,
      isInfoLoading: false,
      isInfoLoadingError: false,
      showInfo: true,
      tasks: []
    }
  },

  async created() {
    this.isLoading = true
    this.loadProductions()
    if (!this.people.length) {
      await this.loadPeople()
    }
    this.loadRoute()
  },

  mounted() {
    const productionId = this.$route.query.productionId || undefined
    const studioId = this.$route.query.studioId || undefined

    if (productionId || studioId) {
      this.silent = true
      this.productionId = productionId
      this.productionIdString = productionId
      this.studioId = studioId
      this.studioIdString = studioId
      this.reloadTimesheet().then(() => {
        this.silent = false
      })
    }
  },

  computed: {
    ...mapGetters([
      'isCurrentUserAdmin',
      'organisation',
      'people',
      'productions',
      'personMap',
      'timesheet'
    ]),

    productionList() {
      const productions = sortByName([...this.productions]).map(production => {
        const suffix =
          production.project_status_name === 'Closed' ? ' (closed)' : ''
        return {
          ...production,
          name: production.name + suffix
        }
      })
      return [
        {
          id: '',
          name: this.$t('main.all')
        },
        ...productions
      ]
    },

    filteredPeople() {
      return this.people.filter(person => {
        const keys = Object.keys(this.timesheet)
        let isThere = false
        let i = 0
        do {
          if (this.timesheet[keys[i]]) {
            isThere = this.timesheet[keys[i]][person.id] !== undefined
          }
          i++
        } while (!isThere && i < keys.length)

        return isThere
      })
    },

    yearOptions() {
      const year = 2018
      const currentYear = moment().year()
      return range(year, currentYear).map(year => ({
        label: year,
        value: `${year}`
      }))
    },

    monthOptions() {
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
      'loadProductions',
      'loadAggregatedPersonDaysOff',
      'loadAggregatedPersonTimeSpents',
      'loadTimesheets'
    ]),

    reloadTimesheet() {
      this.isLoading = true
      this.isLoadingError = false
      return this.loadTimesheets({
        detailLevel: this.detailLevel,
        year: this.currentYear,
        month: this.currentMonth,
        productionId: this.productionId,
        studioId: this.studioId
      })
        .then(() => {
          this.isLoading = false
        })
        .catch(err => {
          console.error(err)
          this.isLoading = false
          this.isLoadingError = true
        })
    },

    showSideInfo() {
      this.showInfo = true
    },

    hideSideInfo() {
      this.showInfo = false
    },

    loadRoute() {
      // The main idea is to build the context from the route and compare it
      // to the current context. If there are changes, it applies it.
      // It handles too the display or not of the side column.
      this.$options.silent = true
      const { month, year, week, day } = this.$route.params
      const previousProduction = `${this.productionId}`
      const previousStudio = `${this.studioId}`
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
      this.productionId = this.$route.query.productionId || ''
      this.studioId = this.$route.query.studioId || ''

      const detailLevelHasChanged = previousDetailLevel !== this.detailLevel
      const monthHasChanged =
        previousMonth.localeCompare(`${this.currentMonth}`) !== 0
      const yearHasChanged =
        previousYear.localeCompare(`${this.currentYear}`) !== 0
      const productionHasChanged =
        previousProduction.localeCompare(`${this.productionId}`) !== 0
      const studioHasChanged =
        previousStudio.localeCompare(`${this.studioId}`) !== 0
      this.$nextTick(() => {
        this.$options.silent = false
      })

      if (this.$route.path.indexOf('person') > 0) {
        this.showSideInfo()
        this.loadAggregate()
      } else {
        this.hideSideInfo()
      }

      if (
        this.isLoading ||
        monthHasChanged ||
        yearHasChanged ||
        detailLevelHasChanged ||
        productionHasChanged ||
        studioHasChanged
      ) {
        this.reloadTimesheet()
      }
    },

    loadAggregate() {
      this.isInfoLoading = true
      this.isInfoLoadingError = false
      this.tasks = []
      this.loadAggregatedPersonTimeSpents({
        personId: this.$route.params.person_id,
        detailLevel: this.detailLevel,
        year: this.$route.params.year,
        month: this.$route.params.month,
        week: this.$route.params.week,
        day: this.$route.params.day,
        productionId: this.productionId,
        studioId: this.studioId
      })
        .then(tasks => {
          this.tasks = tasks.filter(task => task.duration > 0)
          return this.loadAggregatedPersonDaysOff({
            personId: this.$route.params.person_id,
            detailLevel: this.detailLevel,
            year: this.$route.params.year,
            month: this.$route.params.month,
            week: this.$route.params.week
          })
        })
        .then(dayOffs => {
          this.dayOffCount = dayOffs.length
          this.isInfoLoading = false
        })
        .catch(err => {
          console.error(err)
          this.isInfoLoadingError = true
        })
    },

    getCurrentPerson() {
      const personId = this.$route.params.person_id
      if (personId && this.personMap) {
        return this.personMap.get(personId)
      } else {
        return {}
      }
    },

    exportTimesheet() {
      const nameData = ['timesheet', this.detailLevel, this.currentYear]
      if (this.detailLevel === 'day') nameData.push(this.currentMonth)
      const name = stringHelpers.slugify(nameData.join('_'))
      csv.generateTimesheet(
        name,
        this.timesheet,
        this.filteredPeople,
        this.unit,
        this.organisation,
        this.detailLevel,
        this.currentYear,
        this.currentMonth,
        moment().year(),
        moment().month() + 1,
        moment().week()
      )
    },

    updateRoute({ productionId, studioId }) {
      const query = { ...this.$route.query }

      if (productionId !== undefined) {
        query.productionId = productionId || undefined
      }
      if (studioId !== undefined) {
        query.studioId = studioId || undefined
      }

      if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
        this.$router.push({ query })
      }
    }
  },

  watch: {
    detailLevelString() {
      if (this.silent) return
      if (this.detailLevel !== this.detailLevelString) {
        if (this.detailLevelString === 'month') {
          this.$router.push({
            name: 'timesheets-month',
            params: {
              year: this.currentYear
            },
            query: this.$route.query
          })
        } else if (this.detailLevelString === 'week') {
          this.$router.push({
            name: 'timesheets-week',
            params: {
              year: this.currentYear
            },
            query: this.$route.query
          })
        } else if (this.detailLevelString === 'day') {
          this.$router.push({
            name: 'timesheets-day',
            params: {
              year: this.currentYear,
              month: this.currentMonth
            },
            query: this.$route.query
          })
        } else if (this.detailLevelString === 'year') {
          this.$router.push({
            name: 'timesheets-year',
            params: {
              year: this.currentYear
            },
            query: this.$route.query
          })
        }
      }
    },

    yearString() {
      if (this.silent) return
      const year = Number(this.yearString)
      const currentMonth = moment().month()
      if (this.currentYear !== year) {
        if (this.detailLevel === 'month') {
          this.$router.push({
            name: 'timesheets-month',
            params: { year },
            query: this.$route.query
          })
        } else if (this.detailLevel === 'week') {
          this.$router.push({
            name: 'timesheets-week',
            params: { year },
            query: this.$route.query
          })
        } else {
          this.$router.push({
            name: 'timesheets-day',
            params: {
              year: year,
              month: Math.min(Number(this.monthString), currentMonth)
            },
            query: this.$route.query
          })
        }
      }
    },

    monthString() {
      if (this.silent) return
      if (this.currentMonth !== Number(this.monthString)) {
        this.$router.push({
          name: 'timesheets-day',
          params: {
            year: this.currentYear,
            month: Number(this.monthString)
          },
          query: this.$route.query
        })
      }
    },

    productionIdString(value) {
      if (this.silent) return
      this.updateRoute({ productionId: value })
    },

    studioIdString(value) {
      if (this.silent) return
      this.updateRoute({ studioId: value })
    },

    $route() {
      this.loadRoute()
    }
  },

  head() {
    return {
      title: `${this.$t('timesheets.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .side-column {
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

.side-column {
  border-left: 3px solid $light-grey;
}

.title {
  margin-right: 1em;
  white-space: nowrap;
}
</style>
