<template>
  <base-modal
    :active="active"
    :title="$t('main.csv.import_title')"
    @cancel="$emit('cancel')"
  >
    <div v-if="columns.length > 0" class="mb1">
      {{ $t('main.csv.required_fields') }}
      <ul>
        <li v-for="column in columns" :key="column">
          {{ column }}
        </li>
      </ul>
    </div>
    <div v-if="optionalColumns.length > 0" class="mb1">
      {{ $t('main.csv.optional_fields') }}
      <ul>
        <li v-for="optionalColumn in optionalColumns" :key="optionalColumn">
          {{ optionalColumn }}
        </li>
      </ul>
    </div>
    <div v-if="genericColumns.length > 0" class="mb1">
      {{ $t('main.csv.generic_fields') }}
      <ul>
        <li v-for="genericColumn in genericColumns" :key="genericColumn">
          {{ genericColumn }}
        </li>
      </ul>
    </div>

    <div class="tabs">
      <ul>
        <li
          :class="{ 'is-active': activeTab === tab.id }"
          :key="`tab-${tab.id}`"
          v-for="tab in tabs"
        >
          <a @click="activeTab = tab.id">{{ tab.name }}</a>
        </li>
      </ul>
    </div>
    <div v-show="activeTab === 'file'">
      <p>{{ $t('main.csv.select_file') }}</p>
      <file-upload
        ref="inputFile"
        @fileselected="onFileSelected"
        :label="$t('main.csv.upload_file')"
      />
    </div>
    <div v-show="activeTab === 'text'">
      <p>{{ $t('main.csv.paste_code') }}</p>
      <textarea
        class="paste-area"
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
import FileUpload from '@/components/widgets/FileUpload.vue'

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
.tabs ul {
  margin-left: 0;
}

.paste-area {
  margin: 0 0 1rem;
  width: 100%;
  min-height: 10rem;
  padding: 0.5rem;
  resize: vertical;
}
</style>
