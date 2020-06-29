<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">

    <div class="box content">
      <h1 class="title">
        {{ title }}
      </h1>

      <p>
        {{ $t("main.csv.select_file") }}
      </p>

      <file-upload
        ref="uploadAvatarField"
        :label="$t('main.csv.upload_file')"
        @fileselected="onFileSelected"
        accept=".png,.jpg,.jpeg"
      />

      <p class="error" v-if="isError">
        {{ $t("profile.avatar.error_upload") }}
      </p>

      <modal-footer
        :error-text="$t('productions.metadata.error')"
        :is-loading="isLoading"
        :is-disabled="!formData"
        @confirm="onConfirmClicked"
        @cancel="$emit('cancel')"
      />

    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import FileUpload from '../widgets/FileUpload.vue'
import ModalFooter from './ModalFooter.vue'

export default {
  name: 'change-avatar-modal',
  mixins: [modalMixin],

  components: {
    FileUpload,
    ModalFooter
  },

  props: [
    'active',
    'cancelRoute',
    'isLoading',
    'isError',
    'title'
  ],

  data () {
    return {
      formData: null
    }
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {

    ...mapActions([
    ]),

    onFileSelected (formData) {
      this.formData = formData
      this.$emit('fileselected', formData)
    },

    onConfirmClicked () {
      this.$emit('confirm', this.formData)
    }
  },
  watch: {
    active () {
      this.formData = null
      this.$refs.uploadAvatarField.reset()
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
