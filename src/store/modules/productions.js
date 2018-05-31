import productionsApi from '../api/productions'
import { sortProductions, sortByName } from '../../lib/sorting'
import {
  LOAD_PRODUCTIONS_START,
  LOAD_PRODUCTIONS_ERROR,
  LOAD_PRODUCTIONS_END,

  LOAD_OPEN_PRODUCTIONS_START,
  LOAD_OPEN_PRODUCTIONS_ERROR,
  LOAD_OPEN_PRODUCTIONS_END,

  LOAD_PRODUCTION_STATUS_START,
  LOAD_PRODUCTION_STATUS_ERROR,
  LOAD_PRODUCTION_STATUS_END,

  EDIT_PRODUCTION_START,
  EDIT_PRODUCTION_ERROR,
  EDIT_PRODUCTION_END,

  DELETE_PRODUCTION_START,
  DELETE_PRODUCTION_ERROR,
  DELETE_PRODUCTION_END,

  SET_CURRENT_PRODUCTION,
  PRODUCTION_PICTURE_FILE_SELECTED,
  PRODUCTION_AVATAR_UPLOADED,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  productions: [],
  productionMap: {},
  openProductions: [],
  productionStatus: [],
  currentProduction: null,
  productionAvatarFormData: null,

  isProductionsLoading: false,
  isProductionsLoadingError: false,
  isOpenProductionsLoading: false,

  editProduction: {
    isLoading: false,
    isError: false
  },

  deleteProduction: {
    isLoading: false,
    isError: false
  },

  assetsPath: {name: 'open-productions'},
  shotsPath: {name: 'open-productions'},
  sequencesPath: {name: 'open-productions'},
  episodesPath: {name: 'open-productions'},
  breakdownPath: {name: 'open-productions'},
  playlistsPath: {name: 'open-productions'}
}

let state = {...initialState}

const helpers = {
  getProductionComponentPath (routeName, productionId) {
    return {
      name: routeName,
      params: {
        production_id: productionId
      }
    }
  }
}

const getters = {
  productions: state => state.productions,
  productionMap: state => state.productionMap,
  openProductions: state => state.openProductions,
  productionStatus: state => state.productionStatus,

  productionAvatarFormData: state => state.productionAvatarFormData,

  isProductionsLoading: state => state.isProductionsLoading,
  isProductionsLoadingError: state => state.isProductionsLoadingError,
  isOpenProductionsLoading: state => state.isOpenProductionsLoading,

  editProduction: state => state.editProduction,
  deleteProduction: state => state.deleteProduction,

  assetsPath: state => state.assetsPath,
  shotsPath: state => state.shotsPath,
  sequencesPath: state => state.sequencesPath,
  episodesPath: state => state.episodesPath,
  breakdownPath: state => state.breakdownPath,
  playlistsPath: state => state.playlistsPath,
  currentProduction: (state) => {
    if (state.currentProduction) {
      return state.currentProduction
    } else if (state.openProductions.length > 0) {
      return state.openProductions[0]
    } else {
      return null
    }
  },
  getProduction: (state, getters) => (id) => {
    return state.productions.find(
      (production) => production.id === id
    )
  },
  getProductionStatus: (state, getters) => (id) => {
    return state.productionStatus.find(
      (productionStatus) => productionStatus.id === id
    )
  },
  getProductionStatusOptions: state => state.productionStatus.map(
    (status) => { return { label: status.name, value: status.id } }
  ),
  getOpenProductionOptions: state => state.openProductions.map(
    (production) => { return { label: production.name, value: production.id } }
  )
}

