<template>
  <div
    class="columns fixed-page"
    :class="{ 'is-productivity': isActiveTab('productivity') }"
  >
    <div class="column main-column">
      <div class="todos page task-page">
        <route-section-tabs
          class="section-tabs mt05"
          :active-tab="currentSection"
          :route="$route"
          :tabs="todoTabs"
        />

        <div
          class="todos-filters"
          :class="{
            'is-attached':
              isActiveTab('timesheets') ||
              isActiveTab('calendar') ||
              isActiveTab('productivity'),
            collapsed: isPhone && areFiltersFolded
          }"
          v-show="!isActiveTab('daysoff')"
        >
          <div class="flexrow">
            <div
              class="field flexrow-item search-field-column"
              v-show="!isActiveTab('productivity')"
            >
              <label class="label">{{ $t('main.search_query') }}</label>
              <search-field
                ref="todos-search-field"
                class="search-field"
                :can-save="true"
                :focus-options="{ preventScroll: true }"
                @change="onSearchChange"
                @save="saveSearchQuery"
              />
            </div>

            <button-simple
              class="flexrow-item filters-toggle"
              icon="funnel"
              :aria-expanded="`${!areFiltersFolded}`"
              :is-on="!areFiltersFolded"
              :title="
                $t(areFiltersFolded ? 'main.more_filters' : 'main.less_filters')
              "
              @click="areFiltersFolded = !areFiltersFolded"
            />

            <combobox-production
              class="flexrow-item production-field collapsible"
              :label="$t('main.production')"
              :production-list="productionList"
              v-model="productionId"
            />

            <combobox-task-type
              class="flexrow-item task-type-field collapsible"
              :label="$t('tasks.fields.task_type')"
              :task-type-list="taskTypeList"
              v-model="taskTypeId"
            />

            <combobox-styled
              class="flexrow-item collapsible"
              :label="$t('tasks.fields.due_date')"
              :options="filterOptions"
              locale-key-prefix="tasks."
              v-model="currentFilter"
              v-show="!isActiveTab('productivity')"
            />

            <span class="filler"></span>

            <combobox-styled
              class="flexrow-item collapsible"
              open-left
              :label="$t('main.sorted_by')"
              :options="sortOptions"
              locale-key-prefix="tasks.fields."
              v-model="currentSort"
              v-show="!isActiveTab('productivity')"
            />
          </div>
          <div
            class="query-list collapsible"
            v-show="!isActiveTab('productivity')"
          >
            <search-query-list
              :queries="todoSearchQueries"
              type="todo"
              @remove-search="removeSearchQuery"
            />
          </div>
        </div>

        <todos-list
          :editable="false"
          ref="todo-list"
          class="todos-panel"
          :empty-text="$t('people.no_task_assigned')"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :tasks="notPendingTasks"
          :selection-grid="todoSelectionGrid"
          @scroll="setTodoListScrollPosition"
          v-if="isActiveTab('todos')"
        />

        <todos-list
          :editable="false"
          class="todos-panel"
          :empty-text="$t('people.no_task_pending')"
          :with-illustration="false"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :tasks="pendingTasks"
          :selection-grid="todoSelectionGrid"
          @scroll="setTodoListScrollPosition"
          v-if="isActiveTab('pending')"
        />

        <todos-list
          :editable="false"
          ref="done-list"
          class="done-list todos-panel"
          done
          :empty-text="$t('people.no_task_done')"
          :with-illustration="false"
          :is-loading="loading.doneTasks || isTodosLoading"
          :is-error="isTodosLoadingError"
          :selection-grid="doneSelectionGrid"
          :tasks="sortedDoneTasks"
          v-if="isActiveTab('done')"
        />

        <div class="todos-panel board-panel" v-if="isActiveTab('board')">
          <kanban-board
            :is-loading="isTodosLoading"
            :is-error="isTodosLoadingError"
            :production="selectedProduction"
            :statuses="boardStatuses"
            :tasks="boardTasks"
            :user="user"
          />
        </div>

        <div class="calendar-panel" v-if="isActiveTab('calendar')">
          <user-calendar
            :days-off="daysOff"
            :is-loading="isTodosLoading"
            :tasks="sortedTasks"
            :time-spents="calendarTimeSpents"
            @dates-changed="onCalendarDatesChanged"
            @time-clicked="onCalendarTimeClicked"
          />
        </div>

        <productivity-chart
          class="productivity-panel"
          :count-mode="productivityCountMode"
          :is-error="isProductivityLoadingError"
          :is-loading="isProductivityLoading"
          :is-paper="isPaper"
          :level="productivityLevel"
          :metric="productivityMetric"
          :month="productivityMonth"
          :production-id="productionId"
          :quota-mode="productivityQuotaMode"
          :quotas="productivityQuotas"
          :selected-index="productivityPeriod"
          :task-type-id="taskTypeId"
          :time-spents="productivityTimeSpents"
          :year="productivityYear"
          @column-selected="onProductivityColumnSelected"
          @count-mode-changed="onProductivityCountModeChanged"
          @level-changed="onProductivityLevelChanged"
          @metric-changed="onProductivityMetricChanged"
          @period-changed="onProductivityPeriodChanged"
          @quota-mode-changed="onProductivityQuotaModeChanged"
          v-if="isActiveTab('productivity')"
        />

        <timesheet-list
          ref="timesheet-list"
          :initial-date="selectedDate"
          :person-id="user.id"
          :tasks="loggableTodos"
          :done-tasks="loggableDoneTasks"
          :is-loading="loading.timesheets || isTodosLoading"
          :is-error="isTodosLoadingError"
          :days-off="daysOff"
          v-model:day-off-error="dayOffError"
          :time-spent-map="timeSpentMap"
          :time-spent-total="timeSpentTotal"
          :hide-done="loggableDoneTasks.length === 0"
          :hide-day-off="false"
          @date-changed="onDateChanged"
          @time-spent-change="onTimeSpentChange"
          @set-day-off="onSetDayOff"
          @unset-day-off="onUnsetDayOff"
          v-if="isActiveTab('timesheets')"
        />

        <day-off-list
          ref="day-off-list"
          :days-off="daysOff"
          v-model:day-off-error="dayOffError"
          :is-error="isDaysOffLoadingError"
          @set-day-off="onSetDayOff"
          @unset-day-off="onUnsetDayOff"
          v-if="isActiveTab('daysoff')"
        />
      </div>
    </div>

    <div class="column side-column" v-if="nbSelectedTasks > 0">
      <task-info :task="selectedTasks.values().next().value" with-actions />
    </div>

    <div
      ref="productivity-side-column"
      class="column side-column productivity-side-column"
      v-if="isActiveTab('productivity') && productivityPeriod"
    >
      <people-quota-info
        :close-route="productivityCloseRoute"
        :count-mode="productivityCountMode"
        :is-loading="isProductivityInfoLoading"
        :is-loading-error="isProductivityInfoLoadingError"
        :level="productivityLevel"
        :person="user"
        :shots="productivityQuotaShots"
        v-bind="productivityPeriodParams"
        v-if="isQuotasMetric"
      />
      <people-timesheet-info
        :close-route="productivityCloseRoute"
        :day-offs="productivityDaysOff"
        :is-loading="isProductivityInfoLoading"
        :is-loading-error="isProductivityInfoLoadingError"
        :level="productivityLevel"
        :person="user"
        :tasks="productivityTasks"
        v-bind="productivityPeriodParams"
        v-else
      />
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import moment from 'moment-timezone'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useBoardStatuses } from '@/composables/board'
import { useProductivity } from '@/composables/productivity'
import { useTaskFilters } from '@/composables/taskFilters'

