import store from '../../../src/store/modules/productions'

import productionApi from '../../../src/store/api/productions.js'
import {
  ADD_METADATA_DESCRIPTOR_END,
  ADD_PRODUCTION,
  CLEAR_ASSETS,
  CLEAR_SHOTS,
  DELETE_PRODUCTION_END,
  DELETE_PRODUCTION_START,
  EDIT_PRODUCTION_END,
  EDIT_PRODUCTION_START,
  LOAD_OPEN_PRODUCTIONS_END,
  LOAD_OPEN_PRODUCTIONS_ERROR,
  LOAD_OPEN_PRODUCTIONS_START,
  LOAD_PRODUCTION_STATUS_END,
  LOAD_PRODUCTION_STATUS_ERROR,
  LOAD_PRODUCTION_STATUS_START,
  LOAD_PRODUCTIONS_END,
  LOAD_PRODUCTIONS_ERROR,
  LOAD_PRODUCTIONS_START,
  PRODUCTION_ADD_ASSET_TYPE,
  PRODUCTION_ADD_TASK_STATUS,
  PRODUCTION_ADD_TASK_TYPE,
  PRODUCTION_AVATAR_UPLOADED,
  PRODUCTION_PICTURE_FILE_SELECTED,
  PRODUCTION_REMOVE_ASSET_TYPE,
  PRODUCTION_REMOVE_TASK_STATUS,
  PRODUCTION_REMOVE_TASK_TYPE,
  REMOVE_PRODUCTION,
  RESET_PRODUCTION_PATH,
  SET_CURRENT_PRODUCTION,
  TEAM_ADD_PERSON,
  TEAM_REMOVE_PERSON,
  UPDATE_METADATA_DESCRIPTOR_END,
  UPDATE_PRODUCTION
} from '@/store/mutation-types'
import { destroyTooltip } from 'v-tooltip'
import { sortByName, sortProductions } from '@/lib/sorting'

