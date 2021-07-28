import Vue from 'vue'

import assetsApi from '../api/assets'
import peopleApi from '../api/people'
import tasksStore from './tasks'
import taskTypesStore from './tasktypes'
import productionsStore from './productions'
import peopleStore from './people'
import { getTaskTypePriorityOfProd } from '@/lib/productions'
import {
  minutesToDays
} from '../../lib/time'

import { PAGE_SIZE } from '../../lib/pagination'
import {
  sortAssetResult,
  sortAssets,
  sortByName,
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
  groupEntitiesByParents,
  removeModelFromList
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

  EDIT_ASSET_END,

  RESTORE_ASSET_END,

  ADD_ASSET,
  UPDATE_ASSET,
  REMOVE_ASSET,
  CANCEL_ASSET,

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
  UPDATE_METADATA_DESCRIPTOR_END,

  CHANGE_ASSET_SORT,
  LOCK_ASSET,
  UNLOCK_ASSET,

  RESET_ALL,

  CLEAR_SELECTED_ASSETS,
  SET_ASSET_SELECTION
} from '../mutation-types'
import async from 'async'

const helpers = {
  getCurrentProduction () {
    return productionsStore.getters.currentProduction(productionsStore.state)
  },
  getTaskStatus (taskStatusId) {
    return tasksStore.state.taskStatusMap.get(taskStatusId)
  },
  getTaskType (taskTypeId) {
    return taskTypesStore.state.taskTypeMap.get(taskTypeId)
  },
  getTask (taskId) {
    return tasksStore.state.taskMap.get(taskId)
  },
  getPerson (personId) {
    return peopleStore.state.personMap.get(personId)
  },

  setListStats (state, assets) {
    let timeSpent = 0
    let estimations = 0
    if (assets) {
      assets.forEach(asset => {
        timeSpent += asset.timeSpent
        estimations += asset.estimation
      })
      Object.assign(state, {
        displayedAssetsLength: assets.length,
        displayedAssetsTimeSpent: timeSpent,
        displayedAssetsEstimation: estimations
      })
    } else {
      Object.assign(state, {
        displayedAssetsLength: 0,
        displayedAssetsEstimation: 0
      })
    }
  },

  populateTask (task, asset, production) {
    task.name = getTaskTypePriorityOfProd(
      helpers.getTaskType(task.task_type_id),
      production || helpers.getCurrentProduction()
    ).toString()
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
  },

  populateAndRegisterAsset (
    assetTypeMap,
    taskMap,
    taskTypeMap,
    personMap,
    production,
    validationColumns,
    asset
  ) {
    const validations = new Map()
    let timeSpent = 0
    let estimation = 0
    if (!assetTypeMap.get(asset.asset_type)) {
      assetTypeMap.set(asset.asset_type_id, {
        id: asset.asset_type_id,
        name: asset.asset_type_name
      })
    }
    asset.production_id = production.id
    asset.project_name = production.name
    asset.production_name = production.name

    const taskIds = []
    asset.tasks.forEach((task) => {
      asset.full_name = `${asset.asset_type_name} / ${asset.name}`
      helpers.populateTask(task, asset)

      if (task.assignees.length > 1) {
        task.assignees = task.assignees.sort((a, b) => {
          return personMap.get(a).name.localeCompare(personMap.get(b).name)
        })
      }

      const taskType = taskTypeMap.get(task.task_type_id)
      if (!validationColumns[taskType.name]) {
        validationColumns[taskType.name] = task.task_type_id
      }

      timeSpent += task.duration
      estimation += task.estimation
      taskIds.push(task.id)
      validations.set(task.task_type_id, task.id)
      taskMap.set(task.id, task)
    })

    asset.tasks = taskIds
    asset.validations = validations
    asset.timeSpent = timeSpent
    asset.estimation = estimation
    return asset
  },

  sortValidationColumns (validationColumns, assetFilledColumns, taskTypeMap) {
    const columns = [...validationColumns]
    return sortValidationColumns(
      columns,
      taskTypeMap,
      helpers.getCurrentProduction()
    )
  },

  buildResult (state, {
    assetSearch,
    production,
    sorting,
    taskStatusMap,
    taskTypeMap,
    persons,
    taskMap
  }) {
    const taskTypes = Array.from(taskTypeMap.values())
    const taskStatuses = Array.from(taskStatusMap.values())
    const query = assetSearch
    const keywords = getKeyWords(query) || []
    const filters = getFilters({
      entryIndex: cache.assetIndex,
      assetTypes: state.assetTypes,
      taskTypes,
      taskStatuses,
      descriptors: production.descriptors || [],
      persons,
      query
    })
    let result = indexSearch(cache.assetIndex, keywords) || cache.assets
    result = applyFilters(result, filters, taskMap)
    result = sortAssetResult(
      result,
      sorting,
      taskTypeMap,
      taskMap
    )
    cache.result = result

    const displayedAssets = result.slice(0, PAGE_SIZE)
    const maxX = displayedAssets.length
    const maxY = state.nbValidationColumns

    state.displayedAssets = displayedAssets
    state.assetFilledColumns = getFilledColumns(displayedAssets)
    helpers.setListStats(state, result)
    state.assetSearchText = query
    state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
  }
}

