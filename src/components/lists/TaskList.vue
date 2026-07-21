<template>
  <div class="data-list">
    <table-metadata-header-menu
      ref="header-metadata-menu"
      :is-edit-allowed="isMetadataMenuEditAllowed"
      :show-stick="false"
      @edit-clicked="onEditMetadataClicked"
      @delete-clicked="onDeleteMetadataClicked"
      @sort-by-clicked="onSortByMetadataClicked"
    />
    <div
      ref="body"
      class="datatable-wrapper"
      :class="{
        'with-schedule': withSchedule
      }"
      @scroll.passive="onBodyScroll"
      v-if="!isContactSheet"
    >
      <table class="datatable">
        <thead class="datatable-head">
          <tr class="row-header">
            <th class="thumbnail"></th>
            <th class="asset-type" v-if="isAssets">
              {{ $t('tasks.fields.asset_type') }}
            </th>
            <th
              class="sequence"
              v-else-if="!isEpisodes && !isSequences && !isEdits"
            >
              {{ $t('tasks.fields.sequence') }}
            </th>
            <th class="name">
              {{ $t('tasks.fields.entity_name') }}
            </th>
            <th class="status">
              {{ $t('tasks.fields.task_status') }}
            </th>
            <th class="assignees">
              {{ $t('tasks.fields.assignees') }}
            </th>
            <th
              class="frames number-cell"
              v-if="isShots && !isPaperProduction && isColumnVisible('frames')"
            >
              {{ $t('tasks.fields.frames') }}
            </th>
            <th
              class="drawings number-cell"
              v-if="isShots && isPaperProduction"
            >
              {{ $t('tasks.fields.drawings') }}
            </th>
            <th
              class="difficulty number-cell"
              v-if="isColumnVisible('difficulty')"
            >
              {{ $t('tasks.fields.difficulty') }}
            </th>
            <th
              class="estimation number-cell"
              :title="$t('main.estimation')"
              v-if="isColumnVisible('estimation')"
            >
              {{ $t('tasks.fields.estimation').substring(0, 3) }}.
            </th>
            <th class="duration number-cell" v-if="isColumnVisible('duration')">
              {{ $t('tasks.fields.duration').substring(0, 3) }}.
            </th>
            <th
              class="retake-count number-cell"
              v-if="isColumnVisible('retakeCount')"
            >
              {{ $t('tasks.fields.retake_count') }}
            </th>
            <metadata-header
              :key="descriptor.id"
              :descriptor="descriptor"
              resizable
              :width="metadataColumnWidths[descriptor.id]"
              @resize="width => onMetadataColumnResize(descriptor.id, width)"
              @resize-end="persistMetadataColumnWidths"
              @show-metadata-header-menu="
                event => showMetadataHeaderMenu(descriptor.id, event)
              "
              v-for="descriptor in visibleMetadataDescriptors"
            />
            <th
              class="start-date"
              v-if="!withSchedule && isColumnVisible('startDate')"
            >
              {{ $t('tasks.fields.start_date') }}
            </th>
            <th
              class="due-date"
              v-if="!withSchedule && isColumnVisible('dueDate')"
            >
              {{ $t('tasks.fields.due_date') }}
            </th>
            <th
              class="real-start-date"
              v-if="!withSchedule && isColumnVisible('realStartDate')"
            >
              {{ $t('tasks.fields.real_start_date') }}
            </th>
            <th
              class="real-end-date"
              v-if="!withSchedule && isColumnVisible('realEndDate')"
            >
              {{ $t('tasks.fields.real_end_date') }}
            </th>
            <th
              class="done-date"
              v-if="!withSchedule && isColumnVisible('doneDate')"
            >
              {{ $t('tasks.fields.done_date') }}
            </th>
            <th
              class="last-comment-date"
              v-if="!withSchedule && isColumnVisible('lastCommentDate')"
            >
              {{ $t('tasks.fields.last_comment_date') }}
            </th>
            <th class="column-selector">
              <button-simple
                class="is-small"
                icon="down"
                @click="toggleColumnSelector"
              />
              <table-metadata-selector-menu
                :descriptors="metadataDescriptors"
                :exclude="{ frames: !isShots }"
                namespace="task-type"
                v-model="metadataDisplayHeaders"
                v-model:is-open="columnSelectorDisplayed"
              />
            </th>
          </tr>
        </thead>

        <tbody
          class="datatable-body"
          @mousedown="startBrowsing"
          @touchstart="startBrowsing"
        >
          <tr
            :ref="el => setTaskRow(task.id, el)"
            :key="task.id"
            :class="{
              'task-line': true,
              'datatable-row': true,
              selected: selectionGrid[task.id]
            }"
            role="button"
            tabindex="0"
            @click="selectTask($event, index, task)"
            @keydown.enter.prevent="selectTask($event, index, task)"
            v-for="(task, index) in tasks"
          >
            <td class="thumbnail flexrow">
              <entity-thumbnail
                class="flexrow-item"
                :entity="getEntity(task.entity.id)"
                :width="50"
                :height="33"
                :empty-width="50"
                :empty-height="33"
                v-if="task.entity"
              />
            </td>
            <td class="asset-type" v-if="isAssets">
              {{ getEntity(task.entity.id).asset_type_name }}
            </td>
            <td
              class="sequence"
              v-else-if="!isEpisodes && !isSequences && !isEdits"
            >
              {{ getEntity(task.entity.id).sequence_name }}
            </td>
            <td class="name">
              <div
                class="ellipsis nowrap"
                :title="getEntity(task.entity.id).name"
              >
                {{ getEntity(task.entity.id).name }}
              </div>
            </td>
            <validation-cell
              class="status unselectable"
              :task-test="task"
              :is-border="false"
              :is-assignees="false"
              :selectable="false"
              :is-static="true"
            />
            <td class="assignees">
              <div class="flexrow">
                <people-avatar-with-menu
                  class="flexrow-item"
                  :key="`${task.id}-${personId}`"
                  :person="personMap.get(personId)"
                  :size="30"
                  :font-size="16"
                  @unassign="person => onUnassign(task, person)"
                  v-for="personId in task.assignees"
                />
              </div>
            </td>
            <td
              class="frames number-cell"
              v-if="isShots && !isPaperProduction && isColumnVisible('frames')"
            >
              {{ getEntity(task.entity.id).nb_frames }}
            </td>
            <td
              class="drawings number-cell"
              v-if="isShots && isPaperProduction"
            >
              <input
                class="input"
                min="0"
                step="1"
                type="number"
                :value="task.nb_drawings"
                @change="updateNbDrawings($event.target.value)"
                v-if="isInDepartment(task) && selectionGrid[task.id]"
              />
              <template v-else>
                {{ task.nb_drawings || 0 }}
              </template>
            </td>
            <td
              class="difficulty number-cell"
              v-if="isColumnVisible('difficulty')"
            >
              <combobox
                class="difficulty-combobox"
                :options="difficultyOptions"
                :with-margin="false"
                @update:model-value="updateDifficulty($event)"
                v-if="isInDepartment(task) && selectionGrid[task.id]"
                v-model="task.difficulty"
              />
              <template v-else>
                <span
                  class="difficulty number-cell"
                  v-for="index in task.difficulty"
                  :key="`${task.id}-difficulty-${index}`"
                >
                  &bull;
                </span>
              </template>
            </td>
            <td
              class="estimation number-cell"
              v-if="isColumnVisible('estimation')"
            >
              <input
                class="input"
                min="0"
                step="any"
                type="number"
                :value="formatDuration(task.estimation, false)"
                @change="updateEstimation($event.target.value)"
                v-if="isInDepartment(task) && selectionGrid[task.id]"
              />
              <template v-else>
                {{ formatDuration(task.estimation) }}
              </template>
            </td>
            <td
              :class="{
                duration: true,
                'number-cell': true,
                error: isEstimationBurned(task)
              }"
              v-if="isColumnVisible('duration')"
            >
              {{ formatDuration(task.duration) }}
            </td>
            <td
              class="retake-count number-cell"
              v-if="isColumnVisible('retakeCount')"
            >
              <template v-for="index in task.retake_count" :key="index">
                &bull;
              </template>
            </td>
            <td
              class="metadata-descriptor"
              :key="`${task.id}-${descriptor.id}`"
              :style="
                metadataColumnWidths[descriptor.id]
                  ? {
                      width: `${metadataColumnWidths[descriptor.id]}px`,
                      minWidth: `${metadataColumnWidths[descriptor.id]}px`
                    }
                  : undefined
              "
              v-for="descriptor in visibleMetadataDescriptors"
            >
              <metadata-input
                :entity="task"
                :descriptor="descriptor"
                :selected="Boolean(selectionGrid[task.id])"
                @metadata-changed="onMetadataChanged"
              />
            </td>
            <td
              class="start-date"
              v-if="!withSchedule && isColumnVisible('startDate')"
            >
              <date-field
                class="flexrow-item"
                :with-margin="false"
                :min-date="disabledDates.to"
                :model-value="getDate(task.start_date)"
                @update:model-value="updateStartDate"
                v-if="isInDepartment(task) && selectionGrid[task.id]"
              />
              <template v-else>
                {{ formatDisplayDate(task.start_date) }}
              </template>
            </td>
            <td
              class="due-date"
              v-if="!withSchedule && isColumnVisible('dueDate')"
            >
              <date-field
                class="flexrow-item"
                :with-margin="false"
                :model-value="getDate(task.due_date)"
                :max-date="disabledDates.from"
                @update:model-value="updateDueDate"
                v-if="isInDepartment(task) && selectionGrid[task.id]"
              />
              <template v-else>
                {{ formatDisplayDate(task.due_date) }}
              </template>
            </td>
            <td
              class="real-start-date"
              v-if="!withSchedule && isColumnVisible('realStartDate')"
            >
              {{ formatDisplayDate(task.real_start_date) }}
            </td>
            <td
              class="real-end-date"
              v-if="!withSchedule && isColumnVisible('realEndDate')"
            >
              {{ formatDisplayDate(task.end_date) }}
            </td>
            <td
              class="done-date"
              v-if="!withSchedule && isColumnVisible('doneDate')"
            >
              {{ formatDisplayDate(task.done_date) }}
            </td>
            <td
              class="last-comment-date"
              v-if="!withSchedule && isColumnVisible('lastCommentDate')"
            >
              {{ formatDisplayDate(task.last_comment_date) }}
            </td>
            <td class="column-selector"></td>
          </tr>
        </tbody>
      </table>
      <table-info
        :is-loading="isLoading"
        :is-error="isError"
        :cells="9"
        :with-actions="false"
      />
    </div>
    <div class="list-wrapper" v-else>
      <div :key="`task-section-${i}`" v-for="(taskGroup, i) in cardGroups">
        <h2 v-if="taskGroup.name">
          {{ taskGroup.name }}
        </h2>
        <div class="task-grid">
          <div
            :class="{
              'task-card': true,
              selected: selectionGrid[task.id]
            }"
            :key="task.id"
            role="button"
            tabindex="0"
            @click="selectTaskFromCard($event, index, task)"
            @keydown.enter.prevent="selectTaskFromCard($event, index, task)"
            v-for="(task, index) in taskGroup.tasks"
          >
            <entity-preview
              class="flexrow-item"
              :entity="getEntity(task.entity.id)"
              :height="133"
              :width="200"
              :empty-width="200"
              :empty-height="133"
              :show-movie="false"
              is-rounded-top-border
              no-preview
              v-if="task.entity"
            />
            <span class="task-name">
              {{ getTaskName(task) }}
            </span>
            <div class="flexrow task-data">
              <validation-tag class="flexrow-item" :task="task" thin />
              <div class="filler"></div>
              <people-avatar-with-menu
                class="flexrow-item"
                :key="`${task.id}-${personId}`"
                :person="personMap.get(personId)"
                :size="20"
                :font-size="10"
                @unassign="person => onUnassign(task, person)"
                v-for="personId in task.assignees"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <slot></slot>
  </div>
  <task-list-numbers :is-shots="isShots" :tasks="tasks" v-if="!isLoading" />
