<template>
  <div class="task-type columns fixed-page">
    <div class="column main-column">
      <div class="task-type page">
        <div class="task-type-header page-header flexrow-item">
          <div class="flexcolumn-item flexrow">
            <router-link class="back-link flexrow-item" :to="backPath">
              <corner-left-up-icon />
            </router-link>
            <div class="flexrow-item"></div>
            <task-type-name
              class="flexrow-item"
              style="font-size: 1.2em"
              :task-type="currentTaskType"
            />
            <div class="filler"></div>
            <combobox-display-options
              class="flexrow-item"
              :has-linked-assets="isTVShow"
              :is-all-episodes="currentEpisode?.id === 'all'"
              :type="displayTaskType"
              v-model="displaySettings"
            />
            <div
              class="flexrow-item"
              v-if="isActiveTab('tasks') && isSupervisorInDepartment"
            >
              <button-simple
                icon="plus"
                :title="$t('productions.metadata.title')"
                @click="onAddMetadataClicked"
              />
            </div>
            <div
              class="flexrow-item"
              v-if="
                !isActiveTab('schedule') &&
                !isActiveTab('estimation') &&
                isSupervisorInDepartment
              "
            >
              <button-simple
                icon="import"
                :title="$t('main.csv.import_file')"
                @click="showImportModal"
              />
            </div>
            <div class="flexrow-item">
              <button-simple
                icon="export"
                :title="$t('main.csv.export_file')"
                @click="onExportClick"
                v-if="!isActiveTab('schedule') && !isActiveTab('estimation')"
              />
            </div>
          </div>

          <div class="tabs mt1">
            <ul>
              <li :class="{ 'is-active': isActiveTab('tasks') }">
                <router-link :to="tasksPath">
                  {{ $t('tasks.tasks') }}
                </router-link>
              </li>
              <li :class="{ 'is-active': isActiveTab('schedule') }">
                <router-link :to="schedulePath">
                  {{ $t('schedule.title') }}
                </router-link>
              </li>
              <li :class="{ 'is-active': isActiveTab('estimation') }">
                <router-link :to="estimationPath">
                  {{ $t('estimation.title') }}
                </router-link>
              </li>
            </ul>
          </div>

          <div class="flexcolumn-item flexrow align-end mb1">
            <div class="flexrow-item search-options">
              <search-field
                ref="task-search-field"
                :can-save="true"
                :focus-options="{ preventScroll: true }"
                @change="onSearchChange"
                @save="saveSearchQuery"
                placeholder="ex: retake chara"
              />
            </div>
            <div
              class="flexrow-item flexrow align-end"
              v-if="isActiveTab('tasks')"
            >
              <combobox-status
                class="flexrow-item selector"
                :label="$t('news.task_status')"
                :task-status-list="taskStatusList"
                :with-margin="false"
                v-model="taskStatusIdFilter"
              />
              <combobox-styled
                class="flexrow-item"
                :label="$t('tasks.fields.difficulty')"
                :options="difficultyOptions"
                locale-key-prefix="tasks."
                v-model="difficultyFilter"
              />
              <combobox-styled
                class="flexrow-item"
                :label="$t('tasks.due_date')"
                :options="dueDateOptions"
                locale-key-prefix="tasks."
                v-model="dueDateFilter"
              />
              <combobox-styled
                class="flexrow-item"
                :label="$t('tasks.late')"
                :options="estimationOptions"
                locale-key-prefix="tasks."
                v-model="estimationFilter"
              />
              <combobox-styled
                class="flexrow-item"
                :label="$t('task_types.fields.priority')"
                :options="priorityOptions"
                locale-key-prefix="tasks."
                v-model="priorityFilter"
              />
              <combobox-styled
                class="flexrow-item"
                :label="$t('tasks.fields.retake_count')"
                :options="retakeCountOptions"
                locale-key-prefix="tasks."
                v-model="retakeCountFilter"
              />
            </div>

            <div
              class="flexrow-item flexrow align-end"
              v-if="
                isActiveTab('schedule') ||
                (isActiveTab('tasks') && isScheduleVisible)
              "
            >
              <div flexrow-item>
                <label class="label" v-if="isActiveTab('tasks')">
                  {{ $t('schedule.title') }}
                </label>
                <combobox-options
                  class="display-options"
                  :options="dataDisplayOptions"
                  :title="$t('tasks.data_display')"
                  v-model="dataDisplay"
                  @change="onDataDisplayChange"
                />
              </div>
              <div
                class="flexrow-item flexrow ml1"
                v-if="dataDisplay.beforeAfterTasks"
              >
                <combobox-task-type
                  class="flexrow-item"
                  :disabled="taskTypeListBeforeFilter.length < 2"
                  :label="$t('tasks.fields.tasks_before')"
                  :task-type-list="taskTypeListBeforeFilter"
                  :with-margin="false"
                  v-model="schedule.taskTypeBefore"
                  @change="resetScheduleItems()"
                />
                <combobox-task-type
                  class="flexrow-item"
                  :disabled="taskTypeListAfterFilter.length < 2"
                  :label="$t('tasks.fields.tasks_after')"
                  :task-type-list="taskTypeListAfterFilter"
                  :with-margin="false"
                  v-model="schedule.taskTypeAfter"
                  @change="resetScheduleItems()"
                />
              </div>
            </div>

            <div class="filler"></div>
            <button-simple
              :active="isScheduleVisible"
              class="flexrow-item"
              icon="calendar"
              is-medium
              :text="$t('schedule.title')"
              @click="toggleSchedule()"
              v-if="isActiveTab('tasks') && !displaySettings.contactSheetMode"
            />
            <div class="flexrow-item" v-if="isActiveTab('tasks')">
              <combobox-styled
                :label="$t('main.sorted_by')"
                open-left
                :options="sortOptions"
                locale-key-prefix="tasks.fields."
                v-model="currentSort"
              />
            </div>

            <div
              class="flexrow-item"
              v-if="isActiveTab('schedule') && isCurrentUserManager"
            >
              <date-field
                class="flexrow-item"
                :can-delete="false"
                :min-date="disabledDates.to"
                :max-date="disabledDates.from"
                :label="$t('main.start_date')"
                utc
                week-days-disabled
                :with-margin="false"
                v-model="schedule.taskTypeStartDate"
              />
            </div>
            <div
              class="flexrow-item"
              v-if="isActiveTab('schedule') && isCurrentUserManager"
            >
              <date-field
                class="flexrow-item"
                :can-delete="false"
                :min-date="disabledDates.to"
                :max-date="disabledDates.from"
                :label="$t('main.end_date')"
                utc
                week-days-disabled
                :with-margin="false"
                v-model="schedule.taskTypeEndDate"
              />
            </div>

            <div
              class="flexrow-item color-option"
              v-if="isActiveTab('schedule')"
            >
              <combobox-styled
                class="flexrow-item"
                :label="$t('tasks.colors.title')"
                :options="schedule.colorOptions"
                locale-key-prefix="tasks.colors."
                no-field
                v-model="schedule.currentColor"
              />
            </div>
            <div class="flexrow-item zoom-level" v-if="isActiveTab('schedule')">
              <combobox-number
                class="mt0 nowrap"
                :label="$t('schedule.zoom_level')"
                :options="zoomOptions"
                no-field
                v-model="schedule.zoomLevel"
                v-if="isActiveTab('schedule')"
              />
            </div>
          </div>
        </div>
        <div
          class="query-list"
          v-if="!loading.entities && searchQueries.length"
        >
          <search-query-list
            :queries="searchQueries"
            type="taskType"
            @remove-search="removeSearchQuery"
          />
        </div>

        <task-list
          ref="task-list"
          :disabled-dates="disabledDates"
          :entity-type="entityType"
          :is-contact-sheet="displaySettings.contactSheetMode"
          :is-error="errors.entities"
          :is-grouped="currentSort === 'entity_name'"
          :is-loading="loading.entities"
          :metadata-descriptors="taskMetadataDescriptors"
          :tasks="tasks"
          :with-schedule="isScheduleVisible"
          @delete-metadata="onDeleteMetadataClicked"
          @edit-metadata="onEditMetadataClicked"
          @sort-metadata="onSortByMetadata"
          @task-selected="updateTaskInQuery"
          @scroll="onTaskListScroll"
          v-if="isActiveTab('tasks')"
        >
          <schedule
            ref="schedule-widget"
            class="task-schedule"
            :start-date="productionStartDate"
            :end-date="productionEndDate"
            :sub-start-date="taskTypeStartDate"
            :sub-end-date="taskTypeEndDate"
            hide-entities
            hide-root
            :hierarchy="schedule.scheduleItems"
            :zoom-level="schedule.zoomLevel"
            :is-loading="loading.entities"
            invert-lines-color
            is-estimation-linked
            :with-estimations="dataDisplay.estimations"
            :with-ghosts="dataDisplay.beforeAfterTasks"
            :with-statuses="dataDisplay.statuses"
            :with-timesheets="dataDisplay.timesheets"
            @item-changed="saveTaskScheduleItem"
            @root-element-expanded="expandPersonElement"
            @estimation-changed="updateEstimation"
            @scroll="onScheduleScroll"
            v-if="isScheduleVisible && !displaySettings.contactSheetMode"
          />
        </task-list>

        <div
          class="task-type-schedule flexrow-item"
          v-if="isActiveTab('schedule')"
        >
          <schedule
            ref="schedule-widget"
            :start-date="productionStartDate"
            :end-date="productionEndDate"
            :sub-start-date="taskTypeStartDate"
            :sub-end-date="taskTypeEndDate"
            :hierarchy="schedule.scheduleItems"
            :zoom-level="schedule.zoomLevel"
            :is-loading="loading.entities"
            :is-estimation-linked="true"
            :with-estimations="dataDisplay.estimations"
            :with-ghosts="dataDisplay.beforeAfterTasks"
            :with-statuses="dataDisplay.statuses"
            :with-timesheets="dataDisplay.timesheets"
            @item-changed="saveTaskScheduleItem"
            @root-element-expanded="expandPersonElement"
            @estimation-changed="updateEstimation"
          />

          <task-list-numbers
            :is-shots="entityType === 'Shot'"
            :tasks="tasks"
            v-if="!loading.entities"
          />
        </div>

        <div
          class="task-type-estimation flexrow-item"
          v-if="isActiveTab('estimation')"
        >
          <estimation-helper
            :entity-type="entityType"
            :tasks="tasks"
            @estimation-changed="updateEstimation"
          />
        </div>

        <import-render-modal
          :active="modals.isImportRenderDisplayed"
          :is-loading="loading.importing"
          :is-error="errors.importing"
          :import-error="errors.importingError"
          :parsed-csv="parsedCSV"
          :form-data="importCsvFormData"
          :columns="[...dataMatchers, ...optionalColumns]"
          :data-matchers="dataMatchers"
          :database="{}"
          :disable-update="true"
          @reupload="resetImport"
          @cancel="hideImportRenderModal"
          @confirm="uploadImportFile"
        />

        <import-modal
          ref="import-modal"
          :active="modals.importing"
          :is-loading="loading.importing"
          :is-error="errors.importing"
          :form-data="importCsvFormData"
          :columns="dataMatchers"
          :optional-columns="optionalColumns"
          @cancel="hideImportModal"
          @confirm="renderImport"
        />

        <add-metadata-modal
          :active="modals.isAddMetadataDisplayed"
          :is-loading="loading.addMetadata"
          :is-error="errors.addMetadata"
          :descriptor-to-edit="descriptorToEdit"
          entity-type="Task"
          @confirm="confirmAddMetadata"
          @cancel="modals.isAddMetadataDisplayed = false"
        />

        <delete-modal
          :active="modals.isDeleteMetadataDisplayed"
          :is-loading="loading.deleteMetadata"
          :is-error="errors.deleteMetadata"
          :text="$t('productions.metadata.delete_task_text')"
          :error-text="$t('productions.metadata.delete_error')"
          @confirm="confirmDeleteMetadata"
          @cancel="modals.isDeleteMetadataDisplayed = false"
        />
      </div>
    </div>

    <div class="column side-column" v-if="nbSelectedTasks >= 1">
      <task-info :task="selectedTasks.values().next().value" with-actions />
    </div>
  </div>
