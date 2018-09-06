import superagent from 'superagent'
import store from '../store'
import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL,
  LOGIN_RUN
} from '../store/mutation-types.js'

const auth = {

  logIn (email, password, callback) {
    superagent
      .post('/api/auth/login')
      .send({ email, password })
      .end((err, res) => {
        if (err) return callback(err)
        else {
          if (res.body.login) {
            const user = res.body.user
            store.commit(USER_LOGIN, user)
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
        if (err) return callback(err)
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
      console.log({ token, password, password2 })
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
        if (err && res.statusCode === 401) {
          store.commit(USER_LOGIN_FAIL)
          callback(null)
        } else if (err) {
          store.commit(USER_LOGIN_FAIL)
          callback(err)
        } else if (res.body === null) {
          store.commit(USER_LOGIN_FAIL)
          callback(err)
        } else {
          const user = res.body.user
          store.commit(USER_LOGIN, user)
          callback(null, user)
        }
      })
  },

  // Needed for router to know if a redirection to login page is required or
  // not.
  requireAuth (to, from, next) {
    const finalize = () => {
      if (!store.state.user.isAuthenticated) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      } else {
        store.commit(LOGIN_RUN)
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
