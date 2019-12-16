<template>
  <div class="file-upload-wrapper">
    <form enctype="multipart/form-data" novalidate>
      <div class="dropbox">
        <input
          type="file"
          ref="uploadInput"
          :accept="accept"
          :name="uploadFieldName"
          :disabled="isSaving"
          @change="filesChange($event.target.name, $event.target.files)"
          class="input-file"
          :multiple="multiple"
        >
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'file-upload',
  props: {
    uploadFieldName: {
      default: 'file',
      type: String
    },
    accept: {
      default: '.csv',
      type: String
    },
    multiple: {
      default: false,
      type: Boolean
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
</style>
