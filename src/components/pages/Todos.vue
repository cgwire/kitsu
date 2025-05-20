<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="todos page">
        <route-section-tabs
          class="section-tabs mt05"
          :active-tab="currentSection"
          :route="$route"
          :tabs="todoTabs"
        />

        <div class="flexrow" v-show="!isActiveTab('daysoff')">
          <search-field
            ref="todos-search-field"
            class="flexrow-item search-field"
            :can-save="true"
            @change="onSearchChange"
            @save="saveSearchQuery"
          />

          <combobox-production
            class="flexrow-item production-field"
            :label="$t('main.production')"
            :production-list="productionList"
            v-model="productionId"
            v-if="isActiveTab('board')"
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
        <div class="query-list" v-if="!isActiveTab('daysoff')">
          <search-query-list
            :queries="todoSearchQueries"
            type="todo"
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
          v-if="isActiveTab('todos')"
        />

        <div v-if="isActiveTab('pending')">&nbsp;</div>
        <todos-list
          ref="pending-list"
          :empty-text="$t('people.no_task_assigned')"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :tasks="pendingTasks"
          :selection-grid="todoSelectionGrid"
          @scroll="setTodoListScrollPosition"
          v-if="isActiveTab('pending')"
        />

        <div v-if="isActiveTab('done')">&nbsp;</div>
        <todos-list
          ref="done-list"
          class="done-list"
          :tasks="sortedDoneTasks"
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :selection-grid="doneSelectionGrid"
          :done="true"
          v-if="isActiveTab('done')"
        />

        <kanban-board
          :is-loading="isTodosLoading"
          :is-error="isTodosLoadingError"
          :statuses="boardStatuses"
          :tasks="boardTasks"
          :user="user"
          :production="selectedProduction"
          v-if="isActiveTab('board')"
        />

        <user-calendar
          ref="user-calendar"
          :days-off="daysOff"
          :tasks="sortedTasks"
          v-if="isActiveTab('calendar')"
        />

        <timesheet-list
          ref="timesheet-list"
          :tasks="loggableTodos"
          :done-tasks="loggableDoneTasks"
          :is-loading="loading.timesheets || isTodosLoading"
          :is-error="isTodosLoadingError"
          :day-off-error="dayOffError"
          :time-spent-map="timeSpentMap"
          :time-spent-total="timeSpentTotal"
          :hide-done="loggableDoneTasks.length === 0"
          :hide-day-off="false"
          @date-changed="onDateChanged"
          @time-spent-change="onTimeSpentChange"
          @set-day-off="onSetDayOff"
          @unset-day-off="onUnsetDayOff"
          v-if="isActiveTab('timesheets')"
        />

        <day-off-list
          ref="day-off-list"
          :days-off="daysOff"
          :day-off-error="dayOffError"
          @set-day-off="onSetDayOff"
          @unset-day-off="onUnsetDayOff"
          v-if="isActiveTab('daysoff')"
        />
      </div>
    </div>

    <div class="column side-column" v-if="nbSelectedTasks > 0">
      <task-info :task="selectedTasks.values().next().value" with-actions />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import firstBy from 'thenby'

import { searchMixin } from '@/components/mixins/search'

import { sortTaskStatuses } from '@/lib/sorting'
import { parseDate } from '@/lib/time'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import DayOffList from '@/components/lists/DayOffList.vue'
import KanbanBoard from '@/components/lists/KanbanBoard.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import TimesheetList from '@/components/lists/TimesheetList.vue'
import TodosList from '@/components/lists/TodosList.vue'
import UserCalendar from '@/components/widgets/UserCalendar.vue'