</template>

<script setup>
// Imports
import { useHead } from '@unhead/vue'
import { CornerLeftUpIcon } from 'lucide-vue-next'
import moment from 'moment'
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

import { getEntityMap } from '@/composables/entity'
import csv from '@/lib/csv'
import { isSupervisorInDepartments } from '@/lib/descriptors'
import func from '@/lib/func'
import {
  applyFilters,
  getDescFilters,
  getExcludingKeyWords,
  getKeyWords,
  getTaskFilters
} from '@/lib/filtering'
import { buildSupervisorTaskIndex, indexSearch } from '@/lib/indexing'
import { getPersonPath } from '@/lib/path'
import preferences from '@/lib/preferences'
import { sortByMetadata, sortByName, sortPeople } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import {
  addBusinessDays,
  daysToMinutes,
  formatSimpleDate,
  getDatesFromStartDate,
  minutesToDays,
  parseDate
} from '@/lib/time'
import taskStatusStore from '@/store/modules/taskstatus.js'
import taskTypeStore from '@/store/modules/tasktypes.js'

import TaskList from '@/components/lists/TaskList.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import EstimationHelper from '@/components/pages/tasktype/EstimationHelper.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDisplayOptions from '@/components/widgets/ComboboxDisplayOptions.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import DateField from '@/components/widgets/DateField.vue'
// eslint-disable-next-line no-unused-vars
import Schedule from '@/components/widgets/Schedule.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import TaskListNumbers from '@/components/widgets/TaskListNumbers.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const dueIn = (offset, unit, period) => tasks => {
  const target = moment().add(offset, unit)[period]()
  return tasks.filter(t => parseDate(t.due_date)[period]() === target)
}

const filters = {
  all: tasks => tasks,
  dueweek: dueIn(0, 'days', 'isoWeek'),
  duepreviousweek: dueIn(-7, 'days', 'isoWeek'),
  duenextweek: dueIn(7, 'days', 'isoWeek'),
  duemonth: dueIn(0, 'months', 'month'),
  duepreviousmonth: dueIn(-1, 'months', 'month'),
  duenextmonth: dueIn(1, 'months', 'month'),

  duebeforetoday: tasks => {
    const today = moment()
    return tasks.filter(t => parseDate(t.due_date).isBefore(today))
  },

  dueaftertoday: tasks => {
    const today = moment()
    return tasks.filter(t => parseDate(t.due_date).isAfter(today))
  },

  overestimation: tasks =>
    tasks.filter(t => t.estimation && t.duration > t.estimation),

  approvallate: (tasks, taskStatusMap) => {
    const today = moment()
    return tasks.filter(t => {
      const status = taskStatusMap.get(t.task_status_id)
      return (
        parseDate(t.due_date).isBefore(today) &&
        !(status.is_feedback_request || status.is_done)
      )
    })
  },

  donelate: (tasks, taskStatusMap) => {
    const today = moment()
    return tasks.filter(
      t =>
        parseDate(t.due_date).isBefore(today) &&
        !taskStatusMap.get(t.task_status_id).is_done
    )
  }
}

// Composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

const instance = getCurrentInstance()
const socket = instance.appContext.config.globalProperties.$socket

