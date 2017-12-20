<template>
  <div class="todos page fixed-page">
    <page-title :text="$t('tasks.my_tasks')" class="page-header">
    </page-title>
    <todos-list
      :entries="todos"
      :is-loading="isTodosLoading"
      :is-error="isTodosLoadingError"
    ></todos-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TodosList from './lists/TodosList'
import PageTitle from './widgets/PageTitle'

export default {
  name: 'todos',
  components: {
    TodosList,
    PageTitle
  },

  data () {
    return {}
  },

  created () {
    this.loadTodos({})
  },

  watch: {
    '$route' (to, from) {}
  },

  computed: {
    ...mapGetters([
      'todos',
      'isTodosLoading',
      'isTodosLoadingError'
    ])
  },

  methods: {
    ...mapActions([
      'loadTodos'
    ])
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
