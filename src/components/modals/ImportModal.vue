<template>
  <base-modal
    :active="active"
    :title="$t('main.csv.import_title')"
    @cancel="$emit('cancel')"
  >
    <div class="columns-info" v-if="columnGroups.length > 0">
      <div
        class="column-group"
        :key="group.label"
        v-for="group in columnGroups"
      >
        <span class="group-label">{{ group.label }}</span>
        <div class="column-tags">
          <span
            :class="{ 'column-tag': true, required: group.required }"
            :key="column"
            v-for="column in group.columns"
          >
            {{ column }}
          </span>
        </div>
      </div>
    </div>

    <div class="tabs">
      <ul>
        <li
          :class="{ 'is-active': activeTab === tab.id }"
          :key="`tab-${tab.id}`"
          v-for="tab in tabs"
        >
          <a
            role="button"
            tabindex="0"
            @click="activeTab = tab.id"
            @keydown.enter.prevent="activeTab = tab.id"
            @keydown.space.prevent="activeTab = tab.id"
            >{{ tab.name }}</a
          >
        </li>
      </ul>
    </div>
    <div v-show="activeTab === 'file'">
      <p>{{ $t('main.csv.select_file') }}</p>
      <file-upload-zone
        ref="inputFile"
        accept=".csv"
        :label="$t('main.csv.upload_file')"
        @fileselected="onFileSelected"
      />
    </div>
    <div v-show="activeTab === 'text'">
      <p>{{ $t('main.csv.paste_code') }}</p>
      <textarea
        class="paste-area input"
        :placeholder="pasteAreaPlaceholder"
        v-model.trim="pastedCode"
      ></textarea>
    </div>

    <modal-footer
      :confirm-label="$t('main.csv.preview')"
      :error-text="$t('main.csv.error_upload')"
      :is-loading="isLoading"
      :is-disabled="!isValid"
      :is-error="isError"
      @confirm="onConfirmClicked"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
// eslint-disable-next-line no-unused-vars
import FileUploadZone from '@/components/widgets/FileUploadZone.vue'

const { t } = useI18n()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  columns: { type: Array, default: () => [] },
  genericColumns: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  optionalColumns: { type: Array, default: () => [] }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const activeTab = ref('file')
const formData = ref(null)
const inputFile = ref(null)
const pastedCode = ref('')

// Computed

const tabs = computed(() => [
  { id: 'file', name: t('main.csv.tab_select_file') },
  { id: 'text', name: t('main.csv.tab_paste_code') }
])

const columnGroups = computed(() =>
  [
    {
      label: t('main.csv.required_fields'),
      columns: props.columns,
      required: true
    },
    { label: t('main.csv.optional_fields'), columns: props.optionalColumns },
    { label: t('main.csv.generic_fields'), columns: props.genericColumns }
  ].filter(group => group.columns.length > 0)
)

const isValid = computed(
  () =>
    (activeTab.value === 'file' && formData.value) ||
    (activeTab.value === 'text' && pastedCode.value)
)

const pasteAreaPlaceholder = computed(() => props.columns.join(';'))

// Functions

const onConfirmClicked = () => {
  const mode = activeTab.value
  const data = mode === 'file' ? formData.value : pastedCode.value
  emit('confirm', data, mode)
}

const onFileSelected = data => {
  formData.value = data
  onConfirmClicked()
}

const reset = () => {
  inputFile.value?.reset()
  activeTab.value = 'file'
  formData.value = null
  pastedCode.value = ''
}

// Watchers

watch(() => props.active, reset)

defineExpose({ reset })
</script>

<style lang="scss" scoped>
:deep(.modal-content) {
  width: 800px;
  max-width: calc(100vw - 4rem);
}

:deep(.modal-content .box h2.title) {
  margin-bottom: 0.5em;
}

.columns-info {
  background: $white-grey-light;
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-bottom: 1.6em;
  padding: 1.2em 1.4em;
}

.group-label {
  color: var(--text-alt);
  display: block;
  font-size: 0.9em;
  margin-bottom: 0.5em;
}

.column-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
}

.column-tag {
  background: var(--background-tag);
  border-radius: 6px;
  color: var(--text);
  font-size: 0.9em;
  padding: 0.2em 0.6em;

  &.required {
    font-weight: 600;
  }
}

.tabs ul {
  margin-left: 0;
}

.dark .columns-info {
  background: var(--background-alt);
}

.paste-area {
  font-family: monospace;
  font-size: 0.95em;
  height: auto;
  line-height: 1.6;
  margin: 1em 0;
  min-height: 12rem;
  padding: 0.8em 1em;
  resize: vertical;
  white-space: pre;
  width: 100%;
}
</style>
