<template>
  <div class="people page fixed-page">
    <div class="flexrow page-header">
      <div class="flexrow-item">
        <people-avatar
          :person="person"
          :size="80"
          :font-size="30"
          :is-link="false"
        ></people-avatar>
      </div>
      <div class="flexrow-item">
        <page-title :text="person ? person.name : ''"></page-title>
      </div>
    </div>

    <div class="task-tabs tabs">
      <ul>
        <li
          :class="{'is-active': isActive('todos')}"
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
          :class="{'is-active': isActive('done')}"
          @click="select('done')"
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
          :class="{'is-active': isActive('timesheets')}"
          @click="select('timesheet')"
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
        'search-field': true,
        'is-hidden': !isActive('todos')
      }"
      ref="person-tasks-search-field"
      @change="onSearchChange"
      @save="saveSearchQuery"
      :can-save="true"
    >
    </search-field>

    <div
      class="query-list"
      v-if="isActive('todos')"
    >
      <search-query-list
        :queries="personTaskSearchQueries"
        @changesearch="changeSearch"
        @removesearch="removeSearchQuery"
      >
      </search-query-list>
    </div>

    <todos-list
      :entries="displayedPersonTasks"
      :is-loading="isTasksLoading"
      :is-error="isTasksLoadingError"
      :selection-grid="personTaskSelectionGrid"
      v-if="isActive('todos')"
    ></todos-list>

    <todos-list
      :entries="displayedPersonDoneTasks"
      :is-loading="isTasksLoading"
      :is-error="isTasksLoadingError"
      :done="true"
      :selectionGrid="personTaskSelectionGrid"
      v-if="isActive('done')"
    ></todos-list>

    <timesheet-list
      :tasks="displayedPersonTasks"
      :done-tasks="displayedPersonDoneTasks"
      :is-loading="isTasksLoading"
      :is-error="isTasksLoadingError"
      :time-spent-map="personTimeSpentMap"
      :time-spent-total="personTimeSpentTotal"
      @time-spent-change="onTimeSpentChange"
      v-if="isActive('timesheets')"
    ></timesheet-list>
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
      isTasksLoading: false,
      isTasksLoadingError: false,
      person: {},
      activeTab: 'todos'
    }
  },

  created () {
    this.loadPerson(this.$route.params.person_id)
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
  },

  computed: {
    ...mapGetters([
      'personMap',
      'displayedPersonTasks',
      'displayedPersonDoneTasks',
      'isCurrentUserManager',
      'personTasksSearchText',
      'personTaskSearchQueries',
      'personTaskSelectionGrid',
      'personTimeSpentMap',
      'personTimeSpentTotal'
    ])
  },

  methods: {
    ...mapActions([
      'loadPersonTasks',
      'setPersonTasksSearch',
      'savePersonTasksSearch',
      'removePersonTasksSearch',
      'setTimeSpent'
    ]),

    isActive (tab) {
      return this.activeTab === tab
    },

    select (tab) {
      this.activeTab = tab
      if (this.isActive('todos')) {
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
        callback: (err) => {
          if (err) console.log(err)
          this.isTasksLoading = false
          this.isTasksLoadingError = false
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
      timeSpentInfo.date = moment().format('YYYY-MM-DD')
      this.setTimeSpent(timeSpentInfo)
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
