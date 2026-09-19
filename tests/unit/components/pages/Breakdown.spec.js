import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { createStore } from 'vuex'

// Importing the page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
// The route follows the pushes of the page, as the router would: the page
// watches the search of the URL it writes itself.
const routeHolder = vi.hoisted(() => ({ route: null }))
vi.mock('vue-router', () => ({
  useRoute: () => routeHolder.route,
  useRouter: () => ({
    push: location => {
      if (location.query) routeHolder.route.query = location.query
      return Promise.resolve()
    }
  })
}))
vi.mock('@/lib/preferences', () => ({
  default: {
    getBoolPreference: vi.fn(() => false),
    getPreference: vi.fn(() => null),
    setPreference: vi.fn()
  }
}))

import preferences from '@/lib/preferences'

import DeleteModal from '@/components/modals/DeleteModal.vue'
import Breakdown from '@/components/pages/Breakdown.vue'

const production = { id: 'p1', production_type: 'tvshow' }

// The page is mounted on a store whose scope (production, episode) the tests
// move from inside the load actions, as the topbar does during a real load.
beforeEach(() => {
  routeHolder.route = reactive({ params: {}, query: {}, path: '/' })
})

const mountPage = ({
  state = {},
  actions = {},
  getters = {},
  stubs = {},
  mixins = []
} = {}) => {
  const storeActions = {
    addAssetToCasting: vi.fn(),
    castAsset: vi.fn(() => Promise.resolve()),
    displayMoreAssets: vi.fn(),
    loadAssets: vi.fn(() => Promise.resolve()),
    loadEpisodes: vi.fn(() => Promise.resolve()),
    loadSequences: vi.fn(() => Promise.resolve()),
    loadShots: vi.fn(() => Promise.resolve()),
    removeAssetFromCasting: vi.fn(),
    setCastingAssetType: vi.fn(),
    setCastingAssetTypes: vi.fn(),
    setCastingEpisode: vi.fn(),
    setCastingForProductionEpisodes: vi.fn(),
    setCastingSequence: vi.fn(),
    setLastProductionScreen: vi.fn(),
    ...actions
  }
  const store = createStore({
    state: () => ({
      casting: {},
      currentEpisode: { id: 'ep-a' },
      currentProduction: production,
      isTVShow: true,
      ...state
    }),
    getters: {
      assetMetadataDescriptors: () => [],
      assetTypeMap: () => new Map(),
      assetsByType: () => [],
      breakdownSearchFilterGroups: () => [],
      breakdownSearchQueries: () => [],
      casting: state => state.casting,
      castingAssetTypeAssets: () => [],
      castingAssetTypesOptions: () => [],
      castingByType: () => ({}),
      castingEpisodes: () => [],
      castingSequenceShots: () => [],
      castingSequencesOptions: () => [],
      currentEpisode: state => state.currentEpisode,
      currentProduction: state => state.currentProduction,
      departmentMap: () => new Map(),
      displayedAssets: () => [],
      displayedSequences: () => [],
      episodes: () => [],
      isAssetsLoading: () => false,
      isCurrentUserProductionManager: () => true,
      isFrameIn: () => false,
      isFrameOut: () => false,
      isFrames: () => false,
      isShowInfosBreakdown: () => false,
      isTVShow: state => state.isTVShow,
      sequenceMap: () => new Map(),
      shotMetadataDescriptors: () => [],
      ...getters
    },
    actions: storeActions
  })
  const wrapper = shallowMount(Breakdown, {
    global: {
      plugins: [store],
      config: {
        globalProperties: { $socket: { on: vi.fn(), off: vi.fn() } }
      },
      mocks: { $t: key => key },
      mixins,
      // The page drives its search field through a ref.
      stubs: {
        SearchField: {
          name: 'SearchField',
          template: '<div />',
          methods: { getValue: () => '', setValue: () => {} }
        },
        ...stubs
      }
    }
  })
  return { wrapper, store, actions: storeActions }
}

// Moves the scope of the store and lets the page watchers see it, as they
// would between two steps of a real load.
const moveScope = async (store, scope) => {
  Object.assign(store.state, scope)
  await nextTick()
}

