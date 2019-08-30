import Vue from 'vue'

import assetsApi from '../api/assets'
import peopleApi from '../api/people'
import tasksStore from './tasks'
import taskTypesStore from './tasktypes'
import productionsStore from './productions'
import peopleStore from './people'

import { PAGE_SIZE } from '../../lib/pagination'
import {
  sortByName,
  sortAssets,
  sortTasks,
  sortValidationColumns
} from '../../lib/sorting'
import {
  appendSelectionGrid,
  buildSelectionGrid,
  clearSelectionGrid
} from '../../lib/selection'
import {
  getFilledColumns,
  groupEntitiesByParents
} from '../../lib/models'
import {
  computeStats
} from '../../lib/stats'
import {
  buildAssetIndex,
  buildNameIndex,
  indexSearch
} from '../../lib/indexing'
import {
  applyFilters,
  getKeyWords,
  getFilters
} from '../../lib/filtering'

import {
  CLEAR_ASSETS,

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
  SET_CURRENT_PRODUCTION,

  DISPLAY_MORE_ASSETS,

  SET_PREVIEW,

  SET_ASSET_LIST_SCROLL_POSITION,
  SET_PRODUCTION_ASSET_TYPE_LIST_SCROLL_POSITION,

  REMOVE_SELECTED_TASK,
  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  CLEAR_SELECTED_TASKS,
  CREATE_TASKS_END,

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
    task.task_status_short_name =
      helpers.getTaskStatus(task.task_status_id).short_name

    Object.assign(task, {
      project_id: asset.production_id,
      episode_id: asset.source_id,
      entity_name: `${asset.asset_type_name} / ${asset.name}`,
      entity_type_name: asset.asset_type_name,
      entity: {
        id: asset.id,
        preview_file_id: asset.preview_file_id
      }
    })

    return task
  }
}

const cache = {
  assetIndex: {},
  assetTypeIndex: {},
  assets: []
}

const initialState = {
  assetMap: {},
  assetValidationColumns: [],
  nbValidationColumns: 0,

  filteredAssets: [],
  displayedAssets: [],
  displayedAssetsLength: 0,
  assetFilledColumns: {},
  assetSearchText: '',
  assetSelectionGrid: {},
  assetSearchQueries: [],

  displayedAssetTypes: [],
  displayedAssetTypesLength: 0,
  assetTypeSearchText: '',
  assetTypeStats: {},

  isAssetsLoading: false,
  isAssetsLoadingError: false,
  isAssetTime: false,
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
  assetValidationColumns: state => state.assetValidationColumns,

  isAssetsLoading: state => state.isAssetsLoading,
  isAssetsLoadingError: state => state.isAssetsLoadingError,

  displayedAssets: state => state.displayedAssets,
  displayedAssetsLength: state => state.displayedAssetsLength,
  assetFilledColumns: state => state.assetFilledColumns,

  displayedAssetTypes: state => state.displayedAssetTypes,
  displayedAssetTypesLength: state => state.displayedAssetTypesLength,
  assetTypeSearchText: state => state.assetTypeSearchText,
  assetTypeStats: state => state.assetTypeStats,
  assetTypeListScrollPosition: state => state.assetTypeListScrollPosition,

  assetListScrollPosition: state => state.assetListScrollPosition,

  displayedAssetsByType: state => {
    return groupEntitiesByParents(state.displayedAssets, 'asset_type_name')
  },

  assetsByType: state => {
    return groupEntitiesByParents(
      Object.values(state.displayedAssets),
      'asset_type_name'
    )
  },

  editAsset: state => state.editAsset,
  deleteAsset: state => state.deleteAsset,
  restoreAsset: state => state.restoreAsset,
  assetCreated: state => state.assetCreated,

  isAssetTime: state => state.isAssetTime,

  assetsCsvFormData: state => state.assetsCsvFormData
}

