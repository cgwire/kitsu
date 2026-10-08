<template>
  <div
    class="columns fixed-page"
    :class="{ 'is-productivity': isActiveTab('productivity') }"
  >
    <div class="column main-column">
      <div class="todos page">
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
import { firstBy } from 'thenby'
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
import preferences from '@/lib/preferences'
import { getTaskStatusPriorityOfProd } from '@/lib/productions'
import { sortByName } from '@/lib/sorting'
import { parseDate } from '@/lib/time'
import { getProductivityRange, today } from '@/lib/timesheet'

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
const filterOptions = ['all_tasks', 'due_this_week', 'due_previous_week'].map(
  name => ({
    label: name,
    value: name
  })
)
const sortOptions = [
  'entity_name',
  'priority',
  'task_status_short_name',
  'start_date',
  'due_date',
  'estimation',
  'last_comment_date'
].map(name => ({ label: name, value: name }))
const productivityLevels = ['day', 'week', 'month']
const productivityMetrics = ['time', 'quotas']
const quotaModes = ['weighted', 'feedback', 'weighteddone', 'done']

// The URL wins over the filters picked last time, kept in the local storage.
const FILTERS_PREFERENCE = 'todos:filters'
const storedFilters = preferences.getObjectPreference(FILTERS_PREFERENCE) || {}
const pickFilter = (key, options, defaultValue) =>
  [route.query[key], storedFilters[key]].find(value =>
    options.some(option => option.value === value)
  ) ?? defaultValue

const currentFilter = ref(pickFilter('due', filterOptions, 'all_tasks'))
const currentSort = ref(pickFilter('sort', sortOptions, 'priority'))
const currentSection = ref('todos')
const daysOff = ref([])
const isDaysOffLoadingError = ref(false)
const dayOffError = ref(false)
// Phones get neither the pending nor the validated tab, and fold the filters
const phoneQuery = window.matchMedia?.('(max-width: 768px)')
const isPhone = ref(Boolean(phoneQuery?.matches))
const areFiltersFolded = ref(true)
const productionId = ref(undefined)
const taskTypeId = ref(route.query.taskTypeId ?? storedFilters.taskTypeId ?? '')
const calendarTimeSpents = ref([])
const selectedDate = ref(moment().format('YYYY-MM-DD'))
const productivityTimeSpents = ref([])
const isProductivityLoading = ref(false)
const isProductivityLoadingError = ref(false)
const productivityAggregatedTasks = ref([])
const productivityDaysOff = ref([])
const isProductivityInfoLoading = ref(false)
const isProductivityInfoLoadingError = ref(false)
const productivityQuotas = ref([])
const productivityQuotaShots = ref([])
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

const taskTypeList = computed(() => {
  const taskTypeIds = new Set(
    displayedTodos.value
      .concat(displayedDoneTasks.value)
      .filter(
        task => !productionId.value || task.project_id === productionId.value
      )
      .map(task => task.task_type_id)
  )
  return [
    { id: '', color: '#999', name: t('main.all') },
    ...sortByName(
      [...taskTypeIds]
        .map(taskTypeId => taskTypeMap.value.get(taskTypeId))
        .filter(Boolean)
    )
  ]
})

const loggableTodos = computed(() => sortedTasks.value.filter(isLoggable))

const loggableDoneTasks = computed(() =>
  sortedDoneTasks.value.filter(isLoggable)
)

const queryNumber = (key, defaultValue) => {
  const value = Number(route.query[key])
  return Number.isInteger(value) && value > 0 ? value : defaultValue
}

const productivityLevel = computed(() =>
  productivityLevels.includes(route.query.view) ? route.query.view : 'day'
)
const productivityYear = computed(() => queryNumber('year', today.year))
const productivityMonth = computed(() => queryNumber('month', today.month))
const productivityPeriod = computed(() => queryNumber('period', 0))

const queryOption = (key, options) =>
  options.includes(route.query[key]) ? route.query[key] : options[0]

const productivityMetric = computed(() =>
  queryOption('metric', productivityMetrics)
)
const isQuotasMetric = computed(() => productivityMetric.value === 'quotas')
const productivityQuotaMode = computed(() =>
  queryOption('quotaMode', quotaModes)
)

const isPaper = computed(
  () => selectedProduction.value?.production_style === '2dpaper'
)

