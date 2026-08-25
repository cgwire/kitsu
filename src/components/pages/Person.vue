<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="person page" v-if="person">
        <div class="flexrow page-header">
          <div class="flexrow-item">
            <people-avatar
              :person="person"
              :size="80"
              :font-size="30"
              :is-text="false"
            />
          </div>
          <div class="flexrow-item entity-title">
            {{ person.name }}
          </div>
        </div>

        <template v-if="!person.is_bot && isCurrentUserAllowed">
          <route-section-tabs
            class="section-tabs mt1"
            :active-tab="activeTab"
            :route="$route"
            :tabs="todoTabs"
          />

          <div class="flexrow">
            <search-field
              ref="person-tasks-search-field"
              class="search-field flexrow-item"
              can-save
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
            <combobox-number
              class="flexrow-item zoom-level mb0"
              :label="$t('schedule.zoom_level')"
              :options="zoomOptions"
              v-model="zoomLevel"
              v-if="isActiveTab('schedule')"
            />
            <combobox
              class="flexrow-item"
              :label="$t('main.sorted_by')"
              :options="sortOptions"
              locale-key-prefix="tasks.fields."
              v-model="currentSort"
            />
          </div>

          <div class="query-list" v-if="!isActiveTab('calendar')">
            <search-query-list
              :queries="personTaskSearchQueries"
              type="person"
              @remove-search="removeSearchQuery"
            />
          </div>

          <todos-list
            ref="task-list"
            :empty-text="$t('people.no_task_assigned')"
            :is-loading="isTasksLoading"
            :is-error="isTasksLoadingError"
            :selection-grid="personTaskSelectionGrid"
            :tasks="sortedTasks"
            @scroll="setPersonTasksScrollPosition"
            v-if="isActiveTab('todos')"
          />

          <todos-list
            ref="done-list"
            done
            :empty-text="$t('people.no_task_assigned')"
            :is-loading="isDoneTasksLoading"
            :is-error="isDoneTasksLoadingError"
            :selection-grid="personTaskSelectionGrid"
            :tasks="sortedDoneTasks"
            v-else-if="isActiveTab('done')"
          />

          <kanban-board
            :is-loading="isTasksLoading"
            :is-error="isTasksLoadingError"
            :production="selectedProduction"
            :statuses="boardStatuses"
            :tasks="boardTasks"
            :user="user"
            v-else-if="isActiveTab('board')"
          />

          <user-calendar
            class="calendar"
            :is-loading="isTasksLoading"
            :days-off="daysOff"
            :tasks="sortedAllTasks"
            :time-spents="calendarTimeSpents"
            @dates-changed="onCalendarDatesChanged"
            @time-clicked="onCalendarTimeClicked"
            v-else-if="isActiveTab('calendar')"
          />

          <timesheet-list
            ref="timesheet-list"
            :initial-date="selectedDate"
            :tasks="loggablePersonTasks"
            :done-tasks="loggableDoneTasks"
            :is-loading="isTasksLoading"
            :is-error="isTasksLoadingError"
            :days-off="daysOff"
            :day-off-error="dayOffError"
            :time-spent-map="personTimeSpentMap"
            :time-spent-total="personTimeSpentTotal"
            :hide-day-off="!(isCurrentUserAdmin || user.id === person.id)"
            @date-changed="onDateChanged"
            @time-spent-change="onTimeSpentChange"
            @set-day-off="onSetDayOff"
            @unset-day-off="onUnsetDayOff"
            v-else-if="
              isActiveTab('timesheets') &&
              (isCurrentUserManager || user.id === person.id)
            "
          />

          <template v-else-if="isActiveTab('schedule')">
            <schedule
              ref="schedule-widget"
              :days-off="daysOff"
              :start-date="tasksStartDate.clone().add(-3, 'months')"
              :end-date="tasksEndDate.clone().add(3, 'months')"
              :hierarchy="scheduleItems"
              :zoom-level="zoomLevel"
              :is-loading="isTasksLoading"
              :is-estimation-linked="true"
              :with-milestones="false"
              @item-changed="saveTaskScheduleItem"
              @estimation-changed="event => saveTaskScheduleItem(event.item)"
              v-if="scheduleItems.length > 0"
            />
            <div v-else-if="isTasksLoading">
              <spinner />
            </div>
            <div class="has-text-centered" v-else>
              {{ $t('main.empty_schedule') }}
            </div>
          </template>
        </template>
      </div>
    </div>
    <div class="column side-column" v-if="nbSelectedTasks === 1">
      <task-info :task="selectedTasks.values().next().value" />
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
  onUnmounted,
  reactive,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useBoardStatuses } from '@/composables/board'
