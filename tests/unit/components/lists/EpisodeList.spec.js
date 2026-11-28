vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'

import EpisodeList from '@/components/lists/EpisodeList.vue'

import {
  columnCounts,
  descriptor,
  filledColumns,
  mountEntityList,
  mountEntityListInPage,
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

  describe('episode count', () => {
    const showsCount = async props => {
      const wrapper = await mountEntityList(EpisodeList, {
        getters: { currentProduction: production, displayedEpisodesLength: 1 },
        props: { displayedEpisodes: [{ id: 'episode-1', name: 'E01' }], ...props }
      })
      const isShown = wrapper.find('.nb-episodes').exists()
      wrapper.unmount()
      return isShown
    }

    test('the count shows under the episodes', async () => {
      expect(await showsCount()).toBe(true)
    })

    // The page keeps the rows of the production left when the list of the
    // new one fails: their count must not show either.
    test('the count stays hidden on error', async () => {
      expect(await showsCount({ isError: true })).toBe(false)
    })
  })

  describe('create tasks button', () => {
    const showsCreateTasks = async props => {
      const wrapper = await mountEntityList(EpisodeList, {
        getters: {
          currentProduction: production,
          isCurrentUserProductionManager: true
        },
        props: { displayedEpisodes: [{ id: 'episode-1', name: 'E01' }], ...props }
      })
      const isShown = wrapper
        .find('th.actions button-simple-stub[text="tasks.create_tasks"]')
        .exists()
      wrapper.unmount()
      return isShown
    }

    test('the button shows above the episodes', async () => {
      expect(await showsCreateTasks()).toBe(true)
    })

    // The rows held on error belong to the production left.
    test('the button stays hidden on error', async () => {
      expect(await showsCreateTasks({ isError: true })).toBe(false)
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

  test('keeps the sticky metadata columns while the infos are hidden', async () => {
    const wrapper = await mountEntityList(EpisodeList, {
      getters: {
        currentProduction: production,
        displayedEpisodesLength: 1,
        episodeFilledColumns: filledColumns,
        episodeMetadataDescriptors: [descriptor]
      },
      props: {
        displaySettings: { showInfos: false },
        displayedEpisodes: [{ id: 'episode-1', name: 'E01', data: {} }]
      }
    })

    const cells = wrapper.findAll('tbody td.metadata-descriptor')
    expect(cells).toHaveLength(1)
    const { header, row } = columnCounts(wrapper)
    expect(row).toBe(header)
    expect(cells[0].element.style.left).toBe('200px')
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

describe('lists/EpisodeList task panel', () => {
  test('unselects the cell of a task the task panel removes', async () => {
    const wrapper = await mountEntityListInPage(EpisodeList, {
      getters: {
        currentProduction: production,
        displayedEpisodesLength: 2,
        episodeFilledColumns: filledColumns
      },
      props: {
        displayedEpisodes: ['episode-1', 'episode-2'].map(id => ({ id, name: id, data: {} }))
      }
    })
    const task = {
      id: 'task-episode-2',
      entity_id: 'episode-2',
      task_type_id: taskTypeId
    }

    wrapper.vm.$refs.list.unselectTask(task)

    expect(wrapper.vm.$store.commit).toHaveBeenCalledWith(
      'REMOVE_SELECTED_TASK',
      { task, x: 1, y: 0 }
    )

    wrapper.unmount()
  })
})
