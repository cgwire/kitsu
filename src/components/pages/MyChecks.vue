<template>
<div class="columns fixed-page">
  <!--action-panel /-->

  <div class="column main-column">
    <div class="todos page">
      <div class="flexrow">

        <combobox-production
          class="flexrow-item"
          :label="$t('main.production')"
          :production-list="productionList"
          v-model="productionId"
          v-if="productionList.length > 0"
        />

        <combobox-task-type
          class="flexrow-item selector"
          :label="$t('news.task_type')"
          :task-type-list="taskTypeList"
          v-model="taskTypeId"
          v-if="taskTypeList.length > 0"
        />

        <combobox
          class="flexrow-item"
          :label="$t('main.show')"
          :options="filterOptions"
          locale-key-prefix="tasks."
          v-model="currentFilter"
        />

        <combobox
          class="flexrow-item"
          :label="$t('main.sorted_by')"
          :options="sortOptions"
          locale-key-prefix="tasks.fields."
          v-model="currentSort"
        />
      </div>

      <div class="flexrow">
        <h1 class="title mt1 flerow-item">
         {{ nbTasksToCheck }} tasks to check
        </h1>
        <div class="filler"></div>
        <ButtonSimple
          class="flexrow-item"
          @click="isPlaylist = true"
          text="Build playlist from list"
        />
      </div>

      <todos-list
        :tasks="sortedTasks"
        :is-loading="isLoading"
        :is-error="isLoadingError"
        :selection-grid="selectionGrid"
        :is-to-check="true"
        @task-selection-cleared="onTaskSelectionCleared"
        @task-selection-addition="onTaskSelectionAdded"
        @task-selection-removal="onTaskSelectionRemoved"
      />
    </div>

  </div>

  <div
    class="column side-column"
    v-if="nbSelectedTasks === 1"
  >
    <task-info
      :task="selectedTasks.values().next().value"
    />
  </div>

  <view-playlist-modal
    :active="isPlaylist"
    :task-ids="sortedTasks.map(t => t.id)"
    @cancel="isPlaylist = false"
  />
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import firstBy from 'thenby'

import { populateTask } from '@/lib/models'
import { sortByName } from '@/lib/sorting'
import {
  buildSelectionGrid,
  clearSelectionGrid
} from '@/lib/selection'
import { parseDate } from '@/lib/time'

import ActionPanel from '@/components/tops/ActionPanel'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import Combobox from '@/components/widgets/Combobox'
import ComboboxProduction from '@/components/widgets/ComboboxProduction'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType'
import TaskInfo from '@/components/sides/TaskInfo'
import TimesheetList from '@/components/lists/TimesheetList'
import TodosList from '@/components/lists/TodosList'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal'

