import {
  CHANGE_EMAIL,
  CHANGE_PASSWORD,
  LOGIN_RUN,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  DATA_LOADING_START,
  DATA_LOADING_END,
  RESET_ALL,
  USER_LOGOUT
} from '@/store/mutation-types'
import auth from '@/lib/auth'
import { coerceTwoFactorPayload } from '@/lib/webauthn'

const initialState = {
  email: '',
  password: '',
  isLoginLoading: false,
  isLoginError: false,
  isDataLoading: false
}

const state = {
  ...initialState
}

// Offline, the reload would show the error page of the browser, and the
// logout has not reached Zou, which keeps the session open: once the network
// is back, the tab logs out again, then reloads.
const reloadWhenOnline = dispatch => {
  if (navigator.onLine) {
    window.location.reload()
  } else {
    window.addEventListener('online', () => dispatch('logout'), { once: true })
  }
}

const getters = {
  email: state => state.email,
  password: state => state.password,
  isLoginLoading: state => state.isLoginLoading,
  isLoginError: state => state.isLoginError,
  isDataLoading: state => state.isDataLoading
}

const actions = {
  changeEmail({ commit }, email) {
    commit(CHANGE_EMAIL, email)
  },

  changePassword({ commit }, password) {
    commit(CHANGE_PASSWORD, password)
  },

  async logIn({ commit, state }, twoFactorPayload) {
    commit(LOGIN_RUN)
    const payload = {
      email: state.email,
      password: state.password,
      ...coerceTwoFactorPayload(twoFactorPayload)
    }
    try {
      await auth.logIn(payload)
      commit(LOGIN_SUCCESS)
    } catch (err) {
      commit(LOGIN_FAILURE)
      throw err
    }
  },

  // RESET_ALL leaves objects of the session in the stores and in their
  // module caches: the reload leaves none of them to the next login in this
  // tab.
  async logout({ commit, dispatch }) {
    this.$socket.disconnect()
    try {
      await auth.logout()
    } finally {
      commit(RESET_ALL)
      reloadWhenOnline(dispatch)
    }
  },

  // Purge this tab's session state without calling the logout API or
  // re-broadcasting (used when another tab already logged out), unless the
  // network is down.
  logoutLocal({ commit, dispatch }) {
    this.$socket.disconnect()
    commit(USER_LOGOUT)
    commit(RESET_ALL)
    reloadWhenOnline(dispatch)
  },

  resetPassword({}, email) {
    return auth.resetPassword(email)
  },

  async resetChangePassword({ commit }, { email, token, password, password2 }) {
    await auth.resetChangePassword(email, token, password, password2)
    // Filled in on the login page the reset page leads to.
    commit(CHANGE_EMAIL, email)
    commit(LOGIN_SUCCESS)
  }
}

const mutations = {
  [CHANGE_EMAIL](state, email) {
    state.email = email
  },

  [CHANGE_PASSWORD](state, password) {
    state.password = password
  },

  [LOGIN_RUN](state) {
    state.isLoginLoading = true
    state.isLoginError = false
  },

  [LOGIN_SUCCESS](state) {
    state.isLoginLoading = false
    state.isLoginError = false
    state.password = ''
  },

  [LOGIN_FAILURE](state) {
    state.isLoginLoading = false
    state.isLoginError = true
  },

  [DATA_LOADING_START](state) {
    state.isDataLoading = true
  },

  [DATA_LOADING_END](state) {
    if (state.isDataLoading) {
      state.isDataLoading = false
    }
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
