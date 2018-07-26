<template>
  <div class="todos page fixed-page">
    <div class="task-tabs tabs">
      <ul>
        <li
          :class="{'is-active': isActive('todos')}"
        >
          <router-link :to="{
            name: 'todos',
          }">
            {{ $t('tasks.current')}}
          </router-link>
        </li>
        <li
          :class="{'is-active': isActive('done')}"
          @click="select('done')"
        >
          <router-link :to="{
            name: 'todos-tab',
            params: {tab: 'done'}
          }">
            {{ $t('tasks.done') }} ({{ displayedDoneTasks.length }})
          </router-link>
        </li>
        <li
          :class="{'is-active': isActive('timesheets')}"
          @click="select('timesheet')"
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

    <search-field
      :class="{
        'search-field': true,
        'is-hidden': !isActive('todos')
      }"
      ref="todos-search-field"
      @change="onSearchChange"
      @save="saveSearchQuery"
      :can-save="true"
      v-if="isActive('todos')"
    >
    </search-field>

    <div
      class="query-list"
      v-if="isActive('todos')"
    >
      <search-query-list
        :queries="todoSearchQueries"
        @changesearch="changeSearch"
        @removesearch="removeSearchQuery"
      >
      </search-query-list>
    </div>

    <todos-list
      :entries="displayedTodos"
      :is-loading="isTodosLoading"
      :is-error="isTodosLoadingError"
      :selection-grid="todoSelectionGrid"
      v-if="isActive('todos')"
    ></todos-list>

    <todos-list
      :entries="displayedDoneTasks"
      :is-loading="isTodosLoading"
      :is-error="isTodosLoadingError"
      :done="true"
      v-if="isActive('done')"
    ></todos-list>

    <timesheet-list
      :tasks="displayedTodos"
      :done-tasks="displayedDoneTasks"
      :is-loading="isTodosLoading"
      :is-error="isTodosLoadingError"
      @time-spent-change="onTimeSpentChange"
      v-if="isActive('timesheets')"
    ></timesheet-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'

import TimesheetList from './lists/TimesheetList'
import TodosList from './lists/TodosList'
import PageTitle from './widgets/PageTitle'
import SearchField from './widgets/SearchField'
import SearchQueryList from './widgets/SearchQueryList'

export default {
  name: 'todos',
  components: {
    TimesheetList,
    TodosList,
    PageTitle,
    SearchField,
    SearchQueryList
  },

  data () {
    return {
      activeTab: 'todos'
    }
  },

  created () {
    this.loadTodos({})
  },

  mounted () {
    this.updateActiveTab()
    if (this.todosSearchText.length > 0) {
      this.$refs['todos-search-field'].setValue(this.todosSearchText)
    }
  },

  computed: {
    ...mapGetters([
      'user',
      'displayedTodos',
      'displayedDoneTasks',
      'todosSearchText',
      'isTodosLoading',
      'isTodosLoadingError',
      'todoSelectionGrid',
      'todoSearchQueries'
    ])
  },

  methods: {
    ...mapActions([
      'loadTodos',
      'removeTodoSearch',
      'saveTodoSearch',
      'setTodosSearch',
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
          if (err) console.log('error')
        })
    },

    removeSearchQuery (searchQuery) {
      this.removeTodoSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.log('error')
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
      timeSpentInfo.personId = this.user.id
      timeSpentInfo.date = moment().format('YYYY-MM-DD')
      this.setTimeSpent(timeSpentInfo)
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

<style scoped>
.title {
  margin-top: 1em;
}

.task-tabs {
  margin-top: 1em;
  margin-bottom: 1em;
  font-size: 1.1em;
}

.data-list {
  margin-top: 0;
}

.search-field {
  margin-top: 1em;
  margin-bottom: 1em;
}
</style>
