import { expect } from 'chai'
import store from '../../src/store'
import {
  TOGGLE_SIDEBAR,
  TOGGLE_USER_MENU
} from '../../src/store/mutation-types'


describe('main', () => {

  describe('actions', () => {
    it('toggleSidebar', () => {
      store._actions.toggleSidebar[0]({
        commit: store.commit,
        state: store._vm.state
      })
      expect(store._vm.isSidebarHidden).to.equal(false)
    })

    it('toggleUserMenu', () => {
      store._actions.toggleUserMenu[0]({
        commit: store.commit,
        state: store._vm.state
      })
      expect(store._vm.isUserMenuHidden).to.equal(false)
    })
  })

  describe('mutations', () => {
    it('TOGGLE_SIDEBAR', () => {
      store.commit(TOGGLE_SIDEBAR)
      expect(store._vm.isSidebarHidden).to.equal(true)
      store.commit(TOGGLE_SIDEBAR)
      expect(store._vm.isSidebarHidden).to.equal(false)
    })
    it('TOGGLE_USER_MENU', () => {
      store.commit(TOGGLE_USER_MENU)
      expect(store._vm.isUserMenuHidden).to.equal(true)
      store.commit(TOGGLE_USER_MENU)
      expect(store._vm.isUserMenuHidden).to.equal(false)
    })
  })
})
