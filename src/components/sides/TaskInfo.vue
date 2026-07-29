<template>
  <div class="side-wrapper" ref="side-wrapper">
    <div
      class="extend-bar"
      @mousedown.prevent="onExtendDown"
      @touchstart.prevent="onExtendDown"
      v-if="extendable"
    ></div>
    <div class="side task-info">
      <action-panel
        v-if="
          withActions &&
          (!isConceptTask || selectedConcepts.size > 0) &&
          (nbSelectedEntities > 0 ||
            nbSelectedTasks > 0 ||
            nbSelectedValidations > 0)
        "
        :is-movie-preview="isMoviePreview"
        :is-set-frame-thumbnail-loading="loading.setFrameThumbnail"
        :production-id="currentProductionId"
        :team="currentTeam"
        @export-task="onExportClick"
        @set-frame-thumbnail="onSetCurrentFrameAsThumbnail"
      />

      <div
        class="multi-selection-info pa1"
        v-if="
          withActions &&
          ((nbSelectedTasks || 0) > 1 || nbSelectedValidations > 0)
        "
      >
        <h2 class="title">
          {{ $t('tasks.selected_tasks') }}
          ({{ nbSelectedTasks }})
        </h2>
        <div class="task-list mt1">
          <div
            class="selected-task-line flexrow"
            :key="task.id"
            v-for="task in selectedTasksToDisplay"
          >
            <task-type-name
              class="flexrow-item task-type"
              :task-type="taskTypeMap.get(task.task_type_id)"
              :production-id="task.project_id"
            />
            <span class="flexrow-item">{{ task.entity_name }}</span>
            <span
              class="flexrow-item pointer"
              role="button"
              tabindex="0"
              @click="removeTaskFromSelection(task)"
              @keydown.enter.prevent="removeTaskFromSelection(task)"
              @keydown.space.prevent="removeTaskFromSelection(task)"
            >
              <x-icon :size="12" />
            </span>
          </div>
          <div class="mt2 selected-task-line" v-if="nbSelectedValidations > 0">
            <span v-if="nbSelectedTasks > 0">+</span>
            {{ nbSelectedValidations }}
            {{ $t('tasks.empty_cells_selected', nbSelectedValidations) }}
          </div>
        </div>
      </div>

      <div v-else-if="task">
        <div class="flexrow extra-buttons pa05 mr1">
          <div class="filler"></div>
          <combobox-actions
            class="flexrow-item export-combo"
            align-right
            thin
            :title="$t('main.export')"
            :actions="exportActions"
            v-if="inPlaylist && exportActions.length > 0"
          />
        </div>

        <div class="pa1 pb0 pt0">
          <div class="flexrow header-title" v-if="!isConceptTask">
            <task-type-name
              class="flexrow-item task-type mr1"
              :task-type="currentTaskType"
              :production-id="task.project_id"
              v-if="currentTaskType"
            />
            <div class="title flexrow-item filler">
              <router-link :to="taskEntityPath" v-if="!isCurrentUserClient">
                {{ title }}
              </router-link>
              <template v-else>
                {{ title }}
              </template>
            </div>
          </div>
        </div>

        <div class="flexrow" v-if="showAssignees && task.assignees.length > 0">
          <span class="flexrow-item ml1">
            {{ $t('tasks.fields.assignees') }}:
          </span>
          <people-avatar
            :key="`assignee-${assigneeId}`"
            class="flexrow-item"
            :font-size="14"
            :person="personMap.get(assigneeId)"
            :size="24"
            v-for="assigneeId in task.assignees"
          />
        </div>

        <div class="task-columns pa1 pt0">
          <div class="task-column preview-column" v-if="isPreview">
            <div class="preview-column-content">
              <div class="flexrow" v-if="!isConceptTask">
                <div
                  class="preview-list flexrow w100"
                  v-if="previewOptions.length > 0"
                >
                  <combobox-styled
                    class="preview-combo flexrow-item"
                    :options="previewOptions"
                    is-preview
                    thin
                    :model-value="previewOptions[currentPreviewIndex]?.value"
                    @update:model-value="onPreviewChanged"
                  />
                </div>
                <div class="filler"></div>
                <div>
                  <router-link
                    class="history-button flexrow-item"
                    :to="taskPath"
                  >
                    <corner-right-up-icon :size="12" />
                  </router-link>
                </div>
              </div>

              <div class="preview">
                <template v-if="taskPreviews && taskPreviews.length > 0">
                  <preview-player
                    :entity-preview-files="taskEntityPreviews"
                    :entity-type="entityType"
                    :extra-wide="isExtraWide"
                    :fps="currentFps"
                    :is-assigned="isAssigned"
                    :last-preview-files="taskPreviews"
                    :light="!isWide"
                    :link="currentPreviewComment?.links?.[0]"
                    :previews="currentPreview ? currentPreview.previews : []"
                    :read-only="isPreviewPlayerReadOnly"
                    :task="task"
                    :task-type-map="taskTypeMap"
                    @annotation-changed="onAnnotationChanged"
                    @change-current-preview="changeCurrentPreview"
                    @add-extra-preview="onAddExtraPreview"
                    @remove-extra-preview="onRemoveExtraPreview"
                    @previews-order-change="onPreviewsOrderChange"
                    @comment-added="onCommentAdded"
                    @frame-updated="onFrameUpdated"
                    ref="preview-player"
                  />
                </template>

                <div
                  class="no-preview"
                  v-if="!taskPreviews || taskPreviews.length === 0"
                >
                  <em>{{ $t('tasks.no_preview') }}</em>
                </div>
              </div>
            </div>
          </div>

          <div class="task-column comments-column mt1">
            <div>
              <div>
                <add-comment
                  ref="add-comment"
                  :team="currentTeam"
                  :task-types="currentTaskTypes"
                  :task="task"
                  :task-status="taskStatuses"
                  :is-loading="loading.addComment"
                  :preview-forms="previewForms"
                  :is-error="errors.addComment"
                  :is-max-retakes-error="errors.addCommentMaxRetakes"
                  :fps="currentFps"
                  :frame="displayedFrame"
                  :revision="currentRevision"
                  :is-movie="isMoviePreview"
                  :is-picture="isPicturePreview"
                  @add-comment="postComment"
                  @add-preview="onAddPreviewClicked"
                  @file-drop="selectFile"
                  @clear-files="clearPreviewFiles"
                  @remove-preview="onPreviewFormRemoved"
                  @annotation-snapshots-requested="extractAnnotationSnapshots"
                  @annotation-snapshots-with-label-requested="
                    () => extractAnnotationSnapshots(true)
                  "
                  v-if="isCommentingAllowed"
                />

                <div
                  class="comments"
                  v-if="
                    taskComments && taskComments.length > 0 && !loading.task
                  "
                >
                  <XyzTransitionGroup
                    appear
                    v-xyz="{ fade: animOn, up: animOn, 'flip-up': animOn }"
                  >
                    <comment
                      :key="`comment-${comment.id}`"
                      :comment="comment"
                      :fps="currentFps"
                      :frame="displayedFrame"
                      :is-change="isStatusChange(index)"
                      :is-checkable="
                        (user && user.id === comment.person?.id) ||
                        (isCurrentUserArtist && isAssigned) ||
                        isDepartmentSupervisor ||
                        isCurrentUserManager
                      "
                      :is-editable="
                        (user && user.id === comment.person?.id) ||
                        isCurrentUserManager
                      "
                      :is-pinnable="
                        isDepartmentSupervisor || isCurrentUserManager
                      "
                      :is-replyable="
                        (user && user.id === comment.person?.id) ||
                        isAssigned ||
                        isDepartmentSupervisor ||
                        isCurrentUserManager ||
                        isClientFromSameStudio(comment.person)
                      "
                      :can-move="isCurrentUserManager"
                      :revision="currentRevision"
                      :task="task"
                      :team="currentTeam"
                      :task-types="currentTaskTypes"
                      @ack-comment="onAckComment"
                      @duplicate-comment="onDuplicateComment"
                      @pin-comment="onPinComment"
                      @edit-comment="onEditComment"
                      @delete-comment="onDeleteComment"
                      @move-comment="onMoveComment"
                      @toggle-for-client="onToggleForClient"
                      @checklist-updated="saveComment"
                      @time-code-clicked="timeCodeClicked"
                      v-for="(comment, index) in taskComments"
                    />
                  </XyzTransitionGroup>
                </div>
                <div class="no-comment" v-else-if="!loading.task">
                  <em>
                    {{ $t('tasks.no_comment') }}
                  </em>
                </div>
              </div>
            </div>

            <div class="has-text-centered" v-if="loading.task">
              <spinner />
            </div>
          </div>
        </div>

        <add-preview-modal
          ref="add-preview-modal"
          :active="modals.addPreview"
          :is-loading="loading.addPreview"
          :is-error="errors.addPreview"
          :expected-frames="entityFrames"
          :fps="currentFps"
          @cancel="closeAddPreviewModal"
          @confirm="confirmAddPreviewModal"
        />

        <add-preview-modal
          ref="add-extra-preview-modal"
          :active="modals.addExtraPreview"
          :is-loading="loading.addExtraPreview"
          :is-error="errors.addExtraPreview"
          :form-data="addExtraPreviewFormData"
          message=""
          @cancel="onCloseExtraPreview"
          @confirm="createExtraPreview"
        />

        <edit-comment-modal
          :active="modals.editComment"
          :comment-to-edit="commentToEdit"
          :fps="currentFps"
          :frame="displayedFrame"
          :is-loading="loading.editComment"
          :is-error="errors.editComment"
          :revision="currentRevision"
          :team="currentTeam"
          :task-types="currentTaskTypes"
          @confirm="confirmEditTaskComment"
          @cancel="onCancelEditComment"
        />

        <delete-modal
          :active="modals.deleteComment"
          :is-loading="loading.deleteComment"
          :is-error="errors.deleteComment"
          :text="$t('tasks.delete_comment')"
          :error-text="$t('tasks.delete_comment_error')"
          @confirm="confirmDeleteTaskComment"
          @cancel="onCancelDeleteComment"
        />

        <move-comment-modal
          :active="modals.moveComment"
          :comment="commentToMove"
          :source-task="task"
          :is-loading="loading.moveComment"
          :is-error="errors.moveComment"
          @cancel="onCancelMoveComment"
          @confirm="confirmMoveComment"
        />

        <delete-modal
          :active="modals.deleteExtraPreview"
          :is-loading="loading.deleteExtraPreview"
          :is-error="errors.deleteExtraPreview"
          :text="$t('tasks.delete_preview')"
          :error-text="$t('tasks.delete_preview_error')"
          @cancel="onCancelRemoveExtraPreview"
          @confirm="confirmDeleteTaskPreview"
        />
      </div>
      <div class="side task-info pa1" v-else-if="nbSelectedEntities > 0">
        <h2 class="title mt2">{{ $t('tasks.selected_entities') }}</h2>
        <div class="pa2 mt1">
          <div
            class="entity-line"
            :key="entity.id"
            v-for="entity in Array.from(selectedEntities.values())"
          >
            <span :class="{ canceled: entity.canceled }">{{
              entity.full_name
            }}</span>
          </div>
        </div>
      </div>

      <div class="side task-info empty" v-else>
        <div class="has-text-centered mb0">
          <template v-if="entityType === 'Concept'">
            {{ $t('concepts.no_concept_selected') }}
          </template>
          <template v-else>
            {{ $t('tasks.no_task_selected') }}
          </template>
        </div>
        <hr class="no-selection-separator" />
        <div class="empty-section">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Imports
