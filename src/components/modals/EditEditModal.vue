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
        <h1 class="title" v-if="editToEdit && editToEdit.id">
          {{ $t('edits.edit_title') }} {{ editToEdit.name }}
        </h1>
        <h1 class="title" v-else>
          {{ $t('edits.new_edit') }}
        </h1>

        <form @submit.prevent>
          <combobox
            :label="$t('edits.fields.episode')"
            :options="episodeOptions"
            v-model="form.parent_id"
            v-if="isTVShow"
          />
          <text-field
            ref="nameField"
            :label="$t('edits.fields.name')"
            v-model.trim="form.name"
            @enter="runConfirmation"
            v-focus
          />
          <text-field
            ref="resolutionField"
            :label="$t('shots.fields.resolution')"
            @enter="runConfirmation"
            v-model="form.data.resolution"
          />
          <textarea-field
            ref="descriptionField"
            :label="$t('edits.fields.description')"
            v-model="form.description"
            @keyup.ctrl.enter="runConfirmation"
            @keyup.meta.enter="runConfirmation"
          />
          <template v-if="editToEdit">
            <metadata-field
              :key="descriptor.id"
              :descriptor="descriptor"
              :entity="editToEdit"
              @enter="runConfirmation"
              v-model="form.data[descriptor.field_name]"
              v-for="descriptor in editMetadataDescriptors"
            />
          </template>
        </form>

        <modal-footer
          :error-text="$t('edits.edit_error')"
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
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import Combobox from '@/components/widgets/Combobox.vue'
import MetadataField from '@/components/widgets/MetadataField.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'
import TextareaField from '@/components/widgets/TextareaField.vue'

export default {
  name: 'edit-edit-modal',

  mixins: [modalMixin],

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
    editToEdit: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm', 'confirm-and-stay'],

  data() {
    return {
      form: {
        name: '',
        description: '',
        parent_id: null,
        data: {
          resolution: ''
        }
      },
      editSuccessText: ''
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'currentEpisode',
      'editCreated',
      'editMetadataDescriptors',
      'episodes',
      'isTVShow',
      'openProductions'
    ]),

    episodeOptions() {
      const options = this.episodes.map(episode => {
        return {
          label: episode.name,
          value: episode.id
        }
      })
      // It might be usefull to allow Edits not linked to any episodes.
      return [{ label: '-', value: null }].concat(options)
    }
  },

  methods: {
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
      return this.editToEdit && this.editToEdit.id
    },

    resetForm() {
      this.editSuccessText = ''
      if (!this.isEditing()) {
        if (this.openProductions.length > 0) {
          this.form.project_id = this.currentProduction
            ? this.currentProduction.id
            : ''
        }
        this.form.name = ''
        this.form.description = ''
        this.form.parent_id = this.currentEpisode
          ? this.currentEpisode.id
          : null
        this.form.data = {
          resolution: ''
        }
      } else {
        this.form = {
          project_id: this.editToEdit.project_id,
          name: this.editToEdit.name,
          description: this.editToEdit.description,
          parent_id: this.editToEdit.parent_id,
          data:
            {
              ...this.editToEdit.data,
              resolution: this.editToEdit.data.resolution || ''
            } || {}
        }
      }
    }
  },

  mounted() {
    this.resetForm()
  },

  watch: {
    active() {
      this.editSuccessText = ''
      this.resetForm()
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    editToEdit() {
      this.resetForm()
    },

    editCreated() {
      if (this.isEditing()) {
        this.editSuccessText = this.$t('edits.edit_success', {
          name: this.editCreated
        })
      } else {
        this.editSuccessText = this.$t('edits.new_success', {
          name: this.editCreated
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
