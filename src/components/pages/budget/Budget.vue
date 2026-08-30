<template>
  <page-layout>
    <template #main>
      <div class="flexcolumn page">
        <budget-header
          :budget-options="budgetOptions"
          :budget="currentBudget"
          :is-loading="loading.budgets"
          :is-error="errors.budgets"
          :is-error-expenses="errors.expenses"
          :is-loading-expenses="loading.expenses"
          :is-showing-expenses="expenses.showing"
          :is-showing-items="items.showing"
          @change-budget="onChangeBudget"
          @delete-budget="onDeleteBudgetClicked"
          @edit-budget="onEditBudgetClicked"
          @export-budget="onExportBudgetClicked"
          @new-version="onNewBudgetVersionClicked"
          @toggle-expenses="onToggleExpenses"
          @toggle-items="onToggleItems"
        />

        <budget-list
          :budget-departments="budgetDepartments"
          :converted-expenses="convertedExpenses"
          :done-previsional="donePrevisional"
          :extended-budget-departments="extendedBudgetDepartments"
          :is-error="errors.entries"
          :is-loading="loading.entries"
          :is-showing-expenses="expenses.showing"
          :is-showing-items="items.showing"
          :hardware-items-costs="hardwareItemsCosts"
          :software-licenses-costs="softwareLicensesCosts"
          :months-between-start-and-now="monthsBetweenStartAndNow"
          :months-between-now-and-end="monthsBetweenNowAndEnd"
          :months-between-production-dates="monthsBetweenProductionDates"
          :remaining-previsional="remainingPrevisional"
          :total-entry="totalEntry"
          @add-budget-entry="onAddBudgetEntry"
          @add-person-exception="addPersonException"
          @delete-budget-entry="deleteBudgetEntry"
          @edit-budget-entry="editBudgetEntry"
          v-if="currentBudget.id"
        />

        <edit-budget-modal
          :active="modals.createBudget"
          :budget-to-edit="budgetToEdit"
          :last-revision="lastRevision"
          :is-loading="loading.createBudget"
          :is-error="errors.createBudget"
          @cancel="modals.createBudget = false"
          @confirm="createBudget"
        />

        <edit-budget-entry-modal
          :active="modals.createBudgetEntry"
          :budget-entry-to-edit="budgetEntryToEdit"
          :is-loading="loading.createBudgetEntry || loading.editBudgetEntry"
          :is-error="errors.createBudgetEntry || errors.editBudgetEntry"
          :salary-scale="salaryScale"
          @cancel="modals.createBudgetEntry = false"
          @confirm="confirmCreateBudgetEntry"
        />

        <hard-delete-modal
          :active="modals.deleteBudget"
          :error-text="$t('budget.delete_budget_error')"
          :is-loading="loading.deleteBudget"
          :is-error="errors.deleteBudget"
          :lock-text="currentBudget?.name"
          :text="
            $t('budget.delete_budget_message', {
              name: currentBudget?.name
            })
          "
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
        :hardware-items="hardwareItemsCosts"
        :software-licenses="softwareLicensesCosts"
        :pie-chart-data="pieChartData"
        :pie-chart-colors="pieChartColors"
        :column-chart-data="columnChartData"
      />
    </template>
  </page-layout>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import moment from 'moment'
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { getMonthCost } from '@/lib/budget'
import csv from '@/lib/csv'
import { parseSimpleDate } from '@/lib/time'

import PageLayout from '@/components/layouts/PageLayout.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditBudgetEntryModal from '@/components/modals/EditBudgetEntryModal.vue'
import EditBudgetModal from '@/components/modals/EditBudgetModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import BudgetAnalytics from '@/components/pages/budget/BudgetAnalytics.vue'
import BudgetHeader from '@/components/pages/budget/BudgetHeader.vue'
import BudgetList from '@/components/pages/budget/BudgetList.vue'

const SENIORITY_WEIGHT = { junior: 1, mid: 2, senior: 3 }
const POSITION_WEIGHT = { artist: 1, lead: 2, supervisor: 3 }

