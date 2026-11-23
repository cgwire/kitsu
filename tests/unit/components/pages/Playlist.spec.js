import { flushPromises, shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
const routeHolder = vi.hoisted(() => ({ route: null, router: null }))
vi.mock('vue-router', () => ({
  useRoute: () => routeHolder.route,
  useRouter: () => routeHolder.router
}))

import '@/lib/auth'
import errors from '@/lib/errors'
import { getPlaylistListKey } from '@/lib/playlist'
import playlistsApi from '@/store/api/playlists'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import playlistStore from '@/store/modules/playlists'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

import Playlist from '@/components/pages/Playlist.vue'
import PlaylistPlayer from '@/components/players/players/PlaylistPlayer.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'

import { recordUnhandledRejections } from '../../fixtures/unhandled-rejections'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

beforeEach(() => {
  localStorage.removeItem('playlist-sort')
  routeHolder.route = reactive({ params: {}, query: {}, fullPath: '/' })
  routeHolder.router = { push: vi.fn() }
})

// The page mounted last, for the actions that leave it during its first run.
let mountedWrapper = null

// The page is mounted on a store whose scope (production, episode) the tests
// move, as the topbar does. Its first reload runs on the tick after the mount.
const mountPage = async ({
  state = {},
  actions = {},
  getters = {},
  mutations = {},
  query = {},
  params = {},
  stubs = {}
} = {}) => {
  Object.assign(routeHolder.route, { query, params })
  const resolved = () => vi.fn(() => Promise.resolve())
  const storeActions = {
    addEntitiesToPlaylist: resolved(),
    displayMoreAssets: vi.fn(),
    displayMoreShots: vi.fn(),
    loadAssets: resolved(),
    loadEdits: resolved(),
    loadEpisodes: resolved(),
    loadEpisodesWithTasks: resolved(),
    loadMorePlaylists: vi.fn(() => Promise.resolve([])),
    loadPlaylist: resolved(),
    loadPlaylistShareLinks: vi.fn(() => Promise.resolve([])),
    loadPlaylists: resolved(),
    loadShots: resolved(),
    resetSequences: vi.fn(),
    setAssetSearch: vi.fn(),
    setEditSearch: vi.fn(),
    setEpisodeSearch: vi.fn(),
    setSequenceSearch: vi.fn(),
    setShotSearch: vi.fn(),
    ...actions
  }
  const fromState = name => state => state[name]
  const store = createStore({
    state: () => ({
      currentEpisode: { id: 'ep-a' },
      currentProduction: { id: 'p1' },
      displayedEpisodes: [],
      editsLoadingKey: 'p1/',
      isEditsLoading: false,
      isEpisodeListLoadedWithTasks: false,
      isShotsLoading: false,
      isTVShow: false,
      playlists: [],
      shotsLoadingKey: 'p1/',
      ...state
    }),
    getters: {
      assetSearchText: () => '',
      currentEpisode: fromState('currentEpisode'),
      currentProduction: fromState('currentProduction'),
      dateFormat: () => 'YYYY-MM-DD',
      displayedAssets: () => [],
      displayedAssetsByType: () => [],
      displayedEdits: () => [],
      displayedEpisodes: fromState('displayedEpisodes'),
      displayedSequences: () => [],
      displayedShots: () => [],
      displayedShotsBySequence: () => [],
      editSearchText: () => '',
      editsLoadingKey: fromState('editsLoadingKey'),
      episodeSearchText: () => '',
      isAssetsLoading: () => false,
      isCurrentUserClient: () => false,
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      isEditsLoading: fromState('isEditsLoading'),
      isEpisodeListLoadedWithTasks: fromState('isEpisodeListLoadedWithTasks'),
      isEpisodesLoading: () => false,
      isShotsLoading: fromState('isShotsLoading'),
      isTVShow: fromState('isTVShow'),
      playlistMap: () => new Map(),
      playlists: fromState('playlists'),
      playlistsPath: () => ({ name: 'playlists' }),
      productionTaskTypes: () => [],
      sequenceSearchText: () => '',
      shotSearchText: () => '',
      shotsLoadingKey: fromState('shotsLoadingKey'),
      taskMap: () => new Map(),
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(),
      use12HourClock: () => false,
      ...getters
    },
    mutations: {
      DELETE_PLAYLIST_END: () => {},
      LOAD_PLAYLISTS_END: (state, playlists) => {
        state.playlists = playlists
      },
      ...mutations
    },
    actions: storeActions
  })
  const socket = { on: vi.fn(), off: vi.fn() }
  const wrapper = shallowMount(Playlist, {
    global: {
      plugins: [store],
      config: { globalProperties: { $socket: socket } },
      directives: { focus: () => {} },
      stubs: { RouterLink: true, SearchField: false, ...stubs }
    }
  })
  mountedWrapper = wrapper
  await nextTick()
  return { wrapper, store, actions: storeActions, socket }
}

// Moves the scope of the store and lets the page watchers see it.
const moveScope = async (store, scope) => {
  Object.assign(store.state, scope)
  await nextTick()
}

// Only the next call is held back: the queued run must complete.
const gateNextCall = fn => {
  let release
  fn.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        release = resolve
      })
  )
  return value => release(value)
}

const gatedAction = () => {
  const fn = vi.fn(() => Promise.resolve())
  return { fn, release: gateNextCall(fn) }
}

// The next call fails once released, as a request Zou refuses.
const gatedFailure = () => {
  let fail
  const fn = vi.fn(() => Promise.resolve())
  fn.mockImplementationOnce(
    () =>
      new Promise((_resolve, reject) => {
        fail = reject
      })
  )
  return { fn, fail: error => fail(error) }
}

const lastPayload = action => action.mock.calls.at(-1)[1]

const changeSort = (wrapper, sort) =>
  wrapper.findComponent(Combobox).vm.$emit('update:modelValue', sort)

describe('Playlist page, stale playlist list', () => {
  const playlist = fields => ({
    id: 'pl-1',
    name: 'Playlist',
    updated_at: '2026-01-01T00:00:00',
    project_id: 'p1',
    episode_id: null,
    ...fields
  })
  const allShots = playlist({ is_for_all: true, for_entity: 'shot' })
  const allAssets = playlist({ is_for_all: true, for_entity: 'asset' })
  const allEpisodes = playlist({ is_for_all: true, for_entity: 'episode' })
  const episodeOne = playlist({ episode_id: 'ep-1', for_entity: 'shot' })
  const shotQuery = { for_entity: 'shot' }
  const episodeQuery = { for_entity: 'episode' }

  // The store keeps the last loaded list across pages: it is fetched again
  // on mount only when it belongs to another scope.
  it.each([
    // Coming back to All assets after a visit of the All shots playlists.
    ['another all-mode entity type', allShots, 'all', {}, 'p1', true],
    ['the all assets list', allAssets, 'all', {}, 'p1', false],
    ['the all shots list', allShots, 'all', shotQuery, 'p1', false],
    ['the all episodes list', allEpisodes, 'all', episodeQuery, 'p1', false],
    ['all episodes under all assets', allEpisodes, 'all', {}, 'p1', true],
    ['another episode', episodeOne, 'ep-2', {}, 'p1', true],
    ['the displayed episode', episodeOne, 'ep-1', {}, 'p1', false],
    ['the all pack on an episode', allAssets, 'ep-1', {}, 'p1', true],
    ['the all pack on the main pack', allAssets, 'main', {}, 'p1', true],
    ['an episode on the all pack', episodeOne, 'all', shotQuery, 'p1', true],
    ['another production', episodeOne, 'ep-1', {}, 'p2', true]
  ])(
    'with a stored list of %s',
    async (_, stored, episodeId, query, productionId, isReloaded) => {
      const { actions } = await mountPage({
        query,
        state: {
          isTVShow: true,
          currentEpisode: { id: episodeId },
          currentProduction: { id: productionId },
          playlists: [stored]
        }
      })
      await flushPromises()

      expect(actions.loadPlaylists).toHaveBeenCalledTimes(isReloaded ? 1 : 0)
    }
  )
})

describe.each([
  ['loadEdits', 'editsLoadingKey', 'isEditsLoading'],
  ['loadShots', 'shotsLoadingKey', 'isShotsLoading']
])('Playlist page, %s on mount', (action, loadingKey, isLoading) => {
  const mountOn = async state => {
    const { actions } = await mountPage({
      state: {
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        [loadingKey]: 'p1/ep-a',
        ...state
      }
    })
    await flushPromises()
    return actions[action]
  }

  // Only the scope the store recorded tells the datasets apart: the first
  // row of a production-wide dataset can belong to the displayed episode.
  it('reloads when the store holds the production-wide dataset', async () => {
    expect(await mountOn({ [loadingKey]: 'p1/all' })).toHaveBeenCalled()
  })

  it('reloads when the store holds another episode', async () => {
    expect(await mountOn({ currentEpisode: { id: 'ep-b' } })).toHaveBeenCalled()
  })

  // Also covers an episode loaded without any entity: the key alone decides.
  it('keeps the dataset loaded for the displayed episode', async () => {
    expect(await mountOn({})).not.toHaveBeenCalled()
  })

  // The load start records the key and empties the map: a load in flight
  // for the displayed scope must still be awaited, or the playlist is
  // rebuilt against an empty map.
  it('awaits a load in flight for the displayed episode', async () => {
    expect(await mountOn({ [isLoading]: true })).toHaveBeenCalled()
  })

  it('keeps the dataset of a production without episodes', async () => {
    const loader = await mountOn({
      isTVShow: false,
      currentEpisode: null,
      [loadingKey]: 'p1/'
    })

    expect(loader).not.toHaveBeenCalled()
  })
})

describe('Playlist page, loadEpisodesData', () => {
  // Episode playlists resolve their entries' tasks through taskMap and the
  // status dots through validations: the selector list has neither, only
  // episodes loaded with their tasks carry both.
  const mountOn = async state => {
    const { actions } = await mountPage({
      state: {
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        ...state
      }
    })
    await flushPromises()
    return actions
  }

  it('loads the episodes with their tasks on mount', async () => {
    const actions = await mountOn({})
    expect(actions.loadEpisodesWithTasks).toHaveBeenCalledTimes(1)
  })

  // The selector or a socket event may have filled the list first: plain
  // episodes carry no validations and the load upgrades them.
  it('upgrades a list loaded without the tasks', async () => {
    const actions = await mountOn({
      displayedEpisodes: [{ id: 'ep-a', project_id: 'p1' }]
    })
    expect(actions.loadEpisodesWithTasks).toHaveBeenCalledTimes(1)
  })

  it('keeps the list already loaded with its tasks', async () => {
    const actions = await mountOn({
      isEpisodeListLoadedWithTasks: true,
      displayedEpisodes: [
        { id: 'ep-a', project_id: 'p1', validations: new Map() }
      ]
    })
    expect(actions.loadEpisodesWithTasks).not.toHaveBeenCalled()
  })

  it('replaces the list of another production', async () => {
    const actions = await mountOn({
      isEpisodeListLoadedWithTasks: true,
      displayedEpisodes: [
        { id: 'ep-x', project_id: 'p2', validations: new Map() }
      ]
    })
    expect(actions.loadEpisodesWithTasks).toHaveBeenCalledTimes(1)
  })

  it('loads no episodes outside TV shows', async () => {
    const actions = await mountOn({ isTVShow: false, currentEpisode: null })
    expect(actions.loadEpisodesWithTasks).not.toHaveBeenCalled()
  })
})

describe('Playlist page, loadShots under a pseudo-episode', () => {
  const shotQuery = { for_entity: 'shot' }

  const mountOn = async (episodeId, query, state = {}) => {
    const { actions } = await mountPage({
      query,
      state: {
        isTVShow: true,
        currentEpisode: { id: episodeId },
        shotsLoadingKey: 'p1/ep-a',
        ...state
      }
    })
    await flushPromises()
    return actions.loadShots
  }

  it.each([
    ['the main pack', 'main', {}],
    ['all assets', 'all', {}],
    ['all episodes', 'all', { for_entity: 'episode' }]
  ])('loads nothing for %s', async (_, episodeId, query) => {
    expect(await mountOn(episodeId, query)).not.toHaveBeenCalled()
  })

  // Its playlists hold the shots of every episode.
  it('loads the shots of the whole production for all shots', async () => {
    expect(await mountOn('all', shotQuery)).toHaveBeenCalledTimes(1)
  })

  it('keeps the production-wide dataset for all shots', async () => {
    const loader = await mountOn('all', shotQuery, { shotsLoadingKey: 'p1/all' })

    expect(loader).not.toHaveBeenCalled()
  })

  it('loads the shots when the topbar moves an episode to all shots', async () => {
    const { store, actions } = await mountPage({
      state: { isTVShow: true, shotsLoadingKey: 'p1/ep-a' }
    })
    await flushPromises()
    routeHolder.route.query = shotQuery
    await moveScope(store, { currentEpisode: { id: 'all' } })
    await flushPromises()

    expect(actions.loadShots).toHaveBeenCalledTimes(1)
  })

  it('loads the shots when all assets turns to all shots', async () => {
    const loader = await mountOn('all', {})
    routeHolder.route.query = shotQuery
    await flushPromises()

    expect(loader).toHaveBeenCalledTimes(1)
  })

  describe('entries of several episodes', () => {
    const shots = [
      { id: 'e1-s1', name: 'SH010', episode_name: 'E01' },
      { id: 'e2-s1', name: 'SH010', episode_name: 'E02' }
    ]

    afterEach(() => shots.forEach(({ id }) => shotStore.cache.shotMap.delete(id)))

    it('shows the entries of every episode for all shots', async () => {
      const loadShots = vi.fn(() => {
        shots.forEach(shot => shotStore.cache.shotMap.set(shot.id, shot))
        return Promise.resolve()
      })
      const { wrapper } = await openPlaylist(
        {
          for_entity: 'shot',
          is_for_all: true,
          shots: shots.map(({ id }) => ({ id, preview_files: {} }))
        },
        {
          query: shotQuery,
          state: {
            isTVShow: true,
            currentEpisode: { id: 'all' },
            shotsLoadingKey: 'p1/ep-a'
          },
          actions: { loadShots }
        }
      )
      await flushPromises()

      const entities = wrapper.findComponent(PlaylistPlayer).props('entities')
      expect(entities.map(({ id }) => id)).toEqual(['e1-s1', 'e2-s1'])
    })
  })
})

