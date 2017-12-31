import assetsApi from '../api/assets'
import tasksStore from './tasks'
import productionsStore from './productions'

import {PAGE_SIZE} from '../../lib/pagination'
import { sortAssets } from '../../lib/sorting'
import { buildAssetIndex, indexSearch } from '../../lib/indexing'

import {
  LOAD_ASSETS_START,
  LOAD_ASSETS_ERROR,
  LOAD_ASSETS_END,

  EDIT_ASSET_START,
  EDIT_ASSET_ERROR,
  EDIT_ASSET_END,

  DELETE_ASSET_START,
  DELETE_ASSET_ERROR,
  DELETE_ASSET_END,

  RESTORE_ASSET_START,
  RESTORE_ASSET_ERROR,
  RESTORE_ASSET_END,

  LOAD_ASSET_TYPES_START,
  LOAD_ASSET_TYPES_ERROR,
  LOAD_ASSET_TYPES_END,

  ASSET_CSV_FILE_SELECTED,
  IMPORT_ASSETS_START,
  IMPORT_ASSETS_END,

  LOAD_OPEN_PRODUCTIONS_END,
  DELETE_TASK_END,
  NEW_TASK_COMMENT_END,

  SET_ASSET_SEARCH,
  CREATE_TASKS_END,

  DISPLAY_MORE_ASSETS,

  RESET_ALL
} from '../mutation-types'

const helpers = {
  getCurrentProduction () {
    return productionsStore.getters.currentProduction(productionsStore.state)
  }
}

const state = {
  assets: [],
  assetMap: {},
  assetTypes: [],

  assetIndex: {},
  displayedAssets: [],
  displayedAssetsLength: 0,
  assetSearchText: '',

  openProductions: [],
  isAssetsLoading: false,
  isAssetsLoadingError: false,
  assetsCsvFormData: null,

  assetCreated: '',
  editAsset: {
    isCreateError: false,
    isLoading: false,
    isError: false
  },

  deleteAsset: {
    isLoading: false,
    isError: false
  },

  restoreAsset: {
    isLoading: false,
    isError: false
  }
}

const getters = {
  assets: state => state.assets,
  assetMap: state => state.assetMap,
  assetSearchText: state => state.assetSearchText,

  isAssetsLoading: state => state.isAssetsLoading,
  isAssetsLoadingError: state => state.isAssetsLoadingError,

  displayedAssets: state => state.displayedAssets,
  displayedAssetsLength: state => state.displayedAssetsLength,

  assetsByType: state => {
    const assetsByType = []
    let assetTypeAssets = []
    let previousAsset = null
    let assets = []

    if (state.assetSearchText.length === 0) {
      assets = state.assets.slice(0, 100)
    } else {
      assets = state.displayedAssets.slice(0, 100)
    }

    for (let asset of assets) {
      if (
        previousAsset &&
        asset.asset_type_name !== previousAsset.asset_type_name
      ) {
        assetsByType.push(assetTypeAssets.slice(0))
        assetTypeAssets = []
      }
      assetTypeAssets.push(asset)
      previousAsset = asset
    }
    assetsByType.push(assetTypeAssets)

    return assetsByType
  },

  editAsset: state => state.editAsset,
  deleteAsset: state => state.deleteAsset,
  restoreAsset: state => state.restoreAsset,
  assetCreated: state => state.assetCreated,

  assetsCsvFormData: state => state.assetsCsvFormData,

  getAsset: (state, getters) => (id) => {
    return state.assets.find((asset) => asset.id === id)
  },

  getOpenProduction: (state, getters) => (id) => {
    return state.openProductions.find((project) => project.id === id)
  },

  getAssetTypeOptions: state => state.assetTypes.map(
    (type) => { return { label: type.name, value: type.id } }
  )
}

