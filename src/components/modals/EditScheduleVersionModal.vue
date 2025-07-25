<template>
  <base-modal active :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <combobox
        ref="versionCombobox"
        :label="$t('schedule.fields.create_from_version')"
        :options="fromVersionOptions"
        v-model="form.version"
        v-if="!isEditing"
      />
      <text-field
        ref="nameField"
        :label="$t('schedule.fields.name')"
        :error-text="$t('schedule.edit_version_exist')"
        :errored="errors.name"
        :maxlength="20"
        @enter="runConfirmation"
        @update:model-value="validateName"
        v-model.trim="form.name"
      />
      <combobox-boolean
        :label="$t('schedule.fields.locked')"
        v-model="form.locked"
        v-if="isEditing"
      />
    </form>
    <modal-footer
      :error-text="$t('schedule.edit_version_error')"
      :is-error="isError"
      :is-loading="isLoading"
      :is-disabled="!isValidForm"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { firstBy } from 'thenby'

import BaseModal from '@/components/modals/BaseModal.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

const props = defineProps({
  isError: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  scheduleVersionToEdit: {
    type: Object,
    required: true
  },
  version: {
    type: String,
    required: true
  },
  versionOptions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['cancel', 'confirm'])

const { t } = useI18n()

const form = reactive({
  id: null,
  name: '',
  locked: 'false',
  version: props.version || ''
})

const errors = reactive({
  name: false
})

const versionCombobox = ref(null)
const nameField = ref(null)

const isEditing = computed(() => Boolean(props.scheduleVersionToEdit?.id))

const isValidForm = computed(() => Boolean(form.name) && !errors.name)

const modalTitle = computed(() =>
  isEditing.value ? t('schedule.edit_version') : t('schedule.create_version')
)

const fromVersionOptions = computed(() => [
  {
    label: t('schedule.fields.new'),
    value: 'new',
    separator: true
  },
  {
    label: `${t('schedule.versions.from')} ${t('schedule.versions.reference')}`,
    value: 'ref',
    separator: true
  },
  ...props.versionOptions
    .filter(version => !version.canceled)
    .sort(firstBy('created_at'))
    .map(version => ({
      label: `${t('schedule.versions.from')} ${version.name}`,
      value: version.id
    }))
])

function validateName(name) {
  errors.name = false
  if (!name || props.scheduleVersionToEdit.name === name) {
    return
  }
  const nameAlreadyExist = props.versionOptions
    .map(version => version.name)
    .includes(name)

  if (nameAlreadyExist) {
    errors.name = true
  }
}

function runConfirmation() {
  if (!isValidForm.value) {
    return
  }
  const data = {
    id: props.scheduleVersionToEdit.id ?? null,
    name: form.name,
    locked: form.locked === 'true',
    version: form.version
  }
  emit('confirm', data)
}

onMounted(() => {
  form.id = props.scheduleVersionToEdit.id || null
  form.name = props.scheduleVersionToEdit.name || ''
  form.locked = props.scheduleVersionToEdit.locked ? 'true' : 'false'
  form.version = props.version || 'new'

  if (isEditing.value) {
    nameField.value?.focus()
  } else {
    versionCombobox.value?.focus()
  }
})
</script>
