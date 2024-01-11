<template>
  <div class="board">
    <table-info class="mb2" :is-loading="isLoading" :is-error="isError" />
    <ol class="board-columns">
      <li
        class="board-column"
        :key="column.id"
        @dragenter="onCardDragEnter"
        @dragover="onCardDragOver"
        @dragleave="onCardDragLeave"
        @drop="onCardDrop($event, column.status.id)"
        v-for="column in columns"
      >
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
            draggable
            :key="task.id"
            @dragstart="onCardDragStart($event, task)"
            @drag="onCardDrag"
            @dragend="onCardDragEnd"
            @mouseenter="onCardMouseEnter"
            @mouseleave="onCardMouseLeave"
            tabindex="0"
            v-for="task in column.tasks"
          >
            <div class="ui-droppable">
              <div class="flexrow">
                <entity-thumbnail
                  :empty-width="60"
                  :empty-height="40"
                  :entity="{ preview_file_id: task.entity_preview_file_id }"
                />
                <div class="pa1 ellipsis">
                  {{ task.full_entity_name }}
                </div>
              </div>
              <div class="level mt05">
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
            </div>
          </li>
        </ol>
      </li>
    </ol>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import { sortPeople } from '@/lib/sorting'

import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import TableInfo from '@/components/widgets/TableInfo'
import TaskTypeName from '@/components/widgets/TaskTypeName'

export default {
  name: 'kanban-board',
  mixins: [],

  components: {
    EntityThumbnail,
    PeopleAvatar,
    TableInfo,
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

  computed: {
    ...mapGetters(['isDarkTheme', 'personMap', 'productionMap', 'taskTypeMap']),

    columns() {
      const columns = this.statuses.map(status => {
        const tasks = this.tasks.filter(
          task => task.task_status_id === status.id
        )
        return {
          id: status.id,
          status,
          tasks
        }
      })
      return columns
    }
  },

  methods: {
    ...mapActions(['commentTask']),

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
    },

    onCardDragStart(event, task) {
      event.stopPropagation()
      event.target.classList.add('drag')
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('taskId', task.id)
    },

    onCardDrag(event) {
      event.stopPropagation()
      event.target.classList.add('dragging')
    },

    onCardDragEnd(event) {
      event.target.classList.remove('drag')
      event.target.classList.remove('dragging')
    },

    onCardDragEnter(event) {
      event.currentTarget.classList.add('droppable')
    },

    onCardDragOver(event) {
      event.preventDefault()
    },

    onCardDragLeave(event) {
      event.target.classList.remove('droppable')
    },

    onCardDrop(event, taskStatusId) {
      event.currentTarget.classList.remove('droppable')
      const taskId = event.dataTransfer.getData('taskId')
      this.commentTask({
        taskId,
        taskStatusId
      })
    },

    onCardMouseEnter(event) {
      event.currentTarget.focus()
    },

    onCardMouseLeave(event) {
      event.currentTarget.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
.board {
  padding: 2em 0;
}

.board-columns,
.board-cards {
  list-style: none;
  padding: 0;
  margin: 0;
}

.board-columns {
  display: flex;
  flex-direction: row;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 2em;
}

.board-column {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  max-width: 300px;
  align-items: center;
  overflow-y: auto;
  max-height: 60vh;
  border: 2px solid $white-grey;
  border-radius: 0.5em;

  &.droppable {
    background: var(--background-selectable);

    * {
      pointer-events: none;
    }
  }
}

.board-column-title {
  position: sticky;
  top: 0;
  margin: 0;
  padding-top: 5px;
  width: 100%;
  text-align: center;
  background: $white-grey;
  border: none;

  .tag {
    font-weight: bold;
  }
}

.board-cards {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 2em 1em;
  width: 100%;
}

.board-card {
  cursor: grab;

  .ui-droppable {
    padding: 1em;
    border-radius: 1em;
    border: 1px solid $white-grey;
    background-color: $white-grey-light;
  }

  &:focus-within {
    .ui-droppable {
      outline: 2px solid var(--background-selected);
    }
  }

  &.drag {
    transform: translate(0, 0); // fix dragging style

    .ui-droppable {
      background: var(--background-selected);
      transform: rotate(5deg);
    }
  }

  &.dragging {
    cursor: grabbing;
    opacity: 0.5;

    .ui-droppable {
      transform: rotate(0);
      border: 1px solid $white-grey;
      background-color: $white-grey-light;
    }
  }
}

.avatars {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.thumbnail-picture {
  background-color: black;
}
</style>
