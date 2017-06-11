<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <h1 class="title">
        {{ $t("people.csv.import_title") }}
      </h1>
      <p class="description">
        Your CSV file requires the following columns:
        {{ $t("people.csv.required_fields") }}
      </p>

      <form>
        <p>
          <file-upload
            class="upload-button button is-primary"
            title="Upload .csv file"
            extensions=".csv"
            :events="events"
            ref="upload"
            post-action="/api/data/import/csv/persons">
          </file-upload>
        </p>
        <p>
          {{ this.fileName }}
        </p>
      </form>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="uploadFile">
          {{ $t("main.confirmation") }}
        </a>
        <router-link
          :to="cancelRoute"
          class="button is-link">
          {{ $t("main.cancel") }}
        </router-link>
      </p>
    </div>
  </div>
  <button class="modal-close"></button>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import FileUpload from 'vue-upload-component'

export default {
  name: 'import-people-modal',
  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'errorText'
  ],
  watch: {
  },
  data () {
    return {
      fileName: 'test',
      file: {},
      events: {
        add: this.add,
        progress (file, component) {
          console.log('progress ' + file.progress)
        },
        after (file, component) {
          console.log('after')
        },
        before (file, component) {
          console.log('before')
        }
      }
    }
  },
  components: {
    FileUpload
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    add (file, component) {
      console.log('add')
      component.active = true
      if (this.$parent.auto) {
      }
      file.headers['X-Filename'] = encodeURIComponent(file.name)
      file.data.filename = file.name
      file.postAction = '/api/data/import/csv/persons'

      this.fileName = file.name
      this.file = file
      console.log(component)
      component.files.push(file)
      component.addFileUpload(file)
      component._fileUploads()
    },
    uploadFile () {
      console.log(this.upload)
      this.file.active = true
      this.upload.active = true
      console.log(this.upload)
    }
  },
  mounted () {
    this.upload = this.$refs.upload.$data
  }
}
</script>

<style scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}

.is-danger {
  color: #ff3860;
  font-style: italic;
}

.title {
  border-bottom: 2px solid #DDD;
  padding-bottom: 0.5em;
  margin-bottom: 1.2em;
}

.description {
  margin-bottom: 1em;
}

.upload-button {
  padding-top: 0.3em;
}

form {
  margin-bottom: 2em;
}
</style>
