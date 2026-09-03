import { vi } from 'vitest'

// Importing the edits page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import Edits from '@/components/pages/Edits.vue'

describe('Edits page, reloadEpisodeEditsIfNeeded', () => {
  const production = { id: 'p' }

  // The method only reads its component instance, so a plain object is
  // enough to exercise the staleness decision without mounting the page.
  const buildContext = (overrides = {}) => {
    const context = {
      currentProduction: production,
      currentEpisode: null,
      isTVShow: false,
      editsLoadingKey: 'p/',
      initialLoading: false,
      loadEdits: vi.fn(),
      $refs: {},
      $store: { commit: vi.fn() },
      ...overrides
    }
    context.reset = () => Edits.methods.reset.call(context)
    return context
  }

  const run = context => {
    Edits.methods.reloadEpisodeEditsIfNeeded.call(context)
    return context
  }

  test('reloads when the store holds another episode', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-b' },
        editsLoadingKey: 'p/ep-a'
      })
    )

    expect(context.loadEdits).toHaveBeenCalled()
    expect(context.initialLoading).toBe(true)
  })

  test('reloads when the store holds the production-wide dataset', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        editsLoadingKey: 'p/all'
      })
    )

    expect(context.loadEdits).toHaveBeenCalled()
  })

  test('does not reload when the store holds the displayed episode', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        editsLoadingKey: 'p/ep-a'
      })
    )

    expect(context.loadEdits).not.toHaveBeenCalled()
    expect(context.initialLoading).toBe(false)
  })

  test('does not reload on a production without episodes', () => {
    const context = run(
      buildContext({
        // A stale currentEpisode left by a previous TV show must not make an
        // episode-less production look out of scope.
        currentEpisode: { id: 'ep-a' },
        editsLoadingKey: 'p/'
      })
    )

    expect(context.loadEdits).not.toHaveBeenCalled()
  })

  test('does nothing while no production is set', () => {
    const context = run(
      buildContext({ currentProduction: null, editsLoadingKey: null })
    )

    expect(context.loadEdits).not.toHaveBeenCalled()
  })
})