const sumMonthCosts = entries =>
  entries.reduce((acc, entry) => {
    Object.entries(entry.monthCosts).forEach(([month, cost]) => {
      acc[month] = (acc[month] || 0) + cost
    })
    return acc
  }, {})

const sumMonthlyCosts = items =>
  items.reduce((acc, item) => acc + item.monthly_cost, 0)

const getMonthsBetweenDates = (startDate, endDate) => {
  const months = []
  const current = parseSimpleDate(startDate)
  const end = parseSimpleDate(endDate)
  while (current <= end) {
    months.push(current.clone())
    current.add(1, 'month')
  }
  return months
}

const mergeById = (list, id, patch) => {
  const item = list.find(entry => entry.id === id)
  if (item) Object.assign(item, patch)
}

const buildPersonEntry = entry => {
  const monthlySalary = entry.daily_salary * 20
  const exceptions = entry.exceptions || {}
  const monthCosts = Object.fromEntries(
    Array.from({ length: entry.months_duration }, (_, i) => {
      const monthKey = moment(entry.start_date)
        .add(i, 'month')
        .format('YYYY-MM')
      return [monthKey, exceptions[monthKey] || monthlySalary]
    })
  )
  return {
    id: entry.id,
    person_id: entry.person_id,
    budget_entry_id: entry.id,
    department_id: entry.department_id,
    monthCosts,
    position: entry.position,
    seniority: entry.seniority,
    total: Object.values(monthCosts).reduce((acc, cost) => acc + cost, 0),
    months_duration: entry.months_duration,
    monthly_salary: monthlySalary,
    daily_salary: entry.daily_salary,
    start_date: entry.start_date,
    exceptions
  }
}

const compareRoles = (a, b) => {
  const positionA = POSITION_WEIGHT[a.position]
  const positionB = POSITION_WEIGHT[b.position]
  return positionA === positionB
    ? SENIORITY_WEIGHT[b.seniority] - SENIORITY_WEIGHT[a.seniority]
    : positionB - positionA
}

// Composables
const { t } = useI18n()
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// State
// --------------------------------------------------------------------------
const budgets = ref([])
const budgetEntries = ref([])
const budgetEntryToDelete = ref({})
const budgetEntryToEdit = ref({})
const budgetToEdit = ref({})
const currentBudget = ref({})
const linkedHardwareItems = ref({})
const linkedSoftwareLicenses = ref({})
const salaryScale = ref({})

const errors = reactive({
  budgets: false,
  createBudget: false,
  createBudgetEntry: false,
  deleteBudget: false,
  deleteBudgetEntry: false,
  editBudgetEntry: false,
  entries: false,
  expenses: false
})
const expenses = reactive({ data: {}, showing: false })
const items = reactive({ showing: false })
const loading = reactive({
  budgets: true,
  createBudget: false,
  createBudgetEntry: false,
  deleteBudget: false,
  deleteBudgetEntry: false,
  editBudgetEntry: false,
  entries: true,
  expenses: false
})
const modals = reactive({
  createBudget: false,
  createBudgetEntry: false,
  deleteBudget: false,
  deleteBudgetEntry: false
})

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const departmentMap = computed(() => store.getters.departmentMap)
const organisation = computed(() => store.getters.organisation)
const personMap = computed(() => store.getters.personMap)

const monthsBetweenProductionDates = computed(() =>
  getMonthsBetweenDates(
    currentProduction.value.start_date,
    currentProduction.value.end_date
  )
)

const monthsBetweenStartAndNow = computed(() =>
  // Split the timeline on calendar months, not on the day of the month:
  // the current month always belongs to the real costs section, whatever
  // the production start day is.
  getMonthsBetweenDates(
    currentProduction.value.start_date,
    moment().endOf('month').format('YYYY-MM-DD')
  )
)

const monthsBetweenNowAndEnd = computed(() =>
  getMonthsBetweenDates(
    moment().add(1, 'month').startOf('month').format('YYYY-MM-DD'),
    currentProduction.value.end_date
  )
)