import { CornerRightUpIcon, XIcon } from 'lucide-vue-next'
import moment from 'moment'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { addEvents, getClientX, removeEvents } from '@/composables/dom'
import { getEntityMap } from '@/composables/entity'
import { useTime } from '@/composables/time'
import csv from '@/lib/csv'
import { isSupervisorInDepartments } from '@/lib/descriptors'
import drafts from '@/lib/drafts'
import func from '@/lib/func'
import {
  getDownloadAttachmentPath,
  getTaskEntityPath,
  getTaskPath
} from '@/lib/path'
import preferences from '@/lib/preferences'
import { formatRevision } from '@/lib/preview'
import { getTaskTypeWithUrl } from '@/lib/productions'
import { sortPeople, sortTaskNames } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import { formatSimpleDate } from '@/lib/time'
import { DEFAULT_FPS, formatFrame } from '@/lib/video'

import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditCommentModal from '@/components/modals/EditCommentModal.vue'
import MoveCommentModal from '@/components/modals/MoveCommentModal.vue'
import PreviewPlayer from '@/components/players/players/PreviewPlayer.vue'
import ActionPanel from '@/components/tops/ActionPanel.vue'
// eslint-disable-next-line no-unused-vars
import AddComment from '@/components/widgets/AddComment.vue'
import ComboboxActions from '@/components/widgets/ComboboxActions.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import Comment from '@/components/widgets/Comment.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const DEFAULT_PANEL_WIDTH = 400