// the count modes the chart offers for this kind of production
const productivityCountMode = computed(() =>
  queryOption(
    'countMode',
    isPaper.value ? ['drawings', 'count'] : ['frames', 'seconds', 'count']
  )
)

// an assets only production has no shot to count
const quotaProductionIds = computed(() =>
  selectedProduction.value
    ? [selectedProduction.value.id]
    : openProductions.value
        .filter(production => production.production_type !== 'assets')
        .map(production => production.id)
)

// the column index is a day of the month, an ISO week or a month
const productivityPeriodParams = computed(() => {
  const year = productivityYear.value
  const period = productivityPeriod.value
  return {
    day: { year, month: productivityMonth.value, day: period },
    week: { year, week: period },
    month: { year, month: period }
  }[productivityLevel.value]
})

const productivityTasks = computed(() =>
  productivityAggregatedTasks.value.filter(
    task => !taskTypeId.value || task.task_type_id === taskTypeId.value
  )
)

const productivityCloseRoute = computed(() => ({
  query: { ...route.query, period: undefined }
}))

// Functions
// --------------------------------------------------------------------------
const isActiveTab = tab => currentSection.value === tab

const onPhoneChange = event => {
  isPhone.value = event.matches
}

const isPending = task =>
  taskStatusMap.value.get(task.task_status_id)?.is_feedback_request

const isLoggable = task =>
  taskTypeMap.value.get(task.task_type_id)?.allow_timelog

const filterAndSortTasks = tasks => {
  const filtered = tasks.filter(
    task =>
      (!productionId.value || task.project_id === productionId.value) &&
      (!taskTypeId.value || task.task_type_id === taskTypeId.value)
  )
  return sortTasks(filtered, currentFilter.value, currentSort.value)
}

const sortTasks = (tasks, filter, sort) => {
  const filtered =
    filter === 'all_tasks'
      ? [...tasks]
      : tasks.filter(task => {
          const week = moment().startOf('week')
          if (filter === 'due_previous_week') week.subtract(1, 'week')
          return week.isSame(parseDate(task.due_date), 'week')
        })

  const byDate = field => (a, b) => {
    if (!a[field]) return 1
    if (!b[field]) return -1
    return a[field].localeCompare(b[field])
  }

  if (sort === 'entity_name') {
    return filtered.sort(
      firstBy('project_name')
        .thenBy('task_type_name')
        .thenBy('full_entity_name')
    )
  }
  if (sort === 'priority') {
    return filtered.sort(
      firstBy('priority', -1)
        .thenBy(byDate('due_date'))
        .thenBy('project_name')
        .thenBy('task_type_name')
        .thenBy('entity_name')
    )
  }
  if (sort === 'due_date') {
    return filtered.sort(
      firstBy(byDate('due_date'))
        .thenBy('project_name')
        .thenBy('task_type_name')
        .thenBy('entity_name')
    )
  }
  if (sort === 'start_date') {
    return filtered.sort(
      firstBy(byDate('start_date'))
        .thenBy('project_name')
        .thenBy('task_type_name')
        .thenBy('entity_name')
    )
  }
  if (sort === 'task_status_short_name') {
    // Follow the task status order from the studio / production
    // settings instead of sorting short names alphabetically.
    const statusPriority = task =>
      getTaskStatusPriorityOfProd(
        taskStatusMap.value.get(task.task_status_id),
        productionMap.value.get(task.project_id)
      )
    return filtered.sort(
      firstBy((a, b) => statusPriority(a) - statusPriority(b))
        .thenBy('task_status_short_name')
        .thenBy('project_name')
        .thenBy('task_type_name')
        .thenBy('entity_name')
    )
  }
  return filtered.sort(
    firstBy(sort, -1)
      .thenBy('project_name')
      .thenBy('task_type_name')
      .thenBy('entity_name')
  )
}

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

// a new view, year or month shows other columns: the selected one goes
const setProductivityQuery = query =>
  router.replace({ query: { ...route.query, ...query, period: undefined } })

const onProductivityLevelChanged = level =>
  setProductivityQuery({ view: level })

// the chart offers the months up to today in the current year only
const onProductivityPeriodChanged = ({ year, month }) => {
  const isFuture = year === today.year && month > today.month
  setProductivityQuery({
    year: `${year}`,
    month: `${isFuture ? today.month : month}`
  })
}

const onProductivityMetricChanged = metric => setProductivityQuery({ metric })

