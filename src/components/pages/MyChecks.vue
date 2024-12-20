<template>
  <div class="columns fixed-page">
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

          <combobox
            class="flexrow-item"
            :label="$t('shots.fields.episode')"
            :options="episodeOptions"
            v-model="episodeId"
            v-show="productionId"
            v-if="episodeOptions.length > 0"
          />

          <combobox-task-type
            class="flexrow-item selector"
            :label="$t('news.task_type')"
            :task-type-list="taskTypeList"
            v-model="taskTypeId"
            v-if="taskTypeList.length > 0"
          />

          <combobox-status
            class="flexrow-item selector"
            :label="$t('news.task_status')"
            :task-status-list="taskStatusList"
            v-model="taskStatusId"
          />

          <div class="field flexrow-item selector">
            <label class="label person-label">
              {{ $t('main.person') }}
            </label>
            <people-field :people="assignees" small v-model="person" />
          </div>

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
          <h1 class="title mt1 flexrow-item filler">
            {{ nbTasksToCheck }}
            {{ $tc('my_checks.title', nbTasksToCheck) }}
          </h1>
          <button-simple
            class="flexrow-item"
            @click="isPlaylist = true"
            :text="$t('tasks.build_playlist')"
          />
        </div>

        <todos-list
          :tasks="sortedTasks"
          :is-loading="isLoading"
          :is-error="isLoadingError"
          :selection-grid="selectionGrid"
          :is-to-check="true"
        />
      </div>
    </div>

    <div class="column side-column" v-if="nbSelectedTasks === 1">
      <task-info :task="selectedTasks.values().next().value" />
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
import { sortByName, sortPeople } from '@/lib/sorting'
import { buildSelectionGrid } from '@/lib/selection'
import { parseDate } from '@/lib/time'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import TodosList from '@/components/lists/TodosList.vue'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'

