<template>
<div ref="page" class="columns fixed-page">
  <div class="column main-column">
    <div class="person page">

      <div ref="header" class="flexrow page-header">
        <div class="flexrow-item" v-if="person">
          <people-avatar
            :person="person"
            :size="80"
            :font-size="30"
            :is-text="false"
          />
        </div>
        <div class="flexrow-item">
          <page-title :text="person ? person.name : ''" />
        </div>
      </div>

      <div ref="tabs" class="task-tabs tabs">
        <ul v-if="person">
          <li
            :class="{'is-active': isActiveTab('todos')}"
          >
            <router-link :to="{
              name: 'person',
              params: {
                person_id: person.id
              }
            }">
              {{ $t('tasks.current')}}
            </router-link>
          </li>
          <li
            :class="{'is-active': isActiveTab('done')}"
          >
            <router-link :to="{
              name: 'person-tab',
              params: {
                tab: 'done',
                person_id: person.id
              }
            }">
              {{ $t('tasks.done') }} ({{ displayedPersonDoneTasks.length }})
            </router-link>
          </li>
          <li
            :class="{'is-active': isActiveTab('timesheets')}"
            v-if="isCurrentUserManager"
          >
            <router-link :to="{
              name: 'person-tab',
              params: {
                tab: 'timesheets',
                person_id: person.id
              }
            }">
              {{ $t('timesheets.title') }}
            </router-link>
          </li>
          <li
            :class="{'is-active': isActiveTab('schedule')}"
          >
            <router-link :to="{
              name: 'person-tab',
              params: {
                tab: 'schedule',
                person_id: person.id
              }
            }">
              {{ $t('schedule.title')}}
            </router-link>
          </li>
        </ul>
      </div>

      <div ref="search" class="flexrow">
        <search-field
          :class="{
            'search-field': true,
            'flexrow-item': true
          }"
          ref="person-tasks-search-field"
          @change="onSearchChange"
          @save="saveSearchQuery"
          :can-save="true"
          v-if="!isActiveTab('done')"
        />
        <span class="filler"></span>
        <combobox
          class="flexrow-item"
          :label="$t('main.sorted_by')"
          :options="sortOptions"
          locale-key-prefix="tasks.fields."
          v-model="currentSort"
        />
      </div>

      <div
        ref="query"
      >
        <div
          class="query-list"
          v-show="isActiveTab('todos') || isActiveTab('timesheets')"
        >
          <search-query-list
            :queries="personTaskSearchQueries"
            @change-search="changeSearch"
            @remove-search="removeSearchQuery"
          />
        </div>
      </div>

      <todos-list
        ref="task-list"
        :tasks="sortedTasks"
        :is-loading="isTasksLoading"
        :is-error="isTasksLoadingError"
        :selection-grid="personTaskSelectionGrid"
        @scroll="setPersonTasksScrollPosition"
        v-if="isActiveTab('todos')"
      />

      <todos-list
        ref="done-list"
        :tasks="displayedPersonDoneTasks"
        :is-loading="isTasksLoading"
        :is-error="isTasksLoadingError"
        :done="true"
        :selectionGrid="personTaskSelectionGrid"
        v-if="isActiveTab('done')"
      />

      <timesheet-list
        :tasks="loggablePersonTasks"
        :done-tasks="loggableDoneTasks"
        :is-loading="isTasksLoading"
        :is-error="isTasksLoadingError"
        :time-spent-map="personTimeSpentMap"
        :time-spent-total="personTimeSpentTotal"
        :hide-done="personTasksSearchText.length > 0"
        :hide-day-off="!(isCurrentUserAdmin || this.user.id == this.person.id)"
        @date-changed="onDateChanged"
        @time-spent-change="onTimeSpentChange"
        @set-day-off="onSetDayOff"
        @unset-day-off="onUnsetDayOff"
        v-if="isActiveTab('timesheets')"
      />

      <div
        v-if="isActiveTab('schedule')"
      >
        <schedule
          ref="schedule-widget"
          :start-date="tasksStartDate"
          :end-date="tasksEndDate"
          :hierarchy="scheduleItems"
          :zoom-level="2"
          :height="scheduleHeight"
          :is-loading="isTasksLoading"
          :is-estimation-linked="true"
          :with-milestones="false"
          v-if="scheduleItems.length > 0"
        />
        <div class="has-text-centered" v-else>
          There is no tasks scheduled for current person.
        </div>
      </div>
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
import moment from 'moment-timezone'
import firstBy from 'thenby'
import { mapGetters, mapActions } from 'vuex'