</template>

<script setup>
// Imports
import moment from 'moment-timezone'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { pauseEvent } from '@/composables/dom'
import { getEntityMap } from '@/composables/entity'
import { useFormat } from '@/composables/format'
import { useGrabList } from '@/composables/grabList'
import {
  getMetadataFieldValue,
  isSupervisorInDepartments
} from '@/lib/descriptors'
import {
  daysToMinutes,
  formatSimpleDate,
  getDatesFromStartDate,
  getDatesFromEndDate,
  parseSimpleDate,
  minutesToDays,
  range
} from '@/lib/time'

import MetadataHeader from '@/components/cells/MetadataHeader.vue'
import MetadataInput from '@/components/cells/MetadataInput.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import DateField from '@/components/widgets/DateField.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PeopleAvatarWithMenu from '@/components/widgets/PeopleAvatarWithMenu.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TableMetadataHeaderMenu from '@/components/widgets/TableMetadataHeaderMenu.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'
import TaskListNumbers from '@/components/widgets/TaskListNumbers.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

// Composables
const { t } = useI18n()
const store = useStore()
const { formatDuration, formatDisplayDate, isDurationInHours, organisation } =
  useFormat()

// Props / Emits
const props = defineProps({
  disabledDates: {
    type: Object,
    default: () => {}
  },
  entityType: {
    type: String,
    default: 'Asset'
  },
  isContactSheet: {
    type: Boolean,
    default: false
  },
  isError: {
    type: Boolean,
    default: false
  },
  isGrouped: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  metadataDescriptors: {
    type: Array,
    default: () => []
  },
  tasks: {
    type: Array,
    default: () => []
  },
  withSchedule: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'delete-metadata',
  'edit-metadata',
  'scroll',
  'sort-metadata',
  'task-selected'
])

