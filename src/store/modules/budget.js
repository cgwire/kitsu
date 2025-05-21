import budgetApi from '@/store/api/budget'

import { RESET_ALL } from '@/store/mutation-types'

const initialState = {
  budgets: []
}
const state = { ...initialState }

const getters = {}

const actions = {
  async loadProductionBudgets({ commit }, productionId) {
    return await budgetApi.getProductionBudgets(productionId)
  },

  async loadProductionBudget({ commit }, { productionId, budgetId }) {
    return await budgetApi.getProductionBudget(productionId, budgetId)
  },

  async createProductionBudget({ commit }, { productionId, budget }) {
    return await budgetApi.createProductionBudget(productionId, budget)
  },

  async updateProductionBudget({ commit }, { productionId, budget }) {
    return await budgetApi.updateProductionBudget(productionId, budget)
  },

  async deleteProductionBudget({ commit }, { productionId, budgetId }) {
    return await budgetApi.deleteProductionBudget(productionId, budgetId)
  },

  async loadProductionBudgetEntries({ commit }, { productionId, budgetId }) {
    return await budgetApi.getBudgetEntries(productionId, budgetId)
  },

  async loadProductionBudgetEntry(
    { commit },
    { productionId, budgetId, budgetEntryId }
  ) {
    return await budgetApi.getBudgetEntry(productionId, budgetId, budgetEntryId)
  },

  async createProductionBudgetEntry(
    { commit },
    { productionId, budgetId, budgetEntry }
  ) {
    return await budgetApi.createBudgetEntry(
      productionId,
      budgetId,
      budgetEntry
    )
  },

  async updateProductionBudgetEntry(
    { commit },
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
    { commit },
    { productionId, budgetId, budgetEntryId }
  ) {
    return await budgetApi.deleteBudgetEntry(
      productionId,
      budgetId,
      budgetEntryId
    )
  },

  async loadExpenses({ commit }, productionId) {
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
