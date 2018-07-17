import { expect } from 'chai'
import helpers from './helpers'

import store from '../../src/store'
import {
  TOGGLE_SIDEBAR,
  TOGGLE_USER_MENU
} from '../../src/store/mutation-types'


describe('main', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  describe('actions', () => {
    it('toggleSidebar', () => {
      helpers.runAction('toggleSidebar')
      expect(store._vm.isSidebarHidden).to.equal(false)
    })

    it('toggleUserMenu', () => {
      helpers.runAction('toggleUserMenu')
      expect(store._vm.isUserMenuHidden).to.equal(false)
    })
  })

  describe('mutations', () => {
    it('TOGGLE_SIDEBAR', () => {
      store.commit(TOGGLE_SIDEBAR)
      expect(store._vm.isSidebarHidden).to.equal(false)
      store.commit(TOGGLE_SIDEBAR)
      expect(store._vm.isSidebarHidden).to.equal(true)
    })
    it('TOGGLE_USER_MENU', () => {
      store.commit(TOGGLE_USER_MENU)
      expect(store._vm.isUserMenuHidden).to.equal(false)
      store.commit(TOGGLE_USER_MENU)
      expect(store._vm.isUserMenuHidden).to.equal(true)
    })
  })
})
