import Vue from 'vue'
import assetsApi from '../api/assets'
import peopleApi from '../api/people'
import tasksStore from './tasks'
import taskTypesStore from './tasktypes'
import productionsStore from './productions'
import peopleStore from './people'

import {PAGE_SIZE} from '../../lib/pagination'
import {
  sortAssets,
  sortTasks,
  sortByName
} from '../../lib/sorting'
import {
  appendSelectionGrid,
  buildSelectionGrid,
  clearSelectionGrid,
  computeStats
} from '../../lib/helpers'
import {
  buildAssetIndex,
  buildNameIndex,
  indexSearch
} from '../../lib/indexing'
import {
  applyFilters,
  extractTaskTypes
} from '../../lib/filtering'

import {
  LOAD_ASSETS_START,
  LOAD_ASSETS_ERROR,
  LOAD_ASSETS_END,
  LOAD_ASSET_END,
  LOAD_ASSET_CAST_IN_END,

  EDIT_ASSET_START,
  EDIT_ASSET_ERROR,
  EDIT_ASSET_END,

  DELETE_ASSET_START,
  DELETE_ASSET_ERROR,
  DELETE_ASSET_END,

  RESTORE_ASSET_START,
  RESTORE_ASSET_ERROR,
  RESTORE_ASSET_END,

  ASSET_CSV_FILE_SELECTED,
  IMPORT_ASSETS_START,
  IMPORT_ASSETS_END,

  DELETE_TASK_END,
  NEW_TASK_COMMENT_END,
  NEW_TASK_END,

  SET_ASSET_SEARCH,
  CREATE_TASKS_END,
  SET_CURRENT_PRODUCTION,

  DISPLAY_MORE_ASSETS,

  SET_PREVIEW,

  SET_ASSET_LIST_SCROLL_POSITION,
  SET_PRODUCTION_ASSET_TYPE_LIST_SCROLL_POSITION,

  REMOVE_SELECTED_TASK,
  ADD_SELECTED_TASK,
  CLEAR_SELECTED_TASKS,

  SAVE_ASSET_SEARCH_END,
  REMOVE_ASSET_SEARCH_END,

  SET_ASSET_TYPE_SEARCH,
  COMPUTE_ASSET_TYPE_STATS,

  RESET_ALL
} from '../mutation-types'

const helpers = {
  getCurrentProduction () {
    return productionsStore.getters.currentProduction(productionsStore.state)
  },
  getTaskStatus (taskStatusId) {
    return tasksStore.state.taskStatusMap[taskStatusId]
  },
  getTaskType (taskTypeId) {
    return taskTypesStore.state.taskTypeMap[taskTypeId]
  },
  getTask (taskId) {
    return tasksStore.state.taskMap[taskId]
  },
  getPerson (personId) {
    return peopleStore.state.personMap[personId]
  },

  populateTask (task, asset, production) {
    task.name = helpers.getTaskType(task.task_type_id).priority.toString()

    Object.assign(task, {
      project_id: asset.production_id,
      entity_name: `${asset.asset_type_name} / ${asset.name}`,
      entity_type_name: asset.asset_type_name,
      entity: {
        id: asset.id,
        preview_file_id: asset.preview_file_id
      }
    })

    return task
  },

  groupAssetsByType: (assets) => {
    const assetsByType = []
    let assetTypeAssets = []
    let previousAsset = null

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
  }
}

const cache = {
  assetIndex: {},
  assetTypeIndex: {},
  assets: []
}

const initialState = {
  assetMap: {},
  nbValidationColumns: 0,

  filteredAssets: [],
  displayedAssets: [],
  displayedAssetsLength: 0,
  assetSearchText: '',
  assetSelectionGrid: {},
  assetSearchQueries: [],

  displayedAssetTypes: [],
  displayedAssetTypesLength: 0,
  assetTypeSearchText: '',
  assetTypeStats: {},

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
  },

  personTasks: [],
  assetListScrollPosition: 0
}

const state = {
  ...initialState
}

