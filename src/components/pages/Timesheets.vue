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
            all-studios-label
            :label="$t('main.studio')"
            v-model="studioIdString"
          />
          <combobox
            class="flexrow-item nowrap"
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
        @close="showInfo = false"
      />
    </div>
  </div>
</template>

<script setup>
// Imports
import { useHead } from '@unhead/vue'
import moment from 'moment-timezone'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

// Composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const currentDay = ref(moment().date())
const currentMonth = ref(moment().month() + 1)
const currentWeek = ref(moment().isoWeek())
const currentYear = ref(moment().year())
const dayOffCount = ref(0)
const detailLevel = ref('day')
const detailLevelString = ref('day')
const isInfoLoading = ref(false)
const isInfoLoadingError = ref(false)
const isLoading = ref(false)
const isLoadingError = ref(false)
const monthString = ref(`${moment().month() + 1}`)
const productionId = ref(route.query.productionId || '')
const productionIdString = ref(route.query.productionId || '')
const showInfo = ref(true)
const studioId = ref(route.query.studioId || '')
const studioIdString = ref(route.query.studioId || '')
const tasks = ref([])
const unit = ref('hour')
const yearString = ref(`${moment().year()}`)

// guards the combobox watchers while loadRoute applies the route context,
// so route-driven updates never push a new navigation themselves
let silent = false

// Computed
// --------------------------------------------------------------------------
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
const organisation = computed(() => store.getters.organisation)
const people = computed(() => store.getters.people)
const personMap = computed(() => store.getters.personMap)
const productions = computed(() => store.getters.productions)
const timesheet = computed(() => store.getters.timesheet)

const detailOptions = computed(() => [
  { label: t('main.day'), value: 'day' },
  { label: t('main.week'), value: 'week' },
  { label: t('main.month'), value: 'month' },
  { label: t('main.year'), value: 'year' }
])

const unitOptions = computed(() => [
  { label: t('main.hour'), value: 'hour' },
  { label: t('main.day'), value: 'day' }
])

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

const filteredPeople = computed(() =>
  people.value.filter(person =>
    Object.values(timesheet.value).some(
      entry => entry?.[person.id] !== undefined
    )
  )
)

const yearOptions = computed(() =>
  range(2018, moment().year()).map(year => ({
    label: year,
    value: `${year}`
  }))
)

const monthOptions = computed(() => {
  const lastMonth =
    yearString.value === `${moment().year()}` ? moment().month() + 1 : 12
  return range(1, lastMonth).map(month => ({
    label: monthToString(month),
    value: `${month}`
  }))
})

const currentPerson = computed(
  () =>
    (route.params.person_id && personMap.value.get(route.params.person_id)) ||
    {}
)

// Functions
// --------------------------------------------------------------------------
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
  isInfoLoading.value = true
  isInfoLoadingError.value = false
  tasks.value = []
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
    const dayOffs = await store.dispatch('loadAggregatedPersonDaysOff', {
      personId: route.params.person_id,
      detailLevel: detailLevel.value,
      year: route.params.year,
      month: route.params.month,
      week: route.params.week
    })
    dayOffCount.value = dayOffs.length
    isInfoLoading.value = false
  } catch (error) {
    console.error(error)
    isInfoLoadingError.value = true
  }
}

// Build the context from the route, compare it to the current one and
// apply the differences; also drives the side column visibility.
const loadRoute = () => {
  silent = true
  const { month, year, week, day } = route.params
  const previousProduction = `${productionId.value}`
  const previousStudio = `${studioId.value}`
  const previousDetailLevel = detailLevel.value
  const previousMonth = `${currentMonth.value}`
  const previousYear = `${currentYear.value}`

  if (route.path.indexOf('week') > 0) detailLevel.value = 'week'
  if (route.path.indexOf('month') > 0) detailLevel.value = 'month'
  if (route.path.indexOf('day') > 0) detailLevel.value = 'day'
  if (route.path.indexOf('year') > 0) detailLevel.value = 'year'
  detailLevelString.value = detailLevel.value

  if (month) {
    currentMonth.value = Number(month)
    monthString.value = `${month}`
  }
  if (year) {
    currentYear.value = Number(year)
    yearString.value = `${year}`
  }
  if (week) {
    currentWeek.value = Number(week)
  }
  if (day) {
    currentDay.value = Number(day)
  }
  productionId.value = route.query.productionId || ''
  studioId.value = route.query.studioId || ''
  productionIdString.value = productionId.value
  studioIdString.value = studioId.value

  const hasChanged =
    previousDetailLevel !== detailLevel.value ||
    previousMonth !== `${currentMonth.value}` ||
    previousYear !== `${currentYear.value}` ||
    previousProduction !== `${productionId.value}` ||
    previousStudio !== `${studioId.value}`

  // the combobox watchers flush before this callback runs
  nextTick(() => {
    silent = false
  })

  if (route.path.indexOf('person') > 0) {
    showInfo.value = true
    loadAggregate()
  } else {
    showInfo.value = false
  }

  if (isLoading.value || hasChanged) {
    reloadTimesheet()
  }
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
    organisation: organisation.value,
    detailLevel: detailLevel.value,
    todayYear: currentYear.value,
    todayMonth: currentMonth.value,
    year: moment().year(),
    month: moment().month() + 1,
    week: moment().isoWeek()
  })
}

const updateRoute = ({
  productionId: newProductionId,
  studioId: newStudioId
}) => {
  const query = { ...route.query }

  if (newProductionId !== undefined) {
    query.productionId = newProductionId || undefined
  }
  if (newStudioId !== undefined) {
    query.studioId = newStudioId || undefined
  }

  if (JSON.stringify(query) !== JSON.stringify(route.query)) {
    router.push({ query })
  }
}

// Watchers
// --------------------------------------------------------------------------
watch(detailLevelString, () => {
  if (silent) return
  if (detailLevel.value === detailLevelString.value) return
  const params = { year: currentYear.value }
  if (detailLevelString.value === 'day') params.month = currentMonth.value
  router.push({
    name: `timesheets-${detailLevelString.value}`,
    params,
    query: route.query
  })
})

watch(yearString, () => {
  if (silent) return
  const year = Number(yearString.value)
  if (currentYear.value === year) return
  if (['month', 'week'].includes(detailLevel.value)) {
    router.push({
      name: `timesheets-${detailLevel.value}`,
      params: { year },
      query: route.query
    })
  } else {
    router.push({
      name: 'timesheets-day',
      params: {
        year,
        month: Math.min(Number(monthString.value), moment().month() + 1)
      },
      query: route.query
    })
  }
})

watch(monthString, () => {
  if (silent) return
  if (currentMonth.value === Number(monthString.value)) return
  router.push({
    name: 'timesheets-day',
    params: {
      year: currentYear.value,
      month: Number(monthString.value)
    },
    query: route.query
  })
})

watch(productionIdString, value => {
  if (silent) return
  updateRoute({ productionId: value })
})

watch(studioIdString, value => {
  if (silent) return
  updateRoute({ studioId: value })
})

watch(() => route.fullPath, loadRoute)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  isLoading.value = true
  store.dispatch('loadProductions')
  if (!people.value.length) {
    await store.dispatch('loadPeople')
  }
  loadRoute()
})

// Head
// --------------------------------------------------------------------------
useHead({ title: computed(() => `${t('timesheets.title')} - Kitsu`) })
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