// Composables
const { t } = useI18n()
const route = useRoute()
const store = useStore()
const { formatDate } = useTime()

const instance = getCurrentInstance()
const socket = instance.appContext.config.globalProperties.$socket

// Props / Emits
const props = defineProps({
  currentFrame: {
    type: Number,
    default: 0
  },
  currentParentPreview: {
    type: Object,
    default: null
  },
  entityType: {
    type: String,
    default: 'Asset'
  },
  extendable: {
    type: Boolean,
    default: true
  },
  inPlaylist: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: true
  },
  isPreview: {
    type: Boolean,
    default: true
  },
  silent: {
    type: Boolean,
    default: false
  },
  showAssignees: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    default: () => {}
  },
  withActions: {
    type: Boolean,
    default: false
  },
  player: {
    type: Object,
    default: null
  },
  root: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['comment-added', 'task-removed', 'time-code-clicked'])

// State
const draftComment = reactive({})
// Only the root panel provides the draft: nested TaskInfo instances inject
// it so the comment draft survives switching between panels.
if (props.root) {
  provide('draftComment', draftComment)
}

const addExtraPreviewFormData = ref(null)
const animOn = ref(false)
const previewForms = ref([])
const currentFrameRaw = ref(0)
const currentPreviewIndex = ref(0)
const commentToEdit = ref(null)
const commentToMove = ref(null)
const isWide = ref(false)
const isExtraWide = ref(false)
const taskComments = ref([])
const taskPreviews = ref([])

// Extend-drag bookkeeping, read only inside event handlers
let currentExtraPreviewId = null
let lastWidth = 0
let lastWidthX = 0

const errors = reactive({
  addComment: false,
  addCommentMaxRetakes: false,
  addPreview: false,
  addExtraPreview: false,
  editComment: false,
  deleteComment: false,
  moveComment: false,
  deleteExtraPreview: false,
  task: false
})

const loading = reactive({
  addComment: false,
  addPreview: false,
  addExtraPreview: false,
  editComment: false,
  deleteComment: false,
  moveComment: false,
  deleteExtraPreview: false,
  task: false,
  setFrameThumbnail: false
})

const modals = reactive({
  addPreview: false,
  addExtraPreview: false,
  editComment: false,
  deleteComment: false,
  moveComment: false,
  deleteExtraPreview: false
})

const addCommentRef = useTemplateRef('add-comment')
const addExtraPreviewModalRef = useTemplateRef('add-extra-preview-modal')
const addPreviewModalRef = useTemplateRef('add-preview-modal')
const previewPlayerRef = useTemplateRef('preview-player')
const sideWrapperRef = useTemplateRef('side-wrapper')

// Computed
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const isTVShow = computed(() => store.getters.isTVShow)
const nbSelectedTasks = computed(() => store.getters.nbSelectedTasks)
const nbSelectedValidations = computed(
  () => store.getters.nbSelectedValidations
)
const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)
const selectedConcepts = computed(() => store.getters.selectedConcepts)
const selectedTasks = computed(() => store.getters.selectedTasks)
const shotMap = computed(() => store.getters.shotMap)
const taskEntityPreviews = computed(() => store.getters.taskEntityPreviews)
const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const user = computed(() => store.getters.user)

const sideColumnParent = computed(() => {
  const parent = sideWrapperRef.value?.parentElement
  return parent?.classList.contains('side-column') ? parent : undefined
})

const selectedEntities = computed(() => {
  const byType = {
    Asset: store.getters.selectedAssets,
    Concept: store.getters.selectedConcepts,
    Edit: store.getters.selectedEdits,
    Shot: store.getters.selectedShots
  }
  return byType[props.entityType]
})

const nbSelectedEntities = computed(() => selectedEntities.value?.size || 0)

const currentProductionId = computed(
  () => props.task?.project_id || currentProduction.value?.id
)

const currentTeam = computed(() => {
  if (!props.task) return []
  const production = productionMap.value.get(props.task.project_id)
  if (!production?.team) return []
  return sortPeople(
    production.team
      .map(personId => personMap.value.get(personId))
      .filter(Boolean)
  )
})

