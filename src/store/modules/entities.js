import entitiesApi from '@/store/api/entities'
import { RESET_ALL } from '@/store/mutation-types'

const initialState = {}

const state = { ...initialState }

const getters = {}

const actions = {
  async getEntityNews({ commit }, entityId) {
    return entitiesApi.getEntityNews(entityId)
  },

  async getEntityPreviewFiles({ commit }, entityId) {
    return entitiesApi.getEntityPreviewFiles(entityId)
  },

  async getEntityTimeLogs({ commit }, entityId) {
    return entitiesApi.getEntityTimeLogs(entityId)
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
