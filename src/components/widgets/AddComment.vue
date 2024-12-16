<template>
  <article
    ref="wrapper"
    @drop="onDrop"
    @dragover="onDragover"
    @dragleave="onDragleave"
    :class="{
      'add-comment': true,
      'word-break': true,
      media: true,
      'is-dragging': isDragging
    }"
  >
    <div class="media-content">
      <div class="flexrow tab-row">
        <span
          :class="{
            'flexrow-item': true,
            filler: true,
            'has-text-centered': true,
            active: mode === 'status'
          }"
          @click="mode = 'status'"
        >
          {{ $t('tasks.change_status') }}
        </span>
        <span
          :class="{
            'flexrow-item': true,
            filler: true,
            'has-text-centered': true,
            active: mode === 'publish'
          }"
          @click="mode = 'publish'"
          v-if="!isConcept"
        >
          {{ $t('tasks.publish_revision') }}
        </span>
      </div>

      <at-ta
        :members="atOptions"
        name-key="full_name"
        :limit="2"
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
          ref="comment-textarea"
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
          ref="input-link"
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
          :checklist="checklist"
          :frame="frame + 1"
          :revision="revision"
          :is-movie-preview="isMovie"
          @add-item="onAddChecklistItem"
          @insert-item="onInsertChecklistItem"
          @remove-task="removeTask"
          v-if="checklist.length > 0"
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
          <button-simple
            :class="{
              'flexrow-item': true,
              active: attachments.length !== 0
            }"
            icon="attach"
            :title="$t('comments.add_attachment')"
            @click="onAddCommentAttachmentClicked()"
            v-if="mode === 'status'"
          />
          <button-simple
            :class="{
              'flexrow-item': true,
              active: checklist.length !== 0
            }"
            icon="list"
            :title="$t('comments.add_checklist')"
            @click="addChecklistEntry(-1)"
            v-if="mode === 'status'"
          />
          <button-simple
            :class="{
              'flexrow-item': true,
              active: showCommentArea
            }"
            icon="comment"
            :title="$t('comments.add_comment')"
            @click="showCommentArea = !showCommentArea"
            v-if="mode === 'publish'"
          />
          <button-simple
            :class="{
              'flexrow-item': true,
              active: showLinkField
            }"
            icon="link"
            :title="$t('comments.add_link')"
            @click="toggleLinkField"
            v-if="mode === 'publish'"
          />
          <div class="filler"></div>
          <combobox-status
            class="flexrow-item status-selector"
            :narrow="true"
            :color-only="true"
            :task-status-list="taskStatus"
            :production-id="task.project_id"
            v-model="task_status_id"
          />
          <button-simple
            :class="{
              'post-button': true,
              'flexrow-item': true,
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

        <div class="error pull-right" v-if="isError">
          <em>{{ $t('comments.error') }}</em>
        </div>
        <div class="error pull-right" v-if="isMaxRetakesError">
          <em>{{ $t('comments.max_retakes_error') }}</em>
        </div>
      </div>
    </div>

    <add-attachment-modal
      ref="add-attachment-modal"
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

<script>
import AtTa from 'vue-at/dist/vue-at-textarea'
import { mapGetters } from 'vuex'

import drafts from '@/lib/drafts'
import { remove } from '@/lib/models'
import { getDownloadAttachmentPath } from '@/lib/path'
import { replaceTimeWithTimecode } from '@/lib/render'
import strings from '@/lib/string'

import AddAttachmentModal from '@/components/modals/AddAttachmentModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Checklist from '@/components/widgets/Checklist.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'

const REVISION_NUMBER_REGEX = /v(\d+)/gi

