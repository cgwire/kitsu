<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        ref="nameField"
        :label="$t('software_licenses.fields.name')"
        :maxlength="30"
        v-model="form.name"
        @enter="runConfirmation"
        v-focus
      />

      <text-field
        :label="$t('software_licenses.fields.short_name')"
        @enter="runConfirmation"
        v-model="form.short_name"
      />

      <text-field
        :label="$t('software_licenses.fields.extension')"
        @enter="runConfirmation"
        v-model="form.file_extension"
      />

      <text-field
        :label="$t('software_licenses.fields.version')"
        @enter="runConfirmation"
        v-model="form.version"
      />

      <text-field
        :label="$t('software_licenses.fields.monthly_cost')"
        type="number"
        @enter="runConfirmation"
        v-model="form.monthly_cost"
      />

      <text-field
        :label="$t('software_licenses.fields.inventory_amount')"
        type="number"
        @enter="runConfirmation"
        v-model="form.inventory_amount"
      />

      <combobox-boolean
        :label="$t('main.archived')"
        @enter="runConfirmation"
        v-model="form.archived"
        v-if="isEditing"
      />
    </form>

    <modal-footer
      :error-text="$t('software_licenses.create_error')"
      :is-error="isError"
      :is-loading="isLoading"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script>
import { mapActions } from 'vuex'
import { modalMixin } from '@/components/modals/base_modal'

import BaseModal from '@/components/modals/BaseModal.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'edit-software-license-modal',

  mixins: [modalMixin],

  components: {
    BaseModal,
    ComboboxBoolean,
    ModalFooter,
    TextField
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
    softwareLicenseToEdit: {
      type: Object,
      default: () => {}
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        name: '',
        archived: 'false'
      }
    }
  },

  mounted() {
    this.loadSoftwareLicenses()
  },

  computed: {
    isEditing() {
      return Boolean(this.softwareLicenseToEdit?.id)
    },

    modalTitle() {
      return this.isEditing
        ? this.$t('software_licenses.edit_title') +
            ' ' +
            this.softwareLicenseToEdit.name
        : this.$t('software_licenses.new_software_license')
    }
  },

  methods: {
    ...mapActions(['loadSoftwareLicenses']),

    runConfirmation() {
      this.$emit('confirm', this.form)
    },

    resetForm() {
      if (this.softwareLicenseToEdit.id) {
        this.form = {
          name: this.softwareLicenseToEdit.name,
          short_name: this.softwareLicenseToEdit.short_name,
          file_extension: this.softwareLicenseToEdit.file_extension,
          version: this.softwareLicenseToEdit.version,
          monthly_cost: this.softwareLicenseToEdit.monthly_cost,
          inventory_amount: this.softwareLicenseToEdit.inventory_amount,
          archived: String(this.softwareLicenseToEdit.archived === true)
        }
      } else {
        this.form = {
          name: '',
          short_name: '',
          file_extension: '',
          version: '',
          monthly_cost: 0,
          inventory_amount: 0,
          archived: 'false'
        }
      }
    }
  },

  watch: {
    active() {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField?.focus()
        }, 100)
      }
    },

    softwareLicenseToEdit() {
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

.task-types {
  flex-wrap: wrap;
}
</style>