const actions = {

  loadAssets ({ commit, state, rootGetters }, callback) {
    const production = rootGetters.currentProduction
    const userFilters = rootGetters.userFilters
    const personMap = rootGetters.personMap
    const episode = rootGetters.currentEpisode
    const isTVShow = rootGetters.isTVShow
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap

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
        commit(
          LOAD_ASSETS_END,
          { production, assets, userFilters, personMap, taskMap, taskTypeMap }
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
        const taskTypeIds = state.assetValidationColumns
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
    const production = rootGetters.currentProduction
    commit(
      SET_ASSET_SEARCH,
      { assetSearch, taskMap, taskStatusMap, taskTypeMap, production }
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
          null,
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

  displayMoreAssets ({ commit, rootGetters }) {
    commit(DISPLAY_MORE_ASSETS, {
      taskTypeMap: rootGetters.taskTypeMap,
      taskStatusMap: rootGetters.taskStatusMap,
      taskMap: rootGetters.taskMap,
      production: rootGetters.currentProduction
    })
  },

  initAssetTypes ({ commit, dispatch, state, rootState, rootGetters }) {
    return new Promise((resolve, reject) => {
      dispatch('setLastProductionScreen', 'production-asset-types')
      dispatch('loadAssets', (err) => {
        if (err) {
          reject(err)
        } else {
          dispatch('computeAssetTypeStats')
          resolve()
        }
      })
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

  setAssetTypeSearch ({ commit }, searchQuery) {
    commit(SET_ASSET_TYPE_SEARCH, searchQuery)
  }
}

const mutations = {
  [CLEAR_ASSETS] (state) {
    cache.assets = []
    state.assetMap = {}
    state.assetValidationColumns = []

    cache.assetIndex = {}
    state.displayedAssets = []
    state.assetFilledColumns = {}
    state.displayedAssetsLength = 0
    state.assetSearchQueries = []
  },

  [LOAD_ASSETS_START] (state) {
    cache.assets = []
    state.assetMap = {}
    state.isAssetsLoading = true
    state.isAssetsLoadingError = false
    state.assetValidationColumns = []

    cache.assetIndex = {}
    state.displayedAssets = []
    state.assetFilledColumns = {}
    state.displayedAssetsLength = 0
    state.assetSearchQueries = []
  },

  [LOAD_ASSETS_ERROR] (state) {
    state.isAssetsLoading = false
    state.isAssetsLoadingError = true
  },

  [LOAD_ASSETS_END] (state, {
    production,
    assets,
    userFilters,
    personMap,
    taskMap,
    taskTypeMap
  }) {
    const validationColumns = {}
    const assetTypeMap = {}
    let isTime = false
    assets = sortAssets(assets)
    cache.assets = assets
    cache.assetIndex = buildAssetIndex(assets)
    state.assetMap = {}

    assets.forEach((asset) => {
      let timeSpent = 0
      const validations = {}
      if (!assetTypeMap[asset.asset_type]) {
        assetTypeMap[asset.asset_type_id] = {
          id: asset.asset_type_id,
          name: asset.asset_type_name
        }
      }
      asset.production_id = production.id
      asset.project_name = production.name

      const taskIds = []
      asset.tasks.forEach((task) => {
        helpers.populateTask(task, asset)

        if (task.assignees.length > 1) {
          task.assignees = task.assignees.sort((a, b) => {
            return personMap[a].name.localeCompare(personMap[b].name)
          })
        }

        const taskType = taskTypeMap[task.task_type_id]
        if (!validationColumns[taskType.name]) {
          validationColumns[taskType.name] = task.task_type_id
        }

        timeSpent += task.duration
        taskIds.push(task.id)
        validations[task.task_type_id] = task.id
        taskMap[task.id] = task
      })

      asset.tasks = taskIds
      asset.validations = validations
      asset.timeSpent = timeSpent
      if (!isTime && timeSpent > 0) isTime = true
      state.assetMap[asset.id] = asset
    })
    const assetTypes = Object.values(assetTypeMap)
    cache.assetTypeIndex = buildNameIndex(assetTypes)

    state.assetValidationColumns = sortValidationColumns(
      Object.values(validationColumns),
      taskTypeMap
    )

    const displayedAssets = cache.assets.slice(0, PAGE_SIZE)
    Object.assign(state, {
      isAssetTime: isTime,

      isAssetsLoading: false,
      isAssetsLoadingError: false,
      nbValidationColumns: state.assetValidationColumns.length,

      displayedAssets: displayedAssets,
      displayedAssetsLength: cache.assets ? cache.assets.length : 0,
      assetFilledColumns: getFilledColumns(displayedAssets),

      assetTypes: assetTypes,
      displayedAssetTypes: assetTypes,
      displayedAssetTypesLength: assetTypes.length
    })

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
      state.assetFilledColumns = getFilledColumns(state.displayedAssets)
      state.displayedAssetsLength = cache.assets.length

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
      state.assetFilledColumns = getFilledColumns(state.displayedAssets)
      state.assetMap[assetToDelete.id] = undefined
      state.displayedAssetsLength = Math.max(
        state.displayedAssetsLength - 1,
        0
      )
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
    const asset = state.displayedAssets.find(
      (asset) => asset.id === task.entity_id
    )
    if (asset) {
      const validations = JSON.parse(JSON.stringify(asset.validations))
      delete asset.validations
      Vue.set(asset, 'validations', validations)

      const tasks = JSON.parse(JSON.stringify(asset.tasks))
      const taskIndex = tasks.findIndex(
        (assetTaskId) => assetTaskId === task.id
      )
      tasks.splice(taskIndex, 1)
      Vue.set(asset, 'tasks', tasks)
    }
  },

  [NEW_TASK_COMMENT_END] (state, { comment, taskId }) {
  },

  [SET_ASSET_SEARCH] (
    state, { assetSearch, taskStatusMap, taskTypeMap, taskMap, production }
  ) {
    const taskTypes = Object.values(taskTypeMap)
    const taskStatuses = Object.keys(taskStatusMap).map((id) => {
      return taskStatusMap[id]
    })

    const query = assetSearch
    const keywords = getKeyWords(query) || []
    const filters = getFilters(
      cache.assetIndex,
      taskTypes,
      taskStatuses,
      production.descriptors || [],
      query
    )
    let result = indexSearch(cache.assetIndex, keywords) || cache.assets
    result = applyFilters(result, filters, taskMap)

    const displayedAssets = result.slice(0, PAGE_SIZE)
    const maxX = displayedAssets.length
    const maxY = state.nbValidationColumns

    state.displayedAssets = displayedAssets
    state.assetFilledColumns = getFilledColumns(displayedAssets)
    state.displayedAssetsLength = result ? result.length : 0
    state.assetSearchText = query
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

  [DISPLAY_MORE_ASSETS] (state, {
    taskTypeMap,
    taskStatusMap,
    taskMap,
    production
  }) {
    let assets
    if (state.assetSearchText.length > 0) {
      const taskTypes = Object.values(taskTypeMap)
      const taskStatuses = Object.values(taskStatusMap)
      const query = state.assetSearchText
      const keywords = getKeyWords(query) || []
      const filters = getFilters(
        cache.assetIndex,
        taskTypes,
        taskStatuses,
        production.descriptors || [],
        query
      )
      assets = indexSearch(cache.assetIndex, keywords) || cache.assets
      assets = applyFilters(assets, filters, taskMap)
    } else {
      assets = cache.assets
    }

    state.displayedAssets = assets.slice(
      0,
      state.displayedAssets.length + PAGE_SIZE
    )
    state.assetFilledColumns = getFilledColumns(state.displayedAssets)
    const previousX = state.displayedAssets.length - PAGE_SIZE
    const maxX = state.displayedAssets.length
    const maxY = state.nbValidationColumns
    if (previousX >= 0) {
      state.assetSelectionGrid = appendSelectionGrid(
        state.assetSelectionGrid, previousX, maxX, maxY
      )
    }
  },

  [SET_CURRENT_PRODUCTION] (state, production) {
    state.assetSearchText = ''
  },

  [SET_PREVIEW] (state, { entityId, taskId, previewId, taskMap }) {
    const asset = state.assetMap[entityId]
    if (asset) {
      asset.preview_file_id = previewId
      asset.tasks.forEach((taskId) => {
        const task = taskMap[taskId]
        task.entity.preview_file_id = previewId
      })
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

  [ADD_SELECTED_TASKS] (state, selection) {
    const tmpGrid = JSON.parse(JSON.stringify(state.assetSelectionGrid))
    selection.forEach((validationInfo) => {
      if (tmpGrid[0] && tmpGrid[validationInfo.x]) {
        tmpGrid[validationInfo.x][validationInfo.y] = true
      }
    })
    state.assetSelectionGrid = tmpGrid
  },

  [CLEAR_SELECTED_TASKS] (state, validationInfo) {
    const tmpGrid = JSON.parse(JSON.stringify(state.assetSelectionGrid))
    state.assetSelectionGrid = clearSelectionGrid(tmpGrid)
  },

  [NEW_TASK_END] (state, task) {
    const asset = state.assetMap[task.entity_id]
    if (asset && task) {
      task = helpers.populateTask(task, asset)

      asset.tasks.push(task)
      Vue.set(asset.validations, task.task_type_id, task.id)
    }
  },

  [CREATE_TASKS_END] (state, tasks) {
    tasks.forEach((task) => {
      if (task) {
        const asset = state.assetMap[task.entity_id]
        if (asset) {
          const validations = { ...asset.validations }
          Vue.set(validations, task.task_type_id, task.id)
          delete asset.validations
          Vue.set(asset, 'validations', validations)
        }
      }
    })
  },

  [SET_ASSET_TYPE_SEARCH] (state, searchQuery) {
    const keywords = getKeyWords(searchQuery)
    let result =
      indexSearch(cache.assetTypeIndex, keywords) || state.assetTypes

    Object.assign(state, {
      displayedAssetTypes: result,
      displayedAssetTypesLength: result ? result.length : 0,
      assetTypeSearchText: searchQuery
    })
  },

  [COMPUTE_ASSET_TYPE_STATS] (state, { taskStatusMap, taskMap }) {
    state.assetTypeStats = computeStats(
      cache.assets, 'asset_type_id', taskStatusMap, taskMap
    )
  },

  [RESET_ALL] (state) {
    cache.assets = []
    cache.assetIndex = {}

    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
