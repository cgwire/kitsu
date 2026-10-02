<template>
  <div class="data-list">
    <div class="datatable-wrapper" ref="body">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th
              scope="col"
              class="name datatable-row-header"
              ref="row-header-name"
            >
              {{ $t('quota.name') }}
            </th>
            <th
              scope="col"
              class="average datatable-row-header"
              :style="{ left: averageColumnX }"
            >
              {{ $t('quota.average') }}
            </th>
            <template v-if="detailLevel === 'month'">
              <th
                scope="col"
                :key="'month-' + month"
                v-for="month in monthRange"
              >
                {{ monthToString(month) }}
              </th>
            </template>
            <template v-else-if="detailLevel === 'week'">
              <th scope="col" :key="'week-' + week" v-for="week in weekRange">
                {{ week }}
              </th>
            </template>
            <template v-else-if="detailLevel === 'day'">
              <th scope="col" :key="'day-' + day" v-for="day in dayRange">
                {{ day }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="quotaLength > 0 && !isLoading">
          <tr
            :key="'name-' + key"
            class="datatable-row"
            v-for="key in entryIds"
          >
            <th scope="row" class="name datatable-row-header">
              <div class="flexrow" v-if="taskTypeId && key !== 'total'">
                <people-avatar :size="30" :person="personMap.get(key)" />
                {{ personMap.get(key)?.full_name }}
              </div>
              <div class="flexrow" v-else-if="taskTypeId && key === 'total'">
                {{ $t('main.total') }}
              </div>
              <div class="flexrow" v-else-if="personId && key !== 'total'">
                {{ taskTypeMap.get(key)?.name }}
              </div>
              <div class="flexrow" v-else-if="personId && key === 'total'">
                {{ $t('main.total') }}
              </div>
            </th>
            <td
              class="average datatable-row-header"
              :style="{ left: averageColumnX }"
            >
              <template
                v-if="detailLevel === 'month' || detailLevel === 'week'"
              >
                {{ getQuotaAverage(key, { year }) }}
              </template>
              <template v-else-if="detailLevel === 'day'">
                {{ getQuotaAverage(key, { year, month }) }}
              </template>
            </td>
            <template v-if="detailLevel === 'month'">
              <td
                :class="{
                  selected: isMonthSelected(key, year, month),
                  'quota-low': isMonthQuotaLow(key, year, month)
                }"
                :key="'month-' + month"
                v-for="month in monthRange"
              >
                <router-link
                  class="quota-button"
                  :to="
                    episodifyRoute({
                      name: 'quota-month-person',
                      params: {
                        person_id: personId ?? key,
                        year,
                        month
                      },
                      query: {
                        ...$route.query,
                        taskTypeId: personId ? key : null
                      }
                    })
                  "
                  v-if="key !== 'total' && getQuota(key, { year, month })"
                >
                  {{ getQuota(key, { year, month }) }}
                </router-link>
                <span v-else-if="key === 'total'">
                  {{ getQuota(key, { year, month }) }}
                </span>
                <span v-else>-</span>
              </td>
            </template>
            <template v-else-if="detailLevel === 'week'">
              <td
                :class="{
                  selected: isWeekSelected(key, year, week),
                  'quota-low': isWeekQuotaLow(key, year, week)
                }"
                :key="'week-' + week"
                v-for="week in weekRange"
              >
                <router-link
                  class="quota-button"
                  :to="
                    episodifyRoute({
                      name: 'quota-week-person',
                      params: {
                        person_id: personId ?? key,
                        year,
                        week
                      },
                      query: {
                        ...$route.query,
                        taskTypeId: personId ? key : null
                      }
                    })
                  "
                  v-if="key !== 'total' && getQuota(key, { year, week })"
                >
                  {{ getQuota(key, { year, week }) }}
                </router-link>
                <span v-else-if="key === 'total'">
                  {{ getQuota(key, { year, week }) }}
                </span>
                <span v-else> - </span>
              </td>
            </template>
            <template v-else-if="detailLevel === 'day'">
              <td
                :class="{
                  weekend: isWeekend(year, month, day),
                  selected: isDaySelected(key, year, month, day),
                  'quota-low': isDayQuotaLow(key, year, month, day)
                }"
                :key="'day-' + day"
                v-for="day in dayRange"
              >
                <router-link
                  class="quota-button"
                  :to="
                    episodifyRoute({
                      name: 'quota-day-person',
                      params: {
                        person_id: personId ?? key,
                        year,
                        month,
                        day
                      },
                      query: {
                        ...$route.query,
                        taskTypeId: personId ? key : null
                      }
                    })
                  "
                  v-if="key !== 'total' && getQuota(key, { year, month, day })"
                >
                  {{ getQuota(key, { year, month, day }) }}
                </router-link>
                <span v-else-if="key === 'total'">
                  {{ getQuota(key, { year, month, day }) }}
                </span>
                <span v-else> - </span>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="has-text-centered empty-quota"
      v-if="quotaLength === 0 && !isLoading"
    >
      <p class="info">{{ $t('quota.no_quota') }}</p>
    </div>

    <table-info :is-loading="isLoading" />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import moment from 'moment-timezone'
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { buildNameIndex, indexSearch } from '@/lib/indexing'
import { episodifyRoute as addEpisodeToRoute } from '@/lib/path'
import { filterPeople } from '@/lib/people'
import { sortTaskTypes } from '@/lib/sorting'
import {
  getDayRange,
  getMonthRange,
  getWeekRange,
  monthToString
} from '@/lib/time'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const route = useRoute()
const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  computeMode: { type: String, required: true },
  countMode: { type: String, required: true },
  departmentId: { type: String, default: '' },
  detailLevel: { type: String, required: true },
  maxQuota: { type: [Number, String], default: 0 },
  month: { type: Number, default: 0 },
  personId: { type: String, default: null },
  role: { type: String, default: 'all' },
  searchText: { type: String, default: '' },
  taskTypeId: { type: String, default: null },
  year: { type: Number, default: 0 }
})