const cache = {
  assetIndex: {},
  assetTypeIndex: {},
  assets: []
}

const initialState = {
  assetMap: new Map(),
  assetValidationColumns: [],
  nbValidationColumns: 0,

  filteredAssets: [],
  displayedAssets: [],
  displayedAssetsLength: 0,
  displayedAssetsTimeSpent: 0,
  displayedAssetsEstimation: 0,
  assetFilledColumns: {},
  assetSearchText: '',
  assetSelectionGrid: {},
  assetSearchQueries: [],
  assetSorting: [],

  displayedAssetTypes: [],
  displayedAssetTypesLength: 0,
  assetTypeSearchText: '',
  assetTypeStats: {},
  assetTypes: [],

  isAssetsLoading: false,
  isAssetsLoadingError: false,
  isAssetDescription: false,
  isAssetEstimation: false,
  isAssetTime: false,
  assetsCsvFormData: null,

  assetCreated: '',
  personTasks: [],
  assetListScrollPosition: 0,

  selectedAssets: new Map()
}

const state = {
  ...initialState
}

const getters = {
  assets: state => cache.assets,
  assetMap: state => state.assetMap,
  assetSearchText: state => state.assetSearchText,
  assetSearchQueries: state => state.assetSearchQueries,
  assetSelectionGrid: state => state.assetSelectionGrid,
  assetValidationColumns: state => state.assetValidationColumns,

  isAssetsLoading: state => state.isAssetsLoading,
  isAssetsLoadingError: state => state.isAssetsLoadingError,

  displayedAssets: state => state.displayedAssets,
  displayedAssetsLength: state => state.displayedAssetsLength,
  displayedAssetsTimeSpent: state => state.displayedAssetsTimeSpent,
  displayedAssetsEstimation: state => state.displayedAssetsEstimation,
  assetFilledColumns: state => state.assetFilledColumns,

  displayedAssetTypes: state => state.displayedAssetTypes,
  displayedAssetTypesLength: state => state.displayedAssetTypesLength,
  assetTypeSearchText: state => state.assetTypeSearchText,
  assetTypeStats: state => state.assetTypeStats,
  assetTypeListScrollPosition: state => state.assetTypeListScrollPosition,
  assetSorting: state => state.assetSorting,

  assetListScrollPosition: state => state.assetListScrollPosition,

  displayedAssetsByType: state => {
    return groupEntitiesByParents(state.displayedAssets, 'asset_type_name')
  },

  assetsByType: state => {
    const activeAssets = state.displayedAssets
      .filter(a => !a.canceled)
    return groupEntitiesByParents(activeAssets, 'asset_type_name')
  },

  assetCreated: state => state.assetCreated,

  isAssetEstimation: state => state.isAssetEstimation,
  isAssetTime: state => state.isAssetTime,
  isAssetDescription: state => state.isAssetDescription,

  assetsCsvFormData: state => state.assetsCsvFormData,

  selectedAssets: state => state.selectedAssets
}