// Task types of the same project, filtered by the current task entity type
// (Shot or Asset), each with a url pointing to the matching task.
const currentTaskTypes = computed(() => {
  if (!props.task || !currentProduction.value) return []

  const taskType = taskTypeMap.value.get(props.task.task_type_id)
  if (!taskType) return []
  const taskTypeEntity = taskType.for_entity
  const taskTypeEntitySlug = taskTypeEntity.toLowerCase() + 's'

  const entityTasks = {}
  taskMap.value.forEach(task => {
    if (task.entity_id === props.task.entity_id) {
      entityTasks[task.task_type_id] = task
    }
  })

  return currentProduction.value.task_types
    .map(taskTypeId => taskTypeMap.value.get(taskTypeId))
    .filter(taskType => taskType?.for_entity === taskTypeEntity)
    .filter(taskType => entityTasks[taskType.id])
    .map(taskType =>
      getTaskTypeWithUrl(taskType, entityTasks[taskType.id], taskTypeEntitySlug)
    )
})

const title = computed(() => {
  if (props.task) {
    return props.task.full_entity_name || props.task.entity_name
  }
  return t('main.loading')
})

const isAssigned = computed(
  () => props.task?.assignees?.includes(user.value?.id) ?? false
)

const isCommentingAllowed = computed(
  () =>
    props.task &&
    (isAssigned.value ||
      isCurrentUserClient.value ||
      isDepartmentSupervisor.value ||
      isCurrentUserManager.value)
)

const isConceptTask = computed(() => props.entityType === 'Concept')

const isDepartmentSupervisor = computed(() =>
  isSupervisorInDepartments(
    user.value,
    isCurrentUserSupervisor.value,
    currentTaskType.value?.department_id
  )
)

const isPreviewPlayerReadOnly = computed(
  () =>
    !props.task ||
    !(
      isCurrentUserManager.value ||
      isCurrentUserClient.value ||
      isDepartmentSupervisor.value
    )
)

const currentTaskType = computed(() =>
  taskTypeMap.value.get(props.task?.task_type_id)
)

const currentFps = computed(() => {
  if (!props.task) return 25
  // An entity can override the production fps via data.fps; use it so
  // the player builds its frame model on the rate the video was
  // actually rendered at (otherwise frames get duplicated/dropped).
  // The entity may be a Shot, Edit, Sequence, Episode or Asset, each
  // in its own store map — task.entity is only { id } here.
  const entityFps = parseFloat(getTaskEntity(props.task)?.data?.fps)
  if (entityFps) return entityFps
  return (
    parseInt(productionMap.value.get(props.task.project_id)?.fps) || DEFAULT_FPS
  )
})

const entityFrames = computed(() => {
  if (!props.task?.entity) return 0
  return shotMap.value.get(props.task.entity.id)?.nb_frames || 0
})

const currentPreview = computed(
  () => taskPreviews.value[currentPreviewIndex.value] ?? null
)

const currentPreviewComment = computed(() =>
  taskComments.value.find(comment =>
    comment.previews?.some(
      preview => preview.revision === currentRevision.value
    )
  )
)

const currentPreviewId = computed(() => currentPreview.value?.id ?? null)

const canDownloadAnnotations = computed(
  () =>
    isCurrentUserManager.value &&
    currentPreviewId.value &&
    (currentPreview.value?.annotations?.length || 0) > 0
)

const annotationsPath = suffix =>
  currentPreviewId.value
    ? `/api/actions/preview-files/${currentPreviewId.value}/extract-annotated-frames${suffix}`
    : null

const exportActions = computed(() =>
  [
    {
      label: 'annotations.zip',
      href: annotationsPath(''),
      visible: canDownloadAnnotations.value
    },
    {
      label: 'annotations.pdf',
      href: annotationsPath('-pdf'),
      visible: canDownloadAnnotations.value
    },
    {
      label: 'comments.csv',
      handler: () => onExportClick(),
      visible: !props.withActions && !isCurrentUserClient.value
    }
  ].filter(action => action.visible !== false)
)

const currentRevision = computed(
  () =>
    props.currentParentPreview?.revision || currentPreview.value?.revision || 0
)

const displayedFrame = computed(
  () => props.currentFrame || currentFrameRaw.value
)

const extension = computed(() => currentPreview.value?.extension ?? '')

const isMoviePreview = computed(() => extension.value === 'mp4')

const isPicturePreview = computed(() =>
  ['png', 'gif'].includes(extension.value)
)

const taskStatuses = computed(() =>
  store.getters.getTaskStatusForCurrentUser(
    props.task.project_id,
    isConceptTask.value
  )
)

const taskPath = computed(() =>
  getTaskPath(
    props.task,
    null,
    isTVShow.value,
    currentEpisode.value,
    taskTypeMap.value
  )
)

const taskEntityPath = computed(() =>
  getTaskEntityPath(props.task, route.params.episode_id)
)

const previewOptions = computed(() => {
  if (!taskPreviews.value) return []
  return [...taskPreviews.value]
    .sort((a, b) => b.revision - a.revision)
    .map(preview => ({
      value: preview.id,
      label: formatRevision(preview.revision, currentProduction.value),
      validation_status: preview.validation_status
    }))
})

const selectedTasksToDisplay = computed(() =>
  sortTaskNames(Array.from(selectedTasks.value.values()), taskTypeMap.value)
)

// Functions
const getTaskEntity = task => {
  if (!task?.entity_type_name || !task?.entity?.id) return null
  return getEntityMap(task.entity_type_name)?.get(task.entity.id) || null
}

const getCurrentTaskComments = () =>
  store.getters.getTaskComments(props.task.id)

const loadTaskData = () => {
  if (props.task) {
    loading.task = true
    errors.task = false
    store
      .dispatch('loadTaskComments', {
        taskId: props.task.id,
        entityId: props.task.entity_id
      })
      .then(() => {
        loading.task = false
        reset()
      })
      .catch(err => {
        console.error(err)
        errors.task = true
      })
  }
}