describe('Playlist page, reload gate', () => {
  // The shots of the store belong to another scope: every run loads them.
  const staleShots = { shotsLoadingKey: 'other' }

  // The currentEpisode watcher asks for a reload while a previous run is
  // still fetching: that call used to be dropped, leaving the page on the
  // episode the running load was started for.
  it('runs again once when the scope moved during a load', async () => {
    const shots = gatedAction()
    const { store, actions } = await mountPage({
      state: staleShots,
      actions: { loadShots: shots.fn }
    })

    await moveScope(store, { currentEpisode: { id: 'ep-b' } })
    await moveScope(store, { currentProduction: { id: 'p1' } })
    shots.release()
    await flushPromises()

    expect(actions.loadPlaylists).toHaveBeenCalledTimes(2)
  })

  // A request the running load already serves must not cost a second run.
  it('does not replay a request the run already served', async () => {
    const shots = gatedAction()
    const { store, actions } = await mountPage({
      state: staleShots,
      actions: { loadShots: shots.fn }
    })

    await moveScope(store, { currentProduction: { id: 'p1' } })
    shots.release()
    await flushPromises()

    expect(actions.loadPlaylists).toHaveBeenCalledTimes(1)
  })

  // On a TV show the run resolves the episode itself, which fires the
  // currentEpisode watcher: that request is served by the same run.
  it('does not replay the episode its own load resolved', async () => {
    const loadEpisodes = vi.fn(({ state }) => {
      state.currentEpisode = { id: 'ep-a' }
      return Promise.resolve()
    })
    const { actions } = await mountPage({
      state: {
        isTVShow: true,
        currentEpisode: null,
        displayedEpisodes: [{ id: 'ep-a', project_id: 'p1' }]
      },
      actions: { loadEpisodes }
    })
    await flushPromises()

    expect(loadEpisodes).toHaveBeenCalledTimes(1)
    expect(actions.loadPlaylists).toHaveBeenCalledTimes(1)
  })

  // Two switches inside one run: the run ends on the scope it started with,
  // but the loads made in between may have served the other one, and the
  // run cannot tell which. Replay.
  it('runs again when the scope moved and came back during a load', async () => {
    const assets = gatedAction()
    const { store, actions } = await mountPage({
      actions: { loadAssets: assets.fn }
    })
    await flushPromises()

    await moveScope(store, { currentEpisode: { id: 'ep-b' } })
    await moveScope(store, { currentEpisode: { id: 'ep-a' } })
    assets.release()
    await flushPromises()

    expect(actions.loadPlaylists).toHaveBeenCalledTimes(2)
  })

  // A run in flight when the page unmounts must not load further: the next
  // load would blank the page displayed instead.
  it('stops the run once the page is unmounted', async () => {
    const loadShots = vi.fn(() => {
      mountedWrapper.unmount()
      return Promise.resolve()
    })
    const { actions } = await mountPage({
      state: staleShots,
      actions: { loadShots }
    })
    await flushPromises()

    expect(loadShots).toHaveBeenCalledTimes(1)
    expect(actions.loadAssets).not.toHaveBeenCalled()
    expect(actions.loadPlaylists).not.toHaveBeenCalled()
  })

  it('runs once when nothing interrupts it', async () => {
    const { actions } = await mountPage()
    await flushPromises()

    expect(actions.loadPlaylists).toHaveBeenCalledTimes(1)
  })

  it('skips the queued run once the page is unmounted', async () => {
    const playlists = gatedAction()
    const { wrapper, store } = await mountPage({
      actions: { loadPlaylists: playlists.fn }
    })
    // Let the run reach the gated playlists load before leaving the page.
    await flushPromises()

    await moveScope(store, { currentEpisode: { id: 'ep-b' } })
    wrapper.unmount()
    playlists.release()
    await flushPromises()

    expect(playlists.fn).toHaveBeenCalledTimes(1)
  })

  // The sort watcher reloads the playlists on its own: a request received
  // during that run must be served too, or it stays pending forever.
  it('serves an episode change requested during a sort reload', async () => {
    const { wrapper, store, actions } = await mountPage({ state: staleShots })
    await flushPromises()
    const release = gateNextCall(actions.loadPlaylists)

    changeSort(wrapper, 'name')
    await nextTick()
    await moveScope(store, { currentEpisode: { id: 'ep-b' } })
    release()
    await flushPromises()

    expect(actions.loadShots).toHaveBeenCalledTimes(2)
    expect(actions.loadPlaylists).toHaveBeenCalledTimes(3)
  })

  // A sort change queued behind a run must still fetch: the replay cannot
  // rely on the list looking stale.
  it('fetches the playlists again when a sort change was queued', async () => {
    const shots = gatedAction()
    const stored = { id: 'pl-1', name: 'Playlist', project_id: 'p1' }
    const { wrapper, actions } = await mountPage({
      state: { ...staleShots, playlists: [stored] },
      actions: { loadShots: shots.fn }
    })

    changeSort(wrapper, 'name')
    await nextTick()
    shots.release()
    await flushPromises()

    expect(actions.loadPlaylists).toHaveBeenCalledTimes(1)
    expect(lastPayload(actions.loadPlaylists)).toMatchObject({ sortBy: 'name' })
  })

  it('reloads the list through the gate when the task type filter changes', async () => {
    const { wrapper, actions } = await mountPage()
    await flushPromises()

    wrapper.findComponent(ComboboxTaskType).vm.$emit('update:modelValue', 'tt-1')
    await flushPromises()

    expect(actions.loadPlaylists).toHaveBeenCalledTimes(2)
    expect(actions.loadAssets).toHaveBeenCalledTimes(1)
    expect(lastPayload(actions.loadPlaylists)).toMatchObject({
      taskTypeId: 'tt-1'
    })
  })

  // A filter reloads from the first page: asking for the page reached before
  // returns nothing when fewer playlists match.
  it('reloads the list from the first page when the sort changes', async () => {
    const { wrapper, actions } = await mountPage()
    await flushPromises()
    await wrapper.find('.playlist-list-column').trigger('scroll')
    expect(lastPayload(actions.loadMorePlaylists)).toMatchObject({ page: 2 })

    changeSort(wrapper, 'name')
    await flushPromises()

    expect(lastPayload(actions.loadPlaylists)).toMatchObject({ page: 1 })
  })
})

describe('Playlist page, list loading error', () => {
  it('shows the error of a failed load until the next load succeeds', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountPage({
      actions: {
        loadMorePlaylists: vi.fn(() => Promise.reject(new Error('down')))
      }
    })
    await flushPromises()
    expect(wrapper.findComponent(ErrorText).exists()).toBe(false)

    await wrapper.find('.playlist-list-column').trigger('scroll')
    await flushPromises()
    expect(wrapper.findComponent(ErrorText).exists()).toBe(true)

    changeSort(wrapper, 'name')
    await flushPromises()
    expect(wrapper.findComponent(ErrorText).exists()).toBe(false)
  })
})

describe('Playlist page, failed reload', () => {
  // The topbar clears the episode of the TV show it switches to: the run
  // loads the episodes first.
  const switchProduction = async loadEpisodes => {
    const page = await mountPage({ state: { isTVShow: true } })
    await flushPromises()
    page.actions.loadEpisodes.mockImplementationOnce(loadEpisodes)
    await moveScope(page.store, {
      currentProduction: { id: 'p2' },
      currentEpisode: null
    })
    await flushPromises()
    return page
  }

  const requestFailure = () => {
    const failure = new Error('Request has been terminated')
    errors.markRequestFailure(failure)
    return failure
  }

  it('logs a failed load of the episodes after a production switch', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('Request has been terminated')
    errors.markRequestFailure(failure)

    const rejections = await recordUnhandledRejections(() =>
      switchProduction(() => Promise.reject(failure))
    )

    expect(rejections).toEqual([])
    expect(consoleError).toHaveBeenCalledWith(failure)
  })

  it('leaves a bug in the reload to Sentry', async () => {
    const bug = new TypeError('Cannot read properties of undefined')

    const rejections = await recordUnhandledRejections(() =>
      switchProduction(() => Promise.reject(bug))
    )

    expect(rejections).toEqual([bug])
  })

  it('logs a failed load of the playlists once', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('Request has been terminated')
    errors.markRequestFailure(failure)

    await mountPage({
      actions: { loadPlaylists: vi.fn(() => Promise.reject(failure)) }
    })
    await flushPromises()

    const logged = consoleError.mock.calls.filter(([err]) => err === failure)
    expect(logged).toHaveLength(1)
  })

  // The switch emptied the list: it must not pass for a production without
  // playlists.
  it('shows the loading error instead of an empty production', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const { wrapper } = await switchProduction(() =>
      Promise.reject(requestFailure())
    )

    expect(wrapper.findComponent(ErrorText).exists()).toBe(true)
    const center = wrapper.find('.no-selection')
    expect(center.exists()).toBe(true)
    expect(center.findComponent({ name: 'Spinner' }).exists()).toBe(false)
    expect(center.find('.empty-explanation').exists()).toBe(false)
    expect(center.find('button.big').exists()).toBe(false)
  })

  it('clears the loading error once a reload succeeds', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper, store } = await switchProduction(() =>
      Promise.reject(requestFailure())
    )
    expect(wrapper.findComponent(ErrorText).exists()).toBe(true)

    await moveScope(store, {
      currentProduction: { id: 'p3' },
      currentEpisode: { id: 'ep-c' }
    })
    await flushPromises()

    expect(wrapper.findComponent(ErrorText).exists()).toBe(false)
  })

  // The columns wait for the first run: a failed one must not keep them
  // on their spinner.
  it('shows the loading error of a failed first load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const { wrapper } = await mountPage({
      state: { shotsLoadingKey: 'other' },
      actions: { loadShots: vi.fn(() => Promise.reject(requestFailure())) }
    })
    await flushPromises()

    expect(wrapper.findComponent(ErrorText).exists()).toBe(true)
    expect(wrapper.findAllComponents({ name: 'Spinner' })).toHaveLength(0)
  })
})

// Mounts the page on an empty playlist, which opens the addition panel.
const openPlaylist = (playlist = {}, options = {}) => {
  const stored = {
    id: 'pl-1',
    name: 'Playlist',
    project_id: 'p1',
    shots: [],
    ...playlist
  }
  return mountPage({
    ...options,
    params: { playlist_id: stored.id },
    state: { playlists: [stored], ...options.state },
    getters: {
      playlistMap: () => new Map([[stored.id, stored]]),
      ...options.getters
    },
    actions: {
      loadPlaylist: vi.fn(() => Promise.resolve(stored)),
      ...options.actions
    }
  })
}

describe('Playlist page, deletion navigation', () => {
  it('opens the remaining playlist in the all episodes scope', async () => {
    const scope = { is_for_all: true, for_entity: 'episode' }
    const remaining = { id: 'pl-2', project_id: 'p1', ...scope }
    const { store, wrapper } = await openPlaylist(scope, {
      query: { for_entity: 'episode' },
      state: { isTVShow: true, currentEpisode: { id: 'all' } }
    })
    await flushPromises()
    store.commit('LOAD_PLAYLISTS_END', [remaining])
    wrapper.findComponent(PlaylistPlayer).vm.$emit('playlist-deleted')

    expect(routeHolder.router.push).toHaveBeenCalledWith({
      name: 'episode-playlist',
      params: { production_id: 'p1', episode_id: 'all', playlist_id: 'pl-2' },
      query: { for_entity: 'episode' }
    })
  })
})

