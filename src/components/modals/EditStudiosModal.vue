<template>
  <base-modal
    :active="active"
    :title="
      isEditing
        ? `${$t('studios.edit_title')} ${studioToEdit.name}`
        : $t('studios.new_studios')
    "
    @cancel="$emit('cancel')"
  >
    <form @submit.prevent>
      <text-field
        ref="nameField"
        :label="$t('studios.fields.name')"
        :maxlength="30"
        v-model="form.name"
        v-focus
      />
      <color-field :label="$t('studios.fields.color')" v-model="form.color" />
      <combobox-boolean
        :label="$t('main.archived')"
        @enter="runConfirmation"
        v-model="form.archived"
        v-if="isEditing"
      />
    </form>
    <modal-footer
      :error-text="$t('studios.create_error')"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

import BaseModal from '@/components/modals/BaseModal.vue'
import ColorField from '@/components/widgets/ColorField.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

const props = defineProps({
  active: {
    type: Boolean,
    default: false
  },
  isError: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  studioToEdit: {
    type: Object,
    default: () => {}
  }
})

const emit = defineEmits(['cancel', 'confirm'])

const nameField = ref(null)

const defaultForm = () => ({
  id: null,
  name: '',
  color: '',
  archived: 'false'
})

const form = ref(defaultForm())

const isEditing = computed(() => props.studioToEdit?.id)

const runConfirmation = () => {
  emit('confirm', form.value)
}

watch(
  () => props.active,
  active => {
    if (active) {
      nextTick(() => {
        nameField.value?.focus()
      })
    }
  }
)

watch(
  () => props.studioToEdit,
  () => {
    if (isEditing.value) {
      form.value = {
        id: props.studioToEdit.id,
        name: props.studioToEdit.name,
        color: props.studioToEdit.color,
        archived: String(props.studioToEdit.archived === true)
      }
    } else {
      form.value = defaultForm()
    }
  }
)
</script>

<style lang="scss" scoped>
.is-danger {
  color: $red;
  font-style: italic;
}
</style>
