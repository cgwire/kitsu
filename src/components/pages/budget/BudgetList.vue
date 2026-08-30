<template>
  <div class="budget-data">
    <div class="has-text-centered mt2" v-if="isLoading">
      <spinner />
    </div>

    <div class="flexrow mt2" v-else-if="isError">
      <p class="list-error">
        {{ $t('budget.budget_entries_error') }}
      </p>
    </div>

    <div class="mt2" v-else-if="budgetDepartments.length === 0">
      <p class="has-text-centered mt1">
        {{ $t('budget.no_budget_entries_found') }}
      </p>
      <p class="has-text-centered mt1">
        <button-simple
          :text="$t('budget.add_entry')"
          @click="$emit('add-budget-entry')"
        />
      </p>
    </div>

    <div class="data-list filler" v-else>
      <div ref="body" class="datatable-wrapper flexcolumn filler">
        <table class="datatable">
          <budget-list-header
            :is-showing-expenses="isShowingExpenses"
            :months-between-start-and-now="monthsBetweenStartAndNow"
            :months-between-now-and-end="monthsBetweenNowAndEnd"
            :months-between-production-dates="monthsBetweenProductionDates"
            @add-budget-entry="$emit('add-budget-entry')"
          />
          <tbody
            class="datatable-body"
            @mousedown="startBrowsing"
            @touchstart="startBrowsing"
          >
            <budget-total-row
              v-bind="commonRowProps"
              :total-entry="totalEntry"
              :hardware-items-costs="hardwareItemsCosts"
              :software-licenses-costs="softwareLicensesCosts"
            />

            <template
              v-for="departmentEntry in extendedBudgetDepartments"
              :key="departmentEntry.id"
            >
              <budget-department-row
                v-bind="commonRowProps"
                :department-entry="departmentEntry"
                :is-showing-items="isShowingItems"
                :is-collapsed="!!collapsedDepartments[departmentEntry.id]"
                :hardware-items-costs="hardwareItemsCosts"
                :software-licenses-costs="softwareLicensesCosts"
                @toggle-department="toggleDepartment"
              />

              <template v-if="!collapsedDepartments[departmentEntry.id]">
                <budget-hardware-item-row
                  v-bind="commonRowProps"
                  :department-entry="departmentEntry"
                  :hardware-items-costs="hardwareItemsCosts"
                  v-if="isShowingItems"
                />

                <budget-software-license-row
                  v-bind="commonRowProps"
                  :department-entry="departmentEntry"
                  :software-licenses-costs="softwareLicensesCosts"
                  v-if="isShowingItems"
                />

                <budget-person-row
                  :key="personEntry.budget_entry_id || personEntry.person_id"
                  v-bind="commonRowProps"
                  :department-entry="departmentEntry"
                  :person-entry="personEntry"
                  @add-person-exception="$emit('add-person-exception', $event)"
                  @delete-budget-entry="$emit('delete-budget-entry', $event)"
                  @edit-budget-entry="$emit('edit-budget-entry', $event)"
                  v-for="personEntry in departmentEntry.persons"
                />
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import { useGrabList } from '@/composables/grabList'
import preferences from '@/lib/preferences'

import BudgetDepartmentRow from '@/components/pages/budget/BudgetDepartmentRow.vue'
import BudgetHardwareItemRow from '@/components/pages/budget/BudgetHardwareItemRow.vue'
import BudgetListHeader from '@/components/pages/budget/BudgetListHeader.vue'
import BudgetPersonRow from '@/components/pages/budget/BudgetPersonRow.vue'
import BudgetSoftwareLicenseRow from '@/components/pages/budget/BudgetSoftwareLicenseRow.vue'
import BudgetTotalRow from '@/components/pages/budget/BudgetTotalRow.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Spinner from '@/components/widgets/Spinner.vue'

// Composables
const store = useStore()
const bodyRef = useTemplateRef('body')
const { startBrowsing } = useGrabList(bodyRef)

// Props / Emits
const props = defineProps({
  budgetDepartments: { type: Array, default: () => [] },
  convertedExpenses: { type: Object, default: () => ({}) },
  donePrevisional: { type: Object, default: () => ({}) },
  extendedBudgetDepartments: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  isShowingExpenses: { type: Boolean, default: false },
  isShowingItems: { type: Boolean, default: false },
  hardwareItemsCosts: { type: Object, required: true },
  softwareLicensesCosts: { type: Object, required: true },
  monthsBetweenStartAndNow: { type: Array, default: () => [] },
  monthsBetweenNowAndEnd: { type: Array, default: () => [] },
  monthsBetweenProductionDates: { type: Array, default: () => [] },
  remainingPrevisional: { type: Object, default: () => ({}) },
  totalEntry: { type: Object, default: () => ({}) }
})
defineEmits([
  'add-budget-entry',
  'add-person-exception',
  'delete-budget-entry',
  'edit-budget-entry'
])

// State
// --------------------------------------------------------------------------
const collapsedDepartments = ref({})

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)

const preferenceKey = computed(
  () => `budget:collapsed-departments-${currentProduction.value.id}`
)

const commonRowProps = computed(() => ({
  isShowingExpenses: props.isShowingExpenses,
  monthsBetweenStartAndNow: props.monthsBetweenStartAndNow,
  monthsBetweenNowAndEnd: props.monthsBetweenNowAndEnd,
  monthsBetweenProductionDates: props.monthsBetweenProductionDates,
  convertedExpenses: props.convertedExpenses,
  donePrevisional: props.donePrevisional,
  remainingPrevisional: props.remainingPrevisional
}))

// Functions
// --------------------------------------------------------------------------
const toggleDepartment = departmentId => {
  collapsedDepartments.value[departmentId] =
    !collapsedDepartments.value[departmentId]
  preferences.setObjectPreference(
    preferenceKey.value,
    collapsedDepartments.value
  )
}

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  collapsedDepartments.value =
    preferences.getObjectPreference(preferenceKey.value) || {}
})
</script>
