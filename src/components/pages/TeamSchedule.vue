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
          v-model="selectedStudio"
        />
        <combobox-department
          class="flexrow-item"
          :display-all-and-my-departments="true"
          :label="$t('main.department')"
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
            wide
            v-model="selectedPerson"
          />
        </div>
      </div>

      <schedule
        ref="schedule"
        :dragged-items="draggedTasks"
        :end-date="endDate"
        :hide-man-days="true"
        :hierarchy="scheduleItems"
        :is-error="errors.schedule"
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
      />
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
              :draggable="true"
              :key="task.id"
              @dragstart="onTaskDragStart($event, task)"
              @drag="onTaskDrag"
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
import { XIcon } from 'lucide-vue-next'
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

const peopleFieldRef = useTemplateRef('people-field')
const scheduleRef = useTemplateRef('schedule')

// Computed
// --------------------------------------------------------------------------
const daysOff = computed(() => store.getters.daysOff)
const departmentMap = computed(() => store.getters.departmentMap)
const displayedPeople = computed(() => store.getters.displayedPeople)
const getProductionTaskTypes = computed(
  () => store.getters.getProductionTaskTypes
)
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

const productionList = computed(() => addAllValue(openProductions.value))

const taskTypeList = computed(() => {
  const types = getProductionTaskTypes
    .value(filters.productionId)
    .filter(type => type.for_entity !== 'Concept')
  return addAllValue(types)
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

const init = async () => {
  try {
    await store.dispatch('loadPeople')
    await loadPersonDates()
    await store.dispatch('loadDaysOff')
  } catch (err) {
    console.error(err)
    errors.schedule = true
    return
  }

  refreshSchedule()
  scrollScheduleToToday()

  startDate.value = moment()
  endDate.value = moment().add(3, 'months')
  Object.values(personDates.value).forEach(dates => {
    if (dates.startDate?.isBefore(startDate.value)) {
      startDate.value = dates.startDate.clone()
    }
    if (dates.endDate?.isAfter(endDate.value)) {
      endDate.value = dates.endDate.clone()
    }
  })

  selectedStartDate.value = startDate.value.toDate()
  selectedEndDate.value = endDate.value.toDate()
}

const toggleTaskSidePanel = () => {
  isTaskSidePanelOpen.value = !isTaskSidePanelOpen.value

  if (!isTaskSidePanelOpen.value) {
    unassignedTasks.value = []
    errors.unassignedTasks = false
  }
}

const loadUnassignedTasks = async (more = false) => {
  loading.unassignedTasks = true
  errors.unassignedTasks = false
  const page = more ? unassignedTasksPage.value + 1 : 1
  try {
    const { data, is_more, stats } = await store.dispatch('loadOpenTasks', {
      limit: 20,
      page,
      person_id: 'unassigned',
      project_id: filters.productionId,
      task_type_id: filters.taskTypeId
    })
    unassignedTasksPage.value = page
    if (!more) {
      unassignedTasks.value = []
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
        man_days: minutesToDays(organisation.value, task.estimation),
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

const refreshSchedule = () => {
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
    editable: true,
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

const onTaskDragStart = (event, task) => {
  event.stopPropagation()
  event.target.classList.add('drag')
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('taskId', task.id)
  draggedTasks.value = [task]
}

const onTaskDrag = event => {
  event.stopPropagation()
  event.target.classList.add('dragging')
}

const onTaskDragEnd = event => {
  event.target.classList.remove('drag')
  event.target.classList.remove('dragging')
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
    } catch (err) {
      console.error(err)
      person.children = person.children.filter(({ id }) => id !== task.id)
      if (refreshScheduleCallBack) {
        refreshScheduleCallBack(person)
      }
    }
    await loadUnassignedTasks()
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

const onUpdateSelectedStartDate = date => {
  startDate.value = parseSimpleDate(date)
}

const onUpdateSelectedEndDate = date => {
  endDate.value = parseSimpleDate(date)
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
  const department = route.query.department
  if (department) {
    selectedDepartment.value = department
  } else if (!isCurrentUserManager.value && user.value.departments.length) {
    // Supervisors land on their own departments (issue #1579).
    selectedDepartment.value = 'MY_DEPARTMENTS'
  }
  selectedStudio.value = route.query.studio || undefined
  selectedProduction.value = route.query.production || undefined
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
@use 'sass:color';

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
  min-width: 250px;
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
    gap: 0.5em;

    .task-item {
      position: relative;
      cursor: move;

      .ui-droppable {
        padding: 0.3em;
        border: 1px solid $light-grey;
        border-radius: 5px;
        box-shadow: 2px 2px 2px var(--box-shadow);
        background-color: var(--background);

        .production-name {
          margin-bottom: 0;
          margin-top: 0.3em;
          font-size: 0.8em;
          text-transform: uppercase;
        }

        .dark & {
          border: 1px solid var(--border);
          background-color: color.adjust(#36393f, $lightness: 5%);
        }
      }

      &:hover .ui-droppable {
        background-color: var(--background-selectable);
      }

      &.drag {
        transform: translate(0, 0); // fix dragging style

        .ui-droppable {
          background-color: var(--background-selected);
          transform: rotate(5deg) scale(0.5);
        }
      }

      &.dragging {
        cursor: grabbing;
        opacity: 0.5;

        .ui-droppable {
          transform: rotate(0);
        }
      }

      .task-thumbnail {
        margin-right: 1em;
      }

      .task-department {
        position: absolute;
        top: 5px;
        right: 0.5em;
      }
    }
  }
}
</style>
