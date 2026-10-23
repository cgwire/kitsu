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
    <combobox-simple
      class="field"
      :label="$t('schedule.milestone.type')"
      locale-key-prefix="schedule.milestone.types."
      :options="typeOptions"
      v-model="form.milestone_type"
    />
    <combobox-simple
      class="field"
      :label="$t('schedule.milestone.status')"
      locale-key-prefix="schedule.milestone.statuses."
      :options="statusOptions"
      v-model="form.status"
    />
    <color-field
      class="mt2"
      :label="$t('schedule.milestone.color')"
      :model-value="displayedColor"
      @update:model-value="color => (form.color = color)"
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

import {
  DEFAULT_MILESTONE_STATUS,
  DEFAULT_MILESTONE_TYPE,
  MILESTONE_STATUSES,
  MILESTONE_TYPE_COLORS,
  MILESTONE_TYPES
} from '@/lib/milestones'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ColorField from '@/components/widgets/ColorField.vue'
import ComboboxSimple from '@/components/widgets/ComboboxSimple.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()

// Props / Emits
// --------------------------------------------------------------------------

const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  milestoneToEdit: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm', 'remove-milestone'])

// State
// --------------------------------------------------------------------------

// form.color stays null until picked by hand, so the milestone keeps
// following its type color.
const form = ref({ name: '' })
const nameField = ref(null)

const toOptions = values => values.map(value => ({ label: value, value }))
const typeOptions = toOptions(MILESTONE_TYPES)
const statusOptions = toOptions(MILESTONE_STATUSES)

// Computed
// --------------------------------------------------------------------------

const isEdit = computed(() => props.milestoneToEdit.id !== undefined)

const isFormFilled = computed(() => form.value.name.length > 0)

const displayedColor = computed(
  () => form.value.color || MILESTONE_TYPE_COLORS[form.value.milestone_type]
)

const modalTitle = computed(() => {
  const dateStr = props.milestoneToEdit.date?.format('YYYY-MM-DD') ?? ''
  const prefix = isEdit.value
    ? t('schedule.milestone.edit_milestone')
    : t('schedule.milestone.add_milestone')
  return `${prefix}: ${dateStr}`
})

// Functions
// --------------------------------------------------------------------------

const confirm = () => {
  // Enter in a field lands here too, past the grayed confirm button.
  if (!isFormFilled.value) return
  emit('confirm', form.value)
}

const reset = () => {
  const milestone = props.milestoneToEdit
  form.value = {
    id: milestone.id || undefined,
    name: milestone.name || '',
    date: milestone.date,
    milestone_type: milestone.milestone_type || DEFAULT_MILESTONE_TYPE,
    status: milestone.status || DEFAULT_MILESTONE_STATUS,
    color: milestone.color || null
  }
}

// Watchers
// --------------------------------------------------------------------------

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
// --------------------------------------------------------------------------

onMounted(() => {
  reset()
  nextTick(() => {
    nameField.value?.focus()
  })
})
</script>
