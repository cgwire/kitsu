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
          :value="budget"
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
      <div class="filler"></div>
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
  budgets: {
    type: Array,
    default: () => []
  },
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
  }
})

defineEmits(['change-budget', 'delete-budget', 'edit-budget', 'new-version'])
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
