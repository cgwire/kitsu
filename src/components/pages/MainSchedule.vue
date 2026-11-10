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
            class="flexrow-item"
            icon="clock"
            :text="$t('schedule.today')"
            @click="scrollScheduleToToday"
          />
        </div>
      </div>

      <schedule
        ref="schedule"
        :end-date="endDate"
        :hierarchy="scheduleItems"
        :is-loading="false"
        :start-date="startDate"
        :zoom-level="zoomLevel"
        hide-man-days
        :with-milestones="false"
        @item-changed="onScheduleItemChanged"
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
  getEndDateFromString,
  getFirstStartDate,
  getLastEndDate,
  getStartDateFromString,
  parseSimpleDate
} from '@/lib/time'

import Schedule from '@/components/schedule/Schedule.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import DateField from '@/components/widgets/DateField.vue'

// Composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const endDate = ref(moment().add(6, 'months'))
const scheduleItems = ref([])
const selectedEndDate = ref(null)
const selectedStartDate = ref(null)
const startDate = ref(moment())
const zoomLevel = ref(0)

const scheduleRef = useTemplateRef('schedule')

// Computed
// --------------------------------------------------------------------------
const openProductions = computed(() => store.getters.openProductions)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const zoomOptions = computed(() => [
  { label: t('main.week'), value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 }
])

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

const expandProductionElement = async productionElement => {
  if (productionElement.expanded) {
    productionElement.expanded = false
    return
  }
  productionElement.loading = true
  productionElement.expanded = true
  try {
    const items = await store.dispatch('loadScheduleItems', productionElement)
    productionElement.children = convertTaskTypeScheduleItems(items)
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

const scrollScheduleToToday = () => {
  scheduleRef.value?.scrollToToday()
}

const onScheduleItemChanged = item => {
  if (item.type !== 'Project') {
    store.dispatch('saveScheduleItem', item)
  } else {
    store.dispatch('editProduction', {
      id: item.id,
      start_date: item.startDate.format('YYYY-MM-DD'),
      end_date: item.endDate.format('YYYY-MM-DD')
    })
  }
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
