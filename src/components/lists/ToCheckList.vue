<template>
  <div class="data-list task-list">
    <div class="datatable-wrapper" ref="body">
      <table class="datatable" v-if="!isLoading">
        <thead class="datatable-head">
          <tr>
            <th
              scope="col"
              class="production datatable-row-header datatable-row-header--nobd"
              ref="th-prod"
            >
              {{ $t('tasks.fields.production') }}
            </th>
            <th
              scope="col"
              class="type datatable-row-header datatable-row-header--nobd"
              ref="th-type"
              :style="{ left: colTypePosX }"
            >
              {{ $t('tasks.fields.task_type') }}
            </th>
            <th
              scope="col"
              class="name datatable-row-header"
              :style="{ left: colNamePosX }"
            >
              {{ $t('tasks.fields.entity') }}
            </th>
            <th scope="col" class="episode" v-if="isEpisodeVisible">
              {{ $t('assets.fields.episode') }}
            </th>
            <th scope="col" class="assignees">
              {{ $t('tasks.fields.assignees') }}
            </th>
            <th scope="col" class="estimation" :title="$t('main.estimation')">
              {{ $t('main.estimation_short') }}
            </th>
            <th scope="col" class="duration number-cell">
              {{ $t('tasks.fields.duration').substring(0, 3) }}.
            </th>
            <th scope="col" class="due-date">
              {{ $t('tasks.fields.due_date') }}
            </th>
            <th scope="col" class="status">
              {{ $t('tasks.fields.task_status') }}
            </th>
            <th class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="tasks.length > 0">
          <tr
            :key="entry.id"
            class="datatable-row datatable-row--selectable"
            :class="{
              selected: selectionGrid[entry.id]
            }"
            role="button"
            tabindex="0"
            @click="selectTask($event, i, entry)"
            @keydown.enter.prevent="selectTask($event, i, entry)"
            v-for="(entry, i) in tasks"
          >
            <td
              class="production datatable-row-header datatable-row-header--nobd"
              scope="row"
            >
              <production-name-cell
                :is-tooltip="true"
                :entry="productionMap.get(entry.project_id)"
                :only-avatar="true"
                :is-link="false"
              />
            </td>
            <task-type-cell
              class="type datatable-row-header datatable-row-header--nobd"
              :production-id="entry.project_id"
              :task-type="getTaskType(entry)"
              :style="{ left: colTypePosX }"
              :is-link="false"
            />
            <td
              class="name datatable-row-header"
              :style="{ left: colNamePosX }"
            >
              <div class="flexrow">
                <entity-thumbnail
                  :empty-width="60"
                  :empty-height="40"
                  :entity="{ preview_file_id: entry.entity_preview_file_id }"
                />
                <router-link class="entity-name" :to="entityPath(entry)">
                  {{ entry.full_entity_name }}
                </router-link>
              </div>
            </td>

            <td class="episode" v-if="isEpisodeVisible">
              <div class="flexrow" :title="assetEpisodes(entry, true)">
                {{ assetEpisodes(entry, false) }}
              </div>
            </td>

            <td class="assignees">
              <div class="avatars">
                <people-avatar
                  :key="`${entry.id}-${person.id}`"
                  :person="person"
                  :size="30"
                  :font-size="16"
                  v-for="person in getSortedPeople(entry.assignees)"
                />
              </div>
            </td>
            <td class="estimation number-cell">
              <input
                class="input"
                min="0"
                step="any"
                type="number"
                :value="formatDuration(entry.estimation, false)"
                @change="updateEstimation($event.target.value)"
                v-if="isEditable && selectionGrid[entry.id]"
              />
              <template v-else>
                {{ formatDuration(entry.estimation) }}
              </template>
            </td>
            <td
              class="duration number-cell"
              :class="{
                error: isEstimationBurned(entry)
              }"
            >
              {{ formatDuration(entry.duration) }}
            </td>
            <td class="due-date">
              <date-field
                class="flexrow-item"
                :model-value="getDate(entry.due_date)"
                :with-margin="false"
                @update:model-value="updateDueDate"
                v-if="isEditable && selectionGrid[entry.id]"
              />
              <template v-else>
                {{ formatDisplayDate(entry.due_date) }}
              </template>
            </td>
            <validation-cell
              class="status unselectable"
              :is-assignees="false"
              :is-border="false"
              :is-static="true"
              :selectable="false"
              :selected="selectionGrid[entry.id]"
              :task-test="entry"
            />
            <th class="actions"></th>
          </tr>
        </tbody>
      </table>

      <div class="has-text-centered" v-if="isMore && !isLoading">
        <spinner class="mt2" v-if="isMoreLoading" />
        <button class="button mt2" @click="$emit('more-clicked')" v-else>
          {{ $t('main.load_more') }}
        </button>
      </div>

      <table-info
        :is-loading="isLoading"
        :is-error="isError"
        :cells="10"
        :with-actions="false"
      />

      <div
        class="has-text-centered empty-list"
        v-if="tasks.length === 0 && !isLoading && !isError"
      >
        <p>
          <img src="../../assets/illustrations/empty_todo.png" alt="" />
        </p>
      </div>
    </div>

    <p class="has-text-centered footer-info" v-if="tasks.length && !isLoading">
      {{ stats.total }}
      {{ $t('tasks.number', { count: stats.total }) }}
      ({{ formatDuration(stats.total_duration) }}
      {{
        isDurationInHours
          ? $t('main.hours_spent', {
              count: formatDuration(stats.total_duration, false)
            })
          : $t('main.days_spent', {
              count: formatDuration(stats.total_duration, false)
            })
      }}
      /
      {{ formatDuration(stats.total_estimation) }}
      {{
        isDurationInHours
          ? $t('main.hours_estimated', {
              count: formatDuration(stats.total_estimation, false)
            })
          : $t('main.days_estimated', {
              count: formatDuration(stats.total_estimation, false)
            })
      }})
    </p>
  </div>
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
import { useStore } from 'vuex'

