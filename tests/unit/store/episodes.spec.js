// @vitest-environment node

import { vi } from 'vitest'
import { computed, reactive } from 'vue'
import { createStore } from 'vuex'

// Importing the episodes module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/store/api/shots', async importOriginal => {
  const { default: shotsApi } = await importOriginal()
  return { default: { ...shotsApi, getEpisodes: vi.fn() } }
})
vi.mock('@/store/api/client', () => ({
  default: { pdel: vi.fn(), pget: vi.fn(), ppost: vi.fn(), pput: vi.fn() }
}))

import shotsApi from '@/store/api/shots'
import episodesStore from '@/store/modules/episodes'
import client from '@/store/api/client'

describe('Episodes store', () => {
  describe('LOAD_EPISODES_END with no episodes', () => {
    test.each(['all', 'main'])(
      'resolves the %s pseudo-episode from the route',
      routeEpisodeId => {
        const state = { episodes: [] }
        episodesStore.mutations.LOAD_EPISODES_END(state, {
          episodes: [],
          routeEpisodeId
        })
        expect(state.currentEpisode).toEqual({ id: routeEpisodeId })
      }
    )

    test('keeps currentEpisode null without a route episode', () => {
      const state = { episodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [],
        routeEpisodeId: undefined
      })
      expect(state.currentEpisode).toBeNull()
    })
  })

  describe('loadEpisodes', () => {
    // The user can change episode while the list is being fetched: the
    // episode resolved from the route must be the one of the response time,
    // not a snapshot taken at dispatch.
    test('resolves the route episode once the response is in', async () => {
      const production = { id: 'production-1' }
      const route = { params: { episode_id: 'episode-1' } }
      const rootGetters = {
        currentProduction: production,
        route,
        userFilters: {}
      }
      const commit = vi.fn()
      let resolveEpisodes
      shotsApi.getEpisodes.mockReturnValue(
        new Promise(resolve => {
          resolveEpisodes = resolve
        })
      )

      const loading = episodesStore.actions.loadEpisodes({
        commit,
        state: {},
        rootGetters
      })
      route.params = { episode_id: 'episode-2' }
      resolveEpisodes([{ id: 'episode-1' }, { id: 'episode-2' }])
      await loading

      expect(commit).toHaveBeenCalledWith(
        'LOAD_EPISODES_END',
        expect.objectContaining({ routeEpisodeId: 'episode-2' })
      )
    })
  })

  describe('LOAD_EPISODES_END with a list already filled', () => {
    const response = () => [
      { id: 'episode-1', name: 'E01', status: 'running' },
      { id: 'episode-2', name: 'E02', status: 'running' }
    ]

    // The topbar refetches the list of a small production on every episode
    // change: the second response must not rebuild the list.
    test('ignores a second response once the list is loaded', () => {
      const state = { episodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: response(),
        routeEpisodeId: 'episode-1'
      })
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: response().slice(0, 1),
        routeEpisodeId: 'episode-2'
      })
      expect(state.episodes.map(({ id }) => id)).toEqual([
        'episode-1',
        'episode-2'
      ])
      expect(state.currentEpisode.id).toBe('episode-1')
    })

    // An episode:new received while the list is in flight fills the list
    // first: the response is still the list, and the live episode may be
    // missing from it.
    test('merges an episode created while the list was in flight', () => {
      const state = { episodes: [], displayedEpisodes: [] }
      episodesStore.mutations.ADD_EPISODE(state, {
        id: 'episode-3',
        name: 'E03',
        status: 'running'
      })
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: response(),
        routeEpisodeId: 'episode-1'
      })
      expect(state.episodes.map(({ id }) => id)).toEqual([
        'episode-1',
        'episode-2',
        'episode-3'
      ])
      expect(state.currentEpisode.id).toBe('episode-1')
    })

    test('builds the list again after a clear', () => {
      const state = { episodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: response(),
        routeEpisodeId: 'episode-1'
      })
      episodesStore.mutations.CLEAR_EPISODES(state)
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: response().slice(0, 1),
        routeEpisodeId: 'episode-1'
      })
      expect(state.episodes.map(({ id }) => id)).toEqual(['episode-1'])
    })
  })

  describe('loadEpisode', () => {
    // The fetch of an episode created live may outlive a production switch:
    // the list of the production displayed now must not adopt it.
    test('drops an episode of the production left behind', async () => {
      const commit = vi.fn()
      shotsApi.getEpisode = vi.fn(() =>
        Promise.resolve({ id: 'episode-9', project_id: 'production-1' })
      )
      await episodesStore.actions.loadEpisode(
        {
          commit,
          state: {},
          rootGetters: { currentProduction: { id: 'production-2' } }
        },
        'episode-9'
      )
      expect(commit).not.toHaveBeenCalled()
    })

    test('adds an episode of the displayed production', async () => {
      const commit = vi.fn()
      shotsApi.getEpisode = vi.fn(() =>
        Promise.resolve({ id: 'episode-9', project_id: 'production-1' })
      )
      await episodesStore.actions.loadEpisode(
        {
          commit,
          state: {},
          rootGetters: { currentProduction: { id: 'production-1' } }
        },
        'episode-9'
      )
      expect(commit).toHaveBeenCalledWith(
        'ADD_EPISODE',
        expect.objectContaining({ id: 'episode-9' })
      )
    })
  })

  describe('ADD_EPISODE', () => {
    // The Episodes page loads its rows with tasks into cache.episodes while
    // state.episodes keeps the plain list the topbar loaded: a live episode
    // must not replace one dataset by the other.
    test('keeps the with-tasks dataset of the Episodes page', () => {
      const state = { episodes: [], displayedEpisodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [{ id: 'episode-1', name: 'E01', status: 'running' }],
        routeEpisodeId: 'episode-1'
      })
      episodesStore.mutations.SET_EPISODES_WITH_TASKS(state, {
        production: { id: 'production-1', name: 'Prod' },
        episodes: [
          {
            id: 'episode-1',
            name: 'E01',
            status: 'running',
            tasks: [],
            data: {}
          }
        ],
        userFilters: {},
        taskMap: new Map(),
        taskTypeMap: new Map(),
        personMap: new Map(),
        taskStatusMap: new Map()
      })
      const withTasks = episodesStore.cache.episodes[0]
      expect(withTasks.validations).toBeInstanceOf(Map)

      episodesStore.mutations.ADD_EPISODE(state, {
        id: 'episode-2',
        name: 'E02',
        status: 'running'
      })

      expect(episodesStore.cache.episodes[0]).toBe(withTasks)
      expect(state.episodes.map(({ id }) => id)).toEqual([
        'episode-1',
        'episode-2'
      ])
      expect(state.displayedEpisodes.map(({ id }) => id)).toEqual([
        'episode-1',
        'episode-2'
      ])
    })
  })

  describe('NEW_EPISODE_END', () => {
    test('keeps the metadata typed in the creation form', () => {
      const state = { episodes: [], displayedEpisodes: [], episodeSorting: [] }

      episodesStore.mutations.NEW_EPISODE_END(state, {
        id: 'episode-new',
        name: 'E04',
        project_id: 'production-1',
        data: { prod_order: '4' }
      })

      expect(state.displayedEpisodes[0].data).toEqual({ prod_order: '4' })
    })

    // The displayed list is a search result: taking it for the whole
    // dataset dropped every episode the search filtered out, and the topbar
    // validates the route episode against that list.
    test('keeps the episodes a search filtered out', () => {
      const state = { episodes: [], displayedEpisodes: [], episodeSorting: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [
          { id: 'episode-1', name: 'E01', status: 'running' },
          { id: 'episode-2', name: 'E02', status: 'running' }
        ],
        routeEpisodeId: 'episode-1'
      })
      episodesStore.mutations.SET_EPISODE_SEARCH(state, {
        episodeSearch: 'E02',
        production: { id: 'production-1' },
        persons: [],
        taskMap: new Map(),
        taskStatusMap: new Map(),
        taskTypeMap: new Map()
      })
      expect(state.displayedEpisodes.map(({ id }) => id)).toEqual(['episode-2'])

      episodesStore.mutations.NEW_EPISODE_END(state, {
        id: 'episode-3',
        name: 'E03',
        project_id: 'production-1'
      })

      expect(state.episodes.map(({ id }) => id)).toEqual([
        'episode-1',
        'episode-2',
        'episode-3'
      ])
      expect(episodesStore.cache.episodes.map(({ id }) => id)).toEqual([
        'episode-1',
        'episode-2',
        'episode-3'
      ])
    })

    // The episode created locally carries no totals either: the footer of
    // the Episodes page vanished right after a creation.
    test('keeps the totals of the list when the new episode carries none', () => {
      const state = { episodes: [], displayedEpisodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [
          {
            id: 'episode-1',
            name: 'E01',
            status: 'running',
            timeSpent: 60,
            estimation: 90
          }
        ],
        routeEpisodeId: 'episode-1'
      })
      episodesStore.mutations.NEW_EPISODE_END(state, {
        id: 'episode-2',
        name: 'E02',
        project_id: 'production-1'
      })
      expect(state.displayedEpisodesTimeSpent).toBe(60)
      expect(state.displayedEpisodesEstimation).toBe(90)
    })

    // zou emits episode:new before the creation response lands, so the
    // socket handler inserts the episode first: the response must not
    // append a copy.
    test('does not duplicate an episode the socket handler already added', () => {
      const state = { episodes: [], displayedEpisodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [{ id: 'episode-1', name: 'E01', status: 'running' }],
        routeEpisodeId: 'episode-1'
      })
      const episode = {
        id: 'episode-2',
        name: 'E02',
        status: 'running',
        project_id: 'production-1'
      }

      episodesStore.mutations.ADD_EPISODE(state, { ...episode })
      episodesStore.mutations.NEW_EPISODE_END(state, { ...episode })

      expect(state.episodes.map(({ id }) => id)).toEqual([
        'episode-1',
        'episode-2'
      ])
      expect(episodesStore.cache.episodes.map(({ id }) => id)).toEqual([
        'episode-1',
        'episode-2'
      ])
      expect(state.displayedEpisodes.map(({ id }) => id)).toEqual([
        'episode-1',
        'episode-2'
      ])
    })
  })

  describe('EDIT_EPISODE_END', () => {
    // A metadata cell sends only its own field: the other fields must stay.
    test('merges the edited metadata into the existing data', () => {
      const state = { episodes: [], displayedEpisodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [
          { id: 'episode-1', name: 'E01', data: { start: 'A', end: 'B' } }
        ],
        routeEpisodeId: 'episode-1'
      })
      state.displayedEpisodes = [...state.episodes]
      episodesStore.mutations.EDIT_EPISODE_END(state, {
        id: 'episode-1',
        data: { start: 'C' }
      })
      const expected = { start: 'C', end: 'B' }
      expect(state.episodes[0].data).toEqual(expected)
      expect(state.displayedEpisodes[0].data).toEqual(expected)
    })
  })

  describe('REMOVE_EPISODE', () => {
    // The topbar validates route episodes against the episodes getter: a
    // deleted episode must leave that list too, not only the map.
    test('drops the episode from the episodes list', () => {
      const state = { episodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [
          { id: 'episode-1', name: 'E01', status: 'running' },
          { id: 'episode-2', name: 'E02', status: 'running' }
        ],
        routeEpisodeId: 'episode-1'
      })
      episodesStore.mutations.REMOVE_EPISODE(state, { id: 'episode-2' })
      expect(state.episodes.map(({ id }) => id)).toEqual(['episode-1'])
    })

    // The list footer and the keyboard navigation read the counter, and the
    // search result must stay the search result.
    test('counts the episodes left after a deletion', () => {
      const state = { episodes: [], displayedEpisodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [
          { id: 'episode-1', name: 'E01', status: 'running' },
          { id: 'episode-2', name: 'E02', status: 'running' }
        ],
        routeEpisodeId: 'episode-1'
      })
      episodesStore.mutations.REMOVE_EPISODE(state, { id: 'episode-2' })
      expect(state.displayedEpisodesLength).toBe(1)
    })

    // A live-added episode carries no totals: summing it made both totals
    // NaN, and the footer, guarded on a positive total, disappeared.
    test('sums the totals over the episodes carrying one', () => {
      const state = { episodes: [], displayedEpisodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [
          {
            id: 'episode-1',
            name: 'E01',
            status: 'running',
            timeSpent: 60,
            estimation: 90
          },
          {
            id: 'episode-2',
            name: 'E02',
            status: 'running',
            timeSpent: 30,
            estimation: 45
          }
        ],
        routeEpisodeId: 'episode-1'
      })
      episodesStore.mutations.ADD_EPISODE(state, {
        id: 'episode-3',
        name: 'E03',
        status: 'running'
      })
      episodesStore.mutations.REMOVE_EPISODE(state, { id: 'episode-2' })
      expect(state.displayedEpisodesTimeSpent).toBe(60)
      expect(state.displayedEpisodesEstimation).toBe(90)
    })

    test('keeps the search result to the episodes it held', () => {
      const state = { episodes: [], displayedEpisodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [
          { id: 'episode-1', name: 'E01', status: 'running' },
          { id: 'episode-2', name: 'E02', status: 'running' },
          { id: 'episode-3', name: 'E03', status: 'running' }
        ],
        routeEpisodeId: 'episode-1'
      })
      episodesStore.cache.result = [{ id: 'episode-2', name: 'E02' }]
      episodesStore.mutations.REMOVE_EPISODE(state, { id: 'episode-3' })
      expect(episodesStore.cache.result.map(({ id }) => id)).toEqual([
        'episode-2'
      ])
    })

    test('keeps an episode added live', () => {
      const state = { episodes: [], displayedEpisodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [
          { id: 'episode-1', name: 'E01', status: 'running' },
          { id: 'episode-2', name: 'E02', status: 'running' }
        ],
        routeEpisodeId: 'episode-1'
      })
      episodesStore.mutations.ADD_EPISODE(state, {
        id: 'episode-3',
        name: 'E03',
        status: 'running'
      })
      episodesStore.mutations.REMOVE_EPISODE(state, { id: 'episode-1' })
      expect(state.episodes.map(({ id }) => id)).toEqual([
        'episode-2',
        'episode-3'
      ])
    })
  })
})

