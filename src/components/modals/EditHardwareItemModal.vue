<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <text-field
        ref="nameField"
        :label="$t('hardware_items.fields.name')"
        :maxlength="30"
        v-model="form.name"
        @enter="runConfirmation"
        v-focus
      />

      <text-field
        :label="$t('hardware_items.fields.short_name')"
        @enter="runConfirmation"
        v-model="form.short_name"
      />

      <text-field
        :label="$t('hardware_items.fields.monthly_cost')"
        type="number"
        @enter="runConfirmation"
        v-model="form.monthly_cost"
      />

      <text-field
        :label="$t('hardware_items.fields.inventory_amount')"
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
      :error-text="$t('hardware_items.create_error')"
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
  name: 'edit-hardware-item-modal',

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
    hardwareItemToEdit: {
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
    this.loadHardwareItems()
  },

  computed: {
    isEditing() {
      return Boolean(this.hardwareItemToEdit?.id)
    },

    modalTitle() {
      return this.isEditing
        ? this.$t('hardware_items.edit_title') +
            ' ' +
            this.hardwareItemToEdit.name
        : this.$t('hardware_items.new_hardware_item')
    }
  },

  methods: {
    ...mapActions(['loadHardwareItems']),

    runConfirmation() {
      this.$emit('confirm', this.form)
    },

    resetForm() {
      if (this.hardwareItemToEdit.id) {
        this.form = {
          name: this.hardwareItemToEdit.name,
          short_name: this.hardwareItemToEdit.short_name,
          monthly_cost: this.hardwareItemToEdit.monthly_cost,
          inventory_amount: this.hardwareItemToEdit.inventory_amount,
          archived: String(this.hardwareItemToEdit.archived === true)
        }
      } else {
        this.form = {
          name: '',
          short_name: '',
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

    hardwareItemToEdit() {
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
</style>
