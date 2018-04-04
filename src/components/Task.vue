<template>
  <div class="page fixed-page">
    <div class="page-header">
      <div class="back-button flexrow">
        <router-link
          :to="previousEntity"
          class="flexrow-item"
          :title="$t('tasks.previous')"
        >
          &larr;
        </router-link>

        <router-link
          :to="entityPage"
          class="list-link flexrow-item has-text-centered"
        >
          {{ $t('tasks.back_to_list')}}
        </router-link>

        <router-link
          :to="nextEntity"
          class="next-link flexrow-item"
          :title="$t('tasks.next')"
        >
          &rarr;
        </router-link>
      </div>

      <div class="flexrow" v-if="currentTask">
        <span
          class="tag is-medium flexrow-item task-type"
          :style="taskTypeBorder"
        >
          {{ currentTask.task_type_name }}
        </span>
        <div class="title flexrow-item">
          <router-link :to="taskEntityPath">
            {{ currentTask ? title : 'Loading...'}}
          </router-link>
        </div>
        <button-link
          class="flexrow-item"
          text=""
          icon="delete"
          :path="deleteTaskPath"
        >
        </button-link>
      </div>
      <div
        class="flexrow task-information"
        v-if="currentTask"
      >
        <span class="flexrow-item">{{ $t('tasks.current_status') }}</span>
        <validation-tag
          :task="currentTask"
          class="is-medium flexrow-item"
          :is-static="true"
          v-if="currentTask"
        ></validation-tag>
        <span class="flexrow-item">{{ $t('tasks.fields.assignees') }}:</span>
        <span
          class="flexrow-item avatar-wrapper"
          v-if="currentTask.assignees"
          v-for="personId in currentTask.assignees"
        >
          <people-avatar
            :key="personId"
            :person="personMap[personId]"
            class="flexrow-item"
            :size="30"
            :font-size="16"
          >
          </people-avatar>
       </span>
       <span
         v-else>
       </span>
      </div>
    </div>

    <div class="task-columns">
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
            >
            </add-comment>
            <div class="comments" v-if="currentTaskComments.length > 0">
              <comment
                :comment="comment"
                :highlighted="isHighlighted(comment)"
                :key="comment.id"
                :current-user="user"
                :editable="user.id === comment.person.id && index === 0"
                v-for="(comment, index) in currentTaskComments"
              >
              </comment>
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
              :taskId="currentTask ? currentTask.id : ''"
              :selected="preview.id === currentPreviewId"
              v-for="preview in currentTaskPreviews"
            >
            </preview-row>
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
                controls
                :poster="getPreviewPath()" />
              </video>
            </div>
            <a
              :href="getOriginalPath()"
              target="_blank"
              v-else-if="currentTaskPreviews.length > 0 && !isMovie"
            >
              <img :src="getPreviewPath()" />
            </a>
          </div>
          <div
            class="flexrow"
             v-if="currentTask && currentTask.entity && currentTask.entity.preview_file_id !== currentPreviewId"
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
              <image-icon class="icon"></image-icon>
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
      :cancel-route="taskPath"
      :form-data="addPreviewFormData"
      @fileselected="selectFile"
      @confirm="createPreview"
    >
    </add-preview-modal>

    <add-preview-modal
      ref="change-preview-modal"
      :active="modals.changePreview"
      :is-loading="loading.changePreview"
      :is-error="errors.changePreview"
      :cancel-route="taskPath"
      :form-data="changePreviewFormData"
      :is-editing="true"
      @fileselected="selectFile"
      @confirm="changePreview"
    >
    </add-preview-modal>

    <edit-comment-modal
      :active="modals.editComment"
      :is-loading="loading.editComment"
      :is-error="errors.editComment"
      :cancel-route="taskPath"
      :comment-to-edit="commentToEdit"
      @confirm="confirmEditTaskComment"
    >
    </edit-comment-modal>

    <delete-modal
      :active="modals.deleteTask"
      :is-loading="loading.deleteTask"
      :is-error="errors.deleteTask"
      :cancel-route="taskPath"
      :text="deleteText"
      :error-text="$t('tasks.delete_error')"
      @confirm="confirmDeleteTask"
    >
    </delete-modal>

    <delete-modal
      :active="modals.deleteComment"
      :is-loading="loading.deleteComment"
      :is-error="errors.deleteComment"
      :cancel-route="taskPath"
      :text="$t('tasks.delete_comment')"
      :error-text="$t('tasks.delete_comment_error')"
      @confirm="confirmDeleteTaskComment"
    >
    </delete-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ChevronLeftIcon, ImageIcon } from 'vue-feather-icons'

