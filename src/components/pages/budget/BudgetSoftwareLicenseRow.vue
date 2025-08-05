<template>
  <tr class="datatable-row">
    <td class="datatable-row-header" colspan="3">
      {{ $t('software_licenses.title') }}
    </td>
    <td></td>
    <td></td>
    <template v-if="isShowingExpenses">
      <td
        :key="'software-' + departmentEntry.id + '-' + month"
        class="costs"
        v-for="month in monthsBetweenStartAndNow"
      >
        {{
          convertedExpenses[departmentEntry.id]?.['software-licenses']?.[
            month.format('YYYY-MM')
          ]?.toLocaleString()
        }}
      </td>
      <td class="total-cost remaining-previsional" v-if="isShowingExpenses">
        {{ departmentSoftwareLicenseExpense.toLocaleString() }}
      </td>
      <td class="total-cost" v-if="isShowingExpenses">
        {{ departmentSoftwareLicenseDonePrevisional.toLocaleString() }}
      </td>
      <td
        class="total-cost gap"
        :class="{
          positive:
            departmentSoftwareLicenseDonePrevisional >
            departmentSoftwareLicenseExpense,
          negative:
            departmentSoftwareLicenseDonePrevisional <
            departmentSoftwareLicenseExpense
        }"
        v-if="isShowingExpenses"
      >
        {{
          (
            departmentSoftwareLicenseDonePrevisional -
            departmentSoftwareLicenseExpense
          ).toLocaleString()
        }}
      </td>
    </template>
    <td
      :key="'software-' + departmentEntry.id + '-' + month"
      class="costs"
      v-for="month in isShowingExpenses
        ? monthsBetweenNowAndEnd
        : monthsBetweenProductionDates"
    >
      {{
        softwareLicensesCosts[departmentEntry.id]?.[month.format('YYYY-MM')] ||
        ''
      }}
    </td>
    <td class="total-cost remaining-previsional" v-if="isShowingExpenses">
      {{ departmentSoftwareLicenseRemainingPrevisional.toLocaleString() }}
    </td>
    <td class="total-cost expense-and-remaining" v-if="isShowingExpenses">
      {{
        (
          departmentSoftwareLicenseExpense +
          departmentSoftwareLicenseRemainingPrevisional
        ).toLocaleString()
      }}
    </td>
    <td class="total-cost">
      {{ softwareLicensesCosts[departmentEntry.id]?.total || '' }}
    </td>
    <td
      class="total-cost gap"
      :class="{
        positive: departmentSoftwareLicenseTotalGap > 0,
        negative: departmentSoftwareLicenseTotalGap < 0
      }"
      v-if="isShowingExpenses"
    >
      {{ departmentSoftwareLicenseTotalGap.toLocaleString() }}
    </td>
    <td class="actions"></td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  departmentEntry: {
    type: Object,
    required: true
  },
  isShowingExpenses: {
    type: Boolean,
    required: true
  },
  donePrevisional: {
    type: Object,
    required: true
  },
  remainingPrevisional: {
    type: Object,
    required: true
  },
  monthsBetweenStartAndNow: {
    type: Array,
    required: true
  },
  monthsBetweenNowAndEnd: {
    type: Array,
    required: true
  },
  monthsBetweenProductionDates: {
    type: Array,
    required: true
  },
  convertedExpenses: {
    type: Object,
    required: true
  },
  softwareLicensesCosts: {
    type: Object,
    required: true
  }
})

const departmentSoftwareLicenseExpense = computed(() => {
  return (
    props.convertedExpenses[props.departmentEntry.id]?.['software-licenses']
      ?.total || 0
  )
})

const departmentSoftwareLicenseRemainingPrevisional = computed(() => {
  return (
    props.remainingPrevisional[props.departmentEntry.id]?.[
      'software-licenses'
    ] || 0
  )
})

const departmentSoftwareLicenseDonePrevisional = computed(() => {
  return (
    props.donePrevisional[props.departmentEntry.id]?.['software-licenses'] || 0
  )
})

const departmentSoftwareLicenseTotalGap = computed(() => {
  return props.isShowingExpenses
    ? (props.softwareLicensesCosts[props.departmentEntry.id]?.total || 0) -
        (departmentSoftwareLicenseExpense.value +
          departmentSoftwareLicenseRemainingPrevisional.value)
    : 0
})
</script>

<style lang="scss" scoped>
@use '@/components/pages/budget/budget.scss';
</style>
