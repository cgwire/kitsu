<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <h1 class="title" v-if="isEditing">
          {{ $t('backgrounds.edit_background') }} {{ backgroundToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('backgrounds.new_background') }}
        </h1>

        <form @submit.prevent>
          <div class="field" v-if="!isEditing">
            <label class="label"> {{ $t('backgrounds.fields.file') }}</label>
            <file-upload
              ref="fileUpload"
              :label="$t('main.select_file')"
              accept=".hdr"
              :is-primary="false"
              @fileselected="onFileSelected"
            />
          </div>
          <text-field
            ref="nameField"
            input-class="task-status-name"
            :label="$t('backgrounds.fields.name')"
            :maxlength="40"
            @enter="confirmClicked"
            v-model.trim="form.name"
          />
          <boolean-field
            is-field
            :label="$t('backgrounds.fields.is_default')"
            @enter="confirmClicked"
            v-model="form.is_default"
          />
          <combobox-boolean
            :label="$t('main.archived')"
            @enter="confirmClicked"
            v-model="form.archived"
            v-if="isEditing"
          />
        </form>

        <modal-footer
          :error-text="$t('backgrounds.create_error')"
          :is-error="isError"
          :is-loading="isLoading"
          @confirm="confirmClicked"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'

import BooleanField from '@/components/widgets/BooleanField.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import FileUpload from '@/components/widgets/FileUpload.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'edit-background-modal',

  mixins: [modalMixin],

  components: {
    BooleanField,
    ComboboxBoolean,
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
    backgroundToEdit: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        file: null,
        name: '',
        is_default: 'false',
        archived: 'false'
      }
    }
  },

  computed: {
    isEditing() {
      return this.backgroundToEdit?.id
    }
  },

  methods: {
    confirmClicked() {
      if (!this.isEditing && !this.form.file) {
        return
      }
      if (!this.form.name) {
        this.$refs.nameField.focus()
        return
      }
      this.$emit('confirm', {
        ...this.form,
        is_default: this.form.is_default === 'true',
        archived: this.form.archived === 'true'
      })
    },

    onFileSelected(formData) {
      const file = formData.get('file')
      this.form.file = formData
      if (!this.form.name.length) {
        this.form.name = file.name.slice(0, -4)
      }
      this.$nextTick(() => {
        this.$refs.nameField.focus()
      })
    },

    resetForm() {
      if (this.backgroundToEdit) {
        this.form = {
          file: null,
          name: this.backgroundToEdit.name || '',
          is_default: String(this.backgroundToEdit.is_default || false),
          archived: String(this.backgroundToEdit.archived || false)
        }
        this.$refs.fileUpload?.reset()
      }
    }
  },

  watch: {
    backgroundToEdit() {
      this.resetForm()
    },

    active() {
      if (this.active) {
        this.resetForm()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}
</style>
