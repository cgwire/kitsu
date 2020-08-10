<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box content">
      <h1 class="title">
        {{ $t("tasks.comment_image") }}
      </h1>

      <p>
        {{ $t("tasks.select_image_file") }}
      </p>

      <file-upload
        ref="image-field"
        :label="$t('main.csv.upload_file')"
        :accept="extensions"
        @fileselected="onFileSelected"
        :multiple="true"
      />

      <p class="error" v-if="isError">
        {{ $t("tasks.add_preview_error") }}
      </p>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading,
            'is-disabled': forms == undefined
          }"
          @click="confirm()">
          {{ $t("main.confirmation") }}
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
import { modalMixin } from './base_modal'
import FileUpload from '../widgets/FileUpload.vue'

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
      default:
        '.png,.jpg,.mp4,.mov,.obj,.pdf,.ma,.mb,.zip,.rar,.jpeg,' +
        '.blend,.wmv,.m4v,.ai,.comp,.exr,.psd,.hip,.gif,.ae,.fla,.flv,.swf'
    }
  },

  data () {
    return {
      forms: null
    }
  },

  mounted () {
    this.forms = null
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ]),

    onFileSelected (forms) {
      this.forms = forms
    },

    confirm () {
      this.$emit('confirm', this.forms)
    },

    reset () {
      this.$refs['image-field'].reset()
      this.forms = null
    }
  },

  watch: {
    active () {
      this.reset()
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}

.error {
  margin-top: 1em;
}

.description {
  margin-bottom: 1em;
}
</style>
