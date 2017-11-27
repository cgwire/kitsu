import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import peopleApi from '../../src/store/api/people'
import auth from '../../src/lib/auth'
import {
  CHANGE_EMAIL,
  CHANGE_PASSWORD,

  LOGIN_RUN,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,

  TOGGLE_USER_MENU
} from '../../src/store/mutation-types'

const people = [
  {
    first_name: 'John',
    last_name: 'Doe'
  },
  {
    first_name: 'Ema',
    last_name: 'Peel'
  },
  {
    first_name: 'Alan',
    last_name: 'Carter'
  },
  {
    first_name: 'Chris',
    last_name: 'Peel'
  }
]

peopleApi.getPeople = (callback) => {
  process.nextTick(() => {
    callback(null, people)
  })
}

describe('login', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  describe('actions', () => {
    it('changeEmail', (done) => {
      helpers.runAction('changeEmail', 'new email')
      done()
    })
    it('changePassword', (done) => {
      helpers.runAction('changePassword', 'new password')
      done()
    })
    it('logIn', (done) => {
      auth.logIn = (email, password, callback) => {
        callback()
      }
      helpers.runAction('logIn', (err) => {
        expect(err).to.be.null
        done()
      })
    })
    it('logout', (done) => {
      expect(store._vm.isUserMenuHidden).to.equal(true)
      auth.logout = (callback) => {
        callback()
      }
      helpers.runAction('logout', (err) => {
        expect(err).to.be.null
        expect(store._vm.isLoginLoading).to.equal(false)
        expect(store._vm.isLoginError).to.equal(false)
        expect(store._vm.password).to.equal('')
        expect(store._vm.isUserMenuHidden).to.equal(false)
        done()
      })
    })
  })

  describe('mutations', () => {
    it('CHANGE_EMAIL', () => {
      store.commit(CHANGE_EMAIL, 'new email')
      expect(store._vm.email).to.equal('new email')
    })

    it('CHANGE_PASSWORD', () => {
      store.commit(CHANGE_PASSWORD, 'new password')
      expect(store._vm.password).to.equal('new password')
    })

    it('LOGIN_RUN', () => {
      store.commit(LOGIN_RUN)
      expect(store._vm.isLoginLoading).to.equal(true)
      expect(store._vm.isLoginError).to.equal(false)
    })

    it('LOGIN_SUCCESS', () => {
      store.commit(LOGIN_SUCCESS)
      expect(store._vm.isLoginLoading).to.equal(false)
      expect(store._vm.isLoginError).to.equal(false)
      expect(store._vm.password).to.equal('')
    })

    it('LOGIN_FAILURE', () => {
      store.commit(LOGIN_FAILURE)
      expect(store._vm.isLoginLoading).to.equal(false)
      expect(store._vm.isLoginError).to.equal(true)
    })

    it('LOGOUT_SUCCESS', () => {
      store.commit(LOGOUT_SUCCESS)
      expect(store._vm.isLoginLoading).to.equal(false)
      expect(store._vm.isLoginError).to.equal(false)
      expect(store._vm.password).to.equal('')
    })
  })
})
