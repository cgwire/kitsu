<template>
<div
  id="add-comment-modal"
  :class="{
    'modal': true,
    'is-active': active
  }"
>
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box content">
      <h2 class="subtitle">{{ title }}</h2>
      <h1 class="title" v-if="isEditing">
        {{ $t("tasks.change_preview") }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("tasks.add_preview") }}
      </h1>

      <p>
        {{ $t("tasks.select_preview_file") }}
      </p>

      <file-upload
        ref="preview-field"
        :accept="extensions"
        :multiple="true"
        :label="'Select files from your hard drive'"
        :is-primary="false"
        @fileselected="onFileSelected"
        hide-file-names
      />

      <p class="error" v-if="isError">
        {{ $t("tasks.add_preview_error") }}
      </p>

      <h3 class="subtitle has-text-centered" v-if="forms.length > 0">
        Selected Files
      </h3>
      <p class="upload-previews mt2" v-if="forms.length > 0">
        <template v-for="(form, i) in forms">
          <p class="preview-name" :key="'name-' + i" >
            {{ form.get('file').name }}
            <span @click="removePreview(form)">x</span>
          </p>
          <img
            alt="uploaded file"
            :src="getURL(form)"
            :key="i"
            v-if="isImage(form)"
          >
          <video
            preload="auto"
            class="is-fullwidth"
            autoplay
            controls
            loop
            muted
            :src="getURL(form)"
            :key="i"
            v-else-if="isVideo(form)"
          />
          <iframe
            class="is-fullwidth"
            frameborder="0"
            :src="getURL(form)"
            :key="i"
            v-else-if="isPdf(form)"
          />
          <hr :key="'separator-' + i"/>
        </template>
      </p>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading,
            'is-disabled': forms.length === 0
          }"
          @click="$emit('confirm')">
          {{ $t("tasks.add_revision_confirm") }}
        </a>
        <button
          @click="$emit('cancel')"
          class="button is-link">
          {{ $t("main.cancel") }}
        </button>
      </p>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import files from '@/lib/files'
import FileUpload from '@/components/widgets/FileUpload.vue'

export default {
  name: 'add-preview-modal',
  mixins: [modalMixin],

  components: {
    FileUpload
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    extensions: {
      type: String,
      default: files.ALL_EXTENSIONS_STRING
    },
    title: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      forms: []
    }
  },

  computed: {
    ...mapGetters([
    ]),

    previewField () {
      return this.$refs['preview-field']
    }
  },

  methods: {
    ...mapActions([
    ]),

    onFileSelected (forms) {
      this.forms = this.forms.concat(forms)
      this.$emit('fileselected', this.forms)
    },

    reset () {
      this.previewField.reset()
      this.forms = []
    },

    onPaste (event) {
      if (this.active && event.clipboardData.files) {
        this.previewField.filesChange('', event.clipboardData.files)
      }
    },

    getURL (form) {
      return window.URL.createObjectURL(form.get('file'))
    },

    isImage (form) {
      return form.get('file').type.startsWith('image')
    },

    isVideo (form) {
      return form.get('file').type.startsWith('video')
    },

    isPdf (form) {
      return form.get('file').type.indexOf('pdf') > 0
    },

    removePreview (form) {
      this.forms = this.forms.filter(f => f !== form)
    }
  },

  watch: {
    active () {
      this.reset()
    }
  },

  mounted () {
    this.forms = []
    window.addEventListener('paste', this.onPaste, false)
  },

  beforeDestroy () {
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
}

.subtitle {
  color: $grey;
  font-size: 1.2em;
  margin: 0;
  margin-bottom: 1em;
  padding: 0;
  text-transform: uppercase;
}

h1.title {
  font-weight: 350;
  line-height: 1.2em;
}

h3 {
  font-weight: 350;
  font-size: 1.4em;
  margin-top: 0.5em;
  padding: 0;
}

h3.subtitle {
  margin-top: 2em;
  font-weight: 400;
}

.preview-name span {
  cursor: pointer;
  float: right;
}
</style>
