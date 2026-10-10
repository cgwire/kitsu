<template>
  <div
    id="add-comment-modal"
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div
      class="modal-content"
      @dragover="onFileDragover"
      @dragleave="onFileDragLeave"
    >
      <div id="modal-content" class="box content">
        <div
          id="drop-mask"
          class="drop-mask"
          @drop="onDrop"
          v-if="isDraggingFile"
        >
          {{ $t('main.drop_files_here') }}
        </div>
        <h2 class="subtitle">{{ title }}</h2>
        <h2 class="title" v-if="isEditing">
          {{ $t('tasks.change_preview') }}
        </h2>
        <h2 class="title" v-else>
          {{ isConcept ? $t('concepts.add_concept') : $t('tasks.add_preview') }}
        </h2>

        <p>
          {{ $t('tasks.select_preview_file') }}
        </p>

        <file-upload-zone
          ref="previewField"
          :accept="extensions"
          :label="$t('main.select_file')"
          :multiple="isMultiple"
          @fileselected="onFileSelected"
        />

        <p class="error" v-if="isError">
          {{
            isConcept
              ? $t('concepts.add_concept_error')
              : $t('tasks.add_preview_error')
          }}
        </p>

        <h3 class="subtitle has-text-centered" v-if="forms.length > 0">
          {{ $t('comments.selected_files') }}
        </h3>
        <div class="upload-previews" v-if="forms.length > 0">
          <template v-for="(form, index) in forms" :key="`preview-${index}`">
            <p class="preview-name">
              {{ form.get('file').name }}
              <span
                role="button"
                tabindex="0"
                @click="removePreview(form)"
                @keydown.enter.prevent="removePreview(form)"
                @keydown.space.prevent="removePreview(form)"
                >x</span
              >
            </p>
            <div class="progress-wrapper" v-if="isLoading && uploadProgress">
              <div
                class="progress"
                :style="{
                  width: (uploadProgress[form.get('file').name] || 0) + '%'
                }"
              ></div>
            </div>
            <img alt="uploaded file" :src="getURL(form)" v-if="isImage(form)" />
            <video
              :src="getURL(form)"
              preload="auto"
              class="is-fullwidth"
              autoplay
              controls
              loop
              muted
              @loadedmetadata="onVideoLoaded"
              v-else-if="isVideo(form)"
            />
            <iframe
              class="is-fullwidth"
              frameborder="0"
              :src="getURL(form)"
              v-else-if="isPdf(form)"
            />
            <hr />
          </template>
        </div>

        <div class="mt1 message" v-if="message">
          <div class="message-body">
            {{ $t(message) }}
          </div>
        </div>

        <p class="mb2 mt2 warning-text" v-if="isWrongDuration">
          <alert-triangle-icon class="icon mr05 warning" />
          {{ $t('shots.wrong_file_duration') }}
        </p>

        <p class="has-text-right">
          <a
            :class="{
              button: true,
              'is-primary': true,
              'is-loading': isLoading,
              'is-disabled': forms.length === 0
            }"
            role="button"
            tabindex="0"
            @click="confirm"
            @keydown.enter.prevent="confirm"
            @keydown.space.prevent="confirm"
          >
            {{
              confirmLabel?.length
                ? confirmLabel
                : isConcept
                  ? $t('main.confirmation')
                  : $t('tasks.add_revision_confirm')
            }}
          </a>
          <button @click="$emit('cancel')" class="button is-link">
            {{ $t('main.cancel') }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { AlertTriangleIcon } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'

import { useModal } from '@/composables/modal'
import files from '@/lib/files'

import FileUploadZone from '@/components/widgets/FileUploadZone.vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  active: { type: Boolean, default: false },
  confirmLabel: { type: String, default: '' },
  expectedFrames: { type: Number, default: 0 },
  extensions: { type: String, default: files.ALL_EXTENSIONS_STRING },
  fps: { type: Number, default: 0 },
  isConcept: { type: Boolean, default: false },
  isEditing: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  isMultiple: { type: Boolean, default: true },
  message: { type: String, default: 'tasks.revision_preview_file' },
  title: { type: String, default: '' },
  // By file name, for the uploads no other part of the page shows.
  uploadProgress: { type: Object, default: null }
})

