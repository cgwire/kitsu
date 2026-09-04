// @vitest-environment node

import { vi } from 'vitest'

// Importing the edits module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
// Keep the loads in flight without hitting the network.
vi.mock('@/store/api/edits', () => ({
  default: { getEdits: vi.fn(() => new Promise(() => {})) }
}))

import editsStore from '@/store/modules/edits'
import editsApi from '@/store/api/edits'

describe('Edits store', () => {
  describe('loading flag lifecycle', () => {
    test('a concurrent same-scope caller shares the in-flight load instead of starting a second one', () => {
      const state = { isEditsLoading: false }
      const commit = vi.fn()
      const dispatch = vi.fn()
      const rootGetters = {
        currentProduction: { id: 'p-share' },
        episodes: [],
        userFilters: {},
        taskTypeMap: new Map(),
        taskMap: new Map(),
        personMap: new Map(),
        isTVShow: false,
        currentEpisode: null
      }

      // First call kicks off the load and stores the in-flight promise/key.
      const first = editsStore.actions.loadEdits({
        commit,
        dispatch,
        state,
        rootGetters
      })
      expect(commit.mock.calls.map(c => c[0])).toContain('LOAD_EDITS_START')

      // Simulate the mutations the mocked commit did not apply.
      state.isEditsLoading = true
      state.editsLoadingKey = 'p-share/'
      commit.mockClear()

      // A concurrent caller for the same production+episode must get the very
      // same promise and must not start a second load.
      const second = editsStore.actions.loadEdits({
        commit,
        dispatch,
        state,
        rootGetters
      })
      expect(second).toBe(first)
      expect(commit.mock.calls.map(c => c[0])).not.toContain('LOAD_EDITS_START')
    })

    test('a caller for a different episode does not adopt the in-flight load', () => {
      const commit = vi.fn()
      const dispatch = vi.fn()
      const baseGetters = {
        currentProduction: { id: 'p-switch' },
        episodes: [{ id: 'ep-a' }, { id: 'ep-b' }],
        userFilters: {},
        taskTypeMap: new Map(),
        taskMap: new Map(),
        personMap: new Map(),
        isTVShow: true
      }
      const state = { isEditsLoading: false }

      // Load episode A, then leave it in flight.
      const loadA = editsStore.actions.loadEdits({
        commit,
        dispatch,
        state,
        rootGetters: { ...baseGetters, currentEpisode: { id: 'ep-a' } }
      })
      state.isEditsLoading = true
      state.editsLoadingKey = 'p-switch/ep-a'
      commit.mockClear()

      // Switching to episode B must NOT return A's promise: B would await a
      // load whose result belongs to A and read stale edits. Instead B gets a
      // distinct promise that fetches B once A settles.
      const loadB = editsStore.actions.loadEdits({
        commit,
        dispatch,
        state,
        rootGetters: { ...baseGetters, currentEpisode: { id: 'ep-b' } }
      })
      expect(loadB).not.toBe(loadA)
      expect(commit.mock.calls.map(c => c[0])).not.toContain('LOAD_EDITS_START')
    })
  })

  describe('queued scopes', () => {
    afterEach(() => {
      editsStore.cache.editsLoadingPromise = null
      editsApi.getEdits.mockImplementation(() => new Promise(() => {}))
    })

    test('a second queued caller resolves with the episode that was loaded', async () => {
      const editsOfA = [{ id: 'e-ep-a' }]
      const editsOfC = [{ id: 'e-ep-c' }]
      let releaseA
      editsStore.cache.editsLoadingPromise = new Promise(resolve => {
        releaseA = resolve
      })
      editsApi.getEdits.mockImplementation(() => Promise.resolve(editsOfC))

      const state = { isEditsLoading: true, editsLoadingKey: 'p1/ep-a' }
      const rootGetters = {
        currentProduction: { id: 'p1' },
        episodes: [{ id: 'ep-a' }, { id: 'ep-b' }, { id: 'ep-c' }],
        userFilters: {},
        taskTypeMap: new Map(),
        taskMap: new Map(),
        personMap: new Map(),
        isTVShow: true,
        currentEpisode: { id: 'ep-b' }
      }
      // Mirror the two fields LOAD_EDITS_START sets, which are the ones the
      // in-flight guard reads.
      const commit = vi.fn((type, payload) => {
        if (type === 'LOAD_EDITS_START') {
          state.isEditsLoading = true
          state.editsLoadingKey = payload.loadingKey
        }
      })
      const ctx = { commit, state, rootGetters }
      ctx.dispatch = vi.fn(() => editsStore.actions.loadEdits(ctx))

      // The user clicks through two more episodes while ep-a is still in
      // flight: both queue behind it.
      const loadB = editsStore.actions.loadEdits(ctx)
      rootGetters.currentEpisode = { id: 'ep-c' }
      const loadC = editsStore.actions.loadEdits(ctx)

      state.isEditsLoading = false
      releaseA(editsOfA)
      const [, resultC] = await Promise.all([loadB, loadC])

      // Once the first queued caller requeues for ep-c, the second must join
      // that load instead of being handed the ep-a edits it merely awaited.
      expect(resultC).toEqual(editsOfC)
    })
  })

  describe('loaded scope', () => {
    const baseGetters = () => ({
      currentProduction: { id: 'p1' },
      episodes: [{ id: 'ep-a' }, { id: 'ep-b' }],
      userFilters: {},
      taskTypeMap: new Map(),
      taskMap: new Map(),
      personMap: new Map(),
      isTVShow: true,
      currentEpisode: { id: 'ep-b' }
    })

    test('records the episode the load was made for', () => {
      const commit = vi.fn()
      editsStore.actions.loadEdits({
        commit,
        dispatch: vi.fn(),
        state: { isEditsLoading: false },
        rootGetters: baseGetters()
      })

      expect(commit).toHaveBeenCalledWith('LOAD_EDITS_START', {
        loadingKey: 'p1/ep-b'
      })
    })

    test('records the all pseudo-episode, still unfiltered on the wire', () => {
      const commit = vi.fn()
      editsStore.actions.loadEdits({
        commit,
        dispatch: vi.fn(),
        state: { isEditsLoading: false },
        rootGetters: { ...baseGetters(), currentEpisode: { id: 'all' } }
      })

      // The page compares the scope it displays with the one the store holds,
      // so 'all' has to be recorded as itself and not as an absent episode.
      expect(commit).toHaveBeenCalledWith('LOAD_EDITS_START', {
        loadingKey: 'p1/all'
      })
      expect(editsApi.getEdits).toHaveBeenCalledWith({ id: 'p1' }, null)
    })

    test('sets the episode it fell back to as the current one', () => {
      const commit = vi.fn()
      editsStore.actions.loadEdits({
        commit,
        dispatch: vi.fn(),
        state: { isEditsLoading: false },
        rootGetters: { ...baseGetters(), currentEpisode: null }
      })

      // The page derives its own scope from currentEpisode. Without this the
      // store records p1/ep-a while the page still computes p1/, and every
      // mount reloads the edits it already holds.
      expect(commit).toHaveBeenCalledWith('SET_CURRENT_EPISODE', 'ep-a')
      expect(commit).toHaveBeenCalledWith('LOAD_EDITS_START', {
        loadingKey: 'p1/ep-a'
      })
    })

    test('serves the recorded scope through a getter', () => {
      const state = {}
      editsStore.mutations.LOAD_EDITS_START(state, { loadingKey: 'p1/ep-a' })

      expect(editsStore.getters.editsLoadingKey(state)).toEqual('p1/ep-a')
    })
  })
})
