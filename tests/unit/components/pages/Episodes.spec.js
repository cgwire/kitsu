import { flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import errors from '@/lib/errors'

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import Episodes from '@/components/pages/Episodes.vue'

import { mountEntityPage, production } from '../../fixtures/entity-page'
import { recordUnhandledRejections } from '../../fixtures/unhandled-rejections'

const mountPage = options =>
  mountEntityPage(Episodes, { listName: 'EpisodeList', ...options })

const episodeMap = projectId =>
  new Map([['episode-1', { id: 'episode-1', project_id: projectId }]])

describe('Episodes page', () => {
  test('loads the episodes of the production on mount', async () => {
    const { dispatched } = await mountPage({
      getters: {
        episodeMap: episodeMap('other-production'),
        episodeValidationColumns: ['task-type-1']
      }
    })

    expect(dispatched('loadEpisodesWithTasks')).toHaveLength(1)
  })

  test('keeps the episodes the store already holds', async () => {
    const { dispatched, list } = await mountPage({
      getters: {
        episodeMap: episodeMap(production.id),
        episodeValidationColumns: ['task-type-1']
      }
    })
    await flushPromises()

    expect(dispatched('loadEpisodesWithTasks')).toHaveLength(0)
    expect(list.selectTaskFromQuery).toHaveBeenCalled()
  })

  test('writes the search in the URL', async () => {
    const { wrapper, router, searchField } = await mountPage({})

    searchField.value = 'e01'
    await wrapper.findComponent({ name: 'SearchField' }).vm.$emit('change')
    await flushPromises()

    expect(router.currentRoute.value.query.search).toBe('e01')
  })

  // Writing back the search the URL already holds changes no route, so the
  // URL watcher cannot apply it: the page applies it to the list itself.
  test('applies the search of the URL on mount', async () => {
    const { dispatched } = await mountPage({
      getters: {
        episodeMap: episodeMap(production.id),
        episodeValidationColumns: ['task-type-1']
      },
      query: { search: 'e01' }
    })

    expect(dispatched('setEpisodeSearch')).toContainEqual([
      'setEpisodeSearch',
      'e01'
    ])
  })

  test('selects the task named in the URL', async () => {
    const { router, list, dispatched } = await mountPage({})
    list.selectTaskFromQuery.mockClear()

    await router.push({ query: { task_id: 'task-1' } })
    await flushPromises()

    expect(list.selectTaskFromQuery).toHaveBeenCalledTimes(1)
    expect(dispatched('clearSelectedEpisodes').length).toBeGreaterThan(0)
  })

  test('opens the edit modal on the episode of the list', async () => {
    const { wrapper } = await mountPage({})
    const episode = { id: 'episode-1', name: 'E01' }

    await wrapper
      .findComponent({ name: 'EpisodeList' })
      .vm.$emit('edit-clicked', episode)

    const modal = wrapper.findComponent(EditEpisodeModal)
    expect(modal.props('active')).toBe(true)
    expect(modal.props('episodeToEdit')).toEqual(episode)
  })

  // Close keeps the error of a failed save: the next edit opens without it.
  test('opens the next episode without the error of a failed edit', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountPage({
      actions: { editEpisode: () => Promise.reject(new Error('down')) }
    })
    const list = wrapper.findComponent({ name: 'EpisodeList' })
    const modal = () => wrapper.findComponent(EditEpisodeModal)

    await list.vm.$emit('edit-clicked', { id: 'episode-1', name: 'E01' })
    await modal().vm.$emit('confirm', { id: 'episode-1', name: 'E02' })
    await flushPromises()
    expect(modal().props('isError')).toBe(true)

    await modal().vm.$emit('cancel')
    await list.vm.$emit('edit-clicked', { id: 'episode-2', name: 'E03' })

    expect(modal().props('active')).toBe(true)
    expect(modal().props('isError')).toBe(false)
    vi.restoreAllMocks()
  })

  // Zou refuses a column named like another one of the same type.
  describe('metadata column modal', () => {
    const descriptor = { id: 'descriptor-1', name: 'Difficulty' }

    const mountColumnModal = async addMetadataDescriptor => {
      const { wrapper } = await mountPage({
        actions: { addMetadataDescriptor },
        getters: {
          currentProduction: { ...production, descriptors: [descriptor] }
        }
      })
      const list = wrapper.findComponent({ name: 'EpisodeList' })
      return { list, modal: () => wrapper.findComponent(AddMetadataModal) }
    }

    test.each([
      ['a new column', 'add-metadata'],
      ['a column edit', 'edit-metadata', descriptor.id]
    ])(
      'opens %s without the error of a refused column',
      async (_, event, descriptorId) => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const { list, modal } = await mountColumnModal(() =>
          Promise.reject(new Error('taken'))
        )

        await list.vm.$emit(event, descriptorId)
        await modal().vm.$emit('confirm', { name: 'Complexity' })
        await flushPromises()
        expect(modal().props('isError')).toBe(true)

        await modal().vm.$emit('cancel')
        await list.vm.$emit(event, descriptorId)

        expect(modal().props('active')).toBe(true)
        expect(modal().props('isError')).toBe(false)
        vi.restoreAllMocks()
      }
    )

    test('drops the error of a refused column on the next save', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { list, modal } = await mountColumnModal(
        vi
          .fn()
          .mockRejectedValueOnce(new Error('taken'))
          .mockResolvedValueOnce()
      )

      await list.vm.$emit('add-metadata')
      await modal().vm.$emit('confirm', { name: 'Difficulty' })
      await flushPromises()
      await modal().vm.$emit('confirm', { name: 'Complexity' })
      await flushPromises()

      expect(modal().props('active')).toBe(false)
      expect(modal().props('isError')).toBe(false)
      vi.restoreAllMocks()
    })
  })

  // The hard delete modal, which asks for the name, replaced the plain one.
  test('opens one delete modal on the episode of the list', async () => {
    const { wrapper } = await mountPage({})

    await wrapper
      .findComponent({ name: 'EpisodeList' })
      .vm.$emit('delete-clicked', { id: 'episode-1', name: 'E01' })

    const openModals = [
      ...wrapper.findAllComponents(DeleteModal),
      ...wrapper.findAllComponents(HardDeleteModal)
    ].filter(modal => modal.props('active'))
    expect(openModals).toHaveLength(1)
    expect(openModals[0].props('lockText')).toBe('E01')
  })
})

