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
        <h1 class="title" v-if="sequenceToEdit && sequenceToEdit.id">
          {{ $t('sequences.edit_title') }} {{ sequenceToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('sequences.new_sequence') }}
        </h1>

        <form @submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('sequences.fields.name')"
            v-model.trim="form.name"
            @enter="runConfirmation"
            v-focus
          />
          <text-field
            ref="resolutionField"
            :label="$t('shots.fields.resolution')"
            v-model="form.data.resolution"
            @enter="runConfirmation"
          />
          <textarea-field
            ref="descriptionField"
            :label="$t('sequences.fields.description')"
            @keyup.ctrl.enter="runConfirmation"
            @keyup.meta.enter="runConfirmation"
            v-model="form.description"
          />
          <template v-if="sequenceToEdit">
            <metadata-field
              :key="descriptor.id"
              :descriptor="descriptor"
              :entity="sequenceToEdit"
              @enter="runConfirmation"
              v-model="form.data[descriptor.field_name]"
              v-for="descriptor in sequenceMetadataDescriptors"
            />
          </template>
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
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import MetadataField from '@/components/widgets/MetadataField.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

export default {
  name: 'edit-sequence-modal',

  mixins: [modalMixin],

  components: {
    MetadataField,
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

  emits: ['cancel', 'confirm'],

  data() {
    if (this.sequenceToEdit && this.sequenceToEdit.id) {
      return {
        form: {
          id: this.sequenceToEdit.id,
          name: this.sequenceToEdit.name,
          description: this.sequenceToEdit.description,
          production_id: this.sequenceToEdit.project_id,
          data:
            {
              ...this.sequenceToEdit.data,
              resolution: this.sequenceToEdit.data.resolution || ''
            } || {}
        },
        sequenceSuccessText: ''
      }
    } else {
      return {
        form: {
          id: '',
          name: '',
          description: '',
          data: {
            resolution: ''
          }
        },
        sequenceSuccessText: ''
      }
    }
  },

  computed: {
    ...mapGetters(['sequenceMetadataDescriptors'])
  },

  methods: {
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
        this.form.data = {
          resolution: ''
        }
      } else {
        this.form = {
          id: this.sequenceToEdit.id,
          name: this.sequenceToEdit.name,
          description: this.sequenceToEdit.description,
          data:
            {
              ...this.sequenceToEdit.data,
              resolution: this.sequenceToEdit.data.resolution || ''
            } || {}
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
