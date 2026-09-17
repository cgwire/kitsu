import { vi } from 'vitest'

// Importing the page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import Breakdown from '@/components/pages/Breakdown.vue'

describe('Breakdown page, reloadEntities', () => {
  const production = { id: 'p1', production_type: 'tvshow' }

  // The page logs the failed episodes fetch: keep that expected error out
  // of the test output.
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // The method only reads its component instance, so a plain object is
  // enough to exercise the reload decision without mounting the page.
  const buildContext = (overrides = {}) => ({
    isTVShow: true,
    currentProduction: production,
    currentEpisode: { id: 'ep-a' },
    episodeId: '',
    assetTypeId: null,
    sequenceId: null,
    isLoading: false,
    isUnmounted: false,
    hasScopeMoved: false,
    loadEpisodes: vi.fn(() => Promise.resolve()),
    castingType: 'shot',
    loadSequences: vi.fn(() => Promise.resolve()),
    loadShots: vi.fn(() => Promise.resolve()),
    loadAssets: vi.fn(() => Promise.resolve()),
    setCastingEpisode: vi.fn(),
    setCastingForProductionEpisodes: vi.fn(),
    displayMoreAssets: vi.fn(),
    fillAssetList: vi.fn(),
    setCastingAssetTypes: vi.fn(),
    setCastingAssetType: vi.fn(),
    setCastingSequence: vi.fn(),
    resetSequenceOption: vi.fn(),
    resetSelection: vi.fn(),
    resetColumnWidth: vi.fn(),
    reset: vi.fn(),
    ...overrides
  })

  // The currentEpisode watcher ignores a change made while the page loads:
  // the load itself has to notice the switch once it settles.
  test('reloads when the episode changed during the load', async () => {
    const context = buildContext()
    context.loadShots = vi.fn(() => {
      context.currentEpisode = { id: 'ep-b' }
      return Promise.resolve()
    })

    await Breakdown.methods.reloadEntities.call(context)

    expect(context.isLoading).toBe(false)
    expect(context.reset).toHaveBeenCalledTimes(1)
    expect(context.resetColumnWidth).not.toHaveBeenCalled()
  })

  test('reloads when the production changed during the load', async () => {
    const context = buildContext()
    context.loadShots = vi.fn(() => {
      context.currentProduction = { id: 'p2', production_type: 'tvshow' }
      return Promise.resolve()
    })

    await Breakdown.methods.reloadEntities.call(context)

    expect(context.reset).toHaveBeenCalledTimes(1)
    // Same as the currentProduction watcher, which the load short-circuited.
    expect(context.resetColumnWidth).toHaveBeenCalledTimes(1)
  })

  // Leaving the page during the load must not replay it: the ghost reload
  // would push a production-wide dataset under the page displayed next.
  test('does not reload once the page is unmounted', async () => {
    const context = buildContext()
    context.loadShots = vi.fn(() => {
      context.currentEpisode = { id: 'ep-b' }
      context.isUnmounted = true
      return Promise.resolve()
    })

    await Breakdown.methods.reloadEntities.call(context)

    expect(context.reset).not.toHaveBeenCalled()
    // The production-wide load would land under the page displayed next.
    expect(context.loadAssets).not.toHaveBeenCalled()
    expect(context.setCastingEpisode).not.toHaveBeenCalled()
  })

  // The watchers are inert while the page loads, so a switch that comes back
  // to the episode the run started with leaves the store on the other one.
  test('reloads when the episode moved and came back during the load', async () => {
    const context = buildContext()
    context.loadSequences = vi.fn(() => {
      Breakdown.watch.currentEpisode.call(
        Object.assign(context, { currentEpisode: { id: 'ep-b' } })
      )
      return Promise.resolve()
    })
    context.loadShots = vi.fn(() => {
      Breakdown.watch.currentEpisode.call(
        Object.assign(context, { currentEpisode: { id: 'ep-a' } })
      )
      return Promise.resolve()
    })

    await Breakdown.methods.reloadEntities.call(context)

    expect(context.reset).toHaveBeenCalledTimes(1)
  })

  // The topbar resolves the route episode asynchronously: starting the load
  // before it lands costs a full production-wide second pass. The resolution
  // fires the episode watcher like any change: it must not count as a move.
  test('resolves the episode before loading on a direct link', async () => {
    const context = buildContext({ currentEpisode: null })
    context.loadEpisodes = vi.fn(() => {
      Breakdown.watch.currentEpisode.call(
        Object.assign(context, { currentEpisode: { id: 'ep-a' } })
      )
      return Promise.resolve()
    })

    await Breakdown.methods.reloadEntities.call(context)

    expect(context.loadEpisodes).toHaveBeenCalledTimes(1)
    expect(context.reset).not.toHaveBeenCalled()
    expect(context.episodeId).toBe('ep-a')
  })

  // The episodes fetch can fail like any other: the page must come back
  // to life, or the watchers stay muted behind a stuck loading flag.
  test('releases the loading flag when the episodes fetch fails', async () => {
    const context = buildContext({ currentEpisode: null })
    context.loadEpisodes = vi.fn(() => Promise.reject(new Error('down')))

    await Breakdown.methods.reloadEntities.call(context)

    expect(context.isLoading).toBe(false)
    expect(context.reset).not.toHaveBeenCalled()
  })

  test('loads nothing when the page unmounts during the episodes fetch', async () => {
    const context = buildContext({ currentEpisode: null })
    context.loadEpisodes = vi.fn(() => {
      context.isUnmounted = true
      return Promise.resolve()
    })

    await Breakdown.methods.reloadEntities.call(context)

    expect(context.loadSequences).not.toHaveBeenCalled()
    expect(context.loadAssets).not.toHaveBeenCalled()
  })

  test('loads nothing on an unmounted page', async () => {
    const context = buildContext({ isUnmounted: true })

    await Breakdown.methods.reloadEntities.call(context)

    expect(context.loadSequences).not.toHaveBeenCalled()
    expect(context.loadAssets).not.toHaveBeenCalled()
  })

  test('settles on the episode it loaded', async () => {
    const context = buildContext()

    await Breakdown.methods.reloadEntities.call(context)

    expect(context.episodeId).toBe('ep-a')
    expect(context.reset).not.toHaveBeenCalled()
  })
})

