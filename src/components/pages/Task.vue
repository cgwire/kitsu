<template>
  <div class="fixed-page columns">
  <div class="page column main-column">
    <div class="page-header pa1 mb0">
      <div
        class="flexrow header-title"
        v-if="task"
      >
        <task-type-name
          class="flexrow-item task-type block"
          :task-type="taskType"
          :production-id="currentProduction.id"
          v-if="taskType"
        />

        <span
          class="flexrow-item ml2"
        >
          <entity-thumbnail
            class="entity-thumbnail"
            :entity="taskPreviews && taskPreviews.length > 0
              ? { preview_file_id: taskPreviews[0].id }
              : { }"
            :empty-width="100"
            :empty-height="60"
            :width="100"
            :with-link="false"
          />
        </span>

        <h1 class="title flexrow-item">
          <router-link :to="taskEntityPath">
            <page-title :text="task ? title : 'Loading...'" bold />
          </router-link>
        </h1>

        <div class="flexrow-item flexrow block">
          <span class="flexrow-item">
            {{ $t('tasks.current_status') }}
          </span>
          <validation-tag
            class="is-medium flexrow-item"
            :task="task"
            :is-static="true"
            v-if="task"
          />
          <span
            class="flexrow-item"
            v-if="task.assignees.length > 0"
          >
            {{ $t('tasks.fields.assignees') }}:
          </span>
          <span
            class="flexrow-item avatar-wrapper"
            :key="personId"
            v-for="personId in task.assignees"
          >
            <people-avatar
              class="flexrow-item"
              :key="personId"
              :person="personMap.get(personId)"
              :size="30"
              :font-size="16"
            />
           </span>
           <div class="flexrow-item">
             {{ $t('tasks.fields.priority') }}:
             {{ formatPriority(task.priority) }}
           </div>
         <subscribe-button
           class="flexrow-item action-button"
           :subscribed="isAssigned || isSubscribed"
           @click="toggleSubscribe"
           v-if="!isAssigned"
         />
        </div>
      </div>
    </div>

    <div class="task-columns" ref="task-columns">
      <div class="task-column preview-column">
        <div class="preview-column-content block">
          <div class="flexrow preview-header">
            <div class="flexrow-item" v-if="isPreviews">
              <combobox-styled
                class="preview-combo flexrow-item"
                :options="previewOptions"
                v-model="selectedPreviewId"
              />
            </div>
            <div v-else>
              <em>
                {{ $t('tasks.no_preview')}}
              </em>
            </div>

            <div
              class="set-main-preview flexrow-item flexrow pull-right"
              v-if="isPreviewButtonVisible"
            >
              <button
                :class="{
                  button: true,
                  'flexrow-item': true,
                  'is-loading': loading.setPreview
                }"
                @click="setPreview"
                v-if="isPreviews && isCurrentUserManager"
              >
                <image-icon class="icon" />
                <span class="text">
                  {{ $t('tasks.set_preview') }}
                </span>
              </button>
              <span class="error flexrow-item" v-if="errors.setPreview">
                {{ $t('tasks.set_preview_error') }}
              </span>
            </div>
            <div
              class="set-main-preview flexrow-item pull-right"
              v-if="task && task.entity && task.entity.preview_file_id === currentPreviewId">
              <em>{{ $t('tasks.set_preview_done') }}</em>
            </div>
          </div>

          <div class="preview-area mt1">
            <div
              v-if="isPreviews"
            >
              <preview-player
                :previews="currentPreview.previews"
                :task-type-map="taskTypeMap"
                :entity-preview-files="taskEntityPreviews"
                :read-only="isCurrentUserArtist"
                :last-preview-files="lastFivePreviews"
                :task="task"
                :extra-wide="true"
                @annotation-changed="onAnnotationChanged"
                @add-extra-preview="onAddExtraPreviewClicked"
                @remove-extra-preview="onRemoveExtraPreviewClicked"
                @change-current-preview="changeCurrentPreview"
                @time-updated="onTimeUpdated"
                ref="preview-player"
                v-if="currentPreview"
              />
            </div>
          </div>
        </div>
        <div class="flexrow-item block mt1 mr0 info-block">
          <page-subtitle :text="$t('main.info')" />
          <div class="table-body mt1">
            <table class="datatable no-header" v-if="task">
              <tbody class="table-body">
                <tr class="datatable-row">
                  <td class="field-label">{{ $t('tasks.fields.estimation') }}</td>
                  <td>{{ task.estimation }}</td>
                </tr>
                <tr class="datatable-row">
                  <td class="field-label">{{ $t('tasks.fields.duration') }}</td>
                  <td>{{ formatDuration(task.duration) }}</td>
                </tr>
                <tr class="datatable-row">
                  <td class="field-label">{{ $t('tasks.fields.retake_count') }}</td>
                  <td>{{ task.retake_count }}</td>
                </tr>
                <tr class="datatable-row">
                  <td class="field-label">{{ $t('tasks.fields.start_date') }}</td>
                  <td>{{ formatSimpleDate(task.start_date) }}</td>
                </tr>
                <tr class="datatable-row">
                  <td class="field-label">{{ $t('tasks.fields.due_date') }}</td>
                  <td>{{ formatSimpleDate(task.due_date) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="pa2">
        </div>
      </div>

      <div class="task-column comments-column">
        <div v-if="task">
          <div>
            <add-comment
              ref="add-comment"
              :is-error="errors.addComment"
              :is-max-retakes-error="errors.addCommentMaxRetakes"
              :is-loading="loading.addComment"
              :is-movie="isMovie"
              :user="user"
              :team="currentTeam"
              :task="task"
              :task-status="taskStatusForCurrentUser"
              :preview-forms="previewForms"
              :fps="parseInt(currentFps)"
              :time="currentTime"
              :revision="currentRevision"
              @add-comment="addComment"
              @add-preview="onAddPreviewClicked"
              @duplicate-comment="onDuplicateComment"
              @file-drop="selectFile"
              @clear-files="clearPreviewFiles"
              @annotation-snapshots-requested="extractAnnotationSnapshots"
              @remove-preview="onPreviewFormRemoved"
              v-if="isCommentingAllowed"
            />
            <div
              class="comments"
              v-if="taskComments && taskComments.length > 0"
            >
              <comment
                :comment="comment"
                :task="task"
                :highlighted="false"
                :key="comment.id"
                :current-user="user"
                :editable="(
                  comment.person && user.id === comment.person.id ||
                  isCurrentUserAdmin
                )"
                :is-first="index === 0"
                :is-last="index === pinnedCount"
                :is-change="isStatusChange(index)"
                @ack-comment="ackComment"
                @pin-comment="onPinComment"
                @edit-comment="onEditComment"
                @delete-comment="onDeleteComment"
                @checklist-updated="saveComment"
                @time-code-clicked="timeCodeClicked"
                v-for="(comment, index) in taskComments"
              />
            </div>
            <div class="no-comment" v-else>
              <em>
                {{ $t('tasks.no_comment')}}
              </em>
            </div>
          </div>
        </div>

        <div class="has-text-centered" v-else>
          <spinner />
        </div>
      </div>

    </div>

    <add-preview-modal
      ref="add-preview-modal"
      :active="modals.addPreview"
      :is-loading="loading.addPreview"
      :is-error="errors.addPreview"
      :form-data="addPreviewFormData"
      :title="task ? task.entity_name + ' / ' + taskTypeMap.get(task.task_type_id).name : ''"
      @cancel="modals.addPreview = false"
      @fileselected="selectFile"
      @confirm="closeAddPreviewModal"
    />

    <add-preview-modal
      ref="add-extra-preview-modal"
      :active="modals.addExtraPreview"
      :is-loading="loading.addExtraPreview"
      :is-error="errors.addExtraPreview"
      :form-data="addExtraPreviewFormData"
      :title="task ? task.entity_name + ' / ' + taskTypeMap.get(task.task_type_id).name : ''"
      @cancel="hideExtraPreviewModal"
      @fileselected="selectFile"
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
      @cancel="hideRemoveExtraPreviewModal"
      @confirm="confirmDeleteTaskPreview"
    />
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  ImageIcon
} from 'vue-feather-icons'

