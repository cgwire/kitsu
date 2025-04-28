<template>
  <page-layout>
    <template #main>
      <div class="flexcolumn page">
        <budget-header
          :budgets="budgets"
          :budget-options="budgetOptions"
          :budget="currentBudget"
          :is-loading="loading.budgets"
          :is-error="errors.budgets"
          @change-budget="onChangeBudget"
          @edit-budget="onEditBudgetClicked"
          @delete-budget="onDeleteBudgetClicked"
          @new-version="onNewBudgetVersionClicked"
        />

        <budget-list
          :budget="currentBudget"
          :budget-departments="budgetDepartments"
          :budget-entries="budgetEntries"
          :currency="currentBudget?.currency || 'USD'"
          :is-loading="loading.entries"
          :is-error="errors.entries"
          :months-between-production-dates="monthsBetweenProductionDates"
          :total-entry="totalEntry"
          @add-budget-entry="onAddBudgetEntry"
          @delete-budget-entry="deleteBudgetEntry"
          @edit-budget-entry="editBudgetEntry"
          v-if="currentBudget.id"
        />

        <edit-budget-modal
          :active="modals.createBudget"
          :budget-to-edit="budgetToEdit"
          :last-revision="lastRevision"
          :is-loading="loading.createBudget || loading.editBudget"
          :is-error="errors.createBudget || errors.editBudget"
          @cancel="modals.createBudget = false"
          @confirm="createBudget"
        />

        <edit-budget-entry-modal
          :active="modals.createBudgetEntry"
          :budget-entry-to-edit="budgetEntryToEdit"
          :salary-scale="salaryScale"
          :is-loading="loading.createBudgetEntry"
          :is-error="errors.createBudgetEntry || errors.editBudgetEntry"
          @cancel="modals.createBudgetEntry = false"
          @confirm="confirmCreateBudgetEntry"
        />

        <hard-delete-modal
          :active="modals.deleteBudget"
          :error-text="$t('budget.delete_budget_error')"
          :is-loading="loading.del"
          :is-error="errors.deleteBudget"
          :lock-text="currentBudget?.name"
          :text="$t('budget.delete_budget_message')"
          @cancel="modals.deleteBudget = false"
          @confirm="deleteBudget"
        />

        <delete-modal
          :active="modals.deleteBudgetEntry"
          :error-text="$t('budget.delete_budget_entry_error')"
          :is-loading="loading.deleteBudgetEntry"
          :is-error="errors.deleteBudgetEntry"
          :text="$t('budget.delete_budget_entry_message')"
          @cancel="modals.deleteBudgetEntry = false"
          @confirm="confirmDeleteBudgetEntry"
        />
      </div>
    </template>

    <template #side>
      <budget-analytics
        :amount="totalEntry.total"
        :currency="currentBudget.currency"
        :budgets="budgets"
        :budget-departments="budgetDepartments"
        :budget-entries="budgetEntries"
        :months-between-production-dates="monthsBetweenProductionDates"
        :pie-chart-data="pieChartData"
        :pie-chart-colors="pieChartColors"
        :column-chart-data="columnChartData"
      />
    </template>
  </page-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

import { pageMixin } from '@/components/mixins/page'
import { formatMonth, parseSimpleDate } from '@/lib/time'

import BudgetAnalytics from '@/components/pages/budget/BudgetAnalytics.vue'
import BudgetHeader from '@/components/pages/budget/BudgetHeader.vue'
import BudgetList from '@/components/pages/budget/BudgetList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditBudgetModal from '@/components/modals/EditBudgetModal.vue'
import EditBudgetEntryModal from '@/components/modals/EditBudgetEntryModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import PageLayout from '@/components/layouts/PageLayout.vue'

const helpers = {
  resetDepartmentTotals(departmentData) {
    departmentData.total = departmentData.persons.reduce(
      (acc, person) => acc + person.total,
      0
    )
    departmentData.monthCosts = departmentData.persons.reduce((acc, person) => {
      Object.keys(person.monthCosts).forEach(month => {
        acc[month] = (acc[month] || 0) + person.monthCosts[month]
      })
      return acc
    }, {})
  }
}

