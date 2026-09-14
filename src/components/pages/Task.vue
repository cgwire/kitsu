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

          <div class="flexrow-item block flexrow task-type">
            <router-link
              class="flexrow-item mt05"
              :to="previousEntityTaskPath"
              v-if="previousEntityTaskPath"
            >
              <chevron-left-icon />
            </router-link>

            <router-link
              class="flexrow-item mt05"
              :to="nextEntityTaskPath"
              v-if="nextEntityTaskPath"
            >
              <chevron-right-icon />
            </router-link>
            <task-type-name
              class="flexrow-item"
              :task-type="taskType"
              :production-id="currentProduction?.id"
              v-if="taskType"
            />
          </div>

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
            <router-link
              :to="taskEntityPath"
              v-if="!isCurrentUserClient && taskEntityPath"
            >
              {{ title }}
            </router-link>
            <template v-else>
              {{ title }}
            </template>
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

            <router-link
              class="flexrow-item"
              :to="previousTaskPath"
              v-if="previousTaskPath"
            >
              <chevron-up-icon />
            </router-link>

            <router-link
              class="flexrow-item"
              :to="nextTaskPath"
              v-if="nextTaskPath"
            >
              <chevron-down-icon />
            </router-link>
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
                  class="button flexrow-item playlist-button"
                  @click="showHookupPlaylistModal"
                  v-if="isHookupButtonVisible"
                >
                  <kitsu-icon
                    name="playlists"
                    :title="$t('tasks.hookup_playlist')"
                  />
                </button>
                <button
                  class="button flexrow-item mr0"
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
                <label
                  class="flexrow-item pointer"
                  v-if="isMovie && isCurrentUserManager"
                >
                  <input
                    class="mr02"
                    type="checkbox"
                    v-model="isUseCurrentFrame"
                  />
                  {{ $t('tasks.use_current_frame') }}
                </label>
                <span class="error flexrow-item" v-if="errors.setPreview">
                  {{ $t('tasks.set_preview_error') }}
                </span>
              </div>
              <view-playlist-modal
                active
                sort
                :task-ids="hookupPlaylistTaskIds"
                @cancel="hideHookupPlaylistModal"
                v-if="modals.hookupPlaylist"
              />
            </div>

            <div class="preview-area mt1">
              <div v-if="isPreviews">
                <preview-player
                  ref="preview-player"
                  :entity-preview-files="taskEntityPreviews"
                  :extra-wide="true"
                  :fps="currentFps"
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
          <div
            class="flexrow-item block mt1 mr0 info-block"
            v-if="!isCurrentUserClient"
          >
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
                    <td>{{ formatDisplayDate(task.start_date) }}</td>
                  </tr>
                  <tr class="datatable-row">
                    <td class="field-label">
                      {{ $t('tasks.fields.due_date') }}
                    </td>
                    <td>{{ formatDisplayDate(task.due_date) }}</td>
                  </tr>
                  <tr class="datatable-row">
                    <td class="field-label">
                      {{ $t('tasks.fields.end_date') }}
                    </td>
                    <td>{{ formatDisplayDate(task.end_date) }}</td>
                  </tr>
                  <tr class="datatable-row">
                    <td class="field-label">
                      {{ $t('tasks.fields.done_date') }}
                    </td>
                    <td>{{ formatDisplayDate(task.done_date) }}</td>
                  </tr>
                  <tr
                    class="datatable-row"
                    :key="descriptor.id"
                    v-for="descriptor in taskMetadata"
                  >
                    <td class="field-label">{{ descriptor.name }}</td>
                    <td
                      :class="{
                        'pre-wrap': descriptor.data_type === 'textarea'
                      }"
                    >
                      <a
                        :href="task.data[descriptor.field_name]"
                        target="_blank"
                        rel="noopener noreferrer"
                        v-if="
                          descriptor.data_type === 'url' &&
                          task.data &&
                          task.data[descriptor.field_name]
                        "
                      >
                        {{ task.data[descriptor.field_name] }}
                      </a>
                      <span
                        class="flexrow"
                        v-else-if="
                          descriptor.data_type === 'person' &&
                          personForDescriptor(descriptor)
                        "
                      >
                        <people-avatar
                          class="flexrow-item"
                          :person="personForDescriptor(descriptor)"
                          :size="22"
                          :font-size="11"
                          :is-link="false"
                        />
                        <span class="flexrow-item">
                          {{ personForDescriptor(descriptor).name }}
                        </span>
                      </span>
                      <template v-else>
                        {{ getTaskMetadataValue(descriptor) }}
                      </template>
                    </td>
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
                :is-picture="isPicture"
                :is-status-locked="isMentionedOnly"
                :team="currentTeam"
                :task-types="currentTaskTypes"
                :task="task"
                :task-status="taskStatusForCurrentUser"
                :preview-forms="previewForms"
                :fps="currentFps"
                :revision="currentRevision"
                @add-comment="postComment"
                @add-preview="onAddPreviewClicked"
                @file-drop="selectFile"
                @clear-files="clearPreviewFiles"
                @annotation-snapshots-requested="extractAnnotationSnapshots"
                @annotation-snapshots-with-label-requested="
                  extractAnnotationSnapshots(true)
                "
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
                      isMentioned ||
                      isDepartmentSupervisor ||
                      isCurrentUserManager
                    "
                    :revision="currentRevision"
                    :task="task"
                    :team="currentTeam"
                    :task-types="currentTaskTypes"
                    @ack-comment="onAckComment"
                    @duplicate-comment="onDuplicateComment"
                    @pin-comment="onPinComment"
                    @edit-comment="onEditComment"
                    @delete-comment="onDeleteComment"
                    @toggle-for-client="onToggleForClient"
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
            ? `${task.entity_name} / ${taskTypeMap.get(task.task_type_id)?.name || ''}`
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
            ? `${task.entity_name} / ${taskTypeMap.get(task.task_type_id)?.name || ''}`
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
        :task-types="currentTaskTypes"
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

