<template>
  <div ref="wrapperRef" @drop="onDrop">
    <form enctype="multipart/form-data" novalidate>
      <div class="dropbox">
        <label
          :class="{
            button: true,
            'is-primary': isPrimary
          }"
        >
          {{ label }}
          <input
            ref="uploadInputRef"
            class="visuallyhidden"
            type="file"
            :accept="accept"
            :name="uploadFieldName"
            :disabled="isSaving || disabled"
            :multiple="multiple"
            @change="filesChange($event.target.name, $event.target.files)"
          />
        </label>
        <span
          class="file-upload-status"
          v-if="uploadedFiles.length > 1 && !hideFileNames"
        >
          {{ uploadedFiles.length }} {{ $tc('main.files_selected') }}
        </span>
        <span
          class="file-upload-status"
          v-if="uploadedFiles.length === 1 && !hideFileNames"
        >
          {{ uploadedFiles[0] }}
        </span>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  accept: {
    default: '.csv',
    type: String
  },
  isPrimary: {
    default: true,
    type: Boolean
  },
  label: {
    type: String,
    required: true
  },
  multiple: {
    default: false,
    type: Boolean
  },
  uploadFieldName: {
    default: 'file',
    type: String
  },
  disabled: {
    type: Boolean,
    default: false
  },
  hideFileNames: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['fileselected'])

const isInitial = ref(true)
const isSaving = ref(false)
const uploadedFiles = ref([])
const wrapperRef = ref(null)
const uploadInputRef = ref(null)

const filesChange = (name, files) => {
  uploadedFiles.value = []
  const forms = []
  for (let i = 0, numFiles = files.length; i < numFiles; i++) {
    const file = files[i]
    const formData = new FormData()
    formData.append(props.uploadFieldName, file, file.name)
    forms.push(formData)
    if (props.multiple) {
      uploadedFiles.value.push(file.name)
    } else {
      uploadedFiles.value = [file.name]
    }
  }
  if (props.multiple) {
    emit('fileselected', forms)
  } else {
    emit('fileselected', forms[0])
  }
}

const reset = () => {
  isSaving.value = false
  isInitial.value = true
  uploadedFiles.value = []
  if (uploadInputRef.value) {
    uploadInputRef.value.value = ''
  }
}

const onDrop = event => {
  if (event.dataTransfer.files) {
    isSaving.value = false
    filesChange('file', event.dataTransfer.files)
  }
}

onMounted(() => {
  reset()
  const events = [
    'drag',
    'dragstart',
    'dragend',
    'dragover',
    'dragenter',
    'dragleave',
    'drop'
  ]
  events.forEach(evt => {
    wrapperRef.value.addEventListener(evt, e => {
      e.preventDefault()
      e.stopPropagation()
    })
  })
})

defineExpose({ filesChange, onDrop, reset })
</script>

<style lang="scss" scoped>
.dropbox {
  display: flex;
  align-items: center;
}

.file-upload-status {
  margin-left: 0.5rem;
  font-style: italic;
}
</style>