const budgetOptions = computed(() =>
  budgets.value.map(budget => ({
    label: `v${budget.revision} - ${budget.name}`,
    value: budget
  }))
)

const lastRevision = computed(() => budgets.value[0]?.revision || 0)

const budgetDepartments = computed(() => {
  const departmentIds = [
    ...new Set(budgetEntries.value.map(entry => entry.department_id))
  ]
  return departmentIds
    .map(departmentId => {
      const persons = budgetEntries.value
        .filter(entry => entry.department_id === departmentId)
        .map(buildPersonEntry)
        .sort(sortDepartmentPersons)
      return {
        id: departmentId,
        persons,
        total: persons.reduce((acc, person) => acc + person.total, 0),
        monthCosts: sumMonthCosts(persons)
      }
    })
    .sort((a, b) => {
      const nameA = departmentMap.value.get(a.id)?.name || ''
      const nameB = departmentMap.value.get(b.id)?.name || ''
      return nameA.localeCompare(nameB)
    })
})

const hardwareItemsCosts = computed(() =>
  getItemCosts(linkedHardwareItems.value)
)

const softwareLicensesCosts = computed(() =>
  getItemCosts(linkedSoftwareLicenses.value)
)

const totalEntry = computed(() => {
  const itemCosts = items.showing
    ? [hardwareItemsCosts.value, softwareLicensesCosts.value]
    : []
  const monthCosts = budgetDepartments.value.reduce((acc, department) => {
    Object.entries(department.monthCosts).forEach(([month, cost]) => {
      const itemCost = itemCosts.reduce(
        (sum, costs) => sum + (costs[department.id]?.[month] || 0),
        0
      )
      acc[month] = (acc[month] || 0) + cost + itemCost
    })
    return acc
  }, {})
  const total =
    budgetDepartments.value.reduce((acc, dep) => acc + dep.total, 0) +
    itemCosts.reduce((sum, costs) => sum + costs.total, 0)
  return { total, monthCosts }
})

/* It converts the expenses to the budget format where there is an
 * entry for each department and each person. It also calculates the totals
 * for each person, department and for all the departments.
 * It also converts the time spent to a cost.
 */
const convertedExpenses = computed(() => {
  const converted = {}
  const data = expenses.data || {}
  let total = 0
  Object.keys(data).forEach(departmentId => {
    let departmentTotal = 0
    converted[departmentId] = {
      'software-licenses': { total: 0 },
      'hardware-items': { total: 0 }
    }
    const monthlySoftwareLicensesCosts = sumMonthlyCosts(
      linkedSoftwareLicenses.value[departmentId] || []
    )
    const monthlyHardwareItemsCosts = sumMonthlyCosts(
      linkedHardwareItems.value[departmentId] || []
    )

    Object.keys(data[departmentId]).forEach(personId => {
      let personTotal = 0
      let personTotalWithItems = 0
      const dailyRate = getDailyRate(departmentId, personId)
      const personExpenses = data[departmentId][personId]

      converted[departmentId][personId] = {}
      Object.keys(personExpenses)
        .filter(month => month !== 'total')
        .forEach(month => {
          const { cost, ratio } = convertTimeSpentToCost(
            dailyRate,
            personExpenses[month]
          )
          converted[departmentId][personId][month] = cost

          let costWithItems = cost
          if (items.showing && cost > 0) {
            const software = converted[departmentId]['software-licenses']
            const hardware = converted[departmentId]['hardware-items']
            const softwareCost = Math.round(
              monthlySoftwareLicensesCosts * ratio
            )
            const hardwareCost = Math.round(monthlyHardwareItemsCosts * ratio)
            software[month] = (software[month] || 0) + softwareCost
            software.total += softwareCost
            hardware[month] = (hardware[month] || 0) + hardwareCost
            hardware.total += hardwareCost
            costWithItems += softwareCost + hardwareCost
          }

          converted[departmentId][month] =
            (converted[departmentId][month] || 0) + costWithItems
          converted[month] = (converted[month] || 0) + costWithItems
          personTotal += cost
          personTotalWithItems += costWithItems
        })

      converted[departmentId][personId].total = personTotal
      departmentTotal += personTotalWithItems
    })
    converted[departmentId].total = departmentTotal
    total += departmentTotal
  })
  converted.total = total
  return converted
})

