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

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  hardwareItemToEdit: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({ name: '', archived: 'false' })
const nameField = ref(null)

// Computed

const isEditing = computed(() => Boolean(props.hardwareItemToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? t('hardware_items.edit_title') + ' ' + props.hardwareItemToEdit.name
    : t('hardware_items.new_hardware_item')
)

// Functions

const runConfirmation = () => {
  emit('confirm', form.value)
}

const resetForm = () => {
  if (props.hardwareItemToEdit.id) {
    form.value = {
      name: props.hardwareItemToEdit.name,
      short_name: props.hardwareItemToEdit.short_name,
      monthly_cost: props.hardwareItemToEdit.monthly_cost,
      inventory_amount: props.hardwareItemToEdit.inventory_amount,
      archived: String(props.hardwareItemToEdit.archived === true)
    }
  } else {
    form.value = {
      name: '',
      short_name: '',
      monthly_cost: 0,
      inventory_amount: 0,
      archived: 'false'
    }
  }
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

watch(() => props.hardwareItemToEdit, resetForm)

// Lifecycle

onMounted(() => {
  store.dispatch('loadHardwareItems')
})
</script>