const getters = {
  assetMap: state => state.assetMap,
  assetSearchText: state => state.assetSearchText,
  assetSearchQueries: state => state.assetSearchQueries,
  assetSelectionGrid: state => state.assetSelectionGrid,

  isAssetsLoading: state => state.isAssetsLoading,
  isAssetsLoadingError: state => state.isAssetsLoadingError,

  displayedAssets: state => state.displayedAssets,
  displayedAssetsLength: state => state.displayedAssetsLength,

  displayedAssetTypes: state => state.displayedAssetTypes,
  displayedAssetTypesLength: state => state.displayedAssetTypesLength,
  assetTypeSearchText: state => state.assetTypeSearchText,
  assetTypeStats: state => state.assetTypeStats,
  assetTypeListScrollPosition: state => state.assetTypeListScrollPosition,

  assetListScrollPosition: state => state.assetListScrollPosition,

  displayedAssetsByType: state => {
    return helpers.groupAssetsByType(state.displayedAssets)
  },

  assetsByType: state => {
    return helpers.groupAssetsByType(Object.values(state.assetMap))
  },

  editAsset: state => state.editAsset,
  deleteAsset: state => state.deleteAsset,
  restoreAsset: state => state.restoreAsset,
  assetCreated: state => state.assetCreated,

  assetsCsvFormData: state => state.assetsCsvFormData
}