const onProductivityQuotaModeChanged = quotaMode =>
  router.replace({ query: { ...route.query, quotaMode } })

const onProductivityCountModeChanged = countMode =>
  router.replace({ query: { ...route.query, countMode } })

const onProductivityColumnSelected = index =>
  router.push({ query: { ...route.query, period: `${index}` } })

const getProductivityKey = () =>
  JSON.stringify([
    productivityMetric.value,
    productivityLevel.value,
    productivityYear.value,
    productivityMonth.value
  ])

// A quicker answer for a later view or period may have landed first: the
// loads drop an answer whose key no longer matches the current one.
const loadProductivity = async () => {
  const key = getProductivityKey()
  isProductivityLoading.value = true
  isProductivityLoadingError.value = false
  let timeSpents = []
  let isError = false
  try {
    timeSpents = await store.dispatch(
      'loadUserTimeSpentsByPeriod',
      getProductivityRange(productivityLevel.value, {
        year: productivityYear.value,
        month: productivityMonth.value
      })
    )
  } catch (err) {
    console.error(err)
    isError = true
  }
  if (key !== getProductivityKey()) return
  productivityTimeSpents.value = timeSpents
  isProductivityLoadingError.value = isError
  isProductivityLoading.value = false
}

const getProductivityQuotasKey = () =>
  JSON.stringify([
    productivityMetric.value,
    productivityQuotaMode.value,
    quotaProductionIds.value
  ])

const loadProductivityQuotas = async () => {
  const key = getProductivityQuotasKey()
  isProductivityLoading.value = true
  isProductivityLoadingError.value = false
  let quotas = []
  let isError = false
  try {
    quotas = await Promise.all(
      quotaProductionIds.value.map(productionId =>
        store.dispatch('loadPersonQuotas', {
          productionId,
          personId: user.value.id,
          computeMode: productivityQuotaMode.value
        })
      )
    )
  } catch (err) {
    console.error(err)
    isError = true
  }
  if (key !== getProductivityQuotasKey()) return
  productivityQuotas.value = quotas
  isProductivityLoadingError.value = isError
  isProductivityLoading.value = false
}

const getProductivityInfoKey = () =>
  JSON.stringify([
    productivityMetric.value,
    productivityQuotaMode.value,
    taskTypeId.value,
    productivityLevel.value,
    productivityPeriodParams.value,
    productionId.value,
    quotaProductionIds.value
  ])

// the shots of the productions the chart counts, not of every production
const loadProductivityQuotaInfo = async () => {
  const key = getProductivityInfoKey()
  isProductivityInfoLoading.value = true
  isProductivityInfoLoadingError.value = false
  productivityQuotaShots.value = []
  const isStale = () => key !== getProductivityInfoKey()
  try {
    const shotLists = await Promise.all(
      quotaProductionIds.value.map(productionId =>
        store.dispatch('getPersonQuotaShots', {
          productionId,
          personId: user.value.id,
          taskTypeId: taskTypeId.value || undefined,
          detailLevel: productivityLevel.value,
          ...productivityPeriodParams.value,
          computeMode: productivityQuotaMode.value
        })
      )
    )
    if (isStale()) return
    productivityQuotaShots.value = shotLists.flat()
  } catch (err) {
    console.error(err)
    if (isStale()) return
    isProductivityInfoLoadingError.value = true
  }
  isProductivityInfoLoading.value = false
}

const loadProductivityInfo = async () => {
  const key = getProductivityInfoKey()
  isProductivityInfoLoading.value = true
  isProductivityInfoLoadingError.value = false
  productivityAggregatedTasks.value = []
  const period = {
    personId: user.value.id,
    detailLevel: productivityLevel.value,
    ...productivityPeriodParams.value
  }
  const isStale = () => key !== getProductivityInfoKey()
  try {
    const tasks = await store.dispatch('loadAggregatedPersonTimeSpents', {
      ...period,
      productionId: productionId.value
    })
    if (isStale()) return
    productivityAggregatedTasks.value = tasks.filter(task => task.duration > 0)
    const daysOff = await store.dispatch('loadAggregatedPersonDaysOff', period)
    if (isStale()) return
    productivityDaysOff.value = daysOff
  } catch (err) {
    console.error(err)
    if (isStale()) return
    isProductivityInfoLoadingError.value = true
  }
  isProductivityInfoLoading.value = false
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

const saveFilters = () => {
  preferences.setObjectPreference(FILTERS_PREFERENCE, {
    productionId: productionId.value,
    taskTypeId: taskTypeId.value,
    due: currentFilter.value,
    sort: currentSort.value
  })
}

// Watchers
// --------------------------------------------------------------------------
watch([taskTypeId, currentFilter, currentSort], () => {
  saveFilters()
  router.replace({
    query: {
      ...route.query,
      taskTypeId: taskTypeId.value || undefined,
      due: currentFilter.value,
      sort: currentSort.value
    }
  })
})

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
  [
    currentSection,
    productivityMetric,
    productivityLevel,
    productivityYear,
    productivityMonth
  ],
  () => {
    if (isActiveTab('productivity') && !isQuotasMetric.value) {
      loadProductivity()
    }
  }
)

