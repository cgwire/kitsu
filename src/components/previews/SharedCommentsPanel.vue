<template>
  <aside class="shared-comments-panel flexcolumn">
    <form class="post-form" @submit.prevent="submitComment" v-if="canPost">
      <textarea
        ref="textareaRef"
        class="comment-input"
        rows="4"
        :placeholder="$t('share.comment_placeholder')"
        :disabled="submitting"
        v-autosize
        v-model="commentText"
      ></textarea>
      <checklist
        class="draft-checklist"
        :checklist="checklistItems"
        :frame="(currentFrame || 0) + 1"
        :revision="entity?.preview_file_revision || 1"
        :is-movie-preview="currentFrame != null"
        @add-item="onAddChecklistItem"
        @insert-item="onInsertChecklistItem"
        @remove-task="removeChecklistEntry"
        @time-code-clicked="onChecklistTimeCodeClicked"
        v-if="checklistItems.length > 0"
      />
      <ul class="draft-attachments" v-if="pendingAttachments.length">
        <li
          class="draft-attachment flexrow"
          :key="`attachment-${index}`"
          v-for="(form, index) in pendingAttachments"
        >
          <paperclip-icon class="draft-attachment-icon" :size="14" />
          <span class="draft-attachment-name filler">
            {{ form.get('file').name }}
          </span>
          <button
            type="button"
            class="chip-remove"
            :title="$t('main.delete')"
            @click="removePendingAttachment(index)"
          >
            <x-icon :size="14" />
          </button>
        </li>
      </ul>
      <div class="form-tools flexrow">
        <span class="tool-button-slot">
          <emoji-button @select="insertEmoji" />
        </span>
        <button
          type="button"
          class="tool-button"
          :class="{ active: pendingAttachments.length > 0 }"
          :title="$t('comments.add_attachment')"
          @click="openAttachmentPicker"
        >
          <paperclip-icon :size="16" />
        </button>
        <button
          type="button"
          class="tool-button"
          :title="$t('comments.add_frame_to_comment')"
          @click="insertFrameMention"
          v-if="currentFrame != null"
        >
          <film-icon :size="16" />
        </button>
        <button
          type="button"
          class="tool-button"
          :class="{ active: checklistItems.length > 0 }"
          :title="$t('comments.add_checklist')"
          @click="addChecklistItem"
        >
          <list-icon :size="16" />
        </button>
        <div class="filler"></div>
        <div class="post-compound flexrow">
          <combobox-status
            class="status-selector"
            :narrow="true"
            :color-only="true"
            :task-status-list="availableStatuses"
            :production-id="currentProduction?.id || ''"
            v-model="selectedStatusId"
          />
          <button-simple
            class="post-button"
            :class="{ 'is-loading': submitting }"
            type="submit"
            icon="send"
            :disabled="!canSubmit"
            :text="$t('tasks.post')"
            :title="$t('comments.post_status')"
          />
        </div>
      </div>
    </form>
    <p class="post-disabled" v-else-if="!canComment">
      {{ $t('share.comments_disabled') }}
    </p>
    <p class="post-disabled" v-else-if="!props.guestId">
      {{ $t('share.identity_required') }}
    </p>
    <p class="post-disabled" v-else-if="availableStatuses.length === 0">
      {{ $t('share.no_status_available') }}
    </p>

    <div class="comments-list" ref="commentsList">
      <div class="loading-state" v-if="loading">
        <spinner />
      </div>
      <p class="empty-state" v-else-if="taskComments.length === 0">
        {{ $t('share.no_comments_yet') }}
      </p>
      <template v-else>
        <task-comment
          class="comment-wrapper"
          :key="comment.id"
          :comment="comment"
          :task="buildTaskForComment(comment)"
          :fps="fps"
          :frame="currentFrame || 0"
          :is-change="false"
          :is-checkable="isOwnedByGuest(comment)"
          :is-editable="isOwnedByGuest(comment)"
          :is-pinnable="false"
          :is-replyable="false"
          :task-types="[]"
          :team="[]"
          :revision="comment.revision || 1"
          :style="{ animationDelay: Math.min(index, 8) * 60 + 'ms' }"
          @edit-comment="onEditComment"
          @delete-comment="onDeleteComment"
          @checklist-updated="onChecklistUpdated"
          @time-code-clicked="onCommentTimeCodeClicked"
          v-for="(comment, index) in taskComments"
        />
      </template>
    </div>

    <teleport to="body">
      <div class="shared-modals">
        <add-attachment-modal
          :active="modals.attachment"
          :is-loading="false"
          :is-error="false"
          :is-movie="false"
          :title="entity?.name || ''"
          @cancel="modals.attachment = false"
          @confirm="onAttachmentsConfirmed"
        />

        <edit-comment-modal
          :active="modals.edit"
          :comment-to-edit="commentToEdit || {}"
          :task-types="[]"
          :team="[]"
          :fps="fps"
          :frame="currentFrame || 0"
          :is-loading="isEditing"
          :is-error="editError"
          @confirm="confirmEditComment"
          @cancel="modals.edit = false"
        />

        <delete-modal
          :active="modals.delete"
          :text="$t('tasks.delete_comment')"
          :error-text="$t('tasks.delete_comment_error')"
          :is-loading="isDeleting"
          :is-error="deleteError"
          @confirm="confirmDeleteComment"
          @cancel="modals.delete = false"
        />
      </div>
    </teleport>
  </aside>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { FilmIcon, ListIcon, PaperclipIcon, XIcon } from 'lucide-vue-next'

