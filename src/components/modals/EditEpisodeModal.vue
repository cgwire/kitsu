<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        :label="$t('episodes.fields.name')"
        :maxlength="160"
        v-model.trim="form.name"
        @enter="runConfirmation"
        v-focus
      />

      <combobox-styled
        class="field"
        :label="$t('main.status')"
        :options="episodeStatusOptions"
        v-model="form.status"
      />

      <textarea-field
        :label="$t('episodes.fields.description')"
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

      <template v-if="episodeToEdit">
        <metadata-field
          :key="descriptor.id"
          :descriptor="descriptor"
          :entity="episodeToEdit"
          @enter="runConfirmation"
          v-model="form.data[descriptor.field_name]"
          v-for="descriptor in episodeMetadataDescriptors"
        />
      </template>
    </form>

    <modal-footer
      :error-text="$t('episodes.edit_error')"
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
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import MetadataField from '@/components/widgets/MetadataField.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  episodeToEdit: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({
  id: '',
  name: '',
  description: '',
  fps: '',
  data: { resolution: '' }
})

const episodeStatusOptions = [
  { label: 'canceled', value: 'canceled' },
  { label: 'complete', value: 'complete' },
  { label: 'running', value: 'running' },
  { label: 'standby', value: 'standby' }
]

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
const episodeMetadataDescriptors = computed(
  () => store.getters.episodeMetadataDescriptors
)

const isEditing = computed(() => Boolean(props.episodeToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? `${t('episodes.edit_title')} ${props.episodeToEdit.name}`
    : t('episodes.new_episode')
)

// Functions

const runConfirmation = () => {
  emit('confirm', form.value)
}

const resetForm = () => {
  if (isEditing.value) {
    form.value = {
      id: props.episodeToEdit.id,
      name: props.episodeToEdit.name,
      status: props.episodeToEdit.status,
      description: props.episodeToEdit.description,
      data: {
        ...props.episodeToEdit.data,
        resolution: props.episodeToEdit.data.resolution || ''
      }
    }
  } else {
    form.value.id = null
    form.value.name = ''
    form.value.status = 'running'
    form.value.description = ''
    form.value.data = {}
  }
}

// Watchers

watch(
  () => props.active,
  active => {
    if (active) resetForm()
  }
)

watch(() => props.episodeToEdit, resetForm)

// Lifecycle

onMounted(resetForm)
</script>
