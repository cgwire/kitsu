<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr class="row-header">
            <th class="project">
              {{ $t('tasks.fields.production') }}
            </th>
            <th class="thumbnail"></th>
            <th class="asset-type">
              {{ $t('tasks.fields.parent') }}
            </th>
            <th class="name">
              {{ $t('tasks.fields.entity') }}
            </th>
            <th class="name">
              {{ $t('tasks.fields.task_type') }}
            </th>
            <th class="status">
              {{ $t('tasks.fields.task_status') }}
            </th>
            <th class="assignees">
              {{ $t('tasks.fields.assignees') }}
            </th>
            <th class="estimation number-cell" :title="$t('main.estimation')">
              {{ $t('tasks.fields.estimation').substring(0, 3) }}.
            </th>
            <th class="duration number-cell">
              {{ $t('tasks.fields.duration').substring(0, 3) }}.
            </th>
            <th class="start-date">
              {{ $t('tasks.fields.start_date') }}
            </th>
            <th class="due-date">
              {{ $t('tasks.fields.due_date') }}
            </th>
            <th class="done-date">
              {{ $t('tasks.fields.done_date') }}
            </th>
            <th class="empty">&nbsp;</th>
          </tr>
        </thead>

        <tbody class="datatable-body">
          <tr
            :key="task.id"
            class="task-line datatable-row"
            :class="{ selected: selectionGrid[task.id] }"
            role="button"
            tabindex="0"
            @click="selectTask(index, task)"
            @keydown.enter.prevent="selectTask(index, task)"
            v-for="(task, index) in tasks"
          >
            <td class="project">
              <production-name-cell
                class="project"
                :entry="{ id: task.project_id, name: task.project_name }"
                :only-avatar="true"
                :is-link="false"
              />
            </td>
            <td class="thumbnail">
              <entity-thumbnail
                class="flexrow-item"
                :preview-file-id="task.last_preview_file_id"
                :width="50"
                :height="33"
                :empty-width="50"
                :empty-height="33"
              />
            </td>
            <td class="asset-type">
              {{ getParentName(task) }}
            </td>
            <td class="name">
              {{ task.entity_name }}
            </td>
            <task-type-cell
              class="name"
              :task-type="taskTypeMap.get(task.task_type_id)"
            />
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
                  :key="task.id + '-' + personId"
                  :person="personMap.get(personId)"
                  :size="30"
                  :font-size="16"
                  @unassign="person => onUnassign(task, person)"
                  v-for="personId in task.assignees"
                />
              </div>
            </td>
            <td class="estimation number-cell">
              {{ formatDuration(task.estimation) }}
            </td>
            <td
              class="duration number-cell"
              :class="{ error: isEstimationBurned(task) }"
            >
              {{ formatDuration(task.duration) }}
            </td>
            <td class="start-date">
              {{ formatDisplayDate(task.start_date) }}
            </td>
            <td class="due-date">
              {{ formatDisplayDate(task.due_date) }}
            </td>
            <td class="done-date">
              {{ formatDisplayDate(task.done_date) }}
            </td>
            <td class="empty"></td>
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
    </div>
    <tasks-stats-line :stats="stats" v-if="!isLoading" />
  </div>
</template>

<script setup>
// Imports
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { pauseEvent } from '@/composables/dom'
import { useFormat } from '@/composables/format'

import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PeopleAvatarWithMenu from '@/components/widgets/PeopleAvatarWithMenu.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TasksStatsLine from '@/components/widgets/TasksStatsLine.vue'

// Composables
const store = useStore()
const { formatDisplayDate, formatDuration } = useFormat()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
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
  },
  stats: {
    type: Object,
    default: () => ({ total: 0, total_duration: 0, total_estimation: 0 })
  },
  tasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['more-clicked', 'task-selected'])

// State
// --------------------------------------------------------------------------
const lastSelection = ref(null)
const selectionGrid = ref({})

// Computed
// --------------------------------------------------------------------------
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const personMap = computed(() => store.getters.personMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

// Functions
// --------------------------------------------------------------------------
const getParentName = task => {
  if (task.sequence_name) {
    return task.episode_name
      ? `${task.episode_name} - ${task.sequence_name}`
      : task.sequence_name
  }
  return task.entity_type_name
}

const isEstimationBurned = task =>
  task.estimation > 0 && task.duration > task.estimation

const onUnassign = (task, person) =>
  store
    .dispatch('unassignPersonFromTask', { task, person })
    .catch(console.error)

// alt + arrows walk the list, wrapping at both ends
const onKeyDown = event => {
  if (props.tasks.length === 0 || !event.altKey) return
  const delta = [37, 38].includes(event.keyCode)
    ? -1
    : [39, 40].includes(event.keyCode)
      ? 1
      : 0
  if (delta === 0) return
  const { length } = props.tasks
  const index = ((lastSelection.value || 0) + delta + length) % length
  selectTask(index, props.tasks[index])
  pauseEvent(event)
}

const selectTask = (index, task) => {
  const isSelected = selectionGrid.value[task.id]
  const isManySelection = Object.keys(selectionGrid.value).length > 1
  store.dispatch('clearSelectedTasks', { task })
  resetSelection()

  if (!isSelected || isManySelection) {
    store.dispatch('addSelectedTask', { task })
    emit('task-selected', task)
    selectionGrid.value[task.id] = true
    lastSelection.value = index
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
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
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

.name {
  min-width: 120px;
  width: 120px;
  font-weight: bold;
}

.status {
  min-width: 140px;
  width: 140px;
}

.assignees {
  min-width: 100px;
  width: 100px;
}

.duration,
.estimation {
  min-width: 60px;
  width: 60px;
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

.empty {
  width: 100%;
}

.datatable-head {
  th {
    padding-left: 5px;

    &.status {
      padding-left: 1em;
      padding-right: 1em;
    }
  }
}

.datatable-wrapper {
  min-height: calc(100% - 50px);
}

.data-list {
  margin-top: 0.6em;
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
    }
  }

  td.name {
    border-right: 1px solid var(--border);
  }

  td.status {
    padding-left: 1em;
    padding-right: 1em;
  }

  tr.task-line {
    cursor: pointer;
  }
}

.error {
  color: $red;
}

.datatable-row:hover {
  background: var(--background-selectable);
}
</style>