import DayOffList from '@/components/lists/DayOffList.vue'
import KanbanBoard from '@/components/lists/KanbanBoard.vue'
import TimesheetList from '@/components/lists/TimesheetList.vue'
import TodosList from '@/components/lists/TodosList.vue'
import PeopleQuotaInfo from '@/components/sides/PeopleQuotaInfo.vue'
import PeopleTimesheetInfo from '@/components/sides/PeopleTimesheetInfo.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ProductivityChart from '@/components/widgets/ProductivityChart.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import UserCalendar from '@/components/widgets/UserCalendar.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// State
// --------------------------------------------------------------------------
const currentSection = ref('todos')
const daysOff = ref([])
const isDaysOffLoadingError = ref(false)
const dayOffError = ref(false)
// Phones get neither the pending nor the validated tab, and fold the filters
const phoneQuery = window.matchMedia?.('(max-width: 768px)')
const isPhone = ref(Boolean(phoneQuery?.matches))
const areFiltersFolded = ref(true)
const productionId = ref(undefined)
const {
  currentFilter,
  currentSort,
  filterAndSortTasks,
  filterOptions,
  saveFilters,
  sortOptions,
  storedFilters,
  taskTypeId,
  taskTypeList
} = useTaskFilters({
  storageKey: 'todos:filters',
  productionId,
  tasks: computed(() =>
    store.getters.displayedTodos.concat(store.getters.displayedDoneTasks)
  )
})
const calendarTimeSpents = ref([])
const selectedDate = ref(moment().format('YYYY-MM-DD'))
const loading = reactive({
  doneTasks: false,
  timesheets: false,
  savingSearch: false
})