// The topbar switches the production under the mounted page, which then
// reloads the list of the new one.
describe('Episodes page, reload after a production switch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mountOnProduction = async loadEpisodesWithTasks => {
    const getters = reactive({
      currentProduction: production,
      episodeMap: episodeMap(production.id),
      episodeValidationColumns: ['task-type-1']
    })
    const page = await mountPage({ getters, actions: { loadEpisodesWithTasks } })
    const switchTo = async id => {
      getters.currentProduction = { ...production, id }
      await flushPromises()
    }
    return { ...page, switchTo }
  }

  const switchProduction = async loadEpisodesWithTasks => {
    const page = await mountOnProduction(loadEpisodesWithTasks)
    await page.switchTo('production-2')
    return page
  }

  const requestFailure = () => {
    const failure = new Error('Request has been terminated')
    errors.markRequestFailure(failure)
    return failure
  }

  const listOf = wrapper => wrapper.findComponent({ name: 'EpisodeList' })

  test('logs a failed reload of the list', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = requestFailure()

    const rejections = await recordUnhandledRejections(() =>
      switchProduction(() => Promise.reject(failure))
    )

    expect(rejections).toEqual([])
    expect(consoleError).toHaveBeenCalledWith(failure)
  })

  test('leaves a bug in the reload of the list to Sentry', async () => {
    const bug = new TypeError('Cannot read properties of undefined')

    const rejections = await recordUnhandledRejections(() =>
      switchProduction(() => Promise.reject(bug))
    )

    expect(rejections).toEqual([bug])
  })

  // The store still holds the episodes, columns and saved searches of the
  // production left.
  test('shows the loading error instead of the production left', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = requestFailure()

    const { wrapper } = await switchProduction(() => Promise.reject(failure))

    expect(listOf(wrapper).props('isError')).toBe(true)
    expect(listOf(wrapper).props('validationColumns')).toEqual([])
    expect(wrapper.findComponent({ name: 'SearchQueryList' }).exists()).toBe(
      false
    )
  })

  test('clears the loading error once a reload succeeds', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const load = vi.fn().mockRejectedValueOnce(requestFailure())
    const { wrapper, switchTo } = await mountOnProduction(load)

    await switchTo('production-2')
    expect(listOf(wrapper).props('isError')).toBe(true)
    await switchTo('production-3')

    expect(listOf(wrapper).props('isError')).toBe(false)
    expect(listOf(wrapper).props('validationColumns')).toEqual(['task-type-1'])
  })

  test('ignores the failure of a production left since', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let failLeftLoad = null
    const load = vi.fn().mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          failLeftLoad = reject
        })
    )
    const { wrapper, switchTo } = await mountOnProduction(load)

    await switchTo('production-2')
    await switchTo('production-3')
    failLeftLoad(requestFailure())
    await flushPromises()

    expect(listOf(wrapper).props('isError')).toBe(false)
  })

  // Back on a production whose first load is still running: that load
  // fails after the newer one succeeded.
  test('ignores a failure overtaken by a newer load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let failFirstLoad = null
    const load = vi.fn().mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          failFirstLoad = reject
        })
    )
    const { wrapper, switchTo } = await mountOnProduction(load)

    await switchTo('production-2')
    await switchTo(production.id)
    await switchTo('production-2')
    failFirstLoad(requestFailure())
    await flushPromises()

    expect(listOf(wrapper).props('isError')).toBe(false)
  })

  test('shows the loading state until the new list arrives', async () => {
    let endLoad = null
    const { wrapper, switchTo } = await mountOnProduction(
      () =>
        new Promise(resolve => {
          endLoad = resolve
        })
    )
    const savedSearches = () =>
      wrapper.findComponent({ name: 'SearchQueryList' })

    await switchTo('production-2')
    expect(listOf(wrapper).props('isLoading')).toBe(true)
    expect(savedSearches().exists()).toBe(false)
    endLoad()
    await flushPromises()

    expect(listOf(wrapper).props('isLoading')).toBe(false)
    expect(savedSearches().exists()).toBe(true)
  })

  test('keeps the loading state until the latest load ends', async () => {
    const endLoads = []
    const { wrapper, switchTo } = await mountOnProduction(
      () =>
        new Promise(resolve => {
          endLoads.push(resolve)
        })
    )

    await switchTo('production-2')
    await switchTo('production-3')
    endLoads[0]()
    await flushPromises()
    expect(listOf(wrapper).props('isLoading')).toBe(true)
    endLoads[1]()
    await flushPromises()

    expect(listOf(wrapper).props('isLoading')).toBe(false)
  })
})

