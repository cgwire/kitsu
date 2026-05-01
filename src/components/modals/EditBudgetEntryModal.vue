<template>
  <base-modal
    :active="active"
    :title="isEditing ? $t('budget.edit_budget_entry') : $t('budget.add_entry')"
    @cancel="$emit('cancel')"
  >
    <form @submit.prevent>
      <combobox-department
        ref="departmentField"
        :label="$t('budget.fields.department')"
        v-model="form.department_id"
        @enter="runConfirmation"
        v-focus
      />

      <people-field
        class="mt2"
        :label="$t('budget.fields.person')"
        :people="departmentPeople"
        @select="onPersonChanged"
        @enter="runConfirmation"
        v-model="form.person"
      />

      <combobox
        class="mt2"
        :label="$t('budget.fields.position')"
        :options="positionOptions"
        locale-key-prefix="people.position."
        v-model="form.position"
        @enter="runConfirmation"
      />

      <combobox
        class="mt2"
        :label="$t('budget.fields.seniority')"
        :options="seniorityOptions"
        locale-key-prefix="people.seniority."
        v-model="form.seniority"
        @enter="runConfirmation"
      />

      <div class="flexrow">
        <month-field
          class="mr1"
          :label="$t('budget.fields.start_date')"
          :min-date="projectStartDate"
          :max-date="projectEndDate"
          v-model="form.start_date"
        />

        <text-field
          class="month-duration"
          type="number"
          :min="1"
          :max="maxDuration"
          :label="$t('budget.fields.months_duration')"
          v-model="form.months_duration"
          @enter="runConfirmation"
        />

        <text-field
          class="month-duration"
          type="number"
          :min="0"
          :label="$t('budget.fields.daily_salary')"
          v-model="form.daily_salary"
          @enter="runConfirmation"
        />
      </div>
      <div class="mt0">
        <span class="salary-label">{{ $t('budget.fields.start_date') }}</span>
        <span class="salary-value">{{
          formatDate(form.start_date).substring(0, 7)
        }}</span>
        <br />
        <span class="salary-label">{{ $t('budget.fields.end_date') }}</span>
        <span class="salary-value">{{ endMonth }}</span>
        <br />
        <span class="salary-label">
          {{ $t('budget.fields.monthly_salary') }}
        </span>
        <span class="salary-value">{{ monthlySalary }}</span>
        <br />
        <span class="salary-label">{{ $t('budget.fields.total_salary') }}</span>
        <span class="salary-value">{{ totalSalary }}</span>
      </div>
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
import moment from 'moment'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { formatSimpleDate, parseSimpleDate } from '@/lib/time'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import MonthField from '@/components/widgets/MonthField.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import TextField from '@/components/widgets/TextField.vue'

const store = useStore()

// Props / Emits

const props = defineProps({
  active: { type: Boolean, default: false },
  budgetEntryToEdit: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  salaryScale: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['cancel', 'confirm'])

// State

const form = ref({
  department_id: '',
  person: null,
  position: 'artist',
  seniority: 'junior',
  start_date: null,
  months_duration: 1
})
const departmentField = ref(null)

const positionOptions = [
  { label: 'artist', value: 'artist' },
  { label: 'supervisor', value: 'supervisor' },
  { label: 'lead', value: 'lead' }
]
const seniorityOptions = [
  { label: 'junior', value: 'junior' },
  { label: 'mid', value: 'mid' },
  { label: 'senior', value: 'senior' }
]

// Computed

const activePeople = computed(() => store.getters.activePeople)
const currentProduction = computed(() => store.getters.currentProduction)
const personMap = computed(() => store.getters.personMap)

const isEditing = computed(() => Boolean(props.budgetEntryToEdit?.id))

const isDisabled = computed(
  () => !form.value.department_id || form.value.months_duration < 1
)

const projectStartDate = computed(() =>
  parseSimpleDate(currentProduction.value.start_date).toDate()
)

const projectEndDate = computed(() =>
  parseSimpleDate(currentProduction.value.end_date).toDate()
)

const maxDuration = computed(() => {
  const startDate = parseSimpleDate(form.value.start_date)
  const end = parseSimpleDate(currentProduction.value.end_date).endOf('month')
  const months = end.diff(startDate, 'months')
  return months > 0 ? months : 1
})

const endMonth = computed(() => {
  const startDate = parseSimpleDate(form.value.start_date)
  const projectEnd = parseSimpleDate(currentProduction.value.end_date)
  const endDate = moment.min(
    startDate.add(form.value.months_duration, 'months'),
    projectEnd
  )
  return endDate.format('YYYY-MM')
})

const dailySalary = computed(() => {
  if (!form.value.department_id) return 0
  if (!form.value.person || !form.value.person.daily_salary) {
    const departmentScale = props.salaryScale[form.value.department_id]
    return departmentScale[form.value.position || 'artist'][
      form.value.seniority || 'junior'
    ].salary
  }
  return form.value.person.daily_salary
})

const monthlySalary = computed(() => dailySalary.value * 20)

const totalSalary = computed(() => {
  if (!form.value.department_id) return 0
  const duration = Math.min(form.value.months_duration, maxDuration.value)
  return monthlySalary.value * duration
})

const departmentPeople = computed(() => {
  if (!form.value.department_id) return activePeople.value
  return activePeople.value.filter(person =>
    person.departments.includes(form.value.department_id)
  )
})

// Functions

const formatDate = date => formatSimpleDate(date)

const onPersonChanged = person => {
  form.value.position = person?.position || 'artist'
  form.value.seniority = person?.seniority || 'junior'
}

const runConfirmation = () => {
  emit('confirm', {
    ...form.value,
    person_id: form.value.person?.id,
    duration: Math.min(form.value.months_duration, maxDuration.value),
    salary: monthlySalary.value,
    total_salary: totalSalary.value
  })
}

const resetForm = () => {
  if (isEditing.value) {
    const entry = props.budgetEntryToEdit
    const person = personMap.value.get(entry.person_id)
    Object.assign(form.value, {
      id: entry.id,
      department_id: entry.department_id,
      person,
      position: entry.position || 'artist',
      seniority: entry.seniority || 'junior',
      start_date: parseSimpleDate(entry.start_date).toDate(),
      months_duration: entry.months_duration,
      daily_salary: entry.daily_salary
    })
    form.value.person = person
    // Needed to bypass watcher
    nextTick(() => {
      form.value.daily_salary = entry.daily_salary
    })
  } else {
    form.value = {
      id: null,
      department_id: '',
      person: null,
      position: 'artist',
      seniority: 'junior',
      start_date: parseSimpleDate(currentProduction.value.start_date)
        .startOf('month')
        .toDate(),
      months_duration: 1,
      daily_salary: 0
    }
  }
}

// Watchers

watch(
  () => props.active,
  active => {
    if (active) {
      resetForm()
      setTimeout(() => {
        departmentField.value?.focus()
      }, 100)
    }
  }
)

watch(dailySalary, value => {
  form.value.daily_salary = value
})

watch(() => props.budgetEntryToEdit, resetForm)

// Lifecycle

onMounted(resetForm)
</script>

<style lang="scss" scoped>
.salary-label {
  display: inline-block;
  font-weight: bold;
  width: 120px;
}

.salary-value {
  display: inline-block;
  text-align: right;
  width: 80px;
}

.month-duration {
  margin-left: 1em;
  width: 160px;
}
</style>
