<template>
  <div
    class="modal"
    :class="{
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('productions.edit_title') }} {{ productionToEdit.name }}
        </h1>

        <form @submit.prevent>
          <text-field
            :label="$t('productions.fields.name')"
            @enter="runConfirmation"
            v-model="form.name"
            v-focus
          />
          <text-field
            :label="$t('productions.fields.code')"
            @enter="runConfirmation"
            v-model="form.code"
          />
          <combobox-styled
            class="field"
            :label="$t('productions.fields.status')"
            locale-key-prefix="productions.status."
            :options="productionStatusOptions"
            v-model="form.project_status_id"
          />
          <combobox-styled
            class="field"
            :label="$t('productions.fields.type')"
            locale-key-prefix="productions.type."
            :options="productionTypeOptions"
            v-model="form.production_type"
          />
          <combobox-styled
            class="field"
            :label="$t('productions.fields.style')"
            locale-key-prefix="productions.style."
            :options="productionStyleOptions"
            v-model="form.production_style"
          />
          <text-field
            :label="$t('productions.fields.fps')"
            type="number"
            :max="60"
            :step="0.001"
            @enter="runConfirmation"
            v-model="form.fps"
          />
          <text-field
            :label="$t('productions.fields.ratio')"
            @enter="runConfirmation"
            v-model="form.ratio"
          />
          <text-field
            :label="$t('productions.fields.resolution')"
            @enter="runConfirmation"
            v-model="form.resolution"
          />
          <div class="picture-field">
            <label class="label">{{ $t('productions.picture') }}</label>
            <image-cropper
              ref="cropperRef"
              shape="rounded"
              @fileselected="onFileSelected"
            />
          </div>
        </form>

        <modal-footer
          :error-text="$t('productions.edit_error')"
          :is-error="isError"
          :is-loading="isLoading"
          @confirm="runConfirmation"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, toRef, watch } from 'vue'
import { useStore } from 'vuex'

import { useModal } from '@/composables/modal'
import {
  PRODUCTION_STYLE_OPTIONS,
  PRODUCTION_TYPE_OPTIONS
} from '@/lib/productions'

import ModalFooter from '@/components/modals/ModalFooter.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ImageCropper from '@/components/widgets/ImageCropper.vue'
import TextField from '@/components/widgets/TextField.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  productionToEdit: { type: Object, required: true }
})

const emit = defineEmits(['cancel', 'confirm', 'fileselected'])

const store = useStore()

useModal(toRef(props, 'active'), emit)

// State

const productionStyleOptions = PRODUCTION_STYLE_OPTIONS
const productionTypeOptions = PRODUCTION_TYPE_OPTIONS

const form = ref({})
const cropperRef = ref(null)

// Computed

const productionStatusOptions = computed(
  () => store.getters.productionStatusOptions
)

// Functions

const resetForm = () => {
  form.value = {
    name: props.productionToEdit.name,
    code: props.productionToEdit.code,
    project_status_id: props.productionToEdit.project_status_id,
    production_type: props.productionToEdit.production_type || 'short',
    production_style: props.productionToEdit.production_style || '2d3d',
    fps: props.productionToEdit.fps,
    ratio: props.productionToEdit.ratio,
    resolution: props.productionToEdit.resolution
  }
}

const runConfirmation = async () => {
  // If the cropper holds an image, crop it now so the parent uploads
  // the framed version rather than the original file. The cropper also
  // emits `fileselected` immediately when a file is picked, so the
  // parent already has a fallback payload if cropping fails.
  if (cropperRef.value?.hasFile) {
    try {
      const cropped = await cropperRef.value.cropToFormData()
      if (cropped) emit('fileselected', cropped)
    } catch (err) {
      console.error(err)
    }
  }
  emit('confirm', form.value)
}

const onFileSelected = formData => {
  emit('fileselected', formData)
}

// Watchers

watch(() => props.productionToEdit, resetForm, { immediate: true })
</script>

<style lang="scss" scoped>
.box {
  padding-bottom: 1.5em;
}

.picture-field {
  margin-top: 1.5em;
}
</style>
