// @vitest-environment node

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

  describe('loaded scope', () => {
    test('records the scope the sequences were loaded for', async () => {
      vi.spyOn(shotsApi, 'getSequencesWithTasks').mockResolvedValue([])
      const commit = vi.fn()
      await sequencesStore.actions.loadSequencesWithTasks({
        commit,
        state: {},
        rootGetters: { ...rootGetters, currentEpisode: { id: 'ep-a' } }
      })

      const payload = commit.mock.calls.find(
        call => call[0] === 'SET_SEQUENCES_WITH_TASKS'
      )[1]
      expect(payload.loadingKey).toEqual('p-all/ep-a')
    })

    test('records the all pseudo-episode as itself', async () => {
      vi.spyOn(shotsApi, 'getSequencesWithTasks').mockResolvedValue([])
      const commit = vi.fn()
      await sequencesStore.actions.loadSequencesWithTasks({
        commit,
        state: {},
        rootGetters
      })

      const payload = commit.mock.calls.find(
        call => call[0] === 'SET_SEQUENCES_WITH_TASKS'
      )[1]
      expect(payload.loadingKey).toEqual('p-all/all')
    })

    test('sets the episode it fell back to as the current one', async () => {
      vi.spyOn(shotsApi, 'getSequencesWithTasks').mockResolvedValue([])
      const fallbackGetters = { ...rootGetters, currentEpisode: null }
      // Like the store, the committed fallback becomes the current episode.
      const commit = vi.fn((type, episodeId) => {
        if (type === 'SET_CURRENT_EPISODE') {
          fallbackGetters.currentEpisode = { id: episodeId }
        }
      })
      await sequencesStore.actions.loadSequencesWithTasks({
        commit,
        state: {},
        rootGetters: fallbackGetters
      })

      // The page derives its own scope from currentEpisode. Without this the
      // store records p-all/ep-a while the page still computes p-all/, and
      // every mount reloads the sequences it already holds.
      expect(commit).toHaveBeenCalledWith('SET_CURRENT_EPISODE', 'ep-a')
      const payload = commit.mock.calls.find(
        call => call[0] === 'SET_SEQUENCES_WITH_TASKS'
      )[1]
      expect(payload.loadingKey).toEqual('p-all/ep-a')
    })

    test('serves the recorded scope through a getter and drops it on clear', () => {
      const state = {}
      sequencesStore.mutations.SET_SEQUENCES_WITH_TASKS(state, {
        episodeMap: new Map(),
        userFilters: {},
        personMap: new Map(),
        production,
        sequences: [],
        taskMap: new Map(),
        taskTypeMap: new Map(),
        taskStatusMap: new Map(),
        loadingKey: 'p-all/ep-a'
      })
      expect(sequencesStore.getters.sequencesLoadingKey(state)).toEqual(
        'p-all/ep-a'
      )

      sequencesStore.mutations.CLEAR_SEQUENCES(state)
      expect(state.sequencesLoadingKey).toBeNull()
    })

    // A production switch clears the sequences through CLEAR_SHOTS: the
    // scope of the emptied dataset must go with it, or the live insertion
    // fills the next production's list from the previous scope.
    test('drops the scope with the dataset on a production switch', () => {
      const state = {}
      sequencesStore.mutations.SET_SEQUENCES_WITH_TASKS(state, {
        episodeMap: new Map(),
        userFilters: {},
        personMap: new Map(),
        production,
        sequences: [],
        taskMap: new Map(),
        taskTypeMap: new Map(),
        taskStatusMap: new Map(),
        loadingKey: 'p-all/all'
      })
      sequencesStore.mutations.CLEAR_SHOTS(state)
      expect(state.sequencesLoadingKey).toBeNull()
    })

    // The schedule loads the sequences without tasks through loadSequences:
    // that dataset replaces the one the key describes. Its scope is recorded
    // with a marker: the pages that need the tasks refetch, the live
    // insertion still knows which episode the dataset holds.
    test('records the task-less load under its own marked scope', async () => {
      vi.spyOn(shotsApi, 'getSequences').mockResolvedValue([])
      const commit = vi.fn()
      await sequencesStore.actions.loadSequences({
        commit,
        state: {},
        rootGetters: { ...rootGetters, currentEpisode: { id: 'ep-a' } }
      })
      const payload = commit.mock.calls.find(
        call => call[0] === 'LOAD_SEQUENCES_END'
      )[1]
      expect(payload.loadingKey).toEqual('p-all/ep-a#partial')
    })

    test('records the whole production for the task-less load in All mode', async () => {
      vi.spyOn(shotsApi, 'getSequences').mockResolvedValue([])
      const commit = vi.fn()
      await sequencesStore.actions.loadSequences({
        commit,
        state: {},
        rootGetters
      })
      const payload = commit.mock.calls.find(
        call => call[0] === 'LOAD_SEQUENCES_END'
      )[1]
      expect(payload.loadingKey).toEqual('p-all/all#partial')
    })

    test('replaces the scope of the with-tasks dataset by the task-less one', () => {
      const state = {}
      sequencesStore.mutations.SET_SEQUENCES_WITH_TASKS(state, {
        episodeMap: new Map(),
        userFilters: {},
        personMap: new Map(),
        production,
        sequences: [],
        taskMap: new Map(),
        taskTypeMap: new Map(),
        taskStatusMap: new Map(),
        loadingKey: 'p-all/ep-a'
      })
      sequencesStore.mutations.LOAD_SEQUENCES_END(state, {
        sequences: [],
        episodeMap: new Map(),
        production,
        userFilters: {},
        loadingKey: 'p-all/all#partial'
      })
      expect(state.sequencesLoadingKey).toEqual('p-all/all#partial')
    })
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

describe('Sequences store, task entity name', () => {
  const production = { id: 'p1' }
  const episodeMap = new Map([['ep-a', { id: 'ep-a', name: 'E01' }]])
  const taskTypeMap = new Map([
    ['tt-1', { id: 'tt-1', name: 'Layout', priority: 1 }]
  ])
  const taskStatusMap = new Map()
  const taskPayload = task => ({ task, production, taskTypeMap, taskStatusMap })
  const buildTask = () => ({
    id: 't-1',
    entity_id: 'seq-1',
    task_type_id: 'tt-1',
    task_status_id: 'ts-1'
  })
  const buildState = () => ({
    displayedSequences: [],
    sequenceValidationColumns: [],
    sequenceFilledColumns: {}
  })

  beforeEach(() => {
    sequencesStore.cache.sequenceMap.clear()
    sequencesStore.cache.sequences = []
  })

  // newSequence commits NEW_SEQUENCE_END then creates the entity tasks, so
  // the task must get its name from a sequence never loaded with tasks.
  test('a task created right after its sequence is named after it', () => {
    const state = buildState()
    const sequence = {
      id: 'seq-1',
      name: 'SQ01',
      project_id: 'p1',
      episode_id: 'ep-a',
      parent_id: 'ep-a'
    }
    sequencesStore.mutations.NEW_SEQUENCE_END(state, { sequence, episodeMap })
    const task = buildTask()
    sequencesStore.mutations.NEW_TASK_END(state, taskPayload(task))
    expect(task.entity_name).toEqual('E01 / SQ01')
  })

  test('a sequence loaded alone names the tasks created for it', () => {
    const state = buildState()
    const sequence = {
      id: 'seq-1',
      name: 'SQ01',
      project_id: 'p1',
      parent_id: 'ep-a',
      tasks: [],
      validations: new Map()
    }
    sequencesStore.mutations.ADD_SEQUENCE(state, { sequence, episodeMap })
    const task = buildTask()
    sequencesStore.mutations.CREATE_TASKS_END(
      state,
      { ...taskPayload(task), tasks: [task] }
    )
    expect(task.entity_name).toEqual('E01 / SQ01')
  })

  test('a sequence without episode names its tasks by itself', () => {
    const state = buildState()
    const sequence = { id: 'seq-1', name: 'SQ01', project_id: 'p1' }
    sequencesStore.mutations.NEW_SEQUENCE_END(state, { sequence, episodeMap })
    const task = buildTask()
    sequencesStore.mutations.NEW_TASK_END(state, taskPayload(task))
    expect(task.entity_name).toEqual('SQ01')
  })
})

describe('Sequences store, loadSequence live insertion', () => {
  const rootGetters = {
    currentProduction: { id: 'p-live' },
    currentEpisode: { id: 'ep-a' },
    episodeMap: new Map(),
    isTVShow: true
  }

  const committedTypes = async (payload, sequencesLoadingKey, sequence) => {
    vi.spyOn(shotsApi, 'getSequence').mockResolvedValue(sequence)
    const commit = vi.fn()
    await sequencesStore.actions.loadSequence(
      { commit, state: { sequencesLoadingKey }, rootGetters },
      payload
    )
    return commit.mock.calls.map(([type]) => type)
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('skips a sequence of another episode when asked to stay in scope', async () => {
    const types = await committedTypes(
      { sequenceId: 's-scope-1', onlyInScope: true },
      'p-live/ep-a',
      { id: 's-scope-1', parent_id: 'ep-b' }
    )
    expect(types).not.toContain('ADD_SEQUENCE')
  })

  test('adds a sequence of the loaded episode', async () => {
    const types = await committedTypes(
      { sequenceId: 's-scope-2', onlyInScope: true },
      'p-live/ep-a',
      { id: 's-scope-2', parent_id: 'ep-a' }
    )
    expect(types).toContain('ADD_SEQUENCE')
  })

  test('adds any sequence to a production-wide dataset', async () => {
    const types = await committedTypes(
      { sequenceId: 's-scope-3', onlyInScope: true },
      'p-live/all',
      { id: 's-scope-3', parent_id: 'ep-b' }
    )
    expect(types).toContain('ADD_SEQUENCE')
  })

  test('skips a sequence of another production', async () => {
    const types = await committedTypes(
      { sequenceId: 's-scope-6', onlyInScope: true },
      'p-live/all',
      { id: 's-scope-6', parent_id: 'ep-b', project_id: 'p-other' }
    )
    expect(types).not.toContain('ADD_SEQUENCE')
  })

  // The task-less load records its scope with a marker.
  test('adds a sequence of the episode loaded without tasks', async () => {
    const types = await committedTypes(
      { sequenceId: 's-scope-5', onlyInScope: true },
      'p-live/ep-a#partial',
      { id: 's-scope-5', parent_id: 'ep-a' }
    )
    expect(types).toContain('ADD_SEQUENCE')
  })

  test('still adds an out-of-scope sequence loaded by id', async () => {
    const types = await committedTypes('s-scope-4', 'p-live/ep-a', {
      id: 's-scope-4',
      parent_id: 'ep-b'
    })
    expect(types).toContain('ADD_SEQUENCE')
  })

  // An update then a deletion within one round trip: the refresh must not
  // bring back the row the deletion removed.
  test('keeps out a displayed sequence deleted during its refresh', async () => {
    sequencesStore.cache.sequenceMap.set('s-gone', { id: 's-gone' })
    vi.spyOn(shotsApi, 'getSequence').mockImplementation(async () => {
      sequencesStore.cache.sequenceMap.delete('s-gone')
      return { id: 's-gone', parent_id: 'ep-a', project_id: 'p-live' }
    })
    const commit = vi.fn()

    await sequencesStore.actions.loadSequence(
      { commit, state: { sequencesLoadingKey: 'p-live/ep-a' }, rootGetters },
      { sequenceId: 's-gone', onlyInScope: true }
    )

    expect(commit).not.toHaveBeenCalled()
  })
})

describe('Sequences store, ADD_SEQUENCE', () => {
  // The list load leaves the cached list and the displayed one as the same
  // array: pushing into each in place inserted the sequence twice.
  test('inserts a live sequence once', () => {
    const state = { displayedSequences: [] }
    sequencesStore.mutations.LOAD_SEQUENCES_END(state, {
      sequences: [
        { id: 'sq-1', name: 'SQ01', parent_id: 'ep-a' },
        { id: 'sq-2', name: 'SQ02', parent_id: 'ep-a' }
      ],
      episodeMap: new Map(),
      production: { id: 'p-add' },
      userFilters: {},
      loadingKey: 'p-add/ep-a'
    })

    sequencesStore.mutations.ADD_SEQUENCE(state, {
      sequence: { id: 'sq-3', name: 'SQ03', parent_id: 'ep-a' },
      episodeMap: new Map()
    })

    expect(state.displayedSequences.map(({ id }) => id)).toEqual([
      'sq-1',
      'sq-2',
      'sq-3'
    ])
    expect(state.displayedSequencesLength).toBe(3)
  })

  // zou emits sequence:new before the creation response lands, so the socket
  // handler inserts the sequence first: the response must not append a copy.
  test('does not duplicate a sequence the socket handler already added', () => {
    const state = { displayedSequences: [] }
    sequencesStore.mutations.LOAD_SEQUENCES_END(state, {
      sequences: [{ id: 'sq-1', name: 'SQ01', parent_id: 'ep-a' }],
      episodeMap: new Map(),
      production: { id: 'p-race' },
      userFilters: {},
      loadingKey: 'p-race/ep-a'
    })
    const sequence = { id: 'sq-2', name: 'SQ02', parent_id: 'ep-a' }

    sequencesStore.mutations.ADD_SEQUENCE(state, {
      sequence: { ...sequence },
      episodeMap: new Map()
    })
    sequencesStore.mutations.NEW_SEQUENCE_END(state, {
      sequence: { ...sequence },
      episodeMap: new Map()
    })

    expect(sequencesStore.cache.sequences.map(({ id }) => id)).toEqual([
      'sq-1',
      'sq-2'
    ])
    expect(state.displayedSequences.map(({ id }) => id)).toEqual([
      'sq-1',
      'sq-2'
    ])
  })
})

describe('Sequences store, live insertion during a list load', () => {
  const rootGetters = {
    currentProduction: { id: 'p-live' },
    currentEpisode: { id: 'ep-b' },
    episodeMap: new Map(),
    isTVShow: true
  }

  afterEach(() => {
    sequencesStore.cache.sequencesLoadingPromise = null
    sequencesStore.cache.sequenceMap.delete('s-flight-3')
    vi.restoreAllMocks()
  })

  // The list load replaces the whole dataset: inserting before its response
  // lands drops the sequence, and the scope it would be checked against
  // still describes the previous dataset.
  test('waits for the list in flight before inserting', async () => {
    vi.spyOn(shotsApi, 'getSequence').mockResolvedValue({
      id: 's-flight-1',
      parent_id: 'ep-b',
      project_id: 'p-live'
    })
    let endList
    const state = { sequencesLoadingKey: 'p-live/ep-a' }
    sequencesStore.cache.sequencesLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.sequencesLoadingKey = 'p-live/ep-b'
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = sequencesStore.actions.loadSequence(
      { commit, state, rootGetters },
      { sequenceId: 's-flight-1', onlyInScope: true }
    )
    await Promise.resolve()
    expect(commit).not.toHaveBeenCalled()

    endList()
    await loading
    expect(commit.mock.calls.map(([type]) => type)).toContain('ADD_SEQUENCE')
  })

  // The fetch waits for the list response: issued after it, the payload is
  // the younger one and refreshes the row the list rebuilt.
  test('fetches once the list load settled and refreshes the row', async () => {
    vi.spyOn(shotsApi, 'getSequence').mockResolvedValue({
      id: 's-flight-3',
      parent_id: 'ep-b',
      project_id: 'p-live',
      name: 'from-socket'
    })
    let endList
    const state = { sequencesLoadingKey: 'p-live/ep-a' }
    sequencesStore.cache.sequencesLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.sequencesLoadingKey = 'p-live/ep-b'
        sequencesStore.cache.sequenceMap.set('s-flight-3', {
          id: 's-flight-3',
          name: 'from-list'
        })
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = sequencesStore.actions.loadSequence(
      { commit, state, rootGetters },
      { sequenceId: 's-flight-3', onlyInScope: true }
    )
    await Promise.resolve()
    expect(shotsApi.getSequence).not.toHaveBeenCalled()
    endList()
    await loading

    expect(shotsApi.getSequence).toHaveBeenCalledWith('s-flight-3')
    expect(commit.mock.calls).toEqual([
      ['UPDATE_SEQUENCE', expect.objectContaining({ name: 'from-socket' })]
    ])
  })

  test('records the list load in flight', async () => {
    vi.spyOn(shotsApi, 'getSequencesWithTasks').mockResolvedValue([])
    const loading = sequencesStore.actions.loadSequencesWithTasks({
      commit: vi.fn(),
      state: {},
      rootGetters: {
        ...rootGetters,
        episodes: [{ id: 'ep-b' }],
        personMap: new Map(),
        route: { params: {} },
        userFilters: {},
        taskMap: new Map(),
        taskStatusMap: new Map(),
        taskTypeMap: new Map()
      }
    })
    expect(sequencesStore.cache.sequencesLoadingPromise).not.toBeNull()
    await loading
  })
})

describe('Sequences store, CREATE_TASKS_END', () => {
  afterEach(() => {
    sequencesStore.cache.sequenceMap.delete('s-live-tasks')
  })

  // Created by a colleague, the row arrives without task columns: a task
  // created on it threw and never showed.
  test('creates a task on a sequence added live', () => {
    sequencesStore.cache.sequenceMap.set('s-live-tasks', {
      id: 's-live-tasks',
      name: 'SQ01'
    })
    sequencesStore.mutations.CREATE_TASKS_END(
      { displayedSequences: [] },
      {
        tasks: [
          {
            id: 't-live',
            entity_id: 's-live-tasks',
            task_type_id: 'tt1',
            task_status_id: 'ts1'
          }
        ],
        production: { id: 'p1' },
        taskTypeMap: new Map([['tt1', { id: 'tt1', priority: 1 }]]),
        taskStatusMap: new Map()
      }
    )
    const sequence = sequencesStore.cache.sequenceMap.get('s-live-tasks')
    expect(sequence.validations.get('tt1')).toBe('t-live')
    expect(sequence.tasks).toEqual(['t-live'])
  })
})

describe('Sequences store, late responses', () => {
  const buildRootGetters = () => ({
    currentProduction: { id: 'p1' },
    currentEpisode: { id: 'ep-empty' },
    episodes: [],
    episodeMap: new Map(),
    isTVShow: true,
    personMap: new Map(),
    route: { params: {} },
    taskMap: new Map(),
    taskStatusMap: new Map(),
    taskTypeMap: new Map(),
    userFilters: {}
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // The Sequences page reloads on every episode change without serializing
  // the loads: an empty episode answering last must not empty the list of
  // the episode switched to.
  test('drops an empty response for an episode left during the fetch', async () => {
    const rootGetters = buildRootGetters()
    vi.spyOn(shotsApi, 'getSequencesWithTasks').mockImplementation(async () => {
      rootGetters.currentEpisode = { id: 'ep-b' }
      return []
    })
    const commit = vi.fn()

    await sequencesStore.actions.loadSequencesWithTasks({
      commit,
      state: {},
      rootGetters
    })

    expect(commit.mock.calls.map(([type]) => type)).not.toContain(
      'SET_SEQUENCES_WITH_TASKS'
    )
  })

  test('drops a plain response for an episode left during the fetch', async () => {
    const rootGetters = buildRootGetters()
    vi.spyOn(shotsApi, 'getSequences').mockImplementation(async () => {
      rootGetters.currentEpisode = { id: 'ep-b' }
      return [{ id: 's1', parent_id: 'ep-empty' }]
    })
    const commit = vi.fn()

    await sequencesStore.actions.loadSequences({
      commit,
      state: {},
      rootGetters
    })

    expect(commit).not.toHaveBeenCalled()
  })
})
