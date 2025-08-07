<template>
  <tr class="datatable-row" :key="personEntry.id">
    <td class="position datatable-row-header">
      {{ $t('budget.positions.' + (personEntry.position || 'artist')) }}
    </td>
    <td class="seniority datatable-row-header">
      {{ $t('budget.seniorities.' + (personEntry.seniority || 'junior')) }}
    </td>
    <td class="name datatable-row-header">
      <div class="flexrow">
        <people-avatar
          class="flexrow-item"
          :person="personMap.get(personEntry.person_id)"
          :is-link="false"
          :font-size="12"
          :size="20"
          v-if="personEntry.person_id"
        />
        <people-name
          :person="personMap.get(personEntry.person_id)"
          v-if="personEntry.person_id"
        />
        <span class="new-hiring" v-else>
          {{ $t('budget.new_hiring') }}
        </span>
      </div>
    </td>
    <td class="base-salary-header text-right entry-data">
      {{ (personEntry.monthly_salary || 0).toLocaleString() }}
    </td>
    <td class="duration-header text-right entry-data">
      {{ personEntry.months_duration }}
    </td>

    <template v-if="isShowingExpenses">
      <td
        :key="personEntry.id + '-' + month"
        class="costs"
        v-for="month in monthsBetweenStartAndNow"
      >
        {{ personExpense?.[month.format('YYYY-MM')]?.toLocaleString() }}
      </td>
      <td class="total-cost remaining-previsional" v-if="isShowingExpenses">
        {{ personExpense.total.toLocaleString() }}
      </td>
      <td class="total-cost" v-if="isShowingExpenses">
        {{ personDonePrevisional.toLocaleString() }}
      </td>
      <td
        class="total-cost gap"
        :class="{
          positive: personDonePrevisional > personExpense.total,
          negative: personDonePrevisional < personExpense.total
        }"
        v-if="isShowingExpenses"
      >
        {{ (personDonePrevisional - personExpense.total).toLocaleString() }}
      </td>
    </template>
    <td
      :key="personEntry.id + '-' + month"
      class="month value-cell"
      v-for="month in isShowingExpenses
        ? monthsBetweenNowAndEnd
        : monthsBetweenProductionDates"
    >
      <input
        class="input-editor"
        type="number"
        min="0"
        step="1"
        :value="getMonthCost(personEntry, month)"
        @change="
          $emit('add-person-exception', {
            personEntry,
            month,
            value: $event.target.value
          })
        "
        v-if="personEntry.monthCosts[month.format('YYYY-MM')]"
      />
      <span v-else>&nbsp;</span>
    </td>
    <td class="total-cost remaining-previsional" v-if="isShowingExpenses">
      {{ personRemainingPrevisional.toLocaleString() }}
    </td>
    <td class="total-cost expense-and-remaining" v-if="isShowingExpenses">
      {{ (personExpense.total + personRemainingPrevisional).toLocaleString() }}
    </td>
    <td class="total-cost">
      {{ personEntry.total.toLocaleString() }}
    </td>
    <td
      class="total-cost gap"
      :class="{
        positive: personTotalGap > 0,
        negative: personTotalGap < 0
      }"
      v-if="isShowingExpenses"
    >
      {{ personTotalGap.toLocaleString() }}
    </td>
    <row-actions-cell
      @delete-clicked="$emit('delete-budget-entry', personEntry)"
      @edit-clicked="$emit('edit-budget-entry', personEntry)"
    />
  </tr>
</template>

<script setup>
import { computed, defineProps } from 'vue'

import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'

defineEmits([
  'delete-budget-entry',
  'edit-budget-entry',
  'add-person-exception'
])

const props = defineProps({
  personEntry: {
    type: Object,
    required: true
  },
  departmentEntry: {
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
  personMap: {
    type: Map,
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

const personDonePrevisional = computed(() => {
  return (
    props.donePrevisional[props.departmentEntry.id]?.[
      props.personEntry.budget_entry_id
    ] || 0
  )
})

const personRemainingPrevisional = computed(() => {
  return (
    props.remainingPrevisional[props.departmentEntry.id]?.[
      props.personEntry.budget_entry_id
    ] || 0
  )
})

const personExpense = computed(() => {
  return (
    props.convertedExpenses[props.personEntry.department_id]?.[
      props.personEntry.budget_entry_id
    ] || { total: 0 }
  )
})

const personTotalGap = computed(() => {
  return props.isShowingExpenses
    ? props.personEntry.total -
        (personExpense.value.total + personRemainingPrevisional.value)
    : 0
})

/* It gets the cost of a person for a given month, exceptions are
 * prioritized over the month costs.
 */
const getMonthCost = (personEntry, month) => {
  let monthKey = ''
  if (typeof month === 'string') {
    monthKey = month
  } else {
    monthKey = month.format('YYYY-MM')
  }
  personEntry.exceptions = personEntry.exceptions || {}
  return (
    parseInt(personEntry.exceptions[monthKey]) ||
    parseInt(personEntry.monthCosts[monthKey]) ||
    0
  )
}
</script>

<style lang="scss" scoped>
@use '@/components/pages/budget/budget.scss';
</style>