// State
const difficultyOptions = [
  { label: '•', value: 1 },
  { label: '••', value: 2 },
  { label: '•••', value: 3 },
  { label: '••••', value: 4 },
  { label: '•••••', value: 5 }
]

const lastSelection = ref(null)
const page = ref(1)
const selectionGrid = ref({})

// Column show/hide, mirroring the assets/shots lists' selector menu. Keys
// are the fixed task columns; metadata columns are keyed by field_name and
// merged in by TableMetadataSelectorMenu (localStorage-backed).
const columnSelectorDisplayed = ref(false)
const metadataDisplayHeaders = ref({
  difficulty: true,
  estimation: true,
  duration: true,
  retakeCount: true,
  frames: true,
  startDate: true,
  dueDate: true,
  realStartDate: true,
  realEndDate: true,
  doneDate: true,
  lastCommentDate: true
})

const visibleMetadataDescriptors = computed(() =>
  props.metadataDescriptors.filter(descriptor => {
    const header = metadataDisplayHeaders.value[descriptor.field_name]
    return header === undefined || header
  })
)

const isColumnVisible = name => metadataDisplayHeaders.value[name] !== false

const toggleColumnSelector = () => {
  columnSelectorDisplayed.value = !columnSelectorDisplayed.value
}

// Metadata column widths (keyed by descriptor id), drag-resized and persisted.
const METADATA_WIDTHS_KEY = 'metadataColumnWidths:task-type'
const readMetadataColumnWidths = () => {
  try {
    return JSON.parse(localStorage.getItem(METADATA_WIDTHS_KEY)) || {}
  } catch {
    return {}
  }
}
const metadataColumnWidths = ref(readMetadataColumnWidths())