export default {
  name: 'todos',

  mixins: [searchMixin],

  components: {
    Combobox,
    ComboboxProduction,
    DayOffList,
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
      daysOff: [],
      dayOffError: false,
      filterOptions: ['all_tasks', 'due_this_week'].map(name => ({
        label: name,
        value: name
      })),
      loading: {
        timesheets: false,
        savingSearch: false
      },
      productionId: undefined,
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

  async mounted() {
    this.updateActiveTab()
    await this.$nextTick()
    await this.loadData()
    this.setSearchFromUrl()
    this.onSearchChange()
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

    searchField() {
      return this.$refs['todos-search-field']
    },

    boardTasks() {
      const tasks = this.sortedTasks.concat(this.sortedDoneTasks)
      if (this.selectedProduction) {
        return tasks.filter(
          task => task.project_id === this.selectedProduction.id
        )
      }
      return tasks
    },

    boardStatuses() {
      if (this.selectedProduction) {
        return this.getBoardStatusesByProduction(this.selectedProduction)
      }

      const productionsByStatus = {}
      this.openProductions.forEach(production => {
        const statuses = this.getBoardStatusesByProduction(production)
        statuses.forEach(status => {
          if (!productionsByStatus[status.id]) {
            productionsByStatus[status.id] = []
          }
          productionsByStatus[status.id].push(production.id)
        })
      })

      return this.taskStatuses
        .filter(status => !status.for_concept)
        .map(status => ({
          ...status,
          productions: productionsByStatus[status.id] || []
        }))
        .filter(status => status.productions.length > 0)
        .sort((a, b) => a.priority - b.priority)
    },

    productionList() {
      return [{ name: this.$t('main.all') }, ...this.openProductions]
    },

    selectedProduction() {
      return this.productionMap.get(this.productionId)
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
      const hasAvailableBoard = this.openProductions.some(
        production => this.getBoardStatusesByProduction(production).length
      )
      return [
        {
          label: this.$t('main.tasks'),
          name: 'todos'
        },
        hasAvailableBoard
          ? {
              label: this.$t('board.title'),
              name: 'board'
            }
          : undefined,
        {
          label: this.$t('tasks.calendar'),
          name: 'calendar'
        },
        {
          label: `${this.$t('tasks.pending')} (${this.pendingTasks.length})`,
          name: 'pending'
        },
        {
          label: `${this.$t('tasks.validated')} (${
            this.sortedDoneTasks.length
          })`,
          name: 'done'
        },
        {
          label: this.$t('timesheets.title'),
          name: 'timesheets'
        },
        {
          label: this.$t('days_off.title'),
          name: 'daysoff'
        }
      ].filter(Boolean)
    },

    loggableTodos() {
      return this.sortedTasks.filter(task => {
        return this.taskTypeMap.get(task.task_type_id).allow_timelog
      })
    },

    loggableDoneTasks() {
      return this.sortedDoneTasks.filter(task => {
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
      return this.sortTasks(
        this.displayedTodos,
        this.currentFilter,
        this.currentSort
      )
    },

    sortedDoneTasks() {
      return this.sortTasks(
        this.displayedDoneTasks,
        this.currentFilter,
        this.currentSort
      )
    }
  },

  methods: {
    ...mapActions([
      'clearSelectedTasks',
      'loadAggregatedPersonDaysOff',
      'loadOpenProductions',
      'loadUserTimeSpents',
      'loadTodos',
      'removeTodoSearch',
      'saveTodoSearch',
      'setDayOff',
      'setTimeSpent',
      'setTodoListScrollPosition',
      'setTodosSearch',
      'unsetDayOff'
    ]),

    isActiveTab(tab) {
      return this.currentSection === tab
    },

    async loadData(forced = false) {
      await this.loadTodos({
        date: this.selectedDate,
        forced
      })
      this.$nextTick(() => {
        this.todoList?.setScrollPosition(this.todoListScrollPosition)
      })
      this.resizeHeaders()

      this.daysOff = await this.loadAggregatedPersonDaysOff({
        personId: this.user.id
      })
    },

    async loadTimeSpents() {
      this.isTasksLoading = true
      await this.loadUserTimeSpents({ date: this.selectedDate })
      this.isTasksLoading = false
    },

    resizeHeaders() {
      this.$nextTick(() => {
        this.todoList?.resizeHeaders()
        this.haveDoneList?.resizeHeaders()
      })
    },

    updateActiveTab() {
      const availableSections = [
        'board',
        'calendar',
        'daysoff',
        'done',
        'pending',
        'timesheets'
      ]
      const currentSection = this.$route.query.section
      this.currentSection = availableSections.includes(currentSection)
        ? currentSection
        : 'todos'

      if (this.currentSection === 'board') {
        const currentProduction = this.openProductions.find(
          ({ id }) => id === this.$route.query.productionId
        )
        if (currentProduction) {
          this.productionId = currentProduction.id
        } else {
          this.$router.push({
            query: {
              productionId: this.productionId,
              section: this.currentSection
            }
          })
        }
      }
      this.clearSelectedTasks()
    },

    onSearchChange() {
      this.setSearchInUrl()
      if (this.searchField) {
        this.setTodosSearch(this.searchField.getValue())
      }
    },

    async saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) return
      try {
        this.loading.savingSearch = true
        await this.saveTodoSearch(searchQuery)
        this.loading.savingSearch = false
      } catch (error) {
        console.error(error)
      }
    },

    async removeSearchQuery(searchQuery) {
      try {
        await this.removeTodoSearch(searchQuery)
      } catch (error) {
        console.error(error)
      }
    },

    async onDateChanged(date) {
      this.loading.timesheets = true
      this.selectedDate = moment(date).format('YYYY-MM-DD')
      await this.loadTimeSpents()
      this.loading.timesheets = false
    },

    async onSetDayOff(dayOff) {
      this.dayOffError = false
      try {
        await this.setDayOff({
          ...dayOff,
          personId: this.user.id
        })
        this.$refs['timesheet-list']?.closeSetDayOffModal()
        this.$refs['day-off-list']?.closeSetDayOffModal()
      } catch (error) {
        this.dayOffError = error.body?.message || true
      }
      await this.loadData(true)
    },

    async onUnsetDayOff(dayOff = null) {
      this.dayOffError = false
      try {
        await this.unsetDayOff(dayOff)
        this.$refs['timesheet-list']?.closeUnsetDayOffModal()
        this.$refs['day-off-list']?.closeUnsetDayOffModal()
      } catch (error) {
        this.dayOffError = error.body?.message || true
      }
      await this.loadData(true)
    },

    onTimeSpentChange(timeSpentInfo) {
      timeSpentInfo.personId = this.user.id
      timeSpentInfo.date = this.selectedDate
      this.setTimeSpent(timeSpentInfo)
    },

    async onAssignation(eventData) {
      if (this.user.id === eventData.person_id) {
        await this.loadOpenProductions()
        await this.loadData(true)
      }
    },

    getBoardStatusesByProduction(production) {
      const statuses = this.getProductionTaskStatuses(production.id).filter(
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

    sortTasks(tasks, currentFilter, currentSort) {
      tasks =
        currentFilter === 'all_tasks'
          ? [...tasks]
          : tasks.filter(t => {
              const dueDate = parseDate(t.due_date)
              return moment().startOf('week').isSame(dueDate, 'week')
            })

      const isName = currentSort === 'entity_name'
      const isPriority = currentSort === 'priority'
      const isDueDate = currentSort === 'due_date'
      const isStartDate = currentSort === 'start_date'

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
          firstBy(currentSort, -1)
            .thenBy('project_name')
            .thenBy('task_type_name')
            .thenBy('entity_name')
        )
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
        query: {
          productionId: this.productionId,
          section: this.currentSection
        }
      })
    },

    '$route.query.section'() {
      this.updateActiveTab()
    },

    '$route.query.search'() {
      this.setSearchFromUrl()
      this.onSearchChange()
    }
  },

  head() {
    return {
      title: `${this.$t('tasks.my_tasks')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  padding: 0;
  overflow-y: auto;
}

.todos {
  display: flex;
  flex-direction: column;
}

.section-tabs {
  min-height: 36px;
}

.search-field {
  margin: 25px 2em 5px 0;
}

.query-list {
  margin-top: 0.5em;
  margin-bottom: 1em;
}

.data-list {
  margin-top: 0;
}

.done-list {
  margin-top: 2em;
}

.field {
  margin-bottom: 0;
}
</style>
