import { vi } from 'vitest'

// Importing the shots module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import shotsStore from '@/store/modules/shots'
import entitiesApi from '@/store/api/entities'
import shotsApi from '@/store/api/shots'
import { buildShotIndex } from '@/lib/indexing'

describe('Shots store', () => {
  describe('loading flag lifecycle', () => {
    test('CLEAR_SHOTS resets the loading flag so a stale in-flight load cannot wedge the next one (BUG-4)', () => {
      const state = { isShotsLoading: true, isShotsLoadingError: true }
      shotsStore.mutations.CLEAR_SHOTS(state)
      expect(state.isShotsLoading).toBe(false)
      expect(state.isShotsLoadingError).toBe(false)
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

    test('loads the whole production instead of no-oping on the all pseudo-episode', async () => {
      const getShots = vi.spyOn(shotsApi, 'getShots').mockResolvedValue([])
      const commit = vi.fn()
      const dispatch = vi.fn(() => Promise.resolve())
      const state = { isShotsLoading: false }

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
      const commit = vi.fn()
      const dispatch = vi.fn(() => Promise.resolve())
      const state = { isShotsLoading: false }

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
      const commit = vi.fn()
      const dispatch = vi.fn(() => Promise.resolve())
      const state = { isShotsLoading: false }
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