// The person quotas cover every period: the chart picks the columns of the
// view, year and month from the loaded answers.
watch(
  [
    currentSection,
    productivityMetric,
    productivityQuotaMode,
    () => quotaProductionIds.value.join()
  ],
  () => {
    if (isActiveTab('productivity') && isQuotasMetric.value) {
      loadProductivityQuotas()
    }
  }
)

watch(
  [
    currentSection,
    productivityLevel,
    productivityYear,
    productivityMonth,
    productivityPeriod,
    productionId,
    () => quotaProductionIds.value.join(),
    productivityMetric,
    productivityQuotaMode,
    taskTypeId
  ],
  () => {
    if (isActiveTab('productivity') && productivityPeriod.value) {
      if (isQuotasMetric.value) loadProductivityQuotaInfo()
      else loadProductivityInfo()
    }
  }
)

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
.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  padding: 0;
  overflow-y: auto;
}

.todos {
  display: flex;
  flex-direction: column;
}

// tighter than the global .page: the panels carry their own padding
.todos.page {
  padding: 66px 1em 1em;
}

.section-tabs {
  min-height: 36px;
}

// beats the 1.5rem of Bulma's .tabs:not(:last-child)
.section-tabs.tabs {
  margin-bottom: 1em;
}

.search-field-column {
  margin: 0 1em 0 0;
}

.query-list {
  // the global rule leaves 2em under the list, inside the filters panel
  margin-bottom: 0;
  margin-top: 0.5em;
}

.todos-filters,
.todos-panel {
  background: var(--background-panel-raised);
  border-radius: 12px;
  --text-strong: var(--text-panel);
}

.filters-toggle {
  display: none;
}

.todos-filters {
  margin: 0 0 1em;
  padding: 1em;

  .search-field-wrapper {
    background: var(--background);
  }

  // the dark background of the comboboxes next to it
  .dark & .search-field-wrapper,
  .dark & :deep(.task-type-combo),
  .dark & :deep(.selected-task-type-line) {
    background: $dark-grey-light;
  }

  // the label metrics of the production combobox, to share its row: the task
  // type one pads its label and pushes its box 3px lower than the rest
  .search-field-column .label,
  .task-type-field :deep(.label) {
    margin-bottom: 5px;
    padding-top: 0;
  }

  // On the timesheet tab, the filters and the timesheet header form one panel.
  &.is-attached {
    border-radius: 12px 12px 0 0;
    margin-bottom: 0;

    & ~ .user-timesheet :deep(.timesheet-header),
    & ~ .calendar-panel :deep(.calendar-toolbar),
    & ~ .productivity-panel :deep(.productivity-toolbar) {
      border-radius: 0 0 12px 12px;
      border-top: 1px solid rgba(var(--skeleton-rgb), 0.25);
    }
  }
}

// the same air around the period panel as on the Timesheets page
.productivity-side-column {
  background: transparent;
  padding: 1em 1em 1em 0;

  // the quota panel takes the card look of the time spent one here, and
  // keeps its plain look on the Quota page
  :deep(.people-quota-info) {
    background: var(--background-panel);
    border-left: 0;
    border-radius: 12px;
    color: var(--text);
    height: auto;
    min-height: 100%;
    padding: 1.5em 1.5em 1em;
    position: relative;

    > .flexrow {
      margin-right: 1em;
    }

    .title {
      font-size: 1.5rem;
    }

    .close {
      position: absolute;
      right: 0.75em;
      top: 0.75em;
    }

    .close-button {
      height: 26px;
      padding-top: 5px;
      width: 26px;

      &:hover {
        background: rgba(var(--skeleton-rgb), 0.25);
      }
    }
  }
}

