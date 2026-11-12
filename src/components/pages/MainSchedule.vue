<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="schedule-toolbar">
        <div class="toolbar-row">
          <div class="flexrow-item">
            <date-field
              :label="$t('main.start_date')"
              week-days-disabled
              v-model="selectedStartDate"
              @update:model-value="onUpdateSelectedStartDate"
            />
          </div>
          <div class="flexrow-item">
            <date-field
              :label="$t('main.end_date')"
              week-days-disabled
              v-model="selectedEndDate"
              @update:model-value="onUpdateSelectedEndDate"
            />
          </div>
          <combobox-number
            class="flexrow-item zoom-level nowrap"
            :label="$t('schedule.zoom_level')"
            :options="zoomOptions"
            v-model="zoomLevel"
          />
          <div class="filler"></div>
          <button-simple
            class="flexrow-item previous-period"
            icon="left"
            :title="$t('main.previous')"
            @click="scrollScheduleByPeriod(-1)"
          />
          <button-simple
            class="flexrow-item"
            icon="clock"
            :text="$t('schedule.today')"
            @click="scrollScheduleToToday"
          />
          <button-simple
            class="flexrow-item next-period"
            icon="right"
            :title="$t('main.next')"
            @click="scrollScheduleByPeriod(1)"
          />
          <combobox
            class="flexrow-item period-unit"
            :aria-label="$t('schedule.period_unit')"
            locale-key-prefix="main."
            :options="periodUnitOptions"
            :with-margin="false"
            v-model="periodUnit"
          />
          <button-simple
            class="flexrow-item toggle-filters"
            :active="showMoreFilters"
            icon="funnel"
            :title="
              showMoreFilters
                ? $t('main.less_filters')
                : $t('main.more_filters')
            "
            @click="showMoreFilters = !showMoreFilters"
          />
        </div>
        <div class="toolbar-row" v-show="showMoreFilters">
          <div class="flexrow-item">
            <label class="label">{{ $t('productions.title') }}</label>
            <combobox-options
              :title="productionFilterTitle"
              :options="productionFilterOptions"
              :model-value="productionVisibilityMap"
              @change="onProductionVisibilityChanged"
            />
          </div>
          <div class="flexrow-item">
            <label class="label">{{ $t('task_types.title') }}</label>
            <combobox-options
              :title="taskTypeFilterTitle"
              :options="taskTypeFilterOptions"
              :model-value="taskTypeVisibilityMap"
              @change="onTaskTypeVisibilityChanged"
            />
          </div>
        </div>
      </div>

      <schedule
        ref="schedule"
        :end-date="endDate"
        :hierarchy="filteredScheduleItems"
        :is-loading="false"
        :milestones="shownMilestones"
        :start-date="startDate"
        :zoom-level="zoomLevel"
        hide-man-days
        readonly
        @root-element-expanded="expandProductionElement"
      />
    </div>
  </div>
</template>

<script setup>
// Imports
import { useHead } from '@unhead/vue'
import moment from 'moment-timezone'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import colors from '@/lib/colors'
import { episodifyRoute, getProductionSchedulePath } from '@/lib/path'
import {
  getTaskTypeFilterTitle,
  getTaskTypeVisibilityMap,
  getZoomOptions,
  setTaskTypeVisibility
} from '@/lib/productionSchedule'
import {
  getEndDateFromString,
  getFirstStartDate,
  getLastEndDate,
  getStartDateFromString,
  parseSimpleDate
} from '@/lib/time'

import Schedule from '@/components/schedule/Schedule.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'
import DateField from '@/components/widgets/DateField.vue'

// Composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const endDate = ref(moment().add(6, 'months'))
const hiddenProductionIds = ref([])
const hiddenTaskTypeIds = ref([])
const periodUnit = ref('weeks')
const milestones = ref([])
const scheduleItems = ref([])
const selectedEndDate = ref(null)
const selectedStartDate = ref(null)
const showMoreFilters = ref(false)
const startDate = ref(moment())
const zoomLevel = ref(0)

