<template>
  <base-modal :active="active" :title="modalTitle" @cancel="$emit('cancel')">
    <form @submit.prevent="confirm">
      <div class="day-off-dates">
        <div class="field">
          <label class="label">
            {{ $t('main.start_date') }}
          </label>
          <date-field
            utc
            week-days-disabled
            :can-delete="false"
            :with-margin="false"
            :model-value="form.startDate"
            @update:model-value="onStartDateChange"
          />
        </div>
        <arrow-right-icon class="day-off-arrow" />
        <div class="field">
          <label class="label">
            {{ $t('main.end_date') }}
          </label>
          <date-field
            utc
            week-days-disabled
            :with-margin="false"
            :model-value="form.endDate"
            @update:model-value="onEndDateChange"
          />
        </div>
        <span class="day-off-count" v-if="nbDays !== null">
          {{ $t('days_off.nb_days', { count: nbDays }) }}
        </span>
      </div>
      <text-field
        :label="`${$t('main.description')} (${$t('main.optional')})`"
        :required="false"
        v-model.trim="form.description"
      />
      <p class="day-off-warning">
        <alert-triangle-icon class="icon" />
        {{ $t('days_off.confirm_day_offs') }}
      </p>
      <p class="is-danger has-text-right" v-if="isError">
        {{ errorText || $t('days_off.error_days_off') }}
      </p>
      <p class="has-text-right mt2">
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
import { AlertTriangleIcon, ArrowRightIcon } from 'lucide-vue-next'
import moment from 'moment-timezone'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { getBusinessDays, getUserDay, utcDayToLocalDate } from '@/lib/time'

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

const nbDays = computed(() =>
  form.value.startDate && form.value.endDate
    ? getBusinessDays(
        moment.utc(form.value.startDate),
        moment.utc(form.value.endDate)
      )
    : null
)

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

// Reset on each opening, and when another day off comes in while open: the
// Days off tab hands the same day off again when a row is edited after a
// cancel, and Shift+Tab reaches its add button behind the open form. Both
// lists hand a stable day off, so a list update keeps the picks.
watch(
  [() => props.active, () => props.dayOffToEdit],
  ([isActive]) => {
    if (isActive) resetForm()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.day-off-dates {
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em 1em;
  margin-bottom: 1.5em;

  .field {
    margin-bottom: 0;
  }
}

.day-off-arrow {
  color: var(--text);
  height: 18px;
  margin-bottom: 10px;
  opacity: 0.6;
  width: 18px;
}

.day-off-count {
  background: rgba(var(--skeleton-rgb), 0.25);
  border-radius: 999px;
  color: var(--text-strong);
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 8px;
  padding: 0.15em 0.75em;
}

.day-off-warning {
  align-items: flex-start;
  background: rgba($orange, 0.15);
  border-radius: 8px;
  color: var(--text-strong);
  display: flex;
  gap: 0.75em;
  margin-top: 1.5em;
  padding: 0.75em 1em;

  .icon {
    color: $orange;
    flex-shrink: 0;
    height: 18px;
    margin-top: 2px;
    width: 18px;
  }
}
</style>
