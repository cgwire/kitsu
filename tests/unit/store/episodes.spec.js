// @vitest-environment node

import { vi } from 'vitest'
import { computed, reactive } from 'vue'

// Importing the episodes module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/store/api/shots', () => ({ default: { getEpisodes: vi.fn() } }))

import shotsApi from '@/store/api/shots'
import episodesStore from '@/store/modules/episodes'

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
