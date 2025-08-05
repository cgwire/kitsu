<template>
  <thead class="datatable-head">
    <tr>
      <th class="datatable-row-header department-header-header" colspan="3">
        <div class="flexrow">
          <div class="flexrow-item">
            {{ $t('budget.fields.department') }}
          </div>
          <div class="filler"></div>
          <button-simple
            is-thin
            :text="$t('budget.add_entry')"
            @click="$emit('add-budget-entry')"
          />
        </div>
      </th>
      <th class="datatable-row-header base-salary-header month">
        {{ $t('budget.fields.base_salary') }}
      </th>
      <th class="datatable-row-header duration-header month">
        {{ $t('budget.fields.duration') }}
      </th>
      <template v-if="isShowingExpenses">
        <th
          class="month datatable-row-header cost-column"
          :key="month"
          v-for="month in monthsBetweenStartAndNow"
        >
          {{
            month.month() === 0 ? month.format('MMM / YY') : month.format('MMM')
          }}
        </th>
        <th
          class="datatable-row-header has-text-right cost-column total-column"
        >
          {{ $t('budget.costs') }}
        </th>
        <th
          class="datatable-row-header has-text-right cost-column total-column"
        >
          {{ $t('budget.previsional_costs') }}
        </th>
        <th
          class="datatable-row-header has-text-right cost-column total-column"
        >
          {{ $t('budget.difference') }}
        </th>
      </template>
      <th
        :key="month"
        class="month datatable-row-header"
        v-for="month in isShowingExpenses
          ? monthsBetweenNowAndEnd
          : monthsBetweenProductionDates"
      >
        {{
          month.month() === 0 ? month.format('MMM / YY') : month.format('MMM')
        }}
      </th>

      <th
        class="datatable-row-header has-text-right cost-column total-column"
        v-if="isShowingExpenses"
      >
        {{ $t('budget.remaining') }}
      </th>
      <th
        class="datatable-row-header has-text-right cost-column total-column"
        v-if="isShowingExpenses"
      >
        {{ $t('budget.remaining_and_costs') }}
      </th>
      <th class="datatable-row-header has-text-right cost-column total-column">
        {{ $t('budget.previsional_costs') }}
      </th>
      <th
        class="datatable-row-header has-text-right total-column"
        v-if="isShowingExpenses"
      >
        {{ $t('budget.difference') }}
      </th>
      <th class="actions datatable-row-header"></th>
    </tr>
  </thead>
</template>

<script setup>
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

defineEmits(['add-budget-entry'])

defineProps({
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
  }
})
</script>

<style lang="scss" scoped>
.department-header-header {
  max-width: 400px;
  width: 400px;
  min-width: 400px;
  z-index: 5;
}

.total-column {
  background-color: #f0f0f0;
  .dark & {
    background-color: #666;
  }
}
</style>
