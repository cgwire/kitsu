import filesApi from '@/store/api/files'

import {
  SET_FILE_STATUSES,
  SET_OUTPUT_FILE_TYPES,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  fileStatuses: [],
  fileStatusMap: new Map(),
  outputFileTypes: [],
  outputFileTypeMap: new Map(),
  entitiyOutputFiles: []
}

const state = { ...initialState }

const getters = {
  fileStatusMap: state => state.fileStatusMap,
  outputFileTypeMap: state => state.outputFileTypeMap
}

const actions = {
  async loadFileStatuses({ commit }) {
    const fileStatuses = await filesApi.getFileStatuses()
    commit(SET_FILE_STATUSES, fileStatuses)
  },

  async loadOutputTypes({ commit }) {
    const outputFileTypes = await filesApi.getOutputTypes()
    commit(SET_OUTPUT_FILE_TYPES, outputFileTypes)
  },

  async loadEntityOutputFiles({ commit }, entityId) {
    try {
      const entityOutputFiles = await filesApi.getEntityOutputFiles(entityId)
      return entityOutputFiles
    } catch (error) {
      console.error('Error loading entity output files', error)
      return []
    }
  }
}

const mutations = {
  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  },

  [SET_FILE_STATUSES](state, fileStatuses) {
    state.fileStatuses = fileStatuses
    state.fileStatusMap = new Map(
      fileStatuses.map(status => [status.id, status])
    )
  },

  [SET_OUTPUT_FILE_TYPES](state, outputFileTypes) {
    state.outputFileTypes = outputFileTypes
    state.outputFileTypeMap = new Map(outputFileTypes.map(oft => [oft.id, oft]))
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
