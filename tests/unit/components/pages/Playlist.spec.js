import { flushPromises, shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
const routeHolder = vi.hoisted(() => ({ route: null }))
vi.mock('vue-router', () => ({
  useRoute: () => routeHolder.route,
  useRouter: () => ({ push: vi.fn() })
}))

import '@/lib/auth'
import editStore from '@/store/modules/edits'

import Playlist from '@/components/pages/Playlist.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

beforeEach(() => {
  localStorage.removeItem('playlist-sort')
  routeHolder.route = reactive({ params: {}, query: {}, fullPath: '/' })
})

// The page mounted last, for the actions that leave it during its first run.
let mountedWrapper = null

// The page is mounted on a store whose scope (production, episode) the tests
// move, as the topbar does. Its first reload runs on the tick after the mount.
const mountPage = async ({
  state = {},
  actions = {},
  getters = {},
  query = {},
  params = {}
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
    loadMorePlaylists: vi.fn(() => Promise.resolve([])),
    loadPlaylist: resolved(),
    loadPlaylistShareLinks: vi.fn(() => Promise.resolve([])),
    loadPlaylists: resolved(),
    loadShots: resolved(),
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
      editsLoadingKey: fromState('editsLoadingKey'),
      isAssetsLoading: () => false,
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      isEditsLoading: fromState('isEditsLoading'),
      isEpisodesLoading: () => false,
      isShotsLoading: fromState('isShotsLoading'),
      isTVShow: fromState('isTVShow'),
      playlistMap: () => new Map(),
      playlists: fromState('playlists'),
      playlistsPath: () => ({ name: 'playlists' }),
      productionTaskTypes: () => [],
      shotSearchText: () => '',
      shotsByEpisode: () => [],
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
      }
    },
    actions: storeActions
  })
  const socket = { on: vi.fn(), off: vi.fn() }
  const wrapper = shallowMount(Playlist, {
    global: {
      plugins: [store],
      config: { globalProperties: { $socket: socket } },
      mocks: { $t: key => key },
      stubs: { RouterLink: true }
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
  const episodeOne = playlist({ episode_id: 'ep-1', for_entity: 'shot' })
  const shotQuery = { for_entity: 'shot' }

  // The store keeps the last loaded list across pages: it is fetched again
  // on mount only when it belongs to another scope.
  it.each([
    // Coming back to All assets after a visit of the All shots playlists.
    ['another all-mode entity type', allShots, 'all', {}, 'p1', true],
    ['the all assets list', allAssets, 'all', {}, 'p1', false],
    ['the all shots list', allShots, 'all', shotQuery, 'p1', false],
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

describe('Playlist page, loadShots on mount', () => {
  it('loads nothing for the pseudo-episodes', async () => {
    const { actions } = await mountPage({
      state: {
        isTVShow: true,
        currentEpisode: { id: 'all' },
        shotsLoadingKey: 'p1/ep-a'
      }
    })
    await flushPromises()

    expect(actions.loadShots).not.toHaveBeenCalled()
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

describe('Playlist page, addition buttons', () => {
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
})

describe('Playlist page, task status of the entities to add', () => {
  const edit = {
    id: 'e1',
    name: 'Edit',
    validations: new Map([['tt-1', 'task-1']])
  }

  beforeEach(() => editStore.cache.editMap.set(edit.id, edit))
  afterEach(() => editStore.cache.editMap.delete(edit.id))

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