import { getTaskEntityPath } from '@/lib/path'
import drafts from '@/lib/drafts'
import { formatListMixin } from '@/components/mixins/format'
import { taskMixin } from '@/components/mixins/task'

import AddComment from '@/components/widgets/AddComment'
import AddPreviewModal from '@/components/modals/AddPreviewModal'
import Comment from '@/components/widgets/Comment'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import DeleteModal from '@/components/modals/DeleteModal'
import EditCommentModal from '@/components/modals/EditCommentModal'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PageTitle from '@/components/widgets/PageTitle'
import PageSubtitle from '@/components/widgets/PageSubtitle'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import Spinner from '@/components/widgets/Spinner'
import SubscribeButton from '@/components/widgets/SubscribeButton'
import TaskTypeName from '@/components/widgets/TaskTypeName'
import ValidationTag from '@/components/widgets/ValidationTag'
import PreviewPlayer from '@/components/previews/PreviewPlayer'

export default {
  name: 'task',
  mixins: [formatListMixin, taskMixin],
  components: {
    AddComment,
    AddPreviewModal,
    ComboboxStyled,
    Comment,
    DeleteModal,
    EditCommentModal,
    EntityThumbnail,
    ImageIcon,
    PageSubtitle,
    PageTitle,
    PeopleAvatar,
    PreviewPlayer,
    Spinner,
    SubscribeButton,
    TaskTypeName,
    ValidationTag
  },

  data () {
    return {
      previewForms: [],
      currentTime: 0,
      selectedTab: 'validation',
      taskLoading: {
        isLoading: true,
        isError: false
      },
      modals: {
        addPreview: false,
        addExtraPreview: false,
        deleteExtraPreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      },
      loading: {
        addComment: false,
        addPreview: false,
        addExtraPreview: false,
        setPreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      },
      errors: {
        addComment: false,
        addCommentMaxRetakes: false,
        addPreview: false,
        addExtraPreview: false,
        setPreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      },
      addPreviewFormData: null,
      addExtraPreviewFormData: null,
      task: null,
      taskComments: [],
      taskPreviews: [],
      commentToEdit: null,
      isSubscribed: false,
      selectedPreviewId: null
    }
  },

  created () {
    this.clearSelectedTasks()
  },

  mounted () {
    this.loadTaskData()
      .then(() => {
        this.reset()
      })
    this.$nextTick(() => {
      if (this.$refs['task-columns']) {
        this.$refs['task-columns'].scrollTop = 100
        window.scrollTo(0, 0)
      }
    })
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'displayedShots',
      'displayedAssets',
      'getTaskComments',
      'getTaskPreviews',
      'getTaskComment',
      'isCurrentUserAdmin',
      'isCurrentUserArtist',
      'isCurrentUserSupervisor',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isSingleEpisode',
      'isTVShow',
      'personMap',
      'productionMap',
      'route',
      'taskEntityPreviews',
      'taskStatus',
      'taskStatusForCurrentUser',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    previewOptions () {
      return this.taskPreviews.map(preview => {
        return {
          label: `v${preview.revision}`,
          value: preview.id
        }
      })
    },

    isPreviewButtonVisible () {
      return (
        this.isCurrentUserManager &&
        this.task &&
        this.task.entity &&
        this.task.entity.preview_file_id !== this.currentPreviewId &&
        ['png', 'mp4'].includes(this.extension)
      )
    },

    isMovie () {
      return this.extension === 'mp4'
    },

    extension () {
      return this.currentPreview ? this.currentPreview.extension : ''
    },

    currentPreviewId () {
      return this.currentPreview ? this.currentPreview.id : ''
    },

    currentPreview () {
      if (this.isPreviews) {
        let currentPreview = this.taskPreviews[0]
        const previewId = this.route.params.preview_id
        if (this.selectedPreviewId) {
          currentPreview = this.taskPreviews.find((preview) => {
            return preview.id === previewId
          })
        }
        return currentPreview
      } else {
        return null
      }
    },

    currentFps () {
      return this.productionMap.get(this.task.project_id).fps || '25'
    },

    currentRevision () {
      return this.currentPreview ? this.currentPreview.revision : 0
    },

    isCommentingAllowed () {
      return (
        this.isCurrentUserManager ||
        this.isCurrentUserClient ||
        this.task.assignees.find(
          (personId) => personId === this.user.id
        )
      )
    },

    taskTypeBorder () {
      let border = 'transparent'
      if (this.task) border = this.task.task_type_color
      return {
        'border-left': `4px solid ${border}`
      }
    },

    deleteTaskPath () {
      return this.taskPath(this.task, 'task-delete')
    },

    isPreviews () {
      return this.taskPreviews && this.taskPreviews.length > 0
    },

    taskEntityPath () {
      if (this.task) {
        const episodeId = this.currentEpisode
          ? this.currentEpisode.id
          : this.$route.params.episode_id
        return getTaskEntityPath(this.task, episodeId)
      } else {
        return {
          name: 'open-productions'
        }
      }
    },

    lastFivePreviews () {
      if (this.taskPreviews) {
        return this.taskPreviews.slice(0, 5)
      } else {
        return []
      }
    },

    entityList () {
      const entity = this.displayedShots.find((entity) => {
        return entity.id === this.task.entity_id
      })
      if (entity) {
        return this.displayedShots
      } else {
        return this.displayedAssets
      }
    },

    previousEntity () {
      if (this.task) {
        const taskTypeId = this.task.task_type_id
        const entityIndex = this.entityList.findIndex((entity) => {
          return entity.id === this.task.entity_id
        })
        let firstTraversal = false

        let previousEntityIndex = entityIndex - 1
        if (previousEntityIndex < 0) {
          previousEntityIndex = this.entityList.length - 1
        }

        let taskId = null
        while (!taskId) {
          if (this.entityList[previousEntityIndex]) {
            const entity = this.entityList[previousEntityIndex]
            taskId = entity.tasks.find((ctaskId) => {
              const task = this.taskMap.get(taskId)
              if (task) {
                return task.task_type_id === taskTypeId
              } else {
                return false
              }
            })
          } else {
            taskId = this.task.id
          }

          if (!taskId) {
            previousEntityIndex--
            if (previousEntityIndex < 0) {
              previousEntityIndex = this.entityList.length
              if (firstTraversal) {
                return null
              }
              firstTraversal = true
            }
          }
        }

        return this.taskPath({ id: taskId })
      } else {
        return {
          name: 'open-productions'
        }
      }
    },

    nextEntity () {
      if (this.task) {
        const taskTypeId = this.task.task_type_id
        let firstTraversal = false
        const entityIndex = this.entityList.findIndex((entity) => {
          return entity.id === this.task.entity_id
        })

        let nextEntityIndex = entityIndex + 1
        if (nextEntityIndex >= this.entityList.length) {
          nextEntityIndex = 0
        }

        let taskId = null
        while (!taskId) {
          if (this.entityList[nextEntityIndex]) {
            const entity = this.entityList[nextEntityIndex]
            taskId = entity.tasks.find((ctaskId) => {
              const task = this.taskMap.get(taskId)
              if (task) {
                return task.task_type_id === taskTypeId
              } else {
                return false
              }
            })
          } else {
            taskId = this.task.id
          }

          if (!taskId) {
            nextEntityIndex++
            if (nextEntityIndex >= this.entityList.length) {
              nextEntityIndex = 0

              if (firstTraversal) {
                return null
              }
              firstTraversal = true
            }
          }
        }

        return this.taskPath({ id: taskId })
      } else {
        return {
          name: 'open-productions'
        }
      }
    },

    title () {
      if (this.task) {
        const type = this.task.entity_type_name
        let entityName =
          this.task.full_entity_name || this.task.entity_name
        if (this.isTVShow && type === 'Shot') {
          entityName = entityName
            .split('/')
            .splice(1)
            .join('/')
        }
        return `${entityName}`
      } else {
        return 'Loading...'
      }
    },

    windowTitle () {
      if (this.task) {
        const taskTypeName = this.task.task_type_name
        return `${this.title} / ${taskTypeName}`
      } else {
        return 'Loading...'
      }
    },

    deleteText () {
      if (this.task) {
        const taskType = this.taskTypeMap.get(this.task.task_type_id)
        return this.$t('main.delete_text', {
          name: `${this.task.entity_name} / ${taskType.name}`
        })
      } else {
        return ''
      }
    },

    isAssigned () {
      if (this.task) {
        return this.task.assignees.some((assigneeId) => {
          return assigneeId === this.user.id
        })
      } else {
        return false
      }
    },

    taskType () {
      if (this.task) {
        return this.taskTypeMap.get(this.task.task_type_id)
      } else {
        return null
      }
    },

    currentTeam () {
      return this.currentProduction.team.map(id => this.personMap.get(id))
    },

    pinnedCount () {
      return this.taskComments.filter(c => c.pinned).length
    }
  },

  methods: {
    ...mapActions([
      'addAttachmentToComment',
      'ackComment',
      'addCommentPreview',
      'addCommentExtraPreview',
      'commentTask',
      'commentTaskWithPreview',
      'changeCommentPreview',
      'clearSelectedTasks',
      'deleteAttachment',
      'deleteTask',
      'deleteTaskPreview',
      'deleteTaskComment',
      'editTaskComment',
      'loadEpisodes',
      'loadTask',
      'loadShots',
      'loadAssets',
      'loadPreviewFileFormData',
      'loadTaskComments',
      'loadTaskSubscribed',
      'refreshComment',
      'refreshPreview',
      'pinComment',
      'subscribeToTask',
      'setCurrentEpisode',
      'unsubscribeFromTask',
      'updatePreviewAnnotation'
    ]),

    loadTaskData () {
      const task = this.getCurrentTask()
      if (!task) {
        this.taskLoading = { isLoading: true, isError: false }
        return this.loadTask({ taskId: this.route.params.task_id })
          .then(task => {
            let loadingFunction = (callback) => {
              this.loadAssets()
                .then(callback)
            }

            if (task.entity_type_name === 'Shot') {
              loadingFunction = (callback) => {
                this.loadEpisodes()
                  .then(() => {
                    if (this.isTVShow) {
                      this.setCurrentEpisode(task.episode.id)
                    }
                    this.loadShots(callback)
                  })
                  .catch(callback)
              }
            }
            loadingFunction(() => {
              this.task = task
              return this.loadTaskComments({
                taskId: task.id,
                entityId: task.entity_id
              })
                .then(() => this.loadTaskSubscribed({ taskId: task.id }))
                .then((subscribed) => {
                  this.isSubscribed = subscribed
                  this.reset()
                  this.taskLoading = { isLoading: false, isError: false }
                  return Promise.resolve()
                }).catch((err) => {
                  console.error(err)
                  this.taskLoading = { isLoading: false, isError: true }
                })
            })
          })
      } else {
        const taskId = this.route.params.task_id
        this.task = task
        return this.loadTaskComments({
          taskId, entityId: task.entity_id
        })
          .then(() => this.loadTaskSubscribed({ taskId }))
          .then(subscribed => {
            this.isSubscribed = subscribed
            this.reset()
            return Promise.resolve()
          })
          .catch(err => {
            console.error(err)
            this.taskLoading.isError = true
          })
      }
    },

    getCurrentTask () {
      return this.taskMap.get(this.route.params.task_id)
    },

    getCurrentComment () {
      if (this.route.params.comment_id) {
        return this.getTaskComment(
          this.route.params.task_id,
          this.route.params.comment_id
        )
      }
    },

    getCurrentTaskComments () {
      return this.getTaskComments(this.route.params.task_id)
    },

    getCurrentTaskPreviews () {
      return this.getTaskPreviews(this.route.params.task_id)
    },

    addComment (comment, attachment, checklist, taskStatusId) {
      const params = {
        taskId: this.task.id,
        taskStatusId: taskStatusId,
        comment: comment,
        checklist,
        attachment
      }
      let action = 'commentTask'
      if (this.previewForms.length > 0) action = 'commentTaskWithPreview'
      this.loading.addComment = true
      this.errors.addComment = false
      this.errors.addCommentMaxRetakes = false
      this.$store.dispatch(action, params)
        .then(() => {
          drafts.clearTaskDraft(this.task.id)
          this.reset()
          this.previewForms = []
          this.loading.addComment = false
        })
        .catch((err) => {
          console.error(err)
          this.errors.addComment = true
          this.loading.addComment = false
          const isRetakeError =
            err.response &&
            err.response.body.message &&
            err.response.body.message.indexOf('retake') > 0
          this.errors.addComment = !isRetakeError
          this.errors.addCommentMaxRetakes = isRetakeError
        })
    },

    reset () {
      this.resetModals()
      this.resetPreview()
      this.taskComments = this.getCurrentTaskComments()
      this.taskPreviews = this.getCurrentTaskPreviews()
      this.task = this.getCurrentTask()
      this.resetDraft()
      setTimeout(() => {
        if (this.$route.params.preview_id) {
          this.selectedPreviewId = this.$route.params.preview_id
        }
      }, 1000)
    },

    selectFile (forms) {
      this.loadPreviewFileFormData(forms)
      this.previewForms = this.previewForms.concat(forms)
    },

    clearPreviewFiles () {
      this.previewForms = []
    },

    isHighlighted (comment) {
      return comment.preview && comment.preview.id === this.currentPreviewId
    },

    createExtraPreview () {
      const previews = this.taskPreviews
      const preview = previews.length > 0 ? previews[0] : null
      this.errors.addExtraPreview = false
      this.loading.addExtraPreview = true
      const comment = this.getCurrentTaskComments().find((comment) => {
        return comment.previews.findIndex((p) => p.id === preview.id) >= 0
      })
      this.addCommentExtraPreview({
        taskId: this.task.id,
        previewId: this.currentPreview.id,
        commentId: comment.id
      })
        .then(() => {
          this.loading.addExtraPreview = false
          this.modals.addExtraPreview = false
          this.$refs['add-extra-preview-modal'].reset()
          setTimeout(() => {
            this.$refs['preview-player'].displayLast()
          }, 0)
        })
        .catch((err) => {
          console.error(err)
          this.errors.addExtraPreview = true
          this.loading.addExtraPreview = false
        })
    },

    resetPreview (changeRoute = true) {
      const previews = this.taskPreviews || []
      const preview = previews.length > 0 ? previews[0] : null
      this.taskComments = this.getCurrentTaskComments()
      this.taskPreviews = this.getCurrentTaskPreviews()
      if (preview && changeRoute) {
        this.$router.push(this.previewPath(preview.id))
      }
    },

    setPreview () {
      this.loading.setPreview = true
      this.errors.setPreview = false
      this.$store.dispatch('setPreview', {
        taskId: this.task.id,
        entityId: this.task.entity.id,
        previewId: this.currentPreviewId
      })
        .then(() => {
          this.loading.setPreview = false
        })
        .catch((err) => {
          console.error(err)
          this.errors.setPreview = true
        })
    },

    saveComment (comment, checklist) {
      this.editTaskComment({
        taskId: this.task.id,
        comment,
        checklist
      })
    },

    confirmDeleteTaskComment () {
      this.loading.deleteComment = true
      this.errors.deleteComment = false
      const commentId = this.commentToEdit.id

      this.deleteTaskComment({
        taskId: this.task.id,
        commentId
      })
        .then(() => {
          this.loading.deleteComment = false
          this.reset()
          if (this.isPreviews) this.resetPreview()
          this.modals.deleteComment = false
        })
        .catch(err => {
          console.error(err)
          this.loading.deleteComment = false
          this.errors.deleteComment = true
        })
    },

    confirmDeleteTaskPreview () {
      this.loading.deleteExtraPreview = true
      this.errors.deleteExtraPreview = false
      const previewId = this.currentPreviewId
      const comment = this.getCurrentTaskComments().find((comment) => {
        return comment.previews.findIndex((p) => p.id === previewId) >= 0
      })

      this.$refs['preview-player'].displayFirst()
      this.deleteTaskPreview({
        taskId: this.task.id,
        commentId: comment.id,
        previewId: this.currentExtraPreviewId
      })
        .then(() => {
          this.loading.deleteExtraPreview = false
          this.resetPreview()
          this.hideRemoveExtraPreviewModal()
        })
        .catch((err) => {
          console.error(err)
          this.loading.deleteExtraPreview = false
          this.errors.deleteExtraPreview = true
        })
    },

    onPreviewAdded (eventData) {
      const taskId = eventData.task_id
      const commentId = eventData.comment_id
      const previewId = eventData.preview_file_id
      const revision = eventData.revision
      const extension = eventData.extension
      const comment = this.$store.getters.getTaskComment(taskId, commentId)

      if (
        this.task &&
        comment &&
        (
          comment.previews.length === 0 ||
          comment.previews[0].id !== previewId
        ) &&
        taskId === this.task.id
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
        this.resetPreview()
      }
    },

    toggleSubscribe () {
      if (this.task && !this.isAssigned) {
        if (this.isSubscribed) {
          this.unsubscribeFromTask(this.task.id)
          this.isSubscribed = false
        } else {
          this.subscribeToTask(this.task.id)
          this.isSubscribed = true
        }
      }
    },

    taskPath (task, section = 'task') {
      if (!task) {
        task = this.task
      } else {
        task.project_id = this.task.project_id
        task.episode_id = this.task.episode_id
      }

      let route = { name: 'open-productions' }
      if (task) {
        route = {
          name: section,
          params: {
            production_id: task.project_id,
            task_id: task.id
          }
        }

        if (this.isTVShow && this.currentEpisode) {
          route.name = `episode-${section}`
          route.params.episode_id = task.episode_id || this.currentEpisode.id
        }
      }
      return route
    },

    previewPath (previewId) {
      const route = this.taskPath(this.task, 'task-preview')

      if (route.params) {
        route.params.preview_id = previewId
      }
      return route
    },

    onAnnotationChanged ({ preview, additions, deletions, updates }) {
      const taskId = this.task.id
      this.updatePreviewAnnotation({
        taskId, preview, additions, deletions, updates
      })
    },

    onAddExtraPreviewClicked () {
      this.modals.addExtraPreview = true
    },

    onRemoveExtraPreviewClicked (preview) {
      this.showRemoveExtraPreviewModal(preview)
    },

    hideExtraPreviewModal () {
      this.modals.addExtraPreview = false
    },

    showRemoveExtraPreviewModal (preview) {
      this.currentExtraPreviewId = preview.id
      this.modals.deleteExtraPreview = true
    },

    hideRemoveExtraPreviewModal () {
      this.modals.deleteExtraPreview = false
    },

    onAddPreviewClicked () {
      this.modals.addPreview = true
    },

    closeAddPreviewModal () {
      this.modals.addPreview = false
    },

    onDuplicateComment (comment) {
      this.$refs['add-comment'].setValue(comment)
    },

    onPinComment (comment) {
      this.pinComment(comment)
    },

    onEditComment (comment) {
      this.commentToEdit = comment
      this.modals.editComment = true
    },

    onDeleteComment (comment) {
      this.commentToEdit = comment
      this.modals.deleteComment = true
    },

    onCancelEditComment (comment) {
      this.modals.editComment = false
    },

    onCancelDeleteComment (comment) {
      this.modals.deleteComment = false
    },

    onTimeUpdated (time) {
      this.currentTime = time
    },

    onPreviewFormRemoved (previewForm) {
      this.previewForms = this.previewForms.filter(f => f !== previewForm)
    },

    changeCurrentPreview (preview) {
      this.$router.push(this.previewPath(preview.id))
    },

    onRemoteAcknowledge (eventData, type) {
      if (this.task) {
        const comment = this.taskComments.find(
          c => c.id === eventData.comment_id
        )
        const user = this.personMap.get(eventData.person_id)
        if (comment && user) {
          if (this.user.id === user.id) {
            if (
              (
                type === 'ack' &&
                !comment.acknowledgements.includes(user.id)
              ) ||
              (
                type === 'unack' &&
                comment.acknowledgements.includes(user.id)
              )
            ) {
              this.$store.commit('ACK_COMMENT', { comment, user })
            }
          } else {
            this.$store.commit('ACK_COMMENT', { comment, user })
          }
        }
      }
    },

    isStatusChange (index) {
      const comments = this.taskComments
      const comment = comments[index]
      return (
        index === comments.length - 1 ||
        comment.task_status_id !== comments[index + 1].task_status_id
      )
    },

    timeCodeClicked (
      { versionRevision, minutes, seconds, milliseconds, frame }
    ) {
      this.changeCurrentPreview(this.taskPreviews.find(
        p => p.revision === parseInt(versionRevision)
      ))
      setTimeout(() => {
        this.$refs['preview-player'].setCurrentFrame(frame)
        this.$refs['preview-player'].focus()
      }, 20)
    },

    async extractAnnotationSnapshots () {
      this.$refs['add-comment'].showAnnotationLoading()
      const files =
        await this.$refs['preview-player'].extractAnnotationSnapshots()
      this.$refs['add-comment'].setAnnotationSnapshots(files)
      this.$refs['add-comment'].hideAnnotationLoading()
      return files
    },

    isPreviewPlayerReadOnly () {
      if (this.task) {
        if (this.isCurrentUserManager || this.isCurrentUserClient) {
          return false
        } else if (this.isCurrentUserSupervisor) {
          if (this.user.departments.length === 0) {
            return false
          } else {
            const taskType = this.taskTypeMap.get(this.task.task_type_id)
            return !(taskType.department_id && this.user.departments.includes(
              taskType.department_id))
          }
        }
      }
      return true
    }
  },

  watch: {
    $route () {
      if (this.$route.params.task_id !== this.task.id) {
        this.loadTaskData()
      }
    },

    selectedPreviewId () {
      if (this.task) {
        this.$router.push(this.previewPath(this.selectedPreviewId))
      }
    }
  },

  socket: {
    events: {
      'preview-file:add-file' (eventData) {
        this.onPreviewAdded(eventData)
      },

      'comment:acknowledge' (eventData) {
        this.onRemoteAcknowledge(eventData, 'ack')
      },

      'comment:unacknowledge' (eventData) {
        this.onRemoteAcknowledge(eventData, 'unack')
      },

      'preview-file:update' (eventData) {
        const comment = this.taskComments.find(
          c => (
            c.previews &&
            c.previews.length > 0 &&
            c.previews[0].id === eventData.preview_file_id
          )
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

      'comment:new' (eventData) {
        setTimeout(() => {
          if (
            this.getCurrentTaskComments().length !==
            this.taskComments.length
          ) {
            this.taskComments = this.getCurrentTaskComments()
            this.taskPreviews = this.getCurrentTaskPreviews()
          }
        }, 1000)
      },

      'comment:reply' (eventData) {
        if (this.task) {
          const comment = this.taskComments.find(
            c => c.id === eventData.comment_id
          )
          if (comment) {
            if (!comment.replies) comment.replies = []
            const reply = comment.replies.find(
              r => r.id === eventData.reply_id
            )
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

      'comment:delete' (eventData) {
        const task = this.getTask()
        if (task) {
          const comments = this.getComments()
          const comment = comments.find(
            c => c.id === eventData.comment_id
          )
          if (comment) {
            this.$store.commit('REMOVE_TASK_COMMENT', { task, comment })
            this.taskComments = this.getCurrentTaskComments()
            this.taskPreviews = this.getCurrentTaskPreviews()
          }
        }
      },

      'comment:delete-reply' (eventData) {
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

      'preview-file:annotation-update' (eventData) {
        const previewPlayer = this.$refs['preview-player']
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
              this.taskPreviews = this.getCurrentTaskPreviews()
              this.$nextTick(() => {
                previewPlayer.reloadAnnotations()
                previewPlayer.loadAnnotation()
              })
            }
          })
        }
      }
    }
  },

  metaInfo () {
    let title = 'Loading task... - Kitsu'
    if (this.task) {
      const taskTypeName =
        this.taskTypeMap.get(this.task.task_type_id).name
      title = `${this.title} / ${taskTypeName} - Kitsu`
    }
    return { title }
  }
}
</script>

<style lang="scss" scoped>
.dark .task-information,
.dark .add-comment,
.dark .comment,
.dark .no-comment,
.dark .column {
  background: #46494F;
  border-color: $dark-grey;
  box-shadow: 0px 0px 6px #333;
}

h2.subtitle {
  border: 0;
  margin: 0;
  padding: 0;
}

.page {
  background: #F9F9F9;
  margin-top: 60px;
  padding: 0;
}

.page.column {
  background: var(--background-page);
  padding-bottom: 1em;
}

.page-header {
  margin: 1em 1em 0 1em;
}

.navigation-buttons {
  font-size: 1em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.navigation-buttons .arrow {
  font-size: 1.2em;
  font-weight: bold;
}

.navigation-buttons a {
  color: $grey;
}

.selected {
  border: 0;
}

.source {
  color: #AAA;
  font-size: 0.8em;
}

video {
  width: 100%;
}

.validation-buttons button {
  width: 100%;
  margin-bottom: 0.3em;
  border-width: 2px;
  font-weight: bold;
}

.preview-row {
  margin-bottom: 0.5em;
}

.add-comment {
  margin-bottom: 1em;
  padding: 1em;
  box-shadow: 0px 0px 6px #E0E0E0;
}

.no-comment {
  background: white;
  box-shadow: 0px 0px 6px #E0E0E0;
  padding: 1em;
  border-radius: 5px;
}

.comment {
  box-shadow: 0px 0px 6px #E0E0E0;
  margin-top: 0.3em;
}

.task-columns {
  display: flex;
  flex: 1;
  flex-direction: row;
}

.task-column {
  padding: 1em;
}

.comments-column {
  flex: 1;
}

.preview-column {
  overflow: auto;
  flex: 2;
}

.preview-column-content {
  overflow-x: hidden;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
}

.page-header .tag {
  border-radius: 0;
  font-weight: bold;
  margin-right: 0.5em;
}

.assignees {
  display: flex;
}

.assignees span {
  margin-right: 0.2em;
}

.avatar-wrapper {
  margin-right: 0.5em;
}

.entity-thumbnail {
  margin-right: 0.3em;
}

.title {
  margin: 0;
  flex: 1;
}

.pull-right {
  margin-left: auto;
}

.title a {
  color: inherit;
}

.set-main-preview {
  height: 30px;
}

.back-link {
  padding-top: 6px;
}

.main-column {
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 60px);
}

.task-columns {
  display: flex;
  max-height: 100%;
  overflow: hidden;
}

.task-column {
  overflow-y: auto;
}

.info-block {
  margin-right: 0;
}

.task-type.block {
  margin-bottom: 0;
}

.entity-thumbnail {
  margin-top: 5px;
}

.field-label {
  width: 130px;
  max-width: 130px;
}

@media screen and (max-width: 768px) {
  .action-button {
    display: none;
  }

  .title {
    font-size: 1.3em;
    line-height: 1.5em;
  }

  .header-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-title .flexrow-item {
    margin-bottom: 0.5em;
  }

  .task-column {
    width: 100%;
    overflow-y: initial;
  }
}
</style>
