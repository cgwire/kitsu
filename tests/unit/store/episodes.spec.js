// @vitest-environment node

import { vi } from 'vitest'

// Importing the episodes module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import episodesStore from '@/store/modules/episodes'

describe('Episodes store', () => {
  describe('LOAD_EPISODES_END with no episodes', () => {
    test.each(['all', 'main'])(
      'resolves the %s pseudo-episode from the route',
      routeEpisodeId => {
        const state = { episodes: [] }
        episodesStore.mutations.LOAD_EPISODES_END(state, {
          episodes: [],
          routeEpisodeId
        })
        expect(state.currentEpisode).toEqual({ id: routeEpisodeId })
      }
    )

    test('keeps currentEpisode null without a route episode', () => {
      const state = { episodes: [] }
      episodesStore.mutations.LOAD_EPISODES_END(state, {
        episodes: [],
        routeEpisodeId: undefined
      })
      expect(state.currentEpisode).toBeNull()
    })
  })
})
