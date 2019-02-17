<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">

      <h1 class="title" v-if="episodeToEdit && this.episodeToEdit.id">
        {{ $t("episodes.edit_title") }} {{ episodeToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("episodes.new_episode") }}
      </h1>

      <form v-on:submit.prevent>
        <text-field
          ref="nameField"
          :label="$t('episodes.fields.name')"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        />
        <textarea-field
          ref="descriptionField"
          :label="$t('episodes.fields.description')"
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
          {{ $t("episodes.edit_fail") }}
        </p>
        <p class="success has-text-right info-message">
          {{ episodeSuccessText }}
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
import Combobox from '../widgets/Combobox'

export default {
  name: 'edit-episode-modal',
  components: {
    TextField,
    TextareaField,
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
    'episodeToEdit',
    'errorText'
  ],

  data () {
    if (this.episodeToEdit && this.episodeToEdit.id) {
      return {
        form: {
          id: this.episodeToEdit.id,
          name: this.episodeToEdit.name,
          description: this.episodeToEdit.description,
          production_id: this.episodeToEdit.project_id
        },
        episodeSuccessText: ''
      }
    } else {
      return {
        form: {
          id: '',
          name: '',
          description: '',
          fps: ''
        },
        episodeSuccessText: ''
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
      return this.episodeToEdit && this.episodeToEdit.id
    },

    resetForm () {
      this.episodeSuccessText = ''
      if (!this.isEditing()) {
        this.form.id = null
        this.form.name = ''
        this.form.description = ''
      } else {
        this.form = {
          id: this.episodeToEdit.id,
          name: this.episodeToEdit.name,
          description: this.episodeToEdit.description
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

    episodeToEdit () {
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
.title {
  border-bottom: 2px solid #DDD;
  padding-bottom: 0.5em;
  margin-bottom: 1.2em;
}
.info-message {
  margin-top: 1em;
}
</style>
