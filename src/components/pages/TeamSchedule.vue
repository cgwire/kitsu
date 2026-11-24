<template>
  <panel-layout
    class="team-schedule"
    :side="isTaskSidePanelOpen"
    :side-focused="isTaskSidePanelOpen"
  >
    <template #filters>
      <div class="schedule-toolbar">
        <div class="toolbar-row">
          <div class="flexrow-item">
            <date-field
              :label="$t('main.start_date')"
              utc
              v-model="selectedStartDate"
              @update:model-value="onUpdateSelectedStartDate"
            />
          </div>
          <div class="flexrow-item">
            <date-field
              :label="$t('main.end_date')"
              utc
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
          <button-simple
            :active="isTaskSidePanelOpen"
            class="flexrow-item"
            icon="list"
            :text="$t('tasks.unassigned_tasks')"
            @click="toggleTaskSidePanel"
          />
          <button-simple
            class="flexrow-item reset-filters"
            icon="remove"
            :title="$t('main.clear_filters')"
            @click="resetFilters"
            v-if="activeFilterCount"
          />
          <button-simple
            class="flexrow-item filters-toggle"
            :icon="showMoreFilters ? 'minus' : 'plus'"
            :aria-expanded="`${showMoreFilters}`"
            :is-on="showMoreFilters"
            :text="activeFilterCount ? `${activeFilterCount}` : ''"
            :title="
              $t(showMoreFilters ? 'main.less_filters' : 'main.more_filters')
            "
            @click="showMoreFilters = !showMoreFilters"
          />
        </div>
        <div class="toolbar-row" v-show="showMoreFilters">
          <combobox-studio
            class="flexrow-item"
            all-studios-label
            :label="$t('main.studio')"
            :width="300"
            v-model="selectedStudio"
          />
          <combobox-department
            class="flexrow-item"
            :display-all-and-my-departments="true"
            :label="$t('main.department')"
            :my-departments-only="isSupervisorWithDepartments"
            :width="300"
            v-model="selectedDepartment"
          />
          <combobox-production
            class="flexrow-item"
            :label="$t('main.production')"
            :production-list="productionList"
            v-model="selectedProduction"
          />
          <div class="flexrow-item people-filter">
            <label class="label">
              {{ $t('main.person') }}
            </label>
            <people-field
              ref="people-field"
              :people="selectablePeople"
              :placeholder="$t('team_schedule.person_placeholder')"
              v-model="selectedPerson"
            />
          </div>
        </div>
      </div>
    </template>
    <template #list>
      <search-query-list
        class="query-list"
        :groups="teamScheduleSearchFilterGroups"
        :is-group-enabled="true"
        :queries="teamScheduleSearchQueries"
        type="teamSchedule"
        with-route-query
      />
      <error-text
        class="has-text-centered"
        :text="scheduleSaveErrorText"
        v-if="scheduleSaveErrorText"
      />
      <div class="empty-schedule schedule-error" v-if="errors.schedule">
        <table-info is-error />
        <button-simple :text="$t('main.reload')" @click="init" />
      </div>
      <schedule
        ref="schedule"
        :assign-rule="assignRule"
        :dragged-items="draggedTasks"
        :end-date="endDate"
        :hide-man-days="true"
        :hierarchy="scheduleItems"
        :is-estimation-linked="true"
        :multiline="true"
        :reassignable="true"
        :start-date="startDate"
        :with-milestones="false"
        :zoom-level="zoomLevel"
        @item-assign="onScheduleItemAssigned"
        @item-changed="onScheduleItemChanged"
        @item-drop="onScheduleItemDropped"
        @item-unassign="onScheduleItemUnassigned"
        @root-element-expanded="expandPersonElement"
        v-else-if="loading.schedule || scheduleItems.length > 0"
      />
      <div class="empty-schedule" v-else>
        <user-search-icon :size="40" />
        <p>{{ $t('team_schedule.empty') }}</p>
      </div>
    </template>
    <template #side>
      <task-info>
        <a
          class="close-button"
          :title="$t('main.close')"
          role="button"
          tabindex="0"
          @click="toggleTaskSidePanel"
          @keydown.enter.prevent="toggleTaskSidePanel"
          @keydown.space.prevent="toggleTaskSidePanel"
        >
          <x-icon class="align-middle" :size="16" />
        </a>
        <h2 class="mt1">
          {{ $t('tasks.unassigned_tasks') }}
          <template v-if="!loading.unassignedTasks">
            ({{ totalUnassignedTasks }})
          </template>
        </h2>
        <div class="mb2">
          <combobox-production
            class="mb05"
            :label="$t('main.production')"
            :production-list="productionList"
            v-model="filters.productionId"
            @update:model-value="loadUnassignedTasks()"
          />
          <combobox-task-type
            class="mb05"
            :disabled="taskTypeList.length === 0"
            :label="$t('news.task_type')"
            :task-type-list="taskTypeList"
            v-model="filters.taskTypeId"
            @update:model-value="loadUnassignedTasks()"
          />
        </div>
        <template v-if="unassignedTasks.length > 0">
          <ul class="task-list">
            <li
              class="task-item"
              :class="{
                dragging: draggingTaskIds.has(task.id),
                selected: selectedTaskIds.has(task.id)
              }"
              :draggable="true"
              :key="task.id"
              @click="toggleTaskSelection(task)"
              @dragstart="onTaskDragStart($event, task)"
              @dragend="onTaskDragEnd"
              v-for="task in unassignedTasks"
            >
              <div class="ui-droppable">
                <div class="flexrow">
                  <entity-thumbnail
                    class="task-thumbnail flexrow-item"
                    :preview-file-id="task.entity_preview_file_id"
                    :width="150"
                    :height="50"
                    :empty-width="100"
                    :empty-height="66"
                  />
                  <div class="flexrow-item filler">
                    <production-name
                      class="production-name"
                      :production="task.production"
                      :with-avatar="false"
                    />
                    <div class="entity-name strong">
                      {{ task.full_entity_name }}
                    </div>
                    <div class="flexrow">
                      <em v-if="task.man_days">
                        {{ task.man_days }}
                        {{ $t('main.man_days', { count: task.man_days }) }}
                      </em>
                      <em v-else>
                        {{ $t('main.no_estimation') }}
                      </em>
                      <span class="filler"></span>
                      <task-type-name
                        class="task-type-name"
                        :task-type="{
                          id: task.task_type_id,
                          color: task.type_color,
                          name: task.type_name
                        }"
                        rounded
                        thin
                      />
                    </div>
                  </div>
                </div>
                <department-name
                  class="task-department"
                  :department="task.department"
                  no-padding
                  only-dot
                  v-if="task.department"
                />
              </div>
            </li>
          </ul>
          <div class="has-text-centered" v-if="loading.hasMoreUnassignedTasks">
            <spinner class="mt2" v-if="loading.unassignedTasks" />
            <button
              class="button mt2"
              @click="loadUnassignedTasks(true)"
              v-else
            >
              {{ $t('main.load_more') }}
            </button>
          </div>
        </template>
        <div v-else-if="loading.unassignedTasks">
          <spinner class="mt2" />
        </div>
        <div v-else-if="errors.unassignedTasks">
          <table-info is-error />
          <div class="has-text-centered pa1">
            <button-simple
              class="has-text-centered"
              :text="$t('main.reload')"
              @click="loadUnassignedTasks()"
            />
          </div>
        </div>
        <div class="has-text-centered" v-else-if="taskTypeList.length === 0">
          <em>
            {{
              $t(
                isAssignmentForbidden
                  ? 'team_schedule.no_assignment_role'
                  : 'team_schedule.no_department_task_type'
              )
            }}
          </em>
        </div>
        <div class="has-text-centered" v-else>
          <em>{{ $t('main.no_results') }}</em>
        </div>
      </task-info>
    </template>
  </panel-layout>
