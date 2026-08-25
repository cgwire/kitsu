<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="todos page">
        <route-section-tabs
          class="section-tabs mt05"
          :active-tab="currentSection"
          :route="$route"
          :tabs="todoTabs"
        />

        <div class="flexrow" v-show="!isActiveTab('daysoff')">
          <search-field
            ref="todos-search-field"
            class="flexrow-item search-field"
            :can-save="true"
            @change="onSearchChange"
            @save="saveSearchQuery"
          />

          <combobox-production
            class="flexrow-item production-field"
            :label="$t('main.production')"
            :production-list="productionList"
            v-model="productionId"
          />

          <span class="filler"></span>

          <combobox
            class="flexrow-item"
            :label="$t('main.show')"
            :options="filterOptions"
            locale-key-prefix="tasks."
            v-model="currentFilter"
          />

          <combobox
            class="flexrow-item"
            :label="$t('main.sorted_by')"
            :options="sortOptions"
            locale-key-prefix="tasks.fields."
            v-model="currentSort"
          />
        </div>
        <div class="query-list" v-if="!isActiveTab('daysoff')">
          <search-query-list
            :queries="todoSearchQueries"
            type="todo"
            @remove-search="removeSearchQuery"
          />
        </div>

        <todos-list
          ref="todo-list"
          :empty-text="$t('people.no_task_assigned')"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :tasks="notPendingTasks"
          :selection-grid="todoSelectionGrid"
          @scroll="setTodoListScrollPosition"
          v-if="isActiveTab('todos')"
        />

        <div v-if="isActiveTab('pending')">&nbsp;</div>
        <todos-list
          :empty-text="$t('people.no_task_assigned')"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :tasks="pendingTasks"
          :selection-grid="todoSelectionGrid"
          @scroll="setTodoListScrollPosition"
          v-if="isActiveTab('pending')"
        />

        <div v-if="isActiveTab('done')">&nbsp;</div>
        <todos-list
          ref="done-list"
          class="done-list"
          done
          :is-loading="loading.doneTasks || isTodosLoading"
          :is-error="isTodosLoadingError"
          :selection-grid="doneSelectionGrid"
          :tasks="sortedDoneTasks"
          v-if="isActiveTab('done')"
        />

        <kanban-board
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :production="selectedProduction"
          :statuses="boardStatuses"
          :tasks="boardTasks"
          :user="user"
          v-if="isActiveTab('board')"
        />

        <user-calendar
          :days-off="daysOff"
          :is-loading="isTodosLoading"
          :tasks="sortedTasks"
          :time-spents="calendarTimeSpents"
          @dates-changed="onCalendarDatesChanged"
          @time-clicked="onCalendarTimeClicked"
          v-if="isActiveTab('calendar')"
        />

        <timesheet-list
          ref="timesheet-list"
          :initial-date="selectedDate"
          :tasks="loggableTodos"
          :done-tasks="loggableDoneTasks"
          :is-loading="loading.timesheets || isTodosLoading"
          :is-error="isTodosLoadingError"
          :days-off="daysOff"
          :day-off-error="dayOffError"
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
          :day-off-error="dayOffError"
          @set-day-off="onSetDayOff"
          @unset-day-off="onUnsetDayOff"
          v-if="isActiveTab('daysoff')"
        />
      </div>
    </div>

    <div class="column side-column" v-if="nbSelectedTasks > 0">
      <task-info :task="selectedTasks.values().next().value" with-actions />
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

import { getTaskStatusPriorityOfProd } from '@/lib/productions'
import { sortTaskStatuses } from '@/lib/sorting'
import { parseDate } from '@/lib/time'

import DayOffList from '@/components/lists/DayOffList.vue'
import KanbanBoard from '@/components/lists/KanbanBoard.vue'
import TimesheetList from '@/components/lists/TimesheetList.vue'
import TodosList from '@/components/lists/TodosList.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
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
const filterOptions = ['all_tasks', 'due_this_week'].map(name => ({
  label: name,
  value: name
}))
const sortOptions = [
  'entity_name',
  'priority',
  'task_status_short_name',
  'start_date',
  'due_date',
  'estimation',
  'last_comment_date'
].map(name => ({ label: name, value: name }))

const currentFilter = ref('all_tasks')
const currentSort = ref('priority')
const currentSection = ref('todos')
const daysOff = ref([])
const dayOffError = ref(false)
const productionId = ref(undefined)
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
const displayedDoneTasks = computed(() => store.getters.displayedDoneTasks)
const displayedTodos = computed(() => store.getters.displayedTodos)
const doneSelectionGrid = computed(() => store.getters.doneSelectionGrid)
const getProductionTaskStatuses = computed(
  () => store.getters.getProductionTaskStatuses
)
const isTodosLoading = computed(() => store.getters.isTodosLoading)
const isTodosLoadingError = computed(() => store.getters.isTodosLoadingError)
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const openProductions = computed(() => store.getters.openProductions)
const productionMap = computed(() => store.getters.productionMap)
const selectedTasks = computed(() => store.getters.selectedTasks)
const taskStatuses = computed(() => store.getters.taskStatuses)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const timeSpentMap = computed(() => store.getters.timeSpentMap)
const timeSpentTotal = computed(() => store.getters.timeSpentTotal)
const todoSearchQueries = computed(() => store.getters.todoSearchQueries)
const todoSelectionGrid = computed(() => store.getters.todoSelectionGrid)
const user = computed(() => store.getters.user)

