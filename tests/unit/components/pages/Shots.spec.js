import { vi } from 'vitest'

// Importing the shots page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import Shots from '@/components/pages/Shots.vue'

describe('Shots page, reloadEpisodeShotsIfNeeded', () => {
  const production = { id: 'p' }

  // The method only reads its component instance, so a plain object is
  // enough to exercise the staleness decision without mounting the page.
  const buildContext = (overrides = {}) => {
    const context = {
      currentProduction: production,
      currentEpisode: null,
      isTVShow: false,
      shotsLoadingKey: 'p/',
      displayedSequences: [],
      displayedShots: [],
      isShotsLoading: false,
      initialLoading: false,
      loadShots: vi.fn(() => Promise.resolve()),
      applySearchFromUrl: vi.fn(),
      $refs: {},
      $store: { commit: vi.fn() },
      ...overrides
    }
    context.isAllEpisodes = Shots.computed.isAllEpisodes.call(context)
    return context
  }

  const run = context => {
    Shots.methods.reloadEpisodeShotsIfNeeded.call(context)
    return context
  }

  test('reloads when a coerced episode switch left the All dataset in the store', () => {
    const context = buildContext({
      isTVShow: true,
      currentEpisode: { id: 'ep-a' },
      shotsLoadingKey: 'p/all',
      // Episodes and rows are sorted by episode name, so the first rows of a
      // production-wide dataset belong to the first episode: the per-episode
      // checks pass by construction and only the scope tells them apart.
      displayedSequences: [
        { id: 'sq-1', episode_id: 'ep-a' },
        { id: 'sq-2', episode_id: 'ep-b' }
      ],
      displayedShots: [
        { id: 's1', episode_id: 'ep-a' },
        { id: 's2', episode_id: 'ep-b' }
      ]
    })

    run(context)

    expect(context.loadShots).toHaveBeenCalled()
    expect(context.initialLoading).toBe(true)
  })

  test('does not reload when the store holds the displayed episode', () => {
    const context = buildContext({
      isTVShow: true,
      currentEpisode: { id: 'ep-a' },
      shotsLoadingKey: 'p/ep-a',
      displayedSequences: [{ id: 'sq-1', episode_id: 'ep-a' }],
      displayedShots: [{ id: 's1', episode_id: 'ep-a' }]
    })

    run(context)

    expect(context.loadShots).not.toHaveBeenCalled()
  })

  test('does not reload when the store already holds the production-wide dataset', () => {
    const context = buildContext({
      isTVShow: true,
      currentEpisode: { id: 'all' },
      shotsLoadingKey: 'p/all',
      displayedSequences: [
        { id: 'sq-1', episode_id: 'ep-a' },
        { id: 'sq-2', episode_id: 'ep-b' }
      ],
      displayedShots: [
        { id: 's1', episode_id: 'ep-a' },
        { id: 's2', episode_id: 'ep-b' }
      ]
    })

    run(context)

    expect(context.isAllEpisodes).toBe(true)
    expect(context.loadShots).not.toHaveBeenCalled()
  })

  test('reloads in All mode when the store only holds one episode', () => {
    const context = buildContext({
      isTVShow: true,
      currentEpisode: { id: 'all' },
      shotsLoadingKey: 'p/ep-a',
      displayedSequences: [{ id: 'sq-1', episode_id: 'ep-a' }],
      displayedShots: [{ id: 's1', episode_id: 'ep-a' }]
    })

    run(context)

    expect(context.loadShots).toHaveBeenCalled()
  })

  test('does not reload a non-TV-show production loaded under the empty scope', () => {
    const context = buildContext({ shotsLoadingKey: 'p/' })

    run(context)

    expect(context.loadShots).not.toHaveBeenCalled()
  })

  test('reloads when the store holds another production', () => {
    const context = buildContext({ shotsLoadingKey: 'other-p/' })

    run(context)

    expect(context.loadShots).toHaveBeenCalled()
  })
})
