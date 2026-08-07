<template>
  <div class="board">
    <div class="board-empty" v-if="!visibleColumns.length && !isLoading">
      <square-dashed-kanban-icon :size="40" />
      <p>{{ $t('board.empty') }}</p>
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
          disabled: !checkStatusIsAllowed(column.status, draggedTask),
          droppable: dropColumnId === column.id
        }"
        :key="column.id"
        :style="{
          '--status-tint': `${getStatusColor(column.status)}14`
        }"
        :data-status-id="column.id"
        @dragover="onCardDragOver"
        @drop="onCardDrop($event, column.status)"
        v-for="column in visibleColumns"
      >
        <h2 class="board-column-title" :title="column.status.name">
          <span
            class="tag"
            :style="{
              background: getStatusColor(column.status),
              color: getStatusTextColor(column.status)
            }"
          >
            {{ column.status.short_name }}
          </span>
          <span class="task-count">{{ column.tasks.length }}</span>
        </h2>
        <ol class="board-cards">
          <li
            class="board-card"
            :class="{
              selected: isSelected(task),
              dragging: draggedTask?.id === task.id,
              pending: modals.addPreview && modals.task?.id === task.id
            }"
            draggable="true"
            :key="task.id"
            role="button"
            @click="onSelectTask(task, $event.ctrlKey || $event.metaKey)"
            @keydown.enter.prevent="
              onSelectTask(task, $event.ctrlKey || $event.metaKey)
            "
            @dragstart="onCardDragStart($event, task, column.status)"
            @dragend="onCardDragEnd"
            @mouseenter="onCardMouseEnter"
            @mouseleave="onCardMouseLeave"
            tabindex="0"
            :style="{ order: index * 2 }"
            v-for="(task, index) in column.tasks"
          >
            <div
              class="ui-droppable"
              :class="{ 'has-preview': task.entity_preview_file_id }"
              :style="getCardStyle(task)"
            >
              <div
                class="preview-placeholder"
                v-if="!task.entity_preview_file_id"
              >
                <image-icon :size="18" />
              </div>
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
          <li
            class="board-drop-ghost"
            :style="{ order: getGhostOrder(column) }"
            v-if="isGhostVisible(column)"
          >
            <image-up-icon
              :size="18"
              v-if="column.status.is_feedback_request"
            />
          </li>
          <li
            class="board-empty-zone"
            v-if="!column.tasks.length && !isGhostVisible(column)"
          ></li>
        </ol>
      </li>
    </ol>
    <table-info :is-loading="isLoading" :is-error="isError" variant="kanban" />
    <add-preview-modal
      ref="add-preview-modal"
      :active="modals.addPreview"
      :confirm-label="$t('main.confirmation')"
      :is-loading="loading.addPreview"
      :is-error="errors.addPreview"
      :form-data="addPreviewFormData"
      :title="
        modals.task
          ? `${modals.task.entity_name} / ${taskTypeMap.get(modals.task.task_type_id)?.name || ''}`
          : ''
      "
      @cancel="closeAddPreviewModal"
      @confirm="confirmAddPreviewModal"
    />
  </div>
</template>

<script>
import { ImageIcon, ImageUpIcon, SquareDashedKanbanIcon } from 'lucide-vue-next'
import { mapActions, mapGetters } from 'vuex'

import { sortPeople } from '@/lib/sorting'

import { domMixin } from '@/components/mixins/dom'
import { formatListMixin } from '@/components/mixins/format'

import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