<script setup>
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
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CornerLeftUpIcon,
  ImageIcon
} from 'lucide-vue-next'

import drafts from '@/lib/drafts'
import func from '@/lib/func'
import { getTaskEntityPath, getTaskEntitiesPath } from '@/lib/path'
import { formatRevision } from '@/lib/preview'
import {
  getTaskTypePriorityOfProd,
  getTaskTypeWithUrl
} from '@/lib/productions'
import { sortPeople } from '@/lib/sorting'
import {
  formatDisplayDate as formatDisplayDateLib,
  formatDuration as formatDurationLib
} from '@/lib/time'
import { DEFAULT_FPS } from '@/lib/video'

import assetsStore from '@/store/modules/assets'
import editsStore from '@/store/modules/edits'
import episodesStore from '@/store/modules/episodes'
import sequencesStore from '@/store/modules/sequences'
import shotsStore from '@/store/modules/shots'

/* eslint-disable no-unused-vars */
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
import PreviewPlayer from '@/components/players/players/PreviewPlayer.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import SubscribeButton from '@/components/widgets/SubscribeButton.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'
/* eslint-enable no-unused-vars */

defineOptions({
  name: 'task'
})

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const instance = getCurrentInstance()
const socket = instance.appContext.config.globalProperties.$socket

// State
// --------------------------------------------------------------------------
const task = ref(null)
const taskComments = ref([])
const taskPreviews = ref([])
const commentToEdit = ref(null)
const selectedPreviewId = ref(null)
const previewForms = ref([])
const currentFrame = ref(0)
const isUseCurrentFrame = ref(false)
const hookupPlaylistTaskIds = ref([])
const addPreviewFormData = ref(null)
const addExtraPreviewFormData = ref(null)
const currentExtraPreviewId = ref(null)

const taskLoading = ref({ isLoading: true, isError: false })

const modals = ref({
  addPreview: false,
  addExtraPreview: false,
  deleteExtraPreview: false,
  deleteComment: false,
  editComment: false,
  hookupPlaylist: false
})

const loading = ref({
  addComment: false,
  addPreview: false,
  addExtraPreview: false,
  setPreview: false,
  deleteComment: false,
  editComment: false
})

const errors = ref({
  addComment: false,
  addCommentMaxRetakes: false,
  addPreview: false,
  addExtraPreview: false,
  setPreview: false,
  deleteComment: false,
  editComment: false
})

// AddComment injects 'draftComment' to keep an unsent comment across
// remounts; Edit.vue mirrors the same provision.
const draftComment = reactive({})
provide('draftComment', draftComment)

const taskColumns = useTemplateRef('task-columns')
const previewPlayerRef = useTemplateRef('preview-player')
const addCommentRef = useTemplateRef('add-comment')
const addPreviewModalRef = useTemplateRef('add-preview-modal')
const addExtraPreviewModalRef = useTemplateRef('add-extra-preview-modal')

// Computed (Vuex getters)
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const getTaskComments = computed(() => store.getters.getTaskComments)
const getTaskPreviews = computed(() => store.getters.getTaskPreviews)
const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isTVShow = computed(() => store.getters.isTVShow)
const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)
const shotMap = computed(() => store.getters.shotMap)
const taskEntityPreviews = computed(() => store.getters.taskEntityPreviews)
const taskStatusForCurrentUser = computed(
  () => store.getters.taskStatusForCurrentUser
)
const taskMap = computed(() => store.getters.taskMap)
const taskMetadataDescriptors = computed(
  () => store.getters.taskMetadataDescriptors
)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const user = computed(() => store.getters.user)
const organisation = computed(() => store.getters.organisation)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserProductionSupervisor
)

// Computed (entity lists)
// --------------------------------------------------------------------------
const currentType = computed(() => {
  const genericNames = ['Shot', 'Episode', 'Sequence', 'Edit']
  if (genericNames.includes(task.value?.entity_type_name)) {
    return task.value.entity_type_name
  }
  return 'Asset'
})

// The legacy component reached these through `this[`${type}List`]`; an
// explicit map keeps the dynamic lookup without relying on the instance proxy.
const entityListsByType = {
  Asset: () => assetsStore.cache.assets,
  Edit: () => editsStore.cache.edits,
  Episode: () => episodesStore.cache.episodes,
  Sequence: () => sequencesStore.cache.sequences,
  Shot: () => shotsStore.cache.shots
}

const entityList = computed(() => entityListsByType[currentType.value]())

// Computed (task)
// --------------------------------------------------------------------------
const taskMetadata = computed(() => {
  if (!task.value) return []
  return taskMetadataDescriptors.value.filter(
    descriptor => descriptor.task_type_id === task.value.task_type_id
  )
})

const currentEntity = computed(() => task.value && task.value.entity)

const taskType = computed(() => taskTypeMap.value.get(task.value?.task_type_id))

