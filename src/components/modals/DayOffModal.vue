<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent="confirm">
      <div class="flexrow field">
        <div class="flexrow-item ml2">
          <label class="label">
            {{ $t('main.start_date') }}
          </label>
          <date-field
            utc
            week-days-disabled
            :can-delete="false"
            :model-value="form.startDate"
            @update:model-value="onStartDateChange"
          />
        </div>
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.end_date') }}
          </label>
          <date-field
            utc
            week-days-disabled
            :model-value="form.endDate"
            @update:model-value="onEndDateChange"
          />
        </div>
      </div>
      <text-field
        class="mt2"
        :label="`${$t('main.description')} (${$t('main.optional')})`"
        :required="false"
        v-model.trim="form.description"
      />
      <p class="mb2 warning-text">
        <alert-triangle-icon class="icon mr05 warning" />{{
          $t('days_off.confirm_day_offs')
        }}
      </p>
      <p class="is-danger has-text-right" v-if="isError">
        {{ errorText || $t('days_off.error_days_off') }}
      </p>
      <p class="has-text-right mt1 mb2">
        <button
          type="submit"
          class="button is-primary"
          :class="{ 'is-loading': isLoading }"
        >
          {{ $t('main.confirmation') }}
        </button>
        <button type="button" class="button is-link" @click="$emit('cancel')">
          {{ $t('main.cancel') }}
        </button>
      </p>
    </form>
  </base-modal>
</template>

<script setup>
import { AlertTriangleIcon } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { getUserDay, utcDayToLocalDate } from '@/lib/time'

import BaseModal from '@/components/modals/BaseModal.vue'
import DateField from '@/components/widgets/DateField.vue'
import TextField from '@/components/widgets/TextField.vue'

const { t } = useI18n()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  dayOffToEdit: { type: Object, default: () => ({}) },
  errorText: { type: String, default: '' },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({
  startDate: null,
  endDate: null,
  description: null
})

// Computed

const isEditing = computed(() => Boolean(props.dayOffToEdit?.id))

const modalTitle = computed(() =>
  isEditing.value ? t('days_off.edit') : t('days_off.add')
)

// Functions

const confirm = () => {
  emit('confirm', {
    ...props.dayOffToEdit,
    date: form.value.startDate,
    end_date: form.value.endDate,
    description: form.value.description
  })
}

const resetForm = () => {
  const today = getUserDay().toDate()
  form.value = {
    startDate: props.dayOffToEdit?.date || today,
    endDate: props.dayOffToEdit?.end_date || props.dayOffToEdit?.date || today,
    description: props.dayOffToEdit?.description || null
  }
}

// Compare the days the utc fields show, whatever the time or the type (Date
// or 'YYYY-MM-DD' string) of their values.
const isBeforeDay = (date, otherDate) =>
  utcDayToLocalDate(date) < utcDayToLocalDate(otherDate)

// The picked date wins and the other one follows, as for the start and due
// dates of a task: Zou refuses a day off that ends before it starts.
const onStartDateChange = date => {
  form.value.startDate = date
  if (date && form.value.endDate && isBeforeDay(form.value.endDate, date)) {
    form.value.endDate = date
  }
}

const onEndDateChange = date => {
  form.value.endDate = date
  if (date && form.value.startDate && isBeforeDay(date, form.value.startDate)) {
    form.value.startDate = date
  }
}

// Watchers

// Reset on each opening: the Days off tab hands the same day off again when
// a row is edited after a cancel.
watch(
  () => props.active,
  isActive => {
    if (isActive) resetForm()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.ml2 {
  margin-left: 2.5em;
}
</style>