const onMetadataColumnResize = (descriptorId, width) => {
  metadataColumnWidths.value = {
    ...metadataColumnWidths.value,
    [descriptorId]: width
  }
}

const persistMetadataColumnWidths = () => {
  localStorage.setItem(
    METADATA_WIDTHS_KEY,
    JSON.stringify(metadataColumnWidths.value)
  )
}

const bodyRef = useTemplateRef('body')
const headerMetadataMenuRef = useTemplateRef('header-metadata-menu')
const lastMetadataHeaderMenuDisplayed = ref(null)
// Row elements for scrollToLine, no reactivity needed
const taskRows = new Map()

const { startBrowsing } = useGrabList(bodyRef)

// Computed
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const isPaperProduction = computed(() => store.getters.isPaperProduction)
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const personMap = computed(() => store.getters.personMap)
const selectedTasks = computed(() => store.getters.selectedTasks)
const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const user = computed(() => store.getters.user)

const isAssets = computed(() => props.entityType === 'Asset')
const isEdits = computed(() => props.entityType === 'Edit')
const isEpisodes = computed(() => props.entityType === 'Episode')
const isSequences = computed(() => props.entityType === 'Sequence')
const isShots = computed(() => props.entityType === 'Shot')

const entityMap = computed(() => getEntityMap(props.entityType))

const displayedTasks = computed(() => props.tasks.slice(0, 60 * page.value))

const cardGroups = computed(() =>
  props.isGrouped && tasksByParent.value.length > 0
    ? tasksByParent.value
    : [{ name: null, tasks: displayedTasks.value }]
)

const tasksByParent = computed(() => {
  if (props.tasks.length === 0) return []
  if (isShots.value) {
    return groupTasks(getEntityMap('Shot'), 'sequence_id', 'sequence_name')
  }
  if (isAssets.value) {
    return groupTasks(
      getEntityMap('Asset'),
      'asset_type_id',
      'entity_type_name'
    )
  }
  return []
})

