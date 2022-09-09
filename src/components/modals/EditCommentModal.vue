<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box">
      <h1 class="title" v-if="commentToEdit && commentToEdit.id">
        {{ $t("comments.edit_title") }}
      </h1>

      <form v-on:submit.prevent>
        <combo-box-status
          :label="$t('task_status.title')"
          :task-status-list="taskStatusForCurrentUser"
          v-model="form.task_status_id"
        />

        <div class="field">
        <label class="label">
          {{ $t('comments.text') }}
        </label>
          <at-ta
            :members="team"
            name-key="full_name"
            limit="2"
          >
            <template slot="item" slot-scope="team">
              <div class="flexrow">
                <people-avatar
                  class="flexrow-item"
                  :person="team.item"
                  :size="20"
                  :no-cache="true"
                />
                <span class="flexrow-item">
                  {{ team.item.full_name }}
                </span>
              </div>
            </template>

            <textarea
              class="input"
              ref="textField"
              v-model="form.text"
              @keyup.ctrl="runConfirmation"
              @keyup.meta="runConfirmation"
              v-focus
            >
            </textarea>
          </at-ta>
        </div>
        <label class="label">
          {{ $t('comments.checklist') }}
        </label>
        <checklist
          class="comment-checklist"
          :checklist="form.checklist"
          @add-item="onAddChecklistItem"
          @remove-task="removeTask"
        />
        <label class="label">
          {{ $t('comments.attachments') }}
        </label>
        <div
          class="attachments"
          v-if="commentToEdit && form.attachment_files.length > 0"
        >
          <div
            :key="'attachment-' + index"
            class="attachment-file"
            v-for="(attachment, index) in form.attachment_files"
          >
            {{ attachment.name }}
            <span @click="removeAttachment(attachment)">
              <x-icon size="0.9x" />
            </span>
          </div>
        </div>
        <div v-else>
          {{ $t('comments.no_attachments') }}
        </div>
      </form>
      <label class="label mt2">
        {{ $t('comments.attachments_to_add') }}
      </label>
      <div
        class="new-attachments"
      >
        <div
          :key="'new-attachment-' + index"
          class="attachment-file"
          v-for="(attachment, index) in attachmentFiles"
        >
          {{ attachment.get('file').name }}
          <span @click="removeNewAttachment(attachment)">x</span>
        </div>
      </div>

      <div>
        <file-upload
          ref="file-field"
          class="flexrow-item"
          :accept="extensions"
          :is-primary="false"
          :label="$t('main.select_file')"
          :multiple="true"
          @fileselected="onFileSelected"
          hide-file-names
        />
      </div>
      <modal-footer
        :error-text="$t('comments.edit_error')"
        :is-error="isError"
        :is-loading="isLoading"
        @confirm="runConfirmation"
        @cancel="$emit('cancel')"
      />
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import { remove } from '@/lib/models'
import files from '@/lib/files'

import { XIcon } from 'vue-feather-icons'

import AtTa from 'vue-at/dist/vue-at-textarea'
import Checklist from '@/components/widgets/Checklist'
import ComboBoxStatus from '@/components/widgets/ComboboxStatus.vue'
import FileUpload from '@/components/widgets/FileUpload'
import ModalFooter from '@/components/modals/ModalFooter'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'

export default {
  name: 'edit-comment-modal',
  mixins: [modalMixin],
  components: {
    AtTa,
    Checklist,
    ComboBoxStatus,
    FileUpload,
    ModalFooter,
    PeopleAvatar,
    XIcon
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    commentToEdit: {
      type: Object,
      default: () => {}
    },
    team: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      attachmentFiles: [],
      extensions: files.ALL_EXTENSIONS_STRING,
      form: {
        text: '',
        task_status_id: null,
        checklist: [{ checked: false, text: '' }]
      }
    }
  },

  computed: {
    ...mapGetters([
      'taskStatusForCurrentUser'
    ])
  },

  methods: {
    runConfirmation (event) {
      if (!event || event.keyCode === 13 || !event.keyCode) {
        const result = {
          id: this.commentToEdit.id,
          ...this.form,
          newAttachmentFiles: this.attachmentFiles,
          attachmentFilesToDelete: this.attachmentFilesToDelete
        }
        const isEmptyChecklist =
          result.checklist.length === 1 && result.checklist[0].text === ''
        if (isEmptyChecklist) result.checklist = []
        this.$emit('confirm', result)
      }
    },

    removeTask (entry) {
      this.form.checklist = [...remove(this.form.checklist, entry)]
    },

    removeAttachment (attachment) {
      this.form.attachment_files =
        remove(this.form.attachment_files, attachment)
      this.attachmentFilesToDelete.push(attachment)
    },

    removeNewAttachment (attachment) {
      this.attachmentFiles = remove(this.attachmentFiles, attachment)
    },

    onFileSelected (attachmentFiles) {
      this.attachmentFiles = attachmentFiles
    },

    reset () {
      this.attachmentFiles = []
      this.attachmentFilesToDelete = []
      if (this.commentToEdit && this.commentToEdit.id) {
        this.form = {
          text: this.commentToEdit.text,
          task_status_id: this.commentToEdit.task_status_id,
          checklist: [...this.commentToEdit.checklist],
          attachment_files: [...this.commentToEdit.attachment_files]
        }
        if (this.form.checklist.length === 0) {
          this.form.checklist = [{ checked: false, text: '' }]
        }
      } else {
        this.form = {
          text: '',
          task_status_id: null,
          checklist: [{ checked: false, text: '' }],
          attachment_files: []
        }
      }
    },

    onAddChecklistItem (item) {
      this.form.checklist[item.index].text =
        this.form.checklist[item.index].text.trim()
      delete item.index
      this.form.checklist.push(item)
    }
  },

  watch: {
    commentToEdit () {
      this.reset()
    },

    active () {
      if (this.active) {
        setTimeout(() => {
          this.reset()
          this.$refs.textField.focus()
        }, 100)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.is-danger {
  color: #ff3860;
  font-style: italic;
}

textarea {
  min-height: 8em;
  padding: 0.5em;
}

.modal-content {
  overflow: initial;
}

.comment-checklist {
  overflow-y: auto;
  max-height: 200px;
  margin-bottom: 2em;
}

.label.mt2 {
  margin-top: 2em;
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
</style>
