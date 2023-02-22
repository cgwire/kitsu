import superagent from 'superagent'
import store from '@/store'
import {
  DATA_LOADING_START,
  SET_ORGANISATION,
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL
} from '@/store/mutation-types.js'

const auth = {

  logIn (email, password, callback) {
    superagent
      .post('/api/auth/login')
      .send({ email, password })
      .end((err, res) => {
        if (err) {
          if (res.body.default_password) {
            err.default_password = res.body.default_password
            err.token = res.body.token
          }
          callback(err)
        } else {
          if (res.body.login) {
            const user = res.body.user
            store.commit(DATA_LOADING_START, {})
            callback(null, user)
          } else {
            store.commit(USER_LOGIN_FAIL)
            callback(new Error('Login failed'))
          }
        }
      })
  },

  logout (callback) {
    superagent
      .get('/api/auth/logout')
      .end((err, res) => {
        if (err) {
          console.error(err)
          callback(err)
        }
        store.commit(USER_LOGOUT)
        callback()
      })
  },

  resetPassword (email) {
    return new Promise((resolve, reject) => {
      superagent
        .post('/api/auth/reset-password')
        .send({ email })
        .end((err, res) => {
          if (err) reject(err)
          else resolve()
        })
    })
  },

  resetChangePassword (token, password, password2) {
    return new Promise((resolve, reject) => {
      superagent
        .put('/api/auth/reset-password')
        .send({ token, password, password2 })
        .end((err, res) => {
          if (err) reject(err)
          else resolve()
        })
    })
  },

  isServerLoggedIn (callback) {
    superagent
      .get('/api/auth/authenticated')
      .end((err, res) => {
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
          organisation.use_original_file_name =
            organisation.use_original_file_name ? 'true' : 'false'
          organisation.timesheets_locked =
            organisation.timesheets_locked ? 'true' : 'false'
          organisation.hd_by_default =
            organisation.hd_by_default ? 'true' : 'false'
          store.commit(SET_ORGANISATION, organisation)
          store.commit(USER_LOGIN, user)
          callback(null)
        }
      })
  },

  // Needed for router to know if a redirection to login page is required or
  // not.
  requireAuth (to, from, next) {
    const finalize = () => {
      if (!store.state.user.isAuthenticated) {
        store.dispatch('getOrganisation')
          .then(() => {
            next({
              path: '/login',
              query: { redirect: to.fullPath }
            })
          })
          .catch((err) => {
            console.error(err)
            next({
              path: '/login',
              query: { redirect: to.fullPath }
            })
          })
      } else {
        store.commit(DATA_LOADING_START, {})
        next()
      }
    }

    if (store.state.user.user === null) {
      auth.isServerLoggedIn((err) => {
        if (err) {
          next({
            path: '/server-down',
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

  isPasswordValid (password, password2) {
    return password.length > 6 && password === password2
  }
}
export default auth