// Functions
const groupTasks = (entityMap, groupKey, nameField) => {
  const result = []
  let currentGroup = {
    name: props.tasks[0][nameField],
    tasks: []
  }
  let previousTask = null
  props.tasks.forEach(task => {
    const entity = entityMap.get(task.entity.id)
    if (previousTask) {
      const previousEntity = entityMap.get(previousTask.entity.id)
      if (previousEntity?.[groupKey] !== entity?.[groupKey]) {
        result.push(currentGroup)
        currentGroup = {
          name: task[nameField],
          tasks: []
        }
      }
    }
    currentGroup.tasks.push(task)
    previousTask = task
  })
  result.push(currentGroup)
  return result
}

const getEntity = entityId => entityMap.value.get(entityId) || {}

const setTaskRow = (taskId, el) => {
  if (el) {
    taskRows.set(taskId, el)
  } else {
    taskRows.delete(taskId)
  }
}

const getTaskName = task => {
  if (props.entityType === 'Shot') {
    return `${task.sequence_name} / ${getEntity(task.entity.id).name}`
  }
  return task.entity_name
}

const isTaskChanged = (task, data) => {
  const taskStart = task.start_date ? task.start_date.substring(0, 10) : ''
  const taskDue = task.due_date ? task.due_date.substring(0, 10) : ''
  return (
    (data.start_date !== undefined && taskStart !== data.start_date) ||
    (data.due_date !== undefined && taskDue !== data.due_date) ||
    (data.estimation !== undefined && task.estimation !== data.estimation) ||
    (data.difficulty !== undefined && task.difficulty !== data.difficulty) ||
    (data.nb_drawings !== undefined && task.nb_drawings !== data.nb_drawings)
  )
}

const getDate = date => (date ? moment(date, 'YYYY-MM-DD').toDate() : null)

// Dispatch an update built per selected task; a null build skips the task.
const applyToSelection = buildData => {
  Object.keys(selectionGrid.value).forEach(taskId => {
    const task = taskMap.value.get(taskId)
    const data = buildData(task)
    if (data && isTaskChanged(task, data)) {
      store.dispatch('updateTask', { taskId, data }).catch(console.error)
    }
  })
}

const updateEstimation = duration => {
  const estimation = isDurationInHours.value
    ? duration * 60
    : daysToMinutes(organisation.value, duration)

  updateTasksEstimation({ estimation })
}

const onUnassign = (task, person) => {
  const tasks = Array.from(selectedTasks.value.values())
  if (!selectedTasks.value.has(task.id)) {
    tasks.push(task)
  }
  store.dispatch('unassignPersonFromTasks', { tasks, person })
}

const updateStartDate = date => {
  applyToSelection(task => {
    if (!date) {
      const data = { start_date: null, due_date: task.due_date }
      if (task.difficulty) data.difficulty = task.difficulty
      return data
    }
    const startDate = moment(date)
    if (
      task.start_date &&
      task.start_date.substring(0, 10) === formatSimpleDate(startDate)
    ) {
      return null
    }
    const dueDate = task.due_date ? parseSimpleDate(task.due_date) : null
    const data = getDatesFromStartDate(
      organisation.value,
      startDate,
      dueDate,
      minutesToDays(organisation.value, task.estimation)
    )
    if (task.difficulty) data.difficulty = task.difficulty
    return data
  })
}

const updateDueDate = date => {
  applyToSelection(task => {
    if (!date) {
      return { start_date: task.start_date, due_date: null }
    }
    const dueDate = moment(date)
    if (
      task.due_date &&
      task.due_date.substring(0, 10) === formatSimpleDate(dueDate)
    ) {
      return null
    }
    const startDate = task.start_date ? parseSimpleDate(task.start_date) : null
    return getDatesFromEndDate(
      organisation.value,
      startDate,
      dueDate,
      minutesToDays(organisation.value, task.estimation)
    )
  })
}

const updateTasksEstimation = ({ estimation }) => {
  applyToSelection(task => {
    if (!task.start_date) return { estimation }
    const startDate = moment(task.start_date)
    const dueDate = task.due_date ? moment(task.due_date) : null
    const data = getDatesFromStartDate(
      organisation.value,
      startDate,
      dueDate,
      minutesToDays(organisation.value, estimation)
    )
    data.estimation = estimation
    return data
  })
}

const updateDifficulty = difficulty => {
  updateTasksData({ difficulty })
}

const updateNbDrawings = nbDrawings => {
  updateTasksData({ nb_drawings: nbDrawings })
}

const updateTasksData = data => {
  applyToSelection(() => data)
}

const isEstimationBurned = task =>
  task.estimation && task.estimation > 0 && task.duration > task.estimation

const onBodyScroll = event => {
  if (!bodyRef.value) return
  const position = event.target
  const maxHeight = bodyRef.value.scrollHeight - bodyRef.value.offsetHeight
  if (maxHeight < position.scrollTop + 100) {
    page.value++
  }

  emit('scroll', { top: position.scrollTop })
}