export default {
  name: 'kanban-board',

  mixins: [domMixin, formatListMixin],

  components: {
    AddPreviewModal,
    ImageIcon,
    ImageUpIcon,
    PeopleAvatar,
    SquareDashedKanbanIcon,
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
      dropColumnId: null,
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

  created() {
    // Non-reactive drag helpers. The transparent image replaces the native
    // drag snapshot so the DOM proxy below can tilt while following the
    // cursor (a native drag image is a bitmap frozen at dragstart).
    this.emptyDragImage = new Image()
    this.emptyDragImage.src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    this.dragProxy = null
    this.dragProxyInner = null
    this.dragOffset = { x: 0, y: 0 }
    this.lastDragX = 0
    this.proxyRotation = 0
  },

  beforeUnmount() {
    this.removeDragProxy()
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
          tasks,
          droppable: this.checkColumnIsDroppable(status)
        }
      })
      return columns
    },

    visibleColumns() {
      return this.columns.filter(
        column => column.tasks.length || column.droppable
      )
    },

    taskIndexMap() {
      return new Map(this.tasks.map((task, index) => [task.id, index]))
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
      return Boolean(
        this.production ||
        !task ||
        taskStatus.productions.includes(task.project_id)
      )
    },

    checkColumnIsDroppable(taskStatus) {
      if (!this.checkUserIsAllowed(taskStatus, this.user)) {
        return false
      }
      if (this.production) {
        return this.tasks.length > 0
      }
      // Without a selected production, a drop is only possible when at least
      // one visible task belongs to a production exposing this status
      // (mirrors checkStatusIsAllowed at drag time).
      return this.tasks.some(task =>
        taskStatus.productions?.includes(task.project_id)
      )
    },

    getSortedPeople(personIds) {
      const people = personIds.map(id => this.personMap.get(id)).filter(Boolean)
      return sortPeople(people)
    },

    getCardStyle(task) {
      if (!task.entity_preview_file_id) {
        return null
      }
      return {
        backgroundImage: `url(/api/pictures/previews/preview-files/${task.entity_preview_file_id}.png)`
      }
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
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('taskId', task.id)
      event.dataTransfer.setData('taskStatusId', taskStatus.id)
      this.draggedTask = task
      // dragenter/dragleave bubble from children and would make the drop
      // state flicker, so the target column is derived from the pointer
      // position in the document-level dragover instead.
      document.addEventListener('dragover', this.onDocumentDragOver)
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        event.dataTransfer.setDragImage(this.emptyDragImage, 0, 0)
        this.createDragProxy(event)
      }
    },

    onCardDragEnd() {
      this.draggedTask = null
      this.dropColumnId = null
      this.removeDragProxy()
    },

    onCardDragOver(event) {
      event.preventDefault()
    },

    getGhostOrder(column) {
      const movedTask = this.draggedTask || this.modals.task
      if (!movedTask) {
        return 0
      }
      // Cards use even order values (index * 2): the odd value slots the
      // ghost where the dragged card will land in the column sort order.
      const movedIndex = this.taskIndexMap.get(movedTask.id)
      const before = column.tasks.filter(
        task => this.taskIndexMap.get(task.id) < movedIndex
      ).length
      return before * 2 - 1
    },

    isGhostVisible(column) {
      // during the drag, then while the preview-upload modal holds the
      // pending move on a feedback-request status
      return (
        this.dropColumnId === column.id ||
        (this.modals.addPreview && this.form.taskStatusId === column.id)
      )
    },

    updateDropColumn(event) {
      const columnEl = event.target.closest?.('.board-column')
      const status = columnEl
        ? this.statuses.find(({ id }) => id === columnEl.dataset.statusId)
        : null
      const isAllowed =
        status &&
        this.draggedTask &&
        this.draggedTask.task_status_id !== status.id &&
        this.checkUserIsAllowed(status, this.user) &&
        this.checkStatusIsAllowed(status, this.draggedTask)
      this.dropColumnId = isAllowed ? status.id : null
    },

    createDragProxy(event) {
      const card = event.currentTarget
      const rect = card.getBoundingClientRect()
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
      this.lastDragX = event.clientX
      this.proxyRotation = 0
      // The li clone keeps its board-card class and scoped data attributes,
      // so the card styles apply outside the component tree.
      const inner = card.cloneNode(true)
      inner.style.cssText =
        'margin: 0; list-style: none; transition: transform 120ms ease-out;'
      const proxy = document.createElement('div')
      proxy.style.cssText =
        `position: fixed; left: 0; top: 0; width: ${rect.width}px; ` +
        'margin: 0; pointer-events: none; z-index: 2000; will-change: transform;'
      proxy.style.transform = `translate(${rect.left}px, ${rect.top}px)`
      proxy.appendChild(inner)
      // Kept inside the component tree: the theme class carrying the CSS
      // custom properties wraps the app, so a body-level clone would
      // resolve them to their light values.
      this.$el.appendChild(proxy)
      this.dragProxy = proxy
      this.dragProxyInner = inner
    },

    onDocumentDragOver(event) {
      this.updateDropColumn(event)
      // The last dragover of a cancelled drag reports (0, 0)
      if (!this.dragProxy || (event.clientX === 0 && event.clientY === 0)) {
        return
      }
      const x = event.clientX - this.dragOffset.x
      const y = event.clientY - this.dragOffset.y
      this.dragProxy.style.transform = `translate(${x}px, ${y}px)`
      const target = Math.max(
        -6,
        Math.min(6, (event.clientX - this.lastDragX) * 1.5)
      )
      this.lastDragX = event.clientX
      // low-pass filter so the tilt follows the drag direction without jitter
      this.proxyRotation = this.proxyRotation * 0.7 + target * 0.3
      this.dragProxyInner.style.transform = `rotate(${this.proxyRotation}deg)`
    },

    removeDragProxy() {
      document.removeEventListener('dragover', this.onDocumentDragOver)
      this.dragProxy?.remove()
      this.dragProxy = null
      this.dragProxyInner = null
    },

    onCardDrop(event, taskStatus) {
      this.dropColumnId = null

      const isAllowed =
        this.draggedTask &&
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

    async confirmAddPreviewModal(forms) {
      this.loading.addPreview = true
      this.errors.addPreview = false
      this.loadPreviewFileFormData(forms)
      try {
        // keep the modal (and the pending ghost) up until the upload went
        // through, so a failure does not silently drop the move
        await this.commentTaskWithPreview({
          comment: '',
          taskId: this.form.taskId,
          taskStatusId: this.form.taskStatusId
        })
        this.closeAddPreviewModal()
      } catch (err) {
        console.error(err)
        this.errors.addPreview = true
      } finally {
        this.loading.addPreview = false
      }
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
}

.board-empty {
  align-items: center;
  color: var(--text);
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.75em;
  justify-content: flex-start;
  opacity: 0.55;
  padding: 2em 1em 0;
  text-align: center;

  p {
    margin: 0;
    max-width: 40ch;
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
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 1em;
}

.board-column {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  max-width: 300px;
  // the panel hugs its content, so its bottom edge is a real end and can
  // keep the full radius
  align-self: flex-start;
  background: var(--background-panel);
  border-radius: 12px;
  max-height: 100%;

  &.disabled {
    opacity: 0.3;
    filter: grayscale(1);
  }

  &.droppable:not(.disabled) {
    background: var(--status-tint);

    * {
      pointer-events: none;
    }
  }
}

.board-column-title {
  align-items: center;
  border: none;
  display: flex;
  gap: 0.5em;
  margin: 0;
  padding: 0.5em 12px 0.25em;
  width: 100%;

  .tag {
    font-weight: bold;
  }

  .task-count {
    color: var(--text);
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0.6;
  }
}

.board-cards {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1em;
  min-height: 0;
  overflow-y: auto;
  padding: 0.75em 12px 1em;
  // Chrome >= 121 ignores ::-webkit-scrollbar-* once scrollbar-width is set,
  // so the thumb color must also go through scrollbar-color; the webkit rules
  // below still cover the older Chromiums of the browser floor.
  scrollbar-color: rgba(var(--skeleton-rgb), 0.4) transparent;
  scrollbar-width: thin;
  width: 100%;

  &::-webkit-scrollbar {
    background: transparent;
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-button {
    display: none;
    height: 0;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--skeleton-rgb), 0.4);
    border-radius: 4px;
  }
}

.board-empty-zone {
  align-items: center;
  border: 1px dashed rgba(var(--skeleton-rgb), 0.7);
  border-radius: 10px;
  color: var(--text);
  display: flex;
  height: 120px;
  justify-content: center;
}

.board-drop-ghost {
  align-items: center;
  background: var(--status-tint);
  border: 1px dashed rgba(var(--skeleton-rgb), 0.7);
  border-radius: 10px;
  // announces that dropping here will ask for a preview file
  color: var(--text);
  display: flex;
  justify-content: center;
  min-height: 180px;
  opacity: 0.9;
}

.board-card {
  cursor: grab;
  // the box-shadow ring below replaces the square native focus outline
  outline: none;
  position: relative;

  .ui-droppable {
    border-radius: 10px;
    // borderless in light: crisp shadows carry the edge there, while the
    // dark override below restores the border that dark mode relies on
    border: 1px solid transparent;
    // background-alt-2 is white in light theme: the cards must stand out
    // from the column panel, which sits close to background-alt there
    background-color: var(--background-alt-2);
    background-position: center;
    background-size: cover;
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    min-height: 180px;
    position: relative;
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out;

    &.has-preview {
      // dark fallback keeps the white overlay text readable if the
      // thumbnail fails to load or is transparent
      background-color: #2a2d33;

      .infos {
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
        border-radius: 0 0 9px 9px;
        margin-top: auto;
        padding-top: 1.5em;

        .production-name {
          color: #eee;
          opacity: 0.9;
        }

        .entity-name {
          color: $white;
        }
      }
    }
  }

  &:hover .ui-droppable {
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.14),
      0 6px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  // Box-shadow rings follow the border radius, unlike outlines, and
  // :focus-visible keeps the ring for keyboard focus only: cards are
  // focused on mouse hover too (Enter-to-select), which would otherwise
  // flash the ring on every hover.
  &:focus-visible .ui-droppable {
    box-shadow:
      0 0 0 3px var(--background-selectable),
      0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &.selected .ui-droppable {
    box-shadow:
      0 0 0 3px var(--background-selected),
      0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &.dragging,
  &.pending {
    opacity: 0.4;
  }

  &.dragging {
    cursor: grabbing;
  }
}

.dark .board-card .ui-droppable {
  // faint light edge: border-alt (#666) frames too hard against the
  // darker panel
  border-color: rgba(255, 255, 255, 0.08);
}

.preview-placeholder {
  align-items: center;
  background: rgba(var(--border-rgb), 0.25);
  border-radius: 10px 10px 0 0;
  color: var(--text);
  display: flex;
  flex: 1;
  justify-content: center;
  opacity: 0.8;
}

.avatars {
  position: absolute;
  right: 8px;
  top: 8px;
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
  padding: 0.6em 0.7em 0.7em;
  word-break: break-word;

  .entity {
    gap: 10px;
    justify-content: space-between;
  }

  .production-name {
    color: var(--text);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    opacity: 0.65;
    text-transform: uppercase;
  }

  .entity-name {
    color: var(--text-strong);
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

@media (prefers-reduced-motion: reduce) {
  .board-card .ui-droppable {
    transition: none;
  }

  .board-card:hover .ui-droppable {
    transform: none;
  }
}
</style>