describe('Productions store', () => {
  describe('Getters', () => {
    let rootState

    beforeEach(() => {
      rootState = {
        assetTypes: {
          assetTypes: [
            { id: 'asset-type-1', name: 'Asset type 1' },
            { id: 'asset-type-2', name: 'Asset type 2' },
            { id: 'asset-type-3', name: 'Asset type 3' }
          ],
          assetTypeMap: new Map(Object.entries({
            'asset-type-1': { id: 'asset-type-1', name: 'Asset type 1' },
            'asset-type-2': { id: 'asset-type-2', name: 'Asset type 2' },
            'asset-type-3': { id: 'asset-type-3', name: 'Asset type 3' }
          }))
        },
        taskStatus: {
          taskStatus: [
            { id: 'task-status-1', name: 'Task status 1' },
            { id: 'task-status-2', name: 'Task status 2' },
            { id: 'task-status-3', name: 'Task status 3' }
          ],
          taskStatusMap: new Map(Object.entries({
            'task-status-1': { id: 'task-status-1', name: 'Task status 1' },
            'task-status-2': { id: 'task-status-2', name: 'Task status 2' },
            'task-status-3': { id: 'task-status-3', name: 'Task status 3' }
          }))
        },
        taskTypes: {
          taskTypes: [
            { id: 'task-type-1', name: 'Task type 1' },
            { id: 'task-type-2', name: 'Task type 2' },
            { id: 'task-type-3', name: 'Task type 3' }
          ],
          taskTypeMap: new Map(Object.entries({
            'task-type-1': { id: 'task-type-1', name: 'Task type 1' },
            'task-type-2': { id: 'task-type-2', name: 'Task type 2' },
            'task-type-3': { id: 'task-type-3', name: 'Task type 3' }
          }))
        },
        productions: {
          currentProduction: {
            id: 'production-1',
            name: 'Caminandes',
            task_types: []
          },
          productionMap: new Map(Object.entries({
            'production-1': {
              id: 'production-1',
              name: 'Caminandes',
              task_statuses: ['task-status-3', 'task-status-1']
            }
          }))
        }
      }
    })

    test('isTVShow', () => {
      let state = {
        currentProduction: {
          id: 'production-1',
          name: 'Caminandes',
          production_type: 'short'
        }
      }
      expect(store.getters.isTVShow(state)).toBeFalsy()
      state = {
        currentProduction: {
          id: 'production-1',
          name: 'Caminandes',
          production_type: 'tvshow'
        }
      }
      expect(store.getters.isTVShow(state)).toBeTruthy()
    })

    test('productionAssetTypes', () => {
      const productions = rootState.productions
      expect(store.getters.productionAssetTypes(productions, null, rootState))
        .toEqual(rootState.assetTypes.assetTypes)
      productions.currentProduction.asset_types =
        ['asset-type-3', 'asset-type-1']
      expect(store.getters.productionAssetTypes(productions, null, rootState))
        .toEqual([
          { id: 'asset-type-1', name: 'Asset type 1' },
          { id: 'asset-type-3', name: 'Asset type 3' }
        ])
    })

    test('productionTaskStatuses', () => {
      const productions = rootState.productions
      expect(store.getters.productionTaskStatuses(productions, null, rootState))
        .toEqual(rootState.taskStatus.taskStatus)
      productions.currentProduction.task_statuses =
        ['task-status-3', 'task-status-1']
      expect(store.getters.productionTaskStatuses(productions, null, rootState))
        .toEqual([
          { id: 'task-status-1', name: 'Task status 1' },
          { id: 'task-status-3', name: 'Task status 3' }
        ])
    })

    test('getProductionTaskStatuses', () => {
      const productions = rootState.productions
      expect(store.getters.getProductionTaskStatuses(
        productions, null, rootState
      )('production-1'))
        .toEqual([
          { id: 'task-status-1', name: 'Task status 1' },
          { id: 'task-status-3', name: 'Task status 3' }
        ])
    })

    test('productionTaskTypes', () => {
      const productions = rootState.productions
      expect(store.getters.productionTaskTypes(productions, null, rootState))
        .toEqual(rootState.taskTypes.taskTypes)
      productions.currentProduction.task_types = ['task-type-3', 'task-type-1']
      expect(store.getters.productionTaskTypes(productions, null, rootState))
        .toEqual([
          { id: 'task-type-1', name: 'Task type 1' },
          { id: 'task-type-3', name: 'Task type 3' }
        ])
    })

    test('currentProduction', () => {
      let state = {
        openProductions: []
      }
      expect(store.getters.currentProduction(state)).toBeNull()
      state = {
        openProductions: [
          { id: 'production-1', name: 'Caminandes' },
          { id: 'production-2', name: 'Agent 327' }
        ]
      }
      expect(store.getters.currentProduction(state)).toEqual(
        state.openProductions[0])
      state = {
        currentProduction: { id: 'production-2', name: 'Agent 327' },
        openProductions: [
          { id: 'production-1', name: 'Caminandes' },
          { id: 'production-2', name: 'Agent 327' }
        ]
      }
      expect(store.getters.currentProduction(state)).toEqual(
        state.openProductions[1])
    })

    test('metadataDescriptors', () => {
      const state = {
        currentProduction: {
          id: 'production-1',
          name: 'Caminandes',
          descriptors: [
            { id: 'desc-1', entity_type: 'Asset', name: 'Descriptor 1' },
            { id: 'desc-2', entity_type: 'Shot', name: 'Descriptor 2' },
            { id: 'desc-3', entity_type: 'Asset', name: 'Descriptor 3' }
          ]
        }
      }
      expect(store.getters.assetMetadataDescriptors(state)).toEqual([
        { id: 'desc-1', entity_type: 'Asset', name: 'Descriptor 1' },
        { id: 'desc-3', entity_type: 'Asset', name: 'Descriptor 3' }
      ])
      expect(store.getters.shotMetadataDescriptors(state)).toEqual([
        { id: 'desc-2', entity_type: 'Shot', name: 'Descriptor 2' }
      ])
    })

    test('productionStatusOptions', () => {
      const state = {
        productionStatus: [
          { id: 'production-status-1', name: 'Open' },
          { id: 'production-status-2', name: 'Closed' }
        ]
      }
      expect(store.getters.productionStatusOptions(state)).toEqual([
        { label: 'Open', value: 'production-status-1' },
        { label: 'Closed', value: 'production-status-2' }
      ])
    })

    test('openProductionOptions', () => {
      const state = {
        openProductions: [
          { id: 'production-1', name: 'Caminandes' },
          { id: 'production-2', name: 'Agent 327' }
        ]
      }
      expect(store.getters.openProductionOptions(state)).toEqual([
        { label: 'Caminandes', value: 'production-1' },
        { label: 'Agent 327', value: 'production-2' }
      ])
    })

    test('productionAssetTypeOptions', () => {
      const fakeGetters = {
        productionAssetTypes: rootState.assetTypes.assetTypes
      }
      expect(store.getters.productionAssetTypeOptions(rootState.productions, fakeGetters)).toEqual([
        { value: 'asset-type-1', label: 'Asset type 1' },
        { value: 'asset-type-2', label: 'Asset type 2' },
        { value: 'asset-type-3', label: 'Asset type 3' }
      ])
    })
  })

  describe('Actions', () => {
    test('loadProductionStatus', () => {
      let mockCommit = jest.fn()
      let mockCallback = jest.fn()
      productionApi.getProductionStatus = jest.fn(callback => callback(1, null))
      store.actions.loadProductionStatus({ commit: mockCommit, state: null }, mockCallback)
      expect(productionApi.getProductionStatus).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, LOAD_PRODUCTION_STATUS_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, LOAD_PRODUCTION_STATUS_ERROR)
      expect(mockCallback).toBeCalledTimes(1)
      expect(mockCallback).toBeCalledWith(1)

      mockCommit = jest.fn()
      mockCallback = jest.fn()
      productionApi.getProductionStatus = jest.fn(callback => callback(null, 123))
      store.actions.loadProductionStatus({ commit: mockCommit, state: null }, mockCallback)
      expect(productionApi.getProductionStatus).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, LOAD_PRODUCTION_STATUS_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, LOAD_PRODUCTION_STATUS_END, 123)
      expect(mockCallback).toBeCalledTimes(1)
      expect(mockCallback).toBeCalledWith(null)
    })

    test('loadOpenProductions', () => {
      let mockCommit = jest.fn()
      let mockCallback = jest.fn()
      productionApi.getOpenProductions = jest.fn(callback => callback(1, null))
      store.actions.loadOpenProductions({ commit: mockCommit, state: null }, mockCallback)
      expect(productionApi.getOpenProductions).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, LOAD_OPEN_PRODUCTIONS_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, LOAD_OPEN_PRODUCTIONS_ERROR)
      expect(mockCallback).toBeCalledTimes(1)
      expect(mockCallback).toBeCalledWith(1)

      mockCommit = jest.fn()
      mockCallback = jest.fn()
      productionApi.getOpenProductions = jest.fn(callback => callback(null, 123))
      store.actions.loadOpenProductions({ commit: mockCommit, state: null }, mockCallback)
      expect(productionApi.getOpenProductions).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, LOAD_OPEN_PRODUCTIONS_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, LOAD_OPEN_PRODUCTIONS_END, 123)
      expect(mockCallback).toBeCalledTimes(1)
      expect(mockCallback).toBeCalledWith(null)
    })

    test('loadProductions', () => {
      let mockCommit = jest.fn()
      let mockCallback = jest.fn()
      productionApi.getProductions = jest.fn(callback => callback(1, null))
      store.actions.loadProductions({ commit: mockCommit, state: null }, mockCallback)
      expect(productionApi.getProductions).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, LOAD_PRODUCTIONS_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, LOAD_PRODUCTIONS_ERROR)
      expect(mockCallback).toBeCalledTimes(1)
      expect(mockCallback).toBeCalledWith(1)

      mockCommit = jest.fn()
      mockCallback = jest.fn()
      productionApi.getProductions = jest.fn(callback => callback(null, 123))
      store.actions.loadProductions({ commit: mockCommit, state: null }, mockCallback)
      expect(productionApi.getProductions).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, LOAD_PRODUCTIONS_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, LOAD_PRODUCTIONS_END, 123)
      expect(mockCallback).toBeCalledTimes(1)
      expect(mockCallback).toBeCalledWith(null)
    })

    test('loadProduction', async () => {
      const state = {
        productionMap: new Map(Object.entries({
          1: { id: '1' }
        }))
      }
      let mockCommit = jest.fn()
      productionApi.getProduction = jest.fn(productionId => Promise.resolve({ id: '1' }))
      await store.actions.loadProduction({ commit: mockCommit, state }, 'production-id')
      expect(productionApi.getProduction).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, UPDATE_PRODUCTION, { id: '1' })

      mockCommit = jest.fn()
      productionApi.getProduction = jest.fn(productionId => Promise.resolve({ id: '5' }))
      await store.actions.loadProduction({ commit: mockCommit, state }, 'production-id')
      expect(productionApi.getProduction).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, ADD_PRODUCTION, { id: '5' })

      /*
      mockCommit = jest.fn()
      productionApi.getProduction = jest.fn(productionId => Promise.reject(new Error('error')))
      await store.actions.loadProduction({ commit: mockCommit, state }, 'production-id')
      expect(productionApi.getProduction).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(0)
      */
    })

    test('newProduction', async () => {
      let mockCommit = jest.fn()
      productionApi.newProduction = jest.fn(productionId => Promise.resolve({ id: '1' }))
      await store.actions.newProduction({ commit: mockCommit, state: null }, 'production-id')
      expect(productionApi.newProduction).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, EDIT_PRODUCTION_START, 'production-id')
      expect(mockCommit).toHaveBeenNthCalledWith(2, EDIT_PRODUCTION_END, { id: '1' })

      mockCommit = jest.fn()
      productionApi.newProduction = jest.fn(productionId => Promise.reject(new Error('error')))
      try {
        await store.actions.newProduction({ commit: mockCommit, state: null }, 'production-id')
      } catch (e) {
        expect(productionApi.newProduction).toBeCalledTimes(1)
        expect(mockCommit).toBeCalledTimes(1)
        expect(mockCommit).toHaveBeenNthCalledWith(1, EDIT_PRODUCTION_START, 'production-id')
      }
    })

    test('editProduction', async () => {
      let mockCommit = jest.fn()
      productionApi.updateProduction = jest.fn(productionId => Promise.resolve({ id: '1' }))
      await store.actions.editProduction({ commit: mockCommit, state: null }, 'production-id')
      expect(productionApi.updateProduction).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(2)
      expect(mockCommit).toHaveBeenNthCalledWith(1, EDIT_PRODUCTION_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, EDIT_PRODUCTION_END, { id: '1' })

      mockCommit = jest.fn()
      productionApi.updateProduction = jest.fn(productionId => Promise.reject(new Error('error')))
      try {
        await store.actions.editProduction({ commit: mockCommit, state: null }, 'production-id')
      } catch (e) {
        expect(productionApi.updateProduction).toBeCalledTimes(1)
        expect(mockCommit).toBeCalledTimes(1)
        expect(mockCommit).toHaveBeenNthCalledWith(1, EDIT_PRODUCTION_START)
      }
    })

    test('deleteProduction', async () => {
      let mockCommit = jest.fn()
      productionApi.deleteProduction = jest.fn(productionId => Promise.resolve({ id: '1' }))
      await store.actions.deleteProduction({ commit: mockCommit, state: null }, 'production-id')
      expect(productionApi.deleteProduction).toBeCalledTimes(1)
      expect(mockCommit).toBeCalledTimes(3)
      expect(mockCommit).toHaveBeenNthCalledWith(1, DELETE_PRODUCTION_START)
      expect(mockCommit).toHaveBeenNthCalledWith(2, REMOVE_PRODUCTION, 'production-id')
      expect(mockCommit).toHaveBeenNthCalledWith(3, DELETE_PRODUCTION_END)

      mockCommit = jest.fn()
      productionApi.deleteProduction = jest.fn(productionId => Promise.reject(new Error('error')))
      try {
        await store.actions.deleteProduction({ commit: mockCommit, state: null }, 'production-id')
      } catch (e) {
        expect(productionApi.deleteProduction).toBeCalledTimes(1)
        expect(mockCommit).toBeCalledTimes(1)
        expect(mockCommit).toHaveBeenNthCalledWith(1, DELETE_PRODUCTION_START)
      }
    })

    test('setProduction', () => {
      let mockCommit = jest.fn()
      const fakeRootGetters = {
        isTVShow: true,
        currentEpisode: { id: '123' }
      }
      store.actions.setProduction({ commit: mockCommit, rootGetters: fakeRootGetters }, 'production-id')
      expect(mockCommit).toBeCalledTimes(4)
      expect(mockCommit).toHaveBeenNthCalledWith(1, SET_CURRENT_PRODUCTION, 'production-id')
      expect(mockCommit).toHaveBeenNthCalledWith(2, CLEAR_ASSETS)
      expect(mockCommit).toHaveBeenNthCalledWith(3, CLEAR_SHOTS)
      expect(mockCommit).toHaveBeenNthCalledWith(4, RESET_PRODUCTION_PATH, { productionId: 'production-id', episodeId: '123' })

      mockCommit = jest.fn()
      fakeRootGetters.isTVShow = false
      store.actions.setProduction({ commit: mockCommit, rootGetters: fakeRootGetters }, 'production-id')
      expect(mockCommit).toBeCalledTimes(4)
      expect(mockCommit).toHaveBeenNthCalledWith(1, SET_CURRENT_PRODUCTION, 'production-id')
      expect(mockCommit).toHaveBeenNthCalledWith(2, CLEAR_ASSETS)
      expect(mockCommit).toHaveBeenNthCalledWith(3, CLEAR_SHOTS)
      expect(mockCommit).toHaveBeenNthCalledWith(4, RESET_PRODUCTION_PATH, { productionId: 'production-id' })

      mockCommit = jest.fn()
      store.actions.setProduction({ commit: mockCommit, rootGetters: fakeRootGetters }, null)
      expect(mockCommit).toBeCalledTimes(3)
      expect(mockCommit).toHaveBeenNthCalledWith(1, SET_CURRENT_PRODUCTION, null)
      expect(mockCommit).toHaveBeenNthCalledWith(2, CLEAR_ASSETS)
      expect(mockCommit).toHaveBeenNthCalledWith(3, CLEAR_SHOTS)
    })

    test('storeProductionPicture', () => {
      const mockCommit = jest.fn()
      store.actions.storeProductionPicture({ commit: mockCommit }, 'form-data')
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, PRODUCTION_PICTURE_FILE_SELECTED, 'form-data')
    })

    test('uploadProductionAvatar', async () => {
      let mockCommit = jest.fn()
      const state = {
        productionAvatarFormData: 'form-data'
      }
      productionApi.postAvatar = jest.fn((_, __, callback) => callback(null))
      await store.actions.uploadProductionAvatar({ commit: mockCommit, state }, 'production-id')
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, PRODUCTION_AVATAR_UPLOADED, 'production-id')

      mockCommit = jest.fn()
      productionApi.postAvatar = jest.fn((_, __, callback) => callback(new Error('error')))
      try {
        await store.actions.uploadProductionAvatar({ commit: mockCommit, state }, 'production-id')
      } catch (e) {
        expect(mockCommit).toBeCalledTimes(1)
        expect(mockCommit).toHaveBeenNthCalledWith(1, PRODUCTION_AVATAR_UPLOADED, 'production-id')
      }
    })

    test('addPersonToTeam', () => {
      const mockCommit = jest.fn()
      const state = {
        currentProduction: { id: '123' }
      }
      productionApi.addPersonToTeam = jest.fn()
      store.actions.addPersonToTeam({ commit: mockCommit, state }, { id: '456' })
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, TEAM_ADD_PERSON, '456')
      expect(productionApi.addPersonToTeam).toBeCalledTimes(1)
    })

    test('removePersonFromTeam', () => {
      const mockCommit = jest.fn()
      const state = {
        currentProduction: { id: '123' }
      }
      productionApi.removePersonFromTeam = jest.fn()
      store.actions.removePersonFromTeam({ commit: mockCommit, state }, { id: '456' })
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, TEAM_REMOVE_PERSON, '456')
      expect(productionApi.removePersonFromTeam).toBeCalledTimes(1)
    })

    test('addAssetTypeToProduction', () => {
      const mockCommit = jest.fn()
      const state = {
        currentProduction: { id: '123' }
      }
      productionApi.addAssetTypeToProduction = jest.fn()
      store.actions.addAssetTypeToProduction({ commit: mockCommit, state }, '456')
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, PRODUCTION_ADD_ASSET_TYPE, '456')
      expect(productionApi.addAssetTypeToProduction).toBeCalledTimes(1)
    })

    test('removeAssetTypeFromProduction', () => {
      const mockCommit = jest.fn()
      const state = {
        currentProduction: { id: '123' }
      }
      productionApi.removeAssetTypeFromProduction = jest.fn()
      store.actions.removeAssetTypeFromProduction({ commit: mockCommit, state }, '456')
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, PRODUCTION_REMOVE_ASSET_TYPE, '456')
      expect(productionApi.removeAssetTypeFromProduction).toBeCalledTimes(1)
    })

    test('addTaskTypeToProduction', () => {
      const mockCommit = jest.fn()
      const state = {
        currentProduction: { id: '123' }
      }
      productionApi.addTaskTypeToProduction = jest.fn()
      store.actions.addTaskTypeToProduction(
        { commit: mockCommit, state },
        { taskTypeId: '456', priority: 1 }
      )
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(
        1, PRODUCTION_ADD_TASK_TYPE, '456'
      )
      expect(productionApi.addTaskTypeToProduction).toBeCalledTimes(1)
    })

    test('removeTaskTypeFromProduction', () => {
      const mockCommit = jest.fn()
      const state = {
        currentProduction: { id: '123' }
      }
      productionApi.removeTaskTypeFromProduction = jest.fn()
      store.actions.removeTaskTypeFromProduction({ commit: mockCommit, state }, '456')
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, PRODUCTION_REMOVE_TASK_TYPE, '456')
      expect(productionApi.removeTaskTypeFromProduction).toBeCalledTimes(1)
    })

    test('addTaskStatusToProduction', () => {
      const mockCommit = jest.fn()
      const state = {
        currentProduction: { id: '123' }
      }
      productionApi.addTaskStatusToProduction = jest.fn()
      store.actions.addTaskStatusToProduction({ commit: mockCommit, state }, '456')
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, PRODUCTION_ADD_TASK_STATUS, '456')
      expect(productionApi.addTaskStatusToProduction).toBeCalledTimes(1)
    })

    test('removeTaskStatusFromProduction', () => {
      const mockCommit = jest.fn()
      const state = {
        currentProduction: { id: '123' }
      }
      productionApi.removeTaskStatusFromProduction = jest.fn()
      store.actions.removeTaskStatusFromProduction({ commit: mockCommit, state }, '456')
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, PRODUCTION_REMOVE_TASK_STATUS, '456')
      expect(productionApi.removeTaskStatusFromProduction).toBeCalledTimes(1)
    })

    test('addMetadataDescriptor', async () => {
      let mockCommit = jest.fn()
      const state = {
        currentProduction: { id: '123', descriptors: [{ field_name: 'descriptor', id: 1 }] }
      }

      productionApi.addMetadataDescriptor = jest.fn()
      store.actions.addMetadataDescriptor({ commit: mockCommit, state }, { field_name: 'new descriptor' })
      expect(productionApi.addMetadataDescriptor).toBeCalledTimes(1)
      expect(productionApi.addMetadataDescriptor).toHaveBeenNthCalledWith(1, '123', { field_name: 'new descriptor' })

      const existingDescriptor = { field_name: 'new descriptor name', id: 1 }
      mockCommit = jest.fn()
      productionApi.updateMetadataDescriptor = jest.fn((_, descriptor) => Promise.resolve(descriptor))
      await store.actions.addMetadataDescriptor({ commit: mockCommit, state }, existingDescriptor)
      expect(productionApi.updateMetadataDescriptor).toBeCalledTimes(1)
      expect(productionApi.updateMetadataDescriptor).toHaveBeenNthCalledWith(1, '123', existingDescriptor)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, UPDATE_METADATA_DESCRIPTOR_END, { production: state.currentProduction, previousDescriptorFieldName: 'descriptor', descriptor: existingDescriptor })
    })

    test('refreshMetadataDescriptor', async () => {
      let mockCommit = jest.fn()
      const state = {
        currentProduction: {
          id: '123'
        },
        openProductions: [{}, { descriptors: [{ id: '456', field_name: 'descriptor name' }] }],
        productionMap: new Map(Object.entries({
          1: { id: 1 }
        }))
      }

      const descriptor = { id: '456', field_name: 'descriptor name', project_id: '1' }
      productionApi.getMetadataDescriptor = jest.fn((_, __) => Promise.resolve(descriptor))
      await store.actions.refreshMetadataDescriptor({ commit: mockCommit, state }, descriptor.id)
      expect(productionApi.getMetadataDescriptor).toBeCalledTimes(1)
      expect(productionApi.getMetadataDescriptor).toHaveBeenNthCalledWith(1, '123', descriptor.id)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, UPDATE_METADATA_DESCRIPTOR_END, { production: { id: 1 }, descriptor })

      descriptor.id = '789'
      mockCommit = jest.fn()
      productionApi.getMetadataDescriptor = jest.fn((_, __) => Promise.resolve(descriptor))
      await store.actions.refreshMetadataDescriptor({ commit: mockCommit, state }, descriptor.id)
      expect(productionApi.getMetadataDescriptor).toBeCalledTimes(1)
      expect(productionApi.getMetadataDescriptor).toHaveBeenNthCalledWith(1, '123', descriptor.id)
      expect(mockCommit).toBeCalledTimes(1)
      expect(mockCommit).toHaveBeenNthCalledWith(1, ADD_METADATA_DESCRIPTOR_END, { production: { id: 1 }, descriptor })
    })
  })

  describe('Mutations', () => {
    let state
    beforeEach(() => {
      state = {
        productions: [
          { id: 'production-1', name: 'caminandes' }
        ],
        openProductions: []
      }
    })

    test('RESET_ALL', () => {
      store.mutations.RESET_ALL(state)
      expect(state.productions).toEqual([])
    })

    test('LOAD_PRODUCTIONS_START', () => {
      store.mutations.LOAD_PRODUCTIONS_START(state)
      expect(state.productions).toHaveLength(0)
      expect(state.isProductionsLoading).toBeTruthy()
      expect(state.isProductionsLoadingError).toBeFalsy()
    })

    test('LOAD_PRODUCTIONS_ERROR', () => {
      store.mutations.LOAD_PRODUCTIONS_ERROR(state)
      expect(state.productions).toHaveLength(0)
      expect(state.isProductionsLoading).toBeFalsy()
      expect(state.isProductionsLoadingError).toBeTruthy()
    })

    test('LOAD_PRODUCTIONS_END', () => {
      store.mutations.LOAD_PRODUCTIONS_END(state, [{ id: 1, project_status_name: 'Status 1' }, { id: 2, project_status_name: 'Status 2' }])
      expect(state.productions).toHaveLength(2)
      expect(state.isProductionsLoading).toBeFalsy()
      expect(state.isProductionsLoadingError).toBeFalsy()
      expect(state.productionMap.get(1)).toEqual({ id: 1, project_status_name: 'Status 1' })
      expect(state.productionMap.get(2)).toEqual({ id: 2, project_status_name: 'Status 2' })
    })

    test('LOAD_OPEN_PRODUCTIONS_START', () => {
      store.mutations.LOAD_OPEN_PRODUCTIONS_START(state)
      expect(state.isOpenProductionsLoading).toBeTruthy()
      expect(state.openProductions).toHaveLength(0)
    })

    test('LOAD_OPEN_PRODUCTIONS_ERROR', () => {
      store.mutations.LOAD_OPEN_PRODUCTIONS_ERROR(state)
      expect(state.isOpenProductionsLoading).toBeFalsy()
    })

    test('LOAD_OPEN_PRODUCTIONS_END', () => {
      state.currentProduction = null
      store.mutations.LOAD_OPEN_PRODUCTIONS_END(state, [{ id: 1, name: 'Name 1' }, { id: 2, name: 'Name 2' }])
      expect(state.isOpenProductionsLoading).toBeFalsy()
      expect(state.openProductions).toHaveLength(2)
      expect(state.productionMap.get(1)).toEqual({ id: 1, name: 'Name 1' })
      expect(state.productionMap.get(2)).toEqual({ id: 2, name: 'Name 2' })
      expect(state.currentProduction).toEqual({ id: 1, name: 'Name 1' })
    })

    test('LOAD_PRODUCTION_STATUS_START', () => {
      store.mutations.LOAD_PRODUCTION_STATUS_START(state)
      expect(state.productionStatus).toHaveLength(0)
    })

    test.skip('LOAD_PRODUCTION_STATUS_ERROR', () => {})

    test('LOAD_PRODUCTION_STATUS_END', () => {
      store.mutations.LOAD_PRODUCTION_STATUS_END(state, [{ id: 1, status: 'status' }])
      expect(state.productionStatus).toEqual([{ id: 1, status: 'status' }])
      expect(state.productionStatusMap.get(1)).toEqual({ id: 1, status: 'status' })
    })

    test.skip('EDIT_PRODUCTION_START', () => {})

    test.skip('EDIT_PRODUCTION_ERROR', () => {})

    test('EDIT_PRODUCTION_END', () => {
      state.productionStatusMap = new Map()
      state.productionMap = new Map()
      state.productionStatusMap.set('Project status ID', { name: 'Status name' })
      state.productionStatusMap.set('other Project status ID', { name: 'Status name 2' })
      state.productions = [{ id: 1, project_status_id: 'other Project status ID', production_type: 'short', name: 'production3' }]
      store.mutations.EDIT_PRODUCTION_END(state, {
        id: 1,
        name: 'production1',
        project_status_id: 'Project status ID',
        project_status_name: 'Project status name',
        production_type: 'Production type',
        first_episode_id: 1
      })
      store.mutations.EDIT_PRODUCTION_END(state, {
        id: 2,
        name: 'production2',
        project_status_id: 'Project status ID',
        project_status_name: 'Project status name',
        production_type: 'Production type',
        first_episode_id: 1
      })
      expect(state.productions[0]).toEqual({
        id: 1,
        name: 'production1',
        project_status_id: 'Project status ID',
        project_status_name: 'Status name',
        production_type: 'Production type',
        first_episode_id: 1
      })
      expect(state.productions[1]).toEqual({
        id: 2,
        name: 'production2',
        project_status_id: 'Project status ID',
        project_status_name: 'Status name',
        production_type: 'Production type',
        first_episode_id: 1,
        team: [],
        task_statuses: [],
        asset_types: [],
        task_types: []
      })
    })

    test('ADD_PRODUCTION', () => {
      state.productionMap = new Map()
      store.mutations.ADD_PRODUCTION(state, { id: 123, name: 'new production' })
      expect(state.productions).toHaveLength(2)
      expect(state.openProductions).toHaveLength(1)
      expect(state.productionMap.get(123)).toEqual({ id: 123, name: 'new production' })
    })

    test('UPDATE_PRODUCTION', () => {
      state.productionMap = new Map(Object.entries({
        123: { id: '123', name: 'old production', project_status_id: '1' }
      }))
      state.productionStatusMap = new Map(Object.entries({
        1: { name: 'old status' },
        2: { name: 'new status' }
      }))
      state.openProductions = [{ id: '123', name: 'old production', project_status_id: '1' }]
      store.mutations.UPDATE_PRODUCTION(state, { id: '123', name: 'new production', project_status_id: '2' })
      expect(state.openProductions).toHaveLength(0)
      expect(state.productionMap.get('123')).toEqual({ id: '123', name: 'new production', project_status_id: '2', project_status_name: 'new status' })
    })

    test.skip('DELETE_PRODUCTION_START', () => {})

    test.skip('DELETE_PRODUCTION_ERROR', () => {})

    test('REMOVE_PRODUCTION', () => {
      const production = { id: '123', name: 'old production', project_status_id: '1' }
      state.productionMap = new Map(Object.entries({
        123: production
      }))
      state.productions = [production]
      state.openProductions = [production]
      store.mutations.REMOVE_PRODUCTION(state, production)
      expect(state.productions).toHaveLength(0)
      expect(state.openProductions).toHaveLength(0)
      expect(state.productionMap).toEqual(new Map())
    })

    test.skip('DELETE_PRODUCTION_END', () => {})

    test('PRODUCTION_PICTURE_FILE_SELECTED', () => {
      store.mutations.PRODUCTION_PICTURE_FILE_SELECTED(state, 'form-data')
      expect(state.productionAvatarFormData).toEqual('form-data')
    })

    test('PRODUCTION_AVATAR_UPLOADED', () => {
      state.productionMap = new Map()
      state.productionMap.set('production-id', { id: 'production-id' })
      store.mutations.PRODUCTION_AVATAR_UPLOADED(state, 'production-id')
      expect(state.productionMap.get('production-id').has_avatar).toBeTruthy()
    })

    test('SET_CURRENT_PRODUCTION', () => {
      state.productionMap = new Map()
      state.currentProduction = null
      state.productionMap.set('production-id', { id: 'production-id' })
      store.mutations.SET_CURRENT_PRODUCTION(state, 'production-id')
      expect(state.currentProduction).toEqual({ id: 'production-id' })
    })

    test('RESET_PRODUCTION_PATH', () => {
      store.mutations.RESET_PRODUCTION_PATH(state, { productionId: 'production-id', episodeId: 'episode-id' })
      expect(state.assetsPath).toEqual({
        name: 'episode-assets',
        params: {
          episode_id: 'episode-id',
          production_id: 'production-id'
        },
        query: {
          search: ''
        }
      })
      expect(state.assetTypesPath).toEqual({
        name: 'episode-production-asset-types',
        params: {
          episode_id: 'episode-id',
          production_id: 'production-id'
        }
      })
      expect(state.shotsPath).toEqual({
        name: 'episode-shots',
        params: {
          episode_id: 'episode-id',
          production_id: 'production-id'
        },
        query: {
          search: ''
        }
      })
      expect(state.sequencesPath).toEqual({
        name: 'episode-sequences',
        params: {
          episode_id: 'episode-id',
          production_id: 'production-id'
        }
      })
      expect(state.episodesPath).toEqual({
        name: 'episodes',
        params: {
          production_id: 'production-id'
        }
      })
      expect(state.breakdownPath).toEqual({
        name: 'episode-breakdown',
        params: {
          episode_id: 'episode-id',
          production_id: 'production-id'
        }
      })
      expect(state.playlistsPath).toEqual({
        name: 'episode-playlists',
        params: {
          episode_id: 'episode-id',
          production_id: 'production-id'
        }
      })
      expect(state.teamPath).toEqual({
        name: 'team',
        params: {
          production_id: 'production-id'
        }
      })
    })

    test('TEAM_ADD_PERSON', () => {
      state.currentProduction = {
        team: []
      }
      store.mutations.TEAM_ADD_PERSON(state, 123)
      expect(state.currentProduction.team[0]).toEqual(123)
    })

    test('TEAM_REMOVE_PERSON', () => {
      state.currentProduction = {
        team: [123]
      }
      store.mutations.TEAM_REMOVE_PERSON(state, 123)
      expect(state.currentProduction.team).toHaveLength(0)
    })

    test('PRODUCTION_ADD_ASSET_TYPE', () => {
      state.currentProduction = {
        asset_types: []
      }
      store.mutations.PRODUCTION_ADD_ASSET_TYPE(state, 123)
      expect(state.currentProduction.asset_types[0]).toEqual(123)
    })

    test('PRODUCTION_REMOVE_ASSET_TYPE', () => {
      state.currentProduction = {
        asset_types: [123]
      }
      store.mutations.PRODUCTION_REMOVE_ASSET_TYPE(state, 123)
      expect(state.currentProduction.asset_types).toHaveLength(0)
    })

    test('PRODUCTION_ADD_TASK_STATUS', () => {
      state.currentProduction = {
        task_statuses: []
      }
      store.mutations.PRODUCTION_ADD_TASK_STATUS(state, 123)
      expect(state.currentProduction.task_statuses[0]).toEqual(123)
    })

    test('PRODUCTION_REMOVE_TASK_STATUS', () => {
      state.currentProduction = {
        task_statuses: [123]
      }
      store.mutations.PRODUCTION_REMOVE_TASK_STATUS(state, 123)
      expect(state.currentProduction.task_statuses).toHaveLength(0)
    })

    test('PRODUCTION_ADD_TASK_TYPE', () => {
      state.currentProduction = {
        task_types: []
      }
      store.mutations.PRODUCTION_ADD_TASK_TYPE(state, 123)
      expect(state.currentProduction.task_types[0]).toEqual(123)
    })

    test('PRODUCTION_REMOVE_TASK_TYPE', () => {
      state.currentProduction = {
        task_types: [123]
      }
      store.mutations.PRODUCTION_REMOVE_TASK_TYPE(state, 123)
      expect(state.currentProduction.task_types).toHaveLength(0)
    })

    test('ADD_METADATA_DESCRIPTOR_END', () => {
      const production = { id: 'production-id', descriptors: [] }
      const descriptor = { id: 'descriptor', field_name: 'new descriptor' }
      store.mutations.ADD_METADATA_DESCRIPTOR_END(state, { production, descriptor })
      expect(production.descriptors[0]).toEqual(descriptor)
    })

    test('UPDATE_METADATA_DESCRIPTOR_END', () => {
      const production = { id: 'production-id', descriptors: [{ id: 'descriptor', field_name: 'old descriptor' }] }
      const descriptor = { id: 'descriptor', field_name: 'new descriptor' }
      store.mutations.UPDATE_METADATA_DESCRIPTOR_END(state, { production, descriptor })
      expect(production.descriptors[0]).toEqual(descriptor)
    })

    test('DELETE_METADATA_DESCRIPTOR_END', () => {
      const descriptor = { id: 'descriptor', field_name: 'new descriptor' }
      state.openProductions = [{ id: 'production-id', descriptors: [descriptor] }]
      store.mutations.DELETE_METADATA_DESCRIPTOR_END(state, descriptor)
      expect(state.openProductions[0].descriptors).toHaveLength(0)
    })

    test('ASSIGN_TASKS', () => {
      state.currentProduction = {
        team: []
      }
      store.mutations.ASSIGN_TASKS(state, { personId: 123 })
      expect(state.currentProduction.team[0]).toEqual(123)
    })
  })

  describe('Helpers', () => {
    test('getProductionComponentPath', () => {
      const productionPath = store.helpers.getProductionComponentPath('base-route', 'production-id', null)
      const episodePath = store.helpers.getProductionComponentPath('base-route', 'production-id', 'episode-id')
      const entityPath = store.helpers.getProductionComponentPath('assets', null, null)
      expect(productionPath).toEqual({
        name: 'base-route',
        params: {
          production_id: 'production-id'
        }
      })
      expect(episodePath).toEqual({
        name: 'episode-base-route',
        params: {
          production_id: 'production-id',
          episode_id: 'episode-id'
        }
      })
      expect(entityPath).toEqual({
        name: 'open-productions',
        query: { search: '' }
      })
    })

    test('isEmptyArray', () => {
      expect(store.helpers.isEmptyArray(null, 'arrayName')).toBeTruthy()
      expect(store.helpers.isEmptyArray({}, 'arrayName')).toBeTruthy()
      expect(store.helpers.isEmptyArray({ arrayName: null }, 'arrayName')).toBeTruthy()
      expect(store.helpers.isEmptyArray({ arrayName: [] }, 'arrayName')).toBeTruthy()
      expect(store.helpers.isEmptyArray({ arrayName: [1] }, 'arrayName')).toBeFalsy()
    })
  })
})
