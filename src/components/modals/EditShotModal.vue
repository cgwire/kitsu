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
        <h1 class="title" v-if="shotToEdit && this.shotToEdit.id">
          {{ $t('shots.edit_title') }} {{ shotToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('shots.new_shot') }}
        </h1>

        <form v-on:submit.prevent>
          <combobox
            :label="$t('shots.fields.sequence')"
            :options="sequenceOptions"
            v-model="form.sequence_id"
          />
          <text-field
            ref="nameField"
            :label="$t('shots.fields.name')"
            v-model="form.name"
            @enter="runConfirmation"
            v-focus
          />
          <textarea-field
            ref="descriptionField"
            :label="$t('shots.fields.description')"
            v-model="form.description"
            @keyup.ctrl.enter="runConfirmation"
            @keyup.meta.enter="runConfirmation"
          />
          <text-field
            ref="nbFramesField"
            :label="$t('shots.fields.nb_frames')"
            type="number"
            v-model="form.nb_frames"
            @enter="runConfirmation"
            v-focus
          />
          <text-field
            ref="frameInField"
            :label="$t('shots.fields.frame_in')"
            v-model="form.frameIn"
            type="number"
          />
          <text-field
            ref="frameOutField"
            :label="$t('shots.fields.frame_out')"
            v-model="form.frameOut"
            type="number"
            @enter="runConfirmation"
          />
          <text-field
            ref="fpsField"
            :label="$t('shots.fields.fps')"
            v-model="form.fps"
            type="number"
            @enter="runConfirmation"
          />
          <text-field
            ref="resolutionField"
            :label="$t('shots.fields.resolution')"
            v-model="form.resolution"
            @enter="runConfirmation"
          />
          <text-field
            ref="maxRetakesField"
            type="number"
            :label="$t('shots.fields.max_retakes')"
            v-model="form.max_retakes"
            @enter="runConfirmation"
          />

          <div
            :key="descriptor.id"
            v-for="descriptor in shotMetadataDescriptors"
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
                    getMetadataChecklistValues(descriptor, shotToEdit)[
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
          :error-text="$t('shots.edit_fail')"
          :is-loading="isLoading"
          :is-error="isError"
          @confirm="confirmClicked"
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
import { formatListMixin } from '@/components/mixins/format'

import Combobox from '@/components/widgets/Combobox'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'
import TextareaField from '@/components/widgets/TextareaField'

export default {
  name: 'edit-shot-modal',
  mixins: [descriptorMixin, entityListMixin, formatListMixin, modalMixin],

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
    shotToEdit: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      form: {
        data: {}
      },
      shotSuccessText: ''
    }
  },

  mounted() {
    this.resetForm()
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'isCurrentUserManager',
      'openProductions',
      'sequenceOptions',
      'sequences',
      'shots',
      'shotCreated',
      'shotMetadataDescriptors'
    ]),

    frameIn() {
      return this.shotToEdit.data ? this.shotToEdit.data.frame_in : ''
    },

    frameOut() {
      return this.shotToEdit.data ? this.shotToEdit.data.frame_out : ''
    },

    fps() {
      return this.shotToEdit.data ? this.shotToEdit.data.fps : ''
    },

    resolution() {
      return this.shotToEdit.data ? this.shotToEdit.data.resolution : ''
    },

    maxRetakes() {
      return this.shotToEdit.data
        ? parseInt(this.shotToEdit.data.max_retakes)
        : ''
    }
  },

  methods: {
    ...mapActions(['loadSequences']),

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

    runConfirmation() {
      if (this.isEditing()) {
        this.confirmClicked()
      } else {
        this.confirmAndStayClicked()
      }
    },

    confirmAndStayClicked() {
      this.$emit('confirmAndStay', this.form)
    },

    confirmClicked() {
      this.$emit('confirm', this.form)
    },

    getDescriptorChoicesOptions(descriptor) {
      const values = descriptor.choices.map(c => ({ label: c, value: c }))
      return [{ label: '', value: '' }, ...values]
    },

    isEditing() {
      return this.shotToEdit && this.shotToEdit.id
    },

    resetForm() {
      this.shotSuccessText = ''
      if (!this.isEditing()) {
        if (this.openProductions.length > 0) {
          this.form.project_id = this.currentProduction
            ? this.currentProduction.id
            : ''
        }
        if (this.sequences.length > 0) {
          this.form.sequence_id = this.sequences[0].id
        }
        this.form.name = ''
        this.form.description = ''
        this.form.nb_frames = 0
        this.form.data = {}
      } else {
        this.form = {
          sequence_id: this.shotToEdit.sequence_id,
          project_id: this.shotToEdit.project_id,
          name: this.shotToEdit.name,
          description: this.shotToEdit.description,
          nb_frames: this.shotToEdit.nb_frames,
          frameIn: this.frameIn,
          frameOut: this.frameOut,
          fps: this.fps,
          max_retakes: this.maxRetakes,
          resolution: this.resolution,
          data: { ...this.shotToEdit.data } || {}
        }
      }
    }
  },

  watch: {
    active() {
      this.shotSuccessText = ''
      this.resetForm()
      if (this.sequences.length === 0) {
        this.loadSequences()
      }
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    'form.frameIn'() {
      const frameIn = this.sanitizeInteger(this.form.frameIn)
      const frameOut = this.sanitizeInteger(this.form.frameOut)
      if (frameIn && frameOut && frameOut > frameIn) {
        this.form.nb_frames = frameOut - frameIn + 1
      }
    },

    'form.frameOut'() {
      const frameIn = this.sanitizeInteger(this.form.frameIn)
      const frameOut = this.sanitizeInteger(this.form.frameOut)
      if (frameIn && frameOut && frameOut > frameIn) {
        this.form.nb_frames = frameOut - frameIn + 1
      }
    },

    shotToEdit() {
      this.resetForm()
    },

    shotCreated() {
      if (this.isEditing()) {
        this.shotSuccessText = this.$t('shots.edit_success', {
          name: this.shotCreated
        })
      } else {
        this.shotSuccessText = this.$t('shots.new_success', {
          name: this.shotCreated
        })
      }
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
.title {
  border-bottom: 2px solid #ddd;
  padding-bottom: 0.5em;
  margin-bottom: 1.2em;
}
.info-message {
  margin-top: 1em;
}

.modal-content {
  max-height: 80%;
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