// Ported from taskMixin: an entity can override the production fps via
// data.fps; use it so the player builds its frame model on the rate the video
// was actually rendered at (otherwise frames get duplicated/dropped). The
// entity may be a Shot, Edit, Sequence, Episode or Asset, each in its own
// store map, and task.entity is only { id } here.
const getTaskEntity = currentTask => {
  const getterByType = {
    Shot: 'shotMap',
    Episode: 'episodeMap',
    Sequence: 'sequenceMap',
    Edit: 'editMap',
    Asset: 'assetMap'
  }
  const getterName = getterByType[currentTask?.entity_type_name]
  if (!getterName || !currentTask?.entity?.id) return null
  return store.getters[getterName]?.get(currentTask.entity.id) || null
}

const currentFps = computed(() => {
  if (!task.value) return DEFAULT_FPS
  const entityFps = parseFloat(getTaskEntity(task.value)?.data?.fps)
  if (entityFps) return entityFps
  return (
    parseInt(productionMap.value.get(task.value.project_id)?.fps) || DEFAULT_FPS
  )
})

const entityFrames = computed(() => {
  if (!task.value || !task.value.entity) return 0
  const shot = shotMap.value.get(task.value.entity.id)
  if (!shot || !shot.nb_frames) return 0
  return shot.nb_frames
})

const isPreviews = computed(
  () => taskPreviews.value && taskPreviews.value.length > 0
)

const previewOptions = computed(() =>
  [...taskPreviews.value]
    .sort((a, b) => b.revision - a.revision)
    .map(preview => ({
      label: formatRevision(preview.revision, currentProduction.value),
      value: preview.id
    }))
)

// selectedPreviewId and route.params.preview_id are kept in sync both ways,
// so read the selection from one source only. An id that survives in the url
// after its preview is gone would otherwise blank the player out.
const currentPreview = computed(() => {
  if (!isPreviews.value) return null
  const previewId = selectedPreviewId.value
  if (!previewId) return taskPreviews.value[0]
  return (
    taskPreviews.value.find(item => item.id === previewId) ??
    taskPreviews.value[0]
  )
})

const currentPreviewId = computed(() =>
  currentPreview.value ? currentPreview.value.id : ''
)

const currentPreviewComment = computed(() =>
  taskComments.value.find(comment =>
    comment.previews?.some(
      preview => preview.revision === currentRevision.value
    )
  )
)

const currentRevision = computed(() => currentPreview.value?.revision || 0)

const extension = computed(() =>
  currentPreview.value ? currentPreview.value.extension : ''
)

const isMovie = computed(() => extension.value === 'mp4')

const isPicture = computed(() => ['png', 'gif'].includes(extension.value))

const isPreviewPlayerReadOnly = computed(() => {
  if (task.value) {
    if (isCurrentUserManager.value || isCurrentUserClient.value) {
      return false
    } else if (isCurrentUserSupervisor.value) {
      if (user.value.departments.length === 0) {
        return false
      }
      return !user.value.departments.includes(taskType.value?.department_id)
    }
  }
  return true
})

// Computed (navigation)
// --------------------------------------------------------------------------
const taskEntityPath = computed(() => {
  if (!task.value) return { name: 'open-productions' }
  const episodeId = currentEpisode.value
    ? currentEpisode.value.id
    : route.params.episode_id
  return getTaskEntityPath(task.value, episodeId)
})

const taskEntitiesPath = computed(() => {
  if (!task.value) return { name: 'open-productions' }
  const episodeId = currentEpisode.value
    ? currentEpisode.value.id
    : route.params.episode_id
  return getTaskEntitiesPath(task.value, episodeId)
})

const sortedEntityTasks = entity => {
  const tasks = [...(entity.tasks || [])]
  return tasks.sort((a, b) => {
    const taskA = taskMap.value.get(a)
    const taskB = taskMap.value.get(b)
    const taskTypeA = taskTypeMap.value.get(taskA?.task_type_id)
    const taskTypeB = taskTypeMap.value.get(taskB?.task_type_id)
    return (
      getTaskTypePriorityOfProd(taskTypeA, currentProduction.value) -
      getTaskTypePriorityOfProd(taskTypeB, currentProduction.value)
    )
  })
}

/*
 * Get the path to the previous task in the current entity.
 */
const previousEntityTaskPath = computed(() => {
  if (!task.value) return null
  const entity = entityList.value.find(item => item.id === task.value.entity_id)
  if (!entity) return null
  const tasks = sortedEntityTasks(entity)
  const tasksLength = tasks.length
  const taskIndex = tasks.findIndex(taskId => taskId === task.value.id)
  const previousTaskIndex = taskIndex - 1
  const previousTaskId =
    previousTaskIndex < 0 ? tasks[tasksLength - 1] : tasks[previousTaskIndex]
  return previousTaskId ? taskPath({ id: previousTaskId }) : null
})

/*
 * Get the path to the next task in the current entity.
 */
const nextEntityTaskPath = computed(() => {
  if (!task.value) return null
  const entity = entityList.value.find(item => item.id === task.value.entity_id)
  if (!entity) return null
  const tasks = sortedEntityTasks(entity)
  const tasksLength = tasks.length
  const taskIndex = tasks.findIndex(taskId => taskId === task.value.id)
  const nextTaskIndex = taskIndex + 1
  const nextTaskId =
    nextTaskIndex >= tasksLength ? tasks[0] : tasks[nextTaskIndex]
  return nextTaskId ? taskPath({ id: nextTaskId }) : null
})

const getPreviousEntityIndex = index => {
  const result = index - 1
  return result < 0 ? entityList.value.length - 1 : result
}