import PeopleAvatar from './widgets/PeopleAvatar'
import PeopleName from './widgets/PeopleName'
import AddComment from './widgets/AddComment'
import Comment from './widgets/Comment'
import PreviewRow from './widgets/PreviewRow'
import ValidationTag from './widgets/ValidationTag'
import AddPreviewModal from './modals/AddPreviewModal'
import DeleteModal from './widgets/DeleteModal'
import EditCommentModal from './modals/EditCommentModal'
import ButtonLink from './widgets/ButtonLink'
import EntityThumbnail from './widgets/EntityThumbnail'

export default {
  name: 'task',
  components: {
    AddComment,
    AddPreviewModal,
    ButtonLink,
    Comment,
    ChevronLeftIcon,
    DeleteModal,
    EntityThumbnail,
    EditCommentModal,
    ImageIcon,
    PeopleAvatar,
    ValidationTag,
    PeopleName,
    PreviewRow
  },

  data () {
    return {
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
      changePreviewFormData: null
    }
  },

  created () {
    this.clearSelectedTasks()
    this.loadTaskData()
  },

  computed: {
    ...mapGetters([
      'tasks',
      'comments',
      'commentTexts',
      'displayedShots',
      'displayedAssets',
      'route',
      'user',
      'isSingleEpisode',
      'taskStatusOptions',
      'getTask',
      'getTaskComments',
      'getTaskPreviews',
      'getTaskComment',
      'personMap',
      'user',
      'currentProduction',
      'isCurrentUserManager'
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

    taskPath () {
      let taskPath = { name: 'open-productions' }
      if (this.currentTask) {
        taskPath = {
          name: 'task',
          params: {
            task_id: this.currentTask.id
          }
        }
      }
      return taskPath
    },

    deleteTaskPath () {
      let deleteTaskPath = ''
      if (this.currentTask) {
        deleteTaskPath = {
          name: 'task-delete',
          params: {
            task_id: this.currentTask.id
          }
        }
      }
      return deleteTaskPath
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

    entityPage () {
      if (this.currentTask) {
        const type = this.currentTask.entity_type_name
        if (type === 'Shot') {
          return {
            name: 'shots',
            params: {production_id: this.currentTask.project_id}
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

    taskEntityPath () {
      if (this.currentTask) {
        const type = this.currentTask.entity_type_name
        if (type === 'Shot') {
          return {
            name: 'shot',
            params: {
              production_id: this.currentTask.project_id,
              shot_id: this.currentTask.entity.id
            }
          }
        } else {
          return {
            name: 'asset',
            params: {
              production_id: this.currentTask.project_id,
              asset_id: this.currentTask.entity.id
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
      const type = this.currentTask.entity_type_name
      return type === 'Shot' ? this.displayedShots : this.displayedAssets
    },

    previousEntity () {
      if (this.currentTask) {
        const taskTypeId = this.currentTask.task_type_id
        let entityIndex = this.entityList.findIndex((entity) => {
          return entity.id === this.currentTask.entity_id
        })

        let previousEntityIndex = entityIndex - 1
        if (previousEntityIndex < 0) {
          previousEntityIndex = this.entityList.length - 1
        }

        let task = null
        while (!task) {
          task = this.entityList[previousEntityIndex].tasks.find((task) => {
            return task.task_type_id === taskTypeId
          })

          if (!task) {
            previousEntityIndex--
            if (previousEntityIndex < 0) {
              previousEntityIndex = this.entityList.length
            }
          }
        }

        return {
          name: 'task',
          params: {task_id: task.id}
        }
      } else {
        return {
          name: 'open-productions'
        }
      }
    },

    nextEntity () {
      if (this.currentTask) {
        const taskTypeId = this.currentTask.task_type_id
        let entityIndex = this.entityList.findIndex((entity) => {
          return entity.id === this.currentTask.entity_id
        })

        let nextEntityIndex = entityIndex + 1
        if (nextEntityIndex >= this.entityList.length) {
          nextEntityIndex = 0
        }

        let task = null
        while (!task) {
          task = this.entityList[nextEntityIndex].tasks.find((task) => {
            return task.task_type_id === taskTypeId
          })

          if (!task) {
            nextEntityIndex++
            if (nextEntityIndex >= this.entityList.length) {
              nextEntityIndex = 0
            }
          }
        }

        return {
          name: 'task',
          params: {task_id: task.id}
        }
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
        const projectName = this.currentTask.project_name
        const type = this.currentTask.entity_type_name
        let entityName = this.currentTask.entity_name
        if (this.isSingleEpisode && type === 'Shot') {
          entityName = entityName
            .split('/')
            .splice(1)
            .join('/')
        }
        return `${projectName} / ${entityName}`
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
        return currentPreview.is_movie
      } else {
        return false
      }
    },

    moviePath () {
      let previewId = this.route.params.preview_id
      if (!previewId && this.currentTaskPreviews.length > 0) {
        previewId = this.currentTaskPreviews[0].id
      }
      return `/api/movies/originals/preview-files/${previewId}.mp4`
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
      'setProduction'
    ]),

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

            this.setProduction(task.project_id)
            let loadingFunction = this.loadAssets
            if (task.entity_type_name === 'Shot') {
              loadingFunction = this.loadShots
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
                    this.taskLoading = {
                      isLoading: false,
                      isError: false
                    }
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
            }
          }
        })
      }
    },

    isHighlighted (comment) {
      return comment.preview && comment.preview.id === this.currentPreviewId
    },

    getCurrentTask () {
      return this.getTask(this.route.params.task_id)
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
      if (!previewId && this.currentTaskPreviews.length > 0) {
        previewId = this.currentTaskPreviews[0].id
      }
      return `/api/pictures/originals/preview-files/${previewId}.png`
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
            this.currentTaskPreviews = this.getCurrentTaskPreviews()
            this.currentTaskComments = this.getCurrentTaskComments()
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
          if (err) {
            this.errors.addPreview = true
          } else {
            this.$router.push(`/tasks/${this.route.params.task_id}` +
                              `/previews/${preview.id}`)
          }
          this.$refs['add-preview-modal'].reset()
          this.loading.addPreview = false
          this.currentTaskPreviews = this.getCurrentTaskPreviews()
          this.currentTaskComments = this.getCurrentTaskComments()
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
        commenttId: this.currentTaskComments[0].id,
        callback: (err, preview) => {
          if (err) {
            this.errors.changePreview = true
          } else {
            this.$router.push(`/tasks/${this.route.params.task_id}` +
                              `/previews/${preview.id}`)
          }
          this.$refs['change-preview-modal'].reset()
          this.loading.changePreview = false
          this.currentTaskPreviews = this.getCurrentTaskPreviews()
          this.currentTaskComments = this.getCurrentTaskComments()
        }
      })
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
            this.$router.push(this.taskPath)
          }
        }
      })
    }
  },

  mounted () {
    this.handleModalsDisplay()
  },

  watch: {
    $route () {
      this.handleModalsDisplay()
      if (this.$route.params.task_id !== this.currentTask.id) {
        this.loadTaskData()
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
.list-link {
  flex: 1;
}

.page {
  background: #F9F9F9;
  padding: 0;
}

.page-header {
  padding: 50px 1em 1em 1em;
  margin-top: 1em;
  background: white;
  box-shadow: 0px 0px 6px #E0E0E0;
}

.back-button {
  margin-top: 1em;
  font-size: 0.8em;
  margin-bottom: 0.5em;
}

.back-button a {
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

.hidden {
  display: none;
}

.validation-buttons button {
  width: 100%;
  margin-bottom: 0.3em;
  border-width: 2px;
  font-weight: bold;
}

.page {
  overflow: hidden;
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
  margin-right: 0em;
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
</style>