// State
const activeTab = ref('tasks')
const currentScheduleItem = ref(null)
const currentSort = ref('entity_name')
const daysOffByPerson = ref({})
// not refs: only read inside the schedule data loads, never rendered
let daysOffRangeKey = null
let timeSpentsRangeKey = null
let timeSpentsCache = {}
const timesheetByPerson = ref({})
const displaySettings = ref({
  contactSheetMode: false,
  showLinkedAssets: true
})
const dataDisplay = ref({
  estimations: true,
  statuses: true,
  timesheets: false,
  beforeAfterTasks: false
})
const descriptorIdToDelete = ref(null)
const descriptorToEdit = ref({})
const difficultyFilter = ref('-1')
const dueDateFilter = ref('all')
const entityType = ref('Asset')
const estimationFilter = ref('all')
const importCsvFormData = ref({})
const isScheduleVisible = ref(false)
const parsedCSV = ref([])
const priorityFilter = ref('-1')
const retakeCountFilter = ref('all')
const tasks = ref([])
const taskStatusIdFilter = ref(null)

// Search index for the supervisor filters, non-reactive by design
let taskIndex = null

const dataMatchers = ['Parent', 'Entity']
const difficultyOptions = [
  { label: 'all_tasks', value: '-1' },
  { label: 'difficulty.very_easy', value: '1' },
  { label: 'difficulty.easy', value: '2' },
  { label: 'difficulty.medium', value: '3' },
  { label: 'difficulty.hard', value: '4' },
  { label: 'difficulty.very_hard', value: '5' }
]
const dueDateOptions = [
  { label: 'all_tasks', value: 'all' },
  { label: 'due_this_week', value: 'dueweek' },
  { label: 'due_previous_week', value: 'duepreviousweek' },
  { label: 'due_next_week', value: 'duenextweek' },
  { label: 'due_this_month', value: 'duemonth' },
  { label: 'due_previous_month', value: 'duepreviousmonth' },
  { label: 'due_next_month', value: 'duenextmonth' },
  { label: 'due_before_today', value: 'duebeforetoday' },
  { label: 'due_after_today', value: 'dueaftertoday' }
]
const estimationOptions = [
  { label: 'all_tasks', value: 'all' },
  { label: 'estimation_over', value: 'overestimation' },
  { label: 'estimation_approval_late', value: 'approvallate' },
  { label: 'estimation_done_late', value: 'donelate' }
]
const priorityOptions = [
  { label: 'all_tasks', value: '-1' },
  { label: 'priority.normal', value: '0' },
  { label: 'priority.high', value: '1' },
  { label: 'priority.very_high', value: '2' },
  { label: 'priority.emergency', value: '3' }
]
const retakeCountOptions = [
  { label: 'all_tasks', value: 'all' },
  { label: 'retake_filter_none', value: 'none' },
  { label: 'retake_filter_with_retakes', value: 'with_retakes' }
]
const METADATA_SORT_PREFIX = 'metadata.'
const staticSortOptions = [
  'entity_name',
  'task_status_short_name',
  'priority',
  'nb_frames',
  'difficulty',
  'estimation',
  'duration',
  'retake_count',
  'start_date',
  'due_date',
  'real_start_date',
  'end_date',
  'last_comment_date'
].map(name => ({ label: name, value: name }))

const errors = reactive({
  addMetadata: false,
  deleteMetadata: false,
  entities: false,
  importing: false,
  importingError: null
})

const loading = reactive({
  addMetadata: false,
  deleteMetadata: false,
  entities: false,
  importing: false,
  savingSearch: false
})

const modals = reactive({
  isAddMetadataDisplayed: false,
  isDeleteMetadataDisplayed: false,
  isImportRenderDisplayed: false,
  importing: false
})

const schedule = reactive({
  currentColor: 'status',
  scheduleItems: [],
  taskTypeAfter: null,
  taskTypeBefore: null,
  taskTypeEndDate: null,
  taskTypeStartDate: null,
  zoomLevel: 1,
  colorOptions: [
    { label: 'Neutral', value: 'neutral' },
    { label: 'Status', value: 'status' },
    { label: 'Late', value: 'late' }
  ]
})

const importModalRef = useTemplateRef('import-modal')
const scheduleWidgetRef = useTemplateRef('schedule-widget')
const searchFieldRef = useTemplateRef('task-search-field')
const taskListRef = useTemplateRef('task-list')

// Computed
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const currentTaskType = computed(() => store.getters.currentTaskType)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const isPaperProduction = computed(() => store.getters.isPaperProduction)
const isTVShow = computed(() => store.getters.isTVShow)
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const organisation = computed(() => store.getters.organisation)
const personMap = computed(() => store.getters.personMap)
const productionTaskStatuses = computed(
  () => store.getters.productionTaskStatuses
)
const selectedTasks = computed(() => store.getters.selectedTasks)
const taskMap = computed(() => store.getters.taskMap)
const taskSearchQueries = computed(() => store.getters.taskSearchQueries)
const user = computed(() => store.getters.user)

const taskStatusMap = computed(() => taskStatusStore.cache.taskStatusMap)
const taskTypeMap = computed(() => taskTypeStore.cache.taskTypeMap)

const entityMap = computed(() => getEntityMap(entityType.value))

const isEpisodesSection = computed(() => route.meta.section === 'episodes')

const taskStatusList = computed(() => [
  {
    id: '',
    color: '#999',
    short_name: t('news.all')
  },
  ...sortByName([...productionTaskStatuses.value])
])

const displayTaskType = computed(
  () => 'tasktype-' + entityType.value.toLowerCase()
)

const taskTypeList = computed(() => {
  const validationColumns =
    store.getters[`${entityType.value.toLowerCase()}ValidationColumns`]
  return validationColumns.map(taskTypeId => taskTypeMap.value.get(taskTypeId))
})

const taskTypeListBeforeFilter = computed(() => {
  const currentIndex = taskTypeList.value.findIndex(
    taskType => taskType.id === currentTaskType.value.id
  )
  const results = [{ id: null, name: t('tasks.fields.no_task_type') }]
  if (currentIndex !== -1) {
    results.push(...taskTypeList.value.slice(0, currentIndex).reverse())
  }
  return results
})

const taskTypeListAfterFilter = computed(() => {
  const currentIndex = taskTypeList.value.findIndex(
    taskType => taskType.id === currentTaskType.value.id
  )
  const results = [{ id: null, name: t('tasks.fields.no_task_type') }]
  if (currentIndex !== -1) {
    results.push(...taskTypeList.value.slice(currentIndex + 1))
  }
  return results
})

const currentTaskTypeBefore = computed(() =>
  taskTypeList.value.find(taskType => taskType.id === schedule.taskTypeBefore)
)

const currentTaskTypeAfter = computed(() =>
  taskTypeList.value.find(taskType => taskType.id === schedule.taskTypeAfter)
)

const taskTypeStartDate = computed(() =>
  moment(schedule.taskTypeStartDate).utc()
)

const taskTypeEndDate = computed(() => moment(schedule.taskTypeEndDate).utc())

const isSupervisorInDepartment = computed(
  () =>
    isCurrentUserManager.value ||
    isSupervisorInDepartments(
      user.value,
      isCurrentUserSupervisor.value,
      currentTaskType.value?.department_id
    )
)

const taskMetadataDescriptors = computed(() =>
  store.getters.taskMetadataDescriptors.filter(
    descriptor => descriptor.task_type_id === currentTaskType.value?.id
  )
)

// Metadata columns come right after the default sort so they stay above
// the fold of the scrollable option list.
const sortOptions = computed(() => [
  staticSortOptions[0],
  ...taskMetadataDescriptors.value.map(descriptor => ({
    label: descriptor.name,
    value: METADATA_SORT_PREFIX + descriptor.field_name,
    raw: true
  })),
  ...staticSortOptions.slice(1)
])