const searchFieldRef = useTemplateRef('todos-search-field')
const todoListRef = useTemplateRef('todo-list')
const doneListRef = useTemplateRef('done-list')
const timesheetListRef = useTemplateRef('timesheet-list')
const dayOffListRef = useTemplateRef('day-off-list')

// Computed
// --------------------------------------------------------------------------
const displayedDoneTasks = computed(() => store.getters.displayedDoneTasks)
const displayedTodos = computed(() => store.getters.displayedTodos)
const doneSelectionGrid = computed(() => store.getters.doneSelectionGrid)
const isTodosLoading = computed(() => store.getters.isTodosLoading)
const isTodosLoadingError = computed(() => store.getters.isTodosLoadingError)
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const openProductions = computed(() => store.getters.openProductions)
const productionMap = computed(() => store.getters.productionMap)
const selectedTasks = computed(() => store.getters.selectedTasks)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const timeSpentMap = computed(() => store.getters.timeSpentMap)
const timeSpentTotal = computed(() => store.getters.timeSpentTotal)
const todoSearchQueries = computed(() => store.getters.todoSearchQueries)
const todoSelectionGrid = computed(() => store.getters.todoSelectionGrid)
const user = computed(() => store.getters.user)

const sortedTasks = computed(() => filterAndSortTasks(displayedTodos.value))

const sortedDoneTasks = computed(() =>
  filterAndSortTasks(displayedDoneTasks.value)
)

const pendingTasks = computed(() => sortedTasks.value.filter(isPending))

const notPendingTasks = computed(() =>
  sortedTasks.value.filter(task => !isPending(task))
)

const boardTasks = computed(() =>
  sortedTasks.value.concat(sortedDoneTasks.value)
)

const productionList = computed(() => [
  { name: t('main.all') },
  ...openProductions.value
])

const selectedProduction = computed(() =>
  productionMap.value.get(productionId.value)
)

const { boardStatuses, getBoardStatusesByProduction } = useBoardStatuses(
  openProductions,
  selectedProduction
)

const {
  isPaper,
  isProductivityInfoLoading,
  isProductivityInfoLoadingError,
  isProductivityLoading,
  isProductivityLoadingError,
  isQuotasMetric,
  onProductivityColumnSelected,
  onProductivityCountModeChanged,
  onProductivityLevelChanged,
  onProductivityMetricChanged,
  onProductivityPeriodChanged,
  onProductivityQuotaModeChanged,
  productivityCloseRoute,
  productivityCountMode,
  productivityDaysOff,
  productivityLevel,
  productivityMetric,
  productivityMonth,
  productivityPeriod,
  productivityPeriodParams,
  productivityQuotaMode,
  productivityQuotas,
  productivityQuotaShots,
  productivityTasks,
  productivityTimeSpents,
  productivityYear
} = useProductivity({
  personId: computed(() => user.value.id),
  productionId,
  taskTypeId,
  openProductions,
  isActive: computed(() => currentSection.value === 'productivity'),
  sideColumn: useTemplateRef('productivity-side-column'),
  loadTimeSpents: range => store.dispatch('loadUserTimeSpentsByPeriod', range)
})

