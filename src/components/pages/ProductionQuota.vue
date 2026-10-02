<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <route-tabs :active-tab="activeTab" :tabs="tabs" />

      <div class="flexrow filters">
        <combobox-task-type
          class="flexrow-item"
          :label="$t('quota.type_label')"
          :task-type-list="taskTypeList"
          v-model="params.taskTypeId"
          v-if="activeTab === 'tasktypes'"
        />
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
        <template v-if="activeTab === 'tasktypes'">
          <combobox-department
            class="flexrow-item"
            all-departments-label
            :label="$t('main.department')"
            v-model="params.departmentId"
          />
          <combobox-styled
            class="flexrow-item"
            :label="$t('people.fields.role')"
            locale-key-prefix="people.role."
            open-left
            :options="roleOptions"
            v-model="params.role"
          />
        </template>
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
        :department-id="params.departmentId"
        :role="params.role"
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

<script setup>
// Imports
// --------------------------------------------------------------------------
import { useHead } from '@unhead/vue'
import moment from 'moment-timezone'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import { episodifyRoute as addEpisodeToRoute } from '@/lib/path'
import { roleOptions } from '@/lib/people'
import preferences from '@/lib/preferences'
import { sortPeople } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import { monthToString, range } from '@/lib/time'
import personStore from '@/store/modules/people'

import Quota from '@/components/pages/quota/Quota.vue'
import PeopleQuotaInfo from '@/components/sides/PeopleQuotaInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

const personMap = personStore.cache.personMap

// State
// --------------------------------------------------------------------------
const quotaListRef = useTemplateRef('quota-list')

const activeTab = ref('tasktypes')
const currentDay = ref(moment().date())
const currentMonth = ref(moment().month() + 1)
const currentPerson = ref(null)
const currentWeek = ref(moment().week())
const currentYear = ref(moment().year())
const detailLevelString = ref('day')
const isPersonShotsLoading = ref(false)
const maxQuota = ref(0)
const monthString = ref(`${moment().month() + 1}`)
const params = ref({
  countMode: 'frames',
  computeMode: 'weighted',
  departmentId: '',
  person: null,
  role: 'all',
  taskTypeId: ''
})
const personShots = ref([])
const searchText = ref('')
const showInfo = ref(false)
const yearString = ref(`${moment().year()}`)

let detailLevel = 'day'
let paramsProductionId = null
let silent = false

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const isPaperProduction = computed(() => store.getters.isPaperProduction)
const productionShotTaskTypes = computed(
  () => store.getters.productionShotTaskTypes
)
const user = computed(() => store.getters.user)

const tabs = computed(() => [
  { name: 'tasktypes', label: t('task_types.title') },
  { name: 'persons', label: t('main.people') }
])

const countModeOptions = computed(() =>
  isPaperProduction.value
    ? [
        { label: t('quota.drawings'), value: 'drawings' },
        { label: t('quota.count'), value: 'count' }
      ]
    : [
        { label: t('quota.frames'), value: 'frames' },
        { label: t('quota.seconds'), value: 'seconds' },
        { label: t('quota.count'), value: 'count' }
      ]
)

const detailLevelOptions = computed(() => [
  { label: t('quota.day'), value: 'day' },
  { label: t('quota.week'), value: 'week' },
  { label: t('quota.month'), value: 'month' }
])

const computeModeOptions = computed(() => [
  { label: t('quota.weighted'), value: 'weighted' },
  { label: t('quota.feedback_date'), value: 'feedback' },
  { label: t('quota.weighted_done'), value: 'weighteddone' },
  { label: t('quota.done_date'), value: 'done' }
])

const taskTypeList = computed(() => [...productionShotTaskTypes.value])

const teamPersons = computed(() => {
  if (isCurrentUserArtist.value) return [personMap.get(user.value.id)]
  const persons =
    currentProduction.value?.team
      .map(personId => personMap.get(personId))
      .filter(Boolean) ?? []
  return sortPeople(persons)
})

const yearOptions = computed(() =>
  range(2018, moment().year())
    .map(year => ({ label: year, value: `${year}` }))
    .reverse()
)