describe('Playlist page, addition buttons', () => {
  it('does not offer shot builds for an episode playlist', async () => {
    const { wrapper } = await openPlaylist({ for_entity: 'episode' })
    await flushPromises()

    const labels = wrapper.findAll('button').map(button => button.text())
    expect(labels).not.toContain('playlists.build_daily')
    expect(labels).not.toContain('playlists.build_weekly')
  })

  it('shows the weekly build as loading on its own button', async () => {
    const pending = gatedAction()
    const { wrapper } = await openPlaylist(
      {},
      { actions: { getPendingShots: pending.fn } }
    )
    await flushPromises()
    const button = label =>
      wrapper.findAll('button').find(b => b.text() === label)

    await button('playlists.build_weekly').trigger('click')

    expect(button('playlists.build_weekly').classes()).toContain('is-loading')
    expect(button('playlists.build_daily').classes()).not.toContain(
      'is-loading'
    )
    pending.release([])
    await flushPromises()
  })

  // Under All shots, the loaded shots are those of the whole production, and
  // the main pack loads none of its own.
  it.each([
    [
      'all shots',
      { isTVShow: true, currentEpisode: { id: 'all' } },
      { for_entity: 'shot' },
      []
    ],
    ['the main pack', { isTVShow: true, currentEpisode: { id: 'main' } }, {}, []],
    ['an episode', { isTVShow: true }, {}, ['playlists.add_episode']],
    ['a movie', { isTVShow: false }, {}, ['playlists.add_movie']]
  ])('offers the entire additions for %s', async (_, state, query, labels) => {
    const { wrapper } = await openPlaylist(
      { for_entity: 'shot' },
      { state, query }
    )
    await flushPromises()
    const additions = [
      'playlists.build_daily',
      'playlists.build_weekly',
      'playlists.add_episode',
      'playlists.add_movie'
    ]
    const offered = wrapper
      .findAll('button')
      .map(button => button.text())
      .filter(text => additions.includes(text))

    expect(offered).toEqual([
      'playlists.build_daily',
      'playlists.build_weekly',
      ...labels
    ])
  })

  describe('loaded shots', () => {
    const shot = (id, name) => ({ id, name, sequence_name: 'SQ01' })
    const fillShotMap = shots => {
      shotStore.cache.shotMap.clear()
      shots.forEach(entry => shotStore.cache.shotMap.set(entry.id, entry))
    }
    // The page scrolls the player to the end after an addition.
    const playerStub = {
      template: '<div />',
      methods: { scrollToRight: () => {} }
    }
    const openWithButton = async (label, state) => {
      const { wrapper, actions } = await openPlaylist(
        {},
        { state, stubs: { PlaylistPlayer: playerStub } }
      )
      await flushPromises()
      const click = async () => {
        await wrapper
          .findAll('button')
          .find(b => b.text() === label)
          .trigger('click')
        await flushPromises()
      }
      const addedIds = () =>
        actions.addEntitiesToPlaylist.mock.calls.map(
          ([, { entityIds }]) => entityIds
        )
      return { click, addedIds }
    }

    afterEach(() => shotStore.cache.shotMap.clear())

    // The shot map is reloaded in place for each episode: the button adds
    // the shots of the episode shown, not those of its first click.
    it('adds the shots of the episode loaded at the time of each click', async () => {
      fillShotMap([shot('e1-20', 'SH020'), shot('e1-10', 'SH010')])
      const { click, addedIds } = await openWithButton(
        'playlists.add_episode',
        { isTVShow: true }
      )

      await click()
      fillShotMap([shot('e2-10', 'SH010')])
      await click()

      expect(addedIds()).toEqual([['e1-10', 'e1-20'], ['e2-10']])
    })

    it('adds the shots of the movie', async () => {
      fillShotMap([shot('s-20', 'SH020'), shot('s-10', 'SH010')])
      const { click, addedIds } = await openWithButton(
        'playlists.add_movie',
        { isTVShow: false }
      )

      await click()

      expect(addedIds()).toEqual([['s-10', 's-20']])
    })
  })
})

describe('Playlist page, search of the addition panel', () => {
  const searchText = wrapper => wrapper.find('.search-input').element.value
  const searches = {
    assetSearchText: () => 'asset search',
    editSearchText: () => 'edit search',
    episodeSearchText: () => 'episode search',
    sequenceSearchText: () => 'sequence search',
    shotSearchText: () => 'shot search'
  }
  const addSelectionButton = wrapper =>
    wrapper
      .findAll('button')
      .find(button => button.text() === 'playlists.add_selection')

  // The field goes with the panel, while the store keeps the text.
  it.each([
    ['shot', 'shot search'],
    ['asset', 'asset search'],
    ['sequence', 'sequence search'],
    ['edit', 'edit search'],
    ['episode', 'episode search']
  ])('shows the search of the %s entities', async (forEntity, search) => {
    const { wrapper } = await openPlaylist(
      { for_entity: forEntity },
      { getters: searches }
    )
    await flushPromises()

    expect(searchText(wrapper)).toBe(search)
  })

  // A load of a list drops its filter and keeps the text.
  it.each([
    ['shot', 'setShotSearch', 'shot search'],
    ['asset', 'setAssetSearch', 'asset search'],
    ['sequence', 'setSequenceSearch', 'sequence search'],
    ['edit', 'setEditSearch', 'edit search'],
    ['episode', 'setEpisodeSearch', 'episode search']
  ])(
    'applies the search of the %s entities again',
    async (forEntity, action, search) => {
      const { actions } = await openPlaylist(
        { for_entity: forEntity },
        { getters: searches }
      )
      await flushPromises()

      expect(actions[action]).toHaveBeenCalledTimes(1)
      expect(lastPayload(actions[action])).toBe(search)
    }
  )

  it('applies no search when the store has none', async () => {
    const { actions } = await openPlaylist()
    await flushPromises()

    expect(actions.setShotSearch).not.toHaveBeenCalled()
  })

  it.each([
    ['edit', 'setEditSearch'],
    ['episode', 'setEpisodeSearch']
  ])('filters the %s entities with the field', async (forEntity, action) => {
    const { wrapper, actions } = await openPlaylist({ for_entity: forEntity })
    await flushPromises()

    wrapper.findComponent({ name: 'SearchField' }).vm.$emit('change', 'typed')

    expect(lastPayload(actions[action])).toBe('typed')
    expect(actions.setShotSearch).not.toHaveBeenCalled()
  })

  it('offers no selection for the search of another type', async () => {
    const { wrapper } = await openPlaylist(
      { for_entity: 'sequence' },
      { getters: { shotSearchText: () => 'shot search' } }
    )
    await flushPromises()

    expect(addSelectionButton(wrapper)).toBeUndefined()
  })

  // The panel hides the canceled entities.
  it.each([
    ['shot', 'shotSearchText', 'displayedShots'],
    ['asset', 'assetSearchText', 'displayedAssets'],
    ['sequence', 'sequenceSearchText', 'displayedSequences'],
    ['edit', 'editSearchText', 'displayedEdits'],
    ['episode', 'episodeSearchText', 'displayedEpisodes']
  ])('adds the %s entities of the search', async (forEntity, search, list) => {
    const { wrapper, actions } = await openPlaylist(
      { for_entity: forEntity },
      {
        getters: {
          [list]: () => [
            { id: 'kept', name: 'Kept' },
            { id: 'gone', name: 'Gone', canceled: true }
          ],
          [search]: () => 'search'
        },
        stubs: {
          PlaylistPlayer: {
            template: '<div />',
            methods: { scrollToRight: () => {} }
          }
        }
      }
    )
    await flushPromises()

    await addSelectionButton(wrapper).trigger('click')
    await flushPromises()

    expect(lastPayload(actions.addEntitiesToPlaylist).entityIds).toEqual([
      'kept'
    ])
  })

  it.each([
    ['shot', 'displayMoreShots'],
    ['asset', 'displayMoreAssets']
  ])(
    'shows one more page of %s entities for a typed search only',
    async (forEntity, action) => {
      const { wrapper, actions } = await openPlaylist(
        { for_entity: forEntity },
        { getters: searches }
      )
      await flushPromises()
      expect(actions[action]).not.toHaveBeenCalled()

      wrapper.findComponent({ name: 'SearchField' }).vm.$emit('change', 'typed')

      expect(actions[action]).toHaveBeenCalledTimes(1)
    }
  )

  it('shows one more page for the search of the build filter', async () => {
    const { wrapper, actions } = await openPlaylist()
    await flushPromises()

    wrapper
      .findComponent({ name: 'BuildFilterModal' })
      .vm.$emit('confirm', 'filter search')

    expect(lastPayload(actions.setShotSearch)).toBe('filter search')
    expect(actions.displayMoreShots).toHaveBeenCalledTimes(1)
  })

  it('shows the search when the panel opens again', async () => {
    const { wrapper } = await openPlaylist({}, { getters: searches })
    await flushPromises()

    await wrapper.find('.addition-header .close-button').trigger('click')
    expect(wrapper.find('.search-input').exists()).toBe(false)
    wrapper.findComponent(PlaylistPlayer).vm.$emit('show-add-entities')
    await flushPromises()

    expect(searchText(wrapper)).toBe('shot search')
  })

  it('shows the search after a bulk addition that failed', async () => {
    const failure = new Error('down')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await openPlaylist(
      {},
      {
        getters: searches,
        actions: {
          addEntitiesToPlaylist: vi.fn(() => Promise.reject(failure)),
          getPendingShots: vi.fn(() =>
            Promise.resolve([{ id: 's9', name: 'SH900' }])
          )
        }
      }
    )
    await flushPromises()

    await wrapper
      .findAll('button')
      .find(button => button.text() === 'playlists.build_weekly')
      .trigger('click')
    await flushPromises()

    expect(searchText(wrapper)).toBe('shot search')
    expect(consoleError).toHaveBeenCalledWith(failure)
  })
})

describe('Playlist page, task status of the entities to add', () => {
  const edit = {
    id: 'e1',
    name: 'Edit',
    validations: new Map([['tt-1', 'task-1']])
  }
  const episode = { id: 'ep-1', name: 'E01' }

  beforeEach(() => {
    editStore.cache.editMap.set(edit.id, edit)
    episodeStore.cache.episodeMap.set(episode.id, episode)
  })
  afterEach(() => {
    editStore.cache.editMap.delete(edit.id)
    episodeStore.cache.episodeMap.delete(episode.id)
  })

  it('shows the status of an edit for the task type of the playlist', async () => {
    const { wrapper } = await openPlaylist(
      { for_entity: 'edit', task_type_id: 'tt-1' },
      {
        getters: {
          displayedEdits: () => [edit],
          taskMap: () => new Map([['task-1', { task_status_id: 'st-1' }]]),
          taskStatusMap: () =>
            new Map([['st-1', { name: 'Done', color: '#00ff00' }]])
        }
      }
    )
    await flushPromises()

    expect(wrapper.find('span[title="Done"]').exists()).toBe(true)
  })

  // The panel lists the episodes of the topbar, loaded without their tasks.
  it('shows an episode loaded without its tasks', async () => {
    const { wrapper } = await openPlaylist(
      { for_entity: 'episode', task_type_id: 'tt-1' },
      { state: { displayedEpisodes: [episode] } }
    )
    await flushPromises()

    expect(wrapper.find('.addition-shot').text()).toContain('E01')
  })
})

describe('Playlist page, displayed playlist', () => {
  it('loads the displayed playlist once per reload', async () => {
    const { wrapper, actions } = await openPlaylist()
    await flushPromises()
    expect(actions.loadPlaylist).toHaveBeenCalledTimes(1)

    changeSort(wrapper, 'name')
    await flushPromises()
    expect(actions.loadPlaylist).toHaveBeenCalledTimes(2)
  })
})

describe('Playlist page, reorder', () => {
  const ids = ['s1', 's2', 's3']

  const openEntries = async () => {
    ids.forEach(id =>
      shotStore.cache.shotMap.set(id, { id, name: id, sequence_name: 'SQ01' })
    )
    const { wrapper } = await openPlaylist(
      {
        shots: ids.map((id, index) => ({
          id,
          entity_id: id,
          preview_file_id: `pf-${index + 1}`,
          preview_files: {}
        }))
      },
      { actions: { changePlaylistOrder: vi.fn(() => Promise.resolve()) } }
    )
    await flushPromises()
    const player = wrapper.findComponent(PlaylistPlayer)
    return {
      player,
      entityIds: () => player.props('entities').map(entity => entity.id)
    }
  }

  afterEach(() => ids.forEach(id => shotStore.cache.shotMap.delete(id)))

  // The strip and the saved order move together. The list the page hands
  // the player has to move too: an addition or a removal hands it back, and
  // the strip would show the order of the load again. It moves in place: a
  // new list resets the player, in the whole review room.
  it('moves the entries it hands the player', async () => {
    const { player, entityIds } = await openEntries()
    const entities = player.props('entities')
    expect(entityIds()).toEqual(['s1', 's2', 's3'])

    // s1 goes right after s2.
    player.vm.$emit('order-change', {
      before: { entity_id: 's2', preview_file_id: 'pf-2' },
      after: { entity_id: 's1', preview_file_id: 'pf-1' }
    })
    await flushPromises()

    expect(entityIds()).toEqual(['s2', 's1', 's3'])

    // s3 goes right after s2, to the left.
    player.vm.$emit('order-change', {
      before: { entity_id: 's2', preview_file_id: 'pf-2' },
      after: { entity_id: 's3', preview_file_id: 'pf-3' }
    })
    await flushPromises()

    expect(entityIds()).toEqual(['s2', 's3', 's1'])
    expect(player.props('entities')).toBe(entities)
  })

  // A missing entry has no position: a splice at -1 would move another one.
  const known = { entity_id: 's2', preview_file_id: 'pf-2' }
  const missing = { entity_id: 's9', preview_file_id: 'pf-9' }

  it.each([
    ['moved', { before: known, after: missing }],
    ['reference', { before: missing, after: known }]
  ])('keeps the entries in place when the %s entry is missing', async (_, info) => {
    const { player, entityIds } = await openEntries()

    player.vm.$emit('order-change', info)
    await flushPromises()

    expect(entityIds()).toEqual(['s1', 's2', 's3'])
  })
})

