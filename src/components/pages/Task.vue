<template>
  <div class="fixed-page columns xyz-in" xyz="fade">
    <div class="page column main-column">
      <div class="page-header pa1 mb0" xyz="fade">
        <div class="flexrow header-title" v-if="task">
          <router-link
            class="flexrow-item has-text-centered back-link"
            :to="taskEntitiesPath"
          >
            <corner-left-up-icon />
          </router-link>

          <task-type-name
            class="flexrow-item task-type block"
            :task-type="taskType"
            :production-id="currentProduction.id"
            v-if="taskType"
          />

          <span class="flexrow-item ml2">
            <entity-thumbnail
              class="entity-thumbnail"
              :entity="currentEntity"
              :empty-width="100"
              :empty-height="60"
              :width="100"
              :with-link="true"
            />
          </span>

          <h1 class="title flexrow-item">
            <router-link :to="taskEntityPath">
              {{ task ? title : 'Loading...' }}
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
              v-if="assignees.length > 0 && !isCurrentUserClient"
            >
              {{ $t('tasks.fields.assignees') }}:
            </span>
            <template v-if="!isCurrentUserClient">
              <span
                class="flexrow-item avatar-wrapper"
                :key="person.id"
                v-for="person in assignees"
              >
                <people-avatar
                  class="flexrow-item"
                  :person="person"
                  :size="30"
                  :font-size="16"
                />
              </span>
            </template>
            <subscribe-button
              class="flexrow-item action-button"
              :subscribed="isAssigned || task.is_subscribed"
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
                  is-preview
                  v-model="selectedPreviewId"
                />
              </div>
              <div v-else>
                <em>
                  {{ $t('tasks.no_preview') }}
                </em>
              </div>

              <div
                class="set-main-preview flexrow-item flexrow pull-right"
                v-if="currentPreview"
              >
                <button
                  class="button flexrow-item"
                  @click="showHookupPlaylistModal"
                  v-if="isHookupButtonVisible"
                >
                  <kitsu-icon
                    name="playlists"
                    :title="$t('tasks.hookup_playlist')"
                  />
                </button>
                <button
                  class="button flexrow-item"
                  :class="{
                    'is-loading': loading.setPreview
                  }"
                  @click="setPreview"
                  v-if="isCurrentUserManager"
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
              <view-playlist-modal
                :active="modals.hookupPlaylist"
                :task-ids="hookupPlaylistTaskIds"
                sort
                @cancel="hideHookupPlaylistModal"
              />
            </div>

            <div class="preview-area mt1">
              <div v-if="isPreviews">
                <preview-player
                  ref="preview-player"
                  :entity-preview-files="taskEntityPreviews"
                  :extra-wide="true"
                  :last-preview-files="taskPreviews || []"
                  :link="currentPreviewComment?.links?.[0]"
                  :previews="currentPreview.previews"
                  :read-only="isPreviewPlayerReadOnly"
                  :task="task"
                  :task-type-map="taskTypeMap"
                  @add-extra-preview="onAddExtraPreviewClicked"
                  @annotation-changed="onAnnotationChanged"
                  @change-current-preview="changeCurrentPreview"
                  @remove-extra-preview="onRemoveExtraPreviewClicked"
                  @previews-order-changed="onPreviewsOrderChanged"
                  @frame-updated="onFrameUpdated"
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
                    <td class="field-label">
                      {{ $t('tasks.fields.estimation') }}
                    </td>
                    <td>{{ formatDuration(task.estimation) }}</td>
                  </tr>
                  <tr class="datatable-row">
                    <td class="field-label">
                      {{ $t('tasks.fields.duration') }}
                    </td>
                    <td>{{ formatDuration(task.duration) }}</td>
                  </tr>
                  <tr class="datatable-row">
                    <td class="field-label">
                      {{ $t('tasks.fields.retake_count') }}
                    </td>
                    <td>{{ task.retake_count }}</td>
                  </tr>
                  <tr class="datatable-row">
                    <td class="field-label">
                      {{ $t('tasks.fields.start_date') }}
                    </td>
                    <td>{{ formatSimpleDate(task.start_date) }}</td>
                  </tr>
                  <tr class="datatable-row">
                    <td class="field-label">
                      {{ $t('tasks.fields.due_date') }}
                    </td>
                    <td>{{ formatSimpleDate(task.due_date) }}</td>
                  </tr>
                  <tr class="datatable-row">
                    <td class="field-label">
                      {{ $t('tasks.fields.end_date') }}
                    </td>
                    <td>{{ formatSimpleDate(task.end_date) }}</td>
                  </tr>
                  <tr class="datatable-row">
                    <td class="field-label">
                      {{ $t('tasks.fields.done_date') }}
                    </td>
                    <td>{{ formatSimpleDate(task.done_date) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="pa2"></div>
        </div>

        <div class="task-column comments-column">
          <div v-if="task">
            <div>
              <add-comment
                ref="add-comment"
                :frame="currentFrame"
                :is-error="errors.addComment"
                :is-max-retakes-error="errors.addCommentMaxRetakes"
                :is-loading="loading.addComment"
                :is-movie="isMovie"
                :team="currentTeam"
                :task="task"
                :task-status="taskStatusForCurrentUser"
                :preview-forms="previewForms"
                :fps="currentFps"
                :revision="currentRevision"
                @add-comment="addComment"
                @add-preview="onAddPreviewClicked"
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
                <XyzTransitionGroup
                  appear
                  v-xyz="{ fade: false, up: false, 'flip-up': false }"
                >
                  <comment
                    :key="comment.id"
                    :comment="comment"
                    :fps="currentFps"
                    :frame="currentFrame"
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
              <div class="no-comment" v-else>
                <em>
                  {{ $t('tasks.no_comment') }}
                </em>
              </div>
            </div>
          </div>

          <div class="has-text-centered" v-if="taskLoading.isLoading">
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
        :fps="currentFps"
        :expected-frames="entityFrames"
        :title="
          task
            ? `${task.entity_name} / ${taskTypeMap.get(task.task_type_id).name}`
            : ''
        "
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
        :title="
          task
            ? `${task.entity_name} / ${taskTypeMap.get(task.task_type_id).name}`
            : ''
        "
        @cancel="hideExtraPreviewModal"
        @confirm="createExtraPreview"
      />

      <edit-comment-modal
        :active="modals.editComment"
        :frame="currentFrame"
        :is-loading="loading.editComment"
        :is-error="errors.editComment"
        :comment-to-edit="commentToEdit"
        :team="currentTeam"
        :fps="currentFps"
        :revision="currentRevision"
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
import { CornerLeftUpIcon, ImageIcon } from 'lucide-vue-next'
import { mapGetters, mapActions } from 'vuex'

import drafts from '@/lib/drafts'
import { getTaskEntityPath, getTaskEntitiesPath } from '@/lib/path'
import { sortPeople } from '@/lib/sorting'

import { formatListMixin } from '@/components/mixins/format'
import { taskMixin } from '@/components/mixins/task'

import AddComment from '@/components/widgets/AddComment.vue'
import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import Comment from '@/components/widgets/Comment.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditCommentModal from '@/components/modals/EditCommentModal.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import KitsuIcon from '@/components/widgets/KitsuIcon.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import SubscribeButton from '@/components/widgets/SubscribeButton.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'
import PreviewPlayer from '@/components/previews/PreviewPlayer.vue'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'

export default {
  name: 'task',

  mixins: [formatListMixin, taskMixin],

  components: {
    AddComment,
    AddPreviewModal,
    ComboboxStyled,
    Comment,
    CornerLeftUpIcon,
    DeleteModal,
    EditCommentModal,
    EntityThumbnail,
    KitsuIcon,
    ImageIcon,
    PageSubtitle,
    PeopleAvatar,
    PreviewPlayer,
    Spinner,
    SubscribeButton,
    TaskTypeName,
    ValidationTag,
    ViewPlaylistModal
  },

  provide() {
    return {
      draftComment: this.draftComment
    }
  },

  data() {
    return {
      draftComment: {},
      previewForms: [],
      currentFrame: 0,
      currentTask: null,
      hookupPlaylistTaskIds: [],
      selectedTab: 'validation',
      taskLoading: {
        isLoading: true,
        isError: false
      },
      modals: {
        addPreview: false,
        addExtraPreview: false,
        deleteExtraPreview: false,
        deleteComment: false,
        editComment: false,
        hookupPlaylist: false
      },
      loading: {
        addComment: false,
        addPreview: false,
        addExtraPreview: false,
        setPreview: false,
        deleteComment: false,
        editComment: false
      },
      errors: {
        addComment: false,
        addCommentMaxRetakes: false,
        addPreview: false,
        addExtraPreview: false,
        setPreview: false,
        deleteComment: false,
        editComment: false
      },
      addPreviewFormData: null,
      addExtraPreviewFormData: null,
      task: null,
      taskComments: [],
      taskPreviews: [],
      commentToEdit: null,
      selectedPreviewId: null
    }
  },

  created() {
    this.clearSelectedTasks()
  },

  mounted() {
    this.loadTaskData().then(() => {
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
      'isCurrentUserArtist',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isSingleEpisode',
      'isTVShow',
      'personMap',
      'productionMap',
      'route',
      'shotMap',
      'taskEntityPreviews',
      'taskStatus',
      'taskStatusForCurrentUser',
      'taskMap',
      'taskTypeMap',
      'user'
    ]),

    currentEntity() {
      return this.task && this.task.entity
    },

    previewOptions() {
      return [...this.taskPreviews]
        .sort((a, b) => b.revision - a.revision)
        .map(preview => {
          return {
            label: `v${preview.revision}`,
            value: preview.id
          }
        })
    },

    isPreviewButtonVisible() {
      return (
        this.isCurrentUserManager &&
        this.task &&
        this.task.entity &&
        this.task.entity.preview_file_id !== this.currentPreviewId &&
        ['png', 'mp4'].includes(this.extension)
      )
    },

    isMovie() {
      return this.extension === 'mp4'
    },

    isPreviewPlayerReadOnly() {
      if (this.task) {
        if (this.isCurrentUserManager || this.isCurrentUserClient) {
          return false
        } else if (this.isCurrentUserSupervisor) {
          if (this.user.departments.length === 0) {
            return false
          } else {
            return !this.user.departments.includes(this.taskType?.department_id)
          }
        }
      }
      return true
    },

    extension() {
      return this.currentPreview ? this.currentPreview.extension : ''
    },

    currentPreviewId() {
      return this.currentPreview ? this.currentPreview.id : ''
    },

    currentPreview() {
      if (this.isPreviews) {
        let currentPreview = this.taskPreviews[0]
        const previewId = this.route.params.preview_id
        if (this.selectedPreviewId) {
          currentPreview = this.taskPreviews.find(preview => {
            return preview.id === previewId
          })
        }
        return currentPreview
      } else {
        return null
      }
    },

    currentPreviewComment() {
      return this.taskComments.find(comment =>
        comment.previews?.some(
          preview => preview.revision === this.currentRevision
        )
      )
    },

    currentRevision() {
      return this.currentPreview?.revision || 0
    },

    taskTypeBorder() {
      let border = 'transparent'
      if (this.task) border = this.task.task_type_color
      return {
        'border-left': `4px solid ${border}`
      }
    },

    deleteTaskPath() {
      return this.taskPath(this.task, 'task-delete')
    },

    isPreviews() {
      return this.taskPreviews && this.taskPreviews.length > 0
    },

    taskEntityPath() {
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

    taskEntitiesPath() {
      if (this.task) {
        const episodeId = this.currentEpisode
          ? this.currentEpisode.id
          : this.$route.params.episode_id
        return getTaskEntitiesPath(this.task, episodeId)
      } else {
        return {
          name: 'open-productions'
        }
      }
    },

    entityList() {
      const hasEntity = this.displayedShots.some(
        entity => entity.id === this.task.entity_id
      )
      return hasEntity ? this.displayedShots : this.displayedAssets
    },

    previousEntity() {
      if (this.task) {
        const taskTypeId = this.task.task_type_id
        const entityIndex = this.entityList.findIndex(entity => {
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
            taskId = entity.tasks.find(ctaskId => {
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

    nextEntity() {
      if (this.task) {
        const taskTypeId = this.task.task_type_id
        let firstTraversal = false
        const entityIndex = this.entityList.findIndex(entity => {
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
            taskId = entity.tasks.find(ctaskId => {
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

    title() {
      if (this.task) {
        const type = this.task.entity_type_name
        let entityName = this.task.full_entity_name || this.task.entity_name
        if (this.isTVShow && type === 'Shot') {
          entityName = entityName.split('/').splice(1).join('/')
        }
        if (this.isTVShow && type === 'Episode') {
          entityName = this.task.entity_name
        }
        return `${entityName}`
      } else {
        return 'Loading...'
      }
    },

    windowTitle() {
      if (this.task) {
        const taskTypeName = this.task.task_type_name
        return `${this.title} / ${taskTypeName}`
      } else {
        return 'Loading...'
      }
    },

    deleteText() {
      if (this.task) {
        const taskType = this.taskTypeMap.get(this.task.task_type_id)
        return this.$t('main.delete_text', {
          name: `${this.task.entity_name} / ${taskType.name}`
        })
      } else {
        return ''
      }
    },

    assignees() {
      return sortPeople(
        this.task.assignees.map(personId => this.personMap.get(personId))
      )
    },

    isAssigned() {
      return (
        this.task?.assignees.some(personId => personId === this.user.id) ??
        false
      )
    },

    isCommentingAllowed() {
      return (
        this.isAssigned ||
        this.isCurrentUserClient ||
        this.isDepartmentSupervisor ||
        this.isCurrentUserManager
      )
    },

    isDepartmentSupervisor() {
      if (!this.isCurrentUserSupervisor) {
        return false
      }
      if (this.user.departments.length === 0) {
        return true
      }
      return this.user.departments.includes(this.taskType?.department_id)
    },

    isHookupButtonVisible() {
      // only show the hookup button for shots
      return this.task?.entity_type_name === 'Shot'
    },

    taskType() {
      return this.taskTypeMap.get(this.task?.task_type_id)
    },

    currentTeam() {
      return sortPeople(
        this.currentProduction.team.map(personId =>
          this.personMap.get(personId)
        )
      )
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
      'loadComment',
      'loadEpisodes',
      'loadTask',
      'loadShots',
      'loadAssets',
      'loadPreviewFileFormData',
      'loadTaskComments',
      'refreshComment',
      'refreshPreview',
      'pinComment',
      'subscribeToTask',
      'setCurrentEpisode',
      'unsubscribeFromTask',
      'updatePreviewAnnotation'
    ]),

    loadTaskData() {
      const task = this.getCurrentTask()
      if (!task) {
        this.taskLoading = { isLoading: true, isError: false }
        return this.loadTask({ taskId: this.route.params.task_id })
          .then(task => {
            let loadingFunction = callback => {
              this.loadAssets().then(callback)
            }

            if (task.entity_type_name === 'Shot') {
              loadingFunction = callback => {
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
            return loadingFunction(() => {
              this.task = task
              return this.loadTaskComments({
                taskId: task.id,
                entityId: task.entity_id
              })
                .then(() => {
                  this.reset()
                  this.taskLoading = { isLoading: false, isError: false }
                })
                .catch(err => {
                  console.error(err)
                  this.taskLoading = { isLoading: false, isError: true }
                })
            })
          })
          .catch(err => {
            console.error(err)
            this.taskLoading = { isLoading: false, isError: true }
          })
      } else {
        const taskId = this.route.params.task_id
        this.task = task
        return this.loadTaskComments({
          taskId,
          entityId: task.entity_id
        })
          .then(() => {
            this.reset()
          })
          .catch(err => {
            console.error(err)
            this.taskLoading.isError = true
          })
          .finally(() => {
            this.taskLoading.isLoading = false
          })
      }
    },

    getCurrentTask() {
      return this.taskMap.get(this.route.params.task_id)
    },

    getCurrentTaskComments() {
      return this.getTaskComments(this.route.params.task_id)
    },

    getCurrentTaskPreviews() {
      return this.getTaskPreviews(this.route.params.task_id)
    },

    addComment(
      comment,
      attachment,
      checklist,
      taskStatusId,
      revision = undefined,
      link = undefined
    ) {
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
        this.previewForms.length > 0 ? 'commentTaskWithPreview' : 'commentTask'
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
        })
        .catch(err => {
          console.error(err)
          this.errors.addComment = true
          this.loading.addComment = false
          const isRetakeError = err.body?.message?.includes('retake') ?? false
          this.errors.addComment = !isRetakeError
          this.errors.addCommentMaxRetakes = isRetakeError
        })
    },

    hideHookupPlaylistModal() {
      this.modals.hookupPlaylist = false
    },

    showHookupPlaylistModal() {
      // create a playlist with the previous, current and next task
      const current_task_id = this.task.id

      const tasks = Array.from(this.taskMap.values())
        // get all tasks for this entity
        .filter(
          task =>
            task.episode_id === this.task.episode_id &&
            task.sequence_name === this.task.sequence_name &&
            task.task_type_id === this.task.task_type_id
        )
        // sort the tasks by entity_name
        .sort((a, b) =>
          a.entity_name.localeCompare(b.entity_name, undefined, {
            numeric: true
          })
        )

      const current_task_index = tasks.findIndex(
        task => task.id === current_task_id
      )

      const previous_task_id =
        current_task_index > 0 ? tasks[current_task_index - 1].id : null

      const next_task_id =
        current_task_index < tasks.length - 1
          ? tasks[current_task_index + 1].id
          : null

      this.hookupPlaylistTaskIds = [current_task_id]
      if (previous_task_id) this.hookupPlaylistTaskIds.unshift(previous_task_id)
      if (next_task_id) this.hookupPlaylistTaskIds.push(next_task_id)

      // open the playlist
      this.modals.hookupPlaylist = true
    },

    reset({ keepPreviewFiles = false } = {}) {
      this.resetModals()
      this.resetPreview(false)
      if (!keepPreviewFiles) {
        this.clearPreviewFiles(false)
      }
      this.taskComments = this.getCurrentTaskComments()
      this.taskPreviews = this.getCurrentTaskPreviews()
      this.task = this.getCurrentTask()
      this.resetDraft()
      setTimeout(() => {
        if (this.$route.params.preview_id) {
          this.selectedPreviewId = this.$route.params.preview_id
        }
      }, 200)
    },

    selectFile(forms) {
      this.previewForms = this.previewForms.concat(forms)
      this.loadPreviewFileFormData(this.previewForms)
    },

    clearPreviewFiles() {
      this.previewForms = []
      this.loadPreviewFileFormData(this.previewForms)
      this.$store.commit('CLEAR_UPLOAD_PROGRESS')
    },

    isHighlighted(comment) {
      return comment.preview && comment.preview.id === this.currentPreviewId
    },

    createExtraPreview(forms) {
      this.selectFile(forms)
      this.errors.addExtraPreview = false
      this.loading.addExtraPreview = true
      const comment = this.getCurrentTaskComments().find(comment =>
        comment.previews.find(preview => preview.id === this.currentPreviewId)
      )
      this.addCommentExtraPreview({
        taskId: this.task.id,
        commentId: comment?.id,
        previewId: this.currentPreviewId
      })
        .then(() => {
          this.loading.addExtraPreview = false
          this.modals.addExtraPreview = false
          this.$refs['add-extra-preview-modal'].reset()
          this.clearPreviewFiles()
          setTimeout(() => {
            this.$refs['preview-player'].displayLast()
          }, 0)
        })
        .catch(err => {
          console.error(err)
          this.errors.addExtraPreview = true
          this.loading.addExtraPreview = false
        })
    },

    resetPreview(changeRoute = true) {
      const previews = this.taskPreviews || []
      const preview = previews.length > 0 ? previews[0] : null
      this.taskComments = this.getCurrentTaskComments()
      this.taskPreviews = this.getCurrentTaskPreviews()
      if (preview && changeRoute) {
        this.$router.push(this.previewPath(preview.id))
      }
    },

    setPreview() {
      const previewPlayer = this.$refs['preview-player']
      if (!previewPlayer) return
      this.loading.setPreview = true
      this.errors.setPreview = false
      const previewId = previewPlayer.currentPreview.id
      this.$store
        .dispatch('setPreview', {
          taskId: this.task.id,
          entityId: this.task.entity.id,
          previewId
        })
        .then(() => {
          this.loading.setPreview = false
        })
        .catch(err => {
          console.error(err)
          this.errors.setPreview = true
        })
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

    confirmDeleteTaskPreview() {
      this.loading.deleteExtraPreview = true
      this.errors.deleteExtraPreview = false
      const previewId = this.currentPreviewId
      const comment = this.getCurrentTaskComments().find(comment => {
        return comment.previews.findIndex(p => p.id === previewId) >= 0
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
        .catch(err => {
          console.error(err)
          this.loading.deleteExtraPreview = false
          this.errors.deleteExtraPreview = true
        })
    },

    onPreviewAdded(eventData) {
      const taskId = eventData.task_id
      const commentId = eventData.comment_id
      const previewId = eventData.preview_file_id
      const revision = eventData.revision
      const extension = eventData.extension
      const comment = this.$store.getters.getTaskComment(taskId, commentId)

      if (
        this.task &&
        comment &&
        comment.previews &&
        (comment.previews.length === 0 ||
          comment.previews[0].id !== previewId) &&
        taskId === this.task.id
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

    taskPath(task, section = 'task') {
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

    previewPath(previewId) {
      const route = this.taskPath(this.task, 'task-preview')
      if (this.isTVShow) {
        const taskType = this.taskTypeMap.get(this.task.task_type_id)
        route.name = 'episode-task-preview'
        if (taskType.for_entity === 'Episode') {
          route.name = 'episode-episode-task-preview'
        }
      }
      if (route.params) {
        route.params.preview_id = previewId
      }
      return route
    },

    onAnnotationChanged({ preview, additions, deletions, updates }) {
      const taskId = this.task.id
      this.updatePreviewAnnotation({
        taskId,
        preview,
        additions,
        deletions,
        updates
      })
    },

    onAddExtraPreviewClicked() {
      this.clearPreviewFiles()
      this.modals.addExtraPreview = true
    },

    onRemoveExtraPreviewClicked(preview) {
      this.showRemoveExtraPreviewModal(preview)
    },

    hideExtraPreviewModal() {
      this.modals.addExtraPreview = false
    },

    showRemoveExtraPreviewModal(preview) {
      this.currentExtraPreviewId = preview.id
      this.modals.deleteExtraPreview = true
    },

    hideRemoveExtraPreviewModal() {
      this.modals.deleteExtraPreview = false
    },

    onAddPreviewClicked() {
      this.modals.addPreview = true
    },

    closeAddPreviewModal() {
      this.modals.addPreview = false
    },

    confirmAddPreviewModal(forms) {
      this.selectFile(forms)
      this.closeAddPreviewModal()
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

    onFrameUpdated(frame) {
      this.currentFrame = frame
    },

    onPreviewFormRemoved(previewForm) {
      this.previewForms = this.previewForms.filter(f => f !== previewForm)
      this.loadPreviewFileFormData(this.previewForms)
    },

    changeCurrentPreview(preview) {
      this.$router.push(this.previewPath(preview.id))
    },

    onRemoteAcknowledge(eventData, type) {
      if (this.task) {
        const comment = this.taskComments.find(
          c => c.id === eventData.comment_id
        )
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
      const comments = this.taskComments
      const comment = comments[index]
      return (
        index === comments.length - 1 ||
        comment.task_status_id !== comments[index + 1].task_status_id
      )
    },

    timeCodeClicked({
      versionRevision,
      minutes,
      seconds,
      milliseconds,
      frame
    }) {
      this.changeCurrentPreview(
        this.taskPreviews.find(p => p.revision === parseInt(versionRevision))
      )
      setTimeout(() => {
        this.$refs['preview-player']?.setCurrentFrame(frame)
        this.$refs['preview-player']?.focus()
      }, 100)
    },

    onPreviewsOrderChanged() {
      this.taskPreviews = this.getCurrentTaskPreviews()
    },

    async extractAnnotationSnapshots() {
      this.$refs['add-comment'].showAnnotationLoading()
      const files =
        await this.$refs['preview-player'].extractAnnotationSnapshots()
      this.$refs['add-comment'].setAnnotationSnapshots(files)
      this.$refs['add-comment'].hideAnnotationLoading()
      return files
    }
  },

  watch: {
    $route() {
      if (this.task && this.$route.params.task_id !== this.task.id) {
        this.loadTaskData()
      }
      if (this.$route.params.preview_id !== this.selectedPreviewId) {
        this.selectedPreviewId = this.$route.params.preview_id
      }
    },

    currentProduction() {
      this.loadTaskData()
    },

    selectedPreviewId() {
      if (this.task) {
        this.$router.push(this.previewPath(this.selectedPreviewId))
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

      'comment:acknowledge'(eventData) {
        this.onRemoteAcknowledge(eventData, 'ack')
      },

      'comment:unacknowledge'(eventData) {
        this.onRemoteAcknowledge(eventData, 'unack')
      },

      'comment:new'(eventData) {
        setTimeout(() => {
          if (
            this.getCurrentTaskComments().length !== this.taskComments.length
          ) {
            this.taskComments = this.getCurrentTaskComments()
            this.taskPreviews = this.getCurrentTaskPreviews()
          }
        }, 1000)
      },

      'comment:update'(eventData) {
        const commentId = eventData.comment_id
        if (!this.taskComments.some(({ id }) => id === commentId)) {
          return
        }
        this.loadComment({ commentId }).catch(console.error)
      },

      'comment:reply'(eventData) {
        if (this.task) {
          const comment = this.taskComments.find(
            c => c.id === eventData.comment_id
          )
          if (comment) {
            if (!comment.replies) comment.replies = []
            const hasReply = comment.replies.some(
              reply => reply.id === eventData.reply_id
            )
            if (!hasReply) {
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
        if (task) {
          const comments = this.getComments()
          const comment = comments.find(c => c.id === eventData.comment_id)
          if (comment) {
            this.$store.commit('REMOVE_TASK_COMMENT', { task, comment })
            this.taskComments = this.getCurrentTaskComments()
            this.taskPreviews = this.getCurrentTaskPreviews()
          }
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

  head() {
    let title = 'Loading task... - Kitsu'
    if (this.task) {
      const taskTypeName = this.taskTypeMap.get(this.task.task_type_id).name
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
  background: #46494f;
  border-color: $dark-grey;
  box-shadow: 0 0 6px #333;
}

h2.subtitle {
  border: 0;
  margin: 0;
  padding: 0;
}

.page {
  background: #f9f9f9;
  margin-top: 60px;
  padding: 0;
}

.page.column {
  background: var(--background-page);
  padding-bottom: 1em;
}

.page-header {
  margin: 1em 1em 0 1em;
  padding-right: 0;
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
  color: #aaa;
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
  box-shadow: 0 0 6px #e0e0e0;
}

.no-comment {
  background: white;
  box-shadow: 0 0 6px #e0e0e0;
  padding: 1em;
  border-radius: 5px;
}

.comment {
  box-shadow: 0 0 6px #e0e0e0;
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

.title {
  margin: 0;
  flex: 1;
  line-height: 1.5em;
  font-weight: 500;
  color: $grey;
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
