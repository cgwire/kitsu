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

  customAction: state => id => {
    return state.customActions.find(customAction => customAction.id === id)
  },

  allCustomActions: state => {
    return state.customActions.filter(action => action.entity_type === 'all')
  },

  assetCustomActions: state => {
    return state.customActions.filter(action =>
      ['all', 'asset'].includes(action.entity_type)
    )
  },

  shotCustomActions: state => {
    return state.customActions.filter(action =>
      ['all', 'shot'].includes(action.entity_type)
    )
  }
}

const actions = {
  loadCustomActions({ commit }) {
    commit(LOAD_CUSTOM_ACTIONS_START)
    return customActionsApi.getCustomActions().then(customActions => {
      commit(LOAD_CUSTOM_ACTIONS_END, customActions)
    })
  },

  newCustomAction({ commit }, data) {
    return customActionsApi.newCustomAction(data).then(customAction => {
      commit(EDIT_CUSTOM_ACTION_END, customAction)
    })
  },

  editCustomAction({ commit }, data) {
    return customActionsApi.updateCustomAction(data).then(customAction => {
      commit(EDIT_CUSTOM_ACTION_END, customAction)
    })
  },

  deleteCustomAction({ commit }, customAction) {
    return customActionsApi.deleteCustomAction(customAction).then(() => {
      commit(DELETE_CUSTOM_ACTION_END, customAction)
    })
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
    const customAction = getters.customAction(state)(newCustomAction.id)

    if (customAction && customAction.id) {
      Object.assign(customAction, newCustomAction)
    } else {
      state.customActions.push(newCustomAction)
      state.customActions = sortByName(state.customActions)
    }
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
