<template>
<div class="data-list">
  <table-info
    :is-loading="isLoading"
    :is-error="isLoadingError"
  />

  <div class="aggregated-time-spents">
    <div
      :key="projectId"
      class="by-project"
      v-for="projectId in Object.keys(projects)"
    >
      <production-name
        :project="{
          id: projectId,
          name: projectNames[projectId]
        }"
        v-if="projectNames[projectId]"
      />

      <div
        :key="taskTypeId"
        class="by-task-type-id"
        v-for="taskTypeId in Object.keys(projects[projectId])"
      >
        <task-type-name :task-type="taskTypeMap[taskTypeId]" />

        <div class="table-body">
          <table class="table">
            <tbody>
              <tr
                :key="task.id"
                class="by-task-type-id"
                v-for="task in projects[projectId][taskTypeId]"
              >
                <td class="name">{{ task.name }}</td>
                <td class="duration">{{ task.duration / 60 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import TableInfo from '../widgets/TableInfo'
import ProductionName from '../widgets/ProductionName'
import TaskTypeName from '../widgets/TaskTypeName'
import { sortByName } from '../../lib/sorting'

export default {
  name: 'timespent-task-list',

  components: {
    TableInfo,
    ProductionName,
    TaskTypeName
  },

  data () {
    return {
      projectNames: {}
    }
  },

  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isLoadingError: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'lastProductionScreen',
      'taskTypeMap'
    ]),

    projects () {
      const projects = {}
      this.tasks.forEach((task) => {
        if (!projects[task.project_id]) projects[task.project_id] = {}
        if (!projects[task.project_id][task.task_type_id]) {
          projects[task.project_id][task.task_type_id] = []
        }

        let name = task.entity_name
        if (['Shot', 'Sequence'].includes(task.entity_type_name)) {
          name = `${task.sequence_name} / ${name}`
          if (task.episode_name) name = `${task.episode_name} / ${name}`
        } else {
          name = `${task.entity_type_name} / ${name}`
        }

        projects[task.project_id][task.task_type_id].push({
          'id': task.id,
          'name': name,
          'duration': task.duration
        })
      })

      Object.keys(projects).forEach((projectId) => {
        Object.keys(projects[projectId]).forEach((taskTypeId) => {
          projects[projectId][taskTypeId] = sortByName(
            projects[projectId][taskTypeId]
          )
        })
      })

      return projects
    }
  },

  methods: {
    ...mapActions([
    ]),

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
    }
  },

  watch: {
    tasks () {
      this.projectNames = this.tasks.reduce((projectNames, task) => {
        projectNames[task.project_id] = task.project_name
        return projectNames
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .table {
  border-color: $dark-grey;
}

.name {
  width: 300px;
}

.duration {
  text-align: right;
}

.data-list {
  padding-right: 1em;
}

.table {
  border-top: 1px solid $light-grey;
  border-bottom: 1px solid $light-grey;
  margin-bottom: 1em;
  margin-top: 0.5em;
}

.by-task-type-id {
  margin-top: 1em;
  padding-left: 1em;
}
</style>
