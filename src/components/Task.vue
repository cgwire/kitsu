<template>
  <div class="page fixed-page">
    <div class="page-header">
      <div class="flexrow navigation-buttons">
        <router-link
          :to="previousEntity"
          class="flexrow-item arrow"
          :title="$t('tasks.previous')"
          v-if="previousEntity"
        >
          &larr;
        </router-link>

        <router-link
          :to="entityPage"
          class="flexrow-item has-text-centered"
        >
          {{ $t('tasks.back_to_list')}}
        </router-link>

        <router-link
          :to="nextEntity"
          class="next-link flexrow-item arrow"
          :title="$t('tasks.next')"
          v-if="nextEntity"
        >
          &rarr;
        </router-link>
      </div>

      <div
        class="flexrow header-title"
        v-if="currentTask"
      >
        <task-type-name
          class="flexrow-item task-type"
          :task-type="currentTaskType"
          :production-id="currentProduction.id"
          v-if="currentTaskType"
        />
        <div class="title flexrow-item">
          <router-link :to="taskEntityPath">
            {{ currentTask ? title : 'Loading...'}}
          </router-link>
        </div>
        <subscribe-button
          class="flexrow-item action-button"
          :subscribed="isAssigned || isSubscribed"
          @click="toggleSubscribe"
        />
        <button-link
          class="flexrow-item action-button"
          text=""
          icon="delete"
          :path="deleteTaskPath"
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
          v-if="currentTask.assignees"
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
       <span
         v-else
       >
       </span>
      </div>
    </div>

    <div class="task-columns" ref="task-columns">
      <div class="task-column comments-column">
        <div v-if="currentTask">
          <div>
            <add-comment
              :addComment="addComment"
              :isAddCommentLoading="addCommentLoading.isLoading"
              :user="user"
              :task="currentTask"
              :taskStatusOptions="taskStatusOptions"
              v-if="isCommentingAllowed"
            />
            <div class="comments" v-if="currentTaskComments.length > 0">
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
          <img src="../assets/spinner.svg" />
        </div>
      </div>

      <div class="task-column preview-column">
        <div class="preview-column-content">
          <h2 class="subtitle">
            {{ $t('tasks.preview') }}
          </h2>
          <div
            class="preview-list"
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
            <div v-if="currentTaskPreviews && currentTaskPreviews.length > 0 && isMovie">
              <video
                :src="moviePath"
                ref="preview-movie"
                controls
                :poster="getPreviewPath()"
              />
            </div>

            <a
              class="button"
              ref="preview-file"
              :href="currentPreviewPath"
              v-else-if="isDlPreviewFile"
            >
              <download-icon class="icon"></download-icon>
              <span class="text">
                {{ $t('tasks.download_pdf_file') }}
              </span>
            </a>

            <model-viewer
              :preview-url="currentPreviewPath"
              v-else-if="currentTaskPreviews.length > 0 && extension === 'obj'"
            />

            <a
              :href="currentPreviewPath"
              target="_blank"
              v-else-if="currentTaskPreviews.length > 0 && extension === 'png'"
            >
              <img
                :src="getPreviewPath()"
                ref="preview-picture"
              />
            </a>
          </div>

          <div
            class="flexrow"
            v-if="isPreviewButtonVisible"
          >
            <button
              :class="{
                button: true,
                'flexrow-item': true,
                'is-loading': loading.setPreview
              }"
              @click="setPreview"
              v-if="currentTaskPreviews.length > 0 && isCurrentUserManager"
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
            class="set-main-preview"
            v-if="currentTask && currentTask.entity && currentTask.entity.preview_file_id === currentPreviewId">
            <em>{{ $t('tasks.set_preview_done') }}</em>
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
      @confirm="createPreview"
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
      :active="modals.deleteTask"
      :is-loading="loading.deleteTask"
      :is-error="errors.deleteTask"
      :cancel-route="taskPath()"
      :text="deleteText"
      :error-text="$t('tasks.delete_error')"
      @confirm="confirmDeleteTask"
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
import ModelViewer from './widgets/ModelViewer'
import PeopleAvatar from './widgets/PeopleAvatar'
import PeopleName from './widgets/PeopleName'
import PreviewRow from './widgets/PreviewRow'
import SubscribeButton from './widgets/SubscribeButton'
import TaskTypeName from './widgets/TaskTypeName'
import ValidationTag from './widgets/ValidationTag'

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
    ValidationTag,
    PeopleName,
    PreviewRow,
    SubscribeButton,
    TaskTypeName
  },

  data () {
    return {
      entityPage: this.getEntityPage(),
      selectedTab: 'validation',
      taskLoading: {
        isLoading: true,
        isError: false
      },
      addCommentLoading: {
        isLoading: false,
        isError: false
      },
      modals: {
        addPreview: false,
        changePreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      },
      loading: {
        addPreview: false,
        changePreview: false,
        setPreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      },
      errors: {
        addPreview: false,
        changePreview: false,
        setPreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      },
      currentTask: null,
      currentTaskComments: [],
      currentTaskPreviews: [],
      addPreviewFormData: null,
      changePreviewFormData: null,
      isSubscribed: false,
      currentPreviewPath: ''
    }
  },

  created () {
    this.clearSelectedTasks()
    this.loadTaskData()
  },

  computed: {
    ...mapGetters([
      'comments',
      'commentTexts',
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
      'tasks',
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
      if (this.currentTask && this.currentTaskComments.length > 0) {
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

        if (type === 'Shot') {
          return {
            name: 'shot',
            params: {
              production_id: this.currentTask.project_id,
              shot_id: entityId
            }
          }
        } else {
          return {
            name: 'asset',
            params: {
              production_id: this.currentTask.project_id,
              asset_id: entityId
            }
          }
        }
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

    currentPreviewId () {
      let previewId = this.route.params.preview_id

      if (!previewId && this.currentTaskPreviews.length > 0) {
        previewId = this.currentTaskPreviews[0].id
      }

      return previewId
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
        return this.$t('main.delete_text', {
          name: `${this.currentTask.entity_name}` +
                ` / ${this.currentTask.task_type_name}`
        })
      } else {
        return ''
      }
    },

    isMovie () {
      if (this.currentTaskPreviews.length > 0) {
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
      if (this.currentTaskPreviews.length > 0) {
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
      if (!previewId && this.currentTaskPreviews.length > 0) {
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
        !['pdf', 'obj', 'ma', 'mb'].includes(this.extension)
      )
    },

    isDlPreviewFile () {
      return this.currentTaskPreviews.length > 0 &&
        ['pdf', 'ma', 'mb'].includes(this.extension)
    },

    currentTaskType () {
      if (this.currentTask) {
        return this.taskTypeMap[this.currentTask.task_type_id]
      } else {
        return null
      }
    }
  },

  methods: {
    ...mapActions([
      'addCommentPreview',
      'changeCommentPreview',
      'clearSelectedTasks',
      'deleteTask',
      'editTaskComment',
      'deleteTaskComment',
      'loadEpisodes',
      'loadTask',
      'loadShots',
      'loadAssets',
      'loadTaskComments',
      'loadTaskSubscribed',
      'subscribeToTask',
      'setCurrentEpisode',
      'unsubscribeFromTask'
    ]),

    getEntityPage () {
      if (this.currentTask) {
        if (this.entityList === this.displayedShots) {
          if (this.isTVShow) {
            return {
              name: 'episode-shots',
              params: {
                episode_id: this.currentEpisode ? this.currentEpisode.id : '',
                production_id: this.currentTask.project_id
              }
            }
          } else {
            return {
              name: 'shots',
              params: {production_id: this.currentTask.project_id}
            }
          }
        } else {
          return {
            name: 'assets',
            params: {production_id: this.currentTask.project_id}
          }
        }
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
                callback: (err) => {
                  if (err) {
                    this.taskLoading = {
                      isLoading: false,
                      isError: true
                    }
                  } else {
                    this.currentTaskComments = this.getCurrentTaskComments()
                    this.currentTaskPreviews = this.getCurrentTaskPreviews()
                    this.currentPreviewPath = this.getOriginalPath()
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
          callback: (err) => {
            if (err) {
            } else {
              this.currentTaskComments = this.getCurrentTaskComments()
              this.currentTaskPreviews = this.getCurrentTaskPreviews()
              this.currentPreviewPath = this.getOriginalPath()
              this.entityPage = this.getEntityPage()
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
          this.currentTaskPreviews.length > 0 &&
          this.currentTaskPreviews
      ) {
        previewId = this.currentTaskPreviews[0].id
      }
      const extension = this.extension ? this.extension : 'png'
      return `/api/pictures/originals/preview-files/${previewId}.${extension}`
    },

    getPreviewPath () {
      let previewId = this.route.params.preview_id
      if (!previewId && this.currentTaskPreviews.length > 0) {
        previewId = this.currentTaskPreviews[0].id
      }
      return `/api/pictures/previews/preview-files/${previewId}.png`
    },

    addComment (comment, taskStatusId) {
      this.addCommentLoading = {
        isLoading: true,
        isError: false
      }
      this.$store.dispatch('commentTask', {
        taskId: this.route.params.task_id,
        taskStatusId: taskStatusId,
        comment: comment,
        callback: (err) => {
          if (err) {
            console.log(err)
            this.addCommentLoading = {
              isLoading: false,
              isError: true
            }
          } else {
            this.addCommentLoading = {
              isLoading: false,
              isError: false
            }
            this.currentTaskComments = this.getCurrentTaskComments()
            this.currentTaskPreviews = this.getCurrentTaskPreviews()
            this.currentPreviewPath = this.getOriginalPath()
            this.currentTask = this.getCurrentTask()
          }
        }
      })
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path

      this.modals = {
        addPreview: false,
        changePreview: false,
        deleteTask: false,
        deleteComment: false,
        editComment: false
      }
      if (path.indexOf('add-preview') > 0) {
        this.modals.addPreview = true
      } else if (path.indexOf('change-preview') > 0) {
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
      this.$store.commit('PREVIEW_FILE_SELECTED', formData)
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
      this.currentPreviewPath = this.getOriginalPath()
      this.$router.push(this.previewPath(preview.id))
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
            this.$router.push(this.taskPath)
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
            this.currentTaskComments = this.getCurrentTaskComments()
            this.currentTaskPreviews = this.getCurrentTaskPreviews()
            this.currentPreviewPath = this.getOriginalPath()
            this.$router.push(this.taskPath)
          }
        }
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
        (!comment.preview || comment.preview.id !== previewId) &&
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
        this.resetPreview({id: previewId})
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
    }
  },

  mounted () {
    this.handleModalsDisplay()
    setTimeout(() => {
      if (this.$refs['task-columns']) {
        this.$refs['task-columns'].scrollTop = 100
        window.scrollTo(0, 0)
      }
    })
  },

  watch: {
    currentPreviewId () {
    },

    $route () {
      this.handleModalsDisplay()
      if (this.$route.params.task_id !== this.currentTask.id) {
        this.loadTaskData()
      }
    }
  },

  socket: {
    events: {
      'preview:add' (eventData) {
        this.onPreviewAdded(eventData)
      }
    }
  },

  metaInfo () {
    let title = 'Loading task... - Kitsu'
    if (this.currentTask) {
      title = `${this.title} / ${this.currentTask.task_type_name} - Kitsu`
    }
    return { title }
  }
}
</script>

<style scoped>
.page {
  background: #F9F9F9;
  padding: 0;
}

.page-header {
  padding: 0 1em 1em 1em;
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
}

.no-comment {
  background: white;
  box-shadow: 0px 0px 6px #E0E0E0;
  padding: 1em;
  border-radius: 5px;
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

.comments-column {
}

.preview-column-content {
  background: white;
  box-shadow: 0px 0px 6px #E0E0E0;
  padding: 1em;
  border-radius: 5px;
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

.title a {
  color: inherit;
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
