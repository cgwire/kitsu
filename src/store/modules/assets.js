import moment from 'moment'

import assetsApi from '@/store/api/assets'
import peopleApi from '@/store/api/people'
import assetTypeStore from '@/store/modules/assettypes'
import tasksStore from '@/store/modules/tasks'
import taskStatusStore from '@/store/modules/taskstatus'
import taskTypesStore from '@/store/modules/tasktypes'
import productionsStore from '@/store/modules/productions'
import peopleStore from '@/store/modules/people'

import { getTaskTypePriorityOfProd } from '@/lib/productions'
import { minutesToDays } from '@/lib/time'

import func from '@/lib/func'

import { PAGE_SIZE } from '@/lib/pagination'
import {
  sortAssetResult,
  sortAssets,
  sortByName,
  sortTasks,
  sortValidationColumns
} from '@/lib/sorting'
import {
  appendSelectionGrid,
  buildSelectionGrid,
  clearSelectionGrid
} from '@/lib/selection'
import {
  getFilledColumns,
  groupEntitiesByParents,
  removeModelFromList
} from '@/lib/models'
import { computeStats } from '@/lib/stats'
import { buildAssetIndex, buildNameIndex, indexSearch } from '@/lib/indexing'
import { applyFilters, getKeyWords, getFilters } from '@/lib/filtering'

import {
  CLEAR_ASSETS,
  LOAD_ASSETS_START,
  LOAD_ASSETS_ERROR,
  LOAD_ASSETS_END,
  SORT_VALIDATION_COLUMNS,
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
  SET_SHARED_ASSET_SEARCH,
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
  SAVE_ASSET_SEARCH_FILTER_GROUP_END,
  REMOVE_ASSET_SEARCH_FILTER_GROUP_END,
  COMPUTE_ASSET_TYPE_STATS,
  UPDATE_METADATA_DESCRIPTOR_END,
  SET_CURRENT_EPISODE,
  CHANGE_ASSET_SORT,
  LOCK_ASSET,
  UNLOCK_ASSET,
  RESET_ALL,
  CLEAR_SELECTED_ASSETS,
  SET_ASSET_SELECTION,
  LOAD_SHARED_ASSETS_END,
  LOAD_UNSHARED_ASSETS_END
} from '@/store/mutation-types'
import async from 'async'