const todoTabs = computed(() => {
  const hasAvailableBoard = openProductions.value.some(
    production => getBoardStatusesByProduction(production).length
  )
  return [
    {
      label: t('main.tasks'),
      name: 'todos'
    },
    hasAvailableBoard
      ? {
          label: t('board.title'),
          name: 'board'
        }
      : undefined,
    {
      label: t('tasks.calendar'),
      name: 'calendar'
    },
    {
      label: t('main.productivity'),
      name: 'productivity'
    },
    isPhone.value
      ? undefined
      : {
          label: `${t('tasks.pending')} (${pendingTasks.value.length})`,
          name: 'pending'
        },
    isPhone.value
      ? undefined
      : {
          label: `${t('tasks.validated')} (${
            loading.doneTasks ? '…' : sortedDoneTasks.value.length
          })`,
          name: 'done'
        },
    {
      label: t('timesheets.timelog_title'),
      name: 'timesheets'
    },
    {
      label: t('days_off.title'),
      name: 'daysoff'
    }
  ].filter(Boolean)
})

const loggableTodos = computed(() => sortedTasks.value.filter(isLoggable))

const loggableDoneTasks = computed(() =>
  sortedDoneTasks.value.filter(isLoggable)
)

// Functions
// --------------------------------------------------------------------------
const isActiveTab = tab => currentSection.value === tab

const onPhoneChange = event => {
  isPhone.value = event.matches
  updateActiveTab()
}

const isPending = task =>
  taskStatusMap.value.get(task.task_status_id)?.is_feedback_request

const isLoggable = task =>
  taskTypeMap.value.get(task.task_type_id)?.allow_timelog

const loadData = async (forced = false) => {
  loading.doneTasks = true
  await store.dispatch('loadTodos', { date: selectedDate.value, forced })
  store
    .dispatch('loadDoneTasks')
    .catch(console.error)
    .finally(() => {
      loading.doneTasks = false
    })
  nextTick(() => {
    todoListRef.value?.setScrollPosition(store.getters.todoListScrollPosition)
  })
  resizeHeaders()

  isDaysOffLoadingError.value = false
  // A failed days off load must not skip the URL search applied on mount.
  daysOff.value = await store
    .dispatch('loadAggregatedPersonDaysOff', { personId: user.value.id })
    .catch(err => {
      console.error(err)
      isDaysOffLoadingError.value = true
      return []
    })
}

const loadTimeSpents = () =>
  store.dispatch('loadUserTimeSpents', { date: selectedDate.value })

const resizeHeaders = () => {
  nextTick(() => {
    todoListRef.value?.resizeHeaders()
    doneListRef.value?.resizeHeaders()
  })
}

const updateActiveTab = () => {
  const availableSections = [
    'board',
    'calendar',
    'daysoff',
    'done',
    'pending',
    'productivity',
    'timesheets'
  ]
  const section = route.query.section
  const isHiddenOnPhone = isPhone.value && ['pending', 'done'].includes(section)
  currentSection.value =
    availableSections.includes(section) && !isHiddenOnPhone ? section : 'todos'

  const day = route.query.day
  if (
    day &&
    day !== selectedDate.value &&
    moment(day, 'YYYY-MM-DD', true).isValid()
  ) {
    selectedDate.value = day
    loadTimeSpents()
  }

  const currentProduction = openProductions.value.find(
    ({ id }) => id === route.query.productionId
  )
  if (currentProduction) {
    productionId.value = currentProduction.id
  } else {
    router.push({
      query: {
        ...route.query,
        productionId: productionId.value,
        section: currentSection.value
      }
    })
  }

  store.dispatch('clearSelectedTasks')
}

const setSearchFromUrl = () => {
  const searchQuery = searchFieldRef.value?.getValue()
  const searchFromUrl = route.query.search
  if (!searchQuery && searchFromUrl) {
    searchFieldRef.value?.setValue(searchFromUrl)
  }
}

const setSearchInUrl = () => {
  router.push({
    query: {
      ...route.query,
      search: searchFieldRef.value?.getValue() || undefined
    }
  })
}

