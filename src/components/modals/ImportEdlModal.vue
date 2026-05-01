<template>
  <base-modal
    :active="active"
    :title="$t('main.edl.import_title')"
    @cancel="$emit('cancel')"
  >
    <p>
      {{ $t('main.edl.explanation') }}
    </p>

    <p>
      {{ $t('main.edl.select_file') }}
    </p>
    <file-upload
      ref="inputFile"
      @fileselected="onFileSelected"
      :label="$t('main.edl.upload_file')"
      accept=".edl, .xml, .otio, .fcpxml"
    />

    <br />
    <text-field
      :label="$t('main.edl.naming_convention')"
      v-model="form.namingConvention"
      @enter="onConfirmClicked"
      v-focus
    />

    <checkbox
      :toggle="true"
      :label="$t('main.edl.match_case')"
      v-model="form.matchCase"
    />

    <modal-footer
      :confirm-label="$t('main.edl.upload_edl')"
      :error-text="errorText"
      :is-loading="isLoading"
      :is-disabled="formData === null"
      :is-error="isError"
      @confirm="onConfirmClicked"
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
import Checkbox from '@/components/widgets/Checkbox.vue'
// eslint-disable-next-line no-unused-vars
import FileUpload from '@/components/widgets/FileUpload.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  importError: { type: Error, default: null },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({
  namingConvention: '${project_name}_${sequence_name}-${shot_name}',
  matchCase: true
})
const formData = ref(null)
const inputFile = ref(null)

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
const isTVShow = computed(() => store.getters.isTVShow)

const errorText = computed(() => {
  let text = t('main.edl.error_upload')
  if (props.importError?.status === 400) {
    text += ` ${props.importError.response.body.message}`
  }
  return text
})

// Functions

const onFileSelected = data => {
  formData.value = data
}

const onConfirmClicked = () => {
  emit(
    'confirm',
    formData.value.get('file'),
    form.value.namingConvention,
    form.value.matchCase
  )
}

const updateNamingConvention = () => {
  form.value.namingConvention = isTVShow.value
    ? '${project_name}_${episode_name}-${sequence_name}-${shot_name}'
    : '${project_name}_${sequence_name}-${shot_name}'
}

// Watchers

watch(currentProduction, updateNamingConvention)

watch(
  () => props.active,
  () => {
    formData.value = null
    inputFile.value?.reset()
  }
)

// Lifecycle

onMounted(() => {
  formData.value = null
  if (isTVShow.value) updateNamingConvention()
})
</script>