const optionalColumns = computed(() =>
  isPaperProduction.value
    ? ['Drawings', 'Estimation', 'Start date', 'Due date', 'Difficulty']
    : ['Estimation', 'Start date', 'Due date', 'Difficulty']
)

const productionStartDate = computed(() =>
  parseDate(currentProduction.value.start_date)
)

const productionEndDate = computed(() =>
  parseDate(currentProduction.value.end_date)
)

const disabledDates = computed(() => ({
  to: parseDate(currentProduction.value.start_date).toDate(),
  from: parseDate(currentProduction.value.end_date).toDate(),
  days: [6, 0]
}))

const title = computed(() => {
  if (currentProduction.value) {
    if (isTVShow.value && currentEpisode.value) {
      const episodeName =
        currentEpisode.value.id === 'all'
          ? t('main.all_assets')
          : currentEpisode.value.name
      return (
        `${currentProduction.value.name} / ` +
        `${episodeName} / ` +
        `${currentTaskType.value.name}`
      )
    }
    return `${currentProduction.value.name} / ${currentTaskType.value.name}`
  }
  return t('main.loading')
})

const backPath = computed(() => {
  let pathRoute
  if (isActiveTab('schedule')) {
    pathRoute = {
      name: 'schedule',
      params: {
        production_id: currentProduction.value.id
      },
      query: { search: '' }
    }
  } else {
    const pathsByEntity = {
      Shot: store.getters.shotsPath,
      Asset: store.getters.assetsPath,
      Edit: store.getters.editsPath,
      Episode: store.getters.episodesPath,
      Sequence: store.getters.sequencesPath
    }
    pathRoute = pathsByEntity[currentTaskType.value.for_entity] || {}
  }
  return {
    ...pathRoute,
    query: { search: '' }
  }
})

const tasksPath = computed(() => getRoute('task-type'))
const schedulePath = computed(() => getRoute('task-type-schedule'))
const estimationPath = computed(() => getRoute('task-type-estimation'))

const searchQueries = computed(() =>
  taskSearchQueries.value.filter(
    query => query.entity_type === entityType.value
  )
)

const team = computed(() =>
  sortPeople(
    currentProduction.value?.team
      .map(personId => personMap.value.get(personId))
      .filter(person => person && !person.is_bot) ?? []
  )
)

const dataDisplayOptions = computed(() => [
  {
    label: t('tasks.fields.estimation'),
    value: 'estimations'
  },
  {
    label: t('tasks.fields.task_status'),
    value: 'statuses'
  },
  {
    label: t('tasks.fields.timesheets'),
    value: 'timesheets'
  },
  {
    label: t('tasks.fields.before_after_tasks'),
    value: 'beforeAfterTasks'
  }
])

const zoomOptions = computed(() => [
  { label: t('main.week'), value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 }
])

// Functions
const initData = force => {
  resetTasks()
  focusSearchField({ preventScroll: true })
  if (tasks.value.length < 2) {
    loading.entities = true
    errors.entities = false
    store
      .dispatch('initTaskType', force)
      .then(setCurrentScheduleItem)
      .then(() => {
        loading.entities = false
        resetTasks()
        focusSearchField({ preventScroll: true })
        applySearchAndScheduleState()
        setTimeout(() => {
          setSearchFromUrl()
          resetTaskTypeDates()
        }, 200)

        dueDateFilter.value = route.query.duedate || 'all'
        estimationFilter.value = route.query.late || 'all'
        priorityFilter.value = route.query.priority || '-1'
        difficultyFilter.value = route.query.difficulty || '-1'
        retakeCountFilter.value = route.query.retake_count || 'all'
        taskStatusIdFilter.value = route.query.task_status_id || ''

        const taskId = route.query.task_id
        const task = taskMap.value.get(taskId)
        if (task) {
          const index = tasks.value.findIndex(t => t.id === taskId)
          nextTick(() => {
            taskListRef.value?.selectTask({}, index, task)
          })
        }
      })
      .catch(err => {
        console.error(err)
        loading.entities = false
        errors.entities = true
      })
  } else {
    loading.entities = true
    setCurrentScheduleItem().then(() => {
      resetTaskTypeDates()
      loading.entities = false
      applySearchAndScheduleState()
    })
  }
}

const applySearchAndScheduleState = () => {
  const searchQuery = route.query.search || searchFieldRef.value?.getValue()
  if (searchQuery) onSearchChange(searchQuery)
  if (dataDisplay.value.beforeAfterTasks) {
    setDefaultBeforeAfterTaskTypes()
  }
  resetScheduleItems(true)
}

const setCurrentScheduleItem = () => {
  const episodeId = currentEpisode.value?.id
  if (isTVShow.value && episodeId && !['all', 'main'].includes(episodeId)) {
    return store
      .dispatch('loadEpisodeScheduleItems', {
        production: currentProduction.value,
        taskType: currentTaskType.value
      })
      .then(items => {
        currentScheduleItem.value = items.find(
          item =>
            item.task_type_id === currentTaskType.value.id &&
            item.object_id === episodeId
        )
        return currentScheduleItem.value
      })
  }
  return store
    .dispatch('loadScheduleItems', currentProduction.value)
    .then(items => {
      currentScheduleItem.value = items.find(
        item => item.task_type_id === currentTaskType.value.id
      )
      return currentScheduleItem.value
    })
}

// Tabs

const isActiveTab = tab => activeTab.value === tab

const updateActiveTab = () => {
  if (route.path.indexOf('schedule') > 0) {
    activeTab.value = 'schedule'
  } else if (route.path.indexOf('estimation') > 0) {
    activeTab.value = 'estimation'
  } else {
    activeTab.value = 'tasks'
  }
}

const getRoute = section => {
  const routeTaskTypeId = route.params.task_type_id
  const taskTypeId = currentTaskType.value
    ? currentTaskType.value.id
    : routeTaskTypeId
  const sectionRoute = {
    name: section,
    params: {
      production_id: currentProduction.value.id,
      task_type_id: taskTypeId
    }
  }
  if (currentTaskType.value.for_entity === 'Episode') {
    sectionRoute.name = `episodes-${sectionRoute.name}`
  } else if (isTVShow.value && currentEpisode.value) {
    sectionRoute.name = `episode-${sectionRoute.name}`
    sectionRoute.params.episode_id = currentEpisode.value.id
  }

  return sectionRoute
}

// Search

const focusSearchField = options => {
  searchFieldRef.value?.focus(options)
}

const setSearchFromUrl = () => {
  const searchQuery = searchFieldRef.value?.getValue()
  const searchFromUrl = route.query.search
  if (!searchQuery && searchFromUrl) {
    searchFieldRef.value?.setValue(searchFromUrl)
  }
}

const setSearchInUrl = query => {
  const searchQuery = query || searchFieldRef.value?.getValue()
  router.push({
    query: {
      ...route.query,
      search: searchQuery || undefined
    }
  })
}

