<template>
  <div class="fixed-page columns">
  <div class="page column main-column">
    <div class="page-header pa1">
      <div
        class="flexrow header-title"
        v-if="currentTask"
      >
        <task-type-name
          class="flexrow-item task-type block"
          :task-type="currentTaskType"
          :production-id="currentProduction.id"
          v-if="currentTaskType"
        />
        <span
          class="flexrow-item ml2"
        >
          <entity-thumbnail
            class="entity-thumbnail"
            :entity="currentTaskPreviews && currentTaskPreviews.length > 0
              ? { preview_file_id: currentTaskPreviews[0].id }
              : { }"
            :empty-width="100"
            :empty-height="60"
            :width="100"
            :with-link="false"
          />
        </span>
        <div class="title flexrow-item">
          <router-link :to="taskEntityPath">
            <page-title :text="currentTask ? title : 'Loading...'" bold />
          </router-link>
        </div>
        <div class="filler">
        </div>
        <div class="has-text-right block">
          {{ $t('tasks.fields.priority') }}:
          {{ formatPriority(currentTask.priority) }}
        </div>
      </div>

      <div
        class="flexrow block mt1 mb1"
        v-if="currentTask"
      >
        <span class="flexrow-item">{{ $t('tasks.current_status') }}</span>
        <validation-tag
          class="is-medium flexrow-item"
          :task="currentTask"
          :is-static="true"
          v-if="currentTask"
        />
        <span
          class="flexrow-item"
          v-if="currentTask.assignees.length > 0"
        >
          {{ $t('tasks.fields.assignees') }}:
        </span>
        <span
          class="flexrow-item avatar-wrapper"
          :key="personId"
          v-for="personId in currentTask.assignees"
        >
          <people-avatar
            class="flexrow-item"
            :key="personId"
            :person="personMap.get(personId)"
            :size="30"
            :font-size="16"
          />
       </span>
       <div class="filler"></div>
       <subscribe-button
         class="flexrow-item action-button"
         :subscribed="isAssigned || isSubscribed"
         @click="toggleSubscribe"
         v-if="!isAssigned"
       />
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
              v-if="currentTask && currentTask.entity && currentTask.entity.preview_file_id === currentPreviewId">
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
                :task="currentTask"
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
            <table class="datatable" v-if="currentTask">
              <tbody class="table-body">
                <tr class="datatable-row">
                  <td class="field-label">{{ $t('tasks.fields.estimation') }}</td>
                  <td>{{ currentTask.estimation }}</td>
                </tr>
                <tr class="datatable-row">
                  <td class="field-label">{{ $t('tasks.fields.duration') }}</td>
                  <td>{{ formatDuration(currentTask.duration) }}</td>
                </tr>
                <tr class="datatable-row">
                  <td class="field-label">{{ $t('tasks.fields.retake_count') }}</td>
                  <td>{{ currentTask.retake_count }}</td>
                </tr>
                <tr class="datatable-row">
                  <td class="field-label">{{ $t('tasks.fields.start_date') }}</td>
                  <td>{{ formatSimpleDate(currentTask.start_date) }}</td>
                </tr>
                <tr class="datatable-row">
                  <td class="field-label">{{ $t('tasks.fields.due_date') }}</td>
                  <td>{{ formatSimpleDate(currentTask.due_date) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="pa2">
        </div>
      </div>

      <div class="task-column comments-column">
        <div v-if="currentTask">
          <div>
            <add-comment
              ref="add-comment"
              :is-error="errors.addComment"
              :is-loading="loading.addComment"
              :is-movie="isMovie"
              :user="user"
              :team="currentTeam"
              :task="currentTask"
              :task-status="taskStatusForCurrentUser"
              :attached-file-name="attachedFileName"
              :fps="parseInt(currentFps)"
              :time="currentTime"
              :revision="currentRevision"
              @add-comment="addComment"
              @add-preview="onAddPreviewClicked"
              @duplicate-comment="onDuplicateComment"
              @file-drop="selectFile"
              @annotation-snapshots-requested="extractAnnotationSnapshots"
              v-if="isCommentingAllowed"
            />
            <div
              class="comments"
              v-if="currentTaskComments && currentTaskComments.length > 0"
            >
              <comment
                :comment="comment"
                :task="currentTask"
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
                v-for="(comment, index) in currentTaskComments"
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
import { formatListMixin } from '@/components/mixins/format'

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
  mixins: [formatListMixin],
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
      attachedFileName: '',
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
        addPreview: false,
        addExtraPreview: false,
        setPreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      },
      addPreviewFormData: null,
      addExtraPreviewFormData: null,
      currentTask: null,
      currentTaskComments: [],
      currentTaskPreviews: [],
      commentToEdit: null,
      isSubscribed: false,
      selectedPreviewId: null
    }
  },

  created () {
    this.clearSelectedTasks()
    this.loadTaskData()
  },

  mounted () {
    this.reset()
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
      return this.currentTaskPreviews.map(preview => {
        return {
          label: `v${preview.revision}`,
          value: preview.id
        }
      })
    },

    isPreviewButtonVisible () {
      return (
        this.isCurrentUserManager &&
        this.currentTask &&
        this.currentTask.entity &&
        this.currentTask.entity.preview_file_id !== this.currentPreviewId &&
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
        let currentPreview = this.currentTaskPreviews[0]
        const previewId = this.route.params.preview_id
        if (this.selectedPreviewId) {
          currentPreview = this.currentTaskPreviews.find((preview) => {
            return preview.id === previewId
          })
        }
        return currentPreview
      } else {
        return null
      }
    },

    currentFps () {
      return this.productionMap.get(this.currentTask.project_id).fps || '25'
    },

    currentRevision () {
      return this.currentPreview ? this.currentPreview.revision : 0
    },

    isCommentingAllowed () {
      return (
        this.isCurrentUserManager ||
        this.isCurrentUserClient ||
        this.currentTask.assignees.find(
          (personId) => personId === this.user.id
        )
      )
    },

    taskTypeBorder () {
      let border = 'transparent'
      if (this.currentTask) border = this.currentTask.task_type_color
      return {
        'border-left': `4px solid ${border}`
      }
    },

    deleteTaskPath () {
      return this.taskPath(this.currentTask, 'task-delete')
    },

    isPreviews () {
      return this.currentTaskPreviews && this.currentTaskPreviews.length > 0
    },

    taskEntityPath () {
      if (this.currentTask) {
        const episodeId = this.currentEpisode
          ? this.currentEpisode.id
          : this.$route.params.episode_id
        return getTaskEntityPath(this.currentTask, episodeId)
      } else {
        return {
          name: 'open-productions'
        }
      }
    },

    lastFivePreviews () {
      if (this.currentTaskPreviews) {
        return this.currentTaskPreviews.slice(0, 5)
      } else {
        return []
      }
    },

    entityList () {
      const entity = this.displayedShots.find((entity) => {
        return entity.id === this.currentTask.entity_id
      })
      if (entity) {
        return this.displayedShots
      } else {
        return this.displayedAssets
      }
    },

    previousEntity () {
      if (this.currentTask) {
        const taskTypeId = this.currentTask.task_type_id
        const entityIndex = this.entityList.findIndex((entity) => {
          return entity.id === this.currentTask.entity_id
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
            taskId = this.currentTask.id
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
      if (this.currentTask) {
        const taskTypeId = this.currentTask.task_type_id
        let firstTraversal = false
        const entityIndex = this.entityList.findIndex((entity) => {
          return entity.id === this.currentTask.entity_id
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
            taskId = this.currentTask.id
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

    previewPlayer () {
      return this.$refs['preview-player']
    },

    title () {
      if (this.currentTask) {
        const type = this.currentTask.entity_type_name
        let entityName =
          this.currentTask.full_entity_name || this.currentTask.entity_name
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
      if (this.currentTask) {
        const taskTypeName = this.currentTask.task_type_name
        return `${this.title} / ${taskTypeName}`
      } else {
        return 'Loading...'
      }
    },

    deleteText () {
      if (this.currentTask) {
        const taskType = this.taskTypeMap.get(this.currentTask.task_type_id)
        return this.$t('main.delete_text', {
          name: `${this.currentTask.entity_name} / ${taskType.name}`
        })
      } else {
        return ''
      }
    },

    isAssigned () {
      if (this.currentTask) {
        return this.currentTask.assignees.some((assigneeId) => {
          return assigneeId === this.user.id
        })
      } else {
        return false
      }
    },

    currentTaskType () {
      if (this.currentTask) {
        return this.taskTypeMap.get(this.currentTask.task_type_id)
      } else {
        return null
      }
    },

    currentTeam () {
      return this.currentProduction.team.map(id => this.personMap.get(id))
    },

    pinnedCount () {
      return this.currentTaskComments.filter(c => c.pinned).length
    }
  },

  methods: {
    ...mapActions([
      'ackComment',
      'addCommentPreview',
      'addCommentExtraPreview',
      'commentTask',
      'commentTaskWithPreview',
      'changeCommentPreview',
      'clearSelectedTasks',
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
        this.loadTask({ taskId: this.route.params.task_id })
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
              this.currentTask = task
              this.loadTaskComments({
                taskId: task.id,
                entityId: task.entity_id
              })
                .then(() => this.loadTaskSubscribed({ taskId: task.id }))
                .then((subscribed) => {
                  this.isSubscribed = subscribed
                  this.reset()
                  this.taskLoading = { isLoading: false, isError: false }
                }).catch((err) => {
                  console.error(err)
                  this.taskLoading = { isLoading: false, isError: true }
                })
            })
          })
      } else {
        const taskId = this.route.params.task_id
        this.currentTask = task
        this.loadTaskComments({ taskId, entityId: task.entity_id })
          .then(() => this.loadTaskSubscribed({ taskId }))
          .then(subscribed => {
            this.isSubscribed = subscribed
            this.reset()
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
        taskId: this.currentTask.id,
        taskStatusId: taskStatusId,
        comment: comment,
        checklist,
        attachment
      }
      let action = 'commentTask'
      if (this.attachedFileName) action = 'commentTaskWithPreview'
      this.loading.addComment = true
      this.errors.addComment = false
      this.$store.dispatch(action, params)
        .then(() => {
          this.currentTaskPreviews = this.getCurrentTaskPreviews()
          this.resetPreview()
          this.$refs['add-preview-modal'].reset()
          this.reset()
          this.attachedFileName = ''
          this.loading.addComment = false
        })
        .catch((err) => {
          console.error(err)
          this.errors.addComment = true
          this.loading.addComment = false
        })
    },

    reset () {
      this.currentTaskComments = this.getCurrentTaskComments()
      this.currentTaskPreviews = this.getCurrentTaskPreviews()
      this.currentTask = this.getCurrentTask()
      setTimeout(() => {
        if (this.$route.params.preview_id) {
          this.selectedPreviewId = this.$route.params.preview_id
        }
      }, 1000)
    },

    selectFile (forms) {
      this.loadPreviewFileFormData(forms)
      this.attachedFileName = forms
        .map((form) => form.get('file').name)
        .join(', ')
    },

    isHighlighted (comment) {
      return comment.preview && comment.preview.id === this.currentPreviewId
    },

    createExtraPreview () {
      const previews = this.currentTaskPreviews
      const preview = previews.length > 0 ? previews[0] : null
      this.errors.addExtraPreview = false
      this.loading.addExtraPreview = true
      const comment = this.getCurrentTaskComments().find((comment) => {
        return comment.previews.findIndex((p) => p.id === preview.id) >= 0
      })
      this.addCommentExtraPreview({
        taskId: this.currentTask.id,
        previewId: this.currentPreview.id,
        commentId: comment.id
      })
        .then(() => {
          this.loading.addExtraPreview = false
          this.modals.addExtraPreview = false
          this.$refs['add-extra-preview-modal'].reset()
          setTimeout(() => {
            this.previewPlayer.displayLast()
          }, 0)
        })
        .catch((err) => {
          console.error(err)
          this.errors.addExtraPreview = true
          this.loading.addExtraPreview = false
        })
    },

    resetPreview (changeRoute = true) {
      const previews = this.currentTaskPreviews
      const preview = previews.length > 0 ? previews[0] : null
      this.currentTaskComments = this.getCurrentTaskComments()
      this.currentTaskPreviews = this.getCurrentTaskPreviews()
      if (preview && changeRoute) {
        this.$router.push(this.previewPath(preview.id))
      }
    },

    setPreview () {
      this.loading.setPreview = true
      this.errors.setPreview = false
      this.$store.dispatch('setPreview', {
        taskId: this.currentTask.id,
        entityId: this.currentTask.entity.id,
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

    confirmEditTaskComment (comment) {
      this.loading.editComment = true
      this.errors.editComment = false
      this.editTaskComment({
        taskId: this.currentTask.id,
        comment
      })
        .then(() => {
          this.loading.editComment = false
          this.modals.editComment = false
        })
        .catch(err => {
          console.error(err)
          this.errors.editComment = true
        })
    },

    saveComment (comment, checklist) {
      this.editTaskComment({
        taskId: this.currentTask.id,
        comment,
        checklist
      })
    },

    confirmDeleteTaskComment () {
      this.loading.deleteComment = true
      this.errors.deleteComment = false
      const commentId = this.commentToEdit.id

      this.deleteTaskComment({
        taskId: this.currentTask.id,
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

      this.previewPlayer.displayFirst()
      this.deleteTaskPreview({
        taskId: this.currentTask.id,
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
        this.currentTask &&
        comment &&
        (
          comment.previews.length === 0 ||
          comment.previews[0].id !== previewId
        ) &&
        taskId === this.currentTask.id
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
      if (this.currentTask && !this.isAssigned) {
        if (this.isSubscribed) {
          this.unsubscribeFromTask(this.currentTask.id)
          this.isSubscribed = false
        } else {
          this.subscribeToTask(this.currentTask.id)
          this.isSubscribed = true
        }
      }
    },

    taskPath (task, section = 'task') {
      if (!task) {
        task = this.currentTask
      } else {
        task.project_id = this.currentTask.project_id
        task.episode_id = this.currentTask.episode_id
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
      const route = this.taskPath(this.currentTask, 'task-preview')

      if (route.params) {
        route.params.preview_id = previewId
      }
      return route
    },

    onAnnotationChanged ({ preview, additions, deletions, updates }) {
      const taskId = this.currentTask.id
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

    changeCurrentPreview (preview) {
      this.$router.push(this.previewPath(preview.id))
    },

    onRemoteAcknowledge (eventData, type) {
      if (this.currentTask) {
        const comment = this.currentTaskComments.find(
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
      const comments = this.currentTaskComments
      const comment = comments[index]
      return (
        index === comments.length - 1 ||
        comment.task_status_id !== comments[index + 1].task_status_id
      )
    },

    timeCodeClicked (
      { versionRevision, minutes, seconds, milliseconds, frame }
    ) {
      this.changeCurrentPreview(this.currentTaskPreviews.find(
        p => p.revision === parseInt(versionRevision)
      ))
      setTimeout(() => {
        this.previewPlayer.setCurrentFrame(frame - 1)
        this.previewPlayer.focus()
      }, 20)
    },

    async extractAnnotationSnapshots () {
      this.$refs['add-comment'].showAnnotationLoading()
      const files = await this.previewPlayer.extractAnnotationSnapshots()
      this.$refs['add-comment'].setAnnotationSnapshots(files)
      this.$refs['add-comment'].hideAnnotationLoading()
      return files
    }
  },

  watch: {
    $route () {
      if (this.$route.params.task_id !== this.currentTask.id) {
        this.loadTaskData()
      }
    },

    selectedPreviewId () {
      if (this.currentTask) {
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
        const comment = this.currentTaskComments.find(
          c => (
            c.previews &&
            c.previews.length > 0 &&
            c.previews[0].id === eventData.preview_file_id
          )
        )
        if (comment && this.currentTask) {
          this.refreshPreview({
            taskId: this.currentTask.id,
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
            this.currentTaskComments.length
          ) {
            this.currentTaskComments = this.getCurrentTaskComments()
            this.currentTaskPreviews = this.getCurrentTaskPreviews()
          }
        }, 1000)
      },

      'comment:reply' (eventData) {
        if (this.currentTask) {
          const comment = this.currentTaskComments.find(
            c => c.id === eventData.comment_id
          )
          if (comment) {
            if (!comment.replies) comment.replies = []
            const reply = comment.replies.find(
              r => r.id === eventData.reply_id
            )
            if (!reply) {
              this.refreshComment({
                taskId: this.currentTask.id,
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

      'comment:delete-reply' (eventData) {
        if (this.currentTask) {
          const comment = this.currentTaskComments.find(
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
      }
    }
  },

  metaInfo () {
    let title = 'Loading task... - Kitsu'
    if (this.currentTask) {
      const taskTypeName =
        this.taskTypeMap.get(this.currentTask.task_type_id).name
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
