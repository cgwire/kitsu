<template>
  <base-modal :active="active" :title="title" @cancel="$emit('cancel')">
    <p class="explanation">{{ $t('profile.avatar.intro') }}</p>

    <image-cropper
      ref="cropperRef"
      :shape="shape"
      @fileselected="onFileSelected"
    />

    <p class="error" v-if="isError">
      {{ $t('profile.avatar.error_upload') }}
    </p>

    <modal-footer
      :error-text="$t('productions.metadata.error')"
      :is-loading="isLoading"
      :is-disabled="!hasFile"
      @confirm="onConfirmClicked"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { ref, toRef, watch } from 'vue'

import { useModal } from '@/composables/modal'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ImageCropper from '@/components/widgets/ImageCropper.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  shape: {
    type: String,
    default: 'circle',
    validator: value => ['circle', 'rounded'].includes(value)
  },
  title: { type: String, default: '' }
})

const emit = defineEmits(['cancel', 'confirm', 'fileselected'])

useModal(toRef(props, 'active'), emit)

const cropperRef = ref(null)
const hasFile = ref(false)
const lastFormData = ref(null)

const onFileSelected = formData => {
  hasFile.value = true
  lastFormData.value = formData
  emit('fileselected', formData)
}

const onConfirmClicked = async () => {
  try {
    const cropped = await cropperRef.value?.cropToFormData()
    emit('confirm', cropped ?? lastFormData.value)
  } catch (err) {
    console.error(err)
    emit('confirm', lastFormData.value)
  }
}

watch(
  () => props.active,
  () => {
    cropperRef.value?.reset()
    hasFile.value = false
    lastFormData.value = null
  }
)
</script>

<style lang="scss" scoped>
.explanation {
  color: var(--text-alt);
  margin-bottom: 1.25rem;
  text-align: center;
}

.error {
  color: $red;
  margin-top: 1rem;
  text-align: center;
}
</style>
