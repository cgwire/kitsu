import budgetApi from '@/store/api/budget'

import { RESET_ALL } from '@/store/mutation-types'

const initialState = {}
const state = { ...initialState }

const getters = {}

const actions = {
  async loadProductionBudgets({}, productionId) {
    return await budgetApi.getProductionBudgets(productionId)
  },

  async loadProductionBudget({}, { productionId, budgetId }) {
    return await budgetApi.getProductionBudget(productionId, budgetId)
  },

  async createProductionBudget({}, { productionId, budget }) {
    return await budgetApi.createProductionBudget(productionId, budget)
  },

  async updateProductionBudget({}, { productionId, budget }) {
    return await budgetApi.updateProductionBudget(productionId, budget)
  },

  async deleteProductionBudget({}, { productionId, budgetId }) {
    return await budgetApi.deleteProductionBudget(productionId, budgetId)
  },

  async loadProductionBudgetEntries({}, { productionId, budgetId }) {
    return await budgetApi.getBudgetEntries(productionId, budgetId)
  },

  async loadProductionBudgetEntry(
    {},
    { productionId, budgetId, budgetEntryId }
  ) {
    return await budgetApi.getBudgetEntry(productionId, budgetId, budgetEntryId)
  },

  async createProductionBudgetEntry(
    {},
    { productionId, budgetId, budgetEntry }
  ) {
    return await budgetApi.createBudgetEntry(
      productionId,
      budgetId,
      budgetEntry
    )
  },

  async updateProductionBudgetEntry(
    {},
    { productionId, budgetId, budgetEntryId, budgetEntry }
  ) {
    return await budgetApi.updateBudgetEntry(
      productionId,
      budgetId,
      budgetEntryId,
      budgetEntry
    )
  },

  async deleteProductionBudgetEntry(
    {},
    { productionId, budgetId, budgetEntryId }
  ) {
    return await budgetApi.deleteBudgetEntry(
      productionId,
      budgetId,
      budgetEntryId
    )
  },

  async loadExpenses({}, productionId) {
    return await budgetApi.getExpenses(productionId)
  }
}

const mutations = {
  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