import { formatListMixin } from '@/components/mixins/format'
import colors from '@/lib/colors'
import {
  getFirstStartDate,
  getLastEndDate,
  parseDate
} from '@/lib/time'

import Combobox from '@/components/widgets/Combobox'
import PageTitle from '@/components/widgets/PageTitle'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import Schedule from '@/components/pages/schedule/Schedule'
import SearchField from '@/components/widgets/SearchField'
import SearchQueryList from '@/components/widgets/SearchQueryList'
import TimesheetList from '@/components/lists/TimesheetList'
import TodosList from '@/components/lists/TodosList'
import TaskInfo from '@/components/sides/TaskInfo'

export default {
  name: 'person',
  mixins: [formatListMixin],
  components: {
    Combobox,
    PageTitle,
    PeopleAvatar,
    Schedule,
    SearchField,
    SearchQueryList,
    TaskInfo,
    TodosList,
    TimesheetList
  },

  data () {
    return {
      activeTab: 'todos',
      currentSort: 'entity_name',
      isTasksLoading: false,
      isTasksLoadingError: false,
      person: null,
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
      ].map((name) => ({ label: name, value: name }))
    }
  },

  mounted () {
    this.updateActiveTab()
    if (this.personTasksSearchText.length > 0) {
      this.searchField.setValue(this.personTasksSearchText)
    }
    setTimeout(() => {
      if (this.searchField) this.searchField.focus()
    }, 100)
    this.loadPerson(this.$route.params.person_id)
    window.addEventListener('resize', this.resetScheduleHeight)
  },

  afterDestroy () {
    window.removeEventListener('resize', this.resetScheduleHeight)
    this.$store.commit(
      'LOAD_PERSON_TASKS_END',
      { tasks: [], userFilters: {}, taskTypeMap: this.taskTypeMap }
    )
  },

  computed: {
    ...mapGetters([
      'displayedPersonTasks',
      'displayedPersonDoneTasks',
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'nbSelectedTasks',
      'personMap',
      'personTasksScrollPosition',
      'personTasksSearchText',
      'personTaskSearchQueries',
      'personTaskSelectionGrid',
      'personTimeSpentMap',
      'personTimeSpentTotal',
      'productionMap',
      'selectedTasks',
      'taskTypeMap',
      'user'
    ]),

    loggablePersonTasks () {
      return this.displayedPersonTasks
        .filter((task) => {
          return this.taskTypeMap.get(task.task_type_id).allow_timelog
        })
    },

    loggableDoneTasks () {
      return this.displayedPersonDoneTasks
        .filter((task) => {
          return this.taskTypeMap.get(task.task_type_id).allow_timelog
        })
    },

    searchField () {
      return this.$refs['person-tasks-search-field']
    },

    taskList () {
      return this.$refs['task-list']
    },

    haveDoneList () {
      return this.$refs['done-list']
    },

    sortedTasks () {
      const isName = this.currentSort === 'entity_name'
      const isPriority = this.currentSort === 'priority'
      const isDueDate = this.currentSort === 'due_date'
      const isStartDate = this.currentSort === 'start_date'
      const tasks = [...this.displayedPersonTasks]
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
    },

    tasksStartDate () {
      if (this.scheduleItems.length > 0) {
        return getFirstStartDate(this.scheduleTasks)
      } else {
        return moment()
      }
    },

    tasksEndDate () {
      if (this.scheduleItems.length > 0) {
        return getLastEndDate(this.scheduleTasks)
      } else {
        return moment().add(15, 'days')
      }
    },

    scheduleTasks () {
      let children = []
      this.scheduleItems.forEach(item => {
        children = children.concat(item.children)
      })
      return children
    },

    scheduleItems () {
      const rootMap = new Map()
      this.sortedTasks.forEach(task => {
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
          man_days: manDays
        })
      })
      return rootElements
    }
  },

  methods: {
    ...mapActions([
      'loadPersonTasks',
      'setPersonTasksSearch',
      'savePersonTasksSearch',
      'removePersonTasksSearch',
      'setDayOff',
      'setPersonTasksScrollPosition',
      'setTimeSpent',
      'unsetDayOff'
    ]),

    resetScheduleHeight () {
      this.$nextTick(() => {
        if (this.isActiveTab('schedule')) {
          const pageHeight = this.$refs.page.offsetHeight
          const headerHeight = this.$refs.header.offsetHeight
          const tabsHeight = this.$refs.tabs.offsetHeight
          const searchHeight = this.$refs.search.offsetHeight
          const queryHeight = this.$refs.query.offsetHeight
          this.scheduleHeight =
            pageHeight - headerHeight - tabsHeight - searchHeight - queryHeight
          if (this.$refs['schedule-widget']) {
            this.$refs['schedule-widget'].resetScheduleSize()
          }
        }
      })
    },

    buildProjectScheduleItem (project) {
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

    buildTaskScheduleItem (rootElement, task) {
      let startDate = moment()
      let endDate

      if (!task.start_date && !task.real_start_date &&
          !task.due_date && !task.end_date) return null

      if (task.start_date) {
        startDate = parseDate(task.start_date)
      } else if (task.real_start_date) {
        startDate = parseDate(task.real_start_date)
      }

      const estimation = this.formatDuration(task.estimation)
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
        name: task.full_entity_name + ' / ' + taskType.name,
        startDate: startDate,
        endDate: endDate,
        expanded: false,
        loading: false,
        man_days: estimation,
        editable: false,
        unresizable: false,
        parentElement: rootElement,
        color: taskType.color,
        children: []
      }
    },

    isActiveTab (tab) {
      return this.activeTab === tab
    },

    selectTab (tab) {
      this.activeTab = tab
      if (this.isActiveTab('todos')) {
        setTimeout(() => {
          if (this.searchField) this.searchField.focus()
        }, 100)
      }
    },

    onSearchChange (text) {
      this.setPersonTasksSearch(text)
    },

    loadPerson (personId) {
      this.person = this.personMap.get(personId)
      this.isTasksLoading = true
      this.loadPersonTasks({
        personId: this.person.id,
        date: this.selectedDate,
        callback: (err) => {
          if (err) console.error(err)
          this.isTasksLoading = false
          this.isTasksLoadingError = false
          setTimeout(() => {
            if (this.taskList) {
              this.$nextTick(() => {
                this.taskList.setScrollPosition(
                  this.personTasksScrollPosition
                )
              })
            }
            this.resizeHeaders()
          }, 0)
        }
      })
    },

    resizeHeaders () {
      this.$nextTick(() => {
        if (this.taskList) this.taskList.resizeHeaders()
        if (this.haveDoneList) this.haveDoneList.resizeHeaders()
      })
    },

    selectCurrent () {
      this.activeTab = 'current'
      setTimeout(() => {
        this.$refs['person-tasks-search-field'].focus()
      }, 100)
    },

    selectDone () {
      this.activeTab = 'done'
    },

    changeSearch (searchQuery) {
      this.$refs['person-tasks-search-field'].setValue(searchQuery.search_query)
      this.$refs['person-tasks-search-field'].$emit(
        'change', searchQuery.search_query
      )
    },

    saveSearchQuery (searchQuery) {
      this.savePersonTasksSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.error(err)
        })
    },

    removeSearchQuery (searchQuery) {
      this.removePersonTasksSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.error(err)
        })
    },

    updateActiveTab () {
      const availableTabs = ['done', 'timesheets', 'schedule']
      if (availableTabs.includes(this.$route.params.tab)) {
        this.activeTab = this.$route.params.tab
      } else {
        this.activeTab = 'todos'
      }
    },

    onTimeSpentChange (timeSpentInfo) {
      timeSpentInfo.personId = this.person.id
      timeSpentInfo.date = this.selectedDate
      this.setTimeSpent(timeSpentInfo)
    },

    onDateChanged (date) {
      this.selectedDate = moment(date).format('YYYY-MM-DD')
      this.loadPerson(this.person.id)
    },

    onSetDayOff () {
      const dayOff = {
        personId: this.person.id,
        date: this.selectedDate
      }
      this.setDayOff(dayOff)
    },

    onUnsetDayOff () {
      const dayOff = {
        personId: this.person.id,
        date: this.selectedDate
      }
      this.unsetDayOff(dayOff)
    }
  },

  metaInfo () {
    return {
      title: this.person ? `${this.person.name} - Kitsu` : '... - Kitsu'
    }
  },

  watch: {
    $route () {
      const personId = this.$route.params.person_id

      this.updateActiveTab()
      if (this.person.id !== personId) this.loadPerson()
    },

    activeTab () {
      this.resetScheduleHeight()
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

.query-list {
  margin-top: 1em;
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

.dark .main-column {
  border-right: 3px solid $grey-strong;
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

.main-column {
  border-right: 3px solid $light-grey;
}
</style>