/* It extends the budget departments with the expenses that don't have
 * equivalent entries in the budget departments. It also adds the new
 * departments to the budget departments if needed.
 */
const extendedBudgetDepartments = computed(() => {
  if (!expenses.showing) return budgetDepartments.value

  const knownDepartmentIds = new Set(budgetDepartments.value.map(d => d.id))
  const newDepartments = Object.keys(expenses.data)
    .filter(id => !knownDepartmentIds.has(id))
    .map(id => ({ id, monthCosts: {}, total: 0, persons: [] }))

  return [...budgetDepartments.value, ...newDepartments].map(department => {
    const knownPersonIds = new Set(department.persons.map(p => p.person_id))
    const missingPersons = Object.keys(expenses.data[department.id] || {})
      .filter(personId => personId !== 'total' && !knownPersonIds.has(personId))
      .map(personId => {
        const person = personMap.value.get(personId)
        return {
          id: null,
          person_id: personId,
          budget_entry_id: null,
          department_id: department.id,
          monthCosts: {},
          position: person?.position,
          seniority: person?.seniority,
          total: 0,
          months_duration: 0,
          monthly_salary: 0,
          daily_salary: person?.daily_salary || 0,
          start_date: null,
          exceptions: {}
        }
      })
    return {
      ...department,
      persons: [...department.persons, ...missingPersons]
    }
  })
})

const remainingPrevisional = computed(() =>
  getPrevisionalSubset(monthsBetweenNowAndEnd.value)
)

const donePrevisional = computed(() =>
  getPrevisionalSubset(monthsBetweenStartAndNow.value)
)

const pieChartData = computed(() =>
  budgetDepartments.value.map(departmentEntry => [
    departmentMap.value.get(departmentEntry.id)?.name,
    departmentEntry.total
  ])
)

const pieChartColors = computed(() =>
  budgetDepartments.value.map(
    departmentEntry => departmentMap.value.get(departmentEntry.id)?.color
  )
)

const columnChartData = computed(() =>
  monthsBetweenProductionDates.value.map(monthDate => {
    const monthKey = monthDate.format('YYYY-MM')
    const [year, month] = monthKey.split('-')
    return [
      `${month}/${year.slice(2)}`,
      totalEntry.value.monthCosts[monthKey] || 0
    ]
  })
)

// Functions
// --------------------------------------------------------------------------
const getPrevisionalSubset = months => {
  const monthKeys = months.map(month => month.format('YYYY-MM'))
  const sumOver = costs =>
    monthKeys.reduce((sum, key) => sum + (costs?.[key] || 0), 0)
  return budgetDepartments.value.reduce(
    (acc, department) => {
      const subset = department.persons
        .filter(person => person.budget_entry_id)
        .reduce(
          (departmentAcc, person) => {
            const personTotal = monthKeys.reduce(
              (sum, key) => sum + getMonthCost(person, key),
              0
            )
            departmentAcc[person.budget_entry_id] = personTotal
            departmentAcc.total += personTotal
            return departmentAcc
          },
          { total: 0 }
        )
      if (items.showing) {
        const softwareCosts = sumOver(
          softwareLicensesCosts.value[department.id]
        )
        const hardwareCosts = sumOver(hardwareItemsCosts.value[department.id])
        subset['software-licenses'] = softwareCosts
        subset['hardware-items'] = hardwareCosts
        subset.total += softwareCosts + hardwareCosts
      }
      acc[department.id] = subset
      acc.total += subset.total
      return acc
    },
    { total: 0 }
  )
}

/* The rate set in the People section, else the rate of the matching budget
 * entry, else the salary scale.
 */
