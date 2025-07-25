import superagent from 'superagent'
import store from '@/store'
import client from '@/store/api/client'
import {
  DATA_LOADING_START,
  SET_ORGANISATION,
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL
} from '@/store/mutation-types.js'

let channel

const auth = {
  logIn(payload, callback) {
    superagent
      .post('/api/auth/login')
      .send(payload)
      .end((err, res) => {
        if (err) {
          if (res?.body) {
            if (res.body.default_password) {
              err.default_password = res.body.default_password
              err.token = res.body.token
            }
            if (res.body.too_many_failed_login_attemps) {
              err.too_many_failed_login_attemps = true
            }
            if (res.body.wrong_OTP) {
              err.wrong_OTP = true
            }
            if (res.body.missing_OTP) {
              err.missing_OTP = true
              err.preferred_two_factor_authentication =
                res.body.preferred_two_factor_authentication
              err.two_factor_authentication_enabled =
                res.body.two_factor_authentication_enabled
            }
          }
          if (!res || err.status >= 500) {
            err.server_error = true
          }
          callback(err)
        } else {
          if (res.body.login) {
            const user = res.body.user
            store.commit(DATA_LOADING_START)
            callback(null, user)
          } else {
            store.commit(USER_LOGIN_FAIL)
            callback(new Error('Login failed'))
          }
        }
      })
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

  isServerLoggedIn(callback) {
    superagent.get('/api/auth/authenticated').end((err, res) => {
      if (err && res && [401, 422].includes(res.statusCode)) {
        store.commit(USER_LOGIN_FAIL)
        callback(null)
      } else if (err) {
        store.commit(USER_LOGIN_FAIL)
        callback(err)
      } else if (res && res.body === null) {
        store.commit(USER_LOGIN_FAIL)
        callback(err)
      } else {
        const user = res.body.user
        const organisation = res.body.organisation || {}
        store.commit(SET_ORGANISATION, organisation)
        store.commit(USER_LOGIN, user)
        callback(null)
      }
    })
  },

  // Needed for router to know if a redirection to login page is required or
  // not.
  requireAuth(to, from, next) {
    const finalize = () => {
      if (!store.state.user.isAuthenticated) {
        next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
      } else {
        store.commit(DATA_LOADING_START)
        next()
      }
    }

    if (store.state.user.user === null) {
      auth.isServerLoggedIn(err => {
        if (err) {
          next({
            name: 'server-down',
            query: { redirect: to.fullPath }
          })
        } else {
          finalize()
        }
      })
    } else {
      finalize()
    }
  },

  isPasswordValid(password, password2) {
    return password.length > 6 && password === password2
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
