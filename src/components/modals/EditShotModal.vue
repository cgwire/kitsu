<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <combobox
        :label="$t('shots.fields.sequence')"
        :options="sequenceOptions"
        v-model="form.sequence_id"
      />
      <text-field
        ref="nameField"
        :label="$t('shots.fields.name')"
        :maxlength="160"
        v-model.trim="form.name"
        @enter="runConfirmation"
        v-focus
      />
      <textarea-field
        :label="$t('shots.fields.description')"
        v-model="form.description"
        @keyup.ctrl.enter="runConfirmation"
        @keyup.meta.enter="runConfirmation"
      />
      <text-field
        :label="$t('shots.fields.nb_frames')"
        type="number"
        v-model="form.nb_frames"
        @enter="runConfirmation"
        v-if="!isPaperProduction"
      />
      <text-field
        :label="$t('shots.fields.frame_in')"
        v-model="form.frameIn"
        type="number"
      />
      <text-field
        :label="$t('shots.fields.frame_out')"
        v-model="form.frameOut"
        type="number"
        @enter="runConfirmation"
      />
      <text-field
        :label="$t('shots.fields.fps')"
        type="number"
        :max="1000"
        :step="0.001"
        :placeholder="currentProduction?.fps"
        v-model="form.fps"
        @enter="runConfirmation"
      />
      <text-field
        :label="$t('shots.fields.resolution')"
        :placeholder="currentProduction?.resolution"
        v-model.trim="form.resolution"
        @enter="runConfirmation"
      />
      <text-field
        type="number"
        :label="$t('shots.fields.max_retakes')"
        :placeholder="currentProduction?.max_retakes"
        v-model="form.max_retakes"
        @enter="runConfirmation"
      />

      <template v-if="shotToEdit">
        <metadata-field
          :key="descriptor.id"
          :descriptor="descriptor"
          :entity="shotToEdit"
          @enter="runConfirmation"
          v-model="form.data[descriptor.field_name]"
          v-for="descriptor in shotMetadataDescriptors"
        />
      </template>
    </form>

    <modal-footer
      :error-text="$t('shots.edit_fail')"
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

import { sanitizeInteger } from '@/composables/format'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import MetadataField from '@/components/widgets/MetadataField.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

const { t } = useI18n()
const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  shotToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm', 'confirm-and-stay'])

const form = ref({ data: {} })
const nameField = ref(null)

const currentProduction = computed(() => store.getters.currentProduction)
const isPaperProduction = computed(() => store.getters.isPaperProduction)
const openProductions = computed(() => store.getters.openProductions)
const sequenceOptions = computed(() => store.getters.sequenceOptions)
const sequences = computed(() => store.getters.sequences)
const shotMetadataDescriptors = computed(
  () => store.getters.shotMetadataDescriptors
)

const isEditing = computed(() => Boolean(props.shotToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? `${t('shots.edit_title')} ${props.shotToEdit.name}`
    : t('shots.new_shot')
)

const confirmClicked = () => {
  emit('confirm', form.value)
}

const confirmAndStayClicked = () => {
  emit('confirm-and-stay', form.value)
}

const runConfirmation = () => {
  if (isEditing.value) confirmClicked()
  else confirmAndStayClicked()
}

const resetForm = () => {
  if (isEditing.value) {
    const shotData = props.shotToEdit.data || {}
    form.value = {
      sequence_id: props.shotToEdit.sequence_id,
      project_id: props.shotToEdit.project_id,
      name: props.shotToEdit.name,
      description: props.shotToEdit.description,
      nb_frames: props.shotToEdit.nb_frames,
      frameIn: shotData.frame_in || '',
      frameOut: shotData.frame_out || '',
      fps: shotData.fps || '',
      max_retakes: parseInt(shotData.max_retakes) || '',
      resolution: shotData.resolution || '',
      data: { ...shotData }
    }
  } else {
    if (openProductions.value.length > 0) {
      form.value.project_id = currentProduction.value?.id || ''
    }
    if (sequences.value.length > 0) {
      form.value.sequence_id = sequences.value[0].id
    }
    form.value.name = ''
    form.value.description = ''
    form.value.nb_frames = 0
    form.value.data = {}
  }
}

const updateNbFramesFromRange = () => {
  const frameIn = sanitizeInteger(form.value.frameIn)
  const frameOut = sanitizeInteger(form.value.frameOut)
  if (frameIn && frameOut && frameOut > frameIn) {
    form.value.nb_frames = frameOut - frameIn + 1
  }
}

watch(
  () => props.active,
  active => {
    resetForm()
    if (sequences.value.length === 0) {
      store.dispatch('loadSequences')
    }
    if (active) {
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  }
)

watch(() => form.value.frameIn, updateNbFramesFromRange)
watch(() => form.value.frameOut, updateNbFramesFromRange)
watch(() => props.shotToEdit, resetForm)

onMounted(resetForm)
</script>
