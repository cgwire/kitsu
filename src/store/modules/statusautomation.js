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

const cache = {
  statusAutomationMap: new Map()
}

const initialState = {
  statusAutomations: []
}

const state = { ...initialState }

const getters = {
  statusAutomations: state => state.statusAutomations.filter(s => !s.archived),
  archivedStatusAutomations: state =>
    state.statusAutomations.filter(s => s.archived),
  statusAutomationMap: () => cache.statusAutomationMap,

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
  async loadStatusAutomations({ commit }) {
    commit(LOAD_STATUS_AUTOMATIONS_START)
    try {
      const statusAutomations =
        await statusAutomationsApi.getStatusAutomations()
      commit(LOAD_STATUS_AUTOMATIONS_END, statusAutomations)
    } catch (err) {
      commit(LOAD_STATUS_AUTOMATIONS_ERROR)
    }
  },

  async newStatusAutomation({ commit }, data) {
    const statusAutomation =
      await statusAutomationsApi.newStatusAutomation(data)
    commit(EDIT_STATUS_AUTOMATION_END, statusAutomation)
    return statusAutomation
  },

  async editStatusAutomation({ commit }, data) {
    const statusAutomation =
      await statusAutomationsApi.updateStatusAutomation(data)
    commit(EDIT_STATUS_AUTOMATION_END, statusAutomation)
    return statusAutomation
  },

  async deleteStatusAutomation({ commit }, statusAutomation) {
    await statusAutomationsApi.deleteStatusAutomation(statusAutomation)
    commit(DELETE_STATUS_AUTOMATION_END, statusAutomation)
    return statusAutomation
  }
}

const mutations = {
  [LOAD_STATUS_AUTOMATIONS_START](state) {
    state.statusAutomations = []
  },

  [LOAD_STATUS_AUTOMATIONS_ERROR](state) {
    state.statusAutomations = []
    cache.statusAutomationMap = new Map()
  },

  [LOAD_STATUS_AUTOMATIONS_END](state, statusAutomations) {
    state.statusAutomations = statusAutomations
    cache.statusAutomationMap = new Map()
    statusAutomations.forEach(statusAutomation => {
      cache.statusAutomationMap.set(statusAutomation.id, statusAutomation)
    })
  },

  [EDIT_STATUS_AUTOMATION_END](state, newAutomation) {
    const automation = state.statusAutomations.find(
      ({ id }) => id === newAutomation.id
    )
    if (automation?.id) {
      Object.assign(automation, newAutomation)
    } else {
      state.statusAutomations.push(newAutomation)
    }
    cache.statusAutomationMap.set(newAutomation.id, newAutomation)
  },

  [DELETE_STATUS_AUTOMATION_END](state, statusAutomationToDelete) {
    state.statusAutomations = removeModelFromList(
      state.statusAutomations,
      statusAutomationToDelete
    )
    cache.statusAutomationMap.delete(statusAutomationToDelete.id)
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  cache
}
