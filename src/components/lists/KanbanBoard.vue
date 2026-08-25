<template>
  <div class="board" ref="board">
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

<script setup>
import { ImageIcon, ImageUpIcon, SquareDashedKanbanIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, reactive, ref, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import { getClientX } from '@/composables/dom'
import { formatPrioritySymbol, useFormat } from '@/composables/format'
import { sortPeople } from '@/lib/sorting'

import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const store = useStore()
const { formatPriority } = useFormat()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
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
})

// State
// --------------------------------------------------------------------------
const addPreviewFormData = ref(null)
const draggedTask = ref(null)
const dropColumnId = ref(null)
const initialClientX = ref(null)
const isScrollingX = ref(false)
const errors = reactive({
  addPreview: null
})
const form = reactive({
  taskId: null,
  taskStatusId: null
})
const loading = reactive({
  addPreview: false
})
const modals = reactive({
  addPreview: false,
  task: null
})

const boardRef = useTemplateRef('board')

// Non-reactive drag helpers. The transparent image replaces the native
// drag snapshot so the DOM proxy below can tilt while following the
// cursor (a native drag image is a bitmap frozen at dragstart).
const emptyDragImage = new Image()
emptyDragImage.src =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
let dragProxy = null
let dragProxyInner = null
let dragOffset = { x: 0, y: 0 }
let lastDragX = 0
let proxyRotation = 0

// Computed
// --------------------------------------------------------------------------
const isDarkTheme = computed(() => store.getters.isDarkTheme)
const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)
const selectedTasks = computed(() => store.getters.selectedTasks)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const columns = computed(() =>
  props.statuses.map(status => ({
    id: status.id,
    status,
    tasks: props.tasks.filter(task => task.task_status_id === status.id),
    droppable: checkColumnIsDroppable(status)
  }))
)

const visibleColumns = computed(() =>
  columns.value.filter(column => column.tasks.length || column.droppable)
)

const taskIndexMap = computed(
  () => new Map(props.tasks.map((task, index) => [task.id, index]))
)

// Functions
// --------------------------------------------------------------------------
const checkUserIsAllowed = (taskStatus, user) => {
  const role = user.role
  return !(
    (role === 'user' && !taskStatus.is_artist_allowed) ||
    (role === 'client' && !taskStatus.is_client_allowed)
  )
}

const checkStatusIsAllowed = (taskStatus, task) =>
  Boolean(
    props.production ||
    !task ||
    taskStatus.productions.includes(task.project_id)
  )

const checkColumnIsDroppable = taskStatus => {
  if (!checkUserIsAllowed(taskStatus, props.user)) {
    return false
  }
  if (props.production) {
    return props.tasks.length > 0
  }
  // Without a selected production, a drop is only possible when at least
  // one visible task belongs to a production exposing this status
  // (mirrors checkStatusIsAllowed at drag time).
  return props.tasks.some(task =>
    taskStatus.productions?.includes(task.project_id)
  )
}

const getSortedPeople = personIds => {
  const people = personIds.map(id => personMap.value.get(id)).filter(Boolean)
  return sortPeople(people)
}

const getCardStyle = task => {
  if (!task.entity_preview_file_id) {
    return null
  }
  return {
    backgroundImage: `url(/api/pictures/previews/preview-files/${task.entity_preview_file_id}.png)`
  }
}

const getStatusColor = status => {
  if (status.name === 'Todo' && isDarkTheme.value) {
    return '#5F626A'
  }
  return status.color
}

const getStatusTextColor = status => {
  if (status.name === 'Todo' && !isDarkTheme.value) {
    return '#333'
  }
  return 'white'
}

const getTaskType = task => {
  const taskType = { ...taskTypeMap.value.get(task.task_type_id) }
  const production = productionMap.value.get(task.project_id)
  taskType.episode_id = task.episode_id
  if (production?.production_type === 'tvshow' && !task.episode_id) {
    taskType.episode_id = production.first_episode_id
  }
  return taskType
}

const isSelected = task => selectedTasks.value.has(task.id)

const onSelectTask = (task, isMultipleSelection = false) => {
  const selection = isMultipleSelection
    ? new Map(selectedTasks.value)
    : new Map()
  if (isSelected(task)) {
    selection.delete(task.id)
  } else {
    selection.set(task.id, task)
  }
  store.dispatch('clearSelectedTasks')
  store.dispatch(
    'addSelectedTasks',
    Array.from(selection.values()).map(task => ({
      task
    }))
  )
}

const onBoardScrollStart = event => {
  event.currentTarget.style.cursor = 'grabbing'
  isScrollingX.value = !event.target.closest('.board-card')
  initialClientX.value = getClientX(event)
}

const onBoardScrolling = event => {
  if (!isScrollingX.value) {
    return
  }
  event.preventDefault()
  const clientX = getClientX(event)
  const diffX = clientX - initialClientX.value
  event.currentTarget.scrollLeft -= diffX
  initialClientX.value = clientX
}

const onBoardScrollEnd = event => {
  if (!isScrollingX.value) {
    return
  }
  event.currentTarget.style.cursor = 'default'
  isScrollingX.value = false
}