const monthOptions = computed(() => {
  const isCurrentYear = yearString.value === `${moment().year()}`
  const lastMonth = isCurrentYear ? moment().month() + 1 : 12
  return range(1, lastMonth).map(month => ({
    label: monthToString(month),
    value: `${month}`
  }))
})

// Functions
// --------------------------------------------------------------------------
const getCurrentPerson = () => personMap.get(route.params.person_id) ?? {}

const episodifyRoute = targetRoute => {
  if (currentEpisode.value) {
    addEpisodeToRoute(targetRoute, currentEpisode.value.id)
  }
  return targetRoute
}

const loadRoute = async () => {
  const { month, year, week, day } = route.params
  const { taskTypeId, computeMode, personId } = route.query

  if (route.path.includes('week')) detailLevel = 'week'
  if (route.path.includes('month')) detailLevel = 'month'
  if (route.path.includes('day')) detailLevel = 'day'

  currentPerson.value = getCurrentPerson()
  detailLevelString.value = detailLevel
  if (taskTypeId) params.value.taskTypeId = taskTypeId
  if (personId) params.value.person = personMap.get(personId)
  if (computeMode) params.value.computeMode = computeMode
  if (month) {
    currentMonth.value = Number(month)
    monthString.value = `${month}`
  }
  if (year) {
    currentYear.value = Number(year)
    yearString.value = `${year}`
  }
  if (week) currentWeek.value = Number(week)
  if (day) currentDay.value = Number(day)

  if (route.path.includes('person')) {
    isPersonShotsLoading.value = true
    personShots.value = await store.dispatch('getPersonQuotaShots', {
      personId: currentPerson.value.id,
      detailLevel,
      taskTypeId: params.value.taskTypeId,
      year,
      month,
      week,
      day,
      computeMode: params.value.computeMode
    })
    isPersonShotsLoading.value = false
    showInfo.value = true
  } else {
    showInfo.value = false
  }
}

const exportQuotas = () => {
  const quotas = quotaListRef.value.quotaMap
  const nameData = [
    'quotas',
    detailLevel,
    currentYear.value,
    ...(detailLevel === 'day' ? [currentMonth.value] : [])
  ]
  const name = stringHelpers.slugify(nameData.join('_'))
  const people = Object.keys(quotas)
    .map(personId => personMap.get(personId))
    .filter(Boolean)
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
  csv.generateQuotas(
    name,
    quotas,
    people,
    params.value.countMode,
    detailLevel,
    moment().year(),
    moment().month() + 1,
    currentYear.value,
    currentMonth.value,
    currentWeek.value
  )
}

const onSearchChange = text => {
  searchText.value = text
}

const paramsKey = () => `quota:${currentProduction.value.id}:params`

// Params of the current production: the route query first, then the ones
// saved for this production.
const initParams = () => {
  const savedParams = preferences.getObjectPreference(paramsKey()) || {}
  const { query } = route
  params.value = {
    countMode:
      query.countMode ||
      savedParams.countMode ||
      countModeOptions.value[0].value,
    computeMode:
      query.computeMode ||
      savedParams.computeMode ||
      computeModeOptions.value[0].value,
    departmentId: query.department || savedParams.departmentId || '',
    role: query.role || savedParams.role || 'all',
    taskTypeId: query.taskTypeId,
    person: query.personId ? personMap.get(query.personId) : null
  }
  if (!params.value.taskTypeId && !params.value.person) {
    params.value.taskTypeId =
      savedParams.taskTypeId || productionShotTaskTypes.value[0].id
  }
  paramsProductionId = currentProduction.value.id
}

const getQuery = () => {
  const isPersonTab =
    activeTab.value === 'persons' || route.query.tab === 'persons'
  const personId = isPersonTab
    ? (params.value.person?.id ?? teamPersons.value[0]?.id)
    : undefined
  return {
    countMode: params.value.countMode,
    computeMode: params.value.computeMode,
    tab: activeTab.value || 'tasktypes',
    taskTypeId:
      activeTab.value === 'tasktypes' ? params.value.taskTypeId : undefined,
    department:
      activeTab.value === 'tasktypes'
        ? params.value.departmentId || undefined
        : undefined,
    role:
      activeTab.value === 'tasktypes' && params.value.role !== 'all'
        ? params.value.role
        : undefined,
    personId: personId || undefined
  }
}