describe('Breakdown page, reloadEntities', () => {
  // Mounting schedules a first load: fake timers keep it from running, each
  // test drives reloadEntities on its own. A reload decided by the load shows
  // as the loading flag raised again, which is all reset() does synchronously.
  beforeEach(() => {
    vi.useFakeTimers()
    // The page logs the failed episodes fetch: keep that expected error out
    // of the test output.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // The currentEpisode watcher ignores a change made while the page loads:
  // the load itself has to notice the switch once it settles.
  test('reloads when the episode changed during the load', async () => {
    const { wrapper, store } = mountPage({
      actions: {
        loadShots: vi.fn(() =>
          moveScope(store, { currentEpisode: { id: 'ep-b' } })
        )
      }
    })
    preferences.getPreference.mockClear()

    await wrapper.vm.reloadEntities()

    expect(wrapper.vm.isLoading).toBe(true)
    expect(preferences.getPreference).not.toHaveBeenCalled()
  })

  test('reloads when the production changed during the load', async () => {
    const { wrapper, store } = mountPage({
      actions: {
        loadShots: vi.fn(() =>
          moveScope(store, {
            currentProduction: { id: 'p2', production_type: 'tvshow' }
          })
        )
      }
    })
    preferences.getPreference.mockClear()

    await wrapper.vm.reloadEntities()

    expect(wrapper.vm.isLoading).toBe(true)
    // Same as the currentProduction watcher, which the load short-circuited:
    // the column widths are read again.
    expect(preferences.getPreference).toHaveBeenCalled()
  })

  // Leaving the page during the load must not replay it: the ghost reload
  // would push a production-wide dataset under the page displayed next.
  test('does not reload once the page is unmounted', async () => {
    const { wrapper, store, actions } = mountPage({
      actions: {
        loadShots: vi.fn(async () => {
          await moveScope(store, { currentEpisode: { id: 'ep-b' } })
          wrapper.unmount()
        })
      }
    })

    await wrapper.vm.reloadEntities()

    expect(wrapper.vm.isLoading).toBe(false)
    // The production-wide load would land under the page displayed next.
    expect(actions.loadAssets).not.toHaveBeenCalled()
    expect(actions.setCastingEpisode).not.toHaveBeenCalled()
  })

  // The watchers are inert while the page loads, so a switch that comes back
  // to the episode the run started with leaves the store on the other one.
  test('reloads when the episode moved and came back during the load', async () => {
    const { wrapper, store } = mountPage({
      actions: {
        loadSequences: vi.fn(() =>
          moveScope(store, { currentEpisode: { id: 'ep-b' } })
        ),
        loadShots: vi.fn(() =>
          moveScope(store, { currentEpisode: { id: 'ep-a' } })
        )
      }
    })

    await wrapper.vm.reloadEntities()

    expect(wrapper.vm.isLoading).toBe(true)
  })

  // The topbar resolves the route episode asynchronously: starting the load
  // before it lands costs a full production-wide second pass. The resolution
  // fires the episode watcher like any change: it must not count as a move.
  test('resolves the episode before loading on a direct link', async () => {
    const { wrapper, store, actions } = mountPage({
      state: { currentEpisode: null },
      actions: {
        loadEpisodes: vi.fn(() =>
          moveScope(store, { currentEpisode: { id: 'ep-a' } })
        )
      }
    })

    await wrapper.vm.reloadEntities()

    expect(actions.loadEpisodes).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.episodeId).toBe('ep-a')
  })

  // The episodes fetch can fail like any other: the page must come back
  // to life, or the watchers stay muted behind a stuck loading flag.
  test('releases the loading flag when the episodes fetch fails', async () => {
    const { wrapper } = mountPage({
      state: { currentEpisode: null },
      actions: {
        loadEpisodes: vi.fn(() => Promise.reject(new Error('down')))
      }
    })

    await wrapper.vm.reloadEntities()

    expect(wrapper.vm.isLoading).toBe(false)
  })

  test('loads nothing when the page unmounts during the episodes fetch', async () => {
    const { wrapper, actions } = mountPage({
      state: { currentEpisode: null },
      actions: {
        loadEpisodes: vi.fn(async () => wrapper.unmount())
      }
    })

    await wrapper.vm.reloadEntities()

    expect(actions.loadSequences).not.toHaveBeenCalled()
    expect(actions.loadAssets).not.toHaveBeenCalled()
  })

  test('loads nothing on an unmounted page', async () => {
    const { wrapper, actions } = mountPage()
    const { reloadEntities } = wrapper.vm
    wrapper.unmount()

    await reloadEntities()

    expect(actions.loadSequences).not.toHaveBeenCalled()
    expect(actions.loadAssets).not.toHaveBeenCalled()
  })

  test('settles on the episode it loaded', async () => {
    const { wrapper } = mountPage()

    await wrapper.vm.reloadEntities()

    expect(wrapper.vm.episodeId).toBe('ep-a')
    expect(wrapper.vm.isLoading).toBe(false)
  })
})

describe('Breakdown page, removeOneAssetFromSelection', () => {
  // The casting map only carries the entities the API returned, so an
  // entity without any asset has no key at all: the selection is built
  // from the full entity list and can still include it.
  test('skips a selected entity that has no casting', async () => {
    const { wrapper, actions } = mountPage({
      state: {
        casting: { 'shot-a': [{ asset_id: 'asset-1', nb_occurences: 2 }] }
      }
    })
    wrapper.vm.selection = { 'shot-a': true, 'shot-b': true }

    await wrapper.vm.removeOneAssetFromSelection('asset-1')

    expect(actions.removeAssetFromCasting).toHaveBeenCalledTimes(1)
    expect(actions.removeAssetFromCasting.mock.calls[0][1]).toEqual({
      entityId: 'shot-a',
      assetId: 'asset-1',
      nbOccurences: 1
    })
    expect(actions.castAsset.mock.calls[0][1]).toEqual({
      entityIds: ['shot-a'],
      assetId: 'asset-1'
    })
    expect(wrapper.vm.loading.remove).toBe(false)
  })

  test('shows the error of a failed removal in the confirmation modal', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = mountPage({
      state: {
        casting: { 'shot-a': [{ asset_id: 'asset-1', nb_occurences: 2 }] }
      },
      actions: { castAsset: vi.fn(() => Promise.reject(new Error('down'))) }
    })
    wrapper.vm.selection = { 'shot-a': true }

    await wrapper.vm.removeOneAssetFromSelection('asset-1')
    await nextTick()

    expect(wrapper.findComponent(DeleteModal).props('isError')).toBe(true)
    expect(wrapper.vm.saveErrors).toEqual({ 'shot-a': true })
    vi.restoreAllMocks()
  })
})

