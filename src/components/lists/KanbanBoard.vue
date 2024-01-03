<template>
  <div class="board">
    <ol class="board-columns">
      <li class="board-column" :key="column.id" v-for="column in columns">
        <h2 class="board-column-title">
          <span
            class="tag"
            :style="{
              background: getStatusColor(column.status),
              color: getStatusTextColor(column.status)
            }"
            :title="column.status.name"
          >
            {{ column.status.short_name }}
          </span>
        </h2>
        <ol class="board-cards">
          <li
            class="board-card"
            draggable="true"
            :key="task.id"
            v-for="task in column.tasks"
          >
            <div>{{ task.project_name }}</div>
            <div class="flexrow">
              <entity-thumbnail
                :empty-width="60"
                :empty-height="40"
                :entity="{ preview_file_id: task.entity_preview_file_id }"
              />
              <div class="pa1">
                <span>{{ task.full_entity_name }}</span>
              </div>
            </div>
            <div class="level">
              <task-type-name
                :task-id="task.id"
                :task-type="getTaskType(task)"
              />
              <div class="avatars">
                <people-avatar
                  :is-link="false"
                  :key="`${task.id}-${person.id}`"
                  :person="person"
                  :size="20"
                  :font-size="12"
                  v-for="person in getSortedPeople(task.assignees)"
                />
              </div>
            </div>
          </li>
        </ol>
      </li>
    </ol>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { sortPeople } from '@/lib/sorting'

import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import TaskTypeName from '@/components/widgets/TaskTypeName'

export default {
  name: 'kanban-board',
  mixins: [],

  components: {
    EntityThumbnail,
    PeopleAvatar,
    TaskTypeName
  },

  props: {
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    statuses: {
      type: Array,
      default: () => []
    },
    tasks: {
      type: Array,
      default: () => []
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
    ...mapGetters(['isDarkTheme', 'personMap', 'productionMap', 'taskTypeMap']),

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

  methods: {
    getSortedPeople(personIds) {
      const people = personIds.map(id => this.personMap.get(id))
      return sortPeople(people)
    },

    getStatusColor(status) {
      if (status.name === 'Todo' && this.isDarkTheme) {
        return '#5F626A'
      } else {
        return status.color
      }
    },

    getStatusTextColor(status) {
      if (status.name === 'Todo' && !this.isDarkTheme) {
        return '#333'
      } else {
        return 'white'
      }
    },

    getTaskType(task) {
      const taskType = this.taskTypeMap.get(task.task_type_id)
      const production = this.productionMap.get(task.project_id)
      taskType.episode_id = task.episode_id
      if (production?.production_type === 'tvshow' && !task.episode_id) {
        taskType.episode_id = production.first_episode_id
      }
      return taskType
    }
  }
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
  padding-top: 5px;
  width: 100%;
  text-align: center;
  background: #eee;
  border: none;

  .tag {
    font-weight: bold;
  }
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
  border: 1px solid #eee;
  background: #eeeeee5a;

  &:hover {
    cursor: grab;
    background: #eee;
  }

  .avatars {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }
}

.thumbnail-picture {
  background-color: black;
}
</style>