import { replaceTimeWithTimecode } from '@/lib/render'
import { LOAD_PEOPLE_END } from '@/store/mutation-types'

// eslint-disable-next-line no-unused-vars
import TaskComment from '@/components/widgets/Comment.vue'
// eslint-disable-next-line no-unused-vars
import AddAttachmentModal from '@/components/modals/AddAttachmentModal.vue'
// eslint-disable-next-line no-unused-vars
import DeleteModal from '@/components/modals/DeleteModal.vue'
// eslint-disable-next-line no-unused-vars
import EditCommentModal from '@/components/modals/EditCommentModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checklist from '@/components/widgets/Checklist.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import EmojiButton from '@/components/widgets/EmojiButton.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  token: { type: String, required: true },
  guestId: { type: String, default: '' },
  currentTaskId: { type: String, default: '' },
  canComment: { type: Boolean, default: false },
  currentFrame: { type: Number, default: null },
  entity: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['status-changed', 'time-code-clicked'])

const store = useStore()

const comments = ref([])
const taskStatuses = ref([])
const loading = ref(true)
const submitting = ref(false)
const commentText = ref('')
const selectedStatusId = ref('')
const checklistItems = ref([])
const pendingAttachments = ref([])
const textareaRef = ref(null)
const modals = reactive({ edit: false, delete: false, attachment: false })
const commentToEdit = ref(null)
const isEditing = ref(false)
const editError = ref(false)
const isDeleting = ref(false)
const deleteError = ref(false)

const apiBase = computed(() => `/api/shared/playlists/${props.token}`)

const normalizeComment = comment => {
  const enrichedPerson = store.getters.personMap.get(comment.person_id)
  return {
    ...comment,
    person: enrichedPerson || comment.person || {},
    text: comment.text || '',
    checklist: comment.checklist || [],
    attachment_files: comment.attachment_files || [],
    previews: comment.previews || [],
    acknowledgements: comment.acknowledgements || [],
    mentions: comment.mentions || [],
    department_mentions: comment.department_mentions || [],
    replies: comment.replies || [],
    task_status: comment.task_status || {}
  }
}

const taskComments = computed(() =>
  comments.value
    .filter(comment => comment.object_id === props.currentTaskId)
    .map(normalizeComment)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
)

const availableStatuses = computed(() =>
  taskStatuses.value.filter(status => status.is_client_allowed)
)

const canPost = computed(
  () =>
    props.canComment && !!props.guestId && availableStatuses.value.length > 0
)

const canSubmit = computed(
  () =>
    canPost.value &&
    !submitting.value &&
    selectedStatusId.value &&
    (commentText.value.trim() || selectedStatusId.value)
)

