import {
  CHANGE_EMAIL,
  CHANGE_PASSWORD,
  LOGIN_RUN,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  DATA_LOADING_START,
  DATA_LOADING_END,
  RESET_ALL
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

const getters = {
  email: state => state.email,
  password: state => state.password,
  isLoginLoading: state => state.isLoginLoading,
  isLoginError: state => state.isLoginError,
  isDataLoading: state => state.isDataLoading
}

const actions = {
  changeEmail({ commit, state }, email) {
    commit(CHANGE_EMAIL, email)
  },

  changePassword({ commit, state }, password) {
    commit(CHANGE_PASSWORD, password)
  },

  logIn({ commit, state }, { twoFactorPayload, callback }) {
    commit(LOGIN_RUN)
    const payload = {
      email: state.email,
      password: state.password,
      ...coerceTwoFactorPayload(twoFactorPayload)
    }
    auth.logIn(payload, err => {
      if (err) {
        commit(LOGIN_FAILURE)
        callback(err, false)
      } else {
        commit(LOGIN_SUCCESS)
        callback(null, true)
      }
    })
  },

  async logout({ commit, state }) {
    this.$socket.disconnect()
    await auth.logout()
    commit(RESET_ALL)
  },

  resetPassword({ commit }, email) {
    return new Promise((resolve, reject) => {
      auth.resetPassword(email).then(resolve).catch(reject)
    })
  },

  resetChangePassword({ commit }, { email, token, password, password2 }) {
    return new Promise((resolve, reject) => {
      auth
        .resetChangePassword(email, token, password, password2)
        .then(() => {
          commit(LOGIN_SUCCESS)
          resolve()
        })
        .catch(reject)
    })
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
