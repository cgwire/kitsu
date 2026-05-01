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
            @update:model-value="validateDates"
            v-model="form.startDate"
          />
        </div>
        <div class="flexrow-item">
          <label class="label">
            {{ $t('main.end_date') }}
          </label>
          <date-field
            utc
            week-days-disabled
            @update:model-value="validateDates"
            v-model="form.endDate"
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
import moment from 'moment-timezone'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

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
  const today = moment().utc().toDate()
  form.value = {
    startDate: props.dayOffToEdit?.date || today,
    endDate: props.dayOffToEdit?.end_date || props.dayOffToEdit?.date || today,
    description: props.dayOffToEdit?.description || null
  }
}

const validateDates = () => {
  if (
    form.value.startDate &&
    form.value.endDate &&
    form.value.startDate > form.value.endDate
  ) {
    form.value.endDate = form.value.startDate
  }
}

// Watchers

watch(() => props.dayOffToEdit, resetForm, { immediate: true })
</script>

<style lang="scss" scoped>
.ml2 {
  margin-left: 2.5em;
}
</style>
