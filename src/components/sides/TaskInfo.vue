<template>
  <div class="side-wrapper">
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
        <h1 class="title">
          {{ $tc('tasks.selected_tasks') }}
          ({{ nbSelectedTasks }})
        </h1>
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
              @click="removeTaskFromSelection(task)"
            >
              <x-icon :size="12" />
            </span>
          </div>
          <div class="mt2 selected-task-line" v-if="nbSelectedValidations > 0">
            <span v-if="nbSelectedTasks > 0">+</span>
            {{ nbSelectedValidations }}
            {{ $tc('tasks.empty_cells_selected', nbSelectedValidations) }}
          </div>
        </div>
      </div>

      <div v-else-if="task">
        <div class="pa1 pb0">
          <div class="flexrow header-title" v-if="!isConceptTask">
            <task-type-name
              class="flexrow-item task-type"
              :task-type="currentTaskType"
              :production-id="task.project_id"
              v-if="currentTaskType"
            />
            <div class="title flexrow-item filler">
              <router-link :to="taskEntityPath">
                {{ task ? title : 'Loading...' }}
              </router-link>
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

        <div class="task-columns pa1 pt0" ref="task-columns">
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
                  :user="user"
                  :team="currentTeam"
                  :task="task"
                  :task-status="taskStatuses"
                  :is-loading="loading.addComment"
                  :preview-forms="previewForms"
                  :is-error="errors.addComment"
                  :is-max-retakes-error="errors.addCommentMaxRetakes"
                  :fps="currentFps"
                  :frame="currentFrame || currentFrameRaw"
                  :revision="currentRevision"
                  :is-movie="isMoviePreview"
                  @add-comment="addComment"
                  @add-preview="onAddPreviewClicked"
                  @file-drop="selectFile"
                  @clear-files="clearPreviewFiles"
                  @remove-preview="onPreviewFormRemoved"
                  @annotation-snapshots-requested="extractAnnotationSnapshots"
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
                      :frame="currentFrame || currentFrameRaw"
                      :is-change="isStatusChange(index)"
                      :is-checkable="
                        user.id === comment.person?.id ||
                        (isCurrentUserArtist && isAssigned) ||
                        isDepartmentSupervisor ||
                        isCurrentUserManager
                      "
                      :is-editable="
                        user.id === comment.person?.id || isCurrentUserManager
                      "
                      :is-pinnable="
                        isDepartmentSupervisor || isCurrentUserManager
                      "
                      :is-replyable="
                        user.id === comment.person?.id ||
                        isAssigned ||
                        isDepartmentSupervisor ||
                        isCurrentUserManager
                      "
                      :revision="currentRevision"
                      :task="task"
                      :team="currentTeam"
                      @ack-comment="onAckComment"
                      @duplicate-comment="onDuplicateComment"
                      @pin-comment="onPinComment"
                      @edit-comment="onEditComment"
                      @delete-comment="onDeleteComment"
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
          :frame="currentFrame || currentFrameRaw"
          :is-loading="loading.editComment"
          :is-error="errors.editComment"
          :revision="currentRevision"
          :team="currentTeam"
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
        <h1 class="title mt2">{{ $tc('tasks.selected_entities') }}</h1>
        <div class="pa2 mt1">
          <div
            class="entity-line"
            :key="entity.id"
            v-for="entity in Array.from(selectedEntities.values())"
          >
            {{ entity.full_name }}
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

<script>
import { CornerRightUpIcon, XIcon } from 'lucide-vue-next'
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import drafts from '@/lib/drafts'
import { getTaskEntityPath, getTaskPath } from '@/lib/path'
import preferences from '@/lib/preferences'
import { getTaskTypeStyle } from '@/lib/render'
import { sortPeople, sortTaskNames } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import { formatDate } from '@/lib/time'

import { taskMixin } from '@/components/mixins/task'
import { domMixin } from '@/components/mixins/dom'

import ActionPanel from '@/components/tops/ActionPanel.vue'
import AddComment from '@/components/widgets/AddComment.vue'
import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import Comment from '@/components/widgets/Comment.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditCommentModal from '@/components/modals/EditCommentModal.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PreviewPlayer from '@/components/previews/PreviewPlayer.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const DEFAULT_PANEL_WIDTH = 400

