import { removeModelFromList } from '@/lib/models'
import { getProjectTaskTypePriority } from '@/lib/productions'
import { getTrigger } from '@/lib/statusautomations'
import statusAutomationsApi from '@/store/api/statusautomation'

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

  // Zou never fires a status change from a condition whose task type comes
  // strictly after the output task type in the current production: such a
  // condition still has to be met under "and", and is ignored under "or".
  getGuardOnlyConditions:
    (state, getters, rootState, rootGetters) => statusAutomation => {
      if (statusAutomation.out_field_type === 'ready_for') return []
      const getPriority = taskTypeId =>
        getProjectTaskTypePriority(taskTypeId, rootGetters.currentProduction)
      const outPriority = getPriority(statusAutomation.out_task_type_id)
      return getTrigger(statusAutomation).conditions.filter(
        condition => getPriority(condition.task_type_id) > outPriority
      )
    },

  isStatusAutomationDisabled: (state, getters) => statusAutomation => {
    const { conditions } = getTrigger(statusAutomation)
    return (
      conditions.length > 0 &&
      getters.getGuardOnlyConditions(statusAutomation).length ===
        conditions.length
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
    cache.statusAutomationMap.clear()
  },

  [LOAD_STATUS_AUTOMATIONS_END](state, statusAutomations) {
    state.statusAutomations = statusAutomations
    cache.statusAutomationMap.clear()
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
    cache.statusAutomationMap.clear()
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  cache
}