import colors from '@/lib/colors'
import {
  addBusinessDays,
  getFirstStartDate,
  getLastEndDate,
  minutesToDays,
  parseDate
} from '@/lib/time'

import KanbanBoard from '@/components/lists/KanbanBoard.vue'
import TimesheetList from '@/components/lists/TimesheetList.vue'
import TodosList from '@/components/lists/TodosList.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import UserCalendar from '@/components/widgets/UserCalendar.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// State
// --------------------------------------------------------------------------
const sortOptions = [
  'entity_name',
  'priority',
  'task_status_short_name',
  'start_date',
  'due_date',
  'estimation',
  'last_comment_date'
].map(name => ({ label: name, value: name }))

const activeTab = ref('todos')
const calendarTimeSpents = ref([])
const currentSort = ref('entity_name')
const daysOff = ref([])
const dayOffError = ref(false)
const init = ref(false)
const isDoneTasksLoading = ref(false)
const isDoneTasksLoadingError = ref(false)
const isTasksLoading = ref(false)
const isTasksLoadingError = ref(false)
const person = ref(null)
const productionId = ref(undefined)
const selectedDate = ref(moment().format('YYYY-MM-DD'))
const zoomLevel = ref(1)
const loading = reactive({
  savingSearch: false
})

const searchFieldRef = useTemplateRef('person-tasks-search-field')
const taskListRef = useTemplateRef('task-list')
const doneListRef = useTemplateRef('done-list')
const timesheetListRef = useTemplateRef('timesheet-list')
const scheduleWidgetRef = useTemplateRef('schedule-widget')

// Computed
// --------------------------------------------------------------------------
const displayedPersonTasks = computed(() => store.getters.displayedPersonTasks)
const displayedPersonDoneTasks = computed(
  () => store.getters.displayedPersonDoneTasks
)
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const isCurrentUserVendor = computed(() => store.getters.isCurrentUserVendor)
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const openProductions = computed(() => store.getters.openProductions)
const organisation = computed(() => store.getters.organisation)
const personMap = computed(() => store.getters.personMap)
const personTaskSearchQueries = computed(
  () => store.getters.personTaskSearchQueries
)
const personTaskSelectionGrid = computed(
  () => store.getters.personTaskSelectionGrid
)
const personTimeSpentMap = computed(() => store.getters.personTimeSpentMap)
const personTimeSpentTotal = computed(() => store.getters.personTimeSpentTotal)
const productionMap = computed(() => store.getters.productionMap)
const selectedTasks = computed(() => store.getters.selectedTasks)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const user = computed(() => store.getters.user)

const zoomOptions = computed(() => [
  { label: t('main.week'), value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 }
])

const isCurrentUserAllowed = computed(
  () =>
    user.value.id === person.value.id ||
    !(isCurrentUserClient.value || isCurrentUserVendor.value)
)

const sortedTasks = computed(() =>
  sortAndFilterTasks(displayedPersonTasks.value)
)

const sortedDoneTasks = computed(() =>
  sortAndFilterTasks(displayedPersonDoneTasks.value)
)

const sortedAllTasks = computed(() =>
  // reuse the two cached computeds: they already carry the production
  // filter, only the merged sort remains to do
  sortTasks([...sortedTasks.value, ...sortedDoneTasks.value])
)

const loggablePersonTasks = computed(() => sortedTasks.value.filter(isLoggable))

const loggableDoneTasks = computed(() =>
  sortedDoneTasks.value.filter(isLoggable)
)

const tasksStartDate = computed(() =>
  scheduleTasks.value.length ? getFirstStartDate(scheduleTasks.value) : moment()
)

const tasksEndDate = computed(() =>
  scheduleTasks.value.length
    ? getLastEndDate(scheduleTasks.value)
    : moment().add(15, 'days')
)

const scheduleTasks = computed(() =>
  scheduleItems.value.flatMap(item => item.children)
)