const emit = defineEmits(['cancel', 'confirm', 'fileselected'])

useModal(toRef(props, 'active'), emit)

// State
// --------------------------------------------------------------------------
const forms = ref([])
const isDraggingFile = ref(false)
const isWrongDuration = ref(false)
const previewField = ref(null)

// Functions
// --------------------------------------------------------------------------
const onFileSelected = newForms => {
  forms.value = props.isMultiple ? forms.value.concat(newForms) : [newForms]
  emit('fileselected', forms.value)
}

const confirm = () => {
  if (forms.value.length > 0) emit('confirm', forms.value)
}

const reset = () => {
  previewField.value?.reset()
  forms.value = []
  isWrongDuration.value = false
}

const onPaste = event => {
  if (props.active && event.clipboardData.files) {
    previewField.value?.filesChange('', event.clipboardData.files)
  }
}

const getURL = form => window.URL.createObjectURL(form.get('file'))

const isImage = form => form.get('file').type.startsWith('image')
const isVideo = form => form.get('file').type.startsWith('video')
const isPdf = form => form.get('file').type.indexOf('pdf') > 0

const removePreview = form => {
  forms.value = forms.value.filter(f => f !== form)
}

const onVideoLoaded = event => {
  if (props.expectedFrames === 0) return
  const frames = Math.round(event.target.duration * props.fps)
  if (frames !== props.expectedFrames) {
    isWrongDuration.value = true
  }
}

const onFileDragover = event => {
  event.preventDefault()
  event.stopPropagation()
  isDraggingFile.value = true
}

const onFileDragLeave = event => {
  event.preventDefault()
  event.stopPropagation()
  if (event.target.id === 'drop-mask') {
    isDraggingFile.value = false
  }
}

const onDrop = event => {
  previewField.value?.onDrop(event)
  isDraggingFile.value = false
  event.preventDefault()
}

// Watchers
// --------------------------------------------------------------------------
watch(() => props.active, reset)

watch(
  forms,
  () => {
    isWrongDuration.value = false
  },
  { deep: true }
)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  window.addEventListener('paste', onPaste, false)
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
})

defineExpose({
  reset,
  setFiles: fileList => {
    previewField.value?.filesChange('file', fileList)
  }
})
</script>

<style lang="scss" scoped>
.modal-content {
  max-height: calc(100vh - 150px);
}

.error {
  margin-top: 1em;
}

.is-fullwidth {
  width: 100%;
}

.upload-previews {
  text-align: center;
  padding: 1.5em;
  max-height: 40vh;
  overflow-y: auto;
}

.subtitle {
  color: $grey;
  font-size: 1.2em;
  margin: 0;
  margin-bottom: 1em;
  padding: 0;
  text-transform: uppercase;
}

.modal-content .box h2.title {
  font-weight: 350;
  font-size: 2.2em;
  line-height: 1.2em;
  margin-bottom: 0.5em;
}

h3 {
  font-weight: 350;
  font-size: 1.4em;
  margin-top: 0.5em;
  padding: 0;
}

h3.subtitle {
  margin-top: 1em;
  font-weight: 400;
}

.preview-name span {
  cursor: pointer;
  float: right;
}

.progress-wrapper {
  border-radius: 5px;
  background: var(--background-alt);
  height: 5px;
  margin-bottom: 1em;
}

.progress {
  height: 5px;
  background-color: $light-green;
}

.message-body {
  border-width: 0 0 0 4px;
}

.box.content {
  position: relative;
}

.drop-mask {
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  color: white;
  display: flex;
  font-size: 2em;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}
</style>
