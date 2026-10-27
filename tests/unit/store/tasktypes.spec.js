// @vitest-environment node

import process from 'node:process'
import { createStore } from 'vuex'

// The episodes module pulls in the root store (lib/models, timezone): stub
// it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import shotsApi from '@/store/api/shots'
import episodesStore from '@/store/modules/episodes'
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
    test.each(['Asset', 'Shot', 'Sequence', 'Edit'])(
      'currentTaskTypeEpisode of the %s task types is the current episode',
      forEntity => {
        const episode = { id: 'ep-1' }
        expect(
          store.getters.currentTaskTypeEpisode(
            state,
            { currentTaskType: { for_entity: forEntity } },
            null,
            { currentEpisode: episode }
          )
        ).toBe(episode)
      }
    )
    test('currentTaskTypeEpisode of the Episode task types is none', () => {
      expect(
        store.getters.currentTaskTypeEpisode(
          state,
          { currentTaskType: { for_entity: 'Episode' } },
          null,
          { currentEpisode: { id: 'all' } }
        )
      ).toBeNull()
    })
    test('assetTaskTypes', () => {
      expect(store.getters.assetTaskTypes(state, null, null, rootGetters))
        .toHaveLength(2)
    })
    test('shotTaskTypes', () => {
      expect(store.getters.shotTaskTypes(state, null, null, rootGetters))
        .toHaveLength(1)
    })
    test('editTaskTypes', () => {
      expect(
        store.getters.editTaskTypes(state, null, null, rootGetters)
      ).toEqual([taskTypes[3]])
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

    test('uploadTaskTypeEstimations posts with the estimations episode', async () => {
      vi.spyOn(taskTypesApi, 'postTaskTypeEstimations').mockResolvedValue([])
      const production = { id: 'p' }
      const taskType = { id: 'task-type-5', for_entity: 'Episode' }
      const formData = {}
      await store.actions.uploadTaskTypeEstimations(
        {
          getters: { currentTaskTypeEpisode: null },
          rootGetters: {
            currentEpisode: { id: 'all' },
            currentProduction: production,
            currentTaskType: taskType
          }
        },
        formData
      )
      expect(taskTypesApi.postTaskTypeEstimations).toHaveBeenCalledWith(
        production,
        null,
        taskType,
        formData
      )
    })

    test('loadTaskType', async () => {
      const taskType = { id: 'task-type-9', name: 'Rigging' }
      vi.spyOn(taskTypesApi, 'getTaskType').mockResolvedValue(taskType)
      const commit = vi.fn()
      await store.actions.loadTaskType({ commit }, 'task-type-9')
      expect(taskTypesApi.getTaskType).toHaveBeenCalledWith('task-type-9')
      expect(commit).toHaveBeenCalledWith('EDIT_TASK_TYPE_END', taskType)
    })

    test('loadTaskType resolves with the task type', async () => {
      const taskType = { id: 'task-type-9', name: 'Rigging' }
      vi.spyOn(taskTypesApi, 'getTaskType').mockResolvedValue(taskType)
      await expect(
        store.actions.loadTaskType({ commit: vi.fn() }, 'task-type-9')
      ).resolves.toEqual(taskType)
    })

    // The callers log the failure: a rejection dropped by the action would
    // surface as an unhandled one.
    test('loadTaskType rejects with the API error', async () => {
      const rejections = []
      const onRejection = reason => rejections.push(reason)
      process.on('unhandledRejection', onRejection)
      const error = new Error('Request has been terminated')
      vi.spyOn(taskTypesApi, 'getTaskType').mockRejectedValue(error)

      await expect(
        store.actions.loadTaskType({ commit: vi.fn() }, 'task-type-9')
      ).rejects.toBe(error)
      await new Promise(resolve => setTimeout(resolve))
      process.off('unhandledRejection', onRejection)

      expect(rejections).toEqual([])
    })

    test('loadTaskTypes', async () => {
      vi.spyOn(taskTypesApi, 'getTaskTypes').mockResolvedValue([...taskTypes])
      const commit = vi.fn()
      await store.actions.loadTaskTypes({ commit })
      expect(commit).toHaveBeenCalledWith('LOAD_TASK_TYPES_START')
      expect(commit).toHaveBeenCalledWith('LOAD_TASK_TYPES_END', taskTypes)
    })

    test('loadTaskTypes resolves with the task types', async () => {
      vi.spyOn(taskTypesApi, 'getTaskTypes').mockResolvedValue([...taskTypes])
      await expect(
        store.actions.loadTaskTypes({ commit: vi.fn() })
      ).resolves.toEqual(taskTypes)
    })

    test('loadTaskTypes rejects with the API error', async () => {
      const rejections = []
      const onRejection = reason => rejections.push(reason)
      process.on('unhandledRejection', onRejection)
      const error = new Error('Request has been terminated')
      vi.spyOn(taskTypesApi, 'getTaskTypes').mockRejectedValue(error)

      await expect(
        store.actions.loadTaskTypes({ commit: vi.fn() })
      ).rejects.toBe(error)
      await new Promise(resolve => setTimeout(resolve))
      process.off('unhandledRejection', onRejection)

      expect(rejections).toEqual([])
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
      await store.actions.deleteTaskType({ commit }, { taskType })
      expect(taskTypesApi.deleteTaskType).toHaveBeenCalledWith(taskType, false)
      expect(commit).toHaveBeenCalledWith('DELETE_TASK_TYPE_START')
      expect(commit).toHaveBeenCalledWith('DELETE_TASK_TYPE_END', taskType)
    })

    test('deleteTaskType passes the force flag to the API', async () => {
      const taskType = taskTypes[0]
      vi.spyOn(taskTypesApi, 'deleteTaskType').mockResolvedValue()
      await store.actions.deleteTaskType(
        { commit: vi.fn() },
        { taskType, force: true }
      )
      expect(taskTypesApi.deleteTaskType).toHaveBeenCalledWith(taskType, true)
    })

    test('initTaskType resolves without loading when shots are cached', async () => {
      const dispatch = vi.fn()
      const rootGetters = {
        currentTaskType: { for_entity: 'Shot' },
        shotMap: new Map([
          ['shot-1', {}],
          ['shot-2', {}]
        ]),
        currentProduction: { id: 'p' },
        currentEpisode: null,
        isTVShow: false,
        shotsLoadingKey: 'p/'
      }
      await store.actions.initTaskType({ dispatch, rootGetters }, false)
      expect(dispatch).not.toHaveBeenCalled()
    })

    test('initTaskType reloads the assets cached for another episode', async () => {
      const dispatch = vi.fn().mockResolvedValue()
      const rootGetters = {
        currentTaskType: { for_entity: 'Asset' },
        assetMap: new Map([
          ['asset-1', {}],
          ['asset-2', {}]
        ]),
        // Warm, but filled by the episode the user came from: the page
        // filters on the current one and would display nothing.
        assetsLoadingKey: 'p/ep-a',
        currentProduction: { id: 'p' },
        currentEpisode: { id: 'ep-b' },
        isTVShow: true,
        episodes: [{ id: 'ep-a' }, { id: 'ep-b' }]
      }
      await store.actions.initTaskType({ dispatch, rootGetters }, false)
      expect(dispatch).toHaveBeenCalledWith('loadAssets')
    })

    test('initTaskType keeps the assets cached for the displayed episode', async () => {
      const dispatch = vi.fn().mockResolvedValue()
      const rootGetters = {
        currentTaskType: { for_entity: 'Asset' },
        assetMap: new Map([
          ['asset-1', {}],
          ['asset-2', {}]
        ]),
        assetsLoadingKey: 'p/ep-b',
        currentProduction: { id: 'p' },
        currentEpisode: { id: 'ep-b' },
        isTVShow: true,
        episodes: [{ id: 'ep-a' }, { id: 'ep-b' }]
      }
      await store.actions.initTaskType({ dispatch, rootGetters }, false)
      expect(dispatch).not.toHaveBeenCalled()
    })

    test('initTaskType reloads the sequences cached for the all pseudo-episode', async () => {
      const dispatch = vi.fn().mockResolvedValue()
      const rootGetters = {
        currentTaskType: { for_entity: 'Sequence' },
        sequenceMap: new Map([
          ['sq-1', {}],
          ['sq-2', {}]
        ]),
        sequencesLoadingKey: 'p/all',
        currentProduction: { id: 'p' },
        currentEpisode: { id: 'ep-b' },
        isTVShow: true,
        episodes: [{ id: 'ep-a' }, { id: 'ep-b' }]
      }
      await store.actions.initTaskType({ dispatch, rootGetters }, false)
      expect(dispatch).toHaveBeenCalledWith('loadSequencesWithTasks')
    })

    test('initTaskType reloads the episodes listed without their tasks', async () => {
      const dispatch = vi.fn().mockResolvedValue()
      const rootGetters = {
        currentTaskType: { for_entity: 'Episode' },
        // Filled by the topbar: plain rows, without any task column.
        episodeMap: new Map([
          ['ep-1', { id: 'ep-1' }],
          ['ep-2', { id: 'ep-2' }]
        ])
      }
      await store.actions.initTaskType({ dispatch, rootGetters }, false)
      expect(dispatch).toHaveBeenCalledWith('loadEpisodesWithTasks')
    })

    test('initTaskType reloads the episodes when one lacks its tasks', async () => {
      const dispatch = vi.fn().mockResolvedValue()
      const rootGetters = {
        currentTaskType: { for_entity: 'Episode' },
        // An episode created from the shot list holds its tasks, the
        // plain rows of the topbar next to it do not.
        episodeMap: new Map([
          ['ep-1', { id: 'ep-1', validations: new Map() }],
          ['ep-2', { id: 'ep-2' }]
        ])
      }
      await store.actions.initTaskType({ dispatch, rootGetters }, false)
      expect(dispatch).toHaveBeenCalledWith('loadEpisodesWithTasks')
    })

    test('initTaskType keeps the episodes loaded with their tasks', async () => {
      const dispatch = vi.fn().mockResolvedValue()
      const rootGetters = {
        currentTaskType: { for_entity: 'Episode' },
        episodeMap: new Map([
          ['ep-1', { id: 'ep-1', validations: new Map() }],
          ['ep-2', { id: 'ep-2', validations: new Map() }]
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

  describe('Episode task type page after the topbar', () => {
    const production = { id: 'p', name: 'Prod' }
    const plainEpisodes = [
      { id: 'ep-1', name: 'E01', status: 'running', data: {} },
      { id: 'ep-2', name: 'E02', status: 'running', data: {} }
    ]
    const task = {
      id: 'task-1',
      task_type_id: 'task-type-5',
      task_status_id: 'status-1',
      assignees: [],
      duration: 0,
      estimation: 0
    }
    const episodeTaskType = {
      id: 'task-type-5',
      name: 'Storyboard',
      for_entity: 'Episode',
      priority: 1
    }
    const route = {
      params: { production_id: 'p', task_type_id: 'task-type-5' }
    }

    const createPageStore = () =>
      createStore({
        state: { route },
        getters: {
          currentProduction: () => production,
          isTVShow: () => true,
          personMap: () => new Map(),
          route: () => route,
          taskMap: () => new Map(),
          taskStatusMap: () => new Map(),
          taskTypeMap: () => new Map([[episodeTaskType.id, episodeTaskType]]),
          userFilters: () => ({})
        },
        modules: {
          episodes: {
            state: { ...episodesStore.state },
            getters: episodesStore.getters,
            actions: episodesStore.actions,
            mutations: episodesStore.mutations
          },
          tasktypes: {
            state: { ...store.state },
            getters: {
              currentTaskType: () => episodeTaskType
            },
            actions: store.actions
          }
        }
      })

    beforeEach(() => {
      vi.spyOn(shotsApi, 'getEpisodes').mockResolvedValue(
        plainEpisodes.map(episode => ({ ...episode }))
      )
      vi.spyOn(shotsApi, 'getEpisodesWithTasks').mockResolvedValue([
        { ...plainEpisodes[0], tasks: [task] },
        { ...plainEpisodes[1], tasks: [] }
      ])
    })

    afterEach(() => {
      vi.restoreAllMocks()
      episodesStore.cache.episodeMap.clear()
    })

    test('lists the episodes with their tasks', async () => {
      const vuexStore = createPageStore()

      await vuexStore.dispatch('loadEpisodes')
      await vuexStore.dispatch('initTaskType', false)

      const episodeMap = vuexStore.getters.episodeMap
      expect(shotsApi.getEpisodesWithTasks).toHaveBeenCalledTimes(1)
      expect([...episodeMap.get('ep-1').validations]).toEqual([
        ['task-type-5', 'task-1']
      ])
      expect(episodeMap.get('ep-2').validations).toBeInstanceOf(Map)
    })

    test('lists the episodes with their tasks after an episode creation', async () => {
      const vuexStore = createPageStore()

      await vuexStore.dispatch('loadEpisodes')
      // Created from the shot list: the new episode alone holds its tasks.
      vuexStore.commit('NEW_EPISODE_END', {
        id: 'ep-3',
        name: 'E03',
        project_id: 'p'
      })
      await vuexStore.dispatch('initTaskType', false)

      const episodeMap = vuexStore.getters.episodeMap
      expect(shotsApi.getEpisodesWithTasks).toHaveBeenCalledTimes(1)
      expect([...episodeMap.get('ep-1').validations]).toEqual([
        ['task-type-5', 'task-1']
      ])
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

    test('LOAD_TASK_TYPES_END', () => {
      store.mutations.RESET_ALL(state)
      store.mutations.LOAD_TASK_TYPES_END(state, taskTypes)
      // Sorted into a new array: the given one is left as is.
      expect(state.taskTypes).toHaveLength(4)
      expect(state.taskTypes).toEqual(expect.arrayContaining(taskTypes))
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
