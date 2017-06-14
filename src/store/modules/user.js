import peopleApi from '../api/people'
import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL,

  USER_SAVE_PROFILE_LOADING,
  USER_SAVE_PROFILE_ERROR,
  USER_SAVE_PROFILE_SUCCESS,

  RESET_ALL
} from '../mutation-types'

const state = {
  user: null,
  isAuthenticated: false,
  isSaveProfileLoading: false,
  isSaveProfileLoadingError: false
}

const getters = {
  user: state => state.user,
  isAuthenticated: state => state.isAuthenticated,
  isSaveProfileLoading: state => state.isSaveProfileLoading,
  isSaveProfileLoadingError: state => state.isSaveProfileLoadingError
}

const actions = {
  saveProfile ({ commit, state }, payload) {
    commit('USER_SAVE_PROFILE_LOADING')
    peopleApi.updatePerson(payload.form, (err) => {
      if (err) {
        commit(USER_SAVE_PROFILE_ERROR)
      } else {
        commit(USER_SAVE_PROFILE_SUCCESS, payload.form)
      }
      if (payload.callback) payload.callback()
    })
  }
}

const mutations = {
  [USER_LOGIN] (state, user) {
    state.user = user
    state.isAuthenticated = true
  },
  [USER_LOGOUT] (state, user) {
    state.user = null
    state.isAuthenticated = false
  },
  [USER_LOGIN_FAIL] (state, user) {
    state.user = null
    state.isAuthenticated = false
  },

  [USER_SAVE_PROFILE_LOADING] (state) {
    state.isSaveProfileLoading = true
    state.isSaveProfileLoadingError = false
  },
  [USER_SAVE_PROFILE_ERROR] (state) {
    state.isSaveProfileLoading = false
    state.isSaveProfileLoadingError = true
  },
  [USER_SAVE_PROFILE_SUCCESS] (state, form) {
    Object.assign(state.user, form)
    state.isSaveProfileLoading = false
    state.isSaveProfileLoadingError = false
  },

  [RESET_ALL] (state) {
    state.user = null
    state.isAuthenticated = false
    state.isSaveProfileLoading = false
    state.isSaveProfileLoadingError = false
  }
}

export default {
  namespace: true,
  state,
  getters,
  actions,
  mutations
}
