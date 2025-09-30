<template>
  <div ref="page" class="columns fixed-page">
    <div class="column main-column">
      <div class="person page" v-if="person">
        <div ref="header" class="flexrow page-header">
          <div class="flexrow-item">
            <people-avatar
              :person="person"
              :size="80"
              :font-size="30"
              :is-text="false"
            />
          </div>
          <div class="flexrow-item entity-title">
            {{ person.name }}
          </div>
        </div>

        <template v-if="!person.is_bot && isCurrentUserAllowed">
          <route-section-tabs
            class="section-tabs mt1"
            :active-tab="activeTab"
            :route="$route"
            :tabs="todoTabs"
          />

          <div ref="search" class="flexrow" v-show="!isActiveTab('calendar')">
            <search-field
              ref="person-tasks-search-field"
              class="search-field flexrow-item"
              can-save
              @change="onSearchChange"
              @save="saveSearchQuery"
            />
            <combobox-production
              class="flexrow-item production-field"
              :label="$t('main.production')"
              :production-list="productionList"
              v-model="productionId"
            />
            <span class="filler"></span>
            <combobox-number
              class="flexrow-item zoom-level mb0"
              :label="$t('schedule.zoom_level')"
              :options="zoomOptions"
              v-model="zoomLevel"
              v-if="isActiveTab('schedule')"
            />
            <combobox
              class="flexrow-item"
              :label="$t('main.sorted_by')"
              :options="sortOptions"
              locale-key-prefix="tasks.fields."
              v-model="currentSort"
            />
          </div>

          <div ref="query" class="query-list" v-if="!isActiveTab('calendar')">
            <search-query-list
              :queries="personTaskSearchQueries"
              type="person"
              @remove-search="removeSearchQuery"
            />
          </div>

          <todos-list
            ref="task-list"
            :empty-text="$t('people.no_task_assigned')"
            :is-loading="isTasksLoading"
            :is-error="isTasksLoadingError"
            :selection-grid="personTaskSelectionGrid"
            :tasks="sortedTasks"
            @scroll="setPersonTasksScrollPosition"
            v-if="isActiveTab('todos')"
          />

          <todos-list
            ref="done-list"
            done
            :empty-text="$t('people.no_task_assigned')"
            :is-loading="isDoneTasksLoading"
            :is-error="isDoneTasksLoadingError"
            :selection-grid="personTaskSelectionGrid"
            :tasks="sortedDoneTasks"
            v-else-if="isActiveTab('done')"
          />

          <kanban-board
            :is-loading="isTasksLoading"
            :is-error="isTasksLoadingError"
            :production="selectedProduction"
            :statuses="boardStatuses"
            :tasks="boardTasks"
            :user="user"
            v-else-if="isActiveTab('board')"
          />

          <user-calendar
            class="calendar"
            :is-loading="isTasksLoading"
            :days-off="daysOff"
            :tasks="sortedAllTasks"
            v-else-if="isActiveTab('calendar')"
          />

          <timesheet-list
            ref="timesheet-list"
            :tasks="loggablePersonTasks"
            :done-tasks="loggableDoneTasks"
            :is-loading="isTasksLoading"
            :is-error="isTasksLoadingError"
            :day-off-error="dayOffError"
            :time-spent-map="personTimeSpentMap"
            :time-spent-total="personTimeSpentTotal"
            :hide-done="false"
            :hide-day-off="!(isCurrentUserAdmin || user.id === person.id)"
            @date-changed="onDateChanged"
            @time-spent-change="onTimeSpentChange"
            @set-day-off="onSetDayOff"
            @unset-day-off="onUnsetDayOff"
            v-else-if="isActiveTab('timesheets') && isCurrentUserManager"
          />

          <div v-else-if="isActiveTab('schedule')">
            <schedule
              ref="schedule-widget"
              :days-off="daysOff"
              :start-date="tasksStartDate.clone().add(-3, 'months')"
              :end-date="tasksEndDate.clone().add(3, 'months')"
              :hierarchy="scheduleItems"
              :zoom-level="zoomLevel"
              :height="scheduleHeight"
              :is-loading="isTasksLoading"
              :is-estimation-linked="true"
              :with-milestones="false"
              @item-changed="saveTaskScheduleItem"
              @estimation-changed="event => saveTaskScheduleItem(event.item)"
              v-if="scheduleItems.length > 0"
            />
            <div class="has-text-centered" v-else>
              {{ $t('main.empty_schedule') }}
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="column side-column" v-if="nbSelectedTasks === 1">
      <task-info :task="selectedTasks.values().next().value" />
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import { firstBy } from 'thenby'
import { mapGetters, mapActions } from 'vuex'

