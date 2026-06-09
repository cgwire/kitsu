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
            ref="inputLink"
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

<script setup>
import { XIcon } from 'lucide-vue-next'
import AtTa from 'vue-at/dist/vue-at-textarea'
import { computed, ref, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { useModal } from '@/composables/modal'
import files from '@/lib/files'
import { remove } from '@/lib/models'
import { replaceTimeWithTimecode } from '@/lib/render'

import ModalFooter from '@/components/modals/ModalFooter.vue'
import Checklist from '@/components/widgets/Checklist.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import FileUpload from '@/components/widgets/FileUpload.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
// eslint-disable-next-line no-unused-vars
import TextField from '@/components/widgets/TextField.vue'

const route = useRoute()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  commentToEdit: { type: Object, default: () => ({}) },
  fps: { type: Number, default: 25 },
  frame: { type: Number, default: 0 },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  revision: { type: Number, default: 1 },
  taskTypes: { type: Array, default: () => [] },
  team: { type: Array, default: () => [] }
})

const emit = defineEmits(['cancel', 'confirm'])

useModal(toRef(props, 'active'), emit)

const extensions = files.ALL_EXTENSIONS_STRING

const attachmentFiles = ref([])
const attachmentFilesToDelete = ref([])
const inputLink = ref(null)
const membersForAts = ref({ '@': [], '#': [] })
const textField = ref(null)
const form = ref({
  text: '',
  task_status_id: null,
  checklist: [{ checked: false, text: '' }],
  link: null
})

const departmentMap = computed(() => store.getters.departmentMap)
const getTaskStatusForCurrentUser = computed(
  () => store.getters.getTaskStatusForCurrentUser
)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const productionDepartmentIds = computed(
  () => store.getters.productionDepartmentIds
)
const taskStatusForCurrentUser = computed(
  () => store.getters.taskStatusForCurrentUser
)

const isConceptTask = computed(() => route.path.includes('concept'))

const taskStatuses = computed(() =>
  isConceptTask.value
    ? getTaskStatusForCurrentUser.value(null, true)
    : taskStatusForCurrentUser.value.filter(status => !status.for_concept)
)

const isPreviewsComment = computed(
  () => props.commentToEdit?.previews?.length > 0
)

const isValidForm = computed(() =>
  Boolean(
    !isPreviewsComment.value ||
    !form.value.link ||
    inputLink.value?.checkValidity()
  )
)

const runConfirmation = event => {
  if (!event || event.keyCode === 13 || !event.keyCode) {
    emit('confirm', {
      id: props.commentToEdit.id,
      text: form.value.text,
      task_status_id: form.value.task_status_id,
      checklist: form.value.checklist.filter(item => item.text),
      newAttachmentFiles: attachmentFiles.value,
      attachmentFilesToDelete: attachmentFilesToDelete.value,
      links: form.value.link ? [form.value.link] : null
    })
  }
}

const removeTask = entry => {
  form.value.checklist = [...remove(form.value.checklist, entry)]
}

const removeAttachment = attachment => {
  form.value.attachment_files = remove(form.value.attachment_files, attachment)
  attachmentFilesToDelete.value.push(attachment)
}

const removeNewAttachment = attachment => {
  attachmentFiles.value = remove(attachmentFiles.value, attachment)
}

const onFileSelected = files => {
  attachmentFiles.value = files
}

const reset = () => {
  attachmentFiles.value = []
  attachmentFilesToDelete.value = []
  if (props.commentToEdit?.id) {
    form.value = {
      text: props.commentToEdit.text,
      task_status_id: props.commentToEdit.task_status_id,
      checklist: [...props.commentToEdit.checklist],
      attachment_files: [...props.commentToEdit.attachment_files],
      link: props.commentToEdit.links?.[0]
    }
    if (form.value.checklist.length === 0) {
      form.value.checklist = [{ checked: false, text: '' }]
    }
  } else {
    form.value = {
      text: '',
      task_status_id: null,
      checklist: [{ checked: false, text: '' }],
      attachment_files: [],
      link: null
    }
  }
}

const onAddChecklistItem = item => {
  delete item.index
  form.value.checklist.push(item)
}

const onInsertChecklistItem = item => {
  form.value.checklist.splice(item.index, 0, item)
  form.value.checklist.forEach((entry, i) => {
    entry.index = i
  })
}

const atOptionsFilter = (name, chunk, at, v) => {
  // filter the list by the given at symbol (@ for team, # for task type)
  const expectedAt = v?.isTaskType ? '#' : '@'
  if (at !== expectedAt) return false
  return name?.toLowerCase().indexOf(chunk.toLowerCase()) > -1
}

const onAtTextChanged = input => {
  if (input.includes('@frame')) {
    form.value.text = replaceTimeWithTimecode(
      input,
      props.revision,
      props.frame + 1,
      props.fps
    )
  }
}

watch(() => props.commentToEdit, reset)

watch(
  () => props.active,
  active => {
    if (active) {
      setTimeout(() => {
        reset()
        textField.value?.focus()
      }, 100)
    }
  }
)

watch(
  () => props.taskTypes,
  values => {
    const taskTypeOptions = values.map(taskType => ({
      isTaskType: true,
      full_name: taskType.name,
      color: taskType.color,
      id: taskType.id,
      url: taskType.url
    }))
    taskTypeOptions.push({
      isTaskType: true,
      color: '#000',
      full_name: 'All'
    })
    membersForAts.value['#'] = taskTypeOptions
  },
  { immediate: true }
)

watch(
  () => props.team,
  () => {
    let teamOptions
    if (isCurrentUserClient.value) {
      teamOptions = [
        props.team.filter(person =>
          ['admin', 'manager', 'supervisor', 'client'].includes(person.role)
        )
      ]
    } else {
      teamOptions = [...props.team]
    }
    teamOptions = teamOptions.concat(
      productionDepartmentIds.value.map(departmentId => {
        const department = departmentMap.value.get(departmentId)
        return {
          isDepartment: true,
          full_name: department.name,
          color: department.color,
          id: departmentId
        }
      })
    )
    teamOptions.push({ isTime: true, full_name: 'frame' })
    membersForAts.value['@'] = teamOptions
  },
  { immediate: true }
)
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