const currentProduction = computed(() => store.getters.currentProduction)
const fps = computed(() => parseFloat(currentProduction.value?.fps) || 25)

const buildTaskForComment = comment => {
  const entity = props.entity || {}
  return {
    id: comment.object_id,
    task_status_id: comment.task_status_id,
    task_type_id: entity.preview_file_task_type?.id,
    project_id: currentProduction.value?.id || entity.project_id,
    episode_id: entity.episode_id,
    entity: { id: entity.id, episode_id: entity.episode_id }
  }
}

const isOwnedByGuest = comment => {
  return comment.person_id === props.guestId
}

const onDeleteComment = comment => {
  commentToEdit.value = comment
  deleteError.value = false
  modals.delete = true
}

const onEditComment = comment => {
  commentToEdit.value = comment
  editError.value = false
  modals.edit = true
}

const onChecklistUpdated = async updated => {
  const existing = comments.value.find(c => c.id === updated.id)
  if (!existing) return
  const previous = existing.checklist
  existing.checklist = updated.checklist
  try {
    const res = await fetch(`${apiBase.value}/comments/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guest_id: props.guestId,
        text: existing.text,
        checklist: updated.checklist,
        task_status_id: existing.task_status_id
      })
    })
    if (!res.ok) throw new Error('checklist update failed')
    const saved = await res.json()
    comments.value = comments.value.map(c =>
      c.id === saved.id ? { ...c, ...saved } : c
    )
  } catch {
    existing.checklist = previous
  }
}

const confirmDeleteComment = async () => {
  if (!commentToEdit.value) return
  isDeleting.value = true
  deleteError.value = false
  try {
    const res = await fetch(
      `${apiBase.value}/comments/${commentToEdit.value.id}?guest_id=${props.guestId}`,
      { method: 'DELETE' }
    )
    if (!res.ok) throw new Error('delete failed')
    comments.value = comments.value.filter(c => c.id !== commentToEdit.value.id)
    modals.delete = false
  } catch {
    deleteError.value = true
  }
  isDeleting.value = false
}

const confirmEditComment = async updatedComment => {
  if (!commentToEdit.value) return
  isEditing.value = true
  editError.value = false
  const commentId = commentToEdit.value.id
  const base = `${apiBase.value}/comments/${commentId}`
  const attachmentsToDelete = updatedComment.attachmentFilesToDelete || []
  const newAttachmentFiles = updatedComment.newAttachmentFiles || []
  try {
    for (const attachment of attachmentsToDelete) {
      await fetch(
        `${base}/attachments/${attachment.id}?guest_id=${props.guestId}`,
        { method: 'DELETE' }
      )
    }
    if (newAttachmentFiles.length > 0) {
      const formData = new FormData()
      formData.append('guest_id', props.guestId)
      newAttachmentFiles.forEach((attachment, index) => {
        formData.append(`file-${index}`, attachment.get('file'))
      })
      await fetch(`${base}/attachments`, {
        method: 'POST',
        body: formData
      })
    }
    const res = await fetch(base, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guest_id: props.guestId,
        text: updatedComment.text,
        checklist: updatedComment.checklist || [],
        task_status_id: updatedComment.task_status_id
      })
    })
    if (!res.ok) throw new Error('edit failed')
    const saved = await res.json()
    comments.value = comments.value.map(c =>
      c.id === saved.id ? { ...c, ...saved } : c
    )
    const status =
      saved.task_status || store.getters.taskStatusMap.get(saved.task_status_id)
    if (status?.color) {
      emit('status-changed', {
        taskStatusId: status.id || saved.task_status_id,
        color: status.color
      })
    }
    modals.edit = false
  } catch {
    editError.value = true
  }
  isEditing.value = false
}

const insertAtCursor = text => {
  const textarea = textareaRef.value
  if (!textarea) {
    commentText.value += text
    return
  }
  const start = textarea.selectionStart ?? commentText.value.length
  const end = textarea.selectionEnd ?? commentText.value.length
  commentText.value =
    commentText.value.slice(0, start) + text + commentText.value.slice(end)
  setTimeout(() => {
    textarea.focus()
    const caret = start + text.length
    textarea.setSelectionRange(caret, caret)
  })
}

const insertEmoji = emoji => {
  const char = emoji?.i || emoji
  if (typeof char === 'string') insertAtCursor(char)
}

const insertFrameMention = () => {
  if (props.currentFrame == null) return
  const revision = props.entity?.preview_file_revision || 1
  const frame = props.currentFrame + 1
  const rendered = replaceTimeWithTimecode('@frame', revision, frame, fps.value)
  insertAtCursor(rendered + ' ')
}

const addChecklistItem = () => {
  checklistItems.value.push({
    text: '',
    checked: false,
    frame: -1,
    revision: -1
  })
}

const onAddChecklistItem = item => {
  delete item.index
  checklistItems.value.push(item)
}

const onInsertChecklistItem = item => {
  checklistItems.value.splice(item.index, 0, item)
}

const removeChecklistEntry = entry => {
  checklistItems.value = checklistItems.value.filter(e => e !== entry)
}

const onCommentTimeCodeClicked = data => {
  emit('time-code-clicked', data)
}

const onChecklistTimeCodeClicked = ({ frame, revision }) => {
  emit('time-code-clicked', {
    versionRevision: revision,
    frame: (frame || 0) - 1
  })
}

const openAttachmentPicker = () => {
  modals.attachment = true
}

const onAttachmentsConfirmed = forms => {
  modals.attachment = false
  if (forms?.length) {
    pendingAttachments.value = [...pendingAttachments.value, ...forms]
  }
}

const removePendingAttachment = index => {
  pendingAttachments.value.splice(index, 1)
}

const loadContext = async () => {
  const response = await fetch(`${apiBase.value}/context`)
  if (!response.ok) throw new Error('Failed to load context')
  const data = await response.json()
  taskStatuses.value = data.task_statuses || []
  if (availableStatuses.value.length > 0 && !selectedStatusId.value) {
    selectedStatusId.value = availableStatuses.value[0].id
  }
}

const loadComments = async () => {
  const response = await fetch(`${apiBase.value}/comments`)
  if (!response.ok) throw new Error('Failed to load comments')
  comments.value = await response.json()
  populatePersonMap()
}

const buildFullName = person => {
  const fromNames = [person.first_name, person.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  return fromNames || person.email || person.name || 'Guest'
}

const populatePersonMap = () => {
  const byId = new Map()
  comments.value.forEach(comment => {
    if (comment.person && comment.person.id) {
      byId.set(comment.person.id, {
        ...comment.person,
        full_name: comment.person.full_name || buildFullName(comment.person),
        role: comment.person.role || 'client'
      })
    }
  })
  if (byId.size > 0) {
    store.commit(LOAD_PEOPLE_END, {
      people: [...byId.values()],
      userFilters: {}
    })
  }
}

const refresh = async () => {
  loading.value = true
  try {
    await Promise.all([loadContext(), loadComments()])
  } catch {
    // Silent: panel will show empty state
  }
  loading.value = false
}

const uploadAttachments = async commentId => {
  if (pendingAttachments.value.length === 0) return null
  const formData = new FormData()
  formData.append('guest_id', props.guestId)
  pendingAttachments.value.forEach((form, index) => {
    const file = form.get('file')
    console.log('[shared-panel] attaching', index, file?.name, file?.size)
    formData.append(`file-${index}`, file)
  })
  console.log(
    '[shared-panel] POST attachments to',
    `${apiBase.value}/comments/${commentId}/attachments`
  )
  const response = await fetch(
    `${apiBase.value}/comments/${commentId}/attachments`,
    { method: 'POST', body: formData }
  )
  console.log(
    '[shared-panel] attachment response',
    response.status,
    response.ok
  )
  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    console.warn('[shared-panel] attachment upload failed:', errorText)
    return null
  }
  return response.json()
}

const submitComment = async () => {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const response = await fetch(`${apiBase.value}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guest_id: props.guestId,
        task_id: props.currentTaskId,
        task_status_id: selectedStatusId.value,
        text: commentText.value,
        checklist: checklistItems.value.filter(item => item.text.trim())
      })
    })
    if (response.ok) {
      let comment = await response.json()
      const withAttachments = await uploadAttachments(comment.id)
      if (withAttachments) comment = withAttachments
      comments.value = [comment, ...comments.value]
      // Reflect the new status colour on the surrounding entity so the
      // playlist progress bar repaints without waiting for a refetch.
      const status =
        comment.task_status ||
        store.getters.taskStatusMap.get(selectedStatusId.value)
      if (status?.color) {
        emit('status-changed', {
          taskStatusId: status.id || selectedStatusId.value,
          color: status.color
        })
      }
      commentText.value = ''
      checklistItems.value = []
      pendingAttachments.value = []
    }
  } catch {
    // No-op
  }
  submitting.value = false
}

