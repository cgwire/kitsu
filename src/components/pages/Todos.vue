<template>
<div class="columns fixed-page">
  <div class="column main-column">
    <div class="todos page">
      <div class="task-tabs tabs">
        <ul>
          <li
            :class="{'is-active': isTabActive('todos')}"
          >
            <router-link :to="{
              name: 'todos',
            }">
              {{ $t('tasks.current')}}
            </router-link>
          </li>
          <li
            :class="{'is-active': isTabActive('done')}"
            @click="selectTab('done')"
          >
            <router-link :to="{
              name: 'todos-tab',
              params: {tab: 'done'}
            }">
              {{ $t('tasks.done') }} ({{ displayedDoneTasks.length }})
            </router-link>
          </li>
          <li
            :class="{'is-active': isTabActive('timesheets')}"
            @click="selectTab('timesheets')"
          >
            <router-link :to="{
              name: 'todos-tab',
              params: {tab: 'timesheets'}
            }">
              {{ $t('timesheets.title') }}
            </router-link>
          </li>
        </ul>
      </div>

      <div class="flexrow">
        <search-field
          :class="{
            'search-field': true,
            'flexrow-item': true
          }"
          ref="todos-search-field"
          @change="onSearchChange"
          @save="saveSearchQuery"
          :can-save="true"
          v-if="!isTabActive('done')"
        />
        <span class="flexrow-item push-right">
        </span>
        <span class="flexrow-item">
        </span>
        <combobox
          class="flexrow-item"
          :label="$t('main.sorted_by')"
          :options="sortOptions"
          locale-key-prefix="tasks.fields."
          v-model="currentSort"
        />
      </div>
      <div
        class="query-list"
        v-if="isTabActive('todos') || isTabActive('timesheets')"
      >
        <search-query-list
          :queries="todoSearchQueries"
          @changesearch="changeSearch"
          @removesearch="removeSearchQuery"
        />
      </div>

      <todos-list
        ref="todo-list"
        :tasks="sortedTasks"
        :is-loading="isTodosLoading"
        :is-error="isTodosLoadingError"
        :selection-grid="todoSelectionGrid"
        v-if="isTabActive('todos')"
        @scroll="setTodoListScrollPosition"
      />

      <div v-if="isTabActive('done')">
        &nbsp;
      </div>
      <todos-list
        ref="done-list"
        :tasks="displayedDoneTasks"
        :is-loading="isTodosLoading"
        :is-error="isTodosLoadingError"
        :done="true"
        v-if="isTabActive('done')"
      />

      <timesheet-list
        ref="timesheet-list"
        :tasks="loggableTodos"
        :done-tasks="loggableDoneTasks"
        :is-loading="isTodosLoading"
        :is-error="isTodosLoadingError"
        :time-spent-map="timeSpentMap"
        :time-spent-total="timeSpentTotal"
        :hide-done="todosSearchText.length > 0 || loggableDoneTasks.length === 0"
        @date-changed="onDateChanged"
        @time-spent-change="onTimeSpentChange"
        v-if="isTabActive('timesheets')"
      />
    </div>
  </div>

  <div
    class="column side-column"
    v-if="nbSelectedTasks === 1"
  >
    <task-info
      :task="Object.values(selectedTasks)[0]"
    />
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import firstBy from 'thenby'

import Combobox from '../widgets/Combobox'
import SearchField from '../widgets/SearchField'
import SearchQueryList from '../widgets/SearchQueryList'
import TaskInfo from '../sides/TaskInfo'
import TimesheetList from '../lists/TimesheetList'
import TodosList from '../lists/TodosList'

