import { flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import errors from '@/lib/errors'

import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import Sequences from '@/components/pages/Sequences.vue'

import { mountEntityPage, production } from '../../fixtures/entity-page'
import { recordUnhandledRejections } from '../../fixtures/unhandled-rejections'

// The store holds the sequences of the production: the page decides on
// mount whether their scope (episode) is the displayed one.
const mountPage = async getters => {
  const page = await mountEntityPage(Sequences, {
    listName: 'SequenceList',
    getters: {
      sequenceMap: new Map([
        ['sequence-1', { id: 'sequence-1', project_id: production.id }]
      ]),
      sequenceValidationColumns: ['task-type-1'],
      ...getters
    }
  })
  await flushPromises()
  return page.dispatched('loadSequencesWithTasks')
}

describe('Sequences page, reload of another episode', () => {
  test('reloads when the store holds another episode', async () => {
    const loads = await mountPage({
      isTVShow: true,
      currentEpisode: { id: 'ep-b' },
      sequencesLoadingKey: `${production.id}/ep-a`
    })

    expect(loads).toHaveLength(1)
  })

  test('reloads when the store holds the production-wide dataset', async () => {
    const loads = await mountPage({
      isTVShow: true,
      currentEpisode: { id: 'ep-a' },
      sequencesLoadingKey: `${production.id}/all`
    })

    expect(loads).toHaveLength(1)
  })

  test('does not reload when the store holds the displayed episode', async () => {
    const loads = await mountPage({
      isTVShow: true,
      currentEpisode: { id: 'ep-a' },
      sequencesLoadingKey: `${production.id}/ep-a`
    })

    expect(loads).toHaveLength(0)
  })

  test('does not reload on a production without episodes', async () => {
    const loads = await mountPage({
      currentEpisode: { id: 'ep-a' },
      sequencesLoadingKey: `${production.id}/`
    })

    expect(loads).toHaveLength(0)
  })
})

// The topbar switches the production under the mounted page, which then
// reloads the list of the new one.
describe('Sequences page, reload after a production switch', () => {
  // The mount on a loaded list ends with a 200 ms timer, which must not fire
  // in a later test.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const mountOnProduction = async loadSequencesWithTasks => {
    const getters = reactive({
      currentProduction: production,
      sequenceMap: new Map([
        ['sequence-1', { id: 'sequence-1', project_id: production.id }]
      ]),
      sequenceValidationColumns: ['task-type-1']
    })
    const page = await mountEntityPage(Sequences, {
      listName: 'SequenceList',
      getters,
      actions: { loadSequencesWithTasks }
    })
    const switchTo = async id => {
      getters.currentProduction = { ...production, id }
      await flushPromises()
    }
    return { ...page, switchTo }
  }

  const switchProduction = async loadSequencesWithTasks => {
    const page = await mountOnProduction(loadSequencesWithTasks)
    await page.switchTo('production-2')
    return page
  }

  const requestFailure = () => {
    const failure = new Error('Request has been terminated')
    errors.markRequestFailure(failure)
    return failure
  }

  const listOf = wrapper => wrapper.findComponent({ name: 'SequenceList' })

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

  // The store still holds the sequences, columns and saved searches of the
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
describe('Sequences page, reload after a task creation', () => {
  // The mount on a loaded list ends with a 200 ms timer, which must not fire
  // in a later test.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const mountAndCreateTasks = async ({ query } = {}) => {
    let endLoad = null
    const page = await mountEntityPage(Sequences, {
      listName: 'SequenceList',
      getters: {
        sequenceListScrollPosition: 1200,
        sequenceMap: new Map([
          ['sequence-1', { id: 'sequence-1', project_id: production.id }]
        ]),
        sequenceValidationColumns: ['task-type-1']
      },
      actions: {
        loadSequencesWithTasks: () =>
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

  const listOf = wrapper => wrapper.findComponent({ name: 'SequenceList' })

  test('shows the loading state while the list reloads', async () => {
    const { wrapper, endReload } = await mountAndCreateTasks()

    expect(listOf(wrapper).props('isLoading')).toBe(true)
    await endReload()

    expect(listOf(wrapper).props('isLoading')).toBe(false)
  })

  // The reloaded list holds every sequence of the episode.
  test('applies the search of the URL after a reload of the list', async () => {
    const { store, dispatched, endReload } = await mountAndCreateTasks({
      query: { search: 'sq01' }
    })
    store.dispatch.mockClear()

    await endReload()

    expect(dispatched('setSequenceSearch')).toContainEqual([
      'setSequenceSearch',
      'sq01'
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
      ['SET_SEQUENCE_LIST_SCROLL_POSITION', 1300]
    ])
  })
})

describe('Sequences page, first load', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('shows the loading error of a failed first load', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('Request has been terminated')
    errors.markRequestFailure(failure)

    const { wrapper } = await mountEntityPage(Sequences, {
      listName: 'SequenceList',
      actions: { loadSequencesWithTasks: () => Promise.reject(failure) }
    })
    await flushPromises()
    vi.advanceTimersByTime(200)
    await flushPromises()

    const list = wrapper.findComponent({ name: 'SequenceList' })
    expect(list.props('isError')).toBe(true)
    expect(list.props('isLoading')).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(failure)
  })

  test('leaves a bug in the first load to Sentry', async () => {
    const bug = new TypeError('Cannot read properties of undefined')

    const rejections = await recordUnhandledRejections(async () => {
      await mountEntityPage(Sequences, {
        listName: 'SequenceList',
        actions: { loadSequencesWithTasks: () => Promise.reject(bug) }
      })
      await flushPromises()
    })

    expect(rejections).toEqual([bug])
  })
})