const helpers = {
  getCurrentProduction() {
    return productionsStore.getters.currentProduction(productionsStore.state)
  },
  getTaskStatus(taskStatusId) {
    return taskStatusStore.cache.taskStatusMap.get(taskStatusId)
  },
  getTaskType(taskTypeId) {
    return taskTypesStore.cache.taskTypeMap.get(taskTypeId)
  },
  getTask(taskId) {
    return tasksStore.state.taskMap.get(taskId)
  },
  getPerson(personId) {
    return peopleStore.cache.personMap.get(personId)
  },

  setListStats(state, assets) {
    let timeSpent = 0
    let estimations = 0
    if (assets) {
      assets
        .filter(a => !a.canceled)
        .forEach(asset => {
          timeSpent += asset.timeSpent
          estimations += asset.estimation
        })
      Object.assign(state, {
        displayedAssetsLength: assets.filter(a => !a.canceled).length,
        displayedAssetsCount: assets.length,
        displayedAssetsTimeSpent: timeSpent,
        displayedAssetsEstimation: estimations
      })
    } else {
      Object.assign(state, {
        displayedAssetsLength: 0,
        displayedAssetsCount: 0,
        displayedAssetsTimeSpent: 0,
        displayedAssetsEstimation: 0
      })
    }
  },

  populateTask(task, asset, production) {
    if (!task || typeof task !== 'object') return
    task.name = getTaskTypePriorityOfProd(
      helpers.getTaskType(task.task_type_id),
      production || helpers.getCurrentProduction()
    ).toString()
    task.task_status_short_name = helpers.getTaskStatus(
      task.task_status_id
    ).short_name

    Object.assign(task, {
      project_id: asset.production_id,
      episode_id: asset.source_id,
      entity_name: `${asset.asset_type_name} / ${asset.name}`,
      entity_type_name: asset.asset_type_name,
      entity: {
        id: asset.id,
        name: asset.name,
        preview_file_id: asset.preview_file_id
      }
    })

    return task
  },

  populateAndRegisterAsset(
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
      const assetTypeId = asset.asset_type_id || asset.entity_type_id
      const assetType = {
        id: assetTypeId,
        name: asset.asset_type_name
      }
      assetTypeMap.set(assetTypeId, assetType)
    }
    asset.production_id = production.id
    asset.project_name = production.name
    asset.production_name = production.name

    const taskIds = []
    asset.tasks?.forEach(task => {
      if (typeof task === 'string') {
        task = taskMap.get(task)
      }
      if (!task) return
      task.data = asset.data || {}
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

  sortValidationColumns(validationColumns, assetFilledColumns, taskTypeMap) {
    const columns = [...validationColumns]
    return sortValidationColumns(
      columns,
      taskTypeMap,
      helpers.getCurrentProduction()
    )
  },

  buildResult(
    state,
    { assetSearch, production, sorting, taskStatusMap, taskTypeMap, persons }
  ) {
    const taskMap = tasksStore.state.taskMap
    const taskTypes = Array.from(taskTypeMap.values())
    const taskStatuses = Array.from(taskStatusMap.values())
    const query = assetSearch
    const keywords = getKeyWords(query) || []
    const filters = getFilters({
      entryIndex: cache.assetIndex,
      assetTypes: state.assetTypes,
      taskTypes,
      taskStatuses,
      descriptors: production?.descriptors || [],
      persons,
      query
    })
    let result = indexSearch(cache.assetIndex, keywords) || cache.assets
    result = applyFilters(result, filters, taskMap)
    result = sortAssetResult(result, sorting, taskTypeMap, taskMap)
    cache.result = result

    const limit =
      state.displayedAssets.length > PAGE_SIZE
        ? state.displayedAssets.length
        : PAGE_SIZE
    const displayedAssets = result.slice(0, limit)
    const maxX = displayedAssets.length
    const maxY = state.nbValidationColumns

    state.displayedAssets = displayedAssets
    state.assetFilledColumns = getFilledColumns(displayedAssets)
    helpers.setListStats(state, result)
    state.assetSearchText = query
    state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
  },

  buildResultForSharedAssets(state, { assetSearch }) {
    const query = assetSearch
    const keywords = getKeyWords(query) || []
    const result =
      indexSearch(cache.sharedAssetIndex, keywords) || state.sharedAssets
    state.sharedAssetSearchText = query
    state.displayedSharedAssets = result
  }
}

const cache = {
  assets: [],
  assetMap: new Map(),
  assetIndex: {},
  assetTypeIndex: {},
  result: [],
  sharedAssetIndex: {}
}

const initialState = {
  assetValidationColumns: [],
  nbValidationColumns: 0,

  filteredAssets: [],
  displayedAssets: [],
  displayedAssetsCount: 0,
  displayedAssetsLength: 0,
  displayedAssetsTimeSpent: 0,
  displayedAssetsEstimation: 0,
  assetFilledColumns: {},
  assetSearchText: '',
  assetSelectionGrid: {},
  assetSearchQueries: [],
  assetSearchFilterGroups: [],
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
  isAssetResolution: false,
  isAssetTime: false,
  assetsCsvFormData: null,

  assetCreated: '',
  personTasks: [],
  assetListScrollPosition: 0,

  selectedAssets: new Map(),

  displayedSharedAssets: [],
  sharedAssets: [],
  sharedAssetSearchText: '',
  unsharedAssets: []
}

const state = {
  ...initialState
}

const getters = {
  assets: state => cache.assets,
  assetMap: state => cache.assetMap,
  assetSearchText: state => state.assetSearchText,
  assetSearchQueries: state => state.assetSearchQueries,
  assetSearchFilterGroups: state => state.assetSearchFilterGroups,
  assetSelectionGrid: state => state.assetSelectionGrid,
  assetValidationColumns: state => state.assetValidationColumns,

  isAssetsLoading: state => state.isAssetsLoading,
  isAssetsLoadingError: state => state.isAssetsLoadingError,

  displayedAssets: state => state.displayedAssets,
  displayedAssetsCount: state => state.displayedAssetsCount,
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
    const activeAssets = state.displayedAssets.filter(a => !a.canceled)
    return groupEntitiesByParents(activeAssets, 'asset_type_name')
  },

  assetCreated: state => state.assetCreated,

  isAssetEstimation: state => state.isAssetEstimation,
  isAssetTime: state => state.isAssetTime,
  isAssetDescription: state => state.isAssetDescription,
  isAssetResolution: state => state.isAssetResolution,

  assetsCsvFormData: state => state.assetsCsvFormData,

  selectedAssets: state => state.selectedAssets,

  sharedAssets: state => state.sharedAssets,
  unsharedAssets: state => state.unsharedAssets,

  displayedSharedAssets: state => state.displayedSharedAssets,
  displayedSharedAssetsByType: state => {
    return groupEntitiesByParents(
      state.displayedSharedAssets,
      'asset_type_name'
    )
  },

  sharedAssetsByType: state => {
    return groupEntitiesByParents(state.sharedAssets, 'asset_type_name')
  }
}

const actions = {
  loadAssets(
    { commit, state, rootGetters },
    { all = false, withShared = true, withTasks = true } = {}
  ) {
    const assetTypeMap = rootGetters.assetTypeMap
    const production = rootGetters.currentProduction
    let episode = rootGetters.currentEpisode
    const isTVShow = rootGetters.isTVShow
    const userFilters = rootGetters.userFilters
    const userFilterGroups = rootGetters.userFilterGroups
    const personMap = rootGetters.personMap
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap

    if (isTVShow && !episode) {
      // If it's tv show and if we don't have any episode set,
      // we use the first one.
      episode = rootGetters.episodes.length > 0 ? rootGetters.episodes[0] : null
      if (!episode) {
        return []
      }
      commit(SET_CURRENT_EPISODE, episode.id)
    }

    if (isTVShow && !episode && !all) {
      return []
    }

    if (state.isAssetsLoading) {
      return []
    }

    if (all) {
      episode = null // Do not filter by episode
    }

    commit(LOAD_ASSETS_START)
    return assetsApi
      .getAssets(production, episode, withTasks)
      .then(async assets => {
        if (!withShared) {
          return assets
        }
        let sharedAssets = all
          ? await assetsApi.getSharedAssets()
          : await assetsApi.getUsedSharedAssets(production, episode)
        sharedAssets = sharedAssets
          .filter(asset => asset.project_id !== production.id)
          .map(asset => ({
            ...asset,
            shared: true
          }))
        return [...assets, ...sharedAssets]
      })
      .then(assets => {
        assets.forEach(asset => {
          if (!asset.asset_type_id) {
            asset.asset_type_id = asset.entity_type_id
            const assetType = assetTypeMap.get(asset.asset_type_id)
            asset.asset_type_name = assetType?.name || ''
          }
        })
        commit(LOAD_ASSETS_END, {
          production,
          assets,
          userFilters,
          userFilterGroups,
          personMap,
          taskMap,
          taskTypeMap
        })
        return assets
      })
      .catch(err => {
        console.error('an error occurred while loading assets', err)
        commit(LOAD_ASSETS_ERROR)
        return []
      })
  },

  getAsset({ commit, state, rootGetters }, assetId) {
    return assetsApi.getAsset(assetId)
  },

  /*
   * Function used mainly to reload asset information when a remote change
   * occurs.
   */
  loadAsset({ commit, state, rootGetters }, assetId) {
    const asset = cache.assetMap.get(assetId)
    if (asset?.lock) return

    const personMap = rootGetters.personMap
    const production = rootGetters.currentProduction
    const taskMap = rootGetters.taskMap
    const taskTypeMap = rootGetters.taskTypeMap
    return assetsApi
      .getAsset(assetId)
      .then(asset => {
        if (cache.assetMap.get(asset.id)) {
          commit(UPDATE_ASSET, asset)
        } else {
          asset.tasks.forEach(task => {
            commit(NEW_TASK_END, { task })
          })
          commit(ADD_ASSET, {
            asset,
            taskTypeMap,
            taskMap,
            personMap,
            production
          })
        }
        return Promise.resolve(asset)
      })
      .catch(console.error)
  },

  newAsset({ commit, dispatch, state, rootGetters }, data) {
    if (cache.assets.find(asset => asset.name === data.name)) {
      return Promise.reject(new Error('Asset already exists'))
    }
    return assetsApi.newAsset(data).then(asset => {
      const assetTypeMap = rootGetters.assetTypeMap
      const assetType = assetTypeMap.get(asset.entity_type_id)
      const workflow = assetType ? assetType.task_types || [] : []
      let taskTypeIds = rootGetters.productionAssetTaskTypeIds
      const sortInfo =
        state.assetSorting && state.assetSorting.length > 0
          ? state.assetSorting[0]
          : null
      // Add asset to the list
      commit(EDIT_ASSET_END, { newAsset: asset, assetTypeMap })
      // Sort list
      dispatch('changeAssetSort', sortInfo)
      // Creates tasks related to the asset type workflow
      if (workflow.length > 0) {
        taskTypeIds = taskTypeIds.filter(taskTypeId => {
          return workflow.includes(taskTypeId)
        })
      }
      const createTaskPromises = taskTypeIds.map(taskTypeId => {
        dispatch('createTask', {
          entityId: asset.id,
          projectId: asset.project_id,
          taskTypeId,
          type: 'assets'
        })
      })
      return func
        .runPromiseAsSeries(createTaskPromises)
        .then(() => Promise.resolve(asset))
        .catch(console.error)
    })
  },

  editAsset({ commit, state, rootState }, data) {
    const existingAsset =
      data.name &&
      cache.assets.find(asset => {
        return asset.name === data.name && data.id !== asset.id
      })
    if (existingAsset) {
      return Promise.reject(new Error('Asset already exists'))
    }
    const assetTypeMap = assetTypeStore.cache.assetTypeMap
    commit(LOCK_ASSET, data)
    commit(EDIT_ASSET_END, { newAsset: data, assetTypeMap })
    return assetsApi.updateAsset(data).finally(() => {
      setTimeout(() => {
        commit(UNLOCK_ASSET, data)
      }, 2000)
    })
  },

  deleteAsset({ commit, state }, asset) {
    return assetsApi.deleteAsset(asset).then(() => {
      const previousAsset = cache.assetMap.get(asset.id)
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

  restoreAsset({ commit, state }, asset) {
    return assetsApi.restoreAsset(asset).then(() => {
      commit(RESTORE_ASSET_END, asset)
      return Promise.resolve(asset)
    })
  },

  shareAssets({}, { production, assetType, assetIds }) {
    return assetsApi.shareAssets(production, assetType, assetIds)
  },

  unshareAssets({}, { assetIds }) {
    return assetsApi.shareAssets(null, null, assetIds, false)
  },

  uploadAssetFile({ commit, state }, toUpdate) {
    const production = helpers.getCurrentProduction()
    commit(IMPORT_ASSETS_START)
    return assetsApi
      .postCsv(production, state.assetsCsvFormData, toUpdate)
      .then(() => {
        commit(IMPORT_ASSETS_END)
        Promise.resolve()
      })
  },

  setAssetSearch({ commit, state, rootGetters }, assetSearch) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const production = rootGetters.currentProduction
    const persons = rootGetters.people
    commit(SET_ASSET_SEARCH, {
      assetSearch,
      taskMap,
      taskStatusMap,
      taskTypeMap,
      persons,
      production
    })
  },

  setSharedAssetSearch({ commit }, assetSearch) {
    commit(SET_SHARED_ASSET_SEARCH, { assetSearch })
  },

  saveAssetSearch({ commit, state, rootGetters }, searchQuery) {
    if (state.assetSearchQueries.some(query => query.name === searchQuery)) {
      return
    }
    const production = rootGetters.currentProduction
    return peopleApi
      .createFilter('asset', searchQuery, searchQuery, production.id, null)
      .then(searchQuery => {
        commit(SAVE_ASSET_SEARCH_END, { searchQuery, production })
        return searchQuery
      })
  },

  saveAssetSearchFilterGroup({ commit, state, rootGetters }, filterGroup) {
    const groupExist = state.assetSearchFilterGroups.some(
      query => query.name === filterGroup.name
    )
    if (groupExist) {
      return
    }

    const production = rootGetters.currentProduction
    return peopleApi
      .createFilterGroup(
        'asset',
        filterGroup.name,
        filterGroup.color,
        production.id,
        filterGroup.is_shared,
        filterGroup.department_id
      )
      .then(filterGroup => {
        commit(SAVE_ASSET_SEARCH_FILTER_GROUP_END, { filterGroup, production })
        return filterGroup
      })
  },

  removeAssetSearch({ commit, rootGetters }, searchQuery) {
    const production = rootGetters.currentProduction
    return peopleApi.removeFilter(searchQuery).then(() => {
      commit(REMOVE_ASSET_SEARCH_END, { searchQuery, production })
    })
  },

  removeAssetSearchFilterGroup({ commit, rootGetters }, filterGroup) {
    const production = rootGetters.currentProduction
    return peopleApi.removeFilterGroup(filterGroup).then(() => {
      commit(REMOVE_ASSET_SEARCH_FILTER_GROUP_END, { filterGroup, production })
    })
  },

  displayMoreAssets({ commit, rootGetters }) {
    commit(DISPLAY_MORE_ASSETS, {
      taskTypeMap: rootGetters.taskTypeMap,
      taskStatusMap: rootGetters.taskStatusMap,
      taskMap: rootGetters.taskMap,
      production: rootGetters.currentProduction
    })
  },

  initAssetTypes({ dispatch }) {
    dispatch('setLastProductionScreen', 'production-asset-types')
    return dispatch('loadAssets').then(() => {
      dispatch('computeAssetTypeStats')
      return Promise.resolve()
    })
  },

  setAssetTypeListScrollPosition({ commit }) {
    commit(SET_PRODUCTION_ASSET_TYPE_LIST_SCROLL_POSITION)
  },

  computeAssetTypeStats({ commit, rootGetters }) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskMap = rootGetters.taskMap
    commit(COMPUTE_ASSET_TYPE_STATS, { taskStatusMap, taskMap })
  },

  setAssetTypeSearch({ commit }, searchQuery) {
    commit(SET_ASSET_TYPE_SEARCH, searchQuery)
  },

  getAssetsCsvLines({ state, rootGetters }) {
    const production = rootGetters.currentProduction
    const episodeMap = rootGetters.episodeMap
    const organisation = rootGetters.organisation
    const personMap = rootGetters.personMap
    const taskTypeMap = rootGetters.taskTypeMap
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
        asset.description,
        asset.ready_for !== 'None' ? taskTypeMap.get(asset.ready_for).name : ''
      ])
      asset.data = asset.data || {}
      sortByName([...production.descriptors])
        .filter(d => d.entity_type === 'Asset')
        .forEach(descriptor => {
          if (descriptor.data_type === 'boolean') {
            assetLine.push(
              asset.data[descriptor.field_name]?.toLowerCase() === 'true'
            )
          } else {
            assetLine.push(asset.data[descriptor.field_name])
          }
        })
      if (state.isAssetTime) {
        assetLine.push(minutesToDays(organisation, asset.timeSpent).toFixed(2))
      }
      if (state.isAssetEstimation) {
        assetLine.push(minutesToDays(organisation, asset.estimation).toFixed(2))
      }
      state.assetValidationColumns.forEach(validationColumn => {
        const task = rootGetters.taskMap.get(
          asset.validations.get(validationColumn)
        )
        if (task) {
          assetLine.push(task.task_status_short_name)
          assetLine.push(
            task.assignees.map(id => personMap.get(id).full_name).join(',')
          )
        } else {
          assetLine.push('') // Status
          assetLine.push('') // Assignation
        }
      })
      return assetLine
    })
    return lines
  },

  changeAssetSort({ commit, rootGetters }, sortInfo) {
    const taskStatusMap = rootGetters.taskStatus
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const production = rootGetters.currentProduction
    const persons = rootGetters.people
    const sorting = sortInfo ? [sortInfo] : []
    commit(CHANGE_ASSET_SORT, {
      taskStatusMap,
      taskTypeMap,
      taskMap,
      production,
      persons,
      sorting
    })
  },

  deleteAllAssetTasks({ dispatch }, { projectId, taskTypeId, selectionOnly }) {
    let taskIds = []
    if (selectionOnly) {
      taskIds = cache.result
        .filter(a => a.validations.get(taskTypeId))
        .map(a => a.validations.get(taskTypeId))
    }
    return dispatch('deleteAllTasks', { projectId, taskTypeId, taskIds })
  },

  setAssetSelection({ commit }, { asset, selected }) {
    commit(SET_ASSET_SELECTION, { asset, selected })
  },

  clearSelectedAssets({ commit }) {
    commit(CLEAR_SELECTED_ASSETS)
  },

  deleteSelectedAssets({ state, dispatch }) {
    return new Promise((resolve, reject) => {
      let selectedAssetIds = [...state.selectedAssets.values()]
        .filter(asset => !asset.canceled)
        .map(asset => asset.id)
      if (selectedAssetIds.length === 0) {
        selectedAssetIds = [...state.selectedAssets.keys()]
      }
      async.eachSeries(
        selectedAssetIds,
        (assetId, next) => {
          const asset = cache.assetMap.get(assetId)
          if (asset) {
            dispatch('deleteAsset', asset)
          }
          next()
        },
        err => {
          if (err) reject(err)
          else {
            resolve()
          }
        }
      )
    })
  },

  async loadSharedAssets({ commit, rootGetters }, { production }) {
    try {
      const assets = await assetsApi.getSharedAssets(production)
      const productionMap = rootGetters.productionMap
      const assetTypeMap = rootGetters.assetTypeMap
      commit(LOAD_SHARED_ASSETS_END, { assets, productionMap, assetTypeMap })
    } catch (err) {
      console.error(err)
      throw err
    }
  },

  async loadUnsharedAssets({ commit, rootGetters }, { production }) {
    try {
      const assets = await assetsApi.getSharedAssets(production, false)
      const productionMap = rootGetters.productionMap
      const assetTypeMap = rootGetters.assetTypeMap
      commit(LOAD_UNSHARED_ASSETS_END, { assets, productionMap, assetTypeMap })
    } catch (err) {
      console.error(err)
      throw err
    }
  },

  async getPendingAssets({ commit }, daily = false) {
    const assets = []
    cache.assets.forEach(asset => {
      let isPending = false
      asset.tasks.forEach(taskId => {
        const task = tasksStore.state.taskMap.get(taskId)
        if (!isPending) {
          const taskStatus = helpers.getTaskStatus(task.task_status_id)
          if (daily) {
            if (task.last_comment_date) {
              const lastCommentDate = moment(task.last_comment_date)
              const yesterday = moment().subtract(1, 'days')
              isPending =
                taskStatus.is_feedback_request &&
                lastCommentDate.isAfter(yesterday)
            }
          } else {
            isPending = taskStatus.is_feedback_request
          }
        }
      })
      if (isPending) assets.push(asset)
    })
    return assets
  }
}