export default {
  name: 'todos',

  components: {
    ActionPanel,
    ButtonSimple,
    Combobox,
    ComboboxProduction,
    ComboboxTaskType,
    TaskInfo,
    TimesheetList,
    TodosList,
    ViewPlaylistModal
  },

  data () {
    return {
      currentFilter: 'all_tasks',
      currentSort: 'priority',
      isLoading: false,
      isLoadingError: false,
      isPlaylist: false,
      filterOptions: [
        'all_tasks',
        'due_this_week'
      ].map(name => ({ label: name, value: name })),
      productionId: '',
      productionList: [],
      selectionGrid: {},
      sortOptions: [
        'entity_name',
        'priority',
        'due_date',
        'estimation',
        'last_comment_date'
      ].map(name => ({ label: name, value: name })),
      taskTypeId: '',
      taskTypeList: [],
      tasksToCheck: []
    }
  },

  mounted () {
    this.isLoading = true
    this.loadTasksToCheck()
      .then(tasks => {
        if (tasks) {
          tasks.forEach(populateTask)
          this.buildSelectionGrid(tasks)
          this.resetProductionList(tasks)
          this.resetTaskTypeList(tasks)
          this.tasksToCheck = tasks
          this.isLoading = false
        }
      })
      .catch(err => {
        console.error(err)
      })
  },

  afterDestroy () {
  },

  computed: {
    ...mapGetters([
      'nbSelectedTasks',
      'productionMap',
      'taskStatusMap',
      'taskTypeMap',
      'selectedTasks'
    ]),

    nbTasksToCheck () {
      return this.sortedTasks.filter(task => {
        return this.taskStatusMap.get(task.task_status_id).is_feedback_request
      }).length
    },

    sortedTasks () {
      const isName = this.currentSort === 'entity_name'
      const isPriority = this.currentSort === 'priority'
      const isDueDate = this.currentSort === 'due_date'
      let tasks = this.currentFilter === 'all_tasks'
        ? [...this.tasksToCheck]
        : this.tasksToCheck.filter(t => {
          const dueDate = parseDate(t.due_date)
          return moment().startOf('week').isSame(dueDate, 'week')
        })
      if (this.productionId !== '') {
        tasks = tasks.filter(t => t.project_id === this.productionId)
      }
      if (this.taskTypeId !== '') {
        tasks = tasks.filter(t => t.task_type_id === this.taskTypeId)
      }

      if (isName) {
        return tasks.sort(
          firstBy('project_name')
            .thenBy('task_type_name')
            .thenBy('full_entity_name')
        )
      } else if (isPriority) {
        return tasks.sort(
          firstBy('priority', -1)
            .thenBy(
              (a, b) => {
                if (!a.due_date) return 1
                else if (!b.due_date) return -1
                else return a.due_date.localeCompare(b.due_date)
              }
            )
            .thenBy('project_name')
            .thenBy('task_type_name')
            .thenBy('entity_name')
        )
      } else if (isDueDate) {
        return tasks.sort(
          firstBy(
            (a, b) => {
              if (!a.due_date) return 1
              else if (!b.due_date) return -1
              else return a.due_date.localeCompare(b.due_date)
            }
          )
            .thenBy('project_name')
            .thenBy('task_type_name')
            .thenBy('entity_name')
        )
      } else {
        return tasks.sort(
          firstBy(this.currentSort, -1)
            .thenBy('project_name')
            .thenBy('task_type_name')
            .thenBy('entity_name')
        )
      }
    }
  },

  methods: {
    ...mapActions([
      'loadTasksToCheck',
      'removeTodoSearch',
      'saveTodoSearch',
      'setTodosSearch'
    ]),

    buildSelectionGrid (tasks) {
      this.selectionGrid = buildSelectionGrid(tasks.length, 1)
    },

    resetProductionList (tasks = []) {
      const productionIds = {}
      const productionList = []
      tasks.forEach(task => {
        if (!productionIds[task.project_id]) {
          productionIds[task.project_id] = true
          productionList.push(this.productionMap.get(task.project_id))
        }
      })
      this.productionList = [{
        id: '',
        name: this.$t('main.all')
      }].concat(sortByName(productionList))
    },

    resetTaskTypeList (tasks) {
      const taskTypeIds = {}
      const taskTypeList = []
      tasks.forEach(task => {
        if (!taskTypeIds[task.task_type_id]) {
          taskTypeIds[task.task_type_id] = true
          taskTypeList.push(this.taskTypeMap.get(task.task_type_id))
        }
      })
      this.taskTypeList = [{
        id: '',
        color: '#999',
        name: this.$t('news.all')
      }].concat(sortByName(taskTypeList))
    },

    onTaskSelectionCleared () {
      this.buildSelectionGrid(this.sortedTasks)
    },

    onTaskSelectionAdded (selection) {
      this.selectionGrid[selection.x][selection.y] = true
    },

    onTaskSelectionRemoved (selection) {
      this.selectionGrid[selection.x][selection.y] = false
    }
  },

  socket: {
    events: {
      'task:assign' (eventData) {
      },

      'task:unassign' (eventData) {
      }
    }
  },

  watch: {
    nbSelectedTasks () {
      if (this.nbSelectedTasks === 0) {
        this.buildSelectionGrid(this.sortedTasks)
      }
    }
  },

  metaInfo () {
    return {
      title: `${this.$t('tasks.my_checks')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>

.data-list {
  margin-top: 0;
}

.data-list {
  margin-top: 0;
}

.todos {
  display: flex;
  flex-direction: column;
}

.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.main-column {
  border-right: 3px solid $light-grey;
}

.push-right {
  flex: 1;
  text-align: right;
}

.field {
  margin-bottom: 0;
}

</style>
