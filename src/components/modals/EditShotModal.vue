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
        <h1 class="title" v-if="shotToEdit && shotToEdit.id">
          {{ $t('shots.edit_title') }} {{ shotToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('shots.new_shot') }}
        </h1>

        <form @submit.prevent>
          <combobox
            :label="$t('shots.fields.sequence')"
            :options="sequenceOptions"
            v-model="form.sequence_id"
          />
          <text-field
            ref="nameField"
            :label="$t('shots.fields.name')"
            v-model.trim="form.name"
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
            v-if="!isPaperProduction"
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
            type="number"
            :max="1000"
            :step="0.001"
            v-model="form.fps"
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

          <template v-if="shotToEdit">
            <metadata-field
              :key="descriptor.id"
              :descriptor="descriptor"
              :entity="shotToEdit"
              @enter="runConfirmation"
              v-model="form.data[descriptor.field_name]"
              v-for="descriptor in shotMetadataDescriptors"
            />
          </template>
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
import { formatListMixin } from '@/components/mixins/format'

import Combobox from '@/components/widgets/Combobox.vue'
import MetadataField from '@/components/widgets/MetadataField.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

export default {
  name: 'edit-shot-modal',

  mixins: [formatListMixin, modalMixin],

  components: {
    Combobox,
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
    shotToEdit: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm', 'confirm-and-stay'],

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
      'isPaperProduction',
      'openProductions',
      'sequenceOptions',
      'sequences',
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
      return parseInt(this.shotToEdit.data?.max_retakes) || ''
    }
  },

  methods: {
    ...mapActions(['loadSequences']),

    runConfirmation() {
      if (this.isEditing()) {
        this.confirmClicked()
      } else {
        this.confirmAndStayClicked()
      }
    },

    confirmAndStayClicked() {
      this.$emit('confirm-and-stay', this.form)
    },

    confirmClicked() {
      this.$emit('confirm', this.form)
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
</style>
