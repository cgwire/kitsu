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
          @keyup.ctrl.enter="runConfirmation"
          @keyup.meta.enter="runConfirmation"
          v-model="form.description"
        />

        <div
          :key="descriptor.id"
          v-for="descriptor in episodeMetadataDescriptors"
        >
          <combobox
            v-if="descriptor.choices.length > 0"
            :label="descriptor.name"
            :options="getDescriptorChoicesOptions(descriptor)"
            v-model="form.data[descriptor.field_name]"
          />
          <text-field
            :label="descriptor.name"
            @enter="runConfirmation"
            v-model="form.data[descriptor.field_name]"
            v-else
          />
        </div>
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
import ModalFooter from '@/components/modals/ModalFooter'
import TextField from '@/components/widgets/TextField'
import TextareaField from '@/components/widgets/TextareaField'

export default {
  name: 'edit-episode-modal',
  mixins: [modalMixin],
  components: {
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

  data () {
    if (this.episodeToEdit && this.episodeToEdit.id) {
      return {
        form: {
          id: this.episodeToEdit.id,
          name: this.episodeToEdit.name,
          description: this.episodeToEdit.description,
          production_id: this.episodeToEdit.project_id,
          data: this.episodeToEdit.data || {}
        },
        episodeSuccessText: ''
      }
    } else {
      return {
        form: {
          id: '',
          name: '',
          description: '',
          fps: '',
          data: {}
        },
        episodeSuccessText: ''
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'episodeMetadataDescriptors'
    ])
  },

  methods: {
    ...mapActions([
    ]),

    getDescriptorChoicesOptions (descriptor) {
      const values = descriptor.choices.map(c => ({ label: c, value: c }))
      return [{ label: '', value: '' }, ...values]
    },

    runConfirmation () {
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
        this.form.data = {}
      } else {
        this.form = {
          id: this.episodeToEdit.id,
          name: this.episodeToEdit.name,
          description: this.episodeToEdit.description,
          data: this.episodeToEdit.data || {}
        }
      }
    }
  },

  mounted () {
    this.resetForm()
  },

  watch: {
    active () {
      if (this.active) {
        this.resetForm()
      }
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
