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
          :task-type-list="productionShotTaskTypes"
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
      <combobox
        class="flexrow-item"
        :label="$t('quota.compute_mode')"
        :options="computeModeOptions"
        v-model="computeMode"
      />
      <div class="flexrow-item">
        <info-question-mark
          class="mt2"
          :text="computeMode === 'weighted'
                 ? $t('quota.explaination')
                 : $t('quota.explaination_feedback')
                "
        />
      </div>
      <div class="filler"></div>
      <button-simple
        class="flexrow-item"
        :title="$t('quota.export_quotas')"
        icon="download"
        @click="exportQuotas"
      />
    </div>

    <div class="flexrow mb2 mt0">
      <search-field
        ref="search-field"
        class="search-field flexrow-item"
        @change="onSearchChange"
      />

      <span class="label flexrow-item">
        {{ $t('quota.highlight_quotas') }}
      </span>

      <text-field
        class="flexrow-item max-quota-input"
        type="number"
        v-model="maxQuota"
      />
    </div>

    <quota
      ref="quota-list"
      :taskTypeId="taskTypeId"
      :detailLevel="detailLevelString"
      :year="currentYear"
      :month="currentMonth"
      :week="currentWeek"
      :day="currentDay"
      :currentPerson="currentPerson"
      :countMode="currentMode"
      :computeMode="computeMode"
      :searchText="searchText"
      :maxQuota="maxQuota"
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
      :is-loading="isPersonShotsLoading"
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

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import { monthToString, range } from '../../lib/time'
import { episodifyRoute } from '../../lib/path'
import ButtonSimple from '../widgets/ButtonSimple'
import Combobox from '../widgets/Combobox'
import ComboboxTaskType from '../widgets/ComboboxTaskType'
import InfoQuestionMark from '../widgets/InfoQuestionMark'
import PeopleQuotaInfo from '../sides/PeopleQuotaInfo'
import Quota from './quota/Quota'
import SearchField from '../widgets/SearchField'
import TextField from '../widgets/TextField'

export default {
  name: 'production-quota',
  components: {
    ButtonSimple,
    Combobox,
    ComboboxTaskType,
    InfoQuestionMark,
    PeopleQuotaInfo,
    Quota,
    SearchField,
    TextField
  },

  data () {
    return {
      taskTypeId: '',
      countMode: 'frames',
      countModeOptions: [
        { label: this.$t('quota.frames'), value: 'frames' },
        { label: this.$t('quota.seconds'), value: 'seconds' },
        { label: this.$t('quota.count'), value: 'count' }
      ],
      detailLevelOptions: [
        { label: this.$t('quota.day'), value: 'day' },
        { label: this.$t('quota.week'), value: 'week' },
        { label: this.$t('quota.month'), value: 'month' }
      ],
      computeModeOptions: [
        { label: this.$t('quota.weighted'), value: 'weighted' },
        { label: this.$t('quota.feedback_date'), value: 'feedback' }
      ],
      computeMode: 'weighted',
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
      isPersonShotsLoading: false,
      maxQuota: 0,
      monthString: `${moment().month() + 1}`,

      personShots: [],
      searchText: '',
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
      'productionShotTaskTypes',
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
      'getPersonQuotaShots',
      'loadShots'
    ]),

    getCurrentPerson () {
      const personId = this.$route.params.person_id
      if (personId && this.personMap) {
        return this.personMap.get(personId)
      } else {
        return {}
      }
    },

    loadRoute () {
      const { month, year, week, day } = this.$route.params
      const { countMode, taskTypeId, computeMode } = this.$route.query

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
      if (computeMode) {
        this.computeMode = computeMode
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
        this.isPersonShotsLoading = true
        this.getPersonQuotaShots({
          personId: this.currentPerson.id,
          detailLevel: this.detailLevel,
          taskTypeId: this.taskTypeId,
          year,
          month,
          week,
          day,
          computeMode: this.computeMode
        })
          .then(shots => {
            this.isPersonShotsLoading = false
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
    },

    episodifyRoute (route) {
      if (this.currentEpisode) {
        episodifyRoute(route, this.currentEpisode.id)
      }
      return route
    },

    exportQuotas () {
      const quotas = this.$refs['quota-list'].quotaMap
      const nameData = [
        'quotas',
        this.detailLevel,
        this.currentYear
      ]
      if (this.detailLevel === 'day') nameData.push(this.currentMonth)
      const name = stringHelpers.slugify(nameData.join('_'))
      const people = Object.keys(quotas)
        .map(personId => this.personMap.get(personId))
        .sort((a, b) => a.full_name.localeCompare(b.full_name))
      csv.generateQuotas(
        name,
        quotas,
        people,
        this.countMode,
        this.detailLevel,
        moment().year(),
        moment().month() + 1,
        this.currentYear,
        this.currentMonth,
        this.currentWeek
      )
    },

    onSearchChange (searchText) {
      this.searchText = searchText
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
            countMode: this.countMode,
            computeMode: this.computeMode
          }
        }
        if (this.detailLevelString === 'day') {
          route.params.month = this.currentMonth
        }
        this.$router.push(this.episodifyRoute(route))
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
            countMode: this.countMode,
            computeMode: this.computeMode
          }
        }
        if (this.detailLevelString === 'day') {
          route.params.month = `${Math.min(Number(this.monthString), currentMonth)}`
        }
        this.$router.push(this.episodifyRoute(route))
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
            countMode: this.countMode,
            computeMode: this.computeMode
          }
        }
        this.$router.push(this.episodifyRoute(route))
      }
    },

    countMode () {
      if (this.currentMode !== this.countMode) {
        if (this.$route.query.countMode !== this.countMode) {
          this.$router.push({
            query: {
              countMode: this.countMode,
              computeMode: this.computeMode
            }
          })
        }
        this.currentMode = this.countMode
      }
    },

    computeMode () {
      if (this.$route.query.computeMode !== this.computeMode) {
        this.$router.push({
          query: {
            computeMode: this.computeMode
          }
        })
      }
    },

    taskTypeId () {
      const key = `quota:${this.currentProduction.id}:task-type-id`
      localStorage.setItem(key, this.taskTypeId)
      if (this.$route.query.taskTypeId !== this.taskTypeId) {
        this.$router.push({
          query: {
            taskTypeId: this.taskTypeId
          }
        })
      }
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
  padding-bottom: 2rem;

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

.search-field {
  color: var(--text);
}

.label {
  font-weight: 300;
  color: var(--text);
}

.max-quota-input {
  width: 80px;
}
</style>
