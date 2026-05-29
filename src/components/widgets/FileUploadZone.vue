<template>
  <div class="upload-zone" @click="openPicker">
    <file-upload
      ref="fileUpload"
      :accept="accept"
      :label="label"
      :multiple="multiple"
      :is-primary="false"
      hide-file-names
      @fileselected="$emit('fileselected', $event)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

import files from '@/lib/files'

// eslint-disable-next-line no-unused-vars
import FileUpload from '@/components/widgets/FileUpload.vue'

defineProps({
  accept: { type: String, default: files.ALL_EXTENSIONS_STRING },
  label: { type: String, required: true },
  multiple: { type: Boolean, default: false }
})

defineEmits(['fileselected'])

const fileUpload = ref(null)

// Make the whole dashed area open the picker. The inner label already opens it
// natively, so ignore clicks that land on it to avoid a double trigger; for any
// other spot in the zone, click the hidden input directly. The file-upload
// label is kept at its natural size (not stretched to fill the zone) so its
// internal drag handlers don't swallow the modal's drag-over and break the
// drop-anywhere overlay.
const openPicker = event => {
  if (event.target.closest('label')) return
  event.currentTarget.querySelector('input[type="file"]')?.click()
}

defineExpose({
  reset: () => fileUpload.value?.reset(),
  onDrop: event => fileUpload.value?.onDrop(event),
  filesChange: (name, fileList) => fileUpload.value?.filesChange(name, fileList)
})
</script>

<style lang="scss" scoped>
.upload-zone {
  border: 2px dashed var(--border);
  border-radius: 10px;
  cursor: pointer;
  margin: 1em 0;
  padding: 1.5em;
  text-align: center;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    background: var(--background-hover, rgba(255, 255, 255, 0.03));
    border-color: var(--background-selectable, $purple-strong);
  }

  // Strip Bulma's button background off the file-upload label so the dropzone's
  // dashed outline is the single visual container — the text sits directly on
  // the area, no inner button chip.
  :deep(.dropbox) {
    background: transparent;
    border: 0;
    justify-content: center;
    padding: 0;
  }

  :deep(.dropbox label.button) {
    background: transparent;
    border: 0;
    color: var(--text);
    cursor: pointer;
    font-weight: 500;

    &:hover {
      background: transparent;
      color: var(--background-selectable, $purple-strong);
    }
  }
}
</style>
