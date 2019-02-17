<template>
  <div class="page fixed-page">
    <div class="page-header">
      <div
        class="flexrow header-title"
        v-if="currentTask"
      >
        <router-link
          :to="entityPage"
          class="flexrow-item has-text-centered back-link"
        >
          <chevron-left-icon />
        </router-link>
        <div class="title flexrow-item">
          <router-link :to="taskEntityPath">
            {{ currentTask ? title : 'Loading...'}}
          </router-link>
        </div>
        <task-type-name
          class="flexrow-item task-type"
          :task-type="currentTaskType"
          :production-id="currentProduction.id"
          v-if="currentTaskType"
        />
        <subscribe-button
          class="flexrow-item action-button"
          :subscribed="isAssigned || isSubscribed"
          @click="toggleSubscribe"
          v-if="!isAssigned"
        />
      </div>

      <div
        class="flexrow task-information"
        v-if="currentTask"
      >
        <span class="flexrow-item">{{ $t('tasks.current_status') }}</span>
        <validation-tag
          class="is-medium flexrow-item"
          :task="currentTask"
          :is-static="true"
          v-if="currentTask"
        />
        <span class="flexrow-item">{{ $t('tasks.fields.assignees') }}:</span>
        <span
          class="flexrow-item avatar-wrapper"
          :key="personId"
          v-for="personId in currentTask.assignees"
        >
          <people-avatar
            class="flexrow-item"
            :key="personId"
            :person="personMap[personId]"
            :size="30"
            :font-size="16"
          />
       </span>
      </div>
    </div>

    <div class="task-columns" ref="task-columns">
      <div class="task-column comments-column">
        <div v-if="currentTask">
          <div>
            <add-comment
              :is-loading="loading.addComment"
              :is-error="errors.addComment"
              :user="user"
              :task="currentTask"
              :taskStatusOptions="taskStatusOptionsForCurrentUser"
              :attached-file-name="attachedFileName"
              @add-comment="addComment"
              @add-preview="onAddPreviewClicked"
              v-if="isCommentingAllowed"
            />
            <div class="comments" v-if="currentTaskComments && currentTaskComments.length > 0">
              <comment
                :comment="comment"
                :highlighted="isHighlighted(comment)"
                :key="comment.id"
                :current-user="user"
                :editable="comment.person && user.id === comment.person.id && index === 0"
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

      <div class="task-column preview-column">
        <div class="preview-column-content">
          <div class="flexrow preview-header">
            <h2 class="subtitle flexrow-item">
              {{ $t('tasks.preview') }}
            </h2>
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
                v-if="currentTaskPreviews && currentTaskPreviews.length > 0 && isCurrentUserManager"
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

          <div
            class="preview-list mt2"
            v-if="isPreviews"
          >
            <preview-row
              :key="preview.id"
              :preview="preview"
              :preview-path="previewPath(preview.id)"
              :taskId="currentTask ? currentTask.id : ''"
              :selected="preview.id === currentPreviewId"
              v-for="preview in currentTaskPreviews"
            />
          </div>
          <div v-else>
            <em>
              {{ $t('tasks.no_preview')}}
            </em>
          </div>

          <div class="preview-picture">
            <div
              v-if="currentTaskPreviews && currentTaskPreviews.length > 0 && isMovie"
            >
              <video-player
                :preview="currentPreview"
                :task-type-map="taskTypeMap"
                :entity-preview-files="taskEntityPreviews"
                @annotationchanged="onAnnotationChanged"
                ref="preview-movie"
              />
            </div>

            <a
              class="button mt2"
              ref="preview-file"
              :href="currentPreviewDlPath"
              v-else-if="isDlPreviewFile"
            >
              <download-icon class="icon" />
              <span class="text">
                {{ $t('tasks.download_pdf_file', {extension}) }}
              </span>
            </a>

            <model-viewer
              :preview-url="currentPreviewPath"
              :preview-dl-path="currentPreviewDlPath"
              v-else-if="currentTaskPreviews && currentTaskPreviews.length > 0 && extension === 'obj'"
            />

            <picture-viewer
              :preview="currentPreview"
              @annotation-changed="onAnnotationChanged"
              @add-preview="onAddExtraPreview"
              @remove-extra-preview="showRemoveExtraPreviewModal"
              ref="preview-picture"
              v-else-if="currentTaskPreviews && currentTaskPreviews.length > 0 && extension === 'png'"
            />
          </div>
        </div>
      </div>
    </div>

    <add-preview-modal
      ref="add-preview-modal"
      :active="modals.addPreview"
      :is-loading="loading.addPreview"
      :is-error="errors.addPreview"
      :cancel-route="taskPath()"
      :form-data="addPreviewFormData"
      @fileselected="selectFile"
      @confirm="closeAddPreviewModal"
    />

    <add-preview-modal
      ref="add-extra-preview-modal"
      :active="modals.addExtraPreview"
      :is-loading="loading.addExtraPreview"
      :is-error="errors.addExtraPreview"
      :form-data="addExtraPreviewFormData"
      extensions=".png,.jpg"
      @cancel="hideExtraPreviewModal"
      @fileselected="selectFile"
      @confirm="createExtraPreview"
    />

    <add-preview-modal
      ref="change-preview-modal"
      :active="modals.changePreview"
      :is-loading="loading.changePreview"
      :is-error="errors.changePreview"
      :cancel-route="taskPath()"
      :form-data="changePreviewFormData"
      :is-editing="true"
      @fileselected="selectFile"
      @confirm="changePreview"
    />

    <edit-comment-modal
      :active="modals.editComment"
      :is-loading="loading.editComment"
      :is-error="errors.editComment"
      :cancel-route="taskPath()"
      :comment-to-edit="commentToEdit"
      @confirm="confirmEditTaskComment"
    />

    <delete-modal
      :active="modals.deleteComment"
      :is-loading="loading.deleteComment"
      :is-error="errors.deleteComment"
      :cancel-route="taskPath()"
      :text="$t('tasks.delete_comment')"
      :error-text="$t('tasks.delete_comment_error')"
      @confirm="confirmDeleteTaskComment"
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
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  ChevronLeftIcon,
  DownloadIcon,
  ImageIcon
} from 'vue-feather-icons'

