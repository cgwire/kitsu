<template>
  <div class="side-wrapper">
    <div
      class="extend-bar"
      @mouseup="onExtendUp"
      @mousedown="onExtendDown"
      v-if="withActions"
    ></div>
    <div class="side task-info" ref="side-panel">
      <action-panel
        v-if="withActions"
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
        <h1 class="title">{{ $tc('tasks.selected_tasks') }}</h1>
        <div class="task-list mt1">
          <div
            class="selected-task-line flexrow"
            :key="task.id"
            v-for="task in selectedTasksToDisplay"
          >
            <task-type-name
              class="flexrow-item task-type"
              :task-type="taskTypeMap.get(task.task_type_id)"
              :production-id="currentProduction.id"
            />
            <span class="flexrow-item">{{ task.entity_name }}</span>
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
          <div class="flexrow header-title">
            <task-type-name
              class="flexrow-item task-type"
              :task-type="currentTaskType"
              :production-id="currentProduction.id"
              v-if="currentTaskType"
            />
            <div class="title flexrow-item filler">
              <router-link :to="taskEntityPath">
                {{ task ? title : 'Loading...' }}
              </router-link>
            </div>
          </div>
        </div>

        <div class="task-columns pa1 pt0" ref="task-columns">
          <div class="task-column preview-column" v-if="isPreview">
            <div class="preview-column-content">
              <div class="flexrow">
                <div class="filler"></div>
                <div class="preview-list flexrow w100" v-if="isPreview">
                  <span
                    :class="{
                      'flexrow-item': true,
                      selected: currentPreviewIndex === index
                    }"
                    :key="'preview-' + preview.id"
                    @click="onPreviewChanged(index)"
                    v-for="(preview, index) in lastFivePreviews"
                  >
                    {{ preview.revision }}
                  </span>
                  <router-link
                    class="history-button flexrow-item"
                    :to="taskPath"
                  >
                    <corner-right-up-icon size="0.9x" />
                  </router-link>
                </div>
              </div>

              <div class="preview">
                <div v-if="taskPreviews && taskPreviews.length > 0">
                  <preview-player
                    :entity-preview-files="taskEntityPreviews"
                    :extra-wide="isExtraWide"
                    :is-assigned="isAssigned"
                    :last-preview-files="lastFivePreviews"
                    :light="!isWide"
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
                    @time-updated="onTimeUpdated"
                    ref="preview-player"
                  />
                </div>

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
                  :task-status="getTaskStatusForCurrentUser(task.project_id)"
                  :light="true"
                  :is-loading="loading.addComment"
                  :previewForms="previewForms"
                  :is-error="errors.addComment"
                  :is-max-retakes-error="errors.addCommentMaxRetakes"
                  :fps="parseInt(currentFps)"
                  :time="isPreview ? currentTime : currentTimeRaw"
                  :revision="currentRevision"
                  :is-movie="isMoviePreview"
                  @add-comment="addComment"
                  @add-preview="onAddPreviewClicked"
                  @file-drop="selectFile"
                  @clear-files="clearPreviewFiles"
                  @remove-preview="onPreviewFormRemoved"
                  @annotation-snapshots-requested="extractAnnotationSnapshots"
                  v-show="isCommentingAllowed"
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
                      :key="'comment' + comment.id"
                      :comment="comment"
                      :task="task"
                      :light="true"
                      :add-preview="onAddPreviewClicked"
                      :is-first="index === 0"
                      :is-last="index === pinnedCount"
                      :is-change="isStatusChange(index)"
                      :editable="
                        (comment.person && user.id === comment.person.id) ||
                        isCurrentUserAdmin
                      "
                      @duplicate-comment="onDuplicateComment"
                      @pin-comment="onPinComment"
                      @edit-comment="onEditComment"
                      @delete-comment="onDeleteComment"
                      @checklist-updated="saveComment"
                      @ack-comment="onAckComment"
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
          @cancel="closeAddPreviewModal"
          @confirm="confirmAddPreviewModal"
        />

        <add-preview-modal
          ref="add-extra-preview-modal"
          :active="modals.addExtraPreview"
          :is-loading="loading.addExtraPreview"
          :is-error="errors.addExtraPreview"
          :form-data="addExtraPreviewFormData"
          @cancel="onCloseExtraPreview"
          @confirm="createExtraPreview"
        />

        <edit-comment-modal
          :active="modals.editComment"
          :is-loading="loading.editComment"
          :is-error="errors.editComment"
          :comment-to-edit="commentToEdit"
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

      <div class="side task-info has-text-centered" v-else>
        {{ $t('tasks.no_task_selected') }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

import csv from '@/lib/csv'
import drafts from '@/lib/drafts'
import { getTaskEntityPath, getTaskPath } from '@/lib/path'
import preferences from '@/lib/preferences'
import { getTaskTypeStyle } from '@/lib/render'
import { sortTaskNames } from '@/lib/sorting'
import stringHelpers from '@/lib/string'
import { formatDate } from '@/lib/time'

import { taskMixin } from '@/components/mixins/task'
import { domMixin } from '@/components/mixins/dom'

import { CornerRightUpIcon } from 'vue-feather-icons'

import ActionPanel from '@/components/tops/ActionPanel'
import AddComment from '@/components/widgets/AddComment'
import AddPreviewModal from '@/components/modals/AddPreviewModal'
import Comment from '@/components/widgets/Comment'
import DeleteModal from '@/components/modals/DeleteModal'
import EditCommentModal from '@/components/modals/EditCommentModal'
import Spinner from '@/components/widgets/Spinner'
import TaskTypeName from '@/components/widgets/TaskTypeName'
import PreviewPlayer from '@/components/previews/PreviewPlayer'

export default {
  name: 'task-info',
  mixins: [domMixin, taskMixin],

  components: {
    ActionPanel,
    AddComment,
    AddPreviewModal,
    Comment,
    CornerRightUpIcon,
    DeleteModal,
    EditCommentModal,
    PreviewPlayer,
    Spinner,
    TaskTypeName
  },

  props: {
    task: {
      type: Object,
      default: () => {}
    },
    isLoading: {
      type: Boolean,
      default: true
    },
    isPreview: {
      type: Boolean,
      default: true
    },
    currentTimeRaw: {
      type: Number,
      default: 0
    },
    currentParentPreview: {
      type: Object,
      default: null
    },
    silent: {
      type: Boolean,
      default: false
    },
    panelName: {
      type: String,
      default: 'todefine'
    },
    withActions: {
      type: Boolean,
      default: false
    },
    entityType: {
      type: String,
      default: 'Asset'
    }
  },

  data() {
    return {
      addExtraPreviewFormData: null,
      animOn: false,
      previewForms: [],
      currentPreviewIndex: 0,
      currentPreviewPath: '',
      currentPreviewDlPath: '',
      currentTime: 0,
      commentToEdit: null,
      isWide: false,
      isExtraWide: false,
      otherPreviews: [],
      panelWidth: 800,
      taskComments: [],
      taskPreviews: [],
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
        task: false
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
    this.loadTaskData()
    if (this.$refs['add-comment']) {
      const draft = drafts.getTaskDraft(this.task.id)
      if (draft) {
        this.$refs['add-comment'].text = draft
      }
    }
    this.isChangingWidth = false
    document.addEventListener('mouseup', this.onExtendUp)
    document.addEventListener('mousemove', this.onExtendMove)

    const width = preferences.getIntPreference('task:panel-width') || 400
  },

  beforeDestroy() {
    document.removeEventListener('mouseup', this.onExtendUp)
    document.removeEventListener('mousemove', this.onExtendMove)
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'getTaskComment',
      'getTaskComments',
      'getTaskPreviews',
      'getTaskStatusForCurrentUser',
      'isCurrentUserAdmin',
      'isCurrentUserClient',
      'isCurrentUserSupervisor',
      'isCurrentUserManager',
      'isSingleEpisode',
      'isTVShow',
      'lastCommentDraft',
      'nbSelectedTasks',
      'personMap',
      'previewFormData',
      'productionMap',
      'selectedAssets',
      'selectedEdits',
      'selectedShots',
      'selectedTasks',
      'nbSelectedValidations',
      'taskEntityPreviews',
      'taskTypeMap',
      'user'
    ]),

    nbSelectedEntities() {
      return this.selectedEntities.size
    },

    selectedEntities() {
      return this[`selected${this.entityType}s`]
    },

    currentTeam() {
      if (!this.task) return []
      const production = this.productionMap.get(this.task.project_id)
      return production.team.map(id => this.personMap.get(id))
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
      if (this.task) {
        return this.task.assignees.some(assigneeId => {
          return assigneeId === this.user.id
        })
      } else {
        return false
      }
    },

    isCommentingAllowed() {
      if (this.task) {
        if (this.isCurrentUserManager) {
          return true
        } else if (this.isCurrentUserSupervisor) {
          if (this.user.departments.length === 0) {
            return true
          } else {
            const taskType = this.taskTypeMap.get(this.task.task_type_id)
            return (
              taskType.department_id &&
              this.user.departments.includes(taskType.department_id)
            )
          }
        } else if (this.isCurrentUserClient) {
          return true
        } else if (
          this.task.assignees.find(personId => personId === this.user.id)
        ) {
          return true
        }
      }
      return false
    },

    isPreviewPlayerReadOnly() {
      if (this.task) {
        if (this.isCurrentUserManager || this.isCurrentUserClient) {
          return false
        } else if (this.isCurrentUserSupervisor) {
          if (this.user.departments.length === 0) {
            return false
          } else {
            const taskType = this.taskTypeMap.get(this.task.task_type_id)
            return !(
              taskType.department_id &&
              this.user.departments.includes(taskType.department_id)
            )
          }
        }
      }
      return false
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
      return this.task ? this.taskTypeMap.get(this.task.task_type_id) : null
    },

    currentPreview() {
      const index = this.currentPreviewIndex
      return this.taskPreviews && this.taskPreviews.length > 0
        ? this.taskPreviews[index]
        : null
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
      return this.productionMap.get(this.task.project_id).fps || '25'
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

    taskTypeStyle() {
      return getTaskTypeStyle(this.task)
    },

    taskPath() {
      return getTaskPath(
        this.task,
        this.currentProduction,
        this.isTVShow,
        this.currentEpisode,
        this.taskTypeMap
      )
    },

    taskEntityPath() {
      const episodeId = this.$route.params.episode_id
      return getTaskEntityPath(this.task, episodeId)
    },

    lastFivePreviews() {
      if (this.taskPreviews) {
        return this.taskPreviews.slice(0, 10)
      } else {
        return []
      }
    },

    pinnedCount() {
      if (!this.taskComments) return 0
      return this.taskComments.filter(c => c.pinned).length
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
      'loadPreviewFileFormData',
      'loadTask',
      'loadTaskComments',
      'loadTaskSubscribed',
      'refreshPreview',
      'pinComment',
      'refreshComment',
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
      revision = undefined
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
          revision
        }
        let action = 'commentTask'
        if (this.previewForms.length > 0) action = 'commentTaskWithPreview'
        this.loading.addComment = true
        this.errors.addComment = false
        this.errors.addCommentMaxRetakes = false
        this.$store
          .dispatch(action, params)
          .then(() => {
            drafts.clearTaskDraft(this.task.id)
            this.reset()
            this.loading.addComment = false
            this.$emit('comment-added')
          })
          .catch(err => {
            console.error(err)
            const isRetakeError =
              err.response &&
              err.response.body.message &&
              err.response.body.message.indexOf('retake') > 0
            this.errors.addComment = !isRetakeError
            this.errors.addCommentMaxRetakes = isRetakeError
            this.loading.addComment = false
          })
          .finally(() => {})
      })
    },

    reset() {
      this.resetModals()
      this.clearPreviewFiles()
      if (this.task) {
        this.taskComments = this.getTaskComments(this.task.id)
        this.taskPreviews = this.getTaskPreviews(this.task.id)
        this.setOtherPreviews()
        this.currentPreviewPath = this.getOriginalPath()
        this.currentPreviewDlPath = this.getOriginalDlPath()
        this.resetDraft()
        this.$nextTick(() => {
          if (this.$refs['add-comment']) this.$refs['add-comment'].focus()
        })
      }
    },

    focusCommentTextarea() {
      if (this.$refs['add-comment']) this.$refs['add-comment'].focus()
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

      const index = this.currentPreviewIndex
      this.errors.addExtraPreview = false
      this.loading.addExtraPreview = true
      this.addCommentExtraPreview({
        taskId: this.task.id,
        commentId: this.taskComments[0].id,
        previewId: this.taskPreviews[index].id
      })
        .then(() => {
          this.loading.addExtraPreview = false
          this.$refs['add-extra-preview-modal'].reset()
          this.clearPreviewFiles()
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
              extension: extension
            },
            taskId,
            commentId,
            comment
          })
          this.reset()
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
      const taskId = this.task ? this.task.id : this.previousTaskId
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

    onAddPreviewClicked(comment) {
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

    onPreviewChanged(index) {
      this.currentPreviewIndex = index
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
      this.setPreview({
        taskId: this.task.id,
        entityId: this.task.entity.id,
        previewId: this.currentPreview.previews[0].id,
        frame
      })
    },

    toggleSubscribe() {
      if (this.task && !this.isAssigned) {
        if (this.task.is_subscribed) {
          this.unsubscribeFromTask(this.task.id)
        } else {
          this.subscribeToTask(this.task.id)
        }
      }
    },

    toggleWidth() {
      this.isWide = !this.isWide
      const panel = this.$refs['side-panel']
      if (this.isWide) {
        panel.parentElement.style['min-width'] = '700px'
      } else {
        panel.parentElement.style['min-width'] = '350px'
      }
    },

    toggleExtraWidth() {
      this.isExtraWide = !this.isExtraWide
      const panel = this.$refs['side-panel']
      if (this.isExtraWide) {
        panel.parentElement.style['min-width'] = '65vw'
      } else {
        panel.parentElement.style['min-width'] = '700px'
      }
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

    onCancelEditComment(comment) {
      this.modals.editComment = false
    },

    onCancelDeleteComment(comment) {
      this.modals.deleteComment = false
    },

    saveComment(comment, checklist) {
      this.editTaskComment({
        taskId: this.task.id,
        comment,
        checklist
      })
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
        this.$refs['preview-player'].setCurrentFrame(frame)
        this.$refs['preview-player'].focus()
      }, 20)
    },

    onTimeUpdated(time) {
      this.currentTime = time
    },

    async extractAnnotationSnapshots() {
      let previewPlayer = this.$refs['preview-player']
      if (!previewPlayer) previewPlayer = this.$parent
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
        this.currentProduction.name,
        this.task.entity_name.replaceAll(' / ', '_'),
        this.taskTypeMap.get(this.task.task_type_id).name,
        'comments'
      ]
      const name = stringHelpers.slugify(nameData.join('_'))
      var headers = [
        this.$t('comments.fields.created_at'),
        this.$t('comments.fields.task_status'),
        this.$t('comments.fields.person'),
        this.$t('comments.fields.text'),
        this.$t('comments.fields.checklist'),
        this.$t('comments.fields.acknowledgements')
      ]
      var commentLines = []
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

    onExtendUp(event) {
      if (this.isChangingWidth) {
        this.pauseEvent(event)
        if (this.$refs['preview-player']) {
          this.$refs['preview-player'].previewViewer.resize()
          this.$refs['preview-player'].fixCanvasSize()
        }
        const panel = this.$refs['side-panel']
        const parent = panel.parentElement.parentElement
        const panelWidth = parent.offsetWidth
        preferences.setPreference('task:panel-width', panelWidth)
      }
      this.isChangingWidth = false
    },

    onExtendDown(event) {
      this.pauseEvent(event)
      if (this.withActions) {
        this.lastWidthX = event.clientX
        const panel = this.$refs['side-panel']
        const parent = panel.parentElement.parentElement
        const panelWidth = parent.offsetWidth
        this.lastWidth = parent.offsetWidth
        this.isChangingWidth = true
      }
    },

    onExtendMove(event) {
      if (this.isChangingWidth) {
        this.pauseEvent(event)
        const diff = this.lastWidthX - event.clientX
        const width = Math.max(this.lastWidth + diff, 420)
        this.setWidth(width)
        if (this.$refs['preview-player']) {
          this.$refs['preview-player'].previewViewer.resize()
          this.$refs['preview-player'].fixCanvasSize()
        }
      }
    },

    setWidth(width) {
      const panel = this.$refs['side-panel']
      const parent = panel.parentElement.parentElement
      parent.style['min-width'] = width + 'px'
      if (width > 699 && width < 900) {
        this.isWide = true
        this.isExtraWide = false
      } else if (width >= 900) {
        this.isWide = true
        this.isExtraWide = true
      } else {
        this.isWide = false
        this.isExtraWide = false
      }
    },

    onSetCurrentFrameAsThumbnail(isUseCurrentFrame) {
      if (this.$refs['preview-player']) {
        let frame = 0
        if (isUseCurrentFrame && this.$refs['preview-player'].isMovie) {
          frame = parseInt(this.$refs['preview-player'].currentFrame)
        }
        return this.setCurrentPreviewAsEntityThumbnail(frame)
      }
    }
  },

  watch: {
    task() {
      this.previewForms = []
      this.currentPreviewIndex = 0
      if (this.previousTaskId && this.$refs['add-comment']) {
        const lastComment = `${this.$refs['add-comment'].text}`
        const previousDraft = drafts.getTaskDraft(this.previousTaskId)
        if (
          (this.$refs['add-comment'].text.length > 0 || previousDraft) &&
          this.$refs['add-comment'].text !== previousDraft
        ) {
          drafts.setTaskDraft(this.previousTaskId, lastComment)
        }
      }
      this.$nextTick(() => {
        if (this.task) this.previousTaskId = this.task.id
        if (this.task && this.$refs['add-comment']) {
          const draft = drafts.getTaskDraft(this.task.id)
          if (draft) this.$refs['add-comment'].text = draft
        }
      })
      if (!this.silent) {
        this.loadTaskData()
      }
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
                taskId: this.task.id,
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
          }).then(preview => {
            if (!previewPlayer.notSaved) {
              this.taskPreviews = this.getTaskPreviews(this.task.id)
              previewPlayer.reloadAnnotations()
              previewPlayer.loadAnnotation()
            }
          })
        }
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
    box-shadow: 0px 0px 6px #333;
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
  box-shadow: 0px 0px 6px #e0e0e0;
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
  box-shadow: 0px 0px 6px #e0e0e0;
}

.task-columns {
  display: flex;
  flex-direction: column;
}

.task-column {
}

.comment {
  border-top: 1px solid $white-grey;
  border-bottom: 1px solid $white-grey;
  border-right: 1px solid $white-grey;
  margin-top: 0.1em;
  box-shadow: 0px 0px 6px #e0e0e0;
}

.add-preview-button {
  margin-top: 0.5em;
  width: 100%;
}

.no-comment {
  background: white;
  box-shadow: 0px 0px 6px #e0e0e0;
}

.comments {
  padding-bottom: 1em;
}

.preview-colum-content {
  box-shadow: 0px 0px 6px #e0e0e0;
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

.preview-list {
  span {
    cursor: pointer;
    padding: 0.2em;
    margin: 0.2em;
    text-align: center;
    border-radius: 3px;

    &:hover {
      background: var(--background-selectable);
    }

    &.selected {
      background: var(--background-selected);
    }
  }
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
}

.extend-bar {
  width: 3px;
  background: #ccc;
  cursor: w-resize;
}
</style>
