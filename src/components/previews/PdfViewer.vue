<template>
  <div
    ref="container"
    class="pdf-viewer"
    :style="{
      height: defaultHeight ? defaultHeight + 'px' : '100%'
    }"
  >
    <div class="loading-background" v-if="isLoading">
      <spinner class="spinner" />
    </div>
    <div class="pdf-wrapper" v-show="!isLoading">
      <iframe
        ref="pdf-frame"
        class="pdf-frame"
        :src="pdfUrl"
        frameborder="0"
        @load="onPdfLoad"
        @error="onPdfError"
      ></iframe>
    </div>
    <div class="error-message" v-if="hasError">
      <p>{{ t('preview.broken') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  preview: {
    type: Object,
    default: () => {}
  },
  defaultHeight: {
    type: Number,
    default: 600
  },
  isRoundedTopBorder: {
    type: Boolean,
    default: false
  },
  fullScreen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['pdf-loaded', 'pdf-error'])

const { t } = useI18n()

const isLoading = ref(true)
const hasError = ref(false)

const pdfUrl = computed(() => {
  if (props.preview && props.preview.id) {
    return `/api/pictures/originals/preview-files/${props.preview.id}.pdf`
  }
  return ''
})

onMounted(() => {
  if (pdfUrl.value) {
    loadPdf()
  }
})

const loadPdf = () => {
  isLoading.value = true
  hasError.value = false
}

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
  () => props.preview,
  () => {
    if (props.preview && props.preview.id) {
      loadPdf()
    }
  },
  { deep: true }
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

.loading-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;

  .spinner {
    color: $white;
  }
}
.error-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $white;
  background: rgba(0, 0, 0, 0.5);

  p {
    margin: 0;
    padding: 1em;
    text-align: center;
  }
}
</style>
