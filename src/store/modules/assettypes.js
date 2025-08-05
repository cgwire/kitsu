import assetTypesApi from '@/store/api/assettypes'
import {
  LOAD_ASSET_TYPES_START,
  LOAD_ASSET_TYPES_ERROR,
  LOAD_ASSET_TYPES_END,
  EDIT_ASSET_TYPE_END,
  DELETE_ASSET_TYPE_END,
  RESET_ALL
} from '@/store/mutation-types'
import { sortByName } from '@/lib/sorting'

const cache = {
  assetTypeMap: new Map()
}

const initialState = {
  assetTypes: []
}

const state = { ...initialState }

const getters = {
  assetTypes: state => state.assetTypes.filter(type => !type.archived),
  archivedAssetTypes: state => state.assetTypes.filter(type => type.archived),
  assetTypeMap: state => cache.assetTypeMap,

  getAssetType: (state, getters) => id => {
    return state.assetTypes.find(assetType => assetType.id === id)
  },

  getAssetTypeOptions: state =>
    state.assetTypes.map(type => {
      return { label: type.name, value: type.id }
    })
}

const actions = {
  loadAssetType({ commit, state }, assetTypeId) {
    return assetTypesApi.getAssetType(assetTypeId).then(assetType => {
      commit(EDIT_ASSET_TYPE_END, assetType)
      Promise.resolve(assetType)
    })
  },

  newAssetType({ commit, state }, data) {
    return assetTypesApi.newAssetType(data).then(assetType => {
      commit(EDIT_ASSET_TYPE_END, assetType)
      Promise.resolve(assetType)
    })
  },

  editAssetType({ commit, state }, data) {
    return assetTypesApi.updateAssetType(data).then(assetType => {
      commit(EDIT_ASSET_TYPE_END, assetType)
      Promise.resolve(assetType)
    })
  },

  deleteAssetType({ commit, state }, assetType) {
    return assetTypesApi.deleteAssetType(assetType).then(() => {
      commit(DELETE_ASSET_TYPE_END, assetType)
      Promise.resolve(assetType)
    })
  }
}

const mutations = {
  [LOAD_ASSET_TYPES_START](state) {
    state.isAssetTypesLoading = true
    state.isAssetTypesLoadingError = false
  },

  [LOAD_ASSET_TYPES_ERROR](state) {
    state.isAssetTypesLoading = false
    state.isAssetTypesLoadingError = true
  },

  [LOAD_ASSET_TYPES_END](state, assetTypes) {
    state.isAssetTypesLoading = false
    state.isAssetTypesLoadingError = false
    state.assetTypes = sortByName(assetTypes)
    cache.assetTypeMap = new Map()
    state.assetTypes.forEach(assetType => {
      cache.assetTypeMap.set(assetType.id, assetType)
    })
  },

  [EDIT_ASSET_TYPE_END](state, newAssetType) {
    const assetType = getters.getAssetType(state)(newAssetType.id)

    if (assetType && assetType.id) {
      Object.assign(assetType, newAssetType)
    } else {
      state.assetTypes.push(newAssetType)
      cache.assetTypeMap.set(newAssetType.id, newAssetType)
    }
    state.assetTypes = sortByName(state.assetTypes)
  },

  [DELETE_ASSET_TYPE_END](state, assetTypeToDelete) {
    const assetTypeToDeleteIndex = state.assetTypes.findIndex(
      assetType => assetType.id === assetTypeToDelete.id
    )
    if (assetTypeToDeleteIndex >= 0) {
      state.assetTypes.splice(assetTypeToDeleteIndex, 1)
    }
    cache.assetTypeMap.delete(assetTypeToDelete.id)
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  cache
}
