// @vitest-environment node

import { vi } from 'vitest'
import { computed, reactive } from 'vue'
import { createStore } from 'vuex'

// Importing the shots module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/store/api/client', () => ({
  default: {
    getModel: vi.fn(),
    pdel: vi.fn(),
    pget: vi.fn(),
    ppost: vi.fn(),
    ppostImport: vi.fn(),
    pput: vi.fn()
  }
}))

import shotsStore from '@/store/modules/shots'
import client from '@/store/api/client'
import entitiesApi from '@/store/api/entities'
import shotsApi from '@/store/api/shots'
import episodeStore from '@/store/modules/episodes'
import sequenceStore from '@/store/modules/sequences'
import tasksStore from '@/store/modules/tasks'
import taskStatusStore from '@/store/modules/taskstatus'
import taskTypesStore from '@/store/modules/tasktypes'
import { buildShotIndex } from '@/lib/indexing'
import { PAGE_SIZE } from '@/lib/pagination'
import {
  ADD_SHOT,
  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  CLEAR_SELECTED_TASKS,
  CREATE_TASKS_END,
  DELETE_TASK_END,
  IMPORT_SHOTS_END,
  LOAD_SHOTS_END,
  LOAD_TASK_END,
  LOCK_SHOT,
  NEW_TASK_END,
  REMOVE_SELECTED_TASK,
  REMOVE_SHOT_SEARCH_END,
  REMOVE_SHOT_SEARCH_FILTER_GROUP_END,
  RESET_ALL,
  SAVE_SHOT_SEARCH_END,
  SAVE_SHOT_SEARCH_FILTER_GROUP_END,
  SET_CURRENT_PRODUCTION,
  SET_PREVIEW,
  SET_SHOT_LIST_SCROLL_POSITION,
  SET_SHOT_SELECTION,
  SHOT_CSV_FILE_SELECTED,
  SORT_VALIDATION_COLUMNS,
  UNLOCK_SHOT,
  UPDATE_METADATA_DESCRIPTOR_END
} from '@/store/mutation-types'

