<template>
  <base-modal :active="active" :title="title" @cancel="$emit('cancel')">
    <p>
      {{ $t('main.csv.select_file') }}
    </p>

    <file-upload
      ref="uploadAvatarField"
      :label="$t('main.csv.upload_file')"
      @fileselected="onFileSelected"
      accept=".png,.jpg,.jpeg"
    />

    <p class="error" v-if="isError">
      {{ $t('profile.avatar.error_upload') }}
    </p>

    <modal-footer
      :error-text="$t('productions.metadata.error')"
      :is-loading="isLoading"
      :is-disabled="!formData"
      @confirm="onConfirmClicked"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { ref, watch } from 'vue'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
// eslint-disable-next-line no-unused-vars
import FileUpload from '@/components/widgets/FileUpload.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  title: { type: String, default: '' }
})

const emit = defineEmits(['cancel', 'confirm', 'fileselected'])

const formData = ref(null)
const uploadAvatarField = ref(null)

const onFileSelected = data => {
  formData.value = data
  emit('fileselected', data)
}

const onConfirmClicked = () => {
  emit('confirm', formData.value)
}

watch(
  () => props.active,
  () => {
    formData.value = null
    uploadAvatarField.value?.reset()
  }
)
</script>

<style lang="scss" scoped>
.error {
  margin-top: 1em;
}
</style>
