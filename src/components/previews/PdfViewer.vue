<template>
  <div
    class="pdf-viewer"
    :style="{
      height: defaultHeight ? `${defaultHeight}px` : '100%'
    }"
  >
    <div class="pdf-wrapper" v-show="!isLoading">
      <iframe
        class="pdf-frame"
        :src="pdfUrl"
        frameborder="0"
        @load="onPdfLoad"
        @error="onPdfError"
      ></iframe>
    </div>
    <div class="overlay" v-if="isLoading">
      <spinner is-white class="spinner" />
    </div>
    <div class="overlay" v-else-if="hasError">
      {{ t('preview.broken') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  preview: {
    type: Object,
    required: true
  },
  defaultHeight: {
    type: Number,
    default: 600
  }
})

const emit = defineEmits(['pdf-loaded', 'pdf-error'])

const { t } = useI18n()

const isLoading = ref(true)
const hasError = ref(false)

const pdfUrl = computed(() =>
  props.preview?.id
    ? `/api/pictures/originals/preview-files/${props.preview.id}.pdf#view=Fit`
    : ''
)

const onPdfLoad = () => {
  isLoading.value = false
  hasError.value = false
  emit('pdf-loaded')
}

const onPdfError = () => {
  isLoading.value = false
  hasError.value = true
  emit('pdf-error')
}

watch(
  () => props.preview?.id,
  () => {
    isLoading.value = true
    hasError.value = false
  }
)
</script>

<style lang="scss" scoped>
.pdf-viewer {
  position: relative;
  display: flex;
  overflow: hidden;
  width: 100%;
}

.pdf-wrapper {
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
  width: 100%;
}

.pdf-frame {
  border: none;
  height: 100%;
  width: 100%;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: $white;
}
</style>
