<template>
  <div class="data-list">
    <error-text
      class="save-error"
      :text="cellSaveErrorText"
      v-if="cellSaveErrorText"
    />
    <div>
      <table class="datatable datatable--cards" ref="headerWrapper">
        <thead class="datatable-head">
          <tr class="datatable-row-header">
            <th class="type">
              {{ $t('tasks.fields.task_type') }}
            </th>
            <th class="status">
              {{ $t('tasks.fields.task_status') }}
            </th>
            <th class="estimation">
              {{ $t('tasks.fields.estimation').substring(0, 3) }}.
            </th>
            <th class="estimation">
              {{ $t('tasks.fields.duration').substring(0, 3) }}.
            </th>
            <th class="startdate">
              {{ $t('tasks.fields.start_date_short') }}
            </th>
            <th class="duedate">
              {{ $t('tasks.fields.due_date') }}
            </th>
            <th class="assignees">
              {{ $t('tasks.fields.assignees') }}
            </th>
            <th class="end-cell"></th>
          </tr>
        </thead>
      </table>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :with-thumbnail="false"
      :with-actions="false"
    />

    <div
      class="task-list-body"
      @scroll.passive="onBodyScroll"
      v-if="entries.length > 0"
    >
      <table class="datatable datatable--cards">
        <tbody class="datatable-body">
          <tr
            class="datatable-row datatable-row--selectable"
            :key="task.id"
            :class="{ selected: selectedTaskId === task.id }"
            role="button"
            tabindex="0"
            @click="selectTask(task)"
            @keydown.enter.prevent="selectTask(task)"
            v-for="task in sortedEntries"
          >
            <task-type-cell
              class="type card-head"
              :task-type="getTaskType(task.id)"
              :production-id="currentProduction.id"
              :task-id="task.id"
              v-if="getTaskType(task.id)"
            />
            <td class="status" :data-label="$t('tasks.fields.task_status')">
              <validation-tag
                :task="getTask(task.id)"
                :is-static="true"
                v-if="getTask(task.id)"
              />
            </td>
            <td
              class="estimation"
              :class="{ editing: isEditing(task) }"
              :data-label="
                getTaskEstimation(task) ? $t('tasks.fields.estimation') : null
              "
            >
              <input
                class="input editor"
                min="0"
                step="any"
                type="number"
                :value="formatDuration(task.estimation, false)"
                @change="updateEstimation($event.target, task)"
                @click.stop
                @keydown.enter.stop
                v-if="isEditing(task)"
              />
              <span class="value">{{ getTaskEstimation(task) }}</span>
            </td>
            <td
              class="duration"
              :data-label="
                getTaskDuration(task) ? $t('tasks.fields.duration') : null
              "
            >
              {{ getTaskDuration(task) }}
            </td>
            <td
              class="startdate"
              :class="{ editing: isEditing(task) }"
              :data-label="
                getTaskStartDate(task)
                  ? $t('tasks.fields.start_date_short')
                  : null
              "
            >
              <date-field
                class="editor"
                :with-margin="false"
                :model-value="getDate(task.start_date)"
                @click.stop
                @keydown.enter.stop
                @update:model-value="
                  date =>
                    saveEdit(
                      task,
                      getTaskStartDateEdit(organisation, task, date)
                    )
                "
                v-if="isEditing(task)"
              />
              <span class="value">{{ getTaskStartDate(task) }}</span>
            </td>
            <td
              class="duedate"
              :class="{ editing: isEditing(task) }"
              :data-label="
                getTaskDueDate(task) ? $t('tasks.fields.due_date') : null
              "
            >
              <date-field
                class="editor"
                :with-margin="false"
                :model-value="getDate(task.due_date)"
                @click.stop
                @keydown.enter.stop
                @update:model-value="
                  date =>
                    saveEdit(task, getTaskDueDateEdit(organisation, task, date))
                "
                v-if="isEditing(task)"
              />
              <span class="value">{{ getTaskDueDate(task) }}</span>
            </td>
            <td
              class="assignees"
              :data-label="
                getAssignees(task).length ? $t('tasks.fields.assignees') : null
              "
            >
              <div
                class="flexrow"
                v-if="!isCurrentUserClient && !isCurrentUserVendor"
              >
                <div
                  class="avatar-wrapper"
                  :key="personId"
                  v-for="personId in getAssignees(task)"
                >
                  <people-avatar
                    class="person-avatar flexrow-item"
                    :key="task.id + '-' + personId"
                    :person="personMap.get(personId)"
                    :size="30"
                    :font-size="15"
                  />
                </div>
              </div>
            </td>
            <td class="end-cell"></td>
          </tr>
          <tr class="datatable-row total-row">
            <td class="type card-head">{{ $t('main.total') }}</td>
            <td class="status" :data-label="$t('main.tasks')">
              {{ entityProgress }}
            </td>
            <td class="estimation" :data-label="$t('tasks.fields.estimation')">
              {{ formatDuration(entityEstimation) }}
            </td>
            <td class="duration" :data-label="$t('tasks.fields.duration')">
              {{ formatDuration(entityDuration) }}
            </td>
            <td
              class="startdate"
              :data-label="
                entityStartDate ? $t('tasks.fields.start_date_short') : null
              "
            >
              {{ entityStartDate }}
            </td>
            <td
              class="duedate"
              :data-label="entityDueDate ? $t('tasks.fields.due_date') : null"
            >
              {{ entityDueDate }}
            </td>
            <td class="assignees" :data-label="$t('tasks.fields.assignees')">
              {{ entityAssignees.length }}
              {{ $t('people.persons', { count: entityAssignees.length }) }}
            </td>
            <td class="end-cell"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import moment from 'moment-timezone'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { useCellSave } from '@/composables/cellSave'
