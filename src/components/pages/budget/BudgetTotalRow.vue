<template>
  <tr class="datatable-row">
    <td class="datatable-row-header total-header" colspan="3">
      <div class="pa05">
        {{ $t('main.total') }}
      </div>
    </td>
    <td class="month"></td>
    <td class="month"></td>
    <template v-if="isShowingExpenses">
      <td :key="month" class="month" v-for="month in monthsBetweenStartAndNow">
        {{ convertedExpenses[month.format('YYYY-MM')]?.toLocaleString() }}
      </td>
      <td class="total-cost costs expenses" v-if="isShowingExpenses">
        {{ convertedExpenses.total?.toLocaleString() }}
      </td>
      <td class="total-cost" v-if="isShowingExpenses">
        {{ donePrevisional.total?.toLocaleString() }}
      </td>
      <td
        class="total-cost gap"
        :class="{
          positive: donePrevisional.total > convertedExpenses.total,
          negative: donePrevisional.total < convertedExpenses.total
        }"
        v-if="isShowingExpenses"
      >
        {{ (donePrevisional.total - convertedExpenses.total).toLocaleString() }}
      </td>
    </template>

    <td
      class="month"
      :key="month"
      v-for="month in isShowingExpenses
        ? monthsBetweenNowAndEnd
        : monthsBetweenProductionDates"
    >
      {{ getTotalMonthCost(month) }}
    </td>

    <td class="total-cost remaining-previsional" v-if="isShowingExpenses">
      {{ remainingPrevisional.total?.toLocaleString() }}
    </td>
    <td class="total-cost expense-and-remaining" v-if="isShowingExpenses">
      {{
        (convertedExpenses.total + remainingPrevisional.total).toLocaleString()
      }}
    </td>
    <td class="total-cost">
      {{ getTotalMonthCost('total') }}
    </td>
    <td
      class="total-cost gap"
      :class="{
        positive: totalGap > 0,
        negative: totalGap < 0
      }"
      v-if="isShowingExpenses"
    >
      {{ totalGap.toLocaleString() }}
    </td>
    <td class="actions"></td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  budgetDepartments: {
    type: Array,
    default: () => []
  },
  totalEntry: {
    type: Object,
    required: true
  },
  isShowingExpenses: {
    type: Boolean,
    required: true
  },
  isShowingItems: {
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
  hardwareItemsCosts: {
    type: Object,
    required: true
  },
  softwareLicensesCosts: {
    type: Object,
    required: true
  },
  convertedExpenses: {
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
  }
})

const totalGap = computed(() => {
  return props.isShowingExpenses
    ? props.totalEntry.total -
        (props.convertedExpenses.total + props.remainingPrevisional.total)
    : 0
})

/*
 * It returns the total cost for a given month: salaries and items.
 * 'total' is a valid key to get the total cost for all the months.
 */
const getTotalMonthCost = month => {
  const monthKey = month === 'total' ? month : month.format('YYYY-MM')
  const cost =
    month === 'total'
      ? props.totalEntry.total
      : props.totalEntry.monthCosts[monthKey] || 0
  return cost ? cost.toLocaleString() : ''
}
</script>

<style lang="scss" scoped>
th.month {
  text-align: center;
  max-width: 80px;
  min-width: 80px;
  width: 80px;
}

td.month {
  text-align: right;
  max-width: 80px;
  min-width: 80px;
  width: 80px;
}

.total-cost {
  font-weight: bold;
  text-align: right;
  max-width: 100px;
  width: 100px;
}
</style>