const scheduleRef = useTemplateRef('schedule')

// Computed
// --------------------------------------------------------------------------
const openProductions = computed(() => store.getters.openProductions)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const taskTypes = computed(() => store.getters.taskTypes)

const productionFilterOptions = computed(() =>
  openProductions.value.map(production => ({
    label: production.name,
    value: production.id
  }))
)

const productionVisibilityMap = computed(() =>
  getTaskTypeVisibilityMap(
    productionFilterOptions.value,
    hiddenProductionIds.value
  )
)

const productionFilterTitle = computed(() =>
  getTaskTypeFilterTitle(
    filteredScheduleItems.value.length,
    productionFilterOptions.value.length,
    t('main.all')
  )
)

// in the studio order, the task types of the open productions only
const taskTypeFilterOptions = computed(() => {
  const usedIds = new Set(
    openProductions.value.flatMap(production => production.task_types || [])
  )
  return taskTypes.value
    .filter(taskType => usedIds.has(taskType.id))
    .map(taskType => ({ label: taskType.name, value: taskType.id }))
})

const taskTypeVisibilityMap = computed(() =>
  getTaskTypeVisibilityMap(taskTypeFilterOptions.value, hiddenTaskTypeIds.value)
)

const taskTypeFilterTitle = computed(() => {
  const nbOptions = taskTypeFilterOptions.value.length
  return getTaskTypeFilterTitle(
    nbOptions - hiddenTaskTypeIds.value.length,
    nbOptions,
    t('main.all')
  )
})

const filteredScheduleItems = computed(() =>
  scheduleItems.value.filter(
    item => !hiddenProductionIds.value.includes(item.id)
  )
)

// prefixed with their production: the studio schedule mixes them all
const shownMilestones = computed(() => {
  const productionMap = new Map(
    filteredScheduleItems.value.map(item => [item.id, item])
  )
  return milestones.value
    .filter(milestone => productionMap.has(milestone.project_id))
    .map(milestone => ({
      ...milestone,
      name: `${productionMap.get(milestone.project_id).name}: ${milestone.name}`
    }))
})

const periodUnitOptions = [
  { label: 'day', value: 'days' },
  { label: 'week', value: 'weeks' },
  { label: 'month', value: 'months' }
]

const zoomOptions = computed(() => getZoomOptions(t, [0, 1, 2, 3]))

// Functions
// --------------------------------------------------------------------------
const toScheduleItem = (item, extra) => {
  const start = getStartDateFromString(item.start_date)
  return {
    ...item,
    startDate: start,
    endDate: getEndDateFromString(start, item.end_date),
    expanded: false,
    loading: false,
    editable: true,
    children: [],
    ...extra
  }
}

const convertScheduleItems = items =>
  items.map(item =>
    toScheduleItem(item, {
      avatar: item.type === 'Project',
      color: item.color || colors.fromString(item.name, true),
      // Without an episode, the schedule of a TV show has no episode selector.
      route: episodifyRoute(
        getProductionSchedulePath(item.id),
        item.production_type === 'tvshow' ? 'all' : null
      )
    })
  )

const convertTaskTypeScheduleItems = items =>
  items
    .filter(item => taskTypeMap.value.get(item.task_type_id))
    .map(item => {
      const taskType = taskTypeMap.value.get(item.task_type_id)
      return toScheduleItem(item, {
        name: taskType.name,
        color: taskType.color
      })
    })

const getVisibleTaskTypeItems = items =>
  items.filter(item => !hiddenTaskTypeIds.value.includes(item.task_type_id))

const onProductionVisibilityChanged = ({ key, value }) => {
  hiddenProductionIds.value = setTaskTypeVisibility(
    hiddenProductionIds.value,
    key,
    value
  )
}

