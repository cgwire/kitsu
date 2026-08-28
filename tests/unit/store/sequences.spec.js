import { vi } from 'vitest'

// Importing the sequences module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import sequencesStore from '@/store/modules/sequences'
import shotsApi from '@/store/api/shots'

describe('Sequences store, all-episodes pseudo-episode', () => {
  const production = { id: 'p-all' }
  const rootGetters = {
    currentProduction: production,
    currentEpisode: { id: 'all' },
    episodes: [{ id: 'ep-a' }],
    episodeMap: new Map(),
    personMap: new Map(),
    isTVShow: true,
    route: { params: {} },
    userFilters: {},
    taskMap: new Map(),
    taskStatusMap: new Map(),
    taskTypeMap: new Map()
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('loadSequences queries the production, not an episode, in All mode', async () => {
    const getSequences = vi
      .spyOn(shotsApi, 'getSequences')
      .mockResolvedValue([])
    await sequencesStore.actions.loadSequences({
      commit: vi.fn(),
      state: {},
      rootGetters
    })
    expect(getSequences).toHaveBeenCalledWith(production, null)
  })

  test('loadSequencesWithTasks queries the production and keeps the cross-episode response', async () => {
    const sequences = [
      { id: 'sq-1', episode_id: 'ep-a', name: 'SQ010', tasks: [] },
      { id: 'sq-2', episode_id: 'ep-b', name: 'SQ010', tasks: [] }
    ]
    const getSequencesWithTasks = vi
      .spyOn(shotsApi, 'getSequencesWithTasks')
      .mockResolvedValue(sequences)
    const commit = vi.fn()
    await sequencesStore.actions.loadSequencesWithTasks({
      commit,
      state: {},
      rootGetters
    })
    expect(getSequencesWithTasks).toHaveBeenCalledWith(production, null)
    expect(commit.mock.calls.map(c => c[0])).toContain(
      'SET_SEQUENCES_WITH_TASKS'
    )
  })

  test('loadSequencesWithTasks discards a per-episode response resolved after the user switched to All', async () => {
    const scopedRootGetters = { ...rootGetters, currentEpisode: { id: 'ep-a' } }
    const sequences = [
      { id: 'sq-1', episode_id: 'ep-a', name: 'SQ010', tasks: [] }
    ]
    const getSequencesWithTasks = vi
      .spyOn(shotsApi, 'getSequencesWithTasks')
      .mockImplementation(() => {
        // Simulate the user switching to All while this per-episode request
        // is still in flight.
        scopedRootGetters.currentEpisode = { id: 'all' }
        return Promise.resolve(sequences)
      })
    const commit = vi.fn()
    await sequencesStore.actions.loadSequencesWithTasks({
      commit,
      state: {},
      rootGetters: scopedRootGetters
    })
    expect(getSequencesWithTasks).toHaveBeenCalledWith(production, {
      id: 'ep-a'
    })
    expect(commit.mock.calls.map(c => c[0])).not.toContain(
      'SET_SEQUENCES_WITH_TASKS'
    )
  })

  describe('sequenceOptions', () => {
    const state = {
      displayedSequences: [
        {
          id: 'sq-1',
          name: 'SQ010',
          episode_id: 'ep-a',
          full_name: 'E01 / SQ010'
        },
        {
          id: 'sq-2',
          name: 'SQ010',
          episode_id: 'ep-b',
          full_name: 'E02 / SQ010'
        }
      ]
    }

    test('qualifies same-named sequences with their episode in All mode', () => {
      const options = sequencesStore.getters.sequenceOptions(
        state,
        {},
        {},
        rootGetters
      )
      expect(options).toEqual([
        { label: 'E01 / SQ010', value: 'sq-1' },
        { label: 'E02 / SQ010', value: 'sq-2' }
      ])
    })

    test('keeps the bare sequence name outside All mode', () => {
      const options = sequencesStore.getters.sequenceOptions(state, {}, {}, {
        ...rootGetters,
        currentEpisode: { id: 'ep-a' }
      })
      expect(options).toEqual([
        { label: 'SQ010', value: 'sq-1' },
        { label: 'SQ010', value: 'sq-2' }
      ])
    })
  })
})
