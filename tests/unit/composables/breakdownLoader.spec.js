// @vitest-environment node
import { vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { createStore } from 'vuex'

import { useBreakdownLoader } from '@/composables/breakdownLoader'

const production = { id: 'p1', production_type: 'tvshow' }
const otherProduction = { id: 'p2', production_type: 'tvshow' }

// The loader runs on a store whose scope (production, episode) the tests move
// from inside the load actions, as the topbar does during a real load.
const setup = ({ state = {}, actions = {} } = {}) => {
  const storeActions = {
    loadAssets: vi.fn(() => Promise.resolve()),
    loadEpisodes: vi.fn(() => Promise.resolve()),
    loadSequences: vi.fn(() => Promise.resolve()),
    loadShots: vi.fn(() => Promise.resolve()),
    setCastingEpisode: vi.fn(),
    setCastingForProductionEpisodes: vi.fn(),
    ...actions
  }
  const store = createStore({
    state: () => ({
      currentEpisode: { id: 'ep-a' },
      currentProduction: production,
      isTVShow: true,
      ...state
    }),
    getters: {
      currentEpisode: state => state.currentEpisode,
      currentProduction: state => state.currentProduction,
      isTVShow: state => state.isTVShow
    },
    actions: storeActions
  })
  const onLoaded = vi.fn()
  const scope = effectScope()
  const loader = scope.run(() => useBreakdownLoader(store, onLoaded))
  return { loader, store, scope, onLoaded, actions: storeActions }
}

// Moves the scope of the store and lets the loader watchers see it, as they
// would between two steps of a real load.
const moveScope = async (store, scope) => {
  Object.assign(store.state, scope)
  await nextTick()
}

// Lets a load started by a watcher or by the previous load run to its end.
const flush = () => new Promise(resolve => setTimeout(resolve))

describe('useBreakdownLoader', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('loads the scope and settles on its episode', async () => {
    const { loader, actions, onLoaded } = setup()

    await loader.load()

    expect(actions.loadSequences).toHaveBeenCalledTimes(1)
    expect(actions.loadShots).toHaveBeenCalledTimes(1)
    expect(actions.loadAssets.mock.calls[0][1]).toEqual({
      all: true,
      withTasks: true
    })
    expect(actions.setCastingEpisode.mock.calls[0][1]).toBe('ep-a')
    expect(onLoaded).toHaveBeenCalledTimes(1)
    expect(loader.episodeId.value).toBe('ep-a')
    expect(loader.isLoading.value).toBe(false)
  })

  test('skips sequences and shots on the episode casting', async () => {
    const { loader, actions } = setup({
      state: { currentEpisode: { id: 'all' } }
    })

    await loader.load()

    expect(actions.loadSequences).not.toHaveBeenCalled()
    expect(actions.loadShots).not.toHaveBeenCalled()
    expect(actions.loadAssets).toHaveBeenCalledTimes(1)
  })

  test('clears the casting episode outside TV shows', async () => {
    const { loader, actions } = setup({
      state: { isTVShow: false, currentEpisode: null }
    })

    await loader.load()

    expect(actions.loadEpisodes).not.toHaveBeenCalled()
    expect(actions.setCastingEpisode.mock.calls[0][1]).toBe(null)
  })

  // The watchers ignore a change made while the loader runs: the load itself
  // has to notice the switch once it settles.
  test('loads again when the episode changed during the load', async () => {
    const { loader, store, actions } = setup({
      actions: {
        loadShots: vi.fn(() =>
          moveScope(store, { currentEpisode: { id: 'ep-b' } })
        )
      }
    })

    await loader.load()
    await flush()

    expect(actions.loadAssets).toHaveBeenCalledTimes(2)
    expect(loader.episodeId.value).toBe('ep-b')
    expect(loader.isLoading.value).toBe(false)
  })

  test('loads again when the production changed during the load', async () => {
    const { loader, store, actions } = setup({
      actions: {
        loadShots: vi.fn(() =>
          moveScope(store, { currentProduction: otherProduction })
        )
      }
    })

    await loader.load()
    await flush()

    expect(actions.loadAssets).toHaveBeenCalledTimes(2)
  })

  // The topbar fetches the episodes too: its response rebuilds the episode
  // objects in the middle of the load, without changing the scope.
  test('loads once when the same episode is rebuilt during the load', async () => {
    const { loader, store, actions } = setup({
      actions: {
        loadSequences: vi.fn(() =>
          moveScope(store, { currentEpisode: { id: 'ep-a' } })
        )
      }
    })

    await loader.load()
    await flush()

    expect(actions.loadAssets).toHaveBeenCalledTimes(1)
  })

  test('loads once when the same production is rebuilt during the load', async () => {
    const { loader, store, actions } = setup({
      actions: {
        loadSequences: vi.fn(() =>
          moveScope(store, { currentProduction: { ...production } })
        )
      }
    })

    await loader.load()
    await flush()

    expect(actions.loadAssets).toHaveBeenCalledTimes(1)
  })

  // On a page reload the topbar sets the production of the route right
  // before the page mounts: the watcher reports that change once the load has
  // started, although the load already serves the new production.
  test('loads once when the scope moved right before the load', async () => {
    const { loader, store, actions } = setup()
    store.state.currentProduction = otherProduction
    store.state.currentEpisode = { id: 'ep-b' }

    await loader.load()
    await flush()

    expect(actions.loadAssets).toHaveBeenCalledTimes(1)
    expect(loader.episodeId.value).toBe('ep-b')
  })

  // A switch that comes back to the episode the run started with leaves the
  // store on the other one.
  test('loads again when the episode moved and came back', async () => {
    const { loader, store, actions } = setup({
      actions: {
        loadSequences: vi
          .fn(() => Promise.resolve())
          .mockImplementationOnce(() =>
            moveScope(store, { currentEpisode: { id: 'ep-b' } })
          ),
        loadShots: vi.fn(() =>
          moveScope(store, { currentEpisode: { id: 'ep-a' } })
        )
      }
    })

    await loader.load()
    await flush()

    expect(actions.loadAssets).toHaveBeenCalledTimes(2)
  })

  // Leaving the page during the load must not replay it: the ghost reload
  // would push a production-wide dataset under the page displayed next.
  test('stops the chain once its scope is disposed', async () => {
    const { loader, store, scope, actions, onLoaded } = setup({
      actions: {
        loadShots: vi.fn(async () => {
          await moveScope(store, { currentEpisode: { id: 'ep-b' } })
          scope.stop()
        })
      }
    })

    await loader.load()
    await flush()

    expect(loader.isLoading.value).toBe(false)
    expect(actions.loadAssets).not.toHaveBeenCalled()
    expect(actions.setCastingEpisode).not.toHaveBeenCalled()
    expect(onLoaded).not.toHaveBeenCalled()
  })

  test('loads nothing on a disposed scope', async () => {
    const { loader, scope, actions } = setup()
    scope.stop()

    await loader.load()

    expect(actions.loadSequences).not.toHaveBeenCalled()
    expect(actions.loadAssets).not.toHaveBeenCalled()
  })

  // The topbar resolves the route episode asynchronously: starting the load
  // before it lands costs a full production-wide second pass. The resolution
  // fires the episode watcher like any change: it must not count as a move.
  test('resolves the episode before loading on a direct link', async () => {
    const { loader, store, actions } = setup({
      state: { currentEpisode: null },
      actions: {
        loadEpisodes: vi.fn(() =>
          moveScope(store, { currentEpisode: { id: 'ep-a' } })
        )
      }
    })

    await loader.load()
    await flush()

    expect(actions.loadEpisodes).toHaveBeenCalledTimes(1)
    expect(actions.loadAssets).toHaveBeenCalledTimes(1)
    expect(loader.episodeId.value).toBe('ep-a')
  })

  // The episodes fetch can fail like any other: the loader must come back to
  // life, or the watchers stay muted behind a stuck loading flag.
  test('releases the loading flag when the episodes fetch fails', async () => {
    const { loader } = setup({
      state: { currentEpisode: null },
      actions: {
        loadEpisodes: vi.fn(() => Promise.reject(new Error('down')))
      }
    })

    await loader.load()

    expect(loader.isLoading.value).toBe(false)
  })

  test('loads the new scope when it changes between two loads', async () => {
    const { loader, store, actions } = setup()
    await loader.load()

    await moveScope(store, { currentEpisode: { id: 'ep-b' } })
    await flush()

    expect(actions.loadAssets).toHaveBeenCalledTimes(2)
    expect(loader.episodeId.value).toBe('ep-b')
  })

  // The episode casting reads the castings of the production, already there:
  // only the displayed episode changes.
  test('switches to the episode casting without loading', async () => {
    const { loader, store, actions } = setup()
    await loader.load()

    await moveScope(store, { currentEpisode: { id: 'all' } })
    await flush()

    expect(actions.loadAssets).toHaveBeenCalledTimes(1)
    expect(loader.episodeId.value).toBe('all')
  })
})
