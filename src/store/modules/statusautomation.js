import statusAutomationsApi from '../api/statusautomation'

import {
  LOAD_STATUS_AUTOMATIONS_START,
  LOAD_STATUS_AUTOMATIONS_ERROR,
  LOAD_STATUS_AUTOMATIONS_END,

  EDIT_STATUS_AUTOMATION_END,
  DELETE_STATUS_AUTOMATION_END,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  statusAutomations: [],
  isStatusAutomationsLoading: false,
  isStatusAutomationsLoadingError: false,

  editStatusAutomation: {
    isLoading: false,
    isError: false
  },

  deleteStatusAutomation: {
    isLoading: false,
    isError: false
  }
}

const state = { ...initialState }

const getters = {
  statusAutomations: state => state.statusAutomations,
  statusAutomationMap: state => state.statusAutomationMap,

  isStatusAutomationsLoading: state => state.isStatusAutomationsLoading,
  isStatusAutomationsLoadingError: state => state.isStatusAutomationsLoadingError,

  editStatusAutomation: state => state.editStatusAutomation,
  deleteStatusAutomation: state => state.deleteStatusAutomation,

  /* If automation in production automations and if
   * out field type is not ready for and IN priority is below OUT priority
  */
  isStatusAutomationDisabled: (state, getters, rootState, rootGetters) => (statusAutomation) => {
    return statusAutomation.out_field_type !== 'ready_for' &&
    !rootGetters.isTaskTypePriorityHigherById(statusAutomation.out_task_type_id, statusAutomation.in_task_type_id)
  }
}

const actions = {

  loadStatusAutomations ({ commit, state }, callback) {
    commit(LOAD_STATUS_AUTOMATIONS_START)
    statusAutomationsApi.getStatusAutomations((err, statusAutomations) => {
      if (err) commit(LOAD_STATUS_AUTOMATIONS_ERROR)
      else commit(LOAD_STATUS_AUTOMATIONS_END, statusAutomations)
      if (callback) callback(err)
    })
  },

  newStatusAutomation ({ commit, state }, data) {
    return statusAutomationsApi.newStatusAutomation(data)
      .then((statusAutomation) => {
        commit(EDIT_STATUS_AUTOMATION_END, statusAutomation)
        Promise.resolve(statusAutomation)
      })
  },

  editStatusAutomation ({ commit, state }, data) {
    return statusAutomationsApi.updateStatusAutomation(data)
      .then((statusAutomation) => {
        commit(EDIT_STATUS_AUTOMATION_END, statusAutomation)
        Promise.resolve(statusAutomation)
      })
  },

  deleteStatusAutomation ({ commit, state }, statusAutomation) {
    return statusAutomationsApi.deleteStatusAutomation(statusAutomation)
      .then(() => {
        commit(DELETE_STATUS_AUTOMATION_END, statusAutomation)
        Promise.resolve(statusAutomation)
      })
  },

  postStatusAutomation ({ commit }, { data, url }) {
    statusAutomationsApi.postStatusAutomation(url, data)
  }
}

const mutations = {
  [LOAD_STATUS_AUTOMATIONS_START] (state) {
    state.statusAutomations = []
  },

  [LOAD_STATUS_AUTOMATIONS_ERROR] (state) {
    state.statusAutomations = []
    state.statusAutomationMap = new Map()
  },

  [LOAD_STATUS_AUTOMATIONS_END] (state, statusAutomations) {
    state.statusAutomations = statusAutomations
    state.statusAutomationMap = new Map()
    statusAutomations.forEach(statusAutomation => {
      state.statusAutomationMap.set(statusAutomation.id, statusAutomation)
    })
  },

  [EDIT_STATUS_AUTOMATION_END] (state, newStatusAutomation) {
    const statusAutomation = getters.statusAutomation(state)(newStatusAutomation.id)

    if (statusAutomation && statusAutomation.id) {
      Object.assign(statusAutomation, newStatusAutomation)
    } else {
      state.statusAutomations.push(newStatusAutomation)
    }
  },

  [DELETE_STATUS_AUTOMATION_END] (state, statusAutomationToDelete) {
    const statusAutomationToDeleteIndex = state.statusAutomations.findIndex(
      (statusAutomation) => statusAutomation.id === statusAutomationToDelete.id
    )
    state.statusAutomations.splice(statusAutomationToDeleteIndex, 1)
  },

  [RESET_ALL] (state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
