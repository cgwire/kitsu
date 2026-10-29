<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="flexrow date-filters">
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.start_date') }}
          </label>
          <date-field
            utc
            v-model="selectedStartDate"
            @update:model-value="onUpdateSelectedStartDate"
          />
        </div>
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.end_date') }}
          </label>
          <date-field
            utc
            v-model="selectedEndDate"
            @update:model-value="onUpdateSelectedEndDate"
          />
        </div>
        <div class="flexrow-item zoom-level">
          <label class="label">
            {{ $t('schedule.zoom_level') }}
          </label>
          <combobox-number
            is-simple
            :options="zoomOptions"
            v-model="zoomLevel"
          />
        </div>

        <div class="filler"></div>
        <div class="flexrow">
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
        </div>
      </div>
      <div class="flexrow filters">
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
    </div>

    <div class="column side-column" v-if="isTaskSidePanelOpen">
      <task-info>
        <a
          class="close-button"
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
    </div>
  </div>
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

import colors from '@/lib/colors'
import { getPersonPath } from '@/lib/path'
import {
  addBusinessDays,
  getFirstStartDate,
  getLastEndDate,
  getUserDay,
  minutesToDays,
  parseSimpleDate
} from '@/lib/time'

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
import PeopleField from '@/components/widgets/PeopleField.vue'
import ProductionName from '@/components/widgets/ProductionName.vue'
import Schedule from '@/components/widgets/Schedule.vue'
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

// State
// --------------------------------------------------------------------------
const draggedTasks = ref([])
const selectedTaskIds = ref(new Set())
const endDate = ref(moment().add(3, 'months'))
const isTaskSidePanelOpen = ref(false)
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

const zoomOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 }
]

// non-reactive: person id -> raw tasks, so re-expanding a row is instant.
// Entries are dropped whenever the row's assignments or dates change.
const personTasksCache = new Map()

// transparent 1px image: hides the native drag snapshot so the only
// drag feedback is the drop-preview ghost on the timeline
const emptyDragImage = new Image()
emptyDragImage.src =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

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
    try {
      await store.dispatch('assignSelectedTasks', {
        personId: person.id,
        taskIds: [task.id]
      })
      await saveTaskScheduleItem(task)
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
    } catch (err) {
      console.error(err)
      person.children = person.children.filter(({ id }) => id !== task.id)
      if (refreshScheduleCallBack) {
        refreshScheduleCallBack(person)
      }
    }
  }
}

const onScheduleItemChanged = async item => {
  if (item.type === 'Task') {
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
    try {
      await saveTaskScheduleItem(item)
      refreshPersonRootDates(item.parentElement)
      personTasksCache.delete(item.parentElement.id)
    } catch (err) {
      console.error(err)
    }
  }
}

const onScheduleItemAssigned = (item, person) => {
  if (item.type === 'Task') {
    personTasksCache.delete(person.id)
    person.children.sort(childrenOrder)
    store.dispatch('assignSelectedTasks', {
      personId: person.id,
      taskIds: [item.id]
    })
  }
}

const onScheduleItemUnassigned = (item, person) => {
  if (item.type === 'Task') {
    personTasksCache.delete(person.id)
    store.dispatch('unassignPersonFromTask', {
      person,
      task: item
    })
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
  } else if (department === 'MY_DEPARTMENTS' && isCurrentUserManager.value) {
    // the unscoped list only offers "My departments" to a global supervisor
    selectedDepartment.value = 'ALL'
  }
}

const updateRoute = ({ department, production, studio, zoom }) => {
  const query = { ...route.query }

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

  if (JSON.stringify(query) !== JSON.stringify(route.query)) {
    router.push({ query })
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

watch(isTaskSidePanelOpen, open => {
  if (open) {
    loadUnassignedTasks()
  }
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  selectedStudio.value = route.query.studio || undefined
  selectedProduction.value = route.query.production || undefined
  // Supervisors land on their own departments (issue #1579), a bookmarked
  // department outside them included.
  const department = route.query.department
  if (department) {
    selectedDepartment.value = department
  } else if (isSupervisorWithDepartments.value) {
    selectedDepartment.value = 'MY_DEPARTMENTS'
  }
  syncDepartmentFilter()
  const zoom = Number(route.query.zoom)
  zoomLevel.value = zoomOptions.some(option => option.value === zoom)
    ? zoom
    : DEFAULT_ZOOM

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
.dark {
  .filters {
    color: $white-grey;
    border-bottom: 1px solid $grey;
  }
}

.date-filters {
  padding-bottom: 1em;
  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }
}

.filters {
  border-bottom: 1px solid #eee;
  padding-bottom: 1em;

  .field {
    padding-bottom: 0;
    margin-bottom: 0;
  }
}

.fixed-page {
  padding: 1em;
  padding-top: 90px;
  padding-left: 2em;
}

.main-column {
  display: flex;
  border: 0;
  overflow: hidden;
  flex-direction: column;
}

.zoom-level {
  white-space: nowrap;
}

// The filter rows mix five widgets with five natural control heights
// (datepicker, select, custom combos, multiselect): force a single
// height so both rows line up.
$filter-control-height: 40px;

.date-filters,
.filters {
  // vertical-align kills the baseline descender space under the
  // inline-flex datepicker, and the fixed height overrides the 2.5em
  // Bulma puts on the .select span regardless of its content: without
  // both, the centered flexrow shifts the zoom item down.
  :deep(.datepicker) {
    vertical-align: top;
  }

  .zoom-level :deep(.select) {
    height: $filter-control-height;
  }

  .zoom-level :deep(.select-input) {
    height: $filter-control-height;
    vertical-align: top;
  }

  // ComboboxNumber tunes the dropdown arrow for its 3em select: recenter
  // it for the 40px control (Bulma's own centering offset)
  .zoom-level :deep(.select::after) {
    margin-top: -0.4375em;
  }

  :deep(.studio-combo),
  :deep(.department-combo),
  :deep(.production-combo) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: $filter-control-height;
  }

  :deep(.multiselect),
  :deep(.multiselect__tags) {
    min-height: $filter-control-height;
  }
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

.side-column {
  position: relative;
  top: -30px;
  right: -14px;
  height: calc(100% + 44px);
  margin-top: 0;

  // Hide the task selection counter
  :deep(.task-info.empty) {
    padding-top: 0;
    > *:not(.empty-section) {
      display: none;
    }
  }

  .close-button {
    position: absolute;
    right: 1em;
    top: 1em;
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
}
</style>
