// @vitest-environment node

import { vi } from 'vitest'

// Importing the shots module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import shotsStore from '@/store/modules/shots'
import entitiesApi from '@/store/api/entities'
import shotsApi from '@/store/api/shots'
import sequenceStore from '@/store/modules/sequences'
import { buildShotIndex } from '@/lib/indexing'

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
      {},
      { id: 'sh-upd', name: 'new', tasks: [{ id: 't1' }] }
    )
    expect(shotsStore.cache.shotMap.get('sh-upd')).toMatchObject({
      name: 'new',
      tasks: ['t1']
    })
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
