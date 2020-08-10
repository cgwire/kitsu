import assetTypesApi from '../api/assettypes'
import {
  LOAD_ASSET_TYPES_START,
  LOAD_ASSET_TYPES_ERROR,
  LOAD_ASSET_TYPES_END,

  EDIT_ASSET_TYPE_END,
  DELETE_ASSET_TYPE_END,

  RESET_ALL
} from '../mutation-types'
import { sortByName } from '../../lib/sorting'

const initialState = {
  assetTypes: [],
  assetTypeMap: {}
}

const state = { ...initialState }

const getters = {
  assetTypes: state => state.assetTypes,
  assetTypeMap: state => state.assetTypeMap,

  getAssetType: (state, getters) => (id) => {
    return state.assetTypes.find(
      (assetType) => assetType.id === id
    )
  },

  getAssetTypeOptions: state => state.assetTypes.map(
    (type) => { return { label: type.name, value: type.id } }
  )
}

const actions = {

  loadAssetTypes ({ commit, state }, callback) {
    commit(LOAD_ASSET_TYPES_START)
    assetTypesApi.getAssetTypes((err, assetTypes) => {
      if (err) commit(LOAD_ASSET_TYPES_ERROR)
      else commit(LOAD_ASSET_TYPES_END, assetTypes)
      if (callback) callback(err)
    })
  },

  loadAssetType ({ commit, state }, assetTypeId) {
    assetTypesApi.getAssetType(assetTypeId, (err, assetType) => {
      if (err) console.error(err)
      else commit(EDIT_ASSET_TYPE_END, assetType)
    })
  },

  newAssetType ({ commit, state }, data) {
    return assetTypesApi.newAssetType(data)
      .then((assetType) => {
        commit(EDIT_ASSET_TYPE_END, assetType)
        Promise.resolve(assetType)
      })
  },

  editAssetType ({ commit, state }, data) {
    return assetTypesApi.updateAssetType(data)
      .then((assetType) => {
        commit(EDIT_ASSET_TYPE_END, assetType)
        Promise.resolve(assetType)
      })
  },

  deleteAssetType ({ commit, state }, assetType) {
    return assetTypesApi.deleteAssetType(assetType)
      .then(() => {
        commit(DELETE_ASSET_TYPE_END, assetType)
        Promise.resolve(assetType)
      })
  }
}

const mutations = {
  [LOAD_ASSET_TYPES_START] (state) {
    state.isAssetTypesLoading = true
    state.isAssetTypesLoadingError = false
  },

  [LOAD_ASSET_TYPES_ERROR] (state) {
    state.isAssetTypesLoading = false
    state.isAssetTypesLoadingError = true
  },

  [LOAD_ASSET_TYPES_END] (state, assetTypes) {
    state.isAssetTypesLoading = false
    state.isAssetTypesLoadingError = false
    state.assetTypes = assetTypes
    state.assetTypes = sortByName(state.assetTypes)
    state.assetTypeMap = {}
    state.assetTypes.forEach((assetType) => {
      state.assetTypeMap[assetType.id] = assetType
    })
  },

  [EDIT_ASSET_TYPE_END] (state, newAssetType) {
    const assetType = getters.getAssetType(state)(newAssetType.id)

    if (assetType && assetType.id) {
      Object.assign(assetType, newAssetType)
    } else {
      state.assetTypes.push(newAssetType)
      state.assetTypeMap[newAssetType.id] = newAssetType
    }
    state.assetTypes = sortByName(state.assetTypes)
  },

  [DELETE_ASSET_TYPE_END] (state, assetTypeToDelete) {
    const assetTypeToDeleteIndex = state.assetTypes.findIndex(
      (assetType) => assetType.id === assetTypeToDelete.id
    )
    if (assetTypeToDeleteIndex >= 0) {
      state.assetTypes.splice(assetTypeToDeleteIndex, 1)
    }
    delete state.assetTypeMap[assetTypeToDelete.id]
  },

  [RESET_ALL] (state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
