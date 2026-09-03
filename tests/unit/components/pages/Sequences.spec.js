import { vi } from 'vitest'

// Importing the sequences page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import Sequences from '@/components/pages/Sequences.vue'

describe('Sequences page, reloadEpisodeSequencesIfNeeded', () => {
  const production = { id: 'p' }

  // The method only reads its component instance, so a plain object is
  // enough to exercise the staleness decision without mounting the page.
  const buildContext = (overrides = {}) => {
    const context = {
      currentProduction: production,
      currentEpisode: null,
      isTVShow: false,
      sequencesLoadingKey: 'p/',
      initialLoading: false,
      loadSequencesWithTasks: vi.fn(),
      applySearchFromUrl: vi.fn(),
      $refs: {},
      $store: { commit: vi.fn() },
      ...overrides
    }
    context.reset = () => Sequences.methods.reset.call(context)
    return context
  }

  const run = context => {
    Sequences.methods.reloadEpisodeSequencesIfNeeded.call(context)
    return context
  }

  test('reloads when the store holds another episode', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-b' },
        sequencesLoadingKey: 'p/ep-a'
      })
    )

    expect(context.loadSequencesWithTasks).toHaveBeenCalled()
  })

  test('reloads when the store holds the production-wide dataset', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        sequencesLoadingKey: 'p/all'
      })
    )

    expect(context.loadSequencesWithTasks).toHaveBeenCalled()
  })

  test('does not reload when the store holds the displayed episode', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        sequencesLoadingKey: 'p/ep-a'
      })
    )

    expect(context.loadSequencesWithTasks).not.toHaveBeenCalled()
  })

  test('does not reload on a production without episodes', () => {
    const context = run(
      buildContext({
        // A stale currentEpisode left by a previous TV show must not make an
        // episode-less production look out of scope.
        currentEpisode: { id: 'ep-a' },
        sequencesLoadingKey: 'p/'
      })
    )

    expect(context.loadSequencesWithTasks).not.toHaveBeenCalled()
  })

  test('does nothing while no production is set', () => {
    const context = run(
      buildContext({ currentProduction: null, sequencesLoadingKey: null })
    )

    expect(context.loadSequencesWithTasks).not.toHaveBeenCalled()
  })
})
