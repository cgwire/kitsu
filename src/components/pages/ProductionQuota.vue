<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <route-tabs :active-tab="activeTab" :tabs="tabs" />

      <div class="flexrow filters">
        <div class="flexrow-item" v-if="activeTab === 'tasktypes'">
          <combobox-task-type
            class="flexrow-item"
            :label="$t('quota.type_label')"
            :task-type-list="taskTypeList"
            :disabled="!params.person"
            v-model="params.taskTypeId"
          />
        </div>
        <people-field
          ref="person-field"
          class="person-field flexrow-item"
          :clearable="false"
          :disabled="isCurrentUserArtist"
          :label="$t('main.person')"
          :people="teamPersons"
          v-model="params.person"
          v-if="activeTab === 'persons'"
        />
        <combobox
          class="flexrow-item"
          :label="$t('quota.detail_label')"
          :options="detailLevelOptions"
          v-model="detailLevelString"
        />
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
        <combobox
          class="flexrow-item"
          :label="$t('quota.count_label')"
          :options="countModeOptions"
          v-model="params.countMode"
        />
        <combobox
          class="flexrow-item"
          :label="$t('quota.compute_mode')"
          :options="computeModeOptions"
          v-model="params.computeMode"
        />
        <info-question-mark
          class="mt2 flexrow-item"
          :text="$t(`quota.explanation_${params.computeMode}`)"
        />
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
          v-if="activeTab === 'tasktypes'"
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
        :task-type-id="activeTab === 'tasktypes' ? params.taskTypeId : null"
        :person-id="
          activeTab === 'persons' && params.person ? params.person.id : null
        "
        :detail-level="detailLevelString"
        :year="currentYear"
        :month="currentMonth"
        :count-mode="params.countMode"
        :compute-mode="params.computeMode"
        :search-text="searchText"
        :max-quota="maxQuota"
      />
    </div>
    <div class="column side-column" v-if="showInfo && currentPerson">
      <people-quota-info
        :person="currentPerson"
        :year="currentYear"
        :month="currentMonth"
        :week="currentWeek"
        :day="currentDay"
        :is-loading="isPersonShotsLoading"
        :is-loading-error="false"
        :shots="personShots"
        :count-mode="params.countMode"
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

import { episodifyRoute } from '@/lib/path'
import preferences from '@/lib/preferences'
import { monthToString, range } from '@/lib/time'
import { sortPeople } from '@/lib/sorting'

import personStore from '@/store/modules/people'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import PeopleQuotaInfo from '@/components/sides/PeopleQuotaInfo.vue'
import Quota from '@/components/pages/quota/Quota.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import TextField from '@/components/widgets/TextField.vue'

const personMap = personStore.cache.personMap