const getDailyRate = (departmentId, personId) => {
  const person = personMap.value.get(personId)
  const budgetEntry = budgetDepartments.value
    .find(department => department.id === departmentId)
    ?.persons.find(entry => entry.person_id === personId)
  const scale =
    salaryScale.value[departmentId]?.[person?.position]?.[person?.seniority]
  return person?.daily_salary || budgetEntry?.daily_salary || scale || 0
}

const convertTimeSpentToCost = (dailyRate, minutes) => {
  const validMinutes = Number(minutes) || 0
  const validDailyRate = Number(dailyRate) || 0
  const hoursByDay = Number(organisation.value?.hours_by_day) || 8

  if (validMinutes <= 0 || validDailyRate <= 0 || hoursByDay <= 0) {
    return { cost: 0, ratio: 0 }
  }

  const days = validMinutes / 60 / hoursByDay
  return { cost: Math.round(days * dailyRate), ratio: days / 20 }
}

/* Cost of the linked items for each department and each month: the
 * department monthly cost is counted once per person active that month.
 */
const getItemCosts = linkedItems => {
  const monthKeys = monthsBetweenProductionDates.value.map(month =>
    month.format('YYYY-MM')
  )
  return budgetDepartments.value.reduce(
    (acc, department) => {
      const monthlyDepartmentCost = sumMonthlyCosts(
        linkedItems[department.id] || []
      )
      const departmentCosts = monthKeys.reduce(
        (costs, monthKey) => {
          const activePersons = department.persons.filter(
            person => getMonthCost(person, monthKey) > 0
          ).length
          costs[monthKey] = activePersons * monthlyDepartmentCost
          costs.total += costs[monthKey]
          return costs
        },
        { total: 0 }
      )
      acc[department.id] = departmentCosts
      acc.total += departmentCosts.total
      return acc
    },
    { total: 0 }
  )
}

const sortDepartmentPersons = (a, b) => {
  if (a.person_id === null && b.person_id === null) return compareRoles(a, b)
  if (a.person_id === null) return 1
  if (b.person_id === null) return -1
  const nameA = personMap.value.get(a.person_id)?.name || ''
  const nameB = personMap.value.get(b.person_id)?.name || ''
  return nameA === nameB ? compareRoles(a, b) : nameA.localeCompare(nameB)
}

const runRequest = async (key, request) => {
  loading[key] = true
  errors[key] = false
  try {
    await request()
  } catch (error) {
    console.error(error)
    errors[key] = true
  }
  loading[key] = false
}

const loadBudgets = () =>
  runRequest('budgets', async () => {
    const loaded = await store.dispatch(
      'loadProductionBudgets',
      currentProduction.value.id
    )
    budgets.value = loaded.sort((a, b) => b.revision - a.revision)
    currentBudget.value = budgets.value[0] || {}
  })

const loadBudgetEntries = () => {
  if (!currentBudget.value?.id) return
  return runRequest('entries', async () => {
    const loaded = await store.dispatch('loadProductionBudgetEntries', {
      productionId: currentProduction.value.id,
      budgetId: currentBudget.value.id
    })
    budgetEntries.value = loaded
  })
}

const onChangeBudget = budget => {
  currentBudget.value = budget
}

const onEditBudgetClicked = () => {
  budgetToEdit.value = currentBudget.value
  modals.createBudget = true
}

const onNewBudgetVersionClicked = () => {
  budgetToEdit.value = {}
  modals.createBudget = true
}

const onExportBudgetClicked = () => {
  const nameData = [
    t('budget.title').toLowerCase(),
    currentProduction.value.name,
    `v${currentBudget.value.revision}`,
    currentBudget.value.name,
    currentBudget.value.currency
  ]
  const expenseData = expenses.showing
    ? {
        monthsBetweenStartAndNow: monthsBetweenStartAndNow.value,
        monthsBetweenNowAndEnd: monthsBetweenNowAndEnd.value,
        convertedExpenses: convertedExpenses.value,
        donePrevisional: donePrevisional.value,
        remainingPrevisional: remainingPrevisional.value
      }
    : null
  csv.generateBudget(
    t,
    departmentMap.value,
    personMap.value,
    nameData,
    currentBudget.value.currency,
    monthsBetweenProductionDates.value,
    totalEntry.value,
    extendedBudgetDepartments.value,
    expenseData
  )
}

