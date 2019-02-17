<template>
<div class="data-list">

  <div style="overflow: hidden">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="type">
            {{ $t('tasks.fields.task_type') }}
          </th>
          <th class="status">
            {{ $t('tasks.fields.task_status') }}
          </th>
          <th class="assignees">
            {{ $t('tasks.fields.assignees') }}
          </th>
        </tr>
      </thead>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <div class="table-body" v-scroll="onBodyScroll" v-if="entries.length > 0">
    <table class="table">
      <tbody>
        <tr v-for="task in entries" :key="task.task_type_id">
          <task-type-name
            class="type"
            :entry="getTaskType(task)"
            :production-id="currentProduction.id"
            v-if="getTaskType(task)"
          >
          </task-type-name>
          <td class="status">
            <validation-tag
              :task="getTask(task)"
              v-if="getTask(task)"
            />
          </td>
          <td class="assignees">
            <div class="flexrow">
              <div
                class="avatar-wrapper"
                :key="personId"
                v-for="personId in getAssignees(task)"
              >
                <people-avatar
                  class="person-avatar flexrow-item"
                  :key="task.id + '-' + personId"
                  :person="personMap[personId]"
                  :size="30"
                  :font-size="15"
                />
              </div>
            </div>
          </td>
       </tr>
      </tbody>
    </table>
  </div>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import TaskTypeName from '../cells/TaskTypeName'
import TableInfo from '../widgets/TableInfo'
import ValidationTag from '../widgets/ValidationTag'
import PeopleAvatar from '../widgets/PeopleAvatar'

export default {
  name: 'todos-list',

  components: {
    TableInfo,
    TaskTypeName,
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

  computed: {
    ...mapGetters([
      'currentProduction',
      'personMap',
      'taskMap',
      'taskTypeMap'
    ])
  },

  methods: {
    ...mapActions([
    ]),

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    },

    getTask (task) {
      if (typeof (task) === 'string') {
        return this.taskMap[task]
      } else {
        return task
      }
    },

    getTaskType (entry) {
      const task = this.getTask(entry)
      return task ? this.taskTypeMap[task.task_type_id] : null
    },

    getAssignees (entry) {
      const task = this.getTask(entry)
      return task ? task.assignees : []
    }
  }
}
</script>

<style lang="scss" scoped>
.data-list {
  max-width: 500px;
}

.type {
  max-width: 250px;
  min-width: 250px;
}

.status {
  max-width: 100px;
  min-width: 100px;
}

.assignees {
  max-width: 150px;
  min-width: 150px;
}

.flexrow-item {
  margin-right: 0.3em;
}

.avatar-wrapper {
  margin-right: 0.5em;
}
</style>