const getNextEntityIndex = index => {
  const result = index + 1
  return result >= entityList.value.length ? 0 : result
}

const getEntityIndex = entityId =>
  entityList.value.findIndex(entity => entity.id === entityId)

const getTaskIdFromEntity = index => {
  const taskTypeId = task.value.task_type_id
  const entity = entityList.value[index]
  if (!entity?.tasks) return null
  return entity.tasks.find(ctaskId => {
    const entityTask = taskMap.value.get(ctaskId)
    return entityTask && entityTask.task_type_id === taskTypeId
  })
}

/*
 * Get the path to the previous task. The previous task is the fist task
 * found in the previous entities with the same task type.
 */
const previousTaskPath = computed(() => {
  if (!task.value) return null
  const entityIndex = getEntityIndex(task.value.entity_id)
  if (entityIndex === -1) return null

  let previousEntityIndex = getPreviousEntityIndex(entityIndex)
  let taskId = null
  while (!taskId && previousEntityIndex !== entityIndex) {
    taskId = getTaskIdFromEntity(previousEntityIndex)
    if (!taskId) {
      previousEntityIndex = getPreviousEntityIndex(previousEntityIndex)
    }
  }
  return taskId ? taskPath({ id: taskId }) : null
})

/*
 * Get the path to the next task. The next task is the fist task
 * found in the next entities with the same task type.
 */
const nextTaskPath = computed(() => {
  if (!task.value) return null
  const entityIndex = getEntityIndex(task.value.entity_id)
  if (entityIndex === -1) return null

  let nextEntityIndex = getNextEntityIndex(entityIndex)
  let taskId = null
  while (!taskId && nextEntityIndex !== entityIndex) {
    taskId = getTaskIdFromEntity(nextEntityIndex)
    if (!taskId) {
      nextEntityIndex = getNextEntityIndex(nextEntityIndex)
    }
  }
  return taskId ? taskPath({ id: taskId }) : null
})

// Computed (people and team)
// --------------------------------------------------------------------------
const title = computed(() => {
  if (!task.value) return t('main.loading')
  const type = task.value.entity_type_name
  let entityName = task.value.full_entity_name || task.value.entity_name
  if (isTVShow.value && type === 'Shot') {
    entityName = entityName.split('/').splice(1).join('/')
  }
  if (isTVShow.value && type === 'Episode') {
    entityName = task.value.entity_name
  }
  return `${entityName}`
})

const assignees = computed(() =>
  sortPeople(
    task.value.assignees
      .map(personId => personMap.value.get(personId))
      .filter(Boolean)
  )
)

const isAssigned = computed(
  () =>
    task.value?.assignees?.some(personId => personId === user.value?.id) ??
    false
)

const isMentioned = computed(() => {
  const personId = user.value?.id
  if (!personId) return false
  const departmentIds = user.value.departments || []
  // Replies carry their own mentions, and that is where people usually
  // get named once a conversation is going.
  const namesUser = entry =>
    (entry.mentions || []).includes(personId) ||
    (entry.department_mentions || []).some(departmentId =>
      departmentIds.includes(departmentId)
    )
  return taskComments.value.some(
    comment => namesUser(comment) || (comment.replies || []).some(namesUser)
  )
})

const isDepartmentSupervisor = computed(() => {
  if (!isCurrentUserSupervisor.value) return false
  if (user.value.departments.length === 0) return true
  return user.value.departments.includes(taskType.value?.department_id)
})

// In the conversation only because someone named them: they may answer,
// but the status stays where the assignees left it.
const isMentionedOnly = computed(
  () =>
    isMentioned.value &&
    !isAssigned.value &&
    !isCurrentUserClient.value &&
    !isDepartmentSupervisor.value &&
    !isCurrentUserManager.value
)

const isCommentingAllowed = computed(
  () =>
    isAssigned.value ||
    isMentioned.value ||
    isCurrentUserClient.value ||
    isDepartmentSupervisor.value ||
    isCurrentUserManager.value
)

const isHookupButtonVisible = computed(
  () => task.value?.entity_type_name === 'Shot'
)

const currentTeam = computed(() =>
  sortPeople(
    currentProduction.value?.team
      .map(personId => personMap.value.get(personId))
      .filter(Boolean) ?? []
  )
)

// get current task types for this project filtered by current task entity type (Shot or Asset)
const currentTaskTypes = computed(() => {
  if (!task.value || !currentProduction.value) return []

  // task types for this project
  const task_types = currentProduction.value.task_types

  // get the current task entity type eg. 'Shot' or 'Asset'
  const current_task_type = taskTypeMap.value.get(task.value.task_type_id)
  if (!current_task_type) return []
  const task_type_entity = current_task_type.for_entity
  const task_type_entity_slug = task_type_entity.toLowerCase() + 's'

  // lets get a map of all tasks that are the same entity
  // where the key is the task type id
  const entity_tasks = {}
  for (const keyValue of taskMap.value) {
    const entityTask = keyValue[1]
    if (entityTask.entity_id === task.value.entity_id)
      entity_tasks[entityTask.task_type_id] = entityTask
  }

  return (
    task_types
      // get all task type objects
      .map(taskTypeId => taskTypeMap.value.get(taskTypeId))

      // filter down to just those that match this task entity type Shot, Asset etc.
      .filter(item => item?.for_entity === task_type_entity)

      // filter to tasks that exist
      .filter(item => entity_tasks[item.id])

      // add a url that points to the task
      .map(item =>
        getTaskTypeWithUrl(item, entity_tasks[item.id], task_type_entity_slug)
      )
  )
})

