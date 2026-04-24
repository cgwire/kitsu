<template>
  <aside class="shared-comments-panel flexcolumn">
    <form class="post-form" @submit.prevent="submitComment" v-if="canPost">
      <div class="status-picker flexrow">
        <button
          type="button"
          class="status-chip"
          :class="{ selected: selectedStatusId === status.id }"
          :style="statusChipStyle(status)"
          :key="status.id"
          :title="status.name"
          @click="selectedStatusId = status.id"
          v-for="status in availableStatuses"
        >
          {{ status.short_name }}
        </button>
      </div>
      <textarea
        ref="textareaRef"
        class="comment-input"
        :placeholder="$t('share.comment_placeholder')"
        :disabled="submitting"
        v-model="commentText"
      />
      <ul class="draft-checklist" v-if="checklistItems.length">
        <li
          class="draft-checklist-item flexrow"
          :key="`draft-${index}`"
          v-for="(item, index) in checklistItems"
        >
          <input
            type="checkbox"
            :checked="item.checked"
            @change="item.checked = !item.checked"
          />
          <input
            type="text"
            class="draft-checklist-text filler"
            v-model="item.text"
          />
          <button
            type="button"
            class="draft-checklist-remove"
            @click="removeChecklistItem(index)"
          >
            ×
          </button>
        </li>
      </ul>
      <div class="form-tools flexrow">
        <emoji-button @select="insertEmoji" />
        <button
          type="button"
          class="tool-button"
          :title="$t('comments.add_frame_to_comment')"
          @click="insertFrameMention"
          v-if="currentFrame != null"
        >
          #F
        </button>
        <button
          type="button"
          class="tool-button"
          :title="$t('comments.add_checklist')"
          @click="addChecklistItem"
        >
          ☑
        </button>
        <div class="filler"></div>
        <button type="submit" class="button is-primary" :disabled="!canSubmit">
          {{ submitting ? $t('main.loading') : $t('comments.publish') }}
        </button>
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
          :is-checkable="false"
          :is-editable="isOwnedByGuest(comment)"
          :is-pinnable="false"
          :is-replyable="false"
          :task-types="[]"
          :team="[]"
          :revision="comment.revision || 1"
          @edit-comment="onEditComment"
          @delete-comment="onDeleteComment"
          v-for="comment in taskComments"
        />
      </template>
    </div>

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
  </aside>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { LOAD_PEOPLE_END } from '@/store/mutation-types'

// eslint-disable-next-line no-unused-vars
import TaskComment from '@/components/widgets/Comment.vue'
// eslint-disable-next-line no-unused-vars
import DeleteModal from '@/components/modals/DeleteModal.vue'
// eslint-disable-next-line no-unused-vars
import EditCommentModal from '@/components/modals/EditCommentModal.vue'
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

const store = useStore()

const comments = ref([])
const taskStatuses = ref([])
const loading = ref(true)
const submitting = ref(false)
const commentText = ref('')
const selectedStatusId = ref('')
const checklistItems = ref([])
const textareaRef = ref(null)
const modals = reactive({ edit: false, delete: false })
const commentToEdit = ref(null)
const isEditing = ref(false)
const editError = ref(false)
const isDeleting = ref(false)
const deleteError = ref(false)

const apiBase = computed(() => `/api/shared/playlists/${props.token}`)

const normalizeComment = comment => ({
  ...comment,
  text: comment.text || '',
  checklist: comment.checklist || [],
  attachment_files: comment.attachment_files || [],
  previews: comment.previews || [],
  acknowledgements: comment.acknowledgements || [],
  mentions: comment.mentions || [],
  department_mentions: comment.department_mentions || [],
  replies: comment.replies || [],
  task_status: comment.task_status || {}
})

const taskComments = computed(() =>
  comments.value
    .filter(comment => comment.object_id === props.currentTaskId)
    .map(normalizeComment)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
)

const availableStatuses = computed(() => {
  const clientAllowed = taskStatuses.value.filter(
    status => status.is_client_allowed
  )
  if (clientAllowed.length > 0) return clientAllowed
  // Fallback: no explicit client-allowed status → offer them all so a guest
  // can still post. Backend will still enforce via project permissions.
  return taskStatuses.value
})

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

const statusChipStyle = status => ({
  borderLeft: `4px solid ${status.color}`
})

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
  insertAtCursor(`[[frame ${props.currentFrame}]]`)
}

const addChecklistItem = () => {
  checklistItems.value.push({ text: '', checked: false })
}

const removeChecklistItem = index => {
  checklistItems.value.splice(index, 1)
}

const loadContext = async () => {
  const response = await fetch(`${apiBase.value}/context`)
  if (!response.ok) throw new Error('Failed to load context')
  const data = await response.json()
  taskStatuses.value = data.task_statuses || []
  if (taskStatuses.value.length > 0 && !selectedStatusId.value) {
    selectedStatusId.value = taskStatuses.value[0].id
  }
}

const loadComments = async () => {
  const response = await fetch(`${apiBase.value}/comments`)
  if (!response.ok) throw new Error('Failed to load comments')
  comments.value = await response.json()
  populatePersonMap()
}

const populatePersonMap = () => {
  const byId = new Map()
  comments.value.forEach(comment => {
    if (comment.person && comment.person.id) {
      byId.set(comment.person.id, {
        ...comment.person,
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
      const comment = await response.json()
      comments.value = [comment, ...comments.value]
      commentText.value = ''
      checklistItems.value = []
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
  margin-bottom: 0;
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

.status-picker {
  flex-wrap: wrap;
  gap: 0.35em;
  margin-bottom: 0.6em;
}

.status-chip {
  background: var(--surface-inset);
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.72em;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 0.3em 0.7em;
  text-transform: uppercase;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--border-strong);
    color: var(--text);
  }

  &.selected {
    background: var(--accent-soft);
    border-color: rgba(124, 92, 255, 0.4);
    color: var(--text);
  }
}

.comment-input {
  background: var(--surface-inset);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.9em;
  min-height: 80px;
  padding: 0.7em 0.8em;
  resize: vertical;
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
  gap: 0.4em;
  margin-top: 0.6em;

  :deep(.button.is-primary) {
    background: var(--accent);
    border: 0;
    border-radius: 999px;
    box-shadow: 0 4px 14px rgba(124, 92, 255, 0.35);
    color: white;
    font-weight: 600;
    padding: 0.55em 1.2em;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(124, 92, 255, 0.5);
      transform: translateY(-1px);
    }

    &:disabled {
      box-shadow: none;
      opacity: 0.5;
    }
  }
}

.tool-button {
  background: var(--surface-inset);
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.8em;
  padding: 0.35em 0.65em;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--border-strong);
    color: var(--text);
  }
}

.draft-checklist {
  list-style: none;
  margin: 0.6em 0 0;
  padding: 0;

  .draft-checklist-item {
    align-items: center;
    gap: 0.45em;
    margin-bottom: 0.3em;
  }

  .draft-checklist-text {
    background: var(--surface-inset);
    border: 1px solid var(--border-soft);
    border-radius: 8px;
    color: var(--text);
    font-size: 0.85em;
    padding: 0.35em 0.55em;

    &:focus {
      border-color: rgba(124, 92, 255, 0.5);
      box-shadow: 0 0 0 2px var(--accent-soft);
      outline: none;
    }
  }

  .draft-checklist-remove {
    background: transparent;
    border: 0;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1.1em;
    padding: 0 0.3em;

    &:hover {
      color: var(--text);
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
</style>
