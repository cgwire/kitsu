<template>
  <div class="file-upload-wrapper">
    <form enctype="multipart/form-data" novalidate>
      <div class="dropbox">
        <label
          :class="{
            button: true,
            'is-primary': isPrimary,
          }">
          {{ label }}
          <input
            type="file"
            ref="uploadInput"
            :accept="accept"
            :name="uploadFieldName"
            :disabled="isSaving"
            @change="filesChange($event.target.name, $event.target.files)"
            class="visuallyhidden"
            :multiple="multiple"
          >
        </label>
        <span class="file-upload-status" v-if="this.uploadedFiles.length > 1">
          {{this.uploadedFiles.length}} {{ $tc('main.files_selected') }}
        </span>
        <span class="file-upload-status"
          v-if="this.uploadedFiles.length === 1"
        >
          {{this.uploadedFiles[0]}}
        </span>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'file-upload',
  props: {
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
    }
  },
  data () {
    return {
      isInitial: true,
      isSaving: false,
      uploadedFiles: []
    }
  },
  computed: {},
  watch: {},
  methods: {
    filesChange (name, files) {
      const forms = []
      for (let i = 0, numFiles = files.length; i < numFiles; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append(this.uploadFieldName, file, file.name)
        forms.push(formData)
        this.uploadedFiles.push(file.name)
      }
      if (this.multiple) {
        this.$emit('fileselected', forms)
      } else {
        this.$emit('fileselected', forms[0])
      }
    },
    reset () {
      this.isSaving = false
      this.isInitial = true
      this.uploadedFiles = []
      this.$refs.uploadInput.value = ''
    }
  },
  mounted () {
    this.reset()
  }
}
</script>

<style lang="scss" scoped>
.file-upload-wrapper {}
.dropbox {
  display: flex;
  align-items: center;
}
.file-upload-status {
  margin-left: .5rem;
  font-style: italic;
}
</style>
