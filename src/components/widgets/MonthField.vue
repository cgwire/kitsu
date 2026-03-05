<template>
  <div class="month-field flexcolumn">
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <div class="date-selector">
      <combobox-number :options="availableYears" v-model="selectedYear" />
      <combobox-number :options="availableMonths" v-model="selectedMonth" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import moment from 'moment'
import { range } from '@/lib/time'

import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  minDate: {
    type: Date,
    required: true
  },
  maxDate: {
    type: Date,
    required: true
  },
  modelValue: {}
})

const emit = defineEmits(['update:modelValue'])

const selectedMonth = ref(null)
const selectedYear = ref(null)
const months = ref([])
const silent = ref(false)

onMounted(() => {
  months.value = range(1, 12).map(month => ({
    value: month - 1,
    label: moment()
      .month(month - 1)
      .format('MMMM')
  }))
  if (props.modelValue && props.modelValue.getMonth) {
    selectedMonth.value = props.modelValue.getMonth()
    selectedYear.value = props.modelValue.getFullYear()
  }
})

const availableYears = computed(() => {
  const years = []
  const startYear = props.minDate.getFullYear()
  const endYear = props.maxDate.getFullYear()

  for (let year = startYear; year <= endYear; year++) {
    years.push(year)
  }
  return years.map(year => ({
    value: year,
    label: year
  }))
})

const availableMonths = computed(() => {
  const currentYear = selectedYear.value || availableYears.value[0].value
  const startYear = props.minDate.getFullYear()
  const endYear = props.maxDate.getFullYear()
  const minMonth = props.minDate.getMonth()
  const maxMonth = props.maxDate.getMonth()

  return months.value
    .filter(month => {
      if (currentYear === startYear && currentYear === endYear) {
        // If same year, only show months between start and end
        return month.value >= minMonth && month.value <= maxMonth
      } else if (currentYear === startYear) {
        // If start year, only show months after start date
        return month.value >= minMonth
      } else if (currentYear === endYear) {
        // If end year, only show months before end date
        return month.value <= maxMonth
      }
      return true
    })
    .map(month => ({
      value: month.value,
      label: month.label
    }))
})

watch(
  () => props.modelValue,
  () => {
    silent.value = true
    if (props.modelValue && props.modelValue.getMonth) {
      selectedMonth.value = props.modelValue.getMonth()
      selectedYear.value = props.modelValue.getFullYear()
    }
    nextTick(() => {
      silent.value = false
    })
  }
)

watch(selectedMonth, newMonth => {
  if (silent.value) return
  const date = moment(new Date(selectedYear.value, newMonth, 1, 0, 0, 0, 0))
  emit('update:modelValue', date.startOf('month').toDate())
})

watch(selectedYear, newYear => {
  if (silent.value) return
  nextTick(() => {
    selectedMonth.value = availableMonths.value[0].value
    const date = moment(
      new Date(newYear, selectedMonth.value, 1, 0, 0, 0, 0)
    )
    emit('update:modelValue', date.startOf('month').toDate())
  })
})
</script>

<style lang="scss" scoped>
.date-selector {
  display: flex;
  gap: 1rem;
}
</style>
