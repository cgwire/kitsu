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
              :budget-departments="budgetDepartments"
              :total-entry="totalEntry"
              :is-showing-expenses="isShowingExpenses"
              :is-showing-items="isShowingItems"
              :months-between-start-and-now="monthsBetweenStartAndNow"
              :months-between-now-and-end="monthsBetweenNowAndEnd"
              :months-between-production-dates="monthsBetweenProductionDates"
              :converted-expenses="convertedExpenses"
              :hardware-items-costs="hardwareItemsCosts"
              :software-licenses-costs="softwareLicensesCosts"
              :done-previsional="donePrevisional"
              :remaining-previsional="remainingPrevisional"
            />

            <template
              v-for="departmentEntry in extendedBudgetDepartments"
              :key="departmentEntry.id"
            >
              <budget-department-row
                :department-entry="departmentEntry"
                :is-showing-expenses="isShowingExpenses"
                :is-showing-items="isShowingItems"
                :months-between-start-and-now="monthsBetweenStartAndNow"
                :months-between-now-and-end="monthsBetweenNowAndEnd"
                :months-between-production-dates="monthsBetweenProductionDates"
                :converted-expenses="convertedExpenses"
                :hardware-items-costs="hardwareItemsCosts"
                :software-licenses-costs="softwareLicensesCosts"
                :collapsed-departments="collapsedDepartments"
                :department-map="departmentMap"
                :done-previsional="donePrevisional"
                :remaining-previsional="remainingPrevisional"
                :toggle-department="toggleDepartment"
              />

              <template v-if="!collapsedDepartments[departmentEntry.id]">
                <budget-hardware-item-row
                  :key="departmentEntry.id"
                  :department-entry="departmentEntry"
                  :is-showing-expenses="isShowingExpenses"
                  :months-between-start-and-now="monthsBetweenStartAndNow"
                  :months-between-now-and-end="monthsBetweenNowAndEnd"
                  :months-between-production-dates="
                    monthsBetweenProductionDates
                  "
                  :converted-expenses="convertedExpenses"
                  :hardware-items-costs="hardwareItemsCosts"
                  :done-previsional="donePrevisional"
                  :remaining-previsional="remainingPrevisional"
                  v-if="isShowingItems"
                />

                <budget-software-license-row
                  :key="departmentEntry.id"
                  :department-entry="departmentEntry"
                  :is-showing-expenses="isShowingExpenses"
                  :months-between-start-and-now="monthsBetweenStartAndNow"
                  :months-between-now-and-end="monthsBetweenNowAndEnd"
                  :months-between-production-dates="
                    monthsBetweenProductionDates
                  "
                  :converted-expenses="convertedExpenses"
                  :software-licenses-costs="softwareLicensesCosts"
                  :done-previsional="donePrevisional"
                  :remaining-previsional="remainingPrevisional"
                  v-if="isShowingItems"
                />

                <budget-person-row
                  :key="personEntry.id"
                  :department-entry="departmentEntry"
                  :person-entry="personEntry"
                  :is-showing-expenses="isShowingExpenses"
                  :months-between-start-and-now="monthsBetweenStartAndNow"
                  :months-between-now-and-end="monthsBetweenNowAndEnd"
                  :months-between-production-dates="
                    monthsBetweenProductionDates
                  "
                  :converted-expenses="convertedExpenses"
                  :person-map="personMap"
                  :done-previsional="donePrevisional"
                  :remaining-previsional="remainingPrevisional"
                  @delete-budget-entry="
                    $emit('delete-budget-entry', personEntry)
                  "
                  @edit-budget-entry="$emit('edit-budget-entry', personEntry)"
                  @add-person-exception="addPersonException($event)"
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

<script>
import { mapGetters, mapActions } from 'vuex'

import { domMixin } from '@/components/mixins/dom'
import { grabListMixin } from '@/components/mixins/grablist'

import preferences from '@/lib/preferences'