const onCardDragStart = (event, task, taskStatus) => {
  event.stopPropagation()
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('taskId', task.id)
  event.dataTransfer.setData('taskStatusId', taskStatus.id)
  draggedTask.value = task
  // dragenter/dragleave bubble from children and would make the drop
  // state flicker, so the target column is derived from the pointer
  // position in the document-level dragover instead.
  document.addEventListener('dragover', onDocumentDragOver)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    event.dataTransfer.setDragImage(emptyDragImage, 0, 0)
    createDragProxy(event)
  }
}

const onCardDragEnd = () => {
  draggedTask.value = null
  dropColumnId.value = null
  removeDragProxy()
}

const onCardDragOver = event => {
  event.preventDefault()
}

const getGhostOrder = column => {
  const movedTask = draggedTask.value || modals.task
  if (!movedTask) {
    return 0
  }
  // Cards use even order values (index * 2): the odd value slots the
  // ghost where the dragged card will land in the column sort order.
  const movedIndex = taskIndexMap.value.get(movedTask.id)
  const before = column.tasks.filter(
    task => taskIndexMap.value.get(task.id) < movedIndex
  ).length
  return before * 2 - 1
}

const isGhostVisible = column =>
  // during the drag, then while the preview-upload modal holds the
  // pending move on a feedback-request status
  dropColumnId.value === column.id ||
  (modals.addPreview && form.taskStatusId === column.id)

const updateDropColumn = event => {
  const columnEl = event.target.closest?.('.board-column')
  const status = columnEl
    ? props.statuses.find(({ id }) => id === columnEl.dataset.statusId)
    : null
  const isAllowed =
    status &&
    draggedTask.value &&
    draggedTask.value.task_status_id !== status.id &&
    checkUserIsAllowed(status, props.user) &&
    checkStatusIsAllowed(status, draggedTask.value)
  dropColumnId.value = isAllowed ? status.id : null
}

const createDragProxy = event => {
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  dragOffset = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  lastDragX = event.clientX
  proxyRotation = 0
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
  boardRef.value.appendChild(proxy)
  dragProxy = proxy
  dragProxyInner = inner
}

const onDocumentDragOver = event => {
  updateDropColumn(event)
  // The last dragover of a cancelled drag reports (0, 0)
  if (!dragProxy || (event.clientX === 0 && event.clientY === 0)) {
    return
  }
  const x = event.clientX - dragOffset.x
  const y = event.clientY - dragOffset.y
  dragProxy.style.transform = `translate(${x}px, ${y}px)`
  const target = Math.max(-6, Math.min(6, (event.clientX - lastDragX) * 1.5))
  lastDragX = event.clientX
  // low-pass filter so the tilt follows the drag direction without jitter
  proxyRotation = proxyRotation * 0.7 + target * 0.3
  dragProxyInner.style.transform = `rotate(${proxyRotation}deg)`
}

const removeDragProxy = () => {
  document.removeEventListener('dragover', onDocumentDragOver)
  dragProxy?.remove()
  dragProxy = null
  dragProxyInner = null
}

const onCardDrop = (event, taskStatus) => {
  dropColumnId.value = null

  const isAllowed =
    draggedTask.value &&
    checkUserIsAllowed(taskStatus, props.user) &&
    checkStatusIsAllowed(taskStatus, draggedTask.value)
  if (!isAllowed) {
    return
  }

  const previousTaskStatusId = event.dataTransfer.getData('taskStatusId')
  if (previousTaskStatusId === taskStatus.id) {
    return
  }

  const taskId = event.dataTransfer.getData('taskId')

  if (taskStatus.is_feedback_request) {
    form.taskId = taskId
    form.taskStatusId = taskStatus.id
    modals.task = props.tasks.find(({ id }) => id === taskId)
    modals.addPreview = true
    return
  }

  store.dispatch('commentTask', {
    taskId,
    taskStatusId: taskStatus.id
  })
}

const onCardMouseEnter = event => {
  event.currentTarget.focus()
}

const onCardMouseLeave = event => {
  event.currentTarget.blur()
}

const closeAddPreviewModal = () => {
  modals.addPreview = false
  modals.task = null
}

const confirmAddPreviewModal = async forms => {
  loading.addPreview = true
  errors.addPreview = false
  store.dispatch('loadPreviewFileFormData', forms)
  try {
    // keep the modal (and the pending ghost) up until the upload went
    // through, so a failure does not silently drop the move
    await store.dispatch('commentTaskWithPreview', {
      comment: '',
      taskId: form.taskId,
      taskStatusId: form.taskStatusId
    })
    closeAddPreviewModal()
  } catch (err) {
    console.error(err)
    errors.addPreview = true
  } finally {
    loading.addPreview = false
  }
}

// Lifecycle
// --------------------------------------------------------------------------
onBeforeUnmount(() => {
  removeDragProxy()
})
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
  // faint light edge, as a solid color: an alpha border would let the
  // cover image bleed through and look milky
  border-color: #55585d;
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
