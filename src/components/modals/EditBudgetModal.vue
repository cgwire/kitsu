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

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  budgetToEdit: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  lastRevision: { type: Number, default: 0 }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({ name: '', currency: 'USD' })
const nameField = ref(null)

const currencieOptions = [
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

// Computed

const isDisabled = computed(() => form.value.name.length === 0)

const isEditing = computed(() => Boolean(props.budgetToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value ? t('budget.edit_budget') : t('budget.create_budget')
)

// Functions

const runConfirmation = () => {
  emit('confirm', form.value)
}

// Watchers

watch(
  () => props.active,
  active => {
    if (active) {
      setTimeout(() => {
        nameField.value?.focus()
      }, 100)
    }
  }
)

watch(
  () => props.budgetToEdit,
  budget => {
    if (budget?.id) {
      form.value = {
        id: budget.id,
        name: budget.name,
        currency: budget.currency || 'USD'
      }
    } else {
      form.value = { id: null, name: '', currency: 'USD' }
    }
  }
)
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