export default {
  name: 'production-quota',

  components: {
    ButtonSimple,
    Combobox,
    ComboboxTaskType,
    InfoQuestionMark,
    PeopleField,
    PeopleQuotaInfo,
    Quota,
    RouteTabs,
    SearchField,
    TextField
  },

  data() {
    return {
      activeTab: 'tasktypes',
      tabs: [
        { name: 'tasktypes', label: this.$t('task_types.title') },
        { name: 'persons', label: this.$t('main.people') }
      ],
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
        { label: this.$t('quota.feedback_date'), value: 'feedback' },
        { label: this.$t('quota.weighted_done'), value: 'weighteddone' },
        { label: this.$t('quota.done_date'), value: 'done' }
      ],
      currentYear: moment().year(),
      currentMonth: moment().month() + 1,
      currentWeek: moment().week(),
      currentDay: moment().date(),
      currentPerson: this.getCurrentPerson(),
      currentMode: 'frames',

      detailLevel: 'day',

      isLoading: false,
      isPersonShotsLoading: false,
      maxQuota: 0,

      detailLevelString: 'day',
      monthString: `${moment().month() + 1}`,
      yearString: `${moment().year()}`,

      params: {
        countMode: 'frames',
        computeMode: 'weighted',
        person: null,
        taskTypeId: ''
      },
      personShots: [],
      silent: false,

      searchText: '',
      showInfo: false
    }
  },

  mounted() {
    this.setCountModeOptions()
    const key = `quota:${this.currentProduction.id}:params`
    const savedParams = preferences.getObjectPreference(key) || {}
    const defaultParams = {
      countMode: this.countModeOptions[0].value,
      computeMode: this.computeModeOptions[0].value,
      taskTypeId: this.productionShotTaskTypes[0].id
    }
    this.activeTab = this.$route.query.tab || 'tasktypes'
    this.params = {
      countMode:
        this.$route.query.countMode ||
        savedParams.countMode ||
        defaultParams.countMode,
      computeMode:
        this.$route.query.computeMode ||
        savedParams.computeMode ||
        defaultParams.computeMode,
      taskTypeId: this.$route.query.taskTypeId,
      person: this.$route.query.personId
        ? personMap.get(this.$route.query.personId)
        : null
    }
    if (!this.params.taskTypeId && !this.params.person) {
      this.params.taskTypeId =
        savedParams.taskTypeId || defaultParams.taskTypeId
    }
    this.resetRouteQuery()
    this.loadRoute()
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'isCurrentUserArtist',
      'isPaperProduction',
      'productionShotTaskTypes',
      'user'
    ]),

    taskTypeList() {
      return [...this.productionShotTaskTypes]
    },

    teamPersons() {
      if (this.isCurrentUserArtist) {
        return [personMap.get(this.user.id)]
      }
      return sortPeople(
        this.currentProduction.team.map(personId => personMap.get(personId))
      )
    },

    yearOptions() {
      const year = 2018
      const currentYear = moment().year()
      return range(year, currentYear)
        .map(year => ({
          label: year,
          value: `${year}`
        }))
        .reverse()
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
    ...mapActions(['getPersonQuotaShots', 'loadShots']),

    getCurrentPerson() {
      const personId = this.$route.params.person_id
      return personMap?.get(personId) ?? {}
    },

    loadRoute() {
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
        this.params.taskTypeId = taskTypeId
      }
      if (this.$route.query.personId) {
        this.params.person = personMap.get(this.$route.query.personId)
      }
      if (computeMode) {
        this.params.computeMode = computeMode
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
          taskTypeId: this.params.taskTypeId,
          year,
          month,
          week,
          day,
          computeMode: this.params.computeMode
        }).then(shots => {
          this.isPersonShotsLoading = false
          this.personShots = shots
          this.showSideInfo()
        })
      } else {
        this.hideSideInfo()
      }
    },

    showSideInfo() {
      this.showInfo = true
    },

    hideSideInfo() {
      this.showInfo = false
    },

    episodifyRoute(route) {
      if (this.currentEpisode) {
        episodifyRoute(route, this.currentEpisode.id)
      }
      return route
    },

    exportQuotas() {
      const quotas = this.$refs['quota-list'].quotaMap
      const nameData = ['quotas', this.detailLevel, this.currentYear]
      if (this.detailLevel === 'day') nameData.push(this.currentMonth)
      const name = stringHelpers.slugify(nameData.join('_'))
      const people = Object.keys(quotas)
        .map(personId => personMap.get(personId))
        .sort((a, b) =>
          a.full_name.localeCompare(b.full_name, undefined, {
            numeric: true
          })
        )
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

    onSearchChange(searchText) {
      this.searchText = searchText
    },

    setCountModeOptions() {
      if (this.isPaperProduction) {
        this.countModeOptions = [
          { label: this.$t('quota.drawings'), value: 'drawings' },
          { label: this.$t('quota.count'), value: 'count' }
        ]
        this.countMode = 'drawings'
        this.currentMode = this.params.countMode
      } else {
        this.countModeOptions = [
          { label: this.$t('quota.frames'), value: 'frames' },
          { label: this.$t('quota.seconds'), value: 'seconds' },
          { label: this.$t('quota.count'), value: 'count' }
        ]
        this.params.countMode = 'frames'
        this.currentMode = this.params.countMode
      }
    },

    resetRouteQuery() {
      const query = this.getQuery()
      const key = `quota:${this.currentProduction.id}:params`
      preferences.setObjectPreference(key, this.params)
      this.$router.push({ query })
    },

    getQuery() {
      const taskTypeId =
        this.activeTab === 'tasktypes' ? this.params.taskTypeId : undefined
      let personId = null
      const isPersonTab =
        this.activeTab === 'persons' || this.$route.query.tab === 'persons'
      if (isPersonTab && this.params.person) {
        personId = this.params.person.indexOf
      } else if (isPersonTab) {
        personId = this.teamPersons[0]?.id
      }
      const query = {
        countMode: this.params.countMode,
        computeMode: this.params.computeMode,
        tab: this.activeTab || 'tasktypes',
        taskTypeId,
        personId: personId || undefined
      }
      return query
    }
  },

  watch: {
    'params.person'() {
      if (!this.silent) {
        this.silent = true
        this.resetRouteQuery()
        setTimeout(() => {
          this.silent = false
        }, 100)
      }
    },

    detailLevelString() {
      if (this.detailLevel !== this.detailLevelString) {
        const route = {
          name: `quota-${this.detailLevelString}`,
          params: {
            year: this.currentYear
          },
          query: this.getQuery()
        }
        if (this.detailLevelString === 'day') {
          route.params.month = this.currentMonth
        }
        this.$router.push(this.episodifyRoute(route))
      }
    },

    yearString() {
      const year = Number(this.yearString)
      const currentMonth = moment().month() + 1
      if (this.currentYear !== year) {
        const route = {
          name: `quota-${this.detailLevelString}`,
          params: {
            year
          },
          query: this.getQuery()
        }
        if (this.detailLevelString === 'day') {
          route.params.month = `${Math.min(
            Number(this.monthString),
            currentMonth
          )}`
        }
        this.$router.push(this.episodifyRoute(route))
      }
    },

    monthString() {
      if (this.currentMonth !== Number(this.monthString)) {
        const route = {
          name: 'quota-day',
          params: {
            year: this.currentYear,
            month: this.monthString
          },
          query: this.getQuery()
        }
        this.$router.push(this.episodifyRoute(route))
      }
    },

    'params.countMode'() {
      this.resetRouteQuery()
      this.currentMode = this.params.countMode
    },

    'params.computeMode'() {
      if (this.$route.query.computeMode !== this.params.computeMode) {
        this.resetRouteQuery()
        this.currentPerson = null
      }
    },

    'params.taskTypeId'() {
      if (!this.silent && this.params.taskTypeId) {
        this.silent = true
        this.resetRouteQuery()
        setTimeout(() => {
          this.silent = false
        }, 100)
      }
    },

    currentProduction() {
      this.setCountModeOptions()
      this.isLoading = true
      this.loadShots(() => {
        this.resetRouteQuery()
        this.loadRoute()
        this.isLoading = false
      })
    },

    currentEpisode() {
      this.isLoading = true
      this.loadShots(() => {
        this.resetRouteQuery()
        this.loadRoute()
        this.isLoading = false
      })
    },

    $route() {
      this.activeTab = this.$route.query.tab || 'tasktypes'
      this.resetRouteQuery()
      this.loadRoute()
    }
  },

  head() {
    const prodName = this.currentProduction.name
    return {
      title: `${prodName} | ${this.$t('quota.title')} - Kitsu`
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
  padding-top: 60px;
  padding-left: 2em;
}

.main-column {
  border: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 2em;
  padding-right: 2em;
}

.zoom-level {
  margin-top: -10px;
}

.side-column {
  border-left: 1px solid var(--border);
  padding: 0;
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
