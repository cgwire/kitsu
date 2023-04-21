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
          {{ $t('main.edl.select_file') }}
        </p>
        <file-upload
          @fileselected="onFileSelected"
          :label="$t('main.edl.upload_file')"
          accept=".edl"
          ref="inputFile"
        />

        <br />
        <text-field
          ref="nomenclatureField"
          :label="$t('main.edl.nomenclature')"
          v-model="form.nomenclature"
          @enter="onConfirmClicked"
          v-focus
        />

        <checkbox
          :toggle="true"
          :label="$t('main.edl.match_case')"
          v-model="form.match_case"
        />

        <modal-footer
          :confirm-label="$t('main.edl.upload_edl')"
          :error-text="$t('main.edl.error_upload')"
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
import FileUpload from '@/components/widgets/FileUpload.vue'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'
import Checkbox from '@/components/widgets/Checkbox'

export default {
  name: 'import-edl-modal',
  mixins: [modalMixin],
  components: {
    FileUpload,
    ModalFooter,
    TextField,
    Checkbox
  },

  data() {
    return {
      form: {
        nomenclature: '${project_name}_${sequence_name}-${shot_name}',
        match_case: true
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
    }
  },

  mounted() {
    this.formData = null
    if (this.isTVShow)
      this.form.nomenclature =
        '${project_name}_${episode_name}-${sequence_name}-${shot_name}'
  },

  computed: {
    ...mapGetters(['isTVShow'])
  },

  methods: {
    onFileSelected(formData) {
      this.formData = formData
    },

    onConfirmClicked() {
      this.$emit(
        'confirm',
        this.formData.get('file'),
        this.form.nomenclature,
        this.form.match_case
      )
    },

    reset() {
      this.$refs.inputFile.reset()
    }
  },

  watch: {
    active() {
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