// Functions (formatting)
// --------------------------------------------------------------------------
const formatDisplayDate = date =>
  formatDisplayDateLib(date, store.getters.dateFormat)

const formatDuration = (minutes, toLocale = true) =>
  formatDurationLib(organisation.value, minutes, toLocale)

const getTaskMetadataValue = descriptor => {
  const value = task.value?.data?.[descriptor.field_name]
  if (value == null || value === '') return ''
  if (descriptor.data_type === 'date') {
    return formatDisplayDate(value)
  }
  if (descriptor.data_type === 'boolean') {
    return value === 'true' ? t('main.yes') : t('main.no')
  }
  if (descriptor.data_type === 'person') {
    return personMap.value.get(value)?.name || ''
  }
  return value
}

const personForDescriptor = descriptor =>
  personMap.value.get(task.value?.data?.[descriptor.field_name]) || null

// Functions (routing)
// --------------------------------------------------------------------------
function taskPath(targetTask, section = 'task') {
  if (!targetTask) {
    targetTask = task.value
  } else {
    targetTask.project_id = task.value.project_id
    targetTask.episode_id = task.value.episode_id
  }

  let target = { name: 'open-productions' }
  if (targetTask) {
    target = {
      name: section,
      params: {
        type: currentType.value.toLowerCase() + 's',
        production_id: targetTask.project_id,
        task_id: targetTask.id
      }
    }

    if (isTVShow.value && currentEpisode.value) {
      target.name = `episode-${section}`
      target.params.episode_id =
        targetTask.episode_id || currentEpisode.value.id
    }
  }
  return target
}

const previewPath = previewId => {
  const target = taskPath(task.value, 'task-preview')
  if (isTVShow.value) {
    const type = taskTypeMap.value.get(task.value.task_type_id)
    target.name = 'episode-task-preview'
    if (type?.for_entity === 'Episode') {
      target.name = 'episode-episode-task-preview'
    }
  }
  if (target.params) {
    target.params.preview_id = previewId
  }
  return target
}

// Functions (data loading)
// --------------------------------------------------------------------------
const getCurrentTask = () => taskMap.value.get(route.params.task_id)

const getCurrentTaskComments = () => getTaskComments.value(route.params.task_id)

const getCurrentTaskPreviews = () => getTaskPreviews.value(route.params.task_id)

// Ported from taskMixin, which guarded refs the legacy template could omit.
const resetModals = () => {
  addPreviewModalRef.value?.reset()
}

const resetPreview = (changeRoute = true) => {
  const previews = taskPreviews.value || []
  const preview = previews.length > 0 ? previews[0] : null
  taskComments.value = getCurrentTaskComments()
  taskPreviews.value = getCurrentTaskPreviews()
  if (preview && changeRoute) {
    router.push(previewPath(preview.id))
  }
}

const clearPreviewFiles = () => {
  previewForms.value = []
  store.dispatch('loadPreviewFileFormData', previewForms.value)
  store.commit('CLEAR_UPLOAD_PROGRESS')
}

const reset = ({ keepPreviewFiles = false } = {}) => {
  resetModals()
  resetPreview(false)
  if (!keepPreviewFiles) {
    clearPreviewFiles()
  }
  taskComments.value = getCurrentTaskComments()
  taskPreviews.value = getCurrentTaskPreviews()
  task.value = getCurrentTask()
  setTimeout(() => {
    if (route.params.preview_id) {
      selectedPreviewId.value = route.params.preview_id
    }
  }, 200)
}

const loadTaskData = () => {
  const currentTask = getCurrentTask()
  if (!currentTask) {
    taskLoading.value = { isLoading: true, isError: false }
    return store
      .dispatch('loadTask', { taskId: route.params.task_id })
      .then(loadedTask => {
        let loadingFunction = () => store.dispatch('loadAssets')

        if (loadedTask.entity_type_name === 'Shot') {
          loadingFunction = () =>
            store
              .dispatch('loadEpisodes')
              .then(() => {
                // Left during the fetches: the page shown now owns the
                // episode and the shots loaded.
                if (route.params.task_id !== loadedTask.id) return
                if (isTVShow.value) {
                  store.dispatch('setCurrentEpisode', loadedTask.episode.id)
                }
                return store.dispatch('loadShots')
              })
              .catch(err => console.error(err))
        }
        return loadingFunction().then(() => {
          task.value = loadedTask
          return store
            .dispatch('loadTaskComments', {
              taskId: loadedTask.id,
              entityId: loadedTask.entity_id
            })
            .then(() => {
              reset()
              taskLoading.value = { isLoading: false, isError: false }
            })
            .catch(err => {
              console.error(err)
              taskLoading.value = { isLoading: false, isError: true }
            })
        })
      })
      .catch(err => {
        console.error(err)
        taskLoading.value = { isLoading: false, isError: true }
      })
  }

  const taskId = route.params.task_id
  task.value = currentTask
  return store
    .dispatch('loadTaskComments', {
      taskId,
      entityId: currentTask.entity_id
    })
    .then(() => {
      reset()
    })
    .catch(err => {
      console.error(err)
      taskLoading.value.isError = true
    })
    .finally(() => {
      taskLoading.value.isLoading = false
    })
}