import AddComment from './widgets/AddComment'
import AddPreviewModal from './modals/AddPreviewModal'
import ButtonLink from './widgets/ButtonLink'
import Comment from './widgets/Comment'
import DeleteModal from './widgets/DeleteModal'
import EditCommentModal from './modals/EditCommentModal'
import EntityThumbnail from './widgets/EntityThumbnail'
import ModelViewer from './previews/ModelViewer'
import PeopleAvatar from './widgets/PeopleAvatar'
import PeopleName from './widgets/PeopleName'
import PictureViewer from './previews/PictureViewer'
import PreviewRow from './widgets/PreviewRow'
import Spinner from './widgets/Spinner'
import SubscribeButton from './widgets/SubscribeButton'
import TaskTypeName from './widgets/TaskTypeName'
import ValidationTag from './widgets/ValidationTag'
import VideoPlayer from './previews/VideoPlayer'

export default {
  name: 'task',
  components: {
    AddComment,
    AddPreviewModal,
    ButtonLink,
    Comment,
    ChevronLeftIcon,
    DeleteModal,
    DownloadIcon,
    EntityThumbnail,
    EditCommentModal,
    ImageIcon,
    ModelViewer,
    PeopleAvatar,
    PeopleName,
    PreviewRow,
    PictureViewer,
    Spinner,
    SubscribeButton,
    TaskTypeName,
    ValidationTag,
    VideoPlayer
  },

  data () {
    return {
      attachedFileName: '',
      currentPreviewId: null,
      currentExtraPreviewId: null,
      entityPage: this.getEntityPage(),
      selectedTab: 'validation',
      taskLoading: {
        isLoading: true,
        isError: false
      },
      modals: {
        addPreview: false,
        addExtraPreview: false,
        deleteExtraPreview: false,
        changePreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      },
      loading: {
        addComment: false,
        addPreview: false,
        addExtraPreview: false,
        changePreview: false,
        setPreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      },
      errors: {
        addComment: false,
        addPreview: false,
        addExtraPreview: false,
        changePreview: false,
        setPreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      },
      currentTask: null,
      currentTaskComments: [],
      currentTaskPreviews: [],
      otherPreviews: [],
      addPreviewFormData: null,
      addExtraPreviewFormData: null,
      changePreviewFormData: null,
      isSubscribed: false,
      currentPreviewPath: '',
      currentPreviewDlPath: ''
    }
  },

  created () {
    this.clearSelectedTasks()
    this.loadTaskData()
  },

  mounted () {
    this.handleModalsDisplay()
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
      'isCurrentUserManager',
      'isSingleEpisode',
      'isTVShow',
      'personMap',
      'productionMap',
      'route',
      'taskEntityPreviews',
      'taskStatusOptions',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    isCommentingAllowed () {
      return this.isCurrentUserManager || this.currentTask.assignees.find(
        (personId) => personId === this.user.id
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

    commentToEdit () {
      let commentToEdit = {}
      if (this.currentTask && this.currentTaskComments && this.currentTaskComments.length > 0) {
        commentToEdit = this.currentTaskComments[0]
      }
      return commentToEdit
    },

    isPreviews () {
      return this.currentTaskPreviews && this.currentTaskPreviews.length > 0
    },

    taskEntityPath () {
      if (this.currentTask) {
        const type = this.currentTask.entity_type_name
        let entityId = ''
        if (this.currentTask.entity) {
          entityId = this.currentTask.entity.id
        } else {
          entityId = this.currentTask.entity_id
        }

        let route = {
          name: type === 'Shot' ? 'shot' : 'asset',
          params: {
            production_id: this.currentTask.project_id
          }
        }

        if (type === 'Shot') {
          route.params.shot_id = entityId
        } else {
          route.params.asset_id = entityId
        }

        if (this.$route.params.episode_id) {
          route.name = `episode-${route.name}`
          route.params.episode_id = this.$route.params.episode_id
        }

        return route
      } else {
        return {
          name: 'open-productions'
        }
      }
    },

    entityList () {
      let entity = this.displayedShots.find((entity) => {
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
        let entityIndex = this.entityList.findIndex((entity) => {
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
              const task = this.taskMap[ctaskId]
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

        return this.taskPath({id: taskId})
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
        let entityIndex = this.entityList.findIndex((entity) => {
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
              const task = this.taskMap[ctaskId]
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

        return this.taskPath({id: taskId})
      } else {
        return {
          name: 'open-productions'
        }
      }
    },

    title () {
      if (this.currentTask) {
        const type = this.currentTask.entity_type_name
        let entityName =
          this.currentTask.full_entity_name || this.currentTask.entity_name
        if (this.isSingleEpisode && type === 'Shot') {
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
        const taskType = this.taskTypeMap[this.currentTask.task_type_id]
        return this.$t('main.delete_text', {
          name: `${this.currentTask.entity_name} / ${taskType.name}`
        })
      } else {
        return ''
      }
    },

    isMovie () {
      if (this.currentTaskPreviews) {
        let previewId = this.route.params.preview_id
        let currentPreview = this.currentTaskPreviews[0]
        if (previewId) {
          currentPreview = this.currentTaskPreviews.find((preview) => {
            return preview.id === previewId
          })
        }
        return currentPreview && currentPreview.extension === 'mp4'
      } else {
        return false
      }
    },

    extension () {
      if (this.currentTaskPreviews) {
        let previewId = this.route.params.preview_id
        let currentPreview = this.currentTaskPreviews[0]
        if (previewId) {
          currentPreview = this.currentTaskPreviews.find((preview) => {
            return preview.id === previewId
          })
        }
        return currentPreview ? currentPreview.extension : ''
      } else {
        return ''
      }
    },

    moviePath () {
      let previewId = this.route.params.preview_id
      if (!previewId && this.currentTaskPreviews) {
        previewId = this.currentTaskPreviews[0].id
      }
      return `/api/movies/originals/preview-files/${previewId}.mp4`
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

    isPreviewButtonVisible () {
      return (
        this.currentTask &&
        this.currentTask.entity &&
        this.currentTask.entity.preview_file_id !== this.currentPreviewId &&
        ['png', 'mp4'].includes(this.extension)
      )
    },

    isDlPreviewFile () {
      return this.currentTaskPreviews &&
        ['pdf', 'ma', 'mb', 'rar', 'zip'].includes(this.extension)
    },

    currentTaskType () {
      if (this.currentTask) {
        return this.taskTypeMap[this.currentTask.task_type_id]
      } else {
        return null
      }
    },

    currentPreview () {
      let currentPreview = this.currentTaskPreviews[0]
      let previewId = this.route.params.preview_id
      if (previewId) {
        currentPreview = this.currentTaskPreviews.find((preview) => {
          return preview.id === previewId
        })
      }
      return currentPreview
    },

    taskStatusOptionsForCurrentUser () {
      if (this.isCurrentUserManager) {
        return this.taskStatusOptions
      } else {
        return this.taskStatusOptions.filter(status => status.isArtistAllowed)
      }
    }
  },

  methods: {
    ...mapActions([
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
      'refreshPreview',
      'subscribeToTask',
      'setCurrentEpisode',
      'unsubscribeFromTask',
      'updatePreviewAnnotation'
    ]),

    getEntityPage () {
      if (this.currentTask) {
        let route = {
          name: this.$route.params.type,
          params: {production_id: this.currentTask.project_id}
        }

        if (route.name === 'asset') {
          route.params.asset_id = this.currentTask.entity_id
        } else {
          route.params.shot_id = this.currentTask.entity_id
        }

        if (this.isTVShow) {
          route.name = `episode-${route.name}`
          route.params.episode_id =
            this.currentEpisode ? this.currentEpisode.id : this.$route.params.episode_id
        }
        return route
      } else {
        return {
          name: 'open-productions'
        }
      }
    },

    loadTaskData () {
      let task = this.getCurrentTask()
      if (!task) {
        this.taskLoading = {
          isLoading: true,
          isError: false
        }

        this.loadTask({
          taskId: this.route.params.task_id,
          callback: (err, task) => {
            if (err) console.log(err)

            let loadingFunction = this.loadAssets

            if (task.entity_type_name === 'Shot') {
              loadingFunction = (callback) => {
                this.loadEpisodes(() => {
                  if (this.isTVShow) {
                    this.setCurrentEpisode(task.episode.id)
                  }
                  this.loadShots(callback)
                })
              }
            }
            loadingFunction(() => {
              this.currentTask = task
              this.loadTaskComments({
                taskId: task.id,
                entityId: task.entity_id,
                callback: (err) => {
                  if (err) {
                    this.taskLoading = {
                      isLoading: false,
                      isError: true
                    }
                  } else {
                    this.reset()
                    this.entityPage = this.getEntityPage()
                    this.taskLoading = {
                      isLoading: false,
                      isError: false
                    }
                    this.loadTaskSubscribed({
                      taskId: this.route.params.task_id,
                      callback: (err, subscribed) => {
                        if (err) console.log(err)
                        this.isSubscribed = subscribed
                      }
                    })
                  }
                }
              })
            })
          }
        })
      } else {
        this.currentTask = task
        this.loadTaskComments({
          taskId: this.route.params.task_id,
          entityId: task.entity_id,
          callback: (err) => {
            if (err) {
            } else {
              this.currentTaskComments = this.getCurrentTaskComments()
              this.currentTaskPreviews = this.getCurrentTaskPreviews()
              this.setOtherPreviews()
              this.currentPreviewPath = this.getOriginalPath()
              this.currentPreviewDlPath = this.getOriginalDlPath()
              this.entityPage = this.getEntityPage()
              this.setOtherPreviews()
              this.loadTaskSubscribed({
                taskId: this.route.params.task_id,
                callback: (err, subscribed) => {
                  if (err) console.log(err)
                  this.isSubscribed = subscribed
                }
              })
            }
          }
        })
      }
    },

    isHighlighted (comment) {
      return comment.preview && comment.preview.id === this.currentPreviewId
    },

    getCurrentTask () {
      return this.taskMap[this.route.params.task_id]
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

    getCurrentTaskPath () {
      if (this.currentTask) {
        return `/tasks/${this.currentTask.id}`
      } else {
        return ''
      }
    },

    getOriginalPath () {
      let previewId = this.route.params.preview_id
      if (!previewId &&
          this.currentTaskPreviews &&
          this.currentTaskPreviews.length > 0
      ) {
        previewId = this.currentTaskPreviews[0].id
      }
      const extension = this.extension ? this.extension : 'png'
      return `/api/pictures/originals/preview-files/${previewId}.${extension}`
    },

    getOriginalDlPath () {
      let previewId = this.route.params.preview_id
      if (!previewId &&
          this.currentTaskPreviews &&
          this.currentTaskPreviews.length > 0
      ) {
        previewId = this.currentTaskPreviews[0].id
      }
      return `/api/pictures/originals/preview-files/${previewId}/download`
    },

    getPreviewPath () {
      let previewId = this.route.params.preview_id
      if (!previewId &&
          this.currentTaskPreviews &&
          this.currentTaskPreviews.length > 0
      ) {
        previewId = this.currentTaskPreviews[0].id
      }
      return `/api/pictures/previews/preview-files/${previewId}.png`
    },

    addComment (comment, taskStatusId) {
      const finalize = (err, preview) => {
        if (err) {
          this.errors.addComment = true
        } else {
          this.$refs['add-preview-modal'].reset()
          this.reset()
          if (preview && preview.type === 'PreviewFile') {
            this.resetPreview(preview)
          }
          this.attachedFileName = ''
        }
        this.loading.addComment = false
      }
      const params = {
        taskId: this.currentTask.id,
        taskStatusId: taskStatusId,
        commentText: comment,
        comment: comment,
        callback: finalize
      }
      this.loading.addComment = true
      this.errors.addComment = false
      if (this.attachedFileName) {
        this.commentTaskWithPreview(params)
      } else {
        this.commentTask(params)
      }
    },

    reset () {
      this.currentTaskComments = this.getCurrentTaskComments()
      this.currentTaskPreviews = this.getCurrentTaskPreviews()
      this.setOtherPreviews()
      this.currentPreviewPath = this.getOriginalPath()
      this.currentPreviewDlPath = this.getOriginalDlPath()
      this.currentTask = this.getCurrentTask()
      let previewId = this.route.params.preview_id
      if (!previewId &&
          this.currentTaskPreviews &&
          this.currentTaskPreviews.length > 0) {
        previewId = this.currentTaskPreviews[0].id
      }
      this.currentPreviewId = previewId
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path

      this.modals = {
        addPreview: false,
        addExtraPreview: false,
        deleteExtraPreview: false,
        changePreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      }
      if (path.indexOf('change-preview') > 0) {
        this.modals.changePreview = true
      } else if (
        path.indexOf('delete') > 0 && path.indexOf('comments') < 0
      ) {
        this.modals.deleteTask = true
      } else if (
        path.indexOf('delete') > 0 && path.indexOf('comments') > 0
      ) {
        this.modals.deleteComment = true
      } else if (
        path.indexOf('edit') > 0 && path.indexOf('comments') > 0
      ) {
        this.modals.editComment = true
      }
    },

    selectFile (formData) {
      this.loadPreviewFileFormData(formData)
      this.attachedFileName = formData.get('file').name
    },

    createPreview () {
      this.errors.addPreview = false
      this.loading.addPreview = true
      this.addCommentPreview({
        taskId: this.route.params.task_id,
        commentId: this.route.params.comment_id,
        callback: (err, preview) => {
          this.loading.addPreview = false
          if (err) {
            this.errors.addPreview = true
          } else {
            this.$refs['add-preview-modal'].reset()
            this.resetPreview(preview)
          }
        }
      })
    },

    createExtraPreview () {
      this.errors.addExtraPreview = false
      this.loading.addExtraPreview = true
      const previewId = this.currentPreviewId
      const comment = this.getCurrentTaskComments().find((comment) => {
        return comment.previews.findIndex((p) => p.id === previewId) >= 0
      })
      this.addCommentExtraPreview({
        taskId: this.currentTask.id,
        previewId: this.currentPreview.id,
        commentId: comment.id,
        callback: (err, preview) => {
          this.loading.addExtraPreview = false
          if (err) {
            this.errors.addExtraPreview = true
          } else {
            this.$refs['add-extra-preview-modal'].reset()
            if (this.currentPreview) {
              this.resetPreview(this.currentPreview)
            } else {
              this.resetPreview({
                id: previewId
              })
            }
            setTimeout(() => {
              this.$refs['preview-picture'].displayLast()
            }, 0)
            this.modals.addExtraPreview = false
          }
        }
      })
    },

    changePreview () {
      const preview = this.currentTaskComments[0].preview
      this.errors.changePreview = false
      this.loading.changePreview = true

      this.changeCommentPreview({
        preview: preview,
        taskId: this.currentTask.id,
        comment: this.currentTaskComments[0],
        callback: (err, extension) => {
          this.loading.changePreview = false
          if (err) {
            this.errors.changePreview = true
          } else {
            this.$refs['change-preview-modal'].reset()
            this.resetPreview(preview)
          }
        }
      })
    },

    resetPreview (preview) {
      this.currentTaskComments = this.getCurrentTaskComments()
      this.currentTaskPreviews = this.getCurrentTaskPreviews()
      this.setOtherPreviews()
      this.currentPreviewPath = this.getOriginalPath()
      this.currentPreviewDlPath = this.getOriginalDlPath()
      if (preview) this.$router.push(this.previewPath(preview.id))
    },

    setPreview () {
      this.loading.setPreview = true
      this.errors.setPreview = false
      this.$store.dispatch('setPreview', {
        taskId: this.currentTask.id,
        entityId: this.currentTask.entity.id,
        previewId: this.currentPreviewId,
        callback: (err) => {
          if (err) {
            this.errors.setPreview = true
          }
          this.loading.setPreview = false
        }
      })
    },

    setOtherPreviews () {
      if (this.currentTaskPreviews) {
        this.otherPreviews = this.currentTaskPreviews.filter((p) => {
          return (
            p.id !== this.currentPreviewId &&
            p.extension === 'mp4'
          )
        })
      } else {
        this.otherPreviews = []
      }
      return this.otherPreviews
    },

    confirmDeleteTask () {
      this.loading.deleteTask = true
      this.errors.deleteTask = false

      this.deleteTask({
        task: this.currentTask,
        callback: (err) => {
          this.loading.deleteTask = false
          if (err) {
            this.errors.deleteTask = true
          } else {
            this.$router.push(this.entityPage)
          }
        }
      })
    },

    confirmEditTaskComment (comment) {
      this.loading.editComment = true
      this.errors.editComment = false
      this.editTaskComment({
        taskId: this.currentTask.id,
        comment,
        callback: (err) => {
          this.loading.editComment = false
          if (err) {
            this.errors.editComment = true
          } else {
            this.$router.push(this.taskPath())
          }
        }
      })
    },

    confirmDeleteTaskComment () {
      this.loading.deleteComment = true
      this.errors.deleteComment = false
      const commentId = this.route.params.comment_id

      this.deleteTaskComment({
        taskId: this.currentTask.id,
        commentId,
        callback: (err) => {
          this.loading.deleteComment = false
          if (err) {
            this.errors.deleteComment = true
          } else {
            this.reset()
            if (this.currentTaskPreviews &&
                this.currentTaskPreviews.length > 0) {
              this.resetPreview(this.currentTaskPreviews[0])
            } else {
              this.$router.push(this.taskPath())
            }
          }
        }
      })
    },

    confirmDeleteTaskPreview () {
      this.loading.deleteExtraPreview = true
      this.errors.deleteExtraPreview = false
      const previewId = this.currentPreviewId
      const comment = this.getCurrentTaskComments().find((comment) => {
        return comment.previews.findIndex((p) => p.id === previewId) >= 0
      })

      this.$refs['preview-picture'].displayFirst()
      this.deleteTaskPreview({
        taskId: this.currentTask.id,
        commentId: comment.id,
        previewId: this.currentExtraPreviewId
      })
        .then(() => {
          this.loading.deleteExtraPreview = false
          this.resetPreview(this.currentPreview)
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
        if (this.currentPreviewId) {
          this.resetPreview({id: this.currentPreviewId})
        } else {
          this.resetPreview({id: previewId})
        }
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

    onAnnotationChanged ({ preview, annotations }) {
      const taskId = this.currentTask.id
      this.updatePreviewAnnotation({ taskId, preview, annotations })
    },

    onAddExtraPreview () {
      this.modals.addExtraPreview = true
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
    }
  },

  watch: {
    currentPreviewId () {
      this.setOtherPreviews()
    },

    $route () {
      this.handleModalsDisplay()
      if (this.$route.params.task_id !== this.currentTask.id) {
        this.loadTaskData()
      }
      let previewId = this.route.params.preview_id
      if (
        !previewId &&
        this.currentTaskPreviews &&
        this.currentTaskPreviews.length > 0
      ) {
        previewId = this.currentTaskPreviews[0].id
      }
      this.currentPreviewId = previewId
    }
  },

  socket: {
    events: {
      'preview:add' (eventData) {
        this.onPreviewAdded(eventData)
      },

      'preview_file:update' (eventData) {
        const preview = this.currentTaskPreviews.filter((preview) => {
          return preview.id === eventData.preview_file_id
        })
        if (preview) {
          this.refreshPreview({
            taskId: this.currentTask.id,
            previewId: eventData.preview_file_id
          }).then(() => {
            if (this.$refs['preview-movie']) {
              if (!this.$refs['preview-movie'].isDrawing) {
                this.$refs['preview-movie'].reloadAnnotations()
              }
            } else if (this.$refs['preview-picture']) {
              if (!this.$refs['preview-picture'].isDrawing) {
                this.$refs['preview-picture'].reset()
              }
            }
          })
        }
      }
    }
  },

  metaInfo () {
    let title = 'Loading task... - Kitsu'
    if (this.currentTask) {
      const taskTypeName = this.taskTypeMap[this.currentTask.task_type_id].name
      title = `${this.title} / ${taskTypeName} - Kitsu`
    }
    return { title }
  }
}
</script>

<style lang="scss" scoped>
.dark .page {
  background: #3D4048;
  padding-bottom: 1em;
}

.dark .page-header,
.dark .add-comment,
.dark .comment,
.dark .no-comment,
.dark .preview-column-content,
.dark .column {
  background: #46494F;
  border-color: #25282E;
  box-shadow: 0px 0px 6px #333;
}

h2.subtitle {
  margin: 0;
  padding: 0;
}

.page {
  background: #F9F9F9;
  padding: 0;
}

.page-header {
  padding: 1em;
  margin-top: 1em;
  background: white;
  box-shadow: 0px 0px 6px #E0E0E0;
  margin: 80px 1em 1em 1em;
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
  color: #999;
}

.task-information {
  margin-top: 1em;
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
  flex-direction: row;
  overflow-y: auto;
}

.task-column {
  width: 50%;
  padding: 1em;
  overflow-y: auto;
}

.preview-column-content {
  background: white;
  box-shadow: 0px 0px 6px #E0E0E0;
  padding: 1em;
  border-radius: 5px;
  overflow-x: hidden;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
}

.page-header .tag {
  border-radius: 0;
  font-weight: bold;
  color: #666;
}

.assignees {
  display: flex;
}

.assignees span {
  margin-right: 0.2em;
}

.preview-picture {
  text-align: center;
}

.preview-picture img {
  max-height: 700px;
}

.avatar-wrapper {
  margin-right: 0.5em;
}

.entity-thumbnail {
  width: 50px;
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

  .task-columns {
    flex-direction: column-reverse;
  }

  .task-column {
    width: 100%;
    overflow-y: initial;
  }
}
</style>