</template>

<script setup>
/*
 * Page to manage the schedule of all the people in the studio
 */
import { useHead } from '@unhead/vue'
import { UserSearchIcon, XIcon } from 'lucide-vue-next'
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

import { getBarOrigin, useScheduleSave } from '@/composables/scheduleSave'
import colors from '@/lib/colors'
import { getPersonPath } from '@/lib/path'
import { getZoomOptions } from '@/lib/productionSchedule'
import {
  addBusinessDays,
  getFirstStartDate,
  getLastEndDate,
  getUserDay,
  minutesToDays,
  parseSimpleDate
} from '@/lib/time'

import PanelLayout from '@/components/layouts/PanelLayout.vue'
import Schedule from '@/components/schedule/Schedule.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import DateField from '@/components/widgets/DateField.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const DEFAULT_ZOOM = 1
const childrenOrder = firstBy('startDate').thenBy('project_name').thenBy('name')

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket
const { saveAssignment, saveBar, saveChange, scheduleSaveErrorText } =
  useScheduleSave(bar => bar.name)

// State
// --------------------------------------------------------------------------
const draggedTasks = ref([])
const selectedTaskIds = ref(new Set())
const endDate = ref(moment().add(3, 'months'))
const isTaskSidePanelOpen = ref(false)
const showMoreFilters = ref(false)
const personDates = ref({})
const scheduleItems = ref([])
const selectedDepartment = ref('ALL')
const selectedEndDate = ref(null)
const selectedPerson = ref(null)
const selectedProduction = ref(null)
const selectedStartDate = ref(null)
const selectedStudio = ref(null)
const startDate = ref(moment())
const totalUnassignedTasks = ref(0)
const unassignedTasks = ref([])
const unassignedTasksPage = ref(1)
const zoomLevel = ref(DEFAULT_ZOOM)

