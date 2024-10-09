import statusAutomationsApi from '@/store/api/statusautomation'
import { removeModelFromList } from '@/lib/models'

import {
  LOAD_STATUS_AUTOMATIONS_START,
  LOAD_STATUS_AUTOMATIONS_ERROR,
  LOAD_STATUS_AUTOMATIONS_END,
  EDIT_STATUS_AUTOMATION_END,
  DELETE_STATUS_AUTOMATION_END,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  statusAutomations: [],
  statusAutomationMap: new Map(),

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
  statusAutomations: state => state.statusAutomations.filter(s => !s.archived),
  archivedStatusAutomations: state =>
    state.statusAutomations.filter(s => s.archived),
  statusAutomationMap: state => state.statusAutomationMap,

  // Used to know if the automation will apply in the current production.
  isStatusAutomationDisabled:
    (state, getters, rootState, rootGetters) => statusAutomation => {
      return (
        statusAutomation.out_field_type !== 'ready_for' &&
        !rootGetters.isTaskTypePriorityHigherById(
          statusAutomation.out_task_type_id,
          statusAutomation.in_task_type_id
        )
      )
    }
}

const actions = {
  loadStatusAutomations({ commit, state }, callback) {
    commit(LOAD_STATUS_AUTOMATIONS_START)
    statusAutomationsApi.getStatusAutomations((err, statusAutomations) => {
      if (err) commit(LOAD_STATUS_AUTOMATIONS_ERROR)
      else commit(LOAD_STATUS_AUTOMATIONS_END, statusAutomations)
      if (callback) callback(err)
    })
  },

  newStatusAutomation({ commit, state }, data) {
    return statusAutomationsApi
      .newStatusAutomation(data)
      .then(statusAutomation => {
        commit(EDIT_STATUS_AUTOMATION_END, statusAutomation)
        Promise.resolve(statusAutomation)
      })
  },

  editStatusAutomation({ commit, state }, data) {
    return statusAutomationsApi
      .updateStatusAutomation(data)
      .then(statusAutomation => {
        commit(EDIT_STATUS_AUTOMATION_END, statusAutomation)
        Promise.resolve(statusAutomation)
      })
  },

  deleteStatusAutomation({ commit, state }, statusAutomation) {
    return statusAutomationsApi
      .deleteStatusAutomation(statusAutomation)
      .then(() => {
        commit(DELETE_STATUS_AUTOMATION_END, statusAutomation)
        Promise.resolve(statusAutomation)
      })
  },

  postStatusAutomation({ commit }, { data, url }) {
    statusAutomationsApi.postStatusAutomation(url, data)
  }
}

const mutations = {
  [LOAD_STATUS_AUTOMATIONS_START](state) {
    state.statusAutomations = []
  },

  [LOAD_STATUS_AUTOMATIONS_ERROR](state) {
    state.statusAutomations = []
    state.statusAutomationMap = new Map()
  },

  [LOAD_STATUS_AUTOMATIONS_END](state, statusAutomations) {
    state.statusAutomations = statusAutomations
    state.statusAutomationMap = new Map()
    if (!statusAutomations) {
      return
    }
    statusAutomations.forEach(statusAutomation => {
      state.statusAutomationMap.set(statusAutomation.id, statusAutomation)
    })
  },

  [EDIT_STATUS_AUTOMATION_END](state, newAutomation) {
    const automation = state.statusAutomationMap.get(newAutomation.id)
    if (automation && automation.id) {
      Object.assign(automation, newAutomation)
    } else {
      state.statusAutomations.push(newAutomation)
    }
    state.statusAutomationMap.set(newAutomation.id, newAutomation)
  },

  [DELETE_STATUS_AUTOMATION_END](state, statusAutomationToDelete) {
    state.statusAutomations = removeModelFromList(
      state.statusAutomations,
      statusAutomationToDelete
    )
    state.statusAutomationMap.delete(statusAutomationToDelete.id)
  },

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
