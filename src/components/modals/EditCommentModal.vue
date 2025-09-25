<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <h1 class="title" v-if="commentToEdit && commentToEdit.id">
          {{ $t('comments.edit_title') }}
        </h1>

        <form @submit.prevent>
          <combobox-status
            :label="$t('task_status.title')"
            :task-status-list="taskStatuses"
            v-model="form.task_status_id"
          />

          <div class="field">
            <label class="label">
              {{ $t('comments.text') }}
            </label>
            <at-ta
              :ats="['#', '@']"
              :members="[...membersForAts['@'], ...membersForAts['#']]"
              name-key="full_name"
              limit="2"
              :filter-match="atOptionsFilter"
              @update:value="onAtTextChanged"
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
                    />
                    <span class="flexrow-item">
                      {{ item.full_name }}
                    </span>
                  </div>
                </template>
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
          <text-field
            ref="input-link"
            :label="$t('main.link')"
            placeholder="https://..."
            type="url"
            @enter="runConfirmation"
            v-model.trim="form.link"
            v-if="isPreviewsComment"
          />
          <label class="label">
            {{ $t('comments.checklist') }}
          </label>
          <checklist
            class="comment-checklist"
            :checklist="
              form.checklist.length
                ? form.checklist
                : [{ checked: false, text: '' }]
            "
            @add-item="onAddChecklistItem"
            @insert-item="onInsertChecklistItem"
            @remove-task="removeTask"
          />
          <label class="label">
            {{ $t('comments.attachments') }}
          </label>
          <div
            class="attachments"
            v-if="commentToEdit && (form.attachment_files || []).length > 0"
          >
            <div
              :key="'attachment-' + index"
              class="attachment-file"
              v-for="(attachment, index) in form.attachment_files"
            >
              {{ attachment.name }}
              <span @click="removeAttachment(attachment)">
                <x-icon :size="12" />
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
        <div class="new-attachments">
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
          :is-disabled="!isValidForm"
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
import { XIcon } from 'lucide-vue-next'
import AtTa from 'vue-at/dist/vue-at-textarea'
import { mapGetters } from 'vuex'

import files from '@/lib/files'
import { remove } from '@/lib/models'
import { replaceTimeWithTimecode } from '@/lib/render'

import { modalMixin } from '@/components/modals/base_modal'

import Checklist from '@/components/widgets/Checklist.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import FileUpload from '@/components/widgets/FileUpload.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TextField from '@/components/widgets/TextField.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