const errors = reactive({
  schedule: false,
  unassignedTasks: false
})
const filters = reactive({
  productionId: null,
  taskTypeId: null
})
const loading = reactive({
  hasMoreUnassignedTasks: false,
  schedule: false,
  unassignedTasks: false
})

const zoomOptions = computed(() => getZoomOptions(t, [1, 2, 3, 4]))

// non-reactive: person id -> raw tasks, so re-expanding a row is instant.
// Entries are dropped whenever the row's assignments or dates change.
const personTasksCache = new Map()

// the query of a navigation still on its way: route.query only changes
// once it lands, and an update meanwhile builds on this one
let pendingQuery = null

// transparent 1px image: hides the native drag snapshot so the only
// drag feedback is the drop-preview ghost on the timeline
const emptyDragImage = new Image()
emptyDragImage.src =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// The route watcher sees the query of the next page too, before this one
// unmounts.
const pagePath = route.path

// A query the page reads is not written back: a default it adds would
// unmark the saved search just run.
let isReadingRoute = false

const peopleFieldRef = useTemplateRef('people-field')
const scheduleRef = useTemplateRef('schedule')

// Computed
// --------------------------------------------------------------------------
const currentUserRoleForProduction = computed(
  () => store.getters.currentUserRoleForProduction
)
const daysOff = computed(() => store.getters.daysOff)
const departmentMap = computed(() => store.getters.departmentMap)
const displayedPeople = computed(() => store.getters.displayedPeople)
const getProductionTaskTypes = computed(
  () => store.getters.getProductionTaskTypes
)
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const openProductions = computed(() => store.getters.openProductions)
const teamScheduleSearchFilterGroups = computed(
  () => store.getters.teamScheduleSearchFilterGroups
)
const teamScheduleSearchQueries = computed(
  () => store.getters.teamScheduleSearchQueries
)
const organisation = computed(() => store.getters.organisation)
const productionMap = computed(() => store.getters.productionMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const user = computed(() => store.getters.user)

const daysOffByPerson = computed(() =>
  daysOff.value.reduce((acc, dayOff) => {
    acc[dayOff.person_id] = (acc[dayOff.person_id] || []).concat(dayOff)
    return acc
  }, {})
)

// The department filter follows the role held on the production filter,
// the global role standing in for "All": a supervisor attached to
// departments only browses those.
const isSupervisorWithDepartments = computed(() =>
  Boolean(scopedDepartments(selectedProduction.value)?.length)
)

// "My departments" is the widest scope of a supervisor attached to
// departments: any other choice counts as a filter.
const defaultDepartment = computed(() =>
  isSupervisorWithDepartments.value ? 'MY_DEPARTMENTS' : 'ALL'
)

const activeFilterCount = computed(
  () =>
    [
      selectedStudio.value,
      selectedProduction.value,
      selectedDepartment.value !== defaultDepartment.value,
      selectedPerson.value
    ].filter(Boolean).length
)

// The unassigned panel is scoped the same way by its own production
// filter, an artist role leaving nothing to list.
const isDepartmentScoped = computed(() =>
  Boolean(scopedDepartments(filters.productionId))
)

const isAssignmentForbidden = computed(
  () => scopedDepartments(filters.productionId)?.length === 0
)

const departmentFilter = computed(() => {
  if (!selectedDepartment.value || selectedDepartment.value === 'ALL') {
    return []
  }
  if (selectedDepartment.value === 'MY_DEPARTMENTS') {
    return user.value.departments
  }
  return [selectedDepartment.value]
})

const selectablePeople = computed(() => {
  let people = displayedPeople.value.filter(person => !person.is_bot)
  if (departmentFilter.value.length > 0) {
    people = people.filter(person =>
      person.departments.some(departmentId =>
        departmentFilter.value.includes(departmentId)
      )
    )
  }
  if (selectedStudio.value) {
    people = people.filter(person => person.studio_id === selectedStudio.value)
  }
  const production = selectedProduction.value
    ? productionMap.value.get(selectedProduction.value)
    : null
  if (production) {
    people = people.filter(person => production.team.includes(person.id))
  }
  return people
})

const draggingTaskIds = computed(
  () => new Set(draggedTasks.value.map(({ id }) => id))
)

const productionList = computed(() => addAllValue(openProductions.value))

const taskTypeList = computed(() => {
  const types = getProductionTaskTypes
    .value(filters.productionId)
    .filter(type => type.for_entity !== 'Concept')
  // the open tasks API takes a single task type, so a scoped supervisor
  // gets no "All" entry: it would list the other departments' tasks
  return isDepartmentScoped.value
    ? types.filter(type => canEditTaskType(type, filters.productionId))
    : addAllValue(types)
})

// Functions
// --------------------------------------------------------------------------
const addAllValue = list => [
  {
    id: '',
    color: '#999',
    name: t('main.all'),
    short_name: t('main.all')
  },
  ...list
]

// Zou lets a supervisor with departments assign and reschedule only the
// tasks of those departments, and only to people of those departments; a
// supervisor without any acts on everything. An artist may only
// self-assign in their own department on Zou: the page keeps such a
// production inert. The role is held per production, an admin never being
// demoted by one.
const scopedDepartments = productionId => {
  const role = isCurrentUserAdmin.value
    ? 'admin'
    : currentUserRoleForProduction.value(productionId)
  if (['admin', 'manager'].includes(role)) {
    return null
  }
  if (role !== 'supervisor') {
    return []
  }
  return user.value.departments.length > 0 ? user.value.departments : null
}

const canEditTaskType = (taskType, productionId) => {
  const departments = scopedDepartments(productionId)
  return !departments || departments.includes(taskType.department_id)
}

// Asked by the schedule before a drop and during a reassign drag: the
// reason of the refusal, or null.
const assignRule = (task, person) => {
  const departments = scopedDepartments(task.project_id)
  if (!departments) {
    return null
  }
  if (departments.length === 0) {
    return 'role'
  }
  const taskType = taskTypeMap.value.get(task.task_type_id)
  if (!departments.includes(taskType?.department_id)) {
    return 'task_type'
  }
  const isSharedDepartment = person.departments.some(departmentId =>
    departments.includes(departmentId)
  )
  return isSharedDepartment ? null : 'person'
}

const init = async () => {
  loading.schedule = true
  errors.schedule = false
  try {
    await store.dispatch('loadPeople')
    await loadPersonDates()
  } catch (err) {
    console.error(err)
    errors.schedule = true
    loading.schedule = false
    return
  }
  startDate.value = getUserDay()
  endDate.value = getUserDay().add(3, 'months')
  Object.values(personDates.value).forEach(dates => {
    if (dates.startDate?.isBefore(startDate.value)) {
      startDate.value = dates.startDate.clone()
    }
    if (dates.endDate?.isAfter(endDate.value)) {
      endDate.value = dates.endDate.clone()
    }
  })
  await loadDaysOff()

  loading.schedule = false
  refreshSchedule()
  scrollScheduleToToday()

  selectedStartDate.value = startDate.value.toDate()
  selectedEndDate.value = endDate.value.toDate()
}

// Days off only grey out cells and snap drags to business days: a
// failure must not blank the schedule.
const loadDaysOff = async () => {
  try {
    await store.dispatch('loadDaysOff', {
      startDate: startDate.value,
      endDate: endDate.value
    })
  } catch (err) {
    console.error(err)
  }
}

// The root items carry the days off of their person: patch them in
// place, a rebuild would collapse the expanded rows.
const refreshDaysOff = () => {
  scheduleItems.value.forEach(item => {
    item.daysOff = daysOffByPerson.value[item.id]
  })
}

const toggleTaskSidePanel = () => {
  isTaskSidePanelOpen.value = !isTaskSidePanelOpen.value

  if (!isTaskSidePanelOpen.value) {
    unassignedTasks.value = []
    errors.unassignedTasks = false
  }
}

// Keep the filter on a listed task type: a production change may have
// dropped the current one, and the scoped list has no "All" entry to
// fall back on. Returns true when the filter moved.
const syncTaskTypeFilter = () => {
  const ids = taskTypeList.value.map(({ id }) => id)
  if (ids.includes(filters.taskTypeId || '')) {
    return false
  }
  filters.taskTypeId = ids[0] ?? null
  return true
}

const loadUnassignedTasks = async (more = false) => {
  errors.unassignedTasks = false
  // a moved filter restarts the list, "load more" or not
  const append = !syncTaskTypeFilter() && more
  if (isDepartmentScoped.value && !filters.taskTypeId) {
    unassignedTasks.value = []
    selectedTaskIds.value = new Set()
    totalUnassignedTasks.value = 0
    loading.hasMoreUnassignedTasks = false
    return
  }
  loading.unassignedTasks = true
  const page = append ? unassignedTasksPage.value + 1 : 1
  try {
    const { data, is_more, stats } = await store.dispatch('loadOpenTasks', {
      limit: 20,
      page,
      person_id: 'unassigned',
      project_id: filters.productionId,
      task_type_id: filters.taskTypeId
    })
    unassignedTasksPage.value = page
    if (!append) {
      unassignedTasks.value = []
      // fresh list (filter change, panel reopen): stale selection ids
      // would silently survive and reattach if the tasks come back
      selectedTaskIds.value = new Set()
    }
    unassignedTasks.value = unassignedTasks.value.concat(
      // populate tasks with extra data
      data.map(task => ({
        ...task,
        full_entity_name: [
          task.entity_type_name,
          task.episode_name,
          task.sequence_name,
          task.entity_name
        ]
          .filter(Boolean)
          .join(' / '),
        man_days:
          Math.round(minutesToDays(organisation.value, task.estimation) * 100) /
          100,
        department: departmentMap.value.get(
          taskTypeMap.value.get(task.task_type_id)?.department_id
        ),
        production: productionMap.value.get(task.project_id)
      }))
    )
    totalUnassignedTasks.value = stats.total
    loading.hasMoreUnassignedTasks = is_more
  } catch (err) {
    errors.unassignedTasks = true
    console.error(err)
  }
  loading.unassignedTasks = false
}

const loadPersonDates = async () => {
  const personDatesList = await store.dispatch('getPersonsTasksDates')
  personDates.value = {}
  personDatesList.forEach(p => {
    const busyPeriods = (p.busy_periods || []).map(period => ({
      startDate: parseSimpleDate(period.start_date),
      endDate: parseSimpleDate(period.end_date)
    }))
    // min/max are null for a person only busy on other productions:
    // the root bar then spans the anonymous periods alone.
    let minDate = p.min_date ? parseSimpleDate(p.min_date) : null
    let maxDate = p.max_date ? parseSimpleDate(p.max_date) : null
    busyPeriods.forEach(period => {
      if (!minDate || period.startDate.isBefore(minDate)) {
        minDate = period.startDate.clone()
      }
      if (!maxDate || period.endDate.isAfter(maxDate)) {
        maxDate = period.endDate.clone()
      }
    })
    personDates.value[p.person_id] = {
      busyPeriods,
      endDate: maxDate,
      startDate: minDate
    }
  })
}

// recompute the root bar locally after a drag: the person is expanded so
// its children are loaded, no need to refetch every person's dates
const refreshPersonRootDates = person => {
  if (!person?.children?.length) return
  person.startDate = getFirstStartDate(person.children).clone()
  person.endDate = getLastEndDate(person.children).clone()
  personDates.value[person.id] = {
    startDate: person.startDate.clone(),
    endDate: person.endDate.clone()
  }
}

// The mount-time filter watchers fire before the person dates exist:
// init() rebuilds the schedule itself once they are loaded.
const refreshSchedule = () => {
  if (loading.schedule) {
    return
  }
  const people = selectedPerson.value
    ? [selectedPerson.value]
    : selectablePeople.value
  scheduleItems.value = convertScheduleItems(people)
}

const convertScheduleItems = items =>
  items.map(item => {
    let startDate = moment()
    let endDate = moment()
    const dates = personDates.value[item.id]
    if (dates && dates.startDate && dates.endDate) {
      startDate = parseSimpleDate(dates.startDate)
      endDate = parseSimpleDate(dates.endDate)
    }
    return {
      ...item,
      avatar: true,
      color: item.color || colors.fromString(item.name, true),
      startDate,
      endDate,
      expanded: false,
      loading: false,
      editable: false,
      route: getPersonPath(item.id, 'schedule'),
      children: [],
      daysOff: daysOffByPerson.value[item.id]
    }
  })

const buildTaskScheduleItem = (parentElement, task) => {
  if (!task.start_date || !task.due_date) {
    return null
  }
  const taskType = taskTypeMap.value.get(task.task_type_id)
  if (!taskType) {
    return null
  }
  const startDate = parseSimpleDate(task.start_date)
  let endDate = parseSimpleDate(task.due_date)
  if (endDate.isBefore(startDate)) {
    endDate = startDate.clone().add(1, 'days')
  }
  return {
    ...task,
    name: `${task.full_entity_name} / ${taskType.name}`,
    startDate,
    endDate,
    man_days: task.estimation,
    editable: canEditTaskType(taskType, task.project_id),
    unresizable: false,
    color: taskType.color,
    parentElement
  }
}

// Anonymous availability from other productions (issue #1579): the
// server only ships merged date pairs, so the bar can name neither the
// production nor the task, and must stay inert.
const buildBusyScheduleItem = (parentElement, period, index) => ({
  id: `busy-${parentElement.id}-${index}`,
  name: t('team_schedule.busy'),
  startDate: period.startDate.clone(),
  endDate: period.endDate.clone(),
  editable: false,
  unresizable: true,
  color: '#999999',
  parentElement
})

const saveTaskScheduleItem = task =>
  store.dispatch('updateTask', {
    taskId: task.id,
    data: {
      start_date: task.startDate.format('YYYY-MM-DD'),
      due_date: task.endDate.format('YYYY-MM-DD'),
      estimation: task.estimation
    }
  })

const toggleTaskSelection = task => {
  const ids = new Set(selectedTaskIds.value)
  if (ids.has(task.id)) {
    ids.delete(task.id)
  } else {
    ids.add(task.id)
  }
  selectedTaskIds.value = ids
}

const onTaskDragStart = (event, task) => {
  event.stopPropagation()
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('taskId', task.id)
  event.dataTransfer.setDragImage(emptyDragImage, 0, 0)
  // dragging a selected card takes the whole selection along, in panel
  // order; dragging an unselected card takes only that card
  draggedTasks.value = selectedTaskIds.value.has(task.id)
    ? unassignedTasks.value.filter(({ id }) => selectedTaskIds.value.has(id))
    : [task]
}

const onTaskDragEnd = () => {
  draggedTasks.value = []
}

// The tasks of a person row as Zou has them, after a refused reassignment
// or drop: the widget had already moved the bar.
const reloadPersonRow = async person => {
  personTasksCache.delete(person.id)
  if (!person.expanded) return
  person.expanded = false
  await expandPersonElement(person, element =>
    scheduleRef.value?.refreshItemPositions(element)
  )
}

// The person rows of the reassignments Zou refused: a drag reassigns as it
// crosses the rows, and the rows come back from Zou once it is over.
const rowsToReload = new Set()

const reloadRefusedRows = () => {
  const rows = [...rowsToReload]
  rowsToReload.clear()
  rows.forEach(reloadPersonRow)
}

const saveReassignment = async (task, person, save) => {
  if (await saveAssignment(task, save)) return
  rowsToReload.add(person)
  if (!scheduleRef.value?.isEditingDates) reloadRefusedRows()
}

const onScheduleItemDropped = async (item, person, refreshScheduleCallBack) => {
  if (item.type === 'Task') {
    const task = buildTaskScheduleItem(person, item)
    if (!task) {
      return
    }
    personTasksCache.delete(person.id)
    person.children.push(task)
    person.children.sort(childrenOrder)
    if (refreshScheduleCallBack) {
      refreshScheduleCallBack(person)
    }
    const isAssigned = await saveAssignment(task, () =>
      store.dispatch('assignSelectedTasks', {
        personId: person.id,
        taskIds: [task.id]
      })
    )
    if (!isAssigned) {
      // refused, the task stays in the backlog
      person.children = person.children.filter(({ id }) => id !== task.id)
      if (refreshScheduleCallBack) {
        refreshScheduleCallBack(person)
      }
      return
    }
    // the task left the backlog: update the panel locally instead of
    // reloading it, which kept resetting the scroll and pagination
    // (and multi-drop fires this handler once per task)
    unassignedTasks.value = unassignedTasks.value.filter(
      ({ id }) => id !== task.id
    )
    totalUnassignedTasks.value = Math.max(0, totalUnassignedTasks.value - 1)
    if (selectedTaskIds.value.has(task.id)) {
      const ids = new Set(selectedTaskIds.value)
      ids.delete(task.id)
      selectedTaskIds.value = ids
    }
    // refused, the task keeps the dates it had: as Zou has them
    if (!(await saveChange(task, () => saveTaskScheduleItem(task)))) {
      await reloadPersonRow(person)
    }
  }
}

// A bar whose save Zou refuses goes back where the widget found it.
const onScheduleItemChanged = async item => {
  if (item.type === 'Task') {
    const origin = getBarOrigin(item)
    item.startDate = addBusinessDays(
      item.startDate,
      0,
      item.parentElement.daysOff
    )
    if (item.estimation) {
      item.endDate = addBusinessDays(
        item.startDate,
        Math.ceil(minutesToDays(organisation.value, item.estimation)) - 1,
        item.parentElement.daysOff
      )
    }
    const isSaved = await saveBar(item, () => saveTaskScheduleItem(item), {
      origin,
      onPutBack: putBackBar
    })
    if (isSaved) {
      refreshPersonRootDates(item.parentElement)
      personTasksCache.delete(item.parentElement.id)
    }
  }
}

// a bar put back: its person row spans its bars again
const putBackBar = bar => {
  refreshPersonRootDates(bar.parentElement)
  scheduleRef.value?.refreshItemPositions(bar.parentElement)
}

const onScheduleItemAssigned = (item, person) => {
  if (item.type === 'Task') {
    personTasksCache.delete(person.id)
    person.children.sort(childrenOrder)
    saveReassignment(item, person, () =>
      store.dispatch('assignSelectedTasks', {
        personId: person.id,
        taskIds: [item.id]
      })
    )
  }
}

const onScheduleItemUnassigned = (item, person) => {
  if (item.type === 'Task') {
    personTasksCache.delete(person.id)
    saveReassignment(item, person, () =>
      store.dispatch('unassignPersonFromTask', {
        person,
        task: item
      })
    )
  }
}

const expandPersonElement = async (element, refreshScheduleCallBack) => {
  element.expanded = !element.expanded

  if (!element.expanded) {
    return
  }

  element.loading = true
  element.children = []
  try {
    let tasks = personTasksCache.get(element.id)
    if (!tasks) {
      tasks = await store.dispatch('fetchPersonTasks', element.id)
      personTasksCache.set(element.id, tasks)
    }
    const busyItems = (personDates.value[element.id]?.busyPeriods || []).map(
      (period, index) => buildBusyScheduleItem(element, period, index)
    )
    element.children = tasks
      .map(task => buildTaskScheduleItem(element, task))
      .filter(Boolean)
      .concat(busyItems)
      .sort(childrenOrder)

    if (refreshScheduleCallBack) {
      refreshScheduleCallBack(element)
    }
  } catch (err) {
    console.error(err)
  }
  element.loading = false
}

const onUpdateSelectedStartDate = async date => {
  startDate.value = parseSimpleDate(date)
  await loadDaysOff()
  refreshDaysOff()
}

const onUpdateSelectedEndDate = async date => {
  endDate.value = parseSimpleDate(date)
  await loadDaysOff()
  refreshDaysOff()
}

const scrollScheduleToToday = () => {
  scheduleRef.value?.scrollToToday()
}

const clearHiddenSelectedPerson = () => {
  if (
    selectedPerson.value &&
    !selectablePeople.value.includes(selectedPerson.value)
  ) {
    peopleFieldRef.value.clear()
  }
}

// Keep the department filter on an entry the combobox lists: the scope
// follows the production filter, and a bookmark may carry any value.
const syncDepartmentFilter = () => {
  const department = selectedDepartment.value
  if (isSupervisorWithDepartments.value) {
    if (
      department !== 'MY_DEPARTMENTS' &&
      !user.value.departments.includes(department)
    ) {
      selectedDepartment.value = 'MY_DEPARTMENTS'
    }
  } else if (
    department === 'MY_DEPARTMENTS' &&
    (isCurrentUserManager.value || !user.value.departments.length)
  ) {
    // the unscoped list offers "My departments" only to a non-manager
    // attached to departments
    selectedDepartment.value = 'ALL'
  }
}

const resetFilters = () => {
  if (selectedPerson.value) peopleFieldRef.value.clear()
  // the values of the "All" entries: undefined would leave the URL as it is
  selectedStudio.value = null
  selectedProduction.value = ''
  selectedDepartment.value = defaultDepartment.value
}

const applyRouteQuery = () => {
  selectedStudio.value = route.query.studio || undefined
  // the combobox lists the open productions only: a closed or deleted
  // production of a link is dropped. It stays in the URL (undefined, not
  // ''), so a link with nothing else to rewrite opens without a navigation.
  const production = route.query.production
  selectedProduction.value = openProductions.value.some(
    ({ id }) => id === production
  )
    ? production
    : undefined
  // Supervisors land on their own departments (issue #1579), a bookmarked
  // department outside them included.
  selectedDepartment.value = route.query.department || defaultDepartment.value
  syncDepartmentFilter()
  const zoom = Number(route.query.zoom)
  zoomLevel.value = zoomOptions.value.some(option => option.value === zoom)
    ? zoom
    : DEFAULT_ZOOM
}

const updateRoute = ({ department, production, studio, zoom }) => {
  if (isReadingRoute) return
  const currentQuery = pendingQuery || route.query
  const query = { ...currentQuery }

  if (department !== undefined) {
    query.department = department || undefined
  }
  if (production !== undefined) {
    query.production = production || undefined
  }
  if (studio !== undefined) {
    query.studio = studio || undefined
  }
  if (zoom !== undefined) {
    query.zoom = String(zoom)
  }

  if (JSON.stringify(query) !== JSON.stringify(currentQuery)) {
    pendingQuery = query
    router.push({ query }).finally(() => {
      if (pendingQuery === query) {
        pendingQuery = null
      }
    })
  }
}

// The unassigned tasks are enriched copies, out of reach of the store
// mutations, so refresh their thumbnail here.
const onPreviewFileSetMain = eventData => {
  unassignedTasks.value.forEach(task => {
    if (task.entity_id === eventData.entity_id) {
      task.entity_preview_file_id = eventData.preview_file_id
    }
  })
}

// Watchers
// --------------------------------------------------------------------------

// the rows of a refused reassignment wait for the drop
watch(
  () => scheduleRef.value?.isEditingDates,
  isEditing => {
    if (!isEditing && rowsToReload.size) reloadRefusedRows()
  }
)
watch(selectedDepartment, value => {
  updateRoute({ department: value })
  clearHiddenSelectedPerson()
  refreshSchedule()
})

watch(selectedStudio, value => {
  updateRoute({ studio: value })
  clearHiddenSelectedPerson()
  refreshSchedule()
})

watch(selectedPerson, refreshSchedule)

watch(selectedProduction, value => {
  updateRoute({ production: value })
  refreshSchedule()
})

watch(isSupervisorWithDepartments, syncDepartmentFilter)

watch(zoomLevel, value => {
  updateRoute({ zoom: value })
})

// A saved search, or the back button, sets a query the page did not write.
watch(
  () => route.query,
  async () => {
    if (route.path === pagePath) {
      isReadingRoute = true
      applyRouteQuery()
      // the filter watchers run before the next tick
      await nextTick()
      isReadingRoute = false
    }
  }
)

watch(isTaskSidePanelOpen, open => {
  if (open) {
    loadUnassignedTasks()
  }
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  applyRouteQuery()

  socket.on('preview-file:set-main', onPreviewFileSetMain)

  init()
})

onBeforeUnmount(() => {
  socket.off('preview-file:set-main', onPreviewFileSetMain)
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(() => `${t('team_schedule.title_main')} - Kitsu`)
})
</script>

<style lang="scss" scoped>
.dark .schedule-toolbar {
  color: var(--text);
}

.schedule-toolbar {
  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  // Every control sits on the row bottom at the select height, as in the
  // production schedule toolbar: datepicker, select, custom combos and
  // multiselect each have their own natural height
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

  :deep(.studio-combo),
  :deep(.department-combo),
  :deep(.production-combo) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 42px;
  }

  :deep(.multiselect),
  :deep(.multiselect__tags) {
    min-height: 42px;
  }
}

