<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <div class="field" v-if="!isEditing">
        <label class="label">{{ $t('backgrounds.fields.file') }}</label>
        <file-upload
          ref="fileUpload"
          :label="$t('main.select_file')"
          accept=".hdr"
          :is-primary="false"
          @fileselected="onFileSelected"
        />
      </div>
      <text-field
        ref="nameField"
        input-class="task-status-name"
        :label="$t('backgrounds.fields.name')"
        :maxlength="40"
        @enter="confirmClicked"
        v-model.trim="form.name"
      />
      <boolean-field
        is-field
        :label="$t('backgrounds.fields.is_default')"
        @enter="confirmClicked"
        v-model="form.is_default"
      />
      <combobox-boolean
        :label="$t('main.archived')"
        @enter="confirmClicked"
        v-model="form.archived"
        v-if="isEditing"
      />
    </form>

    <modal-footer
      :error-text="$t('backgrounds.create_error')"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="confirmClicked"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
// eslint-disable-next-line no-unused-vars
import FileUpload from '@/components/widgets/FileUpload.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  backgroundToEdit: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({
  file: null,
  name: '',
  is_default: 'false',
  archived: 'false'
})
const nameField = ref(null)
const fileUpload = ref(null)

// Computed

const isEditing = computed(() => Boolean(props.backgroundToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? `${t('backgrounds.edit_background')} ${props.backgroundToEdit.name}`
    : t('backgrounds.new_background')
)

// Functions

const confirmClicked = () => {
  if (!isEditing.value && !form.value.file) return
  if (!form.value.name) {
    nameField.value?.focus()
    return
  }
  emit('confirm', {
    ...form.value,
    is_default: form.value.is_default === 'true',
    archived: form.value.archived === 'true'
  })
}

const onFileSelected = formData => {
  const file = formData.get('file')
  form.value.file = formData
  if (!form.value.name.length) {
    form.value.name = file.name.slice(0, -4)
  }
  nextTick(() => {
    nameField.value?.focus()
  })
}

const resetForm = () => {
  if (!props.backgroundToEdit) return
  form.value = {
    file: null,
    name: props.backgroundToEdit.name || '',
    is_default: String(props.backgroundToEdit.is_default || false),
    archived: String(props.backgroundToEdit.archived || false)
  }
  fileUpload.value?.reset()
}

// Watchers

watch(() => props.backgroundToEdit, resetForm)

watch(
  () => props.active,
  active => {
    if (active) resetForm()
  }
)
</script>
