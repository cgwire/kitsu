<template>
  <div
    class="diff-viewer"
    :style="{
      height: defaultHeight ? `${defaultHeight}px` : '100%'
    }"
  >
    <div class="diff-wrapper" v-show="!isLoading">
      <div v-if="isParsed" class="diff-content" v-html="renderedHtml"></div>
      <pre v-else class="diff-raw">{{ rawContent }}</pre>
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
import { html as diff2html } from 'diff2html'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import filesApi from '@/store/api/files'

import Spinner from '@/components/widgets/Spinner.vue'

const { t } = useI18n()

const props = defineProps({
  preview: {
    type: Object,
    required: true
  },
  defaultHeight: {
    type: Number,
    default: 600
  },
  urlPrefix: {
    type: String,
    default: null
  }
})

// State

const isLoading = ref(true)
const hasError = ref(false)
const rawContent = ref('')

// Computed

const renderedHtml = computed(() => {
  if (!rawContent.value) return ''
  return diff2html(rawContent.value, {
    drawFileList: true,
    outputFormat: 'line-by-line',
    highlight: true,
    matching: 'lines'
  })
})

// diff2html silently yields an empty render when the content is not a valid
// unified diff. Detect that and fall back to readable raw text instead of a
// blank screen.
const isParsed = computed(() => renderedHtml.value.includes('d2h-file-diff'))

// Functions

const loadContent = async () => {
  if (!props.preview?.id) return
  isLoading.value = true
  hasError.value = false
  try {
    rawContent.value = await filesApi.getPreviewFileText(
      props.preview.id,
      'diff',
      props.urlPrefix
    )
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
/*
 * The whole widget is re-themed through diff2html's own `--d2h-*` design
 * tokens (the library reads them everywhere), so we never fight it
 * class-by-class. One token set for light, one under `.dark`.
 *
 * Readability rule (GitHub-style): tint the ROW background and the
 * word-level highlight, but keep the code text high-contrast neutral —
 * green/red text on a green/red row is what made the old version unreadable.
 */
.diff-viewer {
  position: relative;
  overflow: hidden;
  width: 100%;

  // Code text color — strong, not the muted UI grey.
  --diff-code-color: #1f2328;
  --diff-gutter-color: #59636e;

  --d2h-bg-color: var(--background);
  --d2h-border-color: var(--border);
  --d2h-dim-color: var(--diff-gutter-color);
  --d2h-line-border-color: var(--border);
  --d2h-file-header-bg-color: var(--background-alt);
  --d2h-file-header-border-color: var(--border);
  --d2h-ins-bg-color: #e6ffec;
  --d2h-ins-border-color: #a0e6b0;
  --d2h-ins-highlight-bg-color: #abf2bc;
  --d2h-ins-label-color: #1a7f37;
  --d2h-del-bg-color: #ffebe9;
  --d2h-del-border-color: #f5b9b6;
  --d2h-del-highlight-bg-color: #ffc1bd;
  --d2h-del-label-color: #cf222e;
  --d2h-change-ins-color: #e6ffec;
  --d2h-change-del-color: #ffebe9;
  --d2h-info-bg-color: var(--background-alt);
  --d2h-info-border-color: var(--border);
  --d2h-selected-color: #c8e1ff;
  --d2h-moved-label-color: #6639ba;
}

.dark .diff-viewer {
  --diff-code-color: #e6edf3;
  --diff-gutter-color: #8b949e;

  --d2h-bg-color: var(--background);
  --d2h-ins-bg-color: rgba(63, 185, 80, 0.15);
  --d2h-ins-border-color: rgba(63, 185, 80, 0.4);
  --d2h-ins-highlight-bg-color: rgba(63, 185, 80, 0.4);
  --d2h-ins-label-color: #3fb950;
  --d2h-del-bg-color: rgba(248, 81, 73, 0.15);
  --d2h-del-border-color: rgba(248, 81, 73, 0.4);
  --d2h-del-highlight-bg-color: rgba(248, 81, 73, 0.4);
  --d2h-del-label-color: #f85149;
  --d2h-change-ins-color: rgba(63, 185, 80, 0.15);
  --d2h-change-del-color: rgba(248, 81, 73, 0.15);
  --d2h-moved-label-color: #a371f7;
}

.diff-wrapper {
  position: absolute;
  inset: 0;
  overflow: auto;
  padding: 1em;
  background: var(--background-page);
}

// Fallback when diff2html can't parse the content as a unified diff.
.diff-raw {
  margin: 0;
  padding: 1em 1.2em;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 1px 3px var(--box-shadow);
  color: var(--diff-code-color, var(--text));
  font-family:
    'SF Mono', 'JetBrains Mono', 'Fira Code', Menlo, Consolas,
    'Liberation Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.diff-content {
  // File card — rounded, framed, with a little depth.
  :deep(.d2h-file-wrapper) {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1em;
    box-shadow: 0 1px 3px var(--box-shadow);
  }

  // Sticky file header with filename + stats badges.
  :deep(.d2h-file-header) {
    position: sticky;
    top: 0;
    z-index: 2;
    height: auto;
    padding: 0.55em 0.9em;
    align-items: center;
  }

  :deep(.d2h-file-name) {
    font-family: inherit;
    font-size: 0.9em;
    font-weight: 600;
    color: var(--text-strong);
  }

  // Monospace, comfortable line-height for the code body.
  :deep(.d2h-diff-table) {
    font-family:
      'SF Mono', 'JetBrains Mono', 'Fira Code', Menlo, Consolas,
      'Liberation Mono', monospace;
    font-size: 0.8rem;
    line-height: 1.55;
  }

  :deep(.d2h-code-line-ctn),
  :deep(.d2h-code-line-prefix) {
    color: var(--diff-code-color);
  }

  // Line-number gutter: muted, quiet separator, sticky on horizontal scroll.
  :deep(.d2h-code-linenumber) {
    background: var(--background-alt);
    border-color: var(--border);
    color: var(--diff-gutter-color);
  }

  // File-list summary card at the top.
  :deep(.d2h-file-list-wrapper) {
    background: var(--background-alt);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.4em 0;
    margin-bottom: 1em;
  }

  :deep(.d2h-file-list-title) {
    padding: 0 0.9em;
    color: var(--text-strong);
  }

  :deep(.d2h-file-list-line) {
    color: var(--text);
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
</style>