// Named postComment, not addComment: in script setup a binding whose
// camelCase matches a component tag shadows the component (camelize
// wins over capitalize during template resolution), so an addComment
// function would replace the <add-comment> widget itself.
const postComment = (
  comment,
  attachment,
  checklist,
  taskStatusId,
  revision = undefined,
  link = undefined,
  forClient = false
) => {
  animOn.value = true
  nextTick(() => {
    const params = {
      taskId: props.task.id,
      taskStatusId,
      attachment,
      checklist,
      comment,
      links: link ? [link] : null,
      revision,
      forClient
    }
    const action =
      previewForms.value.length > 0 ? 'commentTaskWithPreview' : 'commentTask'
    loading.addComment = true
    errors.addComment = false
    errors.addCommentMaxRetakes = false
    store
      .dispatch(action, params)
      .then(() => {
        drafts.clearTaskDraft(props.task.id)
        addCommentRef.value?.reset()
        reset()
        loading.addComment = false
        emit('comment-added')
      })
      .catch(err => {
        console.error(err)
        const isRetakeError = err.body?.message?.includes('retake') ?? false
        errors.addComment = !isRetakeError
        errors.addCommentMaxRetakes = isRetakeError
        loading.addComment = false
      })
  })
}

const resetModals = () => {
  addPreviewModalRef.value?.reset()
}

const resetComments = () => {
  taskComments.value = getCurrentTaskComments()
}

const reset = ({ keepPreviewFiles = false } = {}) => {
  resetModals()
  if (!keepPreviewFiles) {
    clearPreviewFiles()
  }
  if (props.task) {
    resetComments()
    taskPreviews.value = store.getters.getTaskPreviews(props.task.id)
    nextTick(() => {
      previewPlayerRef.value?.focus()
    })
  }
}

const focusCommentTextarea = () => {
  addCommentRef.value?.focus()
}

const selectFile = forms => {
  previewForms.value = previewForms.value.concat(forms)
  store.dispatch('loadPreviewFileFormData', previewForms.value)
}

const onPreviewFormRemoved = previewForm => {
  previewForms.value = previewForms.value.filter(f => f !== previewForm)
  store.dispatch('loadPreviewFileFormData', previewForms.value)
}

const clearPreviewFiles = () => {
  previewForms.value = []
  store.dispatch('loadPreviewFileFormData', previewForms.value)
  store.commit('CLEAR_UPLOAD_PROGRESS')
}

const createExtraPreview = forms => {
  selectFile(forms)
  errors.addExtraPreview = false
  loading.addExtraPreview = true
  const comment = taskComments.value.find(comment =>
    comment.previews.find(preview => preview.id === currentPreviewId.value)
  )
  store
    .dispatch('addCommentExtraPreview', {
      taskId: props.task.id,
      commentId: comment?.id,
      previewId: currentPreviewId.value
    })
    .then(() => {
      loading.addExtraPreview = false
      addExtraPreviewModalRef.value.reset()
      reset()
      setTimeout(() => {
        previewPlayerRef.value?.displayLast()
      }, 0)
      modals.addExtraPreview = false
    })
    .catch(err => {
      console.error(err)
      loading.addExtraPreview = false
      errors.addExtraPreview = true
    })
}

const onPreviewAdded = eventData => {
  const taskId = eventData.task_id
  const commentId = eventData.comment_id
  const previewId = eventData.preview_file_id
  const revision = eventData.revision
  const extension = eventData.extension
  const comment = store.getters.getTaskComment(taskId, commentId)

  if (props.task) {
    if (
      taskId === props.task.id &&
      comment &&
      (comment.previews.length === 0 || comment.previews[0].id !== previewId)
    ) {
      store.commit('ADD_PREVIEW_END', {
        preview: {
          id: previewId,
          revision,
          extension
        },
        taskId,
        commentId,
        comment
      })
      reset({ keepPreviewFiles: true })
    }
  }
}

const onPreviewsOrderChange = () => {
  taskPreviews.value = store.getters.getTaskPreviews(props.task.id)
}

const onAnnotationChanged = async ({
  preview,
  additions,
  deletions,
  updates
}) => {
  const taskId = props.task?.id || preview.task_id
  if (!taskId) return
  try {
    await store.dispatch('updatePreviewAnnotation', {
      taskId,
      preview,
      additions,
      deletions,
      updates
    })
    previewPlayerRef.value?.confirmAnnotationsSaved()
  } catch {
    previewPlayerRef.value?.restoreFailedAnnotations()
  }
}

const onAddPreviewClicked = () => {
  modals.addPreview = true
}

const onAddExtraPreview = () => {
  clearPreviewFiles()
  modals.addExtraPreview = true
}

const onRemoveExtraPreview = preview => {
  currentExtraPreviewId = preview.id
  modals.deleteExtraPreview = true
}

const onCommentAdded = () => {
  resetComments()
}

const onCancelRemoveExtraPreview = () => {
  modals.deleteExtraPreview = false
}

const closeAddPreviewModal = () => {
  modals.addPreview = false
}

const confirmAddPreviewModal = forms => {
  selectFile(forms)
  closeAddPreviewModal()
}

const onCloseExtraPreview = () => {
  modals.addExtraPreview = false
}

const onPreviewChanged = previewId => {
  currentPreviewIndex.value = taskPreviews.value.findIndex(
    p => p.id === previewId
  )
}

const changeCurrentPreview = previewFile => {
  currentPreviewIndex.value = taskPreviews.value.findIndex(
    p => p.id === previewFile.id
  )
}

const setCurrentPreviewAsEntityThumbnail = frame => {
  const previewId = previewPlayerRef.value.currentPreview.id
  store
    .dispatch('setPreview', {
      taskId: props.task.id,
      entityId: props.task.entity_id,
      previewId,
      frame
    })
    .finally(() => {
      loading.setFrameThumbnail = false
    })
}

const onAckComment = comment => {
  store.dispatch('ackComment', comment)
}

const onDuplicateComment = comment => {
  addCommentRef.value.setValue(comment)
}

const onPinComment = comment => {
  store.dispatch('pinComment', comment)
}

const onToggleForClient = comment => {
  store.dispatch('toggleCommentForClient', comment)
}

const onEditComment = comment => {
  commentToEdit.value = comment
  modals.editComment = true
}