const onSearchChange = query => {
  if (query && query.length !== 1) {
    query = query.toLowerCase().trim()
    const descriptors = (currentProduction.value.descriptors || []).filter(
      d =>
        d.entity_type === entityType.value ||
        (d.entity_type === 'Task' &&
          d.task_type_id === currentTaskType.value.id)
    )
    const keywords = getKeyWords(query) || []
    const excludingKeyWords = getExcludingKeyWords(query) || []
    const descFilters = getDescFilters(descriptors, [], query)
    const taskFilters = getTaskFilters(taskIndex, query)
    if (
      keywords.length > 0 ||
      excludingKeyWords.length > 0 ||
      descFilters.length > 0 ||
      taskFilters.length > 0
    ) {
      let filteredTasks
      const searchFilters = taskFilters.concat(descFilters)
      if (keywords.length > 0) {
        filteredTasks = indexSearch(taskIndex, keywords)
      } else {
        resetTasks()
        filteredTasks = tasks.value
      }
      filteredTasks = applyFilters(filteredTasks, searchFilters, taskMap.value)
      tasks.value = sortTasks(filteredTasks)
    } else {
      resetTasks()
    }
  } else {
    resetTasks()
  }

  resetScheduleItems()
  setSearchInUrl()
  store.dispatch('clearSelectedTasks')

  if (filters[dueDateFilter.value]) {
    tasks.value = filters[dueDateFilter.value](tasks.value)
  }
  if (filters[estimationFilter.value]) {
    tasks.value = filters[estimationFilter.value](
      tasks.value,
      taskStatusMap.value
    )
  }
  if (priorityFilter.value !== '-1') {
    tasks.value = tasks.value.filter(
      t => t.priority === parseInt(priorityFilter.value)
    )
  }
  if (difficultyFilter.value !== '-1') {
    tasks.value = tasks.value.filter(
      t => t.difficulty === parseInt(difficultyFilter.value)
    )
  }
  if (retakeCountFilter.value === 'none') {
    tasks.value = tasks.value.filter(t => !(t.retake_count > 0))
  } else if (retakeCountFilter.value === 'with_retakes') {
    tasks.value = tasks.value.filter(t => t.retake_count > 0)
  }
  if (taskStatusIdFilter.value !== null && taskStatusIdFilter.value !== '') {
    tasks.value = tasks.value.filter(
      t => t.task_status_id === taskStatusIdFilter.value
    )
  }
}

const saveSearchQuery = searchQuery => {
  if (loading.savingSearch) {
    return
  }
  loading.savingSearch = true
  store
    .dispatch('saveTaskSearch', { searchQuery, entityType: entityType.value })
    .catch(console.error)
    .finally(() => {
      loading.savingSearch = false
    })
}

const removeSearchQuery = searchQuery => {
  store.dispatch('removeTaskSearch', searchQuery).catch(console.error)
}

const updateUrlParams = () => {
  const retakeCount = retakeCountFilter.value
  router.push({
    query: {
      search: searchFieldRef.value.getValue(),
      duedate: dueDateFilter.value,
      late: estimationFilter.value,
      priority: priorityFilter.value,
      difficulty: difficultyFilter.value,
      retake_count: retakeCount === 'all' ? undefined : retakeCount,
      task_status_id: taskStatusIdFilter.value || null
    }
  })
}

// Tasks

// onSearchChange leaves tasks sorted on every path, no extra sort needed.
const applyTaskFilters = () => {
  onSearchChange(searchFieldRef.value.getValue())
  taskListRef.value?.resetSelection()
  updateUrlParams()
  store.dispatch('clearSelectedTasks')
}

const onTaskListScroll = ({ top }) => {
  scheduleWidgetRef.value?.setScrollPosition(top)
}

const onScheduleScroll = ({ top }) => {
  taskListRef.value?.setScrollPosition(top)
}

const toggleSchedule = () => {
  isScheduleVisible.value = !isScheduleVisible.value
  resetScheduleItems(true)
}

const updateTaskInQuery = () => {
  if (nbSelectedTasks.value === 1) {
    const selectedTaskIds = Array.from(selectedTasks.value.keys())
    router.push({
      query: {
        ...route.query,
        task_id: selectedTaskIds[0]
      }
    })
  } else {
    router.push({
      query: {
        ...route.query,
        task_id: undefined
      }
    })
  }
}

// Read at call time, not through a computed: the entity caches are
// non-reactive Maps that start empty on a hard refresh, so a computed
// evaluated before they fill never reads an invalidating dependency
// and latches the empty result forever.
const getEntityTasks = () => getTasks(Array.from(entityMap.value.values()))

const resetTasks = () => {
  const entityTasks = getEntityTasks()
  tasks.value = sortTasks(entityTasks)
  resetTaskIndex(entityTasks)
}

const resetTaskIndex = (entityTasks = getEntityTasks()) => {
  taskIndex = buildSupervisorTaskIndex(
    entityTasks,
    personMap.value,
    taskStatusMap.value
  )
  taskIndex.me = indexSearch(taskIndex, user.value.full_name.split(' '))
}

const getTasks = entities => {
  const result = []
  entities.forEach(entity => {
    if (
      entity.canceled ||
      // Episodes carry their cancellation in status, not in the
      // entity-level canceled boolean.
      entity.status === 'canceled' ||
      !entity.tasks?.length ||
      (isTVShow.value &&
        !displaySettings.value.showLinkedAssets &&
        !isEpisodesSection.value &&
        !['all', entity.episode_id || 'main'].includes(
          currentEpisode.value?.id
        ))
    ) {
      return
    }
    entity.tasks.forEach(taskId => {
      const task = taskMap.value.get(taskId.id || taskId)
      if (task) {
        // Hack to allow filtering on linked entity metadata. Guarded so
        // the repeated resets do not commit the same reference again.
        if (task.data !== entity.data) {
          store.commit('SET_TASK_EXTRA_DATA', {
            task,
            data: entity.data
          })
        }
        if (task.task_type_id === currentTaskType.value.id) {
          result.push(task)
        }
      }
    })
  })
  return result
}

const sortTasks = (list = tasks.value) => {
  if (currentSort.value.startsWith(METADATA_SORT_PREFIX)) {
    const fieldName = currentSort.value.slice(METADATA_SORT_PREFIX.length)
    const descriptor = taskMetadataDescriptors.value.find(
      d => d.field_name === fieldName
    )
    return list.sort(
      firstBy(
        sortByMetadata({
          column: fieldName,
          data_type: descriptor?.data_type
        })
      ).thenBy('entity_name')
    )
  }
  if (currentSort.value === 'nb_frames') {
    return list.sort((ta, tb) => {
      const nbFramesA = getEntity(ta.entity.id)?.nb_frames || 0
      const nbFramesB = getEntity(tb.entity.id)?.nb_frames || 0
      return nbFramesB - nbFramesA
    })
  }
  const isDesc = ['task_status_short_name', 'entity_name', 'due_date'].includes(
    currentSort.value
  )
  return list.sort(
    firstBy(currentSort.value, isDesc ? 1 : -1).thenBy('entity_name')
  )
}

const getEntity = entityId => entityMap.value.get(entityId) || {}

const onExportClick = () => {
  const taskLines = taskListRef.value.getTableData()
  const nameData = [
    formatSimpleDate(moment()),
    currentProduction.value.name,
    currentTaskType.value.name,
    'tasks'
  ]
  if (currentEpisode.value) {
    nameData.splice(1, 0, currentEpisode.value.name)
  }
  const name = stringHelpers.slugify(nameData.join('_'))
  csv.buildCsvFile(name, taskLines)
}

const updateEstimation = ({ taskId, days, item, daysOff }) => {
  const estimation = daysToMinutes(organisation.value, days)
  const task = taskMap.value.get(taskId)
  let data = { estimation }
  if (task.start_date) {
    const startDate = parseDate(task.start_date)
    const dueDate = task.due_date ? parseDate(task.due_date) : null
    data = {
      ...data,
      ...getDatesFromStartDate(
        organisation.value,
        startDate,
        dueDate,
        minutesToDays(organisation.value, estimation),
        daysOff
      )
    }
    if (item) {
      item.startDate = parseDate(data.start_date)
      item.endDate = parseDate(data.due_date)

      if (item.startDate && item.endDate) {
        item.parentElement.startDate = getMinDate(item.parentElement)
        item.parentElement.endDate = getMaxDate(item.parentElement)
      }
    }
  }
  store.dispatch('updateTask', { taskId, data }).catch(console.error)
}

