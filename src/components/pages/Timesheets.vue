<template>
  <div class="columns fixed-page" :class="{ 'with-info': showInfo }">
    <div class="column main-column">
      <div class="timesheets page">
        <div class="page-header" :class="{ collapsed: !showFilters }">
          <div class="filters flexrow">
            <combobox
              class="flexrow-item nowrap"
              :label="$t('timesheets.detail_level')"
              :options="detailOptions"
              v-model="detailLevel"
            />
            <combobox
              class="flexrow-item"
              :label="$t('timesheets.year')"
              :options="yearOptions"
              v-model="currentYear"
              v-if="detailLevel !== 'year'"
            />
            <combobox
              class="flexrow-item collapsible"
              :label="$t('timesheets.month')"
              :options="monthOptions"
              v-model="currentMonth"
              v-if="detailLevel === 'day'"
            />
            <combobox
              class="flexrow-item"
              :label="$t('timesheets.unit')"
              :options="unitOptions"
              v-model="unit"
            />
            <combobox
              class="flexrow-item collapsible people-filter"
              :label="$t('main.people')"
              :options="peopleOptions"
              v-model="peopleFilter"
            />
            <div class="filler"></div>
            <button-simple
              class="flexrow-item chart-button"
              icon="chart-column"
              :active="showChart"
              :title="$t('timesheets.chart')"
              @click="showChart = !showChart"
            />
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
            <button-simple
              class="flexrow-item filters-toggle"
              :title="
                $t(showFilters ? 'main.less_filters' : 'main.more_filters')
              "
              icon="funnel"
              :aria-expanded="`${showFilters}`"
              :is-on="showFilters"
              @click="showFilters = !showFilters"
            />
          </div>
          <div class="filters flexrow collapsible">
            <combobox-production
              class="flexrow-item"
              :label="$t('main.production')"
              :production-list="productionList"
              v-model="productionId"
            />
            <combobox-studio
              class="flexrow-item field"
              all-studios-label
              :label="$t('main.studio')"
              v-model="studioId"
            />
            <combobox-department
              class="flexrow-item field"
              all-departments-label
              :label="$t('main.department')"
              v-model="departmentId"
            />
            <people-field
              class="flexrow-item"
              :label="$t('main.person')"
              :people="selectablePeople"
              v-model="selectedPerson"
            />
          </div>
        </div>

        <timesheet-chart
          class="data-list"
          :people="filteredPeople"
          :timesheet="timesheet"
          :detail-level="detailLevel"
          :month="currentMonth"
          :year="currentYear"
          :unit="unit"
          :daily-rates="dailyRates"
          :is-loading="isLoading"
          :is-error="isLoadingError"
          v-if="showChart"
        />
        <people-timesheet-list
          class="data-list"
          :people="filteredPeople"
          :timesheet="timesheet"
          :detail-level="detailLevel"
          :month="currentMonth"
          :year="currentYear"
          :unit="unit"
          :daily-rates="dailyRates"
          :is-loading="isLoading"
          :is-error="isLoadingError"
          v-else
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
        :daily-rate="dailyRates[currentPerson.id] || 0"
        :is-loading="isInfoLoading"
        :is-loading-error="isInfoLoadingError"
        :tasks="tasks"
        :day-offs="dayOffs"
        :with-days-off="infoWithDaysOff"
      />
    </div>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { useHead } from '@unhead/vue'
import moment from 'moment-timezone'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import { sortByName } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import { monthToString, range } from '@/lib/time'

import PeopleTimesheetList from '@/components/lists/PeopleTimesheetList.vue'
import PeopleTimesheetInfo from '@/components/sides/PeopleTimesheetInfo.vue'
import ButtonHrefLink from '@/components/widgets/ButtonHrefLink.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import TimesheetChart from '@/components/widgets/TimesheetChart.vue'

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const dayOffs = ref([])
const salaryScale = ref(null)
const showFilters = ref(false)
const isInfoLoading = ref(false)
const isInfoLoadingError = ref(false)
// whether the load of the panel read the days off: the rule can change while
// the panel is open
const infoWithDaysOff = ref(false)
const isLoading = ref(false)
const isLoadingError = ref(false)
const tasks = ref([])