export default {
  name: 'budget',

  mixins: [pageMixin],

  components: {
    BudgetAnalytics,
    BudgetHeader,
    BudgetList,
    DeleteModal,
    EditBudgetEntryModal,
    EditBudgetModal,
    HardDeleteModal,
    PageLayout
  },

  data() {
    return {
      budgets: [],
      budgetEntries: [],
      budgetEntryToEdit: {},
      budgetOptions: [],
      budgetToEdit: {},
      currentBudget: {},
      errors: {
        budgets: false,
        createBudget: false,
        editBudget: false,
        editBudgetEntry: false,
        entries: false,
        deleteBudget: false,
        deleteBudgetEntry: false
      },
      loading: {
        budgets: true,
        createBudget: false,
        editBudget: false,
        editBudgetEntry: false,
        entries: true,
        deleteBudget: false,
        deleteBudgetEntry: false
      },
      modals: {
        createBudget: false,
        createBudgetEntry: false,
        editBudgetEntry: false,
        deleteBudget: false,
        deleteBudgetEntry: false
      },
      monthsBetweenProductionDates: [],
      salaryScale: {}
    }
  },

  async mounted() {
    this.pageTitle = this.$t('budget.title')
    await this.setSalaryScale()
    await this.loadBudgets()
    await this.loadBudgetEntries()
    this.monthsBetweenProductionDates = this.getMonthsBetweenDates(
      this.currentProduction.start_date,
      this.currentProduction.end_date
    )
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'departments',
      'departmentMap',
      'personMap'
    ]),

    lastRevision() {
      return this.budgets.length > 0 ? this.budgets[0].revision : 0
    },

    budgetDepartments() {
      const departmentIds = new Set(
        this.budgetEntries.map(entry => entry.department_id)
      )
      const budgetDepartments = []
      Array.from(departmentIds).map(departmentId => {
        const departmentEntries = this.budgetEntries.filter(
          entry => entry.department_id === departmentId
        )
        const departmentData = {
          id: departmentId,
          monthCosts: {},
          total: 0,
          duration: 0,
          persons: [],
          start_date: null
        }
        departmentEntries.forEach(entry => {
          const monthlySalary = entry.daily_salary * 20
          const monthCosts = {}
          for (let i = 0; i < entry.months_duration; i++) {
            const month = moment(entry.start_date).add(i, 'month')
            monthCosts[month.format('YYYY-MM')] = monthlySalary
          }
          departmentData.persons.push({
            id: entry.id,
            person_id: entry.person_id,
            budget_entry_id: entry.id,
            department_id: entry.department_id,
            monthCosts: monthCosts,
            position: entry.position,
            seniority: entry.seniority,
            total: entry.months_duration * monthlySalary,
            months_duration: entry.months_duration,
            start_date: entry.start_date
          })
          const startDate = moment(entry.start_date)
          const departmentStartDate = moment(departmentData.start_date)
          if (
            !departmentData.start_date ||
            startDate.isBefore(departmentStartDate)
          ) {
            departmentData.start_date = entry.start_date
          }
          departmentData.persons.sort(this.sortDepartmentPersons)
        })
        helpers.resetDepartmentTotals(departmentData)
        budgetDepartments.push(departmentData)
      })
      budgetDepartments.sort((a, b) => {
        if (a.start_date === b.start_date) {
          const departmentA = this.departmentMap.get(a.id)
          const departmentB = this.departmentMap.get(b.id)
          return departmentA.name.localeCompare(departmentB.name)
        } else {
          return moment(a.start_date).isBefore(b.start_date) ? -1 : 1
        }
      })
      return budgetDepartments
    },

    totalEntry() {
      const total = this.budgetDepartments.reduce(
        (acc, department) => acc + department.total,
        0
      )
      const monthCosts = this.budgetDepartments.reduce((acc, department) => {
        Object.keys(department.monthCosts).forEach(month => {
          acc[month] = (acc[month] || 0) + department.monthCosts[month]
        })
        return acc
      }, {})
      return {
        total,
        monthCosts: monthCosts
      }
    },

    pieChartData() {
      return this.budgetDepartments.map(departmentEntry => {
        const department = this.departmentMap.get(departmentEntry.id)
        return [department.name, departmentEntry.total]
      })
    },

    pieChartColors() {
      return this.budgetDepartments.map(departmentEntry => {
        const department = this.departmentMap.get(departmentEntry.id)
        return department.color
      })
    },

    columnChartData() {
      return this.monthsBetweenProductionDates.map(monthDate => {
        const monthKey = monthDate.format('YYYY-MM')
        const [year, month] = monthKey.split('-')
        const label = `${month}/${year.slice(2)}`
        return [label, this.totalEntry.monthCosts[monthKey] || 0]
      })
    }
  },

  methods: {
    ...mapActions([
      'createProductionBudgetEntry',
      'createProductionBudget',
      'deleteProductionBudget',
      'deleteProductionBudgetEntry',
      'loadProductionBudget',
      'loadProductionBudgets',
      'loadProductionBudgetEntry',
      'loadProductionBudgetEntries',
      'loadSalaryScale',
      'updateProductionBudget',
      'updateProductionBudgetEntry'
    ]),

    formatMonth,

    sortDepartmentPersons(a, b) {
      const seniorityWeight = {
        junior: 1,
        mid: 2,
        senior: 3
      }
      const positionWeight = {
        artist: 1,
        supervisor: 2,
        lead: 3
      }
      const seniorityA = seniorityWeight[a.seniority]
      const seniorityB = seniorityWeight[b.seniority]
      const positionA = positionWeight[a.position]
      const positionB = positionWeight[b.position]
      if (a.person_id === null && b.person_id === null) {
        if (positionA === positionB) {
          return seniorityB - seniorityA
        } else {
          return positionB - positionA
        }
      } else if (a.person_id === null) {
        return 1
      } else if (b.person_id === null) {
        return -1
      } else {
        const personA = this.personMap.get(a.person_id)
        const personB = this.personMap.get(b.person_id)
        if (personA.name === personB.name) {
          if (positionA === positionB) {
            return seniorityB - seniorityA
          } else {
            return positionB - positionA
          }
        } else {
          return personA.name.localeCompare(personB.name)
        }
      }
    },

    async setSalaryScale() {
      this.salaryScale = await this.loadSalaryScale()
    },

    onChangeBudget(budget) {
      this.currentBudget = budget
    },

    onEditBudgetClicked() {
      this.budgetToEdit = this.currentBudget
      this.modals.createBudget = true
    },

    onNewBudgetVersionClicked() {
      this.budgetToEdit = {}
      this.modals.createBudget = true
    },

    async createBudget(budget) {
      try {
        this.loading.createBudget = true
        if (budget.id) {
          await this.updateProductionBudget({
            productionId: this.currentProduction.id,
            budget: {
              id: this.currentBudget.id,
              name: budget.name,
              currency: budget.currency
            }
          })
          const oldBudget = this.budgets.find(
            b => b.id === this.currentBudget.id
          )
          if (oldBudget) {
            Object.assign(oldBudget, {
              name: budget.name,
              currency: budget.currency
            })
          }
        } else {
          this.loading.createBudget = true
          const newBudget = await this.createProductionBudget({
            productionId: this.currentProduction.id,
            budget
          })
          this.budgets.unshift(newBudget)
          this.currentBudget = newBudget
        }
        this.resetBudgetOptions()
        this.modals.createBudget = false
      } catch (error) {
        console.error(error)
        this.errors.createBudget = true
      } finally {
        this.loading.createBudget = false
      }
    },

    onDeleteBudgetClicked() {
      this.errors.deleteBudget = false
      this.modals.deleteBudget = true
    },

    async deleteBudget() {
      this.loading.deleteBudget = true
      try {
        await this.deleteProductionBudget({
          productionId: this.currentProduction.id,
          budgetId: this.currentBudget.id
        })
        this.postDeleteBudget(this.currentBudget)
        this.modals.deleteBudget = false
      } catch (error) {
        console.error(error)
        this.errors.deleteBudget = true
      } finally {
        this.loading.deleteBudget = false
      }
    },

    postDeleteBudget(budget) {
      this.budgets = this.budgets.filter(b => b.id !== budget.id)
      this.resetBudgetOptions()
      if (this.budgets.length > 0) {
        this.currentBudget = this.budgets[0]
      } else {
        this.currentBudget = {}
      }
    },

    onAddBudgetEntry() {
      this.budgetEntryToEdit = {}
      this.modals.createBudgetEntry = true
    },

    async confirmCreateBudgetEntry(budgetEntry) {
      if (budgetEntry.id) {
        await this.runRemoteBudgetEntryEdition(budgetEntry)
      } else {
        await this.runRemoteBudgetEntryCreation(budgetEntry)
      }
    },

    async runRemoteBudgetEntryCreation(budgetEntry) {
      try {
        this.loading.createBudgetEntry = true
        await this.createProductionBudgetEntry({
          productionId: this.currentProduction.id,
          budgetId: this.currentBudget.id,
          budgetEntry: {
            ...budgetEntry,
            person_id: budgetEntry.person ? budgetEntry.person.id : null
          }
        })
        this.modals.createBudgetEntry = false
      } catch (error) {
        console.error(error)
        this.errors.createBudgetEntry = true
      } finally {
        this.loading.createBudgetEntry = false
      }
    },

    editBudgetEntry(budgetEntry) {
      this.budgetEntryToEdit = budgetEntry
      this.modals.createBudgetEntry = true
    },

    async runRemoteBudgetEntryEdition(budgetEntry) {
      try {
        this.loading.editBudgetEntry = true
        this.errors.editBudgetEntry = false
        await this.updateProductionBudgetEntry({
          productionId: this.currentProduction.id,
          budgetId: this.currentBudget.id,
          budgetEntryId: budgetEntry.id,
          budgetEntry: {
            id: budgetEntry.id,
            department_id: budgetEntry.department_id,
            person_id: budgetEntry.person ? budgetEntry.person.id : null,
            position: budgetEntry.position,
            seniority: budgetEntry.seniority,
            start_date: budgetEntry.start_date,
            months_duration: budgetEntry.duration,
            daily_salary: budgetEntry.daily_salary
          }
        })
        this.modals.createBudgetEntry = false
      } catch (error) {
        console.error(error)
        this.errors.editBudgetEntry = true
      } finally {
        this.loading.editBudgetEntry = false
      }
    },

    afterEditBudgetEntry(budgetEntry) {
      const oldBudgetEntry = this.budgetEntries.find(
        b => b.id === budgetEntry.id
      )
      if (oldBudgetEntry) {
        Object.assign(oldBudgetEntry, budgetEntry)
      }
    },

    async deleteBudgetEntry(budgetEntry) {
      this.loading.deleteBudgetEntry = false
      this.errors.deleteBudgetEntry = false
      this.modals.deleteBudgetEntry = true
      this.budgetEntryToDelete = budgetEntry
    },

    async confirmDeleteBudgetEntry() {
      this.loading.deleteBudgetEntry = true
      try {
        await this.deleteProductionBudgetEntry({
          productionId: this.currentProduction.id,
          budgetId: this.currentBudget.id,
          budgetEntryId: this.budgetEntryToDelete.budget_entry_id
        })
        this.postDeleteBudgetEntry(this.budgetEntryToDelete)
        this.modals.deleteBudgetEntry = false
      } catch (error) {
        console.error(error)
        this.errors.deleteBudgetEntry = true
      } finally {
        this.loading.deleteBudgetEntry = false
      }
    },

    postDeleteBudgetEntry(budgetEntry) {
      this.budgetEntries = this.budgetEntries.filter(
        entry => entry.id !== budgetEntry.id
      )
    },

    async loadBudgets() {
      try {
        this.loading.budgets = true
        this.errors.budgets = false
        this.budgets = await this.loadProductionBudgets(
          this.currentProduction.id
        )
        this.budgets.sort((a, b) => b.revision - a.revision)
        this.currentBudget = this.budgets.length > 0 ? this.budgets[0] : {}
        this.resetBudgetOptions()
      } catch (error) {
        console.error(error)
        this.errors.budgets = true
      } finally {
        this.loading.budgets = false
      }
    },

    async loadBudgetEntries() {
      if (!this.currentBudget || !this.currentBudget.id) return
      try {
        this.loading.entries = true
        this.errors.entries = false
        this.budgetEntries = await this.loadProductionBudgetEntries({
          productionId: this.currentProduction.id,
          budgetId: this.currentBudget.id
        })
      } catch (error) {
        console.error(error)
        this.errors.entries = true
      } finally {
        this.loading.entries = false
      }
    },

    resetBudgetOptions() {
      this.budgetOptions = this.budgets.map(budget => {
        return {
          label: `v${budget.revision} - ${budget.name}`,
          value: budget
        }
      })
    },

    getMonthsBetweenDates(startDate, endDate) {
      const months = []
      const current = parseSimpleDate(startDate)
      const end = parseSimpleDate(endDate)

      while (current <= end) {
        months.push(moment(current))
        current.add(1, 'month')
      }
      return months
    }
  },

  watch: {
    currentProduction() {
      this.loadBudgets()
    },

    currentBudget() {
      this.loadBudgetEntries()
    }
  },

  socket: {
    events: {
      'budget:create': async function (data) {
        if (data.project_id !== this.currentProduction.id) return
        const budget = await this.loadProductionBudget({
          productionId: this.currentProduction.id,
          budgetId: data.budget_id
        })
        const oldBudget = this.budgets.find(b => b.id === budget.id)
        if (budget && !oldBudget) {
          this.budgets.unshift(budget)
          this.resetBudgetOptions()
        }
      },

      'budget:update': async function (data) {
        if (data.project_id !== this.currentProduction.id) return
        const budget = await this.loadProductionBudget({
          productionId: this.currentProduction.id,
          budgetId: data.budget_id
        })
        if (budget) {
          const oldBudget = this.budgets.find(b => b.id === budget.id)
          if (oldBudget) {
            Object.assign(oldBudget, {
              name: budget.name,
              currency: budget.currency
            })
            this.resetBudgetOptions()
          }
        }
      },

      'budget:delete': function (data) {
        if (data.project_id !== this.currentProduction.id) return
        const oldBudget = this.budgets.find(b => b.id === data.budget_id)
        const isCurrentBudgetDeleted = this.currentBudget.id === data.budget_id
        if (oldBudget) {
          this.budgets = this.budgets.filter(b => b.id !== data.budget_id)
          this.resetBudgetOptions()
          if (isCurrentBudgetDeleted) {
            this.currentBudget = this.budgets[0]
          }
        }
      },

      'budget-entry:create': async function (data) {
        if (data.project_id !== this.currentProduction.id) return
        if (data.budget_id !== this.currentBudget.id) return
        const oldBudgetEntry = this.budgetEntries.find(
          b => b.id === data.budget_entry_id
        )
        if (oldBudgetEntry) return
        const budgetEntry = await this.loadProductionBudgetEntry({
          productionId: this.currentProduction.id,
          budgetId: this.currentBudget.id,
          budgetEntryId: data.budget_entry_id
        })
        this.budgetEntries.push(budgetEntry)
      },

      'budget-entry:update': async function (data) {
        if (data.project_id !== this.currentProduction.id) return
        if (data.budget_id !== this.currentBudget.id) return
        const oldBudgetEntry = this.budgetEntries.find(
          b => b.id === data.budget_entry_id
        )
        if (!oldBudgetEntry) return

        const budgetEntry = await this.loadProductionBudgetEntry({
          productionId: this.currentProduction.id,
          budgetId: this.currentBudget.id,
          budgetEntryId: data.budget_entry_id
        })
        this.afterEditBudgetEntry(budgetEntry)
      },

      'budget-entry:delete': async function (data) {
        if (data.project_id !== this.currentProduction.id) return
        if (data.budget_id !== this.currentBudget.id) return
        const oldBudgetEntry = this.budgetEntries.find(
          b => b.id === data.budget_entry_id
        )
        if (!oldBudgetEntry) return
        this.postDeleteBudgetEntry({ id: data.budget_entry_id })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.budget-data {
  display: flex;
  flex: 1;
  flex-direction: column;
  max-height: calc(100vh - 140px);
}
</style>
