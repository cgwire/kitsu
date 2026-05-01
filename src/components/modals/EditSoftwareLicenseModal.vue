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
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  softwareLicenseToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({ name: '', archived: 'false' })
const nameField = ref(null)

// Computed

const isEditing = computed(() => Boolean(props.softwareLicenseToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value
    ? t('software_licenses.edit_title') + ' ' + props.softwareLicenseToEdit.name
    : t('software_licenses.new_software_license')
)

// Functions

const runConfirmation = () => {
  emit('confirm', form.value)
}

const resetForm = () => {
  if (props.softwareLicenseToEdit.id) {
    form.value = {
      name: props.softwareLicenseToEdit.name,
      short_name: props.softwareLicenseToEdit.short_name,
      file_extension: props.softwareLicenseToEdit.file_extension,
      version: props.softwareLicenseToEdit.version,
      monthly_cost: props.softwareLicenseToEdit.monthly_cost,
      inventory_amount: props.softwareLicenseToEdit.inventory_amount,
      archived: String(props.softwareLicenseToEdit.archived === true)
    }
  } else {
    form.value = {
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

watch(() => props.softwareLicenseToEdit, resetForm)

// Lifecycle

onMounted(() => {
  store.dispatch('loadSoftwareLicenses')
})
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
