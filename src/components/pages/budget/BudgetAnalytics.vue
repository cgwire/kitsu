<template>
  <div class="flexcolumn analytics-container">
    <h3 class="has-text-centered strong mt1">
      {{ $t('budget.analytics') }}
    </h3>

    <div v-if="budgets.length > 0 && budgetDepartments.length > 0">
      <p class="has-text-centered mt1 strong total">
        {{ amount.toLocaleString() }} {{ currency || 'USD' }}
      </p>
      <p class="has-text-centered mt1">
        {{ budgetDepartments.length }} {{ $t('budget.departments') }} -
        {{ budgetEntries.length }} {{ $t('budget.persons') }} -
        {{ monthsBetweenProductionDates.length }} {{ $t('budget.months') }}
      </p>
    </div>
    <div v-if="budgets.length === 0 || budgetDepartments.length === 0">
      <p class="has-text-centered mt2">
        {{ $t('budget.no_analytics_to_show') }}
      </p>
    </div>
    <div class="mt1 flexcolumn" v-else>
      <h4>
        {{ $t('budget.cash_repartition') }}
      </h4>
      <pie-chart
        class="mb1"
        :legend="false"
        :data="pieChartData"
        :colors="pieChartColors"
        height="240px"
      ></pie-chart>
      <h4>
        {{ $t('budget.cash_evolution') }}
      </h4>
      <column-chart :legend="false" :data="columnChartData"></column-chart>
    </div>
  </div>
</template>

<script setup>
defineProps({
  amount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  budgets: {
    type: Array,
    required: true
  },
  budgetDepartments: {
    type: Array,
    required: true
  },
  budgetEntries: {
    type: Array,
    required: true
  },
  monthsBetweenProductionDates: {
    type: Array,
    required: true
  },
  pieChartData: {
    type: Array,
    required: true
  },
  pieChartColors: {
    type: Array,
    required: true
  },
  columnChartData: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.analytics-container {
  background-color: var(--background-panel);
  border-radius: 10px;
  margin-top: 1em;
  margin-right: 1em;
  padding: 1em 1em 2em 1em;

  h3 {
    font-size: 1.2rem;
    font-weight: bold;
  }

  h4 {
    font-weight: bold;
    font-size: 0.9rem;
    margin-top: 2em;
    margin-bottom: 1em;
    text-align: center;
    text-transform: uppercase;
  }

  .total {
    font-size: 1.5rem;
  }
}
</style>