watch(
  () => props.token,
  token => {
    if (token) refresh()
  }
)

onMounted(() => {
  if (props.token) refresh()
})
</script>

<style lang="scss" scoped>
.shared-comments-panel {
  --accent: #7c5cff;
  --accent-soft: rgba(124, 92, 255, 0.16);
  --surface: #14141a;
  --surface-raised: #1d1d26;
  --surface-inset: #0e0e13;
  --border-soft: rgba(255, 255, 255, 0.06);
  --border-strong: rgba(255, 255, 255, 0.12);
  --text: #f4f5fa;
  --text-muted: rgba(244, 245, 250, 0.6);

  background: rgba(20, 20, 26, 0.7);
  backdrop-filter: blur(18px);
  border-left: 1px solid var(--border-soft);
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  flex: 0 0 400px;
  width: 400px;
  height: 100%;
  overflow: hidden;
}

@media screen and (max-width: 768px) {
  .shared-comments-panel {
    border-left: 0;
    flex: 0 0 auto;
    inset: 0;
    position: absolute;
    width: 100%;
    z-index: 10;
  }

  .post-form {
    padding: 0.6em;
  }

  .comments-list {
    padding: 0.4em 0.6em 1em;

    :deep(article.comment) {
      margin: 0.4em 0;
    }

    :deep(.content-wrapper) {
      padding: 0.45em 0.6em;
    }

    :deep(.content-wrapper > .flexrow) {
      align-items: center;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      gap: 0.4em;
      min-width: 0;
    }

    :deep(.content-wrapper > .flexrow > .flexrow-item) {
      margin-right: 0;
    }

    :deep(strong) {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.comment-text) {
      font-size: 0.88em;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    :deep(.checklist) {
      margin-top: 0.4em;
    }

    :deep(.preview-info) {
      padding: 0.4em 0.6em;
    }

    :deep(.attachment-file),
    :deep(.attachment) {
      padding: 0.3em 0.5em;
    }
  }
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5em 0.8em 1em;
  display: flex;
  flex-direction: column;
  gap: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.loading-state,
.empty-state {
  color: var(--text-muted);
  font-size: 0.9em;
  padding: 1em;
  text-align: center;
}

.comment-wrapper {
  animation: commentFadeIn 0.45s ease both;
  margin-bottom: 0;
}

@keyframes commentFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .comment-wrapper {
    animation: none;
  }
}

.comments-list :deep(article.comment) {
  background: var(--surface-raised);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  margin: 0.6em 0;
  overflow: hidden;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: var(--border-strong);
  }

  &.pinned {
    border: 1px solid rgba(124, 92, 255, 0.5);
    box-shadow:
      0 0 0 2px rgba(124, 92, 255, 0.15),
      0 6px 22px rgba(124, 92, 255, 0.25);
    transform: none;
  }
}

