import store from '../../../src/store/modules/productions'


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
          assetTypeMap: {
            'asset-type-1': { id: 'asset-type-1', name: 'Asset type 1' },
            'asset-type-2': { id: 'asset-type-2', name: 'Asset type 2' },
            'asset-type-3': { id: 'asset-type-3', name: 'Asset type 3' }
          }
        },
        taskStatus: {
          taskStatus: [
            { id: 'task-status-1', name: 'Task status 1' },
            { id: 'task-status-2', name: 'Task status 2' },
            { id: 'task-status-3', name: 'Task status 3' }
          ],
          taskStatusMap: {
            'task-status-1': { id: 'task-status-1', name: 'Task status 1' },
            'task-status-2': { id: 'task-status-2', name: 'Task status 2' },
            'task-status-3': { id: 'task-status-3', name: 'Task status 3' }
          }
        },
        taskTypes: {
          taskTypes: [
            { id: 'task-type-1', name: 'Task type 1' },
            { id: 'task-type-2', name: 'Task type 2' },
            { id: 'task-type-3', name: 'Task type 3' }
          ],
          taskTypeMap: {
            'task-type-1': { id: 'task-type-1', name: 'Task type 1' },
            'task-type-2': { id: 'task-type-2', name: 'Task type 2' },
            'task-type-3': { id: 'task-type-3', name: 'Task type 3' }
          }
        },
        productions: {
          currentProduction: {
            id: 'production-1',
            name: 'Caminandes',
            task_types: []
          },
          productionMap: {
            'production-1': {
              id: 'production-1',
              name: 'Caminandes',
              task_statuses: ['task-status-3', 'task-status-1']
            }
          }
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
          { id: 'production-1', name: 'Caminandes'},
          { id: 'production-2', name: 'Agent 327'}
        ]
      }
      expect(store.getters.currentProduction(state)).toEqual(
        state.openProductions[0])
      state = {
        currentProduction: { id: 'production-2', name: 'Agent 327'},
        openProductions: [
          { id: 'production-1', name: 'Caminandes'},
          { id: 'production-2', name: 'Agent 327'}
        ]
      }
      expect(store.getters.currentProduction(state)).toEqual(
        state.openProductions[1])
    })

    test('metadataDescriptors', () => {
      let state = {
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
      let state = {
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
      let state = {
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
  })

  describe('Actions', () => {
  })

  describe('Mutations', () => {
    let state
    beforeEach(() => {
      state = {
        productions: [
          { id: 'production-1', name: 'caminandes' }
        ]
      }
    })

    test('RESET_ALL', () => {
      store.mutations.RESET_ALL(state)
      expect(state.productions).toEqual([])
    })
  })
})
