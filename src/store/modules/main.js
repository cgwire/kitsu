import client from '@/store/api/client'
import crisp from '@/lib/crisp'
import {
  USER_LOGIN,
  TOGGLE_DARK_THEME,
  TOGGLE_SIDEBAR,
  TOGGLE_SUPPORT_CHAT,
  TOGGLE_USER_MENU,
  SET_CONFIG,
  SET_CURRENT_SECTION,
  SET_LAST_PRODUCTION_SCREEN,
  SET_CURRENT_PRODUCTION,
  SHOW_PREVIEW_FILE,
  HIDE_PREVIEW_FILE,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  currentProductionScreen: 'assets',
  currentSection: 'assets',
  isDarkTheme: false,
  isSidebarHidden: true,
  isSupportChat: true,
  isUserMenuHidden: true,
  lastProductionScreen: 'assets',
  lastProductionViewed: null,
  mainConfig: {},
  previewFileIdToShow: ''
}

const state = { ...initialState }

const getters = {
  currentProductionScreen: state => state.currentProductionScreen,
  currentSection: state => state.currentSection,
  isDarkTheme: state => state.isDarkTheme,
  isSidebarHidden: state => state.isSidebarHidden,
  isSupportChat: state => state.isSupportChat,
  isUserMenuHidden: state => state.isUserMenuHidden,
  lastProductionScreen: state => state.lastProductionScreen,
  lastProductionViewed: state => state.lastProductionViewed,
  mainConfig: state => state.mainConfig,
  previewFileIdToShow: state => state.previewFileIdToShow
}

const actions = {
  toggleDarkTheme({ commit, state }) {
    commit(TOGGLE_DARK_THEME)
    if (localStorage) {
      localStorage.setItem('dark-theme', state.isDarkTheme)
    }
  },

  setSupportChat({ commit, state }, isSupportChat) {
    commit(TOGGLE_SUPPORT_CHAT, isSupportChat)
    crisp.setChatVisibility(isSupportChat)
  },

  toggleSidebar({ commit, state }) {
    commit(TOGGLE_SIDEBAR)
  },

  toggleUserMenu({ commit, state }) {
    commit(TOGGLE_USER_MENU)
  },

  setCurrentSection({ commit, state }, section) {
    commit(SET_CURRENT_SECTION, section)
  },

  setLastProductionScreen({ commit, state }, lastProductionScreen) {
    commit(SET_LAST_PRODUCTION_SCREEN, lastProductionScreen)
  },

  loadEvents(_, { after, before, limit, lastEventId = null }) {
    return client.getEvents(after, before, limit, lastEventId)
  },

  async setMainConfig({ commit }) {
    let config = {}
    try {
      config = await client.getConfig()
    } catch (error) {
      console.error(error)
    }
    commit(SET_CONFIG, config)
    return config
  },

  searchData(_, { query, limit = 3, offset = 0, productionId, index_names }) {
    return client.searchData(query, limit, offset, index_names, productionId)
  }
}

const mutations = {
  [TOGGLE_DARK_THEME](state, isDarkTheme = undefined) {
    state.isDarkTheme = isDarkTheme ?? !state.isDarkTheme
  },

  [TOGGLE_SUPPORT_CHAT](state, isSupportChat) {
    state.isSupportChat = isSupportChat
  },

  [TOGGLE_SIDEBAR](state) {
    state.isSidebarHidden = !state.isSidebarHidden
  },

  [TOGGLE_USER_MENU](state) {
    state.isUserMenuHidden = !state.isUserMenuHidden
  },

  [SET_CURRENT_SECTION](state, section) {
    state.currentSection = section
  },

  [SET_LAST_PRODUCTION_SCREEN](state, lastProductionScreen) {
    state.lastProductionScreen = lastProductionScreen
  },

  [SET_CURRENT_PRODUCTION](state, productionId) {
    if (productionId) state.lastProductionViewed = productionId
  },

  [USER_LOGIN](state, user) {
    if (user && user.role === 'client') {
      state.lastProductionScreen = 'playlists'
    }
  },

  [SHOW_PREVIEW_FILE](state, previewFileId) {
    state.previewFileIdToShow = previewFileId
  },

  [HIDE_PREVIEW_FILE](state) {
    state.previewFileIdToShow = ''
  },

  [SET_CONFIG](state, mainConfig) {
    state.mainConfig = mainConfig
  },

  [RESET_ALL](state) {
    Object.assign(state, {
      ...initialState,
      mainConfig: state.mainConfig,
      isDarkTheme: state.isDarkTheme
    })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
