<template>
  <div
    id="add-comment-modal"
    :class="{
      modal: true,
      'is-active': active
    }"
    ref="modal"
  >
    <div
      ref="background"
      class="modal-background"
      @click="$emit('cancel')"
    ></div>

    <div
      class="modal-content"
      @dragover="onFileDragover"
      @dragleave="onFileDragLeave"
    >
      <div id="modal-content" class="box content" :class="{ dragging: true }">
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
        <h1 class="title" v-if="isEditing">
          {{ $t('tasks.change_preview') }}
        </h1>
        <h1 class="title" v-else>
          {{ isConcept ? $t('concepts.add_concept') : $t('tasks.add_preview') }}
        </h1>

        <p>
          {{ $t('tasks.select_preview_file') }}
        </p>

        <file-upload
          ref="preview-field"
          class="preview-files-field"
          :accept="extensions"
          :is-primary="false"
          :label="$t('main.select_file')"
          :multiple="isMultiple"
          @fileselected="onFileSelected"
          hide-file-names
        />

        <p class="error" v-if="isError">
          {{
            isConcept
              ? $t('concepts.add_concept_error')
              : $t('tasks.add_preview_error')
          }}
        </p>

        <h3 class="subtitle has-text-centered" v-if="forms.length > 0">
          Selected Files
        </h3>
        <div class="upload-previews" v-if="forms.length > 0">
          <template v-for="(form, index) in forms" :key="`preview-${index}`">
            <p class="preview-name">
              {{ form.get('file').name }}
              <span @click="removePreview(form)">x</span>
            </p>
            <img alt="uploaded file" :src="getURL(form)" v-if="isImage(form)" />
            <video
              :ref="`video-${index}`"
              :src="getURL(form)"
              preload="auto"
              class="is-fullwidth"
              autoplay
              controls
              loop
              muted
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
            @click="$emit('confirm', forms)"
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

<script>
import { AlertTriangleIcon } from 'lucide-vue-next'

import files from '@/lib/files'

import { modalMixin } from '@/components/modals/base_modal'
import FileUpload from '@/components/widgets/FileUpload.vue'

export default {
  name: 'add-preview-modal',

  mixins: [modalMixin],

  components: {
    AlertTriangleIcon,
    FileUpload
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    confirmLabel: {
      type: String,
      default: ''
    },
    extensions: {
      type: String,
      default: files.ALL_EXTENSIONS_STRING
    },
    isConcept: {
      type: Boolean,
      default: false
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isMultiple: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      default: 'tasks.revision_preview_file'
    },
    title: {
      type: String,
      default: ''
    },
    fps: {
      type: Number,
      default: 0
    },
    expectedFrames: {
      type: Number,
      default: 0
    }
  },

  emits: ['cancel', 'confirm', 'fileselected'],

  data() {
    return {
      forms: [],
      isWrongDuration: false,
      isDraggingFile: false
    }
  },

  computed: {
    previewField() {
      return this.$refs['preview-field']
    }
  },

  methods: {
    setFiles(files) {
      this.previewField.filesChange('file', files)
    },

    onFileSelected(forms) {
      this.forms = this.isMultiple ? this.forms.concat(forms) : [forms]
      this.$emit('fileselected', this.forms)
    },

    reset() {
      this.previewField.reset()
      this.forms = []
      this.isWrongDuration = false
    },

    onPaste(event) {
      if (this.active && event.clipboardData.files) {
        this.previewField.filesChange('', event.clipboardData.files)
      }
    },

    getURL(form) {
      return window.URL.createObjectURL(form.get('file'))
    },

    isImage(form) {
      return form.get('file').type.startsWith('image')
    },

    isVideo(form) {
      return form.get('file').type.startsWith('video')
    },

    isPdf(form) {
      return form.get('file').type.indexOf('pdf') > 0
    },

    removePreview(form) {
      this.forms = this.forms.filter(f => f !== form)
    },

    onFileDragover(event) {
      event.preventDefault()
      event.stopPropagation()
      this.isDraggingFile = true
    },

    onFileDragLeave(event) {
      event.preventDefault()
      event.stopPropagation()
      if (event.target.id === 'drop-mask') {
        this.isDraggingFile = false
      }
    },

    onDrag(event) {},

    onDrop(event) {
      this.previewField.onDrop(event)
      this.isDraggingFile = false
      event.preventDefault()
    }
  },

  watch: {
    active() {
      this.reset()
    },

    forms: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.isWrongDuration = false
          if (this.expectedFrames !== 0) {
            Object.keys(this.$refs).forEach(key => {
              const ref = this.$refs[key]
              if (key.startsWith('video-') && ref[0]) {
                ref[0].onloadedmetadata = () => {
                  const frames = Math.round(ref[0].duration * this.fps)
                  if (frames !== this.expectedFrames) {
                    this.isWrongDuration = true
                  }
                }
              }
            })
          }
        })
      }
    }
  },

  mounted() {
    this.forms = []
    window.addEventListener('paste', this.onPaste, false)
  },

  beforeUnmount() {
    window.removeEventListener('paste', this.onPaste)
  }
}
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

.modal-content .box h1.title {
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

.message-body {
  border-width: 0 0 0 4px;
}

.preview-files-field {
  margin: auto;
}

.box.content {
  position: relative;
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
