<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <text-field
      ref="nameField"
      :label="$t('schedule.milestone.name')"
      :maxlength="40"
      v-model.trim="form.name"
      @enter="confirm"
      v-focus
    />
    <button-simple
      class="button is-link error"
      :text="$t('schedule.milestone.delete_milestone')"
      @click="$emit('remove-milestone', milestoneToEdit)"
      v-if="isEdit"
    />
    <modal-footer
      :error-text="$t('schedule.milestone.error')"
      :is-error="isError"
      :is-loading="isLoading"
      :is-disabled="!isFormFilled"
      @confirm="confirm"
      @cancel="$emit('cancel')"
    />
  </base-modal>
</template>

<script setup>
/*
 * Modal used to edit and create milestones.
 */
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  milestoneToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm', 'remove-milestone'])

// State

const form = ref({ name: '' })
const nameField = ref(null)

// Computed

const isEdit = computed(() => props.milestoneToEdit.id !== undefined)

const isFormFilled = computed(() => form.value.name.length > 0)

const modalTitle = computed(() => {
  const dateStr = props.milestoneToEdit.date?.format('YYYY-MM-DD') ?? ''
  const prefix = isEdit.value
    ? t('schedule.milestone.edit_milestone')
    : t('schedule.milestone.add_milestone')
  return `${prefix}: ${dateStr}`
})

// Functions

const confirm = () => {
  emit('confirm', form.value)
}

const reset = () => {
  form.value = {
    id: props.milestoneToEdit.id || undefined,
    name: props.milestoneToEdit.name || '',
    date: props.milestoneToEdit.date
  }
}

// Watchers

watch(
  () => props.active,
  active => {
    if (active) {
      reset()
      setTimeout(() => {
        nameField.value?.focus()
      }, 1000)
    }
  }
)

// Lifecycle

onMounted(() => {
  reset()
  nextTick(() => {
    nameField.value?.focus()
  })
})
</script>
