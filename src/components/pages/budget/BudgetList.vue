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
              :total-entry="totalEntry"
              :is-showing-expenses="isShowingExpenses"
              :is-showing-items="isShowingItems"
              :months-between-start-and-now="monthsBetweenStartAndNow"
              :months-between-now-and-end="monthsBetweenNowAndEnd"
              :months-between-production-dates="monthsBetweenProductionDates"
              :converted-expenses="convertedExpenses"
              :hardware-items-costs="hardwareItemsCosts"
              :software-licenses-costs="softwareLicensesCosts"
              :done-previsional="doneSubset"
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
                :done-previsional="doneSubset"
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
                  :done-previsional="doneSubset"
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
                  :done-previsional="doneSubset"
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
                  :done-previsional="doneSubset"
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
    expenses: {
      type: Object,
      default: () => {}
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
    linkedHardwareItems: {
      type: Object,
      required: true
    },
    linkedSoftwareLicenses: {
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
    salaryScale: {
      type: Object,
      default: () => {}
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
    ...mapGetters([
      'currentProduction',
      'departmentMap',
      'personMap',
      'organisation'
    ]),

    /* It converts the expenses to the budget format where there is an
     * entry for each department and each person. It also calculates the totals
     * for each person, department and for all the departments.
     * It also converts the time spent to a cost.
     */
    convertedExpenses() {
      const convertedExpenses = {}
      const expenses = this.expenses || {}
      let total = 0
      Object.keys(expenses).forEach(departmentId => {
        let departmentTotal = 0
        convertedExpenses[departmentId] = {
          'software-licenses': { total: 0 },
          'hardware-items': { total: 0 }
        }
        const licenses = this.linkedSoftwareLicenses[departmentId] || []
        const items = this.linkedHardwareItems[departmentId] || []
        const monthlySoftwareLicensesCosts = licenses.reduce((acc, item) => {
          return acc + item.monthly_cost
        }, 0)
        const monthlyHardwareItemsCosts = items.reduce((acc, item) => {
          return acc + item.monthly_cost
        }, 0)

        Object.keys(expenses[departmentId]).forEach(personId => {
          let personTotal = 0
          let personTotalWithItems = 0

          const dailyRate = this.getDailyRate(departmentId, personId)

          convertedExpenses[departmentId][personId] = {}
          Object.keys(expenses[departmentId][personId]).forEach(month => {
            if (month === 'total') return

            // Salaries
            const timeSpent = expenses[departmentId][personId][month]
            const { cost, ratio } = this.convertTimeSpentToCost(
              dailyRate,
              timeSpent
            )
            convertedExpenses[departmentId][personId][month] = cost
            if (!convertedExpenses[departmentId][month]) {
              convertedExpenses[departmentId][month] = 0
            }

            // Hardware and software
            let costWithItems = cost
            if (this.isShowingItems && cost > 0) {
              if (
                !convertedExpenses[departmentId]['software-licenses'][month]
              ) {
                convertedExpenses[departmentId]['software-licenses'][month] = 0
              }
              if (!convertedExpenses[departmentId]['hardware-items'][month]) {
                convertedExpenses[departmentId]['hardware-items'][month] = 0
              }
              const softwareCost = Math.round(
                monthlySoftwareLicensesCosts * ratio
              )
              const hardwareCost = Math.round(monthlyHardwareItemsCosts * ratio)
              convertedExpenses[departmentId]['software-licenses'][month] +=
                softwareCost
              convertedExpenses[departmentId]['software-licenses'].total +=
                softwareCost
              convertedExpenses[departmentId]['hardware-items'][month] +=
                hardwareCost
              convertedExpenses[departmentId]['hardware-items'].total +=
                hardwareCost
              costWithItems += softwareCost + hardwareCost
            }

            convertedExpenses[departmentId][month] += costWithItems
            if (!convertedExpenses[month]) {
              convertedExpenses[month] = 0
            }
            convertedExpenses[month] += costWithItems
            personTotal += cost
            personTotalWithItems += costWithItems
          })

          convertedExpenses[departmentId][personId].total = personTotal
          departmentTotal += personTotalWithItems
        })
        convertedExpenses[departmentId].total = departmentTotal
        total += departmentTotal
      })
      convertedExpenses.total = total
      return convertedExpenses
    },

    /* It extends the budget departments with the expenses that don't have
     * equivalent entries in the budget departments. It also adds the new
     * departments to the budget departments if needed.
     */
    extendedBudgetDepartments() {
      if (!this.isShowingExpenses) return this.budgetDepartments

      const existingDepartments = this.budgetDepartments.reduce(
        (acc, department) => {
          acc[department.id] = true
          return acc
        },
        {}
      )

      const newDepartments = Object.keys(this.expenses)
        .filter(departmentId => !existingDepartments[departmentId])
        .map(departmentId => ({
          id: departmentId,
          monthCosts: {},
          total: 0,
          duration: 0,
          persons: [],
          start_date: null
        }))

      const extendedBudgetDepartments = [
        ...this.budgetDepartments,
        ...newDepartments
      ]

      const existingEntries = extendedBudgetDepartments.reduce(
        (acc, department) => {
          department.persons.forEach(entry => {
            if (!acc[department.id]) {
              acc[department.id] = {}
            }
            acc[department.id][entry.person_id] = true
          })
          return acc
        },
        {}
      )

      Object.keys(this.expenses).forEach(departmentId => {
        if (departmentId === 'total') return
        Object.keys(this.expenses[departmentId]).forEach(personId => {
          if (personId === 'total') return
          if (!existingEntries[departmentId]?.[personId]) {
            const person = this.personMap.get(personId)
            extendedBudgetDepartments
              .find(department => department.id === departmentId)
              .persons.push({
                id: null,
                person_id: personId,
                budget_entry_id: null,
                department_id: departmentId,
                monthCosts: {},
                position: person.position,
                seniority: person.seniority,
                total: 0,
                months_duration: 0,
                monthly_salary: 0,
                daily_salary: person.daily_salary,
                start_date: null,
                exceptions: {}
              })
          }
        })
      })

      return extendedBudgetDepartments
    },

    remainingPrevisional() {
      return this.getPrevisionalSubset(this.monthsBetweenNowAndEnd)
    },

    doneSubset() {
      return this.getPrevisionalSubset(this.monthsBetweenStartAndNow)
    },

    hardwareItemsCosts() {
      return this.getItemCosts(this.linkedHardwareItems)
    },

    softwareLicensesCosts() {
      return this.getItemCosts(this.linkedSoftwareLicenses)
    }
  },

  methods: {
    ...mapActions(['updateProductionBudgetEntry']),

    getPrevisionalSubset(months) {
      const subset = { total: 0 }
      this.budgetDepartments.forEach(department => {
        if (!subset[department.id]) {
          subset[department.id] = { total: 0 }
        }
        department.persons.forEach(person => {
          if (!person.budget_entry_id) {
            return
          }

          if (!subset[department.id][person.budget_entry_id]) {
            subset[department.id][person.budget_entry_id] = 0
          }
          let personTotal = 0
          months.forEach(month => {
            personTotal += this.getMonthCost(person, month)
          })
          subset[department.id][person.budget_entry_id] = personTotal
          subset[department.id].total += personTotal
        })
        if (this.isShowingItems) {
          let softwareCosts = 0
          let hardwareCosts = 0
          months.forEach(month => {
            softwareCosts +=
              this.softwareLicensesCosts[department.id][
                month.format('YYYY-MM')
              ] || 0
            hardwareCosts +=
              this.hardwareItemsCosts[department.id][month.format('YYYY-MM')] ||
              0
          })
          subset[department.id]['software-licenses'] = softwareCosts
          subset[department.id]['hardware-items'] = hardwareCosts
          subset[department.id].total += softwareCosts + hardwareCosts
        }
        subset.total += subset[department.id].total
      })
      return subset
    },
    /*
     * It calculates the cost of the items for each department and each month.
     * It returns an object with the cost of the items for each department and
     * each month.
     */
    getItemCosts(linkedItems) {
      const itemCosts = {}
      this.budgetDepartments.forEach(department => {
        const items = linkedItems[department.id] || []
        const monthlyDepartmentCost = items.reduce((acc, item) => {
          return acc + item.monthly_cost
        }, 0)

        if (!itemCosts[department.id]) {
          itemCosts[department.id] = { total: 0 }
        }
        this.monthsBetweenProductionDates.forEach(month => {
          itemCosts[department.id][month.format('YYYY-MM')] = 0
          department.persons.forEach(person => {
            const personCost = this.getMonthCost(person, month)
            if (personCost > 0) {
              itemCosts[department.id][month.format('YYYY-MM')] +=
                monthlyDepartmentCost
              itemCosts[department.id].total += monthlyDepartmentCost
            }
          })
        })
      })
      return itemCosts
    },

    /* It gets the daily rate of a person, and use the salary scale if
     * no daily rate is available.
     */
    getDailyRate(deparmentId, personId) {
      const person = this.personMap.get(personId)
      if (!person) return 0
      const salaryScale =
        person.seniority && person.position
          ? this.salaryScale[deparmentId][person.position][person.seniority]
          : 0
      return person.daily_salary || salaryScale
    },

    /* It converts the time spent to days then multiply it with the
     * given daily rate.
     */
    convertTimeSpentToCost(dailyRate, timeSpent) {
      const days = timeSpent / 60 / this.organisation.hours_by_day
      const ratio = days / 20
      return { cost: Math.round(days * dailyRate), ratio }
    },

    /* It gets the cost of a person for a given month, exceptions are
     * prioritized over the month costs.
     */
    getMonthCost(personEntry, month) {
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
    },

    /* It toggles the department visibility and save it to local storage. */
    toggleDepartment(departmentId) {
      this.collapsedDepartments[departmentId] =
        !this.collapsedDepartments[departmentId]

      const key = `budget:collapsed-departments-${this.currentProduction.id}`
      preferences.setObjectPreference(key, this.collapsedDepartments)
    },

    /* It sets an salary exception for a person, for a given month. */
    addPersonException({ personEntry, month, value }) {
      value = parseInt(value)
      const exceptions = personEntry.exceptions || {}
      exceptions[month.format('YYYY-MM')] = value
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