const onDeleteComment = comment => {
  commentToEdit.value = comment
  modals.deleteComment = true
}

const onMoveComment = comment => {
  commentToMove.value = comment
  errors.moveComment = false
  modals.moveComment = true
}

const onCancelEditComment = () => {
  modals.editComment = false
}

const onCancelDeleteComment = () => {
  modals.deleteComment = false
}

const onCancelMoveComment = () => {
  modals.moveComment = false
}

const confirmEditTaskComment = comment => {
  loading.editComment = true
  errors.editComment = false
  const attachmentFilesToDelete = comment.attachmentFilesToDelete || []
  const newAttachmentFiles = comment.newAttachmentFiles || []
  delete comment.attachmentFilesToDelete
  delete comment.newAttachmentFiles
  func
    .runPromiseMapAsSeries(attachmentFilesToDelete, attachment =>
      store.dispatch('deleteAttachment', {
        attachment,
        comment: commentToEdit.value
      })
    )
    .then(() =>
      store.dispatch('addAttachmentToComment', {
        comment: commentToEdit.value,
        files: newAttachmentFiles
      })
    )
    .then(() =>
      store.dispatch('editTaskComment', {
        taskId: props.task.id,
        comment
      })
    )
    .then(() => {
      nextTick(() => {
        resetComments()
      })
      loading.editComment = false
      modals.editComment = false
    })
    .catch(err => {
      console.error(err)
      loading.editComment = false
      errors.editComment = true
    })
}

const confirmMoveComment = async targetTaskId => {
  animOn.value = true
  loading.moveComment = true
  errors.moveComment = false
  try {
    await store.dispatch('moveCommentToTask', {
      taskId: props.task.id,
      commentId: commentToMove.value.id,
      targetTaskId
    })
    resetComments()
    modals.moveComment = false
    commentToMove.value = null
  } catch (err) {
    console.error(err)
    errors.moveComment = true
  } finally {
    loading.moveComment = false
  }
}

const isClientFromSameStudio = person =>
  isCurrentUserClient.value &&
  user.value.studio_id === person.studio_id &&
  person.role === 'client'

const saveComment = async comment => {
  try {
    await store.dispatch('editTaskComment', {
      taskId: props.task.id,
      comment
    })
  } catch (err) {
    console.error(err)
    await loadTaskData()
  }
}

const confirmDeleteTaskComment = () => {
  animOn.value = true
  loading.deleteComment = true
  errors.deleteComment = false
  const commentId = commentToEdit.value.id

  store
    .dispatch('deleteTaskComment', {
      taskId: props.task.id,
      commentId
    })
    .then(() => {
      reset()
      loading.deleteComment = false
      modals.deleteComment = false
    })
    .catch(err => {
      console.error(err)
      loading.deleteComment = false
      errors.deleteComment = true
    })
    .finally(() => {
      animOn.value = false
    })
}

const confirmDeleteTaskPreview = () => {
  loading.deleteExtraPreview = true
  errors.deleteExtraPreview = false
  const previewId = currentExtraPreviewId
  const comment = getCurrentTaskComments().find(comment => {
    return comment.previews.findIndex(p => p.id === previewId) >= 0
  })

  previewPlayerRef.value.displayFirst()
  store
    .dispatch('deleteTaskPreview', {
      taskId: props.task.id,
      commentId: comment?.id,
      previewId
    })
    .then(() => {
      loading.deleteExtraPreview = false
      modals.deleteExtraPreview = false
    })
    .catch(err => {
      console.error(err)
      loading.deleteExtraPreview = false
      errors.deleteExtraPreview = true
    })
}

const onRemoteAcknowledge = (eventData, type) => {
  if (!props.task) return
  const comment = store.getters.getTaskComment(
    props.task.id,
    eventData.comment_id
  )
  const person = personMap.value.get(eventData.person_id)
  if (!comment || !person) return
  const hasAck = comment.acknowledgements.includes(person.id)
  // For the current user's own events, skip commits that would double
  // apply an acknowledgement already reflected locally.
  if (user.value.id !== person.id || (type === 'ack') !== hasAck) {
    store.commit('ACK_COMMENT', { comment, user: person })
  }
}

const isStatusChange = index => {
  const comment = taskComments.value[index]
  return (
    index === taskComments.value.length - 1 ||
    comment.task_status_id !== taskComments.value[index + 1].task_status_id
  )
}

const timeCodeClicked = payload => {
  if (!props.isPreview) {
    emit('time-code-clicked', payload)
    return
  }
  const { versionRevision, frame } = payload
  changeCurrentPreview(
    taskPreviews.value.find(p => p.revision === parseInt(versionRevision))
  )
  setTimeout(() => {
    previewPlayerRef.value?.setCurrentFrame(frame)
    previewPlayerRef.value?.focus()
  }, 20)
}

const onFrameUpdated = frame => {
  currentFrameRaw.value = frame
}

const extractAnnotationSnapshots = async (withLabel = false) => {
  const previewPlayer = previewPlayerRef.value || props.player
  addCommentRef.value.showAnnotationLoading(withLabel ? 'label' : 'standard')
  const files = await previewPlayer.extractAnnotationSnapshots({
    withLabel
  })
  addCommentRef.value.hideAnnotationLoading()
  addCommentRef.value.setAnnotationSnapshots(files)
  return files
}

