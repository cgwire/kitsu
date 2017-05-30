import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL
} from '../../src/store/mutation-types'

const user = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@doe.fr'
}

describe('user', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  describe('actions', () => {
  })

  describe('mutations', () => {
    it('USER_LOGIN', () => {
      store.commit(USER_LOGIN, user)
      expect(store._vm.user.first_name).to.equal('John')
      expect(store._vm.isAuthenticated).to.be.ok
    })

    it('USER_LOGOUT', () => {
      store.commit(USER_LOGOUT)
      expect(store._vm.user).to.be.null
      expect(store._vm.isAuthenticated).to.not.be.ok
    })

    it('USER_LOGIN_FAIL', () => {
      store.commit(USER_LOGIN_FAIL)
      expect(store._vm.user).to.be.null
      expect(store._vm.isAuthenticated).to.not.be.ok
    })
  })
})