import { pauseEvent } from '@/composables/dom'
import { useFormat } from '@/composables/format'
import { useTaskHelpers } from '@/composables/tasks'
import { getTaskEntityPath } from '@/lib/path'
import {
  daysToMinutes,
  formatSimpleDate,
  getDatesFromEndDate,
  getDatesFromStartDate,
  minutesToDays,
  parseSimpleDate,
  range
} from '@/lib/time'

import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import DateField from '@/components/widgets/DateField.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

// Composables
const store = useStore()
const { formatDisplayDate, formatDuration, isDurationInHours, organisation } =
  useFormat()
const { getSortedPeople, getTaskType } = useTaskHelpers()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  },
  // totals for the whole paginated result set, from the API envelope
  stats: {
    type: Object,
    default: () => ({ total: 0, total_duration: 0, total_estimation: 0 })
  },
  isError: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isMore: {
    type: Boolean,
    default: false
  },
  isMoreLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['more-clicked', 'task-selected'])

// State
// --------------------------------------------------------------------------
const colNamePosX = ref('')
const colTypePosX = ref('')
const lastSelection = ref(null)
const selectionGrid = ref({})

const thProdRef = useTemplateRef('th-prod')
const thTypeRef = useTemplateRef('th-type')

// Computed
// --------------------------------------------------------------------------
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const productionMap = computed(() => store.getters.productionMap)
const taskMap = computed(() => store.getters.taskMap)

const isEditable = computed(
  () => isCurrentUserManager.value || isCurrentUserSupervisor.value
)

const isEpisodeVisible = computed(() =>
  props.tasks.some(
    task =>
      task.source_id ||
      task.episode_names?.length > 0 ||
      (!['Shot', 'Sequence', 'Edit'].includes(task.entity_type_name) &&
        task.episode_id)
  )
)

// Functions
// --------------------------------------------------------------------------
const assetEpisodes = (entry, full) => {
  if (['Episode', 'Sequence', 'Shot', 'Edit'].includes(entry.entity_type_name))
    return ''
  const mainEpisodeName = entry.episode_name || 'MP'
  const episodeNames = (entry.episode_names || []).filter(
    name => name !== mainEpisodeName
  )
  if (!episodeNames.length) {
    return mainEpisodeName
  }
  const episodeNameString =
    !full && episodeNames.length > 2
      ? episodeNames.slice(0, 2).join(', ') + ', ...'
      : episodeNames.join(', ')
  return mainEpisodeName + ', ' + episodeNameString
}

const getDate = date => (date ? moment(date, 'YYYY-MM-DD').toDate() : null)

const entityPath = entity => {
  const entityType = entity.entity_type_name
  const production = productionMap.value.get(entity.project_id)
  let episodeId = entity.episode_id
  if (production && production.production_type === 'tvshow' && !episodeId) {
    if (entityType === 'Shot') {
      episodeId = production.first_episode_id
    } else if (!['Edit', 'Episode', 'Sequence'].includes(entityType)) {
      episodeId = 'main'
    }
  }
  return getTaskEntityPath(entity, episodeId)
}