// Computed
// --------------------------------------------------------------------------
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
const organisation = computed(() => store.getters.organisation)
const people = computed(() => store.getters.people)
const personMap = computed(() => store.getters.personMap)
const productions = computed(() => store.getters.productions)
const timesheet = computed(() => store.getters.timesheet)
const firstYear = computed(() => store.getters.firstTimesheetYear)

// The route holds the whole selection: every filter reads it back and writes
// to it, so there is no local copy to keep in sync.
const detailLevel = computed({
  get: () => route.name?.split('-')[1] ?? 'day',
  set: level => {
    const params = { year: currentYear.value }
    if (level === 'day') params.month = currentMonth.value
    pushLevelRoute(level, params)
  }
})

const currentYear = computed({
  get: () => Number(route.params.year) || moment().year(),
  set: year => {
    if (['month', 'week'].includes(detailLevel.value)) {
      pushLevelRoute(detailLevel.value, { year })
    } else {
      const lastMonth = year === moment().year() ? moment().month() + 1 : 12
      pushLevelRoute('day', {
        year,
        month: Math.min(currentMonth.value, lastMonth)
      })
    }
  }
})

const currentMonth = computed({
  get: () => Number(route.params.month) || moment().month() + 1,
  set: month => pushLevelRoute('day', { year: currentYear.value, month })
})

const currentWeek = computed(
  () => Number(route.params.week) || moment().isoWeek()
)

const currentDay = computed(() => Number(route.params.day) || moment().date())

const productionId = computed({
  get: () => route.query.productionId ?? '',
  set: value => pushQuery('productionId', value)
})

const studioId = computed({
  get: () => route.query.studioId ?? '',
  set: value => pushQuery('studioId', value)
})

// the remaining filters live in the query too, so a reload or a shared
// link keeps them; defaults are left out of the URL
const unit = computed({
  get: () => {
    const known = unitOptions.value.map(option => option.value)
    return known.includes(route.query.unit) ? route.query.unit : 'hour'
  },
  set: value => pushQuery('unit', value === 'hour' ? '' : value)
})

const departmentId = computed({
  get: () => route.query.departmentId ?? '',
  set: value => pushQuery('departmentId', value)
})

const peopleFilter = computed({
  get: () => route.query.people ?? 'logged',
  set: value => pushQuery('people', value === 'logged' ? '' : value)
})

const selectedPerson = computed({
  get: () => personMap.value.get(route.query.personId) ?? null,
  set: person => pushQuery('personId', person?.id ?? '')
})

const showChart = computed({
  get: () => route.query.view === 'chart',
  set: value => pushQuery('view', value ? 'chart' : '')
})

const showInfo = computed(() => Boolean(route.params.person_id))

const currentPerson = computed(
  () => personMap.value.get(route.params.person_id) ?? {}
)

const canReadDaysOff = computed(() =>
  store.getters.canReadDaysOff(route.params.person_id)
)

const detailOptions = computed(() => [
  { label: t('main.day'), value: 'day' },
  { label: t('main.week'), value: 'week' },
  { label: t('main.month'), value: 'month' },
  { label: t('main.year'), value: 'year' }
])

const peopleOptions = computed(() => [
  { label: t('timesheets.with_time_logged'), value: 'logged' },
  { label: t('main.all'), value: 'all' }
])

// the salary unit reads the salary data, which only admins may
const unitOptions = computed(() => [
  { label: t('main.hour'), value: 'hour' },
  { label: t('main.day'), value: 'day' },
  ...(isCurrentUserAdmin.value
    ? [{ label: t('timesheets.salary'), value: 'salary' }]
    : [])
])