describe('Playlist page, silent lock', () => {
  // The playlist:update events are ignored while the page saves. A failed
  // save must release the lock, or the page stays deaf to every update.
  it.each([
    ['preview-changed', 'changePlaylistPreview'],
    ['remove-entity', 'removeEntityPreviewFromPlaylist']
  ])('listens to the updates again after a failed %s', async (event, action) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { wrapper, actions, socket } = await openPlaylist(
      { shots: [{ id: 's1' }] },
      {
        actions: {
          [action]: vi.fn(() => Promise.reject(new Error('down'))),
          refreshPlaylist: vi.fn(() => Promise.resolve({ id: 'pl-1' }))
        }
      }
    )
    await flushPromises()
    const onPlaylistUpdate = socket.on.mock.calls.find(
      ([name]) => name === 'playlist:update'
    )[1]

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    wrapper.findComponent(PlaylistPlayer).vm.$emit(event, {
      entity: { id: 's1' },
      previewFileId: 'pf-2',
      previousPreviewFileId: 'pf-1'
    })
    await vi.advanceTimersByTimeAsync(2100)
    onPlaylistUpdate({ project_id: 'p1', playlist_id: 'pl-1' })

    expect(actions.refreshPlaylist).toHaveBeenCalledTimes(1)
  })

  // The lock lasts as long as the save: the reload of an update received
  // meanwhile would bring back the order the save replaces.
  it('ignores the updates until a reorder is saved', async () => {
    const { fn: changePlaylistOrder, release } = gatedAction()
    const { wrapper, actions, socket } = await openPlaylist(
      { shots: [{ id: 's1' }] },
      {
        actions: {
          changePlaylistOrder,
          refreshPlaylist: vi.fn(() => Promise.resolve({ id: 'pl-1' }))
        }
      }
    )
    await flushPromises()
    const onPlaylistUpdate = socket.on.mock.calls.find(
      ([name]) => name === 'playlist:update'
    )[1]

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    wrapper.findComponent(PlaylistPlayer).vm.$emit('order-change', {
      before: { entity_id: 's1', preview_file_id: 'pf-1' },
      after: { entity_id: 's2', preview_file_id: 'pf-2' }
    })
    await vi.advanceTimersByTimeAsync(2100)
    onPlaylistUpdate({ project_id: 'p1', playlist_id: 'pl-1' })

    expect(actions.refreshPlaylist).not.toHaveBeenCalled()

    release()
    await vi.advanceTimersByTimeAsync(2100)
    onPlaylistUpdate({ project_id: 'p1', playlist_id: 'pl-1' })

    expect(actions.refreshPlaylist).toHaveBeenCalledTimes(1)
  })

  // On an empty playlist, the store throws before it saves. The error still
  // goes to the app error handler, which reports it.
  it('listens to the updates again after a reorder that throws', async () => {
    const bug = new TypeError('Cannot read properties of undefined')
    const { wrapper, actions, socket } = await openPlaylist(
      { shots: [{ id: 's1' }] },
      {
        actions: {
          changePlaylistOrder: vi.fn(() => {
            throw bug
          }),
          refreshPlaylist: vi.fn(() => Promise.resolve({ id: 'pl-1' }))
        }
      }
    )
    await flushPromises()
    const errorHandler = vi.fn()
    wrapper.vm.$.appContext.config.errorHandler = errorHandler
    const onPlaylistUpdate = socket.on.mock.calls.find(
      ([name]) => name === 'playlist:update'
    )[1]

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    wrapper.findComponent(PlaylistPlayer).vm.$emit('order-change', {
      before: { entity_id: 's1', preview_file_id: 'pf-1' },
      after: { entity_id: 's2', preview_file_id: 'pf-2' }
    })
    await vi.advanceTimersByTimeAsync(2100)
    onPlaylistUpdate({ project_id: 'p1', playlist_id: 'pl-1' })

    expect(actions.refreshPlaylist).toHaveBeenCalledTimes(1)
    expect(errorHandler.mock.calls.map(([error]) => error)).toEqual([bug])
  })
})

// An entity dropped from the addition panel on the player: the page adds it,
// then replays the drop on the player to move the new entry where it was
// dropped.
describe('Playlist page, entity dropped on the player', () => {
  const dropped = { id: 'sh-new', name: 'SH900', sequence_name: 'SQ01' }
  const drop = () => ({
    before: { entity_id: 's1', preview_file_id: 'pf-1' },
    after: { entity_id: 'sh-new', preview_file_id: '' }
  })

  // Each load answers a new object, as the API does.
  const openDropTarget = async ({
    onEntityDropped,
    loadEntityPreviewFiles = vi.fn(() => Promise.resolve([])),
    getters = {}
  }) => {
    shotStore.cache.shotMap.set(dropped.id, dropped)
    const stored = new Map([
      ['pl-1', { id: 'pl-1', name: 'A', project_id: 'p1', shots: [{ id: 's1' }] }],
      ['pl-2', { id: 'pl-2', name: 'B', project_id: 'p1', shots: [{ id: 's2' }] }]
    ])
    const page = await openPlaylist(stored.get('pl-1'), {
      state: { playlists: [...stored.values()] },
      getters: { playlistMap: () => stored, ...getters },
      actions: {
        loadEntityPreviewFiles,
        loadPlaylist: vi.fn((context, { id }) =>
          Promise.resolve({ ...stored.get(id) })
        ),
        pushEntityToPlaylist: vi.fn((context, { entity }) =>
          Promise.resolve({ ...entity, preview_file_id: 'pf-new' })
        ),
        refreshPlaylist: vi.fn(() => Promise.resolve({ id: 'pl-1' }))
      },
      stubs: {
        PlaylistPlayer: {
          name: 'PlaylistPlayer',
          template: '<div />',
          methods: { onEntityDropped, scrollToRight: () => {} }
        }
      }
    })
    await flushPromises()
    const dropOnPlayer = () =>
      page.wrapper
        .findComponent({ name: 'PlaylistPlayer' })
        .vm.$emit('new-entity-dropped', drop())
    return { ...page, dropOnPlayer }
  }

  afterEach(() => shotStore.cache.shotMap.delete(dropped.id))

  it('moves the new entry where it was dropped', async () => {
    const onEntityDropped = vi.fn()
    const { dropOnPlayer } = await openDropTarget({ onEntityDropped })

    dropOnPlayer()
    await flushPromises()

    expect(onEntityDropped).toHaveBeenCalledWith({
      before: { entity_id: 's1', preview_file_id: 'pf-1' },
      after: { entity_id: 'sh-new', preview_file_id: 'pf-new' }
    })
  })

  // The strip is no longer the one of the drop: a strip loaded meanwhile may
  // lack the new entry, and the player would drop it again, on the playlist
  // shown.
  it.each([
    [
      'another playlist loaded',
      () =>
        Object.assign(routeHolder.route, {
          params: { playlist_id: 'pl-2' },
          fullPath: '/pl-2'
        })
    ],
    ['a reload of this one ended', wrapper => changeSort(wrapper, 'name')]
  ])('leaves the drop once %s', async (_, replace) => {
    const onEntityDropped = vi.fn()
    const previews = gatedAction()
    const { wrapper, actions, dropOnPlayer } = await openDropTarget({
      onEntityDropped,
      loadEntityPreviewFiles: previews.fn
    })

    dropOnPlayer()
    await flushPromises()
    replace(wrapper)
    await flushPromises()
    expect(actions.loadPlaylist).toHaveBeenCalledTimes(2)
    previews.release([])
    await flushPromises()

    expect(onEntityDropped).not.toHaveBeenCalled()
  })

  // Closing the panel after an addition reloads the playlist: the strip of
  // the drop is gone, and the page shows an empty playlist until the load
  // ends.
  it('leaves the drop once a reload of this one started', async () => {
    const added = { id: 'sh-added', name: 'SH400', sequence_name: 'SQ01' }
    const onEntityDropped = vi.fn()
    const loadEntityPreviewFiles = vi.fn(() => Promise.resolve([]))
    const { wrapper, actions, dropOnPlayer } = await openDropTarget({
      onEntityDropped,
      loadEntityPreviewFiles,
      getters: { displayedShotsBySequence: () => [[added]] }
    })
    wrapper
      .findComponent({ name: 'PlaylistPlayer' })
      .vm.$emit('show-add-entities')
    await nextTick()
    await wrapper.find('.addition-shot').trigger('click')
    await flushPromises()

    const releasePreviews = gateNextCall(loadEntityPreviewFiles)
    dropOnPlayer()
    await flushPromises()
    gateNextCall(actions.loadPlaylist)
    await wrapper.find('.addition-header .close-button').trigger('click')
    await flushPromises()
    expect(actions.loadPlaylist).toHaveBeenCalledTimes(2)
    releasePreviews([])
    await flushPromises()

    expect(onEntityDropped).not.toHaveBeenCalled()
  })

  // The player would not find the entry either and drop it again: the page
  // retried the addition for as long as it failed.
  it('leaves the drop when the addition failed', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('Request has been terminated')
    const onEntityDropped = vi.fn()
    const { dropOnPlayer } = await openDropTarget({
      onEntityDropped,
      loadEntityPreviewFiles: vi.fn(() => Promise.reject(failure))
    })

    dropOnPlayer()
    await flushPromises()

    expect(onEntityDropped).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith(failure)
  })

  it('listens to the updates again after a replay that throws', async () => {
    const bug = new TypeError('Cannot read properties of null')
    const { wrapper, actions, socket, dropOnPlayer } = await openDropTarget({
      onEntityDropped: () => {
        throw bug
      }
    })
    const errorHandler = vi.fn()
    wrapper.vm.$.appContext.config.errorHandler = errorHandler
    const onPlaylistUpdate = socket.on.mock.calls.find(
      ([name]) => name === 'playlist:update'
    )[1]

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    dropOnPlayer()
    await vi.advanceTimersByTimeAsync(2100)
    onPlaylistUpdate({ project_id: 'p1', playlist_id: 'pl-1' })

    expect(actions.refreshPlaylist).toHaveBeenCalledTimes(1)
    expect(errorHandler.mock.calls.map(([error]) => error)).toEqual([bug])
  })
})

