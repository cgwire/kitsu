<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="todos page">
        <route-section-tabs
          class="section-tabs"
          :activeTab="currentSection"
          :route="$route"
          :tabs="todoTabs"
        />

        <div class="flexrow">
          <search-field
            class="flexrow-item search-field"
            ref="todos-search-field"
            @change="onSearchChange"
            @save="saveSearchQuery"
            :can-save="true"
          />

          <combobox-production
            v-if="isTabActive('board')"
            class="flexrow-item production-field"
            :label="$t('main.production')"
            :production-list="openProductions"
            v-model="productionId"
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
          v-if="
            isTabActive('todos') ||
            isTabActive('timesheets') ||
            isTabActive('board')
          "
        >
          <search-query-list
            :queries="todoSearchQueries"
            type="todo"
            @change-search="changeSearch"
            @remove-search="removeSearchQuery"
          />
        </div>

        <todos-list
          ref="todo-list"
          :empty-text="$t('people.no_task_assigned')"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :tasks="notPendingTasks"
          :selection-grid="todoSelectionGrid"
          @scroll="setTodoListScrollPosition"
          v-if="isTabActive('todos')"
        />

        <div v-if="isTabActive('pending')">&nbsp;</div>
        <todos-list
          ref="pending-list"
          :empty-text="$t('people.no_task_assigned')"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :tasks="pendingTasks"
          :selection-grid="todoSelectionGrid"
          @scroll="setTodoListScrollPosition"
          v-if="isTabActive('pending')"
        />

        <div v-if="isTabActive('done')">&nbsp;</div>
        <todos-list
          ref="done-list"
          class="done-list"
          :tasks="displayedDoneTasks"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :selection-grid="doneSelectionGrid"
          :done="true"
          v-if="isTabActive('done')"
        />

        <kanban-board
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :statuses="boardStatuses"
          :tasks="boardTasks"
          v-if="isTabActive('board')"
        />

        <user-calendar
          ref="user-calendar"
          :tasks="sortedTasks"
          v-if="isTabActive('calendar')"
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

    <div class="column side-column" v-if="nbSelectedTasks >= 1">
      <task-info :task="selectedTasks.values().next().value" with-actions />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import firstBy from 'thenby'

import { sortTaskStatuses } from '@/lib/sorting'
import { parseDate } from '@/lib/time'

import Combobox from '@/components/widgets/Combobox'
import ComboboxProduction from '@/components/widgets/ComboboxProduction'
import KanbanBoard from '@/components/lists/KanbanBoard'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs'
import SearchField from '@/components/widgets/SearchField'
import SearchQueryList from '@/components/widgets/SearchQueryList'
import TaskInfo from '@/components/sides/TaskInfo'
import TimesheetList from '@/components/lists/TimesheetList'
import TodosList from '@/components/lists/TodosList'
import UserCalendar from '@/components/widgets/UserCalendar'