// the rate set on the person, else the salary scale entry of the first of
// their departments that has one for their position and seniority
const dailyRates = computed(() =>
  Object.fromEntries(
    people.value.map(person => [
      person.id,
      person.daily_salary ||
        (person.departments ?? [])
          .map(
            id =>
              salaryScale.value?.[id]?.[person.position]?.[person.seniority]
                ?.salary
          )
          .find(Boolean) ||
        0
    ])
  )
)

const productionList = computed(() => {
  const productionOptions = sortByName([...productions.value]).map(
    production => {
      const suffix =
        production.project_status_name === 'Closed' ? ' (closed)' : ''
      return { ...production, name: production.name + suffix }
    }
  )
  return [{ id: '', name: t('main.all') }, ...productionOptions]
})

// everyone the grid could show, and what the person field offers
const selectablePeople = computed(() => {
  const hasLoggedTime = person =>
    Object.values(timesheet.value).some(
      entry => entry?.[person.id] !== undefined
    )
  return people.value.filter(
    person =>
      (hasLoggedTime(person) ||
        (peopleFilter.value === 'all' && person.active && !person.is_bot)) &&
      (!departmentId.value || person.departments?.includes(departmentId.value))
  )
})

const filteredPeople = computed(() =>
  selectedPerson.value
    ? selectablePeople.value.filter(({ id }) => id === selectedPerson.value.id)
    : selectablePeople.value
)

const yearOptions = computed(() =>
  range(firstYear.value, moment().year()).map(year => ({
    label: `${year}`,
    value: year
  }))
)

const monthOptions = computed(() => {
  const lastMonth =
    currentYear.value === moment().year() ? moment().month() + 1 : 12
  return range(1, lastMonth).map(month => ({
    label: monthToString(month),
    value: month
  }))
})

// Functions
// --------------------------------------------------------------------------
const pushLevelRoute = (level, params) =>
  router.push({ name: `timesheets-${level}`, params, query: route.query })

const pushQuery = (key, value) => {
  if ((route.query[key] ?? '') === value) return
  router.push({ query: { ...route.query, [key]: value || undefined } })
}

const reloadTimesheet = async () => {
  isLoading.value = true
  isLoadingError.value = false
  try {
    await store.dispatch('loadTimesheets', {
      detailLevel: detailLevel.value,
      year: currentYear.value,
      month: currentMonth.value,
      productionId: productionId.value,
      studioId: studioId.value
    })
  } catch (error) {
    console.error(error)
    isLoadingError.value = true
  }
  isLoading.value = false
}

const loadAggregate = async () => {
  const withDaysOff = canReadDaysOff.value
  isInfoLoading.value = true
  isInfoLoadingError.value = false
  infoWithDaysOff.value = withDaysOff
  tasks.value = []
  dayOffs.value = []
  try {
    const aggregatedTasks = await store.dispatch(
      'loadAggregatedPersonTimeSpents',
      {
        personId: route.params.person_id,
        detailLevel: detailLevel.value,
        year: route.params.year,
        month: route.params.month,
        week: route.params.week,
        day: route.params.day,
        productionId: productionId.value,
        studioId: studioId.value
      }
    )
    tasks.value = aggregatedTasks.filter(task => task.duration > 0)
    dayOffs.value = withDaysOff
      ? await store.dispatch('loadAggregatedPersonDaysOff', {
          personId: route.params.person_id,
          detailLevel: detailLevel.value,
          year: route.params.year,
          month: route.params.month,
          week: route.params.week
        })
      : []
  } catch (error) {
    console.error(error)
    isInfoLoadingError.value = true
  }
  isInfoLoading.value = false
}