// The browser history opens another playlist under an open modal.
describe('Playlist page, modals and navigation', () => {
  const stored = new Map([
    ['pl-1', { id: 'pl-1', name: 'A', project_id: 'p1', shots: [{ id: 's1' }] }],
    ['pl-2', { id: 'pl-2', name: 'B', project_id: 'p1', shots: [{ id: 's2' }] }]
  ])

  // Each load answers a new object, as the API does. The edit modal sits in
  // a teleport, disabled out of full screen.
  const openFirstPlaylist = async (
    actions = {},
    { state, query, mutations } = {}
  ) => {
    const page = await openPlaylist(stored.get('pl-1'), {
      state: { playlists: [...stored.values()], ...state },
      query,
      mutations,
      getters: { playlistMap: () => stored },
      actions: {
        loadPlaylist: vi.fn((context, { id }) =>
          Promise.resolve({ ...stored.get(id) })
        ),
        editPlaylist: vi.fn((context, { data }) =>
          Promise.resolve({ ...stored.get(data.id), name: data.name })
        ),
        ...actions
      },
      stubs: {
        teleport: false,
        PlaylistPlayer: {
          name: 'PlaylistPlayer',
          props: PlaylistPlayer.props,
          template: '<div />',
          methods: { scrollToRight: () => {} }
        }
      }
    })
    await flushPromises()
    const player = page.wrapper.findComponent({ name: 'PlaylistPlayer' })
    const modal = name => page.wrapper.findComponent({ name })
    return { ...page, player, modal }
  }

  const editFirstPlaylist = async ({ player, modal }) => {
    player.vm.$emit('edit-clicked')
    await nextTick()
    expect(modal('EditPlaylistModal').props('active')).toBe(true)
  }

  const openSecondPlaylist = () =>
    Object.assign(routeHolder.route, {
      params: { playlist_id: 'pl-2' },
      fullPath: '/pl-2'
    })

  const openBuildFilter = async ({ wrapper, modal }) => {
    wrapper
      .findAllComponents({ name: 'ButtonSimple' })
      .find(
        button => button.attributes('title') === 'entities.build_filter.title'
      )
      .vm.$emit('click')
    await nextTick()
    expect(modal('BuildFilterModal').props('active')).toBe(true)
  }

  it('closes the edit modal when another playlist opens', async () => {
    const page = await openFirstPlaylist()
    await editFirstPlaylist(page)

    openSecondPlaylist()
    await flushPromises()

    expect(page.modal('EditPlaylistModal').props('active')).toBe(false)
  })

  // Its search field goes with the addition panel, hidden during the load
  // and once the other playlist shows its entries.
  it('closes the build filter when another playlist opens', async () => {
    const page = await openFirstPlaylist()
    page.player.vm.$emit('show-add-entities')
    await flushPromises()
    await openBuildFilter(page)
    const release = gateNextCall(page.actions.loadPlaylist)

    openSecondPlaylist()
    await flushPromises()
    expect(page.modal('BuildFilterModal').props('active')).toBe(false)
    release({ ...stored.get('pl-2') })
    await flushPromises()

    expect(page.modal('BuildFilterModal').props('active')).toBe(false)
  })

  // The history can open a playlist the page cannot show, such as a deleted
  // one: the page then shows no playlist.
  it('closes the build filter when the playlist opened cannot be shown', async () => {
    const page = await openFirstPlaylist()
    page.player.vm.$emit('show-add-entities')
    await flushPromises()
    await openBuildFilter(page)

    Object.assign(routeHolder.route, {
      params: { playlist_id: 'pl-9' },
      fullPath: '/pl-9'
    })
    await flushPromises()

    expect(page.wrapper.find('.addition-header').exists()).toBe(false)
    expect(page.modal('BuildFilterModal').props('active')).toBe(false)
  })

  // The bulk addition reloads the playlist, whose entries close the panel.
  it('closes the build filter when a bulk addition closes the panel', async () => {
    const pending = gatedAction()
    const page = await openFirstPlaylist({ getPendingShots: pending.fn })
    page.player.vm.$emit('show-add-entities')
    await flushPromises()
    await page.wrapper
      .findAll('button')
      .find(button => button.text() === 'playlists.build_weekly')
      .trigger('click')
    await openBuildFilter(page)

    pending.release([{ id: 's9', name: 'SH900' }])
    await flushPromises()

    expect(page.wrapper.find('.addition-header').exists()).toBe(false)
    expect(page.modal('BuildFilterModal').props('active')).toBe(false)
  })

  // A new playlist does not depend on the playlist shown.
  it('keeps the creation form open when another playlist opens', async () => {
    const page = await openFirstPlaylist()
    await page.wrapper
      .findAll('button')
      .find(button => button.text() === 'playlists.new_playlist')
      .trigger('click')
    expect(page.modal('EditPlaylistModal').props('active')).toBe(true)

    openSecondPlaylist()
    await flushPromises()

    expect(page.modal('EditPlaylistModal').props('active')).toBe(true)
  })

  // The player closes its own modals when a load starts.
  it('shows the player the load of another playlist', async () => {
    const page = await openFirstPlaylist()
    const release = gateNextCall(page.actions.loadPlaylist)

    openSecondPlaylist()
    await flushPromises()
    expect(page.player.props('isLoading')).toBe(true)

    release({ ...stored.get('pl-2') })
    await flushPromises()
    expect(page.player.props('isLoading')).toBe(false)
  })

  // The history can open a playlist missing from the list during the load
  // of another one, which then answers for no playlist shown: the page
  // keeps the recent playlists instead of the player.
  it('ignores a load that answers once a playlist missing from the list opened', async () => {
    const page = await openFirstPlaylist()
    const release = gateNextCall(page.actions.loadPlaylist)
    openSecondPlaylist()
    await flushPromises()

    Object.assign(routeHolder.route, {
      params: { playlist_id: 'pl-9' },
      fullPath: '/pl-9'
    })
    await flushPromises()
    release({ ...stored.get('pl-2') })
    await flushPromises()

    expect(
      page.wrapper.findComponent({ name: 'PlaylistPlayer' }).exists()
    ).toBe(false)
  })

  it('ignores the share links count of a playlist left before it answered', async () => {
    const loadPlaylistShareLinks = vi.fn((context, id) =>
      Promise.resolve(id === 'pl-2' ? [{}, {}, {}] : [])
    )
    const releaseFirst = gateNextCall(loadPlaylistShareLinks)
    const page = await openFirstPlaylist({ loadPlaylistShareLinks })

    openSecondPlaylist()
    await flushPromises()
    expect(page.player.props('initialShareLinksCount')).toBe(3)
    releaseFirst([])
    await flushPromises()

    expect(page.player.props('initialShareLinksCount')).toBe(3)
  })

  it('shows the answer of an edit and closes its form', async () => {
    const page = await openFirstPlaylist()
    await editFirstPlaylist(page)

    page
      .modal('EditPlaylistModal')
      .vm.$emit('confirm', { name: 'A2', for_client: false })
    await flushPromises()

    expect(page.modal('EditPlaylistModal').props('active')).toBe(false)
    expect(page.player.props('playlist')).toMatchObject({
      id: 'pl-1',
      name: 'A2'
    })
  })

  // The action answers null when the save fails, as for a name another
  // playlist of the episode already holds.
  it('keeps the edit form open with its error when the save fails', async () => {
    const page = await openFirstPlaylist({
      editPlaylist: vi.fn(() => Promise.resolve(null))
    })
    await editFirstPlaylist(page)

    page
      .modal('EditPlaylistModal')
      .vm.$emit('confirm', { name: 'B', for_client: false })
    await flushPromises()

    expect(page.modal('EditPlaylistModal').props()).toMatchObject({
      active: true,
      isError: true,
      isLoading: false
    })
    expect(page.player.props('playlist')).toMatchObject({
      id: 'pl-1',
      name: 'A'
    })
  })

  // Cancel closes the edit form before the save answers, and the creation
  // form opens in the same modal.
  const openCreationDuringRename = async (page, name) => {
    await editFirstPlaylist(page)
    page
      .modal('EditPlaylistModal')
      .vm.$emit('confirm', { name, for_client: false })
    await flushPromises()
    page.modal('EditPlaylistModal').vm.$emit('cancel')
    await nextTick()
    await page.wrapper
      .findAll('button')
      .find(button => button.text() === 'playlists.new_playlist')
      .trigger('click')
    expect(page.modal('EditPlaylistModal').props('active')).toBe(true)
  }

  it('keeps a late refusal of a rename out of the creation form', async () => {
    const save = gatedAction()
    const page = await openFirstPlaylist({ editPlaylist: save.fn })
    await openCreationDuringRename(page, 'B')

    save.release(null)
    await flushPromises()

    expect(page.modal('EditPlaylistModal').props()).toMatchObject({
      active: true,
      isError: false
    })
  })

  it('keeps the creation form open when a rename answers late', async () => {
    const save = gatedAction()
    const page = await openFirstPlaylist({ editPlaylist: save.fn })
    await openCreationDuringRename(page, 'A2')

    save.release({ ...stored.get('pl-1'), name: 'A2' })
    await flushPromises()

    expect(page.modal('EditPlaylistModal').props('active')).toBe(true)
    expect(page.player.props('playlist')).toMatchObject({
      id: 'pl-1',
      name: 'A2'
    })
  })

  // The save answers once the other playlist is loaded.
  it('keeps the answer of an edit to the playlist edited', async () => {
    const save = gatedAction()
    const page = await openFirstPlaylist({ editPlaylist: save.fn })
    await editFirstPlaylist(page)
    page
      .modal('EditPlaylistModal')
      .vm.$emit('confirm', { name: 'A2', for_client: false })
    await flushPromises()

    openSecondPlaylist()
    await flushPromises()
    save.release({ ...stored.get('pl-1'), name: 'A2' })
    await flushPromises()

    expect(page.player.props('playlist')).toMatchObject({
      id: 'pl-2',
      name: 'B'
    })
  })

  const openCreation = async page => {
    await page.wrapper
      .findAll('button')
      .find(button => button.text() === 'playlists.new_playlist')
      .trigger('click')
    expect(page.modal('EditPlaylistModal').props('active')).toBe(true)
  }

  it('opens the playlist it creates and closes its form', async () => {
    const page = await openFirstPlaylist({
      newPlaylist: vi.fn(() => Promise.resolve({ id: 'pl-3', name: 'C' }))
    })
    await openCreation(page)
    routeHolder.router.push.mockClear()

    page
      .modal('EditPlaylistModal')
      .vm.$emit('confirm', { name: 'C', for_client: false })
    await flushPromises()

    expect(page.modal('EditPlaylistModal').props('active')).toBe(false)
    expect(routeHolder.router.push).toHaveBeenCalledTimes(1)
    expect(routeHolder.router.push.mock.calls[0][0]).toMatchObject({
      params: { playlist_id: 'pl-3' }
    })
  })

  it('keeps the creation form open with its error when the creation fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const page = await openFirstPlaylist({
      newPlaylist: vi.fn(() => Promise.reject(new Error('Bad Request')))
    })
    await openCreation(page)

    page
      .modal('EditPlaylistModal')
      .vm.$emit('confirm', { name: 'B', for_client: false })
    await flushPromises()

    expect(consoleError).toHaveBeenCalled()
    expect(page.modal('EditPlaylistModal').props()).toMatchObject({
      active: true,
      isError: true,
      isLoading: false
    })
  })

  const confirmCreation = async page => {
    await openCreation(page)
    page
      .modal('EditPlaylistModal')
      .vm.$emit('confirm', { name: 'C', for_client: false })
    await flushPromises()
  }

  it('stays on the playlist shown when a creation answers after a Cancel', async () => {
    const create = gatedAction()
    const page = await openFirstPlaylist({ newPlaylist: create.fn })
    await confirmCreation(page)
    page.modal('EditPlaylistModal').vm.$emit('cancel')
    await nextTick()
    routeHolder.router.push.mockClear()

    create.release({ id: 'pl-3', name: 'C' })
    await flushPromises()

    expect(page.modal('EditPlaylistModal').props('active')).toBe(false)
    expect(routeHolder.router.push).not.toHaveBeenCalled()
  })

  it('keeps the next creation form open when a creation answers after a Cancel', async () => {
    const create = gatedAction()
    const page = await openFirstPlaylist({ newPlaylist: create.fn })
    await confirmCreation(page)
    page.modal('EditPlaylistModal').vm.$emit('cancel')
    await nextTick()
    await openCreation(page)
    routeHolder.router.push.mockClear()

    create.release({ id: 'pl-3', name: 'C' })
    await flushPromises()

    expect(page.modal('EditPlaylistModal').props()).toMatchObject({
      active: true,
      isLoading: false
    })
    expect(routeHolder.router.push).not.toHaveBeenCalled()
  })

  // Cancel closes the creation form before its save answers, and the edit
  // form of the playlist shown opens in the same modal.
  const openEditDuringCreation = async page => {
    await confirmCreation(page)
    page.modal('EditPlaylistModal').vm.$emit('cancel')
    await nextTick()
    await editFirstPlaylist(page)
    routeHolder.router.push.mockClear()
  }

  it('keeps a late refusal of a creation out of the edit form', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const create = gatedFailure()
    const page = await openFirstPlaylist({ newPlaylist: create.fn })
    await openEditDuringCreation(page)

    create.fail(new Error('Bad Request'))
    await flushPromises()

    expect(consoleError).toHaveBeenCalled()
    expect(page.modal('EditPlaylistModal').props()).toMatchObject({
      active: true,
      isError: false,
      isLoading: false
    })
  })

  it('keeps the edit form open when a creation succeeds after it opened', async () => {
    const create = gatedAction()
    const page = await openFirstPlaylist({ newPlaylist: create.fn })
    await openEditDuringCreation(page)

    create.release({ id: 'pl-3', name: 'C' })
    await flushPromises()

    expect(page.modal('EditPlaylistModal').props()).toMatchObject({
      active: true,
      isLoading: false
    })
    expect(routeHolder.router.push).not.toHaveBeenCalled()
  })

  // Leaving the page closes the form without a Cancel.
  it('does not open the playlist it creates once the page is left', async () => {
    const create = gatedAction()
    const page = await openFirstPlaylist({ newPlaylist: create.fn })
    await confirmCreation(page)
    routeHolder.router.push.mockClear()

    page.wrapper.unmount()
    create.release({ id: 'pl-3', name: 'C' })
    await flushPromises()

    expect(routeHolder.router.push).not.toHaveBeenCalled()
  })

  // The topbar and Back move the page to another production, episode, or
  // All shots / All assets list without closing the form. A movie has no
  // current episode.
  const scopeMoves = [
    [
      'production',
      { state: { currentEpisode: null } },
      page => moveScope(page.store, { currentProduction: { id: 'p2' } }),
      {
        name: 'playlist',
        params: { production_id: 'p1', playlist_id: 'pl-3' },
        query: {}
      }
    ],
    [
      'episode',
      { state: { isTVShow: true } },
      page => moveScope(page.store, { currentEpisode: { id: 'ep-b' } }),
      {
        name: 'episode-playlist',
        params: { production_id: 'p1', episode_id: 'ep-a', playlist_id: 'pl-3' },
        query: {}
      }
    ],
    [
      'entity type',
      {
        state: { isTVShow: true, currentEpisode: { id: 'all' } },
        query: { for_entity: 'shot' }
      },
      async () => {
        routeHolder.route.query = {}
        await nextTick()
      },
      {
        name: 'episode-playlist',
        params: { production_id: 'p1', episode_id: 'all', playlist_id: 'pl-3' },
        query: { for_entity: 'shot' }
      }
    ]
  ]

  it.each(scopeMoves)(
    'opens the playlist it creates where it was created once the page moves to another %s',
    async (_scope, options, move, createdRoute) => {
      const create = gatedAction()
      const page = await openFirstPlaylist({ newPlaylist: create.fn }, options)
      await confirmCreation(page)
      await move(page)
      await flushPromises()
      routeHolder.router.push.mockClear()

      create.release({ id: 'pl-3', name: 'C' })
      await flushPromises()

      expect(routeHolder.router.push).toHaveBeenCalledTimes(1)
      expect(routeHolder.router.push).toHaveBeenCalledWith(createdRoute)
    }
  )

  // The store's list actions and mutations, on a creation Zou answers late.
  // Zou holds the two playlists of p1, and none in another production.
  const openWithStore = async (options = {}) => {
    let answer
    vi.spyOn(playlistsApi, 'newPlaylist').mockImplementation(
      () =>
        new Promise(resolve => {
          answer = resolve
        })
    )
    const copies = () => [...stored.values()].map(playlist => ({ ...playlist }))
    vi.spyOn(playlistsApi, 'getPlaylists').mockImplementation(production =>
      Promise.resolve(production.id === 'p1' ? copies() : [])
    )
    const listed = copies()
    const page = await openFirstPlaylist(
      {
        editPlaylist: playlistStore.actions.editPlaylist,
        loadPlaylists: playlistStore.actions.loadPlaylists,
        newPlaylist: playlistStore.actions.newPlaylist
      },
      {
        ...options,
        state: {
          playlists: listed,
          playlistListKey: getPlaylistListKey('p1'),
          playlistMap: new Map(listed.map(playlist => [playlist.id, playlist])),
          ...options.state
        },
        mutations: {
          EDIT_PLAYLIST_START: playlistStore.mutations.EDIT_PLAYLIST_START,
          EDIT_PLAYLIST_END: playlistStore.mutations.EDIT_PLAYLIST_END,
          LOAD_PLAYLISTS_END: playlistStore.mutations.LOAD_PLAYLISTS_END,
          SET_PLAYLIST_LIST_KEY: playlistStore.mutations.SET_PLAYLIST_LIST_KEY
        }
      }
    )
    return { ...page, answer: playlist => answer(playlist) }
  }
  const cancelCreation = async options => {
    const page = await openWithStore(options)
    await confirmCreation(page)
    page.modal('EditPlaylistModal').vm.$emit('cancel')
    await nextTick()
    return page
  }
  const listedIds = page => page.store.state.playlists.map(({ id }) => id)
  const created = { id: 'pl-3', name: 'C', project_id: 'p1' }
  const moveToP2 = page =>
    moveScope(page.store, { currentProduction: { id: 'p2' } })

  it('lists the playlist it creates once its form is closed', async () => {
    const page = await cancelCreation()

    page.answer(created)
    await flushPromises()

    expect(listedIds(page)).toEqual(['pl-3', 'pl-1', 'pl-2'])
  })

  it('lists the playlist it creates in the All shots list', async () => {
    const page = await cancelCreation({
      state: { isTVShow: true, currentEpisode: { id: 'all' } },
      query: { for_entity: 'shot' }
    })

    page.answer(created)
    await flushPromises()

    expect(listedIds(page)).toEqual(['pl-3', 'pl-1', 'pl-2'])
  })

  it.each(scopeMoves)(
    'keeps the playlist it creates out of the list of another %s',
    async (_scope, options, move) => {
      const page = await cancelCreation(options)
      await move(page)
      await flushPromises()

      page.answer(created)
      await flushPromises()

      expect(listedIds(page)).not.toContain('pl-3')
    }
  )

  it('keeps the playlist it creates out of the list of another production while its form is shown', async () => {
    const page = await openWithStore()
    await confirmCreation(page)
    await moveToP2(page)
    await flushPromises()

    page.answer(created)
    await flushPromises()

    expect(listedIds(page)).not.toContain('pl-3')
  })

  it('lists the playlist it creates after a switch and back', async () => {
    const page = await cancelCreation()
    await moveToP2(page)
    await flushPromises()
    await moveScope(page.store, { currentProduction: { id: 'p1' } })
    await flushPromises()

    page.answer(created)
    await flushPromises()

    expect(listedIds(page)).toEqual(['pl-3', 'pl-1', 'pl-2'])
  })

  // Once the page is left, the store keeps the list it showed until another
  // page loads one.
  it('lists the playlist it creates when the page is left before a switch', async () => {
    const page = await cancelCreation()
    page.wrapper.unmount()
    await moveToP2(page)

    page.answer(created)
    await flushPromises()

    expect(listedIds(page)).toEqual(['pl-3', 'pl-1', 'pl-2'])
  })

  it('keeps the playlist it creates out of a list another page loads once this one is left', async () => {
    const page = await cancelCreation()
    page.wrapper.unmount()
    await moveToP2(page)
    await page.store.dispatch('loadPlaylists', {})

    page.answer(created)
    await flushPromises()

    expect(listedIds(page)).not.toContain('pl-3')
  })

  it('keeps the playlist it creates out of the list of another production when the page is left after the switch', async () => {
    const page = await cancelCreation()
    await moveToP2(page)
    await flushPromises()
    page.wrapper.unmount()

    page.answer(created)
    await flushPromises()

    expect(listedIds(page)).not.toContain('pl-3')
  })

  // A rename of the playlist shown that Zou answers late.
  const renameLate = async () => {
    let answer
    vi.spyOn(playlistsApi, 'updatePlaylist').mockImplementation(
      () =>
        new Promise(resolve => {
          answer = resolve
        })
    )
    const page = await openWithStore()
    await editFirstPlaylist(page)
    page
      .modal('EditPlaylistModal')
      .vm.$emit('confirm', { id: 'pl-1', name: 'A2', for_client: false })
    await flushPromises()
    return { ...page, answerRename: () => answer({ ...stored.get('pl-1'), name: 'A2' }) }
  }

  it('renames the playlist in the list shown', async () => {
    const page = await renameLate()

    page.answerRename()
    await flushPromises()

    expect(page.store.state.playlists.map(({ name }) => name)).toEqual([
      'A2',
      'B'
    ])
  })

  it('keeps a playlist renamed out of the list of another production', async () => {
    const page = await renameLate()
    await moveToP2(page)
    await flushPromises()

    page.answerRename()
    await flushPromises()

    expect(listedIds(page)).not.toContain('pl-1')
  })
})