const scheduleItems = computed(() => {
  const rootMap = new Map()
  sortedAllTasks.value.forEach(task => {
    if (!rootMap.get(task.project_id)) {
      const project = productionMap.value.get(task.project_id)
      rootMap.set(task.project_id, buildProjectScheduleItem(project))
    }
    const rootElement = rootMap.get(task.project_id)
    const taskItem = buildTaskScheduleItem(rootElement, task)
    if (taskItem) rootElement.children.push(taskItem)
  })

  const rootElements = Array.from(rootMap.values())
  rootElements.forEach(rootElement => {
    let rootStartDate = moment()
    let rootEndDate = moment().add(1, 'days')
    if (rootElement.children.length > 0) {
      rootStartDate = getFirstStartDate(rootElement.children)
      rootEndDate = getLastEndDate(rootElement.children)
    }
    const manDays = rootElement.children.reduce(
      (days, task) => days + (task.estimation || 0),
      0
    )
    Object.assign(rootElement, {
      startDate: rootStartDate,
      endDate: rootEndDate,
      man_days: manDays,
      daysOff: daysOff.value
    })
  })
  return rootElements
})

const boardTasks = computed(() =>
  selectedProduction.value
    ? sortedAllTasks.value.filter(
        task => task.project_id === selectedProduction.value.id
      )
    : sortedAllTasks.value
)

const productionList = computed(() => [
  { name: t('main.all') },
  ...userOpenProductions.value
])

const selectedProduction = computed(() =>
  productionMap.value.get(productionId.value)
)

const userOpenProductions = computed(() => {
  if (!person.value) {
    return []
  }
  return openProductions.value.filter(production =>
    production.team.includes(person.value.id)
  )
})

const { boardStatuses, getBoardStatusesByProduction } = useBoardStatuses(
  userOpenProductions,
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
      label: t('schedule.title'),
      name: 'schedule'
    },
    {
      label: `${t('tasks.validated')} (${
        isDoneTasksLoading.value ? '…' : displayedPersonDoneTasks.value.length
      })`,
      name: 'done'
    },
    {
      label: t('timesheets.timelog_title'),
      name: 'timesheets'
    }
  ].filter(Boolean)
})

// Functions
// --------------------------------------------------------------------------
const isActiveTab = tab => init.value && activeTab.value === tab

const isLoggable = task =>
  taskTypeMap.value.get(task.task_type_id)?.allow_timelog

const sortAndFilterTasks = tasks => {
  const sorted = sortTasks([...tasks])
  return productionId.value
    ? sorted.filter(task => task.project_id === productionId.value)
    : sorted
}

const sortTasks = tasks => {
  const byDate = field => (a, b) => {
    if (!a[field]) return 1
    if (!b[field]) return -1
    return a[field].localeCompare(b[field])
  }

  if (currentSort.value === 'entity_name') {
    return tasks.sort(
      firstBy('project_name')
        .thenBy('task_type_name')
        .thenBy('full_entity_name')
    )
  }
  if (currentSort.value === 'priority') {
    return tasks.sort(
      firstBy('priority', -1)
        .thenBy(byDate('due_date'))
        .thenBy('project_name')
        .thenBy('task_type_name')
        .thenBy('entity_name')
    )
  }
  if (currentSort.value === 'due_date') {
    return tasks.sort(
      firstBy(byDate('due_date'))
        .thenBy('project_name')
        .thenBy('task_type_name')
        .thenBy('entity_name')
    )
  }
  if (currentSort.value === 'start_date') {
    return tasks.sort(
      firstBy(byDate('start_date'))
        .thenBy('project_name')
        .thenBy('task_type_name')
        .thenBy('entity_name')
    )
  }
  return tasks.sort(
    firstBy(currentSort.value, -1)
      .thenBy('project_name')
      .thenBy('task_type_name')
      .thenBy('entity_name')
  )
}

const buildProjectScheduleItem = project => ({
  ...project,
  avatar: true,
  color: colors.fromString(project.name, true),
  priority: 1,
  expanded: true,
  loading: false,
  children: [],
  editable: false
})

const buildTaskScheduleItem = (parentElement, task) => {
  if (
    !task.start_date &&
    !task.real_start_date &&
    !task.due_date &&
    !task.end_date
  ) {
    return null
  }

  let startDate = moment()
  if (task.start_date) {
    startDate = parseDate(task.start_date)
  } else if (task.real_start_date) {
    startDate = parseDate(task.real_start_date)
  }

  const estimation = task.estimation
  let endDate
  if (task.due_date) {
    endDate = parseDate(task.due_date)
  } else if (task.end_date) {
    endDate = parseDate(task.end_date)
  } else if (task.estimation) {
    endDate = addBusinessDays(
      startDate,
      Math.ceil(minutesToDays(organisation.value, estimation)) - 1
    )
  }
  if (!endDate || endDate.isBefore(startDate)) {
    endDate = startDate.clone().add(1, 'days')
  }

  const taskType = taskTypeMap.value.get(task.task_type_id)
  if (!taskType) {
    return null
  }
  return {
    ...task,
    name: `${task.full_entity_name} / ${taskType.name}`,
    startDate,
    endDate,
    expanded: false,
    loading: false,
    man_days: estimation,
    editable: canEditTaskDates(taskType),
    unresizable: false,
    parentElement,
    color: taskType.color,
    children: []
  }
}

