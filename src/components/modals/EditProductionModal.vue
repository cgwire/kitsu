<template>
  <div
    class="modal"
    :class="{
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('productions.edit_title') }} {{ productionToEdit.name }}
        </h1>

        <form @submit.prevent>
          <text-field
            :label="$t('productions.fields.name')"
            @enter="runConfirmation"
            v-model="form.name"
            v-focus
          />
          <text-field
            :label="$t('productions.fields.code')"
            @enter="runConfirmation"
            v-model="form.code"
          />
          <combobox-styled
            class="field"
            :label="$t('productions.fields.status')"
            locale-key-prefix="productions.status."
            :options="productionStatusOptions"
            v-model="form.project_status_id"
          />
          <combobox-styled
            class="field"
            :label="$t('productions.fields.type')"
            locale-key-prefix="productions.type."
            :options="productionTypeOptions"
            v-model="form.production_type"
          />
          <combobox-styled
            class="field"
            :label="$t('productions.fields.style')"
            locale-key-prefix="productions.style."
            :options="productionStyleOptions"
            v-model="form.production_style"
          />
          <text-field
            :label="$t('productions.fields.fps')"
            type="number"
            :max="60"
            :step="0.001"
            @enter="runConfirmation"
            v-model="form.fps"
          />
          <text-field
            :label="$t('productions.fields.ratio')"
            @enter="runConfirmation"
            v-model="form.ratio"
          />
          <text-field
            :label="$t('productions.fields.resolution')"
            @enter="runConfirmation"
            v-model="form.resolution"
          />
          <div>
            <label class="label">{{ $t('productions.picture') }}</label>
            <file-upload
              :label="$t('main.csv.upload_file')"
              accept=".png,.jpg,.jpeg"
              @fileselected="onFileSelected"
            />
          </div>
        </form>

        <modal-footer
          :error-text="$t('productions.edit_error')"
          :is-error="isError"
          :is-loading="isLoading"
          @confirm="runConfirmation"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import FileUpload from '@/components/widgets/FileUpload.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

import {
  PRODUCTION_STYLE_OPTIONS,
  PRODUCTION_TYPE_OPTIONS
} from '@/lib/productions'

export default {
  name: 'edit-production-modal',

  mixins: [modalMixin],

  components: {
    ComboboxStyled,
    FileUpload,
    ModalFooter,
    TextField
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    productionToEdit: {
      type: Object,
      required: true
    }
  },

  emits: ['cancel', 'confirm', 'fileselected'],

  data() {
    return {
      form: {},
      formData: null,
      productionStyleOptions: PRODUCTION_STYLE_OPTIONS,
      productionTypeOptions: PRODUCTION_TYPE_OPTIONS
    }
  },

  computed: {
    ...mapGetters(['productionStatusOptions'])
  },

  methods: {
    runConfirmation() {
      this.$emit('confirm', this.form)
    },

    onFileSelected(formData) {
      this.formData = formData
      this.$emit('fileselected', formData)
    },

    resetForm() {
      this.form = {
        name: this.productionToEdit.name,
        code: this.productionToEdit.code,
        project_status_id: this.productionToEdit.project_status_id,
        production_type: this.productionToEdit.production_type || 'short',
        production_style: this.productionToEdit.production_style || '2d3d',
        fps: this.productionToEdit.fps,
        ratio: this.productionToEdit.ratio,
        resolution: this.productionToEdit.resolution
      }
    }
  },

  watch: {
    productionToEdit: {
      immediate: true,
      handler() {
        this.resetForm()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  padding-bottom: 1.5em;
}
</style>
