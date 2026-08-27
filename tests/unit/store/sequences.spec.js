import { vi } from 'vitest'

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
})