const actions = {

  loadAssets ({ commit, state, rootState }, callback) {
    const currentProduction = productionsStore.getters.currentProduction(
      rootState.productions
    )
    commit(LOAD_ASSETS_START)
    assetsApi.getAssets(currentProduction, (err, assets) => {
      if (err) commit(LOAD_ASSETS_ERROR)
      else {
        assets.forEach((asset) => {
          asset.project_name = currentProduction.name
          return asset
        })
        commit(LOAD_ASSETS_END, assets)
      }
      if (callback) callback(err)
    })
  },

  newAsset ({ commit, state }, payload) {
    commit(EDIT_ASSET_START, payload.data)
    assetsApi.newAsset(payload.data, (err, asset) => {
      if (err) {
        commit(EDIT_ASSET_ERROR)
      } else {
        commit(EDIT_ASSET_END, asset)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  editAsset ({ commit, state }, payload) {
    commit(EDIT_ASSET_START)
    assetsApi.updateAsset(payload.data, (err, asset) => {
      if (err) {
        commit(EDIT_ASSET_ERROR)
      } else {
        commit(EDIT_ASSET_END, asset)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  deleteAsset ({ commit, state }, payload) {
    commit(DELETE_ASSET_START)
    const asset = payload.asset
    assetsApi.deleteAsset(asset, (err) => {
      if (err) {
        commit(DELETE_ASSET_ERROR)
      } else {
        commit(DELETE_ASSET_END, asset)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  restoreAsset ({ commit, state }, payload) {
    commit(RESTORE_ASSET_START)
    const asset = payload.asset
    assetsApi.restoreAsset(asset, (err) => {
      if (err) {
        commit(RESTORE_ASSET_ERROR)
      } else {
        commit(RESTORE_ASSET_END, asset)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  uploadAssetFile ({ commit, state }, callback) {
    const currentProduction = helpers.getCurrentProduction()
    commit(IMPORT_ASSETS_START)
    assetsApi.postCsv(currentProduction, state.assetsCsvFormData, (err) => {
      commit(IMPORT_ASSETS_END)
      if (callback) callback(err)
    })
  },

  setAssetSearch ({commit}, searchQuery) {
    commit(SET_ASSET_SEARCH, searchQuery)
  },

  displayMoreAssets ({commit}) {
    commit(DISPLAY_MORE_ASSETS)
  }

}

const mutations = {
  [LOAD_ASSETS_START] (state) {
    state.assets = []
    state.isAssetsLoading = true
    state.isAssetsLoadingError = false

    state.assetIndex = {}
    state.displayedAssets = []
    state.displayedAssetsLength = 0
  },

  [LOAD_ASSETS_ERROR] (state) {
    state.isAssetsLoading = false
    state.isAssetsLoadingError = true
  },

  [LOAD_ASSETS_END] (state, assets) {
    assets = sortAssets(assets)
    assets.forEach((asset) => {
      state.assetMap[asset.id] = asset
    })

    state.assets = assets
    state.isAssetsLoading = false
    state.isAssetsLoadingError = false

    state.assetIndex = buildAssetIndex(assets)
    state.displayedAssets = state.assets.slice(0, PAGE_SIZE)
    state.displayedAssetsLength = state.assets ? state.assets.length : 0
  },

  [ASSET_CSV_FILE_SELECTED] (state, formData) {
    state.assetsCsvFormData = formData
  },
  [IMPORT_ASSETS_START] (state) {},
  [IMPORT_ASSETS_END] (state) {
    state.assetsCsvFormData = null
  },

  [LOAD_ASSET_TYPES_START] (state) {},
  [LOAD_ASSET_TYPES_ERROR] (state) {},
  [LOAD_ASSET_TYPES_END] (state, assetTypes) {
    state.assetTypes = assetTypes
  },
  [LOAD_OPEN_PRODUCTIONS_END] (state, projects) {
    state.openProductions = projects
  },

  [EDIT_ASSET_START] (state, data) {
    state.editAsset.isLoading = true
    state.editAsset.isError = false
  },

  [EDIT_ASSET_ERROR] (state) {
    state.editAsset.isLoading = false
    state.editAsset.isError = true
    state.editAsset.isCreateError = true
  },

  [EDIT_ASSET_END] (state, newAsset) {
    state.editAsset.isCreateError = false
    state.editAsset.isSuccess = true
    state.assetCreated = newAsset.name

    const asset = getters.getAsset(state)(newAsset.id)
    const assetType = state.assetTypes.find(
      (assetType) => assetType.id === newAsset.entity_type_id
    )
    if (assetType) newAsset.asset_type_name = assetType.name

    newAsset.tasks = []

    if (asset) {
      Object.assign(asset, newAsset)
    } else {
      newAsset.validations = {}
      state.assets.push(newAsset)
      state.assets = sortAssets(state.assets)
      state.displayedAssets.unshift(newAsset)
    }
    state.editAsset = {
      isLoading: false,
      isError: false
    }
    state.assetIndex = buildAssetIndex(state.assets)
    state.assetMap[newAsset.id] = asset
  },

  [DELETE_ASSET_START] (state) {
    state.deleteAsset = {
      isLoading: true,
      isError: false
    }
  },
  [DELETE_ASSET_ERROR] (state) {
    state.deleteAsset = {
      isLoading: false,
      isError: true
    }
  },
  [DELETE_ASSET_END] (state, assetToDelete) {
    const asset = state.assetMap[assetToDelete.id]

    if (asset.tasks.length > 0) {
      asset.canceled = true
    } else {
      const assetToDeleteIndex = state.assets.findIndex(
        (asset) => asset.id === assetToDelete.id
      )
      const displayAssetToDeleteIndex = state.assets.findIndex(
        (asset) => asset.id === assetToDelete.id
      )
      state.assets.splice(assetToDeleteIndex, 1)
      state.displayedAssets.splice(displayAssetToDeleteIndex, 1)
      state.assetMap[assetToDelete.id] = undefined
    }

    state.deleteAsset = {
      isLoading: false,
      isError: false
    }
    state.assetIndex = buildAssetIndex(state.assets)
  },

  [RESTORE_ASSET_START] (state) {
    state.restoreAsset = {
      isLoading: true,
      isError: false
    }
  },
  [RESTORE_ASSET_ERROR] (state) {
    state.restoreAsset = {
      isLoading: false,
      isError: true
    }
  },
  [RESTORE_ASSET_END] (state, assetToRestore) {
    const asset = state.assetMap[assetToRestore.id]
    asset.canceled = false
    state.restoreAsset = {
      isLoading: false,
      isError: false
    }
    state.assetIndex = buildAssetIndex(state.assets)
  },

  [RESTORE_ASSET_START] (state) {
    state.restoreAsset = {
      isLoading: true,
      isError: false
    }
  },
  [RESTORE_ASSET_ERROR] (state) {
    state.restoreAsset = {
      isLoading: false,
      isError: true
    }
  },
  [RESTORE_ASSET_END] (state, assetToRestore) {
    const asset = state.assetMap[assetToRestore.id]
    asset.canceled = false
    state.restoreAsset = {
      isLoading: false,
      isError: false
    }
    state.assetIndex = buildAssetIndex(state.assets)
  },

  [DELETE_TASK_END] (state, task) {
    const asset = state.assets.find(
      (asset) => asset.id === task.entity_id
    )
    if (asset) {
      asset.validations[task.task_type_name] = null
      const taskIndex = asset.tasks.findIndex(
        (assetTask) => assetTask.id === task.entity_id
      )
      asset.tasks.splice(taskIndex, 1)
    }
  },

  [NEW_TASK_COMMENT_END] (state, {comment, taskId}) {
    const getTask = tasksStore.getters.getTask(
      tasksStore.state, tasksStore.getters
    )
    const task = getTask(taskId)
    const asset = getters.getAsset(state)(task.entity_id)
    if (asset) {
      asset.validations[task.task_type_name] = task
    }
  },

  [SET_ASSET_SEARCH] (state, assetSearch) {
    const result = indexSearch(state.assetIndex, assetSearch) || state.assets
    state.displayedAssets = result.slice(0, PAGE_SIZE)
    state.displayedAssetsLength = result ? result.length : 0
    state.assetSearchText = assetSearch
  },

  [CREATE_TASKS_END] (state, tasks) {
    tasks.forEach((task) => {
      if (task) {
        const asset = state.assetMap[task.entity_id]
        if (asset) {
          const validations = {...asset.validations}
          validations[task.task_type_name] = task
          asset.validations = validations
        }
      }
    })
  },

  [DISPLAY_MORE_ASSETS] (state, tasks) {
    let assets
    if (state.assetSearchText.length > 0) {
      assets = indexSearch(state.assetIndex, state.assetSearchText)
    } else {
      assets = state.assets
    }
    state.displayedAssets = assets.slice(
      0,
      state.displayedAssets.length + PAGE_SIZE
    )
  },

  [RESET_ALL] (state) {
    state.assets = []
    state.assetMap = {}
    state.assetTypes = []
    state.isAssetsLoading = false
    state.isAssetsLoadingError = false
    state.assetsCsvFormData = null
    state.assetValidationColumns = {}

    state.assetIndex = {}
    state.displayedAssets = []

    state.editAsset = {
      isCreateError: false,
      isLoading: false,
      isError: false
    }

    state.deleteAsset = {
      isLoading: false,
      isError: false
    }

    state.restoreAsset = {
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
