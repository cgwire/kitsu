<template>
  <div class="todos page">
    <page-title :text="$t('tasks.my_tasks')">
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
  name: 'menu',
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
  }
}
</script>

<style scoped>
.todos.page {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;

  min-height: 0;
}

.title {
  margin-top: 1em;
}

.data-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
