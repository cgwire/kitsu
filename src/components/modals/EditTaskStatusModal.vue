<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        ref="nameField"
        input-class="task-status-name"
        :label="$t('task_status.fields.name')"
        @enter="confirmClicked"
        v-model.trim="form.name"
        v-focus
        v-if="taskStatusToEdit?.short_name !== 'todo'"
      />
      <text-field
        ref="shortNameField"
        input-class="task-status-short-name"
        :label="$t('task_status.fields.short_name')"
        :maxlength="8"
        @enter="confirmClicked"
        v-model.trim="form.short_name"
        v-if="taskStatusToEdit?.short_name !== 'todo'"
      />
      <textarea-field
        input-class="task-status-description"
        :label="$t('task_status.fields.description')"
        @enter="confirmClicked"
        v-model="form.description"
      />
      <boolean-field
        class="mr05 mb05"
        :label="$t('task_status.fields.is_default')"
        @enter="confirmClicked"
        v-model="form.is_default"
        :disabled="form.for_concept === 'true'"
      />
      <boolean-field
        class="mr05 mb05"
        :label="$t('task_status.fields.is_wip')"
        @enter="confirmClicked"
        v-model="form.is_wip"
        v-if="form.is_default === 'false'"
      />
      <boolean-field
        class="mr05 mb05"
        :label="$t('task_status.fields.is_done')"
        @enter="confirmClicked"
        v-model="form.is_done"
        v-if="form.is_default === 'false'"
      />
      <boolean-field
        class="mr05 mb05"
        :label="$t('task_status.fields.is_retake')"
        @enter="confirmClicked"
        v-model="form.is_retake"
        v-if="form.is_default === 'false'"
      />
      <boolean-field
        class="mr05 mb05"
        :label="$t('task_status.fields.is_artist_allowed')"
        @enter="confirmClicked"
        v-model="form.is_artist_allowed"
      />
      <boolean-field
        class="mr05 mb05"
        :label="$t('task_status.fields.is_client_allowed')"
        @enter="confirmClicked"
        v-model="form.is_client_allowed"
        v-if="form.for_concept !== 'true'"
      />
      <boolean-field
        class="mr05 mb05"
        :label="$t('task_status.fields.is_feedback_request')"
        @enter="confirmClicked"
        v-model="form.is_feedback_request"
        v-if="form.is_default === 'false'"
      />
      <color-field
        class="mt2"
        :colors="colors"
        :column="5"
        :label="$t('task_status.fields.color')"
        v-model="form.color"
        v-if="taskStatusToEdit?.short_name !== 'todo'"
      />
      <combobox-boolean
        :label="$t('main.archived')"
        @enter="confirmClicked"
        v-model="form.archived"
        v-if="isEditing"
      />
    </form>

    <modal-footer
      :error-text="$t('task_status.create_error')"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="confirmClicked"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
import ColorField from '@/components/widgets/ColorField.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

const { t } = useI18n()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  taskStatusToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({
  name: '',
  short_name: '',
  description: '',
  color: '#999999',
  is_default: 'false',
  is_wip: 'false',
  is_done: 'false',
  is_retake: 'false',
  is_feedback_request: 'false',
  archived: 'false'
})
const nameField = ref(null)
const shortNameField = ref(null)

const colors = [
  '#999999',
  '#CCCCCC',
  '#F5F5F5',
  '#CC9999',
  '#FF3860',
  '#E81123',
  '#E74C3C',
  '#FF5722',
  '#FF7043',
  '#FFA000',
  '#FBC02D',
  '#AFB42B',
  '#8BC34A',
  '#66BB6A',
  '#22D160',
  '#4DB6AC',
  '#03A9F4',
  '#3273DC',
  '#3498DB',
  '#2980B9',
  '#607D8B',
  '#8764B8',
  '#AB26FF',
  '#E040FB',
  '#FF80AB'
]

// Computed

const isEditing = computed(() => Boolean(props.taskStatusToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? `${t('task_status.edit_title')} ${props.taskStatusToEdit.name}`
    : t('task_status.new_task_status')
)

// Functions

const confirmClicked = () => {
  if (!form.value.name?.length && nameField.value) {
    nameField.value.focus()
    return
  }
  if (!form.value.short_name?.length && shortNameField.value) {
    shortNameField.value.focus()
    return
  }
  emit('confirm', form.value)
}

const resetForm = () => {
  if (!props.taskStatusToEdit) return
  const ts = props.taskStatusToEdit
  form.value = {
    name: ts.name,
    short_name: ts.short_name,
    description: ts.description,
    color: ts.color,
    is_default: String(ts.is_default || false),
    is_wip: String(ts.is_wip || false),
    is_done: String(ts.is_done || false),
    is_retake: String(ts.is_retake || false),
    is_artist_allowed: String(ts.is_artist_allowed),
    is_client_allowed: String(ts.is_client_allowed),
    is_feedback_request: String(ts.is_feedback_request || false),
    for_concept: String(ts.for_concept || false),
    archived: String(ts.archived || false)
  }
}

// Watchers

watch(() => props.taskStatusToEdit, resetForm)

watch(
  () => props.active,
  active => {
    if (active) {
      resetForm()
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  }
)
</script>