const exportTimesheet = () => {
  const nameData = ['timesheet', detailLevel.value, currentYear.value]
  if (detailLevel.value === 'day') nameData.push(currentMonth.value)
  const name = stringHelpers.slugify(nameData.join('_'))
  csv.generateTimesheet({
    name,
    timesheet: timesheet.value,
    people: filteredPeople.value,
    unit: unit.value,
    dailyRates: dailyRates.value,
    organisation: organisation.value,
    detailLevel: detailLevel.value,
    todayYear: moment().year(),
    todayMonth: moment().month() + 1,
    year: currentYear.value,
    month: currentMonth.value,
    week: currentWeek.value
  })
}

// Watchers
// --------------------------------------------------------------------------
watch(
  [detailLevel, currentYear, currentMonth, productionId, studioId],
  reloadTimesheet
)

// the person field silently drops a selection that leaves its option list,
// which would otherwise leave the grid filtered on nobody
watch(selectablePeople, list => {
  const { id } = selectedPerson.value ?? {}
  if (id && !list.some(person => person.id === id)) {
    selectedPerson.value = null
  }
})

// the query also carries the display filters, which the aggregate does
// not depend on
watch([() => route.path, productionId, studioId], () => {
  if (showInfo.value) loadAggregate()
})

// Lifecycle
// --------------------------------------------------------------------------
// the salary scale is only needed, and only readable, for the salary unit
watch(
  unit,
  async value => {
    if (value === 'salary' && !salaryScale.value) {
      salaryScale.value = await store.dispatch('loadSalaryScale')
    }
  },
  { immediate: true }
)

onMounted(async () => {
  isLoading.value = true
  store.dispatch('loadProductions')
  if (!people.value.length) {
    await store.dispatch('loadPeople')
  }
  reloadTimesheet()
  if (showInfo.value) loadAggregate()
})

// Head
// --------------------------------------------------------------------------
useHead({ title: computed(() => `${t('timesheets.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.data-list {
  margin-top: 2em;
}

.timesheets {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 1em;
}

// the person panel is its own surface: the column only frames it
.column.side-column {
  background: transparent;
  padding: 1em 1em 1em 0;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}

.filters {
  align-items: flex-start;
  flex-wrap: wrap;
  row-gap: 1.5em;

  // the comboboxes carry the Bulma field margin the person field and the
  // buttons lack, which pushed those 14px down in the centered rows
  > .flexrow-item {
    margin-bottom: 0;
  }

  // the icon buttons render 32px tall: stretch them to the controls and
  // sit them on the row's bottom edge, under the labels
  > .button {
    align-self: flex-end;
    height: 42px;
  }
}

// measured on the live row: ComboboxStudio and ComboboxDepartment deviate
// on BOTH metrics of the centered header rows, so both need pinning. Their
// label takes a 5px padding-top under the field class, and their control
// renders 38px tall against 42px for the production combo and the Bulma
// selects.
// small screens only: the filters fold behind it
.filters-toggle {
  display: none;
}

.page-header :deep(.label) {
  margin-bottom: 5px;
  padding-top: 0;
}

.page-header :deep(.studio-combo),
.page-header :deep(.department-combo) {
  display: flex;
  flex-direction: column;
  height: 42px;
  justify-content: center;
}

@media screen and (max-width: 768px) {
  .data-list {
    margin-top: 1em;
  }

  .page-header {
    gap: 1em;
  }

  .filters {
    row-gap: 1em;

    // read-only below the tablet breakpoint, like the admin lists
    > .button {
      display: none;
    }

    > .filters-toggle {
      display: flex;
    }
  }

  .collapsed .collapsible {
    display: none;
  }

  // on its own line under the toggle, once unfolded
  .people-filter {
    flex: 0 0 calc(100% - 1rem);
    order: 1;
  }

  // the panel takes the whole width in place of the grid: its close
  // button (or Escape) brings the grid back
  .with-info .main-column {
    display: none;
  }

  .column.side-column {
    max-width: none;
    padding: 0.5em;
    width: 100%;
  }
}
</style>