.comments-list {
  :deep(.content-wrapper) {
    padding: 0.6em 0.8em;
  }

  :deep(.content-wrapper.full) {
    border-left: 1px solid transparent;
  }

  :deep(.comment-person strong) {
    color: var(--text);
    font-weight: 600;
  }

  :deep(.date),
  :deep(.comment-date),
  :deep(.comment-footer),
  :deep(.edited-text),
  :deep(.pinned-text),
  :deep(.reply-date) {
    color: var(--text-muted);
  }

  :deep(.comment-text) {
    color: var(--text);
    font-size: 0.92em;
    line-height: 1.5;
  }

  :deep(.menu-icon) {
    color: var(--text-muted);

    &:hover {
      color: var(--text);
    }
  }

  :deep(.comment-menu) {
    background: var(--surface-raised);
    border: 1px solid var(--border-strong);
    border-radius: 10px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    color: var(--text);
    overflow: hidden;

    div {
      color: var(--text);
      transition: background 0.15s ease;

      &:hover {
        background: var(--accent-soft);
      }

      &.error {
        color: #ff578c;

        &:hover {
          background: rgba(255, 87, 140, 0.15);
        }
      }
    }
  }

  :deep(.like-button) {
    color: var(--text-muted);

    &:hover {
      color: var(--text);
    }
  }

  :deep(.for-client-tag),
  :deep(.client-comment) {
    background: var(--accent-soft);
    border: 1px solid rgba(124, 92, 255, 0.25);
    border-radius: 999px;
    color: var(--accent);
    font-size: 0.72em;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin: 0.3em auto 0.1em;
    padding: 0.2em 0.7em;
    text-transform: uppercase;
    width: fit-content;
  }

  :deep(.preview-info) {
    background: var(--surface-inset);
    border-top: 1px solid var(--border-soft);
    padding: 0.5em 0.8em;
  }

  :deep(.round-name.revision) {
    background: var(--surface-inset);
    border: 1px solid rgba(124, 92, 255, 0.4);
    color: var(--accent);
  }

  :deep(.preview-status) {
    color: var(--text);
    font-size: 0.78em;
  }

  :deep(.attachment),
  :deep(.attachment-file) {
    background: var(--surface-inset);
    border: 1px solid var(--border-soft);
    border-radius: 10px;
    color: var(--text-muted);
    margin-top: 0.4em;
    padding: 0.4em 0.6em;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: var(--border-strong);
      color: var(--text);
    }
  }

  :deep(.attachment-icon) {
    color: var(--text-muted);
  }

  :deep(.checklist) {
    margin-top: 0.5em;
  }

  :deep(.reply-comment) {
    background: var(--surface-inset);
    border: 1px solid var(--border-soft);
    border-radius: 10px;
    margin: 0.4em 0;
    padding: 0.5em 0.7em;
  }

  :deep(.reply-button),
  :deep(.attachment-button) {
    color: var(--text-muted);

    &:hover {
      color: var(--text);
    }
  }
}

