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
  assetTypeMap: () => cache.assetTypeMap,

  getAssetType: state => id => {
    return state.assetTypes.find(assetType => assetType.id === id)
  },

  getAssetTypeOptions: state =>
    state.assetTypes.map(type => {
      return { label: type.name, value: type.id }
    })
}

const actions = {
  async loadAssetType({ commit }, assetTypeId) {
    const assetType = await assetTypesApi.getAssetType(assetTypeId)
    commit(EDIT_ASSET_TYPE_END, assetType)
  },

  async newAssetType({ commit }, data) {
    const assetType = await assetTypesApi.newAssetType(data)
    commit(EDIT_ASSET_TYPE_END, assetType)
  },

  async editAssetType({ commit }, data) {
    const assetType = await assetTypesApi.updateAssetType(data)
    commit(EDIT_ASSET_TYPE_END, assetType)
  },

  async deleteAssetType({ commit }, assetType) {
    await assetTypesApi.deleteAssetType(assetType)
    commit(DELETE_ASSET_TYPE_END, assetType)
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
