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
            <div
              class="field"
              v-if="
                descriptor.data_type === 'checklist' &&
                getDescriptorChecklistValues(descriptor).length
              "
              :key="`${descriptor.id}-checklist-wrapper`"
            >
              <label class="label" :key="`${descriptor.id}-${descriptor.name}`">
                {{ descriptor.name }}</label
              >
              <div
                class="checkbox-wrapper"
                v-for="(option, i) in getDescriptorChecklistValues(descriptor)"
                :key="`${descriptor.id}-${i}-${option.text}-wrapper`"
              >
                <input
                  type="checkbox"
                  @change="
                    event =>
                      onMetadataCheckboxChanged(descriptor, option.text, event)
                  "
                  :id="`${descriptor.id}-${i}-${option.text}-checkbox`"
                  :checked="
                    getMetadataChecklistValues(descriptor, sequenceToEdit)[
                      option.text
                    ]
                  "
                  :disabled="
                    !(
                      isCurrentUserManager ||
                      isSupervisorInDepartments(descriptor.departments)
                    )
                  "
                  :style="[
                    isCurrentUserManager ||
                    isSupervisorInDepartments(descriptor.departments)
                      ? { cursor: 'pointer' }
                      : { cursor: 'auto' }
                  ]"
                />
                <label
                  class="checkbox-label"
                  :for="`${descriptor.id}-${i}-${option.text}-checkbox`"
                  :style="[
                    isCurrentUserManager ||
                    isSupervisorInDepartments(descriptor.departments)
                      ? { cursor: 'pointer' }
                      : { cursor: 'auto' }
                  ]"
                >
                  <span>{{ option.text }}</span>
                </label>
              </div>
            </div>
            <combobox
              v-else-if="descriptor.data_type === 'list'"
              :label="descriptor.name"
              :options="getDescriptorChoicesOptions(descriptor)"
              v-model="form.data[descriptor.field_name]"
            />
            <combobox-boolean
              :label="descriptor.name"
              @enter="runConfirmation"
              v-model="form.data[descriptor.field_name]"
              v-else-if="descriptor.data_type === 'boolean'"
            />
            <text-field
              :label="descriptor.name"
              :type="descriptor.data_type"
              v-model="form.data[descriptor.field_name]"
              @enter="runConfirmation"
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
import { descriptorMixin } from '@/components/mixins/descriptors'
import { entityListMixin } from '@/components/mixins/entity_list'

import Combobox from '@/components/widgets/Combobox'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'
import TextareaField from '@/components/widgets/TextareaField'

export default {
  name: 'edit-sequence-modal',
  mixins: [descriptorMixin, entityListMixin, modalMixin],

  components: {
    Combobox,
    ComboboxBoolean,
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
    ...mapGetters([
      'currentProduction',
      'isCurrentUserManager',
      'sequenceMetadataDescriptors'
    ])
  },

  methods: {
    ...mapActions([]),

    onMetadataCheckboxChanged(descriptor, option, event) {
      let values
      try {
        values = JSON.parse(this.form.data[descriptor.field_name])
      } catch {
        values = {}
      }
      values[option] = event.target.checked
      this.form.data[descriptor.field_name] = JSON.stringify(values)
    },

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

.checkbox-wrapper {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.checkbox-label {
  display: inline-flex;
  position: relative;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  white-space: normal;
  cursor: pointer;
}
</style>
