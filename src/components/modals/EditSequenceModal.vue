<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">

      <h1 class="title" v-if="sequenceToEdit && this.sequenceToEdit.id">
        {{ $t("sequences.edit_title") }} {{ sequenceToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("sequences.new_sequence") }}
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
          v-model="form.description"
          @keyup.ctrl.enter="runConfirmation"
        />
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
          class="button is-link">
          {{ $t("main.cancel") }}
        </router-link>
        <p class="error has-text-right info-message" v-if="isError">
          {{ $t("sequences.edit_fail") }}
        </p>
        <p class="success has-text-right info-message">
          {{ sequenceSuccessText }}
        </p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TextField from '../widgets/TextField'
import TextareaField from '../widgets/TextareaField'

export default {
  name: 'edit-sequence-modal',
  components: {
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
    'sequenceToEdit',
    'errorText'
  ],

  data () {
    if (this.sequenceToEdit && this.sequenceToEdit.id) {
      return {
        form: {
          id: this.sequenceToEdit.id,
          name: this.sequenceToEdit.name,
          description: this.sequenceToEdit.description,
          production_id: this.sequenceToEdit.project_id
        },
        sequenceSuccessText: ''
      }
    } else {
      return {
        form: {
          id: '',
          name: '',
          description: '',
          fps: ''
        },
        sequenceSuccessText: ''
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction'
    ])
  },

  methods: {
    ...mapActions([
    ]),

    runConfirmation () {
      this.confirmClicked()
    },

    confirmClicked () {
      this.$emit('confirm', this.form)
    },

    isEditing () {
      return this.sequenceToEdit && this.sequenceToEdit.id
    },

    resetForm () {
      this.sequenceSuccessText = ''
      if (!this.isEditing()) {
        this.form.id = null
        this.form.name = ''
        this.form.description = ''
      } else {
        this.form = {
          id: this.sequenceToEdit.id,
          name: this.sequenceToEdit.name,
          description: this.sequenceToEdit.description
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

    sequenceToEdit () {
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