// Closing the panel after an addition reloads the playlist. A reload that
// runs during an addition can read the playlist before the addition is
// saved, like a server far away.
describe('Playlist page, addition during a reload', () => {
  const shot = (id, name) => ({
    id,
    name,
    sequence_id: 'sq-1',
    sequence_name: 'SQ01'
  })
  const shots = [shot('s1', 'SH100'), shot('s3', 'SH300'), shot('s4', 'SH400')]
  const entry = id => ({ id, preview_files: {} })
  const copy = playlist => ({
    ...playlist,
    shots: playlist.shots.map(({ id }) => entry(id))
  })

  // Zou keeps the entries of each playlist, and each load answers what it
  // keeps at the call. The store adds an entry to the playlist it is given,
  // then saves that playlist whole.
  const openWithZou = async (actions = {}) => {
    shots.forEach(entity => shotStore.cache.shotMap.set(entity.id, entity))
    const zou = new Map([
      ['pl-1', { id: 'pl-1', name: 'A', project_id: 'p1', shots: [entry('s1')] }],
      ['pl-2', { id: 'pl-2', name: 'B', project_id: 'p1', shots: [] }]
    ])
    const list = new Map([...zou].map(([id, playlist]) => [id, copy(playlist)]))
    const page = await openPlaylist(list.get('pl-1'), {
      state: { playlists: [...list.values()] },
      getters: {
        displayedShotsBySequence: () => [shots.slice(1)],
        playlistMap: () => list
      },
      actions: {
        loadEntityPreviewFiles: vi.fn(() => Promise.resolve([])),
        loadPlaylist: vi.fn((context, { id }) =>
          Promise.resolve(copy(zou.get(id)))
        ),
        pushEntityToPlaylist: vi.fn((context, { playlist, entity }) => {
          playlist.shots.push(entry(entity.id))
          zou.set(playlist.id, copy(playlist))
          return Promise.resolve({ ...entity, preview_file_id: 'pf-new' })
        }),
        loadPlaylistShareLinks: vi.fn((context, id) =>
          Promise.resolve(id === 'pl-2' ? [{}, {}, {}] : [])
        ),
        ...actions
      },
      stubs: {
        PlaylistPlayer: {
          name: 'PlaylistPlayer',
          props: ['playlist', 'entities', 'isLoading', 'initialShareLinksCount'],
          template: '<div />',
          methods: { onEntityDropped: () => {}, scrollToRight: () => {} }
        }
      }
    })
    await flushPromises()
    const player = page.wrapper.findComponent({ name: 'PlaylistPlayer' })
    player.vm.$emit('show-add-entities')
    await flushPromises()
    // What the next whole save of the playlist shown sends.
    const savedNext = () => player.props('playlist').shots.map(({ id }) => id)
    const addShot = name =>
      page.wrapper
        .findAll('.addition-shot')
        .find(entity => entity.text().includes(name))
        .trigger('click')
    const addSequence = () =>
      page.wrapper
        .findAll('button')
        .find(button => button.text() === 'playlists.add_sequence')
        .trigger('click')
    const closePanel = () =>
      page.wrapper.find('.addition-header .close-button').trigger('click')
    return { ...page, zou, player, savedNext, addShot, addSequence, closePanel }
  }

  const openPlaylistOf = id =>
    Object.assign(routeHolder.route, {
      params: { playlist_id: id },
      fullPath: `/${id}`
    })

  afterEach(() => {
    shots.forEach(entity => shotStore.cache.shotMap.delete(entity.id))
  })

  it('adds an entry to the playlist shown without a reload', async () => {
    const { actions, player, savedNext, addShot } = await openWithZou()

    await addShot('SH300')
    await flushPromises()

    expect(savedNext()).toEqual(['s1', 's3'])
    expect(player.props('entities').map(({ id }) => id)).toEqual(['s1', 's3'])
    expect(actions.loadPlaylist).toHaveBeenCalledTimes(1)
  })

  it('keeps an entry added while a reload ran', async () => {
    const { actions, savedNext, addShot, closePanel } = await openWithZou()
    const releasePreviews = gateNextCall(actions.loadEntityPreviewFiles)
    await addShot('SH300')

    await closePanel()
    await flushPromises()
    expect(savedNext()).toEqual(['s1'])
    releasePreviews([])
    await flushPromises()

    expect(savedNext()).toEqual(['s1', 's3'])
  })

  it('keeps an entry added before a reload answered', async () => {
    const page = await openWithZou()
    const { actions, zou, player, savedNext, addShot, closePanel } = page
    const releasePreviews = gateNextCall(actions.loadEntityPreviewFiles)
    await addShot('SH300')
    const releaseReload = gateNextCall(actions.loadPlaylist)
    const readAtClose = copy(zou.get('pl-1'))

    await closePanel()
    releasePreviews([])
    await flushPromises()
    releaseReload(readAtClose)
    await flushPromises()

    expect(savedNext()).toEqual(['s1', 's3'])
    expect(player.props('isLoading')).toBe(false)
  })

  // An entity added meanwhile would go to the empty playlist shown during
  // the reload, or to the playlist the reload replaces.
  it('hides the entities to add while the playlist reloads', async () => {
    const page = await openWithZou()
    const { wrapper, actions, zou, addShot, closePanel } = page
    await addShot('SH300')
    await flushPromises()
    const releaseReload = gateNextCall(actions.loadPlaylist)

    await closePanel()
    await flushPromises()
    expect(wrapper.findAll('.addition-shot')).toHaveLength(0)
    releaseReload(copy(zou.get('pl-1')))
    await flushPromises()

    expect(wrapper.findAll('.addition-shot')).toHaveLength(0)
  })

  // Back to the second playlist, then Forward before the bulk addition
  // ends: the load of the navigation reads the playlist before it.
  it('keeps the entries added in bulk before a reload answered', async () => {
    const { actions, zou, player, savedNext, addSequence } = await openWithZou()
    const releaseBulk = gateNextCall(actions.addEntitiesToPlaylist)
    await addSequence()
    openPlaylistOf('pl-2')
    await flushPromises()
    const releaseForward = gateNextCall(actions.loadPlaylist)
    const readAtForward = copy(zou.get('pl-1'))
    openPlaylistOf('pl-1')
    await flushPromises()

    zou.get('pl-1').shots.push(entry('s3'), entry('s4'))
    releaseBulk()
    await flushPromises()
    releaseForward(readAtForward)
    await flushPromises()

    expect(savedNext()).toEqual(['s1', 's3', 's4'])
    expect(player.props('isLoading')).toBe(false)
  })

  // The playlist shown lacks the new entries until it loads again: a change
  // saved meanwhile, such as a removal, would save it without them.
  it('disables the playlist changes during a bulk addition', async () => {
    const { wrapper, actions, zou, player, savedNext, addSequence } =
      await openWithZou()
    const releaseBulk = gateNextCall(actions.addEntitiesToPlaylist)

    await addSequence()
    await flushPromises()
    expect(wrapper.findAll('.addition-shot')).toHaveLength(0)
    expect(player.props('isLoading')).toBe(true)
    zou.get('pl-1').shots.push(entry('s3'), entry('s4'))
    releaseBulk()
    await flushPromises()

    expect(savedNext()).toEqual(['s1', 's3', 's4'])
    expect(player.props('isLoading')).toBe(false)
  })

  it('gives the playlist back after a bulk addition that failed', async () => {
    const failure = new Error('down')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper, player, addSequence } = await openWithZou({
      addEntitiesToPlaylist: vi.fn(() => Promise.reject(failure))
    })

    await addSequence()
    await flushPromises()

    expect(player.props('isLoading')).toBe(false)
    expect(wrapper.findAll('.addition-shot')).toHaveLength(2)
    expect(consoleError).toHaveBeenCalledWith(failure)
  })

  // Back, then Forward: the second playlist still shows under the address of
  // the first one, and must stay disabled until that load answers.
  it('keeps loading a playlist opened again during a bulk addition that failed', async () => {
    const failure = new Error('down')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { actions, zou, player, addSequence } = await openWithZou()
    let failBulk
    actions.addEntitiesToPlaylist.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          failBulk = reject
        })
    )
    await addSequence()
    openPlaylistOf('pl-2')
    await flushPromises()
    const releaseForward = gateNextCall(actions.loadPlaylist)
    openPlaylistOf('pl-1')
    await flushPromises()

    failBulk(failure)
    await flushPromises()
    expect(player.props('playlist').id).toBe('pl-2')
    expect(player.props('isLoading')).toBe(true)
    releaseForward(copy(zou.get('pl-1')))
    await flushPromises()

    expect(player.props('playlist').id).toBe('pl-1')
    expect(player.props('isLoading')).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(failure)
  })

  // The playlist shown lacks the new entries until that reload answers: an
  // entity added meanwhile would save it without them.
  it('hides the entities to add while a bulk addition reloads the playlist', async () => {
    const { wrapper, actions, zou, player, savedNext, addSequence } =
      await openWithZou()
    const releaseReload = gateNextCall(actions.loadPlaylist)

    await addSequence()
    await flushPromises()
    expect(wrapper.findAll('.addition-shot')).toHaveLength(0)
    expect(player.props('isLoading')).toBe(true)
    zou.get('pl-1').shots.push(entry('s3'), entry('s4'))
    releaseReload(copy(zou.get('pl-1')))
    await flushPromises()

    expect(savedNext()).toEqual(['s1', 's3', 's4'])
    expect(player.props('isLoading')).toBe(false)
  })

  // The store saves nothing for an entity already in the playlist without a
  // preview of its own.
  it('reloads nothing after an addition that saved nothing', async () => {
    const { actions, addShot, closePanel } = await openWithZou({
      pushEntityToPlaylist: vi.fn(() => Promise.resolve(null))
    })
    const releasePreviews = gateNextCall(actions.loadEntityPreviewFiles)
    await addShot('SH300')

    await closePanel()
    await flushPromises()
    expect(actions.loadPlaylist).toHaveBeenCalledTimes(2)
    releasePreviews([])
    await flushPromises()

    expect(actions.loadPlaylist).toHaveBeenCalledTimes(2)
  })

  // Back to the second playlist, then Forward before the bulk addition
  // ends: its load replaces the one of the navigation.
  it('shows the share links of the playlist loaded after a bulk addition', async () => {
    const { actions, zou, player, addSequence } = await openWithZou()
    const releaseBulk = gateNextCall(actions.addEntitiesToPlaylist)
    await addSequence()
    openPlaylistOf('pl-2')
    await flushPromises()
    expect(player.props('initialShareLinksCount')).toBe(3)
    const releaseForward = gateNextCall(actions.loadPlaylist)
    openPlaylistOf('pl-1')
    await flushPromises()

    zou.get('pl-1').shots.push(entry('s3'), entry('s4'))
    releaseBulk(copy(zou.get('pl-1')))
    await flushPromises()
    releaseForward(copy(zou.get('pl-1')))
    await flushPromises()

    expect(player.props('playlist').id).toBe('pl-1')
    expect(player.props('initialShareLinksCount')).toBe(0)
  })

  it('adds nothing to another playlist opened during an addition', async () => {
    const { actions, zou, savedNext, addShot } = await openWithZou()
    const releasePreviews = gateNextCall(actions.loadEntityPreviewFiles)
    await addShot('SH300')

    openPlaylistOf('pl-2')
    await flushPromises()
    releasePreviews([])
    await flushPromises()

    expect(savedNext()).toEqual([])
    expect(zou.get('pl-1').shots.map(({ id }) => id)).toEqual(['s1', 's3'])
    expect(actions.loadPlaylist).toHaveBeenCalledTimes(2)
  })

  // A reload of the playlist left would never show, and keep the player
  // loading.
  it('shows another playlist opened during a bulk addition', async () => {
    const { actions, player, addSequence } = await openWithZou()
    const releaseBulk = gateNextCall(actions.addEntitiesToPlaylist)
    await addSequence()
    openPlaylistOf('pl-2')
    await flushPromises()

    releaseBulk()
    await flushPromises()

    expect(player.props('playlist').id).toBe('pl-2')
    expect(player.props('isLoading')).toBe(false)
    expect(actions.loadPlaylist).toHaveBeenCalledTimes(2)
  })
})