const onKeyDown = event => {
  if (props.tasks.length > 0 && event.altKey) {
    let index = lastSelection.value || 0
    if ([37, 38].includes(event.keyCode)) {
      index = index - 1 < 0 ? props.tasks.length - 1 : index - 1
      selectTask({}, index, props.tasks[index])
      pauseEvent(event)
    } else if ([39, 40].includes(event.keyCode)) {
      index = index + 1 >= props.tasks.length ? 0 : index + 1
      selectTask({}, index, props.tasks[index])
      pauseEvent(event)
    }
  }
}

const selectTask = (event, index, task) => {
  if (
    event &&
    event.target &&
    // Dirty hack needed to make date picker and inputs work properly
    (['INPUT', 'LABEL', 'SELECT', 'TEXTAREA'].includes(event.target.nodeName) ||
      // Combo box should not trigger selection
      event.target.className.indexOf('selected-line') >= 0 ||
      event.target.className.indexOf('down-icon') >= 0 ||
      event.target.className.indexOf('flexrow') >= 0 ||
      event.target.className.indexOf('c-mask') >= 0 ||
      event.target.className.indexOf('option-line') >= 0 ||
      event.target.className.indexOf('combobox') >= 0 ||
      event.target.className === '' ||
      (event.target.parentNode &&
        ['difficulty'].includes(event.target.className)) ||
      (event.target.parentNode &&
        ['HEADER'].includes(event.target.parentNode.nodeName)) ||
      ['cell day selected'].includes(event.target.className))
  )
    return
  applySelection(event, index, task)
}

// Card clicks skip the table-oriented guard above (it swallows most of
// the card surface); only the avatar and its unassign menu must not
// select.
const selectTaskFromCard = (event, index, task) => {
  if (event.target?.closest?.('.avatar-wrapper')) return
  applySelection(event, index, task)
}

const applySelection = (event, index, task) => {
  const isSelected = selectionGrid.value[task.id]
  if (!(event.ctrlKey || event.metaKey) && !event.shiftKey) {
    store.dispatch('clearSelectedTasks')
    resetSelection()
  }

  if (!event.shiftKey) {
    if (isSelected) {
      store.dispatch('removeSelectedTask', { task })
      selectionGrid.value[task.id] = undefined
    } else {
      store.dispatch('addSelectedTask', { task })
      emit('task-selected', task)
      selectionGrid.value[task.id] = true
      lastSelection.value = index
    }
  } else {
    selectionGrid.value = {}
    const taskIndices =
      lastSelection.value > index
        ? range(index, lastSelection.value)
        : range(lastSelection.value, index)
    const selection = taskIndices.map(i => ({ task: props.tasks[i] }))
    selection.forEach(task => {
      selectionGrid.value[task.task.id] = true
    })
    store.dispatch('addSelectedTasks', selection)
  }
  scrollToLine(task.id)
}

const setScrollPosition = top => {
  if (bodyRef.value) {
    bodyRef.value.scrollTop = top
  }
}

const scrollToLine = taskId => {
  const taskLine = taskRows.get(taskId)
  if (taskLine && bodyRef.value) {
    const margin = 30
    const rect = taskLine.getBoundingClientRect()
    const listRect = bodyRef.value.getBoundingClientRect()
    const isBelow = rect.bottom > listRect.bottom - margin
    const isAbove = rect.top < listRect.top + margin

    if (isBelow) {
      const scrollingRequired = rect.bottom - listRect.bottom + margin
      setScrollPosition(bodyRef.value.scrollTop + scrollingRequired)
    } else if (isAbove) {
      const scrollingRequired = listRect.top - rect.top + margin
      setScrollPosition(bodyRef.value.scrollTop - scrollingRequired)
    }
  }
}

const isInDepartment = task =>
  isCurrentUserManager.value ||
  isSupervisorInDepartments(
    user.value,
    isCurrentUserSupervisor.value,
    taskTypeMap.value.get(task.task_type_id)?.department_id
  )

const isMetadataMenuEditAllowed = computed(() => {
  const descriptor = props.metadataDescriptors.find(
    d => d.id === lastMetadataHeaderMenuDisplayed.value
  )
  return (
    isCurrentUserManager.value ||
    isSupervisorInDepartments(
      user.value,
      isCurrentUserSupervisor.value,
      descriptor?.departments
    )
  )
})

