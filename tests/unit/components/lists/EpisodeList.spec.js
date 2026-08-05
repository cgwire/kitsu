vi.mock('@/store', () => ({ default: {} }))

import EpisodeList from '@/components/lists/EpisodeList.vue'

const isEmptyList = EpisodeList.computed.isEmptyList

// displayedEpisodes is a flat list of episodes, not a list of groups like
// displayedShots.
const buildContext = overrides => ({
  displayedEpisodes: [],
  isLoading: false,
  isError: false,
  episodeSearchText: '',
  ...overrides
})

describe('lists/EpisodeList', () => {
  describe('isEmptyList', () => {
    test('a production without any episode shows the empty state', () => {
      expect(isEmptyList.call(buildContext())).toBe(true)
    })

    test('a production with episodes hides the empty state', () => {
      const context = buildContext({ displayedEpisodes: [{ id: 'episode-1' }] })
      expect(isEmptyList.call(context)).toBe(false)
    })

    test('a search returning nothing keeps the empty state hidden', () => {
      const context = buildContext({ episodeSearchText: 'unknown' })
      expect(isEmptyList.call(context)).toBe(false)
    })

    test('the empty state waits for the loading to end', () => {
      expect(isEmptyList.call(buildContext({ isLoading: true }))).toBe(false)
    })

    test('the empty state stays hidden on error', () => {
      expect(isEmptyList.call(buildContext({ isError: true }))).toBe(false)
    })
  })
})
