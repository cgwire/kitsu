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
<script>
import moment from 'moment'
import { range } from '@/lib/time'

import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'

export default {
  name: 'month-field',

  emits: ['update:modelValue'],
  components: {
    ComboboxNumber
  },

  props: {
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
  },

  data() {
    return {
      selectedMonth: null,
      selectedYear: null,
      months: []
    }
  },

  mounted() {
    this.months = range(1, 12).map(month => ({
      value: month - 1,
      label: moment()
        .month(month - 1)
        .format('MMMM')
    }))
    if (this.modelValue && this.modelValue.getMonth) {
      this.selectedMonth = this.modelValue.getMonth()
      this.selectedYear = this.modelValue.getFullYear()
    }
  },

  computed: {
    availableYears() {
      const years = []
      const startYear = this.minDate.getFullYear()
      const endYear = this.maxDate.getFullYear()

      for (let year = startYear; year <= endYear; year++) {
        years.push(year)
      }
      return years.map(year => ({
        value: year,
        label: year
      }))
    },

    availableMonths() {
      const currentYear = this.selectedYear || this.availableYears[0].value
      const startYear = this.minDate.getFullYear()
      const endYear = this.maxDate.getFullYear()
      const minMonth = this.minDate.getMonth()
      const maxMonth = this.maxDate.getMonth()

      return this.months
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
    }
  },

  watch: {
    modelValue() {
      this.$options.silent = true
      if (this.modelValue && this.modelValue.getMonth) {
        this.selectedMonth = this.modelValue.getMonth()
        this.selectedYear = this.modelValue.getFullYear()
      }
      this.$nextTick(() => {
        this.$options.silent = false
      })
    },

    selectedMonth(newMonth) {
      if (this.$options.silent) return
      const date = moment(new Date(this.selectedYear, newMonth, 1, 0, 0, 0, 0))
      this.$emit('update:modelValue', date.startOf('month').toDate())
    },

    selectedYear(newYear) {
      if (this.$options.silent) return
      this.$nextTick(() => {
        this.selectedMonth = this.availableMonths[0].value
        const date = moment(
          new Date(newYear, this.selectedMonth, 1, 0, 0, 0, 0)
        )
        this.$emit('update:modelValue', date.startOf('month').toDate())
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.date-selector {
  display: flex;
  gap: 1rem;
}
</style>