const onExportClick = () => {
  const nameData = [
    formatSimpleDate(moment()),
    'kitsu',
    productionMap.value.get(props.task.project_id)?.name,
    props.task.entity_name.replaceAll(' / ', '_'),
    taskTypeMap.value.get(props.task.task_type_id)?.name,
    'comments'
  ]
  const name = stringHelpers.slugify(nameData.join('_'))
  const headers = [
    t('comments.fields.created_at'),
    t('comments.fields.task_status'),
    t('comments.fields.person'),
    t('comments.fields.text'),
    t('comments.fields.checklist'),
    t('comments.fields.acknowledgements'),
    t('comments.fields.revision'),
    t('comments.fields.attachments')
  ]
  const commentLines = []
  getCurrentTaskComments().forEach(comment => {
    commentLines.push([
      formatDate(comment.created_at),
      comment.task_status?.name || '',
      comment.person?.name || '',
      comment.text,
      comment.checklist
        ? comment.checklist
            .map(item => {
              const checked = item.checked ? 'x' : ' '
              const revision =
                item.revision > -1
                  ? `(${formatRevision(item.revision, currentProduction.value)} - ${formatFrame(item.frame)}) `
                  : ''
              return `[${checked}] ${revision}${item.text}`
            })
            .join('\n')
        : '',
      comment.acknowledgements
        ? comment.acknowledgements
            .map(personId => personMap.value.get(personId)?.name)
            .filter(Boolean)
            .join(',')
        : '',
      comment.previews[0]?.revision,
      comment.attachment_files
        ? comment.attachment_files
            .filter(attachment => !attachment.reply_id)
            .map(attachment => getDownloadAttachmentPath(attachment, true))
            .join('\n')
        : ''
    ])
    if (comment.replies) {
      comment.replies.forEach(reply =>
        commentLines.push([
          formatDate(reply.date),
          t('main.reply'),
          reply.person?.name || '',
          reply.text,
          null,
          null,
          null,
          comment.attachment_files
            ? comment.attachment_files
                .filter(attachment => attachment.reply_id === reply.id)
                .map(attachment => getDownloadAttachmentPath(attachment, true))
                .join('\n')
            : ''
        ])
      )
    }
  })
  csv.buildCsvFile(name, [headers, ...commentLines])
}

const onExtendDown = event => {
  if (!sideColumnParent.value) {
    return
  }
  lastWidthX = getClientX(event)
  lastWidth = sideColumnParent.value.offsetWidth
  addEvents(domEvents)
}

const onExtendMove = event => {
  const diff = lastWidthX - getClientX(event)
  let panelWidth = Math.max(lastWidth + diff, DEFAULT_PANEL_WIDTH)
  if (panelWidth > 900) panelWidth = 900
  setWidth(panelWidth)
  refreshPreviewPlay()
}

const onExtendUp = () => {
  removeEvents(domEvents)
  refreshPreviewPlay()
  if (sideColumnParent.value) {
    preferences.setPreference(
      'task:panel-width',
      sideColumnParent.value.offsetWidth
    )
  }
}

const domEvents = [
  ['mousemove', onExtendMove],
  ['touchmove', onExtendMove],
  ['mouseup', onExtendUp],
  ['mouseleave', onExtendUp],
  ['touchend', onExtendUp],
  ['touchcancel', onExtendUp]
]

const setWidth = width => {
  if (!sideColumnParent.value) {
    return
  }
  sideColumnParent.value.style['min-width'] = `${width}px`
  isWide.value = width > 699
  isExtraWide.value = width >= 900
}

const onSetCurrentFrameAsThumbnail = isUseCurrentFrame => {
  if (previewPlayerRef.value) {
    loading.setFrameThumbnail = true
    const frame = isUseCurrentFrame ? currentFrameRaw.value + 1 : null
    return setCurrentPreviewAsEntityThumbnail(frame)
  }
}

const refreshPreviewPlay = () => {
  previewPlayerRef.value?.resize()
}

const removeTaskFromSelection = task => {
  const data = {
    column: { id: task.task_type_id },
    entity: { id: task.entity_id },
    task
  }
  store.dispatch('removeSelectedTask', { task: data }) // remove list selection
  store.dispatch('removeSelectedTask', { task }) // remove
  emit('task-removed', task)
}

const onRemotePreviewUpdate = eventData => {
  const comment = taskComments.value.find(
    c =>
      c.previews &&
      c.previews.length > 0 &&
      c.previews[0].id === eventData.preview_file_id
  )
  if (comment && props.task) {
    store
      .dispatch('refreshPreview', {
        taskId: props.task.id,
        previewId: eventData.preview_file_id
      })
      .then(preview => {
        comment.previews[0].validation_status = preview.validation_status
      })
  }
}

const onRemoteTaskUpdate = eventData => {
  // Wait for data to be reinitialized by App.vue to update comments.
  if (props.task && eventData.task_id === props.task.id) {
    setTimeout(() => {
      // in case the task changed during the timeout
      if (props.task && eventData.task_id === props.task.id) {
        resetComments()
      }
    }, 1000)
  }
}

const onRemoteCommentNew = eventData => {
  setTimeout(() => {
    animOn.value = true
    const comments = props.task
      ? store.getters.getTaskComments(props.task.id)
      : null
    if (
      props.task &&
      comments &&
      comments.length !== taskComments.value.length &&
      eventData.task_id === props.task.id &&
      !loading.task
    ) {
      taskComments.value = comments
      taskPreviews.value = store.getters.getTaskPreviews(props.task.id)
    }
    animOn.value = false
  }, 1000)
}

const onRemoteCommentUpdate = eventData => {
  const commentId = eventData.comment_id
  if (
    store.getters.isSavingCommentPreview ||
    (!props.task && !taskComments.value.some(({ id }) => id === commentId))
  ) {
    return
  }
  store.dispatch('loadComment', { commentId }).catch(console.error)
}

const onRemoteCommentAck = eventData => onRemoteAcknowledge(eventData, 'ack')

const onRemoteCommentUnack = eventData =>
  onRemoteAcknowledge(eventData, 'unack')

const onRemoteCommentReply = eventData => {
  if (props.task) {
    const comment = taskComments.value.find(c => c.id === eventData.comment_id)
    if (comment) {
      if (!comment.replies) comment.replies = []
      const reply = comment.replies.find(r => r.id === eventData.reply_id)
      if (!reply) {
        store
          .dispatch('refreshComment', {
            commentId: eventData.comment_id
          })
          .then(remoteComment => {
            comment.replies = remoteComment.replies
          })
          .catch(console.error)
      }
    }
  }
}