describe('Episodes store, CREATE_TASKS_END', () => {
  afterEach(() => {
    episodesStore.cache.episodeMap.delete('ep-live-tasks')
  })

  // Created by a colleague, the row arrives without task columns: a task
  // created on it threw and never showed.
  test('creates a task on an episode added live', () => {
    episodesStore.cache.episodeMap.set('ep-live-tasks', {
      id: 'ep-live-tasks',
      name: 'E01'
    })
    episodesStore.mutations.CREATE_TASKS_END(
      { displayedEpisodes: [] },
      {
        tasks: [
          {
            id: 't-live',
            entity_id: 'ep-live-tasks',
            task_type_id: 'tt1',
            task_status_id: 'ts1'
          }
        ],
        production: { id: 'p1' },
        taskTypeMap: new Map([['tt1', { id: 'tt1', priority: 1 }]]),
        taskStatusMap: new Map()
      }
    )
    const episode = episodesStore.cache.episodeMap.get('ep-live-tasks')
    expect(episode.validations.get('tt1')).toBe('t-live')
    expect(episode.tasks).toEqual(['t-live'])
  })
})

describe('Episodes store, lists loaded with and without tasks', () => {
  afterEach(() => {
    episodesStore.cache.episodeMap.clear()
  })

  // The plain list of the topbar can land after the Episodes page loaded the
  // same episodes with their tasks: the rows must keep their task columns.
  test('keeps the task columns of rows loaded with tasks', () => {
    const validations = new Map([['tt1', 't1']])
    episodesStore.cache.episodeMap.set('ep-a', {
      id: 'ep-a',
      name: 'E01',
      validations
    })
    const state = {
      episodes: [],
      displayedEpisodes: [],
      isEpisodeListLoaded: false,
      currentEpisode: null
    }

    episodesStore.mutations.LOAD_EPISODES_END(state, {
      episodes: [{ id: 'ep-a', name: 'E01 renamed', status: 'running' }],
      routeEpisodeId: 'ep-a'
    })

    expect(state.displayedEpisodes[0].validations).toBe(validations)
    expect(state.displayedEpisodes[0].name).toBe('E01 renamed')
  })

  // An episode added live while the Episodes page loaded with tasks stays
  // resolvable for the topbar selector.
  test('keeps an episode added live during a load with tasks', () => {
    const live = { id: 'ep-live', name: 'E02' }
    const state = {
      episodes: [live],
      displayedEpisodes: [],
      episodeValidationColumns: []
    }

    episodesStore.mutations.SET_EPISODES_WITH_TASKS(state, {
      production: { id: 'p1', name: 'P1' },
      episodes: [],
      userFilters: {},
      taskMap: new Map(),
      taskTypeMap: new Map(),
      personMap: new Map(),
      taskStatusMap: new Map()
    })

    expect(episodesStore.cache.episodeMap.get('ep-live')).toBe(live)
  })
})