const createBudget = budget =>
  runRequest('createBudget', async () => {
    const productionId = currentProduction.value.id
    if (budget.id) {
      const { name, currency } = budget
      await store.dispatch('updateProductionBudget', {
        productionId,
        budget: { id: currentBudget.value.id, name, currency }
      })
      mergeById(budgets.value, currentBudget.value.id, { name, currency })
    } else {
      const newBudget = await store.dispatch('createProductionBudget', {
        productionId,
        budget
      })
      budgets.value.unshift(newBudget)
      currentBudget.value = newBudget
    }
    modals.createBudget = false
  })

const onDeleteBudgetClicked = () => {
  errors.deleteBudget = false
  modals.deleteBudget = true
}

const deleteBudget = () =>
  runRequest('deleteBudget', async () => {
    const budgetId = currentBudget.value.id
    await store.dispatch('deleteProductionBudget', {
      productionId: currentProduction.value.id,
      budgetId
    })
    budgets.value = budgets.value.filter(b => b.id !== budgetId)
    currentBudget.value = budgets.value[0] || {}
    modals.deleteBudget = false
  })

const onAddBudgetEntry = () => {
  budgetEntryToEdit.value = {}
  modals.createBudgetEntry = true
}

const editBudgetEntry = budgetEntry => {
  budgetEntryToEdit.value = budgetEntry
  modals.createBudgetEntry = true
}

const confirmCreateBudgetEntry = budgetEntry => {
  const isEdit = Boolean(budgetEntry.id)
  const payload = isEdit
    ? {
        id: budgetEntry.id,
        department_id: budgetEntry.department_id,
        position: budgetEntry.position,
        seniority: budgetEntry.seniority,
        start_date: budgetEntry.start_date,
        months_duration: budgetEntry.duration,
        daily_salary: budgetEntry.daily_salary
      }
    : budgetEntry
  return runRequest(
    isEdit ? 'editBudgetEntry' : 'createBudgetEntry',
    async () => {
      await store.dispatch(
        isEdit ? 'updateProductionBudgetEntry' : 'createProductionBudgetEntry',
        {
          productionId: currentProduction.value.id,
          budgetId: currentBudget.value.id,
          budgetEntryId: budgetEntry.id,
          budgetEntry: { ...payload, person_id: budgetEntry.person?.id || null }
        }
      )
      modals.createBudgetEntry = false
    }
  )
}

/* An empty, zero or negative value clears the override instead: the month
 * falls back to the computed salary rather than storing a 0 exception (which
 * the backend would drop anyway).
 */
const addPersonException = ({ personEntry, month, value }) => {
  const entry = budgetEntries.value.find(
    e => e.id === personEntry.budget_entry_id
  )
  if (!entry) return
  const monthKey = month.format('YYYY-MM')
  const amount = parseInt(value)
  const exceptions = { ...entry.exceptions }
  if (amount > 0) {
    exceptions[monthKey] = amount
  } else {
    delete exceptions[monthKey]
  }
  entry.exceptions = exceptions
  return runRequest('editBudgetEntry', () =>
    store.dispatch('updateProductionBudgetEntry', {
      productionId: currentProduction.value.id,
      budgetId: currentBudget.value.id,
      budgetEntryId: entry.id,
      budgetEntry: entry
    })
  )
}

const deleteBudgetEntry = budgetEntry => {
  errors.deleteBudgetEntry = false
  modals.deleteBudgetEntry = true
  budgetEntryToDelete.value = budgetEntry
}

const confirmDeleteBudgetEntry = () =>
  runRequest('deleteBudgetEntry', async () => {
    await store.dispatch('deleteProductionBudgetEntry', {
      productionId: currentProduction.value.id,
      budgetId: currentBudget.value.id,
      budgetEntryId: budgetEntryToDelete.value.budget_entry_id
    })
    removeBudgetEntry(budgetEntryToDelete.value.id)
    modals.deleteBudgetEntry = false
  })

