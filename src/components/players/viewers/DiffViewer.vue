<template>
  <div
    class="diff-viewer"
    :style="{
      height: defaultHeight ? `${defaultHeight}px` : '100%'
    }"
  >
    <div class="diff-wrapper" v-show="!isLoading">
      <div class="diff-content" v-html="renderedHtml"></div>
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
import { html as diff2html } from 'diff2html'

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

const { t } = useI18n()

// State

const isLoading = ref(true)
const hasError = ref(false)
const rawContent = ref('')

// Computed

const fileUrl = computed(() =>
  props.preview?.id
    ? `/api/pictures/originals/preview-files/${props.preview.id}.diff`
    : ''
)

const renderedHtml = computed(() => {
  if (!rawContent.value) return ''
  return diff2html(rawContent.value, {
    drawFileList: true,
    outputFormat: 'line-by-line',
    highlight: true,
    matching: 'lines'
  })
})

// Functions

const loadContent = async () => {
  if (!fileUrl.value) return
  isLoading.value = true
  hasError.value = false
  try {
    const response = await fetch(fileUrl.value)
    if (!response.ok) throw new Error(response.statusText)
    rawContent.value = await response.text()
  } catch (err) {
    console.error('Failed to load diff preview', err)
    hasError.value = true
  }
  isLoading.value = false
}

// Watchers

watch(() => props.preview?.id, loadContent, { immediate: true })
</script>

<style lang="scss" scoped>
.diff-viewer {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.diff-wrapper {
  overflow: auto;
  background: var(--background);
  color: var(--text);
  height: 100%;
  width: 100%;
}

.diff-content {
  :deep(.d2h-wrapper) {
    font-size: 0.85em;
  }

  :deep(.d2h-file-header) {
    background: var(--background-alt);
    border-bottom: 1px solid var(--border);
    padding: 0.5em 1em;
    font-weight: 600;
  }

  :deep(.d2h-file-list-wrapper) {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 5px;
    margin-bottom: 1em;
  }

  :deep(.d2h-file-list-line) {
    color: var(--text);
  }

  :deep(.d2h-code-line-ctn) {
    font-family: 'Courier New', monospace;
    white-space: pre;
    color: var(--text);
  }

  :deep(.d2h-ins),
  :deep(.d2h-ins .d2h-code-line-ctn) {
    background: transparent;
    color: $green;
  }

  :deep(.d2h-del),
  :deep(.d2h-del .d2h-code-line-ctn) {
    background: transparent;
    color: $red;
  }

  :deep(.d2h-info),
  :deep(.d2h-info .d2h-code-line-ctn) {
    background: transparent;
    color: var(--text-alt);
  }

  :deep(.d2h-code-linenumber) {
    color: var(--text-alt);
    border-right: 1px solid var(--border);
    user-select: none;
    position: sticky;
    left: 0;
    background: var(--background);
    z-index: 1;
  }

  :deep(.d2h-code-line-prefix) {
    color: inherit;
  }

  :deep(.d2h-file-diff) {
    overflow-x: auto;
  }
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

<style>
@import 'diff2html/bundles/css/diff2html.min.css';

.diff-viewer .d2h-ins,
.diff-viewer .d2h-ins .d2h-code-line-ctn,
.diff-viewer .d2h-del,
.diff-viewer .d2h-del .d2h-code-line-ctn,
.diff-viewer .d2h-info,
.diff-viewer .d2h-info .d2h-code-line-ctn,
.diff-viewer .d2h-cntx,
.diff-viewer .d2h-cntx .d2h-code-line-ctn,
.diff-viewer .d2h-code-linenumber,
.diff-viewer .d2h-file-diff .d2h-del.d2h-change,
.diff-viewer .d2h-file-diff .d2h-del.d2h-change .d2h-code-line-ctn,
.diff-viewer .d2h-file-diff .d2h-ins.d2h-change,
.diff-viewer .d2h-file-diff .d2h-ins.d2h-change .d2h-code-line-ctn,
.diff-viewer .d2h-file-diff .d2h-ins.d2h-change del,
.diff-viewer .d2h-file-diff .d2h-del.d2h-change ins,
.diff-viewer .d2h-code-line del,
.diff-viewer .d2h-code-line ins {
  background-color: transparent;
}
</style>