.post-form {
  border-bottom: 1px solid var(--border-soft);
  padding: 0.9em;
  flex-shrink: 0;
}

.comment-input {
  background: var(--surface-inset);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.9em;
  line-height: 1.5;
  min-height: 7em;
  max-height: 14em;
  padding: 0.7em 0.8em;
  resize: none;
  width: 100%;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: rgba(124, 92, 255, 0.5);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
}

.form-tools {
  align-items: center;
  gap: 0.3em;
  margin-top: 0.6em;
}

.post-compound {
  align-items: stretch;
  height: 32px;

  :deep(.status-combo) {
    background: var(--surface-inset);
    border: 1px solid var(--border-strong);
    border-right: 0;
    border-top-left-radius: 2em;
    border-bottom-left-radius: 2em;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    height: 32px;
    margin: 0;
    min-width: 64px;
    padding: 0 0.2em 0 0.55em;

    &:hover {
      border: 1px solid rgba(255, 255, 255, 0.24);
      border-right: 0;
    }

    .flexrow {
      align-items: center;
      height: 100%;
    }

    .tag {
      border-radius: 999px;
      font-size: 0.75em;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: 0.2em 0.55em;
    }

    .down-icon {
      color: var(--text-muted);
      margin-right: 0.25em;
    }
  }

  :deep(.select-input) {
    background: var(--surface-raised);
    border: 1px solid var(--border-strong);
    border-radius: 10px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
    bottom: auto;
    left: -1px;
    margin-left: 0;
    min-width: 140px;
    padding: 0.25em 0;
    top: calc(100% + 4px);
  }

  :deep(.status-line) {
    background: transparent;
    color: var(--text);
    padding: 0.3em 0.5em;

    &:hover {
      background: var(--accent-soft);
    }

    .tag {
      border-radius: 999px;
      font-size: 0.75em;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: 0.2em 0.55em;
    }
  }

  .post-button {
    align-items: center;
    background: var(--surface-inset);
    border: 1px solid var(--border-strong);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 2em;
    border-bottom-right-radius: 2em;
    box-shadow: 0 0 0 0 rgba(124, 92, 255, 0);
    color: var(--text);
    display: inline-flex;
    font-weight: 500;
    gap: 0.4em;
    height: 32px;
    padding: 0 1em 0 0.9em;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.25s ease,
      color 0.2s ease;

    &:hover:not(:disabled) {
      background: rgba(124, 92, 255, 0.12);
      border-color: rgba(124, 92, 255, 0.55);
      box-shadow: 0 8px 22px rgba(124, 92, 255, 0.32);
      color: var(--text);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    :deep(.icon) {
      height: 14px;
      width: 14px;
    }
  }
}

.tool-button,
.tool-button-slot :deep(.emoji-button) {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  height: 32px;
  justify-content: center;
  padding: 0;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
  width: 32px;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--border-soft);
    color: var(--text);
  }

  &.active {
    background: var(--accent-soft);
    border-color: rgba(124, 92, 255, 0.35);
    color: var(--text);
  }
}

