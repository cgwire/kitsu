<template>
  <div class="data-list">
    <div>
      <table class="datatable" ref="headerWrapper">
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

    <table-info :is-loading="isLoading" :is-error="isError" />

    <div
      class="task-list-body"
      v-scroll="onBodyScroll"
      v-if="entries.length > 0"
    >
      <table class="datatable">
        <tbody class="datatable-body">
          <tr
            :key="typeof taskId === 'string' ? taskId : taskId.id"
            :class="{
              selected: currentTask && currentTask.id === taskId,
              'datatable-row': true,
              'datatable-row--selectable': true
            }"
            @click="selectTask(getTask(taskId))"
            v-for="taskId in sortedEntries"
          >
            <task-type-cell
              class="type"
              :task-type="getTaskType(taskId)"
              :production-id="currentProduction.id"
              v-if="getTaskType(taskId)"
            />
            <td class="status">
              <validation-tag
                :task="getTask(taskId)"
                :is-static="true"
                v-if="getTask(taskId)"
              />
            </td>
            <td class="estimation">
              {{ getTaskEstimation(taskId) }}
            </td>
            <td class="estimation">
              {{ getTaskDuration(taskId) }}
            </td>
            <td class="startdate">
              {{ getTaskStartDate(taskId) }}
            </td>
            <td class="duedate">
              {{ getTaskDueDate(taskId) }}
            </td>
            <td class="assignees">
              <div
                class="flexrow"
                v-if="!isCurrentUserClient && !isCurrentUserVendor"
              >
                <div
                  class="avatar-wrapper"
                  :key="personId"
                  v-for="personId in getAssignees(taskId)"
                >
                  <people-avatar
                    class="person-avatar flexrow-item"
                    :key="taskId + '-' + personId"
                    :person="personMap.get(personId)"
                    :size="30"
                    :font-size="15"
                  />
                </div>
              </div>
            </td>
            <td class="end-cell"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { formatListMixin } from '@/components/mixins/format'

import TaskTypeCell from '@/components/cells/TaskTypeCell'
import TableInfo from '@/components/widgets/TableInfo'
import ValidationTag from '@/components/widgets/ValidationTag'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'

export default {
  name: 'entity-task-list',
  mixins: [formatListMixin],

  components: {
    TableInfo,
    TaskTypeCell,
    PeopleAvatar,
    ValidationTag
  },

  props: {
    entries: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      currentTask: null
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'getTaskTypePriority',
      'isCurrentUserClient',
      'isCurrentUserVendor',
      'personMap',
      'taskMap',
      'taskTypeMap'
    ]),

    sortedEntries() {
      return [...this.entries].sort((taskIdA, taskIdB) => {
        const taskA = this.getTask(taskIdA)
        const taskB = this.getTask(taskIdB)
        if (!taskA) return false
        const taskTypeA = this.taskTypeMap.get(taskA.task_type_id)
        const taskTypeB = this.taskTypeMap.get(taskB.task_type_id)
        const taskTypeAPriority = this.getTaskTypePriority(taskA.task_type_id)
        const taskTypeBPriority = this.getTaskTypePriority(taskB.task_type_id)
        if (taskTypeAPriority === taskTypeBPriority) {
          return taskTypeA.name.localeCompare(taskTypeB.name)
        } else {
          return taskTypeAPriority - taskTypeBPriority
        }
      })
    }
  },

  methods: {
    ...mapActions([]),

    onBodyScroll(event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    },

    getTask(task) {
      if (typeof task === 'string') {
        return this.taskMap.get(task)
      } else {
        return task
      }
    },

    getTaskStartDate(taskId) {
      const task = this.getTask(taskId)
      return task && task.start_date ? task.start_date.substring(0, 10) : ''
    },

    getTaskDueDate(taskId) {
      const task = this.getTask(taskId)
      return task && task.due_date ? task.due_date.substring(0, 10) : ''
    },

    getTaskEstimation(taskId) {
      const task = this.getTask(taskId)
      return task && task.estimation ? this.formatDuration(task.estimation) : ''
    },

    getTaskDuration(taskId) {
      const task = this.getTask(taskId)
      return task && task.duration ? this.formatDuration(task.duration) : ''
    },

    getTaskType(entry) {
      const task = this.getTask(entry)
      return task ? this.taskTypeMap.get(task.task_type_id) : null
    },

    getAssignees(entry) {
      const task = this.getTask(entry)
      return task ? task.assignees : []
    },

    selectTask(task) {
      this.currentTask = task
      this.$emit('task-selected', task)
    }
  }
}
</script>

<style lang="scss" scoped>
.data-list {
  max-width: 500px;
  margin-top: 0;
}

.type {
  max-width: 250px;
  min-width: 250px;
}

.estimation {
  max-width: 50px;
  min-width: 50px;
}

.startdate,
.duedate {
  max-width: 100px;
  min-width: 100px;
}

.status {
  max-width: 120px;
  min-width: 120px;
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

.task-list-body {
  overflow-y: auto;
  overflow-x: hidden;
}

.datatable-row-header::after {
  display: none;
}
</style>