// Schedule

const onDataDisplayChange = item => {
  if (item.key === 'timesheets' && item.value) {
    resetScheduleItems()
    return
  }

  if (item.key === 'beforeAfterTasks' && item.value) {
    setDefaultBeforeAfterTaskTypes()
    resetScheduleItems()
  }
}

const setDefaultBeforeAfterTaskTypes = () => {
  if (!schedule.taskTypeBefore) {
    schedule.taskTypeBefore = taskTypeListBeforeFilter.value[1]?.id
  }
  if (!schedule.taskTypeAfter) {
    schedule.taskTypeAfter = taskTypeListAfterFilter.value[1]?.id
  }
}

const resetScheduleItems = async (resetScroll = false) => {
  if (isActiveTab('schedule')) {
    await resetScheduleItemsForScheduleTab()
  } else if (isActiveTab('tasks') && isScheduleVisible.value) {
    await resetScheduleItemsForTasksTab()
  }
  if (resetScroll) {
    resetScheduleScroll()
  }
}

// Shared prelude of the two schedule rebuilds: assignation map plus the
// days-off and timesheet loads (independent requests, run in parallel).
const prepareScheduleData = async () => {
  const taskAssignationMap = buildAssignationMap()
  const startDate = currentScheduleItem.value.start_date
  const endDate = currentScheduleItem.value.end_date

  // every task:update socket event rebuilds the schedule, so the days off
  // fetch is cached per range to avoid one HTTP call per event
  const daysOffKey = `${currentProduction.value.id}_${startDate}_${endDate}`
  const daysOffPromise =
    daysOffKey === daysOffRangeKey
      ? Promise.resolve(daysOffByPerson.value)
      : store.dispatch('loadProductionDaysOff', { startDate, endDate }).catch(
          () => ({}) // fallback if not allowed to fetch days off
        )

  if (dataDisplay.value.timesheets) {
    const assignees = Object.keys(taskAssignationMap).filter(
      id => id !== 'unassigned' && taskAssignationMap[id].length > 0
    )
    const [daysOff, timesheets] = await Promise.all([
      daysOffPromise,
      loadTimesheets(assignees, startDate, endDate)
    ])
    daysOffByPerson.value = daysOff
    timesheetByPerson.value = timesheets
  } else {
    daysOffByPerson.value = await daysOffPromise
  }
  daysOffRangeKey = daysOffKey

  return taskAssignationMap
}

const resetScheduleItemsForScheduleTab = async () => {
  if (!currentScheduleItem.value) return

  const taskAssignationMap = await prepareScheduleData()

  const scheduleItems = team.value
    .map(person =>
      buildPersonElement(
        person,
        taskAssignationMap,
        dataDisplay.value.beforeAfterTasks
      )
    )
    .filter(item => item?.children.length > 0)

  if (taskAssignationMap.unassigned.length > 0) {
    scheduleItems.push(
      buildPersonElement(
        { id: 'unassigned' },
        taskAssignationMap,
        dataDisplay.value.beforeAfterTasks
      )
    )
  }
  schedule.scheduleItems = scheduleItems
}

const resetScheduleItemsForTasksTab = async () => {
  if (!currentScheduleItem.value) return

  await prepareScheduleData()

  const scheduleItems = [
    {
      id: '',
      color: 'transparent',
      children: [],
      timesheet: [],
      expanded: true
    }
  ]
  tasks.value.forEach(task => {
    const person = personMap.value.get(task.assignees[0]) || {
      id: 'unassigned'
    }
    const taskAssignationMap = { [person.id]: [task] }
    const scheduleItem = buildPersonElement(
      person,
      taskAssignationMap,
      dataDisplay.value.beforeAfterTasks
    )
    scheduleItems[0].startDate = scheduleItem.startDate
    scheduleItems[0].endDate = scheduleItem.endDate
    scheduleItems[0].children.push(...scheduleItem.children)
    scheduleItems[0].timesheet.push(...scheduleItem.timesheet)
  })

  schedule.scheduleItems = scheduleItems
}

const buildAssignationMap = () => {
  const taskAssignationMap = { unassigned: [] }
  team.value.forEach(person => {
    if (person) taskAssignationMap[person.id] = []
  })
  tasks.value.forEach(task => {
    if (task.assignees.length > 0) {
      task.assignees.forEach(personId => {
        if (!taskAssignationMap[personId]) {
          taskAssignationMap[personId] = []
        }
        taskAssignationMap[personId].push(task)
      })
    } else {
      taskAssignationMap.unassigned.push(task)
    }
  })
  return taskAssignationMap
}

// same trade-off as the days off cache: one fetch per range, so the
// debounced socket rebuilds stop refetching all time spents
const loadTimeSpentsForRange = async (startDate, endDate) => {
  const key = `${currentTaskType.value.id}_${startDate}_${endDate}`
  if (key !== timeSpentsRangeKey) {
    timeSpentsCache = await store
      .dispatch('loadProductionTimeSpents', {
        taskType: currentTaskType.value,
        startDate,
        endDate
      })
      .catch(
        () => ({}) // fallback if not allowed to fetch timesheets
      )
    timeSpentsRangeKey = key
  }
  return timeSpentsCache
}

const loadTimesheets = async (personIds, startDate, endDate) => {
  const timesheets = await loadTimeSpentsForRange(startDate, endDate)

  const taskById = new Map(tasks.value.map(task => [task.id, task]))
  const timesheetByPersonResult = {}
  for (const personId of personIds) {
    const timesheet =
      timesheets[personId]?.sort(firstBy('date').thenBy('task_id')) || []
    timesheet.forEach(entry => {
      entry.task = taskById.get(entry.task_id)
      entry.startDate = parseDate(entry.date)
      entry.endDate = parseDate(entry.date)
    })

    // merge consecutive timesheet entries with duration >= one organisation day
    const mergedTimesheet = []
    const oneDay = organisation.value.hours_by_day * 60
    for (const entry of timesheet) {
      const previous = mergedTimesheet.length
        ? mergedTimesheet[mergedTimesheet.length - 1]
        : null
      if (
        previous &&
        previous.task_id === entry.task_id &&
        (previous.date === entry.date ||
          (previous.duration >= oneDay &&
            entry.startDate.diff(previous.startDate, 'days') === 1))
      ) {
        // merge with previous
        mergedTimesheet[mergedTimesheet.length - 1] = {
          ...previous,
          duration: previous.duration + entry.duration,
          endDate: entry.endDate
        }
      } else {
        mergedTimesheet.push(entry)
      }
    }

    timesheetByPersonResult[personId] = mergedTimesheet
  }
  return timesheetByPersonResult
}

// Resolve a task's schedule dates: explicit dates first, then the real
// start, then an estimation-based end. Without a default start a task
// with no dates yields undefined dates (callers drop those elements).
const getTaskDates = (task, daysOff, defaultStartDate = undefined) => {
  let startDate = defaultStartDate
  if (task.start_date) {
    startDate = parseDate(task.start_date)
  } else if (task.real_start_date) {
    startDate = parseDate(task.real_start_date)
  }

  let endDate
  if (task.due_date) {
    endDate = parseDate(task.due_date)
  } else if (task.end_date) {
    endDate = parseDate(task.end_date)
  } else {
    endDate = addBusinessDays(
      startDate,
      Math.ceil(minutesToDays(organisation.value, task.estimation)) - 1,
      daysOff
    )
  }
  return { startDate, endDate }
}

const enrichSiblingElement = (element, taskType, daysOff) => {
  if (!element) return null
  const { startDate, endDate } = getTaskDates(element, daysOff)
  if (!startDate || !endDate) return null
  element.name = `[${taskType.name}] ${element.entity_name}`
  element.startDate = startDate
  element.endDate = endDate
  element.color = getTaskElementColor(element, endDate)
  return element
}

