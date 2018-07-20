import assetTypesApi from '../api/assettypes'
import {
  LOAD_ASSET_TYPES_START,
  LOAD_ASSET_TYPES_ERROR,
  LOAD_ASSET_TYPES_END,

  EDIT_ASSET_TYPE_START,
  EDIT_ASSET_TYPE_ERROR,
  EDIT_ASSET_TYPE_END,

  DELETE_ASSET_TYPE_START,
  DELETE_ASSET_TYPE_ERROR,
  DELETE_ASSET_TYPE_END,

  RESET_ALL
} from '../mutation-types'

const sortAssetTypes = (assetTypes) => {
  return assetTypes.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })
}

const state = {
  assetTypes: [],
  assetTypeMap: {},
  isAssetTypesLoading: false,
  isAssetTypesLoadingError: false,

  editAssetType: {
    isLoading: false,
    isError: false
  },

  deleteAssetType: {
    isLoading: false,
    isError: false
  }
}

const getters = {
  assetTypes: state => state.assetTypes,
  assetTypeMap: state => state.assetTypeMap,

  isAssetTypesLoading: state => state.isAssetTypesLoading,
  isAssetTypesLoadingError: state => state.isAssetTypesLoadingError,

  editAssetType: state => state.editAssetType,
  deleteAssetType: state => state.deleteAssetType,

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

  newAssetType ({ commit, state }, payload) {
    commit(EDIT_ASSET_TYPE_START, payload.data)
    assetTypesApi.newAssetType(payload.data, (err, assetType) => {
      if (err) {
        commit(EDIT_ASSET_TYPE_ERROR)
      } else {
        commit(EDIT_ASSET_TYPE_END, assetType)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  editAssetType ({ commit, state }, payload) {
    commit(EDIT_ASSET_TYPE_START)
    assetTypesApi.updateAssetType(payload.data, (err, assetType) => {
      if (err) {
        commit(EDIT_ASSET_TYPE_ERROR)
      } else {
        commit(EDIT_ASSET_TYPE_END, assetType)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  deleteAssetType ({ commit, state }, payload) {
    commit(DELETE_ASSET_TYPE_START)
    const assetType = payload.assetType
    assetTypesApi.deleteAssetType(assetType, (err) => {
      if (err) {
        commit(DELETE_ASSET_TYPE_ERROR)
      } else {
        commit(DELETE_ASSET_TYPE_END, assetType)
      }
      if (payload.callback) payload.callback(err)
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
    state.assetTypes = sortAssetTypes(state.assetTypes)
    state.assetTypeMap = {}
    state.assetTypes.forEach((assetType) => {
      state.assetTypeMap[assetType.id] = assetType
    })
  },

  [EDIT_ASSET_TYPE_START] (state, data) {
    state.editAssetType.isLoading = true
    state.editAssetType.isError = false
  },

  [EDIT_ASSET_TYPE_ERROR] (state) {
    state.editAssetType.isLoading = false
    state.editAssetType.isError = true
  },

  [EDIT_ASSET_TYPE_END] (state, newAssetType) {
    const assetType = getters.getAssetType(state)(newAssetType.id)

    if (assetType && assetType.id) {
      Object.assign(assetType, newAssetType)
    } else {
      state.assetTypes.push(newAssetType)
      state.assetTypes = sortAssetTypes(state.assetTypes)
    }
    state.editAssetType = {
      isLoading: false,
      isError: false
    }
  },

  [DELETE_ASSET_TYPE_START] (state) {
    state.deleteAssetType = {
      isLoading: true,
      isError: false
    }
  },
  [DELETE_ASSET_TYPE_ERROR] (state) {
    state.deleteAssetType = {
      isLoading: false,
      isError: true
    }
  },
  [DELETE_ASSET_TYPE_END] (state, assetTypeToDelete) {
    const assetTypeToDeleteIndex = state.assetTypes.findIndex(
      (assetType) => assetType.id === assetTypeToDelete.id
    )
    state.assetTypes.splice(assetTypeToDeleteIndex, 1)

    state.deleteAssetType = {
      isLoading: false,
      isError: false
    }
  },

  [RESET_ALL] (state) {
    state.assetTypes = []
    state.isAssetTypesLoading = false
    state.isAssetTypesLoadingError = false

    state.editAssetType = {
      isLoading: false,
      isError: false
    }

    state.deleteAssetType = {
      isLoading: false,
      isError: false
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
