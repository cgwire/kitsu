// @vitest-environment node

import { vi } from 'vitest'
import { computed, reactive } from 'vue'
import { createStore } from 'vuex'

// Importing the sequences module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

vi.mock('@/store/api/client', () => ({
  default: {
    pdel: vi.fn(),
    pget: vi.fn(),
    ppost: vi.fn(),
    pput: vi.fn()
  }
}))

import sequencesStore from '@/store/modules/sequences'
import shotsApi from '@/store/api/shots'
import shotsStore from '@/store/modules/shots'
import client from '@/store/api/client'
import userStore from '@/store/modules/user'
import { LOAD_SEQUENCES_END } from '@/store/mutation-types'

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

    test('serves the recorded scope through a getter', () => {
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

describe('Sequences store, COMPUTE_SEQUENCE_STATS', () => {
  test('counts the shots of each sequence along with the task stats', () => {
    shotsStore.cache.shots = [
      { id: 's1', sequence_id: 'sq01', tasks: [] },
      { id: 's2', sequence_id: 'sq01', tasks: [] },
      { id: 's3', sequence_id: 'sq02', tasks: [], canceled: true }
    ]
    const state = { searchSequenceFilters: [] }
    sequencesStore.mutations.COMPUTE_SEQUENCE_STATS(state, {
      taskStatusMap: new Map(),
      taskMap: new Map()
    })
    expect(state.sequenceShotCounts).toEqual({ sq01: 2 })
    expect(sequencesStore.getters.sequenceShotCounts(state)).toEqual({ sq01: 2 })
    shotsStore.cache.shots = []
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

describe('Sequences store, DELETE_TASK_END', () => {
  afterEach(() => {
    sequencesStore.cache.sequenceMap.clear()
    sequencesStore.cache.sequences = []
  })

  // The task page reloads the plain list, whose rows carry no tasks: deleting
  // a task of one of them threw, and the modules after this one kept the task.
  test('leaves a sequence loaded without its tasks unchanged', () => {
    sequencesStore.mutations.LOAD_SEQUENCES_END(
      { displayedSequences: [] },
      {
        sequences: [{ id: 'sq-plain', name: 'SQ01', parent_id: 'ep-a' }],
        episodeMap: new Map(),
        production: { id: 'p-delete' },
        userFilters: {},
        loadingKey: 'p-delete/ep-a#partial'
      }
    )

    sequencesStore.mutations.DELETE_TASK_END(
      {},
      { id: 't1', entity_id: 'sq-plain', task_type_id: 'tt1' }
    )

    const sequence = sequencesStore.cache.sequenceMap.get('sq-plain')
    expect(sequence.tasks).toBeUndefined()
    expect(sequence.validations).toBeUndefined()
  })

  test('removes the task of a sequence loaded with its tasks', () => {
    sequencesStore.cache.sequenceMap.set('sq-full', {
      id: 'sq-full',
      tasks: ['t1', 't2'],
      validations: new Map([
        ['tt1', 't1'],
        ['tt2', 't2']
      ])
    })

    sequencesStore.mutations.DELETE_TASK_END(
      {},
      { id: 't1', entity_id: 'sq-full', task_type_id: 'tt1' }
    )

    const sequence = sequencesStore.cache.sequenceMap.get('sq-full')
    expect(sequence.tasks).toEqual(['t2'])
    expect([...sequence.validations]).toEqual([['tt2', 't2']])
  })

  test('keeps the tasks of a sequence when a task it does not list is deleted', () => {
    sequencesStore.cache.sequenceMap.set('se-full', {
      id: 'se-full',
      tasks: ['t1', 't2'],
      validations: new Map([
        ['tt1', 't1'],
        ['tt2', 't2']
      ])
    })

    sequencesStore.mutations.DELETE_TASK_END(
      {},
      { id: 't9', entity_id: 'se-full', task_type_id: 'tt3' }
    )

    expect(sequencesStore.cache.sequenceMap.get('se-full').tasks).toEqual([
      't1',
      't2'
    ])
  })
})

// The search reads the index of the cached list: every change of that list
// has to rebuild this index.
describe('Sequences store, search index', () => {
  const production = { id: 'p-search', descriptors: [] }

  const buildSequence = (id, name) => ({
    id,
    name,
    data: {},
    description: '',
    tasks: []
  })

  const load = sequences => {
    const state = { sequenceSorting: [] }
    sequencesStore.mutations.SET_SEQUENCES_WITH_TASKS(state, {
      episodeMap: new Map(),
      userFilters: {},
      personMap: new Map(),
      production,
      sequences,
      taskMap: new Map(),
      taskTypeMap: new Map(),
      taskStatusMap: new Map(),
      loadingKey: 'p-search/all'
    })
    return state
  }

  const search = (state, sequenceSearch) => {
    sequencesStore.mutations.SET_SEQUENCE_SEARCH(state, {
      sequenceSearch,
      production,
      taskStatusMap: new Map(),
      taskTypeMap: new Map(),
      persons: [],
      taskMap: new Map()
    })
    return state.displayedSequences.map(({ name }) => name)
  }

  test('finds an edited sequence under its new name only', () => {
    const state = load([
      buildSequence('sq-1', 'SQ010'),
      buildSequence('sq-2', 'SQ020')
    ])

    sequencesStore.mutations.EDIT_SEQUENCE_END(
      state,
      buildSequence('sq-2', 'SQ999')
    )

    expect(search(state, 'SQ999')).toEqual(['SQ999'])
    expect(search(state, 'SQ020')).toEqual([])
  })

  test('finds a sequence another user renamed', () => {
    const state = load([
      buildSequence('sq-1', 'SQ010'),
      buildSequence('sq-2', 'SQ020')
    ])

    sequencesStore.mutations.UPDATE_SEQUENCE(
      state,
      buildSequence('sq-2', 'SQ999')
    )

    expect(search(state, 'SQ999')).toEqual(['SQ999'])
  })

  test('finds a sequence another user renamed while the search hid it', () => {
    const state = load([
      buildSequence('sq-1', 'SQ010'),
      buildSequence('sq-2', 'SQ020')
    ])
    search(state, 'SQ010')

    sequencesStore.mutations.UPDATE_SEQUENCE(
      state,
      buildSequence('sq-2', 'SQ999')
    )

    expect(search(state, 'SQ999')).toEqual(['SQ999'])
  })

  test('finds a sequence another user added', () => {
    const state = load([buildSequence('sq-1', 'SQ010')])

    sequencesStore.mutations.ADD_SEQUENCE(state, {
      sequence: buildSequence('sq-3', 'SQ030'),
      episodeMap: new Map()
    })

    expect(search(state, 'SQ030')).toEqual(['SQ030'])
  })

  test('searches the sequences of a load without tasks', () => {
    const state = load([buildSequence('sq-1', 'SQ010')])

    sequencesStore.mutations.LOAD_SEQUENCES_END(state, {
      sequences: [buildSequence('sq-4', 'SQ040')],
      episodeMap: new Map(),
      production,
      userFilters: {},
      loadingKey: 'p-search/all'
    })

    expect(search(state, 'SQ040')).toEqual(['SQ040'])
    expect(search(state, 'SQ010')).toEqual([])
  })
})

describe('Sequences store, UPDATE_SEQUENCE', () => {
  // The list reads the displayed sequences through the reactive state: a
  // change made to the raw object of the cache does not reach it.
  test('shows the new name of a sequence another user renamed', () => {
    const state = reactive({ sequenceSorting: [] })
    sequencesStore.mutations.SET_SEQUENCES_WITH_TASKS(state, {
      episodeMap: new Map(),
      userFilters: {},
      personMap: new Map(),
      production: { id: 'p-update', descriptors: [] },
      sequences: [
        { id: 'sq-1', name: 'SQ010', data: {}, tasks: [] },
        { id: 'sq-2', name: 'SQ020', data: {}, tasks: [] }
      ],
      taskMap: new Map(),
      taskTypeMap: new Map(),
      taskStatusMap: new Map(),
      loadingKey: 'p-update/all'
    })
    const names = computed(() =>
      state.displayedSequences.map(({ name }) => name)
    )
    expect(names.value).toEqual(['SQ010', 'SQ020'])

    sequencesStore.mutations.UPDATE_SEQUENCE(state, {
      id: 'sq-2',
      name: 'SQ999',
      data: {}
    })

    expect(names.value).toEqual(['SQ010', 'SQ999'])
  })
})

describe('Sequences store, production switch', () => {
  // The back link of a sequence page carries this search: the lists of
  // another production must not inherit it.
  test('forgets the search typed in the previous production', () => {
    const store = createStore({
      modules: {
        sequences: {
          state: { sequenceSearchText: 'SQ01' },
          getters: sequencesStore.getters,
          mutations: sequencesStore.mutations
        }
      }
    })

    store.commit('SET_CURRENT_PRODUCTION', 'production-2')

    expect(store.getters.sequenceSearchText).toBe('')
  })
})

describe('Sequences store, saved searches', () => {
  const production = { id: 'p1' }
  const names = list => list.map(({ name }) => name)

  const buildStore = () =>
    createStore({
      modules: { sequences: sequencesStore, user: userStore },
      getters: { currentProduction: () => production }
    })

  const reloadSequences = store =>
    store.commit(LOAD_SEQUENCES_END, {
      sequences: [],
      episodeMap: new Map(),
      production,
      userFilters: store.getters.userFilters
    })

  beforeEach(() => {
    Object.values(client).forEach(fn => fn.mockReset())
    userStore.state.userFilters = {}
    sequencesStore.state.sequenceSearchQueries = []
  })

  // The list reload takes its searches from the user filters: the first
  // search saved in a production must land there too.
  test('keeps the first search of a production across a reload', async () => {
    const store = buildStore()
    reloadSequences(store)
    client.ppost.mockResolvedValueOnce({ id: 'f1', name: 'wip' })

    await store.dispatch('saveSequenceSearch', {
      name: 'wip',
      search_query: 'wip'
    })

    expect(client.ppost).toHaveBeenCalledWith('/api/data/user/filters', {
      list_type: 'sequence',
      name: 'wip',
      query: 'wip',
      entity_type: 'Sequence',
      project_id: 'p1'
    })
    expect(names(store.getters.sequenceSearchQueries)).toEqual(['wip'])
    reloadSequences(store)
    expect(names(store.getters.sequenceSearchQueries)).toEqual(['wip'])
  })
})

describe('Sequences store, through a store', () => {
  const production = { id: 'p1', name: 'Caminandes', descriptors: [] }
  const taskTypeMap = new Map([
    ['tt-1', { id: 'tt-1', name: 'Layout', priority: 1 }]
  ])
  const taskStatusMap = new Map([
    ['ts-1', { id: 'ts-1', name: 'Todo', short_name: 'todo' }]
  ])

  const buildStore = async (getters = {}, actions = {}) => {
    vi.resetModules()
    const { default: module } = await import('@/store/modules/sequences')
    const store = createStore({
      modules: { sequences: module },
      getters: {
        currentProduction: () => production,
        episodeMap: () => new Map(),
        isTVShow: () => false,
        people: () => [],
        productionSequenceTaskTypeIds: () => [],
        taskMap: () => new Map(),
        taskStatus: () => [],
        taskStatusMap: () => taskStatusMap,
        taskTypeMap: () => taskTypeMap,
        ...getters
      },
      actions
    })
    return { module, store }
  }

  const buildSequence = (id, name, duration = 0) => ({
    id,
    name,
    data: {},
    tasks: [
      {
        id: `task-${id}`,
        task_type_id: 'tt-1',
        task_status_id: 'ts-1',
        duration,
        estimation: 0,
        assignees: []
      }
    ]
  })

  const loadSequences = (store, sequences) =>
    store.commit('SET_SEQUENCES_WITH_TASKS', {
      episodeMap: new Map(),
      userFilters: {},
      personMap: new Map(),
      production,
      sequences,
      taskMap: new Map(),
      taskTypeMap,
      taskStatusMap
    })

  beforeEach(() => {
    Object.values(client).forEach(fn => fn.mockReset())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('updates the list totals once a sequence is deleted', async () => {
    const { store } = await buildStore()
    loadSequences(store, [
      buildSequence('sq1', 'SQ01', 60),
      buildSequence('sq2', 'SQ02', 30)
    ])
    client.pdel.mockResolvedValueOnce()

    await store.dispatch('deleteSequence', { id: 'sq1' })

    expect(client.pdel).toHaveBeenCalledWith(
      '/api/data/sequences/sq1?force=true'
    )
    expect(store.getters.displayedSequencesLength).toBe(1)
    expect(store.getters.displayedSequencesTimeSpent).toBe(30)
  })
  // A sequence added live carries no totals yet.
  test('keeps the list totals with a sequence added live', async () => {
    const { store } = await buildStore()
    loadSequences(store, [
      buildSequence('sq1', 'SQ01', 60),
      buildSequence('sq2', 'SQ02', 30)
    ])
    store.commit('ADD_SEQUENCE', {
      sequence: { id: 'sq3', name: 'SQ03', data: {} },
      episodeMap: new Map()
    })
    client.pdel.mockResolvedValueOnce()

    await store.dispatch('deleteSequence', { id: 'sq1' })

    expect(store.getters.displayedSequencesLength).toBe(2)
    expect(store.getters.displayedSequencesTimeSpent).toBe(30)
    expect(store.getters.displayedSequencesEstimation).toBe(0)
  })

  const names = list => list.map(({ name }) => name)

  test('locks an edited sequence until a while after its save', async () => {
    const { store } = await buildStore()
    loadSequences(store, [buildSequence('sq1', 'SQ01')])
    store.getters.sequenceMap.get('sq1').data = { fps: '24' }
    client.pput.mockResolvedValueOnce({})
    const form = { id: 'sq1', name: 'SQ01 bis', description: 'Intro', data: {} }

    const saving = store.dispatch('editSequence', form)

    const sequence = store.getters.sequenceMap.get('sq1')
    expect(sequence).toMatchObject({
      lock: 1,
      name: 'SQ01 bis',
      data: { fps: '24' }
    })
    expect(names(store.getters.displayedSequences)).toEqual(['SQ01 bis'])
    expect(store.getters.isSequenceDescription).toBe(true)
    await saving
    expect(client.pput).toHaveBeenCalledWith('/api/data/entities/sq1', {
      name: 'SQ01 bis',
      description: 'Intro',
      data: {}
    })
    expect(sequence.lock).toBe(1)
    vi.advanceTimersByTime(2000)
    expect(sequence.lock).toBe(0)
  })

  // Deleted in another session while its modal was open, for instance.
  test('saves the edit of a sequence missing from the loaded list', async () => {
    const { store } = await buildStore()
    loadSequences(store, [buildSequence('sq1', 'SQ01')])
    client.pput.mockResolvedValueOnce({})
    const form = { id: 'sq9', name: 'SQ09', description: 'Gone', data: {} }

    await store.dispatch('editSequence', form)

    expect(client.pput).toHaveBeenCalledWith('/api/data/entities/sq9', {
      name: 'SQ09',
      description: 'Gone',
      data: {}
    })
    expect(names(store.getters.displayedSequences)).toEqual(['SQ01'])
  })

  // The list and the pages show an edit before Zou answers.
  test('puts back what an edit Zou refuses changed', async () => {
    const { store } = await buildStore()
    loadSequences(store, [buildSequence('sq1', 'SQ01')])
    const sequence = store.getters.sequenceMap.get('sq1')
    sequence.data = { fps: '24' }
    client.pput.mockRejectedValueOnce(new Error('Bad Request'))
    const form = {
      id: 'sq1',
      name: 'SQ01 bis',
      description: 'Intro',
      data: { fps: '25' }
    }

    await expect(store.dispatch('editSequence', form)).rejects.toThrow(
      'Bad Request'
    )

    expect(sequence).toMatchObject({ name: 'SQ01', data: { fps: '24' } })
    expect(sequence.description).toBeUndefined()
    expect(names(store.getters.displayedSequences)).toEqual(['SQ01'])
  })

  test('creates a sequence at its place in the list', async () => {
    const { store } = await buildStore()
    loadSequences(store, [
      buildSequence('sq1', 'SQ01'),
      buildSequence('sq3', 'SQ03')
    ])
    client.ppost.mockResolvedValueOnce({
      id: 'sq2',
      name: 'SQ02',
      project_id: 'p1'
    })

    const sequence = await store.dispatch('newSequence', {
      name: 'SQ02',
      project_id: 'p1',
      description: '',
      data: {}
    })

    expect(client.ppost).toHaveBeenCalledWith(
      '/api/data/projects/p1/sequences',
      {
        name: 'SQ02',
        episode_id: undefined,
        description: '',
        data: {}
      }
    )
    expect(sequence).toMatchObject({
      id: 'sq2',
      production_id: 'p1',
      tasks: []
    })
    expect(names(store.getters.displayedSequences)).toEqual([
      'SQ01',
      'SQ02',
      'SQ03'
    ])
    expect(store.getters.displayedSequencesLength).toBe(3)
  })

  test('refuses a sequence name already taken in its episode', async () => {
    const { store } = await buildStore({ isTVShow: () => true })
    loadSequences(store, [
      { ...buildSequence('sq1', 'SQ01'), episode_id: 'e1' }
    ])
    client.ppost.mockResolvedValue({
      id: 'sq2',
      name: 'SQ01',
      project_id: 'p1'
    })

    await expect(
      store.dispatch('newSequence', { name: 'SQ01', episode_id: 'e1' })
    ).rejects.toThrow('Sequence already exists')
    await store.dispatch('newSequence', { name: 'SQ01', episode_id: 'e2' })

    expect(client.ppost).toHaveBeenCalledTimes(1)
  })

  test('creates the tasks of the sequence task types', async () => {
    const createEntityTasks = vi.fn()
    const { store } = await buildStore(
      { productionSequenceTaskTypeIds: () => ['tt-1'] },
      { createEntityTasks }
    )
    loadSequences(store, [])
    client.ppost.mockResolvedValueOnce({ id: 'sq2', name: 'SQ02' })

    await store.dispatch('newSequence', { name: 'SQ02', project_id: 'p1' })

    expect(createEntityTasks).toHaveBeenCalledWith(expect.anything(), {
      entityId: 'sq2',
      taskTypeIds: ['tt-1']
    })
  })

  test('removes a saved sequence search', async () => {
    const { store } = await buildStore()
    store.state.sequences.sequenceSearchQueries = [
      { id: 'f1', name: 'done' },
      { id: 'f2', name: 'wip' }
    ]
    client.pdel.mockResolvedValueOnce()

    await store.dispatch('removeSequenceSearch', { id: 'f1', name: 'done' })

    expect(client.pdel).toHaveBeenCalledWith('/api/data/user/filters/f1')
    expect(names(store.getters.sequenceSearchQueries)).toEqual(['wip'])
  })

  test('searches the sequences, then sorts them by a descriptor', async () => {
    const { store } = await buildStore()
    const sequences = [
      buildSequence('sq1', 'SQ01'),
      buildSequence('sq2', 'SQ02'),
      buildSequence('sq3', 'SQ03')
    ]
    sequences.forEach((sequence, index) => {
      sequence.data = { difficulty: String([1, 3, 2][index]) }
    })
    loadSequences(store, sequences)

    await store.dispatch('setSequenceSearch', 'SQ02')
    expect(names(store.getters.displayedSequences)).toEqual(['SQ02'])
    expect(store.getters.sequenceSearchText).toBe('SQ02')

    await store.dispatch('setSequenceSearch', '')
    const sortInfo = {
      type: 'metadata',
      column: 'difficulty',
      data_type: 'number',
      ascending: false
    }
    await store.dispatch('changeSequenceSort', sortInfo)
    expect(store.getters.sequenceSorting).toEqual([sortInfo])
    expect(names(store.getters.displayedSequences)).toEqual([
      'SQ02',
      'SQ03',
      'SQ01'
    ])

    await store.dispatch('changeSequenceSort', null)
    expect(store.getters.sequenceSorting).toEqual([])
    expect(names(store.getters.displayedSequences)).toEqual([
      'SQ01',
      'SQ02',
      'SQ03'
    ])
  })

  // The Sequences page reloads its rows on each visit, then applies its sort
  // again: the rows it renders take that order, and the arrows of the detail
  // pages walk the cached list in it.
  test('shows the rows in their sort after a reload', async () => {
    const { module, store } = await buildStore()
    const buildSequences = () =>
      ['SQ01', 'SQ02', 'SQ03'].map((name, index) => ({
        ...buildSequence(`sq${index + 1}`, name),
        data: { difficulty: String([1, 3, 2][index]) }
      }))
    const rows = computed(() => names(store.getters.displayedSequences))
    loadSequences(store, buildSequences())
    await store.dispatch('changeSequenceSort', {
      type: 'metadata',
      column: 'difficulty',
      data_type: 'number',
      ascending: false
    })
    expect(rows.value).toEqual(['SQ02', 'SQ03', 'SQ01'])

    loadSequences(store, buildSequences())
    expect(rows.value).toEqual(['SQ01', 'SQ02', 'SQ03'])
    await store.dispatch('setSequenceSearch', '')

    expect(rows.value).toEqual(['SQ02', 'SQ03', 'SQ01'])
    expect(names(module.cache.sequences)).toEqual(['SQ02', 'SQ03', 'SQ01'])
  })

  test('narrows the sequences of the stats page to a search', async () => {
    const { store } = await buildStore()
    loadSequences(store, [
      buildSequence('sq1', 'SQ01'),
      buildSequence('sq2', 'SQ02')
    ])

    await store.dispatch('setSequenceStatsSearch', 'SQ01')

    expect(names(store.getters.displayedSequences)).toEqual(['SQ01'])
    expect(store.getters.displayedSequencesLength).toBe(1)
    expect(store.getters.sequenceSearchText).toBe('SQ01')
  })

  test('counts the shots of a search in the sequence stats', async () => {
    const descriptors = [
      { id: 'd1', name: 'Mood', field_name: 'mood', entity_type: 'Shot' }
    ]
    const { store } = await buildStore({
      currentProduction: () => ({ ...production, descriptors })
    })
    const { default: shotStore } = await import('@/store/modules/shots')
    shotStore.cache.shots = [
      { id: 's1', sequence_id: 'sq1', tasks: [], data: { mood: 'calm' } },
      { id: 's2', sequence_id: 'sq1', tasks: [], data: { mood: 'dark' } },
      { id: 's3', sequence_id: 'sq2', tasks: [], data: { mood: 'calm' } }
    ]

    store.dispatch('setSequenceStatsSearch', 'mood=calm')
    store.dispatch('computeSequenceStats')

    expect(store.getters.sequenceShotCounts).toEqual({ sq1: 1, sq2: 1 })
    shotStore.cache.shots = []
  })

  test('tracks the selected task cells', async () => {
    const { store } = await buildStore()
    loadSequences(store, [
      buildSequence('sq1', 'SQ01'),
      buildSequence('sq2', 'SQ02')
    ])
    store.state.sequences.sequenceValidationColumns = ['tt-1', 'tt-2']
    const grid = () => [...store.getters.sequenceSelectionGrid].sort()

    store.commit('ADD_SELECTED_TASK', { x: 0, y: 1 })
    store.commit('ADD_SELECTED_TASKS', [
      { x: 1, y: 0 },
      { x: 1, y: 1 }
    ])
    expect(grid()).toEqual(['0-1', '1-0', '1-1'])

    store.commit('REMOVE_SELECTED_TASK', { x: 0, y: 1 })
    store.commit('REMOVE_SELECTED_TASK', {
      task: { column: { id: 'tt-2' }, entity: { id: 'sq2' } }
    })
    expect(grid()).toEqual(['1-0'])

    store.commit('CLEAR_SELECTED_TASKS')
    expect(grid()).toEqual([])
  })

  test('renames a descriptor field in the sequence data', async () => {
    const { store } = await buildStore()
    loadSequences(store, [buildSequence('sq1', 'SQ01')])
    store.getters.sequenceMap.get('sq1').data = { level: 'hard' }
    const rename = entityType =>
      store.commit('UPDATE_METADATA_DESCRIPTOR_END', {
        descriptor: { entity_type: entityType, field_name: 'difficulty' },
        previousDescriptorFieldName: 'level'
      })

    rename('Shot')
    expect(store.getters.sequenceMap.get('sq1').data).toEqual({
      level: 'hard'
    })

    rename('Sequence')
    expect(store.getters.sequenceMap.get('sq1').data).toEqual({
      difficulty: 'hard'
    })
  })

  test('keeps the scroll position and clears the selected sequences', async () => {
    const { store } = await buildStore()
    store.state.sequences.selectedSequences.set('sq1', { id: 'sq1' })

    store.commit('SET_SEQUENCE_LIST_SCROLL_POSITION', 120)
    await store.dispatch('clearSelectedSequences')

    expect(store.getters.sequenceListScrollPosition).toBe(120)
    expect(store.state.sequences.selectedSequences.size).toBe(0)
  })

  test('deletes the tasks of a type, of the selection only', async () => {
    const deleteAllTasks = vi.fn()
    const { store } = await buildStore({}, { deleteAllTasks })
    loadSequences(store, [
      buildSequence('sq1', 'SQ01'),
      { ...buildSequence('sq2', 'SQ02'), tasks: [] }
    ])

    await store.dispatch('deleteAllSequenceTasks', {
      projectId: 'p1',
      taskTypeId: 'tt-1',
      selectionOnly: true
    })
    await store.dispatch('deleteAllSequenceTasks', {
      projectId: 'p1',
      taskTypeId: 'tt-1'
    })

    expect(deleteAllTasks.mock.calls.map(([, payload]) => payload)).toEqual([
      { projectId: 'p1', taskTypeId: 'tt-1', taskIds: ['task-sq1'] },
      { projectId: 'p1', taskTypeId: 'tt-1', taskIds: undefined }
    ])
  })

  test('deletes the tasks of the selection once a search lists a live sequence', async () => {
    const deleteAllTasks = vi.fn()
    const { store } = await buildStore({}, { deleteAllTasks })
    loadSequences(store, [buildSequence('sq1', 'SQ01')])
    store.commit('ADD_SEQUENCE', {
      sequence: { id: 'sq2', name: 'SQ02', data: {} },
      episodeMap: new Map()
    })
    await store.dispatch('setSequenceSearch', '')

    await store.dispatch('deleteAllSequenceTasks', {
      projectId: 'p1',
      taskTypeId: 'tt-1',
      selectionOnly: true
    })

    expect(deleteAllTasks.mock.calls.map(([, payload]) => payload)).toEqual([
      { projectId: 'p1', taskTypeId: 'tt-1', taskIds: ['task-sq1'] }
    ])
  })

  test('shows the last search result again', async () => {
    const { store } = await buildStore()
    loadSequences(store, [
      buildSequence('sq1', 'SQ01'),
      buildSequence('sq2', 'SQ02')
    ])
    await store.dispatch('setSequenceSearch', 'SQ01')
    store.state.sequences.displayedSequences = []

    await store.dispatch('resetSequences')

    expect(names(store.getters.displayedSequences)).toEqual(['SQ01'])
  })
})