const removeBudgetEntry = id => {
  budgetEntries.value = budgetEntries.value.filter(entry => entry.id !== id)
}

const onToggleExpenses = async () => {
  if (!expenses.showing) {
    await runRequest('expenses', async () => {
      expenses.data = await store.dispatch(
        'loadExpenses',
        currentProduction.value.id
      )
    })
  }
  expenses.showing = !expenses.showing
}

const onToggleItems = () => {
  items.showing = !items.showing
}

// Socket events
const isCurrentProduction = data =>
  data.project_id === currentProduction.value.id
const isCurrentBudget = data =>
  isCurrentProduction(data) && data.budget_id === currentBudget.value.id
const loadBudget = budgetId =>
  store.dispatch('loadProductionBudget', {
    productionId: currentProduction.value.id,
    budgetId
  })
const loadBudgetEntry = budgetEntryId =>
  store.dispatch('loadProductionBudgetEntry', {
    productionId: currentProduction.value.id,
    budgetId: currentBudget.value.id,
    budgetEntryId
  })

const socketEvents = {
  'budget:create': async data => {
    if (!isCurrentProduction(data)) return
    const budget = await loadBudget(data.budget_id)
    if (budget && !budgets.value.some(b => b.id === budget.id)) {
      budgets.value.unshift(budget)
    }
  },

  'budget:update': async data => {
    if (!isCurrentProduction(data)) return
    const budget = await loadBudget(data.budget_id)
    if (budget) {
      const { name, currency } = budget
      mergeById(budgets.value, budget.id, { name, currency })
    }
  },

  'budget:delete': data => {
    if (!isCurrentProduction(data)) return
    budgets.value = budgets.value.filter(b => b.id !== data.budget_id)
    if (currentBudget.value.id === data.budget_id) {
      currentBudget.value = budgets.value[0] || {}
    }
  },

  'budget-entry:create': async data => {
    if (!isCurrentBudget(data)) return
    if (budgetEntries.value.some(b => b.id === data.budget_entry_id)) return
    const budgetEntry = await loadBudgetEntry(data.budget_entry_id)
    budgetEntries.value.push(budgetEntry)
  },

  'budget-entry:update': async data => {
    if (!isCurrentBudget(data)) return
    if (!budgetEntries.value.some(b => b.id === data.budget_entry_id)) return
    const budgetEntry = await loadBudgetEntry(data.budget_entry_id)
    mergeById(budgetEntries.value, budgetEntry.id, budgetEntry)
  },

  'budget-entry:delete': data => {
    if (!isCurrentBudget(data)) return
    removeBudgetEntry(data.budget_entry_id)
  }
}

// Watchers
// --------------------------------------------------------------------------
watch(currentProduction, loadBudgets)
watch(currentBudget, loadBudgetEntries)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  Object.entries(socketEvents).forEach(([event, handler]) =>
    socket.on(event, handler)
  )
  // Budget entries follow from the currentBudget watcher once budgets land.
  const [scale, hardwareItems, softwareLicenses] = await Promise.all([
    store.dispatch('loadSalaryScale'),
    store.dispatch('loadLinkedHardwareItems'),
    store.dispatch('loadLinkedSoftwareLicenses'),
    loadBudgets()
  ])
  salaryScale.value = scale
  linkedHardwareItems.value = hardwareItems
  linkedSoftwareLicenses.value = softwareLicenses
})

onBeforeUnmount(() => {
  Object.entries(socketEvents).forEach(([event, handler]) =>
    socket.off(event, handler)
  )
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(() =>
    currentProduction.value
      ? `${currentProduction.value.name} | ${t('budget.title')} - Kitsu`
      : `${t('budget.title')} - Kitsu`
  )
})
</script>

<style lang="scss" scoped>
.budget-data {
  display: flex;
  flex: 1;
  flex-direction: column;
  max-height: calc(100vh - 140px);
}
</style>
