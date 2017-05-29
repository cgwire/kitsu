import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL,
  RESET_ALL
} from '../mutation-types'

const state = {
  user: null,
  isAuthenticated: false
}

const getters = {
  user: state => state.user,
  isAuthenticated: state => state.isAuthenticated
}

const actions = {
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
  [RESET_ALL] (state) {
    state.user = null
    state.isAuthenticated = false
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
