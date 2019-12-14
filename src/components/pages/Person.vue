<template>
<div class="columns fixed-page">
  <div class="column main-column">
    <div class="person page">

      <div class="flexrow page-header">
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

      <div class="task-tabs tabs">
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
            @click="selectTab('done')"
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
            @click="selectTab('timesheets')"
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
        </ul>
      </div>

      <div class="flexrow">
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
        class="query-list"
        v-if="isActiveTab('todos') || isActiveTab('timesheets')"
      >
        <search-query-list
          :queries="personTaskSearchQueries"
          @changesearch="changeSearch"
          @removesearch="removeSearchQuery"
        />
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
        @date-changed="onDateChanged"
        @time-spent-change="onTimeSpentChange"
        v-if="isActiveTab('timesheets')"
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
import moment from 'moment-timezone'
import firstBy from 'thenby'
import { mapGetters, mapActions } from 'vuex'

import Combobox from '../widgets/Combobox'
import PageTitle from '../widgets/PageTitle'
import PeopleAvatar from '../widgets/PeopleAvatar'
import SearchField from '../widgets/SearchField'
import SearchQueryList from '../widgets/SearchQueryList'
import TimesheetList from '../lists/TimesheetList'
import TodosList from '../lists/TodosList'
import TaskInfo from '../sides/TaskInfo'

export default {
  name: 'person',
  components: {
    Combobox,
    PageTitle,
    PeopleAvatar,
    SearchField,
    SearchQueryList,
    TaskInfo,
    TodosList,
    TimesheetList
  },

  data () {
    return {
      activeTab: 'todos',
      isTasksLoading: false,
      isTasksLoadingError: false,
      person: null,
      selectedDate: moment().format('YYYY-MM-DD'),
      currentSort: 'entity_name',
      sortOptions: [
        'entity_name',
        'priority',
        'task_status_short_name',
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
  },

  afterDestroy () {
    this.$store.commit(
      'LOAD_PERSON_TASKS_END',
      { tasks: [], userFilters: {}, taskTypeMap: this.taskTypeMap }
    )
  },

  computed: {
    ...mapGetters([
      'displayedPersonTasks',
      'displayedPersonDoneTasks',
      'isCurrentUserManager',
      'nbSelectedTasks',
      'personMap',
      'personTasksScrollPosition',
      'personTasksSearchText',
      'personTaskSearchQueries',
      'personTaskSelectionGrid',
      'personTimeSpentMap',
      'personTimeSpentTotal',
      'selectedTasks',
      'taskTypeMap'
    ]),

    loggablePersonTasks () {
      return this.displayedPersonTasks
        .filter((task) => {
          return this.taskTypeMap[task.task_type_id].allow_timelog
        })
    },

    loggableDoneTasks () {
      return this.displayedPersonDoneTasks
        .filter((task) => {
          return this.taskTypeMap[task.task_type_id].allow_timelog
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
      const tasks = [...this.displayedPersonTasks]
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
      'loadPersonTasks',
      'setPersonTasksSearch',
      'savePersonTasksSearch',
      'removePersonTasksSearch',
      'setPersonTasksScrollPosition',
      'setTimeSpent'
    ]),

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
      this.person = this.personMap[personId]
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
      if (['done', 'timesheets'].includes(this.$route.params.tab)) {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.name {
  width: 230px;
  min-width: 230px;
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