describe('Breakdown page, getEntityName', () => {
  const entity = { name: 'SH01', sequence_name: 'SEQ01' }

  test('prefixes the sequence on a TV show before the episode resolves', () => {
    const { wrapper } = mountPage({ state: { currentEpisode: null } })

    expect(wrapper.vm.getEntityName(entity)).toBe('SEQ01 / SH01')
  })

  test('keeps the bare name on the episode casting', () => {
    const { wrapper } = mountPage({ state: { currentEpisode: { id: 'all' } } })

    expect(wrapper.vm.getEntityName(entity)).toBe('SH01')
  })
})

describe('Breakdown page, selection', () => {
  // A click must cost the lines it selects and unselects, not a render of the
  // whole page: the page lists every entity and every available asset.
  test('renders only the lines whose selection changed', async () => {
    const shots = ['shot-a', 'shot-b', 'shot-c'].map(id => ({
      id,
      name: id,
      sequence_name: 'SEQ01',
      data: {}
    }))
    const updates = {}
    const { wrapper } = mountPage({
      state: { isTVShow: false, currentEpisode: null },
      getters: {
        castingByType: () => ({}),
        castingSequenceShots: () => shots,
        isCurrentUserProductionSupervisor: () => false,
        user: () => ({ departments: [] })
      },
      stubs: { ShotLine: false },
      mixins: [
        {
          updated() {
            const name = this.$options.__name
            updates[name] = (updates[name] || 0) + 1
          }
        }
      ]
    })
    wrapper.vm.isLoading = false
    wrapper.vm.selection = { 'shot-a': false, 'shot-b': false, 'shot-c': false }
    await nextTick()
    const lines = wrapper.findAll('.shot')
    // The first selection also enables the available assets column.
    await lines[0].trigger('click')
    await nextTick()
    Object.keys(updates).forEach(name => delete updates[name])

    await lines[1].trigger('click')
    await nextTick()

    expect(lines[0].classes()).not.toContain('selected')
    expect(lines[1].classes()).toContain('selected')
    expect(updates).toEqual({ ShotLine: 2 })
  })

  // Casting an asset rewrites the casting of its entity only: the asset type
  // columns are unchanged, so the other lines have nothing to render.
  test('renders only the line whose casting changed', async () => {
    const shots = ['shot-a', 'shot-b', 'shot-c'].map(id => ({
      id,
      name: id,
      sequence_name: 'SEQ01',
      data: {}
    }))
    const castAsset = nbOccurences => [
      [
        {
          id: 'link-1',
          asset_id: 'asset-1',
          asset_name: 'Hero',
          name: 'Hero',
          asset_type_name: 'Characters',
          nb_occurences: nbOccurences
        }
      ]
    ]
    const updates = {}
    const { wrapper, store } = mountPage({
      state: {
        isTVShow: false,
        currentEpisode: null,
        castingByType: {
          'shot-a': castAsset(1),
          'shot-b': castAsset(1),
          'shot-c': castAsset(1)
        }
      },
      getters: {
        castingByType: state => state.castingByType,
        castingSequenceShots: () => shots,
        isCurrentUserProductionSupervisor: () => false,
        user: () => ({ departments: [] })
      },
      stubs: { ShotLine: false },
      mixins: [
        {
          updated() {
            // Stubs have no __name: the stubbed asset block of the line is
            // expected to update along with it.
            const name = this.$options.__name
            if (name) updates[name] = (updates[name] || 0) + 1
          }
        }
      ]
    })
    wrapper.vm.isLoading = false
    await nextTick()
    Object.keys(updates).forEach(name => delete updates[name])

    store.state.castingByType['shot-b'] = castAsset(2)
    await nextTick()

    expect(updates).toEqual({ ShotLine: 1 })
  })
})

