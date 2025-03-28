<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box content">
        <h1 class="title">
          {{ $t('main.edl.import_title') }}
        </h1>

        <p>
          {{ $t('main.edl.explanation') }}
        </p>

        <p>
          {{ $t('main.edl.select_file') }}
        </p>
        <file-upload
          @fileselected="onFileSelected"
          :label="$t('main.edl.upload_file')"
          accept=".edl, .xml, .otio, .fcpxml"
          ref="inputFile"
        />

        <br />
        <text-field
          ref="namingConventionField"
          :label="$t('main.edl.naming_convention')"
          v-model="form.namingConvention"
          @enter="onConfirmClicked"
          v-focus
        />

        <checkbox
          :toggle="true"
          :label="$t('main.edl.match_case')"
          v-model="form.matchCase"
        />

        <modal-footer
          :confirm-label="$t('main.edl.upload_edl')"
          :error-text="errorText"
          :is-loading="isLoading"
          :is-disabled="formData === null"
          :is-error="isError"
          @confirm="onConfirmClicked"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import Checkbox from '@/components/widgets/Checkbox.vue'
import FileUpload from '@/components/widgets/FileUpload.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'import-edl-modal',

  mixins: [modalMixin],

  components: {
    Checkbox,
    FileUpload,
    ModalFooter,
    TextField
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        namingConvention: '${project_name}_${sequence_name}-${shot_name}',
        matchCase: true
      },
      formData: null
    }
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
    importError: {
      type: Error,
      default: null
    }
  },

  mounted() {
    this.formData = null
    if (this.isTVShow)
      this.form.namingConvention =
        '${project_name}_${episode_name}-${sequence_name}-${shot_name}'
  },

  computed: {
    ...mapGetters(['currentProduction', 'isTVShow']),

    errorText() {
      let text = this.$t('main.edl.error_upload')
      if (this.importError && this.importError.status === 400) {
        const res = this.importError.response
        text += ` ${res.body.message}`
      }
      return text
    }
  },

  methods: {
    onFileSelected(formData) {
      this.formData = formData
    },

    onConfirmClicked() {
      this.$emit(
        'confirm',
        this.formData.get('file'),
        this.form.namingConvention,
        this.form.matchCase
      )
    },

    reset() {
      this.$refs.inputFile.reset()
    }
  },

  watch: {
    currentProduction() {
      if (this.isTVShow)
        this.form.namingConvention =
          '${project_name}_${episode_name}-${sequence_name}-${shot_name}'
      else
        this.form.namingConvention =
          '${project_name}_${sequence_name}-${shot_name}'
    },

    active() {
      this.formData = null
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
</style>
