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

const showsEmptyState = async ({ episodeSearchText = '', ...props } = {}) => {
  const wrapper = await mountEntityList(EpisodeList, {
    getters: { currentProduction: production, episodeSearchText },
    props: { displayedEpisodes: [], ...props }
  })
  const isShown = wrapper.find('empty-list-stub').exists()
  wrapper.unmount()
  return isShown
}

describe('lists/EpisodeList', () => {
  describe('empty state', () => {
    test('a production without any episode shows the empty state', async () => {
      expect(await showsEmptyState()).toBe(true)
    })

    test('a production with episodes hides the empty state', async () => {
      const displayedEpisodes = [{ id: 'episode-1', name: 'E01' }]
      expect(await showsEmptyState({ displayedEpisodes })).toBe(false)
    })

    test('a search returning nothing keeps the empty state hidden', async () => {
      expect(await showsEmptyState({ episodeSearchText: 'unknown' })).toBe(false)
    })

    test('the empty state waits for the loading to end', async () => {
      expect(await showsEmptyState({ isLoading: true })).toBe(false)
    })

    test('the empty state stays hidden on error', async () => {
      expect(await showsEmptyState({ isError: true })).toBe(false)
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