describe('Shots store', () => {
  describe('loading flag lifecycle', () => {
    test('CLEAR_SHOTS resets the loading flag so a stale in-flight load cannot wedge the next one (BUG-4)', () => {
      const state = {
        isShotsLoading: true,
        isShotsLoadingError: true,
        shotsLoadingKey: 'p1/ep-a'
      }
      shotsStore.mutations.CLEAR_SHOTS(state)
      expect(state.isShotsLoading).toBe(false)
      expect(state.isShotsLoadingError).toBe(false)
      expect(state.shotsLoadingKey).toBe(null)
    })

    test('a concurrent same-scope caller shares the in-flight load instead of starting a second one (BUG-4)', async () => {
      const state = { isShotsLoading: false }
      const commit = vi.fn()
      // Never resolves: keeps the first load "in flight" for the assertions.
      const dispatch = vi.fn(() => new Promise(() => {}))
      const rootGetters = {
        currentProduction: { id: 'p-share' },
        episodes: [],
        userFilters: {},
        userFilterGroups: {},
        taskTypeMap: new Map(),
        personMap: new Map(),
        taskMap: new Map(),
        isTVShow: false,
        currentEpisode: null
      }

      // First call kicks off the load and stores the in-flight promise/key.
      const first = shotsStore.actions.loadShots({
        commit,
        dispatch,
        state,
        rootGetters
      })
      expect(commit.mock.calls.map(c => c[0])).toContain('LOAD_SHOTS_START')

      // Simulate the mutation the mocked commit did not apply.
      state.isShotsLoading = true
      commit.mockClear()

      // A concurrent caller for the same production+episode must get the very
      // same promise (not a fresh Promise.resolve()) and must not start a
      // second load — otherwise it races ahead with an empty shotMap.
      const second = shotsStore.actions.loadShots({
        commit,
        dispatch,
        state,
        rootGetters
      })
      expect(second).toBe(first)
      expect(commit.mock.calls.map(c => c[0])).not.toContain('LOAD_SHOTS_START')
    })

    test('a caller for a different episode does not adopt the in-flight load (BUG-4)', async () => {
      const commit = vi.fn()
      const dispatch = vi.fn(() => new Promise(() => {}))
      const baseGetters = {
        currentProduction: { id: 'p-switch' },
        episodes: [{ id: 'ep-a' }, { id: 'ep-b' }],
        userFilters: {},
        userFilterGroups: {},
        taskTypeMap: new Map(),
        personMap: new Map(),
        taskMap: new Map(),
        isTVShow: true
      }
      const state = { isShotsLoading: false }

      // Load episode A, then leave it in flight.
      const loadA = shotsStore.actions.loadShots({
        commit,
        dispatch,
        state,
        rootGetters: { ...baseGetters, currentEpisode: { id: 'ep-a' } }
      })
      state.isShotsLoading = true
      commit.mockClear()

      // Switching to episode B must NOT return A's promise: A's result would be
      // discarded by the episode stale-guard, leaving B with an empty shotMap.
      // Instead B gets a distinct promise that fetches B once A settles.
      const loadB = shotsStore.actions.loadShots({
        commit,
        dispatch,
        state,
        rootGetters: { ...baseGetters, currentEpisode: { id: 'ep-b' } }
      })
      expect(loadB).not.toBe(loadA)
      expect(commit.mock.calls.map(c => c[0])).not.toContain('LOAD_SHOTS_START')
    })
  })

  describe('batched deletion (PERF-4)', () => {
    const buildShot = (id, options = {}) => ({
      id,
      name: id,
      tasks: [],
      canceled: false,
      timeSpent: 10,
      estimation: 20,
      nb_frames: 5,
      nb_drawings: 2,
      sequence_name: 'SQ01',
      episode_name: 'E01',
      ...options
    })

    const buildState = shots => {
      shotsStore.cache.shotMap = new Map(shots.map(shot => [shot.id, shot]))
      shotsStore.cache.shots = [...shots]
      shotsStore.cache.result = [...shots]
      shotsStore.cache.shotIndex = buildShotIndex(shots)
      return {
        displayedShots: [...shots],
        displayedShotsTimeSpent: 100,
        displayedShotsEstimation: 200,
        displayedShotsFrames: 50,
        displayedShotsDrawings: 20,
        displayedShotsLength: shots.length
      }
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('REMOVE_SHOTS matches sequential REMOVE_SHOT/CANCEL_SHOT', () => {
      const buildFixture = () => [
        buildShot('shot-1'),
        buildShot('shot-2', { tasks: ['task-1'] }),
        buildShot('shot-3')
      ]

      const bulkShots = buildFixture()
      const bulkState = buildState(bulkShots)
      shotsStore.mutations.REMOVE_SHOTS(bulkState, {
        removedShots: [bulkShots[0], bulkShots[2]],
        canceledShots: [bulkShots[1]]
      })
      const bulkCache = {
        shots: shotsStore.cache.shots,
        result: shotsStore.cache.result,
        mapKeys: [...shotsStore.cache.shotMap.keys()]
      }

      const seqShots = buildFixture()
      const seqState = buildState(seqShots)
      shotsStore.mutations.REMOVE_SHOT(seqState, seqShots[0])
      shotsStore.mutations.REMOVE_SHOT(seqState, seqShots[2])
      shotsStore.mutations.CANCEL_SHOT(seqState, seqShots[1])

      expect(bulkState).toEqual(seqState)
      expect(bulkCache.shots).toEqual(shotsStore.cache.shots)
      expect(bulkCache.result).toEqual(shotsStore.cache.result)
      expect(bulkCache.mapKeys).toEqual([...shotsStore.cache.shotMap.keys()])
      expect(bulkShots[1].canceled).toBe(true)
    })

    test('deleteSelectedShots deletes in one request and commits once', async () => {
      const shotToRemove = buildShot('shot-1')
      const shotToCancel = buildShot('shot-2', { tasks: ['task-1'] })
      buildState([shotToRemove, shotToCancel])
      const state = {
        selectedShots: new Map([
          ['shot-1', shotToRemove],
          ['shot-2', shotToCancel]
        ])
      }
      const rootGetters = { currentProduction: { id: 'p1' } }

      vi.spyOn(entitiesApi, 'deleteEntities').mockResolvedValue()
      const commit = vi.fn()

      await shotsStore.actions.deleteSelectedShots({
        state,
        commit,
        rootGetters
      })

      expect(entitiesApi.deleteEntities).toHaveBeenCalledTimes(1)
      expect(entitiesApi.deleteEntities).toHaveBeenCalledWith(
        'p1',
        ['shot-1', 'shot-2'],
        false
      )
      expect(commit).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledWith('REMOVE_SHOTS', {
        removedShots: [shotToRemove],
        canceledShots: [shotToCancel]
      })
    })

    test('deleteSelectedShots forces the deletion of an already canceled selection', async () => {
      const canceledShot = buildShot('shot-1', {
        canceled: true,
        tasks: ['task-1']
      })
      buildState([canceledShot])
      const state = {
        selectedShots: new Map([['shot-1', canceledShot]])
      }
      const rootGetters = { currentProduction: { id: 'p1' } }

      vi.spyOn(entitiesApi, 'deleteEntities').mockResolvedValue()
      const commit = vi.fn()

      await shotsStore.actions.deleteSelectedShots({
        state,
        commit,
        rootGetters
      })

      expect(entitiesApi.deleteEntities).toHaveBeenCalledWith(
        'p1',
        ['shot-1'],
        true
      )
      // Really deleted server-side, so it leaves the list instead of staying
      // struck through.
      expect(commit).toHaveBeenCalledWith('REMOVE_SHOTS', {
        removedShots: [canceledShot],
        canceledShots: []
      })
    })

    test('a failed bulk deletion commits nothing', async () => {
      const shotOk = buildShot('shot-1')
      const shotKo = buildShot('shot-2')
      buildState([shotOk, shotKo])
      const state = {
        selectedShots: new Map([
          ['shot-1', shotOk],
          ['shot-2', shotKo]
        ])
      }
      const rootGetters = { currentProduction: { id: 'p1' } }

      vi.spyOn(entitiesApi, 'deleteEntities').mockRejectedValue(
        new Error('boom')
      )
      const commit = vi.fn()

      await expect(
        shotsStore.actions.deleteSelectedShots({ state, commit, rootGetters })
      ).rejects.toThrow('boom')
      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('all-episodes pseudo-episode', () => {
    const baseGetters = {
      currentProduction: { id: 'p-all' },
      episodes: [{ id: 'ep-a' }, { id: 'ep-b' }],
      userFilters: {},
      userFilterGroups: {},
      taskTypeMap: new Map(),
      personMap: new Map(),
      taskMap: new Map(),
      isTVShow: true
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    // Apply the real LOAD_SHOTS_START: the scope lives in the state the
    // getter serves and the response is checked against, not in the mocked
    // commit.
    const commitRecordingScope = state =>
      vi.fn((type, payload) => {
        if (type === 'LOAD_SHOTS_START') {
          shotsStore.mutations[type](state, payload)
        }
      })

    test('loads the whole production instead of no-oping on the all pseudo-episode', async () => {
      const getShots = vi.spyOn(shotsApi, 'getShots').mockResolvedValue([])
      const dispatch = vi.fn(() => Promise.resolve())
      const state = { isShotsLoading: false, shotsLoadingKey: null }
      const commit = commitRecordingScope(state)

      await shotsStore.actions.loadShots({
        commit,
        dispatch,
        state,
        rootGetters: { ...baseGetters, currentEpisode: { id: 'all' } }
      })

      expect(commit.mock.calls.map(c => c[0])).toContain('LOAD_SHOTS_START')
      // No episode_id on the wire: zou returns every shot of the project.
      expect(getShots).toHaveBeenCalledWith(baseGetters.currentProduction, null)
      expect(shotsStore.getters.shotsLoadingKey(state)).toBe('p-all/all')
    })

    test('still no-ops on the main pack (there is no main pack for shots)', async () => {
      const getShots = vi.spyOn(shotsApi, 'getShots').mockResolvedValue([])
      const commit = vi.fn()
      const dispatch = vi.fn(() => Promise.resolve())

      await shotsStore.actions.loadShots({
        commit,
        dispatch,
        state: { isShotsLoading: false },
        rootGetters: { ...baseGetters, currentEpisode: { id: 'main' } }
      })

      expect(getShots).not.toHaveBeenCalled()
      expect(commit.mock.calls.map(c => c[0])).not.toContain('LOAD_SHOTS_START')
    })

    test('an all-scoped response is applied while the view is still all', async () => {
      vi.spyOn(shotsApi, 'getShots').mockResolvedValue([
        { id: 's1', episode_id: 'ep-a', sequence_id: 'sq-1' }
      ])
      const state = { isShotsLoading: false }
      const commit = commitRecordingScope(state)
      const dispatch = vi.fn(() => Promise.resolve())

      await shotsStore.actions.loadShots({
        commit,
        dispatch,
        state,
        rootGetters: { ...baseGetters, currentEpisode: { id: 'all' } }
      })

      expect(commit.mock.calls.map(c => c[0])).toContain('LOAD_SHOTS_END')
      expect(commit.mock.calls.map(c => c[0])).not.toContain('END_SHOTS_LOADING')
    })

    test('a per-episode response is discarded once the view switched to all mid-load', async () => {
      const state = { isShotsLoading: false }
      const commit = commitRecordingScope(state)
      const dispatch = vi.fn(() => Promise.resolve())
      // Mutable so the getShots mock can flip it mid-flight, simulating the
      // user switching to All before the ep-a request resolves.
      const rootGetters = { ...baseGetters, currentEpisode: { id: 'ep-a' } }

      const getShots = vi.spyOn(shotsApi, 'getShots').mockImplementation(() => {
        rootGetters.currentEpisode = { id: 'all' }
        return Promise.resolve([
          { id: 's1', episode_id: 'ep-a', sequence_id: 'sq-1' }
        ])
      })

      await shotsStore.actions.loadShots({ commit, dispatch, state, rootGetters })

      expect(getShots).toHaveBeenCalledWith(baseGetters.currentProduction, {
        id: 'ep-a'
      })
      expect(commit.mock.calls.map(c => c[0])).not.toContain('LOAD_SHOTS_END')
      expect(commit.mock.calls.map(c => c[0])).toContain('END_SHOTS_LOADING')
    })

    // A production switch and back forgets the load in flight, and the load
    // started on return records its own scope: the late response must
    // neither land under that newer key nor end that load.
    test('drops a response whose scope a newer load replaced', async () => {
      vi.spyOn(shotsApi, 'getShots').mockResolvedValue([
        { id: 's1', episode_id: 'ep-a', sequence_id: 'sq-1' }
      ])
      const state = { isShotsLoading: false }
      const commit = commitRecordingScope(state)

      const loading = shotsStore.actions.loadShots({
        commit,
        dispatch: vi.fn(() => Promise.resolve()),
        state,
        rootGetters: { ...baseGetters, currentEpisode: { id: 'ep-a' } }
      })
      state.shotsLoadingKey = 'p-all/all'
      await loading

      const types = commit.mock.calls.map(c => c[0])
      expect(types).not.toContain('LOAD_SHOTS_END')
      expect(types).not.toContain('END_SHOTS_LOADING')
    })

    test('groups shots by sequence id so same-named sequences of two episodes stay apart', () => {
      const state = {
        displayedShots: [
          { id: 's1', sequence_id: 'sq-ep1', sequence_name: 'SQ010' },
          { id: 's2', sequence_id: 'sq-ep1', sequence_name: 'SQ010' },
          { id: 's3', sequence_id: 'sq-ep2', sequence_name: 'SQ010' }
        ]
      }
      const groups = shotsStore.getters.displayedShotsBySequence(state)
      expect(groups.map(g => g.map(s => s.id))).toEqual([['s1', 's2'], ['s3']])
    })
  })
})

describe('Shots store, END_SHOTS_LOADING', () => {
  // A response discarded after an episode switch ends the load with the
  // dataset emptied by LOAD_SHOTS_START: its scope must go with it.
  test('forgets the scope of the discarded load', () => {
    const state = { shotsLoadingKey: 'p1/ep-a', isShotsLoading: true }
    shotsStore.mutations.END_SHOTS_LOADING(state)
    expect(state.shotsLoadingKey).toBeNull()
    expect(state.isShotsLoading).toBe(false)
  })
})

describe('Shots store, LOAD_SHOTS_ERROR', () => {
  // The pages decide from the recorded scope whether a reload is needed: a
  // failed load must not leave its scope behind an empty dataset, or they
  // never retry.
  test('forgets the scope of the failed load', () => {
    const state = { shotsLoadingKey: 'p1/ep-a' }
    shotsStore.mutations.LOAD_SHOTS_ERROR(state)
    expect(state.shotsLoadingKey).toBeNull()
  })
})

describe('Shots store, loadShot live insertion', () => {
  // A socket event announces a shot created elsewhere: the scope comes from
  // the key the store recorded, not from the topbar, which may show another
  // page's episode by then.
  const rootGetters = {
    currentProduction: { id: 'p-live' },
    currentEpisode: { id: 'ep-a' },
    isTVShow: true,
    personMap: new Map(),
    people: [],
    taskMap: new Map(),
    taskStatusMap: new Map(),
    taskTypeMap: new Map()
  }

  const committedTypes = async (payload, shotsLoadingKey, shot) => {
    vi.spyOn(shotsApi, 'getShot').mockResolvedValue({ tasks: [], ...shot })
    const commit = vi.fn()
    await shotsStore.actions.loadShot(
      { commit, state: { shotsLoadingKey }, rootGetters },
      payload
    )
    return commit.mock.calls.map(([type]) => type)
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('skips a shot of another episode when asked to stay in scope', async () => {
    const types = await committedTypes(
      { shotId: 'sh-scope-1', onlyInScope: true },
      'p-live/ep-a',
      { id: 'sh-scope-1', episode_id: 'ep-b' }
    )
    expect(types).not.toContain('ADD_SHOT')
  })

  test('adds a shot of the loaded episode', async () => {
    const types = await committedTypes(
      { shotId: 'sh-scope-2', onlyInScope: true },
      'p-live/ep-a',
      { id: 'sh-scope-2', episode_id: 'ep-a' }
    )
    expect(types).toContain('ADD_SHOT')
  })

  test('adds any shot to a production-wide dataset', async () => {
    const types = await committedTypes(
      { shotId: 'sh-scope-3', onlyInScope: true },
      'p-live/all',
      { id: 'sh-scope-3', episode_id: 'ep-b' }
    )
    expect(types).toContain('ADD_SHOT')
  })

  test('skips a shot of another production', async () => {
    const types = await committedTypes(
      { shotId: 'sh-scope-5', onlyInScope: true },
      'p-live/all',
      { id: 'sh-scope-5', episode_id: 'ep-b', project_id: 'p-other' }
    )
    expect(types).not.toContain('ADD_SHOT')
  })

  test('still adds an out-of-scope shot loaded by id', async () => {
    const types = await committedTypes('sh-scope-4', 'p-live/ep-a', {
      id: 'sh-scope-4',
      episode_id: 'ep-b'
    })
    expect(types).toContain('ADD_SHOT')
  })

  // The list pages adopt the dataset on its recorded scope: they must refetch
  // it rather than show a row of another episode.
  test('marks the list partial for a shot loaded by id out of its scope', async () => {
    expect(
      await committedTypes('sh-other', 'p-live/ep-a', {
        id: 'sh-other',
        episode_id: 'ep-b',
        project_id: 'p-live'
      })
    ).toContain('MARK_SHOTS_PARTIAL')
  })

  // An update then a deletion within one round trip: the refresh must not
  // bring back the row the deletion removed.
  test('keeps out a displayed shot deleted during its refresh', async () => {
    shotsStore.cache.shotMap.set('sh-gone', { id: 'sh-gone' })
    vi.spyOn(shotsApi, 'getShot').mockImplementation(async () => {
      shotsStore.cache.shotMap.delete('sh-gone')
      return {
        id: 'sh-gone',
        episode_id: 'ep-a',
        project_id: 'p-live',
        tasks: []
      }
    })
    const commit = vi.fn()

    await shotsStore.actions.loadShot(
      { commit, state: { shotsLoadingKey: 'p-live/ep-a' }, rootGetters },
      { shotId: 'sh-gone', onlyInScope: true }
    )

    expect(commit).not.toHaveBeenCalled()
  })
})

describe('Shots store, live insertion during a list load', () => {
  const rootGetters = {
    currentProduction: { id: 'p-live' },
    currentEpisode: { id: 'ep-a' },
    isTVShow: true,
    personMap: new Map(),
    people: [],
    taskMap: new Map(),
    taskStatusMap: new Map(),
    taskTypeMap: new Map()
  }

  afterEach(() => {
    shotsStore.cache.shotsLoadingPromise = null
    shotsStore.cache.shotMap.delete('sh-flight-3')
    vi.restoreAllMocks()
  })

  // The list load replaces the whole dataset: inserting before its response
  // lands drops the shot, and no second event ever announces it again.
  test('waits for the list in flight before inserting', async () => {
    vi.spyOn(shotsApi, 'getShot').mockResolvedValue({
      id: 'sh-flight-1',
      episode_id: 'ep-a',
      project_id: 'p-live',
      tasks: []
    })
    let endList
    const state = { isShotsLoading: true, shotsLoadingKey: 'p-live/ep-a' }
    shotsStore.cache.shotsLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.isShotsLoading = false
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = shotsStore.actions.loadShot(
      { commit, state, rootGetters },
      { shotId: 'sh-flight-1', onlyInScope: true }
    )
    await Promise.resolve()
    expect(commit.mock.calls.map(([type]) => type)).not.toContain('ADD_SHOT')

    endList()
    await loading
    expect(commit.mock.calls.map(([type]) => type)).toContain('ADD_SHOT')
  })

  // The fetch waits for the list response: issued after it, the payload is
  // the younger one and refreshes the row the list rebuilt.
  test('fetches once the list load settled and refreshes the row', async () => {
    vi.spyOn(shotsApi, 'getShot').mockResolvedValue({
      id: 'sh-flight-3',
      episode_id: 'ep-a',
      project_id: 'p-live',
      nb_frames: 10,
      tasks: []
    })
    let endList
    const state = { isShotsLoading: true, shotsLoadingKey: 'p-live/ep-a' }
    shotsStore.cache.shotsLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.isShotsLoading = false
        shotsStore.cache.shotMap.set('sh-flight-3', {
          id: 'sh-flight-3',
          nb_frames: 20
        })
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = shotsStore.actions.loadShot(
      { commit, state, rootGetters },
      { shotId: 'sh-flight-3', onlyInScope: true }
    )
    await Promise.resolve()
    expect(shotsApi.getShot).not.toHaveBeenCalled()
    endList()
    await loading

    expect(shotsApi.getShot).toHaveBeenCalledWith('sh-flight-3')
    expect(commit.mock.calls).toEqual([
      ['UPDATE_SHOT', expect.objectContaining({ nb_frames: 10 })]
    ])
  })

  test('drops the shot when the list in flight was another episode', async () => {
    vi.spyOn(shotsApi, 'getShot').mockResolvedValue({
      id: 'sh-flight-2',
      episode_id: 'ep-a',
      project_id: 'p-live',
      tasks: []
    })
    let endList
    const state = { isShotsLoading: true, shotsLoadingKey: 'p-live/ep-a' }
    shotsStore.cache.shotsLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.isShotsLoading = false
        state.shotsLoadingKey = 'p-live/ep-b'
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = shotsStore.actions.loadShot(
      { commit, state, rootGetters },
      { shotId: 'sh-flight-2', onlyInScope: true }
    )
    await Promise.resolve()
    endList()
    await loading

    expect(commit.mock.calls.map(([type]) => type)).not.toContain('ADD_SHOT')
  })
})

describe('Shots store, UPDATE_SHOT', () => {
  afterEach(() => {
    shotsStore.cache.shotMap.delete('sh-upd')
  })

  // A colleague's edit refetches the full entity, whose tasks are objects:
  // the cached ids must survive it, or the task lists come out empty.
  test('keeps the cached task ids', () => {
    shotsStore.cache.shotMap.set('sh-upd', {
      id: 'sh-upd',
      name: 'old',
      tasks: ['t1']
    })
    shotsStore.mutations.UPDATE_SHOT(
      { displayedShots: [] },
      { id: 'sh-upd', name: 'new', tasks: [{ id: 't1' }] }
    )
    expect(shotsStore.cache.shotMap.get('sh-upd')).toMatchObject({
      name: 'new',
      tasks: ['t1']
    })
  })

  // The list reads the displayed shots through the reactive state: a change
  // made to the raw object of the cache does not reach it.
  test('shows the new name of a shot another user renamed', () => {
    const shot = { id: 'sh-upd', name: 'SH020', tasks: [] }
    shotsStore.cache.shotMap.set(shot.id, shot)
    const state = reactive({ displayedShots: [shot] })
    const names = computed(() => state.displayedShots.map(({ name }) => name))
    expect(names.value).toEqual(['SH020'])

    shotsStore.mutations.UPDATE_SHOT(state, { id: 'sh-upd', name: 'SH999' })

    expect(names.value).toEqual(['SH999'])
  })
})

describe('Shots store, MARK_SHOTS_PARTIAL', () => {
  test('marks the recorded scope once, and nothing when none is recorded', () => {
    const state = { shotsLoadingKey: 'p1/ep-a' }
    shotsStore.mutations.MARK_SHOTS_PARTIAL(state)
    shotsStore.mutations.MARK_SHOTS_PARTIAL(state)
    expect(state.shotsLoadingKey).toBe('p1/ep-a#partial')

    const empty = { shotsLoadingKey: null }
    shotsStore.mutations.MARK_SHOTS_PARTIAL(empty)
    expect(empty.shotsLoadingKey).toBeNull()
  })
})

// zou emits shot:new before the creation response lands, so the socket
// handler inserts the shot first: the response must not append a copy.
describe('Shots store, NEW_SHOT_END', () => {
  test('does not duplicate a shot the socket handler already added', () => {
    sequenceStore.cache.sequenceMap.set('sq-1', {
      id: 'sq-1',
      name: 'SQ01',
      parent_id: 'ep-1'
    })
    shotsStore.cache.shots = []
    shotsStore.cache.shotMap = new Map()
    shotsStore.cache.shotIndex = {}
    const state = { displayedShots: [], shotSearchText: '' }
    const shot = {
      id: 'shot-1',
      name: 'SH01',
      parent_id: 'sq-1',
      project_id: 'p-1',
      data: {}
    }

    shotsStore.mutations.NEW_SHOT_END(state, {
      shot: { ...shot },
      episodeMap: new Map()
    })
    shotsStore.mutations.NEW_SHOT_END(state, {
      shot: { ...shot },
      episodeMap: new Map()
    })

    expect(shotsStore.cache.shots.map(({ id }) => id)).toEqual(['shot-1'])
    expect(state.displayedShots.map(({ id }) => id)).toEqual(['shot-1'])
  })

  // A created shot has no time yet: the footer hides totals that are no
  // numbers.
  test('keeps the time totals of the list', () => {
    sequenceStore.cache.sequenceMap.set('sq-1', { id: 'sq-1', name: 'SQ01' })
    const listedShot = {
      id: 'shot-1',
      name: 'SH01',
      sequence_name: 'SQ01',
      nb_frames: 24,
      timeSpent: 240,
      estimation: 480
    }
    shotsStore.cache.shots = [listedShot]
    shotsStore.cache.shotMap = new Map([[listedShot.id, listedShot]])
    shotsStore.cache.shotIndex = {}
    const state = { displayedShots: [listedShot], shotSearchText: '' }

    shotsStore.mutations.NEW_SHOT_END(state, {
      shot: { id: 'shot-2', name: 'SH02', parent_id: 'sq-1', nb_frames: 0 },
      episodeMap: new Map()
    })

    expect(state.displayedShotsTimeSpent).toBe(240)
    expect(state.displayedShotsEstimation).toBe(480)
  })
})

// A shot created by someone else reaches the list through the socket handler.
describe('Shots store, ADD_SHOT', () => {
  const buildShot = (id, name, fields = {}) => ({
    id,
    name,
    sequence_name: 'SQ01',
    nb_frames: 24,
    data: {},
    tasks: [],
    timeSpent: 0,
    estimation: 0,
    ...fields
  })
  const names = shots => shots.map(({ name }) => name)

  // A list load leaves the result and the list as the same array.
  const loadList = (shots, shotSearchText = '', result = shots) => {
    shotsStore.cache.shots = shots
    shotsStore.cache.result = result
    shotsStore.cache.shotMap = new Map(shots.map(shot => [shot.id, shot]))
    shotsStore.cache.shotIndex = {}
    return {
      shotSearchText,
      displayedShots: [...result],
      displayedShotsCount: result.length,
      displayedShotsLength: result.length,
      displayedShotsTimeSpent: 0,
      displayedShotsEstimation: 0,
      shotSelectionGrid: new Set()
    }
  }

  const addShot = (state, shot, fields = {}) =>
    shotsStore.mutations.ADD_SHOT(state, {
      taskStatusMap: new Map(),
      taskTypeMap: new Map(),
      taskMap: new Map(),
      persons: [],
      personMap: new Map(),
      production: { id: 'p1', name: 'Prod', descriptors: [] },
      shot,
      ...fields
    })

  test('shows the shot with no search', () => {
    const state = loadList([
      buildShot('s1', 'SH010'),
      buildShot('s2', 'SH020')
    ])

    addShot(state, buildShot('s3', 'SH030'))

    const all = ['SH010', 'SH020', 'SH030']
    expect(names(state.displayedShots)).toEqual(all)
    expect(names(shotsStore.cache.shots)).toEqual(all)
    expect(names(shotsStore.cache.result)).toEqual(all)
    expect(state.displayedShotsCount).toBe(3)
    expect(state.displayedShotsLength).toBe(3)
  })

  test('shows the shot once a deletion parted the result from the list', () => {
    const state = loadList([
      buildShot('s1', 'SH010'),
      buildShot('s2', 'SH020'),
      buildShot('s3', 'SH030')
    ])
    shotsStore.mutations.REMOVE_SHOT(state, { id: 's1' })

    addShot(state, buildShot('s4', 'SH040'))

    const left = ['SH020', 'SH030', 'SH040']
    expect(names(state.displayedShots)).toEqual(left)
    expect(names(shotsStore.cache.shots)).toEqual(left)
    expect(names(shotsStore.cache.result)).toEqual(left)
    expect(state.displayedShotsCount).toBe(3)
  })

  // The cells of a list are keyed by their position.
  test('keeps the selected cells on their rows', () => {
    const state = loadList([
      buildShot('s1', 'SH010'),
      buildShot('s2', 'SH030')
    ])
    state.shotSelectionGrid = new Set(['0-1', '1-1'])

    addShot(state, buildShot('s3', 'SH020'))

    expect([...state.shotSelectionGrid]).toEqual(['0-1', '2-1'])
  })

  describe('on a full page', () => {
    const loadPage = () => {
      const shots = Array.from({ length: PAGE_SIZE + 5 }, (_, index) =>
        buildShot(`s${index}`, `SH${String(index + 1).padStart(3, '0')}`)
      )
      return {
        ...loadList(shots),
        displayedShots: shots.slice(0, PAGE_SIZE),
        shotFilledColumns: 'columns of the page',
        shotSelectionGrid: new Set(['1-0'])
      }
    }

    test('leaves a shot sorted past the page to the next page', () => {
      const state = loadPage()

      addShot(state, buildShot('s-new', 'SH999'))

      expect(state.displayedShots).toHaveLength(PAGE_SIZE)
      expect(state.displayedShots.map(({ id }) => id)).not.toContain('s-new')
      expect(state.shotFilledColumns).toBe('columns of the page')
      expect([...state.shotSelectionGrid]).toEqual(['1-0'])
      expect(state.displayedShotsCount).toBe(PAGE_SIZE + 6)

      shotsStore.mutations.DISPLAY_MORE_SHOTS(state, {})

      expect(state.displayedShots).toHaveLength(PAGE_SIZE + 6)
      expect(state.displayedShots.at(-1).id).toBe('s-new')
    })

    test('stays full with a shot sorted among its rows', () => {
      const state = loadPage()
      const lastRow = state.displayedShots.at(-1)

      addShot(state, buildShot('s-new', 'SH000'))

      expect(state.displayedShots).toHaveLength(PAGE_SIZE)
      expect(state.displayedShots[0].id).toBe('s-new')
      expect(state.displayedShots).not.toContain(lastRow)
      expect([...state.shotSelectionGrid]).toEqual(['2-0'])
    })

    test('moves the selected cells of the next pages along', () => {
      const state = loadPage()
      state.shotSelectionGrid = new Set(['1-0', '103-0'])

      addShot(state, buildShot('s-new', 'SH102b'))

      expect(state.displayedShots).toHaveLength(PAGE_SIZE)
      expect([...state.shotSelectionGrid]).toEqual(['1-0', '104-0'])
    })

    test('leaves a shot sorted past the rows of a list holding more', () => {
      const state = loadPage()
      state.displayedShots = state.displayedShots.slice(0, PAGE_SIZE - 1)

      addShot(state, buildShot('s-new', 'SH999'))

      expect(state.displayedShots).toHaveLength(PAGE_SIZE - 1)
    })
  })

  // A creation feeds the list only, and a deletion leaves the result behind.
  test('counts a shot created since a deletion', () => {
    sequenceStore.cache.sequenceMap.set('sq-1', { id: 'sq-1', name: 'SQ01' })
    const state = loadList([
      buildShot('s1', 'SH010'),
      buildShot('s2', 'SH020')
    ])
    shotsStore.mutations.REMOVE_SHOT(state, { id: 's1' })
    shotsStore.mutations.NEW_SHOT_END(state, {
      shot: { id: 's3', name: 'SH030', parent_id: 'sq-1', nb_frames: 0 },
      episodeMap: new Map()
    })

    addShot(state, buildShot('s4', 'SH040'))

    const left = ['SH020', 'SH030', 'SH040']
    expect(names(state.displayedShots)).toEqual(left)
    expect(names(shotsStore.cache.result)).toEqual(left)
    expect(state.displayedShotsCount).toBe(3)
  })

  test('adds the shot to the totals of the list', () => {
    const state = loadList([
      buildShot('s1', 'SH010', { timeSpent: 60, estimation: 120 })
    ])
    const tasks = [
      {
        id: 't1',
        task_type_id: 'tt-anim',
        task_status_id: 'ts-todo',
        duration: 30,
        estimation: 90,
        assignees: []
      }
    ]

    addShot(state, buildShot('s2', 'SH020', { tasks }), {
      taskMap: new Map()
    })

    expect(state.displayedShotsTimeSpent).toBe(90)
    expect(state.displayedShotsEstimation).toBe(210)
    expect(state.displayedShotsFrames).toBe(48)
  })

  // Between a list load and its search, the result is the whole list.
  test('lists the shot once when the search has not run yet', () => {
    const state = loadList([buildShot('s1', 'SH010')], 'SH0')

    addShot(state, buildShot('s2', 'SH020'))

    expect(names(shotsStore.cache.shots)).toEqual(['SH010', 'SH020'])
  })

  test('counts the search, not the list, for a shot it asks for', () => {
    const shots = [
      buildShot('s1', 'SH010'),
      buildShot('s2', 'SH020'),
      buildShot('s3', 'SH090')
    ]
    const state = loadList(shots, 'SH09', [shots[2]])

    addShot(state, buildShot('s4', 'SH091'))

    expect(names(state.displayedShots)).toEqual(['SH090', 'SH091'])
    expect(names(shotsStore.cache.result)).toEqual(['SH090', 'SH091'])
    expect(shotsStore.cache.shots).toHaveLength(4)
    expect(state.displayedShotsCount).toBe(2)
  })

  test('keeps the rows of a search that does not ask for the shot', () => {
    const shots = [buildShot('s1', 'SH010'), buildShot('s2', 'SH020')]
    const state = loadList(shots, 'SH01', [shots[0]])

    addShot(state, buildShot('s3', 'SH090'))

    expect(names(state.displayedShots)).toEqual(['SH010'])
    expect(names(shotsStore.cache.result)).toEqual(['SH010'])
    expect(shotsStore.cache.shots).toHaveLength(3)
    expect(state.displayedShotsCount).toBe(1)
  })

  describe('through loadShot', () => {
    const load = (state, shot) => {
      vi.spyOn(shotsApi, 'getShot').mockResolvedValue(shot)
      return shotsStore.actions.loadShot(
        {
          commit: (type, payload) =>
            shotsStore.mutations[type]?.(state, payload),
          state,
          rootGetters: {
            currentProduction: { id: 'p1', descriptors: [] },
            people: [],
            personMap: new Map(),
            taskMap: new Map(),
            taskStatusMap: new Map(),
            taskTypeMap: new Map()
          }
        },
        shot.id
      )
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('shows a shot of the loaded list', async () => {
      const state = {
        ...loadList([buildShot('s1', 'SH010')]),
        shotsLoadingKey: 'p1/'
      }

      await load(state, buildShot('s2', 'SH020', { project_id: 'p1' }))

      expect(names(state.displayedShots)).toEqual(['SH010', 'SH020'])
    })

    // A detail page loads its shot whatever the list holds, and a page reads
    // no row as no list.
    test.each([
      ['no list is loaded', null, 'ep-1'],
      ['the list holds another episode', 'p1/ep-2', 'ep-1']
    ])('leaves the rows alone when %s', async (_, loadingKey, episodeId) => {
      const state = { ...loadList([]), shotsLoadingKey: loadingKey }

      await load(
        state,
        buildShot('s2', 'SH020', { project_id: 'p1', episode_id: episodeId })
      )

      expect(state.displayedShots).toEqual([])
      expect(state.displayedShotsCount).toBe(0)
      expect(shotsStore.cache.shotMap.has('s2')).toBe(true)
    })
  })

  // Such a search has no keyword: the test threw on the shot.
  describe('with a search made of filters only', () => {
    const taskTypeMap = new Map([
      ['tt-anim', { id: 'tt-anim', name: 'Animation', for_entity: 'Shot' }]
    ])
    const taskStatusMap = new Map([
      ['ts-todo', { id: 'ts-todo', name: 'Todo', short_name: 'todo' }],
      ['ts-wip', { id: 'ts-wip', name: 'WIP', short_name: 'wip' }]
    ])
    const addShotWithStatus = (state, id, taskStatusId) => {
      const task = {
        id: `task-${id}`,
        task_type_id: 'tt-anim',
        task_status_id: taskStatusId,
        duration: 0,
        estimation: 0,
        assignees: []
      }
      addShot(state, buildShot(id, `SH0${id}`, { tasks: [task] }), {
        taskStatusMap,
        taskTypeMap,
        taskMap: new Map()
      })
    }

    beforeEach(() => {
      taskTypesStore.cache.taskTypeMap.set('tt-anim', {
        id: 'tt-anim',
        name: 'Animation',
        priority: 1
      })
    })

    afterEach(() => {
      taskTypesStore.cache.taskTypeMap.delete('tt-anim')
    })

    test('shows a shot the filters ask for', () => {
      const shots = [buildShot('s1', 'SH010')]
      const state = loadList(shots, 'animation=todo', [])

      addShotWithStatus(state, '20', 'ts-todo')

      expect(names(state.displayedShots)).toEqual(['SH020'])
      expect(state.displayedShotsCount).toBe(1)
    })

    test('keeps out a shot the filters do not ask for', () => {
      const shots = [buildShot('s1', 'SH010')]
      const state = loadList(shots, 'animation=todo', [])

      addShotWithStatus(state, '20', 'ts-wip')

      expect(state.displayedShots).toEqual([])
      expect(state.displayedShotsCount).toBe(0)
    })
  })
})

// A frame in of 0 is a value: the edit must reveal the Frame In column, as
// the list load and the creation do.
describe('Shots store, EDIT_SHOT_END', () => {
  const editShot = data => {
    const shot = { id: 'sh-edit', name: 'SH01', parent_id: 'sq-1', data: {} }
    shotsStore.cache.shots = [shot]
    shotsStore.cache.shotMap = new Map([[shot.id, shot]])
    shotsStore.cache.shotIndex = {}
    const state = {
      displayedShots: [shot],
      shotSearchText: '',
      isFrameIn: false
    }
    shotsStore.mutations.EDIT_SHOT_END(state, {
      newShot: { id: shot.id, data },
      sequences: []
    })
    return state
  }

  test('shows the frame in column for a frame in of 0', () => {
    expect(editShot({ frame_in: 0 }).isFrameIn).toBe(true)
  })

  test('keeps the frame in column hidden without a frame in', () => {
    expect(editShot({ handle_in: 12 }).isFrameIn).toBe(false)
  })

  // The edit modal sends its untouched frame in field as an empty string.
  test('keeps the frame in column hidden for an empty frame in', () => {
    expect(editShot({ frame_in: '' }).isFrameIn).toBe(false)
  })
})

// The task panel's preview player trims shots from pages that never load the
// shots list (news feed, my tasks): the edit payload only holds the id and
// the data.
describe('Shots store, editShot', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('saves a shot missing from the loaded list without adding it', async () => {
    shotsStore.cache.shots = []
    shotsStore.cache.shotMap = new Map()
    vi.spyOn(shotsApi, 'updateShot').mockResolvedValue({})
    const state = { displayedShots: [], shotSearchText: '' }
    const commit = (type, payload) => shotsStore.mutations[type](state, payload)
    const edit = { id: 'sh-trim', data: { handle_in: 12 } }

    await shotsStore.actions.editShot(
      { commit, rootGetters: { displayedSequences: [] } },
      edit
    )

    expect(shotsApi.updateShot).toHaveBeenCalledWith(edit)
    expect(shotsStore.cache.shots).toEqual([])
    expect(shotsStore.cache.shotMap.size).toBe(0)
  })

  // The list and the pages show an edit before Zou answers.
  test('puts back what an edit Zou refuses changed', async () => {
    const shot = {
      id: 'sh-1',
      name: 'SH01',
      sequence_name: 'SQ01',
      description: '',
      data: { fps: 24 },
      nb_frames: 24
    }
    shotsStore.cache.shots = [shot]
    shotsStore.cache.shotMap = new Map([[shot.id, shot]])
    shotsStore.cache.shotIndex = buildShotIndex([shot])
    vi.spyOn(shotsApi, 'updateShot').mockRejectedValue(new Error('Bad Request'))
    const state = { displayedShots: [shot], shotSearchText: '' }
    const commit = (type, payload) => shotsStore.mutations[type](state, payload)

    await expect(
      shotsStore.actions.editShot(
        { commit, rootGetters: { displayedSequences: [] } },
        { id: shot.id, name: 'SH02', description: 'Wide', data: { fps: 25 } }
      )
    ).rejects.toThrow('Bad Request')

    expect(shot).toMatchObject({
      name: 'SH01',
      description: '',
      data: { fps: 24 }
    })
    expect(state.displayedShots[0]).toMatchObject({
      name: 'SH01',
      description: ''
    })
  })
})

// The inline cells of the shots list save on every keystroke: the edits of a
// shot dispatched within the delay are merged into one request, so a typed
// number reaches the server (and its version history) as a single value.
describe('Shots store, editShotDebounced', () => {
  const buildContext = () => {
    const shot = {
      id: 'sh-typed',
      name: 'SH01',
      sequence_name: 'SQ01',
      data: { frame_out: 100 },
      nb_frames: 50
    }
    const other = {
      id: 'sh-other',
      name: 'SH02',
      sequence_name: 'SQ01',
      data: { frame_out: 200 },
      nb_frames: 50
    }
    shotsStore.cache.shots = [shot, other]
    shotsStore.cache.shotMap = new Map([
      [shot.id, shot],
      [other.id, other]
    ])
    shotsStore.cache.shotIndex = buildShotIndex([shot, other])
    const state = { displayedShots: [shot, other], shotSearchText: '' }
    const commit = (type, payload) => shotsStore.mutations[type](state, payload)
    const context = { commit, rootGetters: { displayedSequences: [] } }
    const edit = (id, data) =>
      shotsStore.actions.editShotDebounced(context, { id, ...data })
    return { shot, other, state, edit }
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(shotsApi, 'updateShot').mockResolvedValue({})
  })

  afterEach(async () => {
    // Flush the pending edit of a failed test so it cannot leak into the next.
    await vi.runOnlyPendingTimersAsync()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('merges the keystrokes of a shot into one request holding the last values', async () => {
    const { shot, state, edit } = buildContext()

    const first = edit(shot.id, { data: { frame_in: 1 }, nb_frames: 100 })
    const second = edit(shot.id, { data: { frame_in: 12 }, nb_frames: 89 })

    // The list shows the typed value at once, the request waits.
    expect(state.displayedShots[0].data.frame_in).toBe(12)
    expect(shotsApi.updateShot).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(400)

    expect(shotsApi.updateShot).toHaveBeenCalledTimes(1)
    expect(shotsApi.updateShot).toHaveBeenCalledWith({
      id: shot.id,
      data: { frame_in: 12 },
      nb_frames: 89
    })
    await expect(Promise.all([first, second])).resolves.toEqual([{}, {}])
  })

  test('keeps the fields an edit of another cell does not carry', async () => {
    const { shot, edit } = buildContext()

    edit(shot.id, { data: { frame_in: 12 }, nb_frames: 89 })
    edit(shot.id, { data: { frame_out: 120 } })
    await vi.advanceTimersByTimeAsync(400)

    expect(shotsApi.updateShot).toHaveBeenCalledWith({
      id: shot.id,
      data: { frame_in: 12, frame_out: 120 },
      nb_frames: 89
    })
  })

  test('restarts the delay on each keystroke', async () => {
    const { shot, edit } = buildContext()

    edit(shot.id, { data: { frame_in: 1 } })
    await vi.advanceTimersByTimeAsync(300)
    edit(shot.id, { data: { frame_in: 12 } })
    await vi.advanceTimersByTimeAsync(300)
    expect(shotsApi.updateShot).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(100)
    expect(shotsApi.updateShot).toHaveBeenCalledTimes(1)
  })

  test('sends one request per shot', async () => {
    const { shot, other, edit } = buildContext()

    edit(shot.id, { data: { frame_in: 1 } })
    edit(other.id, { data: { frame_in: 1 } })
    edit(shot.id, { data: { frame_in: 12 } })
    await vi.advanceTimersByTimeAsync(400)

    const sent = shotsApi.updateShot.mock.calls.map(([data]) => data)
    expect(sent.sort((a, b) => a.id.localeCompare(b.id))).toEqual([
      { id: other.id, data: { frame_in: 1 } },
      { id: shot.id, data: { frame_in: 12 } }
    ])
  })

  test('keeps the shot locked until 2 s after the shared request settles', async () => {
    const { shot, edit } = buildContext()

    edit(shot.id, { data: { frame_in: 1 } })
    edit(shot.id, { data: { frame_in: 12 } })
    expect(shot.lock).toBe(2)

    await vi.advanceTimersByTimeAsync(400 + 1999)
    expect(shot.lock).toBe(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(shot.lock).toBe(0)
  })

  test('puts back what the merged edits of a refused request changed', async () => {
    shotsApi.updateShot.mockRejectedValue(new Error('offline'))
    const { shot, state, edit } = buildContext()

    const settled = Promise.allSettled([
      edit(shot.id, { data: { frame_in: 1 }, nb_frames: 100 }),
      edit(shot.id, { data: { frame_in: 12 }, nb_frames: 89 })
    ])
    await vi.advanceTimersByTimeAsync(400)
    await settled

    expect(shot.nb_frames).toBe(50)
    expect(shot.data.frame_in).toBeUndefined()
    expect(shot.data.frame_out).toBe(100)
    expect(state.displayedShots[0].nb_frames).toBe(50)
  })

  test('rejects every merged call when the request fails', async () => {
    shotsApi.updateShot.mockRejectedValue(new Error('offline'))
    const { shot, edit } = buildContext()

    const settled = Promise.allSettled([
      edit(shot.id, { data: { frame_in: 1 } }),
      edit(shot.id, { data: { frame_in: 12 } })
    ])
    await vi.advanceTimersByTimeAsync(400)

    expect(shotsApi.updateShot).toHaveBeenCalledTimes(1)
    expect((await settled).map(({ status }) => status)).toEqual([
      'rejected',
      'rejected'
    ])
    await vi.advanceTimersByTimeAsync(2000)
    expect(shot.lock).toBe(0)
  })
})

describe('Shots store, getShotsCsvLines', () => {
  test('exports the base columns when the production has no descriptors key', () => {
    shotsStore.cache.shots = [
      { id: 's1', sequence_name: 'SEQ01', name: 'SH01', description: '' }
    ]
    shotsStore.cache.result = []
    const rootGetters = {
      currentProduction: { id: 'p1' },
      isTVShow: false,
      organisation: { hours_by_day: 8 },
      personMap: new Map(),
      taskMap: new Map()
    }
    const state = { shotValidationColumns: [] }

    const lines = shotsStore.actions.getShotsCsvLines({ state, rootGetters })

    expect(lines).toEqual([['SEQ01', 'SH01', '']])
  })

  test('orders the descriptor columns by name and skips the other entity types', () => {
    const shot = {
      id: 's1',
      sequence_name: 'SEQ01',
      name: 'SH01',
      description: '',
      data: { zeta: 'z', alpha: 'a', other: 'x' },
      validations: new Map()
    }
    shotsStore.cache.shots = [shot]
    shotsStore.cache.result = []
    const rootGetters = {
      currentProduction: {
        id: 'p1',
        descriptors: [
          {
            name: 'Zeta',
            field_name: 'zeta',
            data_type: 'string',
            entity_type: 'Shot'
          },
          {
            name: 'Alpha',
            field_name: 'alpha',
            data_type: 'string',
            entity_type: 'Shot'
          },
          {
            name: 'Other',
            field_name: 'other',
            data_type: 'string',
            entity_type: 'Asset'
          }
        ]
      },
      isTVShow: false,
      organisation: { hours_by_day: 8 },
      personMap: new Map(),
      taskMap: new Map()
    }
    const state = { shotValidationColumns: [] }

    const lines = shotsStore.actions.getShotsCsvLines({ state, rootGetters })

    expect(lines[0].slice(3)).toEqual(['a', 'z'])
  })
})

describe('Shots store, list totals', () => {
  test.each(['CLEAR_SHOTS', 'LOAD_SHOTS_START'])(
    '%s resets the totals of the list',
    mutation => {
      const state = {
        displayedShotsCount: 2,
        displayedShotsLength: 2,
        displayedShotsTimeSpent: 960,
        displayedShotsEstimation: 1440,
        displayedShotsFrames: 150,
        displayedShotsDrawings: 12
      }

      shotsStore.mutations[mutation](state)

      expect(state).toMatchObject({
        displayedShotsCount: 0,
        displayedShotsLength: 0,
        displayedShotsTimeSpent: 0,
        displayedShotsEstimation: 0,
        displayedShotsFrames: 0,
        displayedShotsDrawings: 0
      })
    }
  )
})

describe('Shots store, through a store', () => {
  const production = { id: 'p1', name: 'Agent 327' }
  const taskTypeMap = new Map([
    ['tt-anim', { id: 'tt-anim', name: 'Animation', priority: 2 }],
    ['tt-layout', { id: 'tt-layout', name: 'Layout', priority: 1 }]
  ])
  const sequenceMap = new Map([
    ['sq1', { id: 'sq1', name: 'SQ01', parent_id: 'ep1' }],
    ['sq2', { id: 'sq2', name: 'SQ02', parent_id: 'ep1' }]
  ])
  const episodeMap = new Map([['ep1', { id: 'ep1', name: 'E01' }]])

  let taskMap
  let rootActions

  const buildState = () => ({
    shotSearchText: '',
    shotSearchQueries: [],
    shotSearchFilterGroups: [],
    shotSorting: [],
    isFps: false,
    isFrames: false,
    isFrameIn: false,
    isFrameOut: false,
    isMaxRetakes: false,
    isResolution: false,
    isShotDescription: false,
    isShotEstimation: false,
    isShotTime: false,
    displayedShots: [],
    displayedShotsCount: 0,
    displayedShotsLength: 0,
    displayedShotsTimeSpent: 0,
    displayedShotsEstimation: 0,
    displayedShotsFrames: 0,
    displayedShotsDrawings: 0,
    shotFilledColumns: {},
    shotSelectionGrid: new Set(),
    isShotsLoading: false,
    isShotsLoadingError: false,
    shotsLoadingKey: null,
    shotsCsvFormData: null,
    shotListScrollPosition: 0,
    shotValidationColumns: [],
    selectedShots: new Map()
  })

  const buildStore = ({
    isTVShow = false,
    currentEpisode = null,
    shotTaskTypeIds = []
  } = {}) =>
    createStore({
      modules: {
        shots: {
          // The actions read the module state directly, as in the app.
          state: shotsStore.state,
          getters: shotsStore.getters,
          actions: shotsStore.actions,
          mutations: shotsStore.mutations
        }
      },
      getters: {
        currentEpisode: () => currentEpisode,
        currentProduction: () => production,
        isTVShow: () => isTVShow,
        people: () => [],
        personMap: () => new Map(),
        productionShotTaskTypeIds: () => shotTaskTypeIds,
        taskMap: () => taskMap,
        taskStatus: () => [],
        taskStatusMap: () => new Map(),
        taskTypeMap: () => taskTypeMap
      },
      actions: rootActions
    })

  const buildTask = (id, taskTypeId, fields = {}) => ({
    id,
    task_type_id: taskTypeId,
    task_status_id: 'ts-wip',
    duration: 0,
    estimation: 0,
    assignees: [],
    ...fields
  })

  const buildShot = (id, name, fields = {}) => ({
    id,
    name,
    sequence_id: 'sq1',
    episode_id: 'ep1',
    description: '',
    data: {},
    tasks: [],
    nb_frames: 0,
    ...fields
  })

  const load = (store, shots, userFilters = {}, userFilterGroups = {}) =>
    store.commit(LOAD_SHOTS_END, {
      production,
      shots,
      userFilters,
      userFilterGroups,
      taskMap,
      taskTypeMap,
      personMap: new Map(),
      episodeMap,
      sequenceMap
    })

  const names = list => list.map(({ name }) => name)

  beforeEach(() => {
    Object.values(client).forEach(fn => fn.mockReset())
    Object.assign(shotsStore.state, buildState())
    taskMap = new Map()
    rootActions = {
      createEntityTasks: vi.fn(),
      deleteAllTasks: vi.fn()
    }
  })

  afterEach(() => {
    shotsStore.cache.removedShotIds.clear()
    shotsStore.cache.shotMap.clear()
    shotsStore.cache.shots = []
    shotsStore.cache.result = []
    shotsStore.cache.shotIndex = {}
  })

  describe('list load', () => {
    test('computes the totals, flags, and columns of the shots', () => {
      const store = buildStore()

      load(
        store,
        [
          buildShot('s2', 'SH020', {
            sequence_id: 'sq2',
            nb_frames: 48,
            data: { frame_in: 0, fps: 24, resolution: '1920x1080' },
            tasks: [buildTask('t3', 'tt-layout', { duration: 30 })]
          }),
          buildShot('s1', 'SH010', {
            description: 'Opening',
            nb_frames: 24,
            nb_drawings: 2,
            data: { frame_out: 24, max_retakes: 3 },
            tasks: [
              buildTask('t1', 'tt-anim', {
                duration: 60,
                estimation: 120,
                nb_drawings: 5
              }),
              buildTask('t2', 'tt-layout', { estimation: 60 })
            ]
          }),
          buildShot('s3', 'SH030', {
            canceled: true,
            nb_frames: 100,
            tasks: [buildTask('t4', 'tt-anim', { duration: 500 })]
          })
        ],
        { shot: { p1: [{ id: 'f1', name: 'wip' }] } },
        { shot: { p1: [{ id: 'g1', name: 'Layout' }] } }
      )

      expect(names(store.getters.displayedShots)).toEqual([
        'SH010',
        'SH020',
        'SH030'
      ])
      expect(store.getters.displayedShotsCount).toBe(3)
      expect(store.getters.displayedShotsLength).toBe(2)
      expect(store.getters.displayedShotsTimeSpent).toBe(90)
      expect(store.getters.displayedShotsEstimation).toBe(180)
      expect(store.getters.displayedShotsFrames).toBe(72)
      expect(store.getters.displayedShotsDrawings).toBe(7)
      expect(store.getters.isFps).toBe(true)
      expect(store.getters.isFrames).toBe(true)
      expect(store.getters.isFrameIn).toBe(true)
      expect(store.getters.isFrameOut).toBe(true)
      expect(store.getters.isResolution).toBe(true)
      expect(store.getters.isMaxRetakes).toBe(true)
      expect(store.getters.isShotDescription).toBe(true)
      expect(store.getters.isShotTime).toBe(true)
      expect(store.getters.isShotEstimation).toBe(true)
      expect(store.getters.shotValidationColumns).toEqual([
        'tt-layout',
        'tt-anim'
      ])
      expect(store.getters.shotSearchQueries).toEqual([
        { id: 'f1', name: 'wip' }
      ])
      expect(store.getters.shotSearchFilterGroups).toEqual([
        { id: 'g1', name: 'Layout' }
      ])
      expect(store.getters.isShotsLoading).toBe(false)
      expect(store.getters.isShotsLoadingError).toBe(false)
      expect(store.getters.shotMap.get('s1')).toMatchObject({
        sequence_name: 'SQ01',
        episode_name: 'E01',
        full_name: 'E01 / SQ01 / SH010',
        tasks: ['t1', 't2']
      })
      expect(taskMap.get('t1')).toMatchObject({
        entity_name: 'E01 / SQ01 / SH010',
        entity_type_name: 'Shot',
        episode_id: 'ep1',
        project_id: 'p1'
      })
      expect(
        store.getters.displayedShotsBySequence.map(shots => names(shots))
      ).toEqual([['SH010'], ['SH020'], ['SH030']])
    })

    test('shows the first page, then the next one', () => {
      const store = buildStore()
      load(
        store,
        Array.from({ length: PAGE_SIZE + 3 }, (_, index) =>
          buildShot(`s${index}`, `SH${String(index).padStart(4, '0')}`)
        )
      )
      expect(store.getters.displayedShots).toHaveLength(PAGE_SIZE)

      store.dispatch('displayMoreShots')

      expect(store.getters.displayedShots).toHaveLength(PAGE_SIZE + 3)
    })

    test('lists the shots waiting for a feedback', async () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', { tasks: [buildTask('t1', 'tt-anim')] }),
        buildShot('s2', 'SH020', { tasks: [buildTask('t2', 'tt-anim')] }),
        buildShot('s3', 'SH030', { tasks: [buildTask('t3', 'tt-anim')] })
      ])
      const previousTaskMap = tasksStore.state.taskMap
      const now = new Date()
      const lastWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
      tasksStore.state.taskMap = new Map([
        ['t1', { id: 't1', task_status_id: 'ts-wfa', last_comment_date: now }],
        [
          't2',
          { id: 't2', task_status_id: 'ts-wfa', last_comment_date: lastWeek }
        ],
        ['t3', { id: 't3', task_status_id: 'ts-wip', last_comment_date: now }]
      ])
      taskStatusStore.cache.taskStatusMap.set('ts-wfa', {
        id: 'ts-wfa',
        is_feedback_request: true
      })
      taskStatusStore.cache.taskStatusMap.set('ts-wip', { id: 'ts-wip' })
      try {
        const shots = await store.dispatch('getPendingShots')
        const daily = await store.dispatch('getPendingShots', true)

        expect(names(shots)).toEqual(['SH010', 'SH020'])
        expect(names(daily)).toEqual(['SH010'])
      } finally {
        tasksStore.state.taskMap = previousTaskMap
        taskStatusStore.cache.taskStatusMap.delete('ts-wfa')
        taskStatusStore.cache.taskStatusMap.delete('ts-wip')
      }
    })
  })

  describe('search and sort', () => {
    test('filters the list on a search, then clears it on a production switch', () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s2', 'SH020')])

      store.dispatch('setShotSearch', 'sh020')

      expect(names(store.getters.displayedShots)).toEqual(['SH020'])
      expect(store.getters.shotSearchText).toBe('sh020')

      store.commit(SET_CURRENT_PRODUCTION, production)
      expect(store.getters.shotSearchText).toBe('')
    })

    test('keeps the search when the sort changes', () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010'),
        buildShot('s2', 'SH020', { sequence_id: 'sq2' }),
        buildShot('s3', 'SH030', { sequence_id: 'sq2' })
      ])
      store.dispatch('setShotSearch', 'sq02')

      store.dispatch('changeShotSort', null)

      expect(store.getters.shotSorting).toEqual([])
      expect(names(store.getters.displayedShots)).toEqual(['SH020', 'SH030'])
    })

    test('saves a search once, then removes it', async () => {
      const store = buildStore()
      load(store, [])
      client.ppost.mockResolvedValueOnce({ id: 'f2', name: 'layout' })
      client.pdel.mockResolvedValueOnce()

      await store.dispatch('saveShotSearch', 'layout')
      await store.dispatch('saveShotSearch', 'layout')

      expect(client.ppost).toHaveBeenCalledTimes(1)
      expect(client.ppost).toHaveBeenCalledWith('/api/data/user/filters', {
        list_type: 'shot',
        name: 'layout',
        query: 'layout',
        entity_type: null,
        project_id: 'p1'
      })
      expect(names(store.getters.shotSearchQueries)).toEqual(['layout'])

      await store.dispatch('removeShotSearch', { id: 'f2', name: 'layout' })

      expect(client.pdel).toHaveBeenCalledWith('/api/data/user/filters/f2')
      expect(store.getters.shotSearchQueries).toEqual([])
    })

    test('saves a filter group once, then removes it', async () => {
      const store = buildStore()
      load(store, [])
      const group = {
        name: 'Layout',
        color: '#ff0000',
        is_shared: false,
        department_id: null
      }
      client.ppost.mockResolvedValueOnce({ id: 'g2', ...group })
      client.pdel.mockResolvedValueOnce()

      await store.dispatch('saveShotSearchFilterGroup', group)
      await store.dispatch('saveShotSearchFilterGroup', group)

      expect(client.ppost).toHaveBeenCalledTimes(1)
      expect(client.ppost).toHaveBeenCalledWith(
        '/api/data/user/filter-groups',
        {
          list_type: 'shot',
          name: 'Layout',
          color: '#ff0000',
          is_shared: false,
          project_id: 'p1',
          department_id: null
        }
      )
      expect(names(store.getters.shotSearchFilterGroups)).toEqual(['Layout'])

      await store.dispatch('removeShotSearchFilterGroup', {
        id: 'g2',
        name: 'Layout'
      })

      expect(client.pdel).toHaveBeenCalledWith(
        '/api/data/user/filter-groups/g2'
      )
      expect(store.getters.shotSearchFilterGroups).toEqual([])
    })

    test('keeps the saved searches and groups sorted, once each', () => {
      const store = buildStore()
      load(store, [])
      const group = { id: 'g2', name: 'Lighting' }

      const saveSearch = searchQuery =>
        store.commit(SAVE_SHOT_SEARCH_END, { searchQuery })
      saveSearch({ id: 'f1', name: 'wip' })
      saveSearch({ id: 'f2', name: 'done' })
      store.commit(REMOVE_SHOT_SEARCH_END, {
        searchQuery: { id: 'f9', name: 'wip' }
      })
      store.commit(SAVE_SHOT_SEARCH_FILTER_GROUP_END, {
        filterGroup: { id: 'g1', name: 'Layout' }
      })
      store.commit(SAVE_SHOT_SEARCH_FILTER_GROUP_END, { filterGroup: group })
      store.commit(SAVE_SHOT_SEARCH_FILTER_GROUP_END, { filterGroup: group })
      store.commit(REMOVE_SHOT_SEARCH_FILTER_GROUP_END, {
        filterGroup: { id: 'g9', name: 'Layout' }
      })

      expect(names(store.getters.shotSearchQueries)).toEqual(['done', 'wip'])
      expect(names(store.getters.shotSearchFilterGroups)).toEqual([
        'Layout',
        'Lighting'
      ])
    })

    test('sorts the validation columns by task type priority', () => {
      const store = buildStore()
      load(store, [])
      shotsStore.state.shotValidationColumns = ['tt-anim', 'tt-layout']

      store.commit(SORT_VALIDATION_COLUMNS, taskTypeMap)

      expect(store.getters.shotValidationColumns).toEqual([
        'tt-layout',
        'tt-anim'
      ])
    })
  })

  describe('shot changes', () => {
    test('creates a shot and its tasks', async () => {
      const store = buildStore({ shotTaskTypeIds: ['tt-anim'] })
      load(store, [buildShot('s1', 'SH010')])
      sequenceStore.cache.sequenceMap.set('sq1', sequenceMap.get('sq1'))
      episodeStore.cache.episodeMap.set('ep1', episodeMap.get('ep1'))
      client.ppost.mockResolvedValueOnce({
        id: 's2',
        name: 'SH020',
        parent_id: 'sq1',
        project_id: 'p1'
      })

      try {
        const shot = await store.dispatch('newShot', {
          name: 'SH020',
          description: 'Wide',
          sequence_id: 'sq1',
          project_id: 'p1'
        })

        expect(client.ppost).toHaveBeenCalledWith(
          '/api/data/projects/p1/shots',
          { name: 'SH020', description: 'Wide', sequence_id: 'sq1' }
        )
        expect(shot).toMatchObject({
          sequence_name: 'SQ01',
          episode_name: 'E01'
        })
        expect(names(store.getters.displayedShots)).toEqual(['SH010', 'SH020'])
        expect(rootActions.createEntityTasks).toHaveBeenCalledWith(
          expect.anything(),
          { entityId: 's2', taskTypeIds: ['tt-anim'] }
        )
      } finally {
        sequenceStore.cache.sequenceMap.delete('sq1')
        episodeStore.cache.episodeMap.delete('ep1')
      }
    })

    test('cancels a shot with tasks, deletes one without, restores one', async () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', { tasks: [buildTask('t1', 'tt-anim')] }),
        buildShot('s2', 'SH020'),
        buildShot('s3', 'SH030')
      ])
      client.pdel.mockResolvedValue()
      client.pput.mockResolvedValueOnce({ id: 's1', canceled: false })

      await store.dispatch('deleteShot', { id: 's1' })
      expect(store.getters.displayedShotsLength).toBe(2)
      await store.dispatch('deleteShot', { id: 's2' })
      expect(client.pdel).toHaveBeenNthCalledWith(1, '/api/data/shots/s1')
      expect(client.pdel).toHaveBeenNthCalledWith(2, '/api/data/shots/s2')
      expect(store.getters.shotMap.get('s1').canceled).toBe(true)
      expect(store.getters.shotMap.has('s2')).toBe(false)
      expect(names(store.getters.displayedShots)).toEqual(['SH010', 'SH030'])

      const shot = await store.dispatch('restoreShot', { id: 's1' })
      expect(client.pput).toHaveBeenCalledWith('/api/data/entities/s1', {
        canceled: false
      })
      expect(shot).toEqual({ id: 's1', canceled: false })
      expect(store.getters.shotMap.get('s1').canceled).toBe(false)
      expect(store.getters.displayedShotsLength).toBe(2)
    })

    // The rows read the shots of the displayed list: a row that missed the
    // change kept the buttons of an active shot.
    test('shows a canceled shot as canceled in its row, then restored', async () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', {
          canceled: false,
          tasks: [buildTask('t1', 'tt-anim')]
        }),
        buildShot('s2', 'SH020', {
          canceled: false,
          tasks: [buildTask('t2', 'tt-anim')]
        })
      ])
      // A row keeps the entry it renders.
      const row = store.getters.displayedShots[1]
      const isCanceled = computed(() => row.canceled)
      expect(isCanceled.value).toBe(false)
      client.pdel.mockResolvedValue()
      client.pput.mockResolvedValueOnce({ id: 's2', canceled: false })

      await store.dispatch('deleteShot', { id: 's2' })
      expect(isCanceled.value).toBe(true)

      await store.dispatch('restoreShot', { id: 's2' })
      expect(isCanceled.value).toBe(false)
    })

    test('shows the canceled shots of a deleted selection as canceled', async () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', {
          canceled: false,
          tasks: [buildTask('t1', 'tt-anim')]
        })
      ])
      // A row keeps the entry it renders.
      const row = store.getters.displayedShots[0]
      const isCanceled = computed(() => row.canceled)
      expect(isCanceled.value).toBe(false)
      store.dispatch('setShotSelection', {
        shot: store.getters.displayedShots[0],
        selected: true
      })
      client.ppost.mockResolvedValueOnce({})

      await store.dispatch('deleteSelectedShots')

      expect(isCanceled.value).toBe(true)
    })

    // The footer shows the active shots, and the list hides once empty.
    test('counts a deleted shot out of the list', async () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s2', 'SH020')])
      client.pdel.mockResolvedValue()

      await store.dispatch('deleteShot', { id: 's1' })
      expect(store.getters.displayedShotsCount).toBe(1)
      expect(store.getters.displayedShotsLength).toBe(1)

      await store.dispatch('deleteShot', { id: 's2' })
      expect(store.getters.displayedShotsCount).toBe(0)
      expect(store.getters.displayedShotsLength).toBe(0)
    })

    test('counts the deleted selection out of the list', async () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s2', 'SH020')])
      store.getters.displayedShots.forEach(shot =>
        store.dispatch('setShotSelection', { shot, selected: true })
      )
      client.ppost.mockResolvedValueOnce({})

      await store.dispatch('deleteSelectedShots')

      expect(store.getters.displayedShotsCount).toBe(0)
      expect(store.getters.displayedShotsLength).toBe(0)
    })

    const createShot = async (store, id, name) => {
      sequenceStore.cache.sequenceMap.set('sq1', sequenceMap.get('sq1'))
      episodeStore.cache.episodeMap.set('ep1', episodeMap.get('ep1'))
      client.ppost.mockResolvedValueOnce(
        buildShot(id, name, { parent_id: 'sq1', project_id: 'p1' })
      )
      try {
        await store.dispatch('newShot', { name, project_id: 'p1' })
      } finally {
        sequenceStore.cache.sequenceMap.delete('sq1')
        episodeStore.cache.episodeMap.delete('ep1')
      }
    }

    // What a socket event brings, as a colleague's creation or ahead of the
    // answer to the user's own.
    const addShotLive = (store, id, name) =>
      store.commit(ADD_SHOT, {
        taskStatusMap: new Map(),
        taskTypeMap,
        taskMap,
        persons: [],
        personMap: new Map(),
        production,
        shot: buildShot(id, name, {
          sequence_name: 'SQ01',
          episode_name: 'E01'
        })
      })

    // A deletion parts the search result from the list. The next recount reads
    // the result: what a creation adds has to reach it.
    test('counts a shot created after a deletion', async () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s2', 'SH020')])
      client.pdel.mockResolvedValue()
      await store.dispatch('deleteShot', { id: 's1' })
      await createShot(store, 's3', 'SH030')

      await store.dispatch('deleteShot', { id: 's2' })

      expect(names(store.getters.displayedShots)).toEqual(['SH030'])
      expect(store.getters.displayedShotsCount).toBe(1)
      expect(store.getters.displayedShotsLength).toBe(1)
    })

    test('counts a shot created under a search', async () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s2', 'SH020')])
      store.dispatch('setShotSearch', 'sh010')
      await createShot(store, 's3', 'SH030')
      expect(names(store.getters.displayedShots)).toEqual(['SH010', 'SH030'])
      client.pdel.mockResolvedValue()

      await store.dispatch('deleteShot', { id: 's1' })

      expect(names(store.getters.displayedShots)).toEqual(['SH030'])
      expect(store.getters.displayedShotsCount).toBe(1)
      expect(store.getters.displayedShotsLength).toBe(1)
    })

    test('keeps the order of a search once a shot is created', async () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s3', 'SH030')])
      store.dispatch('setShotSearch', 'sq01')

      await createShot(store, 's2', 'SH020')

      expect(names(store.getters.displayedShots)).toEqual([
        'SH010',
        'SH020',
        'SH030'
      ])
    })

    test('shows a created shot the socket added first against the search', async () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s2', 'SH020')])
      store.dispatch('setShotSearch', 'sh010')
      addShotLive(store, 's3', 'SH030')

      await createShot(store, 's3', 'SH030')

      expect(names(store.getters.displayedShots)).toEqual(['SH010', 'SH030'])
    })

    test('keeps a shot the socket added first in the order of a search', async () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s3', 'SH030')])
      store.dispatch('setShotSearch', 'sq01')
      addShotLive(store, 's2', 'SH020')

      await createShot(store, 's2', 'SH020')

      expect(names(store.getters.displayedShots)).toEqual([
        'SH010',
        'SH020',
        'SH030'
      ])
    })

    // With no search, the list shows every shot once one is created.
    test('shows a shot added live along with a created one', async () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s2', 'SH020')])
      client.pdel.mockResolvedValue()
      await store.dispatch('deleteShot', { id: 's1' })
      addShotLive(store, 's9', 'SH090')

      await createShot(store, 's3', 'SH030')

      expect(names(store.getters.displayedShots)).toEqual([
        'SH020',
        'SH030',
        'SH090'
      ])
      expect(store.getters.displayedShotsCount).toBe(3)
    })

    // "For current list and filters" reads the search result.
    test('keeps the tasks out of a search once a shot is created', async () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', { tasks: [buildTask('t1', 'tt-anim')] }),
        buildShot('s2', 'SH020', { tasks: [buildTask('t2', 'tt-anim')] })
      ])
      store.dispatch('setShotSearch', 'sh010')
      await createShot(store, 's3', 'SH030')

      await store.dispatch('deleteAllShotTasks', {
        projectId: 'p1',
        taskTypeId: 'tt-anim',
        selectionOnly: true
      })

      expect(rootActions.deleteAllTasks).toHaveBeenCalledWith(
        expect.anything(),
        { projectId: 'p1', taskTypeId: 'tt-anim', taskIds: ['t1'] }
      )
    })

    test('deletes a canceled shot for good', async () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010', { canceled: true })])
      client.pdel.mockResolvedValueOnce()

      await store.dispatch('deleteShot', { id: 's1', canceled: true })

      expect(client.pdel).toHaveBeenCalledWith('/api/data/shots/s1?force=true')
    })

    test('counts the locks of a shot', () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010')])

      store.commit(LOCK_SHOT, { id: 's1' })
      store.commit(LOCK_SHOT, { id: 's1' })
      store.commit(UNLOCK_SHOT, { id: 's1' })
      expect(store.getters.shotMap.get('s1').lock).toBe(1)

      store.commit(UNLOCK_SHOT, { id: 's1' })
      store.commit(UNLOCK_SHOT, { id: 's1' })
      expect(store.getters.shotMap.get('s1').lock).toBe(0)
    })

    test('renames the data key of a renamed shot descriptor only', () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010', { data: { look: 'warm' } })])

      store.commit(UPDATE_METADATA_DESCRIPTOR_END, {
        descriptor: { entity_type: 'Edit', field_name: 'style' },
        previousDescriptorFieldName: 'look'
      })
      expect(store.getters.shotMap.get('s1').data).toEqual({ look: 'warm' })

      store.commit(UPDATE_METADATA_DESCRIPTOR_END, {
        descriptor: { entity_type: 'Shot', field_name: 'style' },
        previousDescriptorFieldName: 'look'
      })
      expect(store.getters.shotMap.get('s1').data).toEqual({ style: 'warm' })
    })

    test('loads the history of a shot', async () => {
      const store = buildStore()
      client.pget.mockResolvedValueOnce([{ id: 'v1' }])

      const history = await store.dispatch('loadShotHistory', 's1')

      expect(client.pget).toHaveBeenCalledWith('/api/data/shots/s1/versions')
      expect(history).toEqual([{ id: 'v1' }])
    })

    test.each([
      [
        { personId: 'u1' },
        '/api/data/projects/p1/quotas/persons/u1?detail=week&count_mode=weighted'
      ],
      [
        { taskTypeId: 'tt-anim' },
        '/api/data/projects/p1/quotas/tt-anim?detail=week&count_mode=weighted'
      ]
    ])('computes the quotas of %o', async (target, path) => {
      const store = buildStore()
      client.pget.mockResolvedValueOnce({})

      await store.dispatch('computeQuota', {
        ...target,
        detailLevel: 'week',
        computeMode: 'weighted'
      })

      expect(client.pget).toHaveBeenCalledWith(path)
    })

    test('sets the frames of the shots from the previews of a task type', async () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s2', 'SH020')])
      client.ppost.mockResolvedValueOnce([{ id: 's2', nb_frames: 96 }])

      const shots = await store.dispatch('setNbFramesFromTaskTypePreviews', {
        taskTypeId: 'tt-anim',
        productionId: 'p1',
        episodeId: 'ep1'
      })

      expect(client.ppost).toHaveBeenCalledWith(
        '/api/actions/projects/p1/task-types/tt-anim/set-shot-nb-frames' +
          '?episode_id=ep1'
      )
      expect(shots).toEqual([{ id: 's2', nb_frames: 96 }])
      expect(store.getters.shotMap.get('s2').nb_frames).toBe(96)
    })
  })

  describe('imports', () => {
    test('imports a CSV file of shots', async () => {
      const store = buildStore()
      const formData = { file: 'shots.csv' }
      store.commit(SHOT_CSV_FILE_SELECTED, formData)
      expect(store.getters.shotsCsvFormData).toEqual(formData)
      client.ppostImport.mockResolvedValueOnce({})

      await store.dispatch('uploadShotFile', true)

      expect(client.ppostImport).toHaveBeenCalledWith(
        '/api/import/csv/projects/p1/shots?update=true',
        formData
      )
      expect(store.getters.shotsCsvFormData).toBe(null)
    })

    test('clears the file of an import', () => {
      const store = buildStore()
      store.commit(SHOT_CSV_FILE_SELECTED, { file: 'shots.csv' })

      store.commit(IMPORT_SHOTS_END)

      expect(store.getters.shotsCsvFormData).toBe(null)
    })

    test('creates shots in bulk through a CSV import', async () => {
      const store = buildStore({ isTVShow: true })
      client.ppostImport.mockResolvedValueOnce({})

      await store.dispatch('bulkCreateShots', {
        shotNames: ['SH010', 'SH"020'],
        sequenceName: 'SQ01',
        episodeName: 'E01'
      })

      const [path, formData] = client.ppostImport.mock.calls[0]
      expect(path).toBe('/api/import/csv/projects/p1/shots')
      expect(await formData.get('file').text()).toBe(
        'Episode,Sequence,Name\n"E01","SQ01","SH010"\n"E01","SQ01","SH""020"'
      )
    })

    test('creates shots in bulk without episodes outside TV shows', async () => {
      const store = buildStore()
      client.ppostImport.mockResolvedValueOnce({})

      await store.dispatch('bulkCreateShots', {
        shotNames: ['SH010'],
        sequenceName: 'SQ01'
      })

      const [, formData] = client.ppostImport.mock.calls[0]
      expect(await formData.get('file').text()).toBe(
        'Sequence,Name\n"SQ01","SH010"'
      )
    })

    test.each([
      [true, '/api/import/otio/projects/p1/episodes/ep1'],
      [false, '/api/import/otio/projects/p1']
    ])('imports an EDL file, TV show %s', async (isTVShow, path) => {
      const store = buildStore({ isTVShow, currentEpisode: { id: 'ep1' } })
      const edlFile = new Blob(['TITLE: cut'])
      client.ppostImport.mockResolvedValueOnce({})

      await store.dispatch('uploadEdlFile', {
        edl_file: edlFile,
        namingConvention: '${project}_${sequence}-${shot}',
        matchCase: true
      })

      const [sentPath, formData] = client.ppostImport.mock.calls[0]
      expect(sentPath).toBe(path)
      expect(formData.get('naming_convention')).toBe(
        '${project}_${sequence}-${shot}'
      )
      expect(formData.get('match_case')).toBe('true')
      expect(await formData.get('file').text()).toBe('TITLE: cut')
    })
  })

  describe('tasks', () => {
    test('adds created tasks to their shots', () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010')])

      store.commit(CREATE_TASKS_END, {
        tasks: [
          buildTask('t1', 'tt-anim', { entity_id: 's1' }),
          null,
          buildTask('t2', 'tt-anim', { entity_id: 's9' })
        ]
      })

      const shot = store.getters.shotMap.get('s1')
      expect(shot.tasks).toEqual(['t1'])
      expect(shot.validations.get('tt-anim')).toBe('t1')
      expect(store.getters.displayedShots[0].validations.get('tt-anim')).toBe(
        't1'
      )
    })

    test('adds a new task and the column of its task type', () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010')])

      store.commit(NEW_TASK_END, {
        task: buildTask('t1', 'tt-anim', { entity_id: 's1' })
      })

      expect(store.getters.shotValidationColumns).toEqual(['tt-anim'])
      expect(store.getters.shotFilledColumns['tt-anim']).toBe(true)
      expect(store.getters.shotMap.get('s1').tasks).toEqual(['t1'])
      expect(store.getters.displayedShots[0].validations.get('tt-anim')).toBe(
        't1'
      )
    })

    test('drops a deleted task from its shot', () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', {
          tasks: [buildTask('t1', 'tt-anim'), buildTask('t2', 'tt-layout')]
        })
      ])

      store.commit(DELETE_TASK_END, {
        id: 't1',
        entity_id: 's1',
        task_type_id: 'tt-anim'
      })

      const shot = store.getters.displayedShots[0]
      expect(shot.tasks).toEqual(['t2'])
      expect([...shot.validations.keys()]).toEqual(['tt-layout'])
    })

    test('keeps the tasks of a shot when a task it does not list is deleted', () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', {
          tasks: [buildTask('t1', 'tt-anim'), buildTask('t2', 'tt-layout')]
        })
      ])

      store.commit(DELETE_TASK_END, {
        id: 't9',
        entity_id: 's1',
        task_type_id: 'tt-fx'
      })

      expect(store.getters.displayedShots[0].tasks).toEqual(['t1', 't2'])
    })

    test('sums the time of the tasks of a shot again', () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', {
          tasks: [buildTask('t1', 'tt-anim'), buildTask('t2', 'tt-layout')]
        })
      ])
      const previousTaskMap = tasksStore.state.taskMap
      tasksStore.state.taskMap = new Map([
        ['t1', { id: 't1', duration: 60, estimation: 30 }],
        ['t2', { id: 't2', duration: 15 }]
      ])
      try {
        store.commit(LOAD_TASK_END, { id: 't1', entity_id: 's1' })
      } finally {
        tasksStore.state.taskMap = previousTaskMap
      }

      expect(store.getters.shotMap.get('s1')).toMatchObject({
        timeSpent: 75,
        estimation: 30
      })
    })

    test('deletes the tasks of a task type, of the selection only', () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', { tasks: [buildTask('t1', 'tt-anim')] }),
        buildShot('s2', 'SH020', { tasks: [buildTask('t2', 'tt-layout')] })
      ])

      store.dispatch('deleteAllShotTasks', {
        projectId: 'p1',
        taskTypeId: 'tt-anim',
        selectionOnly: true
      })
      store.dispatch('deleteAllShotTasks', {
        projectId: 'p1',
        taskTypeId: 'tt-anim',
        selectionOnly: false
      })

      expect(
        rootActions.deleteAllTasks.mock.calls.map(([, args]) => args)
      ).toEqual([
        { projectId: 'p1', taskTypeId: 'tt-anim', taskIds: ['t1'] },
        { projectId: 'p1', taskTypeId: 'tt-anim', taskIds: undefined }
      ])
    })

    test('shows the new preview of a shot and of its tasks', () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', { tasks: [buildTask('t1', 'tt-anim')] })
      ])

      store.commit(SET_PREVIEW, {
        entityId: 's1',
        previewId: 'preview-2',
        taskMap
      })

      expect(store.getters.displayedShots[0].preview_file_id).toBe('preview-2')
      expect(taskMap.get('t1').entity.preview_file_id).toBe('preview-2')
    })
  })

  describe('selection', () => {
    test('selects the cells of tasks, then unselects one', () => {
      const store = buildStore()
      load(store, [
        buildShot('s1', 'SH010', { tasks: [buildTask('t1', 'tt-anim')] })
      ])
      store.commit(SET_SHOT_SELECTION, {
        shot: store.getters.shotMap.get('s1'),
        selected: true
      })

      store.commit(ADD_SELECTED_TASK, { x: 0, y: 0 })
      expect(store.getters.selectedShots.size).toBe(0)
      store.commit(SET_SHOT_SELECTION, {
        shot: store.getters.shotMap.get('s1'),
        selected: true
      })
      store.commit(ADD_SELECTED_TASKS, [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 }
      ])
      expect([...store.getters.shotSelectionGrid]).toEqual([
        '0-0',
        '0-1',
        '1-0'
      ])
      expect(store.getters.selectedShots.size).toBe(0)

      store.commit(REMOVE_SELECTED_TASK, {
        task: { entity: { id: 's1' }, column: { id: 'tt-anim' } }
      })
      expect([...store.getters.shotSelectionGrid]).toEqual(['0-1', '1-0'])
    })

    test('clears the selected cells once tasks are selected', () => {
      const store = buildStore()
      store.commit(ADD_SELECTED_TASK, { x: 0, y: 0 })
      const previousCount = tasksStore.state.nbSelectedValidations

      store.commit(CLEAR_SELECTED_TASKS)
      expect(store.getters.shotSelectionGrid.size).toBe(1)

      tasksStore.state.nbSelectedValidations = 1
      try {
        store.commit(CLEAR_SELECTED_TASKS)
      } finally {
        tasksStore.state.nbSelectedValidations = previousCount
      }
      expect(store.getters.shotSelectionGrid.size).toBe(0)
    })

    test('selects shots, then unselects them', () => {
      const store = buildStore()
      load(store, [buildShot('s1', 'SH010'), buildShot('s2', 'SH020')])
      store.commit(ADD_SELECTED_TASK, { x: 0, y: 0 })
      const [first, second] = store.getters.displayedShots

      store.dispatch('setShotSelection', { shot: first, selected: true })
      store.dispatch('setShotSelection', { shot: second, selected: true })
      expect([...store.getters.selectedShots.keys()]).toEqual(['s1', 's2'])
      expect(store.getters.shotSelectionGrid.size).toBe(0)

      store.dispatch('setShotSelection', { shot: first, selected: false })
      expect([...store.getters.selectedShots.keys()]).toEqual(['s2'])

      store.dispatch('clearSelectedShots')
      expect(store.getters.selectedShots.size).toBe(0)
    })
  })

  test('keeps the scroll position of the list', () => {
    const store = buildStore()

    store.commit(SET_SHOT_LIST_SCROLL_POSITION, 240)

    expect(store.getters.shotListScrollPosition).toBe(240)
  })

  test('empties the list on RESET_ALL', () => {
    const store = buildStore()
    load(store, [buildShot('s1', 'SH010')])

    store.commit(RESET_ALL)

    expect(shotsStore.cache.shots).toEqual([])
    expect(shotsStore.cache.result).toEqual([])
    expect(store.getters.displayedShots).toEqual([])
  })
})