// Functions (comments)
// --------------------------------------------------------------------------
// Named postComment, not addComment: in script setup a binding whose
// camelCase matches a component tag shadows the component (camelize wins
// over capitalize during template resolution), so an addComment function
// would replace the <add-comment> widget and run on every render.
const postComment = (
  comment,
  attachment,
  checklist,
  taskStatusId,
  revision = undefined,
  link = undefined,
  forClient = false
) => {
  const params = {
    taskId: task.value.id,
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
  loading.value.addComment = true
  errors.value.addComment = false
  errors.value.addCommentMaxRetakes = false
  store
    .dispatch(action, params)
    .then(() => {
      drafts.clearTaskDraft(task.value.id)
      addCommentRef.value?.reset()
      reset()
      loading.value.addComment = false
    })
    .catch(err => {
      console.error(err)
      loading.value.addComment = false
      const isRetakeError = err.body?.message?.includes('retake') ?? false
      errors.value.addComment = !isRetakeError
      errors.value.addCommentMaxRetakes = isRetakeError
    })
}

const resetComments = () => {
  taskComments.value = getTaskComments.value(task.value.id)
}

// Ported from taskMixin.
const confirmEditTaskComment = comment => {
  loading.value.editComment = true
  errors.value.editComment = false
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
        taskId: task.value.id,
        comment
      })
    )
    .then(() => {
      nextTick(() => {
        resetComments()
      })
      loading.value.editComment = false
      modals.value.editComment = false
    })
    .catch(err => {
      console.error(err)
      loading.value.editComment = false
      errors.value.editComment = true
    })
}

const saveComment = async comment => {
  try {
    await store.dispatch('editTaskComment', {
      taskId: task.value.id,
      comment
    })
  } catch (err) {
    console.error(err)
    await loadTaskData()
  }
}

const confirmDeleteTaskComment = () => {
  loading.value.deleteComment = true
  errors.value.deleteComment = false
  const commentId = commentToEdit.value.id

  store
    .dispatch('deleteTaskComment', {
      taskId: task.value.id,
      commentId
    })
    .then(() => {
      loading.value.deleteComment = false
      reset()
      if (isPreviews.value) resetPreview()
      modals.value.deleteComment = false
    })
    .catch(err => {
      console.error(err)
      loading.value.deleteComment = false
      errors.value.deleteComment = true
    })
}

const isStatusChange = index => {
  const comments = taskComments.value
  const comment = comments[index]
  return (
    index === comments.length - 1 ||
    comment.task_status_id !== comments[index + 1].task_status_id
  )
}

const onAckComment = comment => store.dispatch('ackComment', comment)

const onDuplicateComment = comment => addCommentRef.value.setValue(comment)

const onPinComment = comment => store.dispatch('pinComment', comment)

const onToggleForClient = comment =>
  store.dispatch('toggleCommentForClient', comment)

const onEditComment = comment => {
  commentToEdit.value = comment
  modals.value.editComment = true
}

const onDeleteComment = comment => {
  commentToEdit.value = comment
  modals.value.deleteComment = true
}

const onCancelEditComment = () => {
  modals.value.editComment = false
}

const onCancelDeleteComment = () => {
  modals.value.deleteComment = false
}

// Functions (previews)
// --------------------------------------------------------------------------
const selectFile = forms => {
  previewForms.value = previewForms.value.concat(forms)
  store.dispatch('loadPreviewFileFormData', previewForms.value)
}

const createExtraPreview = forms => {
  selectFile(forms)
  errors.value.addExtraPreview = false
  loading.value.addExtraPreview = true
  const comment = getCurrentTaskComments().find(item =>
    item.previews.find(preview => preview.id === currentPreviewId.value)
  )
  store
    .dispatch('addCommentExtraPreview', {
      taskId: task.value.id,
      commentId: comment?.id,
      previewId: currentPreviewId.value
    })
    .then(() => {
      loading.value.addExtraPreview = false
      modals.value.addExtraPreview = false
      addExtraPreviewModalRef.value.reset()
      clearPreviewFiles()
      setTimeout(() => {
        previewPlayerRef.value.displayLast()
      }, 0)
    })
    .catch(err => {
      console.error(err)
      errors.value.addExtraPreview = true
      loading.value.addExtraPreview = false
    })
}

const setPreview = () => {
  if (!previewPlayerRef.value) return
  loading.value.setPreview = true
  errors.value.setPreview = false
  const previewId = previewPlayerRef.value.currentPreview.id
  const frame =
    isMovie.value && isUseCurrentFrame.value
      ? currentFrame.value + 1
      : undefined
  store
    .dispatch('setPreview', {
      taskId: task.value.id,
      entityId: task.value.entity.id,
      previewId,
      frame
    })
    .then(() => {
      loading.value.setPreview = false
    })
    .catch(err => {
      console.error(err)
      errors.value.setPreview = true
    })
}

const confirmDeleteTaskPreview = () => {
  loading.value.deleteExtraPreview = true
  errors.value.deleteExtraPreview = false
  const previewId = currentPreviewId.value
  const comment = getCurrentTaskComments().find(
    item => item.previews.findIndex(p => p.id === previewId) >= 0
  )

  previewPlayerRef.value.displayFirst()
  store
    .dispatch('deleteTaskPreview', {
      taskId: task.value.id,
      commentId: comment?.id,
      previewId: currentExtraPreviewId.value
    })
    .then(() => {
      loading.value.deleteExtraPreview = false
      resetPreview()
      hideRemoveExtraPreviewModal()
    })
    .catch(err => {
      console.error(err)
      loading.value.deleteExtraPreview = false
      errors.value.deleteExtraPreview = true
    })
}