const actions = {

  loadAssets ({ commit, state, rootGetters }, all = false) {
    const production = rootGetters.currentProduction
    const userFilters = rootGetters.userFilters
    const personMap = rootGetters.personMap
    let episode = rootGetters.currentEpisode
    const isTVShow = rootGetters.isTVShow
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap

    if (isTVShow && !episode) {
      return Promise.resolve([])
    }

    if (state.isAssetsLoading) {
      return Promise.resolve([])
    }

    if (all) {
      episode = null // Do not filter by episode
    }

    commit(LOAD_ASSETS_START)
    return assetsApi.getAssets(production, episode)
      .then((assets) => {
        commit(
          LOAD_ASSETS_END,
          { production, assets, userFilters, personMap, taskMap, taskTypeMap }

        )
        return Promise.resolve(assets)
      })
      .catch((err) => {
        console.error('an error occured while loading assets', err)
        commit(LOAD_ASSETS_ERROR)
        return Promise.resolve([])
      })
  },

  /*
   * Function used mainly to reload asset information when a remote change
   * occurs.
   */
  loadAsset ({ commit, state, rootGetters }, assetId) {
    const asset = state.assetMap.get(assetId)
    if (asset && asset.lock) return

    const personMap = rootGetters.personMap
    const production = rootGetters.currentProduction
    const taskMap = rootGetters.taskMap
    const taskTypeMap = rootGetters.taskTypeMap
    return assetsApi.getAsset(assetId)
      .then((asset) => {
        if (state.assetMap.get(asset.id)) {
          commit(UPDATE_ASSET, asset)
        } else {
          commit(ADD_ASSET, {
            asset,
            taskTypeMap,
            taskMap,
            personMap,
            production
          })
        }
      })
      .catch((err) => console.error(err))
  },

  newAsset ({ commit, dispatch, state, rootGetters }, data) {
    if (cache.assets.find((asset) => asset.name === data.name)) {
      return Promise.reject(new Error('Asset already exsists'))
    }
    return assetsApi.newAsset(data)
      .then((asset) => {
        const assetTypeMap = rootGetters.assetTypeMap
        commit(EDIT_ASSET_END, { newAsset: asset, assetTypeMap })
        const sortInfo = state.assetSorting && state.assetSorting.length > 0
          ? state.assetSorting[0]
          : []
        dispatch('changeAssetSort', sortInfo)
        const taskTypeIds = rootGetters.productionAssetTaskTypeIds
        const createTaskPromises = taskTypeIds.map(
          (taskTypeId) => dispatch('createTask', {
            entityId: asset.id,
            projectId: asset.project_id,
            taskTypeId: taskTypeId,
            type: 'assets'
          })
        )
        return Promise.all(createTaskPromises)
          .then(() => {
            return Promise.resolve(asset)
          })
      })
  },

  editAsset ({ commit, state, rootState }, data) {
    const existingAsset = data.name && cache.assets.find(asset => {
      return asset.name === data.name && data.id !== asset.id
    })
    if (existingAsset) {
      return Promise.reject(new Error('Asset already exsists'))
    }
    const assetTypeMap = rootState.assetTypes.assetTypeMap
    commit(LOCK_ASSET, data)
    commit(EDIT_ASSET_END, { newAsset: data, assetTypeMap })
    return assetsApi.updateAsset(data)
      .then(asset => {
        setTimeout(() => {
          commit(UNLOCK_ASSET, data)
        }, 2000)
        return Promise.resolve(asset)
      })
  },

  deleteAsset ({ commit, state }, asset) {
    return assetsApi.deleteAsset(asset)
      .then(() => {
        const previousAsset = state.assetMap.get(asset.id)
        if (
          previousAsset &&
          previousAsset.tasks.length > 0 &&
          !previousAsset.canceled
        ) {
          commit(CANCEL_ASSET, previousAsset)
        } else {
          commit(REMOVE_ASSET, asset)
        }
        return Promise.resolve(asset)
      })
  },

  restoreAsset ({ commit, state }, asset) {
    return assetsApi.restoreAsset(asset)
      .then(() => {
        commit(RESTORE_ASSET_END, asset)
        return Promise.resolve(asset)
      })
  },

  uploadAssetFile ({ commit, state }, toUpdate) {
    const production = helpers.getCurrentProduction()
    commit(IMPORT_ASSETS_START)
    return assetsApi.postCsv(production, state.assetsCsvFormData, toUpdate)
      .then(() => {
        commit(IMPORT_ASSETS_END)
        Promise.resolve()
      })
  },

  setAssetSearch ({ commit, state, rootGetters }, assetSearch) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const production = rootGetters.currentProduction
    const persons = rootGetters.people
    commit(
      SET_ASSET_SEARCH,
      {
        assetSearch,
        taskMap,
        taskStatusMap,
        taskTypeMap,
        persons,
        production
      }
    )
  },

  saveAssetSearch ({ commit, state, rootGetters }, searchQuery) {
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
    const production = rootGetters.currentProduction
    return peopleApi.removeFilter(searchQuery)
      .then(() => {
        commit(REMOVE_ASSET_SEARCH_END, { searchQuery, production })
        return Promise.resolve()
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

  initAssetTypes ({ dispatch }) {
    dispatch('setLastProductionScreen', 'production-asset-types')
    return dispatch('loadAssets')
      .then(() => {
        dispatch('computeAssetTypeStats')
        return Promise.resolve()
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
  },

  getAssetsCsvLines ({ state, rootGetters }) {
    const production = rootGetters.currentProduction
    const episodeMap = rootGetters.episodeMap
    const organisation = rootGetters.organisation
    let assets = cache.assets
    if (cache.result && cache.result.length > 0) {
      assets = cache.result
    }
    const lines = assets.map(asset => {
      let assetLine = []
      if (rootGetters.isTVShow) {
        assetLine.push(
          asset.episode_id ? episodeMap.get(asset.episode_id).name : 'MP'
        )
      }
      assetLine = assetLine.concat([
        asset.asset_type_name,
        asset.name,
        asset.description
      ])
      sortByName([...production.descriptors])
        .filter(d => d.entity_type === 'Asset')
        .forEach(descriptor => {
          asset.data = asset.data || {}
          assetLine.push(asset.data[descriptor.field_name])
        })
      if (state.isAssetTime) {
        assetLine.push(minutesToDays(organisation, asset.timeSpent).toFixed(2))
      }
      if (state.isAssetEstimation) {
        assetLine.push(minutesToDays(organisation, asset.estimation).toFixed(2))
      }
      state.assetValidationColumns
        .forEach(validationColumn => {
          const task =
            rootGetters.taskMap.get(asset.validations.get(validationColumn))
          if (task) {
            assetLine.push(task.task_status_short_name)
          } else {
            assetLine.push('')
          }
        })
      return assetLine
    })
    return lines
  },

  changeAssetSort ({ commit, rootGetters }, sortInfo) {
    const taskStatusMap = rootGetters.taskStatus
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const production = rootGetters.currentProduction
    const persons = rootGetters.people
    const sorting = sortInfo ? [sortInfo] : []
    commit(CHANGE_ASSET_SORT, {
      taskStatusMap, taskTypeMap, taskMap, production, persons, sorting
    })
  },

  deleteAllAssetTasks (
    { dispatch }, { projectId, taskTypeId, selectionOnly }
  ) {
    let taskIds = []
    if (selectionOnly) {
      taskIds = cache.result
        .filter(a => a.validations.get(taskTypeId))
        .map(a => a.validations.get(taskTypeId))
    }
    return dispatch('deleteAllTasks', { projectId, taskTypeId, taskIds })
  },

  setAssetSelection ({ commit }, { asset, selected }) {
    commit(SET_ASSET_SELECTION, { asset, selected })
  },

  clearSelectedAssets ({ commit }) {
    commit(CLEAR_SELECTED_ASSETS)
  },

  deleteSelectedAssets ({ state, dispatch }) {
    return new Promise((resolve, reject) => {
      let selectedAssetIds = [...state.selectedAssets.values()].filter(asset => !asset.canceled).map(asset => asset.id)
      if (selectedAssetIds.length === 0) {
        selectedAssetIds = [...state.selectedAssets.keys()]
      }
      async.eachSeries(selectedAssetIds, (assetId, next) => {
        const asset = state.assetMap.get(assetId)
        if (asset) {
          dispatch('deleteAsset', asset)
        }
        next()
      }, (err) => {
        if (err) reject(err)
        else {
          resolve()
        }
      })
    })
  }
}

const mutations = {
  [CLEAR_ASSETS] (state) {
    cache.assets = []
    state.assetMap = new Map()
    cache.result = []
    state.assetValidationColumns = []

    cache.assetIndex = {}
    state.displayedAssets = []
    state.assetFilledColumns = {}
    helpers.setListStats(state, [])
    state.assetSearchQueries = []

    state.selectedAssets = new Map()
  },

  [LOAD_ASSETS_START] (state) {
    cache.assets = []
    cache.result = []
    state.assetMap = new Map()
    state.isAssetsLoading = true
    state.isAssetsLoadingError = false
    state.assetValidationColumns = []

    cache.assetIndex = {}
    state.displayedAssets = []
    state.assetFilledColumns = {}
    helpers.setListStats(state, [])
    state.assetSearchQueries = []

    state.selectedAssets = new Map()
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
    const assetTypeMap = new Map()
    let isTime = false
    let isEstimation = false
    let isDescription = false
    assets = sortAssets(assets)
    cache.assets = assets
    cache.result = assets
    cache.assetIndex = buildAssetIndex(assets)
    state.assetMap = new Map()

    assets.forEach(asset => {
      helpers.populateAndRegisterAsset(
        assetTypeMap,
        taskMap,
        taskTypeMap,
        personMap,
        production,
        validationColumns,
        asset
      )
      state.assetMap.set(asset.id, asset)
      if (!isTime && asset.timeSpent > 0) isTime = true
      if (!isEstimation && asset.estimation > 0) isEstimation = true
      if (!isDescription && asset.description) isDescription = true
    })

    const assetTypes = Array.from(assetTypeMap.values())
    cache.assetTypeIndex = buildNameIndex(assetTypes)
    const displayedAssets = cache.assets.slice(0, PAGE_SIZE)
    const filledColumns = getFilledColumns(displayedAssets)

    state.assetValidationColumns = helpers.sortValidationColumns(
      Object.values(validationColumns),
      filledColumns,
      taskTypeMap
    )
    state.isAssetTime = isTime
    state.isAssetEstimation = isEstimation
    state.isAssetDescription = isDescription

    state.isAssetsLoading = false
    state.isAssetsLoadingError = false
    state.nbValidationColumns = state.assetValidationColumns.length

    state.displayedAssets = displayedAssets
    helpers.setListStats(state, cache.assets)

    state.assetFilledColumns = filledColumns

    state.assetTypes = assetTypes
    state.displayedAssetTypes = assetTypes
    state.displayedAssetTypesLength = assetTypes.length

    const maxX = state.displayedAssets.length
    const maxY = state.nbValidationColumns
    state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)

    if (userFilters.asset && userFilters.asset[production.id]) {
      state.assetSearchQueries = userFilters.asset[production.id]
    } else {
      state.assetSearchQueries = []
    }
  },

  [ADD_ASSET] (state, {
    taskTypeMap,
    taskMap,
    personMap,
    production,
    asset
  }) {
    asset.tasks = sortTasks(asset.tasks, taskTypeMap)
    asset.validations = new Map()
    asset.production_id = asset.project_id
    asset.episode_id = asset.source_id
    helpers.populateAndRegisterAsset(
      new Map(),
      taskMap,
      taskTypeMap,
      personMap,
      production,
      {},
      asset
    )
    cache.assets.push(asset)
    cache.assets = sortAssets(cache.assets)
    state.assetMap.set(asset.id, asset)

    state.displayedAssets.push(asset)
    state.displayedAssets = sortAssets(state.displayedAssets)
    helpers.setListStats(state, cache.assets)
    state.assetFilledColumns = getFilledColumns(state.displayedAssets)

    const maxX = state.displayedAssets.length
    const maxY = state.nbValidationColumns
    state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
    state.assetMap.set(asset.id, asset)

    cache.assetIndex = buildAssetIndex(cache.assets)
  },

  [UPDATE_ASSET] (state, asset) {
    Object.assign(state.assetMap.get(asset.id), asset)
    cache.assetIndex = buildAssetIndex(cache.assets)
  },

  [REMOVE_ASSET] (state, assetToDelete) {
    if (state.assetMap.get(assetToDelete.id)) {
      state.assetMap.delete(assetToDelete.id)
      cache.assets = removeModelFromList(cache.assets, assetToDelete)
      state.displayedAssets =
        removeModelFromList(state.displayedAssets, assetToDelete)
      if (assetToDelete.timeSpent) {
        state.displayedAssetsTimeSpent -= assetToDelete.timeSpent
      }
      if (assetToDelete.estimation) {
        state.displayedAssetsEstimation -= assetToDelete.estimation
      }
      state.assetFilledColumns = getFilledColumns(state.displayedAssets)
      helpers.setListStats(state, cache.assets)
      cache.assetIndex = buildAssetIndex(cache.assets)
    }
  },

  [ASSET_CSV_FILE_SELECTED] (state, formData) {
    state.assetsCsvFormData = formData
  },
  [IMPORT_ASSETS_START] (state) {},
  [IMPORT_ASSETS_END] (state) {
    state.assetsCsvFormData = null
  },

  [EDIT_ASSET_END] (state, { newAsset, assetTypeMap }) {
    state.assetCreated = newAsset.name
    const asset = state.assetMap.get(newAsset.id)
    const assetType = assetTypeMap.get(newAsset.entity_type_id)
    if (assetType) {
      newAsset.asset_type_name = assetType.name
      newAsset.asset_type_id = assetType.id
    }

    newAsset.tasks = []
    if (asset) {
      newAsset.episode_id = newAsset.source_id
      delete newAsset.tasks
      Object.assign(asset, newAsset)
    } else {
      newAsset.validations = new Map()
      newAsset.production_id = newAsset.project_id
      newAsset.episode_id = newAsset.source_id
      cache.assets.push(newAsset)
      cache.assets = sortAssets(cache.assets)
      state.displayedAssets.push(newAsset)
      state.assetFilledColumns = getFilledColumns(state.displayedAssets)
      state.displayedAssetsLength = cache.assets.length

      const maxX = state.displayedAssets.length
      const maxY = state.nbValidationColumns
      state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
      state.assetMap.set(newAsset.id, newAsset)
    }
    if (newAsset.description && !state.isAssetDescription) {
      state.isAssetDescription = true
    }
    cache.assetIndex = buildAssetIndex(cache.assets)
  },

  [CANCEL_ASSET] (state, asset) {
    asset.canceled = true
  },

  [RESTORE_ASSET_END] (state, assetToRestore) {
    const asset = state.assetMap.get(assetToRestore.id)
    asset.canceled = false
    cache.assetIndex = buildAssetIndex(cache.assets)
  },

  [DELETE_TASK_END] (state, task) {
    const asset = state.displayedAssets.find(
      (asset) => asset.id === task.entity_id
    )
    if (asset) {
      const validations = new Map(asset.validations)
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

  [SET_ASSET_SEARCH] (state, payload) {
    payload.sorting = state.assetSorting
    helpers.buildResult(state, payload)
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
    const assets = cache.result
    const newLength = state.displayedAssets.length + PAGE_SIZE
    if (newLength < assets.length + PAGE_SIZE) {
      state.displayedAssets = assets.slice(
        0,
        state.displayedAssets.length + PAGE_SIZE
      )
      state.assetFilledColumns = getFilledColumns(state.displayedAssets)
      const previousX = Object.keys(state.assetSelectionGrid).length
      const maxX = state.displayedAssets.length
      const maxY = state.nbValidationColumns
      if (previousX >= 0) {
        state.assetSelectionGrid = appendSelectionGrid(
          state.assetSelectionGrid, previousX, maxX, maxY
        )
      }
    }
  },

  [SET_CURRENT_PRODUCTION] (state, production) {
    state.assetSearchText = ''
  },

  [SET_PREVIEW] (state, { entityId, taskId, previewId, taskMap }) {
    const asset = state.assetMap.get(entityId)
    if (asset) {
      asset.preview_file_id = previewId
      asset.tasks.forEach(taskId => {
        const task = taskMap.get(taskId)
        if (task) task.entity.preview_file_id = previewId
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
      state.selectedAssets = new Map() // unselect all previously selected lines
    }
  },

  [ADD_SELECTED_TASKS] (state, selection) {
    let tmpGrid = JSON.parse(JSON.stringify(state.assetSelectionGrid))
    selection.forEach((validationInfo) => {
      if (!tmpGrid[validationInfo.x]) {
        tmpGrid = appendSelectionGrid(
          tmpGrid,
          Object.keys(tmpGrid).length,
          validationInfo.x + 1,
          state.nbValidationColumns
        )
      }
      if (tmpGrid[validationInfo.x]) {
        tmpGrid[validationInfo.x][validationInfo.y] = true
      }
    })
    state.selectedAssets = new Map() // unselect all previously selected lines
    state.assetSelectionGrid = tmpGrid
  },

  [CLEAR_SELECTED_TASKS] (state, validationInfo) {
    const tmpGrid = JSON.parse(JSON.stringify(state.assetSelectionGrid))
    state.assetSelectionGrid = clearSelectionGrid(tmpGrid)
  },

  [NEW_TASK_END] (state, task) {
    const asset = state.assetMap.get(task.entity_id)
    if (asset && task) {
      task = helpers.populateTask(task, asset)
      // Add Column if it is missing
      if (!state.assetValidationColumns.includes(task.task_type_id)) {
        state.assetValidationColumns.push(task.task_type_id)
        state.assetFilledColumns[task.task_type_id] = true
      }
      // Push task and readds the whole map to activate the realtime display.
      asset.tasks.push(task.id)
      if (!asset.validations) asset.validations = new Map()
      asset.validations.set(task.task_type_id, task.id)
      Vue.set(asset, 'validations', new Map(asset.validations))
    }
  },

  [CREATE_TASKS_END] (state, tasks) {
    tasks.forEach(task => {
      if (task) {
        const asset = state.assetMap.get(task.entity_id)
        if (asset) {
          if (!asset.validations) asset.validations = new Map()
          asset.validations.set(task.task_type_id, task.id)
          Vue.set(asset, 'validations', new Map(asset.validations))
        }
      }
    })
  },

  [SET_ASSET_TYPE_SEARCH] (state, searchQuery) {
    const keywords = getKeyWords(searchQuery)
    const result =
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

  [CHANGE_ASSET_SORT] (state, {
    taskStatusMap, taskTypeMap, taskMap, production, persons, sorting
  }) {
    const assetSearch = state.assetSearchText
    state.assetSorting = sorting
    helpers.buildResult(state, {
      assetSearch,
      taskStatusMap,
      taskTypeMap,
      taskMap,
      production,
      persons,
      sorting
    })
  },

  [UPDATE_METADATA_DESCRIPTOR_END] (
    state, { descriptor, previousDescriptorFieldName }
  ) {
    if (descriptor.entity_type === 'Asset' && previousDescriptorFieldName) {
      cache.assets.forEach((asset) => {
        asset.data[descriptor.field_name] =
          asset.data[previousDescriptorFieldName]
        delete asset.data[previousDescriptorFieldName]
      })
    }
  },

  [LOCK_ASSET] (state, asset) {
    asset = state.assetMap.get(asset.id)
    asset.lock = true
  },

  [UNLOCK_ASSET] (state, asset) {
    asset = state.assetMap.get(asset.id)
    asset.lock = false
  },

  [RESET_ALL] (state) {
    cache.assets = []
    cache.assetIndex = {}
    cache.result = []

    Object.assign(state, { ...initialState })
  },

  [SET_ASSET_SELECTION] (state, { asset, selected }) {
    if (!selected && state.selectedAssets.has(asset.id)) {
      state.selectedAssets.delete(asset.id)
      state.selectedAssets = new Map(state.selectedAssets) // for reactivity
    }
    if (selected) {
      state.selectedAssets.set(asset.id, asset)
      state.selectedAssets = new Map(state.selectedAssets) // for reactivity
      const maxX = state.displayedAssets.length
      const maxY = state.nbValidationColumns
      // unselect previously selected tasks
      state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
    }
  },

  [CLEAR_SELECTED_ASSETS] (state) {
    state.selectedAssets = new Map()
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  cache
}
