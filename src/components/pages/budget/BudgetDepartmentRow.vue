<template>
  <tr
    class="datatable-row department-row pointer"
    @click="toggleDepartment(departmentEntry.id)"
  >
    <td class="datatable-row-header strong department-header" colspan="3">
      <div
        class="flexrow department-header-content"
        :style="getDepartmentStyle(departmentEntry.id, '99')"
      >
        <chevron-right-icon
          class="flexrow-item"
          v-if="collapsedDepartments[departmentEntry.id]"
        />
        <chevron-down-icon class="flexrow-item" v-else />
        <div class="flexrow-item">
          {{ departmentMap.get(departmentEntry.id).name }}
        </div>
      </div>
    </td>
    <td
      class="base-salary-header text-right month"
      :style="getDepartmentStyle(departmentEntry.id, '33')"
    ></td>
    <td
      class="duration-header text-right month"
      :style="getDepartmentStyle(departmentEntry.id, '33')"
    ></td>

    <template v-if="isShowingExpenses">
      <td
        :key="month"
        class="month"
        :style="getDepartmentStyle(departmentEntry.id, '33')"
        v-for="month in monthsBetweenStartAndNow"
      >
        {{ departmentExpense?.[month.format('YYYY-MM')]?.toLocaleString() }}
      </td>
      <td
        class="total-cost remaining-previsional"
        :style="getDepartmentStyle(departmentEntry.id, '33')"
        v-if="isShowingExpenses"
      >
        {{ departmentExpense.total.toLocaleString() }}
      </td>
      <td
        class="total-cost"
        :style="getDepartmentStyle(departmentEntry.id, '33')"
        v-if="isShowingExpenses"
      >
        {{ departmentDonePrevisional.toLocaleString() }}
      </td>
      <td
        class="total-cost gap"
        :style="getDepartmentStyle(departmentEntry.id, '33')"
        :class="{
          positive: departmentDonePrevisional > departmentExpense.total,
          negative: departmentDonePrevisional < departmentExpense.total
        }"
        v-if="isShowingExpenses"
      >
        {{
          (departmentDonePrevisional - departmentExpense.total).toLocaleString()
        }}
      </td>
    </template>
    <td
      :key="departmentEntry.id + '-' + month"
      class="month"
      :style="getDepartmentStyle(departmentEntry.id, '33')"
      v-for="month in isShowingExpenses
        ? monthsBetweenNowAndEnd
        : monthsBetweenProductionDates"
    >
      {{ getDepartmentMonthCost(departmentEntry, month) || '' }}
    </td>
    <td
      class="total-cost remaining-previsional"
      :style="getDepartmentStyle(departmentEntry.id, '33')"
      v-if="isShowingExpenses"
    >
      {{ departmentRemainingPrevisional.toLocaleString() }}
    </td>
    <td
      :style="getDepartmentStyle(departmentEntry.id, '33')"
      class="total-cost expense-and-remaining"
      v-if="isShowingExpenses"
    >
      {{
        (
          departmentExpense.total + departmentRemainingPrevisional
        ).toLocaleString()
      }}
    </td>
    <td
      class="total-cost"
      :style="getDepartmentStyle(departmentEntry.id, '33')"
    >
      {{ getDepartmentMonthCost(departmentEntry, 'total') || '' }}
    </td>
    <td
      class="total-cost gap"
      :style="getDepartmentStyle(departmentEntry.id, '33')"
      :class="{
        positive: departmentTotalGap > 0,
        negative: departmentTotalGap < 0
      }"
      v-if="isShowingExpenses"
    >
      {{ departmentTotalGap.toLocaleString() }}
    </td>
    <td
      class="actions"
      :style="getDepartmentStyle(departmentEntry.id, '33')"
    ></td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

import { ChevronDownIcon, ChevronRightIcon } from 'lucide-vue-next'

const props = defineProps({
  departmentEntry: {
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
  hardwareItemsCosts: {
    type: Object,
    required: true
  },
  softwareLicensesCosts: {
    type: Object,
    required: true
  },
  collapsedDepartments: {
    type: Object,
    required: true
  },
  departmentMap: {
    type: Object,
    required: true
  },
  toggleDepartment: {
    type: Function,
    required: true
  }
})

const departmentExpense = computed(() => {
  return props.convertedExpenses[props.departmentEntry.id] || { total: 0 }
})

const departmentDonePrevisional = computed(() => {
  return props.donePrevisional[props.departmentEntry.id]?.total || 0
})

const departmentRemainingPrevisional = computed(() => {
  return props.remainingPrevisional[props.departmentEntry.id]?.total || 0
})

const departmentTotalGap = computed(() => {
  return props.isShowingExpenses
    ? props.departmentEntry.total -
        (departmentExpense.value.total + departmentRemainingPrevisional.value)
    : 0
})

/* It sets the background with the color of the department. */
const getDepartmentStyle = (departmentId, opacity) => {
  return {
    backgroundColor: props.departmentMap.get(departmentId).color + opacity
  }
}

/*
 * It returns the total cost for a given department and a given month:
 * salaries and items.
 * 'total' is a valid key to get the total cost for all the months.
 */
const getDepartmentMonthCost = (departmentEntry, month) => {
  const monthKey = month === 'total' ? month : month.format('YYYY-MM')
  let cost =
    month === 'total'
      ? departmentEntry.total
      : departmentEntry.monthCosts[monthKey] || 0
  if (props.isShowingItems) {
    cost += props.hardwareItemsCosts[departmentEntry.id]?.[monthKey] || 0
    cost += props.softwareLicensesCosts[departmentEntry.id]?.[monthKey] || 0
  }
  return cost ? cost.toLocaleString() : ''
}
</script>

<style lang="scss" scoped>
@use '@/components/pages/budget/budget.scss';

.department-header {
  max-width: 400px;
  min-width: 400px;
  position: sticky;
  padding: 0;
}

.department-header-content {
  color: $white;
  height: 100%;
  min-width: 400px;
  max-width: 400px;
  padding: 0.6em 1em;
}
</style>