describe('Breakdown page, removeOneAssetFromSelection', () => {
  // The casting map only carries the entities the API returned, so an
  // entity without any asset has no key at all: the selection is built
  // from the full entity list and can still include it.
  const buildContext = (overrides = {}) => ({
    selection: { 'shot-a': true, 'shot-b': true },
    casting: {
      'shot-a': [{ asset_id: 'asset-1', nb_occurences: 2 }]
    },
    isEpisodeCasting: false,
    loading: { remove: false },
    errors: { remove: false },
    saveErrors: {},
    removeAssetFromCasting: vi.fn(),
    removeOneAsset: vi.fn(() => Promise.resolve()),
    castAsset: vi.fn(() => Promise.resolve()),
    ...overrides
  })

  test('skips a selected entity that has no casting', async () => {
    const context = buildContext()

    await Breakdown.methods.removeOneAssetFromSelection.call(
      context,
      'asset-1'
    )

    expect(context.removeAssetFromCasting).toHaveBeenCalledTimes(1)
    expect(context.removeAssetFromCasting).toHaveBeenCalledWith({
      entityId: 'shot-a',
      assetId: 'asset-1',
      nbOccurences: 1
    })
    expect(context.castAsset).toHaveBeenCalledWith({
      entityIds: ['shot-a'],
      assetId: 'asset-1'
    })
    expect(context.loading.remove).toBe(false)
  })
})

describe('Breakdown page, getEntityName', () => {
  const entity = { name: 'SH01', sequence_name: 'SEQ01' }

  test('prefixes the sequence on a TV show before the episode resolves', () => {
    const context = { sequenceId: 'all', isTVShow: true, currentEpisode: null }

    expect(Breakdown.methods.getEntityName.call(context, entity)).toBe(
      'SEQ01 / SH01'
    )
  })

  test('keeps the bare name on the episode casting', () => {
    const context = {
      sequenceId: 'all',
      isTVShow: true,
      currentEpisode: { id: 'all' }
    }

    expect(Breakdown.methods.getEntityName.call(context, entity)).toBe('SH01')
  })
})
