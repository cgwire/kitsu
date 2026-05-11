<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        ref="nameField"
        :label="$t('departments.fields.name')"
        :maxlength="30"
        v-model="form.name"
        v-focus
      />
      <color-field
        :label="$t('departments.fields.color')"
        v-model="form.color"
      />
      <combobox-boolean
        :label="$t('main.archived')"
        @enter="runConfirmation"
        v-model="form.archived"
        v-if="isEditing"
      />
    </form>
    <modal-footer
      :error-text="$t('departments.create_error')"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ColorField from '@/components/widgets/ColorField.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  departmentToEdit: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({ id: null, name: '', color: '', archived: 'false' })
const nameField = ref(null)

// Computed

const isEditing = computed(() => Boolean(props.departmentToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? `${t('departments.edit_title')} ${props.departmentToEdit.name}`
    : t('departments.new_departments')
)

// Functions

const runConfirmation = () => {
  emit('confirm', form.value)
}

// Watchers

watch(
  () => props.active,
  active => {
    if (active) {
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  }
)

watch(
  () => props.departmentToEdit,
  department => {
    if (department?.id) {
      form.value = {
        id: department.id,
        name: department.name,
        color: department.color,
        archived: String(department.archived === true)
      }
    } else {
      form.value = { id: null, name: '', color: '', archived: 'false' }
    }
  }
)
</script>