export default {
  name: 'add-comment',

  components: {
    AtTa,
    AddAttachmentModal,
    ButtonSimple,
    Checklist,
    ConfirmModal,
    ComboboxStatus,
    PeopleAvatar
  },

  emits: [
    'add-comment',
    'add-preview',
    'annotation-snapshots-requested',
    'clear-files',
    'file-drop',
    'remove-preview'
  ],

  inject: ['draftComment'],

  data() {
    return {
      atOptions: [],
      isDragging: false,
      errors: {
        addCommentAttachment: false
      },
      loading: {
        addCommentAttachment: false
      },
      modals: {
        addCommentAttachment: false,
        confirmFeedbackPublish: false
      }
    }
  },

  props: {
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
  },

  beforeMount() {
    if (!this.attachments) {
      this.attachments = []
    }
    if (!this.checklist) {
      this.checklist = []
    }
  },

  mounted() {
    const production = this.productionMap.get(this.task.project_id)
    this.mode =
      production.is_publish_default_for_artists && this.isCurrentUserArtist
        ? 'publish'
        : 'status'

    this.$nextTick(() => {
      ;[
        'drag',
        'dragstart',
        'dragend',
        'dragover',
        'dragenter',
        'dragleave',
        'drop'
      ].forEach(evt => {
        if (this.$refs.wrapper) {
          this.$refs.wrapper.addEventListener(evt, e => {
            e.preventDefault()
            e.stopPropagation()
          })
        }
      })
    })
  },

  computed: {
    ...mapGetters([
      'departmentMap',
      'isCurrentUserArtist',
      'isCurrentUserClient',
      'productionDepartmentIds',
      'productionMap',
      'taskStatusForCurrentUser',
      'taskStatusMap',
      'taskTypeMap',
      'uploadProgress'
    ]),

    attachments: {
      get() {
        return this.draftComment.attachments
      },
      set(value) {
        this.draftComment.attachments = value
      }
    },

    checklist: {
      get() {
        return this.draftComment.checklist
      },
      set(value) {
        this.draftComment.checklist = value
      }
    },

    link: {
      get() {
        return this.draftComment.link
      },
      set(value) {
        this.draftComment.link = value
      }
    },

    mode: {
      get() {
        return this.draftComment.mode
      },
      set(value) {
        this.draftComment.mode = value
      }
    },

    nextRevision: {
      get() {
        return this.draftComment.nextRevision
      },
      set(value) {
        this.draftComment.nextRevision = value
      }
    },

    showCommentArea: {
      get() {
        return this.draftComment.showCommentArea
      },
      set(value) {
        this.draftComment.showCommentArea = value
      }
    },

    showLinkField: {
      get() {
        return this.draftComment.showLinkField
      },
      set(value) {
        this.draftComment.showLinkField = value
      }
    },

    task_status_id: {
      get() {
        return this.draftComment.task_status_id
      },
      set(value) {
        this.draftComment.task_status_id = value
      }
    },

    text: {
      get() {
        return this.draftComment.text
      },
      set(value) {
        this.draftComment.text = value
        drafts.setTaskDraft(this.task.id, this.text)
      }
    },

    attachmentModal() {
      return this.$refs['add-attachment-modal']
    },

    isConcept() {
      return this.$route.path.includes('concept')
    },

    isValidForm() {
      return Boolean(
        this.mode === 'status' ||
          (this.mode === 'publish' &&
            this.previewForms.length &&
            (this.nextRevision === undefined ||
              this.nextRevision > this.revision) &&
            (!this.showLinkField ||
              !this.link ||
              this.$refs['input-link']?.checkValidity()))
      )
    }
  },

  methods: {
    shortenText: strings.shortenText,

    toggleLinkField(reset = false) {
      this.showLinkField = !this.showLinkField
      if (this.showLinkField) {
        this.$nextTick(() => {
          this.$refs['input-link']?.focus()
        })
      }
      if (reset) {
        this.link = null
      }
    },

    runAddComment(
      text,
      attachments,
      checklist,
      taskStatusId,
      revision,
      link,
      force = false
    ) {
      if (!this.isValidForm) {
        return
      }
      const taskStatus = this.taskStatusMap.get(this.task_status_id)
      if (
        taskStatus.is_feedback_request &&
        this.previewForms.length === 0 &&
        !force
      ) {
        this.modals.confirmFeedbackPublish = true
        return
      }

      this.$store.commit('CLEAR_UPLOAD_PROGRESS')
      if (this.mode === 'publish') {
        if (!this.showCommentArea) text = ''
        attachments = []
        checklist = []
      } else {
        checklist = checklist.filter(item => item.text.length)
      }
      text = replaceTimeWithTimecode(text, this.revision, this.time, this.fps)

      revision = Number(revision)
      if (isNaN(revision) || revision < 1) {
        revision = undefined
      }

      if (!this.showLinkField) {
        link = null
      }

      this.$emit(
        'add-comment',
        text,
        attachments,
        checklist,
        taskStatusId,
        revision,
        link
      )
      this.text = ''
      this.link = null
      this.attachments = []
      this.checklist = []
      this.nextRevision = undefined
    },

    focus() {
      const textarea = this.$refs['comment-textarea']
      if (textarea) {
        textarea.focus()
        const caretPosition = textarea.value.length
        textarea.setSelectionRange(caretPosition, caretPosition)
      }
    },

    getRevision(form) {
      if (!form) {
        return undefined
      }
      const file = form.get('file')
      const rgxMatches = file.name.matchAll(REVISION_NUMBER_REGEX)
      const revision = Array.from(rgxMatches).pop()?.[1]
      return revision
    },

    onAddChecklistItem(item) {
      delete item.index
      this.checklist.push(item)
    },

    onInsertChecklistItem(item) {
      this.checklist.splice(item.index, 0, item)
      for (let i = 0; i < this.checklist.length; i++) {
        this.checklist[i].index = i
      }
    },

    resetStatus() {
      const taskStatus = this.taskStatusMap.get(this.task.task_status_id)
      if (
        (!this.isCurrentUserArtist || taskStatus.is_artist_allowed) &&
        (!this.isCurrentUserClient || taskStatus.is_client_allowed)
      ) {
        this.task_status_id = this.task.task_status_id
      } else {
        this.task_status_id = this.taskStatusForCurrentUser[0]?.id
      }
    },

    onDragover() {
      this.isDragging = true
    },

    onDragleave() {
      this.isDragging = false
    },

    onDrop(event) {
      if (event.target.id === 'drop-mask') return
      if (
        event.target.parentElement?.className?.indexOf('add-attachment-box') >=
        0
      )
        return
      if (
        event.target.parentElement?.className?.indexOf(
          'add-attachment-buttons'
        ) >= 0
      )
        return
      if (
        event.target.parentElement?.className?.indexOf(
          'attachment-modal-box'
        ) >= 0
      )
        return

      const forms = []
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const form = new FormData()
        form.append('file', event.dataTransfer.files[i])
        forms.push(form)
      }
      if (this.mode === 'publish') {
        this.$emit('file-drop', forms)
      } else {
        this.addCommentAttachment(forms)
      }
      this.isDragging = false
    },

    onAddCommentAttachmentClicked() {
      this.modals.addCommentAttachment = true
    },

    addCommentAttachment(forms) {
      this.onCloseCommentAttachment()
      this.attachments = this.attachments.concat(forms)
    },

    onCloseCommentAttachment() {
      this.modals.addCommentAttachment = false
    },

    removeAttachment(attach) {
      this.attachments = this.attachments.filter(a => a !== attach)
    },

    addChecklistEntry(index) {
      if (index === -1 || index === this.checklist.length - 1) {
        this.checklist.push({
          text: '',
          checked: false
        })
      }
    },

    removeTask(entry) {
      this.checklist = remove(this.checklist, entry)
    },

    async setValue(comment) {
      this.checklist = JSON.parse(JSON.stringify(comment.checklist))
      this.text = comment.text

      // duplicate attachment files
      this.attachments = (
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
    },

    onAtTextChanged(input) {
      if (input.includes('@frame')) {
        this.text = replaceTimeWithTimecode(
          input,
          this.revision,
          this.frame + 1,
          this.fps
        )
      }
    },

    setAnnotationSnapshots(files) {
      this.attachmentModal.addFiles(files)
    },

    showAnnotationLoading() {
      this.attachmentModal.showAnnotationLoading()
    },

    hideAnnotationLoading() {
      this.attachmentModal.hideAnnotationLoading()
    }
  },

  watch: {
    task: {
      immediate: true,
      handler() {
        this.resetStatus()
        const draft = drafts.getTaskDraft(this.task.id)
        if (draft) {
          this.text = draft
        }
      }
    },

    mode() {
      if (this.mode === 'publish') {
        this.checklist = []
        this.attachments = []
        if (this.text && this.text.length > 0) {
          this.showCommentArea = true
        }
      } else {
        this.$emit('clear-files')
      }
    },

    previewForms: {
      deep: true,
      immediate: true,
      handler() {
        const form = this.previewForms?.findLast(
          form => this.getRevision(form) > 0
        )
        this.nextRevision = this.getRevision(form)
      }
    },

    team: {
      deep: true,
      immediate: true,
      handler() {
        if (this.isCurrentUserClient) {
          this.atOptions = [
            ...this.team.filter(person =>
              ['admin', 'manager', 'supervisor', 'client'].includes(person.role)
            )
          ]
        } else {
          this.atOptions = [...this.team]
        }
        this.atOptions = this.atOptions.concat(
          this.productionDepartmentIds.map(departmentId => {
            const department = this.departmentMap.get(departmentId)
            return {
              isDepartment: true,
              full_name: department.name,
              color: department.color,
              id: departmentId
            }
          })
        )
        this.atOptions.push({
          isTime: true,
          full_name: 'frame'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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
  color: lighten($dark-grey-light, 40%);
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

.button-row {
  .button:hover {
    transform: scale(1.2);
    transition: transform 0.1s linear;

    &.post-button:hover {
      transform: none;
    }
  }
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
