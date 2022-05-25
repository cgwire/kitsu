import store from '@/store/modules/assets'
import taskTypesStore from '@/store/modules/tasktypes'
import tasksStore from '@/store/modules/tasks'
import productionsStore from '@/store/modules/productions'
import {
  ADD_ASSET,
  CANCEL_ASSET,
  CHANGE_ASSET_SORT,
  COMPUTE_ASSET_TYPE_STATS,
  DISPLAY_MORE_ASSETS,
  EDIT_ASSET_END,
  IMPORT_ASSETS_END,
  IMPORT_ASSETS_START,
  LOAD_ASSETS_END,
  LOAD_ASSETS_START,
  LOCK_ASSET,
  REMOVE_ASSET,
  REMOVE_ASSET_SEARCH_END, SET_ASSET_TYPE_SEARCH,
  RESTORE_ASSET_END,
  SAVE_ASSET_SEARCH_END,
  SET_ASSET_SEARCH,
  SET_PRODUCTION_ASSET_TYPE_LIST_SCROLL_POSITION,
  UPDATE_ASSET
} from '@/store/mutation-types'

import assetsApi from '../../../src/store/api/assets'
import peopleApi from '../../../src/store/api/people'

describe('Assets store', () => {
  describe('Getters', () => {
    test('assets', () => {
      store.cache.assets = '123'
      expect(store.getters.assets(null)).toEqual('123')
    })

    test('assetMap', () => {
      const state = {
        assetMap: '123'
      }
      expect(store.getters.assetMap(state)).toEqual('123')
    })

    test('assetSearchText', () => {
      const state = {
        assetSearchText: '123'
      }
      expect(store.getters.assetSearchText(state)).toEqual('123')
    })

    test('assetSearchQueries', () => {
      const state = {
        assetSearchQueries: '123'
      }
      expect(store.getters.assetSearchQueries(state)).toEqual('123')
    })

    test('assetSelectionGrid', () => {
      const state = {
        assetSelectionGrid: '123'
      }
      expect(store.getters.assetSelectionGrid(state)).toEqual('123')
    })

    test('assetValidationColumns', () => {
      const state = {
        assetValidationColumns: '123'
      }
      expect(store.getters.assetValidationColumns(state)).toEqual('123')
    })

    test('isAssetsLoading', () => {
      const state = {
        isAssetsLoading: true
      }
      expect(store.getters.isAssetsLoading(state)).toBeTruthy()
    })

    test('isAssetsLoadingError', () => {
      const state = {
        isAssetsLoadingError: true
      }
      expect(store.getters.isAssetsLoadingError(state)).toBeTruthy()
    })

    test('displayedAssets', () => {
      const state = {
        displayedAssets: '123'
      }
      expect(store.getters.displayedAssets(state)).toEqual('123')
    })

    test('displayedAssetsLength', () => {
      const state = {
        displayedAssetsLength: 123
      }
      expect(store.getters.displayedAssetsLength(state)).toEqual(123)
    })

    test('displayedAssetsTimeSpent', () => {
      const state = {
        displayedAssetsTimeSpent: 123
      }
      expect(store.getters.displayedAssetsTimeSpent(state)).toEqual(123)
    })

    test('displayedAssetsEstimation', () => {
      const state = {
        displayedAssetsEstimation: 123
      }
      expect(store.getters.displayedAssetsEstimation(state)).toEqual(123)
    })

    test('assetFilledColumns', () => {
      const state = {
        assetFilledColumns: 123
      }
      expect(store.getters.assetFilledColumns(state)).toEqual(123)
    })

    test('displayedAssetTypes', () => {
      const state = {
        displayedAssetTypes: '123'
      }
      expect(store.getters.displayedAssetTypes(state)).toEqual('123')
    })

    test('displayedAssetTypesLength', () => {
      const state = {
        displayedAssetTypesLength: 123
      }
      expect(store.getters.displayedAssetTypesLength(state)).toEqual(123)
    })

    test('assetTypeSearchText', () => {
      const state = {
        assetTypeSearchText: '123'
      }
      expect(store.getters.assetTypeSearchText(state)).toEqual('123')
    })

    test('assetTypeStats', () => {
      const state = {
        assetTypeStats: '123'
      }
      expect(store.getters.assetTypeStats(state)).toEqual('123')
    })

    test('assetTypeListScrollPosition', () => {
      const state = {
        assetTypeListScrollPosition: 123
      }
      expect(store.getters.assetTypeListScrollPosition(state)).toEqual(123)
    })

    test('assetSorting', () => {
      const state = {
        assetSorting: 123
      }
      expect(store.getters.assetSorting(state)).toEqual(123)
    })

    test('assetListScrollPosition', () => {
      const state = {
        assetListScrollPosition: 123
      }
      expect(store.getters.assetListScrollPosition(state)).toEqual(123)
    })

    test('displayedAssetsByType', () => {
      const state = {
        displayedAssets: [
          { id: 123, asset_type_name: 'test' },
          { id: 345, asset_type_name: 'test' },
          { id: 234, asset_type_name: 'test2' },
          { id: 456, asset_type_name: 'test2' }
        ]
      }
      expect(store.getters.displayedAssetsByType(state)).toEqual([
        [
          { id: 123, asset_type_name: 'test' },
          { id: 345, asset_type_name: 'test' }
        ],
        [
          { id: 234, asset_type_name: 'test2' },
          { id: 456, asset_type_name: 'test2' }
        ]
      ])
    })

    test('assetsByType', () => {
      const state = {
        displayedAssets: [
          { id: 123, asset_type_name: 'test', canceled: true },
          { id: 234, asset_type_name: 'test2' },
          { id: 456, asset_type_name: 'test2' },
          { id: 345, asset_type_name: 'test' }
        ]
      }
      expect(store.getters.assetsByType(state)).toEqual([
        [
          { id: 234, asset_type_name: 'test2' },
          { id: 456, asset_type_name: 'test2' }
        ],
        [
          { id: 345, asset_type_name: 'test' }
        ]
      ])
    })

    test('assetCreated', () => {
      const state = {
        assetCreated: '123'
      }
      expect(store.getters.assetCreated(state)).toEqual('123')
    })

    test('assetsCsvFormData', () => {
      const state = {
        assetsCsvFormData: '123'
      }
      expect(store.getters.assetsCsvFormData(state)).toEqual('123')
    })

    test('isAssetEstimation', () => {
      const state = {
        isAssetEstimation: true
      }
      expect(store.getters.isAssetEstimation(state)).toBeTruthy()
    })

    test('isAssetTime', () => {
      const state = {
        isAssetTime: true
      }
      expect(store.getters.isAssetTime(state)).toBeTruthy()
    })

    test('isAssetDescription', () => {
      const state = {
        isAssetDescription: true
      }
      expect(store.getters.isAssetDescription(state)).toBeTruthy()
    })
  })

  describe('Actions', () => {
    beforeEach(() => {
      store.cache.assets = []
    })

    test('loadAssets', async () => {
      let mockCommit = jest.fn()
      const state = {
        episode: null,
        isAssetsLoading: true
      }
      const rootGetters = {
        currentProduction: 1,
        userFilters: 2,
        personMap: 3,
        currentEpisode: 4,
        isTVShow: true,
        taskTypeMap: 5,
        taskMap: 6
      }
      const res1 = await store.actions.loadAssets(
        { commit: mockCommit, state, rootGetters })
      expect(res1).toEqual([])
      state.episode = {
        id: 123
      }
      const res2 = await store.actions.loadAssets(
        { commit: mockCommit, state, rootGetters })
      expect(res2).toEqual([])
      state.isAssetsLoading = false
      const assets = [{ id: 456, type: 'asset' }]
      assetsApi.getAssets = jest.fn(() => Promise.resolve(assets))
      mockCommit = jest.fn()
      const res3 = await store.actions.loadAssets(
        { commit: mockCommit, state, rootGetters })
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, LOAD_ASSETS_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, LOAD_ASSETS_END, {
        production: 1,
        assets,
        userFilters: 2,
        personMap: 3,
        taskMap: 6,
        taskTypeMap: 5
      })
      expect(res3).toEqual(assets)

      /*
      mockCommit = jest.fn()
      assetsApi.getAssets = jest.fn(() => Promise.reject(new Error('error')))
      const res5 = await store.actions.loadAssets(
        { commit: mockCommit, state, rootGetters }, true)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, LOAD_ASSETS_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, LOAD_ASSETS_ERROR)
      expect(res5).toEqual([])
      */
    })

    test('loadAsset', async () => {
      const rootGetters = {
        currentProduction: 1,
        personMap: 3,
        taskTypeMap: 5,
        taskMap: 6
      }
      const state = {
        assetMap: new Map()
      }
      let mockCommit = jest.fn()
      assetsApi.getAsset = jest.fn(() => Promise.resolve({ id: 1 }))
      await store.actions.loadAsset(
        { commit: mockCommit, state, rootGetters }, 1)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, ADD_ASSET, {
        asset: { id: 1 },
        taskTypeMap: 5,
        taskMap: 6,
        personMap: 3,
        production: 1
      })

      mockCommit = jest.fn()
      assetsApi.getAsset = jest.fn(() => Promise.resolve({ id: 1 }))
      state.assetMap.set(1, { id: 1 })
      await store.actions.loadAsset(
        { commit: mockCommit, state, rootGetters }, 1)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, UPDATE_ASSET, { id: 1 })

      mockCommit = jest.fn()
      state.assetMap.get(1).lock = true
      await store.actions.loadAsset(
        { commit: mockCommit, state, rootGetters }, 1)
      expect(mockCommit).toBeCalledTimes(0)
    })

    test('newAsset', async () => {
      const rootGetters = {
        assetTypeMap: 1,
        productionAssetTaskTypeIds: [
          1, 2
        ]
      }
      const state = {}
      const mockCommit = jest.fn()
      const mockDispatch = jest.fn()
      const asset = { id: 1, name: 'assetTest', project_id: 3 }
      assetsApi.newAsset = jest.fn(() => Promise.resolve(asset))
      const res = await store.actions.newAsset(
        { commit: mockCommit, state, rootGetters, dispatch: mockDispatch }, 1)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(
        1, EDIT_ASSET_END, { newAsset: asset, assetTypeMap: 1 })
      expect(mockDispatch).toBeCalledTimes(3)
      expect(mockDispatch).toHaveBeenNthCalledWith(2, 'createTask', {
        entityId: 1,
        projectId: 3,
        taskTypeId: 1,
        type: 'assets'
      })
      expect(mockDispatch).toHaveBeenNthCalledWith(3, 'createTask', {
        entityId: 1,
        projectId: 3,
        taskTypeId: 2,
        type: 'assets'
      })
      expect(res).toEqual(asset)
    })

    test('editAsset', async () => {
      const rootState = {
        assetTypes: {
          assetTypeMap: 1
        }
      }
      const mockCommit = jest.fn()
      const asset = { id: 1, name: 'assetTest', project_id: 3 }
      assetsApi.updateAsset = jest.fn(() => Promise.resolve(asset))
      const res = await store.actions.editAsset(
        { commit: mockCommit, state: {}, rootState }, asset)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, LOCK_ASSET, asset)
      expect(mockCommit).toHaveBeenNthCalledWith(
        2, EDIT_ASSET_END, { newAsset: asset, assetTypeMap: 1 })
      expect(res).toEqual(asset)
    })

    test('deleteAsset', async () => {
      const state = {
        assetMap: new Map()
      }
      let mockCommit = jest.fn()
      const asset = {
        id: 1,
        name: 'assetTest',
        project_id: 3,
        tasks: [{ id: 2 }],
        canceled: false
      }
      state.assetMap.set(1, asset)
      assetsApi.deleteAsset = jest.fn(() => Promise.resolve(asset))
      const res1 = await store.actions.deleteAsset({ commit: mockCommit, state }, asset)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, CANCEL_ASSET, asset)
      expect(res1).toEqual(asset)

      asset.canceled = true
      mockCommit = jest.fn()
      assetsApi.deleteAsset = jest.fn(() => Promise.resolve(asset))
      const res2 = await store.actions.deleteAsset(
        { commit: mockCommit, state }, asset)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, REMOVE_ASSET, asset)
      expect(res2).toEqual(asset)
    })

    test('restoreAsset', async () => {
      const mockCommit = jest.fn()
      const asset = { id: 1, name: 'assetTest' }
      assetsApi.restoreAsset = jest.fn(() => Promise.resolve(asset))
      const res1 = await store.actions.restoreAsset(
        { commit: mockCommit, state: {} }, asset)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, RESTORE_ASSET_END, asset)
      expect(res1).toEqual(asset)
    })

    test('uploadAssetFile', async () => {
      const mockCommit = jest.fn()
      const asset = { id: 1, name: 'assetTest' }
      assetsApi.postCsv = jest.fn(() => Promise.resolve())
      await store.actions.uploadAssetFile(
        { commit: mockCommit, state: {} }, asset)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, IMPORT_ASSETS_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, IMPORT_ASSETS_END)
    })

    test('setAssetSearch', async () => {
      const rootGetters = {
        taskStatusMap: 1,
        taskTypeMap: 2,
        taskMap: 3,
        currentProduction: 4,
        people: 5
      }

      const mockCommit = jest.fn()
      await store.actions.setAssetSearch(
        { commit: mockCommit, state: {}, rootGetters }, 6)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, SET_ASSET_SEARCH, {
        assetSearch: 6,
        taskMap: 3,
        taskStatusMap: 1,
        taskTypeMap: 2,
        persons: 5,
        production: 4
      })
    })

    test('saveAssetSearch', async () => {
      const rootGetters = {
        currentProduction: 4
      }
      const state = {
        assetSearchQueries: [{
          name: 'test'
        }]
      }

      let mockCommit = jest.fn()
      peopleApi.createFilter = jest.fn(
        (listType, name, query, productionId, entityType, callback) => {
          callback(null, query)
        }
      )
      await store.actions.saveAssetSearch(
        { commit: mockCommit, state, rootGetters }, 'name')
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, SAVE_ASSET_SEARCH_END, {
        production: 4,
        searchQuery: 'name'
      })
      expect(peopleApi.createFilter).toBeCalledTimes(1)

      mockCommit = jest.fn()
      peopleApi.createFilter = jest.fn()
      state.assetSearchQueries.push({
        name: 'name'
      })
      expect(peopleApi.createFilter).toBeCalledTimes(0)
      expect(mockCommit).toBeCalledTimes(0)
    })

    test('removeAssetSearch', async () => {
      const rootGetters = {
        currentProduction: 4
      }

      const mockCommit = jest.fn()
      peopleApi.removeFilter = jest.fn(
        (searchQuery) => {
          return Promise.resolve()
        }
      )
      await store.actions.removeAssetSearch(
        { commit: mockCommit, rootGetters }, 'name')
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, REMOVE_ASSET_SEARCH_END, {
        production: 4,
        searchQuery: 'name'
      })
      expect(peopleApi.removeFilter).toBeCalledTimes(1)
      expect(peopleApi.removeFilter).toHaveBeenNthCalledWith(1, 'name')
    })

    test('displayMoreAssets', () => {
      const mockCommit = jest.fn()
      const rootGetters = {
        taskTypeMap: 1,
        taskStatusMap: 2,
        taskMap: 3,
        currentProduction: 4
      }
      store.actions.displayMoreAssets({ commit: mockCommit, rootGetters })
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, DISPLAY_MORE_ASSETS, {
        taskTypeMap: 1,
        taskStatusMap: 2,
        taskMap: 3,
        production: 4
      })
    })

    test('initAssetTypes', async () => {
      const dispatch = jest.fn(() => Promise.resolve())
      await store.actions.initAssetTypes({ dispatch })
      expect(dispatch).toBeCalledTimes(3)
      expect(dispatch).toHaveBeenNthCalledWith(
        1, 'setLastProductionScreen', 'production-asset-types')
      expect(dispatch).toHaveBeenNthCalledWith(
        2, 'loadAssets')
      expect(dispatch).toHaveBeenNthCalledWith(
        3, 'computeAssetTypeStats')
    })

    test('setAssetTypeListScrollPosition', () => {
      const mockCommit = jest.fn()
      store.actions.setAssetTypeListScrollPosition({ commit: mockCommit })
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(
        1, SET_PRODUCTION_ASSET_TYPE_LIST_SCROLL_POSITION)
    })

    test('computeAssetTypeStats', () => {
      const mockCommit = jest.fn()
      const rootGetters = {
        taskStatusMap: 1,
        taskMap: 2
      }
      store.actions.computeAssetTypeStats({ commit: mockCommit, rootGetters })
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, COMPUTE_ASSET_TYPE_STATS, {
        taskStatusMap: 1,
        taskMap: 2
      })
    })

    test('setAssetTypeSearch', () => {
      const mockCommit = jest.fn()
      store.actions.setAssetTypeSearch({ commit: mockCommit }, 'searchQuery')
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(
        1, SET_ASSET_TYPE_SEARCH, 'searchQuery')
    })

    test('getAssetsCsvLines', () => {
      const state = {
        isAssetTime: true,
        isAssetEstimation: true,
        assetValidationColumns: ['existing-validation-id', 'unexisting-id']
      }
      const rootGetters = {
        currentProduction: {
          descriptors: [{
            name: 'descriptor2',
            field_name: 'descriptor2',
            entity_type: 'Asset'
          }, {
            name: 'descriptor1',
            field_name: 'descriptor1',
            entity_type: 'Asset'
          }, {
            name: 'descriptor3',
            field_name: 'descriptor3',
            entity_type: 'Shot'
          }]
        },
        episodeMap: new Map(Object.entries({
          'episode-id': { name: 'MP2' }
        })),
        organisation: {
          hours_by_day: 8
        },
        isTVShow: true,
        personMap: new Map(Object.entries({
          'person-1': { full_name: 'Jhon Doe' }
        })),
        taskMap: new Map(Object.entries({
          'task-id-1': {
            task_status_short_name: 'shortName1',
            assignees: ['person-1']
          }
        })),
        taskTypeMap: new Map(Object.entries({
          'task-type-1': {
            name: 'task-type-1-name'
          }
        }))
      }
      store.cache.assets = [{
        validations: new Map(Object.entries({
          'existing-validation-id': 'task-id-1'
        })),
        episode_id: 'episode-id',
        asset_type_name: 'asset_type_name',
        name: 'name',
        description: 'description',
        ready_for: 'task-type-1',
        data: {
          descriptor1: 'descriptor1',
          descriptor2: 'descriptor2'
        },
        timeSpent: 1000,
        estimation: 2000
      },
      {
        validations: new Map(Object.entries({
          'existing-validation-id': 'task-id-2'
        })),
        episode_id: 'episode-id',
        asset_type_name: 'asset_type_name2',
        name: 'name2',
        description: 'description2',
        ready_for: 'task-type-1',
        data: {
          descriptor1: 'descriptor4',
          descriptor2: 'descriptor5'
        },
        timeSpent: 2000,
        estimation: 4000
      }]
      const lines = store.actions.getAssetsCsvLines({ state, rootGetters })
      expect(lines).toHaveLength(2)
      expect(lines[0]).toEqual([
        'MP2',
        'asset_type_name',
        'name',
        'description',
        'task-type-1-name',
        'descriptor1',
        'descriptor2',
        '2.08',
        '4.17',
        'shortName1',
        'Jhon Doe',
        '',
        ''
      ])
      expect(lines[1]).toEqual([
        'MP2',
        'asset_type_name2',
        'name2',
        'description2',
        'task-type-1-name',
        'descriptor4',
        'descriptor5',
        '4.17',
        '8.33',
        '',
        '',
        '',
        ''
      ])
    })

    test('changeAssetSort', () => {
      const mockCommit = jest.fn()
      const rootGetters = {
        taskTypeMap: 1,
        taskStatus: 2,
        taskMap: 3,
        currentProduction: 4,
        people: 5
      }
      store.actions.changeAssetSort({ commit: mockCommit, rootGetters })
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, CHANGE_ASSET_SORT, {
        taskTypeMap: 1,
        taskStatusMap: 2,
        taskMap: 3,
        production: 4,
        persons: 5,
        sorting: []
      })
    })

    test('deleteAllAssetTasks', () => {
      const dispatch = jest.fn()
      const projectId = 1
      const taskTypeId = '2'
      const selectionOnly = true
      store.cache.result = [{
        validations: new Map(Object.entries({
          2: 5
        }))
      }]
      store.actions.deleteAllAssetTasks(
        { dispatch }, { projectId, taskTypeId, selectionOnly })
      expect(dispatch).toBeCalledTimes(1)
      expect(dispatch).toHaveBeenNthCalledWith(
        1, 'deleteAllTasks', { projectId, taskTypeId, taskIds: [5] })
    })

    test('deleteSelectedAssets', async () => {
      const dispatch = jest.fn()
      const asset = {
        id: 'asset-id',
        canceled: false
      }
      const state = {
        selectedAssets: new Map(Object.entries({
          'asset-id': asset
        })),
        assetMap: new Map(Object.entries({
          'asset-id': asset
        }))
      }
      await store.actions.deleteSelectedAssets({ state, dispatch })
      expect(dispatch).toBeCalledTimes(1)
      expect(dispatch).toHaveBeenNthCalledWith(1, 'deleteAsset', asset)
    })
  })

  describe('Mutations', () => {
    test('CLEAR_ASSETS', () => {
      store.cache.assets = 1
      store.cache.result = 1
      store.cache.assetIndex = 1
      const state = {
        assetMap: 1,
        assetValidationColumns: 1,
        displayedAssets: 1,
        assetFilledColumns: 1,
        assetSearchQueries: 1,
        displayedAssetsLength: 100,
        displayedAssetsTimeSpent: 1000,
        displayedAssetsEstimation: 1000
      }
      store.mutations.CLEAR_ASSETS(state)
      expect(store.cache.assets).toEqual([])
      expect(store.cache.result).toEqual([])
      expect(store.cache.assetIndex).toEqual({})
      expect(state).toEqual({
        assetMap: new Map(),
        assetValidationColumns: [],
        displayedAssets: [],
        assetFilledColumns: {},
        assetSearchQueries: [],
        displayedAssetsLength: 0,
        displayedAssetsTimeSpent: 0,
        displayedAssetsEstimation: 0,
        selectedAssets: new Map()
      })
    })

    test('LOAD_ASSETS_START', () => {
      store.cache.assets = 1
      store.cache.result = 1
      store.cache.assetIndex = 1
      const state = {
        isAssetsLoading: false,
        isAssetsLoadingError: true,
        assetMap: 1,
        assetValidationColumns: 1,
        displayedAssets: 1,
        assetFilledColumns: 1,
        assetSearchQueries: 1,
        displayedAssetsLength: 100,
        displayedAssetsTimeSpent: 1000,
        displayedAssetsEstimation: 1000
      }
      store.mutations.LOAD_ASSETS_START(state)
      expect(store.cache.assets).toEqual([])
      expect(store.cache.result).toEqual([])
      expect(store.cache.assetIndex).toEqual({})
      expect(state).toEqual({
        isAssetsLoading: true,
        isAssetsLoadingError: false,
        assetMap: new Map(),
        assetValidationColumns: [],
        displayedAssets: [],
        assetFilledColumns: {},
        assetSearchQueries: [],
        displayedAssetsLength: 0,
        displayedAssetsTimeSpent: 0,
        displayedAssetsEstimation: 0,
        selectedAssets: new Map()
      })
    })

    test('LOAD_ASSETS_ERROR', () => {
      const state = {
        isAssetsLoading: true,
        isAssetsLoadingError: false
      }
      store.mutations.LOAD_ASSETS_ERROR(state)
      expect(state).toEqual({
        isAssetsLoading: false,
        isAssetsLoadingError: true
      })
    })

    test('LOAD_ASSETS_END', () => {
      store.cache.assets = 1
      store.cache.result = 1
      store.cache.assetIndex = 1
      store.cache.assetTypeIndex = 1
      const state = {}
      const production = {
        id: '1',
        name: 'production'
      }
      const assets = [
        {
          id: '1',
          canceled: true,
          asset_type_name: 'assettypename2',
          name: 'name4',
          timeSpent: 1000,
          estimation: 2000,
          description: 'azerty',
          validations: new Map(Object.entries({ name: 'value' })),
          tasks: []
        },
        {
          id: '2',
          canceled: false,
          asset_type_name: 'assettypename2',
          name: 'name3',
          validations: new Map(),
          tasks: []
        },
        {
          id: '3',
          canceled: true,
          asset_type_name: 'assettypename1',
          name: 'name2',
          validations: new Map(),
          tasks: []
        },
        {
          id: '4',
          canceled: false,
          asset_type_name: 'assettypename2',
          name: 'name1',
          validations: new Map(),
          tasks: []
        }
      ]
      const userFilters = {
        asset: {
          1: 'assetSearchQueries'
        }
      }
      const personMap = new Map()
      const taskMap = new Map()
      const taskTypeMap = new Map()
      store.mutations.LOAD_ASSETS_END(state, {
        production,
        assets,
        userFilters,
        personMap,
        taskMap,
        taskTypeMap
      })
      expect(store.cache.assets).toEqual([
        {
          id: '4',
          canceled: false,
          asset_type_name: 'assettypename2',
          name: 'name1',
          validations: new Map(),
          tasks: [],
          estimation: 0,
          production_id: '1',
          production_name: 'production',
          project_name: 'production',
          timeSpent: 0
        },
        {
          id: '2',
          canceled: false,
          asset_type_name: 'assettypename2',
          name: 'name3',
          validations: new Map(),
          tasks: [],
          estimation: 0,
          production_id: '1',
          production_name: 'production',
          project_name: 'production',
          timeSpent: 0
        },
        {
          id: '3',
          canceled: true,
          asset_type_name: 'assettypename1',
          name: 'name2',
          validations: new Map(),
          tasks: [],
          estimation: 0,
          production_id: '1',
          production_name: 'production',
          project_name: 'production',
          timeSpent: 0
        },
        {
          id: '1',
          canceled: true,
          asset_type_name: 'assettypename2',
          name: 'name4',
          description: 'azerty',
          validations: new Map(),
          tasks: [],
          estimation: 0,
          production_id: '1',
          production_name: 'production',
          project_name: 'production',
          timeSpent: 0
        }
      ])
      expect(store.cache.result).toEqual(store.cache.assets)
      expect(Object.keys(store.cache.assetIndex)).toHaveLength(23)
      expect(Object.keys(store.cache.assetTypeIndex)).toHaveLength(14)
      expect(state).toEqual({
        isAssetsLoading: false,
        isAssetsLoadingError: false,
        isAssetTime: false,
        isAssetEstimation: false,
        isAssetDescription: true,
        assetValidationColumns: [],
        nbValidationColumns: 0,
        displayedAssets: store.cache.assets,
        assetFilledColumns: {},
        assetTypes: [
          {
            id: undefined,
            name: 'assettypename2'
          }
        ],
        displayedAssetTypes: [
          {
            id: undefined,
            name: 'assettypename2'
          }
        ],
        displayedAssetTypesLength: 1,
        assetSelectionGrid: {
          0: {},
          1: {},
          2: {},
          3: {}
        },
        displayedAssetsEstimation: 0,
        displayedAssetsLength: 4,
        displayedAssetsTimeSpent: 0,
        assetSearchQueries: 'assetSearchQueries',
        assetMap: new Map(Object.entries({
          4: {
            id: '4',
            canceled: false,
            asset_type_name: 'assettypename2',
            name: 'name1',
            validations: new Map(),
            tasks: [],
            estimation: 0,
            production_id: '1',
            production_name: 'production',
            project_name: 'production',
            timeSpent: 0
          },
          2: {
            id: '2',
            canceled: false,
            asset_type_name: 'assettypename2',
            name: 'name3',
            validations: new Map(),
            tasks: [],
            estimation: 0,
            production_id: '1',
            production_name: 'production',
            project_name: 'production',
            timeSpent: 0
          },
          3: {
            id: '3',
            canceled: true,
            asset_type_name: 'assettypename1',
            name: 'name2',
            validations: new Map(),
            tasks: [],
            estimation: 0,
            production_id: '1',
            production_name: 'production',
            project_name: 'production',
            timeSpent: 0
          },
          1: {
            id: '1',
            canceled: true,
            asset_type_name: 'assettypename2',
            name: 'name4',
            description: 'azerty',
            validations: new Map(),
            tasks: [],
            estimation: 0,
            production_id: '1',
            production_name: 'production',
            project_name: 'production',
            timeSpent: 0
          }
        }))
      })
    })

    test('ADD_ASSET', () => {
      store.cache.assets = []
      store.cache.result = []
      store.cache.assetIndex = new Map()
      const personMap = new Map(Object.entries({
        'person-id': {
          id: 'person-id',
          name: 'Some person'
        }
      }))
      productionsStore.state.currentProduction = {
        task_types_priority: {
          'task-type-id': 1
        }
      }
      const taskMap = new Map()
      const taskTypeMap = new Map(Object.entries({
        'task-type-id': {
          id: 'task-type-id',
          name: 'some type',
          priority: 1
        }
      }))
      taskTypesStore.state.taskTypeMap = taskTypeMap
      tasksStore.state.taskStatusMap = new Map(Object.entries({
        todo: {
          short_name: 'TODO',
          is_default: true
        }
      }))
      const state = {
        assetMap: new Map(),
        displayedAssets: []
      }
      const production = {
        id: '1',
        name: 'production'
      }
      const asset = {
        id: '1',
        canceled: true,
        asset_type_name: 'assettypename2',
        name: 'name4',
        timeSpent: 0,
        estimation: 0,
        description: 'azerty',
        validations: new Map(Object.entries({ name: 'value' })),
        tasks: [{
          id: 'task-id',
          assignees: ['person-id'],
          task_type_id: 'task-type-id',
          task_status_id: 'todo',
          duration: 100,
          estimation: 200
        }]
      }

      store.mutations.ADD_ASSET(state, {
        taskTypeMap,
        taskMap,
        personMap,
        production,
        asset
      })
      expect(asset).toEqual({
        id: '1',
        canceled: true,
        asset_type_name: 'assettypename2',
        name: 'name4',
        episode_id: undefined,
        full_name: 'assettypename2 / name4',
        production_id: '1',
        production_name: 'production',
        project_name: 'production',
        timeSpent: 100,
        estimation: 200,
        description: 'azerty',
        validations: new Map(Object.entries({ 'task-type-id': 'task-id' })),
        tasks: ['task-id']
      })
      expect(taskTypeMap).toEqual(new Map(Object.entries({
        'task-type-id': {
          id: 'task-type-id',
          name: 'some type',
          priority: 1
        }
      })))
      expect(taskMap).toEqual(new Map(Object.entries({
        'task-id': {
          assignees: [
            'person-id'
          ],
          duration: 100,
          entity: {
            id: '1',
            preview_file_id: undefined
          },
          entity_name: 'assettypename2 / name4',
          entity_type_name: 'assettypename2',
          episode_id: undefined,
          estimation: 200,
          id: 'task-id',
          name: '1',
          project_id: '1',
          task_status_id: 'todo',
          task_status_short_name: 'TODO',
          task_type_id: 'task-type-id'
        }
      })))
      expect(personMap).toEqual(new Map(Object.entries({
        'person-id': {
          id: 'person-id',
          name: 'Some person'
        }
      })))
      expect(state).toEqual({
        assetFilledColumns: {
          'task-type-id': true
        },
        assetMap: new Map(Object.entries({
          1: {
            asset_type_name: 'assettypename2',
            canceled: true,
            description: 'azerty',
            episode_id: undefined,
            estimation: 200,
            full_name: 'assettypename2 / name4',
            id: '1',
            name: 'name4',
            production_id: '1',
            production_name: 'production',
            project_name: 'production',
            tasks: [
              'task-id'
            ],
            timeSpent: 100,
            validations: new Map(Object.entries({
              'task-type-id': 'task-id'
            }))
          }
        })),
        assetSelectionGrid: {
          0: {}
        },
        displayedAssets: [
          {
            asset_type_name: 'assettypename2',
            canceled: true,
            description: 'azerty',
            episode_id: undefined,
            estimation: 200,
            full_name: 'assettypename2 / name4',
            id: '1',
            name: 'name4',
            production_id: '1',
            production_name: 'production',
            project_name: 'production',
            tasks: [
              'task-id'
            ],
            timeSpent: 100,
            validations: new Map(Object.entries({
              'task-type-id': 'task-id'
            }))
          }
        ],
        displayedAssetsEstimation: 200,
        displayedAssetsLength: 1,
        displayedAssetsTimeSpent: 100
      })
      expect(store.cache.assets).toEqual([{
        asset_type_name: 'assettypename2',
        canceled: true,
        description: 'azerty',
        episode_id: undefined,
        estimation: 200,
        full_name: 'assettypename2 / name4',
        id: '1',
        name: 'name4',
        production_id: '1',
        production_name: 'production',
        project_name: 'production',
        tasks: [
          'task-id'
        ],
        timeSpent: 100,
        validations: new Map(Object.entries({
          'task-type-id': 'task-id'
        }))
      }])
      expect(Object.keys(store.cache.assetIndex)).toHaveLength(19)
    })

    test('UPDATE_ASSET', () => {
      const asset = {
        id: '123',
        name: 'new asset'
      }
      const state = {
        assetMap: new Map(Object.entries({
          123: {
            id: '123',
            name: 'old asset'
          }
        }))
      }
      store.mutations.UPDATE_ASSET(state, asset)
      expect(state.assetMap.get('123').name).toEqual('new asset')
    })

    test('REMOVE_ASSET', () => {
      const assetToDelete = {
        id: 'asset-id',
        timeSpent: 100,
        estimation: 200
      }
      store.cache.assets = [assetToDelete]
      store.cache.assetIndex = null
      const state = {
        assetMap: new Map(Object.entries({
          'asset-id': assetToDelete
        })),
        displayedAssets: [assetToDelete],
        displayedAssetsTimeSpent: 100,
        displayedAssetsEstimation: 200,
        assetFilledColumns: null,
        displayedAssetsLength: 1
      }
      store.mutations.REMOVE_ASSET(state, assetToDelete)
      expect(state).toEqual({
        assetMap: new Map(),
        displayedAssets: [],
        displayedAssetsTimeSpent: 0,
        displayedAssetsEstimation: 0,
        assetFilledColumns: {},
        displayedAssetsLength: 0
      })
      expect(store.cache.assetIndex !== null).toBeTruthy()
      expect(store.cache.assets).toEqual([])
    })

    test('ASSET_CSV_FILE_SELECTED', () => {
      const state = {}
      store.mutations.ASSET_CSV_FILE_SELECTED(state, 'formData')
      expect(state.assetsCsvFormData).toEqual('formData')
    })

    test('IMPORT_ASSETS_END', () => {
      const state = {
        assetsCsvFormData: 'assetsCsvFormData'
      }
      store.mutations.IMPORT_ASSETS_END(state)
      expect(state.assetsCsvFormData).toBeNull()
    })

    test('EDIT_ASSET_END', () => {
      const newAsset = {
        entity_type_id: 'entity_type_id',
        id: '1',
        canceled: true,
        asset_type_name: 'assettypename2',
        name: 'name4',
        episode_id: undefined,
        full_name: 'assettypename2 / name4',
        production_id: '1',
        production_name: 'production',
        project_name: 'production',
        timeSpent: 100,
        estimation: 200,
        description: 'azerty',
        validations: new Map(Object.entries({ 'task-type-id': 'task-id' })),
        tasks: ['task-id']
      }
      const oldAsset = {
        entity_type_id: 'entity_type_id',
        id: '1',
        asset_type_name: 'assettypename2',
        name: 'name4',
        full_name: 'assettypename2 / name4',
        production_id: '1',
        production_name: 'production',
        project_name: 'production',
        description: 'azerty'
      }
      const state = {
        assetMap: new Map(Object.entries({
          1: oldAsset
        })),
        displayedAssets: [oldAsset]
      }
      store.cache.assets = [oldAsset]
      const assetTypeMap = new Map(Object.entries({
        entity_type_id: {
          name: 'entity name',
          id: 'entity id'
        }
      }))
      store.mutations.EDIT_ASSET_END(state, { newAsset, assetTypeMap })
      expect(newAsset).toEqual({
        id: '1',
        canceled: true,
        asset_type_name: 'entity name',
        asset_type_id: 'entity id',
        entity_type_id: 'entity_type_id',
        name: 'name4',
        episode_id: undefined,
        full_name: 'assettypename2 / name4',
        production_id: '1',
        production_name: 'production',
        project_name: 'production',
        timeSpent: 100,
        estimation: 200,
        description: 'azerty',
        validations: new Map(Object.entries({ 'task-type-id': 'task-id' }))
      })
      expect(state).toEqual({
        assetCreated: 'name4',
        assetMap: new Map(Object.entries({
          1: {
            asset_type_name: 'entity name',
            asset_type_id: 'entity id',
            entity_type_id: 'entity_type_id',
            canceled: true,
            description: 'azerty',
            episode_id: undefined,
            estimation: 200,
            full_name: 'assettypename2 / name4',
            id: '1',
            name: 'name4',
            production_id: '1',
            production_name: 'production',
            project_name: 'production',
            timeSpent: 100,
            validations: new Map(Object.entries({
              'task-type-id': 'task-id'
            })),
            data: {}
          }
        })),
        displayedAssets: [
          {
            asset_type_name: 'entity name',
            asset_type_id: 'entity id',
            entity_type_id: 'entity_type_id',
            canceled: true,
            description: 'azerty',
            episode_id: undefined,
            estimation: 200,
            full_name: 'assettypename2 / name4',
            id: '1',
            name: 'name4',
            production_id: '1',
            production_name: 'production',
            project_name: 'production',
            timeSpent: 100,
            validations: new Map(Object.entries({
              'task-type-id': 'task-id'
            })),
            data: {}
          }
        ],
        isAssetDescription: true
      })
      expect(store.cache.assets).toEqual([{
        asset_type_name: 'entity name',
        asset_type_id: 'entity id',
        entity_type_id: 'entity_type_id',
        canceled: true,
        description: 'azerty',
        episode_id: undefined,
        estimation: 200,
        full_name: 'assettypename2 / name4',
        id: '1',
        name: 'name4',
        production_id: '1',
        production_name: 'production',
        project_name: 'production',
        timeSpent: 100,
        validations: new Map(Object.entries({
          'task-type-id': 'task-id'
        })),
        data: {}
      }])
      expect(Object.keys(store.cache.assetIndex)).toHaveLength(11)
    })

    test('CANCEL_ASSET', () => {
      const asset = {}
      store.mutations.CANCEL_ASSET({}, asset)
      expect(asset.canceled).toBeTruthy()
    })

    test('RESTORE_ASSET_END', () => {
      const asset = {
        id: 'asset-id',
        canceled: true
      }
      const state = {
        assetMap: new Map(Object.entries({
          'asset-id': asset
        }))
      }
      store.cache.assetIndex = null
      store.mutations.RESTORE_ASSET_END(state, asset)
      expect(asset.canceled).toBeFalsy()
      expect(store.cache.assetIndex !== null).toBeTruthy()
    })

    test('DELETE_TASK_END', () => {
      const state = {
        displayedAssets: [{
          id: 'asset-id',
          validations: new Map(Object.entries({})),
          tasks: ['task-id1', 'task-id', 'task-id2']
        }]
      }
      const task = {
        id: 'task-id',
        entity_id: 'asset-id'
      }
      store.mutations.DELETE_TASK_END(state, task)
      expect(state).toEqual({
        displayedAssets: [{
          id: 'asset-id',
          validations: new Map(Object.entries({})),
          tasks: ['task-id1', 'task-id2']
        }]
      })
    })

    test('SET_ASSET_SEARCH', () => {
      const state = {
        assetSorting: { 123: 123 }
      }
      const payload = {
        sorting: 123,
        assetSearch: 'search',
        production: {},
        taskStatusMap: new Map(),
        taskTypeMap: new Map(),
        persons: new Map(),
        taskMap: new Map()
      }
      store.mutations.SET_ASSET_SEARCH(state, payload)
      expect(state).toEqual({
        assetFilledColumns: {},
        assetSearchText: 'search',
        assetSelectionGrid: {},
        assetSorting: {
          123: 123
        },
        displayedAssets: [],
        displayedAssetsEstimation: 0,
        displayedAssetsLength: 0,
        displayedAssetsTimeSpent: 0
      })
    })

    test('SAVE_ASSET_SEARCH_END', () => {
      const state = {
        assetSearchQueries: [{ name: 'test' }]
      }
      store.mutations.SAVE_ASSET_SEARCH_END(
        state, { searchQuery: { name: 'search' } })
      expect(state.assetSearchQueries).toEqual(
        [{ name: 'search' }, { name: 'test' }])
    })

    test('REMOVE_ASSET_SEARCH_END', () => {
      const state = {
        assetSearchQueries: [{ name: 'test' }]
      }
      store.mutations.REMOVE_ASSET_SEARCH_END(
        state,
        { searchQuery: { name: 'test' } }
      )
      expect(state.assetSearchQueries).toEqual([])
    })

    test('DISPLAY_MORE_ASSETS', () => {
      store.cache.result = [
        {
          id: 'asset-id',
          tasks: [{
            task_type_id: 'task-type-1'
          }]
        },
        {
          id: 'asset-id-2',
          tasks: [{
            task_type_id: 'task_type_id'
          }]
        }
      ]
      const state = {
        displayedAssets: [
          {
            id: 'asset-id'
          }
        ],
        assetSelectionGrid: {
          0: {}
        }
      }
      store.mutations.DISPLAY_MORE_ASSETS(state, {})
      expect(state).toEqual({
        displayedAssets: [
          {
            id: 'asset-id',
            tasks: [{
              task_type_id: 'task-type-1'
            }]
          },
          {
            id: 'asset-id-2',
            tasks: [{
              task_type_id: 'task_type_id'
            }]
          }
        ],
        assetFilledColumns: {
          task_type_id: true,
          'task-type-1': true
        },
        assetSelectionGrid: {
          0: {},
          1: {}
        }
      })
    })

    test('SET_CURRENT_PRODUCTION', () => {
      const state = {
        assetSearchText: 'test'
      }
      store.mutations.SET_CURRENT_PRODUCTION(state, null)
      expect(state.assetSearchText).toEqual('')
    })

    test('SET_PREVIEW', () => {
      const state = {
        assetMap: new Map(Object.entries({
          'asset-id': {
            tasks: ['task-id']
          }
        }))
      }
      const taskMap = new Map(Object.entries({
        'task-id': {
          entity: {}
        }
      }))
      store.mutations.SET_PREVIEW(state, {
        entityId: 'asset-id',
        taskId: 'task-id',
        previewId: 'preview-id',
        taskMap
      })
      expect(taskMap.get('task-id').entity.preview_file_id)
        .toEqual('preview-id')
      expect(state.assetMap.get('asset-id').preview_file_id)
        .toEqual('preview-id')
    })

    test('SET_ASSET_LIST_SCROLL_POSITION', () => {
      const state = {}
      store.mutations.SET_ASSET_LIST_SCROLL_POSITION(state, 12)
      expect(state.assetListScrollPosition).toEqual(12)
    })

    test('SET_PRODUCTION_ASSET_TYPE_LIST_SCROLL_POSITION', () => {
      const state = {}
      store.mutations.SET_PRODUCTION_ASSET_TYPE_LIST_SCROLL_POSITION(state, 12)
      expect(state.assetTypeListScrollPosition).toEqual(12)
    })

    test('REMOVE_SELECTED_TASK', () => {
      const state = {
        assetSelectionGrid: {}
      }
      state.assetSelectionGrid[0] = {}
      state.assetSelectionGrid[1] = {}
      state.assetSelectionGrid[1][1] = true
      const validationInfo = {
        x: 1,
        y: 1
      }
      store.mutations.REMOVE_SELECTED_TASK(state, validationInfo)
      expect(state.assetSelectionGrid[1][1]).toBeFalsy()
    })

    test('ADD_SELECTED_TASK', () => {
      const state = {
        assetSelectionGrid: {}
      }
      state.assetSelectionGrid[0] = {}
      state.assetSelectionGrid[1] = {}
      state.assetSelectionGrid[1][1] = false
      const validationInfo = {
        x: 1,
        y: 1
      }
      store.mutations.ADD_SELECTED_TASK(state, validationInfo)
      expect(state.assetSelectionGrid[1][1]).toBeTruthy()
    })

    test('ADD_SELECTED_TASKS', () => {
      const state = {
        assetSelectionGrid: {}
      }
      state.assetSelectionGrid[1] = {}
      state.assetSelectionGrid[1][1] = false
      const validationInfo = {
        x: 1,
        y: 1
      }
      store.mutations.ADD_SELECTED_TASKS(state, [validationInfo])
      expect(state.assetSelectionGrid[1][1]).toBeTruthy()
    })

    test('CLEAR_SELECTED_TASKS', () => {
      const state = {
        assetSelectionGrid: {}
      }
      state.assetSelectionGrid[0] = {}
      state.assetSelectionGrid[0][0] = true
      store.mutations.CLEAR_SELECTED_TASKS(state)
      expect(state.assetSelectionGrid[0][0]).toBeFalsy()
    })

    test('NEW_TASK_END', () => {
      const state = {
        assetMap: new Map(Object.entries({
          'asset-id': {
            tasks: ['old-task-id'],
            validations: new Map()
          }
        })),
        assetValidationColumns: [],
        assetFilledColumns: []
      }
      taskTypesStore.state.taskTypeMap = new Map(Object.entries({
        task_type_id: {
          priority: 1
        }
      }))
      tasksStore.state.taskStatusMap = new Map(Object.entries({
        todo: {
          short_name: 'TODO'
        }
      }))
      const task = {
        id: 'task-id',
        entity_id: 'asset-id',
        task_type_id: 'task_type_id',
        task_status_id: 'todo'
      }
      productionsStore.state.currentProduction = {
        task_types_priority: {
          'task-id': 1,
          'old-task-id': 2
        }
      }
      store.mutations.NEW_TASK_END(state, task)
      expect(state.assetMap.get('asset-id')).toEqual({
        tasks: ['old-task-id', 'task-id'],
        validations: new Map(Object.entries({
          task_type_id: 'task-id'
        }))
      })
      expect(task).toEqual({
        entity: {
          id: undefined,
          preview_file_id: undefined
        },
        entity_id: 'asset-id',
        entity_name: 'undefined / undefined',
        entity_type_name: undefined,
        episode_id: undefined,
        id: 'task-id',
        name: '1',
        project_id: undefined,
        task_status_id: 'todo',
        task_status_short_name: 'TODO',
        task_type_id: 'task_type_id'
      })
      expect(state.assetValidationColumns[0]).toEqual('task_type_id')
    })

    test('CREATE_TASKS_END', () => {
      const state = {
        assetMap: new Map(Object.entries({
          'asset-id': {
            validations: new Map()
          }
        }))
      }
      const tasks = [{
        entity_id: 'asset-id',
        task_type_id: 'task_type_id',
        id: 'task-id'
      }]
      store.mutations.CREATE_TASKS_END(state, tasks)
      expect(state.assetMap.get('asset-id').validations).toEqual(
        new Map(Object.entries({
          task_type_id: 'task-id'
        })))
    })

    test('SET_ASSET_TYPE_SEARCH', () => {
      const searchQuery = 'search'
      const state = {
        assetTypes: [123]
      }
      store.mutations.SET_ASSET_TYPE_SEARCH(state, searchQuery)
      expect(state).toEqual({
        assetTypes: [123],
        displayedAssetTypes: [],
        displayedAssetTypesLength: 0,
        assetTypeSearchText: 'search'
      })
    })

    test('COMPUTE_ASSET_TYPE_STATS', () => {
      store.cache.assets = [
        {
          asset_type_id: 'something',
          tasks: ['task-id'],
          nb_frames: 123
        }
      ]
      const state = {}
      const taskStatusMap = new Map(Object.entries({
        task_status_id: {
          id: 'task_status_id',
          short_name: 'todo',
          color: 'gray'
        }
      }))
      const taskMap = new Map(Object.entries({
        'task-id': {
          task_type_id: 'task_type_id',
          task_status_id: 'task_status_id'
        }
      }))
      store.mutations.COMPUTE_ASSET_TYPE_STATS(
        state, { taskStatusMap, taskMap })
      expect(state.assetTypeStats).toEqual({
        all: {
          all: {
            task_status_id: {
              color: 'gray',
              count: 1,
              frames: 123,
              name: 'todo'
            }
          },
          task_type_id: {
            task_status_id: {
              color: 'gray',
              count: 1,
              frames: 123,
              name: 'todo'
            }
          }
        },
        something: {
          all: {
            task_status_id: {
              color: 'gray',
              count: 1,
              frames: 123,
              name: 'todo'
            }
          },
          task_type_id: {
            task_status_id: {
              color: 'gray',
              count: 1,
              frames: 123,
              name: 'todo'
            }
          }
        }
      })
    })

    test('CHANGE_ASSET_SORT', () => {
      const state = {
        assetSorting: { 123: 123 },
        assetSearchText: 'search'
      }
      const payload = {
        sorting: { 123: 124 },
        assetSearch: 'search',
        production: {},
        taskStatusMap: new Map(),
        taskTypeMap: new Map(),
        persons: new Map(),
        taskMap: new Map()
      }
      store.mutations.CHANGE_ASSET_SORT(state, payload)
      expect(state).toEqual({
        assetFilledColumns: {},
        assetSearchText: 'search',
        assetSelectionGrid: {},
        assetSorting: {
          123: 124
        },
        displayedAssets: [],
        displayedAssetsEstimation: 0,
        displayedAssetsLength: 0,
        displayedAssetsTimeSpent: 0
      })
    })

    test('UPDATE_METADATA_DESCRIPTOR_END', () => {
      const state = {}
      const descriptor = {
        entity_type: 'Asset',
        field_name: 'new name'
      }
      const previousDescriptorFieldName = 'previous name'
      store.cache.assets = [
        {
          data: {
            'previous name': 123
          }
        }
      ]
      store.mutations.UPDATE_METADATA_DESCRIPTOR_END(
        state, { descriptor, previousDescriptorFieldName })
      expect(store.cache.assets[0]).toEqual({
        data: {
          'new name': 123
        }
      })
    })

    test('LOCK_ASSET', () => {
      const asset = {
        id: 'asset-id',
        lock: false
      }
      const state = {
        assetMap: new Map(Object.entries({
          'asset-id': asset
        }))
      }
      store.mutations.LOCK_ASSET(state, asset)
      expect(asset).toEqual({
        id: 'asset-id',
        lock: true
      })
    })

    test('UNLOCK_ASSET', () => {
      const asset = {
        id: 'asset-id',
        lock: true
      }
      const state = {
        assetMap: new Map(Object.entries({
          'asset-id': asset
        }))
      }
      store.mutations.UNLOCK_ASSET(state, asset)
      expect(asset).toEqual({
        id: 'asset-id',
        lock: false
      })
    })

    test('RESET_ALL', () => {
      store.cache.assets = 123
      store.cache.assetIndex = 456
      store.cache.result = 789
      const state = {}
      store.mutations.RESET_ALL(state)
      expect(store.cache.assets).toEqual([])
      expect(store.cache.assetIndex).toEqual({})
      expect(store.cache.result).toEqual([])
      expect(state).toEqual({
        assetCreated: '',
        assetFilledColumns: {},
        assetListScrollPosition: 0,
        assetMap: new Map(),
        assetSearchQueries: [],
        assetSearchText: '',
        assetSelectionGrid: {},
        assetSorting: [],
        assetTypeSearchText: '',
        assetTypeStats: {},
        assetTypes: [],
        assetValidationColumns: [],
        assetsCsvFormData: null,
        displayedAssetTypes: [],
        displayedAssetTypesLength: 0,
        displayedAssets: [],
        displayedAssetsEstimation: 0,
        displayedAssetsLength: 0,
        displayedAssetsTimeSpent: 0,
        filteredAssets: [],
        isAssetDescription: false,
        isAssetEstimation: false,
        isAssetTime: false,
        isAssetsLoading: false,
        isAssetsLoadingError: false,
        nbValidationColumns: 0,
        personTasks: [],
        selectedAssets: new Map()
      })
    })

    test('SET_ASSET_SELECTION', () => {
      const state = {
        selectedAssets: new Map(Object.entries({
          'asset-id-1': true
        })),
        displayedAssets: [],
        nbValidationColumns: 0
      }
      const asset = {
        id: 'asset-id-1'
      }
      store.mutations.SET_ASSET_SELECTION(state, { asset, selected: false })
      expect(state.selectedAssets.has('asset-id-1')).toBeFalsy()
      store.mutations.SET_ASSET_SELECTION(state, { asset, selected: true })
      expect(state.selectedAssets.has('asset-id-1')).toBeTruthy()
    })

    test('CLEAR_SELECTED_ASSETS', () => {
      const state = {
        selectedAssets: 123
      }
      store.mutations.CLEAR_SELECTED_ASSETS(state)
      expect(state.selectedAssets).toEqual(new Map())
    })
  })
})