describe('Playlist page, unreadable playlist', () => {
  // Playlist events reach every member of the production. A client can no
  // longer read a playlist made internal: its refetch resolves to false, and
  // the store drops it from the list.
  // An empty playlist opens the addition panel, which holds the updates back.
  const shots = [{ id: 's1' }]
  const updateOpenPlaylist = async refreshPlaylist => {
    const { wrapper, socket } = await openPlaylist(
      { shots },
      { actions: { refreshPlaylist } }
    )
    await flushPromises()
    routeHolder.router.push.mockClear()
    const onPlaylistUpdate = socket.on.mock.calls.find(
      ([name]) => name === 'playlist:update'
    )[1]
    await onPlaylistUpdate({ project_id: 'p1', playlist_id: 'pl-1' })
    await flushPromises()
    return wrapper
  }

  it('leaves the open playlist once it left the list', async () => {
    const wrapper = await updateOpenPlaylist(
      vi.fn(({ getters }) => {
        getters.playlistMap.delete('pl-1')
        return Promise.resolve(false)
      })
    )

    expect(routeHolder.router.push).toHaveBeenCalled()
    expect(wrapper.vm.currentPlaylist.id).toBe('pl-1')
  })

  it('stays on the open playlist when the refresh fails', async () => {
    const wrapper = await updateOpenPlaylist(
      vi.fn(() => Promise.resolve(null))
    )

    expect(routeHolder.router.push).not.toHaveBeenCalled()
    expect(wrapper.vm.currentPlaylist.id).toBe('pl-1')
  })

  it('shows the refreshed playlist', async () => {
    const refreshed = { id: 'pl-1', name: 'Renamed', project_id: 'p1', shots }
    const wrapper = await updateOpenPlaylist(
      vi.fn(() => Promise.resolve(refreshed))
    )

    const player = wrapper.findComponent(PlaylistPlayer)
    expect(player.props('playlist').name).toBe('Renamed')
  })
})

describe('Playlist page, playlist past the list loaded', () => {
  // The list holds the first 20 playlists in the order picked: the playlist
  // of a link, or the one "View created playlist" opens, can come after.
  const openPastPlaylist = async ({ listed, past, state = {}, actions }) => {
    const page = await mountPage({
      params: { playlist_id: past.id },
      state: { playlists: [listed], ...state },
      getters: { playlistMap: () => new Map([[listed.id, listed]]) },
      actions: {
        loadPlaylist: vi.fn((context, { id }) =>
          Promise.resolve(id === past.id ? { ...past } : {})
        ),
        ...actions
      }
    })
    await flushPromises()
    return page
  }

  // A teammate changes the playlist shown. An empty playlist opens the
  // addition panel, which holds the updates back.
  const past = {
    id: 'pl-9',
    name: 'Past',
    project_id: 'p1',
    shots: [{ id: 's1' }]
  }
  const updatePastPlaylist = async refreshPlaylist => {
    const page = await openPastPlaylist({
      listed: { id: 'pl-1', name: 'Listed', project_id: 'p1' },
      past,
      actions: { refreshPlaylist }
    })
    routeHolder.router.push.mockClear()
    const onPlaylistUpdate = page.socket.on.mock.calls.find(
      ([name]) => name === 'playlist:update'
    )[1]
    await onPlaylistUpdate({ project_id: 'p1', playlist_id: past.id })
    await flushPromises()
    return page
  }
  const shownName = wrapper =>
    wrapper.findComponent(PlaylistPlayer).props('playlist').name

  it('shows an update of the playlist it opened past the list', async () => {
    const { wrapper } = await updatePastPlaylist(
      vi.fn(() => Promise.resolve({ ...past, name: 'Renamed' }))
    )

    expect(shownName(wrapper)).toBe('Renamed')
  })

  it('leaves the playlist it opened past the list once unreadable', async () => {
    await updatePastPlaylist(vi.fn(() => Promise.resolve(false)))

    expect(routeHolder.router.push).toHaveBeenCalled()
  })

  it('keeps the playlist it opened past the list when its refresh fails', async () => {
    const { wrapper } = await updatePastPlaylist(
      vi.fn(() => Promise.resolve(null))
    )

    expect(routeHolder.router.push).not.toHaveBeenCalled()
    expect(shownName(wrapper)).toBe('Past')
  })

  it('opens the playlist of the address when the list does not hold it', async () => {
    const { wrapper, store } = await openPastPlaylist({
      listed: { id: 'pl-1', name: 'Listed', project_id: 'p1' },
      past: { id: 'pl-9', name: 'Past', project_id: 'p1', shots: [] }
    })

    expect(wrapper.find('.no-selection').exists()).toBe(false)
    const player = wrapper.findComponent(PlaylistPlayer)
    expect(player.props('playlist').name).toBe('Past')
    expect(store.state.playlists.map(({ id }) => id)).toEqual(['pl-1'])
  })

  it('keeps the playlist of the address closed when it belongs to another list', async () => {
    const { wrapper } = await openPastPlaylist({
      listed: { id: 'pl-1', name: 'Listed', project_id: 'p1', episode_id: 'ep-a' },
      past: {
        id: 'pl-9',
        name: 'Past',
        project_id: 'p1',
        episode_id: 'ep-b',
        shots: []
      },
      state: { isTVShow: true }
    })

    expect(wrapper.find('.no-selection').exists()).toBe(true)
  })

  // The address still names the playlist the page keeps closed.
  it('stays on the list when a teammate deletes the playlist of the address kept closed', async () => {
    const { wrapper, socket } = await openPastPlaylist({
      listed: { id: 'pl-1', name: 'Listed', project_id: 'p1', episode_id: 'ep-a' },
      past: {
        id: 'pl-9',
        name: 'Past',
        project_id: 'p1',
        episode_id: 'ep-b',
        shots: []
      },
      state: { isTVShow: true }
    })
    routeHolder.router.push.mockClear()
    const onPlaylistDelete = socket.on.mock.calls.find(
      ([name]) => name === 'playlist:delete'
    )[1]

    onPlaylistDelete({ project_id: 'p1', playlist_id: 'pl-9' })
    await flushPromises()

    expect(routeHolder.router.push).not.toHaveBeenCalled()
    expect(wrapper.find('.no-selection').exists()).toBe(true)
  })

  // A TV show lists the playlists of one episode, or of none in the Main
  // Pack.
  it.each([
    ['an episode', 'ep-a', { episode_id: 'ep-a' }],
    ['the Main Pack', 'main', {}]
  ])(
    'opens the playlist of the address past the list of %s',
    async (list, episodeId, fields) => {
      const { wrapper } = await openPastPlaylist({
        listed: { id: 'pl-1', name: 'Listed', project_id: 'p1', ...fields },
        past: {
          id: 'pl-9',
          name: 'Past',
          project_id: 'p1',
          shots: [],
          ...fields
        },
        state: { currentEpisode: { id: episodeId }, isTVShow: true }
      })

      expect(wrapper.find('.no-selection').exists()).toBe(false)
      const player = wrapper.findComponent(PlaylistPlayer)
      expect(player.props('playlist').name).toBe('Past')
    }
  )

  // A task type filter can leave the list empty.
  it('shows the player loading the playlist of the address over an empty list', async () => {
    const { wrapper } = await mountPage({
      params: { playlist_id: 'pl-9' },
      actions: { loadPlaylist: vi.fn(() => new Promise(() => {})) }
    })
    await flushPromises()

    expect(wrapper.find('.no-selection').exists()).toBe(false)
    const player = wrapper.findComponent(PlaylistPlayer)
    expect(player.props('isLoading')).toBe(true)
  })

  // Under All, the list shown is the All shots one or the All assets one.
  const listedAllShots = {
    id: 'pl-1',
    name: 'Listed',
    project_id: 'p1',
    is_for_all: true,
    for_entity: 'shot'
  }
  const openUnderAllShots = async past => {
    const { wrapper } = await mountPage({
      params: { playlist_id: past.id },
      query: { for_entity: 'shot' },
      state: {
        currentEpisode: { id: 'all' },
        isTVShow: true,
        playlists: [listedAllShots]
      },
      getters: {
        playlistMap: () => new Map([[listedAllShots.id, listedAllShots]])
      },
      actions: { loadPlaylist: vi.fn(() => Promise.resolve({ ...past })) }
    })
    await flushPromises()
    return wrapper
  }
  const pastForAll = forEntity => ({
    id: 'pl-9',
    name: 'Past',
    project_id: 'p1',
    is_for_all: true,
    for_entity: forEntity,
    shots: []
  })

  it('opens an All shots playlist past the All shots list', async () => {
    const wrapper = await openUnderAllShots(pastForAll('shot'))

    expect(wrapper.find('.no-selection').exists()).toBe(false)
    const player = wrapper.findComponent(PlaylistPlayer)
    expect(player.props('playlist').name).toBe('Past')
  })

  it('keeps an All assets playlist closed under the All shots list', async () => {
    const wrapper = await openUnderAllShots(pastForAll('asset'))

    expect(wrapper.find('.no-selection').exists()).toBe(true)
  })

  // Decided: a sort or task type filter change keeps the playlist shown
  // open, even when the list loaded again does not hold it.
  it.each([
    ['sort', wrapper => changeSort(wrapper, 'name')],
    [
      'task type filter',
      wrapper =>
        wrapper
          .findComponent(ComboboxTaskType)
          .vm.$emit('update:modelValue', 'tt-2')
    ]
  ])(
    'keeps the playlist shown open when a %s change leaves it out of the list',
    async (change, apply) => {
      const shown = {
        id: 'pl-1',
        name: 'Shown',
        project_id: 'p1',
        task_type_id: 'tt-1',
        shots: [{ id: 's1' }]
      }
      const other = {
        id: 'pl-2',
        name: 'Other',
        project_id: 'p1',
        task_type_id: 'tt-2'
      }
      const { wrapper } = await mountPage({
        params: { playlist_id: shown.id },
        state: { playlists: [shown, other] },
        getters: {
          playlistMap: state =>
            new Map(state.playlists.map(playlist => [playlist.id, playlist]))
        },
        actions: {
          loadPlaylist: vi.fn((context, { id }) =>
            Promise.resolve(id === shown.id ? { ...shown } : {})
          ),
          // The list loaded again holds the other playlist only.
          loadPlaylists: vi.fn(({ commit }) => {
            commit('LOAD_PLAYLISTS_END', [other])
            return Promise.resolve()
          })
        }
      })
      await flushPromises()

      apply(wrapper)
      await flushPromises()

      expect(wrapper.find('.no-selection').exists()).toBe(false)
      const player = wrapper.findComponent(PlaylistPlayer)
      expect(player.props('playlist').name).toBe('Shown')
    }
  )

  it('keeps the playlist shown open when a task type filter empties the list', async () => {
    const shown = {
      id: 'pl-1',
      name: 'Shown',
      project_id: 'p1',
      task_type_id: 'tt-1',
      shots: [{ id: 's1' }]
    }
    const { wrapper } = await mountPage({
      params: { playlist_id: shown.id },
      state: { playlists: [shown] },
      getters: {
        playlistMap: state =>
          new Map(state.playlists.map(playlist => [playlist.id, playlist]))
      },
      actions: {
        loadPlaylist: vi.fn(() => Promise.resolve({ ...shown })),
        // No playlist has the task type picked.
        loadPlaylists: vi.fn(({ commit }) => {
          commit('LOAD_PLAYLISTS_END', [])
          return Promise.resolve()
        })
      }
    })
    await flushPromises()

    wrapper
      .findComponent(ComboboxTaskType)
      .vm.$emit('update:modelValue', 'tt-2')
    await flushPromises()

    expect(wrapper.find('.no-selection').exists()).toBe(false)
    const player = wrapper.findComponent(PlaylistPlayer)
    expect(player.props('playlist').name).toBe('Shown')
  })
})

