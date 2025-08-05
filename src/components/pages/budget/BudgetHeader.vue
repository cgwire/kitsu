<template>
  <div class="budget-header">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>

    <div class="flexrow mt2" v-else-if="isError">
      <p class="list-error">
        {{ $t('budget.budgets_error') }}
      </p>
    </div>

    <div
      class="no-budget has-text-centered mt2"
      v-else-if="!budget || !budget.id"
    >
      <p>
        {{ $t('budget.no_budget_found') }}
      </p>
      <p class="mt1 has-text-centered create-budget-button">
        <button-simple
          :text="$t('budget.create_budget')"
          is-big
          @click="$emit('new-version')"
        />
      </p>
    </div>

    <div class="flexrow mt1" v-else>
      <h3 class="selected-budget flexrow-item">
        <combobox-styled
          :options="budgetOptions"
          :model-value="budget"
          @change="value => $emit('change-budget', value)"
        />
      </h3>
      <button-simple
        class="mr05"
        :title="$t('budget.edit_budget')"
        icon="pencil"
        @click="$emit('edit-budget')"
      />
      <button-simple
        class="mr05"
        :title="$t('budget.delete_budget')"
        icon="trash"
        @click="$emit('delete-budget')"
      />
      <button-simple
        class="mr05"
        :active="isShowingExpenses"
        :is-loading="isLoadingExpenses"
        :text="$t('budget.show_expenses')"
        @click="$emit('toggle-expenses')"
      />
      <button-simple
        class="mr05"
        :active="isShowingItems"
        :text="$t('budget.show_items')"
        @click="$emit('toggle-items')"
      />
      <span class="error" v-if="isErrorExpenses">
        {{ $t('budget.expenses_error') }}
      </span>
      <div class="filler"></div>
      <button-simple
        class="flexrow-item"
        icon="export"
        :title="$t('main.csv.export_file')"
        @click="$emit('export-budget')"
      />
      <button-simple
        :text="$t('budget.new_version')"
        icon="plus"
        @click="$emit('new-version')"
      />
    </div>
  </div>
</template>

<script setup>
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import Spinner from '@/components/widgets/Spinner.vue'

defineProps({
  budgetOptions: {
    type: Array,
    default: () => []
  },
  budget: {
    type: Object
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isError: {
    type: Boolean,
    default: false
  },
  isErrorExpenses: {
    type: Boolean,
    default: true
  },
  isLoadingExpenses: {
    type: Boolean,
    default: false
  },
  isShowingExpenses: {
    type: Boolean,
    default: false
  },
  isShowingItems: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'change-budget',
  'delete-budget',
  'edit-budget',
  'export-budget',
  'new-version',
  'toggle-expenses',
  'toggle-items'
])
</script>

<style lang="scss" scoped>
.no-budget {
  p {
    font-size: 1.6rem;

    .dark & {
      color: $white;
    }
  }
}

.create-budget-button {
  font-size: 2rem;
}

.selected-budget {
  font-size: 1.3rem;
}
</style>
