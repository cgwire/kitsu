import {
  TOGGLE_DARK_THEME,
  TOGGLE_SIDEBAR,
  TOGGLE_USER_MENU,

  SET_LAST_PRODUCTION_SCREEN,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  isDarkTheme: false,
  isSidebarHidden: true,
  isUserMenuHidden: true,
  lastProductionScreen: 'assets',
  currentProductionScreen: 'assets'
}

const state = {...initialState}

const getters = {
  isDarkTheme: state => state.isDarkTheme,
  isSidebarHidden: state => state.isSidebarHidden,
  isUserMenuHidden: state => state.isUserMenuHidden,
  lastProductionScreen: state => state.lastProductionScreen,
  currentProductionScreen: state => state.currentProductionScreen
}

const actions = {
  toggleDarkTheme ({ commit, state }) {
    commit(TOGGLE_DARK_THEME)
    if (localStorage) {
      localStorage.setItem('dark-theme', state.isDarkTheme)
    }
  },

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
  [TOGGLE_DARK_THEME] (state) {
    state.isDarkTheme = !state.isDarkTheme
  },

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
    const isDarkTheme = state.isDarkTheme
    Object.assign(state, {...initialState})
    state.isDarkTheme = isDarkTheme
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