import BudgetListHeader from '@/components/pages/budget/BudgetListHeader.vue'
import BudgetHardwareItemRow from '@/components/pages/budget/BudgetHardwareItemRow.vue'
import BudgetSoftwareLicenseRow from '@/components/pages/budget/BudgetSoftwareLicenseRow.vue'
import BudgetPersonRow from '@/components/pages/budget/BudgetPersonRow.vue'
import BudgetTotalRow from '@/components/pages/budget/BudgetTotalRow.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import BudgetDepartmentRow from '@/components/pages/budget/BudgetDepartmentRow.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'budget-list',

  mixins: [domMixin, grabListMixin],

  emits: ['add-budget-entry', 'delete-budget-entry', 'edit-budget-entry'],

  components: {
    BudgetListHeader,
    BudgetPersonRow,
    BudgetHardwareItemRow,
    BudgetSoftwareLicenseRow,
    BudgetTotalRow,
    BudgetDepartmentRow,
    ButtonSimple,
    Spinner
  },

  props: {
    budgetDepartments: {
      type: Array,
      default: () => []
    },
    currentBudget: {
      type: Object,
      default: () => {}
    },
    convertedExpenses: {
      type: Object,
      default: () => ({})
    },
    donePrevisional: {
      type: Object,
      default: () => ({})
    },
    extendedBudgetDepartments: {
      type: Array,
      default: () => []
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
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
    },
    hardwareItemsCosts: {
      type: Object,
      required: true
    },
    softwareLicensesCosts: {
      type: Object,
      required: true
    },
    monthsBetweenStartAndNow: {
      type: Array,
      default: () => []
    },
    monthsBetweenNowAndEnd: {
      type: Array,
      default: () => []
    },
    monthsBetweenProductionDates: {
      type: Array,
      default: () => []
    },
    remainingPrevisional: {
      type: Object,
      default: () => ({})
    },
    totalEntry: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      collapsedDepartments: {},
      domEvents: [
        ['mousemove', this.onMouseMove],
        ['touchmove', this.onMouseMove],
        ['mouseup', this.stopBrowsing],
        ['mouseleave', this.stopBrowsing],
        ['touchend', this.stopBrowsing],
        ['touchcancel', this.stopBrowsing],
        ['keyup', this.stopBrowsing]
      ]
    }
  },

  mounted() {
    const key = `budget:collapsed-departments-${this.currentProduction.id}`
    this.addEvents(this.domEvents)
    this.collapsedDepartments = preferences.getObjectPreference(key) || {}
  },

  beforeUnmount() {
    this.removeEvents(this.domEvents)
    document.body.style.cursor = 'default'
  },

  computed: {
    ...mapGetters(['currentProduction', 'departmentMap', 'personMap'])
  },

  methods: {
    ...mapActions(['updateProductionBudgetEntry']),

    /* It toggles the department visibility and save it to local storage. */
    toggleDepartment(departmentId) {
      this.collapsedDepartments[departmentId] =
        !this.collapsedDepartments[departmentId]

      const key = `budget:collapsed-departments-${this.currentProduction.id}`
      preferences.setObjectPreference(key, this.collapsedDepartments)
    },

    /* It sets a salary exception for a person, for a given month. An empty,
     * zero or negative value clears the override instead: the month falls
     * back to the computed salary rather than storing a 0 exception (which
     * the backend would drop anyway).
     */
    addPersonException({ personEntry, month, value }) {
      const monthKey = month.format('YYYY-MM')
      const exceptions = personEntry.exceptions || {}
      const amount = parseInt(value)
      if (value == null || value === '' || isNaN(amount) || amount <= 0) {
        delete exceptions[monthKey]
      } else {
        exceptions[monthKey] = amount
      }
      personEntry.exceptions = exceptions
      const budgetEntry = {
        id: personEntry.budget_entry_id,
        ...personEntry,
        exceptions
      }
      this.updateProductionBudgetEntry({
        productionId: this.currentProduction.id,
        budgetId: this.currentBudget.id,
        budgetEntryId: personEntry.budget_entry_id,
        budgetEntry
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
