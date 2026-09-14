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
      />
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import { mapActions, mapGetters } from 'vuex'

import csv from '@/lib/csv'
import { episodifyRoute } from '@/lib/path'
import preferences from '@/lib/preferences'
import { sortPeople } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import { monthToString, range } from '@/lib/time'
import personStore from '@/store/modules/people'

import Quota from '@/components/pages/quota/Quota.vue'
import PeopleQuotaInfo from '@/components/sides/PeopleQuotaInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
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

      detailLevel: 'day',

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
      paramsProductionId: null,
      personShots: [],
      silent: false,

      searchText: '',
      showInfo: false
    }
  },

  mounted() {
    this.setCountModeOptions()
    this.activeTab = this.$route.query.tab || 'tasktypes'
    // Mounted before the topbar set the production of the route: the
    // production watcher starts from the params of that production.
    if (this.$route.params.production_id !== this.currentProduction.id) return
    this.initParams()
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
      const persons =
        this.currentProduction?.team
          .map(personId => personMap.get(personId))
          .filter(Boolean) ?? []
      return sortPeople(persons)
    },

    yearOptions() {
      return range(2018, moment().year())
        .map(year => ({ label: year, value: `${year}` }))
        .reverse()
    },

    monthOptions() {
      const isCurrentYear = this.yearString === `${moment().year()}`
      const lastMonth = isCurrentYear ? moment().month() + 1 : 12
      return range(1, lastMonth).map(month => ({
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

      if (this.$route.path.includes('week')) this.detailLevel = 'week'
      if (this.$route.path.includes('month')) this.detailLevel = 'month'
      if (this.$route.path.includes('day')) this.detailLevel = 'day'

      this.currentPerson = this.getCurrentPerson()
      this.detailLevelString = this.detailLevel
      if (countMode) {
        this.countMode = countMode
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
      }
      if (day) {
        this.currentDay = Number(day)
      }

      if (this.$route.path.includes('person')) {
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
        .filter(Boolean)
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
      } else {
        this.countModeOptions = [
          { label: this.$t('quota.frames'), value: 'frames' },
          { label: this.$t('quota.seconds'), value: 'seconds' },
          { label: this.$t('quota.count'), value: 'count' }
        ]
        this.params.countMode = 'frames'
      }
    },

    // Params of the current production: the route query first, then the ones
    // saved for this production.
    initParams() {
      const key = `quota:${this.currentProduction.id}:params`
      const savedParams = preferences.getObjectPreference(key) || {}
      const defaultParams = {
        countMode: this.countModeOptions[0].value,
        computeMode: this.computeModeOptions[0].value,
        taskTypeId: this.productionShotTaskTypes[0].id
      }
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
      this.paramsProductionId = this.currentProduction.id
    },

    resetRouteQuery() {
      const query = this.getQuery()
      const key = `quota:${this.currentProduction.id}:params`
      preferences.setObjectPreference(key, this.params)
      // Replace: the query mirrors the params, it is no navigation of the
      // user's. A pushed entry was landed on by Back, then pushed again.
      this.$router.replace({ query })
    },

    throttledResetRouteQuery() {
      if (this.silent) return
      this.silent = true
      this.resetRouteQuery()
      setTimeout(() => {
        this.silent = false
      }, 100)
    },

    reloadShots() {
      this.loadShots().then(() => {
        this.resetRouteQuery()
        this.loadRoute()
      })
    },

    getQuery() {
      const taskTypeId =
        this.activeTab === 'tasktypes' ? this.params.taskTypeId : undefined
      const isPersonTab =
        this.activeTab === 'persons' || this.$route.query.tab === 'persons'
      const personId = isPersonTab
        ? (this.params.person?.id ?? this.teamPersons[0]?.id)
        : undefined
      return {
        countMode: this.params.countMode,
        computeMode: this.params.computeMode,
        tab: this.activeTab || 'tasktypes',
        taskTypeId,
        personId: personId || undefined
      }
    }
  },

  watch: {
    'params.person'() {
      this.throttledResetRouteQuery()
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
    },

    'params.computeMode'() {
      if (this.$route.query.computeMode !== this.params.computeMode) {
        this.resetRouteQuery()
        this.currentPerson = null
      }
    },

    'params.taskTypeId'() {
      if (this.params.taskTypeId) this.throttledResetRouteQuery()
    },

    currentProduction() {
      if (!this.currentProduction) return
      this.setCountModeOptions()
      // The params of the production left must neither be saved under this
      // one nor written into its URL.
      this.initParams()
      this.reloadShots()
    },

    currentEpisode() {
      this.reloadShots()
    },

    $route() {
      this.activeTab = this.$route.query.tab || 'tasktypes'
      // A production switch: the production watcher starts over from the
      // params of the new production.
      if (this.$route.params.production_id !== this.paramsProductionId) return
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