const buildPersonElement = (
  person,
  taskAssignationMap,
  withBeforeAfter = false
) => {
  if (!person) return null

  let manDays = 0
  let minStartDate
  let maxEndDate
  const personTasks = taskAssignationMap[person.id]

  let personElement
  if (person.id === 'unassigned') {
    personElement = {
      avatar: false,
      id: person.id,
      name: t('main.unassigned'),
      color: '#888',
      priority: 1,
      expanded: true,
      loading: false,
      children: [],
      editable: false,
      timesheet: []
    }
  } else {
    personElement = {
      avatar: true,
      has_avatar: person.has_avatar,
      avatarPath: person.avatarPath,
      initials: person.initials,
      id: person.id,
      name: person.full_name,
      color: person.color,
      priority: 1,
      expanded: true,
      loading: false,
      children: [],
      editable: false,
      daysOff: daysOffByPerson.value[person.id],
      timesheet: timesheetByPerson.value[person.id] ?? [],
      route: getPersonPath(person.id, 'schedule')
    }
  }

  const children = personTasks.map(task => {
    const estimation = task.estimation
    let { startDate, endDate } = getTaskDates(
      task,
      personElement.daysOff,
      moment(schedule.taskTypeStartDate)
    )

    if (startDate.isAfter(productionEndDate.value)) {
      startDate = productionEndDate.value.clone().add(-1, 'days')
    }
    if (startDate.isBefore(productionStartDate.value)) {
      startDate = productionStartDate.value.clone()
    }

    if (!endDate || endDate.isBefore(startDate)) {
      const nbDays = startDate.isoWeekday() === 5 ? 3 : 1
      endDate = startDate.clone().add(nbDays, 'days')
    }
    if (endDate.isAfter(productionEndDate.value)) {
      endDate = productionEndDate.value.clone().add(-1, 'days')
      if (startDate.isAfter(endDate)) {
        startDate = endDate.clone().add(-1, 'days')
      }
    }

    if (estimation) manDays += estimation
    if (!minStartDate || minStartDate.isAfter(startDate)) {
      minStartDate = startDate.clone()
    }
    if (!maxEndDate || maxEndDate.isBefore(endDate)) {
      maxEndDate = endDate.clone()
    }

    const data = {
      ...task,
      name: task.entity_name,
      startDate,
      endDate,
      expanded: false,
      loading: false,
      man_days: estimation,
      editable: isSupervisorInDepartment.value,
      unresizable: false,
      parentElement: personElement,
      color: getTaskElementColor(task, endDate),
      children: []
    }

    if (withBeforeAfter) {
      const entity = entityMap.value.get(task.entity_id)
      // copies: the ghost blocks below mutate name, dates and color,
      // which must not leak into the taskMap objects
      const siblingElements = entity?.tasks
        .map(taskId => taskMap.value.get(taskId))
        .filter(Boolean)

      if (schedule.taskTypeBefore) {
        const previousTask = siblingElements.find(
          item => item.task_type_id === schedule.taskTypeBefore
        )
        data.previousElement = previousTask ? { ...previousTask } : null
      }
      if (schedule.taskTypeAfter) {
        const nextTask = siblingElements.find(
          item => item.task_type_id === schedule.taskTypeAfter
        )
        data.nextElement = nextTask ? { ...nextTask } : null
      }
    }

    data.previousElement = enrichSiblingElement(
      data.previousElement,
      currentTaskTypeBefore.value,
      personElement.daysOff
    )
    data.nextElement = enrichSiblingElement(
      data.nextElement,
      currentTaskTypeAfter.value,
      personElement.daysOff
    )

    return data
  })

  return {
    ...personElement,
    children,
    startDate: minStartDate,
    endDate: maxEndDate,
    man_days: manDays
  }
}

const getTaskElementColor = (task, endDate) => {
  if (schedule.currentColor === 'status') {
    let color = taskStatusMap.value.get(task.task_status_id).color
    if (color === '#f5f5f5') color = '#999'
    return color
  } else if (schedule.currentColor === 'late') {
    const isLate =
      !taskStatusMap.value.get(task.task_status_id).is_done &&
      endDate.isBefore(moment())
    return isLate ? '#FF3860' : '#999'
  }
  return null
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
    item.parentElement.startDate = getMinDate(item.parentElement)
    item.parentElement.endDate = getMaxDate(item.parentElement)
    store.dispatch('updateTask', {
      taskId: item.id,
      data: {
        estimation: item.estimation,
        start_date: item.startDate.format('YYYY-MM-DD'),
        due_date: item.endDate.format('YYYY-MM-DD')
      }
    })
  }
}

const getMinDate = personElement => {
  let minDate = productionEndDate.value.clone()
  personElement.children.forEach(item => {
    if (item.startDate && item.startDate.isBefore(minDate)) {
      minDate = item.startDate
    }
  })
  return minDate.clone()
}

const getMaxDate = personElement => {
  let maxDate = productionStartDate.value.clone()
  personElement.children.forEach(item => {
    if (item.endDate && item.endDate.isAfter(maxDate)) {
      maxDate = item.endDate
    }
  })
  return maxDate.clone()
}

const expandPersonElement = personElement => {
  personElement.expanded = !personElement.expanded
}

// Import

const onAddMetadataClicked = () => {
  descriptorToEdit.value = {}
  modals.isAddMetadataDisplayed = true
}

const onEditMetadataClicked = descriptorId => {
  descriptorToEdit.value = currentProduction.value.descriptors.find(
    descriptor => descriptor.id === descriptorId
  )
  modals.isAddMetadataDisplayed = true
}

const onDeleteMetadataClicked = descriptorId => {
  descriptorIdToDelete.value = descriptorId
  modals.isDeleteMetadataDisplayed = true
}

const onSortByMetadata = descriptorId => {
  const descriptor = taskMetadataDescriptors.value.find(
    d => d.id === descriptorId
  )
  if (descriptor) {
    currentSort.value = METADATA_SORT_PREFIX + descriptor.field_name
  }
}

const confirmAddMetadata = form => {
  loading.addMetadata = true
  errors.addMetadata = false
  store
    .dispatch('addMetadataDescriptor', {
      ...form,
      entity_type: 'Task',
      task_type_id: currentTaskType.value.id
    })
    .then(() => {
      loading.addMetadata = false
      modals.isAddMetadataDisplayed = false
    })
    .catch(err => {
      console.error(err)
      loading.addMetadata = false
      errors.addMetadata = true
    })
}

const confirmDeleteMetadata = () => {
  loading.deleteMetadata = true
  errors.deleteMetadata = false
  store
    .dispatch('deleteMetadataDescriptor', descriptorIdToDelete.value)
    .then(() => {
      loading.deleteMetadata = false
      modals.isDeleteMetadataDisplayed = false
    })
    .catch(err => {
      console.error(err)
      loading.deleteMetadata = false
      errors.deleteMetadata = true
    })
}

const showImportModal = () => {
  modals.importing = true
}

const hideImportModal = () => {
  modals.importing = false
}

const showImportRenderModal = () => {
  modals.isImportRenderDisplayed = true
}

const hideImportRenderModal = () => {
  modals.isImportRenderDisplayed = false
}

const resetImport = () => {
  errors.importing = false
  errors.importingError = null
  hideImportRenderModal()
  importCsvFormData.value = undefined
  importModalRef.value?.reset()
  showImportModal()
}