const showMetadataHeaderMenu = (descriptorId, event) => {
  const menuEl = headerMetadataMenuRef.value?.$el
  if (!menuEl) return
  const isHidden = menuEl.classList.contains('hidden')
  if (
    !event ||
    (!isHidden && descriptorId === lastMetadataHeaderMenuDisplayed.value)
  ) {
    menuEl.classList.add('hidden')
    return
  }
  menuEl.classList.remove('hidden')
  let headerElement = event.srcElement.parentNode.parentNode
  if (headerElement.tagName !== 'TH') {
    headerElement = headerElement.parentNode
  }
  const headerBox = headerElement.getBoundingClientRect()
  menuEl.style.left = `${headerBox.left - 3}px`
  menuEl.style.top = `${headerBox.bottom + 4}px`
  menuEl.style.width = `${Math.max(100, headerBox.width - 1)}px`
  lastMetadataHeaderMenuDisplayed.value = descriptorId
}

const onEditMetadataClicked = () => {
  emit('edit-metadata', lastMetadataHeaderMenuDisplayed.value)
  showMetadataHeaderMenu()
}

const onDeleteMetadataClicked = () => {
  emit('delete-metadata', lastMetadataHeaderMenuDisplayed.value)
  showMetadataHeaderMenu()
}

const onSortByMetadataClicked = () => {
  emit('sort-metadata', lastMetadataHeaderMenuDisplayed.value)
  showMetadataHeaderMenu()
}

const onClickOutsideMenu = event => {
  const menuEl = headerMetadataMenuRef.value?.$el
  if (!menuEl || menuEl.classList.contains('hidden')) return
  // The chevron buttons drive the menu themselves (toggle or reposition).
  if (menuEl.contains(event.target)) return
  if (event.target.closest?.('.metadata-menu-button')) return
  menuEl.classList.add('hidden')
}

const onMetadataChanged = ({ entry, descriptor, value }) => {
  store
    .dispatch('updateTask', {
      taskId: entry.id,
      data: { data: { [descriptor.field_name]: value } }
    })
    .catch(console.error)
}

const resetSelection = () => {
  selectionGrid.value = {}
  lastSelection.value = null
}

const getTableData = () => {
  const headers = [
    isAssets.value ? t('tasks.fields.asset_type') : t('tasks.fields.sequence'),
    t('tasks.fields.entity_name'),
    t('tasks.fields.task_status'),
    t('tasks.fields.assignees'),
    t('tasks.fields.difficulty'),
    t('tasks.fields.estimation'),
    t('tasks.fields.duration'),
    t('tasks.fields.retake_count'),
    ...props.metadataDescriptors.map(descriptor => descriptor.name),
    t('tasks.fields.start_date'),
    t('tasks.fields.due_date'),
    t('tasks.fields.real_start_date'),
    t('tasks.fields.real_end_date'),
    t('tasks.fields.done_date'),
    t('tasks.fields.last_comment_date')
  ]
  if (isShots.value) {
    const value = !isPaperProduction.value
      ? t('tasks.fields.frames')
      : t('tasks.fields.drawings')
    headers.splice(4, 0, value)
  }
  const taskLines = [headers]
  props.tasks.forEach(task => {
    if (!task) return
    const entity = getEntity(task.entity.id)
    const assignees = task.assignees
      .map(personId => personMap.value.get(personId)?.name || '')
      .join(', ')

    const line = [
      isAssets.value ? entity.asset_type_name : entity.sequence_name,
      entity.name,
      task.task_status_short_name,
      assignees,
      task.difficulty,
      formatDuration(task.estimation, false),
      formatDuration(task.duration, false),
      task.retake_count,
      ...props.metadataDescriptors.map(descriptor =>
        getMetadataFieldValue(descriptor, task)
      ),
      formatSimpleDate(task.start_date),
      formatSimpleDate(task.due_date),
      formatSimpleDate(task.real_start_date),
      formatSimpleDate(task.end_date),
      formatSimpleDate(task.done_date),
      formatSimpleDate(task.last_comment_date)
    ]
    if (isShots.value) {
      const value = !isPaperProduction.value
        ? entity.nb_frames
        : task.nb_drawings || 0
      line.splice(4, 0, value)
    }
    taskLines.push(line)
  })
  return taskLines
}

// Watchers
watch(
  () => props.tasks,
  () => {
    page.value = 1
    resetSelection()
  }
)

watch(nbSelectedTasks, () => {
  if (nbSelectedTasks.value === 0) resetSelection()
})

