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
          @enter="saveSearchQuery"
          @save="saveSearchQuery"
          :can-save="true"
        />

        <span class="filler"></span>

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
      <div
        class="query-list"
        v-if="isTabActive('todos') || isTabActive('timesheets')"
      >
        <search-query-list
          :queries="todoSearchQueries"
          @change-search="changeSearch"
          @remove-search="removeSearchQuery"
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
        :hide-done="loggableDoneTasks.length === 0"
        :hide-day-off="false"
        @date-changed="onDateChanged"
        @time-spent-change="onTimeSpentChange"
        @set-day-off="onSetDayOff"
        @unset-day-off="onUnsetDayOff"
        v-if="isTabActive('timesheets')"
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
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import firstBy from 'thenby'

import { parseDate } from '@/lib/time'
import Combobox from '@/components/widgets/Combobox'
import SearchField from '@/components/widgets/SearchField'
import SearchQueryList from '@/components/widgets/SearchQueryList'
import TaskInfo from '@/components/sides/TaskInfo'
import TimesheetList from '@/components/lists/TimesheetList'
import TodosList from '@/components/lists/TodosList'

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
      currentFilter: 'all_tasks',
      currentSort: 'priority',
      filterOptions: [
        'all_tasks',
        'due_this_week'
      ].map((name) => ({ label: name, value: name })),
      selectedDate: moment().format('YYYY-MM-DD'),
      sortOptions: [
        'entity_name',
        'priority',
        'task_status_short_name',
        'start_date',
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
    this.$nextTick(() => {
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
      return this.sortedTasks
        .filter((task) => {
          return this.taskTypeMap.get(task.task_type_id).allow_timelog
        })
    },

    loggableDoneTasks () {
      return this.displayedDoneTasks
        .filter(task => {
          return this.taskTypeMap.get(task.task_type_id).allow_timelog
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
      const isPriority = this.currentSort === 'priority'
      const isDueDate = this.currentSort === 'due_date'
      const isStartDate = this.currentSort === 'start_date'
      const tasks = this.currentFilter === 'all_tasks'
        ? [...this.displayedTodos]
        : this.displayedTodos.filter(t => {
          const dueDate = parseDate(t.due_date)
          return moment().startOf('week').isSame(dueDate, 'week')
        })
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
      } else if (isStartDate) {
        return tasks.sort(
          firstBy(
            (a, b) => {
              if (!a.start_date) return 1
              else if (!b.start_date) return -1
              else return a.start_date.localeCompare(b.start_date)
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
      'loadTodos',
      'loadOpenProductions',
      'removeTodoSearch',
      'saveTodoSearch',
      'setDayOff',
      'setTodoListScrollPosition',
      'setTodosSearch',
      'setTimeSpent',
      'unsetDayOff'
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

    onSetDayOff () {
      const dayOff = {
        personId: this.user.id,
        date: this.selectedDate
      }
      this.setDayOff(dayOff)
    },

    onUnsetDayOff () {
      const dayOff = {
        personId: this.user.id,
        date: this.selectedDate
      }
      this.unsetDayOff(dayOff)
      this.loadTodos({
        forced: true,
        date: this.selectedDate
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
