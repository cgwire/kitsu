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
        <h1 class="title" v-if="sequenceToEdit && this.sequenceToEdit.id">
          {{ $t('sequences.edit_title') }} {{ sequenceToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('sequences.new_sequence') }}
        </h1>

        <form v-on:submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('sequences.fields.name')"
            v-model="form.name"
            @enter="runConfirmation"
            v-focus
          />
          <textarea-field
            ref="descriptionField"
            :label="$t('sequences.fields.description')"
            @keyup.ctrl.enter="runConfirmation"
            @keyup.meta.enter="runConfirmation"
            v-model="form.description"
          />

          <div
            :key="descriptor.id"
            v-for="descriptor in sequenceMetadataDescriptors"
          >
            <combobox
              v-if="descriptor.choices.length > 0"
              :label="descriptor.name"
              :options="getDescriptorChoicesOptions(descriptor)"
              v-model="form.data[descriptor.field_name]"
            />
            <text-field
              :label="descriptor.name"
              @enter="runConfirmation"
              v-model="form.data[descriptor.field_name]"
              v-else
            />
          </div>
        </form>

        <modal-footer
          :error-text="$t('sequences.edit_error')"
          :is-loading="isLoading"
          :is-error="isError"
          @confirm="runConfirmation"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'
import Combobox from '@/components/widgets/Combobox'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'
import TextareaField from '@/components/widgets/TextareaField'

export default {
  name: 'edit-sequence-modal',
  mixins: [modalMixin],
  components: {
    Combobox,
    ModalFooter,
    TextField,
    TextareaField
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
    sequenceToEdit: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    if (this.sequenceToEdit && this.sequenceToEdit.id) {
      return {
        form: {
          id: this.sequenceToEdit.id,
          name: this.sequenceToEdit.name,
          description: this.sequenceToEdit.description,
          production_id: this.sequenceToEdit.project_id,
          data: this.sequenceToEdit.data || {}
        },
        sequenceSuccessText: ''
      }
    } else {
      return {
        form: {
          id: '',
          name: '',
          description: '',
          data: {}
        },
        sequenceSuccessText: ''
      }
    }
  },

  computed: {
    ...mapGetters(['currentProduction', 'sequenceMetadataDescriptors'])
  },

  methods: {
    ...mapActions([]),

    getDescriptorChoicesOptions(descriptor) {
      const values = descriptor.choices.map(c => ({ label: c, value: c }))
      return [{ label: '', value: '' }, ...values]
    },

    runConfirmation() {
      this.confirmClicked()
    },

    confirmClicked() {
      this.$emit('confirm', this.form)
    },

    isEditing() {
      return this.sequenceToEdit && this.sequenceToEdit.id
    },

    resetForm() {
      this.sequenceSuccessText = ''
      if (!this.isEditing()) {
        this.form.id = null
        this.form.name = ''
        this.form.description = ''
      } else {
        this.form = {
          id: this.sequenceToEdit.id,
          name: this.sequenceToEdit.name,
          description: this.sequenceToEdit.description,
          data: this.sequenceToEdit.data || {}
        }
      }
    }
  },

  mounted() {
    if (this.active) {
      this.resetForm()
    }
  },

  watch: {
    active() {
      this.resetForm()
    },

    sequenceToEdit() {
      this.resetForm()
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}
.is-danger {
  color: #ff3860;
  font-style: italic;
}
.info-message {
  margin-top: 1em;
}
</style>
