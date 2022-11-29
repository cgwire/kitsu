<template>
<div :class="{
  'modal': true,
  'is-active': active
}">
  <div class="modal-background" @click="$emit('cancel')" ></div>

  <div class="modal-content">
    <div class="box">

      <h1 class="title" v-if="editToEdit && this.editToEdit.id">
        {{ $t("edits.edit_title") }} {{ editToEdit.name }}
      </h1>
      <h1 class="title" v-else>
        {{ $t("edits.new_edit") }}
      </h1>

      <form v-on:submit.prevent>
        <combobox
          :label="$t('edits.fields.episode')"
          :options="episodeOptions"
          v-model="form.parent_id"
          v-if="isTVShow"
        />
        <text-field
          ref="nameField"
          :label="$t('edits.fields.name')"
          v-model="form.name"
          @enter="runConfirmation"
          v-focus
        />
        <textarea-field
          ref="descriptionField"
          :label="$t('edits.fields.description')"
          v-model="form.description"
          @keyup.ctrl.enter="runConfirmation"
          @keyup.meta.enter="runConfirmation"
        />
        <div
          :key="descriptor.id"
          v-for="descriptor in editMetadataDescriptors"
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

      <modal-footer
        :error-text="$t('edits.edit_fail')"
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
import Combobox from '@/components/widgets/Combobox'
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'
import TextareaField from '@/components/widgets/TextareaField'

export default {
  name: 'edit-edit-modal',
  mixins: [modalMixin],

  components: {
    Combobox,
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
    isLoadingStay: {
      type: Boolean,
      default: false
    },
    isSuccess: {
      type: Boolean,
      default: false
    },
    editToEdit: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      form: {
        name: '',
        description: '',
        parent_id: null,
        data: {}
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
      'edits',
      'episodes',
      'getOpenProductionOptions',
      'isTVShow',
      'openProductions'
    ]),

    episodeOptions () {
      const options = this.episodes.map((episode) => {
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
      const values = descriptor.choices.map(c => ({ label: c, value: c }))
      return [{ label: '', value: '' }, ...values]
    },

    isEditing () {
      return this.editToEdit && this.editToEdit.id
    },

    resetForm () {
      this.editSuccessText = ''
      if (!this.isEditing()) {
        if (this.openProductions.length > 0) {
          this.form.project_id =
            this.currentProduction ? this.currentProduction.id : ''
        }
        this.form.name = ''
        this.form.description = ''
        this.form.parent_id =
          this.currentEpisode ? this.currentEpisode.id : null
        this.form.data = {}
      } else {
        this.form = {
          project_id: this.editToEdit.project_id,
          name: this.editToEdit.name,
          description: this.editToEdit.description,
          parent_id: this.editToEdit.parent_id,
          data: { ...this.editToEdit.data } || {}
        }
      }
    }
  },

  mounted () {
    this.resetForm()
  },

  watch: {
    active () {
      this.editSuccessText = ''
      this.resetForm()
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    editToEdit () {
      this.resetForm()
    },

    editCreated () {
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
