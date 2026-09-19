import { flushPromises, shallowMount } from '@vue/test-utils'
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

// The load races are covered by the spec of useBreakdownLoader.
describe('Breakdown page, loading', () => {
  test('loads on mount, without delay, and fills the page once loaded', async () => {
    const { wrapper, actions } = mountPage()

    await flushPromises()

    expect(actions.loadAssets).toHaveBeenCalledTimes(1)
    expect(actions.setCastingSequence.mock.calls[0][1]).toBe('all')
    expect(wrapper.vm.episodeId).toBe('ep-a')
    expect(wrapper.vm.isLoading).toBe(false)
  })

  // Coming from the Assets page, the store already holds the assets of its
  // episode: showing them until the production-wide load replaces them looks
  // like a list loading twice.
  test('hides the assets left by another page while it loads', async () => {
    const asset = { id: 'asset-1', name: 'Hero', asset_type_name: 'Characters' }
    const { wrapper } = mountPage({
      actions: { loadSequences: vi.fn(() => new Promise(() => {})) },
      getters: { assetsByType: () => [[asset]] }
    })
    await nextTick()

    expect(
      wrapper.findAllComponents({ name: 'AvailableAssetBlock' })
    ).toHaveLength(0)
  })

  test('reads the column widths of the production it switches to', async () => {
    const { store } = mountPage()
    await flushPromises()
    preferences.getPreference.mockClear()

    await moveScope(store, {
      currentProduction: { id: 'p2', production_type: 'tvshow' }
    })

    expect(preferences.getPreference).toHaveBeenCalled()
  })
})

describe('Breakdown page, live casting updates', () => {
  const shots = Array.from({ length: 50 }, (_, index) => ({
    id: `shot-${index}`,
    sequence_id: 'seq-1'
  }))

  const mountLivePage = async () => {
    const mounted = mountPage({
      actions: { loadShotCasting: vi.fn() },
      getters: {
        shotMap: () => new Map(shots.map(shot => [shot.id, shot]))
      }
    })
    await flushPromises()
    mounted.wrapper.vm.sequenceId = 'seq-1'
    mounted.actions.setCastingSequence.mockClear()
    vi.useFakeTimers()
    return mounted
  }

  afterEach(() => {
    vi.useRealTimers()
  })

  test('loads the casting of the few shots another user changed', async () => {
    const { wrapper, actions } = await mountLivePage()

    wrapper.vm.onShotCastingUpdate({ shot_id: 'shot-1' })
    wrapper.vm.onShotCastingUpdate({ shot_id: 'shot-2' })
    wrapper.vm.onShotCastingUpdate({ shot_id: 'shot-2' })
    vi.runAllTimers()

    expect(actions.loadShotCasting).toHaveBeenCalledTimes(2)
    expect(actions.setCastingSequence).not.toHaveBeenCalled()
  })

  // A casting pasted on 50 shots sends 50 events: one request for the whole
  // scope instead of one per shot.
  test('loads the scope once when many shots change together', async () => {
    const { wrapper, actions } = await mountLivePage()

    shots.forEach(shot => wrapper.vm.onShotCastingUpdate({ shot_id: shot.id }))
    vi.runAllTimers()

    expect(actions.loadShotCasting).not.toHaveBeenCalled()
    expect(actions.setCastingSequence).toHaveBeenCalledTimes(1)
  })

  test('drops the pending loads when the page is left', async () => {
    const { wrapper, actions } = await mountLivePage()

    wrapper.vm.onShotCastingUpdate({ shot_id: 'shot-1' })
    wrapper.unmount()
    vi.runAllTimers()

    expect(actions.loadShotCasting).not.toHaveBeenCalled()
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
    wrapper.vm.selection = new Set(['shot-a', 'shot-b'])

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
    wrapper.vm.selection = new Set(['shot-a'])

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
    await flushPromises()
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

  test('selects the lines between two shift clicks, in list order', async () => {
    const shots = ['shot-a', 'shot-b', 'shot-c', 'shot-d'].map(id => ({
      id,
      name: id,
      sequence_name: 'SEQ01',
      data: {}
    }))
    const { wrapper } = mountPage({
      state: { isTVShow: false, currentEpisode: null },
      getters: { castingSequenceShots: () => shots }
    })
    await flushPromises()

    wrapper.vm.selectEntity('shot-c', {})
    wrapper.vm.selectEntity('shot-a', { shiftKey: true })

    expect(wrapper.vm.selectedEntityIds.sort()).toEqual([
      'shot-a',
      'shot-b',
      'shot-c'
    ])
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
    const { store } = mountPage({
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
    await flushPromises()
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
    // One page only: after a long scroll, every keystroke would render all
    // the tiles loaded so far.
    expect(setAssetSearch.mock.calls[0][1]).toEqual({
      assetSearch: 'hero',
      isPageReset: true
    })
  })

  test('still applies a search coming from the URL', async () => {
    const setAssetSearch = vi.fn()
    mountPage({ actions: { setAssetSearch } })

    routeHolder.route.query = { search: 'saved' }
    await nextTick()

    expect(setAssetSearch).toHaveBeenCalledTimes(1)
    expect(setAssetSearch.mock.calls[0][1].assetSearch).toBe('saved')
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
    // The load of the page displays the first page of assets.
    await flushPromises()
    displayMoreAssets.mockClear()

    await search(wrapper, 'hero')

    expect(displayMoreAssets).not.toHaveBeenCalled()
  })

  afterEach(() => {
    delete HTMLElement.prototype.scrollHeight
    delete HTMLElement.prototype.clientHeight
  })
})
