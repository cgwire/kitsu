vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'

import EpisodeList from '@/components/lists/EpisodeList.vue'

import {
  descriptor,
  filledColumns,
  mountEntityList,
  production,
  stickColumns,
  stickyLeft,
  stubHeaderWidths,
  taskTypeId
} from '../../fixtures/entity-list'

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

describe('lists/EpisodeList sticky columns', () => {
  beforeEach(() => {
    stubHeaderWidths()
    stickColumns('episode')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  const mountList = props =>
    mountEntityList(EpisodeList, {
      getters: {
        currentProduction: production,
        episodeFilledColumns: filledColumns,
        episodeMetadataDescriptors: [descriptor]
      },
      props
    })

  test('places the sticky columns right after the episode names', async () => {
    const wrapper = await mountList()

    expect(stickyLeft(wrapper, 'metadata-header-stub')).toBe('200px')
    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('320px')

    wrapper.unmount()
  })

  // The episodes page is no longer loading when the task types arrive.
  test('places the sticky task types once their columns arrive', async () => {
    const wrapper = await mountList({ validationColumns: [] })

    await wrapper.setProps({ validationColumns: [taskTypeId] })
    await flushPromises()

    expect(stickyLeft(wrapper, 'validation-header-stub')).toBe('320px')

    wrapper.unmount()
  })
})
