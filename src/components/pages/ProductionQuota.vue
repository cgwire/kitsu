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
  <div
    class="column side-column"
    v-if="showInfo"
  >
    <people-quota-info
      :person="currentPerson"
      :year="currentYear"
      :month="currentMonth"
      :week="currentWeek"
      :day="currentDay"
      :is-loading="false"
      :is-loading-error="false"
      :shots="personShots"
      :count-mode="countMode"
      @close="hideSideInfo"
    />
  </div>
</div>
</template>

<script>
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'

import { monthToString, range } from '../../lib/time'
import { episodifyRoute } from '../../lib/path'
import Combobox from '../widgets/Combobox'
import ComboboxTaskType from '../widgets/ComboboxTaskType'
import Quota from './quota/Quota'
import PeopleQuotaInfo from '../sides/PeopleQuotaInfo'

export default {
  name: 'production-quota',
  components: {
    Combobox,
    ComboboxTaskType,
    PeopleQuotaInfo,
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
      currentYear: moment().year(),
      currentMonth: moment().month() + 1,
      currentWeek: moment().week(),
      currentDay: moment().date(),
      currentPerson: this.getCurrentPerson(),
      currentMode: 'frames',

      detailLevelString: 'day',
      detailLevel: 'day',

      isLoading: false,
      isLoadingError: false,
      monthString: `${moment().month() + 1}`,

      personShots: [],
      showInfo: false,
      yearString: `${moment().year()}`
    }
  },

  mounted () {
    this.loadRoute()
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
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
    ...mapActions([
      'computeQuota',
      'getPersonShots',
      'loadShots'
    ]),

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
      const { countMode, taskTypeId } = this.$route.query

      if (this.$route.path.indexOf('week') > 0) this.detailLevel = 'week'
      if (this.$route.path.indexOf('month') > 0) this.detailLevel = 'month'
      if (this.$route.path.indexOf('day') > 0) this.detailLevel = 'day'

      this.currentPerson = this.getCurrentPerson()
      this.detailLevelString = this.detailLevel
      if (countMode) {
        this.countMode = countMode
        this.currentMode = this.countMode
      }
      if (taskTypeId) {
        this.taskTypeId = taskTypeId
      } else {
        const key = `quota:${this.currentProduction.id}:task-type-id`
        this.taskTypeId =
          localStorage.getItem(key) || this.shotTaskTypes[0].id
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

      if (this.$route.path.indexOf('person') > 0) {
        this.getPersonShots({
          personId: this.currentPerson.id,
          detailLevel: this.detailLevel,
          taskTypeId: this.taskTypeId,
          year,
          month,
          week,
          day
        })
          .then(shots => {
            this.personShots = shots
            this.showSideInfo()
          })
      } else {
        this.hideSideInfo()
      }
    },

    showSideInfo () {
      this.showInfo = true
    },

    hideSideInfo () {
      this.showInfo = false
    }
  },

  watch: {
    detailLevelString () {
      if (this.detailLevel !== this.detailLevelString) {
        const route = {
          name: `quota-${this.detailLevelString}`,
          params: {
            year: this.currentYear
          },
          query: {
            countMode: this.countMode
          }
        }
        if (this.detailLevelString === 'day') {
          route.params.month = this.currentMonth
        }
        this.$router.push(episodifyRoute(route, this.currentEpisode.id))
      }
    },

    yearString () {
      const year = Number(this.yearString)
      const currentMonth = moment().month() + 1
      if (this.currentYear !== year) {
        const route = {
          name: `quota-${this.detailLevelString}`,
          params: {
            year: year
          },
          query: {
            countMode: this.countMode
          }
        }
        if (this.detailLevelString === 'day') {
          route.params.month = `${Math.min(Number(this.monthString), currentMonth)}`
        }
        this.$router.push(episodifyRoute(route, this.currentEpisode.id))
      }
    },

    monthString () {
      if (this.currentMonth !== Number(this.monthString)) {
        const route = {
          name: 'quota-day',
          params: {
            year: this.currentYear,
            month: Number(this.monthString)
          },
          query: {
            countMode: this.countMode
          }
        }
        this.$router.push(episodifyRoute(route, this.currentEpisode.id))
      }
    },

    countMode () {
      if (this.currentMode !== this.countMode) {
        this.$router.push({
          query: {
            countMode: this.countMode
          }
        })
        this.currentMode = this.countMode
      }
    },

    taskTypeId () {
      const key = `quota:${this.currentProduction.id}:task-type-id`
      localStorage.setItem(key, this.taskTypeId)
      this.$router.push({
        query: {
          taskTypeId: this.taskTypeId
        }
      })
    },

    currentProduction () {
      this.isLoading = true
      this.loadShots(() => {
        this.loadRoute()
        this.isLoading = false
      })
    },

    currentEpisode () {
      this.isLoading = true
      this.loadShots(() => {
        this.loadRoute()
        this.isLoading = false
      })
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

.side-column {
  margin: 0;
}
</style>
