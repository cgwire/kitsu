import client from '@/store/api/client'

import { formatSimpleDate } from '@/lib/time'

export default {
  getProductionBudgets(projectId) {
    return client.pget(`/api/data/projects/${projectId}/budgets`)
  },

  getProductionBudget(projectId, budgetId) {
    return client.pget(`/api/data/projects/${projectId}/budgets/${budgetId}`)
  },

  createProductionBudget(projectId, budget) {
    const data = {
      name: budget.name,
      currency: budget.currency
    }
    return client.ppost(`/api/data/projects/${projectId}/budgets`, data)
  },

  updateProductionBudget(projectId, budget) {
    const data = {
      name: budget.name,
      currency: budget.currency
    }
    return client.pput(
      `/api/data/projects/${projectId}/budgets/${budget.id}`,
      data
    )
  },

  deleteProductionBudget(projectId, budgetId) {
    return client.pdel(`/api/data/projects/${projectId}/budgets/${budgetId}`)
  },

  getBudgetEntries(projectId, budgetId) {
    return client.pget(
      `/api/data/projects/${projectId}/budgets/${budgetId}/entries`
    )
  },

  getBudgetEntry(projectId, budgetId, budgetEntryId) {
    return client.pget(
      `/api/data/projects/${projectId}/budgets/${budgetId}/entries/${budgetEntryId}`
    )
  },

  createBudgetEntry(projectId, budgetId, budgetEntry) {
    const data = {
      department_id: budgetEntry.department_id,
      person_id: budgetEntry.person_id,
      position: budgetEntry.position,
      seniority: budgetEntry.seniority,
      start_date: formatSimpleDate(budgetEntry.start_date),
      months_duration: budgetEntry.months_duration,
      daily_salary: budgetEntry.daily_salary
    }
    return client.ppost(
      `/api/data/projects/${projectId}/budgets/${budgetId}/entries`,
      data
    )
  },

  updateBudgetEntry(projectId, budgetId, budgetEntryId, budgetEntry) {
    const data = {
      department_id: budgetEntry.department_id,
      person_id: budgetEntry.person_id,
      position: budgetEntry.position,
      seniority: budgetEntry.seniority,
      start_date: formatSimpleDate(budgetEntry.start_date),
      months_duration: budgetEntry.months_duration,
      daily_salary: budgetEntry.daily_salary
    }
    return client.pput(
      `/api/data/projects/${projectId}/budgets/${budgetId}/entries/${budgetEntryId}`,
      data
    )
  },

  deleteBudgetEntry(projectId, budgetId, budgetEntryId) {
    return client.pdel(
      `/api/data/projects/${projectId}/budgets/${budgetId}/entries/${budgetEntryId}`
    )
  }
}
