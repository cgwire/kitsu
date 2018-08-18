<template>
  <div class="people page fixed-page">
    <div class="flexrow page-header">
      <div class="flexrow-item">
        <people-avatar
          :person="person"
          :size="80"
          :font-size="30"
          :is-link="false"
        />
      </div>
      <div class="flexrow-item">
        <page-title :text="person ? person.name : ''" />
      </div>
    </div>

    <div class="task-tabs tabs">
      <ul>
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
          @click="selectTab('timesheet')"
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

    <search-field
      :class="{
        'search-field': true
      }"
      ref="person-tasks-search-field"
      @change="onSearchChange"
      @save="saveSearchQuery"
      :can-save="true"
      v-if="!isActiveTab('done')"
    />

    <div
      class="query-list"
      v-if="isTabActive('todos') || isTabActive('timesheets')"
    >
      <search-query-list
        :queries="personTaskSearchQueries"
        @changesearch="changeSearch"
        @removesearch="removeSearchQuery"
      />
    </div>

    <todos-list
      ref="task-list"
      :entries="displayedPersonTasks"
      :is-loading="isTasksLoading"
      :is-error="isTasksLoadingError"
      :selection-grid="personTaskSelectionGrid"
      @scroll="setPersonTasksScrollPosition"
      v-if="isActiveTab('todos')"
    />

    <todos-list
      :entries="displayedPersonDoneTasks"
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
</template>

<script>
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'

import PageTitle from './widgets/PageTitle'
import PageSubtitle from './widgets/PageSubtitle'
import PeopleAvatar from './widgets/PeopleAvatar'
import SearchField from './widgets/SearchField'
import SearchQueryList from './widgets/SearchQueryList'
import TimesheetList from './lists/TimesheetList'
import TodosList from './lists/TodosList'

export default {
  name: 'person',
  components: {
    PageTitle,
    PageSubtitle,
    PeopleAvatar,
    SearchField,
    SearchQueryList,
    TodosList,
    TimesheetList
  },

  data () {
    return {
      activeTab: 'todos',
      isTasksLoading: false,
      isTasksLoadingError: false,
      person: {},
      selectedDate: moment().format('YYYY-MM-DD')
    }
  },

  mounted () {
    this.updateActiveTab()
    if (this.personTasksSearchText.length > 0) {
      this.$refs['person-tasks-search-field'].setValue(
        this.personTasksSearchText
      )
    }
    setTimeout(() => {
      if (this.$refs['person-tasks-search-field']) {
        this.$refs['person-tasks-search-field'].focus()
      }
    }, 100)
    this.loadPerson(this.$route.params.person_id)
  },

  computed: {
    ...mapGetters([
      'displayedPersonTasks',
      'displayedPersonDoneTasks',
      'isCurrentUserManager',
      'personMap',
      'personTasksScrollPosition',
      'personTasksSearchText',
      'personTaskSearchQueries',
      'personTaskSelectionGrid',
      'personTimeSpentMap',
      'personTimeSpentTotal',
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
          if (this.$refs['person-tasks-search-field']) {
            this.$refs['person-tasks-search-field'].focus()
          }
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
          if (err) console.log(err)
          this.isTasksLoading = false
          this.isTasksLoadingError = false
          setTimeout(() => {
            if (this.$refs['task-list']) {
              this.$refs['task-list'].setScrollPosition(
                this.personTasksScrollPosition
              )
            }
          }, 0)
        }
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
          if (err) console.log(err)
        })
    },

    removeSearchQuery (searchQuery) {
      this.removePersonTasksSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.log(err)
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

<style scoped>
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

.data-list {
  margin-top: 0;
}
</style>