describe('Episodes store, UPDATE_EPISODE', () => {
  afterEach(() => {
    episodesStore.cache.episodeMap.delete('ep-renamed')
  })

  // A remote rename reaches the map through its raw object: the topbar
  // selector reads the reactive list, which must see the new name.
  test('updates the reactive lists showing the episode', () => {
    const episode = { id: 'ep-renamed', name: 'E01', status: 'running' }
    episodesStore.cache.episodeMap.set('ep-renamed', episode)
    const state = reactive({ episodes: [episode], displayedEpisodes: [] })
    const labels = computed(() => state.episodes.map(({ name }) => name))
    expect(labels.value).toEqual(['E01'])

    episodesStore.mutations.UPDATE_EPISODE(state, {
      id: 'ep-renamed',
      name: 'E01 new'
    })

    expect(labels.value).toEqual(['E01 new'])
  })
})

describe('Episodes store, DELETE_TASK_END', () => {
  afterEach(() => {
    episodesStore.cache.episodeMap.clear()
  })

  // The topbar and the task page load the plain list, whose rows carry no
  // tasks: deleting a task of one of them threw, and the modules after this
  // one kept the task.
  test('leaves an episode loaded without its tasks unchanged', () => {
    episodesStore.mutations.LOAD_EPISODES_END(
      {
        episodes: [],
        displayedEpisodes: [],
        isEpisodeListLoaded: false,
        currentEpisode: null
      },
      {
        episodes: [{ id: 'ep-plain', name: 'E01', status: 'running' }],
        routeEpisodeId: 'ep-plain'
      }
    )

    episodesStore.mutations.DELETE_TASK_END(
      {},
      { id: 't1', entity_id: 'ep-plain', task_type_id: 'tt1' }
    )

    const episode = episodesStore.cache.episodeMap.get('ep-plain')
    expect(episode.tasks).toBeUndefined()
    expect(episode.validations).toBeUndefined()
  })

  test('removes the task of an episode loaded with its tasks', () => {
    episodesStore.cache.episodeMap.set('ep-full', {
      id: 'ep-full',
      tasks: ['t1', 't2'],
      validations: new Map([
        ['tt1', 't1'],
        ['tt2', 't2']
      ])
    })

    episodesStore.mutations.DELETE_TASK_END(
      {},
      { id: 't1', entity_id: 'ep-full', task_type_id: 'tt1' }
    )

    const episode = episodesStore.cache.episodeMap.get('ep-full')
    expect(episode.tasks).toEqual(['t2'])
    expect([...episode.validations]).toEqual([['tt2', 't2']])
  })

  test('keeps the tasks of an episode when a task it does not list is deleted', () => {
    episodesStore.cache.episodeMap.set('ep-full', {
      id: 'ep-full',
      tasks: ['t1', 't2'],
      validations: new Map([
        ['tt1', 't1'],
        ['tt2', 't2']
      ])
    })

    episodesStore.mutations.DELETE_TASK_END(
      {},
      { id: 't9', entity_id: 'ep-full', task_type_id: 'tt3' }
    )

    expect(episodesStore.cache.episodeMap.get('ep-full').tasks).toEqual([
      't1',
      't2'
    ])
  })
})