.tool-button-slot {
  display: inline-flex;

  :deep(.emoji-button .icon) {
    height: 16px;
    margin: 0;
    width: 16px;
  }
}

.post-form :deep(.v3-emoji-picker) {
  --v3-picker-bg: #1d1d26;
  --v3-picker-fg: #f4f5fa;
  --v3-picker-border: rgba(255, 255, 255, 0.08);
  --v3-picker-input-bg: #0e0e13;
  --v3-picker-input-border: rgba(255, 255, 255, 0.12);
  --v3-picker-input-focus-border: rgba(124, 92, 255, 0.55);
  --v3-group-image-filter: invert(1) brightness(1.2);
  --v3-picker-emoji-hover: rgba(124, 92, 255, 0.22);

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
}

.chip-remove {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  height: 22px;
  justify-content: center;
  padding: 0;
  transition:
    background 0.2s ease,
    color 0.2s ease;
  width: 22px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
  }
}

.draft-attachments {
  list-style: none;
  margin: 0.6em 0 0;
  padding: 0;

  .draft-attachment {
    align-items: center;
    background: var(--surface-inset);
    border: 1px solid var(--border-soft);
    border-radius: 8px;
    color: var(--text-muted);
    font-size: 0.8em;
    gap: 0.45em;
    margin-bottom: 0.3em;
    padding: 0.3em 0.55em;
  }

  .draft-attachment-icon {
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .draft-attachment-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.draft-checklist {
  margin-top: 0.6em;

  :deep(.checklist-entry) {
    color: var(--text);

    .checklist-checkbox {
      color: var(--text-muted);

      .icon {
        width: 16px;
      }

      &:hover {
        color: var(--text);
      }
    }

    .checklist-text {
      background: var(--surface-inset);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      color: var(--text);
      font-size: 0.85em;
      padding: 0.35em 0.55em;
      margin-top: 0;

      &:hover,
      &:focus,
      &:active {
        background: var(--surface-inset);
        border-color: rgba(124, 92, 255, 0.5);
        box-shadow: 0 0 0 2px var(--accent-soft);
      }
    }

    &.checked .checklist-text {
      color: var(--text-muted);
      text-decoration: line-through;
    }

    .frame {
      background: var(--surface-inset);
      border-color: var(--border-soft);
      color: var(--accent);
    }

    .clock {
      color: var(--text-muted);

      &:hover {
        color: var(--text);
      }
    }
  }
}

.post-disabled {
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-muted);
  font-size: 0.85em;
  margin: 0;
  padding: 0.9em;
  text-align: center;
}

.shared-modals {
  --accent: #7c5cff;
  --accent-soft: rgba(124, 92, 255, 0.16);
  --surface: #14141a;
  --surface-raised: #1d1d26;
  --surface-inset: #0e0e13;
  --border-soft: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.18);
  --text: #f4f5fa;
  --text-muted: rgba(244, 245, 250, 0.65);

  :deep(.modal-background) {
    background: rgba(6, 6, 10, 0.75);
    backdrop-filter: blur(4px);
  }

  :deep(.modal-content .box) {
    background: var(--surface-raised);
    border: 1px solid var(--border-soft);
    border-radius: 18px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
    color: var(--text);
  }

  :deep(.modal-content .title),
  :deep(.modal-content .subtitle),
  :deep(.modal-content .label),
  :deep(.modal-content p.text),
  :deep(.modal-content h1),
  :deep(.modal-content h2),
  :deep(.modal-content h3) {
    color: var(--text);
  }

  :deep(.modal-content .subtitle),
  :deep(.modal-content .label) {
    color: var(--text-muted);
  }

  :deep(.modal-content .input),
  :deep(.modal-content textarea),
  :deep(.modal-content input[type='text']),
  :deep(.modal-content input[type='number']),
  :deep(.modal-content select) {
    background: var(--surface-inset);
    border: 1px solid var(--border-soft);
    border-radius: 10px;
    color: var(--text);

    &::placeholder {
      color: rgba(244, 245, 250, 0.35);
    }

    &:focus {
      border-color: rgba(124, 92, 255, 0.5);
      box-shadow: 0 0 0 3px var(--accent-soft);
      outline: none;
    }
  }

  :deep(.modal-content .attachment-file),
  :deep(.modal-content .upload-attachments .attachment-name) {
    background: var(--surface-inset);
    border: 1px solid var(--border-soft);
    border-radius: 10px;
    color: var(--text-muted);
    padding: 0.4em 0.6em;
  }

  :deep(.modal-content .button) {
    background: var(--surface-inset);
    border: 1px solid var(--border-soft);
    border-radius: 10px;
    color: var(--text);
    transition:
      background 0.2s ease,
      border-color 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--border-strong);
    }
  }

  :deep(.modal-content .button.is-primary) {
    background: var(--accent);
    border: 0;
    border-radius: 2em;
    color: white;
    font-weight: 600;
    padding: 0.5em 1.3em;

    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--accent) 88%, white 12%);
    }

    &:disabled {
      opacity: 0.5;
    }
  }

  :deep(.modal-content .button.is-link) {
    background: transparent;
    border: 1px solid var(--border-soft);
    color: var(--text-muted);

    &:hover {
      border-color: var(--border-strong);
      color: var(--text);
    }
  }

  :deep(.modal-content .button.is-danger) {
    background: #ff4d6d;
    border: 0;
    color: white;

    &:hover {
      background: #ff3358;
    }
  }

  :deep(.modal-content .drop-mask) {
    background: rgba(124, 92, 255, 0.18);
    border: 2px dashed rgba(124, 92, 255, 0.55);
    color: var(--text);
  }

  :deep(.modal-content .status-combo) {
    background: var(--surface-inset);
    border: 1px solid var(--border-strong);
    border-radius: 10px;
    color: var(--text);
    margin: 0;
    padding: 0 0.4em 0 0.6em;

    &:hover {
      border: 1px solid rgba(124, 92, 255, 0.55);
    }

    .selected-status-line {
      color: var(--text);
      padding: 0.4em 0;
    }

    .down-icon {
      color: var(--text-muted);
    }

    .tag {
      border-radius: 999px;
      font-size: 0.78em;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: 0.25em 0.6em;
    }
  }

  :deep(.modal-content .select-input) {
    background: var(--surface-raised);
    border: 1px solid var(--border-strong);
    border-radius: 10px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    margin-left: 0;
    padding: 0.25em 0;
  }

  :deep(.modal-content .status-line) {
    background: transparent;
    color: var(--text);
    padding: 0.35em 0.5em;

    &:hover {
      background: var(--accent-soft);
    }

    .tag {
      border-radius: 999px;
      font-size: 0.78em;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: 0.25em 0.6em;
    }
  }
}
</style>
