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
        :class="{
          disabled: !checkStatusIsAllowed(column.status, draggedTask)
        }"
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
            draggable="true"
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
              <entity-preview
                class="entity-preview"
                :empty-height="100"
                :entity="{ preview_file_id: task.entity_preview_file_id }"
                cover
                is-rounded-top-border
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
              </div>
              <div class="infos">
                <div class="production-name">
                  {{ productionMap.get(task.project_id)?.name }}
                </div>
                <div class="entity flexrow">
                  <div class="entity-name">
                    {{ task.full_entity_name }}
                  </div>
                  <task-type-name
                    class="task-type-name"
                    rounded
                    :task-id="task.id"
                    :task-type="getTaskType(task)"
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
      :confirm-label="$t('main.confirmation')"
      :is-loading="loading.addPreview"
      :is-error="errors.addPreview"
      :form-data="addPreviewFormData"
      :title="
        modals.task
          ? `${modals.task.entity_name} / ${taskTypeMap.get(modals.task.task_type_id).name}`
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

import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

export default {
  name: 'kanban-board',

  mixins: [domMixin, formatListMixin],

  components: {
    AddPreviewModal,
    EntityPreview,
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
    production: {
      type: Object,
      default: () => {}
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
      draggedTask: null,
      initialClientX: null,
      isScrollingX: false,
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
        addPreview: false,
        task: null
      }
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

    checkStatusIsAllowed(taskStatus, task) {
      return (
        this.production ||
        !task ||
        taskStatus.productions.includes(task.project_id)
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
      const taskType = { ...this.taskTypeMap.get(task.task_type_id) }
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
      this.draggedTask = task
    },

    onCardDrag(event) {
      event.stopPropagation()
      event.target.classList.add('dragging')
    },

    onCardDragEnd(event) {
      event.target.classList.remove('drag')
      event.target.classList.remove('dragging')
      this.draggedTask = null
    },

    onCardDragEnter(event, taskStatus) {
      const isAllowed = this.checkUserIsAllowed(taskStatus, this.user)
      if (isAllowed) {
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

      const isAllowed =
        this.checkUserIsAllowed(taskStatus, this.user) &&
        this.checkStatusIsAllowed(taskStatus, this.draggedTask)
      if (!isAllowed) {
        return
      }

      const previousTaskStatusId = event.dataTransfer.getData('taskStatusId')
      if (previousTaskStatusId === taskStatus.id) {
        return
      }

      const taskId = event.dataTransfer.getData('taskId')

      if (taskStatus.is_feedback_request) {
        this.form.taskId = taskId
        this.form.taskStatusId = taskStatus.id
        this.modals.task = this.tasks.find(({ id }) => id === taskId)
        this.modals.addPreview = true
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
      this.modals.task = null
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

  &.disabled {
    opacity: 0.3;
    filter: grayscale(1);
  }

  &.droppable:not(.disabled) {
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
  z-index: 1;

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
  position: relative;

  .ui-droppable {
    border-radius: 10px;
    border: 1px solid var(--border-alt);
    background-color: var(--background-alt);
  }

  &.selected {
    cursor: grab;

    .ui-droppable {
      outline: 3px solid var(--background-selected);
    }
  }

  &:focus-within {
    .ui-droppable {
      outline: 3px solid var(--background-selectable);
    }
    &.selected {
      .ui-droppable {
        outline: 3px solid var(--background-selected);
      }
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

.entity-preview {
  cursor: inherit;
}

.avatars {
  position: absolute;
  right: 5px;
  top: 75px;
  display: flex;
  flex-direction: row;
  gap: 0.25em;
}

.priority {
  border-radius: 5px;
  display: inline-block;
  color: $white;
  margin-left: 0.25em;
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

.infos {
  padding: 0.5em;
  word-break: break-word;

  .entity {
    gap: 10px;
    justify-content: space-between;
  }

  .production-name {
    color: var(--text);
    font-size: 0.9em;
    font-weight: 400;
    text-transform: uppercase;
  }

  .entity-name {
    font-size: 1.1em;
    font-weight: 600;
  }

  .task-type-name {
    cursor: inherit;
    display: inline-block;
    line-height: 25px;
    max-width: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