const canEditTaskDates = taskType => {
  const departments = user.value.departments || []
  return (
    isCurrentUserManager.value ||
    (isCurrentUserSupervisor.value &&
      (!departments.length || departments.includes(taskType.department_id)))
  )
}

const saveTaskScheduleItem = item => {
  if (item.estimation) {
    item.endDate = addBusinessDays(
      item.startDate,
      Math.ceil(minutesToDays(organisation.value, item.estimation)) - 1,
      item.parentElement.daysOff
    )
  }
  item.man_days = item.estimation || 0

  if (item.startDate && item.endDate) {
    store
      .dispatch('updateTask', {
        taskId: item.id,
        data: {
          estimation: item.estimation,
          start_date: item.startDate.format('YYYY-MM-DD'),
          due_date: item.endDate.format('YYYY-MM-DD')
        }
      })
      .catch(console.error)
  }
}

const loadPerson = async personId => {
  person.value = personMap.value.get(personId)

  if (!person.value) {
    router.push({ name: 'not-found' })
    return
  }

  if (person.value.is_bot || !isCurrentUserAllowed.value) return

  isTasksLoading.value = true
  isDoneTasksLoading.value = true
  isTasksLoadingError.value = false

  try {
    await store.dispatch('loadPersonTasks', {
      personId: person.value.id,
      date: selectedDate.value
    })
    setTimeout(() => {
      nextTick(() => {
        taskListRef.value?.setScrollPosition(
          store.getters.personTasksScrollPosition
        )
      })
      resizeHeaders()
    }, 0)

    isTasksLoading.value = false
    try {
      await store.dispatch('loadPersonDoneTasks', person.value.id)
      isDoneTasksLoading.value = false
    } catch (error) {
      isDoneTasksLoadingError.value = true
      isDoneTasksLoading.value = false
    }
  } catch (error) {
    isTasksLoading.value = false
    isTasksLoadingError.value = true
  }

  loadDaysOff()
}

const loadDaysOff = async () => {
  daysOff.value = await store
    .dispatch('loadAggregatedPersonDaysOff', { personId: person.value.id })
    .catch(() => [])
}

const loadTimeSpents = async () => {
  isTasksLoading.value = true
  await store.dispatch('loadPersonTimeSpents', {
    personId: person.value.id,
    date: selectedDate.value
  })
  isTasksLoading.value = false
}

const resizeHeaders = () => {
  nextTick(() => {
    taskListRef.value?.resizeHeaders()
    doneListRef.value?.resizeHeaders()
  })
}

const setSearchFromUrl = () => {
  const searchQuery = searchFieldRef.value?.getValue()
  const searchFromUrl = route.query.search
  if (!searchQuery && searchFromUrl) {
    searchFieldRef.value?.setValue(searchFromUrl)
  }
}

const setSearchInUrl = query => {
  router.push({
    query: {
      ...route.query,
      search: query || searchFieldRef.value?.getValue() || undefined
    }
  })
}

const onSearchChange = search => {
  const searchQuery = search || searchFieldRef.value?.getValue()
  setSearchInUrl(searchQuery)
  store.dispatch('setPersonTasksSearch', searchQuery)
}

const saveSearchQuery = searchQuery => {
  if (loading.savingSearch) {
    return
  }
  loading.savingSearch = true
  store
    .dispatch('savePersonTasksSearch', searchQuery)
    .catch(console.error)
    .finally(() => {
      loading.savingSearch = false
    })
}

const removeSearchQuery = searchQuery => {
  store.dispatch('removePersonTasksSearch', searchQuery).catch(err => {
    if (err) console.error(err)
  })
}

const setPersonTasksScrollPosition = position =>
  store.dispatch('setPersonTasksScrollPosition', position)

const updateActiveTab = () => {
  const availableSections = [
    'board',
    'calendar',
    'done',
    'schedule',
    'timesheets'
  ]
  const section = route.query.section
  activeTab.value = availableSections.includes(section) ? section : 'todos'

  const day = route.query.day
  if (
    day &&
    day !== selectedDate.value &&
    moment(day, 'YYYY-MM-DD', true).isValid()
  ) {
    selectedDate.value = day
    if (person.value) {
      loadTimeSpents()
    }
  }

  const currentProduction = userOpenProductions.value.find(
    ({ id }) => id === route.query.productionId
  )
  if (currentProduction) {
    productionId.value = currentProduction.id
  } else {
    router.push({
      query: {
        ...route.query,
        productionId: productionId.value,
        section: activeTab.value
      }
    })
  }

  store.dispatch('clearSelectedTasks')
}