describe('Playlist page, playlist deleted by a teammate', () => {
  // Playlist events reach every member of the production.
  const shown = { id: 'pl-1', name: 'Shown', project_id: 'p1', shots: [] }
  const other = { id: 'pl-2', name: 'Other', project_id: 'p1', shots: [] }
  const openShown = async ({ listed, loadPlaylist }) => {
    const page = await mountPage({
      params: { playlist_id: shown.id },
      state: { playlists: listed },
      getters: {
        playlistMap: state =>
          new Map(state.playlists.map(playlist => [playlist.id, playlist]))
      },
      mutations: {
        DELETE_PLAYLIST_END: (state, { id }) => {
          state.playlists = state.playlists.filter(
            playlist => playlist.id !== id
          )
        }
      },
      actions: {
        loadPlaylist:
          loadPlaylist ||
          vi.fn((context, { id }) =>
            Promise.resolve({ ...[shown, other].find(p => p.id === id) })
          )
      }
    })
    await flushPromises()
    routeHolder.router.push.mockClear()
    const onPlaylistDelete = page.socket.on.mock.calls.find(
      ([name]) => name === 'playlist:delete'
    )[1]
    return { ...page, onPlaylistDelete }
  }
  const pushedPlaylistId = () =>
    routeHolder.router.push.mock.calls[0][0].params?.playlist_id

  it('leaves the playlist shown once a teammate deletes it', async () => {
    const { onPlaylistDelete, store } = await openShown({
      listed: [shown, other]
    })

    onPlaylistDelete({ project_id: 'p1', playlist_id: shown.id })
    await flushPromises()

    expect(store.state.playlists.map(({ id }) => id)).toEqual([other.id])
    expect(routeHolder.router.push).toHaveBeenCalledTimes(1)
    expect(pushedPlaylistId()).toBe(other.id)
  })

  it('leaves the playlist shown past the list once a teammate deletes it', async () => {
    const { onPlaylistDelete } = await openShown({ listed: [other] })

    onPlaylistDelete({ project_id: 'p1', playlist_id: shown.id })
    await flushPromises()

    expect(routeHolder.router.push).toHaveBeenCalledTimes(1)
    expect(pushedPlaylistId()).toBe(other.id)
  })

  it('leaves the last playlist of the list once a teammate deletes it', async () => {
    const { onPlaylistDelete } = await openShown({ listed: [shown] })

    onPlaylistDelete({ project_id: 'p1', playlist_id: shown.id })
    await flushPromises()

    expect(routeHolder.router.push).toHaveBeenCalledTimes(1)
    expect(pushedPlaylistId()).toBeUndefined()
  })

  it('stays on the playlist shown when a teammate deletes another one', async () => {
    const { onPlaylistDelete, store } = await openShown({
      listed: [shown, other]
    })

    onPlaylistDelete({ project_id: 'p1', playlist_id: other.id })
    await flushPromises()

    expect(store.state.playlists.map(({ id }) => id)).toEqual([shown.id])
    expect(routeHolder.router.push).not.toHaveBeenCalled()
  })

  // The page loads the playlist of the address once its list is there: the
  // load then finds no playlist to open.
  it('stays on the address when a teammate deletes its playlist before the page loads it', async () => {
    let releaseList = null
    // The store answers a deleted playlist with an empty object.
    const loadPlaylist = vi.fn(() => Promise.resolve({}))
    const page = await mountPage({
      params: { playlist_id: shown.id },
      state: { playlists: [] },
      getters: {
        playlistMap: state =>
          new Map(state.playlists.map(playlist => [playlist.id, playlist]))
      },
      actions: {
        loadPlaylists: vi.fn(
          () =>
            new Promise(resolve => {
              releaseList = resolve
            })
        ),
        loadPlaylist
      }
    })
    await flushPromises()
    routeHolder.router.push.mockClear()
    const onPlaylistDelete = page.socket.on.mock.calls.find(
      ([name]) => name === 'playlist:delete'
    )[1]

    onPlaylistDelete({ project_id: 'p1', playlist_id: shown.id })
    expect(loadPlaylist).not.toHaveBeenCalled()
    releaseList()
    await flushPromises()

    expect(loadPlaylist).toHaveBeenCalled()
    expect(routeHolder.router.push).not.toHaveBeenCalled()
    expect(page.wrapper.vm.currentPlaylist).toEqual({ name: '' })
  })

  it('leaves the playlist of the address a teammate deletes while it loads', async () => {
    const { onPlaylistDelete } = await openShown({
      listed: [shown, other],
      loadPlaylist: vi.fn(() => new Promise(() => {}))
    })

    onPlaylistDelete({ project_id: 'p1', playlist_id: shown.id })
    await flushPromises()

    expect(routeHolder.router.push).toHaveBeenCalledTimes(1)
    expect(pushedPlaylistId()).toBe(other.id)
  })

  // A click changes the address at once, and the playlist shown once the
  // clicked one loads.
  it('keeps loading the playlist clicked when a teammate deletes the one still shown', async () => {
    const { onPlaylistDelete, wrapper } = await openShown({
      listed: [shown, other],
      loadPlaylist: vi.fn((context, { id }) =>
        id === shown.id ? Promise.resolve({ ...shown }) : new Promise(() => {})
      )
    })
    Object.assign(routeHolder.route, {
      params: { playlist_id: other.id },
      fullPath: `/${other.id}`
    })
    await flushPromises()

    onPlaylistDelete({ project_id: 'p1', playlist_id: shown.id })
    await flushPromises()

    expect(wrapper.vm.currentPlaylist.id).toBe(shown.id)
    expect(routeHolder.router.push).not.toHaveBeenCalled()
  })
})

describe('Playlist page, sequence playlist', () => {
  const sequence = { id: 'sq-1', name: 'SQ01' }

  beforeEach(() => sequenceStore.cache.sequenceMap.set(sequence.id, sequence))
  afterEach(() => sequenceStore.cache.sequenceMap.delete(sequence.id))

  it('names the episode of a sequence without writing on the cached one', async () => {
    const { wrapper } = await openPlaylist(
      { for_entity: 'sequence', shots: [{ id: 'sq-1', preview_files: {} }] },
      { state: { currentEpisode: { id: 'ep-a', name: 'E01' } } }
    )
    await flushPromises()

    const [entity] = wrapper.findComponent(PlaylistPlayer).props('entities')
    expect(entity.parent_name).toBe('E01')
    expect(sequence.episode_name).toBeUndefined()
  })
})

describe('Playlist page, sequence of a shot', () => {
  const shot = {
    id: 's1',
    name: 'SH010',
    sequence_id: 'sq-1',
    sequence_name: 'SQ01',
    episode_name: 'E01'
  }

  beforeEach(() => shotStore.cache.shotMap.set(shot.id, shot))
  afterEach(() => shotStore.cache.shotMap.delete(shot.id))

  const openOn = async (episodeId, query, shots) => {
    const { wrapper } = await openPlaylist(
      { for_entity: 'shot', shots },
      {
        query,
        state: { isTVShow: true, currentEpisode: { id: episodeId } },
        getters: { displayedShotsBySequence: () => [[shot]] }
      }
    )
    await flushPromises()
    return wrapper
  }

  // Sequence names repeat across episodes: All shots says which one.
  const cases = [
    ['all shots', 'all', { for_entity: 'shot' }, 'E01 / SQ01'],
    ['an episode', 'ep-a', {}, 'SQ01']
  ]

  it.each(cases)(
    'names it in the entries under %s',
    async (_, episodeId, query, name) => {
      const wrapper = await openOn(episodeId, query, [
        { id: 's1', preview_files: {} }
      ])

      const [entity] = wrapper.findComponent(PlaylistPlayer).props('entities')
      expect(entity.parent_name).toBe(name)
    }
  )

  it.each(cases)(
    'names it in the addition panel under %s',
    async (_, episodeId, query, name) => {
      const wrapper = await openOn(episodeId, query, [])

      const title = wrapper.find('.entity-group-title').element
      expect(title.firstChild.textContent.trim()).toBe(name)
    }
  )
})

// Zou serves an entry whose preview is unset or deleted without any: the page
// pins it to a preview of its own, so that it plays and that the edits of
// that entry find its stored row.
describe('Playlist page, entries without preview', () => {
  const shot = { id: 's1', name: 'SH01', preview_file_id: 'pf-1' }
  const file = (id, revision, duration) => ({
    id,
    revision,
    duration,
    extension: 'mp4',
    task_id: 't1',
    previews: []
  })
  const pinnedOn = previewFile => ({
    id: 's1',
    entity_id: 's1',
    preview_file_id: previewFile.id,
    preview_file_extension: 'mp4',
    preview_file_duration: previewFile.duration
  })

  beforeEach(() => shotStore.cache.shotMap.set(shot.id, shot))
  afterEach(() => shotStore.cache.shotMap.delete(shot.id))

  // The preview files of one task type, or of each task type.
  const openEntries = async (entries, previewFiles, playlistFields = {}) => {
    const pinState = { playlistEntryMap: new Map(), previewFileEntityMap: new Map() }
    const shots = entries.map(entry => ({
      ...entry,
      preview_files: Array.isArray(previewFiles)
        ? { tt: previewFiles }
        : previewFiles
    }))
    const { wrapper } = await openPlaylist(
      { for_entity: 'shot', shots, ...playlistFields },
      {
        mutations: {
          PIN_PLAYLIST_ENTRY: (state, payload) =>
            playlistStore.mutations.PIN_PLAYLIST_ENTRY(pinState, payload)
        }
      }
    )
    await flushPromises()
    return wrapper.findComponent(PlaylistPlayer).props('entities')
  }

  it('plays an entry without preview on the main preview of its shot', async () => {
    const [entity] = await openEntries(
      [{ id: 's1', entity_id: 's1' }],
      [file('pf-2', 2, 3), file('pf-1', 1, 2)]
    )

    expect(entity).toMatchObject({
      preview_file_id: 'pf-1',
      preview_file_extension: 'mp4',
      preview_file_duration: 2
    })
  })

  it('gives a second entry of the shot a revision of its own', async () => {
    const files = [file('pf-2', 2, 3), file('pf-1', 1, 2)]
    const entities = await openEntries(
      [pinnedOn(files[1]), { id: 's1', entity_id: 's1' }],
      files
    )

    expect(entities.map(e => e.preview_file_id)).toEqual(['pf-1', 'pf-2'])
  })

  it('shows no preview when every revision has its entry', async () => {
    const files = [file('pf-1', 1, 2)]
    const entities = await openEntries(
      [pinnedOn(files[0]), { id: 's1', entity_id: 's1' }],
      files
    )

    expect(entities.map(e => e.preview_file_id)).toEqual(['pf-1', undefined])
  })

  // As for an entity added to it, a playlist of a task type takes the
  // latest preview of that type, and no other.
  it('pins an entry of a task type playlist on its latest preview of that type', async () => {
    const [entity] = await openEntries(
      [{ id: 's1', entity_id: 's1' }],
      {
        'tt-compo': [file('pf-1', 1, 2)],
        'tt-anim': [file('pf-a2', 2, 3), file('pf-a1', 1, 2)]
      },
      { task_type_id: 'tt-anim' }
    )

    expect(entity.preview_file_id).toBe('pf-a2')
  })

  it('leaves an entry of a task type playlist without preview when that type has none', async () => {
    const [entity] = await openEntries(
      [{ id: 's1', entity_id: 's1' }],
      { 'tt-compo': [file('pf-1', 1, 2)] },
      { task_type_id: 'tt-anim' }
    )

    expect(entity.preview_file_id).toBeUndefined()
  })

  // Its edits find the stored row by that id: Zou leaves the key out on a
  // load, and serves an empty string for an added asset without preview.
  it('keeps the unset preview id of the stored row', async () => {
    const entities = await openEntries(
      [
        { id: 's1', entity_id: 's1' },
        { id: 's1', entity_id: 's1', preview_file_id: '' }
      ],
      []
    )

    expect(entities.map(e => e.preview_file_id)).toEqual([undefined, ''])
  })
})

// The browser still delivers a scroll queued before the unmount, or before the
// spinner replaced the entities to add, once their template ref is null.
describe('Playlist page, side column scroll', () => {
  const catchErrors = wrapper => {
    const errorHandler = vi.fn()
    wrapper.vm.$.appContext.config.errorHandler = errorHandler
    return errorHandler
  }

  it('ignores a scroll that reaches the detached playlist list', async () => {
    const { wrapper, actions } = await mountPage()
    await flushPromises()
    const errorHandler = catchErrors(wrapper)
    const list = wrapper.find('.playlist-list-column').element
    actions.loadMorePlaylists.mockClear()
    wrapper.unmount()

    list.dispatchEvent(new Event('scroll'))

    expect(errorHandler).not.toHaveBeenCalled()
    expect(actions.loadMorePlaylists).not.toHaveBeenCalled()
  })

  it('ignores a scroll of the addition panel while its shots load', async () => {
    const { wrapper, actions } = await openPlaylist(
      {},
      { state: { isShotsLoading: true } }
    )
    await flushPromises()
    const errorHandler = catchErrors(wrapper)

    await wrapper.find('.addition-section').trigger('scroll')

    expect(errorHandler).not.toHaveBeenCalled()
    expect(actions.displayMoreShots).not.toHaveBeenCalled()
  })

  it('ignores a scroll that reaches the detached addition panel', async () => {
    const { wrapper, actions } = await openPlaylist()
    await flushPromises()
    const errorHandler = catchErrors(wrapper)
    const panel = wrapper.find('.addition-section').element
    wrapper.unmount()

    panel.dispatchEvent(new Event('scroll'))

    expect(errorHandler).not.toHaveBeenCalled()
    expect(actions.displayMoreShots).not.toHaveBeenCalled()
  })
})

describe('Playlist page, client', () => {
  it('keeps the task type filter and the sort from a client', async () => {
    const { wrapper } = await mountPage({
      getters: { isCurrentUserClient: () => true }
    })
    expect(wrapper.findComponent(ComboboxTaskType).exists()).toBe(false)
    expect(wrapper.findComponent(Combobox).exists()).toBe(false)
  })
})