const mutations = {
  [CLEAR_ASSETS](state) {
    cache.assets = []
    cache.result = []
    cache.assetMap = new Map()
    state.assetValidationColumns = []

    cache.assetIndex = {}
    state.displayedAssets = []
    state.assetFilledColumns = {}
    helpers.setListStats(state, [])
    state.assetSearchQueries = []
    state.assetSearchFilterGroups = []

    state.selectedAssets = new Map()
  },

  [LOAD_ASSETS_START](state) {
    cache.assets = []
    cache.result = []
    cache.assetMap = new Map()
    state.isAssetsLoading = true
    state.isAssetsLoadingError = false
    state.assetValidationColumns = []

    cache.assetIndex = {}
    state.displayedAssets = []
    state.assetFilledColumns = {}
    helpers.setListStats(state, [])
    state.assetSearchQueries = []
    state.assetSearchFilterGroups = []

    state.selectedAssets = new Map()
  },

  [LOAD_ASSETS_ERROR](state) {
    state.isAssetsLoading = false
    state.isAssetsLoadingError = true
  },

  [LOAD_ASSETS_END](
    state,
    {
      production,
      assets,
      userFilters,
      userFilterGroups,
      personMap,
      taskMap,
      taskTypeMap
    }
  ) {
    const validationColumns = {}
    const assetTypeMap = new Map()
    let isTime = false
    let isEstimation = false
    let isDescription = false
    let isResolution = false
    assets = sortAssets(assets)
    cache.assets = assets
    cache.result = assets
    cache.assetIndex = buildAssetIndex(assets)
    cache.assetMap = new Map()

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
      cache.assetMap.set(asset.id, asset)
      if (!isTime && asset.timeSpent > 0) isTime = true
      if (!isEstimation && asset.estimation > 0) isEstimation = true
      if (!isDescription && asset.description) isDescription = true
      if (!isResolution && asset.data?.resolution) isResolution = true
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
    state.isAssetResolution = isResolution

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

    state.assetSearchQueries = userFilters.asset?.[production.id] || []

    state.assetSearchFilterGroups =
      userFilterGroups?.asset?.[production.id] || []
  },

  [LOAD_SHARED_ASSETS_END](state, { assets, productionMap, assetTypeMap }) {
    assets.forEach(asset => {
      asset.production = productionMap.get(asset.project_id)
      asset.assetType = assetTypeMap.get(asset.entity_type_id)
      asset.asset_type_name = asset.assetType?.name
      asset.full_name = `${asset.asset_type_name} / ${asset.name}`
    })
    assets = sortAssets(assets)
    state.sharedAssets = assets
    cache.sharedAssetIndex = buildAssetIndex(state.sharedAssets)
    helpers.buildResultForSharedAssets(state, {
      assetSearch: state.sharedAssetSearchText
    })
  },

  [LOAD_UNSHARED_ASSETS_END](state, { assets, productionMap, assetTypeMap }) {
    assets.forEach(asset => {
      asset.production = productionMap.get(asset.project_id)
      asset.assetType = assetTypeMap.get(asset.entity_type_id)
      asset.asset_type_name = asset.assetType?.name
      asset.full_name = `${asset.asset_type_name} / ${asset.name}`
    })
    assets = sortAssets(assets)
    state.unsharedAssets = assets
  },

  [ADD_ASSET](state, { taskTypeMap, taskMap, personMap, production, asset }) {
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

    state.displayedAssets.push(asset)
    state.displayedAssets = sortAssets(state.displayedAssets)
    helpers.setListStats(state, cache.assets)
    state.assetFilledColumns = getFilledColumns(state.displayedAssets)

    const maxX = state.displayedAssets.length
    const maxY = state.nbValidationColumns
    state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
    cache.assetMap.set(asset.id, asset)

    cache.assetIndex = buildAssetIndex(cache.assets)
  },

  [UPDATE_ASSET](state, asset) {
    Object.assign(cache.assetMap.get(asset.id), asset)
    cache.assetIndex = buildAssetIndex(cache.assets)
  },

  [REMOVE_ASSET](state, assetToDelete) {
    if (cache.assetMap.get(assetToDelete.id)) {
      cache.assetMap.delete(assetToDelete.id)
      cache.assets = removeModelFromList(cache.assets, assetToDelete)
      state.displayedAssets = removeModelFromList(
        state.displayedAssets,
        assetToDelete
      )
      if (assetToDelete.timeSpent && !assetToDelete.canceled) {
        state.displayedAssetsTimeSpent -= assetToDelete.timeSpent
      }
      if (assetToDelete.estimation && !assetToDelete.canceled) {
        state.displayedAssetsEstimation -= assetToDelete.estimation
      }
      state.assetFilledColumns = getFilledColumns(state.displayedAssets)
      helpers.setListStats(state, cache.assets)
      cache.assetIndex = buildAssetIndex(cache.assets)
    }
  },

  [ASSET_CSV_FILE_SELECTED](state, formData) {
    state.assetsCsvFormData = formData
  },
  [IMPORT_ASSETS_START](state) {},
  [IMPORT_ASSETS_END](state) {
    state.assetsCsvFormData = null
  },

  [EDIT_ASSET_END](state, { newAsset, assetTypeMap }) {
    state.assetCreated = newAsset.name
    const asset = cache.assetMap.get(newAsset.id)
    const assetType = assetTypeMap.get(newAsset.entity_type_id)
    if (assetType) {
      newAsset.asset_type_name = assetType.name
      newAsset.asset_type_id = assetType.id
    }

    newAsset.tasks = []
    if (asset) {
      if (newAsset.source_id) newAsset.episode_id = newAsset.source_id
      delete newAsset.tasks
      const copyNewAsset = { ...newAsset }
      copyNewAsset.data = { ...asset.data, ...newAsset.data }
      Object.assign(asset, copyNewAsset)
      state.displayedAssets = state.displayedAssets.map(stateAsset => {
        if (stateAsset.id === newAsset.id) {
          return { ...asset }
        }
        return stateAsset
      })
    } else {
      newAsset.validations = new Map()
      newAsset.tasks = []
      newAsset.production_id = newAsset.project_id
      newAsset.episode_id = newAsset.source_id
      cache.assets.push(newAsset)
      cache.assets = sortAssets(cache.assets)
      state.displayedAssets.push(newAsset)
      state.assetFilledColumns = getFilledColumns(state.displayedAssets)
      state.displayedAssetsLength = cache.assets.filter(a => !a.canceled).length
      state.displayedAssetsCount = cache.assets.length

      const maxX = state.displayedAssets.length
      const maxY = state.nbValidationColumns
      state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
      cache.assetMap.set(newAsset.id, newAsset)
    }
    if (newAsset.description && !state.isAssetDescription) {
      state.isAssetDescription = true
    }
    cache.assetIndex = buildAssetIndex(cache.assets)
  },

  [CANCEL_ASSET](state, asset) {
    asset.canceled = true
    state.displayedAssetsLength = cache.result.filter(a => !a.canceled).length
  },

  [RESTORE_ASSET_END](state, assetToRestore) {
    const asset = cache.assetMap.get(assetToRestore.id)
    asset.canceled = false
    cache.assetIndex = buildAssetIndex(cache.assets)
    state.displayedAssetsLength = cache.result.filter(a => !a.canceled).length
  },

  [DELETE_TASK_END](state, task) {
    const asset = state.displayedAssets.find(
      asset => asset.id === task.entity_id
    )
    if (asset) {
      const validations = new Map(asset.validations)
      delete asset.validations
      asset.validations = validations

      const tasks = JSON.parse(JSON.stringify(asset.tasks))
      const taskIndex = tasks.findIndex(assetTaskId => assetTaskId === task.id)
      tasks.splice(taskIndex, 1)
      asset.tasks = tasks
    }
  },

  [NEW_TASK_COMMENT_END](state, { comment, taskId }) {},

  [SET_ASSET_SEARCH](state, payload) {
    payload.sorting = state.assetSorting
    helpers.buildResult(state, payload)
  },

  [SET_SHARED_ASSET_SEARCH](state, { assetSearch }) {
    helpers.buildResultForSharedAssets(state, { assetSearch })
  },

  [SAVE_ASSET_SEARCH_END](state, { searchQuery }) {
    if (!state.assetSearchQueries.includes(searchQuery)) {
      state.assetSearchQueries.push(searchQuery)
      state.assetSearchQueries = sortByName(state.assetSearchQueries)
    }
  },

  [SAVE_ASSET_SEARCH_FILTER_GROUP_END](state, { filterGroup }) {
    if (!state.assetSearchFilterGroups.includes(filterGroup)) {
      state.assetSearchFilterGroups.push(filterGroup)
      state.assetSearchFilterGroups = sortByName(state.assetSearchFilterGroups)
    }
  },

  [REMOVE_ASSET_SEARCH_END](state, { searchQuery }) {
    const queryIndex = state.assetSearchQueries.findIndex(
      query => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.assetSearchQueries.splice(queryIndex, 1)
    }
  },

  [REMOVE_ASSET_SEARCH_FILTER_GROUP_END](state, { filterGroup }) {
    const groupIndex = state.assetSearchFilterGroups.findIndex(
      query => query.name === filterGroup.name
    )
    if (groupIndex >= 0) {
      state.assetSearchFilterGroups.splice(groupIndex, 1)
    }
  },

  [DISPLAY_MORE_ASSETS](state) {
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
          state.assetSelectionGrid,
          previousX,
          maxX,
          maxY
        )
      }
    }
  },

  [SET_CURRENT_PRODUCTION](state) {
    state.assetSearchText = ''
  },

  [SET_PREVIEW](state, { entityId, previewId, taskMap }) {
    const asset = state.displayedAssets.find(a => a.id === entityId)
    if (asset) {
      asset.preview_file_id = previewId
      const task = asset.tasks.find(taskId => taskMap.get(taskId))
      if (task && task.entity) task.entity.preview_file_id = previewId
    }
  },

  [SET_ASSET_LIST_SCROLL_POSITION](state, scrollPosition) {
    state.assetListScrollPosition = scrollPosition
  },

  [SET_PRODUCTION_ASSET_TYPE_LIST_SCROLL_POSITION](state, scrollPosition) {
    state.assetTypeListScrollPosition = scrollPosition
  },

  [REMOVE_SELECTED_TASK](state, validationInfo) {
    if (
      !validationInfo.x &&
      validationInfo.task?.column &&
      cache.assetMap.get(validationInfo.task.entity.id)
    ) {
      const entity = validationInfo.task.entity
      const taskType = validationInfo.task.column
      const list = state.displayedAssets.flat()
      validationInfo.x = list.findIndex(e => e.id === entity.id)
      validationInfo.y = state.assetValidationColumns.indexOf(taskType.id)
    }
    if (
      state.assetSelectionGrid[0] &&
      state.assetSelectionGrid[validationInfo.x]
    ) {
      state.assetSelectionGrid[validationInfo.x][validationInfo.y] = false
    }
  },

  [ADD_SELECTED_TASK](state, validationInfo) {
    if (
      state.assetSelectionGrid[0] &&
      state.assetSelectionGrid[validationInfo.x]
    ) {
      state.assetSelectionGrid[validationInfo.x][validationInfo.y] = true
      state.selectedAssets = new Map() // unselect all previously selected lines
    }
  },

  [ADD_SELECTED_TASKS](state, selection) {
    let tmpGrid = JSON.parse(JSON.stringify(state.assetSelectionGrid))
    selection.forEach(validationInfo => {
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

  [CLEAR_SELECTED_TASKS](state, validationInfo) {
    if (
      tasksStore.state.nbSelectedValidations > 0 ||
      tasksStore.state.nbSelectedTasks > 0
    ) {
      const tmpGrid = JSON.parse(JSON.stringify(state.assetSelectionGrid))
      state.assetSelectionGrid = clearSelectionGrid(tmpGrid)
    }
  },

  [NEW_TASK_END](state, { task }) {
    const asset = cache.assetMap.get(task.entity_id)
    if (asset && task) {
      task = helpers.populateTask(task, asset)
      // Add Column if it is missing
      if (!state.assetValidationColumns.includes(task.task_type_id)) {
        state.assetValidationColumns.push(task.task_type_id)
        state.assetFilledColumns[task.task_type_id] = true
      }
      // Push task and readds the whole map to activate the realtime display.
      const displayedAsset = state.displayedAssets.find(
        asset => asset.id === task.entity_id
      )
      if (!asset.validations) asset.validations = new Map()
      asset.validations.set(task.task_type_id, task.id)
      if (displayedAsset) {
        displayedAsset.validations = new Map(asset.validations)
      }
    }
  },

  [CREATE_TASKS_END](state, { tasks }) {
    tasks.forEach(task => {
      if (task) {
        const asset = cache.assetMap.get(task.entity_id)
        const displayedAsset = state.displayedAssets.find(
          a => a.id === task.entity_id
        )
        if (asset) {
          if (!asset.validations) asset.validations = new Map()
          helpers.populateTask(task, asset)
          asset.validations.set(task.task_type_id, task.id)
          if (displayedAsset) {
            displayedAsset.validations = new Map(asset.validations)
          }
        }
      }
    })
  },

  [SET_ASSET_TYPE_SEARCH](state, searchQuery) {
    const keywords = getKeyWords(searchQuery)
    const result =
      indexSearch(cache.assetTypeIndex, keywords) || state.assetTypes

    Object.assign(state, {
      displayedAssetTypes: result,
      displayedAssetTypesLength: result ? result.length : 0,
      assetTypeSearchText: searchQuery
    })
  },

  [COMPUTE_ASSET_TYPE_STATS](state, { taskStatusMap, taskMap }) {
    state.assetTypeStats = computeStats(
      cache.assets,
      'asset_type_id',
      taskStatusMap,
      taskMap
    )
  },

  [CHANGE_ASSET_SORT](
    state,
    { taskStatusMap, taskTypeMap, taskMap, production, persons, sorting }
  ) {
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

  [UPDATE_METADATA_DESCRIPTOR_END](
    state,
    { descriptor, previousDescriptorFieldName }
  ) {
    if (
      descriptor.entity_type === 'Asset' &&
      previousDescriptorFieldName &&
      previousDescriptorFieldName !== descriptor.field_name
    ) {
      cache.assets.forEach(asset => {
        const data = { ...asset.data }
        data[descriptor.field_name] = data[previousDescriptorFieldName]
        delete data[previousDescriptorFieldName]
        asset.data = data
      })
    }
  },

  [LOCK_ASSET](state, asset) {
    asset = cache.assetMap.get(asset.id)
    if (asset) {
      asset.lock = !asset.lock ? 1 : asset.lock + 1
    }
  },

  [UNLOCK_ASSET](state, asset) {
    asset = cache.assetMap.get(asset.id)
    if (asset) {
      asset.lock = !asset.lock ? 0 : asset.lock - 1
    }
  },

  [RESET_ALL](state) {
    cache.assets = []
    cache.assetIndex = {}
    cache.result = []

    Object.assign(state, { ...initialState })
  },

  [SET_ASSET_SELECTION](state, { asset, selected }) {
    if (!selected && state.selectedAssets.has(asset.id)) {
      state.selectedAssets.delete(asset.id)
    }
    if (selected) {
      state.selectedAssets.set(asset.id, asset)
      const maxX = state.displayedAssets.length
      const maxY = state.nbValidationColumns
      // unselect previously selected tasks
      state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
    }
  },

  [SORT_VALIDATION_COLUMNS](state, taskTypeMap) {
    const columns = [...state.assetValidationColumns]
    state.assetValidationColumns = helpers.sortValidationColumns(
      columns,
      state.assetFilledColumns,
      taskTypeMap
    )
  },

  [CLEAR_SELECTED_ASSETS](state) {
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