describe('Breakdown page, asset search', () => {
  // The page writes the search in the URL and watches that same URL for the
  // searches coming from elsewhere (saved queries, back button).
  const search = async (wrapper, query) => {
    wrapper.findComponent({ name: 'SearchField' }).vm.$emit('change', query)
    await nextTick()
    await nextTick()
  }

  test('runs a typed search once', async () => {
    const setAssetSearch = vi.fn()
    const { wrapper } = mountPage({ actions: { setAssetSearch } })

    await search(wrapper, 'hero')

    expect(setAssetSearch).toHaveBeenCalledTimes(1)
    expect(setAssetSearch.mock.calls[0][1]).toBe('hero')
  })

  test('still applies a search coming from the URL', async () => {
    const setAssetSearch = vi.fn()
    mountPage({ actions: { setAssetSearch } })

    routeHolder.route.query = { search: 'saved' }
    await nextTick()

    expect(setAssetSearch).toHaveBeenCalledTimes(1)
    expect(setAssetSearch.mock.calls[0][1]).toBe('saved')
  })

  // The store keeps the number of assets displayed across searches: asking
  // for one more page on each of them made the list grow with every keystroke.
  test('does not display more assets on each search', async () => {
    // jsdom has no layout: an overflowing column keeps fillAssetList quiet.
    const overflow = { configurable: true, get: () => 1000 }
    const fit = { configurable: true, get: () => 500 }
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', overflow)
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', fit)
    const displayMoreAssets = vi.fn()
    const { wrapper } = mountPage({
      actions: { setAssetSearch: vi.fn(), displayMoreAssets }
    })

    await search(wrapper, 'hero')

    expect(displayMoreAssets).not.toHaveBeenCalled()
  })

  afterEach(() => {
    delete HTMLElement.prototype.scrollHeight
    delete HTMLElement.prototype.clientHeight
  })
})
