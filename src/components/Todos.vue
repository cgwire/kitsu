<template>
  <div class="todos page fixed-page">
    <page-title :text="$t('tasks.my_tasks')" class="page-header">
    </page-title>

    <div class="task-tabs tabs">
      <ul>
        <li
          :class="{'is-active': isCurrentActive}"
          @click="selectCurrent"
        >
          <a>
            {{ $t('tasks.current')}}
          </a>
        </li>
        <li
          :class="{'is-active': isDoneActive}"
          @click="selectDone"
        >
          <a>
            {{ $t('tasks.done') }} ({{ displayedDoneTasks.length }})
          </a>
        </li>
      </ul>
    </div>

    <search-field
      :class="{
        'search-field': true,
        'is-hidden': !isCurrentActive
      }"
      ref="todos-search-field"
      @change="onSearchChange"
      @save="saveSearchQuery"
      :can-save="true"
      v-if="isCurrentActive"
    >
    </search-field>

    <div class="query-list">
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
      v-if="isCurrentActive"
    ></todos-list>

    <todos-list
      :entries="displayedDoneTasks"
      :is-loading="isTodosLoading"
      :is-error="isTodosLoadingError"
      :done="true"
      v-if="isDoneActive"
    ></todos-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TodosList from './lists/TodosList'
import PageTitle from './widgets/PageTitle'
import SearchField from './widgets/SearchField'
import SearchQueryList from './widgets/SearchQueryList'

export default {
  name: 'todos',
  components: {
    TodosList,
    PageTitle,
    SearchField,
    SearchQueryList
  },

  data () {
    return {
      activeTab: 'current'
    }
  },

  created () {
    this.loadTodos({})
  },

  mounted () {
    if (this.todosSearchText.length > 0) {
      this.$refs['todos-search-field'].setValue(this.todosSearchText)
    }
  },

  computed: {
    ...mapGetters([
      'displayedTodos',
      'displayedDoneTasks',
      'todosSearchText',
      'isTodosLoading',
      'isTodosLoadingError',
      'todoSelectionGrid',
      'todoSearchQueries'
    ]),

    isCurrentActive () {
      return this.activeTab === 'current'
    },

    isDoneActive () {
      return this.activeTab === 'done'
    }
  },

  methods: {
    ...mapActions([
      'loadTodos',
      'setTodosSearch',
      'removeTodoSearch',
      'saveTodoSearch'
    ]),

    onSearchChange (text) {
      this.setTodosSearch(text)
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
  margin-top: 0em;
  margin-bottom: 1em;
}

.data-list {
  margin-top: 0;
}

.search-field {
  margin-top: 1em;
  margin-bottom: 1em;
}
</style>