import colors from '@/lib/colors'
import { sortTaskStatuses } from '@/lib/sorting'
import {
  daysToMinutes,
  getBusinessDays,
  getFirstStartDate,
  getLastEndDate,
  parseDate
} from '@/lib/time'

import { formatListMixin } from '@/components/mixins/format'
import { searchMixin } from '@/components/mixins/search'

import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import KanbanBoard from '@/components/lists/KanbanBoard.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import TimesheetList from '@/components/lists/TimesheetList.vue'
import TodosList from '@/components/lists/TodosList.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import UserCalendar from '@/components/widgets/UserCalendar.vue'

export default {
  name: 'person',

  mixins: [formatListMixin, searchMixin],

  components: {
    Combobox,
    ComboboxNumber,
    ComboboxProduction,
    KanbanBoard,
    PeopleAvatar,
    RouteSectionTabs,
    Schedule,
    SearchField,
    SearchQueryList,
    TaskInfo,
    TimesheetList,
    TodosList,
    UserCalendar
  },

  data() {
    return {
      activeTab: 'todos',
      currentSort: 'entity_name',
      daysOff: [],
      dayOffError: false,
      init: false,
      isDoneTasksLoading: false,
      isDoneTasksLoadingError: false,
      isTasksLoading: false,
      isTasksLoadingError: false,
      loading: {
        savingSearch: false
      },
      person: null,
      productionId: undefined,
      scheduleHeight: 0,
      selectedDate: moment().format('YYYY-MM-DD'),
      sortOptions: [
        'entity_name',
        'priority',
        'task_status_short_name',
        'start_date',
        'due_date',
        'estimation',
        'last_comment_date'
      ].map(name => ({ label: name, value: name })),
      zoomLevel: 1,
      zoomOptions: [
        { label: this.$t('main.week'), value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 }
      ]
    }
  },

  mounted() {
    this.updateActiveTab()
    this.loadPerson(this.$route.params.person_id)
    setTimeout(() => {
      this.searchField?.focus()
      this.$refs['schedule-widget']?.scrollToDate(this.tasksStartDate)
    }, 300)
    window.addEventListener('resize', this.resetScheduleHeight)

    this.setSearchFromUrl()
    this.onSearchChange()

    this.init = true
  },

  afterDestroy() {
    window.removeEventListener('resize', this.resetScheduleHeight)
    this.$store.commit('LOAD_PERSON_TASKS_END', {
      tasks: [],
      userFilters: {},
      taskTypeMap: this.taskTypeMap
    })
  },

  computed: {
    ...mapGetters([
      'displayedPersonTasks',
      'displayedPersonDoneTasks',
      'getProductionTaskStatuses',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'nbSelectedTasks',
      'personMap',
      'personTasksScrollPosition',
      'personTaskSearchQueries',
      'personTaskSelectionGrid',
      'personTimeSpentMap',
      'personTimeSpentTotal',
      'openProductions',
      'productionMap',
      'selectedTasks',
      'taskStatuses',
      'taskTypeMap',
      'user'
    ]),

    isCurrentUserAllowed() {
      if (this.isCurrentUserManager || this.user.id === this.person.id) {
        return true
      }
      if (this.isCurrentUserSupervisor) {
        const isSupervisorInDepartments = this.user.departments.some(
          department => this.person.departments.includes(department)
        )
        return isSupervisorInDepartments
      }
      return false
    },

    loggablePersonTasks() {
      return this.sortedTasks.filter(task => {
        return this.taskTypeMap.get(task.task_type_id).allow_timelog
      })
    },

    loggableDoneTasks() {
      return this.sortedDoneTasks.filter(task => {
        return this.taskTypeMap.get(task.task_type_id).allow_timelog
      })
    },

    searchField() {
      return this.$refs['person-tasks-search-field']
    },

    taskList() {
      return this.$refs['task-list']
    },

    haveDoneList() {
      return this.$refs['done-list']
    },

    sortedTasks() {
      let tasks = this.sortTasks([...this.displayedPersonTasks])
      if (this.productionId) {
        tasks = tasks.filter(task => task.project_id === this.productionId)
      }
      return tasks
    },

    sortedDoneTasks() {
      let tasks = this.sortTasks([...this.displayedPersonDoneTasks])
      if (this.productionId) {
        tasks = tasks.filter(task => task.project_id === this.productionId)
      }
      return tasks
    },

    sortedAllTasks() {
      let tasks = this.sortTasks([
        ...this.displayedPersonTasks,
        ...this.displayedPersonDoneTasks
      ])
      if (this.productionId) {
        tasks = tasks.filter(task => task.project_id === this.productionId)
      }
      return tasks
    },

    tasksStartDate() {
      if (this.scheduleTasks.length) {
        return getFirstStartDate(this.scheduleTasks)
      } else {
        return moment()
      }
    },

    tasksEndDate() {
      if (this.scheduleTasks.length) {
        return getLastEndDate(this.scheduleTasks)
      } else {
        return moment().add(15, 'days')
      }
    },

    scheduleTasks() {
      return this.scheduleItems.flatMap(item => item.children)
    },

    scheduleItems() {
      const rootMap = new Map()
      this.sortedAllTasks.forEach(task => {
        if (!rootMap.get(task.project_id)) {
          const project = this.productionMap.get(task.project_id)
          const rootElement = this.buildProjectScheduleItem(project)
          rootMap.set(task.project_id, rootElement)
        }
        const rootElement = rootMap.get(task.project_id)
        const taskItem = this.buildTaskScheduleItem(rootElement, task)
        if (taskItem) rootElement.children.push(taskItem)
      })

      const rootElements = Array.from(rootMap.values())
      rootElements.forEach(rootElement => {
        let rootStartDate = moment()
        let rootEndDate = moment().add(1, 'days')
        let manDays = 0
        if (rootElement.children.length > 0) {
          rootStartDate = getFirstStartDate(rootElement.children)
          rootEndDate = getLastEndDate(rootElement.children)
        }
        rootElement.children.forEach(task => {
          const estimation = this.formatDuration(task.estimation)
          if (estimation) manDays += task.estimation
        })
        Object.assign(rootElement, {
          startDate: rootStartDate,
          endDate: rootEndDate,
          man_days: manDays,
          daysOff: this.daysOff
        })
      })
      return rootElements
    },

    boardTasks() {
      const tasks = this.sortedAllTasks
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
      this.userOpenProductions.forEach(production => {
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
      return [{ name: this.$t('main.all') }, ...this.userOpenProductions]
    },

    selectedProduction() {
      return this.productionMap.get(this.productionId)
    },

    userOpenProductions() {
      if (!this.person) {
        return []
      }
      return this.openProductions.filter(production =>
        production.team.includes(this.person.id)
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
          label: this.$t('schedule.title'),
          name: 'schedule'
        },
        {
          label: `${this.$t('tasks.validated')} (${
            this.isDoneTasksLoading ? '…' : this.displayedPersonDoneTasks.length
          })`,
          name: 'done'
        },
        {
          label: this.$t('timesheets.title'),
          name: 'timesheets'
        }
      ].filter(Boolean)
    }
  },

  methods: {
    ...mapActions([
      'clearSelectedTasks',
      'loadAggregatedPersonDaysOff',
      'loadPersonDoneTasks',
      'loadPersonTasks',
      'loadPersonTimeSpents',
      'setPersonTasksSearch',
      'savePersonTasksSearch',
      'removePersonTasksSearch',
      'setDayOff',
      'setPersonTasksScrollPosition',
      'setTimeSpent',
      'unsetDayOff',
      'updateTask'
    ]),

    sortTasks(tasks) {
      const isName = this.currentSort === 'entity_name'
      const isPriority = this.currentSort === 'priority'
      const isDueDate = this.currentSort === 'due_date'
      const isStartDate = this.currentSort === 'start_date'

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
    },

    onAssignation(eventData) {
      if (this.person.id === eventData.person_id) {
        this.loadPerson(this.person.id)
      }
    },

    resetScheduleHeight() {
      this.$nextTick(() => {
        if (this.isActiveTab('schedule')) {
          const pageHeight = this.$refs.page?.offsetHeight || 0
          const headerHeight = this.$refs.header?.offsetHeight || 0
          const tabsHeight = this.$refs.tabs?.offsetHeight || 0
          const searchHeight = this.$refs.search?.offsetHeight || 0
          const queryHeight = this.$refs.query?.offsetHeight || 0
          this.scheduleHeight =
            pageHeight - headerHeight - tabsHeight - searchHeight - queryHeight
          this.$refs['schedule-widget']?.resetScheduleSize()
        }
      })
    },

    buildProjectScheduleItem(project) {
      return {
        ...project,
        avatar: true,
        color: colors.fromString(project.name, true),
        priority: 1,
        expanded: true,
        loading: false,
        children: [],
        editable: false
      }
    },

    buildTaskScheduleItem(parentElement, task) {
      let startDate = moment()
      let endDate

      if (
        !task.start_date &&
        !task.real_start_date &&
        !task.due_date &&
        !task.end_date
      ) {
        return null
      }

      if (task.start_date) {
        startDate = parseDate(task.start_date)
      } else if (task.real_start_date) {
        startDate = parseDate(task.real_start_date)
      }

      const estimation = task.estimation
      if (task.due_date) {
        endDate = parseDate(task.due_date)
      } else if (task.end_date) {
        endDate = parseDate(task.end_date)
      } else if (task.estimation) {
        endDate = startDate.clone().add(estimation, 'days')
      }
      if (!endDate || endDate.isBefore(startDate)) {
        endDate = startDate.clone().add(1, 'days')
      }

      const taskType = this.taskTypeMap.get(task.task_type_id)
      return {
        ...task,
        name: `${task.full_entity_name} / ${taskType.name}`,
        startDate,
        endDate,
        expanded: false,
        loading: false,
        man_days: estimation,
        editable: false,
        unresizable: false,
        parentElement,
        color: taskType.color,
        children: []
      }
    },

    isActiveTab(tab) {
      return this.init && this.activeTab === tab
    },

    onSearchChange(search) {
      search = search || this.searchField?.getValue()
      this.setSearchInUrl(search)
      this.setPersonTasksSearch(search)
    },

    async loadPerson(personId) {
      this.person = this.personMap.get(personId)

      if (!this.person) {
        this.$router.push({ name: 'not-found' })
        return
      }

      if (this.person.is_bot || !this.isCurrentUserAllowed) return

      this.isTasksLoading = true
      this.isDoneTasksLoading = true
      this.isTasksLoadingError = false

      try {
        await this.loadPersonTasks({
          personId: this.person.id,
          date: this.selectedDate
        })
        setTimeout(() => {
          this.$nextTick(() => {
            this.taskList?.setScrollPosition(this.personTasksScrollPosition)
          })
          this.resizeHeaders()
        }, 0)

        this.isTasksLoading = false
        try {
          await this.loadPersonDoneTasks(this.person.id)
          this.isDoneTasksLoading = false
        } catch (error) {
          this.isDoneTasksLoadingError = true
          this.isDoneTasksLoading = false
        }
      } catch (error) {
        this.isTasksLoading = false
        this.isTasksLoadingError = true
      }

      try {
        this.daysOff = await this.loadAggregatedPersonDaysOff({ personId })
      } catch (error) {
        console.error(error)
      }
    },

    async loadTimeSpents() {
      this.isTasksLoading = true
      await this.loadPersonTimeSpents({
        personId: this.person.id,
        date: this.selectedDate
      })
      this.isTasksLoading = false
    },

    resizeHeaders() {
      this.$nextTick(() => {
        this.taskList?.resizeHeaders()
        this.haveDoneList?.resizeHeaders()
      })
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      this.loading.savingSearch = true
      this.savePersonTasksSearch(searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    removeSearchQuery(searchQuery) {
      this.removePersonTasksSearch(searchQuery).catch(err => {
        if (err) console.error(err)
      })
    },

    updateActiveTab() {
      const availableSections = [
        'board',
        'calendar',
        'done',
        'schedule',
        'timesheets'
      ]
      const currentSection = this.$route.query.section
      this.activeTab = availableSections.includes(currentSection)
        ? currentSection
        : 'todos'

      if (this.activeTab === 'board') {
        const currentProduction = this.userOpenProductions.find(
          ({ id }) => id === this.$route.query.productionId
        )
        if (currentProduction) {
          this.productionId = currentProduction.id
        } else {
          this.$router.push({
            query: {
              productionId: this.productionId,
              section: this.activeTab,
              search: this.$route.query.search
            }
          })
        }
      }

      this.clearSelectedTasks()
    },

    onTimeSpentChange(timeSpentInfo) {
      timeSpentInfo.personId = this.person.id
      timeSpentInfo.date = this.selectedDate
      this.setTimeSpent(timeSpentInfo)
    },

    async onDateChanged(date) {
      this.selectedDate = moment(date).format('YYYY-MM-DD')
      await this.loadTimeSpents()
    },

    async onSetDayOff(dayOff) {
      this.dayOffError = false
      try {
        await this.setDayOff({
          ...dayOff,
          personId: this.person.id
        })
        this.$refs['timesheet-list']?.closeSetDayOffModal()
      } catch (error) {
        this.dayOffError = error.body?.message || true
      }
    },

    async onUnsetDayOff() {
      this.dayOffError = false
      try {
        await this.unsetDayOff()
        this.$refs['timesheet-list']?.closeUnsetDayOffModal()
      } catch (error) {
        this.dayOffError = error.body?.message || true
      }
    },

    saveTaskScheduleItem(item) {
      const daysLength = getBusinessDays(item.startDate, item.endDate)
      const estimation = daysToMinutes(this.organisation, daysLength)
      item.man_days = estimation
      if (item.startDate && item.endDate) {
        this.updateTask({
          taskId: item.id,
          data: {
            estimation,
            start_date: item.startDate.format('YYYY-MM-DD'),
            due_date: item.endDate.format('YYYY-MM-DD')
          }
        })
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
    }
  },

  head() {
    return {
      title: `${this.person?.name || '...'} - Kitsu`
    }
  },

  watch: {
    '$route.params.person_id'(personId) {
      this.updateActiveTab()
      if (this.person && this.person.id !== personId) {
        this.loadPerson(personId)
      }
    },

    '$route.query.search'(search) {
      this.searchField?.setValue(search)
      this.onSearchChange(search)
    },

    activeTab() {
      this.resetScheduleHeight()
      this.$nextTick(() => {
        this.$refs['schedule-widget']?.scrollToDate(this.tasksStartDate)
      })
    },

    '$route.query.section'() {
      this.updateActiveTab()
    },

    productionId() {
      this.$router.push({
        query: {
          ...this.$route.query,
          productionId: this.productionId
        }
      })
    },

    zoomLevel() {
      this.$refs['schedule-widget']?.scrollToDate(this.tasksStartDate)
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
  }
}
</script>

<style lang="scss" scoped>
.name {
  width: 230px;
  min-width: 230px;
}

.page {
  overflow: hidden;
}

.email {
  width: 210px;
  min-width: 210px;
}
.phone {
  width: 140px;
  min-width: 140px;
}
.skills {
  width: 250px;
}

.search-field {
  margin: 25px 2em 5px 0;
}

.query-list {
  margin-top: 0.5em;
}

.task-tabs {
  margin-top: 2em;
}

.task-tabs ul {
  margin: 0;
}

.data-list {
  margin-top: 0;
}

.person {
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

.zoom-level {
  margin-top: -0.5em;
}

.field {
  margin-bottom: 0;
}

.tabs {
  min-height: 30px;
}

.page-header {
  margin-top: 0.5em;
}

.calendar {
  flex: 1;
  overflow: auto;
}
</style>
