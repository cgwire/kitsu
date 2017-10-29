import peopleApi from '../api/people'
import auth from '../../lib/auth'
import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL,

  USER_SAVE_PROFILE_LOADING,
  USER_SAVE_PROFILE_ERROR,
  USER_SAVE_PROFILE_SUCCESS,

  USER_CHANGE_PASSWORD_LOADING,
  USER_CHANGE_PASSWORD_ERROR,
  USER_CHANGE_PASSWORD_SUCCESS,
  USER_CHANGE_PASSWORD_UNVALID,

  USER_LOAD_TODOS_START,
  USER_LOAD_TODOS_END,
  USER_LOAD_TODOS_ERROR,

  RESET_ALL
} from '../mutation-types'

const state = {
  user: null,

  isTodosLoading: false,
  isTodosLoadingError: false,
  todos: [],

  isAuthenticated: false,
  isSaveProfileLoading: false,
  isSaveProfileLoadingError: false,

  changePassword: {
    isLoading: false,
    isError: false,
    isSuccess: false,
    isValid: true
  }
}

const getters = {
  user: state => state.user,
  isAuthenticated: state => state.isAuthenticated,
  todos: state => state.todos,

  isSaveProfileLoading: state => state.isSaveProfileLoading,
  isSaveProfileLoadingError: state => state.isSaveProfileLoadingError,

  isTodosLoading: state => state.isTodosLoading,
  isTodosLoadingError: state => state.isTodosLoadingError,

  changePassword: state => state.changePassword
}

const actions = {
  saveProfile ({ commit, state }, payload) {
    commit(USER_SAVE_PROFILE_LOADING)
    peopleApi.updatePerson(payload.form, (err) => {
      if (err) {
        commit(USER_SAVE_PROFILE_ERROR)
      } else {
        commit(USER_SAVE_PROFILE_SUCCESS, payload.form)
      }
      if (payload.callback) payload.callback()
    })
  },

  checkNewPasswordValidityAndSave ({ commit, state }, payload) {
    if (auth.isPasswordValid(
      payload.form.password,
      payload.form.password2
    )) {
      actions.changeUserPassword({ commit, state }, payload)
    } else {
      commit(USER_CHANGE_PASSWORD_UNVALID)
      if (payload.callback) payload.callback()
    }
  },

  changeUserPassword ({ commit, state }, payload) {
    commit(USER_CHANGE_PASSWORD_LOADING)
    peopleApi.changePassword(payload.form, (err) => {
      if (err) {
        commit(USER_CHANGE_PASSWORD_ERROR)
      } else {
        commit(USER_CHANGE_PASSWORD_SUCCESS)
      }
      if (payload.callback) payload.callback()
    })
  },

  loadTodos ({ commit, state }, payload) {
    commit(USER_LOAD_TODOS_START)
    peopleApi.loadTodos((err, tasks) => {
      if (err) {
        commit(USER_LOAD_TODOS_ERROR)
      } else {
        commit(USER_LOAD_TODOS_END, tasks)
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

  [USER_CHANGE_PASSWORD_LOADING] (state) {
    state.changePassword = {
      isLoading: true,
      isError: false,
      isSuccess: false,
      isValid: true
    }
  },
  [USER_CHANGE_PASSWORD_ERROR] (state) {
    state.changePassword = {
      isLoading: false,
      isError: true,
      isSuccess: false,
      isValid: true
    }
  },
  [USER_CHANGE_PASSWORD_SUCCESS] (state) {
    state.changePassword = {
      isLoading: false,
      isError: false,
      isSuccess: true,
      isValid: true
    }
  },
  [USER_CHANGE_PASSWORD_UNVALID] (state) {
    state.changePassword = {
      isLoading: false,
      isError: false,
      isSuccess: false,
      isValid: false
    }
  },

  [USER_LOAD_TODOS_START] (state) {
    state.isTodosLoadingError = false
    state.isTodosLoading = true
  },
  [USER_LOAD_TODOS_END] (state, tasks) {
    state.isTodosLoading = false
    state.todos = tasks
  },
  [USER_LOAD_TODOS_ERROR] (state, tasks) {
    state.isTodosLoadingError = true
  },

  [RESET_ALL] (state) {
    state.user = null
    state.isAuthenticated = false
    state.isSaveProfileLoading = false
    state.isSaveProfileLoadingError = false

    state.isTodosLoading = false
    state.isTodosLoadingError = false
    state.todos = []

    state.changePassword = {
      isLoading: false,
      isError: false,
      isSuccess: false,
      isValid: false
    }
  }
}

export default {
  namespace: true,
  state,
  getters,
  actions,
  mutations
}
