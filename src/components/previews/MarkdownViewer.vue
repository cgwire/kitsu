<template>
  <div
    class="markdown-viewer"
    :style="{
      height: defaultHeight ? `${defaultHeight}px` : '100%'
    }"
  >
    <div class="markdown-wrapper" v-show="!isLoading">
      <div class="markdown-content" v-html="renderedHtml"></div>
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
import { marked } from 'marked'

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
    ? `/api/pictures/originals/preview-files/${props.preview.id}.md`
    : ''
)

const renderedHtml = computed(() => {
  if (!rawContent.value) return ''
  return marked.parse(rawContent.value)
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
    console.error('Failed to load markdown preview', err)
    hasError.value = true
  }
  isLoading.value = false
}

// Watchers

watch(() => props.preview?.id, loadContent, { immediate: true })
</script>

<style lang="scss" scoped>
.markdown-viewer {
  position: relative;
  display: flex;
  overflow: hidden;
  width: 100%;
}

.markdown-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 2em;
  background: var(--background);
  color: var(--text);
  width: 100%;
}

.markdown-content {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  text-align: left;

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    border-bottom: 1px solid var(--text-alt);
    padding-bottom: 0.3em;
    color: var(--text);
  }

  :deep(h1) {
    font-size: 1.8em;
  }

  :deep(h2) {
    font-size: 1.4em;
  }

  :deep(h3) {
    font-size: 1.2em;
    border-bottom: 0;
  }

  :deep(p) {
    margin-bottom: 1em;
  }

  :deep(code) {
    background: var(--background-alt);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
  }

  :deep(pre) {
    background: var(--background-alt);
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    margin-bottom: 1em;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(blockquote) {
    border-left: 4px solid var(--text-alt);
    padding-left: 1em;
    margin-left: 0;
    color: var(--text-alt);
  }

  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1em;

    th,
    td {
      border: 1px solid var(--text-alt);
      padding: 0.5em;
      color: var(--text);
    }

    th {
      background: transparent;
      color: var(--text);
      font-weight: 600;
    }
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 5px;
  }

  :deep(a) {
    color: $green;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 2em;
    margin-bottom: 1em;
  }

  :deep(hr) {
    border: 0;
    border-top: 1px solid var(--text-alt);
    margin: 2em 0;
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
