import superagent from 'superagent'

import store from '@/store'
import client from '@/store/api/client'
import {
  DATA_LOADING_START,
  DATA_LOADING_END,
  SET_ORGANISATION,
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL
} from '@/store/mutation-types.js'

let channel
const AUTHENTICATED_REQUEST_TIMEOUT_MS = 20000

const auth = {
  async logIn(payload) {
    let res
    try {
      res = await superagent.post('/api/auth/login').send(payload)
    } catch (err) {
      const body = err.response?.body
      if (body) {
        if (body.default_password) {
          err.default_password = body.default_password
          err.token = body.token
        }
        if (body.too_many_failed_login_attemps) {
          err.too_many_failed_login_attemps = true
        }
        if (body.wrong_OTP) {
          err.wrong_OTP = true
        }
        if (body.missing_OTP) {
          err.missing_OTP = true
          err.preferred_two_factor_authentication =
            body.preferred_two_factor_authentication
          err.two_factor_authentication_enabled =
            body.two_factor_authentication_enabled
        }
      }
      if (!err.response || err.status >= 500) {
        err.server_error = true
      }
      throw err
    }

    if (!res.body.login) {
      store.commit(USER_LOGIN_FAIL)
      throw new Error('Login failed')
    }

    const user = res.body.user
    store.commit(USER_LOGIN, user)

    if (res.body.two_factor_authentication_required) {
      const err = new Error('Two-factor authentication required')
      err.two_factor_authentication_required = true
      throw err
    }

    store.commit(DATA_LOADING_START)
    return user
  },

  async logout() {
    try {
      await superagent.get('/api/auth/logout')
    } finally {
      store.commit(USER_LOGOUT)
      this.postBroadcastMessage('logout')
    }
  },

  resetPassword(email) {
    const data = { email }
    return client.ppost('/api/auth/reset-password', data)
  },

  resetChangePassword(email, token, password, password2) {
    const data = {
      email,
      token,
      password,
      password2
    }
    return client.pput('/api/auth/reset-password', data)
  },

  // Resolves when the server answered (authenticated or not), rejects when
  // the server is unreachable.
  async isServerLoggedIn() {
    let res
    try {
      res = await superagent
        .get('/api/auth/authenticated')
        .timeout(AUTHENTICATED_REQUEST_TIMEOUT_MS)
    } catch (err) {
      store.commit(USER_LOGIN_FAIL)
      if ([401, 422].includes(err.status)) return
      throw err
    }

    if (res.body === null) {
      store.commit(USER_LOGIN_FAIL)
      return
    }

    const user = res.body.user
    const organisation = res.body.organisation || {}
    store.commit(SET_ORGANISATION, organisation)
    store.commit(USER_LOGIN, user)
  },

  // Needed for router to know if a redirection to login page is required or
  // not. Resolves to a route location to redirect to, or undefined to let the
  // navigation proceed.
  async requireAuth(to, from) {
    store.commit(DATA_LOADING_START)

    if (store.state.user.user === null) {
      try {
        await auth.isServerLoggedIn()
      } catch {
        store.commit(DATA_LOADING_END)
        return {
          name: 'server-down',
          query: { redirect: to.fullPath }
        }
      }
    }

    if (!store.state.user.isAuthenticated) {
      store.commit(DATA_LOADING_END)
      return {
        name: 'login',
        query: { redirect: to.fullPath }
      }
    }
  },

  isPasswordValid(password, password2) {
    return password.length >= 8 && password === password2
  },

  getBroadcastChannel() {
    if (!channel && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('auth')
    }
    return channel
  },

  postBroadcastMessage(message) {
    const channel = this.getBroadcastChannel()
    channel?.postMessage(message)
  }
}
export default auth
