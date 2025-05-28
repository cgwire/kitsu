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
          <thead class="datatable-head">
            <tr>
              <th
                class="datatable-row-header department-header-header"
                colspan="3"
              >
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
                    month.month() === 0
                      ? month.format('MMM / YY')
                      : month.format('MMM')
                  }}
                </th>
                <th class="datatable-row-header has-text-right cost-column">
                  {{ $t('budget.costs') }}
                </th>
                <th class="datatable-row-header has-text-right cost-column">
                  {{ $t('budget.remaining') }}
                </th>
                <th
                  class="datatable-row-header has-text-right cost-column difference"
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
                  month.month() === 0
                    ? month.format('MMM / YY')
                    : month.format('MMM')
                }}
              </th>
              <th class="datatable-row-header has-text-right">
                {{ $t('main.total') }} ({{ currency }})
              </th>
              <th class="actions datatable-row-header"></th>
            </tr>
          </thead>

          <tbody
            class="datatable-body"
            @mousedown="startBrowsing"
            @touchstart="startBrowsing"
          >
            <tr class="datatable-row">
              <td class="datatable-row-header total-header" colspan="3">
                <div class="pa05">
                  {{ $t('main.total') }}
                </div>
              </td>
              <td class="month"></td>
              <td class="month"></td>
              <template v-if="isShowingExpenses">
                <td
                  :key="month"
                  class="month"
                  v-for="month in monthsBetweenStartAndNow"
                >
                  {{
                    convertedExpenses[month.format('YYYY-MM')]?.toLocaleString()
                  }}
                </td>
                <td class="costs expenses" v-if="isShowingExpenses">
                  {{ convertedExpenses.total?.toLocaleString() }}
                </td>
                <td class="remaining expenses" v-if="isShowingExpenses">
                  {{
                    (
                      totalEntry.total - (convertedExpenses.total || 0)
                    ).toLocaleString()
                  }}
                </td>
                <td
                  class="difference expenses"
                  :class="{
                    positive: differences.total > 0,
                    negative: differences.total < 0
                  }"
                  v-if="isShowingExpenses"
                >
                  {{ differences.total > 0 ? '+' : '' }}
                  {{ differences.total?.toLocaleString() || '' }}
                </td>
              </template>

              <td
                class="month"
                :key="month"
                v-for="month in isShowingExpenses
                  ? monthsBetweenNowAndEnd
                  : monthsBetweenProductionDates"
              >
                {{
                  totalEntry.monthCosts[
                    month.format('YYYY-MM')
                  ]?.toLocaleString()
                }}
              </td>

              <td class="total-cost">
                {{ totalEntry.total.toLocaleString() }}
              </td>
              <td class="actions"></td>
            </tr>

            <template
              v-for="departmentEntry in extendedBudgetDepartments"
              :key="departmentEntry.id"
            >
              <tr
                class="datatable-row department-row pointer"
                @click="toggleDepartment(departmentEntry.id)"
              >
                <td
                  class="datatable-row-header strong department-header"
                  colspan="3"
                >
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
                    {{
                      convertedExpenses[departmentEntry.id]?.[
                        month.format('YYYY-MM')
                      ]?.toLocaleString()
                    }}
                  </td>
                  <td
                    class="costs expenses"
                    :style="getDepartmentStyle(departmentEntry.id, '33')"
                    v-if="isShowingExpenses"
                  >
                    {{
                      convertedExpenses[
                        departmentEntry.id
                      ]?.total?.toLocaleString()
                    }}
                  </td>
                  <td
                    class="remaining expenses"
                    :style="getDepartmentStyle(departmentEntry.id, '33')"
                    v-if="isShowingExpenses"
                  >
                    {{
                      (
                        departmentEntry.total -
                        (convertedExpenses[departmentEntry.id]?.total || 0)
                      ).toLocaleString()
                    }}
                  </td>
                  <td
                    class="difference expenses"
                    :class="{
                      positive: differences[departmentEntry.id]?.total > 0,
                      negative: differences[departmentEntry.id]?.total < 0
                    }"
                    :style="getDepartmentStyle(departmentEntry.id, '33')"
                    v-if="isShowingExpenses"
                  >
                    {{ differences[departmentEntry.id]?.total > 0 ? '+' : '' }}
                    {{
                      differences[
                        departmentEntry.id
                      ]?.total?.toLocaleString() || ''
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
                  {{
                    departmentEntry.monthCosts[
                      month.format('YYYY-MM')
                    ]?.toLocaleString()
                  }}
                </td>
                <td
                  class="total-cost"
                  :style="getDepartmentStyle(departmentEntry.id, '33')"
                >
                  {{ departmentEntry.total.toLocaleString() }}
                </td>
                <td
                  class="actions"
                  :style="getDepartmentStyle(departmentEntry.id, '33')"
                ></td>
              </tr>

              <template v-if="!collapsedDepartments[departmentEntry.id]">
                <tr
                  class="datatable-row"
                  :key="personEntry.id"
                  v-for="personEntry in departmentEntry.persons"
                >
                  <td class="position datatable-row-header">
                    {{
                      $t('budget.positions.' + personEntry.position || 'artist')
                    }}
                  </td>
                  <td class="seniority datatable-row-header">
                    {{
                      $t(
                        'budget.seniorities.' + personEntry.seniority ||
                          'junior'
                      )
                    }}
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
                      {{
                        convertedExpenses[departmentEntry.id]?.[
                          personEntry.person_id
                        ]?.[month.format('YYYY-MM')]?.toLocaleString()
                      }}
                    </td>
                    <td class="costs expenses" v-if="isShowingExpenses">
                      {{
                        convertedExpenses[
                          departmentEntry.id
                        ]?.total?.toLocaleString()
                      }}
                    </td>
                    <td class="remaining expenses" v-if="isShowingExpenses">
                      {{
                        (
                          personEntry.total -
                            convertedExpenses[departmentEntry.id]?.[
                              personEntry.person_id
                            ]?.total || 0
                        ).toLocaleString()
                      }}
                    </td>
                    <td
                      class="difference expenses"
                      :class="{
                        positive:
                          differences[departmentEntry.id]?.[
                            personEntry.person_id
                          ] > 0,
                        negative:
                          differences[departmentEntry.id]?.[
                            personEntry.person_id
                          ] < 0
                      }"
                      v-if="isShowingExpenses"
                    >
                      {{
                        differences[departmentEntry.id]?.[
                          personEntry.person_id
                        ] > 0
                          ? '+'
                          : ''
                      }}
                      {{
                        differences[departmentEntry.id]?.[
                          personEntry.person_id
                        ]?.toLocaleString() || ''
                      }}
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
                        addPersonException(
                          personEntry,
                          month,
                          $event.target.value
                        )
                      "
                      v-if="personEntry.monthCosts[month.format('YYYY-MM')]"
                    />
                    <span v-else>&nbsp;</span>
                  </td>
                  <td class="total-cost">
                    {{ personEntry.total.toLocaleString() }}
                  </td>
                  <row-actions-cell
                    class="actions"
                    :entry-id="personEntry.id"
                    :hide-avatar="true"
                    :hide-change-password="true"
                    :hide-delete="false"
                    :hide-refresh="true"
                    @delete-clicked="$emit('delete-budget-entry', personEntry)"
                    @edit-clicked="$emit('edit-budget-entry', personEntry)"
                  />
                </tr>
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

import { ChevronDownIcon, ChevronRightIcon } from 'lucide-vue-next'

import preferences from '@/lib/preferences'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import PeopleName from '@/components/widgets/PeopleName.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'budget-list',

  mixins: [domMixin, grabListMixin],

  emits: ['add-budget-entry', 'delete-budget-entry', 'edit-budget-entry'],

  components: {
    ButtonSimple,
    ChevronDownIcon,
    ChevronRightIcon,
    PeopleName,
    PeopleAvatar,
    RowActionsCell,
    Spinner
  },

  props: {
    budgetEntries: {
      type: Array,
      default: () => []
    },
    budgetDepartments: {
      type: Array,
      default: () => []
    },
    costsMonths: {
      type: Object,
      default: () => {}
    },
    currency: {
      type: String,
      default: 'USD'
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
        convertedExpenses[departmentId] = {}

        Object.keys(expenses[departmentId]).forEach(personId => {
          let personTotal = 0
          const dailyRate = this.getDailyRate(departmentId, personId)

          convertedExpenses[departmentId][personId] = {}
          Object.keys(expenses[departmentId][personId]).forEach(month => {
            const timeSpent = expenses[departmentId][personId][month]
            const cost = this.convertTimeSpentToCost(dailyRate, timeSpent)
            convertedExpenses[departmentId][personId][month] = cost
            if (!convertedExpenses[departmentId][month]) {
              convertedExpenses[departmentId][month] = 0
            }
            convertedExpenses[departmentId][month] += cost
            if (!convertedExpenses[month]) {
              convertedExpenses[month] = 0
            }
            convertedExpenses[month] += cost
            personTotal += cost
          })

          convertedExpenses[departmentId][personId].total = personTotal
          departmentTotal += personTotal
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

    /* It calculates the difference between the consumed budget and the
     * expenses. It runs through all the departments and persons and
     * calculates the difference for each person. It aggregates the
     */
    differences() {
      const differences = { total: 0 }
      this.budgetDepartments.forEach(department => {
        if (!differences[department.id]) {
          differences[department.id] = { total: 0 }
        }
        department.persons.forEach(person => {
          if (!person.person_id) return
          if (!differences[department.id][person.person_id]) {
            differences[department.id][person.person_id] = 0
          }
          let personTotal = 0
          Object.keys(this.costsMonths).forEach(month => {
            personTotal += this.getMonthCost(person, month)
          })
          const expense =
            this.convertedExpenses[department.id]?.[person.person_id]?.total ||
            0
          const personDifference = personTotal - expense || 0
          differences[department.id][person.person_id] += personDifference
          differences[department.id].total += personDifference
        })
        differences.total += differences[department.id].total
      })
      return differences
    }
  },

  methods: {
    ...mapActions(['updateProductionBudgetEntry']),

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
      return Math.round(days * dailyRate)
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

    /* It sets the background with the color of the department. */
    getDepartmentStyle(departmentId, opacity) {
      return {
        backgroundColor: this.departmentMap.get(departmentId).color + opacity
      }
    },

    /* It sets an salary exception for a person, for a given month. */
    addPersonException(personEntry, month, value) {
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

<style lang="scss" scoped>
.datatable-wrapper {
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
}

.department-header-header {
  max-width: 400px;
  width: 400px;
  min-width: 400px;
  z-index: 5;
}

.data-list {
  margin-top: 2em;
}

.department-header {
  max-width: 400px;
  min-width: 400px;
  position: sticky;
  padding: 0;
}

.department-header-content {
  color: white;
  height: 100%;
  min-width: 400px;
  max-width: 400px;
  padding: 0.6em 1em;
}

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

td.entry-data {
  text-align: right;
  max-width: 80px;
  min-width: 80px;
  width: 80px;
  padding: 10px;
}

.position {
  max-width: 100px;
  min-width: 100px;
  width: 100px;
}

.seniority {
  max-width: 100px;
  min-width: 100px;
  width: 100px;
}

.name {
  max-width: 200px;
  width: 200px;
}

td.datatable-row-header.seniority {
  left: 100px;
}

td.datatable-row-header.name {
  left: 200px;
}

.actions {
  min-width: 120px;
}

.total-cost {
  font-weight: bold;
  text-align: right;
  max-width: 100px;
  width: 100px;
}

.costs,
.remaining,
.difference {
  text-align: right;
  max-width: 100px;
  width: 100px;
}

.difference {
  border-right: 3px solid $green;
}

.new-hiring {
  background: $light-grey-light;
  color: $dark-grey-2;
  padding: 0.5em 1em;
  border-radius: 5px;
  font-size: 0.8rem;

  .dark & {
    background: $dark-grey-light;
    color: $light-grey;
  }
}

.input-editor {
  width: 100%;
  text-align: right;
}

.cost-column {
  background-color: #8888cc;
  color: white;
}

.expenses {
  font-weight: bold;

  &.positive {
    color: $green;
  }

  &.negative {
    color: $red;
  }
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
