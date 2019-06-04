<template>
  <div
    class="side task-info"
    :style="panelStyle"
    ref="side-panel"
    v-if="task"
  >
    <div class="page-header">
      <div
        class="flexrow header-title"
      >
        <div class="title flexrow-item">
          <router-link :to="taskEntityPath">
            {{ task ? title : 'Loading...' }}
          </router-link>
        </div>
        <task-type-name
          class="flexrow-item task-type"
          :task-type="currentTaskType"
          :production-id="currentProduction.id"
          v-if="currentTaskType"
        />
      </div>
      <div
        class="flexrow task-information"
      >
        <button-simple
          class="flexrow-item change-wideness-button"
          icon="right"
          :title="$t('tasks.bigger')"
          @click="toggleWidth"
          v-if="isWide && isPreview"
        />
        <button-simple
          class="flexrow-item change-wideness-button"
          icon="left"
          :title="$t('tasks.bigger')"
          @click="toggleWidth"
          v-else-if="isPreview"
        />
        <button-simple
          class="flexrow-item set-thumbnail-button"
          icon="image"
          :disabled="!isSetThumbnailAllowed"
          :title="$t('tasks.set_preview')"
          @click="setCurrentPreviewAsEntityThumbnail"
          v-if="isCurrentUserManager && isPreview"
        />
        <subscribe-button
          class="flexrow-item"
          :subscribed="isAssigned || isSubscribed"
          @click="toggleSubscribe"
          v-if="!isAssigned"
        />
        <validation-tag
          class="is-medium flexrow-item"
          :task="task"
          :is-static="true"
        />
        <div class="filler"></div>
        <div class="preview-list flexrow" v-if="isPreview">
          <span
            :class="{
              'flexrow-item': true,
              selected: currentPreviewIndex === index
            }"
            :key="'preview-' + preview.revision"
            @click="onPreviewChanged(index)"
            v-for="(preview, index) in lastFivePreviews"
          >
            {{ preview.revision }}
          </span>
          <router-link
            class="history-button flexrow-item"
            :to="taskPath"
            v-if="taskPreviews.length > 0"
          >
            ...
          </router-link>
        </div>
      </div>
    </div>

    <div class="task-columns" ref="task-columns">
      <div class="task-column preview-column" v-if="isPreview">
        <div class="preview-column-content">
          <div class="preview">
            <div class="preview-picture">
              <div
                v-if="isMoviePreview"
              >
                <video-player
                  :preview="currentPreview"
                  :entity-preview-files="taskEntityPreviews"
                  :task-type-map="taskTypeMap"
                  :light="!isWide"
                  @annotationchanged="onAnnotationChanged"
                  ref="preview-movie"
                />
              </div>

              <div
                class="preview-standard-file"
                v-else-if="isStandardPreview"
              >
                <a
                  class="button"
                  ref="preview-file"
                  :href="currentPreviewDlPath"
                >
                  <download-icon class="icon" />
                  <span class="text">
                    {{ $t('tasks.download_pdf_file', {extension}) }}
                  </span>
                </a>
              </div>

              <model-viewer
                class="model-viewer"
                :preview-url="currentPreviewPath"
                :preview-dl-path="currentPreviewDlPath"
                :light="!isWide"
                v-else-if="is3DModelPreview"
              />

              <picture-viewer
                :preview="currentPreview"
                :light="!isWide"
                @annotation-changed="onAnnotationChanged"
                @add-preview="onAddExtraPreview"
                ref="preview-picture"
                v-else-if="isPicturePreview"
              />
              <div
                class="no-preview"
                v-if="!taskPreviews || taskPreviews.length === 0"
              >
                <em>{{ $t('tasks.no_preview') }}</em>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="task-column comments-column">
        <div>
          <div>
            <add-comment
              ref="add-comment"
              :user="user"
              :team="currentTeam"
              :task="task"
              :task-status="taskStatusForCurrentUser"
              :light="true"
              :is-loading="loading.addComment"
              :attached-file-name="attachedFileName"
              :is-error="errors.addComment"
              @add-comment="addComment"
              @add-preview="onAddPreviewClicked"
              @file-drop="selectFile"
              v-if="isCommentingAllowed"
            />

            <div
              class="comments"
              v-if="taskComments.length > 0 && !loading.task"
            >
              <comment
                :key="'comment' + comment.id"
                :comment="comment"
                :light="true"
                :add-preview="onAddPreviewClicked"
                :is-last="index === 0"
                @pin-comment="onPinComment"
                v-for="(comment, index) in taskComments"
              />
            </div>
            <div class="no-comment" v-else-if="!loading.task">
              <em>
                {{ $t('tasks.no_comment')}}
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
      @cancel="onClosePreview"
      @fileselected="selectFile"
      @confirm="onClosePreview"
    />

    <add-preview-modal
      ref="add-extra-preview-modal"
      :active="modals.addExtraPreview"
      :is-loading="loading.addExtraPreview"
      :is-error="errors.addExtraPreview"
      :form-data="addExtraPreviewFormData"
      extensions=".png,.jpg,.jpeg"
      @cancel="onCloseExtraPreview"
      @fileselected="selectFile"
      @confirm="createExtraPreview"
    />
  </div>

  <div class="side task-info has-text-centered" v-else>
    {{ $t('tasks.no_task_selected') }}
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  ChevronLeftIcon,
  DownloadIcon,
  ImageIcon
} from 'vue-feather-icons'
import {
  getTaskEntityPath,
  getTaskPath,
  getTaskTypeStyle
} from '../../lib/helpers'

