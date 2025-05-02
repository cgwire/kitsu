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
      @scroll.passive="onBodyScroll"
      v-if="entries.length > 0"
    >
      <table class="datatable">
        <tbody class="datatable-body">
          <tr
            :key="task.id"
            :class="{
              selected: currentTask && currentTask.id === task.id,
              'datatable-row': true,
              'datatable-row--selectable': true
            }"
            @click="selectTask(task)"
            v-for="task in sortedEntries"
          >
            <task-type-cell
              class="type"
              :task-type="getTaskType(task.id)"
              :production-id="currentProduction.id"
              :task-id="task.id"
              v-if="getTaskType(task.id)"
            />
            <td class="status">
              <validation-tag
                :task="getTask(task.id)"
                :is-static="true"
                v-if="getTask(task.id)"
              />
            </td>
            <td class="estimation">
              {{ getTaskEstimation(task) }}
            </td>
            <td class="estimation">
              {{ getTaskDuration(task) }}
            </td>
            <td class="startdate">
              {{ getTaskStartDate(task) }}
            </td>
            <td class="duedate">
              {{ getTaskDueDate(task) }}
            </td>
            <td class="assignees">
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
            <td>{{ $t('main.total') }}</td>
            <td>{{ entityProgress }}</td>
            <td class="estimation">{{ formatDuration(entityEstimation) }}</td>
            <td class="estimation">{{ formatDuration(entityDuration) }}</td>
            <td class="startdate">{{ entityStartDate }}</td>
            <td class="duedate">{{ entityDueDate }}</td>
            <td class="assignees">
              {{ entityAssignees.length }} {{ $t('budget.persons') }}
            </td>
            <td class="end-cell"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { formatListMixin } from '@/components/mixins/format'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'

export default {
  name: 'entity-task-list',

  mixins: [formatListMixin],

  components: {
    PeopleAvatar,
    TableInfo,
    TaskTypeCell,
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

  emits: ['task-selected'],

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
      'taskStatusMap',
      'taskTypeMap'
    ]),

    sortedEntries() {
      return [...this.entries].sort((taskA, taskB) => {
        if (!taskA) return false
        const taskTypeA = this.taskTypeMap.get(taskA.task_type_id)
        const taskTypeB = this.taskTypeMap.get(taskB.task_type_id)
        const taskTypeAPriority = this.getTaskTypePriority(taskA.task_type_id)
        const taskTypeBPriority = this.getTaskTypePriority(taskB.task_type_id)
        if (taskTypeAPriority === taskTypeBPriority) {
          return taskTypeA.name.localeCompare(taskTypeB.name, undefined, {
            numeric: true
          })
        } else {
          return taskTypeAPriority - taskTypeBPriority
        }
      })
    },

    entityProgress() {
      const doneTasks = this.entries.filter(task => {
        const fullTask = this.getTask(task.id)
        const taskStatus = this.taskStatusMap.get(fullTask.task_status_id)
        return taskStatus.is_done
      })
      return `${doneTasks.length} / ${this.entries.length}`
    },

    entityEstimation() {
      return this.entries.reduce((acc, task) => acc + task.estimation, 0)
    },

    entityDuration() {
      return this.entries.reduce((acc, task) => acc + task.duration, 0)
    },

    entityStartDate() {
      if (this.entries.length === 0) return ''
      let startDate = this.entries[0].start_date
      this.entries.forEach(task => {
        if (task.start_date < startDate) {
          startDate = task.start_date
        }
      })
      return startDate ? startDate.substring(0, 10) : ''
    },

    entityDueDate() {
      if (this.entries.length === 0) return ''
      let dueDate = this.entries[0].due_date
      this.entries.forEach(task => {
        if (task.due_date > dueDate) {
          dueDate = task.due_date
        }
      })
      return dueDate ? dueDate.substring(0, 10) : ''
    },

    entityAssignees() {
      return this.entries.reduce((acc, task) => {
        const fullTask = this.getTask(task.id)
        return [...acc, ...fullTask.assignees]
      }, [])
    }
  },

  methods: {
    onBodyScroll(event) {
      const position = event.target
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    },

    getTask(task) {
      if (typeof task === 'string') {
        return this.taskMap.get(task)
      } else {
        return task
      }
    },

    getTaskStartDate(task) {
      return task && task.start_date ? task.start_date.substring(0, 10) : ''
    },

    getTaskDueDate(task) {
      return task && task.due_date ? task.due_date.substring(0, 10) : ''
    },

    getTaskEstimation(task) {
      return task && task.estimation ? this.formatDuration(task.estimation) : ''
    },

    getTaskDuration(task) {
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
      if (task.id === this.currentTask?.id) {
        this.currentTask = null
      } else {
        this.currentTask = task
      }
      this.$emit('task-selected', task)
    }
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

.estimation {
  max-width: 50px;
  min-width: 50px;
  text-align: right;
}

.startdate,
.duedate {
  max-width: 100px;
  min-width: 100px;
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
</style>
