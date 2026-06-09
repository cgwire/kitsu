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

        <file-upload-zone
          ref="fileField"
          :label="$t('main.select_file')"
          :accept="extensions"
          :multiple="true"
          @fileselected="onFileSelected"
        />

        <div class="snapshot-actions" v-if="isMovie || isPicture">
          <button
            :class="{
              button: true,
              'snapshot-button': true,
              'is-loading': snapshotLoading === 'standard'
            }"
            :disabled="snapshotLoading && snapshotLoading !== 'standard'"
            @click="$emit('add-snapshots')"
          >
            {{ $t('main.attach_snapshots') }}
          </button>
          <button
            :class="{
              button: true,
              'snapshot-button': true,
              'is-loading': snapshotLoading === 'label'
            }"
            :disabled="snapshotLoading && snapshotLoading !== 'label'"
            @click="$emit('add-snapshots-with-label')"
          >
            {{ $t('main.attach_snapshots_with_label') }}
          </button>
        </div>

        <div class="record-actions" v-if="allowRecording && !recordingMode">
          <button class="button record-audio" @click="startRecording('audio')">
            <mic-icon :size="16" />
            <span>{{ $t('main.record_audio') }}</span>
          </button>
          <button class="button record-video" @click="startRecording('video')">
            <video-icon :size="16" />
            <span>{{ $t('main.record_video') }}</span>
          </button>
        </div>

        <media-recorder-panel
          :mode="recordingMode"
          v-if="recordingMode"
          @recorded="onRecorded"
          @cancel="recordingMode = null"
        />

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
            <attachment-video-player
              :src="getURL(form)"
              :name="form.get('file').name"
              :download-href="getURL(form)"
              :show-name="false"
              v-else-if="isVideo(form)"
            />
            <attachment-audio-player
              :src="getURL(form)"
              :name="form.get('file').name"
              :download-href="getURL(form)"
              :show-name="false"
              v-else-if="isAudio(form)"
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
import { MicIcon, VideoIcon } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'

import { useModal } from '@/composables/modal'
import files from '@/lib/files'

import AttachmentAudioPlayer from '@/components/players/viewers/AttachmentAudioPlayer.vue'
import AttachmentVideoPlayer from '@/components/players/viewers/AttachmentVideoPlayer.vue'
import FileUploadZone from '@/components/widgets/FileUploadZone.vue'
import MediaRecorderPanel from '@/components/widgets/MediaRecorderPanel.vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  allowRecording: { type: Boolean, default: true },
  extensions: { type: String, default: files.ALL_EXTENSIONS_STRING },
  isEditing: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  isMovie: { type: Boolean, default: false },
  isPicture: { type: Boolean, default: false },
  namePrefix: { type: String, default: '' },
  title: { type: String, default: '' }
})

const emit = defineEmits([
  'add-snapshots',
  'add-snapshots-with-label',
  'cancel',
  'confirm'
])

useModal(toRef(props, 'active'), emit)

const fileField = ref(null)
const forms = ref([])
// Tracks which snapshot button is currently extracting:
// 'standard', 'label', or null when idle.
const snapshotLoading = ref(null)
const isDraggingFile = ref(false)
const recordingMode = ref(null)

const onFileSelected = newForms => {
  forms.value = forms.value.concat(newForms)
}

const startRecording = mode => {
  recordingMode.value = mode
}

const onRecorded = file => {
  // Recorded files get an entity/task-type prefix so they are identifiable.
  const name = props.namePrefix ? `${props.namePrefix}-${file.name}` : file.name
  const formData = new FormData()
  formData.append('file', file, name)
  forms.value.push(formData)
  recordingMode.value = null
}

const confirm = () => {
  emit('confirm', forms.value)
}

const reset = () => {
  fileField.value?.reset()
  forms.value = []
  recordingMode.value = null
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
const isAudio = form => form.get('file').type.startsWith('audio')
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
  showAnnotationLoading: (kind = 'standard') => {
    snapshotLoading.value = kind
  },
  hideAnnotationLoading: () => {
    snapshotLoading.value = null
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

// The audio player root is block-level; centre it in the preview like the
// (inline-block) video player.
.upload-attachments :deep(.attachment-audio-player) {
  margin-left: auto;
  margin-right: auto;
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

.snapshot-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin-bottom: 1em;
}

.snapshot-button {
  width: 100%;
  margin-left: 0;
}

.record-actions {
  display: flex;
  gap: 0.5em;
  margin-bottom: 1em;
}

.record-actions .button {
  align-items: center;
  display: inline-flex;
  flex: 1;
  gap: 0.4em;
  justify-content: center;
  margin-left: 0;
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