// Lifecycle
onMounted(() => {
  window.addEventListener('keydown', onKeyDown, false)
  window.addEventListener('mousedown', onClickOutsideMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('mousedown', onClickOutsideMenu)
})

defineExpose({
  getTableData,
  resetSelection,
  selectTask,
  setScrollPosition
})
</script>

<style lang="scss" scoped>
.thumbnail {
  min-width: 63px;
  max-width: 63px;
  width: 63px;
}

.asset-type {
  min-width: 120px;
  width: 120px;
}

.sequence {
  min-width: 120px;
  width: 120px;
}

.name {
  min-width: 120px;
  max-width: 300px;
  font-weight: bold;
}

.status {
  min-width: 140px;
  width: 140px;
  padding: 0;
}

.assignees {
  min-width: 100px;
  width: 100px;
}

.frames,
.duration,
.estimation {
  min-width: 60px;
  width: 60px;
}

.selected {
  .estimation {
    padding: 0;
  }
}

.last-comment-date,
.real-start-date,
.real-end-date,
.done-date {
  min-width: 110px;
  max-width: 110px;
  width: 110px;
}

th.start-date,
th.due-date {
  min-width: 106px;
  max-width: 106px;
  width: 106px;
}

td.start-date,
td.due-date {
  text-align: center;
  margin: 0;
  padding: 0;
}

.retake-count {
  min-width: 90px;
  width: 90px;
}

td.metadata-descriptor {
  height: 3.1rem;
  padding: 0;
}

td.retake-count {
  line-height: 0.5em;
  color: $red;
  font-weight: bold;
  font-size: 1.6em;
  padding-left: 2px;
  white-space: nowrap;
}

.column-selector {
  text-align: right;
  width: 100%;
}

.nb-tasks {
  padding: 0.5em;
}

.datatable-head {
  th {
    padding-left: 5px;

    &.retake-count {
      padding-right: 1em;
    }

    &.status {
      padding-left: 1em;
      padding-right: 1em;
    }
  }
}

.input {
  padding: 0.5em;
}

.data-list {
  display: flex;
  flex-direction: row;
  margin-top: 0.6em;
  min-height: 150px;
  max-height: fit-content;
}

.datatable-wrapper {
  min-height: calc(100% - 50px);
  transition: margin-top 0.3s ease;

  // Without the schedule beside it, the wrapper is the only child of
  // the flex row and must claim the remaining page width itself.
  &:not(.with-schedule) {
    flex: 1;
  }

  &.with-schedule {
    margin-top: 54px;
    margin-bottom: 0;
    padding-bottom: 25px; // hack due to custom scrollbar
    scrollbar-width: thin;

    .datatable .datatable-row:last-child td:last-child {
      border-bottom-right-radius: 0;
    }

    td {
      height: 40px;
    }
  }
}

.list-wrapper {
  // Same flex-row constraint as the datatable wrapper: without a flex
  // basis the auto-fill grid shrinks to a single column.
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
}

.list-wrapper div:first-child h2 {
  margin-top: 0;
}

.task-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, 204px);

  .task-card {
    border: 2px solid transparent;
    border-radius: 10px;
    box-shadow: 0 1px 3px var(--box-shadow);
    background: var(--background-alt);
    cursor: pointer;
    display: flex;
    font-weight: bold;
    flex-direction: column;
    padding: 0;
    padding-bottom: 0.4em;
    transition:
      border 0.3s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;

    &:hover {
      box-shadow: 0 3px 8px var(--box-shadow);
      transform: translateY(-2px);
    }

    &.selected {
      border: 2px solid $dark-purple;
    }

    .task-name {
      font-size: 0.9em;
      margin-bottom: 0.5em;
      margin-top: 0.4em;
      padding: 0 0.6em;
      word-break: break-word;
    }
    .task-data {
      padding: 0 0.3em 0 0.5em;

      .avatar-wrapper:last-child {
        margin-right: 0;
      }
    }
  }
}

.datatable-body {
  overflow-x: auto;
  overflow-y: scroll;
  min-height: 100%;

  td,
  tr {
    padding-bottom: 0;
    padding-top: 0;

    &.thumbnail {
      padding: 6px;

      .with-schedule & {
        padding: 3px 6px;
      }
    }
  }

  td.retake-count {
    padding-right: 0.5em;
  }

  td.name {
    border-right: 1px solid var(--border);
  }

  tr.task-line {
    cursor: pointer;
  }
}

.error {
  color: $red;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

.datatable-row:hover {
  background: var(--background-selectable);
}

.frames {
  padding-right: 10px;
}
</style>