import { useFormat } from '@/composables/format'
import { isSupervisorInDepartments } from '@/lib/descriptors'
import {
  durationToMinutes,
  getTaskDueDateEdit,
  getTaskEstimationEdit,
  getTaskStartDateEdit
} from '@/lib/time'

/* eslint-disable no-unused-vars */
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import DateField from '@/components/widgets/DateField.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'
/* eslint-enable no-unused-vars */

const store = useStore()
const { formatDuration, organisation } = useFormat()
const { cellSaveErrorText, saveCell } = useCellSave(
  task => store.getters.taskTypeMap.get(task.task_type_id)?.name,
  { rowsAreTasks: true }
)

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  entries: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  selectedTaskId: { type: String, default: null }
})
const emit = defineEmits(['task-selected'])

// State
// --------------------------------------------------------------------------
const headerWrapper = ref(null)

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const getTaskTypePriority = computed(() => store.getters.getTaskTypePriority)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserProductionSupervisor
)
const isCurrentUserVendor = computed(() => store.getters.isCurrentUserVendor)
const personMap = computed(() => store.getters.personMap)
const taskMap = computed(() => store.getters.taskMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const sortedEntries = computed(() =>
  [...props.entries].sort((taskA, taskB) => {
    if (!taskA) return false
    const taskTypeA = taskTypeMap.value.get(taskA.task_type_id)
    const taskTypeB = taskTypeMap.value.get(taskB.task_type_id)
    const priorityA = getTaskTypePriority.value(taskA.task_type_id)
    const priorityB = getTaskTypePriority.value(taskB.task_type_id)
    if (priorityA === priorityB) {
      return (taskTypeA?.name || '').localeCompare(
        taskTypeB?.name || '',
        undefined,
        { numeric: true }
      )
    }
    return priorityA - priorityB
  })
)

const entityProgress = computed(() => {
  const doneTasks = props.entries.filter(task => {
    const fullTask = getTask(task.id)
    const taskStatus = taskStatusMap.value.get(fullTask?.task_status_id)
    return taskStatus?.is_done
  })
  return `${doneTasks.length} / ${props.entries.length}`
})

const entityEstimation = computed(() =>
  props.entries.reduce((acc, task) => acc + task.estimation, 0)
)

const entityDuration = computed(() =>
  props.entries.reduce((acc, task) => acc + task.duration, 0)
)

const entityStartDate = computed(() => {
  if (props.entries.length === 0) return ''
  const startDate = props.entries.reduce(
    (min, task) => (task.start_date < min ? task.start_date : min),
    props.entries[0].start_date
  )
  return startDate ? startDate.substring(0, 10) : ''
})

const entityDueDate = computed(() => {
  if (props.entries.length === 0) return ''
  const dueDate = props.entries.reduce(
    (max, task) => (task.due_date > max ? task.due_date : max),
    props.entries[0].due_date
  )
  return dueDate ? dueDate.substring(0, 10) : ''
})

const entityAssignees = computed(() => [
  ...new Set(props.entries.flatMap(task => task.assignees))
])

// Functions
// --------------------------------------------------------------------------
const onBodyScroll = event => {
  if (!headerWrapper.value) return
  headerWrapper.value.style.left = `-${event.target.scrollLeft}px`
}

const getTask = task =>
  typeof task === 'string' ? taskMap.value.get(task) : task

const getTaskStartDate = task =>
  task?.start_date ? task.start_date.substring(0, 10) : ''

const getTaskDueDate = task =>
  task?.due_date ? task.due_date.substring(0, 10) : ''

const getTaskEstimation = task =>
  task?.estimation ? formatDuration(task.estimation) : ''

const getTaskDuration = task =>
  task?.duration ? formatDuration(task.duration) : ''

const getTaskType = entry => {
  const task = getTask(entry)
  return task ? taskTypeMap.value.get(task.task_type_id) : null
}

const getAssignees = entry => getTask(entry)?.assignees || []

const selectTask = task => emit('task-selected', task)

// The planning of the selected task takes fields, for who plans it: a
// manager, or a supervisor of its department.
const isEditing = task =>
  props.selectedTaskId === task.id &&
  (isCurrentUserManager.value ||
    isSupervisorInDepartments(
      store.getters.user,
      isCurrentUserSupervisor.value,
      taskTypeMap.value.get(task.task_type_id)?.department_id
    ))

const getDate = date => (date ? moment(date, 'YYYY-MM-DD').toDate() : null)

const saveEdit = (task, data) => {
  if (!data) return
  saveCell(task, () => store.dispatch('updateTask', { taskId: task.id, data }))
}

// A field left on something that is no number, or on a negative one, takes
// the stored estimation back. An emptied field saves 0.
const updateEstimation = (input, task) => {
  if (input.validity.badInput || input.valueAsNumber < 0) {
    input.value = formatDuration(task.estimation, false)
    return
  }
  const estimation = durationToMinutes(organisation.value, input.value)
  if (estimation !== task.estimation) {
    saveEdit(task, getTaskEstimationEdit(organisation.value, task, estimation))
  }
}
</script>

<style lang="scss" scoped>
.data-list {
  max-width: 500px;
  margin-top: 0;

  .dark & {
    border: 0;
  }
}

.type {
  max-width: 250px;
  min-width: 250px;
}

// room for the fields the selected task shows
.estimation,
.duration {
  max-width: 80px;
  min-width: 80px;
  text-align: right;
}

.startdate,
.duedate {
  max-width: 140px;
  min-width: 140px;
  white-space: nowrap;
}

.status {
  max-width: 130px;
  min-width: 130px;
}

.assignees {
  max-width: 150px;
  min-width: 150px;
}

.end-cell {
  width: 100%;
}

.flexrow-item {
  margin-right: 0.3em;
}

.avatar-wrapper {
  margin-right: 0.5em;
}

// the fields of the selected task stand in for its values
.editing .value {
  display: none;
}

.estimation .editor {
  // no arrows: Firefox draws them by this property, the others by the
  // pseudo-elements below
  -moz-appearance: textfield;
  padding: 0 0.3em;
  text-align: right;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.task-list-body {
  overflow-y: auto;
}

.datatable-row-header::after {
  display: none;
}

.total-row {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

@media screen and (max-width: 768px) {
  .data-list {
    max-width: 100%;
  }

  .task-list-body {
    overflow: visible;
  }

  // read-only: the cards keep the values
  .editor {
    display: none;
  }

  .editing .value {
    display: inline;
  }

  .avatar-wrapper:last-child,
  .avatar-wrapper .person-avatar {
    margin-right: 0;
  }

  .total-row td.type {
    font-size: 1.1em;
    font-weight: 600;
  }
}
</style>