import AddComment from '../widgets/AddComment'
import AddPreviewModal from '../modals/AddPreviewModal'
import ButtonLink from '../widgets/ButtonLink'
import ButtonSimple from '../widgets/ButtonSimple'
import Comment from '../widgets/Comment'
import ModelViewer from '../previews/ModelViewer'
import PeopleName from '../widgets/PeopleName'
import PictureViewer from '../previews/PictureViewer'
import Spinner from '../widgets/Spinner'
import SubscribeButton from '../widgets/SubscribeButton'
import TaskTypeName from '../widgets/TaskTypeName'
import ValidationTag from '../widgets/ValidationTag'
import VideoPlayer from '../previews/VideoPlayer'

export default {
  name: 'task-info',
  components: {
    AddComment,
    AddPreviewModal,
    ButtonLink,
    ButtonSimple,
    Comment,
    ChevronLeftIcon,
    DownloadIcon,
    ImageIcon,
    ModelViewer,
    PeopleName,
    PictureViewer,
    Spinner,
    SubscribeButton,
    TaskTypeName,
    ValidationTag,
    VideoPlayer
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
    }
  },

  data () {
    return {
      addExtraPreviewFormData: null,
      attachedFileName: '',
      currentPreviewIndex: 0,
      currentPreviewPath: '',
      currentPreviewDlPath: '',
      isSubscribed: false,
      isWide: false,
      otherPreviews: [],
      taskComments: [],
      taskPreviews: [],
      errors: {
        addComment: false,
        addPreview: false,
        addExtraPreview: false,
        task: false
      },
      loading: {
        addComment: false,
        addPreview: false,
        addExtraPreview: false,
        task: false
      },
      modals: {
        addPreview: false,
        addExtraPreview: false
      }
    }
  },

  mounted () {
    this.loadTaskData()
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'getTaskComment',
      'getTaskComments',
      'getTaskPreviews',
      'isCurrentUserManager',
      'isSingleEpisode',
      'isTVShow',
      'personMap',
      'previewFormData',
      'taskEntityPreviews',
      'taskStatusForCurrentUser',
      'taskTypeMap',
      'user'
    ]),

    currentTeam () {
      return this.currentProduction.team.map(id => this.personMap[id])
    },

    title () {
      if (this.task) {
        const type = this.task.entity_type_name
        let entityName =
          this.task.full_entity_name || this.task.entity_name
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

    isAssigned () {
      if (this.task) {
        return this.task.assignees.some((assigneeId) => {
          return assigneeId === this.user.id
        })
      } else {
        return false
      }
    },

    isCommentingAllowed () {
      return this.isCurrentUserManager || this.task.assignees.find(
        (personId) => personId === this.user.id
      )
    },

    isSetThumbnailAllowed () {
      return this.currentPreviewId &&
        this.task &&
        this.task.entity &&
        this.currentPreviewId !== this.task.entity.preview_file_id
    },

    currentTaskType () {
      return this.task ? this.taskTypeMap[this.task.task_type_id] : null
    },

    currentPreview () {
      const index = this.currentPreviewIndex
      return this.taskPreviews &&
        this.taskPreviews.length > 0 ? this.taskPreviews[index] : null
    },

    currentPreviewId () {
      const index = this.currentPreviewIndex
      return this.taskPreviews &&
        this.taskPreviews.length > 0 ? this.taskPreviews[index].id : null
    },

    extension () {
      const index = this.currentPreviewIndex
      return this.taskPreviews &&
        this.taskPreviews.length > 0 ? this.taskPreviews[index].extension : ''
    },

    isStandardPreview () {
      return this.taskPreviews && this.taskPreviews.length > 0 &&
        [
          'ai',
          'blend',
          'ma',
          'mb',
          'pdf',
          'psd',
          'rar',
          'zip'
        ].includes(this.extension)
    },

    isMoviePreview () {
      return this.taskPreviews &&
       this.taskPreviews.length > 0 && this.extension === 'mp4'
    },

    isPicturePreview () {
      return this.taskPreviews &&
       this.taskPreviews.length > 0 && this.extension === 'png'
    },

    is3DModelPreview () {
      return this.taskPreviews &&
       this.taskPreviews.length > 0 && this.extension === 'obj'
    },

    moviePath () {
      let previewId = null
      previewId = this.currentPreview.id
      return `/api/movies/originals/preview-files/${previewId}.mp4`
    },

    tasktypeStyle () {
      return getTaskTypeStyle(this.task)
    },

    taskPath () {
      return getTaskPath(
        this.task,
        this.currentProduction,
        this.isTVShow,
        this.currentEpisode,
        this.taskTypeMap
      )
    },

    taskEntityPath () {
      const episodeId = this.$route.params.episode_id
      return getTaskEntityPath(this.task, episodeId)
    },

    lastFivePreviews () {
      return this.taskPreviews.slice(0, 5)
    },

    panelStyle () {
      return {
        width: this.isWide ? 700 : 350
      }
    }
  },

  methods: {
    ...mapActions([
      'addCommentExtraPreview',
      'commentTask',
      'commentTaskWithPreview',
      'loadPreviewFileFormData',
      'loadTask',
      'loadTaskComments',
      'loadTaskSubscribed',
      'refreshPreview',
      'pinComment',
      'setPreview',
      'subscribeToTask',
      'unsubscribeFromTask',
      'updatePreviewAnnotation'
    ]),

    loadTaskData () {
      if (this.task) {
        this.loading.task = true
        this.errors.task = false
        this.loadTaskComments({
          taskId: this.task.id,
          entityId: this.task.entity_id,
          callback: (err) => {
            if (err) {
              console.log(err)
              this.errors.task = true
            } else {
              this.loadTaskSubscribed({
                taskId: this.task.id,
                callback: (err, subscribed) => {
                  if (err) console.log(err)
                  this.loading.task = false
                  this.reset()
                  this.isSubscribed = subscribed
                }
              })
            }
          }
        })
      }
    },

    addComment (comment, taskStatusId) {
      const finalize = (err, preview) => {
        if (err) {
          this.errors.addComment = true
        } else {
          this.$refs['add-preview-modal'].reset()
          this.reset()
          this.attachedFileName = ''
        }
        this.loading.addComment = false
      }
      const params = {
        taskId: this.task.id,
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
      this.taskComments = this.getTaskComments(this.task.id)
      this.taskPreviews = this.getTaskPreviews(this.task.id)
      this.setOtherPreviews()
      this.currentPreviewPath = this.getOriginalPath()
      this.currentPreviewDlPath = this.getOriginalDlPath()
      this.$nextTick(() => {
        if (this.$refs['add-comment']) this.$refs['add-comment'].focus()
      })
    },

    focusCommentTextarea () {
      if (this.$refs['add-comment']) this.$refs['add-comment'].focus()
    },

    getOriginalPath () {
      let previewId = this.currentPreviewId
      const extension = this.extension ? this.extension : 'png'
      return `/api/pictures/originals/preview-files/${previewId}.${extension}`
    },

    getOriginalDlPath () {
      let previewId = this.currentPreviewId
      return `/api/pictures/originals/preview-files/${previewId}/download`
    },

    setOtherPreviews () {
      if (this.taskPreviews) {
        this.otherPreviews = this.taskPreviews.filter((p) => {
          return (
            p.id !== this.currentPreviewId &&
            p.extension === 'mp4'
          )
        })
      }
      return this.otherPreviews
    },

    selectFile (formData) {
      this.loadPreviewFileFormData(formData)
      this.attachedFileName = formData.get('file').name
    },

    createExtraPreview () {
      const index = this.currentPreviewIndex
      this.errors.addExtraPreview = false
      this.loading.addExtraPreview = true
      this.addCommentExtraPreview({
        taskId: this.task.id,
        commentId: this.taskComments[0].id,
        previewId: this.taskPreviews[index].id,
        callback: (err, preview) => {
          this.loading.addExtraPreview = false
          if (err) {
            this.errors.addExtraPreview = true
          } else {
            this.$refs['add-extra-preview-modal'].reset()
            this.reset()
            setTimeout(() => {
              this.$refs['preview-picture'].displayLast()
            }, 0)
            this.modals.addExtraPreview = false
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
        this.reset()
      }
    },

    onAnnotationChanged ({ preview, annotations }) {
      const taskId = this.task.id
      this.updatePreviewAnnotation({ taskId, preview, annotations })
    },

    onAddPreviewClicked (comment) {
      this.modals.addPreview = true
    },

    onAddExtraPreview () {
      this.modals.addExtraPreview = true
    },

    onClosePreview () {
      this.modals.addPreview = false
    },

    onCloseExtraPreview () {
      this.modals.addExtraPreview = false
    },

    onPreviewChanged (index) {
      const preview = this.taskPreviews[index]
      console.log(preview.revision)
      this.currentPreviewIndex = index
    },

    setCurrentPreviewAsEntityThumbnail () {
      this.setPreview({
        taskId: this.task.id,
        entityId: this.task.entity.id,
        previewId: this.currentPreviewId,
        callback: () => {}
      })
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

    toggleWidth () {
      this.isWide = !this.isWide
      const panel = this.$refs['side-panel']
      if (this.isWide) {
        panel.parentElement.style['min-width'] = '700px'
      } else {
        panel.parentElement.style['min-width'] = '350px'
      }
    },

    onPinComment (comment) {
      this.pinComment(comment)
    }
  },

  watch: {
    task () {
      this.attachedFileName = ''
      this.currentIndex = 0
      this.loadTaskData()
    },

    isLoading () {
      this.task.loading = this.isLoading
    }
  },

  socket: {
    events: {
      'preview-file:add-file' (eventData) {
        this.onPreviewAdded(eventData)
      },

      'preview_file:update' (eventData) {
        const preview = this.taskPreviews.filter((preview) => {
          return preview.id === eventData.preview_file_id
        })
        if (preview) {
          this.refreshPreview({
            taskId: this.task.id,
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
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .add-comment,
  .comment,
  .preview-column-content,
  .no-comment {
    background: #46494F;
    border-color: $dark-grey;
    box-shadow: 0px 0px 6px #333;
  }

  .no-preview {
    padding: 0.5em;
  }

  .preview-picture {
    border: 1px solid $dark-grey;
  }

  .side {
    background: #36393F;
  }

  .task-info {
    color: white;
  }

  .preview-list span {
    &:hover,
    &.selected {
      color: $dark-grey;
    }
  }
}

.side {
  background: #F8F8F8;
  height: 100%;
}

.add-comment {
  padding: 0.5em;
  margin-bottom: 0.5em;
  box-shadow: 0px 0px 6px #E0E0E0;
}

.page-header {
  padding: 0;
  margin-top: 0;
}

.header-title .flexrow-item {
  margin-bottom: 0.5em;
}

.title {
  margin: 0;
  flex: 1;
  font-size: 1.3em;
  line-height: 1.5em;
}

.title a {
  color: inherit;
}

.history-button {
  flex: 1;
}

.no-comment {
  background: white;
  padding: 1em;
  border-radius: 5px;
  box-shadow: 0px 0px 6px #E0E0E0;
}

.task-columns {
  display: flex;
  flex-direction: column;
}

.task-column {
  margin-top: 1em;
}

.comment {
  border-top: 1px solid $white-grey;
  border-bottom: 1px solid $white-grey;
  border-right: 1px solid $white-grey;
  margin-top: 0.1em;
  box-shadow: 0px 0px 6px #E0E0E0;
}

.add-preview-button {
  margin-top: 0.5em;
  width: 100%;
}

.no-comment {
  background: white;
  box-shadow: 0px 0px 6px #E0E0E0;
}

.comments {
  padding-bottom: 1em;
}

.preview-colum-content {
  box-shadow: 0px 0px 6px #E0E0E0;
}

.preview-standard-file {
  text-align: center;
  padding: 1em;
}

.model-viewer {
  padding: 0.3em;
}

.change-wideness-button,
.set-thumbnail-button {
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
      background: $light-green-light;
    }

    &.selected {
      background: $purple;
    }
  }
}
</style>
