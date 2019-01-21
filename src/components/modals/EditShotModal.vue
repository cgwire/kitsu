<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">

      <h1 class="title" v-if="shotToEdit && this.shotToEdit.id">
        {{ $t("shots.edit_title") }} {{ shotToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("shots.new_shot") }}
      </h1>

      <form v-on:submit.prevent>
        <combobox
          :label="$t('shots.fields.sequence')"
          :options="getSequenceOptions"
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
          @enter="runConfirmation"
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
        <div
          :key="descriptor.id"
          v-for="descriptor in shotMetadataDescriptors"
        >
          <combobox
            v-if="descriptor.choices.length > 0"
            :label="descriptor.name"
            :options="getDescriptorChoicesOptions(descriptor)"
            v-model="form.data[descriptor.field_name]"
          />
          <text-field
            :label="descriptor.name"
            v-model="form.data[descriptor.field_name]"
            @enter="runConfirmation"
            v-else
          />
        </div>
      </form>

      <div class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoading
          }"
          @click="confirmClicked"
        >
          {{ $t("main.confirmation") }}
        </a>
        <router-link
          :to="cancelRoute"
          class="button is-link"
          v-if="cancelRoute"
        >
          {{ $t("main.close") }}
        </router-link>
        <button
          class="button is-link"
          @click="$emit('cancel')"
          v-else
        >
          {{ $t("main.close") }}
        </button>
        <p class="error has-text-right info-message" v-if="isError">
          {{ $t("shots.edit_fail") }}
        </p>
        <p class="success has-text-right info-message">
          {{ shotSuccessText }}
        </p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { modalMixin } from './base_modal'
import TextField from '../widgets/TextField'
import TextareaField from '../widgets/TextareaField'
import Combobox from '../widgets/Combobox'

export default {
  name: 'edit-shot-modal',
  mixins: [modalMixin],

  components: {
    Combobox,
    TextField,
    TextareaField
  },

  props: [
    'onConfirmClicked',
    'text',
    'active',
    'cancelRoute',
    'isError',
    'isLoading',
    'isLoadingStay',
    'isSuccess',
    'shotToEdit',
    'errorText'
  ],

  data () {
    return {
      form: {
        data: {}
      },
      shotSuccessText: ''
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'getSequenceOptions',
      'getOpenProductionOptions',
      'openProductions',
      'sequences',
      'shots',
      'shotCreated',
      'shotMetadataDescriptors'
    ]),

    frameIn () {
      return this.shotToEdit.data ? this.shotToEdit.data.frame_in : ''
    },

    frameOut () {
      return this.shotToEdit.data ? this.shotToEdit.data.frame_out : ''
    },

    fps () {
      return this.shotToEdit.data ? this.shotToEdit.data.fps : ''
    }
  },

  methods: {
    ...mapActions([
    ]),

    runConfirmation () {
      if (this.isEditing()) {
        this.confirmClicked()
      } else {
        this.confirmAndStayClicked()
      }
    },

    confirmAndStayClicked () {
      this.$emit('confirmAndStay', this.form)
    },

    confirmClicked () {
      this.$emit('confirm', this.form)
    },

    getDescriptorChoicesOptions (descriptor) {
      const values = descriptor.choices.map(c => ({label: c, value: c}))
      return [{label: '', value: ''}, ...values]
    },

    isEditing () {
      return this.shotToEdit && this.shotToEdit.id
    },

    resetForm () {
      this.shotSuccessText = ''
      if (!this.isEditing()) {
        if (this.openProductions.length > 0) {
          this.form.project_id =
            this.currentProduction ? this.currentProduction.id : ''
        }
        if (this.sequences.length > 0) {
          this.form.sequence_id = this.sequences[0].id
        }
        this.form.name = ''
        this.form.description = ''
        this.form.data = {}
      } else {
        this.form = {
          sequence_id: this.shotToEdit.sequence_id,
          project_id: this.shotToEdit.project_id,
          name: this.shotToEdit.name,
          description: this.shotToEdit.description,
          frameIn: this.frameIn,
          frameOut: this.frameOut,
          fps: this.fps,
          data: {...this.shotToEdit.data} || {}
        }
      }
    }
  },

  mounted () {
    this.resetForm()
  },

  watch: {
    active () {
      this.shotSuccessText = ''
      this.resetForm()
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    shotToEdit () {
      this.resetForm()
    },

    shotCreated () {
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

<style scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}
.is-danger {
  color: #ff3860;
  font-style: italic;
}
.title {
  border-bottom: 2px solid #DDD;
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