const onSearchChange = () => {
  setSearchInUrl()
  if (searchFieldRef.value) {
    store.dispatch('setTodosSearch', searchFieldRef.value.getValue())
  }
}

const saveSearchQuery = async searchQuery => {
  if (loading.savingSearch) return
  loading.savingSearch = true
  try {
    await store.dispatch('saveTodoSearch', searchQuery)
  } catch (error) {
    console.error(error)
  }
  loading.savingSearch = false
}

const removeSearchQuery = async searchQuery => {
  try {
    await store.dispatch('removeTodoSearch', searchQuery)
  } catch (error) {
    console.error(error)
  }
}

const setTodoListScrollPosition = position =>
  store.dispatch('setTodoListScrollPosition', position)

const onDateChanged = async date => {
  loading.timesheets = true
  selectedDate.value = moment(date).format('YYYY-MM-DD')
  // keep the day shareable in the URL, without stacking history entries
  if (route.query.day !== selectedDate.value) {
    router.replace({
      query: { ...route.query, day: selectedDate.value }
    })
  }
  await loadTimeSpents()
  loading.timesheets = false
}

const onCalendarTimeClicked = date => {
  router.push({
    query: { ...route.query, section: 'timesheets', day: date }
  })
}

const onCalendarDatesChanged = async ({ start, end }) => {
  try {
    calendarTimeSpents.value = await store.dispatch(
      'loadUserTimeSpentsByPeriod',
      { startDate: start, endDate: end }
    )
  } catch (err) {
    console.error(err)
    calendarTimeSpents.value = []
  }
}

const onSetDayOff = async dayOff => {
  dayOffError.value = false
  try {
    await store.dispatch('setDayOff', { ...dayOff, personId: user.value.id })
    timesheetListRef.value?.closeSetDayOffModal()
    dayOffListRef.value?.closeSetDayOffModal()
  } catch (error) {
    dayOffError.value = error.body?.message || true
  }
  await loadData(true)
}

const onUnsetDayOff = async dayOff => {
  dayOffError.value = false
  try {
    await store.dispatch('unsetDayOff', dayOff)
    timesheetListRef.value?.closeUnsetDayOffModal()
    dayOffListRef.value?.closeUnsetDayOffModal()
  } catch (error) {
    dayOffError.value = error.body?.message || true
  }
  await loadData(true)
}

const onTimeSpentChange = timeSpentInfo => {
  store
    .dispatch('setTimeSpent', {
      ...timeSpentInfo,
      personId: user.value.id,
      date: selectedDate.value
    })
    .catch(console.error)
}

const onAssignation = async eventData => {
  if (user.value.id === eventData.person_id) {
    await store.dispatch('loadOpenProductions')
    await loadData(true)
  }
}

// Watchers
// --------------------------------------------------------------------------
watch(productionId, () => {
  saveFilters()
  router.push({
    query: {
      ...route.query,
      productionId: productionId.value,
      section: currentSection.value
    }
  })
})

watch(() => [route.query.section, route.query.day], updateActiveTab)

watch(
  () => route.query.search,
  search => {
    searchFieldRef.value?.setValue(search)
    onSearchChange()
  }
)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  phoneQuery?.addEventListener?.('change', onPhoneChange)
  socket.on('task:assign', onAssignation)
  socket.on('task:unassign', onAssignation)
  if (!route.query.productionId && storedFilters.productionId) {
    await router.replace({
      query: { ...route.query, productionId: storedFilters.productionId }
    })
  }
  updateActiveTab()
  await nextTick()
  await loadData()
  setSearchFromUrl()
  onSearchChange()
})

onBeforeUnmount(() => {
  phoneQuery?.removeEventListener?.('change', onPhoneChange)
  socket.off('task:assign', onAssignation)
  socket.off('task:unassign', onAssignation)
})

// Head
// --------------------------------------------------------------------------
useHead({ title: computed(() => `${t('tasks.my_tasks')} - Kitsu`) })
</script>

<style lang="scss" scoped>
@use '@/styles/task-panels.scss' as panels;

.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  padding: 0;
  overflow-y: auto;
}

@include panels.task-panels;
</style>
