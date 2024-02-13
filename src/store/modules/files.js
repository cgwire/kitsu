import client from '@/store/api/client'

import { RESET_ALL } from '@/store/mutation-types'

const initialState = {
  fileStatuses: [],
  fileStatusMap: new Map(),
  outputFileTypes: [],
  outputFileTypeMap: new Map()
}

const state = { ...initialState }

const getters = {
  fileStatusMap: state => state.fileStatusMap,
  outputFileTypeMap: state => state.outputFileTypeMap
}

const actions = {
  async loadFileStatuses({ commit }) {
    const fileStatuses = await client.getFileStatuses()
    commit('SET_FILE_STATUSES', fileStatuses)
  },

  async loadOutputFileTypes({ commit }) {
    const outputFileTypes = await client.getOutputFileTypes()
    commit('SET_OUTPUT_FILE_TYPES', outputFileTypes)
  }
}

const mutations = {
  [RESET_ALL](state) {
    const isDarkTheme = state.isDarkTheme
    Object.assign(state, { ...initialState })
    state.isDarkTheme = isDarkTheme
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