const isEstimationBurned = task =>
  task.estimation > 0 && task.duration > task.estimation

const isTaskChanged = (task, data) => {
  const taskStart = task.start_date ? task.start_date.substring(0, 10) : ''
  const taskDue = task.due_date ? task.due_date.substring(0, 10) : ''
  return (
    (data.start_date !== undefined && taskStart !== data.start_date) ||
    (data.due_date !== undefined && taskDue !== data.due_date) ||
    (data.estimation !== undefined && task.estimation !== data.estimation)
  )
}

// Applies buildData to every selected task; a null data skips the task.
const updateSelectedTasks = buildData => {
  Object.keys(selectionGrid.value).forEach(taskId => {
    const task = taskMap.value.get(taskId)
    if (!task) return
    const data = buildData(task)
    if (data && isTaskChanged(task, data)) {
      store.dispatch('updateTask', { taskId, data }).catch(console.error)
    }
  })
}

const updateEstimation = duration => {
  const estimation = organisation.value.format_duration_in_hours
    ? duration * 60
    : daysToMinutes(organisation.value, duration)

  updateSelectedTasks(task => {
    if (!task.start_date) {
      return { estimation }
    }
    const data = getDatesFromStartDate(
      organisation.value,
      moment(task.start_date),
      task.due_date ? moment(task.due_date) : null,
      minutesToDays(organisation.value, estimation)
    )
    data.estimation = estimation
    return data
  })
}

const updateDueDate = date =>
  updateSelectedTasks(task => {
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
    return getDatesFromEndDate(
      organisation.value,
      task.start_date ? parseSimpleDate(task.start_date) : null,
      dueDate,
      minutesToDays(organisation.value, task.estimation)
    )
  })

const onKeyDown = event => {
  if (props.tasks.length > 0 && event.altKey) {
    let index = lastSelection.value ? lastSelection.value : 0
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
    (['INPUT'].includes(event.target.nodeName) ||
      (event.target.parentNode &&
        ['HEADER'].includes(event.target.parentNode.nodeName)) ||
      ['cell day selected'].includes(event.target.className))
  )
    return
  const isSelected = selectionGrid.value[task.id]
  const isManySelection = Object.keys(selectionGrid.value).length > 1
  if (event && !(event.ctrlKey || event.metaKey) && !event.shiftKey) {
    store.dispatch('clearSelectedTasks')
    resetSelection()
  }

  if (event && !event.shiftKey) {
    if (isSelected && !isManySelection) {
      store.dispatch('removeSelectedTask', { task })
      selectionGrid.value[task.id] = undefined
    } else if (!isSelected || isManySelection) {
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
}

const resetSelection = () => {
  selectionGrid.value = {}
  lastSelection.value = null
}

// Watchers
// --------------------------------------------------------------------------
watch(() => props.tasks, resetSelection)

watch(nbSelectedTasks, () => {
  if (nbSelectedTasks.value === 0) resetSelection()
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  window.addEventListener('keydown', onKeyDown, false)
  if (thProdRef.value) {
    colTypePosX.value = thProdRef.value.offsetWidth + 'px'
    colNamePosX.value =
      thProdRef.value.offsetWidth + thTypeRef.value.offsetWidth + 'px'
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.datatable .datatable-row {
  cursor: pointer;
}

.name {
  width: 300px;
  min-width: 300px;
}

.name a {
  color: inherit;
}

.entity-name {
  color: var(--text);
  font-weight: bold;
}

.production {
  width: 70px;
  min-width: 70px;
  max-width: 70px;
}

.type {
  width: 130px;
  min-width: 130px;
}

.episode {
  min-width: 130px;
  width: 130px;
}

.assignees {
  width: 140px;
  max-width: 140px;

  .avatars {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}

.status {
  width: 160px;
  min-width: 160px;
}

.duration,
.estimation {
  width: 60px;
  min-width: 60px;
}

.selected {
  .estimation {
    padding: 0;
  }
}

td.estimation {
  text-align: right;
}

.due-date {
  min-width: 110px;
  text-align: center;
  width: 110px;
}

td.due-date {
  border-right: 1px solid var(--border);
}

th.actions {
  max-width: 100%;
  width: 100%;
}

.input {
  padding: 0.5em;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

.error {
  color: $red;
}

.empty-list img {
  max-width: 80vh;
  -webkit-filter: brightness(103%);
}

.footer-info {
  padding: 0.5em;
}
</style>