describe('Episodes store, production switch', () => {
  // The back link of an episode page carries this search: the lists of
  // another production must not inherit it.
  test('forgets the search typed in the previous production', () => {
    const store = createStore({
      modules: {
        episodes: {
          state: { episodeSearchText: 'E01' },
          getters: episodesStore.getters,
          mutations: episodesStore.mutations
        }
      }
    })

    store.commit('SET_CURRENT_PRODUCTION', 'production-2')

    expect(store.getters.episodeSearchText).toBe('')
  })
})

describe('Episodes store, retake stats', () => {
  const production = { id: 'production-1' }
  // The user holds `role` on the production of the stats. The route may
  // show another production by the time the load runs.
  const loadRetakeStats = (
    commit,
    { role, isAdmin = false, isRouteClient = role === 'client' }
  ) =>
    episodesStore.actions.loadEpisodeRetakeStats(
      {
        commit,
        rootGetters: {
          currentUserRoleForProduction: id =>
            id === production.id ? role : null,
          isCurrentUserAdmin: isAdmin,
          isCurrentUserClient: isRouteClient
        }
      },
      production.id
    )

  // Zou refuses the retake stats to clients since 1.0.97.
  test('asks no retake stats for a client', async () => {
    shotsApi.getEpisodeRetakeStats = vi.fn(() => Promise.resolve({}))
    await loadRetakeStats(vi.fn(), { role: 'client' })
    expect(shotsApi.getEpisodeRetakeStats).not.toHaveBeenCalled()
  })

  // The page loads the episodes and the status stats first.
  test('asks no retake stats for a client once the route moved on', async () => {
    shotsApi.getEpisodeRetakeStats = vi.fn(() => Promise.resolve({}))
    await loadRetakeStats(vi.fn(), { role: 'client', isRouteClient: false })
    expect(shotsApi.getEpisodeRetakeStats).not.toHaveBeenCalled()
  })

  test('loads the retake stats for the studio', async () => {
    const episodeRetakeStats = { all: { all: {} } }
    shotsApi.getEpisodeRetakeStats = vi.fn(() =>
      Promise.resolve(episodeRetakeStats)
    )
    const commit = vi.fn()
    await loadRetakeStats(commit, { role: 'manager' })
    expect(shotsApi.getEpisodeRetakeStats).toHaveBeenCalledWith(production.id)
    expect(commit).toHaveBeenLastCalledWith(
      'SET_EPISODE_RETAKE_STATS',
      expect.objectContaining({ episodeRetakeStats })
    )
  })

  // Admin is a global-only role, as in Zou.
  test('loads the retake stats for an admin, whatever its project role', async () => {
    shotsApi.getEpisodeRetakeStats = vi.fn(() => Promise.resolve({}))
    await loadRetakeStats(vi.fn(), {
      role: 'client',
      isAdmin: true,
      isRouteClient: false
    })
    expect(shotsApi.getEpisodeRetakeStats).toHaveBeenCalledWith(production.id)
  })

  // Both stats count the same tasks: a retake load that is skipped or fails
  // must not empty the table.
  test('keeps the columns of the status stats', () => {
    const state = { episodeStatColumns: ['layout', 'anim'] }
    episodesStore.mutations.SET_EPISODE_RETAKE_STATS(state, {
      episodeRetakeStats: {}
    })
    expect(state.episodeStatColumns).toEqual(['layout', 'anim'])
    expect(state.episodeRetakeStats).toEqual({})
  })
})