const resetRouteQuery = () => {
  preferences.setObjectPreference(paramsKey(), params.value)
  // Replace: the query mirrors the params, it is no navigation of the
  // user's. A pushed entry was landed on by Back, then pushed again.
  router.replace({ query: getQuery() })
}

const throttledResetRouteQuery = () => {
  if (silent) return
  silent = true
  resetRouteQuery()
  setTimeout(() => {
    silent = false
  }, 100)
}

// the role filter reads the roles held in the production
const loadTeamRoles = () =>
  store.dispatch('loadProductionTeam').catch(console.error)

const reloadShots = async () => {
  await store.dispatch('loadShots')
  resetRouteQuery()
  loadRoute()
}

const pushPeriodRoute = (name, periodParams) => {
  router.push(episodifyRoute({ name, params: periodParams, query: getQuery() }))
}

// Watchers
// --------------------------------------------------------------------------
watch(
  () => params.value.person,
  () => throttledResetRouteQuery()
)

watch(detailLevelString, () => {
  if (detailLevel === detailLevelString.value) return
  pushPeriodRoute(`quota-${detailLevelString.value}`, {
    year: currentYear.value,
    ...(detailLevelString.value === 'day' ? { month: currentMonth.value } : {})
  })
})

watch(yearString, () => {
  const year = Number(yearString.value)
  if (currentYear.value === year) return
  const lastMonth = moment().month() + 1
  pushPeriodRoute(`quota-${detailLevelString.value}`, {
    year,
    ...(detailLevelString.value === 'day'
      ? { month: `${Math.min(Number(monthString.value), lastMonth)}` }
      : {})
  })
})

watch(monthString, () => {
  if (currentMonth.value === Number(monthString.value)) return
  pushPeriodRoute('quota-day', {
    year: currentYear.value,
    month: monthString.value
  })
})

watch(
  () => [params.value.countMode, params.value.departmentId, params.value.role],
  () => resetRouteQuery()
)

watch(
  () => params.value.computeMode,
  () => {
    if (route.query.computeMode !== params.value.computeMode) {
      resetRouteQuery()
      currentPerson.value = null
    }
  }
)

watch(
  () => params.value.taskTypeId,
  () => {
    if (params.value.taskTypeId) throttledResetRouteQuery()
  }
)

watch(currentProduction, () => {
  if (!currentProduction.value) return
  // The params of the production left must neither be saved under this
  // one nor written into its URL.
  initParams()
  loadTeamRoles()
  reloadShots()
})

watch(currentEpisode, () => {
  reloadShots()
})

watch(
  () => route.fullPath,
  () => {
    activeTab.value = route.query.tab || 'tasktypes'
    // A production switch: the production watcher starts over from the
    // params of the new production.
    if (route.params.production_id !== paramsProductionId) return
    resetRouteQuery()
    loadRoute()
  }
)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  currentPerson.value = getCurrentPerson()
  activeTab.value = route.query.tab || 'tasktypes'
  // Mounted before the topbar set the production of the route: the
  // production watcher starts from the params of that production.
  if (route.params.production_id !== currentProduction.value.id) return
  initParams()
  loadTeamRoles()
  resetRouteQuery()
  loadRoute()
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(
    () => `${currentProduction.value?.name} | ${t('quota.title')} - Kitsu`
  )
})
</script>

<style lang="scss" scoped>
.filters {
  color: var(--text);
  padding-bottom: 2rem;

  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  // the export button renders 32px tall: stretch it to the controls and
  // sit it on the row's bottom edge, under the labels (as on Timesheets)
  > .button {
    align-self: flex-end;
    height: 42px;
  }

  // the department combo's control renders 38px tall against 42px for
  // the Bulma selects, and its label carries a 5px padding-top
  :deep(.department-combo) {
    display: flex;
    flex-direction: column;
    height: 42px;
    justify-content: center;
  }

  :deep(.department-combo .label) {
    margin-bottom: 5px;
    padding-top: 0;
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
