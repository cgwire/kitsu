import customActionsApi from '../api/customactions'
import { sortByName } from '../../lib/sorting'

import {
  LOAD_CUSTOM_ACTIONS_START,
  LOAD_CUSTOM_ACTIONS_ERROR,
  LOAD_CUSTOM_ACTIONS_END,

  EDIT_CUSTOM_ACTION_START,
  EDIT_CUSTOM_ACTION_ERROR,
  EDIT_CUSTOM_ACTION_END,

  DELETE_CUSTOM_ACTION_START,
  DELETE_CUSTOM_ACTION_ERROR,
  DELETE_CUSTOM_ACTION_END,

  RESET_ALL
} from '../mutation-types'

const state = {
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

const getters = {
  customActions: state => state.customActions,

  isCustomActionsLoading: state => state.isCustomActionsLoading,
  isCustomActionsLoadingError: state => state.isCustomActionsLoadingError,

  editCustomAction: state => state.editCustomAction,
  deleteCustomAction: state => state.deleteCustomAction,

  customAction: (state, getters) => (id) => {
    return state.customActions.find(
      (customAction) => customAction.id === id
    )
  },

  customActionOptions: state => state.customActions.map(
    (type) => { return { label: type.name, value: type.id } }
  )
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

  newCustomAction ({ commit, state }, {data, callback}) {
    commit(EDIT_CUSTOM_ACTION_START, data)
    customActionsApi.newCustomAction(data, (err, customAction) => {
      if (err) {
        commit(EDIT_CUSTOM_ACTION_ERROR)
      } else {
        commit(EDIT_CUSTOM_ACTION_END, customAction)
      }
      if (callback) callback(err)
    })
  },

  editCustomAction ({ commit, state }, {data, callback}) {
    commit(EDIT_CUSTOM_ACTION_START)
    customActionsApi.updateCustomAction(data, (err, customAction) => {
      if (err) {
        commit(EDIT_CUSTOM_ACTION_ERROR)
      } else {
        commit(EDIT_CUSTOM_ACTION_END, customAction)
      }
      if (callback) callback(err)
    })
  },

  deleteCustomAction ({ commit, state }, {customAction, callback}) {
    commit(DELETE_CUSTOM_ACTION_START)
    customActionsApi.deleteCustomAction(customAction, (err) => {
      if (err) {
        commit(DELETE_CUSTOM_ACTION_ERROR)
      } else {
        commit(DELETE_CUSTOM_ACTION_END, customAction)
      }
      if (callback) callback(err)
    })
  }
}

const mutations = {
  [LOAD_CUSTOM_ACTIONS_START] (state) {
    state.isCustomActionsLoading = true
    state.isCustomActionsLoadingError = false
  },

  [LOAD_CUSTOM_ACTIONS_ERROR] (state) {
    state.isCustomActionsLoading = false
    state.isCustomActionsLoadingError = true
  },

  [LOAD_CUSTOM_ACTIONS_END] (state, customActions) {
    state.isCustomActionsLoading = false
    state.isCustomActionsLoadingError = false
    state.customActions = customActions
    state.customActions = sortByName(state.customActions)
  },

  [EDIT_CUSTOM_ACTION_START] (state, data) {
    state.editCustomAction.isLoading = true
    state.editCustomAction.isError = false
  },

  [EDIT_CUSTOM_ACTION_ERROR] (state) {
    state.editCustomAction.isLoading = false
    state.editCustomAction.isError = true
  },

  [EDIT_CUSTOM_ACTION_END] (state, newCustomAction) {
    const customAction = getters.customAction(state)(newCustomAction.id)

    if (customAction && customAction.id) {
      Object.assign(customAction, newCustomAction)
    } else {
      state.customActions.push(newCustomAction)
      state.customActions = sortByName(state.customActions)
    }
    state.editCustomAction = {
      isLoading: false,
      isError: false
    }
  },

  [DELETE_CUSTOM_ACTION_START] (state) {
    state.deleteCustomAction = {
      isLoading: true,
      isError: false
    }
  },
  [DELETE_CUSTOM_ACTION_ERROR] (state) {
    state.deleteCustomAction = {
      isLoading: false,
      isError: true
    }
  },
  [DELETE_CUSTOM_ACTION_END] (state, customActionToDelete) {
    const customActionToDeleteIndex = state.customActions.findIndex(
      (customAction) => customAction.id === customActionToDelete.id
    )
    state.customActions.splice(customActionToDeleteIndex, 1)

    state.deleteCustomAction = {
      isLoading: false,
      isError: false
    }
  },

  [RESET_ALL] (state) {
    state.customActions = []
    state.isCustomActionsLoading = false
    state.isCustomActionsLoadingError = false

    state.editCustomAction = {
      isLoading: false,
      isError: false
    }

    state.deleteCustomAction = {
      isLoading: false,
      isError: false
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