.reset-filters,
.filters-toggle {
  color: var(--text);
  padding: 0 14px;
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

// The schedule paints its corner and its month names with the page
// background and leaves the rest of its headers transparent: on the panel
// tone they came out as patches.
.team-schedule .schedule-wrapper {
  background: var(--background);
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

// its names sit 5px from its left edge, made for a page margin beside them
.team-schedule .schedule-wrapper :deep(.schedule) {
  padding-left: 10px;
}

.people-filter {
  width: 300px;
}

// same look as the kanban board empty state
.empty-schedule {
  align-items: center;
  color: var(--text);
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.75em;
  justify-content: flex-start;
  opacity: 0.55;
  padding: 2em 1em 0;
  text-align: center;

  p {
    margin: 0;
    max-width: 60ch;
  }
}

// the close button hangs in the corner of the task panel
.team-schedule :deep(.side.task-info) {
  position: relative;
}

// Hide the task selection counter
.team-schedule :deep(.task-info.empty) {
  padding-top: 0;

  > *:not(.empty-section) {
    display: none;
  }
}

.close-button {
  color: var(--text);
  opacity: 0.6;
  position: absolute;
  right: 1em;
  top: 1em;

  &:hover {
    opacity: 1;
  }
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75em;

  .task-item {
    position: relative;
    cursor: grab;

    .ui-droppable {
      padding: 0.5em;
      // borderless in light: the crisp shadows carry the edge, dark
      // mode restores a faint solid border (same recipe as the board
      // cards)
      border: 1px solid transparent;
      border-radius: 10px;
      background-color: var(--background-alt-2);
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.12),
        0 2px 8px rgba(0, 0, 0, 0.06);
      transition:
        transform 150ms ease-out,
        box-shadow 150ms ease-out;

      .production-name {
        margin-bottom: 0;
        margin-top: 0.3em;
        font-size: 0.8em;
        text-transform: uppercase;
      }

      .dark & {
        border-color: #55585d;
      }
    }

    &:hover .ui-droppable {
      box-shadow:
        0 2px 6px rgba(0, 0, 0, 0.14),
        0 6px 16px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }

    &.selected .ui-droppable {
      box-shadow:
        0 0 0 3px var(--background-selected),
        0 2px 8px rgba(0, 0, 0, 0.06);
    }

    &.dragging {
      cursor: grabbing;
      opacity: 0.4;
    }

    .task-thumbnail {
      border-radius: 6px;
      margin-right: 1em;
      overflow: hidden;
    }

    .task-department {
      position: absolute;
      top: 8px;
      right: 0.5em;
    }
  }
}
</style>
