<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <combobox
        :label="$t('edits.fields.episode')"
        :options="episodeOptions"
        v-model="form.parent_id"
        v-if="isTVShow"
      />
      <text-field
        ref="nameField"
        :label="$t('edits.fields.name')"
        :maxlength="160"
        v-model.trim="form.name"
        @enter="runConfirmation"
        v-focus
      />
      <textarea-field
        :label="$t('edits.fields.description')"
        v-model="form.description"
        @keyup.ctrl.enter="runConfirmation"
        @keyup.meta.enter="runConfirmation"
      />
      <text-field
        :label="$t('shots.fields.resolution')"
        :placeholder="currentProduction?.resolution"
        @enter="runConfirmation"
        v-model.trim="form.data.resolution"
      />
      <template v-if="editToEdit">
        <metadata-field
          :key="descriptor.id"
          :descriptor="descriptor"
          :entity="editToEdit"
          @enter="runConfirmation"
          v-model="form.data[descriptor.field_name]"
          v-for="descriptor in editMetadataDescriptors"
        />
      </template>
    </form>

    <modal-footer
      :error-text="$t('edits.edit_error')"
      :is-loading="isLoading"
      :is-error="isError"
      @confirm="confirmClicked"
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
import Combobox from '@/components/widgets/Combobox.vue'
import MetadataField from '@/components/widgets/MetadataField.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  editToEdit: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm', 'confirm-and-stay'])

// State

const form = ref({
  name: '',
  description: '',
  parent_id: null,
  data: { resolution: '' }
})
const nameField = ref(null)

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
const currentEpisode = computed(() => store.getters.currentEpisode)
const editMetadataDescriptors = computed(
  () => store.getters.editMetadataDescriptors
)
const episodes = computed(() => store.getters.episodes)
const isTVShow = computed(() => store.getters.isTVShow)
const openProductions = computed(() => store.getters.openProductions)

const isEditing = computed(() => Boolean(props.editToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? `${t('edits.edit_title')} ${props.editToEdit.name}`
    : t('edits.new_edit')
)

const episodeOptions = computed(() => {
  const options = episodes.value.map(episode => ({
    label: episode.name,
    value: episode.id
  }))
  // It might be useful to allow Edits not linked to any episodes.
  return [{ label: '-', value: null }, ...options]
})

// Functions

const confirmClicked = () => {
  emit('confirm', form.value)
}

const confirmAndStayClicked = () => {
  emit('confirm-and-stay', form.value)
}

const runConfirmation = () => {
  if (isEditing.value) {
    confirmClicked()
  } else {
    confirmAndStayClicked()
  }
}

const resetForm = () => {
  if (isEditing.value) {
    form.value = {
      project_id: props.editToEdit.project_id,
      name: props.editToEdit.name,
      description: props.editToEdit.description,
      parent_id: props.editToEdit.parent_id,
      data: {
        ...props.editToEdit.data,
        resolution: props.editToEdit.data.resolution || ''
      }
    }
  } else {
    if (openProductions.value.length > 0) {
      form.value.project_id = currentProduction.value?.id || ''
    }
    form.value.name = ''
    form.value.description = ''
    form.value.parent_id = currentEpisode.value?.id || null
    form.value.data = { resolution: '' }
  }
}

// Watchers

watch(
  () => props.active,
  active => {
    resetForm()
    if (active) {
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  }
)

watch(() => props.editToEdit, resetForm)

// Lifecycle

onMounted(resetForm)
</script>
