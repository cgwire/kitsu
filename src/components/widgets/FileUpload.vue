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
          class="input-file">
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
    filesChange (name, fileList) {
      const formData = new FormData()
      formData.append(this.uploadFieldName, fileList[0], fileList[0].name)
      this.$emit('fileselected', formData)
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