export default {
  name: 'todos',

  components: {
    Combobox,
    SearchField,
    SearchQueryList,
    TaskInfo,
    TimesheetList,
    TodosList
  },

  data () {
    return {
      activeTab: 'todos',
      currentSort: 'priority',
      selectedDate: moment().format('YYYY-MM-DD'),
      sortOptions: [
        'entity_name',
        'priority',
        'task_status_short_name',
        'due_date',
        'estimation',
        'last_comment_date'
      ].map((name) => ({ label: name, value: name }))
    }
  },

  mounted () {
    this.updateActiveTab()
    if (this.todosSearchText.length > 0) {
      this.$refs['todos-search-field'].setValue(this.todosSearchText)
    }
    this.loadTodos({
      date: this.selectedDate,
      callback: () => {
        if (this.todoList) {
          this.$nextTick(() => {
            this.todoList.setScrollPosition(
              this.todoListScrollPosition
            )
          })
        }
        this.resizeHeaders()
      }
    })
  },

  afterDestroy () {
    this.$store.commit(
      'USER_LOAD_TODOS_END',
      { tasks: [], userFilters: {}, taskTypeMap: this.taskTypeMap }
    )
  },

  computed: {
    ...mapGetters([
      'displayedDoneTasks',
      'displayedTodos',
      'isTodosLoading',
      'isTodosLoadingError',
      'nbSelectedTasks',
      'selectedTasks',
      'taskTypeMap',
      'todosSearchText',
      'timeSpentMap',
      'timeSpentTotal',
      'todoListScrollPosition',
      'todoSelectionGrid',
      'todoSearchQueries',
      'user'
    ]),

    loggableTodos () {
      return this.displayedTodos
        .filter((task) => {
          return this.taskTypeMap[task.task_type_id].allow_timelog
        })
    },

    loggableDoneTasks () {
      return this.displayedDoneTasks
        .filter((task) => {
          return this.taskTypeMap[task.task_type_id].allow_timelog
        })
    },

    todoList () {
      return this.$refs['todo-list']
    },

    haveDoneList () {
      return this.$refs['done-list']
    },

    sortedTasks () {
      const isName = this.currentSort === 'entity_name'
      const tasks = [...this.displayedTodos]
      if (isName) {
        return tasks.sort(
          firstBy('project_name')
            .thenBy('task_type_name')
            .thenBy('full_entity_name')
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
      'loadTodos',
      'loadOpenProductions',
      'removeTodoSearch',
      'saveTodoSearch',
      'setTodoListScrollPosition',
      'setTodosSearch',
      'setTimeSpent'
    ]),

    isTabActive (tab) {
      return this.activeTab === tab
    },

    resizeHeaders () {
      this.$nextTick(() => {
        if (this.todoList) this.todoList.resizeHeaders()
        if (this.haveDoneList) this.haveDoneList.resizeHeaders()
      })
    },

    selectTab (tab) {
      this.activeTab = tab
      this.resizeHeaders()
      setTimeout(() => {
        if (this.$refs['todos-search-field']) {
          this.$refs['todos-search-field'].focus()
        }
      }, 300)
    },

    updateActiveTab () {
      if (['done', 'timesheets'].includes(this.$route.params.tab)) {
        this.activeTab = this.$route.params.tab
      } else {
        this.activeTab = 'todos'
      }
    },

    onSearchChange (text) {
      this.setTodosSearch(text)
    },

    changeSearch (searchQuery) {
      this.$refs['todos-search-field'].setValue(searchQuery.search_query)
      this.$refs['todos-search-field'].$emit('change', searchQuery.search_query)
    },

    saveSearchQuery (searchQuery) {
      this.saveTodoSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.error(err)
        })
    },

    removeSearchQuery (searchQuery) {
      this.removeTodoSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.error(err)
        })
    },

    onDateChanged (date) {
      this.selectedDate = moment(date).format('YYYY-MM-DD')
      this.loadTodos({
        date: this.selectedDate,
        forced: true
      })
    },

    onTimeSpentChange (timeSpentInfo) {
      timeSpentInfo.personId = this.user.id
      timeSpentInfo.date = this.selectedDate
      this.setTimeSpent(timeSpentInfo)
    },

    onAssignation (eventData) {
      if (this.user.id === eventData.person_id) {
        this.loadOpenProductions(() => {
          this.loadTodos({
            forced: true,
            date: this.selectedDate,
            callback: () => {
              if (this.todoList) {
                this.$nextTick(() => {
                  this.todoList.setScrollPosition(this.todoListScrollPosition)
                })
              }
              this.resizeHeaders()
            }
          })
        })
      }
    }
  },

  socket: {
    events: {
      'task:assign' (eventData) {
        this.onAssignation(eventData)
      },

      'task:unassign' (eventData) {
        this.onAssignation(eventData)
      }
    }
  },

  watch: {
    $route () {
      this.updateActiveTab()
    }
  },

  metaInfo () {
    return {
      title: `${this.$t('tasks.my_tasks')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.task-tabs {
  margin-top: 1em;
  margin-bottom: 1em;
  font-size: 1.1em;

  ul {
    margin-left: 0;
  }
}

.data-list {
  margin-top: 0;
}

.search-field {
  margin-top: 1em;
  margin-bottom: 1em;
}

.query-list {
  margin-bottom: 2em;
}

.dark .main-column {
  border-right: 3px solid $grey-strong;
}

.data-list {
  margin-top: 0;
}

.level {
  align-items: flex-start
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