const onRemoteCommentDelete = eventData => {
  animOn.value = true
  if (props.task) {
    const comment = taskComments.value.find(c => c.id === eventData.comment_id)
    if (comment) {
      store.commit('REMOVE_TASK_COMMENT', { task: props.task, comment })
      resetComments()
      taskPreviews.value = store.getters.getTaskPreviews(props.task.id)
    }
    animOn.value = false
  }
}

const onRemoteCommentDeleteReply = eventData => {
  if (props.task) {
    const comment = taskComments.value.find(c => c.id === eventData.comment_id)
    if (comment) {
      if (!comment.replies) comment.replies = []
      store.commit('REMOVE_REPLY_FROM_COMMENT', {
        comment,
        reply: { id: eventData.reply_id }
      })
    }
  }
}

const onRemoteAnnotationUpdate = eventData => {
  const previewPlayer = previewPlayerRef.value
  if (!previewPlayer) return
  const isValid = previewPlayer.isValidPreviewModification(
    eventData.preview_file_id,
    eventData.updated_at
  )
  if (isValid) {
    store
      .dispatch('refreshPreview', {
        previewId: previewPlayer.currentPreview.id,
        taskId: previewPlayer.currentPreview.task_id
      })
      .then(() => {
        if (!previewPlayer.notSaved) {
          taskPreviews.value = store.getters.getTaskPreviews(props.task.id)
          // Wait for the refreshed previews prop to propagate to the
          // player before reloading — otherwise reloadAnnotations
          // reads the stale currentPreview and the remote drawing
          // never shows up outside a review room.
          nextTick(() => {
            previewPlayer.reloadAnnotations()
            previewPlayer.loadAnnotation()
          })
        }
      })
  }
}

const socketEvents = [
  ['preview-file:add-file', onPreviewAdded],
  ['preview-file:update', onRemotePreviewUpdate],
  ['preview-file:annotation-update', onRemoteAnnotationUpdate],
  ['task:update', onRemoteTaskUpdate],
  ['comment:new', onRemoteCommentNew],
  ['comment:update', onRemoteCommentUpdate],
  ['comment:acknowledge', onRemoteCommentAck],
  ['comment:unacknowledge', onRemoteCommentUnack],
  ['comment:reply', onRemoteCommentReply],
  ['comment:delete', onRemoteCommentDelete],
  ['comment:delete-reply', onRemoteCommentDeleteReply]
]

// Watchers
watch(
  () => props.task,
  () => {
    clearPreviewFiles()
    currentPreviewIndex.value = 0
    if (!props.silent) {
      loadTaskData()
    }
  }
)

watch(
  () => props.silent,
  () => {
    if (!props.silent) {
      loadTaskData()
    }
  },
  { immediate: true }
)

watch(
  () => props.currentFrame,
  () => {
    currentFrameRaw.value = props.currentFrame
  }
)

// Lifecycle
onMounted(() => {
  if (sideColumnParent.value) {
    const panelWidth = preferences.getIntPreference(
      'task:panel-width',
      DEFAULT_PANEL_WIDTH
    )
    setWidth(panelWidth)
    refreshPreviewPlay()
  }
  socketEvents.forEach(([event, handler]) => socket.on(event, handler))
})

onBeforeUnmount(() => {
  removeEvents(domEvents)
  socketEvents.forEach(([event, handler]) => socket.off(event, handler))
})

defineExpose({
  focusCommentTextarea
})
</script>

<style lang="scss" scoped>
.dark {
  .add-comment,
  .comment,
  .no-comment {
    background: var(--background-alt);
    border-color: $dark-grey;
    box-shadow: 0 0 6px #333;
  }

  .extend-bar {
    background: var(--background-alt);
  }

  .no-preview {
    padding: 0.5em;
  }

  .side {
    background: var(--background);
  }

  .task-info {
    color: white;
  }
}

.side {
  background: #f8f8f8;
  flex: 1;
  min-height: 100%;
  overflow: auto;
}

.add-comment {
  padding: 0.5em;
  margin-bottom: 0.5em;
  box-shadow: 0 0 6px #e0e0e0;
}

.header-title .flexrow-item {
  margin-bottom: 0.5em;
}

.title {
  color: $grey;
  flex: 1;
  font-size: 1.3em;
  font-weight: 500;
  line-height: 1.5em;
  margin: 0;
  margin-top: 3px;
}

.title a {
  color: inherit;
  padding-top: 10px;
}

.history-button {
  flex: 1;
}

.no-comment {
  background: white;
  padding: 1em;
  border-radius: 5px;
  box-shadow: 0 0 6px #e0e0e0;
}

.task-columns {
  display: flex;
  flex-direction: column;
}

.comment {
  border-top: 1px solid $white-grey;
  border-bottom: 1px solid $white-grey;
  border-right: 1px solid $white-grey;
  margin-top: 0.1em;
  box-shadow: 0 0 6px #e0e0e0;
}

.comments {
  padding-bottom: 1em;
}

.preview {
  position: relative;
}

.preview-column-content {
  border-radius: 5px;
}

.selected-task-line {
  color: $grey;
  font-weight: bold;
  margin-bottom: 0.5em;
}

.entity-line {
  color: $grey;
  font-weight: bold;
  margin-bottom: 0.5em;
}

.side-wrapper {
  display: flex;
  align-items: stretch;
  min-height: 100%;
}

.extend-bar {
  width: 3px;
  margin-left: 3px;
  background: #ccc;
  cursor: ew-resize;
}

.empty {
  padding-top: 1em;
}

.empty-section {
  display: flex;
  flex-direction: column;
  padding: 0 1em 1em 1em;
  position: relative;
  bottom: 0;
  right: 0;
  left: 0;
}

.no-selection-separator {
  background-color: var(--border-alt);
  margin: 1em;
}

.task-type {
  margin-right: 1em;
}
</style>
