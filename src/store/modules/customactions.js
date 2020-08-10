import customActionsApi from '../api/customactions'
import { sortByName } from '../../lib/sorting'

import {
  LOAD_CUSTOM_ACTIONS_START,
  LOAD_CUSTOM_ACTIONS_ERROR,
  LOAD_CUSTOM_ACTIONS_END,

  EDIT_CUSTOM_ACTION_END,
  DELETE_CUSTOM_ACTION_END,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  customActions: [],
  isCustomActionsLoading: false,
  isCustomActionsLoadingError: false,

  editCustomAction: {
    isLoading: false,
    isError: false
  },

  deleteCustomAction: {
    isLoading: false,
    isError: false
  }
}

const state = { ...initialState }

const getters = {
  customActions: state => state.customActions,

  isCustomActionsLoading: state => state.isCustomActionsLoading,
  isCustomActionsLoadingError: state => state.isCustomActionsLoadingError,

  editCustomAction: state => state.editCustomAction,
  deleteCustomAction: state => state.deleteCustomAction,

  customAction: (state, getters, rootState) => (id) => {
    return state.customActions.find(
      (customAction) => customAction.id === id
    )
  },

  allCustomActions: (state) => {
    return state
      .customActions
      .filter((action) => action.entity_type === 'all')
  },

  assetCustomActions: (state) => {
    return state
      .customActions
      .filter((action) => ['all', 'asset'].includes(action.entity_type))
  },

  shotCustomActions: (state) => {
    return state
      .customActions
      .filter((action) => ['all', 'shot'].includes(action.entity_type))
  }
}

const actions = {

  loadCustomActions ({ commit, state }, callback) {
    commit(LOAD_CUSTOM_ACTIONS_START)
    customActionsApi.getCustomActions((err, customActions) => {
      if (err) commit(LOAD_CUSTOM_ACTIONS_ERROR)
      else commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      if (callback) callback(err)
    })
  },

  newCustomAction ({ commit, state }, data) {
    return customActionsApi.newCustomAction(data)
      .then((customAction) => {
        commit(EDIT_CUSTOM_ACTION_END, customAction)
        Promise.resolve(customAction)
      })
  },

  editCustomAction ({ commit, state }, data) {
    return customActionsApi.updateCustomAction(data)
      .then((customAction) => {
        commit(EDIT_CUSTOM_ACTION_END, customAction)
        Promise.resolve(customAction)
      })
  },

  deleteCustomAction ({ commit, state }, customAction) {
    return customActionsApi.deleteCustomAction(customAction)
      .then(() => {
        commit(DELETE_CUSTOM_ACTION_END, customAction)
        Promise.resolve(customAction)
      })
  },

  postCustomAction ({ commit }, { data, url }) {
    customActionsApi.postCustomAction(url, data)
  }
}

const mutations = {
  [LOAD_CUSTOM_ACTIONS_START] (state) {
    state.customActions = []
  },

  [LOAD_CUSTOM_ACTIONS_END] (state, customActions) {
    state.customActions = customActions
    state.customActions = sortByName(state.customActions)
  },

  [EDIT_CUSTOM_ACTION_END] (state, newCustomAction) {
    const customAction = getters.customAction(state)(newCustomAction.id)

    if (customAction && customAction.id) {
      Object.assign(customAction, newCustomAction)
    } else {
      state.customActions.push(newCustomAction)
      state.customActions = sortByName(state.customActions)
    }
  },

  [DELETE_CUSTOM_ACTION_END] (state, customActionToDelete) {
    const customActionToDeleteIndex = state.customActions.findIndex(
      (customAction) => customAction.id === customActionToDelete.id
    )
    state.customActions.splice(customActionToDeleteIndex, 1)
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
