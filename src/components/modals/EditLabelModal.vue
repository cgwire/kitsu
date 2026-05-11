<template>
  <base-modal
    :active="active"
    :title="$t('breakdown.edit_label')"
    @cancel="$emit('cancel')"
  >
    <form @submit.prevent>
      <combobox
        :label="$t('breakdown.label')"
        :options="typeOptions"
        @enter="confirm"
        v-model="form.label"
        v-focus
      />

      <modal-footer
        :is-error="isError"
        :is-loading="isLoading"
        @confirm="confirm"
        @cancel="$emit('cancel')"
      />
    </form>
  </base-modal>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import Combobox from '@/components/widgets/Combobox.vue'

const { t } = useI18n()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  label: { type: String, default: 'animate' }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({ label: 'animate' })

// Computed

const typeOptions = computed(() => [
  { label: t('breakdown.options.animate'), value: 'animate' },
  { label: t('breakdown.options.fixed'), value: 'fixed' }
])

// Functions

const confirm = () => {
  emit('confirm', form.value)
}

// Watchers

watch(
  () => props.label,
  label => {
    form.value.label = label
  }
)

// Lifecycle

onMounted(() => {
  form.value.label = props.label
})
</script>
