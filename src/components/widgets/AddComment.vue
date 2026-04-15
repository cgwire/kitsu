<template>
  <article
    ref="wrapperRef"
    @drop="onDrop"
    @dragover="onDragover"
    @dragleave="onDragleave"
    class="add-comment word-break media"
    :class="{
      'is-dragging': isDragging
    }"
  >
    <div class="media-content">
      <div class="flexrow tab-row">
        <span
          class="filler has-text-centered"
          :class="{
            active: mode === 'status'
          }"
          @click="mode = 'status'"
        >
          {{ $t('tasks.change_status') }}
        </span>
        <span
          class="filler has-text-centered"
          :class="{
            active: mode === 'publish'
          }"
          @click="mode = 'publish'"
          v-if="!isConcept"
        >
          {{ $t('tasks.publish_revision') }}
        </span>
      </div>

      <at-ta
        :ats="['#', '@']"
        :members="[...membersForAts['@'], ...membersForAts['#']]"
        name-key="full_name"
        :limit="2"
        :filter-match="atOptionsFilter"
        @update:value="onAtTextChanged"
        v-if="mode === 'status' || showCommentArea"
      >
        <template #item="{ item }">
          <template v-if="item.isTime"> ⏱️ frame </template>
          <template v-else-if="item.isDepartment">
            <span
              class="mr05"
              :style="{
                background: item.color,
                width: '10px',
                height: '10px',
                'border-radius': '50%'
              }"
            >
              &nbsp;
            </span>
            {{ item.full_name }}
          </template>
          <template v-else-if="item.isTaskType">
            <task-type-name
              :task-type="{
                color: item.color,
                name: item.full_name
              }"
              :is-link="false"
              thin
            />
          </template>
          <template v-else>
            <div class="flexrow">
              <people-avatar
                class="flexrow-item"
                :person="item"
                :size="20"
                :font-size="11"
                :is-lazy="false"
                :is-link="false"
              />
              <span class="flexrow-item">
                {{ item.full_name }}
              </span>
            </div>
          </template>
        </template>
        <textarea
          ref="commentTextareaRef"
          class="textarea flexrow-item"
          :disabled="isLoading"
          :placeholder="$t('comments.add_comment')"
          rows="2"
          @keyup.enter.ctrl="
            runAddComment(
              text,
              attachments,
              checklist,
              task_status_id,
              nextRevision,
              link
            )
          "
          @keyup.enter.meta="
            runAddComment(
              text,
              attachments,
              checklist,
              task_status_id,
              nextRevision,
              link
            )
          "
          v-autosize
          v-focus
          v-model="text"
        ></textarea>
      </at-ta>
      <div
        class="flexrow link-field"
        v-if="mode === 'publish' && showLinkField"
      >
        <label class="flexrow-item has-text-right" for="input-link">
          {{ $t('main.link') }}
        </label>
        <input
          id="input-link"
          ref="inputLinkRef"
          class="input flexrow-item filler preview-link"
          placeholder="https://..."
          type="url"
          v-model.trim="link"
        />
        <span
          class="flexrow-item column preview-delete-link"
          @click.prevent="toggleLinkField(true)"
        >
          x
        </span>
      </div>
      <div class="post-area">
        <checklist
          :checklist="checklistItems"
          :frame="frame + 1"
          :revision="revision"
          :is-movie-preview="isMovie"
          @add-item="onAddChecklistItem"
          @insert-item="onInsertChecklistItem"
          @remove-task="removeTask"
          v-if="checklistItems.length > 0"
        />

        <div v-if="mode === 'publish'" class="post-area mt1">
          <div class="attachment-title" v-if="previewForms.length > 0">
            {{ $t('comments.previews') }}
          </div>
          <div
            :key="'preview-' + index"
            class="preview-file"
            v-for="(preview, index) in previewForms"
          >
            <div class="m0">
              {{ shortenText(preview.get('file').name, 40) }}
              <span @click="$emit('remove-preview', preview)">x</span>
            </div>
            <div class="progress-wrapper">
              <div
                class="progress"
                :style="{
                  width: (uploadProgress[preview.get('file').name] || 0) + '%'
                }"
              ></div>
            </div>
          </div>

          <div class="flexrow preview-section">
            <button
              class="button flexrow-item preview-button"
              @click="$emit('add-preview')"
            >
              {{ $t('comments.add_preview') }}
            </button>
          </div>
          <div class="flexrow mt2 mb1" v-if="nextRevision !== undefined">
            <label
              class="flexrow-item column has-text-right"
              for="input-revision"
            >
              {{ $t('tasks.new_revision_number') }}
            </label>
            <input
              id="input-revision"
              class="input flexrow-item column preview-revision"
              type="number"
              :min="revision + 1"
              pattern="[0-9]"
              :placeholder="revision + 1"
              @enter="$emit('add-preview')"
              v-model.trim="nextRevision"
            />
            <span
              class="flexrow-item column preview-delete-revision"
              :title="$t('tasks.auto_revision')"
              @click.prevent="nextRevision = undefined"
            >
              x
            </span>
          </div>
        </div>

        <div class="attachment-title" v-if="attachments.length > 0">
          {{ $t('comments.attachments') }}
        </div>
        <div
          :key="'attachment-' + index"
          class="attachment-file"
          v-for="(attach, index) in attachments"
        >
          {{ shortenText(attach.get('file').name, 40) }}
          <span @click="removeAttachment(attach)">x</span>
        </div>

        <div class="flexrow button-row mt1">
          <emoji-button @select="onSelectEmoji" v-if="mode === 'status'" />
          <button-simple
            :class="{
              active: attachments.length !== 0
            }"
            icon="attach"
            :title="$t('comments.add_attachment')"
            @click="onAddCommentAttachmentClicked()"
            v-if="mode === 'status'"
          />
          <button-simple
            :class="{
              active: checklistItems.length !== 0
            }"
            icon="list"
            :title="$t('comments.add_checklist')"
            @click="addChecklistEntry(-1)"
            v-if="mode === 'status'"
          />
          <button-simple
            :class="{
              active: showCommentArea
            }"
            icon="comment"
            :title="$t('comments.add_comment')"
            @click="showCommentArea = !showCommentArea"
            v-if="mode === 'publish'"
          />
          <button-simple
            :class="{
              active: showLinkField
            }"
            icon="link"
            :title="$t('comments.add_link')"
            @click="toggleLinkField"
            v-if="mode === 'publish'"
          />
          <div class="filler"></div>
          <combobox-status
            class="status-selector"
            :narrow="true"
            :color-only="true"
            :task-status-list="taskStatus"
            :production-id="task.project_id"
            v-model="task_status_id"
          />
          <button-simple
            class="post-button"
            :class="{
              'is-loading': isLoading
            }"
            icon="send"
            :disabled="!isValidForm"
            :text="mode === 'publish' ? $t('tasks.publish') : $t('tasks.post')"
            :title="
              mode === 'publish'
                ? $t('tasks.publish')
                : $t('comments.post_status')
            "
            @click="
              runAddComment(
                text,
                attachments,
                checklist,
                task_status_id,
                nextRevision,
                link
              )
            "
          />
        </div>

        <toggle-button
          class="mb05"
          :label="$t('comments.add_frame_to_comment')"
          v-model="isFrameAddition"
          v-if="isCurrentUserClient && isMovie"
        />

        <div class="error pull-right" v-if="isError">
          <em>{{ $t('comments.error') }}</em>
        </div>
        <div class="error pull-right" v-if="isMaxRetakesError">
          <em>{{ $t('comments.max_retakes_error') }}</em>
        </div>
      </div>
    </div>

    <add-attachment-modal
      ref="addAttachmentModalRef"
      :active="modals.addCommentAttachment"
      :is-loading="loading.addCommentAttachment"
      :is-error="errors.addCommentAttachment"
      :is-movie="isMovie"
      :title="`${task.entity_name} / ${
        taskTypeMap.get(task.task_type_id).name
      }`"
      @cancel="onCloseCommentAttachment"
      @confirm="addCommentAttachment"
      @add-snapshots="$emit('annotation-snapshots-requested')"
    />
    <confirm-modal
      :active="modals.confirmFeedbackPublish"
      :text="$t('comments.confirm_publish')"
      :confirm-button-text="$t('comments.confirm_publish_button')"
      @cancel="modals.confirmFeedbackPublish = false"
      @confirm="
        () => {
          modals.confirmFeedbackPublish = false
          runAddComment(
            text,
            attachments,
            checklist,
            task_status_id,
            nextRevision,
            link,
            true
          )
        }
      "
    />
  </article>
</template>

<script setup>
import {
  computed,
  inject,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import AtTa from 'vue-at/dist/vue-at-textarea'

import drafts from '@/lib/drafts'
import { remove } from '@/lib/models'
import { getDownloadAttachmentPath } from '@/lib/path'
import { replaceTimeWithTimecode } from '@/lib/render'
import preferences from '@/lib/preferences'
import strings from '@/lib/string'

import { useAtMentionsMembers } from '@/composables/atMentions'

import AddAttachmentModal from '@/components/modals/AddAttachmentModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checklist from '@/components/widgets/Checklist.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import EmojiButton from '@/components/widgets/EmojiButton.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import ToggleButton from '@/components/widgets/ToggleButton.vue'

const REVISION_NUMBER_REGEX = /v(\d+)/gi

const props = defineProps({
  frame: {
    type: Number,
    default: 0
  },
  isError: {
    type: Boolean,
    default: null
  },
  isMaxRetakesError: {
    type: Boolean,
    default: null
  },
  isMovie: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: null
  },
  task: {
    type: Object,
    default: () => {}
  },
  taskStatus: {
    type: Array,
    default: () => []
  },
  taskTypes: {
    type: Array,
    default: () => []
  },
  team: {
    type: Array,
    default: () => []
  },
  fps: {
    type: Number,
    default: 25
  },
  revision: {
    type: Number,
    default: 1
  },
  time: {
    type: Number,
    default: 0
  },
  previewForms: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'add-comment',
  'add-preview',
  'annotation-snapshots-requested',
  'clear-files',
  'file-drop',
  'remove-preview'
])

const store = useStore()
const route = useRoute()
const draftComment = inject('draftComment')

const wrapperRef = ref(null)
const commentTextareaRef = ref(null)
const inputLinkRef = ref(null)
const addAttachmentModalRef = ref(null)

const { membersForAts, atOptionsFilter } = useAtMentionsMembers(
  () => props.team,
  () => props.taskTypes
)

const isFrameAddition = ref(false)
const isDragging = ref(false)
const errors = reactive({
  addCommentAttachment: false
})
const loading = reactive({
  addCommentAttachment: false
})
const modals = reactive({
  addCommentAttachment: false,
  confirmFeedbackPublish: false
})

const isCurrentUserArtist = computed(() => store.getters.isCurrentUserArtist)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const productionMap = computed(() => store.getters.productionMap)
const taskStatusForCurrentUser = computed(
  () => store.getters.taskStatusForCurrentUser
)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const uploadProgress = computed(() => store.getters.uploadProgress)

const attachments = computed({
  get: () => draftComment.attachments,
  set: value => {
    draftComment.attachments = value
  }
})

const checklistItems = computed({
  get: () => draftComment.checklist,
  set: value => {
    draftComment.checklist = value
  }
})

const link = computed({
  get: () => draftComment.link,
  set: value => {
    draftComment.link = value
  }
})

const mode = computed({
  get: () => draftComment.mode,
  set: value => {
    draftComment.mode = value
  }
})

const nextRevision = computed({
  get: () => draftComment.nextRevision,
  set: value => {
    draftComment.nextRevision = value
  }
})

const showCommentArea = computed({
  get: () => draftComment.showCommentArea,
  set: value => {
    draftComment.showCommentArea = value
  }
})

const showLinkField = computed({
  get: () => draftComment.showLinkField,
  set: value => {
    draftComment.showLinkField = value
  }
})

const task_status_id = computed({
  get: () => draftComment.task_status_id,
  set: value => {
    draftComment.task_status_id = value
  }
})

const text = computed({
  get: () => draftComment.text,
  set: value => {
    draftComment.text = value
    drafts.setTaskDraft(props.task.id, text.value)
  }
})

const getAttachmentModal = () => {
  return addAttachmentModalRef.value
}

const isConcept = computed(() => {
  return route.path.includes('concept')
})

const isValidForm = computed(() => {
  return Boolean(
    mode.value === 'status' ||
    (mode.value === 'publish' &&
      props.previewForms.length &&
      (nextRevision.value === undefined ||
        nextRevision.value > props.revision) &&
      (!showLinkField.value ||
        !link.value ||
        inputLinkRef.value?.checkValidity()))
  )
})

const shortenText = strings.shortenText

const toggleLinkField = (reset = false) => {
  showLinkField.value = !showLinkField.value
  if (showLinkField.value) {
    nextTick(() => {
      inputLinkRef.value?.focus()
    })
  }
  if (reset) {
    link.value = null
  }
}

const runAddComment = (
  textVal,
  attachmentsVal,
  checklistVal,
  taskStatusId,
  revisionVal,
  linkVal,
  force = false
) => {
  if (!isValidForm.value) {
    return
  }
  const taskStatus = taskStatusMap.value.get(task_status_id.value)
  if (
    taskStatus.is_feedback_request &&
    props.previewForms.length === 0 &&
    !force
  ) {
    modals.confirmFeedbackPublish = true
    return
  }

  if (isFrameAddition.value) {
    textVal = '@frame \n\n' + textVal
    textVal = replaceTimeWithTimecode(
      textVal,
      props.revision,
      props.frame + 1,
      props.fps
    )
  }

  store.commit('CLEAR_UPLOAD_PROGRESS')
  if (mode.value === 'publish') {
    if (!showCommentArea.value) textVal = ''
    attachmentsVal = []
    checklistVal = []
  } else {
    checklistVal = checklistVal.filter(item => item.text)
  }

  revisionVal = Number(revisionVal)
  if (isNaN(revisionVal) || revisionVal < 1) {
    revisionVal = undefined
  }

  if (!showLinkField.value) {
    linkVal = null
  }

  emit(
    'add-comment',
    textVal,
    attachmentsVal,
    checklistVal,
    taskStatusId,
    revisionVal,
    linkVal
  )
}

const reset = () => {
  text.value = ''
  link.value = null
  attachments.value = []
  checklistItems.value = []
  nextRevision.value = undefined
}

const focus = () => {
  const textarea = commentTextareaRef.value
  if (textarea) {
    textarea.focus()
    const caretPosition = textarea.value.length
    textarea.setSelectionRange(caretPosition, caretPosition)
  }
}

const getRevision = form => {
  if (!form) {
    return undefined
  }
  const file = form.get('file')
  const rgxMatches = file.name.matchAll(REVISION_NUMBER_REGEX)
  const revision = Array.from(rgxMatches).pop()?.[1]
  return revision
}

const onAddChecklistItem = item => {
  delete item.index
  checklistItems.value.push(item)
}

const onInsertChecklistItem = item => {
  checklistItems.value.splice(item.index, 0, item)
  for (let i = 0; i < checklistItems.value.length; i++) {
    checklistItems.value[i].index = i
  }
}

const resetStatus = () => {
  const taskStatus = taskStatusMap.value.get(props.task.task_status_id)
  if (
    (!isCurrentUserArtist.value || taskStatus.is_artist_allowed) &&
    (!isCurrentUserClient.value || taskStatus.is_client_allowed)
  ) {
    task_status_id.value = props.task.task_status_id
  } else {
    task_status_id.value = taskStatusForCurrentUser.value[0]?.id
  }
}

const onDragover = () => {
  isDragging.value = true
}

const onDragleave = () => {
  isDragging.value = false
}

const onDrop = event => {
  if (event.target.id === 'drop-mask') return
  if (event.target.parentElement?.className?.indexOf('add-attachment-box') >= 0)
    return
  if (
    event.target.parentElement?.className?.indexOf('add-attachment-buttons') >=
    0
  )
    return
  if (
    event.target.parentElement?.className?.indexOf('attachment-modal-box') >= 0
  )
    return

  const forms = []
  for (let i = 0; i < event.dataTransfer.files.length; i++) {
    const form = new FormData()
    form.append('file', event.dataTransfer.files[i])
    forms.push(form)
  }
  if (mode.value === 'publish') {
    emit('file-drop', forms)
  } else {
    addCommentAttachment(forms)
  }
  isDragging.value = false
}

/*
 * When a file is pasted in the comment area, it adds it to the attachments.
 */
const onPaste = event => {
  if (modals.addCommentAttachment) return
  if (commentTextareaRef.value !== document.activeElement) return
  const files = event.clipboardData.files
  if (files.length > 0) {
    const form = new FormData()
    form.append('file', files[0])
    addCommentAttachment([form])
  }
}

const onAddCommentAttachmentClicked = () => {
  modals.addCommentAttachment = true
}

const addCommentAttachment = forms => {
  onCloseCommentAttachment()
  attachments.value = attachments.value.concat(forms)
}

const onCloseCommentAttachment = () => {
  modals.addCommentAttachment = false
}

const removeAttachment = attach => {
  attachments.value = attachments.value.filter(a => a !== attach)
}

const addChecklistEntry = index => {
  if (index === -1 || index === checklistItems.value.length - 1) {
    checklistItems.value.push({
      text: '',
      checked: false
    })
  }
}

const removeTask = entry => {
  checklistItems.value = remove(checklistItems.value, entry)
}

const setValue = async comment => {
  checklistItems.value = JSON.parse(JSON.stringify(comment.checklist))
  text.value = comment.text

  // duplicate attachment files
  attachments.value = (
    await Promise.all(
      comment.attachment_files.map(async attachment => {
        const fileUrl = getDownloadAttachmentPath(attachment)
        const response = await fetch(fileUrl)
        if (!response.ok) return
        const fileBlob = await response.blob()
        const formData = new FormData()
        formData.append('file', fileBlob, attachment.name)
        return formData
      })
    )
  ).filter(Boolean)
}

const onAtTextChanged = input => {
  if (input.includes('@frame')) {
    text.value = replaceTimeWithTimecode(
      input,
      props.revision,
      props.frame + 1,
      props.fps
    )
  }
}

const setAnnotationSnapshots = files => {
  getAttachmentModal().addFiles(files)
}

const showAnnotationLoading = () => {
  getAttachmentModal().showAnnotationLoading()
}

const hideAnnotationLoading = () => {
  getAttachmentModal().hideAnnotationLoading()
}

const onSelectEmoji = emoji => {
  const textarea = commentTextareaRef.value
  text.value = strings.insertInTextArea(textarea, emoji.i)
}

onBeforeMount(() => {
  if (!attachments.value) {
    attachments.value = []
  }
  if (!checklistItems.value) {
    checklistItems.value = []
  }
})

onMounted(() => {
  if (!isCurrentUserClient.value) {
    isFrameAddition.value = false
  } else {
    isFrameAddition.value = preferences.getBoolPreference(
      'comments:add-frame-when-posting',
      false
    )
  }
  const production = productionMap.value.get(props.task.project_id)
  mode.value =
    production?.is_publish_default_for_artists && isCurrentUserArtist.value
      ? 'publish'
      : 'status'

  nextTick(() => {
    ;[
      'drag',
      'dragstart',
      'dragend',
      'dragover',
      'dragenter',
      'dragleave',
      'drop'
    ].forEach(evt => {
      if (wrapperRef.value) {
        wrapperRef.value.addEventListener(evt, e => {
          e.preventDefault()
          e.stopPropagation()
        })
      }
    })
  })
  window.addEventListener('paste', onPaste, false)
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste, false)
})

watch(
  () => props.task,
  () => {
    resetStatus()
    const draft = drafts.getTaskDraft(props.task.id)
    if (draft) {
      text.value = draft
    }
  },
  { immediate: true }
)

watch(mode, () => {
  if (mode.value === 'publish') {
    checklistItems.value = []
    attachments.value = []
    if (text.value && text.value.length > 0) {
      showCommentArea.value = true
    }
  } else {
    emit('clear-files')
  }
})

watch(isFrameAddition, value => {
  if (isCurrentUserClient.value) {
    preferences.setPreference('comments:add-frame-when-posting', value)
  }
})

watch(
  () => props.previewForms,
  () => {
    const form = props.previewForms?.findLast(form => getRevision(form) > 0)
    nextRevision.value = getRevision(form)
  },
  { deep: true, immediate: true }
)

defineExpose({
  reset,
  focus,
  resetStatus,
  setValue,
  setAnnotationSnapshots,
  showAnnotationLoading,
  hideAnnotationLoading
})
</script>

<style lang="scss" scoped>
@use 'sass:color';

.dark textarea:disabled {
  background: #555;
}

article.add-comment {
  padding: 0;
  border-radius: 10px;
}

.add-comment {
  border-radius: 5px;
  background: white;
  border: 1px solid $light-grey-light;
  transition: background 0.2s ease;

  textarea {
    margin: 0;
    min-height: 57px;
    max-height: 300px;
    border-radius: 0;

    &:focus,
    &:hover,
    &:active {
      border-color: var(--border-alt);
    }
  }
}

.post-button-wrapper {
  margin: 0;

  .button.is-primary {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    height: 34px;
    margin-top: 1px;
  }
}

.preview-revision {
  max-width: 30%;
}

.preview-delete-link,
.preview-delete-revision {
  max-width: 10px;
  cursor: pointer;
}

.input {
  border-radius: 10px;
  &:invalid {
    color: $red;
  }
}

.mt1 {
  margin-top: 0.5em;
}

.is-dragging {
  background-color: $purple;
}

.button.is-primary {
  border-radius: 2em;
}

.button.active {
  background: var(--background-selected);
}

.status-selector {
  margin: 0;
}

.preview-button {
  background: var(--background-alt-2);
  color: var(--text);
  margin: 0;
  text-align: center;
  width: 100%;
}

.button-row {
  padding-bottom: 0.5em;

  .button {
    border: 0;
    margin: 0;
    margin-right: 3px;
    color: var(--text-alt);
    padding: 0 10px;

    &:hover {
      color: var(--text);
    }

    &.post-button {
      border: 1px solid var(--border);
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      padding-right: 1em;
      &:hover {
        border: 1px solid var(--border-alt);
      }
    }
  }
}

.tab-row {
  color: color.adjust($dark-grey-light, $lightness: 40%);
  font-size: 0.9em;
  text-transform: uppercase;
  margin-top: 5px;
  margin-bottom: 0;

  span {
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    margin-right: 0;
    padding-bottom: 0.5em;
  }

  span.active {
    color: var(--text);
    font-weight: 600;
    // border-bottom: 1px solid $green;
  }
}

.attachment-title {
  margin-left: 3px;
  margin-top: 6px;
  color: $grey;
  font-size: 0.8em;
  text-transform: uppercase;
}

.attachment-file {
  margin-top: 3px;
  margin-bottom: 3px;
  margin-left: 3px;
  margin-right: 3px;
  padding-bottom: 3px;
  border-bottom: 1px dashed $light-grey-light;

  span {
    cursor: pointer;
    float: right;
  }
}

.preview-file {
  margin-top: 1em;
  margin-bottom: 3px;
  margin-left: 3px;
  margin-right: 3px;

  span {
    cursor: pointer;
    float: right;
  }
}

.link-field {
  margin: 1em;
}

.post-area {
  position: relative;
  padding: 0 0.5em 0.2em 0.5em;
}

.progress-wrapper {
  border-radius: 5px;
  background: var(--background-alt);
  height: 5px;
  margin-top: 0.3em;
  margin-bottom: 1em;
}

.progress {
  height: 5px;
  width: 100%;
  background-color: $light-green;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
