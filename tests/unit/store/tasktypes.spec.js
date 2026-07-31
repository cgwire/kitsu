import { createStore } from 'vuex'

import store from '@/store/modules/tasktypes'
import taskTypesApi from '@/store/api/tasktypes'

const taskTypes = [
  {
    name: 'Modeling',
    id: 'task-type-1',
    color: '#ffffff',
    for_entity: 'Asset'
  },
  {
    name: 'Shading',
    id: 'task-type-2',
    color: '#eeeeee',
    for_entity: 'Asset'
  },
  {
    name: 'Animation',
    id: 'task-type-3',
    color: '#00eeee',
    for_entity: 'Shot'
  },
  {
    name: 'Edit',
    id: 'task-type-4',
    color: '#ff0f0f',
    for_entity: 'Edit'
  }
]

const taskTypeMap = new Map(taskTypes.map(t => [t.id, t]))
store.cache.taskTypeMap = taskTypeMap

const rootGetters = {
  productionTaskTypes: taskTypes
}
const getters = {
  assetTaskTypes: taskTypes.filter(t => t.for_entity === 'Asset'),
  shotTaskTypes: taskTypes.filter(t => t.for_entity === 'Shot'),
  editTaskTypes: taskTypes.filter(t => t.for_entity === 'Edit')
}