const sortedTasks = computed(() => {
  const tasks = productionId.value
    ? displayedTodos.value.filter(
        task => task.project_id === productionId.value
      )
    : displayedTodos.value
  return sortTasks(tasks, currentFilter.value, currentSort.value)
})

const sortedDoneTasks = computed(() => {
  const tasks = productionId.value
    ? displayedDoneTasks.value.filter(
        task => task.project_id === productionId.value
      )
    : displayedDoneTasks.value
  return sortTasks(tasks, currentFilter.value, currentSort.value)
})

const pendingTasks = computed(() =>
  sortedTasks.value.filter(
    task => taskStatusMap.value.get(task.task_status_id)?.is_feedback_request
  )
)

const notPendingTasks = computed(() =>
  sortedTasks.value.filter(
    task => !taskStatusMap.value.get(task.task_status_id)?.is_feedback_request
  )
)

const boardTasks = computed(() =>
  sortedTasks.value.concat(sortedDoneTasks.value)
)

const boardStatuses = computed(() => {
  if (selectedProduction.value) {
    return getBoardStatusesByProduction(selectedProduction.value)
  }

  const productionsByStatus = {}
  openProductions.value.forEach(production => {
    getBoardStatusesByProduction(production).forEach(status => {
      productionsByStatus[status.id] = (
        productionsByStatus[status.id] || []
      ).concat(production.id)
    })
  })

  return taskStatuses.value
    .filter(status => !status.for_concept)
    .map(status => ({
      ...status,
      productions: productionsByStatus[status.id] || []
    }))
    .filter(status => status.productions.length > 0)
    .sort((a, b) => a.priority - b.priority)
})

const productionList = computed(() => [
  { name: t('main.all') },
  ...openProductions.value
])

const selectedProduction = computed(() =>
  productionMap.value.get(productionId.value)
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
      label: `${t('tasks.pending')} (${pendingTasks.value.length})`,
      name: 'pending'
    },
    {
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

const loggableTodos = computed(() =>
  sortedTasks.value.filter(
    task => taskTypeMap.value.get(task.task_type_id)?.allow_timelog
  )
)

const loggableDoneTasks = computed(() =>
  sortedDoneTasks.value.filter(
    task => taskTypeMap.value.get(task.task_type_id)?.allow_timelog
  )
)

// Functions
const isActiveTab = tab => currentSection.value === tab

const getBoardStatusesByProduction = production => {
  const statuses = getProductionTaskStatuses
    .value(production.id)
    .filter(status => {
      if (status.for_concept) {
        return false
      }
      const rolesForBoard =
        production.task_statuses_link?.[status.id]?.roles_for_board
      return rolesForBoard?.includes(user.value.role)
    })
  return sortTaskStatuses(statuses, production)
}

const sortTasks = (tasks, filter, sort) => {
  const filtered =
    filter === 'all_tasks'
      ? [...tasks]
      : tasks.filter(task => {
          const dueDate = parseDate(task.due_date)
          return moment().startOf('week').isSame(dueDate, 'week')
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

  daysOff.value = await store.dispatch('loadAggregatedPersonDaysOff', {
    personId: user.value.id
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
    'timesheets'
  ]
  const section = route.query.section
  currentSection.value = availableSections.includes(section) ? section : 'todos'

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
  try {
    loading.savingSearch = true
    await store.dispatch('saveTodoSearch', searchQuery)
    loading.savingSearch = false
  } catch (error) {
    console.error(error)
  }
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
      'loadPersonTimeSpentsByPeriod',
      {
        personId: user.value.id,
        startDate: start,
        endDate: end
      }
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
  store.dispatch('setTimeSpent', {
    ...timeSpentInfo,
    personId: user.value.id,
    date: selectedDate.value
  })
}

const onAssignation = async eventData => {
  if (user.value.id === eventData.person_id) {
    await store.dispatch('loadOpenProductions')
    await loadData(true)
  }
}

// Watchers
watch(productionId, () => {
  router.push({
    query: {
      ...route.query,
      productionId: productionId.value,
      section: currentSection.value
    }
  })
})

watch(() => route.query.section, updateActiveTab)

watch(() => route.query.day, updateActiveTab)

watch(
  () => route.query.search,
  search => {
    searchFieldRef.value?.setValue(search)
    onSearchChange()
  }
)

// Lifecycle
onMounted(async () => {
  socket.on('task:assign', onAssignation)
  socket.on('task:unassign', onAssignation)
  updateActiveTab()
  await nextTick()
  await loadData()
  setSearchFromUrl()
  onSearchChange()
})

onBeforeUnmount(() => {
  socket.off('task:assign', onAssignation)
  socket.off('task:unassign', onAssignation)
})

// Head
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

.section-tabs {
  min-height: 36px;
}

.search-field {
  margin: 25px 2em 5px 0;
}

.query-list {
  margin-top: 0.5em;
  margin-bottom: 1em;
}

.data-list {
  margin-top: 0;
}

.done-list {
  margin-top: 2em;
}

.field {
  margin-bottom: 0;
}
</style>