export default {
  name: 'task-info',

  mixins: [domMixin, taskMixin],

  components: {
    ActionPanel,
    AddComment,
    AddPreviewModal,
    ComboboxStyled,
    Comment,
    CornerRightUpIcon,
    DeleteModal,
    EditCommentModal,
    PeopleAvatar,
    PreviewPlayer,
    Spinner,
    TaskTypeName,
    XIcon
  },

  props: {
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
  },

  emits: ['comment-added', 'task-removed', 'time-code-clicked'],

  provide() {
    if (this.root) {
      return {
        draftComment: this.draftComment
      }
    }
    return {}
  },

  data() {
    return {
      draftComment: {},
      addExtraPreviewFormData: null,
      animOn: false,
      previewForms: [],
      currentFrameRaw: 0,
      currentPreviewIndex: 0,
      currentPreviewPath: '',
      currentPreviewDlPath: '',
      currentTask: null,
      commentToEdit: null,
      isWide: false,
      isExtraWide: false,
      otherPreviews: [],
      panelWidth: 800,
      selectedEpisodes: null,
      selectedSequences: null,
      taskComments: [],
      taskPreviews: [],
      domEvents: [
        ['mousemove', this.onExtendMove],
        ['touchmove', this.onExtendMove],
        ['mouseup', this.onExtendUp],
        ['mouseleave', this.onExtendUp],
        ['touchend', this.onExtendUp],
        ['touchcancel', this.onExtendUp]
      ],
      errors: {
        addComment: false,
        addCommentMaxRetakes: false,
        addPreview: false,
        addExtraPreview: false,
        editComment: false,
        deleteComment: false,
        confirmDeleteTaskPreview: false,
        task: false
      },
      loading: {
        addComment: false,
        addPreview: false,
        addExtraPreview: false,
        editComment: false,
        deleteComment: false,
        confirmDeleteTaskPreview: false,
        task: false,
        setFrameThumbnail: false
      },
      modals: {
        addPreview: false,
        addExtraPreview: false,
        editComment: false,
        deleteComment: false,
        deleteExtraPreview: false
      }
    }
  },

  mounted() {
    if (this.sideColumnParent) {
      const panelWidth =
        preferences.getIntPreference('task:panel-width') || DEFAULT_PANEL_WIDTH
      this.setWidth(panelWidth)
      this.refreshPreviewPlay()
    }
  },

  beforeUnmount() {
    this.removeEvents(this.domEvents)
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'getTaskComment',
      'getTaskComments',
      'getTaskPreviews',
      'getTaskStatusForCurrentUser',
      'isCurrentUserArtist',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isSavingCommentPreview',
      'isSingleEpisode',
      'isTVShow',
      'nbSelectedTasks',
      'personMap',
      'productionMap',
      'selectedAssets',
      'selectedConcepts',
      'selectedEdits',
      'selectedShots',
      'selectedTasks',
      'shotMap',
      'nbSelectedValidations',
      'taskEntityPreviews',
      'taskTypeMap',
      'user'
    ]),

    sideColumnParent() {
      if (this.$el.parentElement.classList.contains('side-column')) {
        return this.$el.parentElement
      }
      return undefined
    },

    nbSelectedEntities() {
      return this.selectedEntities?.size || 0
    },

    selectedEntities() {
      return this[`selected${this.entityType}s`]
    },

    currentProductionId() {
      return this.task?.project_id || this.currentProduction?.id
    },

    currentTeam() {
      if (!this.task) return []
      const production = this.productionMap.get(this.task.project_id)
      if (!production) return []
      return sortPeople(
        production.team.map(personId => this.personMap.get(personId))
      )
    },

    title() {
      if (this.task) {
        const entityName = this.task.full_entity_name || this.task.entity_name
        return `${entityName}`
      } else {
        return 'Loading...'
      }
    },

    isAssigned() {
      return (
        this.task?.assignees.some(personId => personId === this.user.id) ??
        false
      )
    },

    isCommentingAllowed() {
      return (
        this.task &&
        (this.isAssigned ||
          this.isCurrentUserClient ||
          this.isDepartmentSupervisor ||
          this.isCurrentUserManager)
      )
    },

    isConceptTask() {
      return this.entityType === 'Concept'
    },

    isDepartmentSupervisor() {
      if (!this.isCurrentUserSupervisor) {
        return false
      }
      if (this.user.departments.length === 0) {
        return true
      }
      return this.user.departments.includes(this.currentTaskType?.department_id)
    },

    isPreviewPlayerReadOnly() {
      if (this.task) {
        if (this.isCurrentUserManager || this.isCurrentUserClient) {
          return false
        } else if (this.isCurrentUserSupervisor) {
          if (this.user.departments.length === 0) {
            return false
          } else {
            return !this.user.departments.includes(
              this.currentTaskType?.department_id
            )
          }
        }
      }
      return true
    },

    isSetThumbnailAllowed() {
      return (
        this.currentPreviewId &&
        this.task &&
        this.task.entity &&
        this.currentPreviewId !== this.task.entity.preview_file_id &&
        this.extension !== 'gif'
      )
    },

    currentTaskType() {
      return this.taskTypeMap.get(this.task?.task_type_id)
    },

    currentPreview() {
      const index = this.currentPreviewIndex
      return this.taskPreviews && this.taskPreviews.length > 0
        ? this.taskPreviews[index]
        : null
    },

    currentPreviewComment() {
      return this.taskComments.find(comment =>
        comment.previews?.some(
          preview => preview.revision === this.currentRevision
        )
      )
    },

    currentPreviewId() {
      const index = this.currentPreviewIndex
      if (
        this.taskPreviews &&
        this.taskPreviews.length > 0 &&
        this.taskPreviews[index]
      ) {
        return this.taskPreviews[index].id
      } else {
        return null
      }
    },

    currentFps() {
      return parseInt(this.productionMap.get(this.task.project_id)?.fps) || 25
    },

    currentRevision() {
      return this.currentParentPreview && this.currentParentPreview.revision
        ? this.currentParentPreview.revision
        : this.currentPreview
          ? this.currentPreview.revision
          : 0
    },

    extension() {
      const index = this.currentPreviewIndex
      return this.taskPreviews && this.taskPreviews.length > 0
        ? this.taskPreviews[index].extension
        : ''
    },

    isStandardPreview() {
      return (
        this.taskPreviews &&
        this.taskPreviews.length > 0 &&
        [
          'ai',
          'blend',
          'ma',
          'mb',
          'pdf',
          'psd',
          'rar',
          'ae',
          'fla',
          'flv',
          'swf',
          'zip'
        ].includes(this.extension)
      )
    },

    isMoviePreview() {
      return (
        this.taskPreviews &&
        this.taskPreviews.length > 0 &&
        this.extension === 'mp4'
      )
    },

    isPicturePreview() {
      return (
        this.taskPreviews &&
        this.taskPreviews.length > 0 &&
        ['png', 'gif'].includes(this.extension)
      )
    },

    is3DModelPreview() {
      return (
        this.taskPreviews &&
        this.taskPreviews.length > 0 &&
        this.extension === 'obj'
      )
    },

    moviePath() {
      let previewId = null
      previewId = this.currentPreview.id
      return `/api/movies/originals/preview-files/${previewId}.mp4`
    },

    taskStatuses() {
      return this.getTaskStatusForCurrentUser(
        this.task.project_id,
        this.isConceptTask
      )
    },

    taskTypeStyle() {
      return getTaskTypeStyle(this.task)
    },

    taskPath() {
      return getTaskPath(
        this.task,
        null,
        this.isTVShow,
        this.currentEpisode,
        this.taskTypeMap
      )
    },

    taskEntityPath() {
      const episodeId = this.$route.params.episode_id
      return getTaskEntityPath(this.task, episodeId)
    },

    previewOptions() {
      if (!this.taskPreviews) return []
      return [...this.taskPreviews]
        .sort((a, b) => b.revision - a.revision)
        .map(preview => ({
          value: preview.id,
          label: `v${preview.revision}`
        }))
    },

    selectedTasksToDisplay() {
      return sortTaskNames(
        Array.from(this.selectedTasks.values()),
        this.taskTypeMap
      )
    }
  },

  methods: {
    ...mapActions([
      'addAttachmentToComment',
      'ackComment',
      'addCommentExtraPreview',
      'commentTask',
      'commentTaskWithPreview',
      'deleteAttachment',
      'deleteTaskComment',
      'deleteTaskPreview',
      'editTaskComment',
      'loadComment',
      'loadPreviewFileFormData',
      'loadTask',
      'loadTaskComments',
      'loadTaskSubscribed',
      'refreshPreview',
      'pinComment',
      'refreshComment',
      'removeSelectedTask',
      'setPreview',
      'subscribeToTask',
      'unsubscribeFromTask',
      'updatePreviewAnnotation'
    ]),

    loadTaskData() {
      if (this.task) {
        this.loading.task = true
        this.errors.task = false
        this.loadTaskComments({
          taskId: this.task.id,
          entityId: this.task.entity_id
        })
          .then(() => {
            this.loading.task = false
            this.reset()
          })
          .catch(err => {
            console.error(err)
            this.errors.task = true
          })
      }
    },

    addComment(
      comment,
      attachment,
      checklist,
      taskStatusId,
      revision = undefined,
      link = undefined
    ) {
      this.animOn = true
      this.$nextTick(() => {
        let preview = this.currentParentPreview
          ? this.currentParentPreview
          : this.currentPreview
        // find real preview, which contains the `revision`
        preview = this.taskPreviews.find(p => p.id === preview.id)
        const params = {
          taskId: this.task.id,
          taskStatusId,
          attachment,
          checklist,
          comment,
          links: link ? [link] : null,
          revision
        }
        const action =
          this.previewForms.length > 0
            ? 'commentTaskWithPreview'
            : 'commentTask'
        this.loading.addComment = true
        this.errors.addComment = false
        this.errors.addCommentMaxRetakes = false
        this.$store
          .dispatch(action, params)
          .then(() => {
            drafts.clearTaskDraft(this.task.id)
            this.$refs['add-comment']?.reset()
            this.reset()
            this.loading.addComment = false
            this.$emit('comment-added')
          })
          .catch(err => {
            console.error(err)
            const isRetakeError = err.body?.message?.includes('retake') ?? false
            this.errors.addComment = !isRetakeError
            this.errors.addCommentMaxRetakes = isRetakeError
            this.loading.addComment = false
          })
      })
    },

    reset({ keepPreviewFiles = false } = {}) {
      this.resetModals()
      if (!keepPreviewFiles) {
        this.clearPreviewFiles()
      }
      if (this.task) {
        this.taskComments = this.getTaskComments(this.task.id)
        this.taskPreviews = this.getTaskPreviews(this.task.id)
        this.setOtherPreviews()
        this.currentPreviewPath = this.getOriginalPath()
        this.currentPreviewDlPath = this.getOriginalDlPath()
        this.resetDraft()
        this.$nextTick(() => {
          this.$refs['preview-player']?.focus()
        })
      }
    },

    focusCommentTextarea() {
      this.$refs['add-comment']?.focus()
    },

    getOriginalPath() {
      const previewId = this.currentPreviewId
      const extension = this.extension ? this.extension : 'png'
      return `/api/pictures/originals/preview-files/${previewId}.${extension}`
    },

    getOriginalDlPath() {
      const previewId = this.currentPreviewId
      return `/api/pictures/originals/preview-files/${previewId}/download`
    },

    setOtherPreviews() {
      if (this.taskPreviews) {
        this.otherPreviews = this.taskPreviews.filter(p => {
          return p.id !== this.currentPreviewId && p.extension === 'mp4'
        })
      }
      return this.otherPreviews
    },

    selectFile(forms) {
      this.previewForms = this.previewForms.concat(forms)
      this.loadPreviewFileFormData(this.previewForms)
    },

    onPreviewFormRemoved(previewForm) {
      this.previewForms = this.previewForms.filter(f => f !== previewForm)
      this.loadPreviewFileFormData(this.previewForms)
    },

    clearPreviewFiles() {
      this.previewForms = []
      this.loadPreviewFileFormData(this.previewForms)
      this.$store.commit('CLEAR_UPLOAD_PROGRESS')
    },

    createExtraPreview(forms) {
      this.selectFile(forms)
      this.errors.addExtraPreview = false
      this.loading.addExtraPreview = true
      const comment = this.taskComments.find(comment =>
        comment.previews.find(preview => preview.id === this.currentPreviewId)
      )
      this.addCommentExtraPreview({
        taskId: this.task.id,
        commentId: comment?.id,
        previewId: this.currentPreviewId
      })
        .then(() => {
          this.loading.addExtraPreview = false
          this.$refs['add-extra-preview-modal'].reset()
          this.reset()
          setTimeout(() => {
            this.$refs['preview-player'].displayLast()
          }, 0)
          this.modals.addExtraPreview = false
        })
        .catch(err => {
          console.error(err)
          this.loading.addExtraPreview = false
          this.errors.addExtraPreview = true
        })
    },

    onPreviewAdded(eventData) {
      const taskId = eventData.task_id
      const commentId = eventData.comment_id
      const previewId = eventData.preview_file_id
      const revision = eventData.revision
      const extension = eventData.extension
      const comment = this.getTaskComment(taskId, commentId)

      if (this.task) {
        if (
          taskId === this.task.id &&
          comment &&
          (comment.previews.length === 0 ||
            comment.previews[0].id !== previewId)
        ) {
          this.$store.commit('ADD_PREVIEW_END', {
            preview: {
              id: previewId,
              revision,
              extension
            },
            taskId,
            commentId,
            comment
          })
          this.reset({ keepPreviewFiles: true })
        }
      }
    },

    onPreviewsOrderChange() {
      this.taskPreviews = this.getTaskPreviews(this.task.id)
      this.setOtherPreviews()
      this.currentPreviewPath = this.getOriginalPath()
      this.currentPreviewDlPath = this.getOriginalDlPath()
    },

    onAnnotationChanged({ preview, additions, deletions, updates }) {
      let taskId = this.task ? this.task.id : this.previousTaskId
      taskId = taskId || preview.task_id
      if (taskId) {
        this.updatePreviewAnnotation({
          taskId,
          preview,
          additions,
          deletions,
          updates
        })
      }
    },

    onAddPreviewClicked() {
      this.modals.addPreview = true
    },

    onAddExtraPreview() {
      this.clearPreviewFiles()
      this.modals.addExtraPreview = true
    },

    onRemoveExtraPreview(preview) {
      this.currentExtraPreviewId = preview.id
      this.modals.deleteExtraPreview = true
    },

    onCommentAdded() {
      this.taskComments = this.getTaskComments(this.task.id)
    },

    onCancelRemoveExtraPreview() {
      this.modals.deleteExtraPreview = false
    },

    closeAddPreviewModal() {
      this.modals.addPreview = false
    },

    confirmAddPreviewModal(forms) {
      this.selectFile(forms)
      this.closeAddPreviewModal()
    },

    onCloseExtraPreview() {
      this.modals.addExtraPreview = false
    },

    onPreviewChanged(previewId) {
      this.currentPreviewIndex = this.taskPreviews.findIndex(
        p => p.id === previewId
      )
      this.currentPreviewPath = this.getOriginalPath()
      this.currentPreviewDlPath = this.getOriginalDlPath()
    },

    changeCurrentPreview(previewFile) {
      const index = this.taskPreviews.findIndex(p => p.id === previewFile.id)
      if (index || index === 0) {
        this.currentPreviewIndex = index
        this.currentPreviewPath = this.getOriginalPath()
        this.currentPreviewDlPath = this.getOriginalDlPath()
      }
    },

    setCurrentPreviewAsEntityThumbnail(frame) {
      const previewPlayer = this.$refs['preview-player']
      const previewId = previewPlayer.currentPreview.id
      this.setPreview({
        taskId: this.task.id,
        entityId: this.task.entity_id,
        previewId,
        frame
      }).finally(() => {
        this.loading.setFrameThumbnail = false
      })
    },

    onAckComment(comment) {
      this.ackComment(comment)
    },

    onDuplicateComment(comment) {
      this.$refs['add-comment'].setValue(comment)
    },

    onPinComment(comment) {
      this.pinComment(comment)
    },

    onEditComment(comment) {
      this.commentToEdit = comment
      this.modals.editComment = true
    },

    onDeleteComment(comment) {
      this.commentToEdit = comment
      this.modals.deleteComment = true
    },

    onCancelEditComment() {
      this.modals.editComment = false
    },

    onCancelDeleteComment() {
      this.modals.deleteComment = false
    },

    async saveComment(comment) {
      try {
        await this.editTaskComment({
          taskId: this.task.id,
          comment
        })
      } catch (err) {
        console.error(err)
        await this.loadTaskData()
      }
    },

    confirmDeleteTaskComment() {
      this.animOn = true
      this.loading.deleteComment = true
      this.errors.deleteComment = false
      const commentId = this.commentToEdit.id

      this.deleteTaskComment({
        taskId: this.task.id,
        commentId
      })
        .then(() => {
          this.reset()
          this.loading.deleteComment = false
          this.modals.deleteComment = false
        })
        .catch(err => {
          console.error(err)
          this.loading.deleteComment = false
          this.errors.deleteComment = true
        })
        .finally(() => {
          this.animOn = false
        })
    },

    getCurrentTaskComments() {
      return this.getTaskComments(this.task.id)
    },

    confirmDeleteTaskPreview() {
      this.loading.deleteExtraPreview = true
      this.errors.deleteExtraPreview = false
      const previewId = this.currentExtraPreviewId
      const comment = this.getCurrentTaskComments().find(comment => {
        return comment.previews.findIndex(p => p.id === previewId) >= 0
      })

      this.$refs['preview-player'].displayFirst()
      this.deleteTaskPreview({
        taskId: this.task.id,
        commentId: comment.id,
        previewId
      })
        .then(() => {
          this.loading.deleteExtraPreview = false
          this.modals.deleteExtraPreview = false
        })
        .catch(err => {
          console.error(err)
          this.loading.deleteExtraPreview = false
          this.errors.deleteExtraPreview = true
        })
    },

    onRemoteAcknowledge(eventData, type) {
      if (this.task) {
        const comment = this.getTaskComment(this.task.id, eventData.comment_id)
        const user = this.personMap.get(eventData.person_id)
        if (comment && user) {
          if (this.user.id === user.id) {
            if (
              (type === 'ack' && !comment.acknowledgements.includes(user.id)) ||
              (type === 'unack' && comment.acknowledgements.includes(user.id))
            ) {
              this.$store.commit('ACK_COMMENT', { comment, user })
            }
          } else {
            this.$store.commit('ACK_COMMENT', { comment, user })
          }
        }
      }
    },

    isStatusChange(index) {
      const comment = this.taskComments[index]
      return (
        index === this.taskComments.length - 1 ||
        comment.task_status_id !== this.taskComments[index + 1].task_status_id
      )
    },

    timeCodeClicked({
      versionRevision,
      minutes,
      seconds,
      milliseconds,
      frame
    }) {
      if (!this.isPreview) {
        this.$emit('time-code-clicked', {
          versionRevision,
          minutes,
          seconds,
          milliseconds,
          frame
        })
        return
      }
      this.changeCurrentPreview(
        this.taskPreviews.find(p => p.revision === parseInt(versionRevision))
      )
      setTimeout(() => {
        this.$refs['preview-player']?.setCurrentFrame(frame)
        this.$refs['preview-player']?.focus()
      }, 20)
    },

    onFrameUpdated(frame) {
      this.currentFrameRaw = frame
    },

    async extractAnnotationSnapshots() {
      let previewPlayer = this.$refs['preview-player']
      if (!previewPlayer) previewPlayer = this.player
      this.$refs['add-comment'].showAnnotationLoading()
      const files = await previewPlayer.extractAnnotationSnapshots()
      this.$refs['add-comment'].hideAnnotationLoading()
      this.$refs['add-comment'].setAnnotationSnapshots(files)
      return files
    },

    onExportClick() {
      const nameData = [
        moment().format('YYYY-MM-DD'),
        'kitsu',
        this.productionMap.get(this.task.project_id)?.name,
        this.task.entity_name.replaceAll(' / ', '_'),
        this.taskTypeMap.get(this.task.task_type_id).name,
        'comments'
      ]
      const name = stringHelpers.slugify(nameData.join('_'))
      const headers = [
        this.$t('comments.fields.created_at'),
        this.$t('comments.fields.task_status'),
        this.$t('comments.fields.person'),
        this.$t('comments.fields.text'),
        this.$t('comments.fields.checklist'),
        this.$t('comments.fields.acknowledgements')
      ]
      const commentLines = []
      this.getCurrentTaskComments().forEach(comment => {
        commentLines.push([
          formatDate(comment.created_at),
          comment.task_status.name,
          comment.person.name,
          comment.text,
          comment.checklist
            ? comment.checklist
                .map(
                  checkListElement =>
                    `[${checkListElement.checked ? 'x' : ' '}] ${
                      checkListElement.text
                    }`
                )
                .join('\n')
            : '',
          comment.acknowledgements
            ? comment.acknowledgements
                .map(personId => this.personMap.get(personId).name)
                .join(',')
            : ''
        ])
        if (comment.replies) {
          comment.replies.forEach(reply =>
            commentLines.push([
              formatDate(reply.date),
              'Reply',
              this.personMap.get(reply.person_id).name,
              reply.text
            ])
          )
        }
      })
      csv.buildCsvFile(name, [headers].concat(commentLines))
    },

    onExtendDown(event) {
      if (!this.sideColumnParent) {
        return
      }
      this.lastWidthX = this.getClientX(event)
      const panelWidth = this.sideColumnParent.offsetWidth
      this.lastWidth = panelWidth
      this.addEvents(this.domEvents)
    },

    onExtendMove(event) {
      const diff = this.lastWidthX - this.getClientX(event)
      let panelWidth = Math.max(this.lastWidth + diff, DEFAULT_PANEL_WIDTH)
      if (panelWidth > 900) panelWidth = 900
      this.setWidth(panelWidth)
      this.refreshPreviewPlay()
    },

    onExtendUp() {
      this.removeEvents(this.domEvents)
      this.refreshPreviewPlay()
      if (this.sideColumnParent) {
        const panelWidth = this.sideColumnParent.offsetWidth
        preferences.setPreference('task:panel-width', panelWidth)
      }
    },

    setWidth(width) {
      if (!this.sideColumnParent) {
        return
      }
      this.sideColumnParent.style['min-width'] = `${width}px`
      this.isWide = width > 699
      this.isExtraWide = width >= 900
    },

    onSetCurrentFrameAsThumbnail(isUseCurrentFrame) {
      if (this.$refs['preview-player']) {
        this.loading.setFrameThumbnail = true
        let frame = null
        if (isUseCurrentFrame) {
          frame = this.currentFrameRaw + 1
        }
        return this.setCurrentPreviewAsEntityThumbnail(frame)
      }
    },

    refreshPreviewPlay() {
      this.$refs['preview-player']?.previewViewer?.resize()
    },

    removeTaskFromSelection(task) {
      const data = {
        column: { id: task.task_type_id },
        entity: { id: task.entity_id },
        task
      }
      this.removeSelectedTask({ task: data }) // remove list selection
      this.removeSelectedTask({ task }) // remove
      this.$emit('task-removed', task)
    }
  },

  watch: {
    task() {
      this.clearPreviewFiles()
      this.currentPreviewIndex = 0
      if (!this.silent) {
        this.loadTaskData()
      }
    },

    silent: {
      immediate: true,
      handler() {
        if (!this.silent) {
          this.loadTaskData()
        }
      }
    },

    currentFrame() {
      this.currentFrameRaw = this.currentFrame
    }
  },

  socket: {
    events: {
      'preview-file:add-file'(eventData) {
        this.onPreviewAdded(eventData)
      },

      'preview-file:update'(eventData) {
        const comment = this.taskComments.find(
          c =>
            c.previews &&
            c.previews.length > 0 &&
            c.previews[0].id === eventData.preview_file_id
        )
        if (comment && this.task) {
          this.refreshPreview({
            taskId: this.task.id,
            previewId: eventData.preview_file_id
          }).then(preview => {
            comment.previews[0].validation_status = preview.validation_status
          })
        }
      },

      'task:update'(eventData) {
        const task = this.getTask()
        // Wait for data to be reinitialized by App.vue to update comments.
        if (task && eventData.task_id === task.id) {
          setTimeout(() => {
            const task = this.getTask()
            // in case the task changed during the timeout
            if (task && eventData.task_id === task.id) {
              this.taskComments = this.getTaskComments(task.id)
            }
          }, 1000)
        }
      },

      'comment:new'(eventData) {
        setTimeout(() => {
          this.animOn = true
          const comments = this.task ? this.getTaskComments(this.task.id) : null
          if (
            this.task &&
            comments &&
            comments.length !== this.taskComments.length &&
            eventData.task_id === this.task.id &&
            !this.loading.task
          ) {
            this.taskComments = comments
            this.taskPreviews = this.getTaskPreviews(this.task.id)
          }
          this.animOn = false
        }, 1000)
      },

      'comment:update'(eventData) {
        const commentId = eventData.comment_id
        if (
          this.isSavingCommentPreview ||
          (!this.task && !this.taskComments.some(({ id }) => id === commentId))
        ) {
          return
        }
        this.loadComment({ commentId }).catch(console.error)
      },

      'comment:acknowledge'(eventData) {
        this.onRemoteAcknowledge(eventData, 'ack')
      },

      'comment:unacknowledge'(eventData) {
        this.onRemoteAcknowledge(eventData, 'unack')
      },

      'comment:reply'(eventData) {
        if (this.task) {
          const comment = this.taskComments.find(
            c => c.id === eventData.comment_id
          )
          if (comment) {
            if (!comment.replies) comment.replies = []
            const reply = comment.replies.find(r => r.id === eventData.reply_id)
            if (!reply) {
              this.refreshComment({
                commentId: eventData.comment_id
              })
                .then(remoteComment => {
                  comment.replies = remoteComment.replies
                })
                .catch(console.error)
            }
          }
        }
      },

      'comment:delete'(eventData) {
        const task = this.getTask()
        this.animOn = true
        if (task) {
          const comments = this.getComments()
          const comment = comments.find(c => c.id === eventData.comment_id)
          if (comment) {
            this.$store.commit('REMOVE_TASK_COMMENT', { task, comment })
            this.taskComments = this.getTaskComments(this.task.id)
            this.taskPreviews = this.getTaskPreviews(this.task.id)
          }
          this.animOn = false
        }
      },

      'comment:delete-reply'(eventData) {
        if (this.task) {
          const comment = this.taskComments.find(
            c => c.id === eventData.comment_id
          )
          if (comment) {
            if (!comment.replies) comment.replies = []
            this.$store.commit('REMOVE_REPLY_FROM_COMMENT', {
              comment,
              reply: { id: eventData.reply_id }
            })
          }
        }
      },

      'preview-file:annotation-update'(eventData) {
        const previewPlayer = this.$refs['preview-player']
        if (!previewPlayer) return
        const isValid = previewPlayer.isValidPreviewModification(
          eventData.preview_file_id,
          eventData.updated_at
        )
        if (isValid) {
          this.refreshPreview({
            previewId: previewPlayer.currentPreview.id,
            taskId: previewPlayer.currentPreview.task_id
          }).then(() => {
            if (!previewPlayer.notSaved) {
              this.taskPreviews = this.getTaskPreviews(this.task.id)
              previewPlayer.reloadAnnotations()
              previewPlayer.loadAnnotation()
            }
          })
        }
      }
    },

    head() {
      return {
        title: this.title
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .add-comment,
  .comment,
  .no-comment {
    background: #46494f;
    border-color: $dark-grey;
    box-shadow: 0 0 6px #333;
  }

  .extend-bar {
    background: #46494f;
  }

  .no-preview {
    padding: 0.5em;
  }

  .side {
    background: #36393f;
  }

  .task-info {
    color: white;
  }
}

.side {
  background: #f8f8f8;
  min-height: 100%;
}

.add-comment {
  padding: 0.5em;
  margin-bottom: 0.5em;
  box-shadow: 0 0 6px #e0e0e0;
}

.page-header {
  padding: 0;
  margin-top: 0;
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

.add-preview-button {
  margin-top: 0.5em;
  width: 100%;
}

.no-comment {
  background: white;
  box-shadow: 0 0 6px #e0e0e0;
}

.comments {
  padding-bottom: 1em;
}

.preview-colum-content {
  box-shadow: 0 0 6px #e0e0e0;
}

.preview-standard-file {
  text-align: center;
  padding: 1em;
}

.model-viewer {
  padding: 0.3em;
}

.change-wideness-button,
.set-thumbnail-button,
.subscribe-button {
  margin-right: 0.2em;
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

.side {
  flex: 1;
  overflow: auto;
}

.extend-bar {
  width: 3px;
  margin-left: 3px;
  background: #ccc;
  cursor: ew-resize;
}

.revision-thumbnail {
  border: 2px solid transparent;
  border-radius: 3px;
  height: 33px;
  margin-bottom: 4px;
  position: relative;

  &:hover {
    border: 2px solid $grey;
  }

  &.selected {
    border: 2px solid $dark-purple;
  }

  span {
    background: $dark-purple;
    border-radius: 0;
    border-bottom-right-radius: 4px;
    color: $white;
    font-size: 0.8em;
    height: 14px;
    line-height: 1.1em;
    margin: 0;
    opacity: 0.8;
    left: 0;
    padding: 0;
    position: absolute;
    text-align: center;
    top: 0;
    width: 14px;
  }
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
</style>