const onPreviewAdded = eventData => {
  const taskId = eventData.task_id
  const commentId = eventData.comment_id
  const previewId = eventData.preview_file_id
  const revision = eventData.revision
  const extensionName = eventData.extension
  const comment = store.getters.getTaskComment(taskId, commentId)

  if (
    task.value &&
    comment &&
    comment.previews &&
    (comment.previews.length === 0 || comment.previews[0].id !== previewId) &&
    taskId === task.value.id
  ) {
    store.commit('ADD_PREVIEW_END', {
      preview: {
        id: previewId,
        revision,
        extension: extensionName
      },
      taskId,
      commentId,
      comment
    })
    reset({ keepPreviewFiles: true })
  }
}

const onAddExtraPreviewClicked = () => {
  clearPreviewFiles()
  modals.value.addExtraPreview = true
}

const showRemoveExtraPreviewModal = preview => {
  currentExtraPreviewId.value = preview.id
  modals.value.deleteExtraPreview = true
}

const onRemoveExtraPreviewClicked = preview =>
  showRemoveExtraPreviewModal(preview)

function hideRemoveExtraPreviewModal() {
  modals.value.deleteExtraPreview = false
}

const hideExtraPreviewModal = () => {
  modals.value.addExtraPreview = false
}

const onAddPreviewClicked = () => {
  modals.value.addPreview = true
}

const closeAddPreviewModal = () => {
  modals.value.addPreview = false
}

const confirmAddPreviewModal = forms => {
  selectFile(forms)
  closeAddPreviewModal()
}

const onPreviewsOrderChanged = () => {
  taskPreviews.value = getCurrentTaskPreviews()
}

const onPreviewFormRemoved = previewForm => {
  previewForms.value = previewForms.value.filter(f => f !== previewForm)
  store.dispatch('loadPreviewFileFormData', previewForms.value)
}

const changeCurrentPreview = preview => {
  router.push(previewPath(preview.id))
}

const onFrameUpdated = frame => {
  currentFrame.value = frame
}

const onAnnotationChanged = async ({
  preview,
  additions,
  deletions,
  updates
}) => {
  const taskId = task.value.id
  try {
    await store.dispatch('updatePreviewAnnotation', {
      taskId,
      preview,
      additions,
      deletions,
      updates
    })
    previewPlayerRef.value?.confirmAnnotationsSaved()
  } catch (err) {
    console.error('Failed to save annotations', err)
    previewPlayerRef.value?.restoreFailedAnnotations()
  }
}

const extractAnnotationSnapshots = async (withLabel = false) => {
  addCommentRef.value.showAnnotationLoading(withLabel ? 'label' : 'standard')
  const files = await previewPlayerRef.value.extractAnnotationSnapshots({
    withLabel
  })
  addCommentRef.value.setAnnotationSnapshots(files)
  addCommentRef.value.hideAnnotationLoading()
  return files
}

const timeCodeClicked = ({ versionRevision, frame }) => {
  const preview = taskPreviews.value.find(
    p => p.revision === parseInt(versionRevision)
  )
  if (!preview) return
  changeCurrentPreview(preview)
  setTimeout(() => {
    previewPlayerRef.value?.setCurrentFrame(frame)
    previewPlayerRef.value?.focus()
  }, 100)
}

// Functions (subscription and playlist)
// --------------------------------------------------------------------------
const toggleSubscribe = () => {
  if (task.value && !isAssigned.value) {
    if (task.value.is_subscribed) {
      store.dispatch('unsubscribeFromTask', task.value.id)
    } else {
      store.dispatch('subscribeToTask', task.value.id)
    }
  }
}

const hideHookupPlaylistModal = () => {
  modals.value.hookupPlaylist = false
}

/*
 * Create a playlist with the previous, current and next task within the
 * same sequence
 */
const showHookupPlaylistModal = () => {
  const currentTaskId = task.value.id
  const tasks = Array.from(taskMap.value.values())
    // get all tasks for this sequence
    .filter(
      item =>
        item.episode_id === task.value.episode_id &&
        item.sequence_name === task.value.sequence_name &&
        item.task_type_id === task.value.task_type_id
    )
    // sort the tasks by shot name
    .sort((a, b) =>
      a.entity_name.localeCompare(b.entity_name, undefined, {
        numeric: true
      })
    )

  const currentTaskIndex = tasks.findIndex(item => item.id === currentTaskId)

  const previousTaskId =
    currentTaskIndex > 0 ? tasks[currentTaskIndex - 1].id : null

  const nextTaskId =
    currentTaskIndex < tasks.length - 1 ? tasks[currentTaskIndex + 1].id : null

  hookupPlaylistTaskIds.value = [currentTaskId]
  if (previousTaskId) hookupPlaylistTaskIds.value.unshift(previousTaskId)
  if (nextTaskId) hookupPlaylistTaskIds.value.push(nextTaskId)

  modals.value.hookupPlaylist = true
}

// Functions (socket handlers)
// --------------------------------------------------------------------------
const onRemoteAcknowledge = (eventData, type) => {
  if (!task.value) return
  const comment = taskComments.value.find(c => c.id === eventData.comment_id)
  const person = personMap.value.get(eventData.person_id)
  if (!comment || !person) return
  if (user.value?.id === person.id) {
    if (
      (type === 'ack' && !comment.acknowledgements.includes(person.id)) ||
      (type === 'unack' && comment.acknowledgements.includes(person.id))
    ) {
      store.commit('ACK_COMMENT', { comment, user: person })
    }
  } else {
    store.commit('ACK_COMMENT', { comment, user: person })
  }
}