const onCalendarTimeClicked = date => {
  router.push({
    query: { ...route.query, section: 'timesheets', day: date }
  })
}

const onCalendarDatesChanged = async ({ start, end }) => {
  if (!person.value) {
    return
  }
  try {
    calendarTimeSpents.value = await store.dispatch(
      'loadPersonTimeSpentsByPeriod',
      {
        personId: person.value.id,
        startDate: start,
        endDate: end
      }
    )
  } catch (err) {
    console.error(err)
    calendarTimeSpents.value = []
  }
}

const onTimeSpentChange = timeSpentInfo => {
  store.dispatch('setTimeSpent', {
    ...timeSpentInfo,
    personId: person.value.id,
    date: selectedDate.value
  })
}

const onDateChanged = async date => {
  selectedDate.value = moment(date).format('YYYY-MM-DD')
  // keep the day shareable in the URL, without stacking history entries
  if (route.query.day !== selectedDate.value) {
    router.replace({
      query: { ...route.query, day: selectedDate.value }
    })
  }
  await loadTimeSpents()
}

const onSetDayOff = async dayOff => {
  dayOffError.value = false
  try {
    await store.dispatch('setDayOff', {
      ...dayOff,
      personId: person.value.id
    })
    timesheetListRef.value?.closeSetDayOffModal()
  } catch (error) {
    dayOffError.value = error.body?.message || true
  }
  await loadDaysOff()
}

const onUnsetDayOff = async dayOff => {
  dayOffError.value = false
  try {
    await store.dispatch('unsetDayOff', dayOff)
    timesheetListRef.value?.closeUnsetDayOffModal()
  } catch (error) {
    dayOffError.value = error.body?.message || true
  }
  await loadDaysOff()
}

const onAssignation = eventData => {
  if (person.value.id === eventData.person_id) {
    loadPerson(person.value.id)
  }
}

// Watchers
// --------------------------------------------------------------------------
watch(
  () => route.params.person_id,
  personId => {
    updateActiveTab()
    if (person.value && person.value.id !== personId) {
      loadPerson(personId)
    }
  }
)

watch(
  () => route.query.search,
  search => {
    searchFieldRef.value?.setValue(search)
    onSearchChange(search)
  }
)

watch(() => [route.query.section, route.query.day], updateActiveTab)

watch(activeTab, () => {
  nextTick(() => {
    scheduleWidgetRef.value?.scrollToDate(tasksStartDate.value)
  })
})

watch(productionId, () => {
  router.push({
    query: {
      ...route.query,
      productionId: productionId.value
    }
  })
})

watch(zoomLevel, () => {
  scheduleWidgetRef.value?.scrollToDate(tasksStartDate.value)
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  socket.on('task:assign', onAssignation)
  socket.on('task:unassign', onAssignation)

  productionId.value = route.query.productionId || undefined

  updateActiveTab()
  await loadPerson(route.params.person_id)
  setSearchFromUrl()
  onSearchChange()

  scheduleWidgetRef.value?.scrollToDate(tasksStartDate.value)

  init.value = true
})

onBeforeUnmount(() => {
  socket.off('task:assign', onAssignation)
  socket.off('task:unassign', onAssignation)
})

onUnmounted(() => {
  store.commit('LOAD_PERSON_TASKS_END', {
    tasks: [],
    userFilters: {},
    taskTypeMap: taskTypeMap.value
  })
})

// Head
// --------------------------------------------------------------------------
useHead({ title: computed(() => `${person.value?.name || '...'} - Kitsu`) })
</script>

<style lang="scss" scoped>
.page {
  overflow: hidden;
}

.search-field {
  margin: 25px 2em 5px 0;
}

.query-list {
  margin-top: 0.5em;
}

.data-list {
  margin-top: 0;
}

.person {
  display: flex;
  flex-direction: column;
}

.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.zoom-level {
  margin-top: -0.5em;
}

.field {
  margin-bottom: 0;
}

.tabs {
  min-height: 30px;
}

.page-header {
  margin-top: 0.5em;
}

.calendar {
  flex: 1;
  overflow: auto;
}
</style>
