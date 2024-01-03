<template>
  <div class="board">
    <ol class="board-columns">
      <li class="board-column" :key="column.id" v-for="column in columns">
        <h2 class="board-column-title">{{ column.status.short_name }}</h2>
        <ol class="board-cards">
          <li
            class="board-card"
            draggable="true"
            :key="task.id"
            v-for="task in column.tasks"
          >
            <div>
              {{ task.project_name }}<br /><br />
              {{ task.entity_type_name }} > {{ task.entity_name }}<br /><br />
              {{ task.task_type_name }}<br />
              <br />
              {{ task.assignees }}<br />
            </div>
          </li>
        </ol>
      </li>
    </ol>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'kanban-board',
  mixins: [],

  components: {},

  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    statuses: {
      type: Array,
      default: () => []
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {}
  },

  mounted() {
    console.log('tasks', this.tasks)
    console.log('statuses', this.statuses)
  },

  computed: {
    ...mapGetters([]),

    columns() {
      const columns = this.statuses.map(status => {
        const tasks = this.tasks.filter(
          task => task.task_status_id === status.id
        )

        // TODO: handle order by configuration
        const order = ['TODO', 'WIP', 'WFA', 'RETAKE', 'READY', 'DONE'].indexOf(
          status.short_name.toUpperCase()
        )

        return {
          id: status.id,
          status: status,
          order,
          tasks
        }
      })
      return columns.sort((a, b) => a.order - b.order)
    }
  },

  methods: {}
}
</script>

<style lang="scss" scoped>
.board {
  padding: 2em 0;

  ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }
}

.board-columns {
  display: flex;
  flex-direction: row;
  gap: 20px;
  overflow-x: auto;
}

.board-column {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  max-width: 300px;
  align-items: center;
  padding-bottom: 2em;
  overflow-y: auto;
  max-height: 60vh;
  border: 2px solid #eee;
}

.board-column-title {
  position: sticky;
  top: 0;
  margin: 0 0 1em;
  width: 100%;
  text-align: center;
  background: #eee;
}

.board-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
}

.board-card {
  cursor: pointer;
  margin: 0 1em;
  padding: 1em;
  border-radius: 1em;
  overflow: auto;
  border: 1px solid grey;
  background: #eeeeee5a;

  &:hover {
    background: #eeeeee;
  }
}
</style>
