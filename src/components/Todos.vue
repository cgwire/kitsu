<template>
  <div class="todos page fixed-page">
    <page-title :text="$t('tasks.my_tasks')" class="page-header">
    </page-title>
    <search-field
      ref="todos-search-field"
      @change="onSearchChange"
    >
    </search-field>
    <todos-list
      :entries="displayedTodos"
      :is-loading="isTodosLoading"
      :is-error="isTodosLoadingError"
    ></todos-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TodosList from './lists/TodosList'
import PageTitle from './widgets/PageTitle'
import SearchField from './widgets/SearchField'

export default {
  name: 'todos',
  components: {
    TodosList,
    PageTitle,
    SearchField
  },

  data () {
    return {}
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
      'todosSearchText',
      'isTodosLoading',
      'isTodosLoadingError'
    ])
  },

  methods: {
    ...mapActions([
      'loadTodos',
      'setTodosSearch'
    ]),
    onSearchChange (text) {
      this.setTodosSearch(text)
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
</style>
