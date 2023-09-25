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
        >
          {{ $t('tasks.publish_revision') }}
        </span>
      </div>

      <at-ta
        :members="atOptions"
        name-key="full_name"
        :limit="2"
        @input="onTextChanged"
        v-if="mode === 'status' || showCommentArea"
      >
        <template slot="item" slot-scope="team">
          <template v-if="team.item.isTime"> ⏱️ frame </template>
          <template v-else-if="team.item.isDepartment">
            <span
              class="mr05"
              :style="{
                background: team.item.color,
                width: '10px',
                height: '10px',
                'border-radius': '50%'
              }"
            >
              &nbsp;
            </span>
            {{ team.item.full_name }}
          </template>
          <template v-else>
            <div class="flexrow">
              <people-avatar
                class="flexrow-item"
                :person="team.item"
                :size="20"
                :font-size="11"
                :no-cache="true"
                :is-link="false"
              />
              <span class="flexrow-item">
                {{ team.item.full_name }}
              </span>
            </div>
          </template>
        </template>
        <textarea-autosize
          ref="comment-textarea"
          class="textarea flexrow-item"
          :placeholder="$t('comments.add_comment')"
          :disabled="isLoading"
          :min-height="50"
          :max-height="300"
          @keyup.enter.ctrl.native="
            runAddComment(
              text,
              attachments,
              checklist,
              task_status_id,
              nextRevision
            )
          "
          @keyup.enter.meta.native="
            runAddComment(
              text,
              attachments,
              checklist,
              task_status_id,
              nextRevision
            )
          "
          v-model="text"
          v-focus
        />
      </at-ta>
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
          <div class="filler"></div>
          <combobox-status
            class="flexrow-item status-selector"
            :narrow="true"
            :color-only="true"
            :task-status-list="taskStatus"
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
                nextRevision
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

    <add-comment-image-modal
      ref="add-comment-image-modal"
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
        modals.confirmFeedbackPublish = false
        runAddComment(
          text,
          attachments,
          checklist,
          task_status_id,
          nextRevision,
          true
        )
      "
    />
  </article>
</template>

<script>
import { mapGetters } from 'vuex'
import { remove } from '@/lib/models'
import strings from '@/lib/string'
import colors from '@/lib/colors'
import { replaceTimeWithTimecode } from '@/lib/render'

import AtTa from 'vue-at/dist/vue-at-textarea'
import AddCommentImageModal from '@/components/modals/AddCommentImageModal'
import ConfirmModal from '@/components/modals/ConfirmModal'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import ComboboxStatus from '@/components/widgets/ComboboxStatus'
import Checklist from '@/components/widgets/Checklist'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'

const REVISION_NUMBER_REGEX = /v(\d+)/gi

export default {
  name: 'add-comment',

  components: {
    AtTa,
    AddCommentImageModal,
    ButtonSimple,
    ConfirmModal,
    Checklist,
    ComboboxStatus,
    PeopleAvatar
  },

  data() {
    return {
      atOptions: [],
      attachments: [],
      checklist: [],
      isDragging: false,
      mode: 'status',
      showCommentArea: false,
      nextRevision: undefined,
      text: '',
      task_status_id: null,
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
    addComment: {
      type: Function,
      default: null
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
    light: {
      type: Boolean,
      default: false
    },
    task: {
      type: Object,
      default: () => {}
    },
    taskStatus: {
      type: Array,
      default: () => []
    },
    user: {
      type: Object,
      default: () => {}
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

  mounted() {
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
    this.resetStatus()
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'departmentMap',
      'isDarkTheme',
      'isCurrentUserArtist',
      'isCurrentUserClient',
      'uploadProgress',
      'productionDepartmentIds',
      'taskStatusForCurrentUser',
      'taskTypeMap',
      'taskStatusMap'
    ]),

    attachmentModal() {
      return this.$refs['add-comment-image-modal']
    },

    isAddChecklistAllowed() {
      const status =
        this.taskStatus.find(t => t.id === this.task_status_id) ||
        this.taskStatus[0]
      return status.is_retake && this.checklist.length === 0
    },

    isValidForm() {
      return (
        this.mode === 'status' ||
        (this.mode == 'publish' &&
          this.previewForms.length &&
          (this.nextRevision === undefined ||
            this.nextRevision > this.revision))
      )
    },

    taskStatusColor() {
      const status =
        this.taskStatus.find(t => t.id === this.task_status_id) ||
        this.taskStatus[0]
      if (status.color === '#f5f5f5') {
        return this.isDarkTheme ? '#666' : '#999'
      } else {
        const color = status.color
        if (this.isDarkTheme) {
          return colors.darkenColor(color)
        } else {
          return color
        }
      }
    },

    frame() {
      return Math.floor(this.time * this.fps)
    }
  },

  methods: {
    shortenText: strings.shortenText,
    runAddComment(
      text,
      attachments,
      checklist,
      taskStatusId,
      revision,
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

      this.$emit(
        'add-comment',
        text,
        attachments,
        checklist,
        taskStatusId,
        revision
      )
      this.text = ''
      this.attachments = []
      this.checklist = []
      this.nextRevision = undefined
    },

    focus() {
      if (this.$refs['comment-textarea']) {
        this.$refs['comment-textarea'].$el.focus()
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
      if (this.task) {
        const taskStatus = this.taskStatusMap.get(this.task.task_status_id)
        if (
          (!this.isCurrentUserArtist || taskStatus.is_artist_allowed) &&
          (!this.isCurrentUserClient || taskStatus.is_client_allowed)
        ) {
          this.task_status_id = this.task.task_status_id
        } else {
          this.task_status_id = this.taskStatusForCurrentUser[0].id
        }
      }
    },

    onDragover() {
      this.isDragging = true
    },

    onDragleave() {
      this.isDragging = false
    },

    onDrop(event) {
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

    onAddCommentAttachmentClicked(comment) {
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

    setValue(comment) {
      this.checklist = comment.checklist
      this.$nextTick(() => {
        this.$refs['comment-textarea'].value = comment.text
        this.text = comment.text
      })
    },

    onTextChanged(input) {
      if (input.indexOf('@frame') >= 0) {
        this.$nextTick(() => {
          const text = replaceTimeWithTimecode(
            this.$refs['comment-textarea'].value,
            this.revision,
            this.time,
            this.fps
          )
          this.$refs['comment-textarea'].value = text
        })
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
    task() {
      this.resetStatus()
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
        const form = this.previewForms.findLast(
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
    min-height: 3.5em;
    border-radius: 0px;

    &:focus,
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
    padding: 0em 10px;

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
  margin-bottom: 0px;

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