// The rows of a production are loaded when it unfolds: the filter applies
// to the ones already loaded and to the next ones.
const onTaskTypeVisibilityChanged = ({ key, value }) => {
  hiddenTaskTypeIds.value = setTaskTypeVisibility(
    hiddenTaskTypeIds.value,
    key,
    value
  )
  scheduleItems.value.forEach(item => {
    if (item.allChildren) {
      item.children = getVisibleTaskTypeItems(item.allChildren)
    }
  })
}

const expandProductionElement = async productionElement => {
  if (productionElement.expanded) {
    productionElement.expanded = false
    return
  }
  productionElement.loading = true
  productionElement.expanded = true
  try {
    const items = await store.dispatch('loadScheduleItems', productionElement)
    productionElement.allChildren = convertTaskTypeScheduleItems(items)
    productionElement.children = getVisibleTaskTypeItems(
      productionElement.allChildren
    )
  } catch (err) {
    console.error(err)
    productionElement.expanded = false
  }
  productionElement.loading = false
}

const onUpdateSelectedStartDate = date => {
  startDate.value = parseSimpleDate(date)
}

const onUpdateSelectedEndDate = date => {
  endDate.value = parseSimpleDate(date)
}

const loadMilestones = async () => {
  try {
    milestones.value = await store.dispatch('loadAllMilestones')
  } catch (err) {
    console.error(err)
  }
}

const scrollScheduleByPeriod = direction => {
  scheduleRef.value?.scrollByPeriod(direction, periodUnit.value)
}

const scrollScheduleToToday = () => {
  scheduleRef.value?.scrollToToday()
}

// Watchers
// --------------------------------------------------------------------------
watch(zoomLevel, zoom => {
  const query = { ...route.query, zoom: String(zoom) }
  if (JSON.stringify(query) !== JSON.stringify(route.query)) {
    router.push({ query })
  }
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  const zoom = parseInt(route.query.zoom)
  zoomLevel.value = Math.min(Math.max(isNaN(zoom) ? 1 : zoom, 0), 3)
  if (openProductions.value.length) {
    scheduleItems.value = convertScheduleItems(openProductions.value)
    startDate.value = getFirstStartDate(scheduleItems.value)
    endDate.value = getLastEndDate(scheduleItems.value)
    selectedStartDate.value = startDate.value.toDate()
    selectedEndDate.value = endDate.value.toDate()
  }
  scrollScheduleToToday()
  loadMilestones()
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(() => `${t('schedule.title_main')} - Kitsu`)
})
</script>

<style lang="scss" scoped>
.dark .schedule-toolbar {
  color: var(--text);
}

.schedule-toolbar {
  background: var(--background-panel);
  border-radius: 12px;
  margin-bottom: 1em;
  padding: 0.75em 1em 1em;

  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  // Every control sits on the row bottom at the select height, as in the
  // production schedule toolbar
  :deep(.label) {
    margin-bottom: 5px;
    padding-top: 0;
  }

  :deep(.combo) {
    align-items: center;
    display: inline-flex;
    height: 42px;
    margin-top: 0;
  }

  :deep(.button) {
    height: 42px;
  }

  .zoom-level :deep(.control),
  .zoom-level :deep(.select) {
    height: 42px;
  }
}

// #app .dp--input sets the height globally; the id outranks the scope
#app .schedule-toolbar :deep(.dp--input) {
  height: 42px;
}

// the picker's dark input (#26292f) vanishes on the #25282e panel
.dark .schedule-toolbar :deep(.dp--input) {
  background: var(--background);
}

.toolbar-row {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  row-gap: 0.5em;

  & + & {
    margin-top: 0.75em;
  }

  > :last-child {
    margin-right: 0;
  }
}

.fixed-page {
  padding: 1em;
  // the 60px topbar, then the same 1em as the sides
  padding-top: calc(60px + 1em);
}

.main-column {
  display: flex;
  border: 0;
  overflow: hidden;
  flex-direction: column;
}
</style>
