import {
  TOGGLE_SIDEBAR,
  TOGGLE_USER_MENU,

  RESET_ALL
} from '../mutation-types'

let state = {
  isSidebarHidden: true,
  isUserMenuHidden: true
}

const getters = {
  isSidebarHidden: state => state.isSidebarHidden,
  isUserMenuHidden: state => state.isUserMenuHidden
}

const actions = {
  toggleSidebar ({ commit, state }) {
    commit(TOGGLE_SIDEBAR)
  },
  toggleUserMenu ({ commit, state }) {
    commit(TOGGLE_USER_MENU)
  }
}

const mutations = {
  [TOGGLE_SIDEBAR] (state) {
    state.isSidebarHidden = !state.isSidebarHidden
  },
  [TOGGLE_USER_MENU] (state) {
    state.isUserMenuHidden = !state.isUserMenuHidden
  },
  [RESET_ALL] (state) {
    state.isSidebarHidden = true
    state.isUserMenuHidden = true
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