const actions = {

  loadProductionStatus ({ commit, state }, callback) {
    commit(LOAD_PRODUCTION_STATUS_START)
    productionsApi.getProductionStatus((err, productionStatus) => {
      if (err) commit(LOAD_PRODUCTION_STATUS_ERROR)
      else commit(LOAD_PRODUCTION_STATUS_END, productionStatus)
      if (callback) callback(err)
    })
  },

  loadOpenProductions ({ commit, state }, callback) {
    commit(LOAD_OPEN_PRODUCTIONS_START)
    productionsApi.getOpenProductions((err, productions) => {
      if (err) commit(LOAD_OPEN_PRODUCTIONS_ERROR)
      else {
        commit(LOAD_OPEN_PRODUCTIONS_END, productions)
        if (!state.currentProduction && productions.length > 0) {
          commit(SET_CURRENT_PRODUCTION, productions[0].id)
        }
      }
      if (callback) callback(err)
    })
  },

  loadProductions ({ commit, state }, callback) {
    commit(LOAD_PRODUCTIONS_START)
    productionsApi.getProductions((err, productions) => {
      if (err) commit(LOAD_PRODUCTIONS_ERROR)
      else commit(LOAD_PRODUCTIONS_END, productions)
      if (callback) callback(err)
    })
  },

  newProduction ({ commit, state }, payload) {
    commit(EDIT_PRODUCTION_START, payload.data)
    productionsApi.newProduction(payload.data, (err, production) => {
      if (err) {
        commit(EDIT_PRODUCTION_ERROR)
      } else {
        commit(EDIT_PRODUCTION_END, production)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  editProduction ({ commit, state }, payload) {
    commit(EDIT_PRODUCTION_START)
    productionsApi.updateProduction(payload.data, (err, production) => {
      if (err) {
        commit(EDIT_PRODUCTION_ERROR)
      } else {
        commit(EDIT_PRODUCTION_END, production)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  deleteProduction ({ commit, state }, payload) {
    commit(DELETE_PRODUCTION_START)
    const production = payload.production
    productionsApi.deleteProduction(production, (err) => {
      if (err) {
        commit(DELETE_PRODUCTION_ERROR)
      } else {
        commit(DELETE_PRODUCTION_END, production)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  setProduction ({commit}, productionId) {
    commit(SET_CURRENT_PRODUCTION, productionId)
  },

  storeProductionPicture ({ commit }, formData) {
    commit(PRODUCTION_PICTURE_FILE_SELECTED, formData)
  },

  uploadProductionAvatar ({ commit, state }, productionId) {
    return new Promise((resolve, reject) => {
      productionsApi.postAvatar(
        productionId,
        state.productionAvatarFormData,
        (err) => {
          commit(PRODUCTION_AVATAR_UPLOADED, productionId)
          if (err) reject(err)
          else resolve()
        }
      )
    })
  }
}

const mutations = {
  [LOAD_PRODUCTIONS_START] (state) {
    state.productions = []
    state.isProductionsLoading = true
    state.isProductionsLoadingError = false
  },

  [LOAD_PRODUCTIONS_ERROR] (state) {
    state.productions = []
    state.isProductionsLoading = false
    state.isProductionsLoadingError = true
  },

  [LOAD_PRODUCTIONS_END] (state, productions) {
    state.isProductionsLoading = false
    state.isProductionsLoadingError = false
    state.productions = sortProductions(productions)

    const productionMap = {}
    state.productions.forEach((production) => {
      productionMap[production.id] = production
    })
    state.productionMap = productionMap
  },

  [LOAD_OPEN_PRODUCTIONS_START] (state) {
    state.isOpenProductionsLoading = true
    state.openProductions = []
  },
  [LOAD_OPEN_PRODUCTIONS_ERROR] (state) {
    state.isOpenProductionsLoading = false
  },
  [LOAD_OPEN_PRODUCTIONS_END] (state, productions) {
    state.isOpenProductionsLoading = false
    state.openProductions = sortByName(productions)

    const productionMap = {}
    productions.forEach((production) => {
      productionMap[production.id] = production
    })
    state.productionMap = productionMap
  },

  [LOAD_PRODUCTION_STATUS_START] (state) {
    state.productionStatus = []
  },
  [LOAD_PRODUCTION_STATUS_ERROR] (state) {
  },
  [LOAD_PRODUCTION_STATUS_END] (state, productionStatus) {
    state.productionStatus = productionStatus
  },

  [EDIT_PRODUCTION_START] (state, data) {
    state.editProduction.isLoading = true
    state.editProduction.isError = false
  },
  [EDIT_PRODUCTION_ERROR] (state) {
    state.editProduction.isLoading = false
    state.editProduction.isError = true
  },

  [EDIT_PRODUCTION_END] (state, newProduction) {
    const production = getters.getProduction(state)(newProduction.id)
    const productionStatus = getters.getProductionStatus(state)(
      newProduction.project_status_id
    )
    newProduction.project_status_name = productionStatus.name

    if (production) {
      const openProductionIndex = state.openProductions.findIndex(
        (openProduction) => openProduction.id === newProduction.id
      )
      if (newProduction.project_status_id) {
        if (
          openProductionIndex >= 0 &&
          production.project_status_id !== newProduction.project_status_id
        ) {
          state.openProductions.splice(openProductionIndex, 1)
        } else {
          state.openProductions.push(production)
          state.openProductions = sortByName(state.openProductions)
        }
      }

      Object.assign(production, newProduction)
    } else {
      state.productions.push(newProduction)
      state.productionMap[newProduction.id] = newProduction
      state.openProductions.push(newProduction)
      state.productions = sortProductions(state.productions)
      state.openProductions = sortByName(state.openProductions)
    }
    state.editProduction = {
      isLoading: false,
      isError: false
    }
  },

  [DELETE_PRODUCTION_START] (state) {
    state.deleteProduction = {
      isLoading: true,
      isError: false
    }
  },
  [DELETE_PRODUCTION_ERROR] (state) {
    state.deleteProduction = {
      isLoading: false,
      isError: true
    }
  },
  [DELETE_PRODUCTION_END] (state, productionToDelete) {
    const productionToDeleteIndex = state.productions.findIndex(
      (production) => production.id === productionToDelete.id
    )
    state.productions.splice(productionToDeleteIndex, 1)

    state.deleteProduction = {
      isLoading: false,
      isError: false
    }
  },

  [PRODUCTION_PICTURE_FILE_SELECTED] (state, formData) {
    state.productionAvatarFormData = formData
  },

  [PRODUCTION_AVATAR_UPLOADED] (state, productionId) {
    const production = state.productionMap[productionId]
    if (production) production.has_avatar = true
  },

  [SET_CURRENT_PRODUCTION] (state, currentProductionId) {
    const production = state.openProductions.find(
      (production) => production.id === currentProductionId
    )
    state.currentProduction = production
    state.assetsPath = helpers.getProductionComponentPath(
      'assets', currentProductionId)
    state.shotsPath = helpers.getProductionComponentPath(
      'shots', currentProductionId)
    state.sequencesPath = helpers.getProductionComponentPath(
      'sequences', currentProductionId)
    state.episodesPath = helpers.getProductionComponentPath(
      'episodes', currentProductionId)
    state.breakdownPath = helpers.getProductionComponentPath(
      'breakdown', currentProductionId)
    state.playlistsPath = helpers.getProductionComponentPath(
      'playlists', currentProductionId)
  },

  [RESET_ALL] (state) {
    state = {...initialState}
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