const onPreviewFileAddFile = eventData => onPreviewAdded(eventData)

const onPreviewFileUpdate = eventData => {
  const comment = taskComments.value.find(
    c =>
      c.previews &&
      c.previews.length > 0 &&
      c.previews[0].id === eventData.preview_file_id
  )
  if (comment && task.value) {
    store
      .dispatch('refreshPreview', {
        taskId: task.value.id,
        previewId: eventData.preview_file_id
      })
      .then(preview => {
        comment.previews[0].validation_status = preview.validation_status
      })
  }
}

const onCommentAcknowledge = eventData => onRemoteAcknowledge(eventData, 'ack')

const onCommentUnacknowledge = eventData =>
  onRemoteAcknowledge(eventData, 'unack')

const onCommentNew = () => {
  setTimeout(() => {
    if (getCurrentTaskComments().length !== taskComments.value.length) {
      taskComments.value = getCurrentTaskComments()
      taskPreviews.value = getCurrentTaskPreviews()
    }
  }, 1000)
}

const onCommentUpdate = eventData => {
  const commentId = eventData.comment_id
  if (!taskComments.value.some(({ id }) => id === commentId)) {
    return
  }
  store.dispatch('loadComment', { commentId }).catch(console.error)
}

const onCommentReply = eventData => {
  if (!task.value) return
  const comment = taskComments.value.find(c => c.id === eventData.comment_id)
  if (!comment) return
  if (!comment.replies) comment.replies = []
  const hasReply = comment.replies.some(
    reply => reply.id === eventData.reply_id
  )
  if (!hasReply) {
    store
      .dispatch('refreshComment', { commentId: eventData.comment_id })
      .then(remoteComment => {
        comment.replies = remoteComment.replies
      })
      .catch(console.error)
  }
}

const onCommentDelete = eventData => {
  if (!task.value) return
  const comment = taskComments.value.find(c => c.id === eventData.comment_id)
  if (comment) {
    store.commit('REMOVE_TASK_COMMENT', { task: task.value, comment })
    taskComments.value = getCurrentTaskComments()
    taskPreviews.value = getCurrentTaskPreviews()
  }
}

const onCommentDeleteReply = eventData => {
  if (!task.value) return
  const comment = taskComments.value.find(c => c.id === eventData.comment_id)
  if (comment) {
    if (!comment.replies) comment.replies = []
    store.commit('REMOVE_REPLY_FROM_COMMENT', {
      comment,
      reply: { id: eventData.reply_id }
    })
  }
}

const onAnnotationUpdate = eventData => {
  if (!previewPlayerRef.value) return
  const isValid = previewPlayerRef.value.isValidPreviewModification(
    eventData.preview_file_id,
    eventData.updated_at
  )
  if (isValid) {
    store
      .dispatch('refreshPreview', {
        previewId: previewPlayerRef.value.currentPreview.id,
        taskId: previewPlayerRef.value.currentPreview.task_id
      })
      .then(() => {
        if (!previewPlayerRef.value.notSaved) {
          taskPreviews.value = getCurrentTaskPreviews()
          nextTick(() => {
            previewPlayerRef.value.reloadAnnotations()
            previewPlayerRef.value.loadAnnotation()
          })
        }
      })
  }
}

const socketEvents = {
  'preview-file:add-file': onPreviewFileAddFile,
  'preview-file:update': onPreviewFileUpdate,
  'preview-file:annotation-update': onAnnotationUpdate,
  'comment:acknowledge': onCommentAcknowledge,
  'comment:unacknowledge': onCommentUnacknowledge,
  'comment:new': onCommentNew,
  'comment:update': onCommentUpdate,
  'comment:reply': onCommentReply,
  'comment:delete': onCommentDelete,
  'comment:delete-reply': onCommentDeleteReply
}

// Watchers
// --------------------------------------------------------------------------
watch(route, () => {
  if (task.value && route.params.task_id !== task.value.id) {
    loadTaskData()
  }
  if (route.params.preview_id !== selectedPreviewId.value) {
    selectedPreviewId.value = route.params.preview_id
  }
})

watch(currentProduction, () => {
  loadTaskData()
})

watch(selectedPreviewId, () => {
  if (task.value && selectedPreviewId.value) {
    router.push(previewPath(selectedPreviewId.value))
  }
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  Object.entries(socketEvents).forEach(([event, handler]) =>
    socket.on(event, handler)
  )
  store.dispatch('clearSelectedTasks')
  await loadTaskData()
  await nextTick()
  await store.dispatch(`load${currentType.value}s`)
  reset()
  await nextTick()
  if (taskColumns.value) {
    taskColumns.value.scrollTop = 100
    window.scrollTo(0, 0)
  }
})

onBeforeUnmount(() => {
  Object.entries(socketEvents).forEach(([event, handler]) =>
    socket.off(event, handler)
  )
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(() => {
    if (!task.value) return `${t('main.loading')} - Kitsu`
    const taskTypeName =
      taskTypeMap.value.get(task.value.task_type_id)?.name || ''
    return `${title.value} / ${taskTypeName} - Kitsu`
  })
})
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

.set-main-preview {
  margin-right: 0;
}

.playlist-button {
  img {
    width: 20px;
  }
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

.pre-wrap {
  white-space: pre-wrap;
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