export default {
  name: 'my-checks',

  components: {
    ButtonSimple,
    Combobox,
    ComboboxProduction,
    ComboboxStatus,
    ComboboxTaskType,
    PeopleField,
    TaskInfo,
    TodosList,
    ViewPlaylistModal
  },

  data() {
    return {
      currentFilter: 'all_tasks',
      currentSort: 'priority',
      episodeId: '',
      isLoading: false,
      isLoadingError: false,
      isPlaylist: false,
      filterOptions: ['all_tasks', 'due_this_week'].map(name => ({
        label: name,
        value: name
      })),
      person: {},
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
      taskStatusId: '',
      taskTypeId: '',
      taskStatusList: [],
      taskTypeList: [],
      tasksToCheck: []
    }
  },

  mounted() {
    this.isLoading = true
    this.clearSelectedTasks()
    this.loadTasksToCheck()
      .then(tasks => {
        if (tasks) {
          tasks.forEach(populateTask)
          this.buildSelectionGrid(tasks)
          this.resetProductionList(tasks)
          this.resetTaskTypeList(tasks)
          this.resetTaskStatusList(tasks)
          this.tasksToCheck = tasks
          this.isLoading = false
        }
      })
      .catch(err => {
        console.error(err)
      })
  },

  computed: {
    ...mapGetters([
      'nbSelectedTasks',
      'personMap',
      'productionMap',
      'selectedTasks',
      'taskStatusMap',
      'taskTypeMap'
    ]),

    nbTasksToCheck() {
      return this.sortedTasks.filter(task => {
        return this.taskStatusMap.get(task.task_status_id).is_feedback_request
      }).length
    },

    assignees() {
      const assignees = []
      const assigneesMap = {}
      this.tasksToCheck.forEach(task => {
        task.assignees.forEach(personId => {
          if (!assigneesMap[personId]) {
            assignees.push(this.personMap.get(personId))
            assigneesMap[personId] = true
          }
        })
      })
      return sortPeople(assignees)
    },

    episodeOptions() {
      const episodeOptions = []
      const episodeMap = {}
      if (!this.productionId) return []
      const production = this.productionMap.get(this.productionId)
      if (production.production_type !== 'tvshow') return []
      this.tasksToCheck
        .filter(t => t.project_id === this.productionId)
        .forEach(task => {
          if (
            task.episode_id &&
            !episodeMap[task.episode_id] &&
            task.entity_type_name === 'Shot'
          ) {
            episodeMap[task.episode_id] = true
            episodeOptions.push({
              label: task.episode_name,
              value: task.episode_id
            })
          }
        })
      return [
        {
          label: this.$t('main.all'),
          value: 'all'
        }
      ].concat(
        episodeOptions.sort((a, b) =>
          a.label.localeCompare(b.label, undefined, {
            numeric: true
          })
        )
      )
    },

    filteredTasks() {
      let tasks =
        this.currentFilter === 'all_tasks'
          ? [...this.tasksToCheck]
          : this.tasksToCheck.filter(t => {
              const dueDate = parseDate(t.due_date)
              return moment().startOf('week').isSame(dueDate, 'week')
            })
      if (this.productionId !== '') {
        tasks = tasks.filter(t => t.project_id === this.productionId)
      }
      if (this.taskTypeId !== '') {
        tasks = tasks.filter(t => t.task_type_id === this.taskTypeId)
      }
      if (this.taskStatusId !== '') {
        tasks = tasks.filter(t => t.task_status_id === this.taskStatusId)
      }
      if (this.person && this.person.id) {
        tasks = tasks.filter(t => t.assignees.includes(this.person.id))
      }
      if (this.productionId && this.episodeId && this.episodeId !== 'all') {
        tasks = tasks.filter(t => t.episode_id === this.episodeId)
      }
      return tasks
    },

    sortedTasks() {
      const isName = this.currentSort === 'entity_name'
      const isPriority = this.currentSort === 'priority'
      const isDueDate = this.currentSort === 'due_date'
      const tasks = [...this.filteredTasks]
      if (isName) {
        return tasks.sort(
          firstBy('project_name')
            .thenBy('task_type_name')
            .thenBy('full_entity_name')
        )
      } else if (isPriority) {
        return tasks.sort(
          firstBy('priority', -1)
            .thenBy((a, b) => {
              if (!a.due_date) return 1
              else if (!b.due_date) return -1
              else return a.due_date.localeCompare(b.due_date)
            })
            .thenBy('project_name')
            .thenBy('task_type_name')
            .thenBy('entity_name')
        )
      } else if (isDueDate) {
        return tasks.sort(
          firstBy((a, b) => {
            if (!a.due_date) return 1
            else if (!b.due_date) return -1
            else return a.due_date.localeCompare(b.due_date)
          })
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
      'clearSelectedTasks',
      'loadTasksToCheck',
      'removeTodoSearch',
      'saveTodoSearch',
      'setTodosSearch'
    ]),

    buildSelectionGrid(tasks) {
      this.selectionGrid = buildSelectionGrid(tasks.length, 1)
    },

    resetProductionList(tasks = []) {
      const productionIds = {}
      const productionList = []
      tasks.forEach(task => {
        if (!productionIds[task.project_id]) {
          productionIds[task.project_id] = true
          productionList.push(this.productionMap.get(task.project_id))
        }
      })
      this.productionList = [
        {
          id: '',
          name: this.$t('main.all')
        }
      ].concat(sortByName(productionList))
    },

    resetTaskTypeList(tasks) {
      const taskTypeIds = {}
      const taskTypeList = []
      tasks.forEach(task => {
        if (!taskTypeIds[task.task_type_id]) {
          taskTypeIds[task.task_type_id] = true
          taskTypeList.push(this.taskTypeMap.get(task.task_type_id))
        }
      })
      this.taskTypeList = [
        {
          id: '',
          color: '#999',
          name: this.$t('news.all')
        }
      ].concat(sortByName(taskTypeList))
    },

    resetTaskStatusList(tasks) {
      const taskStatusIds = {}
      const taskStatusList = []
      tasks.forEach(task => {
        if (!taskStatusIds[task.task_status_id]) {
          taskStatusIds[task.task_status_id] = true
          taskStatusList.push(this.taskStatusMap.get(task.task_status_id))
        }
      })
      this.taskStatusList = [
        {
          id: '',
          color: '#999',
          name: this.$t('news.all'),
          short_name: this.$t('news.all')
        }
      ].concat(sortByName(taskStatusList))
    }
  },

  socket: {
    events: {
      'task:assign'(eventData) {},

      'task:unassign'(eventData) {}
    }
  },

  watch: {
    productionId() {
      this.episodeId = ''
    },

    nbSelectedTasks() {
      if (this.nbSelectedTasks === 0) {
        this.buildSelectionGrid(this.sortedTasks)
      }
    }
  },

  head() {
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

.push-right {
  flex: 1;
  text-align: right;
}

.field {
  margin-bottom: 0;
}
</style>
