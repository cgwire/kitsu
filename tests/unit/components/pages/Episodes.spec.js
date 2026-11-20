import { flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import csv from '@/lib/csv'
import errors from '@/lib/errors'
import en from '@/locales/en'
import fr from '@/locales/fr.json'

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import Episodes from '@/components/pages/Episodes.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

import {
  mountEntityPage,
  production,
  reimportExport
} from '../../fixtures/entity-page'
import { buildSearchQueryListStub } from '../../fixtures/search-query-list'
import { recordUnhandledRejections } from '../../fixtures/unhandled-rejections'

const mountPage = options =>
  mountEntityPage(Episodes, { listName: 'EpisodeList', ...options })

const episodeMap = projectId =>
  new Map([
    [
      'episode-1',
      { id: 'episode-1', project_id: projectId, validations: new Map() }
    ]
  ])

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
        episodeValidationColumns: ['task-type-1'],
        isEpisodeListLoadedWithTasks: true
      }
    })
    await flushPromises()

    expect(dispatched('loadEpisodesWithTasks')).toHaveLength(0)
    expect(list.selectTaskFromQuery).toHaveBeenCalled()
  })

  test('opens the search filter modal on Save', async () => {
    const SearchQueryList = buildSearchQueryListStub()
    const { wrapper } = await mountPage({ stubs: { SearchQueryList } })

    wrapper.findComponent({ name: 'SearchField' }).vm.$emit('save', 'e01')

    expect(SearchQueryList.methods.addSearch).toHaveBeenCalledWith('e01')
  })

  // An episode received live joins the store without its tasks.
  test('loads the tasks of the rows the store holds without them', async () => {
    const { dispatched } = await mountPage({
      getters: {
        episodeMap: new Map([
          [
            'episode-1',
            {
              id: 'episode-1',
              project_id: production.id,
              validations: new Map()
            }
          ],
          ['episode-2', { id: 'episode-2', project_id: production.id }]
        ]),
        episodeValidationColumns: ['task-type-1'],
        isEpisodeListLoadedWithTasks: true
      }
    })

    expect(dispatched('loadEpisodesWithTasks')).toHaveLength(1)
  })

  // A production that started empty, its episodes all created from the Shots
  // page: the store holds them with their tasks, but never loaded the list
  // with them, and a new episode would leave the sort.
  test('loads the list the store never loaded with its tasks', async () => {
    const { dispatched } = await mountPage({
      getters: {
        episodeMap: episodeMap(production.id),
        episodeValidationColumns: ['task-type-1']
      }
    })

    expect(dispatched('loadEpisodesWithTasks')).toHaveLength(1)
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
        episodeValidationColumns: ['task-type-1'],
        isEpisodeListLoadedWithTasks: true
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
      episodeValidationColumns: ['task-type-1'],
      isEpisodeListLoadedWithTasks: true
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

  // The store still holds the rows and saved searches of the production left.
  test('shows the loading error instead of the production left', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = requestFailure()

    const { wrapper } = await switchProduction(() => Promise.reject(failure))

    expect(listOf(wrapper).props('isError')).toBe(true)
    expect(listOf(wrapper).props('validationColumns')).toEqual([])
    expect(wrapper.findComponent({ name: 'SearchQueryList' }).exists()).toBe(
      false
    )
    expect(wrapper.findComponent({ name: 'SearchField' }).props('canSave')).toBe(
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
    const saveButton = () =>
      wrapper.findComponent({ name: 'SearchField' }).props('canSave')

    await switchTo('production-2')
    expect(listOf(wrapper).props('isLoading')).toBe(true)
    expect(savedSearches().exists()).toBe(false)
    expect(saveButton()).toBe(false)
    endLoad()
    await flushPromises()

    expect(listOf(wrapper).props('isLoading')).toBe(false)
    expect(savedSearches().exists()).toBe(true)
    expect(saveButton()).toBe(true)
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
        episodeValidationColumns: ['task-type-1'],
        isEpisodeListLoadedWithTasks: true
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

describe('Episodes page, CSV', () => {
  afterEach(() => vi.restoreAllMocks())

  const mountCsvPage = ({ getters = {}, ...options } = {}) =>
    mountPage({
      getters: {
        isCurrentUserProductionManager: true,
        isTVShow: true,
        isEpisodeListLoadedWithTasks: true,
        episodeMap: new Map([
          [
            'episode-1',
            {
              id: 'episode-1',
              name: 'E01',
              project_id: production.id,
              validations: new Map()
            }
          ]
        ]),
        episodeValidationColumns: ['task-type-1'],
        ...getters
      },
      ...options
    })

  const exportFile = async options => {
    const buildCsvFile = vi.spyOn(csv, 'buildCsvFile').mockReturnValue('')
    const { wrapper } = await mountCsvPage({
      // The page tells how to write the status of an episode.
      actions: {
        getEpisodesCsvLines: ({ extraValues }) => [
          extraValues.map(getValue => getValue({ status: 'running' }))
        ]
      },
      locale: 'en',
      messages: en,
      ...options
    })
    await wrapper
      .findAllComponents(ButtonSimple)
      .find(button => button.props('icon') === 'export')
      .vm.$emit('click')
    await flushPromises()
    const [name, [headers, ...lines]] = buildCsvFile.mock.calls[0]
    return { name, headers, lines }
  }

  test('offers the import and the export to the managers', async () => {
    const { wrapper } = await mountCsvPage()

    expect(
      wrapper.findAllComponents(ButtonSimple).map(button => button.props('icon'))
    ).toEqual(expect.arrayContaining(['import', 'export']))
  })

  test('writes the status in the language of the user', async () => {
    const { headers, lines } = await exportFile({
      getters: {
        currentProduction: {
          ...production,
          descriptors: [
            {
              name: 'Contractor',
              field_name: 'contractor',
              entity_type: 'Episode',
              data_type: 'string'
            }
          ]
        },
        isEpisodeTime: true,
        isEpisodeEstimation: true,
        episodeValidationColumns: ['tt-1'],
        taskTypeMap: new Map([['tt-1', { name: 'Script' }]])
      },
      locale: 'fr',
      messages: fr.default
    })

    const { episodes, main } = fr.default
    expect(headers).toEqual([
      episodes.fields.name,
      episodes.fields.description,
      main.status,
      'Contractor',
      episodes.fields.time_spent,
      main.estimation_short,
      'Script',
      'Script assignations'
    ])
    expect(lines).toEqual([[episodes.status.running]])
  })

  // The Episodes page shows every episode, whatever the topbar holds.
  test('names the file after the production only', async () => {
    const { name } = await exportFile({
      getters: { currentEpisode: { id: 'episode-1', name: 'E01' } }
    })

    expect(name).toMatch(/_kitsu_production_episodes$/)
  })

  test('identifies a line by its name and reads its status', async () => {
    const { wrapper } = await mountCsvPage()

    const modal = wrapper.findComponent(ImportRenderModal)
    expect(modal.props('dataMatchers')).toEqual(['Name'])
    expect(modal.props('requiredValues')).toEqual(['Name'])
    expect(modal.props('entityType')).toBe('Episode')
    expect(modal.props('database')).toEqual({ E01: true })
    expect(wrapper.findComponent(ImportModal).props('optionalColumns')).toEqual(
      ['Description', 'Status']
    )
  })

  // The export writes the labels of the language of the user.
  test('imports back a file exported in the language of the user', async () => {
    const { wrapper } = await mountCsvPage({
      getters: { episodeValidationColumns: [] },
      actions: { getEpisodesCsvLines: () => [] },
      locale: 'fr',
      messages: fr.default
    })

    const { exported, imported } = await reimportExport(wrapper)

    const { episodes, main } = fr.default
    expect(exported).toEqual([
      episodes.fields.name,
      episodes.fields.description,
      main.status
    ])
    expect(imported).toEqual(['Name', 'Description', 'Status'])
  })

  // Zou reads the values only, in any case, and refuses the others.
  test('uploads a status written in the language of the user as its value', async () => {
    const turnEntriesToCsvString = vi.spyOn(csv, 'turnEntriesToCsvString')
    const uploadEpisodeFile = vi.fn(() => Promise.resolve())
    const { wrapper, store, dispatched } = await mountCsvPage({
      actions: { uploadEpisodeFile },
      locale: 'fr',
      messages: fr.default
    })
    const loadsBefore = dispatched('loadEpisodesWithTasks').length
    const { status } = fr.default.episodes

    await wrapper.findComponent(ImportRenderModal).vm.$emit(
      'confirm',
      [
        ['Name', 'Status'],
        ['E01', status.running.toUpperCase()],
        ['E02', 'complete'],
        ['E03', 'Bogus']
      ],
      true
    )
    await flushPromises()

    expect(turnEntriesToCsvString.mock.calls[0][0]).toEqual([
      ['Name', 'Status'],
      ['E01', 'running'],
      ['E02', 'complete'],
      ['E03', 'Bogus']
    ])
    expect(store.commit).toHaveBeenCalledWith(
      'EPISODE_CSV_FILE_SELECTED',
      expect.any(FormData)
    )
    expect(uploadEpisodeFile).toHaveBeenCalledWith(true)
    expect(dispatched('loadEpisodesWithTasks')).toHaveLength(loadsBefore + 1)
  })
})
