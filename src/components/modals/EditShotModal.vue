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
        >
        </combobox>
        <text-field
          ref="nameField"
          :label="$t('shots.fields.name')"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        >
        </text-field>
        <text-field
          ref="descriptionField"
          :label="$t('shots.fields.description')"
          v-model="form.description"
          @enter="runConfirmation"
          v-focus
        >
        </text-field>
        <text-field
          ref="frameInField"
          :label="$t('shots.fields.frame_in')"
          v-model="form.frameIn"
          type="number"
          @enter="runConfirmation"
          v-focus
        >
        </text-field>
        <text-field
          ref="frameOutField"
          :label="$t('shots.fields.frame_out')"
          v-model="form.frameOut"
          type="number"
          @enter="runConfirmation"
          v-focus
        >
        </text-field>

      </form>

      <p class="has-text-right">
        <a
          :class="{
            button: true,
            'is-primary': true,
            'is-loading': isLoadingStay
          }"
          @click="confirmAndStayClicked"
          v-if="!shotToEdit || !shotToEdit.id"
        >
          {{ $t("main.confirmation_and_stay") }}
        </a>
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
          class="button is-link">
          {{ $t("main.cancel") }}
        </router-link>
        <p class="error has-text-right info-message" v-if="isError">
          {{ $t("shots.edit_fail") }}
        </p>
        <p class="success has-text-right info-message">
          {{ shotSuccessText }}
        </p>
      </p>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TextField from '../widgets/TextField'
import Combobox from '../widgets/Combobox'

export default {
  name: 'edit-shot-modal',
  components: {
    TextField,
    Combobox
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
    if (this.shotToEdit && this.shotToEdit.id) {
      return {
        form: {
          name: this.shotToEdit.name,
          description: this.shotToEdit.description,
          sequence_id: this.shotToEdit.sequence_id,
          production_id: this.shotToEdit.project_id,
          frameIn: this.frameIn,
          frameOut: this.frameOut
        },
        shotSuccessText: ''
      }
    } else {
      return {
        form: {
          name: '',
          description: '',
          entity_type_id: '',
          project_id: '',
          frameIn: '',
          frameOut: ''
        },
        shotSuccessText: ''
      }
    }
  },

  computed: {
    ...mapGetters([
      'shots',
      'shotCreated',

      'sequences',
      'openProductions',
      'getSequenceOptions',
      'getOpenProductionOptions',
      'currentProduction'
    ]),

    frameIn () {
      return this.shotToEdit.data ? this.shotToEdit.data.frame_in : ''
    },

    frameOut () {
      return this.shotToEdit.data ? this.shotToEdit.data.frame_out : ''
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

    isEditing () {
      return this.shotToEdit && this.shotToEdit.id
    },

    resetForm () {
      this.shotSuccessText = ''
      if (!this.isEditing()) {
        if (this.openProductions.length > 0) {
          this.form.project_id = this.currentProduction.id
        }
        if (this.sequences.length > 0) {
          this.form.sequence_id = this.sequences[0].id
        }
        this.form.name = ''
        this.form.description = ''
      } else {
        this.form = {
          sequence_id: this.shotToEdit.sequence_id,
          project_id: this.shotToEdit.project_id,
          name: this.shotToEdit.name,
          description: this.shotToEdit.description,
          frameIn: this.frameIn,
          frameOut: this.frameOut
        }
      }
    }
  },

  mounted () {
    this.resetForm()
  },

  watch: {
    active () {
      this.resetForm()
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
</style>
