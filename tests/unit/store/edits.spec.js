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

    // A production switch forgets the load in flight, and a load started
    // after it records its own scope: the late response must not land
    // under that newer key.
    test('drops a response whose scope a newer load replaced', async () => {
      let endA
      editsApi.getEdits = vi.fn(
        () =>
          new Promise(resolve => {
            endA = resolve
          })
      )
      const commit = vi.fn()
      const state = { isEditsLoading: false }
      const loadA = editsStore.actions.loadEdits({
        commit,
        dispatch: vi.fn(),
        state,
        rootGetters: {
          currentProduction: { id: 'p-switch' },
          currentEpisode: { id: 'ep-a' },
          episodes: [{ id: 'ep-a' }],
          userFilters: {},
          taskTypeMap: new Map(),
          taskMap: new Map(),
          personMap: new Map(),
          isTVShow: true
        }
      })
      state.editsLoadingKey = 'p-switch/all'
      endA([{ id: 'e-a' }])
      await loadA

      expect(commit.mock.calls.map(c => c[0])).not.toContain('LOAD_EDITS_END')
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

describe('Edits store, loadEdit live insertion', () => {
  const rootGetters = {
    currentProduction: { id: 'p-live' },
    currentEpisode: { id: 'ep-a' },
    isTVShow: true,
    personMap: new Map(),
    taskMap: new Map(),
    taskTypeMap: new Map()
  }

  const committedTypes = async (payload, editsLoadingKey, edit) => {
    editsApi.getEdit = vi.fn(() => Promise.resolve({ tasks: [], ...edit }))
    const commit = vi.fn()
    await editsStore.actions.loadEdit(
      { commit, state: { editsLoadingKey }, rootGetters },
      payload
    )
    return commit.mock.calls.map(([type]) => type)
  }

  test('skips an edit of another episode when asked to stay in scope', async () => {
    const types = await committedTypes(
      { editId: 'e-scope-1', onlyInScope: true },
      'p-live/ep-a',
      { id: 'e-scope-1', parent_id: 'ep-b' }
    )
    expect(types).not.toContain('ADD_EDIT')
  })

  test('adds an edit of the loaded episode', async () => {
    const types = await committedTypes(
      { editId: 'e-scope-2', onlyInScope: true },
      'p-live/ep-a',
      { id: 'e-scope-2', parent_id: 'ep-a' }
    )
    expect(types).toContain('ADD_EDIT')
  })

  test('adds any edit to a production-wide dataset', async () => {
    const types = await committedTypes(
      { editId: 'e-scope-3', onlyInScope: true },
      'p-live/all',
      { id: 'e-scope-3', parent_id: 'ep-b' }
    )
    expect(types).toContain('ADD_EDIT')
  })

  test('skips an edit of another production', async () => {
    const types = await committedTypes(
      { editId: 'e-scope-5', onlyInScope: true },
      'p-live/all',
      { id: 'e-scope-5', parent_id: 'ep-b', project_id: 'p-other' }
    )
    expect(types).not.toContain('ADD_EDIT')
  })

  test('still adds an out-of-scope edit loaded by id', async () => {
    const types = await committedTypes('e-scope-4', 'p-live/ep-a', {
      id: 'e-scope-4',
      parent_id: 'ep-b'
    })
    expect(types).toContain('ADD_EDIT')
  })

  // An update then a deletion within one round trip: the refresh must not
  // bring back the row the deletion removed.
  test('keeps out a displayed edit deleted during its refresh', async () => {
    editsStore.cache.editMap.set('e-gone', { id: 'e-gone' })
    editsApi.getEdit = vi.fn(async () => {
      editsStore.cache.editMap.delete('e-gone')
      return {
        id: 'e-gone',
        parent_id: 'ep-a',
        project_id: 'p-live',
        tasks: []
      }
    })
    const commit = vi.fn()

    await editsStore.actions.loadEdit(
      { commit, state: { editsLoadingKey: 'p-live/ep-a' }, rootGetters },
      { editId: 'e-gone', onlyInScope: true }
    )

    expect(commit).not.toHaveBeenCalled()
  })
})

describe('Edits store, LOAD_EDITS_ERROR', () => {
  // The pages decide from the recorded scope whether a reload is needed: a
  // failed load must not leave its scope behind an empty dataset, or they
  // never retry.
  test('forgets the scope of the failed load', () => {
    const state = { editsLoadingKey: 'p1/ep-a' }
    editsStore.mutations.LOAD_EDITS_ERROR(state)
    expect(state.editsLoadingKey).toBeNull()
  })
})

describe('Edits store, LOAD_EDITS_START', () => {
  // The list footer reads the totals: they belong to the dataset the
  // mutation empties, not to the one being loaded.
  test('forgets the totals of the emptied list', () => {
    const state = {
      displayedEditsTimeSpent: 12,
      displayedEditsEstimation: 8,
      selectedEdits: new Map()
    }
    editsStore.mutations.LOAD_EDITS_START(state, { loadingKey: 'p1/ep-a' })
    expect(state.displayedEditsTimeSpent).toBe(0)
    expect(state.displayedEditsEstimation).toBe(0)
  })
})

describe('Edits store, CLEAR_EDITS', () => {
  // A production switch discards the response of a load in flight without
  // any mutation: the flag and the scope of that load must not survive the
  // switch, or the next loadEdits waits on it forever.
  test('forgets a load in flight with its dataset', () => {
    const state = {
      isEditsLoading: true,
      isEditsLoadingError: false,
      editsLoadingKey: 'p1/ep-a',
      editValidationColumns: ['col'],
      displayedEdits: [{ id: 'e1' }],
      displayedEditsCount: 1,
      displayedEditsLength: 1,
      editSearchQueries: ['query'],
      selectedEdits: new Map([['e1', true]])
    }
    editsStore.mutations.CLEAR_EDITS(state)
    expect(state.isEditsLoading).toBe(false)
    expect(state.editsLoadingKey).toBeNull()
    expect(state.displayedEdits).toEqual([])
    expect(state.displayedEditsLength).toBe(0)
    expect(state.selectedEdits.size).toBe(0)
  })

  // The list footer reads the totals: they must go with the dataset, or the
  // ones of the production left stay under an empty list.
  test('forgets the totals of the emptied list', () => {
    const state = {
      displayedEditsTimeSpent: 12,
      displayedEditsEstimation: 8,
      selectedEdits: new Map()
    }
    editsStore.mutations.CLEAR_EDITS(state)
    expect(state.displayedEditsTimeSpent).toBe(0)
    expect(state.displayedEditsEstimation).toBe(0)
  })
})

describe('Edits store, live insertion during a list load', () => {
  afterEach(() => {
    editsStore.cache.editsLoadingPromise = null
    editsStore.cache.editMap.delete('e-flight-3')
    vi.restoreAllMocks()
  })

  // The list load replaces the whole dataset: inserting before its response
  // lands drops the edit, and no second event announces it again.
  test('waits for the list in flight before inserting', async () => {
    editsApi.getEdit = vi.fn(() =>
      Promise.resolve({
        id: 'e-flight-1',
        parent_id: 'ep-a',
        project_id: 'p-live',
        tasks: []
      })
    )
    let endList
    const state = { isEditsLoading: true, editsLoadingKey: 'p-live/ep-a' }
    editsStore.cache.editsLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.isEditsLoading = false
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = editsStore.actions.loadEdit(
      {
        commit,
        state,
        rootGetters: {
          currentProduction: { id: 'p-live' },
          currentEpisode: { id: 'ep-a' },
          isTVShow: true,
          personMap: new Map(),
          taskMap: new Map(),
          taskTypeMap: new Map()
        }
      },
      { editId: 'e-flight-1', onlyInScope: true }
    )
    await Promise.resolve()
    expect(commit.mock.calls.map(([type]) => type)).not.toContain('ADD_EDIT')

    endList()
    await loading
    expect(commit.mock.calls.map(([type]) => type)).toContain('ADD_EDIT')
  })

  // The fetch waits for the list response: issued after it, the payload is
  // the younger one and refreshes the row the list rebuilt.
  test('fetches once the list load settled and refreshes the row', async () => {
    editsApi.getEdit = vi.fn(() =>
      Promise.resolve({
        id: 'e-flight-3',
        parent_id: 'ep-a',
        project_id: 'p-live',
        name: 'from-socket',
        tasks: []
      })
    )
    let endList
    const state = { isEditsLoading: true, editsLoadingKey: 'p-live/ep-a' }
    editsStore.cache.editsLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.isEditsLoading = false
        editsStore.cache.editMap.set('e-flight-3', {
          id: 'e-flight-3',
          name: 'from-list'
        })
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = editsStore.actions.loadEdit(
      {
        commit,
        state,
        rootGetters: {
          currentProduction: { id: 'p-live' },
          currentEpisode: { id: 'ep-a' },
          isTVShow: true,
          personMap: new Map(),
          taskMap: new Map(),
          taskTypeMap: new Map()
        }
      },
      { editId: 'e-flight-3', onlyInScope: true }
    )
    await Promise.resolve()
    expect(editsApi.getEdit).not.toHaveBeenCalled()
    endList()
    await loading

    expect(editsApi.getEdit).toHaveBeenCalledWith('e-flight-3')
    expect(commit.mock.calls).toEqual([
      ['UPDATE_EDIT', expect.objectContaining({ name: 'from-socket' })]
    ])
  })

  // An update of an edit the page displayed must not recreate it under the
  // list of the episode switched to meanwhile: the handlers pass onlyInScope.
  test('drops an updated edit once the list in flight replaced its episode', async () => {
    editsApi.getEdit = vi.fn(() =>
      Promise.resolve({
        id: 'e-flight-2',
        parent_id: 'ep-a',
        project_id: 'p-live',
        tasks: []
      })
    )
    let endList
    const state = { isEditsLoading: true, editsLoadingKey: 'p-live/ep-a' }
    editsStore.cache.editsLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.isEditsLoading = false
        state.editsLoadingKey = 'p-live/ep-b'
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = editsStore.actions.loadEdit(
      {
        commit,
        state,
        rootGetters: {
          currentProduction: { id: 'p-live' },
          currentEpisode: { id: 'ep-b' },
          isTVShow: true,
          personMap: new Map(),
          taskMap: new Map(),
          taskTypeMap: new Map()
        }
      },
      { editId: 'e-flight-2', onlyInScope: true }
    )
    await Promise.resolve()
    endList()
    await loading

    expect(commit.mock.calls.map(([type]) => type)).not.toContain('ADD_EDIT')
  })
})

describe('Edits store, UPDATE_EDIT', () => {
  afterEach(() => {
    editsStore.cache.editMap.delete('e-upd')
  })

  // A colleague's edit refetches the full entity, whose tasks are objects:
  // the cached ids must survive it, or the task lists come out empty.
  test('keeps the cached task ids', () => {
    editsStore.cache.editMap.set('e-upd', {
      id: 'e-upd',
      name: 'old',
      tasks: ['t1']
    })
    editsStore.mutations.UPDATE_EDIT(
      {},
      { id: 'e-upd', name: 'new', tasks: [{ id: 't1' }] }
    )
    expect(editsStore.cache.editMap.get('e-upd')).toMatchObject({
      name: 'new',
      tasks: ['t1']
    })
  })
})

describe('Edits store, deletion during a list load', () => {
  afterEach(() => {
    editsStore.cache.removedEditIds.clear()
    editsStore.cache.editMap.clear()
  })

  // The response was built before the deletion reached the page: the edit
  // must not come back with it.
  test('keeps an edit deleted during the load out of its response', () => {
    const state = {
      isEditsLoading: true,
      displayedEdits: [],
      editSearchQueries: []
    }
    editsStore.mutations.REMOVE_EDIT(state, { id: 'e-deleted' })

    editsStore.mutations.LOAD_EDITS_END(state, {
      production: { id: 'p1' },
      edits: [{ id: 'e-deleted', name: 'E1', tasks: [] }],
      userFilters: {},
      taskMap: new Map(),
      taskTypeMap: new Map(),
      personMap: new Map()
    })

    expect(editsStore.cache.editMap.has('e-deleted')).toBe(false)
  })
})

// zou emits edit:new before the creation response lands, so the socket
// handler inserts the edit first: the response must not append a copy.
describe('Edits store, NEW_EDIT_END', () => {
  test('does not duplicate an edit the socket handler already added', () => {
    editsStore.cache.edits = []
    editsStore.cache.editMap = new Map()
    const state = { displayedEdits: [] }
    const edit = { id: 'edit-1', name: 'E01', project_id: 'p-1' }

    editsStore.mutations.NEW_EDIT_END(state, { ...edit })
    editsStore.mutations.NEW_EDIT_END(state, { ...edit })

    expect(editsStore.cache.edits.map(({ id }) => id)).toEqual(['edit-1'])
    expect(state.displayedEdits.map(({ id }) => id)).toEqual(['edit-1'])
  })
})

describe('Edits store, getEditsCsvLines', () => {
  test('exports the base columns when the production has no descriptors key', () => {
    editsStore.cache.edits = [{ id: 'e1', name: 'E1', description: '' }]
    editsStore.cache.result = []
    const rootGetters = {
      currentProduction: { id: 'p1' },
      isTVShow: false,
      organisation: { hours_by_day: 8 },
      personMap: new Map(),
      taskMap: new Map()
    }
    const state = { editValidationColumns: [] }

    const lines = editsStore.actions.getEditsCsvLines({ state, rootGetters })

    expect(lines).toEqual([['E1', '']])
  })

  test('orders the descriptor columns by name and skips the other entity types', () => {
    const edit = {
      id: 'e1',
      name: 'E1',
      description: '',
      data: { zeta: 'z', alpha: 'a', other: 'x' },
      validations: new Map()
    }
    editsStore.cache.edits = [edit]
    editsStore.cache.result = []
    const rootGetters = {
      currentProduction: {
        id: 'p1',
        descriptors: [
          {
            name: 'Zeta',
            field_name: 'zeta',
            data_type: 'string',
            entity_type: 'Edit'
          },
          {
            name: 'Alpha',
            field_name: 'alpha',
            data_type: 'string',
            entity_type: 'Edit'
          },
          {
            name: 'Other',
            field_name: 'other',
            data_type: 'string',
            entity_type: 'Shot'
          }
        ]
      },
      isTVShow: false,
      organisation: { hours_by_day: 8 },
      personMap: new Map(),
      taskMap: new Map()
    }
    const state = { editValidationColumns: [] }

    const lines = editsStore.actions.getEditsCsvLines({ state, rootGetters })

    expect(lines[0].slice(2)).toEqual(['a', 'z'])
  })
})