const uploadImportFile = data => {
  const formData = new FormData()
  const filename = 'import.csv'
  const csvContent = csv.turnEntriesToCsvString(data)
  const file = new File([csvContent], filename, { type: 'text/csv' })

  formData.append('file', file)

  loading.importing = true
  errors.importing = false
  errors.importingError = null
  importCsvFormData.value = formData

  store
    .dispatch('uploadTaskTypeEstimations', importCsvFormData.value)
    .then(() => {
      hideImportRenderModal()
    })
    .catch(err => {
      errors.importingError = err
      errors.importing = true
    })
    .finally(() => {
      loading.importing = false
    })
}

const renderImport = (data, mode) => {
  loading.importing = true
  errors.importing = false
  if (mode === 'file') {
    data = data.get('file')
  }
  csv
    .processCSV(data)
    .then(results => {
      parsedCSV.value = results
      hideImportModal()
      showImportRenderModal()
    })
    .catch(err => {
      console.error(err)
      errors.importing = true
    })
    .finally(() => {
      loading.importing = false
    })
}

const resetTaskTypeDates = () => {
  if (currentScheduleItem.value) {
    schedule.taskTypeStartDate = parseDate(
      currentScheduleItem.value.start_date
    ).toDate()
    schedule.taskTypeEndDate = parseDate(
      currentScheduleItem.value.end_date
    ).toDate()
  }
}

const resetScheduleScroll = () => {
  if (!scheduleWidgetRef.value) return

  const today = moment()
  if (
    today.isBefore(moment(schedule.taskTypeStartDate)) ||
    today.isAfter(moment(schedule.taskTypeEndDate))
  ) {
    const date = moment(schedule.taskTypeStartDate).add(
      isScheduleVisible.value ? 0 : 20,
      'days'
    )
    scheduleWidgetRef.value.scrollToDate(date)
  } else {
    scheduleWidgetRef.value.scrollToToday()
  }
}

// socket events arrive in bursts (imports, bulk assignments): rebuild the
// schedule once per burst instead of once per event
const resetScheduleItemsDebounced = func.debounce(resetScheduleItems, 400)

const onRemoteTaskUpdate = eventData => {
  resetScheduleItemsDebounced()
  if (
    !isActiveTab('schedule') &&
    taskMap.value.get(eventData.task_id) &&
    nbSelectedTasks.value === 0 &&
    searchFieldRef.value &&
    searchFieldRef.value.getValue() === ''
  ) {
    resetTaskIndex()
    nextTick(() => {
      onSearchChange(searchFieldRef.value.getValue())
    })
  }
}

// Equivalent of the Options API created() hook: runs during setup.
if (!currentProduction.value) {
  store.dispatch('setProduction', route.params.production_id)
} else {
  const options = { productionId: currentProduction.value.id }
  if (currentEpisode.value) options.episodeId = currentEpisode.value.id
  store.commit('RESET_PRODUCTION_PATH', options)
}

// Watchers
watch(
  () => route.fullPath,
  () => {
    updateActiveTab()
  }
)

watch(
  () => displaySettings.value.contactSheetMode,
  () => {
    isScheduleVisible.value = false
  }
)

watch(
  () => displaySettings.value.showLinkedAssets,
  () => {
    resetTasks()
  }
)

watch(
  displaySettings,
  newSettings => {
    preferences.setObjectPreference('tasktype:display_settings', newSettings)
  },
  { deep: true }
)

watch(
  dataDisplay,
  newSettings => {
    preferences.setObjectPreference('tasktype:data_display', newSettings)
  },
  { deep: true }
)

watch(
  () => route.query.search,
  () => {
    const currentSearch = searchFieldRef.value.getValue()
    const routeSearch = route.query.search
    if (routeSearch && routeSearch !== currentSearch) {
      searchFieldRef.value.setValue(routeSearch)
      onSearchChange(routeSearch)
    }
  }
)

watch(currentProduction, () => {
  initData(true)
})

watch(nbSelectedTasks, () => {
  updateTaskInQuery()
})

// Quickfix for the edge case where the backPath is not properly set
// because it was set when the episode was not fully loaded.
watch(currentEpisode, () => {
  if (currentEpisode.value && !backPath.value.params?.episode_id) {
    store.commit('RESET_PRODUCTION_PATH', {
      productionId: currentProduction.value.id,
      episodeId: currentEpisode.value.id
    })
  }
})

watch(
  [
    difficultyFilter,
    dueDateFilter,
    estimationFilter,
    priorityFilter,
    taskStatusIdFilter,
    retakeCountFilter
  ],
  () => {
    applyTaskFilters()
  }
)

watch(currentSort, () => {
  sortTasks()
  taskListRef.value.resetSelection()
  resetScheduleItems()
  store.dispatch('clearSelectedTasks')
  updateTaskInQuery()
})

watch(
  () => schedule.currentColor,
  () => {
    resetScheduleItems()
  }
)

watch(activeTab, () => {
  resetScheduleItems(true)
})

watch(currentScheduleItem, () => {
  if (currentScheduleItem.value) {
    resetTaskTypeDates()
  }
})

watch(
  [() => schedule.taskTypeStartDate, () => schedule.taskTypeEndDate],
  () => {
    if (!currentScheduleItem.value) return
    const startDate = moment(schedule.taskTypeStartDate).utc()
    const endDate = moment(schedule.taskTypeEndDate).utc()
    if (
      startDate.format('YYYY-MM-DD') !== currentScheduleItem.value.start_date ||
      endDate.format('YYYY-MM-DD') !== currentScheduleItem.value.end_date
    ) {
      store.commit('SET_SCHEDULE_ITEM_DATES', {
        scheduleItem: currentScheduleItem.value,
        dates: { startDate, endDate }
      })
      store.dispatch('saveScheduleItem', currentScheduleItem.value)
    }
  }
)

// Lifecycle
onMounted(() => {
  if (!currentTaskType.value?.id) {
    router.push({ name: 'not-found' })
    return
  }

  displaySettings.value = {
    ...displaySettings.value,
    ...preferences.getObjectPreference('tasktype:display_settings')
  }
  dataDisplay.value = {
    ...dataDisplay.value,
    ...preferences.getObjectPreference('tasktype:data_display')
  }
  searchFieldRef.value?.setValue(route.query.search || '')
  store.dispatch('clearSelectedTasks')
  const isAssets = route.path.includes('assets')
  const isShots = route.path.includes('shots')
  const isEdits = route.path.includes('edits')
  const isSequences = route.path.includes('sequences')
  entityType.value = isAssets
    ? 'Asset'
    : isShots
      ? 'Shot'
      : isEdits
        ? 'Edit'
        : isSequences
          ? 'Sequence'
          : 'Episode'
  updateActiveTab()
  setTimeout(() => {
    initData(false)
    resetScheduleScroll()
  }, 100)

  socket.on('task:update', onRemoteTaskUpdate)
})

onBeforeUnmount(() => {
  store.dispatch('clearSelectedTasks')
  socket.off('task:update', onRemoteTaskUpdate)
})

// Head
useHead({ title: computed(() => `${title.value} - Kitsu`) })
</script>

<style lang="scss" scoped>
.page-header {
  margin-top: 1em;
  margin-right: 0;
}

.align-end {
  align-items: flex-end;
}

.search-options {
  width: 325px;
}

.tabs ul {
  margin-left: 0;
}

.page {
  flex: 1;
  height: 100%;
}

.back-link {
  padding-top: 5px;
  margin-right: 5px;
}

.task-type {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.columns {
  display: flex;
  flex-direction: row;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.main-column {
  overflow: hidden;
}

.field {
  margin-bottom: 0;
}

.query-list {
  margin-bottom: 0;
  margin-top: 0.5em;
}

.task-type-schedule {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.zoom-level {
  margin-bottom: 6px;
}

.task-type-estimation {
  display: flex;
  max-height: calc(100% - 200px);
}

.task-schedule {
  flex-grow: 1;
  min-width: 200px;
  height: auto;
}
</style>
