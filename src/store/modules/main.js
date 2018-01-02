import {
  TOGGLE_SIDEBAR,
  TOGGLE_USER_MENU,

  SET_LAST_PRODUCTION_SCREEN,

  RESET_ALL
} from '../mutation-types'

let state = {
  isSidebarHidden: true,
  isUserMenuHidden: true,
  lastProductionScreen: 'assets'
}

const getters = {
  isSidebarHidden: state => state.isSidebarHidden,
  isUserMenuHidden: state => state.isUserMenuHidden,
  lastProductionScreen: state => state.lastProductionScreen
}

const actions = {
  toggleSidebar ({ commit, state }) {
    commit(TOGGLE_SIDEBAR)
  },
  toggleUserMenu ({ commit, state }) {
    commit(TOGGLE_USER_MENU)
  },
  setLastProductionScreen ({ commit, state }, lastProductionScreen) {
    commit(SET_LAST_PRODUCTION_SCREEN, lastProductionScreen)
  }
}

const mutations = {
  [TOGGLE_SIDEBAR] (state) {
    state.isSidebarHidden = !state.isSidebarHidden
  },
  [TOGGLE_USER_MENU] (state) {
    state.isUserMenuHidden = !state.isUserMenuHidden
  },
  [SET_LAST_PRODUCTION_SCREEN] (state, lastProductionScreen) {
    state.lastProductionScreen = lastProductionScreen
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
