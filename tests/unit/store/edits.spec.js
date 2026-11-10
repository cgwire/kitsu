// @vitest-environment node

import { vi } from 'vitest'
import { computed, reactive } from 'vue'
import { createStore } from 'vuex'

// Importing the edits module transitively pulls in the root store
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
// Keep the loads in flight without hitting the network.
vi.mock('@/store/api/edits', async importOriginal => {
  const { default: editsApi } = await importOriginal()
  return {
    default: { ...editsApi, getEdits: vi.fn(() => new Promise(() => {})) }
  }
})

import editsStore from '@/store/modules/edits'
import editsApi from '@/store/api/edits'
import client from '@/store/api/client'
import tasksStore from '@/store/modules/tasks'
import { PAGE_SIZE } from '@/lib/pagination'
import {
  ADD_EDIT,
  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  CLEAR_SELECTED_TASKS,
  CREATE_TASKS_END,
  DELETE_TASK_END,
  EDIT_CSV_FILE_SELECTED,
  EDIT_EDIT_END,
  IMPORT_EDITS_END,
  LOAD_EDITS_END,
  LOAD_TASK_END,
  LOCK_EDIT,
  NEW_TASK_END,
  REMOVE_EDIT,
  REMOVE_EDIT_SEARCH_END,
  REMOVE_SELECTED_TASK,
  RESET_ALL,
  SAVE_EDIT_SEARCH_END,
  SET_CURRENT_PRODUCTION,
  SET_EDIT_LIST_SCROLL_POSITION,
  SET_EDIT_SELECTION,
  SET_PREVIEW,
  SORT_VALIDATION_COLUMNS,
  UNLOCK_EDIT,
  UPDATE_METADATA_DESCRIPTOR_END
} from '@/store/mutation-types'

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
      { displayedEdits: [] },
      { id: 'e-upd', name: 'new', tasks: [{ id: 't1' }] }
    )
    expect(editsStore.cache.editMap.get('e-upd')).toMatchObject({
      name: 'new',
      tasks: ['t1']
    })
  })

  // The list reads the displayed edits through the reactive state: a change
  // made to the raw object of the cache does not reach it.
  test('shows the new name of an edit another user renamed', () => {
    const edit = { id: 'e-upd', name: 'ED020', tasks: [] }
    editsStore.cache.editMap.set(edit.id, edit)
    const state = reactive({ displayedEdits: [edit] })
    const names = computed(() => state.displayedEdits.map(({ name }) => name))
    expect(names.value).toEqual(['ED020'])

    editsStore.mutations.UPDATE_EDIT(state, { id: 'e-upd', name: 'ED999' })

    expect(names.value).toEqual(['ED999'])
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

  // A created edit has no time yet: the footer hides totals that are no
  // numbers.
  test('keeps the time totals of the list', () => {
    const listedEdit = {
      id: 'edit-1',
      name: 'E01',
      timeSpent: 240,
      estimation: 480
    }
    editsStore.cache.edits = [listedEdit]
    editsStore.cache.editMap = new Map([[listedEdit.id, listedEdit]])
    const state = { displayedEdits: [listedEdit] }

    editsStore.mutations.NEW_EDIT_END(state, {
      id: 'edit-2',
      name: 'E02',
      project_id: 'p-1'
    })

    expect(state.displayedEditsTimeSpent).toBe(240)
    expect(state.displayedEditsEstimation).toBe(480)
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

describe('Edits store, through a store', () => {
  const production = { id: 'p1', name: 'Agent 327' }
  const taskTypeMap = new Map([
    ['tt-anim', { id: 'tt-anim', name: 'Animation', priority: 2 }],
    ['tt-comp', { id: 'tt-comp', name: 'Compositing', priority: 1 }]
  ])

  let taskMap
  let rootActions

  const buildState = () => ({
    editSearchText: '',
    editSearchQueries: [],
    editSorting: [],
    currentEpisode: null,
    isEditDescription: false,
    isEditEstimation: false,
    isEditTime: false,
    displayedEdits: [],
    displayedEditsCount: 0,
    displayedEditsLength: 0,
    displayedEditsTimeSpent: 0,
    displayedEditsEstimation: 0,
    editFilledColumns: {},
    editSelectionGrid: new Set(),
    isEditsLoading: false,
    isEditsLoadingError: false,
    editsLoadingKey: null,
    editsCsvFormData: null,
    editListScrollPosition: 0,
    editValidationColumns: [],
    selectedEdits: new Map()
  })

  const buildStore = ({ isTVShow = false, editTaskTypeIds = [] } = {}) =>
    createStore({
      modules: {
        edits: {
          // The actions read the module state directly, as in the app.
          state: editsStore.state,
          getters: editsStore.getters,
          actions: editsStore.actions,
          mutations: editsStore.mutations
        }
      },
      getters: {
        currentProduction: () => production,
        isTVShow: () => isTVShow,
        organisation: () => ({ hours_by_day: 8 }),
        people: () => [],
        personMap: () => new Map(),
        productionEditTaskTypeIds: () => editTaskTypeIds,
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

  const buildEdit = (id, name, fields = {}) => ({
    id,
    name,
    description: '',
    data: {},
    tasks: [],
    ...fields
  })

  const load = (store, edits, userFilters = {}) =>
    store.commit(LOAD_EDITS_END, {
      production,
      edits,
      userFilters,
      taskMap,
      taskTypeMap,
      personMap: new Map()
    })

  const names = list => list.map(({ name }) => name)

  beforeEach(() => {
    Object.values(client).forEach(fn => fn.mockReset())
    Object.assign(editsStore.state, buildState())
    taskMap = new Map()
    rootActions = {
      createEntityTasks: vi.fn(),
      deleteAllTasks: vi.fn()
    }
  })

  afterEach(() => {
    editsStore.cache.removedEditIds.clear()
    editsStore.cache.editMap.clear()
    editsStore.cache.edits = []
    editsStore.cache.result = []
    editsStore.cache.editIndex = {}
  })

  describe('list load', () => {
    test('computes the totals, flags, and columns of the edits', () => {
      const store = buildStore()

      load(
        store,
        [
          buildEdit('e2', 'E02', {
            canceled: true,
            tasks: [buildTask('t3', 'tt-anim', { duration: 30 })]
          }),
          buildEdit('e1', 'E01', {
            description: 'Opening',
            tasks: [
              buildTask('t1', 'tt-anim', { duration: 60, estimation: 120 }),
              buildTask('t2', 'tt-comp', { estimation: 60 })
            ]
          })
        ],
        { edit: { p1: [{ id: 'f1', name: 'wip' }] } }
      )

      expect(names(store.getters.displayedEdits)).toEqual(['E01', 'E02'])
      expect(store.getters.displayedEditsCount).toBe(2)
      expect(store.getters.displayedEditsLength).toBe(1)
      expect(store.getters.displayedEditsTimeSpent).toBe(60)
      expect(store.getters.displayedEditsEstimation).toBe(180)
      expect(store.getters.isEditTime).toBe(true)
      expect(store.getters.isEditEstimation).toBe(true)
      expect(store.getters.isEditDescription).toBe(true)
      expect(store.getters.editValidationColumns).toEqual([
        'tt-comp',
        'tt-anim'
      ])
      expect(store.getters.editSearchQueries).toEqual([
        { id: 'f1', name: 'wip' }
      ])
      expect(store.getters.isEditsLoading).toBe(false)
      expect(store.getters.isEditsLoadingError).toBe(false)
      expect(store.getters.editMap.get('e1').tasks).toEqual(['t1', 't2'])
      expect(taskMap.get('t1')).toMatchObject({
        entity_name: 'E01',
        entity_type_name: 'Edit',
        project_id: 'p1'
      })
    })

    test('shows the first page, then the next one', () => {
      const store = buildStore()
      const edits = Array.from({ length: PAGE_SIZE + 5 }, (_, index) =>
        buildEdit(`e${index}`, `E${String(index).padStart(3, '0')}`)
      )
      load(store, edits)
      expect(store.getters.displayedEdits).toHaveLength(PAGE_SIZE)

      store.dispatch('displayMoreEdits')

      expect(store.getters.displayedEdits).toHaveLength(PAGE_SIZE + 5)
    })
  })

  describe('search and sort', () => {
    test('filters the list on a search, then clears it on a production switch', () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'Opening'), buildEdit('e2', 'Credits')])

      store.dispatch('setEditSearch', 'opening')

      expect(names(store.getters.displayedEdits)).toEqual(['Opening'])
      expect(store.getters.displayedEditsCount).toBe(1)
      expect(store.getters.editSearchText).toBe('opening')

      store.commit(SET_CURRENT_PRODUCTION, production)
      expect(store.getters.editSearchText).toBe('')
    })

    test('keeps the search when the sort changes', () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'Opening'),
        buildEdit('e2', 'Credits'),
        buildEdit('e3', 'Open call')
      ])
      store.dispatch('setEditSearch', 'open')

      store.dispatch('changeEditSort', null)

      expect(store.getters.editSorting).toEqual([])
      expect(names(store.getters.displayedEdits)).toEqual([
        'Open call',
        'Opening'
      ])
    })

    test('saves a search, then removes it', async () => {
      const store = buildStore()
      load(store, [])
      client.ppost.mockResolvedValueOnce({ id: 'f2', name: 'opening' })
      client.pdel.mockResolvedValueOnce()

      await store.dispatch('saveEditSearch', {
        name: 'opening',
        search_query: 'opening'
      })

      expect(client.ppost).toHaveBeenCalledWith('/api/data/user/filters', {
        list_type: 'edit',
        name: 'opening',
        query: 'opening',
        entity_type: null,
        project_id: 'p1'
      })
      expect(names(store.getters.editSearchQueries)).toEqual(['opening'])

      await store.dispatch('removeEditSearch', { id: 'f2', name: 'opening' })

      expect(client.pdel).toHaveBeenCalledWith('/api/data/user/filters/f2')
      expect(store.getters.editSearchQueries).toEqual([])
    })

    test('keeps the saved searches sorted and ignores a missing one', () => {
      const store = buildStore()
      load(store, [])

      const save = searchQuery =>
        store.commit(SAVE_EDIT_SEARCH_END, { searchQuery })
      save({ id: 'f1', name: 'wip' })
      save({ id: 'f2', name: 'done' })
      store.commit(REMOVE_EDIT_SEARCH_END, {
        searchQuery: { id: 'f9', name: 'wip' }
      })

      expect(names(store.getters.editSearchQueries)).toEqual(['done', 'wip'])
    })

    test('sorts the validation columns by task type priority', () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', { tasks: [buildTask('t1', 'tt-anim')] })
      ])
      store.state.edits.editValidationColumns = ['tt-anim', 'tt-comp']

      store.commit(SORT_VALIDATION_COLUMNS, taskTypeMap)

      expect(store.getters.editValidationColumns).toEqual([
        'tt-comp',
        'tt-anim'
      ])
    })
  })

  describe('edit changes', () => {
    test('merges an edit change into the list and its search index', () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', { data: { look: 'warm', mood: 'calm' } })
      ])
      const row = store.getters.displayedEdits[0]

      store.commit(EDIT_EDIT_END, {
        id: 'e1',
        name: 'Finale',
        description: 'Last scene',
        data: { look: 'cold' }
      })

      expect(store.getters.displayedEdits[0]).toMatchObject({
        name: 'Finale',
        data: { look: 'cold', mood: 'calm' }
      })
      // A row receives its edit as a prop: a new object renders the change.
      expect(store.getters.displayedEdits[0]).not.toBe(row)
      expect(store.getters.isEditDescription).toBe(true)
      store.dispatch('setEditSearch', 'finale')
      expect(names(store.getters.displayedEdits)).toEqual(['Finale'])
    })

    test('creates an edit and its tasks', async () => {
      const store = buildStore({ editTaskTypeIds: ['tt-anim'] })
      load(store, [buildEdit('e1', 'E01')])
      client.ppost.mockResolvedValueOnce({
        id: 'e2',
        name: 'E02',
        project_id: 'p1'
      })

      const edit = await store.dispatch('newEdit', {
        name: 'E02',
        description: 'Trailer',
        data: {},
        parent_id: 'ep-1',
        project_id: 'p1'
      })

      expect(client.ppost).toHaveBeenCalledWith('/api/data/projects/p1/edits', {
        name: 'E02',
        description: 'Trailer',
        data: {},
        episode_id: 'ep-1'
      })
      expect(edit).toMatchObject({ id: 'e2', production_id: 'p1' })
      expect(names(store.getters.displayedEdits)).toEqual(['E01', 'E02'])
      expect(rootActions.createEntityTasks).toHaveBeenCalledWith(
        expect.anything(),
        { entityId: 'e2', taskTypeIds: ['tt-anim'] }
      )
    })

    test('refuses an edit whose name the episode already holds', async () => {
      const store = buildStore({ isTVShow: true })
      load(store, [buildEdit('e1', 'E01', { parent_id: 'ep-1' })])

      await expect(
        store.dispatch('newEdit', { name: 'E01', parent_id: 'ep-1' })
      ).rejects.toThrow('Edit already exists')
      expect(client.ppost).not.toHaveBeenCalled()
    })

    test('saves an edit, locked until a while after the save', async () => {
      vi.useFakeTimers()
      try {
        const store = buildStore()
        load(store, [buildEdit('e1', 'E01')])
        client.pput.mockResolvedValueOnce({})

        await store.dispatch('editEdit', {
          id: 'e1',
          name: 'E01',
          description: 'Cut',
          data: {},
          parent_id: 'ep-1'
        })

        expect(client.pput).toHaveBeenCalledWith('/api/data/entities/e1', {
          name: 'E01',
          description: 'Cut',
          data: {},
          parent_id: 'ep-1'
        })
        expect(store.getters.editMap.get('e1').lock).toBe(1)
        vi.advanceTimersByTime(2000)
        expect(store.getters.editMap.get('e1').lock).toBe(0)
      } finally {
        vi.useRealTimers()
      }
    })

    // A list reload or a deletion from another session can drop the edit
    // between the opening of its modal and the save.
    test('saves an edit missing from the loaded list', async () => {
      vi.useFakeTimers()
      try {
        const store = buildStore()
        load(store, [buildEdit('e1', 'E01')])
        client.pput.mockResolvedValueOnce({})

        await store.dispatch('editEdit', {
          id: 'e9',
          name: 'E09',
          description: 'Gone',
          data: {}
        })

        expect(client.pput).toHaveBeenCalledWith('/api/data/entities/e9', {
          name: 'E09',
          description: 'Gone',
          data: {}
        })
        expect(editsStore.cache.edits.map(({ id }) => id)).toEqual(['e1'])
        expect(store.getters.editMap.has('e9')).toBe(false)
        vi.advanceTimersByTime(2000)
      } finally {
        vi.useRealTimers()
      }
    })

    // The list and the pages show an edit before Zou answers.
    test('puts back what an edit Zou refuses changed', async () => {
      vi.useFakeTimers()
      try {
        const store = buildStore()
        load(store, [buildEdit('e1', 'E01', { data: { fps: '24' } })])
        client.pput.mockRejectedValueOnce(new Error('Bad Request'))

        await expect(
          store.dispatch('editEdit', {
            id: 'e1',
            name: 'E02',
            description: 'Cut',
            data: { fps: '25' }
          })
        ).rejects.toThrow('Bad Request')

        expect(store.getters.editMap.get('e1')).toMatchObject({
          name: 'E01',
          description: '',
          data: { fps: '24' }
        })
        expect(names(store.getters.displayedEdits)).toEqual(['E01'])
        vi.advanceTimersByTime(2000)
      } finally {
        vi.useRealTimers()
      }
    })

    test('counts the locks of an edit', () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01')])

      store.commit(LOCK_EDIT, { id: 'e1' })
      store.commit(LOCK_EDIT, { id: 'e1' })
      store.commit(UNLOCK_EDIT, { id: 'e1' })
      expect(store.getters.editMap.get('e1').lock).toBe(1)

      store.commit(UNLOCK_EDIT, { id: 'e1' })
      store.commit(UNLOCK_EDIT, { id: 'e1' })
      expect(store.getters.editMap.get('e1').lock).toBe(0)
    })

    test('cancels an edit with tasks, deletes one without', async () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', { tasks: [buildTask('t1', 'tt-anim')] }),
        buildEdit('e2', 'E02')
      ])
      client.pdel.mockResolvedValue()

      await store.dispatch('deleteEdit', { id: 'e1' })
      await store.dispatch('deleteEdit', { id: 'e2' })

      expect(client.pdel).toHaveBeenNthCalledWith(1, '/api/data/edits/e1')
      expect(client.pdel).toHaveBeenNthCalledWith(2, '/api/data/edits/e2')
      expect(store.getters.editMap.get('e1').canceled).toBe(true)
      expect(store.getters.editMap.has('e2')).toBe(false)
      expect(names(store.getters.displayedEdits)).toEqual(['E01'])
    })

    // The list footer shows the count of the edits not canceled.
    test('counts a canceled edit out, then back in once restored', async () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', { tasks: [buildTask('t1', 'tt-anim')] }),
        buildEdit('e2', 'E02')
      ])
      client.pdel.mockResolvedValueOnce()
      client.pput.mockResolvedValueOnce({ id: 'e1', canceled: false })
      expect(store.getters.displayedEditsLength).toBe(2)

      await store.dispatch('deleteEdit', { id: 'e1' })
      expect(store.getters.displayedEditsLength).toBe(1)

      await store.dispatch('restoreEdit', { id: 'e1' })
      expect(store.getters.displayedEditsLength).toBe(2)
    })

    // The rows read the edits of the displayed list: a row that missed the
    // change kept the buttons of an active edit.
    test('shows a canceled edit as canceled in its row, then restored', async () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', { canceled: false }),
        buildEdit('e2', 'E02', {
          canceled: false,
          tasks: [buildTask('t2', 'tt-anim')]
        })
      ])
      // A row keeps the entry it renders.
      const row = store.getters.displayedEdits[1]
      const isCanceled = computed(() => row.canceled)
      expect(isCanceled.value).toBe(false)
      client.pdel.mockResolvedValueOnce()
      client.pput.mockResolvedValueOnce({ id: 'e2', canceled: false })

      await store.dispatch('deleteEdit', { id: 'e2' })
      expect(isCanceled.value).toBe(true)

      await store.dispatch('restoreEdit', { id: 'e2' })
      expect(isCanceled.value).toBe(false)
    })

    // A save leaves a copy of the edit in the displayed list.
    test('shows an edit saved then canceled as canceled', async () => {
      vi.useFakeTimers()
      try {
        const store = buildStore()
        load(store, [
          buildEdit('e1', 'E01', {
            canceled: false,
            tasks: [buildTask('t1', 'tt-anim')]
          })
        ])
        client.pput.mockResolvedValueOnce({})
        client.pdel.mockResolvedValueOnce()

        await store.dispatch('editEdit', { id: 'e1', name: 'E01 v2' })
        await store.dispatch('deleteEdit', { id: 'e1' })

        expect(store.getters.displayedEdits[0]).toMatchObject({
          name: 'E01 v2',
          canceled: true
        })
      } finally {
        vi.useRealTimers()
      }
    })

    // The footer shows the active edits, and the list hides once empty.
    test('counts a deleted edit out of the list', async () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01'), buildEdit('e2', 'E02')])
      client.pdel.mockResolvedValue()

      await store.dispatch('deleteEdit', { id: 'e1' })
      expect(store.getters.displayedEditsCount).toBe(1)
      expect(store.getters.displayedEditsLength).toBe(1)

      await store.dispatch('deleteEdit', { id: 'e2' })
      expect(store.getters.displayedEditsCount).toBe(0)
      expect(store.getters.displayedEditsLength).toBe(0)
    })

    // A deletion parts the search result from the list. The next recount reads
    // the result: what a creation adds has to reach it.
    test('counts an edit created after a deletion', async () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01'), buildEdit('e2', 'E02')])
      client.pdel.mockResolvedValue()
      await store.dispatch('deleteEdit', { id: 'e1' })
      client.ppost.mockResolvedValueOnce(buildEdit('e3', 'E03'))
      await store.dispatch('newEdit', {
        name: 'E03',
        data: {},
        project_id: 'p1'
      })

      await store.dispatch('deleteEdit', { id: 'e2' })

      expect(names(store.getters.displayedEdits)).toEqual(['E03'])
      expect(store.getters.displayedEditsCount).toBe(1)
      expect(store.getters.displayedEditsLength).toBe(1)
    })

    test('counts an edit added live after a deletion', async () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01'), buildEdit('e2', 'E02')])
      client.pdel.mockResolvedValue()
      await store.dispatch('deleteEdit', { id: 'e1' })
      store.commit(ADD_EDIT, {
        edit: buildEdit('e3', 'E03'),
        taskTypeMap,
        taskMap,
        personMap: new Map(),
        production
      })

      await store.dispatch('deleteEdit', { id: 'e2' })

      expect(names(store.getters.displayedEdits)).toEqual(['E03'])
      expect(store.getters.displayedEditsCount).toBe(1)
      expect(store.getters.displayedEditsLength).toBe(1)
    })

    test('counts an edit created under a search', async () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01'), buildEdit('e2', 'E02')])
      store.dispatch('setEditSearch', 'e01')
      client.ppost.mockResolvedValueOnce(buildEdit('e3', 'E03'))
      await store.dispatch('newEdit', {
        name: 'E03',
        data: {},
        project_id: 'p1'
      })
      expect(names(store.getters.displayedEdits)).toEqual(['E01', 'E03'])
      client.pdel.mockResolvedValue()

      await store.dispatch('deleteEdit', { id: 'e1' })

      expect(names(store.getters.displayedEdits)).toEqual(['E03'])
      expect(store.getters.displayedEditsCount).toBe(1)
      expect(store.getters.displayedEditsLength).toBe(1)
    })

    test('keeps the order of a search once an edit is created', async () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01'), buildEdit('e3', 'E03')])
      store.dispatch('setEditSearch', 'e0')
      client.ppost.mockResolvedValueOnce(buildEdit('e2', 'E02'))

      await store.dispatch('newEdit', {
        name: 'E02',
        data: {},
        project_id: 'p1'
      })

      expect(names(store.getters.displayedEdits)).toEqual([
        'E01',
        'E02',
        'E03'
      ])
    })

    // The socket event comes ahead of the answer to the creation.
    test('keeps an edit the socket added first in the order of a search', async () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01'), buildEdit('e3', 'E03')])
      store.dispatch('setEditSearch', 'e0')
      store.commit(ADD_EDIT, {
        edit: buildEdit('e2', 'E02'),
        taskTypeMap,
        taskMap,
        personMap: new Map(),
        production
      })
      client.ppost.mockResolvedValueOnce(buildEdit('e2', 'E02'))

      await store.dispatch('newEdit', {
        name: 'E02 bis',
        data: {},
        project_id: 'p1'
      })

      expect(names(store.getters.displayedEdits)).toEqual([
        'E01',
        'E02',
        'E03'
      ])
    })

    // "For current list and filters" reads the search result.
    test('keeps the tasks out of a search once an edit is created', async () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', { tasks: [buildTask('t1', 'tt-anim')] }),
        buildEdit('e2', 'E02', { tasks: [buildTask('t2', 'tt-anim')] })
      ])
      store.dispatch('setEditSearch', 'e01')
      client.ppost.mockResolvedValueOnce(buildEdit('e3', 'E03'))
      await store.dispatch('newEdit', {
        name: 'E03',
        data: {},
        project_id: 'p1'
      })

      await store.dispatch('deleteAllEditTasks', {
        projectId: 'p1',
        taskTypeId: 'tt-anim',
        selectionOnly: true
      })

      expect(rootActions.deleteAllTasks).toHaveBeenCalledWith(
        expect.anything(),
        { projectId: 'p1', taskTypeId: 'tt-anim', taskIds: ['t1'] }
      )
    })

    test('lists an edit added live once', () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01')])

      store.commit(ADD_EDIT, {
        edit: buildEdit('e2', 'E02'),
        taskTypeMap,
        taskMap,
        personMap: new Map(),
        production
      })

      expect(names(store.getters.displayedEdits)).toEqual(['E01', 'E02'])
      expect(store.getters.displayedEditsCount).toBe(2)
    })

    test('counts the active edits after a deletion, a creation, and a cancellation', async () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01'),
        buildEdit('e2', 'E02', { tasks: [buildTask('t2', 'tt-anim')] }),
        buildEdit('e3', 'E03')
      ])
      client.pdel.mockResolvedValue()
      await store.dispatch('deleteEdit', { id: 'e1' })
      client.ppost.mockResolvedValueOnce(buildEdit('e4', 'E04'))
      await store.dispatch('newEdit', {
        name: 'E04',
        data: {},
        project_id: 'p1'
      })

      await store.dispatch('deleteEdit', { id: 'e2' })

      expect(store.getters.displayedEditsCount).toBe(3)
      expect(store.getters.displayedEditsLength).toBe(2)
    })

    test('deletes a canceled edit for good', async () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01', { canceled: true })])
      client.pdel.mockResolvedValueOnce()

      await store.dispatch('deleteEdit', { id: 'e1', canceled: true })

      expect(client.pdel).toHaveBeenCalledWith('/api/data/edits/e1?force=true')
    })

    test('restores a canceled edit', async () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01', { canceled: true })])
      client.pput.mockResolvedValueOnce({ id: 'e1', canceled: false })

      const edit = await store.dispatch('restoreEdit', { id: 'e1' })

      expect(client.pput).toHaveBeenCalledWith('/api/data/entities/e1', {
        canceled: false
      })
      expect(edit).toEqual({ id: 'e1', canceled: false })
      expect(store.getters.editMap.get('e1').canceled).toBe(false)
    })

    test('takes the time of a deleted edit off the totals', () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', {
          tasks: [buildTask('t1', 'tt-anim', { duration: 60, estimation: 90 })]
        }),
        buildEdit('e2', 'E02', {
          tasks: [buildTask('t2', 'tt-anim', { duration: 30, estimation: 45 })]
        })
      ])

      store.commit(REMOVE_EDIT, store.getters.editMap.get('e1'))

      expect(store.getters.displayedEditsTimeSpent).toBe(30)
      expect(store.getters.displayedEditsEstimation).toBe(45)
    })

    test('deletes the selected edits in one request', async () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', { tasks: [buildTask('t1', 'tt-anim')] }),
        buildEdit('e2', 'E02'),
        buildEdit('e3', 'E03')
      ])
      store.dispatch('setEditSelection', {
        edit: store.getters.editMap.get('e1'),
        selected: true
      })
      store.dispatch('setEditSelection', {
        edit: store.getters.editMap.get('e2'),
        selected: true
      })
      client.ppost.mockResolvedValueOnce({})

      await store.dispatch('deleteSelectedEdits')

      expect(client.ppost).toHaveBeenCalledWith(
        '/api/actions/projects/p1/delete-entities',
        ['e1', 'e2']
      )
      expect(store.getters.editMap.get('e1').canceled).toBe(true)
      expect(names(store.getters.displayedEdits)).toEqual(['E01', 'E03'])
    })

    test('deletes the selected edits for good once all are canceled', async () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01', { canceled: true })])
      store.commit(SET_EDIT_SELECTION, {
        edit: store.getters.editMap.get('e1'),
        selected: true
      })
      client.ppost.mockResolvedValueOnce({})

      await store.dispatch('deleteSelectedEdits')

      expect(client.ppost).toHaveBeenCalledWith(
        '/api/actions/projects/p1/delete-entities?force=true',
        ['e1']
      )
      expect(store.getters.editMap.has('e1')).toBe(false)
    })

    test('renames the data key of a renamed edit descriptor only', () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01', { data: { look: 'warm' } })])

      store.commit(UPDATE_METADATA_DESCRIPTOR_END, {
        descriptor: { entity_type: 'Shot', field_name: 'style' },
        previousDescriptorFieldName: 'look'
      })
      expect(store.getters.editMap.get('e1').data).toEqual({ look: 'warm' })

      store.commit(UPDATE_METADATA_DESCRIPTOR_END, {
        descriptor: { entity_type: 'Edit', field_name: 'style' },
        previousDescriptorFieldName: 'look'
      })
      expect(store.getters.editMap.get('e1').data).toEqual({ style: 'warm' })
    })

    test('imports a CSV file of edits', async () => {
      const store = buildStore()
      const formData = { file: 'edits.csv' }
      store.commit(EDIT_CSV_FILE_SELECTED, formData)
      expect(store.getters.editsCsvFormData).toEqual(formData)
      client.ppostImport.mockResolvedValueOnce({})

      await store.dispatch('uploadEditFile', true)

      expect(client.ppostImport).toHaveBeenCalledWith(
        '/api/import/csv/projects/p1/edits?update=true',
        formData
      )
      expect(store.getters.editsCsvFormData).toBe(null)
    })

    test('clears the file of an import', () => {
      const store = buildStore()
      store.commit(EDIT_CSV_FILE_SELECTED, { file: 'edits.csv' })

      store.commit(IMPORT_EDITS_END)

      expect(store.getters.editsCsvFormData).toBe(null)
    })

    test('loads the history of an edit', async () => {
      const store = buildStore()
      client.pget.mockResolvedValueOnce([{ id: 'v1' }])

      const history = await store.dispatch('loadEditHistory', 'e1')

      expect(client.pget).toHaveBeenCalledWith('/api/data/edits/e1/versions')
      expect(history).toEqual([{ id: 'v1' }])
    })
  })

  describe('tasks', () => {
    test('adds created tasks to their edits', () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01')])

      store.commit(CREATE_TASKS_END, {
        tasks: [
          buildTask('t1', 'tt-anim', { entity_id: 'e1' }),
          null,
          buildTask('t2', 'tt-anim', { entity_id: 'e9' })
        ]
      })

      const edit = store.getters.editMap.get('e1')
      expect(edit.tasks).toEqual(['t1'])
      expect(edit.validations.get('tt-anim')).toBe('t1')
      expect(store.getters.displayedEdits[0].validations.get('tt-anim')).toBe(
        't1'
      )
    })

    test('adds the column of a new task type', () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01')])

      store.commit(NEW_TASK_END, {
        task: buildTask('t1', 'tt-anim', { entity_id: 'e1' })
      })

      expect(store.getters.editValidationColumns).toEqual(['tt-anim'])
      expect(store.getters.editFilledColumns['tt-anim']).toBe(true)
      expect(store.getters.displayedEdits[0].validations.get('tt-anim')).toBe(
        't1'
      )
    })

    // The edit page lists the tasks of an edit through their ids.
    test('lists a new task of an edit by its id', () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01')])

      store.commit(NEW_TASK_END, {
        task: buildTask('t1', 'tt-anim', { entity_id: 'e1' })
      })

      expect(store.getters.editMap.get('e1').tasks).toEqual(['t1'])
    })

    test('drops a deleted task from its edit', () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', {
          tasks: [buildTask('t1', 'tt-anim'), buildTask('t2', 'tt-comp')]
        })
      ])

      store.commit(DELETE_TASK_END, {
        id: 't1',
        entity_id: 'e1',
        task_type_id: 'tt-anim'
      })

      const edit = store.getters.displayedEdits[0]
      expect(edit.tasks).toEqual(['t2'])
      expect([...edit.validations.keys()]).toEqual(['tt-comp'])
    })

    test('keeps the tasks of an edit when a task it does not list is deleted', () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', {
          tasks: [buildTask('t1', 'tt-anim'), buildTask('t2', 'tt-comp')]
        })
      ])

      store.commit(DELETE_TASK_END, {
        id: 't9',
        entity_id: 'e1',
        task_type_id: 'tt-fx'
      })

      expect(store.getters.displayedEdits[0].tasks).toEqual(['t1', 't2'])
    })

    test('sums the time of the tasks of an edit again', () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', {
          tasks: [buildTask('t1', 'tt-anim'), buildTask('t2', 'tt-comp')]
        })
      ])
      const previousTaskMap = tasksStore.state.taskMap
      tasksStore.state.taskMap = new Map([
        ['t1', { id: 't1', duration: 60, estimation: 30 }],
        ['t2', { id: 't2', duration: 15 }]
      ])
      try {
        store.commit(LOAD_TASK_END, { id: 't1', entity_id: 'e1' })
      } finally {
        tasksStore.state.taskMap = previousTaskMap
      }

      expect(store.getters.editMap.get('e1')).toMatchObject({
        timeSpent: 75,
        estimation: 30
      })
    })

    test('deletes the tasks of a task type, of the selection only', () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', { tasks: [buildTask('t1', 'tt-anim')] }),
        buildEdit('e2', 'E02', { tasks: [buildTask('t2', 'tt-comp')] })
      ])

      store.dispatch('deleteAllEditTasks', {
        projectId: 'p1',
        taskTypeId: 'tt-anim',
        selectionOnly: true
      })
      store.dispatch('deleteAllEditTasks', {
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

    test('shows the new preview of an edit and of its tasks', () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', { tasks: [buildTask('t1', 'tt-anim')] })
      ])

      store.commit(SET_PREVIEW, {
        entityId: 'e1',
        previewId: 'preview-2',
        taskMap
      })

      expect(store.getters.displayedEdits[0].preview_file_id).toBe('preview-2')
      expect(taskMap.get('t1').entity.preview_file_id).toBe('preview-2')
    })
  })

  describe('selection', () => {
    test('selects the cells of tasks, then unselects one', () => {
      const store = buildStore()
      load(store, [
        buildEdit('e1', 'E01', { tasks: [buildTask('t1', 'tt-anim')] })
      ])
      store.commit(SET_EDIT_SELECTION, {
        edit: store.getters.editMap.get('e1'),
        selected: true
      })

      store.commit(ADD_SELECTED_TASK, { x: 0, y: 0 })
      expect(store.getters.selectedEdits.size).toBe(0)
      store.commit(SET_EDIT_SELECTION, {
        edit: store.getters.editMap.get('e1'),
        selected: true
      })
      store.commit(ADD_SELECTED_TASKS, [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 }
      ])
      expect([...store.getters.editSelectionGrid]).toEqual([
        '0-0',
        '0-1',
        '1-0'
      ])
      expect(store.getters.selectedEdits.size).toBe(0)

      store.commit(REMOVE_SELECTED_TASK, {
        task: { entity: { id: 'e1' }, column: { id: 'tt-anim' } }
      })
      expect([...store.getters.editSelectionGrid]).toEqual(['0-1', '1-0'])
    })

    test('clears the selected cells once tasks are selected', () => {
      const store = buildStore()
      store.commit(ADD_SELECTED_TASK, { x: 0, y: 0 })
      const previousCount = tasksStore.state.nbSelectedTasks

      store.commit(CLEAR_SELECTED_TASKS)
      expect(store.getters.editSelectionGrid.size).toBe(1)

      tasksStore.state.nbSelectedTasks = 1
      try {
        store.commit(CLEAR_SELECTED_TASKS)
      } finally {
        tasksStore.state.nbSelectedTasks = previousCount
      }
      expect(store.getters.editSelectionGrid.size).toBe(0)
    })

    test('selects edits, then unselects them', () => {
      const store = buildStore()
      load(store, [buildEdit('e1', 'E01'), buildEdit('e2', 'E02')])
      store.commit(ADD_SELECTED_TASK, { x: 0, y: 0 })
      const [first, second] = store.getters.displayedEdits

      store.dispatch('setEditSelection', { edit: first, selected: true })
      store.dispatch('setEditSelection', { edit: second, selected: true })
      expect([...store.getters.selectedEdits.keys()]).toEqual(['e1', 'e2'])
      expect(store.getters.editSelectionGrid.size).toBe(0)

      store.dispatch('setEditSelection', { edit: first, selected: false })
      expect([...store.getters.selectedEdits.keys()]).toEqual(['e2'])

      store.dispatch('clearSelectedEdits')
      expect(store.getters.selectedEdits.size).toBe(0)
    })
  })

  test('keeps the scroll position of the list', () => {
    const store = buildStore()

    store.commit(SET_EDIT_LIST_SCROLL_POSITION, 240)

    expect(store.getters.editListScrollPosition).toBe(240)
  })

  test('empties the list on RESET_ALL', () => {
    const store = buildStore()
    load(store, [buildEdit('e1', 'E01')])

    store.commit(RESET_ALL)

    expect(editsStore.cache.edits).toEqual([])
    expect(editsStore.cache.result).toEqual([])
    expect(store.getters.displayedEdits).toEqual([])
  })
})
