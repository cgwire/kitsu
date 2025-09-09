import customActionsApi from '@/store/api/customactions'
import { sortByName } from '@/lib/sorting'

import {
  LOAD_CUSTOM_ACTIONS_START,
  LOAD_CUSTOM_ACTIONS_END,
  EDIT_CUSTOM_ACTION_END,
  DELETE_CUSTOM_ACTION_END,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  customActions: []
}

const state = { ...initialState }

const getters = {
  customActions: state => state.customActions,

  getCustomActionsByType: state => (asset, shot, sequence, edit, episode) =>
    state.customActions.filter(
      action =>
        action.entity_type === 'all' ||
        (asset && action.entity_type === 'asset') ||
        (shot && action.entity_type === 'shot') ||
        (sequence && action.entity_type === 'sequence') ||
        (edit && action.entity_type === 'edit') ||
        (episode && action.entity_type === 'episode')
    )
}

const actions = {
  async loadCustomActions({ commit }) {
    commit(LOAD_CUSTOM_ACTIONS_START)
    const customActions = await customActionsApi.getCustomActions()
    commit(LOAD_CUSTOM_ACTIONS_END, customActions)
  },

  async newCustomAction({ commit }, data) {
    const customAction = await customActionsApi.newCustomAction(data)
    commit(EDIT_CUSTOM_ACTION_END, customAction)
  },

  async editCustomAction({ commit }, data) {
    const customAction = await customActionsApi.updateCustomAction(data)
    commit(EDIT_CUSTOM_ACTION_END, customAction)
  },

  async deleteCustomAction({ commit }, customAction) {
    await customActionsApi.deleteCustomAction(customAction)
    commit(DELETE_CUSTOM_ACTION_END, customAction)
  },

  postCustomAction({}, { data, url }) {
    return customActionsApi.postCustomAction(url, data)
  }
}

const mutations = {
  [LOAD_CUSTOM_ACTIONS_START](state) {
    state.customActions = []
  },

  [LOAD_CUSTOM_ACTIONS_END](state, customActions) {
    state.customActions = customActions
    state.customActions = sortByName(state.customActions)
  },

  [EDIT_CUSTOM_ACTION_END](state, newCustomAction) {
    const customAction = state.customActions.find(
      ({ id }) => id === newCustomAction.id
    )
    if (customAction?.id) {
      Object.assign(customAction, newCustomAction)
    } else {
      state.customActions.push(newCustomAction)
    }
    state.customActions = sortByName(state.customActions)
  },

  [DELETE_CUSTOM_ACTION_END](state, customActionToDelete) {
    const customActionToDeleteIndex = state.customActions.findIndex(
      customAction => customAction.id === customActionToDelete.id
    )
    state.customActions.splice(customActionToDeleteIndex, 1)
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
