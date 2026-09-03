import { vi } from 'vitest'

// Importing the assets page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import Assets from '@/components/pages/Assets.vue'

describe('Assets page, reloadEpisodeAssetsIfNeeded', () => {
  const production = { id: 'p' }

  // The method only reads its component instance, so a plain object is
  // enough to exercise the staleness decision without mounting the page.
  const buildContext = (overrides = {}) => ({
    currentProduction: production,
    currentEpisode: null,
    isTVShow: false,
    assetsLoadingKey: 'p/',
    isAssetsLoading: false,
    initialLoading: false,
    loadAssets: vi.fn(() => Promise.resolve()),
    applySearchFromUrl: vi.fn(),
    $refs: {},
    $store: { commit: vi.fn() },
    ...overrides
  })

  const run = context => {
    Assets.methods.reloadEpisodeAssetsIfNeeded.call(context)
    return context
  }

  test('reloads when the store holds another episode', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-b' },
        assetsLoadingKey: 'p/ep-a'
      })
    )

    expect(context.loadAssets).toHaveBeenCalled()
    expect(context.initialLoading).toBe(true)
  })

  test('reloads when the store holds the production-wide dataset', () => {
    // Assets cast in from other episodes are legitimate rows of an episode
    // load, so only the recorded scope tells an All dataset from an episode
    // one: the rows themselves cannot.
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        assetsLoadingKey: 'p/all'
      })
    )

    expect(context.loadAssets).toHaveBeenCalled()
  })

  test('does not reload when the store holds the displayed episode', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        assetsLoadingKey: 'p/ep-a'
      })
    )

    expect(context.loadAssets).not.toHaveBeenCalled()
    expect(context.initialLoading).toBe(false)
  })

  test('does not reload for the all and main pseudo-episodes already loaded', () => {
    const all = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'all' },
        assetsLoadingKey: 'p/all'
      })
    )
    const main = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'main' },
        assetsLoadingKey: 'p/main'
      })
    )

    expect(all.loadAssets).not.toHaveBeenCalled()
    expect(main.loadAssets).not.toHaveBeenCalled()
  })

  test('does not reload on a production without episodes', () => {
    const context = run(
      buildContext({
        // A stale currentEpisode left by a previous TV show must not make an
        // episode-less production look out of scope.
        currentEpisode: { id: 'ep-a' },
        assetsLoadingKey: 'p/'
      })
    )

    expect(context.loadAssets).not.toHaveBeenCalled()
  })

  test('does nothing while no production is set', () => {
    const context = run(
      buildContext({ currentProduction: null, assetsLoadingKey: null })
    )

    expect(context.loadAssets).not.toHaveBeenCalled()
  })
})