export default {
  name: 'edit-comment-modal',

  mixins: [modalMixin],

  components: {
    AtTa,
    Checklist,
    ComboboxStatus,
    FileUpload,
    ModalFooter,
    PeopleAvatar,
    TaskTypeName,
    TextField,
    XIcon
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    frame: {
      type: Number,
      default: 0
    },
    commentToEdit: {
      type: Object,
      default: () => {}
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
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
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      membersForAts: { '@': [], '#': [] },
      attachmentFiles: [],
      extensions: files.ALL_EXTENSIONS_STRING,
      form: {
        text: '',
        task_status_id: null,
        checklist: [{ checked: false, text: '' }],
        link: null
      }
    }
  },

  computed: {
    ...mapGetters([
      'departmentMap',
      'getTaskStatusForCurrentUser',
      'isCurrentUserClient',
      'productionDepartmentIds',
      'taskStatusForCurrentUser'
    ]),

    taskStatuses() {
      return this.isConceptTask
        ? this.getTaskStatusForCurrentUser(null, true)
        : this.taskStatusForCurrentUser.filter(status => !status.for_concept)
    },

    isConceptTask() {
      return this.$route.path.includes('concept')
    },

    isPreviewsComment() {
      return this.commentToEdit?.previews?.length > 0
    },

    isValidForm() {
      return Boolean(
        !this.isPreviewsComment ||
          !this.form.link ||
          this.$refs['input-link']?.checkValidity()
      )
    }
  },

  methods: {
    runConfirmation(event) {
      if (!event || event.keyCode === 13 || !event.keyCode) {
        const result = {
          id: this.commentToEdit.id,
          text: this.form.text,
          task_status_id: this.form.task_status_id,
          checklist: this.form.checklist.filter(item => item.text.length),
          newAttachmentFiles: this.attachmentFiles,
          attachmentFilesToDelete: this.attachmentFilesToDelete,
          links: this.form.link ? [this.form.link] : null
        }
        this.$emit('confirm', result)
      }
    },

    removeTask(entry) {
      this.form.checklist = [...remove(this.form.checklist, entry)]
    },

    removeAttachment(attachment) {
      this.form.attachment_files = remove(
        this.form.attachment_files,
        attachment
      )
      this.attachmentFilesToDelete.push(attachment)
    },

    removeNewAttachment(attachment) {
      this.attachmentFiles = remove(this.attachmentFiles, attachment)
    },

    onFileSelected(attachmentFiles) {
      this.attachmentFiles = attachmentFiles
    },

    reset() {
      this.attachmentFiles = []
      this.attachmentFilesToDelete = []
      if (this.commentToEdit && this.commentToEdit.id) {
        this.form = {
          text: this.commentToEdit.text,
          task_status_id: this.commentToEdit.task_status_id,
          checklist: [...this.commentToEdit.checklist],
          attachment_files: [...this.commentToEdit.attachment_files],
          link: this.commentToEdit.links?.[0]
        }
        if (this.form.checklist.length === 0) {
          this.form.checklist = [{ checked: false, text: '' }]
        }
      } else {
        this.form = {
          text: '',
          task_status_id: null,
          checklist: [{ checked: false, text: '' }],
          attachment_files: [],
          link: null
        }
      }
    },

    onAddChecklistItem(item) {
      delete item.index
      this.form.checklist.push(item)
    },

    onInsertChecklistItem(item) {
      this.form.checklist.splice(item.index, 0, item)
      for (let i = 0; i < this.form.checklist.length; i++) {
        this.form.checklist[i].index = i
      }
    },

    atOptionsFilter(name, chunk, at, v) {
      // filter the list by the given at symbol
      const option_at = v?.isTaskType ? '#' : '@'
      // @ for team, # for task type
      if (at !== option_at) return false
      // match at lower-case
      return name?.toLowerCase().indexOf(chunk.toLowerCase()) > -1
    },

    onAtTextChanged(input) {
      if (input.includes('@frame')) {
        this.form.text = replaceTimeWithTimecode(
          input,
          this.revision,
          this.frame + 1,
          this.fps
        )
      }
    }
  },

  watch: {
    commentToEdit() {
      this.reset()
    },

    active() {
      if (this.active) {
        setTimeout(() => {
          this.reset()
          this.$refs.textField.focus()
        }, 100)
      }
    },

    taskTypes: {
      deep: true,
      immediate: true,
      handler(values) {
        const taskTypeOptions = values.map(taskType => {
          return {
            isTaskType: true,
            full_name: taskType.name,
            color: taskType.color,
            id: taskType.id,
            url: taskType.url
          }
        })
        taskTypeOptions.push({
          isTaskType: true,
          color: '#000',
          full_name: 'All'
        })
        this.membersForAts['#'] = taskTypeOptions
      }
    },

    team: {
      deep: true,
      immediate: true,
      handler() {
        let teamOptions = []
        if (this.isCurrentUserClient) {
          teamOptions = [
            this.team.filter(person =>
              ['admin', 'manager', 'supervisor', 'client'].includes(person.role)
            )
          ]
        } else {
          teamOptions = [...this.team]
        }
        teamOptions = teamOptions.concat(
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
        teamOptions.push({
          isTime: true,
          full_name: 'frame'
        })
        this.membersForAts['@'] = teamOptions
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

.comment-checklist {
  overflow-y: auto;
  max-height: 200px;
  margin-bottom: 2em;
}

.label.mt2 {
  margin-top: 2em;
}

.new-attachments {
  max-height: 200px;
  margin-bottom: 1em;
  overflow-y: auto;
  padding-right: 1em;
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
