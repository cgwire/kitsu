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
import editStore from '@/store/modules/edits'
import playlistStore from '@/store/modules/playlists'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

import Playlist from '@/components/pages/Playlist.vue'
import PlaylistPlayer from '@/components/players/players/PlaylistPlayer.vue'
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
      mocks: { $t: key => key },
      stubs: { RouterLink: true, ...stubs }
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
})

describe('Playlist page, unreadable playlist', () => {
  // Playlist events reach every member of the production. A client can no
  // longer read a playlist made internal: its refetch resolves to null, and
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
        return Promise.resolve(null)
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