// State
// --------------------------------------------------------------------------
const bodyRef = useTemplateRef('body')
const rowHeaderNameRef = useTemplateRef('row-header-name')

const averageColumnX = ref('12rem')
const isLoading = ref(true)
const personIds = ref([])
const quotaLength = ref(0)
const quotaMap = ref({})

const currentMonth = moment().month() + 1
const currentYear = moment().year()
let personIndex = null

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isShotsLoading = computed(() => store.getters.isShotsLoading)
const personMap = computed(() => store.getters.personMap)
const productionTeamRoles = computed(() => store.getters.productionTeamRoles)
const shotMap = computed(() => store.getters.shotMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const monthRange = computed(() =>
  getMonthRange(props.year, currentYear, currentMonth)
)

const dayRange = computed(() =>
  getDayRange(props.year, props.month, currentYear, currentMonth)
)

const weekRange = computed(() => getWeekRange(props.year, currentYear))

// The total row goes with the first filter: it sums everybody.
const filteredPersonIds = computed(() => {
  const isFiltered =
    props.searchText.length > 0 || props.departmentId || props.role !== 'all'
  if (!isFiltered) return personIds.value
  const searched = props.searchText.length
    ? indexSearch(personIndex, props.searchText.split(' '))
    : personIds.value.map(personId => personMap.value.get(personId))
  return filterPeople(searched.filter(Boolean), {
    departmentId: props.departmentId,
    role: props.role,
    projectRoles: productionTeamRoles.value
  }).map(person => person.id)
})

const entryIds = computed(() => {
  if (!props.personId) return filteredPersonIds.value
  const taskTypes = Object.keys(quotaMap.value)
    .filter(key => key !== 'total')
    .map(taskTypeId => taskTypeMap.value.get(taskTypeId))
    .filter(Boolean)
  return [
    ...sortTaskTypes(taskTypes, currentProduction.value).map(
      taskType => taskType.id
    ),
    'total'
  ]
})

// Functions
// --------------------------------------------------------------------------
const episodifyRoute = targetRoute => {
  if (currentEpisode.value) {
    addEpisodeToRoute(targetRoute, currentEpisode.value.id)
  }
  return targetRoute
}

const dateDigit = date => date.toString().padStart(2, '0')

const isWeekend = (year, month, day) => {
  const date = moment(`${year}-${month}-${dateDigit(day)}`, 'YYYY-MM-DD')
  return [0, 6].includes(date.day())
}

const calcAverageColumnX = () => {
  if (quotaLength.value > 0) {
    averageColumnX.value = `${rowHeaderNameRef.value.offsetWidth}px`
  }
}

const loadData = async () => {
  if (!props.taskTypeId && !props.personId) return
  isLoading.value = true
  try {
    quotaMap.value = await store.dispatch('computeQuota', {
      taskTypeId: props.taskTypeId,
      personId: props.personId,
      detailLevel: props.detailLevel,
      countMode: props.countMode,
      computeMode: props.computeMode
    })
    quotaLength.value = Object.keys(quotaMap.value).length
    calcAverageColumnX()
    await nextTick()
  } catch (err) {
    console.error(err)
    quotaMap.value = {}
    quotaLength.value = 0
    calcAverageColumnX()
  }
  isLoading.value = false
}

const getQuota = (personId, opt = {}) => {
  if (!personId) return '-'
  const periods = quotaMap.value[personId]
  let quota
  if (opt.day) {
    const dayKey = `${opt.year}-${dateDigit(opt.month)}-${dateDigit(opt.day)}`
    quota = periods.day[props.countMode][dayKey]
  } else if (opt.week) {
    quota = periods.week[props.countMode][`${opt.year}-${opt.week}`]
  } else {
    const monthKey = `${opt.year}-${dateDigit(opt.month)}`
    quota = periods.month[props.countMode][monthKey]
  }
  if (props.countMode === 'seconds') return quota ? quota.toFixed(2) : '-'
  return quota || '-'
}

const getQuotaAverage = (personId, opt = {}) => {
  if (!personId) return '-'
  const periods = quotaMap.value[personId]
  let total = 0
  let nbEntries
  if (props.detailLevel === 'day') {
    const monthKey = `${opt.year}-${dateDigit(opt.month)}`
    total = periods.month[props.countMode][monthKey]
    nbEntries = periods.day.entries[monthKey]
  } else if (props.detailLevel === 'week') {
    total = periods.year[props.countMode][opt.year]
    nbEntries = periods.week.entries[opt.year]
  } else if (props.detailLevel === 'month') {
    total = periods.year[props.countMode][opt.year]
    nbEntries = periods.month.entries[opt.year]
  }
  const average = total / nbEntries
  return average ? average.toFixed(2) : '-'
}

const isPeriodSelected = (personId, params) =>
  Boolean(route.params.person_id) &&
  route.params.person_id === personId &&
  Object.entries(params).every(
    ([key, value]) => `${route.params[key]}` === `${value}`
  )

const isDaySelected = (personId, year, month, day) =>
  isPeriodSelected(personId, { year, month, day })

const isWeekSelected = (personId, year, week) =>
  isPeriodSelected(personId, { year, week })

const isMonthSelected = (personId, year, month) =>
  isPeriodSelected(personId, { year, month })

const isDayQuotaLow = (personId, year, month, day) =>
  props.maxQuota > getQuota(personId, { year, month, day })

const isWeekQuotaLow = (personId, year, week) =>
  props.maxQuota > getQuota(personId, { year, week })

const isMonthQuotaLow = (personId, year, month) =>
  props.maxQuota > getQuota(personId, { year, month })

const resetPersonIds = () => {
  const fullName = personId => personMap.value.get(personId)?.full_name || ''
  const ids = Object.keys(quotaMap.value).filter(
    personId => personId !== 'total'
  )
  personIndex = buildNameIndex(
    ids.map(personId => personMap.value.get(personId))
  )
  personIds.value = [
    ...ids.sort((a, b) => fullName(a).localeCompare(fullName(b))),
    'total'
  ]
}

// Watchers
// --------------------------------------------------------------------------
watch(
  () => route.fullPath,
  () => {
    // Bring a selected cell hidden on the right into view.
    if (document.getElementsByClassName('selected').length === 0) {
      setTimeout(() => {
        bodyRef.value.scrollLeft += 380
      }, 100)
    }
  }
)

watch(
  () => props.computeMode,
  () => {
    loadData()
  }
)

watch(quotaMap, () => {
  if (props.taskTypeId) resetPersonIds()
})

watch(
  () => props.taskTypeId,
  () => {
    if (props.taskTypeId) loadData()
  }
)

watch(
  () => props.personId,
  () => {
    if (props.personId) loadData()
  }
)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  if (shotMap.value.size < 2) {
    setTimeout(async () => {
      await store.dispatch('loadShots')
      loadData()
    }, 100)
  } else {
    if (!isShotsLoading.value) isLoading.value = false
    loadData()
  }
})

// The page exports the quotas displayed by this list.
defineExpose({ quotaMap })
</script>

<style lang="scss" scoped>
.data-list {
  margin-top: 0;
}

.datatable-wrapper {
  overflow: auto;
  margin-bottom: 1rem;
}

.datatable {
  min-width: auto;
  .name {
    min-width: 12rem;
    text-align: left;
    justify-content: flex-start;
    .avatar {
      margin-right: 0.5rem;
    }
  }
  .average {
    width: 8rem;
  }
  th,
  td {
    text-align: center;
  }
}

.datatable-head th {
  min-width: 4rem;
}

.datatable-body th {
  padding: 1rem;
}

.datatable-body {
  th,
  td {
    border: 0;
  }
}

.info {
  color: var(--text);
}

.quota-low {
  color: $red;
}

.quota-button {
  border-radius: 0.5rem;
  padding: 0.5rem;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: inherit;
  font-size: inherit;
  &:focus,
  &:hover {
    background-color: var(--background-hover);
  }
}

.empty-quota {
  width: 100%;
}

.selected .quota-button {
  background: var(--purple);
  color: var(--text-strong);
}

.weekend {
  background-color: var(--background-panel);
}
</style>
