<template>
<div
  class="columns fixed-page"
>
  <div
    class="column main-column"
  >
    <div class="flexrow filters">
      <div class="flexrow-item">
        <combobox-task-type
          class="flexrow-item"
          :label="$t('quota.type_label')"
          :task-type-list="shotTaskTypes"
          v-model="taskTypeId"
        />
      </div>
      <div class="flexrow-item">
        <combobox
          class="flexrow-item"
          :label="$t('quota.detail_label')"
          :options="detailLevelOptions"
          v-model="detailLevelString"
        />
      </div>

      <combobox
        class="flexrow-item"
        :label="$t('quota.month_label')"
        :options="monthOptions"
        v-model="monthString"
        v-if="detailLevelString === 'day'"
      />

      <combobox
        class="flexrow-item"
        :label="$t('quota.year_label')"
        :options="yearOptions"
        v-model="yearString"
      />

      <div class="flexrow-item">
        <combobox
          class="flexrow-item"
          :label="$t('quota.count_label')"
          :options="countModeOptions"
          v-model="countMode"
        />
      </div>
    </div>

    <quota
      :taskTypeId="taskTypeId"
      :detailLevel="detailLevelString"
      :year="currentYear"
      :month="currentMonth"
      :week="currentWeek"
      :day="currentDay"
      :currentPerson="currentPerson"
      :countMode="currentMode"
    />
  </div>
</div>

</template>

<script>
import moment from 'moment-timezone'
import { monthToString, range } from '../../lib/time'
import { mapGetters } from 'vuex'
import Combobox from '../widgets/Combobox'
import ComboboxTaskType from '../widgets/ComboboxTaskType'
import Quota from './quota/Quota'

export default {
  name: 'production-quota',
  components: {
    Combobox,
    ComboboxTaskType,
    Quota
  },

  data () {
    return {
      taskTypeId: '',
      countMode: 'frames',
      countModeOptions: [
        { label: 'Frames', value: 'frames' },
        { label: 'Seconds', value: 'seconds' }
      ],
      detailLevelOptions: [
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' }
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
      currentMode: 'frames',

      isLoading: false,
      isLoadingError: false
    }
  },

  created () {
    this.loadRoute()
  },

  mounted () {
    this.taskTypeId = this.shotTaskTypes[0].id
  },

  computed: {
    ...mapGetters([
      'shotTaskTypes',
      'personMap'
    ]),
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
    getCurrentPerson () {
      const personId = this.$route.params.person_id
      if (personId && this.personMap) {
        return this.personMap[personId]
      } else {
        return {}
      }
    },

    loadRoute () {
      const { month, year, week, day } = this.$route.params
      const { countMode } = this.$route.query

      if (this.$route.path.indexOf('week') > 0) this.detailLevel = 'week'
      if (this.$route.path.indexOf('month') > 0) this.detailLevel = 'month'
      if (this.$route.path.indexOf('day') > 0) this.detailLevel = 'day'

      this.currentPerson = this.getCurrentPerson()
      this.detailLevelString = this.detailLevel
      if (countMode) {
        this.countMode = countMode
        this.currentMode = this.countMode
      }
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
    }
  },

  watch: {
    detailLevelString () {
      if (this.detailLevel !== this.detailLevelString) {
        if (this.detailLevelString === 'month') {
          this.$router.push({
            name: 'quota-month',
            params: {
              year: this.currentYear
            },
            query: {
              countMode: this.countMode
            }
          })
        } else if (this.detailLevelString === 'week') {
          this.$router.push({
            name: 'quota-week',
            params: {
              year: this.currentYear
            },
            query: {
              countMode: this.countMode
            }
          })
        } else if (this.detailLevelString === 'day') {
          this.$router.push({
            name: 'quota-day',
            params: {
              year: this.currentYear,
              month: this.currentMonth
            },
            query: {
              countMode: this.countMode
            }
          })
        }
      }
    },
    yearString () {
      const year = Number(this.yearString)
      const currentMonth = moment().month() + 1
      if (this.currentYear !== year) {
        if (this.detailLevel === 'month') {
          this.$router.push({
            name: 'quota-month',
            params: {
              year: year
            },
            query: {
              countMode: this.countMode
            }
          })
        } else if (this.detailLevel === 'week') {
          console.log(this.currentYear)
          this.$router.push({
            name: 'quota-week',
            params: {
              year: year
            },
            query: {
              countMode: this.countMode
            }
          })
        } else {
          this.$router.push({
            name: 'quota-day',
            params: {
              year: year,
              month: Math.min(Number(this.monthString), currentMonth)
            },
            query: {
              countMode: this.countMode
            }
          })
        }
      }
    },

    monthString () {
      if (this.currentMonth !== Number(this.monthString)) {
        this.$router.push({
          name: 'quota-day',
          params: {
            year: this.currentYear,
            month: Number(this.monthString)
          },
          query: {
            countMode: this.countMode
          }
        })
      }
    },

    countMode () {
      if (this.currentMode !== this.countMode) {
        this.$router.push({
          name: this.$route.name,
          query: {
            countMode: this.countMode
          }
        })
        this.currentMode = this.countMode
      }
    },

    $route () {
      this.loadRoute()
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .filters {
    color: $white-grey;
  }
}

.filters {
  padding-bottom: 4rem;

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