const actions = {

  loadAssets ({ commit, state, rootGetters }, callback) {
    const production = rootGetters.currentProduction
    const userFilters = rootGetters.userFilters
    const personMap = rootGetters.personMap
    const episode = rootGetters.currentEpisode
    const isTVShow = rootGetters.isTVShow

    if (isTVShow && !episode) {
      if (callback) return callback()
      else return null
    }

    if (state.isAssetsLoading) {
      return callback()
    }

    commit(LOAD_ASSETS_START)
    assetsApi.getAssets(production, episode, (err, assets) => {
      if (err) commit(LOAD_ASSETS_ERROR)
      else {
        assets.forEach((asset) => {
          asset.project_name = production.name
          return asset
        })
        commit(
          LOAD_ASSETS_END,
          { production, assets, userFilters, personMap }
        )
      }
      if (callback) callback(err)
    })
  },

  loadAsset ({ commit, state, rootGetters }, { assetId, callback }) {
    const taskTypeMap = rootGetters.taskTypeMap
    assetsApi.getAsset(assetId, (err, asset) => {
      if (!err) {
        commit(LOAD_ASSET_END, { asset, taskTypeMap })
      }
      if (callback) callback(err)
    })
  },

  loadAssetCastIn ({ commit, state, rootState }, { asset, callback }) {
    const shotMap = rootState.shots.shotMap
    assetsApi.getCastIn(asset, (err, castIn) => {
      if (!err) {
        commit(LOAD_ASSET_CAST_IN_END, { asset, castIn, shotMap })
      }
      if (callback) callback(err, castIn)
    })
  },

  newAsset ({ commit, dispatch, state, rootGetters }, { data, callback }) {
    if (cache.assets.find((asset) => asset.name === data.name)) {
      return callback()
    }

    commit(EDIT_ASSET_START, data)
    assetsApi.newAsset(data, (err, asset) => {
      if (err) {
        commit(EDIT_ASSET_ERROR)
        if (callback) callback(err)
      } else {
        const assetTypeMap = rootGetters.assetTypeMap
        commit(EDIT_ASSET_END, { newAsset: asset, assetTypeMap })
        const taskTypeIds = Object.values(rootGetters.assetValidationColumns)
        const createTaskPromises = taskTypeIds.map(
          (taskTypeId) => dispatch('createTask', {
            entityId: asset.id,
            projectId: asset.project_id,
            taskTypeId: taskTypeId,
            type: 'assets'
          })
        )

        Promise.all(createTaskPromises).then(() => {
          if (callback) callback()
        }).catch((err) => {
          console.log(err)
        })
      }
    })
  },

  editAsset ({ commit, state, rootState }, { data, callback }) {
    const existingAsset = data.name && cache.assets.find((asset) => {
      return asset.name === data.name && data.id !== asset.id
    })
    if (existingAsset) {
      return callback()
    }

    commit(EDIT_ASSET_START)
    const assetTypeMap = rootState.assetTypes.assetTypeMap
    assetsApi.updateAsset(data, (err, asset) => {
      if (err) {
        commit(EDIT_ASSET_ERROR)
      } else {
        commit(EDIT_ASSET_END, { newAsset: asset, assetTypeMap })
      }
      if (callback) callback(err)
    })
  },

  deleteAsset ({ commit, state }, { asset, callback }) {
    commit(DELETE_ASSET_START)
    assetsApi.deleteAsset(asset, (err) => {
      if (err) {
        commit(DELETE_ASSET_ERROR)
      } else {
        commit(DELETE_ASSET_END, asset)
      }
      if (callback) callback(err)
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

  setAssetSearch ({ commit, rootGetters }, assetSearch) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    commit(
      SET_ASSET_SEARCH,
      { assetSearch, taskMap, taskStatusMap, taskTypeMap }
    )
  },

  saveAssetSearch ({ commit, rootGetters }, searchQuery) {
    return new Promise((resolve, reject) => {
      const query = state.assetSearchQueries.find(
        (query) => query.name === searchQuery
      )
      const production = rootGetters.currentProduction

      if (!query) {
        peopleApi.createFilter(
          'asset',
          searchQuery,
          searchQuery,
          production.id,
          (err, searchQuery) => {
            commit(SAVE_ASSET_SEARCH_END, { searchQuery, production })
            if (err) {
              reject(err)
            } else {
              resolve(searchQuery)
            }
          }
        )
      } else {
        resolve()
      }
    })
  },

  removeAssetSearch ({ commit, rootGetters }, searchQuery) {
    return new Promise((resolve, reject) => {
      const production = rootGetters.currentProduction
      peopleApi.removeFilter(searchQuery, (err) => {
        commit(REMOVE_ASSET_SEARCH_END, { searchQuery, production })
        if (err) reject(err)
        else resolve()
      })
    })
  },

  displayMoreAssets ({commit}) {
    commit(DISPLAY_MORE_ASSETS)
  },

  initAssetTypes ({ commit, dispatch, state, rootState, rootGetters }) {
    return new Promise((resolve, reject) => {
      const productionId = rootState.route.params.production_id
      dispatch('setLastProductionScreen', 'production-asset-types')

      if (cache.assets.length === 0 ||
          cache.assets[0].production_id !== productionId) {
        dispatch('loadAssets', (err) => {
          if (err) {
            reject(err)
          } else {
            dispatch('computeAssetTypeStats')
            resolve()
          }
        })
      } else {
        dispatch('computeAssetTypeStats')
        resolve()
      }
    })
  },

  setAssetTypeListScrollPosition ({ commit }) {
    commit(SET_PRODUCTION_ASSET_TYPE_LIST_SCROLL_POSITION)
  },

  computeAssetTypeStats ({ commit, rootGetters }) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskMap = rootGetters.taskMap
    commit(COMPUTE_ASSET_TYPE_STATS, { taskStatusMap, taskMap })
  },

  setAssetTypeSearch ({commit}, searchQuery) {
    commit(SET_ASSET_TYPE_SEARCH, searchQuery)
  }
}

const mutations = {
  [LOAD_ASSETS_START] (state) {
    cache.assets = []
    state.assetMap = {}
    state.isAssetsLoading = true
    state.isAssetsLoadingError = false

    cache.assetIndex = {}
    state.displayedAssets = []
    state.displayedAssetsLength = 0
    state.assetSearchQueries = []
  },

  [LOAD_ASSETS_ERROR] (state) {
    state.isAssetsLoading = false
    state.isAssetsLoadingError = true
  },

  [LOAD_ASSETS_END] (state, { production, assets, userFilters }) {
    const validationColumns = {}
    const assetTypeMap = {}
    assets = sortAssets(assets)

    state.assetMap = {}
    assets.forEach((asset) => {
      if (!assetTypeMap[asset.asset_type]) {
        assetTypeMap[asset.asset_type_id] = {
          id: asset.asset_type_id,
          name: asset.asset_type_name
        }
      }
      asset.production_id = production.id

      asset.tasks.forEach((task) => {
        helpers.populateTask(task, asset)
        validationColumns[task.task_type_id] = true
      })

      state.assetMap[asset.id] = asset
    })

    cache.assets = assets
    state.isAssetsLoading = false
    state.isAssetsLoadingError = false
    state.nbValidationColumns = Object.keys(validationColumns).length

    cache.assetIndex = buildAssetIndex(assets)
    state.displayedAssets = cache.assets.slice(0, PAGE_SIZE)
    state.displayedAssetsLength = cache.assets ? cache.assets.length : 0

    state.assetTypes = Object.values(assetTypeMap)
    state.displayedAssetTypes = state.assetTypes
    state.displayedAssetTypesLength = state.assetTypes.length
    cache.assetTypeIndex = buildNameIndex(state.assetTypes)

    const maxX = state.displayedAssets.length
    const maxY = state.nbValidationColumns
    state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)

    if (userFilters.asset && userFilters.asset[production.id]) {
      state.assetSearchQueries = userFilters.asset[production.id]
    } else {
      state.assetSearchQueries = []
    }
  },

  [LOAD_ASSET_END] (state, { asset, taskTypeMap }) {
    asset.tasks.forEach((task) => {
      helpers.populateTask(task, asset)
    })
    asset.tasks = sortTasks(asset.tasks, taskTypeMap)
    state.assetMap[asset.id] = asset
  },

  [ASSET_CSV_FILE_SELECTED] (state, formData) {
    state.assetsCsvFormData = formData
  },
  [IMPORT_ASSETS_START] (state) {},
  [IMPORT_ASSETS_END] (state) {
    state.assetsCsvFormData = null
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

  [EDIT_ASSET_END] (state, { newAsset, assetTypeMap }) {
    state.editAsset.isCreateError = false
    state.editAsset.isSuccess = true
    state.assetCreated = newAsset.name

    const asset = state.assetMap[newAsset.id]
    const assetType = assetTypeMap[newAsset.entity_type_id]
    if (assetType) {
      newAsset.asset_type_name = assetType.name
      newAsset.asset_type_id = assetType.id
    }

    newAsset.tasks = []
    if (asset) {
      newAsset.episode_id = newAsset.source_id
      Object.assign(asset, newAsset)
      state.displayedAssets = sortAssets(state.displayedAssets)
    } else {
      newAsset.validations = {}
      newAsset.production_id = newAsset.project_id
      newAsset.episode_id = newAsset.source_id
      cache.assets.push(newAsset)
      cache.assets = sortAssets(cache.assets)
      state.displayedAssets.push(newAsset)
      state.displayedAssets = sortAssets(state.displayedAssets)
      state.displayedAssetsLength = state.displayedAssets.length

      const maxX = state.displayedAssets.length
      const maxY = state.nbValidationColumns
      state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
      state.assetMap[newAsset.id] = newAsset
    }
    state.editAsset = {
      isLoading: false,
      isError: false
    }
    cache.assetIndex = buildAssetIndex(cache.assets)
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

    if (asset.tasks.length > 0 && !assetToDelete.canceled) {
      asset.canceled = true
    } else {
      const assetToDeleteIndex = cache.assets.findIndex(
        (asset) => asset.id === assetToDelete.id
      )
      const displayAssetToDeleteIndex = cache.assets.findIndex(
        (asset) => asset.id === assetToDelete.id
      )
      cache.assets.splice(assetToDeleteIndex, 1)
      state.displayedAssets.splice(displayAssetToDeleteIndex, 1)
      state.assetMap[assetToDelete.id] = undefined
    }

    state.deleteAsset = {
      isLoading: false,
      isError: false
    }
    cache.assetIndex = buildAssetIndex(cache.assets)
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
    cache.assetIndex = buildAssetIndex(cache.assets)
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
    cache.assetIndex = buildAssetIndex(cache.assets)
  },

  [DELETE_TASK_END] (state, task) {
    const asset = cache.assets.find(
      (asset) => asset.id === task.entity_id
    )
    if (asset) {
      const validations = {...asset.validations}
      Vue.set(validations, task.task_type_id, null)
      delete asset.validations
      Vue.set(asset, 'validations', validations)

      const taskIndex = asset.tasks.findIndex(
        (assetTask) => assetTask.id === task.entity_id
      )
      asset.tasks.splice(taskIndex, 1)
    }
  },

  [NEW_TASK_COMMENT_END] (state, {comment, taskId}) {
  },

  [SET_ASSET_SEARCH] (
    state, { assetSearch, taskStatusMap, taskTypeMap, taskMap }
  ) {
    let result = indexSearch(cache.assetIndex, assetSearch) || cache.assets
    const taskTypes = extractTaskTypes(cache.assets, taskTypeMap)
    result = applyFilters(
      taskTypes, result, assetSearch, taskStatusMap, taskMap
    ) || []

    state.displayedAssets = result.slice(0, PAGE_SIZE)
    state.displayedAssetsLength = result ? result.length : 0
    state.assetSearchText = assetSearch

    const maxX = state.displayedAssets.length
    const maxY = state.nbValidationColumns
    state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
  },

  [SAVE_ASSET_SEARCH_END] (state, { searchQuery }) {
    if (!state.assetSearchQueries.includes(searchQuery)) {
      state.assetSearchQueries.push(searchQuery)
      state.assetSearchQueries = sortByName(state.assetSearchQueries)
    }
  },

  [REMOVE_ASSET_SEARCH_END] (state, { searchQuery }) {
    const queryIndex = state.assetSearchQueries.findIndex(
      (query) => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.assetSearchQueries.splice(queryIndex, 1)
    }
  },

  [CREATE_TASKS_END] (state, tasks) {
    tasks.forEach((task) => {
      if (task) {
        const asset = state.assetMap[task.entity_id]
        if (asset) {
          const validations = {...asset.validations}
          Vue.set(validations, task.task_type_id, task.id)
          delete asset.validations
          Vue.set(asset, 'validations', validations)
        }
      }
    })
  },

  [DISPLAY_MORE_ASSETS] (state, tasks) {
    let assets
    if (state.assetSearchText.length > 0) {
      assets = indexSearch(cache.assetIndex, state.assetSearchText)
    } else {
      assets = cache.assets
    }
    state.displayedAssets = assets.slice(
      0,
      state.displayedAssets.length + PAGE_SIZE
    )
    const previousX = state.displayedAssets.length - PAGE_SIZE
    const maxX = state.displayedAssets.length
    const maxY = state.nbValidationColumns
    state.assetSelectionGrid = appendSelectionGrid(
      state.assetSelectionGrid, previousX, maxX, maxY
    )
  },

  [SET_CURRENT_PRODUCTION] (state, production) {
    state.assetSearchText = ''
  },

  [SET_PREVIEW] (state, {entityId, taskId, previewId}) {
    const asset = state.assetMap[entityId]
    if (asset) {
      asset.preview_file_id = previewId
    }
  },

  [SET_ASSET_LIST_SCROLL_POSITION] (state, scrollPosition) {
    state.assetListScrollPosition = scrollPosition
  },

  [SET_PRODUCTION_ASSET_TYPE_LIST_SCROLL_POSITION] (state, scrollPosition) {
    state.assetTypeListScrollPosition = scrollPosition
  },

  [REMOVE_SELECTED_TASK] (state, validationInfo) {
    if (state.assetSelectionGrid[0] &&
        state.assetSelectionGrid[validationInfo.x]) {
      state.assetSelectionGrid[validationInfo.x][validationInfo.y] = false
    }
  },

  [ADD_SELECTED_TASK] (state, validationInfo) {
    if (state.assetSelectionGrid[0] &&
        state.assetSelectionGrid[validationInfo.x]) {
      state.assetSelectionGrid[validationInfo.x][validationInfo.y] = true
    }
  },

  [CLEAR_SELECTED_TASKS] (state, validationInfo) {
    state.assetSelectionGrid = clearSelectionGrid(state.assetSelectionGrid)
  },

  [NEW_TASK_END] (state, task) {
    const asset = state.assetMap[task.entity_id]
    if (asset && task) {
      task = helpers.populateTask(task, asset)

      asset.tasks.push(task)
      Vue.set(asset.validations, task.task_type_id, task.id)
    }
  },

  [SET_ASSET_TYPE_SEARCH] (state, searchQuery) {
    let result = indexSearch(
      cache.assetTypeIndex,
      searchQuery
    ) || state.assetTypes

    state.displayedAssetTypes = result
    state.displayedAssetTypesLength = result ? result.length : 0
    state.assetTypeSearchText = searchQuery
  },

  [COMPUTE_ASSET_TYPE_STATS] (state, { taskStatusMap, taskMap }) {
    state.assetTypeStats = computeStats(
      cache.assets, 'asset_type_id', taskStatusMap, taskMap
    )
  },

  [RESET_ALL] (state) {
    cache.assets = []
    cache.assetIndex = {}

    Object.assign(state, {...initialState})
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
