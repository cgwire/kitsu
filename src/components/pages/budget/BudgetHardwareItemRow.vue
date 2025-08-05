<template>
  <tr class="datatable-row">
    <td class="datatable-row-header" colspan="3">
      {{ $t('hardware_items.title') }}
    </td>
    <td></td>
    <td></td>
    <template v-if="isShowingExpenses">
      <td
        :key="'hardware-' + departmentEntry.id + '-' + month"
        class="costs"
        v-for="month in monthsBetweenStartAndNow"
      >
        {{
          convertedExpenses[departmentEntry.id]?.['hardware-items']?.[
            month.format('YYYY-MM')
          ]?.toLocaleString()
        }}
      </td>
      <td class="total-cost remaining-previsional" v-if="isShowingExpenses">
        {{ departmentHardwareItemExpense.toLocaleString() }}
      </td>
      <td class="total-cost" v-if="isShowingExpenses">
        {{ departmentHardwareItemDonePrevisional.toLocaleString() }}
      </td>
      <td
        class="total-cost gap"
        :class="{
          positive:
            departmentHardwareItemDonePrevisional >
            departmentHardwareItemExpense,
          negative:
            departmentHardwareItemDonePrevisional <
            departmentHardwareItemExpense
        }"
        v-if="isShowingExpenses"
      >
        {{
          (
            departmentHardwareItemDonePrevisional -
            departmentHardwareItemExpense
          ).toLocaleString()
        }}
      </td>
    </template>
    <td
      :key="'hardware-' + departmentEntry.id + '-' + month"
      class="costs"
      v-for="month in isShowingExpenses
        ? monthsBetweenNowAndEnd
        : monthsBetweenProductionDates"
    >
      {{
        hardwareItemsCosts[departmentEntry.id]?.[month.format('YYYY-MM')] || ''
      }}
    </td>
    <td class="total-cost remaining-previsional" v-if="isShowingExpenses">
      {{ departmentHardwareItemRemainingPrevisional.toLocaleString() }}
    </td>
    <td class="total-cost expense-and-remaining" v-if="isShowingExpenses">
      {{
        (
          departmentHardwareItemExpense +
          departmentHardwareItemRemainingPrevisional
        ).toLocaleString()
      }}
    </td>
    <td class="total-cost">
      {{ hardwareItemsCosts[departmentEntry.id]?.total }}
    </td>
    <td
      class="total-cost gap"
      :class="{
        positive: departmentHardwareItemTotalGap > 0,
        negative: departmentHardwareItemTotalGap < 0
      }"
      v-if="isShowingExpenses"
    >
      {{ departmentHardwareItemTotalGap.toLocaleString() }}
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
  donePrevisional: {
    type: Object,
    required: true
  },
  remainingPrevisional: {
    type: Object,
    required: true
  },
  isShowingExpenses: {
    type: Boolean,
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
  hardwareItemsCosts: {
    type: Object,
    required: true
  }
})

const departmentHardwareItemExpense = computed(() => {
  return (
    props.convertedExpenses[props.departmentEntry.id]?.['hardware-items']
      ?.total || 0
  )
})

const departmentHardwareItemDonePrevisional = computed(() => {
  return (
    props.donePrevisional[props.departmentEntry.id]?.['hardware-items'] || 0
  )
})

const departmentHardwareItemRemainingPrevisional = computed(() => {
  return (
    props.remainingPrevisional[props.departmentEntry.id]?.['hardware-items'] ||
    0
  )
})

const departmentHardwareItemTotalGap = computed(() => {
  return props.isShowingExpenses
    ? (props.hardwareItemsCosts[props.departmentEntry.id]?.total || 0) -
        (departmentHardwareItemExpense.value +
          departmentHardwareItemRemainingPrevisional.value)
    : 0
})
</script>

<style lang="scss" scoped>
@use '@/components/pages/budget/budget.scss';
</style>