export default {
  name: 'todos',

  components: {
    Combobox,
    ComboboxProduction,
    KanbanBoard,
    RouteSectionTabs,
    SearchField,
    SearchQueryList,
    TaskInfo,
    TimesheetList,
    TodosList,
    UserCalendar
  },

  data() {
    return {
      currentFilter: 'all_tasks',
      currentSort: 'priority',
      currentSection: 'todos',
      filterOptions: ['all_tasks', 'due_this_week'].map(name => ({
        label: name,
        value: name
      })),
      loading: {
        savingSearch: false
      },
      productionId: null,
      selectedDate: moment().format('YYYY-MM-DD'),
      sortOptions: [
        'entity_name',
        'priority',
        'task_status_short_name',
        'start_date',
        'due_date',
        'estimation',
        'last_comment_date'
      ].map(name => ({ label: name, value: name }))
    }
  },

  mounted() {
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
              this.todoList.setScrollPosition(this.todoListScrollPosition)
            })
          }
          this.resizeHeaders()
        }
      })
    })
  },

  afterDestroy() {
    this.$store.commit('USER_LOAD_TODOS_END', {
      tasks: [],
      userFilters: {},
      taskTypeMap: this.taskTypeMap
    })
  },

  computed: {
    ...mapGetters([
      'displayedDoneTasks',
      'displayedTodos',
      'doneSelectionGrid',
      'getProductionTaskStatuses',
      'isTodosLoading',
      'isTodosLoadingError',
      'nbSelectedTasks',
      'openProductions',
      'productionMap',
      'selectedTasks',
      'taskStatuses',
      'taskTypeMap',
      'timeSpentMap',
      'timeSpentTotal',
      'todoListScrollPosition',
      'todoSearchQueries',
      'todoSelectionGrid',
      'todosSearchText',
      'user'
    ]),

    boardTasks() {
      const tasks = this.sortedTasks.concat(this.displayedDoneTasks)
      return tasks.filter(task => task.project_id === this.productionId)
    },

    boardStatuses() {
      const production = this.productionMap.get(this.productionId)
      const statuses = this.getProductionTaskStatuses(this.productionId).filter(
        status => {
          if (status.for_concept) {
            return false
          }
          const roles_for_board =
            production.task_statuses_link?.[status.id]?.roles_for_board
          return roles_for_board?.includes(this.user.role)
        }
      )
      return sortTaskStatuses(statuses, production)
    },

    pendingTasks() {
      return this.sortedTasks.filter(
        task => task.taskStatus.is_feedback_request
      )
    },

    notPendingTasks() {
      return this.sortedTasks.filter(
        task => !task.taskStatus.is_feedback_request
      )
    },

    todoTabs() {
      return [
        {
          label: this.$t('board.title'),
          name: 'todos'
        },
        {
          label: this.$t('tasks.board'),
          name: 'board'
        },
        {
          label:
            this.$t('tasks.pending') + ' (' + this.pendingTasks.length + ')',
          name: 'pending'
        },
        {
          label:
            this.$t('tasks.validated') +
            ' (' +
            this.displayedDoneTasks.length +
            ')',
          name: 'done'
        },
        {
          label: this.$t('tasks.calendar'),
          name: 'calendar'
        },
        {
          label: this.$t('timesheets.title'),
          name: 'timesheets'
        }
      ]
>>>>>>> wiptodo
    },

    loggableTodos() {
      return this.sortedTasks.filter(task => {
        return this.taskTypeMap.get(task.task_type_id).allow_timelog
      })
    },

    loggableDoneTasks() {
      return this.displayedDoneTasks.filter(task => {
        return this.taskTypeMap.get(task.task_type_id).allow_timelog
      })
    },

    todoList() {
      return this.$refs['todo-list']
    },

    haveDoneList() {
      return this.$refs['done-list']
    },

    sortedTasks() {
      const isName = this.currentSort === 'entity_name'
      const isPriority = this.currentSort === 'priority'
      const isDueDate = this.currentSort === 'due_date'
      const isStartDate = this.currentSort === 'start_date'
      const tasks =
        this.currentFilter === 'all_tasks'
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
      } else if (isStartDate) {
        return tasks.sort(
          firstBy((a, b) => {
            if (!a.start_date) return 1
            else if (!b.start_date) return -1
            else return a.start_date.localeCompare(b.start_date)
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

    isTabActive(tab) {
      return this.currentSection === tab
    },

    resizeHeaders() {
      this.$nextTick(() => {
        if (this.todoList) this.todoList.resizeHeaders()
        if (this.haveDoneList) this.haveDoneList.resizeHeaders()
      })
    },

    selectTab(tab) {
      this.activeTab = tab
      this.resizeHeaders()
      setTimeout(() => {
        if (this.$refs['todos-search-field']) {
          this.$refs['todos-search-field'].focus()
        }
      }, 300)
    },

    updateActiveTab() {
      const tab = this.$route.params.tab
      if (['board', 'done', 'timesheets'].includes(tab)) {
        this.activeTab = this.$route.params.tab

        if (tab === 'board') {
          const currentProduction = this.openProductions.find(
            ({ id }) => id === this.$route.query.productionId
          )
          if (currentProduction) {
            this.productionId = currentProduction.id
          } else {
            if (!this.productionId) {
              this.productionId = this.openProductions?.[0]?.id
            }
            this.$router.push({
              query: { productionId: this.productionId }
            })
          }
        }
      } else {
        this.activeTab = 'todos'
      }
      this.clearSelectedTasks()
    },

    onSearchChange(text) {
      this.setTodosSearch(text)
    },

    changeSearch(searchQuery) {
      this.$refs['todos-search-field'].setValue(searchQuery.search_query)
      this.$refs['todos-search-field'].$emit('change', searchQuery.search_query)
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      this.loading.savingSearch = true
      this.saveTodoSearch(searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    removeSearchQuery(searchQuery) {
      this.removeTodoSearch(searchQuery).catch(err => {
        if (err) console.error(err)
      })
    },

    onDateChanged(date) {
      this.selectedDate = moment(date).format('YYYY-MM-DD')
      this.loadTodos({
        date: this.selectedDate,
        forced: true
      })
    },

    onSetDayOff() {
      const dayOff = {
        personId: this.user.id,
        date: this.selectedDate
      }
      this.setDayOff(dayOff)
    },

    onUnsetDayOff() {
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

    onTimeSpentChange(timeSpentInfo) {
      timeSpentInfo.personId = this.user.id
      timeSpentInfo.date = this.selectedDate
      this.setTimeSpent(timeSpentInfo)
    },

    async onAssignation(eventData) {
      if (this.user.id === eventData.person_id) {
        await this.loadOpenProductions()
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
      }
    }
  },

  socket: {
    events: {
      'task:assign'(eventData) {
        this.onAssignation(eventData)
      },

      'task:unassign'(eventData) {
        this.onAssignation(eventData)
      }
    }
  },

  watch: {
    productionId() {
      this.$router.push({
        query: { productionId: this.productionId }
      })
    },

    '$route.query.section'() {
      this.updateActiveTab()
    },

    $route() {
      this.currentSection = this.$route.query.section || 'todos'
    }
  },

  metaInfo() {
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
  margin: 25px 2em 5px 0;
}

.query-list {
  margin-top: 0.5em;
}

.done-list {
  margin-top: 2em;
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
