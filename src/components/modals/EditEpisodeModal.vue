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
        <h1 class="title" v-if="episodeToEdit && this.episodeToEdit.id">
          {{ $t('episodes.edit_title') }} {{ episodeToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('episodes.new_episode') }}
        </h1>

        <form v-on:submit.prevent>
          <text-field
            ref="nameField"
            :label="$t('episodes.fields.name')"
            v-model="form.name"
            @enter="runConfirmation"
            v-focus
          />

          <combobox-styled
            class="field"
            :label="$t('main.status')"
            :options="episodeStatusOptions"
            v-model="form.status"
          />

          <textarea-field
            ref="descriptionField"
            :label="$t('episodes.fields.description')"
            @keyup.ctrl.enter="runConfirmation"
            @keyup.meta.enter="runConfirmation"
            v-model="form.description"
          />

          <metadata-field
            :key="descriptor.id"
            :descriptor="descriptor"
            :entity="episodeToEdit"
            @enter="runConfirmation"
            v-model="form.data[descriptor.field_name]"
            v-for="descriptor in episodeMetadataDescriptors"
            v-if="episodeToEdit"
          />
        </form>

        <modal-footer
          :error-text="$t('episodes.edit_error')"
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

import ComboboxStyled from '@/components/widgets/ComboboxStyled'
import MetadataField from '@/components/widgets/MetadataField'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'
import TextareaField from '@/components/widgets/TextareaField'

export default {
  name: 'edit-episode-modal',
  mixins: [modalMixin],
  components: {
    ComboboxStyled,
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
    episodeToEdit: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    let form = {
      id: '',
      name: '',
      description: '',
      fps: '',
      data: {}
    }
    if (this.episodeToEdit && this.episodeToEdit.id) {
      form = {
        id: this.episodeToEdit.id,
        name: this.episodeToEdit.name,
        description: this.episodeToEdit.description,
        production_id: this.episodeToEdit.project_id,
        data: this.episodeToEdit.data || {}
      }
    }
    return {
      form,
      episodeSuccessText: '',
      episodeStatusOptions: [
        { label: 'canceled', value: 'canceled' },
        { label: 'complete', value: 'complete' },
        { label: 'running', value: 'running' },
        { label: 'standby', value: 'standby' }
      ]
    }
  },

  computed: {
    ...mapGetters(['episodeMetadataDescriptors'])
  },

  methods: {
    ...mapActions([]),

    runConfirmation() {
      this.$emit('confirm', this.form)
    },

    isEditing() {
      return this.episodeToEdit && this.episodeToEdit.id
    },

    resetForm() {
      this.episodeSuccessText = ''
      if (!this.isEditing()) {
        this.form.id = null
        this.form.name = ''
        this.form.status = 'running'
        this.form.description = ''
        this.form.data = {}
      } else {
        this.form = {
          id: this.episodeToEdit.id,
          name: this.episodeToEdit.name,
          status: this.episodeToEdit.status,
          description: this.episodeToEdit.description,
          data: this.episodeToEdit.data || {}
        }
      }
    }
  },

  mounted() {
    this.resetForm()
  },

  watch: {
    active() {
      if (this.active) {
        this.resetForm()
      }
    },

    episodeToEdit() {
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
