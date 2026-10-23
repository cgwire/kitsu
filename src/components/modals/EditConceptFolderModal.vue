<template>
  <base-modal
    :active="active"
    :title="
      folderToEdit ? $t('concepts.folders.rename') : $t('concepts.folders.new')
    "
    @cancel="$emit('cancel')"
  >
    <form @submit.prevent>
      <text-field
        ref="name-field"
        :label="$t('concepts.folders.name')"
        :maxlength="160"
        v-model.trim="name"
        @enter="confirm"
      />
    </form>
    <modal-footer
      :error-text="$t('concepts.folders.edit_error')"
      :is-disabled="!name"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="confirm"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { nextTick, ref, useTemplateRef, watch } from 'vue'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  active: { type: Boolean, default: false },
  folderToEdit: { type: Object, default: null },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

// State
// --------------------------------------------------------------------------
const nameFieldRef = useTemplateRef('name-field')

const name = ref('')

// Functions
// --------------------------------------------------------------------------
const confirm = () => {
  if (name.value) emit('confirm', name.value)
}

// Watchers
// --------------------------------------------------------------------------
watch(
  () => props.active,
  async () => {
    if (props.active) {
      name.value = props.folderToEdit?.name ?? ''
      await nextTick()
      nameFieldRef.value?.focus()
    }
  }
)
</script>
