<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent>
      <div class="field">
        <label class="label">
          {{ $t('budget.fields.revision') }}
        </label>
        <p class="revision-number">
          v{{ isEditing ? budgetToEdit.revision : lastRevision + 1 }}
        </p>
      </div>

      <text-field
        ref="nameField"
        :label="$t('budget.fields.name')"
        :maxlength="30"
        v-model="form.name"
        @enter="runConfirmation"
        v-focus
      />

      <combobox
        :label="$t('budget.fields.currency')"
        :options="currencieOptions"
        v-model="form.currency"
      />
    </form>

    <modal-footer
      :error-text="$t('budget.create_budget_error')"
      :is-error="isError"
      :is-loading="isLoading"
      :is-disabled="isDisabled"
      @confirm="runConfirmation"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script>
import { modalMixin } from '@/components/modals/base_modal'

import BaseModal from '@/components/modals/BaseModal.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import TextField from '@/components/widgets/TextField.vue'

export default {
  name: 'edit-budget-modal',

  mixins: [modalMixin],

  components: {
    BaseModal,
    Combobox,
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
    budgetToEdit: {
      type: Object,
      default: () => {}
    },
    lastRevision: {
      type: Number,
      default: 0
    }
  },

  emits: ['cancel', 'confirm'],

  data() {
    return {
      form: {
        name: '',
        currency: 'USD'
      },
      currencieOptions: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'CAD', value: 'CAD' },
        { label: 'AUD', value: 'AUD' },
        { label: 'CHF', value: 'CHF' },
        { label: 'JPY', value: 'JPY' },
        { label: 'CNY', value: 'CNY' },
        { label: 'INR', value: 'INR' }
      ]
    }
  },

  computed: {
    isDisabled() {
      return this.form.name.length === 0
    },

    isEditing() {
      return this.budgetToEdit && this.budgetToEdit.id
    },

    modalTitle() {
      return this.isEditing
        ? this.$t('budget.edit_budget')
        : this.$t('budget.create_budget')
    }
  },

  methods: {
    runConfirmation() {
      this.$emit('confirm', this.form)
    }
  },

  watch: {
    active() {
      if (this.active) {
        setTimeout(() => {
          this.$refs.nameField.focus()
        }, 100)
      }
    },

    budgetToEdit() {
      if (this.budgetToEdit.id) {
        this.form = {
          id: this.budgetToEdit.id,
          name: this.budgetToEdit.name,
          currency: this.budgetToEdit.currency || 'USD'
        }
      } else {
        this.form = {
          id: null,
          name: '',
          currency: 'USD'
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content .box p.text {
  margin-bottom: 1em;
}

.revision-number {
  font-size: 1.4rem;
  font-weight: bold;
}
</style>