describe('Task types store', () => {
  describe('Getters', () => {
    let state
    beforeEach(() => {
      state = {
        taskTypes: [...taskTypes],
        taskTypeMap
      }
    })

    test('currentTaskType', () => {
      const rootState = {
        route: { params: { task_type_id: 'task-type-2' } }
      }
      expect(store.getters.currentTaskType(state, null, rootState))
        .toStrictEqual(taskTypes[1])
    }),
    test('assetTaskTypes', () => {
      expect(store.getters.assetTaskTypes(state, null, null, rootGetters))
        .toHaveLength(2)
    })
    test('shotTaskTypes', () => {
      expect(store.getters.shotTaskTypes(state, null, null, rootGetters))
        .toHaveLength(1)
    })
    test('editTaskTypes', () => {
      expect(store.getters.shotTaskTypes(state, null, null, rootGetters))
        .toHaveLength(1)
    })
    test('getTaskTypeOptions', () => {
      expect(
        store.getters.getTaskTypeOptions(state, null, null, rootGetters
        )[0])
        .toStrictEqual({
          label: 'Modeling',
          value: 'task-type-1'
        })
    })
    test('getAssetTaskTypeOptions', () => {
      expect(
        store.getters.getAssetTaskTypeOptions(state, getters, null, rootGetters)
          [0])
        .toStrictEqual({
          label: 'Modeling',
          value: 'task-type-1'
        })
    })
    test('getShotTaskTypeOptions', () => {
      expect(
        store.getters.getShotTaskTypeOptions(state, getters, null, rootGetters)
          [0])
        .toStrictEqual({
          label: 'Animation',
          value: 'task-type-3'
        })
    })
    test('getEditTaskTypeOptions', () => {
      expect(
        store.getters.getEditTaskTypeOptions(state, getters, null, rootGetters)
          [0])
        .toStrictEqual({
          label: 'Edit',
          value: 'task-type-4'
        })
    })
  })

  describe('Actions', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('loadTaskType', async () => {
      const taskType = { id: 'task-type-9', name: 'Rigging' }
      vi.spyOn(taskTypesApi, 'getTaskType').mockResolvedValue(taskType)
      const commit = vi.fn()
      await store.actions.loadTaskType({ commit }, 'task-type-9')
      expect(taskTypesApi.getTaskType).toHaveBeenCalledWith('task-type-9')
      expect(commit).toHaveBeenCalledWith('EDIT_TASK_TYPE_END', taskType)
    })

    test('loadTaskTypes', async () => {
      vi.spyOn(taskTypesApi, 'getTaskTypes').mockResolvedValue([...taskTypes])
      const commit = vi.fn()
      await store.actions.loadTaskTypes({ commit })
      expect(commit).toHaveBeenCalledWith('LOAD_TASK_TYPES_START')
      expect(commit).toHaveBeenCalledWith('LOAD_TASK_TYPES_END', taskTypes)
    })

    test('newTaskType', async () => {
      const data = { name: 'Rigging' }
      const taskType = { id: 'task-type-9', name: 'Rigging' }
      vi.spyOn(taskTypesApi, 'newTaskType').mockResolvedValue(taskType)
      const commit = vi.fn()
      await store.actions.newTaskType({ commit }, data)
      expect(commit).toHaveBeenCalledWith('EDIT_TASK_TYPE_START', data)
      expect(commit).toHaveBeenCalledWith('EDIT_TASK_TYPE_END', taskType)
    })

    test('editTaskType', async () => {
      const taskType = { id: 'task-type-1', name: 'Modeling edited' }
      vi.spyOn(taskTypesApi, 'updateTaskType').mockResolvedValue(taskType)
      const commit = vi.fn()
      await store.actions.editTaskType({ commit }, taskType)
      expect(taskTypesApi.updateTaskType).toHaveBeenCalledWith(taskType)
      expect(commit).toHaveBeenCalledWith('EDIT_TASK_TYPE_END', taskType)
    })

    test('deleteTaskType', async () => {
      const taskType = taskTypes[0]
      vi.spyOn(taskTypesApi, 'deleteTaskType').mockResolvedValue()
      const commit = vi.fn()
      await store.actions.deleteTaskType({ commit }, taskType)
      expect(commit).toHaveBeenCalledWith('DELETE_TASK_TYPE_START')
      expect(commit).toHaveBeenCalledWith('DELETE_TASK_TYPE_END', taskType)
    })

    test('initTaskType resolves without loading when shots are cached', async () => {
      const dispatch = vi.fn()
      const rootGetters = {
        currentTaskType: { for_entity: 'Shot' },
        shotMap: new Map([
          ['shot-1', {}],
          ['shot-2', {}]
        ])
      }
      await store.actions.initTaskType({ dispatch, rootGetters }, false)
      expect(dispatch).not.toHaveBeenCalled()
    })

    test('initTaskType loads shots when the shot map is empty', async () => {
      const dispatch = vi.fn().mockResolvedValue()
      const rootGetters = {
        currentTaskType: { for_entity: 'Shot' },
        shotMap: new Map(),
        episodes: [],
        isTVShow: false
      }
      await store.actions.initTaskType({ dispatch, rootGetters }, false)
      expect(dispatch).toHaveBeenCalledWith('loadShots')
    })
  })

  describe('Mutations', () => {
    let state
    beforeEach(() => {
      state = {
        taskTypes,
        taskTypeMap
      }
    })

    test('RESET_ALL', () => {
      store.mutations.RESET_ALL(state)
      expect(state.taskTypes).toEqual([])
    })

    test('LOAD_TASK_TYPES_ERROR', () => {
      store.mutations.LOAD_TASK_TYPES_ERROR(state)
      expect(state.taskTypes).toEqual([])
      expect(store.cache.taskTypeMap.size).toEqual(0)
    })

    test('LOAD_TASK_TYPES_END', () => {
      store.mutations.RESET_ALL(state)
      store.mutations.LOAD_TASK_TYPES_END(state, taskTypes)
      expect(state.taskTypes).toStrictEqual(taskTypes)
      expect(store.cache.taskTypeMap.size).toEqual(4)
    })

    test('DELETE_TASK_TYPE_END', () => {
      store.mutations.RESET_ALL(state)
      store.mutations.LOAD_TASK_TYPES_END(state, taskTypes)
      store.mutations.DELETE_TASK_TYPE_END(state, { id: 'task-type-2' })
      expect(state.taskTypes).toHaveLength(3)
      expect(store.cache.taskTypeMap.size).toEqual(3)
    })

    // The taskTypeMap getter has no reactive dependency, so Vuex evaluates it
    // once and pins the map object it returned. Rebuilding the cached map
    // instead of mutating it left every consumer holding the map emptied by
    // the logout, and each get() returned undefined for the whole session.
    test('LOAD_TASK_TYPES_END keeps the getter live across a logout', () => {
      const loadedTaskTypes = [
        { name: 'Layout', id: 'task-type-5', for_entity: 'Shot' },
        { name: 'Rigging', id: 'task-type-6', for_entity: 'Asset' }
      ]
      const vuexStore = createStore({
        state: { ...store.state },
        getters: store.getters,
        mutations: store.mutations
      })
      vuexStore.commit('LOAD_TASK_TYPES_END', loadedTaskTypes)
      expect(vuexStore.getters.taskTypeMap.size).toEqual(2)

      vuexStore.commit('RESET_ALL')
      expect(vuexStore.getters.taskTypeMap.size).toEqual(0)

      vuexStore.commit('LOAD_TASK_TYPES_END', loadedTaskTypes)
      expect(vuexStore.getters.taskTypeMap.get('task-type-6').name).toEqual(
        'Rigging'
      )
    })
  })
})
