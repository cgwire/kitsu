<template>
  <div class="board">
    <div class="box" v-if="!columns.length && !isLoading">
      {{ $t('board.empty') }}
    </div>
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
      v-else
    >
      <li
        class="board-column"
        :key="column.id"
        @dragenter="onCardDragEnter($event, column.status)"
        @dragover="onCardDragOver"
        @dragleave="onCardDragLeave"
        @drop="onCardDrop($event, column.status)"
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
    <add-preview-modal
      ref="add-preview-modal"
      :active="modals.addPreview"
      :confirmLabel="$t('main.confirmation')"
      :is-loading="loading.addPreview"
      :is-error="errors.addPreview"
      :form-data="addPreviewFormData"
      :title="
        task
          ? `${task.entity_name} / ${taskTypeMap.get(task.task_type_id).name}`
          : ''
      "
      @cancel="closeAddPreviewModal"
      @confirm="confirmAddPreviewModal"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import { sortPeople } from '@/lib/sorting'

import { domMixin } from '@/components/mixins/dom'
import { formatListMixin } from '@/components/mixins/format'

import AddPreviewModal from '@/components/modals/AddPreviewModal'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import TableInfo from '@/components/widgets/TableInfo'
import TaskTypeName from '@/components/widgets/TaskTypeName'

export default {
  name: 'kanban-board',

  mixins: [domMixin, formatListMixin],

  components: {
    AddPreviewModal,
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
    },
    user: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      addPreviewFormData: null,
      isScrollingX: false,
      initialClientX: null,
      errors: {
        addPreview: null
      },
      form: {
        taskId: null,
        taskStatusId: null
      },
      loading: {
        addPreview: false
      },
      modals: {
        addPreview: false
      },
      task: null
    }
  },

  computed: {
    ...mapGetters([
      'isDarkTheme',
      'getTaskPreviews',
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
    ...mapActions([
      'addSelectedTasks',
      'clearSelectedTasks',
      'commentTask',
      'commentTaskWithPreview',
      'loadPreviewFileFormData'
    ]),

    checkUserIsAllowed(taskStatus, user) {
      const role = user.role
      return !(
        (role === 'user' && !taskStatus.is_artist_allowed) ||
        (role === 'client' && !taskStatus.is_client_allowed)
      )
    },

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
      if (!this.isScrollingX) {
        return
      }
      event.preventDefault()
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

    onCardDragEnter(event, taskStatus) {
      this.isAllowed = this.checkUserIsAllowed(taskStatus, this.user)
      if (this.isAllowed) {
        event.currentTarget.classList.add('droppable')
      }
    },

    onCardDragOver(event) {
      event.preventDefault()
    },

    onCardDragLeave(event) {
      event.target.classList.remove('droppable')
    },

    onCardDrop(event, taskStatus) {
      event.currentTarget.classList.remove('droppable')

      const isAllowed = this.checkUserIsAllowed(taskStatus, this.user)
      if (!isAllowed) {
        return
      }
      const taskId = event.dataTransfer.getData('taskId')
      if (taskStatus.is_feedback_request) {
        const taskPreviews = this.getTaskPreviews(taskId)
        if (!taskPreviews?.length) {
          this.form.taskId = taskId
          this.form.taskStatusId = taskStatus.id
          this.task = this.tasks.find(({ id }) => id === taskId)
          this.modals.addPreview = true
          return
        }
      }
      const previousTaskStatusId = event.dataTransfer.getData('taskStatusId')
      if (previousTaskStatusId === taskStatus.id) {
        return
      }
      this.commentTask({
        taskId,
        taskStatusId: taskStatus.id
      })
    },

    onCardMouseEnter(event) {
      event.currentTarget.focus()
    },

    onCardMouseLeave(event) {
      event.currentTarget.blur()
    },

    closeAddPreviewModal() {
      this.modals.addPreview = false
    },

    confirmAddPreviewModal(forms) {
      this.loadPreviewFileFormData(forms)
      this.commentTaskWithPreview({
        comment: '',
        taskId: this.form.taskId,
        taskStatusId: this.form.taskStatusId
      })
      this.closeAddPreviewModal()
    }
  }
}
</script>

<style lang="scss" scoped>
.board {
  user-select: none;
  flex: 1;
  flex-direction: column;
  display: flex;
  overflow-y: auto;

  > .box {
    margin: 2px; // avoid the overflow from hiding the box-shadow
  }
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