describe('Episodes store, through a store', () => {
  const production = { id: 'p1', name: 'Caminandes', descriptors: [] }

  const buildStore = async (getters = {}, actions = {}) => {
    vi.resetModules()
    const { default: module } = await import('@/store/modules/episodes')
    const { default: tasksStore } = await import('@/store/modules/tasks')
    const store = createStore({
      modules: { episodes: module },
      getters: {
        currentProduction: () => production,
        people: () => [],
        productionEpisodeTaskTypeIds: () => [],
        taskMap: () => tasksStore.state.taskMap,
        taskStatus: () => [],
        taskStatusMap: () => new Map(),
        taskTypeMap: () => new Map(),
        ...getters
      },
      actions
    })
    return { module, store }
  }

  const loadEpisodes = (store, episodes) =>
    store.commit('LOAD_EPISODES_END', { episodes, routeEpisodeId: null })

  const names = list => list.map(({ name }) => name)

  const buildEpisodes = () => [
    { id: 'ep1', name: 'E01', data: { prod_order: '2' }, tasks: [] },
    { id: 'ep2', name: 'E02', data: { prod_order: '3' }, tasks: [] },
    { id: 'ep3', name: 'E03', data: { prod_order: '1' }, tasks: [] }
  ]

  const loadWithTasks = (store, episodes) =>
    store.commit('SET_EPISODES_WITH_TASKS', {
      production,
      episodes,
      userFilters: {},
      taskMap: store.getters.taskMap,
      taskTypeMap: new Map(),
      personMap: new Map(),
      taskStatusMap: store.getters.taskStatusMap
    })

  const selectorLabels = store =>
    store.getters.episodeOptionGroups.flatMap(({ episodeList }) =>
      episodeList.map(({ label }) => label)
    )

  beforeEach(() => {
    Object.values(client).forEach(fn => fn.mockReset())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('shows the resolution column once an episode gets one', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [{ id: 'ep1', name: 'E01', data: {} }])
    client.pput.mockResolvedValueOnce({})

    await store.dispatch('editEpisode', {
      id: 'ep1',
      name: 'E01',
      data: { resolution: '1920x1080' }
    })

    expect(store.getters.isEpisodeResolution).toBe(true)
  })
  test('locks an edited episode until a while after its save', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [{ id: 'ep1', name: 'E01', data: { fps: '24' } }])
    let endSave
    client.pput.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          endSave = resolve
        })
    )
    const form = { id: 'ep1', name: 'E01 bis', data: { resolution: '' } }

    const saving = store.dispatch('editEpisode', form)

    const episode = store.getters.episodeMap.get('ep1')
    expect(client.pput).toHaveBeenCalledWith('/api/data/entities/ep1', {
      name: 'E01 bis',
      description: undefined,
      status: undefined,
      data: { resolution: '' }
    })
    expect(episode).toMatchObject({
      lock: 1,
      name: 'E01 bis',
      data: { fps: '24', resolution: '' }
    })
    expect(names(store.getters.displayedEpisodes)).toEqual(['E01 bis'])
    endSave({})
    await saving
    expect(episode.lock).toBe(1)
    vi.advanceTimersByTime(2000)
    expect(episode.lock).toBe(0)
  })

  // Deleted in another session while its modal was open, for instance.
  test('saves the edit of an episode missing from the loaded list', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [{ id: 'ep1', name: 'E01', data: {} }])
    client.pput.mockResolvedValueOnce({})
    const form = { id: 'ep9', name: 'E09', data: {} }

    await store.dispatch('editEpisode', form)

    expect(client.pput).toHaveBeenCalledWith('/api/data/entities/ep9', {
      name: 'E09',
      description: undefined,
      status: undefined,
      data: {}
    })
    expect(names(store.getters.displayedEpisodes)).toEqual(['E01'])
  })

  // The list and the pages show an edit before Zou answers.
  test('puts back what an edit Zou refuses changed', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [{ id: 'ep1', name: 'E01', data: { fps: '24' } }])
    client.pput.mockRejectedValueOnce(new Error('Bad Request'))

    await expect(
      store.dispatch('editEpisode', {
        id: 'ep1',
        name: 'E01 bis',
        data: { fps: '25' }
      })
    ).rejects.toThrow('Bad Request')

    expect(store.getters.episodeMap.get('ep1')).toMatchObject({
      name: 'E01',
      data: { fps: '24' }
    })
    expect(names(store.getters.displayedEpisodes)).toEqual(['E01'])
    expect(names(store.getters.episodes)).toEqual(['E01'])
  })

  test('deletes an episode from every list', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [
      { id: 'ep1', name: 'E01' },
      { id: 'ep2', name: 'E02' }
    ])
    client.pdel.mockResolvedValueOnce()
    const episode = { id: 'ep1', name: 'E01' }

    expect(await store.dispatch('deleteEpisode', episode)).toBe(episode)

    expect(client.pdel).toHaveBeenCalledWith(
      '/api/data/episodes/ep1?force=true'
    )
    expect(names(store.getters.episodes)).toEqual(['E02'])
    expect(names(store.getters.displayedEpisodes)).toEqual(['E02'])
    expect(store.getters.displayedEpisodesLength).toBe(1)
    expect(store.getters.episodeMap.has('ep1')).toBe(false)
  })

  test('creates an episode at its place in the lists', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [
      { id: 'ep1', name: 'E01' },
      { id: 'ep3', name: 'E03' }
    ])
    client.ppost.mockResolvedValueOnce({
      id: 'ep2',
      name: 'E02',
      project_id: 'p1'
    })

    const episode = await store.dispatch('newEpisode', {
      name: 'E02',
      project_id: 'p1'
    })

    expect(client.ppost).toHaveBeenCalledWith(
      '/api/data/projects/p1/episodes',
      { name: 'E02', description: '', status: 'running', data: {} }
    )
    expect(episode).toMatchObject({
      id: 'ep2',
      production_id: 'p1',
      tasks: [],
      data: {}
    })
    expect(names(store.getters.episodes)).toEqual(['E01', 'E02', 'E03'])
    expect(names(store.getters.displayedEpisodes)).toEqual([
      'E01',
      'E02',
      'E03'
    ])
    expect(store.getters.episodeMap.get('ep2')).toBe(episode)
  })

  test('refuses an episode name already taken', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [{ id: 'ep1', name: 'E01' }])

    await expect(store.dispatch('newEpisode', { name: 'E01' })).rejects.toThrow(
      'Episode already exists'
    )
    expect(client.ppost).not.toHaveBeenCalled()
  })

  test('creates the tasks of the episode task types', async () => {
    const createEntityTasks = vi.fn()
    const { store } = await buildStore(
      { productionEpisodeTaskTypeIds: () => ['tt-1'] },
      { createEntityTasks }
    )
    loadEpisodes(store, [])
    client.ppost.mockResolvedValueOnce({
      id: 'ep2',
      name: 'E02',
      project_id: 'p1'
    })

    const episode = await store.dispatch('newEpisode', {
      name: 'E02',
      project_id: 'p1'
    })

    expect(createEntityTasks).toHaveBeenCalledWith(expect.anything(), {
      entityId: 'ep2',
      taskTypeIds: ['tt-1']
    })
    expect(episode.id).toBe('ep2')
  })

  test('saves an episode search, then removes it', async () => {
    const { store } = await buildStore()
    client.ppost.mockResolvedValueOnce({ id: 'f1', name: 'wip' })

    await store.dispatch('saveEpisodeSearch', {
      name: 'wip',
      search_query: 'wip'
    })

    expect(client.ppost).toHaveBeenCalledWith('/api/data/user/filters', {
      list_type: 'episode',
      name: 'wip',
      query: 'wip',
      entity_type: 'Episode',
      project_id: 'p1'
    })
    expect(names(store.getters.episodeSearchQueries)).toEqual(['wip'])

    client.pdel.mockResolvedValueOnce()
    await store.dispatch('removeEpisodeSearch', { id: 'f1', name: 'wip' })

    expect(client.pdel).toHaveBeenCalledWith('/api/data/user/filters/f1')
    expect(store.getters.episodeSearchQueries).toEqual([])
  })

  test('keeps the saved episode searches sorted', async () => {
    const { store } = await buildStore()
    client.ppost
      .mockResolvedValueOnce({ id: 'f1', name: 'wip' })
      .mockResolvedValueOnce({ id: 'f2', name: 'done' })

    const save = name =>
      store.dispatch('saveEpisodeSearch', { name, search_query: name })
    await save('wip')
    await save('done')

    expect(names(store.getters.episodeSearchQueries)).toEqual(['done', 'wip'])
  })

  test('picks the current episode', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [
      { id: 'ep1', name: 'E01' },
      { id: 'ep2', name: 'E02' }
    ])

    await store.dispatch('setCurrentEpisode', 'ep2')
    expect(store.getters.currentEpisode.name).toBe('E02')

    await store.dispatch('setCurrentEpisode', 'all')
    expect(store.getters.currentEpisode).toEqual({ id: 'all' })

    await store.dispatch('setCurrentEpisode', null)
    expect(store.getters.currentEpisode).toEqual({ id: 'all' })
  })

  test('sorts the episodes by a descriptor, then back by name', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [
      { id: 'ep1', name: 'E01', data: { difficulty: '1' } },
      { id: 'ep2', name: 'E02', data: { difficulty: '3' } },
      { id: 'ep3', name: 'E03', data: { difficulty: '2' } }
    ])
    const sortInfo = {
      type: 'metadata',
      column: 'difficulty',
      data_type: 'number',
      ascending: false
    }

    await store.dispatch('changeEpisodeSort', sortInfo)
    expect(store.getters.episodeSorting).toEqual([sortInfo])
    expect(names(store.getters.displayedEpisodes)).toEqual([
      'E02',
      'E03',
      'E01'
    ])

    await store.dispatch('changeEpisodeSort', null)
    expect(store.getters.episodeSorting).toEqual([])
    expect(names(store.getters.displayedEpisodes)).toEqual([
      'E01',
      'E02',
      'E03'
    ])
  })

  describe('list sorted by the Episodes page', () => {
    const sortInfo = {
      type: 'metadata',
      column: 'prod_order',
      data_type: 'number',
      ascending: true
    }

    // After a plain list load, the page and the topbar selector start from
    // the same episodes: a sort of the page must stay on the page.
    test('keeps the topbar selector by name', async () => {
      const { store } = await buildStore()
      loadEpisodes(store, buildEpisodes())
      const labels = computed(() => selectorLabels(store))
      expect(labels.value).toEqual(['E01', 'E02', 'E03'])

      await store.dispatch('changeEpisodeSort', sortInfo)

      expect(names(store.getters.displayedEpisodes)).toEqual([
        'E03',
        'E01',
        'E02'
      ])
      expect(labels.value).toEqual(['E01', 'E02', 'E03'])
    })

    // The sort outlives the list: the next production gets it through the
    // search the page applies on its arrival.
    test('keeps the selector by name when a search reapplies the sort', async () => {
      const { store } = await buildStore()
      loadEpisodes(store, buildEpisodes())
      await store.dispatch('changeEpisodeSort', sortInfo)
      store.commit('CLEAR_EPISODES')
      loadEpisodes(store, buildEpisodes())

      await store.dispatch('setEpisodeSearch', '')

      expect(selectorLabels(store)).toEqual(['E01', 'E02', 'E03'])
    })

    // The arrows of the episode and task pages walk the cached list.
    test.each([
      ['a plain list', loadEpisodes],
      ['a list with tasks', loadWithTasks]
    ])('keeps %s cached in the order of its rows', async (_, load) => {
      const { module, store } = await buildStore()
      load(store, buildEpisodes())

      await store.dispatch('changeEpisodeSort', sortInfo)

      expect(names(module.cache.episodes)).toEqual(['E03', 'E01', 'E02'])
    })

    describe.each([
      [
        'a new episode',
        store =>
          store.commit('NEW_EPISODE_END', {
            id: 'ep0',
            name: 'E00',
            project_id: 'p1',
            status: 'running',
            data: { prod_order: '2' }
          }),
        ['E03', 'E00', 'E01', 'E02']
      ],
      [
        'an episode from another session',
        store =>
          store.commit('ADD_EPISODE', {
            id: 'ep0',
            name: 'E00',
            status: 'running',
            data: { prod_order: '2' }
          }),
        ['E03', 'E00', 'E01', 'E02']
      ]
    ])('with %s', (_, addEpisode, sortedNames) => {
      const addToSortedList = async () => {
        const context = await buildStore()
        const { store } = context
        loadEpisodes(store, buildEpisodes())
        loadWithTasks(store, buildEpisodes())
        await store.dispatch('changeEpisodeSort', sortInfo)
        addEpisode(store)
        return context
      }

      test('keeps the rows and the cached list sorted', async () => {
        const { module, store } = await addToSortedList()

        expect(names(store.getters.displayedEpisodes)).toEqual(sortedNames)
        expect(names(module.cache.episodes)).toEqual(sortedNames)
      })

      test('keeps the topbar selector by name', async () => {
        const { store } = await addToSortedList()

        expect(selectorLabels(store)).toEqual(['E00', 'E01', 'E02', 'E03'])
      })
    })

    describe('with default tasks', () => {
      const buildTask = (id, entityId, statusId) => ({
        id,
        entity_id: entityId,
        task_type_id: 'tt-1',
        task_status_id: statusId,
        assignees: [],
        duration: 0,
        estimation: 0
      })
      const taskStatusMap = new Map([
        ['ts-todo', { short_name: 'todo' }],
        ['ts-wip', { short_name: 'wip' }]
      ])

      const buildStoreWithDefaultTask = () =>
        buildStore(
          {
            productionEpisodeTaskTypeIds: () => ['tt-1'],
            taskStatusMap: () => taskStatusMap
          },
          {
            createEntityTasks: ({ commit, rootGetters }, { entityId }) => {
              const task = buildTask(`t-${entityId}`, entityId, 'ts-todo')
              rootGetters.taskMap.set(task.id, task)
              commit('NEW_TASK_END', {
                task,
                production,
                taskTypeMap: new Map(),
                taskStatusMap
              })
            }
          }
        )

      const sortByTaskType = store =>
        store.dispatch('changeEpisodeSort', {
          type: 'status',
          column: 'tt-1',
          name: 'Layout'
        })

      const createEpisode = (store, id, name) => {
        client.ppost.mockResolvedValueOnce({ id, name, project_id: 'p1' })
        return store.dispatch('newEpisode', { name, project_id: 'p1' })
      }

      // Its tasks come once the episode has joined the list, and they decide
      // its place under a task type sort.
      test('moves a new episode to its place once it holds its tasks', async () => {
        const { module, store } = await buildStoreWithDefaultTask()
        loadWithTasks(store, [
          { ...buildEpisodes()[0], tasks: [buildTask('t1', 'ep1', 'ts-wip')] },
          { ...buildEpisodes()[1], tasks: [buildTask('t2', 'ep2', 'ts-todo')] },
          { ...buildEpisodes()[2], tasks: [buildTask('t3', 'ep3', 'ts-wip')] }
        ])
        await sortByTaskType(store)
        const rows = computed(() => names(store.getters.displayedEpisodes))
        expect(rows.value).toEqual(['E02', 'E01', 'E03'])

        await createEpisode(store, 'ep4', 'E04')

        expect(rows.value).toEqual(['E02', 'E04', 'E01', 'E03'])
        expect(names(module.cache.episodes)).toEqual(rows.value)
      })

      test('moves a new episode to its place after a live row', async () => {
        const { store } = await buildStoreWithDefaultTask()
        loadWithTasks(store, [
          { ...buildEpisodes()[0], tasks: [buildTask('t1', 'ep1', 'ts-wip')] },
          { ...buildEpisodes()[1], tasks: [buildTask('t2', 'ep2', 'ts-todo')] }
        ])
        await sortByTaskType(store)
        store.commit('ADD_EPISODE', { id: 'ep9', name: 'E09', data: {} })

        await createEpisode(store, 'ep4', 'E04')

        expect(names(store.getters.displayedEpisodes)).toEqual([
          'E09',
          'E02',
          'E04',
          'E01'
        ])
      })

      // The sort outlives its production, Episode Stats applies it through its
      // search at each visit, and the rows of a plain list hold no tasks.
      test('keeps a plain list by name', async () => {
        const { module, store } = await buildStoreWithDefaultTask()
        loadWithTasks(store, buildEpisodes())
        await sortByTaskType(store)
        store.commit('CLEAR_EPISODES')
        loadEpisodes(store, buildEpisodes())
        await store.dispatch('setEpisodeSearch', '')

        await createEpisode(store, 'ep4', 'E02B')
        await createEpisode(store, 'ep5', 'E02C')

        const expected = ['E01', 'E02', 'E02B', 'E02C', 'E03']
        expect(names(store.getters.displayedEpisodes)).toEqual(expected)
        expect(names(module.cache.episodes)).toEqual(expected)
      })

      test('keeps a new episode its search does not find', async () => {
        const { store } = await buildStoreWithDefaultTask()
        loadWithTasks(store, buildEpisodes())
        await store.dispatch('setEpisodeSearch', 'E01')

        await createEpisode(store, 'ep4', 'E04')

        expect(names(store.getters.displayedEpisodes)).toEqual(['E01', 'E04'])
      })
    })

    test('sorts a live episode when the plain list landed last', async () => {
      const { module, store } = await buildStore()
      loadWithTasks(store, buildEpisodes())
      loadEpisodes(store, buildEpisodes())
      await store.dispatch('changeEpisodeSort', sortInfo)

      store.commit('ADD_EPISODE', {
        id: 'ep0',
        name: 'E00',
        data: { prod_order: '2' }
      })

      const sorted = ['E03', 'E00', 'E01', 'E02']
      expect(names(store.getters.displayedEpisodes)).toEqual(sorted)
      expect(names(module.cache.episodes)).toEqual(sorted)
    })

    // The sort outlives its production, and the Shots page adds episodes to
    // a plain list.
    test('keeps a plain list by name under a sort', async () => {
      const { store } = await buildStore()
      await store.dispatch('changeEpisodeSort', sortInfo)
      loadEpisodes(store, buildEpisodes())

      store.commit('ADD_EPISODE', { id: 'ep4', name: 'E04', data: {} })

      expect(names(store.getters.displayedEpisodes)).toEqual([
        'E01',
        'E02',
        'E03',
        'E04'
      ])
    })

    test('shows a sort reapplied to a list loaded with tasks', async () => {
      const { store } = await buildStore()
      await store.dispatch('changeEpisodeSort', sortInfo)
      loadWithTasks(store, buildEpisodes())
      const rows = computed(() => names(store.getters.displayedEpisodes))
      expect(rows.value).toEqual(['E01', 'E02', 'E03'])

      await store.dispatch('setEpisodeSearch', '')

      expect(rows.value).toEqual(['E03', 'E01', 'E02'])
    })
  })

  // The topbar keeps its own copies of the episodes, without their tasks: the
  // search must keep finding the rows of the page.
  test.each([
    [
      'an edit',
      store =>
        store.commit('EDIT_EPISODE_END', { id: 'ep1', name: 'E01', data: {} })
    ],
    [
      'an update from another session',
      store => store.commit('UPDATE_EPISODE', { id: 'ep1', description: 'New' })
    ]
  ])('finds the rows with their tasks after %s', async (_, update) => {
    const { store } = await buildStore()
    loadEpisodes(store, buildEpisodes())
    loadWithTasks(store, buildEpisodes())

    update(store)
    await store.dispatch('setEpisodeSearch', 'E02')

    const rows = store.getters.displayedEpisodes
    expect(names(rows)).toEqual(['E02'])
    expect(rows[0].validations).toBeInstanceOf(Map)
  })

  test.each([
    [
      'an edit',
      store =>
        store.commit('EDIT_EPISODE_END', { id: 'ep3', name: 'E00', data: {} })
    ],
    [
      'an update from another session',
      store => store.commit('UPDATE_EPISODE', { id: 'ep3', name: 'E00' })
    ]
  ])('keeps the topbar selector by name after %s', async (_, rename) => {
    const { store } = await buildStore()
    loadEpisodes(store, buildEpisodes())
    const labels = computed(() => selectorLabels(store))
    expect(labels.value).toEqual(['E01', 'E02', 'E03'])

    rename(store)

    expect(labels.value).toEqual(['E00', 'E01', 'E02'])
  })

  test('loads the episode stats and their task type columns', async () => {
    const taskTypeMap = new Map([
      ['tt-anim', { id: 'tt-anim', name: 'Animation', priority: 2 }],
      ['tt-layout', { id: 'tt-layout', name: 'Layout', priority: 1 }]
    ])
    const { store } = await buildStore({ taskTypeMap: () => taskTypeMap })
    const episodeStats = {
      all: {
        all: { name: 'All' },
        'tt-anim': { done: 1 },
        'tt-layout': { done: 2 }
      },
      ep1: { 'tt-anim': { done: 1 } }
    }
    client.pget.mockResolvedValueOnce(episodeStats)

    expect(await store.dispatch('loadEpisodeStats', 'p1')).toBe(episodeStats)

    expect(client.pget).toHaveBeenCalledWith(
      '/api/data/projects/p1/episodes/stats'
    )
    expect(store.getters.episodeStats).toEqual(episodeStats)
    expect(store.getters.episodeStatColumns).toEqual(['tt-layout', 'tt-anim'])
  })

  // The stats count the tasks of the shots: their columns are not the ones
  // of the Episodes page, which takes its own for a list already loaded.
  test('leaves the columns of the list to the list', async () => {
    const { store } = await buildStore()
    store.state.episodes.episodeValidationColumns = ['tt-storyboard']
    client.pget.mockResolvedValueOnce({
      all: { all: { name: 'All' }, 'tt-anim': { done: 1 } }
    })

    await store.dispatch('loadEpisodeStats', 'p1')

    expect(store.getters.episodeValidationColumns).toEqual(['tt-storyboard'])
  })

  test('forgets the columns of the list with the list', async () => {
    const { store } = await buildStore()
    store.state.episodes.episodeValidationColumns = ['tt-storyboard']

    await store.dispatch('clearEpisodes')

    expect(store.getters.episodeValidationColumns).toEqual([])
  })

  test('reloads the stats of a TV show', async () => {
    const { store } = await buildStore({ isTVShow: () => true })
    client.pget.mockResolvedValueOnce({})

    await store.dispatch('resetEpisodeStats')

    expect(client.pget).toHaveBeenCalledWith(
      '/api/data/projects/p1/episodes/stats'
    )
  })

  test('tracks the selected task cells', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [
      { id: 'ep1', name: 'E01' },
      { id: 'ep2', name: 'E02' }
    ])
    store.state.episodes.episodeValidationColumns = ['tt-1', 'tt-2']
    const grid = () => [...store.getters.episodeSelectionGrid].sort()

    store.commit('ADD_SELECTED_TASK', { x: 0, y: 1 })
    store.commit('ADD_SELECTED_TASKS', [
      { x: 1, y: 0 },
      { x: 1, y: 1 }
    ])
    expect(grid()).toEqual(['0-1', '1-0', '1-1'])

    store.commit('REMOVE_SELECTED_TASK', { x: 0, y: 1 })
    store.commit('REMOVE_SELECTED_TASK', {
      task: { column: { id: 'tt-2' }, entity: { id: 'ep2' } }
    })
    expect(grid()).toEqual(['1-0'])

    store.commit('CLEAR_SELECTED_TASKS')
    expect(grid()).toEqual([])
  })

  test('adds a created task to its episode row', async () => {
    const taskTypeMap = new Map([
      ['tt-1', { id: 'tt-1', name: 'Layout', priority: 1 }]
    ])
    const taskStatusMap = new Map([
      ['ts-1', { id: 'ts-1', name: 'Todo', short_name: 'todo' }]
    ])
    const { store } = await buildStore()
    loadEpisodes(store, [{ id: 'ep1', name: 'E01' }])
    // An edit leaves a copy of the episode in the displayed list.
    store.commit('EDIT_EPISODE_END', { id: 'ep1', name: 'E01', data: {} })

    store.commit('NEW_TASK_END', {
      task: {
        id: 't1',
        entity_id: 'ep1',
        task_type_id: 'tt-1',
        task_status_id: 'ts-1'
      },
      taskTypeMap,
      taskStatusMap,
      production
    })

    const episode = store.getters.episodeMap.get('ep1')
    expect(episode.tasks).toEqual(['t1'])
    expect(episode.validations.get('tt-1')).toBe('t1')
    expect(store.getters.episodeValidationColumns).toEqual(['tt-1'])
    expect(store.getters.episodeFilledColumns['tt-1']).toBe(true)
    expect(store.getters.displayedEpisodes[0].validations.get('tt-1')).toBe(
      't1'
    )
  })

  test('renames a descriptor field in the episode data', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [{ id: 'ep1', name: 'E01', data: { level: 'hard' } }])
    const rename = entityType =>
      store.commit('UPDATE_METADATA_DESCRIPTOR_END', {
        descriptor: { entity_type: entityType, field_name: 'difficulty' },
        previousDescriptorFieldName: 'level'
      })

    rename('Shot')
    expect(store.getters.episodeMap.get('ep1').data).toEqual({ level: 'hard' })

    rename('Episode')
    expect(store.getters.episodeMap.get('ep1').data).toEqual({
      difficulty: 'hard'
    })
  })

  test('keeps the scroll position and clears the selected episodes', async () => {
    const { store } = await buildStore()
    store.state.episodes.selectedEpisodes.set('ep1', { id: 'ep1' })

    store.commit('SET_EPISODE_LIST_SCROLL_POSITION', 120)
    await store.dispatch('clearSelectedEpisodes')

    expect(store.getters.episodeListScrollPosition).toBe(120)
    expect(store.state.episodes.selectedEpisodes.size).toBe(0)
  })

  test('groups the episode options by status', async () => {
    const { store } = await buildStore()
    loadEpisodes(store, [
      { id: 'ep1', name: 'E01', status: 'complete' },
      { id: 'ep2', name: 'E02', status: 'running' },
      { id: 'ep3', name: 'E03', status: 'unknown' },
      { id: 'ep4', name: 'E04', status: 'canceled' }
    ])

    expect(store.getters.isEpisodeListLoaded).toBe(true)
    expect(names(store.getters.runningEpisodes)).toEqual(['E02', 'E03'])
    expect(store.getters.episodeOptionGroups).toEqual([
      {
        name: 'running',
        episodeList: [
          { label: 'E02', value: 'ep2' },
          { label: 'E03', value: 'ep3' }
        ]
      },
      { name: 'complete', episodeList: [{ label: 'E01', value: 'ep1' }] },
      { name: 'canceled', episodeList: [{ label: 'E04', value: 'ep4' }] }
    ])
  })

  test('deletes the tasks of a type, of the selection only', async () => {
    const deleteAllTasks = vi.fn()
    const { store } = await buildStore({}, { deleteAllTasks })
    loadEpisodes(store, [
      { id: 'ep1', name: 'E01', validations: new Map([['tt-1', 't1']]) },
      { id: 'ep2', name: 'E02', validations: new Map() }
    ])

    await store.dispatch('deleteAllEpisodeTasks', {
      projectId: 'p1',
      taskTypeId: 'tt-1',
      selectionOnly: true
    })
    await store.dispatch('deleteAllEpisodeTasks', {
      projectId: 'p1',
      taskTypeId: 'tt-1'
    })

    expect(deleteAllTasks.mock.calls.map(([, payload]) => payload)).toEqual([
      { projectId: 'p1', taskTypeId: 'tt-1', taskIds: ['t1'] },
      { projectId: 'p1', taskTypeId: 'tt-1', taskIds: undefined }
    ])
  })

  test('loads the episodes of another production', async () => {
    const { store } = await buildStore()
    const other = { id: 'p2' }
    shotsApi.getEpisodes.mockResolvedValueOnce([{ id: 'ep9' }])

    expect(await store.dispatch('loadProductionEpisodes', other)).toEqual([
      { id: 'ep9' }
    ])
    expect(shotsApi.getEpisodes).toHaveBeenCalledWith(other)
    expect(store.getters.episodes).toEqual([])
  })
})
