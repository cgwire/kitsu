<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

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

      <modal-footer
        :error-text="$t('episodes.edit_error')"
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
import { modalMixin } from './base_modal'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '../widgets/TextField'
import TextareaField from '../widgets/TextareaField'

export default {
  name: 'edit-episode-modal',
  mixins: [modalMixin],
  components: {
    ModalFooter,
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

.info-message {
  margin-top: 1em;
}
</style>