.todos-panel {
  padding: 1em;

  // overflow: auto clips the rows and the sticky head to the corners
  :deep(.datatable-wrapper) {
    border-radius: 10px;
    margin-bottom: 0;
  }

  // margin-top auto keeps the task count at the bottom of the panel
  :deep(.footer-info) {
    margin: auto 0 0;
    padding-top: 0.75em;
  }
}

.board-panel,
.calendar-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

// The calendar keeps its content height in a flex panel and the day rows
// shrink: it must fill the panel as it filled the page before.
.calendar-panel :deep(.user-calendar) {
  flex: 1;
  margin-top: 0;
  max-height: none;
  min-height: 0;
}

.calendar-panel :deep(.calendar-toolbar),
.calendar-panel :deep(.calendar-body),
.day-off-list :deep(.header),
.day-off-list :deep(.day-off-group) {
  background: var(--background-panel-raised);
}

// The lanes share the panel color: in light theme they would melt into it
.board-panel :deep(.board-column:not(.droppable)) {
  background: var(--background);
}

.dark .board-panel :deep(.board-column:not(.droppable)) {
  background: var(--background-panel);
}

.data-list {
  margin-top: 0;
}

.field {
  margin-bottom: 0;
}

// A bit more air at the top of the panels under the header ones
@media screen and (min-width: 769px) {
  .todos-panel,
  .user-timesheet :deep(.timesheet-panel),
  .calendar-panel :deep(.calendar-body),
  .day-off-list :deep(.day-off-group) {
    padding-top: 1.25em;
  }
}

@media screen and (max-width: 768px) {
  // the period panel stacks under the chart, and the page scrolls as a whole
  .columns.is-productivity {
    flex-direction: column;
    overflow-y: auto;

    .column {
      flex: none;
      overflow-y: visible;
    }

    .productivity-side-column {
      margin-top: 0;
      max-width: none;
      padding: 0.5em;
      width: 100%;
    }
  }

  // The page grows with its cards: at a fixed height, the list panel
  // overflows it and its bottom margin never shows.
  .todos.page {
    height: auto;
    min-height: 100%;
    padding-left: 0.5em;
    padding-right: 0.5em;
  }

  // the funnel of the other pages, next to the search
  .filters-toggle {
    align-self: flex-end;
    display: flex;
    flex: none;
    height: 42px;
    margin-left: auto;
    margin-right: 0;
  }

  .todos-filters.collapsed .collapsible {
    display: none;
  }

  .todos-filters {
    padding: 0.5em;

    > .flexrow {
      align-items: flex-end;
      flex-wrap: wrap;
      row-gap: 0.5em;
    }

    .filler {
      display: none;
    }
  }

  // the gap left of the funnel, which margin-left: auto pushes right
  .search-field-column {
    flex: 1;
    margin-right: 0.75em;
    min-width: 0;
  }

  // the 200px input pushed the save icon out of the box, under the funnel
  .search-field-column :deep(.search-field-wrapper) {
    margin-right: 0;
    max-width: none;

    .search-field {
      flex: 1;
      min-width: 0;
      width: auto;
    }
  }

  // like the task lists: a flexible height would clip the page bottom
  // padding under the panel
  .user-timesheet {
    flex: none;
    min-height: auto;
  }

  .todos-panel {
    flex: none;
    min-height: auto;
    padding: 0.5em;
  }

  // A flexible height loops on a phone: the page scrollbar comes and goes,
  // the grid resizes and the overflow with it.
  .calendar-panel {
    flex: none;
    height: 85vh;
  }

  // A fixed height keeps the cards scrolling inside their lanes, and the
  // sideways scrollbar of the lanes in view.
  .board-panel.todos-panel {
    height: 75vh;
  }

  // smaller cards: a lane shows several tasks at once
  .board-panel :deep(.board-card .ui-droppable) {
    min-height: 110px;
  }

  // one lane per screen, the next one peeking: drag and drop does not start
  // from a touch, so the board is read-only there anyway
  .board-panel :deep(.board-column) {
    max-width: 75vw;
    min-width: 75vw;
    width: 75vw;
  }

  // the tabs still scroll sideways, without a bar eating their height
  .section-tabs.tabs {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
