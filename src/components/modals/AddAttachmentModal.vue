<template>
  <div
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
      <div class="box content attachment-modal-box">
        <div
          ref="dropMask"
          id="drop-mask"
          class="drop-mask"
          @drop="onDrop"
          v-if="isDraggingFile"
        >
          {{ $t('main.drop_files_here') }}
        </div>
        <h2 class="subtitle">{{ title }}</h2>
        <h1 class="title">
          {{ $t('tasks.comment_image') }}
        </h1>

        <div class="flexrow buttons attachment-modal-buttons">
          <file-upload
            ref="fileField"
            class="flexrow-item"
            :label="$t('main.select_file')"
            :accept="extensions"
            :multiple="true"
            :is-primary="false"
            @fileselected="onFileSelected"
            hide-file-names
          />
          <p class="flexrow-item mt1" v-if="isMovie">
            {{ $t('main.or') }}
          </p>
          <p class="flexrow-item" v-if="isMovie">
            <button
              :class="{
                button: true,
                'is-loading': isAnnotationLoading
              }"
              @click="$emit('add-snapshots')"
            >
              {{ $t('main.attach_snapshots') }}
            </button>
          </p>
        </div>

        <h3 class="subtitle has-text-centered" v-if="forms.length > 0">
          {{ $t('comments.selected_files') }}
        </h3>
        <div class="upload-attachments" v-if="forms.length > 0">
          <template v-for="(form, index) in forms" :key="`attachment-${index}`">
            <p class="attachment-name">
              {{ form.get('file').name }}
              <span @click="removeAttachment(form)">x</span>
            </p>
            <img alt="uploaded file" :src="getURL(form)" v-if="isImage(form)" />
            <video
              class="is-fullwidth"
              preload="auto"
              controls
              loop
              muted
              :src="getURL(form)"
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
        <p class="has-text-right mt2">
          <a
            :class="{
              button: true,
              'is-primary': true,
              'is-loading': isLoading,
              'is-disabled': forms.length === 0
            }"
            @click="confirm()"
          >
            {{ $t('tasks.confirm_attachments') }}
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
import { onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'

import { useModal } from '@/composables/modal'
import files from '@/lib/files'

import FileUpload from '@/components/widgets/FileUpload.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  extensions: { type: String, default: files.ALL_EXTENSIONS_STRING },
  isEditing: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  isMovie: { type: Boolean, default: false },
  title: { type: String, default: '' }
})

const emit = defineEmits(['add-snapshots', 'cancel', 'confirm'])

useModal(toRef(props, 'active'), emit)

const fileField = ref(null)
const forms = ref([])
const isAnnotationLoading = ref(false)
const isDraggingFile = ref(false)

const onFileSelected = newForms => {
  forms.value = forms.value.concat(newForms)
}

const confirm = () => {
  emit('confirm', forms.value)
}

const reset = () => {
  fileField.value?.reset()
  forms.value = []
}

const addFiles = fileList => {
  fileField.value?.filesChange('', fileList)
}

const onPaste = event => {
  if (props.active && event.clipboardData.files) {
    addFiles(event.clipboardData.files)
  }
}

const getURL = form => window.URL.createObjectURL(form.get('file'))

const isImage = form => form.get('file').type.startsWith('image')
const isVideo = form => form.get('file').type.startsWith('video')
const isPdf = form => form.get('file').type.indexOf('pdf') > 0

const removeAttachment = form => {
  forms.value = forms.value.filter(f => f !== form)
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
  fileField.value?.onDrop(event)
  isDraggingFile.value = false
  event.preventDefault()
}

watch(() => props.active, reset)

onMounted(() => {
  window.addEventListener('paste', onPaste, false)
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
})

defineExpose({
  addFiles,
  showAnnotationLoading: () => {
    isAnnotationLoading.value = true
  },
  hideAnnotationLoading: () => {
    isAnnotationLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
.modal-content {
  max-height: calc(100vh - 150px);
}

.modal-content .box p.text {
  margin-bottom: 1em;
}

.error {
  margin-top: 1em;
}

.description {
  margin-bottom: 1em;
}

.is-fullwidth {
  width: 100%;
}

.upload-attachments {
  text-align: center;
}

.subtitle {
  color: $grey;
  font-size: 1.2em;
  margin: 0;
  padding: 0;
  text-transform: uppercase;
}

.content h1.title {
  margin-bottom: 0.5em;
  margin-top: 0.5em;
}

h3 {
  font-weight: 350;
  font-size: 1.4em;
  margin-top: 0.5em;
  padding: 0;
}

.attachment-name span {
  cursor: pointer;
  float: right;
}

h3.subtitle {
  margin-top: 2em;
  margin-bottom: 1em;
  font-weight: 400;
}

.buttons {
  flex-wrap: wrap;
}

.drop-mask {
  align-items: center;
  background: rgba(0.1, 0, 0, 0.5);
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