// The creation of tasks reloads the list too.
describe('Episodes page, reload after a task creation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mountAndCreateTasks = async ({ query } = {}) => {
    let endLoad = null
    const page = await mountPage({
      getters: {
        episodeListScrollPosition: 1200,
        episodeMap: episodeMap(production.id),
        episodeValidationColumns: ['task-type-1']
      },
      actions: {
        loadEpisodesWithTasks: () =>
          new Promise(resolve => {
            endLoad = resolve
          })
      },
      query
    })
    await page.wrapper.findComponent(CreateTasksModal).vm.$emit('confirm', {
      form: { task_type_id: 'task-type-1' },
      selectionOnly: false
    })
    await flushPromises()
    const endReload = async () => {
      endLoad()
      await flushPromises()
    }
    return { ...page, endReload }
  }

  const listOf = wrapper => wrapper.findComponent({ name: 'EpisodeList' })

  test('shows the loading state while the list reloads', async () => {
    const { wrapper, endReload } = await mountAndCreateTasks()

    expect(listOf(wrapper).props('isLoading')).toBe(true)
    await endReload()

    expect(listOf(wrapper).props('isLoading')).toBe(false)
  })

  test('applies the search of the URL after a reload of the list', async () => {
    const { store, dispatched, endReload } = await mountAndCreateTasks({
      query: { search: 'e01' }
    })
    store.dispatch.mockClear()

    await endReload()

    expect(dispatched('setEpisodeSearch')).toContainEqual([
      'setEpisodeSearch',
      'e01'
    ])
  })

  // Hiding the rows during the load scrolls the list back to the top.
  test('keeps the scroll position of the list', async () => {
    const { wrapper, store, list, endReload } = await mountAndCreateTasks()
    const isLoadingAtRestore = []
    list.setScrollPosition.mockClear()
    list.setScrollPosition.mockImplementation(() => {
      isLoadingAtRestore.push(listOf(wrapper).props('isLoading'))
    })

    listOf(wrapper).vm.$emit('scroll', 0)
    await endReload()
    listOf(wrapper).vm.$emit('scroll', 1300)

    expect(list.setScrollPosition).toHaveBeenLastCalledWith(1200)
    expect(isLoadingAtRestore).toEqual([false])
    expect(store.commit.mock.calls).toEqual([
      ['SET_EPISODE_LIST_SCROLL_POSITION', 1300]
    ])
  })
})

describe('Episodes page, first load', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('shows the loading error of a failed first load', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('Request has been terminated')
    errors.markRequestFailure(failure)

    const { wrapper } = await mountPage({
      actions: { loadEpisodesWithTasks: () => Promise.reject(failure) }
    })
    await flushPromises()
    vi.advanceTimersByTime(200)
    await flushPromises()

    const list = wrapper.findComponent({ name: 'EpisodeList' })
    expect(list.props('isError')).toBe(true)
    expect(list.props('isLoading')).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(failure)
  })

  test('leaves a bug in the first load to Sentry', async () => {
    const bug = new TypeError('Cannot read properties of undefined')

    const rejections = await recordUnhandledRejections(async () => {
      await mountPage({
        actions: { loadEpisodesWithTasks: () => Promise.reject(bug) }
      })
      await flushPromises()
    })

    expect(rejections).toEqual([bug])
  })
})
