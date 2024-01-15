<template>
  <div class="board">
    <ol
      class="board-columns"
      @mousedown="onBoardScrollStart"
      @touchstart="onBoardScrollStart"
      @mousemove="onBoardScrolling"
      @touchmove="onBoardScrolling"
      @mouseup="onBoardScrollEnd"
      @touchend="onBoardScrollEnd"
      @mouseleave="onBoardScrollEnd"
      @touchcancel="onBoardScrollEnd"
    >
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
            :class="{
              selected: isSelected(task)
            }"
            draggable
            :key="task.id"
            @click="onSelectTask(task, $event.ctrlKey || $event.metaKey)"
            @dragstart="onCardDragStart($event, task, column.status)"
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
                  :empty-width="80"
                  :empty-height="60"
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
                  <span
                    class="priority"
                    :class="{
                      high: task.priority === 1,
                      veryhigh: task.priority === 2,
                      emergency: task.priority === 3
                    }"
                    :title="formatPriority(task.priority)"
                    v-if="task.priority > 0"
                  >
                    {{ formatPrioritySymbol(task.priority) }}
                  </span>
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
    <table-info :is-loading="isLoading" :is-error="isError" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import { sortPeople } from '@/lib/sorting'

import { domMixin } from '@/components/mixins/dom'
import { formatListMixin } from '@/components/mixins/format'

import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import TableInfo from '@/components/widgets/TableInfo'
import TaskTypeName from '@/components/widgets/TaskTypeName'

export default {
  name: 'kanban-board',

  mixins: [domMixin, formatListMixin],

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

  data() {
    return {
      isScrollingX: false,
      initialClientX: null
    }
  },

  computed: {
    ...mapGetters([
      'isDarkTheme',
      'personMap',
      'productionMap',
      'selectedTasks',
      'taskTypeMap'
    ]),

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
    ...mapActions(['addSelectedTasks', 'clearSelectedTasks', 'commentTask']),

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

    isSelected(task) {
      return this.selectedTasks.has(task.id)
    },

    onSelectTask(task, isMultipleSelection = false) {
      const selection = isMultipleSelection
        ? new Map(this.selectedTasks)
        : new Map()
      if (this.isSelected(task)) {
        selection.delete(task.id)
      } else {
        selection.set(task.id, task)
      }
      this.clearSelectedTasks()
      this.addSelectedTasks(
        Array.from(selection.values()).map(task => ({
          task
        }))
      )
    },

    onBoardScrollStart(event) {
      event.currentTarget.style.cursor = 'grabbing'
      this.isScrollingX = !event.target.closest('.board-card')
      this.initialClientX = this.getClientX(event)
    },

    onBoardScrolling(event) {
      event.preventDefault()
      if (!this.isScrollingX) {
        return
      }
      const clientX = this.getClientX(event)
      const diffX = clientX - this.initialClientX
      event.currentTarget.scrollLeft -= diffX
      this.initialClientX = clientX
    },

    onBoardScrollEnd(event) {
      if (!this.isScrollingX) {
        return
      }
      event.currentTarget.style.cursor = 'default'
      this.isScrollingX = false
    },

    onCardDragStart(event, task, taskStatus) {
      event.stopPropagation()
      event.target.classList.add('drag')
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('taskId', task.id)
      event.dataTransfer.setData('taskStatusId', taskStatus.id)
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
      const previousTaskStatusId = event.dataTransfer.getData('taskStatusId')
      if (previousTaskStatusId === taskStatusId) {
        return
      }
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
  user-select: none;
  flex: 1;
  display: flex;
  max-height: 80%;
}

.board-columns,
.board-cards {
  list-style: none;
  padding: 0;
  margin: 0;
}

.board-columns {
  display: flex;
  flex: 1;
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
  border: 2px solid var(--border-alt);
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
  background: var(--border-alt);
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
  cursor: pointer;

  .ui-droppable {
    padding: 1em;
    border-radius: 1em;
    border: 1px solid var(--border-alt);
    background-color: var(--background-alt);
  }

  &.selected {
    cursor: grab;

    .ui-droppable {
      background: var(--background-selected);
    }
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
      border: 1px solid var(--border-alt);
      background-color: var(--background-alt);
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

.priority {
  border-radius: 5px;
  display: inline-block;
  color: white;
  margin-left: 5px;
  font-weight: bold;
  min-width: 23px;
  text-align: center;

  &.high {
    background: $yellow;
  }

  &.veryhigh {
    background: $orange;
  }

  &.emergency {
    background: $red;
  }
}
</style>
