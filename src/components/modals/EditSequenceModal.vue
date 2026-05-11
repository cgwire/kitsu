<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        :label="$t('sequences.fields.name')"
        :maxlength="160"
        v-model.trim="form.name"
        @enter="runConfirmation"
        v-focus
      />
      <textarea-field
        :label="$t('sequences.fields.description')"
        @keyup.ctrl.enter="runConfirmation"
        @keyup.meta.enter="runConfirmation"
        v-model="form.description"
      />
      <text-field
        :label="$t('shots.fields.resolution')"
        :placeholder="currentProduction?.resolution"
        v-model.trim="form.data.resolution"
        @enter="runConfirmation"
      />
      <template v-if="sequenceToEdit">
        <metadata-field
          :key="descriptor.id"
          :descriptor="descriptor"
          :entity="sequenceToEdit"
          @enter="runConfirmation"
          v-model="form.data[descriptor.field_name]"
          v-for="descriptor in sequenceMetadataDescriptors"
        />
      </template>
    </form>

    <modal-footer
      :error-text="$t('sequences.edit_error')"
      :is-loading="isLoading"
      :is-error="isError"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import MetadataField from '@/components/widgets/MetadataField.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  sequenceToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({
  id: '',
  name: '',
  description: '',
  data: { resolution: '' }
})

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
const sequenceMetadataDescriptors = computed(
  () => store.getters.sequenceMetadataDescriptors
)

const isEditing = computed(() => Boolean(props.sequenceToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? `${t('sequences.edit_title')} ${props.sequenceToEdit.name}`
    : t('sequences.new_sequence')
)

// Functions

const runConfirmation = () => {
  emit('confirm', form.value)
}

const resetForm = () => {
  if (isEditing.value) {
    form.value = {
      id: props.sequenceToEdit.id,
      name: props.sequenceToEdit.name,
      description: props.sequenceToEdit.description,
      data: {
        ...props.sequenceToEdit.data,
        resolution: props.sequenceToEdit.data.resolution || ''
      }
    }
  } else {
    form.value.id = null
    form.value.name = ''
    form.value.description = ''
    form.value.data = { resolution: '' }
  }
}

// Watchers

watch(() => props.active, resetForm)

watch(() => props.sequenceToEdit, resetForm)

// Lifecycle

onMounted(() => {
  if (props.active) resetForm()
})
</script>
