import { flushPromises, RouterLinkStub, shallowMount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { createStore } from 'vuex'

// Importing the pages transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', async importOriginal => ({
  ...(await importOriginal()),
  useHead: vi.fn()
}))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))
const routeHolder = vi.hoisted(() => ({ route: null }))
vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () => routeHolder.route
}))

import { markRequestFailure } from '@/lib/errors'
import i18n from '@/lib/i18n'
import assetStore from '@/store/modules/assets'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

import EditAssetModal from '@/components/modals/EditAssetModal.vue'
import EditEditModal from '@/components/modals/EditEditModal.vue'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal.vue'
import EditSequenceModal from '@/components/modals/EditSequenceModal.vue'
import EditShotModal from '@/components/modals/EditShotModal.vue'
import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import Asset from '@/components/pages/Asset.vue'
import Edit from '@/components/pages/Edit.vue'
import Episode from '@/components/pages/Episode.vue'
import Sequence from '@/components/pages/Sequence.vue'
import Shot from '@/components/pages/Shot.vue'
import EntityOutputFiles from '@/components/pages/entities/EntityOutputFiles.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ConceptCard from '@/components/widgets/ConceptCard.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'

import { recordUnhandledRejections } from '../fixtures/unhandled-rejections'

const production = { id: 'production-1' }

const pages = [
  {
    name: 'Asset',
    entityAction: 'loadAsset',
    listAction: 'loadAssets',
    page: Asset,
    entityParam: 'asset_id',
    listRoute: 'assets',
    entityMap: assetStore.cache.assetMap,
    editAction: 'editAsset',
    editModal: EditAssetModal
  },
  {
    name: 'Edit',
    entityAction: 'loadEdit',
    listAction: 'loadEdits',
    page: Edit,
    entityParam: 'edit_id',
    listRoute: 'edits',
    entityMap: editStore.cache.editMap,
    editAction: 'editEdit',
    editModal: EditEditModal
  },
  {
    name: 'Episode',
    page: Episode,
    entityParam: 'episode_id',
    listRoute: 'episodes',
    entityMap: episodeStore.cache.episodeMap,
    editAction: 'editEpisode',
    editModal: EditEpisodeModal
  },
  {
    name: 'Sequence',
    listAction: 'loadSequencesWithTasks',
    page: Sequence,
    entityParam: 'sequence_id',
    listRoute: 'sequences',
    entityMap: sequenceStore.cache.sequenceMap,
    editAction: 'editSequence',
    editModal: EditSequenceModal
  },
  {
    name: 'Shot',
    entityAction: 'loadShot',
    listAction: 'loadShots',
    page: Shot,
    entityParam: 'shot_id',
    listRoute: 'shots',
    entityMap: shotStore.cache.shotMap,
    editAction: 'editShot',
    editModal: EditShotModal
  }
]

// Unless a test puts it in the cache of its store module, the entity of the
// URL is found nowhere: the pages tell it is missing, but Episode, which
// leaves an episode the topbar does not know to the topbar.
const mountPage = async (
  page,
  entityParam,
  currentProduction,
  actions = {},
  getters = {},
  query = {},
  $t = key => key
) => {
  routeHolder.route = reactive({
    params: { production_id: production.id, [entityParam]: 'entity-1' },
    query,
    path: '/'
  })
  const loadAction = vi.fn(() => Promise.resolve())
  const store = createStore({
    state: () => ({ currentProduction }),
    getters: {
      assetMetadataDescriptors: () => [],
      assetSearchText: () => '',
      clientAccess: () => ({
        isTaskPanelVisible: true,
        isTaskTypeVisible: () => true
      }),
      currentEpisode: () => null,
      currentProduction: state => state.currentProduction,
      editMetadataDescriptors: () => [],
      episodeMetadataDescriptors: () => [],
      episodeSearchText: () => '',
      getTaskTypePriority: () => () => 1,
      isInAssetTypeWorkflow: () => () => true,
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      isTVShow: () => false,
      linkedConcepts: () => [],
      nbSelectedTasks: () => 0,
      organisation: () => ({}),
      sequenceMetadataDescriptors: () => [],
      sequenceSearchText: () => '',
      shotMetadataDescriptors: () => [],
      shotSearchText: () => '',
      taskMap: () => new Map(),
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(),
      user: () => ({ departments: [] }),
      ...getters
    },
    actions: {
      clearSelectedTasks: vi.fn(),
      loadAsset: loadAction,
      loadAssetCastIn: loadAction,
      loadAssetCasting: loadAction,
      loadAssets: loadAction,
      loadEdit: loadAction,
      loadEdits: loadAction,
      loadEpisodeCasting: loadAction,
      loadEpisodes: loadAction,
      loadEpisodesWithTasks: loadAction,
      loadLinkedConcepts: loadAction,
      loadSequence: loadAction,
      loadSequenceCasting: loadAction,
      loadSequencesWithTasks: loadAction,
      loadShot: loadAction,
      loadShotCasting: loadAction,
      loadShots: loadAction,
      ...actions
    }
  })
  const wrapper = shallowMount(page, {
    global: {
      plugins: [store],
      mocks: { $route: routeHolder.route, $t },
      // The reason an entity is not shown renders with the page, and a page
      // in panels through the slots of its layout.
      stubs: {
        EntityLoadError: false,
        PanelLayout: false,
        RouterLink: RouterLinkStub
      }
    }
  })
  await flushPromises()
  return { store, wrapper }
}

describe.each(pages)('$name page', ({ entityParam, listRoute, page }) => {
  test('links back to the list of the current production', async () => {
    const { wrapper } = await mountPage(page, entityParam, production)

    expect(wrapper.findComponent(RouterLinkStub).props('to')).toMatchObject({
      name: listRoute,
      params: { production_id: production.id }
    })
  })

  // A user with no open production has none in the store until the topbar
  // has loaded the one of the URL, or left the page when it cannot.
  test('renders once the store holds a production', async () => {
    const { store, wrapper } = await mountPage(page, entityParam, null)

    expect(wrapper.find('.page-header').exists()).toBe(false)

    store.state.currentProduction = production
    await nextTick()

    expect(wrapper.find('.page-header').exists()).toBe(true)
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toMatchObject({
      name: listRoute,
      params: { production_id: production.id }
    })
  })
})

// A failure as the API client hands it over, reported already.
const requestFailure = status => {
  const failure = Object.assign(new Error(`HTTP ${status}`), { status })
  markRequestFailure(failure)
  return failure
}

// A promise the test settles, to order the answers of several reads.
const deferred = () => {
  const handlers = {}
  const promise = new Promise((resolve, reject) => {
    Object.assign(handlers, { resolve, reject })
  })
  return { promise, ...handlers }
}

// The pages that read their entity by id when the store does not hold it.
describe.each(pages.filter(({ entityAction }) => entityAction))(
  '$name page, entity that fails to load',
  ({ entityAction, entityMap, entityParam, listAction, page }) => {
    const title = wrapper => wrapper.find('.entity-title').text()
    const reloadButton = wrapper =>
      wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('text') === 'main.reload')
    const homeLink = wrapper =>
      wrapper
        .findAllComponents(RouterLinkStub)
        .find(link => link.props('to').name === 'home')
    const entity = (id, name, tasks = []) => ({ id, name, tasks })
    const taskMap = new Map([
      ['task-1', { id: 'task-1', task_type_id: 'modeling' }],
      ['task-2', { id: 'task-2', task_type_id: 'modeling' }]
    ])
    const taskIds = wrapper =>
      wrapper
        .findComponent(EntityTaskList)
        .props('entries')
        .map(({ id }) => id)
    const goTo = (entityId, productionId = production.id) => {
      routeHolder.route.params = {
        ...routeHolder.route.params,
        production_id: productionId,
        [entityParam]: entityId
      }
    }
    let consoleError = null

    beforeEach(() => {
      consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      entityMap.clear()
      vi.restoreAllMocks()
    })

    // Zou refuses an entity to a vendor without a task on it, and answers a
    // malformed id with a 400.
    test.each([400, 403, 404])('tells it is missing on a %i', async status => {
      const failure = requestFailure(status)
      const { wrapper } = await mountPage(page, entityParam, production, {
        [entityAction]: () => Promise.reject(failure)
      })

      expect(title(wrapper)).toBe('not_found.title')
      expect(wrapper.text()).toContain('not_found.text')
      expect(homeLink(wrapper).text()).toBe('main.home')
      expect(wrapper.findComponent(RouteSectionTabs).exists()).toBe(false)
      expect(reloadButton(wrapper)).toBeUndefined()
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    test('tells it is missing after a load that did not find it', async () => {
      const load = vi.fn(() => Promise.resolve())
      const { wrapper } = await mountPage(page, entityParam, production, {
        [entityAction]: load
      })

      expect(title(wrapper)).toBe('not_found.title')
      expect(load).toHaveBeenCalledTimes(1)
      expect(consoleError).not.toHaveBeenCalled()
    })

    test('offers a reload after a server error', async () => {
      const failure = requestFailure(500)
      const load = vi
        .fn()
        .mockRejectedValueOnce(failure)
        .mockImplementationOnce(() => {
          entityMap.set('entity-1', entity('entity-1', 'E01'))
          return Promise.resolve()
        })
      const { wrapper } = await mountPage(page, entityParam, production, {
        [entityAction]: load
      })

      expect(title(wrapper)).toBe('main.loading_error')
      expect(wrapper.text()).not.toContain('not_found.text')
      expect(homeLink(wrapper)).toBeUndefined()

      await reloadButton(wrapper).vm.$emit('click')
      await flushPromises()

      expect(load).toHaveBeenCalledTimes(2)
      expect(title(wrapper)).toContain('E01')
      expect(reloadButton(wrapper)).toBeUndefined()
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    // A bug is no request failure: it reaches Sentry unhandled.
    test('leaves a bug in the load to Sentry', async () => {
      const bug = new TypeError('Cannot read properties of undefined')
      let wrapper = null
      const rejections = await recordUnhandledRejections(async () => {
        ;({ wrapper } = await mountPage(page, entityParam, production, {
          [entityAction]: () => Promise.reject(bug)
        }))
      })

      expect(rejections).toEqual([bug])
      expect(title(wrapper)).toBe('main.loading_error')
      expect(consoleError).not.toHaveBeenCalled()
    })

    // The store fills the entity with the current production. A link to a
    // closed production opens under the first open one, or under none, until
    // the topbar has loaded it; a refused one sends the user home.
    test.each([
      ['another production', { id: 'production-2' }],
      ['no production', null]
    ])(
      'reads the entity once the production of the URL is set, after %s',
      async (_, currentProduction) => {
        const readUnder = []
        const load = vi.fn(context => {
          readUnder.push(context.rootGetters.currentProduction?.id)
          entityMap.set('entity-1', entity('entity-1', 'E01'))
          return Promise.resolve()
        })
        const { store, wrapper } = await mountPage(
          page,
          entityParam,
          currentProduction,
          { [entityAction]: load }
        )

        expect(load).not.toHaveBeenCalled()

        store.state.currentProduction = production
        await flushPromises()

        expect(readUnder).toEqual(['production-1'])
        expect(title(wrapper)).toContain('E01')
        expect(consoleError).not.toHaveBeenCalled()
      }
    )

    test('reads the entity once when its production comes with it', async () => {
      const load = vi.fn((context, entityId) =>
        Promise.resolve().then(() =>
          entityMap.set(entityId, entity(entityId, 'E02'))
        )
      )
      const { store, wrapper } = await mountPage(
        page,
        entityParam,
        { id: 'production-2' },
        { [entityAction]: load }
      )

      goTo('entity-2')
      store.state.currentProduction = production
      await flushPromises()

      expect(load.mock.calls.map(([, entityId]) => entityId)).toEqual([
        'entity-2'
      ])
      expect(title(wrapper)).toContain('E02')
    })

    // Back and forth while a read runs: B, A, then B again.
    const readTwice = async () => {
      entityMap.set('entity-1', entity('entity-1', 'E01'))
      const reads = []
      const load = vi.fn(() => {
        const read = deferred()
        reads.push(read)
        return read.promise
      })
      const { wrapper } = await mountPage(page, entityParam, production, {
        [entityAction]: load
      })
      goTo('entity-2')
      await flushPromises()
      goTo('entity-1')
      await flushPromises()
      goTo('entity-2')
      await flushPromises()
      expect(load).toHaveBeenCalledTimes(2)
      const answer = async index => {
        entityMap.set('entity-2', entity('entity-2', 'E02'))
        reads[index].resolve()
        await flushPromises()
      }
      const fail = async (index, failure) => {
        reads[index].reject(failure)
        await flushPromises()
      }
      return { answer, fail, wrapper }
    }

    test('keeps out an earlier read that fails after the last one', async () => {
      const { answer, fail, wrapper } = await readTwice()
      const failure = requestFailure(500)

      await answer(1)
      await fail(0, failure)

      expect(title(wrapper)).toContain('E02')
      expect(wrapper.findComponent(RouteSectionTabs).exists()).toBe(true)
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    test('keeps out an earlier read that fails before the last one', async () => {
      const { answer, fail, wrapper } = await readTwice()
      const failure = requestFailure(500)

      await fail(0, failure)
      await answer(1)

      expect(title(wrapper)).toContain('E02')
      expect(wrapper.findComponent(RouteSectionTabs).exists()).toBe(true)
      expect(reloadButton(wrapper)).toBeUndefined()
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    test('keeps out an earlier read that answers after the user went back', async () => {
      entityMap.set('entity-1', entity('entity-1', 'E01', ['task-1']))
      const read = deferred()
      // A list load would read the entity of the URL again, after the wrong
      // one had shown: it never ends here.
      const { wrapper } = await mountPage(
        page,
        entityParam,
        production,
        {
          [listAction]: () => new Promise(() => {}),
          [entityAction]: () => read.promise
        },
        { taskMap: () => taskMap }
      )
      goTo('entity-2')
      await flushPromises()
      goTo('entity-1')
      await flushPromises()

      entityMap.set('entity-2', entity('entity-2', 'E02', ['task-2']))
      read.resolve()
      await flushPromises()

      expect(title(wrapper)).toContain('E01')
      expect(taskIds(wrapper)).toEqual(['task-1'])
      expect(consoleError).not.toHaveBeenCalled()
    })

    test('stops showing the previous entity', async () => {
      entityMap.set('entity-1', entity('entity-1', 'E01'))
      const failure = requestFailure(404)
      const { wrapper } = await mountPage(page, entityParam, production, {
        [entityAction]: () => Promise.reject(failure)
      })

      goTo('entity-2')
      await flushPromises()

      expect(title(wrapper)).toBe('not_found.title')
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    test('forgets it once another entity opens', async () => {
      const failure = requestFailure(404)
      const { wrapper } = await mountPage(page, entityParam, production, {
        [entityAction]: () => Promise.reject(failure)
      })
      entityMap.set('entity-2', entity('entity-2', 'E02'))

      goTo('entity-2')
      await flushPromises()

      expect(title(wrapper)).toContain('E02')
      expect(wrapper.text()).not.toContain('not_found.text')
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    test('keeps out the failure of an entity left during its load', async () => {
      const read = deferred()
      const failure = requestFailure(404)
      const { wrapper } = await mountPage(page, entityParam, production, {
        [entityAction]: () => read.promise
      })
      entityMap.set('entity-2', entity('entity-2', 'E02'))
      goTo('entity-2')
      await flushPromises()

      read.reject(failure)
      await flushPromises()

      expect(title(wrapper)).toContain('E02')
      expect(wrapper.text()).not.toContain('not_found.text')
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    // The next entity belongs to a production the topbar still loads.
    test('drops the error while the next production loads', async () => {
      const failure = requestFailure(404)
      const { wrapper } = await mountPage(page, entityParam, production, {
        [entityAction]: () => Promise.reject(failure)
      })

      goTo('entity-2', 'production-2')
      await flushPromises()

      expect(title(wrapper)).toBe('main.loading')
      expect(wrapper.text()).not.toContain('not_found.text')
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    test('stops showing the previous entity while the next production loads', async () => {
      entityMap.set('entity-1', entity('entity-1', 'E01', ['task-1']))
      const { wrapper } = await mountPage(
        page,
        entityParam,
        production,
        {},
        { taskMap: () => taskMap }
      )

      goTo('entity-2', 'production-2')
      await flushPromises()

      expect(title(wrapper)).toBe('main.loading')
      expect(taskIds(wrapper)).toEqual([])
      expect(consoleError).not.toHaveBeenCalled()
    })

    test('keeps out a read left for the next production', async () => {
      const read = deferred()
      const failure = requestFailure(404)
      const { wrapper } = await mountPage(page, entityParam, production, {
        [entityAction]: () => read.promise
      })
      goTo('entity-2', 'production-2')
      await flushPromises()

      read.reject(failure)
      await flushPromises()

      expect(title(wrapper)).toBe('main.loading')
      expect(wrapper.text()).not.toContain('not_found.text')
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    // Once the list for the arrows is loaded, the page reads its entity again
    // from it: gone from that list, the entity is read by id once more.
    const listWithout = entityId => () => {
      entityMap.delete(entityId)
      return Promise.resolve()
    }

    test('keeps the entity shown when the second read fails', async () => {
      entityMap.set('entity-1', entity('entity-1', 'E01'))
      const failure = requestFailure(404)
      const { wrapper } = await mountPage(page, entityParam, production, {
        [listAction]: listWithout('entity-1'),
        [entityAction]: () => Promise.reject(failure)
      })

      expect(title(wrapper)).toContain('E01')
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    test('keeps out a second read left for the previous entity', async () => {
      entityMap.set('entity-1', entity('entity-1', 'E01'))
      entityMap.set('entity-3', entity('entity-3', 'E03'))
      const read = deferred()
      // The next list loads would read the entity of the URL again, after the
      // wrong one had shown: they never end here.
      const loadList = vi
        .fn()
        .mockImplementationOnce(listWithout('entity-1'))
        .mockImplementation(() => new Promise(() => {}))
      const { wrapper } = await mountPage(page, entityParam, production, {
        [listAction]: loadList,
        [entityAction]: () => read.promise
      })

      goTo('entity-3')
      await flushPromises()
      entityMap.set('entity-1', entity('entity-1', 'E01'))
      read.resolve()
      await flushPromises()

      expect(title(wrapper)).toContain('E03')
      expect(consoleError).not.toHaveBeenCalled()
    })

    // The list load of the previous entity ends while the page waits for the
    // production of the next one: nothing is read under the production left.
    test('reads nothing for a list load left by the previous entity', async () => {
      entityMap.set('entity-1', entity('entity-1', 'E01'))
      const list = deferred()
      const readUnder = []
      const load = vi.fn(context => {
        readUnder.push(context.rootGetters.currentProduction?.id)
        entityMap.set('entity-2', entity('entity-2', 'E02'))
        return Promise.resolve()
      })
      const { store, wrapper } = await mountPage(page, entityParam, production, {
        [listAction]: () => list.promise,
        [entityAction]: load
      })
      goTo('entity-2', 'production-2')
      await flushPromises()

      list.resolve()
      await flushPromises()

      expect(load).not.toHaveBeenCalled()
      expect(title(wrapper)).toBe('main.loading')

      store.state.currentProduction = { id: 'production-2' }
      await flushPromises()

      expect(readUnder).toEqual(['production-2'])
      expect(title(wrapper)).toContain('E02')
      expect(consoleError).not.toHaveBeenCalled()
    })

    test('leaves a bug in the second read to Sentry', async () => {
      entityMap.set('entity-1', entity('entity-1', 'E01'))
      const bug = new TypeError('Cannot read properties of undefined')
      let wrapper = null
      const rejections = await recordUnhandledRejections(async () => {
        ;({ wrapper } = await mountPage(page, entityParam, production, {
          [listAction]: listWithout('entity-1'),
          [entityAction]: () => Promise.reject(bug)
        }))
      })

      expect(rejections).toEqual([bug])
      expect(title(wrapper)).toContain('E01')
      expect(consoleError).not.toHaveBeenCalled()
    })
  }
)

// The pages that find their entity in the list they load: the tasks of a
// sequence or an episode come with its list only.
describe.each([
  { name: 'Sequence', readAction: 'loadSequencesWithTasks' },
  { name: 'Episode', readAction: 'loadEpisodesWithTasks' }
].map(read => ({ ...pages.find(({ name }) => name === read.name), ...read })))(
  '$name page, list that fails to load',
  ({ entityMap, entityParam, page, readAction }) => {
    // The store holds the list of the page: once shown, the entity needs no
    // list load for the arrows.
    const mount = (currentProduction, actions) =>
      mountPage(page, entityParam, currentProduction, actions, {
        sequencesLoadingKey: () => `${production.id}/`
      })
    const title = wrapper => wrapper.find('.entity-title').text()
    const reloadButton = wrapper =>
      wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('text') === 'main.reload')
    // Loaded with its tasks, the entity carries its validations.
    const entity = (id, name) => ({ id, name, tasks: [], validations: new Map() })
    const goTo = (entityId, productionId = production.id) => {
      routeHolder.route.params = {
        ...routeHolder.route.params,
        production_id: productionId,
        [entityParam]: entityId
      }
    }
    let consoleError = null

    beforeEach(() => {
      consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      entityMap.clear()
      vi.restoreAllMocks()
    })

    test('offers a reload after a server error', async () => {
      const failure = requestFailure(500)
      const load = vi
        .fn()
        .mockRejectedValueOnce(failure)
        .mockImplementationOnce(() => {
          entityMap.set('entity-1', entity('entity-1', 'E01'))
          return Promise.resolve()
        })
      const { wrapper } = await mount(production, {
        [readAction]: load
      })

      expect(title(wrapper)).toBe('main.loading_error')
      expect(wrapper.text()).not.toContain('not_found.text')

      await reloadButton(wrapper).vm.$emit('click')
      await flushPromises()

      expect(load).toHaveBeenCalledTimes(2)
      expect(title(wrapper)).toContain('E01')
      expect(reloadButton(wrapper)).toBeUndefined()
      expect(consoleError.mock.calls).toEqual([[failure]])
    })

    test('leaves a bug in the load to Sentry', async () => {
      const bug = new TypeError('Cannot read properties of null')
      let wrapper = null
      const rejections = await recordUnhandledRejections(async () => {
        ;({ wrapper } = await mount(production, {
          [readAction]: () => Promise.reject(bug)
        }))
      })

      expect(rejections).toEqual([bug])
      expect(title(wrapper)).toBe('main.loading_error')
      expect(consoleError).not.toHaveBeenCalled()
    })

    // A link to a closed production opens under the first open one, or under
    // none, until the topbar has loaded it: the list would be the one of
    // another production, or fail on none.
    test.each([
      ['another production', { id: 'production-2' }],
      ['no production', null]
    ])(
      'loads the list once the production of the URL is set, after %s',
      async (_, currentProduction) => {
        const loadedFor = []
        const load = vi.fn(context => {
          loadedFor.push(context.rootGetters.currentProduction?.id)
          entityMap.set('entity-1', entity('entity-1', 'E01'))
          return Promise.resolve()
        })
        const { store, wrapper } = await mount(currentProduction, {
          [readAction]: load
        })

        expect(load).not.toHaveBeenCalled()

        store.state.currentProduction = production
        await flushPromises()

        expect(loadedFor).toEqual(['production-1'])
        expect(title(wrapper)).toContain('E01')
        expect(consoleError).not.toHaveBeenCalled()
      }
    )

    test('stops showing the previous entity while the next production loads', async () => {
      entityMap.set('entity-1', entity('entity-1', 'E01'))
      const { wrapper } = await mount(production)

      goTo('entity-2', 'production-2')
      await flushPromises()

      expect(title(wrapper)).toBe('main.loading')
      expect(consoleError).not.toHaveBeenCalled()
    })

    test('keeps out a load that fails after the user went back', async () => {
      entityMap.set('entity-1', entity('entity-1', 'E01'))
      const load = deferred()
      const failure = requestFailure(500)
      const { wrapper } = await mount(production, {
        [readAction]: () => load.promise
      })
      goTo('entity-2')
      await flushPromises()
      goTo('entity-1')
      await flushPromises()

      load.reject(failure)
      await flushPromises()

      expect(title(wrapper)).toContain('E01')
      expect(reloadButton(wrapper)).toBeUndefined()
      expect(consoleError.mock.calls).toEqual([[failure]])
    })
  }
)

describe('Sequence page, missing sequence', () => {
  const homeLink = wrapper =>
    wrapper
      .findAllComponents(RouterLinkStub)
      .find(link => link.props('to').name === 'home')
  let consoleError = null

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    sequenceStore.cache.sequenceMap.clear()
    vi.restoreAllMocks()
  })

  // The list of a production holds all its sequences, the ones a vendor has
  // a task on for a vendor.
  test('tells it is missing when its list lacks it', async () => {
    const load = vi.fn(() => Promise.resolve())
    const { wrapper } = await mountPage(Sequence, 'sequence_id', production, {
      loadSequencesWithTasks: load
    })

    expect(wrapper.find('.entity-title').text()).toBe('not_found.title')
    expect(wrapper.text()).toContain('not_found.text')
    expect(homeLink(wrapper).text()).toBe('main.home')
    expect(load).toHaveBeenCalledTimes(1)
    expect(consoleError).not.toHaveBeenCalled()
  })

  // In a TV show, the page reads the sequence by id first, to load the list
  // of its episode.
  test.each([403, 404])('tells it is missing on a %i in a TV show', async status => {
    const failure = requestFailure(status)
    const loadList = vi.fn(() => Promise.resolve())
    const { wrapper } = await mountPage(
      Sequence,
      'sequence_id',
      production,
      {
        loadSequence: () => Promise.reject(failure),
        loadSequencesWithTasks: loadList
      },
      { isTVShow: () => true }
    )

    expect(wrapper.find('.entity-title').text()).toBe('not_found.title')
    expect(homeLink(wrapper).text()).toBe('main.home')
    expect(loadList).not.toHaveBeenCalled()
    expect(consoleError.mock.calls).toEqual([[failure]])
  })
})

// The list a TV show page loads is the one of the current episode.
describe('Sequence page, sequence of another episode', () => {
  afterEach(() => {
    sequenceStore.cache.sequenceMap.clear()
  })

  test('takes the episode of its sequence before loading the list', async () => {
    const setCurrentEpisode = vi.fn()
    const loadList = vi.fn(() => {
      sequenceStore.cache.sequenceMap.set('entity-1', {
        id: 'entity-1',
        name: 'SQ01',
        parent_id: 'episode-2',
        tasks: [],
        validations: new Map()
      })
      return Promise.resolve()
    })
    const { wrapper } = await mountPage(
      Sequence,
      'sequence_id',
      production,
      {
        loadSequence: () =>
          Promise.resolve({ id: 'entity-1', parent_id: 'episode-2' }),
        loadSequencesWithTasks: loadList,
        setCurrentEpisode
      },
      {
        currentEpisode: () => ({ id: 'episode-1' }),
        isTVShow: () => true
      }
    )

    expect(setCurrentEpisode.mock.calls.map(([, id]) => id)).toEqual([
      'episode-2'
    ])
    expect(setCurrentEpisode.mock.invocationCallOrder[0]).toBeLessThan(
      loadList.mock.invocationCallOrder[0]
    )
    expect(wrapper.find('.entity-title').text()).toContain('SQ01')
  })
})

// The topbar sends a link to an episode it does not know, deleted or of
// another production, to the episode list.
describe('Episode page, episode its list lacks', () => {
  afterEach(() => {
    episodeStore.cache.episodeMap.clear()
  })

  test('leaves it to the topbar', async () => {
    const load = vi.fn(() => Promise.resolve())
    const { wrapper } = await mountPage(Episode, 'episode_id', production, {
      loadEpisodesWithTasks: load
    })

    expect(wrapper.find('.entity-title').text()).toBe('main.loading')
    expect(wrapper.text()).not.toContain('not_found.text')
    expect(
      wrapper
        .findAllComponents(ButtonSimple)
        .some(button => button.props('text') === 'main.reload')
    ).toBe(false)
    expect(load).toHaveBeenCalledTimes(1)
  })
})

describe.each(pages)(
  '$name page, edit modal',
  ({ editAction, editModal, entityMap, entityParam, page }) => {
    afterEach(() => {
      entityMap.clear()
      vi.restoreAllMocks()
    })

    // Close keeps the error of a failed save: the next edit opens without it.
    test('opens without the error of a failed save', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      entityMap.set('entity-1', { id: 'entity-1', name: 'E01', tasks: [] })
      const { wrapper } = await mountPage(page, entityParam, production, {
        [editAction]: () => Promise.reject(new Error('taken'))
      })
      const editButton = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'edit')
      const modal = () => wrapper.findComponent(editModal)

      await editButton.vm.$emit('click')
      await modal().vm.$emit('confirm', { name: 'E02' })
      await flushPromises()
      expect(modal().props('isError')).toBe(true)

      await modal().vm.$emit('cancel')
      await editButton.vm.$emit('click')

      expect(modal().props('active')).toBe(true)
      expect(modal().props('isError')).toBe(false)
    })

    // Clearing on close would miss a save that fails after the close.
    test('opens without the error of a save that failed after a close', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      entityMap.set('entity-1', { id: 'entity-1', name: 'E01', tasks: [] })
      let rejectSave
      const { wrapper } = await mountPage(page, entityParam, production, {
        [editAction]: () =>
          new Promise((resolve, reject) => {
            rejectSave = reject
          })
      })
      const editButton = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'edit')
      const modal = () => wrapper.findComponent(editModal)

      await editButton.vm.$emit('click')
      await modal().vm.$emit('confirm', { name: 'E02' })
      await modal().vm.$emit('cancel')
      rejectSave(new Error('taken'))
      await flushPromises()
      expect(modal().props('isError')).toBe(true)

      await editButton.vm.$emit('click')

      expect(modal().props('active')).toBe(true)
      expect(modal().props('isError')).toBe(false)
    })

    // Zou answers 404 for an entity deleted meanwhile in another session.
    test('tells the modal a save on an entity deleted meanwhile', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      entityMap.set('entity-1', { id: 'entity-1', name: 'E01', tasks: [] })
      let failure = Object.assign(new Error('Not Found'), { status: 404 })
      const { wrapper } = await mountPage(page, entityParam, production, {
        [editAction]: () => Promise.reject(failure)
      })
      const editButton = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'edit')
      const modal = () => wrapper.findComponent(editModal)

      await editButton.vm.$emit('click')
      await modal().vm.$emit('confirm', { name: 'E02' })
      await flushPromises()
      expect(modal().props('isError')).toBe(true)
      expect(modal().props('isDeleted')).toBe(true)

      failure = new Error('taken')
      await modal().vm.$emit('confirm', { name: 'E02' })
      await flushPromises()
      expect(modal().props('isError')).toBe(true)
      expect(modal().props('isDeleted')).toBe(false)
    })
  }
)

describe.each(pages)(
  '$name page, saved edit',
  ({ editAction, editModal, entityMap, entityParam, listAction, page }) => {
    afterEach(() => {
      entityMap.clear()
    })

    test('shows the new name', async () => {
      entityMap.set('entity-1', {
        id: 'entity-1',
        name: 'E01',
        asset_type_name: 'Props',
        sequence_name: 'SQ01',
        tasks: []
      })
      const { wrapper } = await mountPage(page, entityParam, production, {
        // As the store does, the edit goes into the cached entity at once,
        // out of sight of Vue.
        [editAction]: (context, data) => {
          Object.assign(entityMap.get(data.id), data)
          return Promise.resolve()
        }
      })
      const editButton = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'edit')

      await editButton.vm.$emit('click')
      await wrapper.findComponent(editModal).vm.$emit('confirm', { name: 'E02' })
      await flushPromises()

      expect(wrapper.find('.entity-title').text()).toContain('E02')
    })

    // Another session deleted it: the save went through, the cache lost it.
    test('keeps showing the entity the cache lost during the save', async () => {
      entityMap.set('entity-1', {
        id: 'entity-1',
        name: 'E01',
        asset_type_name: 'Props',
        sequence_name: 'SQ01',
        tasks: []
      })
      const { wrapper } = await mountPage(page, entityParam, production, {
        [editAction]: (context, data) => {
          entityMap.delete(data.id)
          return Promise.resolve()
        }
      })
      const editButton = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'edit')

      await editButton.vm.$emit('click')
      await wrapper.findComponent(editModal).vm.$emit('confirm', { name: 'E02' })
      await flushPromises()

      expect(wrapper.find('.entity-title').text()).toContain('E01')
    })

    // The page stays mounted from an entity of its route to the next one.
    test('keeps showing the entity opened during the save', async () => {
      // With its validations, a sequence needs no list load to show.
      const buildEntity = (id, name) => ({
        id,
        name,
        asset_type_name: 'Props',
        sequence_name: 'SQ01',
        tasks: [],
        validations: new Map()
      })
      entityMap.set('entity-1', buildEntity('entity-1', 'E01'))
      entityMap.set('entity-2', buildEntity('entity-2', 'F01'))
      let endSave
      const { wrapper } = await mountPage(page, entityParam, production, {
        [editAction]: (context, data) => {
          Object.assign(entityMap.get(data.id), data)
          return new Promise(resolve => {
            endSave = resolve
          })
        },
        // The list a page loads for another entity shows the one of the
        // route again: kept loading, it leaves the page as the save did.
        ...(listAction ? { [listAction]: () => new Promise(() => {}) } : {})
      })
      const editButton = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'edit')

      await editButton.vm.$emit('click')
      await wrapper.findComponent(editModal).vm.$emit('confirm', { name: 'E02' })
      routeHolder.route.params = {
        ...routeHolder.route.params,
        [entityParam]: 'entity-2'
      }
      await flushPromises()
      expect(wrapper.find('.entity-title').text()).toContain('F01')

      endSave()
      await flushPromises()

      expect(wrapper.find('.entity-title').text()).toContain('F01')
    })
  }
)

// The casting loads onto the entity the page shows, a copy of the cached one
// once a save went through: the next save must not bring the old one back.
describe.each(
  [
    {
      name: 'Asset',
      castingAction: 'loadAssetCasting',
      field: 'castingAssetsByType'
    },
    {
      name: 'Asset',
      castingAction: 'loadAssetCastIn',
      field: 'castInShotsBySequence'
    },
    {
      name: 'Episode',
      castingAction: 'loadEpisodeCasting',
      field: 'castingAssetsByType'
    },
    {
      name: 'Shot',
      castingAction: 'loadShotCasting',
      field: 'castingAssetsByType'
    }
  ].map(casting => ({
    ...pages.find(({ name }) => name === casting.name),
    ...casting
  }))
)(
  '$name page, $field after a save',
  ({
    castingAction,
    editAction,
    editModal,
    entityMap,
    entityParam,
    field,
    page
  }) => {
    afterEach(() => {
      entityMap.clear()
    })

    test('keeps out the entry removed between two saves', async () => {
      const rock = {
        asset_id: 'asset-1',
        name: 'Rock',
        sequence_name: 'SQ01',
        shot_id: 'shot-1'
      }
      const tree = {
        asset_id: 'asset-2',
        name: 'Tree',
        sequence_name: 'SQ01',
        shot_id: 'shot-2'
      }
      let casting = [rock, tree]
      entityMap.set('entity-1', {
        id: 'entity-1',
        name: 'E01',
        sequence_name: 'SQ01',
        tasks: []
      })
      const { wrapper } = await mountPage(page, entityParam, production, {
        [editAction]: (context, data) => {
          Object.assign(entityMap.get(data.id), data)
          return Promise.resolve()
        },
        [castingAction]: (context, entity) => {
          entity[field] = [casting]
          return Promise.resolve()
        },
        uncastAsset: () => {
          casting = [rock]
          return Promise.resolve()
        }
      })
      const buttons = icon =>
        wrapper
          .findAllComponents(ButtonSimple)
          .filter(button => button.props('icon') === icon)
      const save = async () => {
        await buttons('edit')[0].vm.$emit('click')
        await wrapper.findComponent(editModal).vm.$emit('confirm', { name: 'E02' })
        await flushPromises()
      }

      await save()
      await buttons('remove')[1].vm.$emit('click', new Event('click'))
      await flushPromises()
      expect(buttons('remove')).toHaveLength(1)

      await save()

      expect(buttons('remove')).toHaveLength(1)
    })
  }
)

describe.each(pages)(
  '$name page, refused edit',
  ({ editAction, editModal, entityMap, entityParam, page }) => {
    afterEach(() => {
      entityMap.clear()
      vi.restoreAllMocks()
    })

    test('shows the entity the store put back', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      entityMap.set('entity-1', {
        id: 'entity-1',
        name: 'E01',
        asset_type_name: 'Props',
        sequence_name: 'SQ01',
        tasks: []
      })
      const { wrapper } = await mountPage(page, entityParam, production, {
        // As the store does: the edit goes into the cached entity at once,
        // and out of it once Zou refuses the save.
        [editAction]: (context, data) => {
          const entity = entityMap.get(data.id)
          const { name } = entity
          Object.assign(entity, data)
          return Promise.reject(new Error('Bad Request')).catch(err => {
            entity.name = name
            throw err
          })
        }
      })
      const editButton = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'edit')

      await editButton.vm.$emit('click')
      await wrapper.findComponent(editModal).vm.$emit('confirm', { name: 'E02' })
      await flushPromises()

      expect(wrapper.find('.entity-title').text()).toContain('E01')
      expect(console.error).toHaveBeenCalledWith(new Error('Bad Request'))
    })

    // The modal stays open on the error, and resets its form for a new
    // entity: what was typed would go.
    test('leaves its modal the entity it edits', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      entityMap.set('entity-1', { id: 'entity-1', name: 'E01', tasks: [] })
      const { wrapper } = await mountPage(page, entityParam, production, {
        [editAction]: () => Promise.reject(new Error('Bad Request'))
      })
      const editButton = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.props('icon') === 'edit')
      const modal = () => wrapper.findComponent(editModal)
      const editedEntity = () =>
        Object.entries(modal().props()).find(([key]) =>
          key.endsWith('ToEdit')
        )[1]

      await editButton.vm.$emit('click')
      const entity = editedEntity()
      await modal().vm.$emit('confirm', { name: 'E02' })
      await flushPromises()

      expect(modal().props('isError')).toBe(true)
      expect(editedEntity()).toBe(entity)
      expect(console.error).toHaveBeenCalledWith(new Error('Bad Request'))
    })
  }
)

// Deleted for good from another session while its modal was open, the asset
// is no longer in the cache, and the store keeps it out.
describe('Asset page, edit of an asset deleted elsewhere', () => {
  afterEach(() => {
    assetStore.cache.assetMap.clear()
    vi.restoreAllMocks()
  })

  test('keeps showing the asset while the save fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    assetStore.cache.assetMap.set('entity-1', {
      id: 'entity-1',
      name: 'Tree',
      asset_type_name: 'Props',
      tasks: []
    })
    const { wrapper } = await mountPage(Asset, 'asset_id', production, {
      editAsset: () => Promise.reject(new Error('Entity not found'))
    })
    assetStore.cache.assetMap.delete('entity-1')
    const editButton = wrapper
      .findAllComponents(ButtonSimple)
      .find(button => button.props('icon') === 'edit')
    const modal = () => wrapper.findComponent(EditAssetModal)

    await editButton.vm.$emit('click')
    await modal().vm.$emit('confirm', { name: 'Tree v2' })
    await flushPromises()

    expect(wrapper.find('.entity-title').text()).toBe('Props / Tree')
    expect(modal().props('isError')).toBe(true)
  })
})

// The pages whose arrows walk a list of the store, which may be the one of
// another episode: an entity loaded by id, a list loaded elsewhere.
describe.each(pages.filter(({ listAction }) => listAction))(
  '$name page, list of the page',
  ({ entityMap, entityParam, listAction, name, page }) => {
    afterEach(() => {
      entityMap.clear()
    })

    // A sequence loaded with its tasks is not loaded again by the page.
    const entity = fields => ({
      id: 'entity-1',
      name: 'E01',
      tasks: [],
      validations: new Map(),
      ...fields
    })

    // The list loaded carries its own object for the entity, the one the
    // store updates from then on.
    test('takes its entity from the list it loads for the arrows', async () => {
      entityMap.set('entity-1', entity())
      const loadList = vi.fn(() => {
        entityMap.set('entity-1', entity({ name: 'E01 bis' }))
        return Promise.resolve()
      })
      const { wrapper } = await mountPage(page, entityParam, production, {
        [listAction]: loadList
      })

      expect(loadList).toHaveBeenCalledTimes(1)
      expect(wrapper.find('.entity-title').text()).toContain('E01 bis')
    })

    test('keeps the list the store holds for its episode', async () => {
      entityMap.set('entity-1', entity())
      const loadList = vi.fn(() => Promise.resolve())
      await mountPage(
        page,
        entityParam,
        production,
        { [listAction]: loadList },
        { [`${name.toLowerCase()}sLoadingKey`]: () => `${production.id}/` }
      )

      expect(loadList).not.toHaveBeenCalled()
    })
  }
)

// The casting loads onto the entity the page shows: once the list for the
// arrows is loaded, the object of that list, which the store updates.
describe.each(
  [
    { name: 'Asset', castingAction: 'loadAssetCastIn' },
    { name: 'Sequence', castingAction: 'loadSequenceCasting' },
    { name: 'Shot', castingAction: 'loadShotCasting' }
  ].map(casting => ({
    ...pages.find(({ name }) => name === casting.name),
    ...casting
  }))
)(
  '$name page, casting once the list is loaded',
  ({ castingAction, entityMap, entityParam, listAction, page }) => {
    afterEach(() => {
      entityMap.clear()
    })

    test('loads it onto the entity of the list', async () => {
      const shown = {
        id: 'entity-1',
        name: 'E01',
        tasks: [],
        validations: new Map()
      }
      const listed = { ...shown, name: 'E01 bis' }
      entityMap.set('entity-1', shown)
      const loadCasting = vi.fn(() => Promise.resolve())
      await mountPage(page, entityParam, production, {
        [listAction]: () => {
          entityMap.set('entity-1', listed)
          return Promise.resolve()
        },
        [castingAction]: loadCasting
      })

      expect(loadCasting.mock.calls.map(([, { name }]) => name)).toEqual([
        'E01',
        'E01 bis'
      ])
    })

    // A TV show answers the list load of a cold link without loading.
    test('loads it once when the list keeps the entity shown', async () => {
      entityMap.set('entity-1', {
        id: 'entity-1',
        name: 'E01',
        tasks: [],
        validations: new Map()
      })
      const loadList = vi.fn(() => Promise.resolve())
      const loadCasting = vi.fn(() => Promise.resolve())
      await mountPage(page, entityParam, production, {
        [listAction]: loadList,
        [castingAction]: loadCasting
      })

      expect(loadList).toHaveBeenCalledTimes(1)
      expect(loadCasting).toHaveBeenCalledTimes(1)
    })
  }
)

// Every page whose entity can carry output files lists them in a tab.
describe.each(pages.filter(({ name }) => ['Asset', 'Edit', 'Shot'].includes(name)))(
  '$name page, output files',
  ({ entityMap, entityParam, page }) => {
    afterEach(() => {
      entityMap.clear()
    })

    test('lists the output files of its entity', async () => {
      entityMap.set('entity-1', { id: 'entity-1', name: 'E01', tasks: [] })
      const { wrapper } = await mountPage(page, entityParam, production, {}, {}, {
        section: 'output-files'
      })

      expect(wrapper.findComponent(EntityOutputFiles).props('entity')).toMatchObject({
        id: 'entity-1'
      })
    })
  }
)

describe.each(pages.filter(({ name }) => ['Asset', 'Edit', 'Shot'].includes(name)))(
  '$name page, task panel client setting',
  ({ entityParam, page }) => {
    const panel = isTaskPanelVisible => ({
      clientAccess: () => ({ isTaskPanelVisible, isTaskTypeVisible: () => true })
    })

    test('renders no task info when the panel is hidden', async () => {
      const { wrapper } = await mountPage(page, entityParam, production, {}, panel(false))
      expect(wrapper.findComponent({ name: 'TaskInfo' }).exists()).toBe(false)
    })

    test('renders the task info otherwise', async () => {
      const { wrapper } = await mountPage(page, entityParam, production, {}, panel(true))
      expect(wrapper.findComponent({ name: 'TaskInfo' }).exists()).toBe(true)
    })
  }
)

describe.each(
  [
    ['Asset', ['chat', 'concepts', 'casting', 'schedule', 'time-logs', 'preview-files', 'working-files', 'output-files']],
    ['Edit', ['chat', 'schedule', 'time-logs', 'preview-files', 'activity', 'working-files', 'output-files']],
    ['Episode', ['chat', 'casting', 'schedule', 'time-logs', 'preview-files']],
    ['Sequence', ['chat', 'casting', 'schedule', 'time-logs', 'preview-files']],
    ['Shot', ['chat', 'casting', 'schedule', 'time-logs', 'preview-files', 'working-files', 'output-files']]
  ].map(([name, sections]) => ({
    ...pages.find(page => page.name === name),
    sections
  }))
)('$name page, panel layout', ({ entityMap, entityParam, name, page, sections }) => {
  const mountSection = section => {
    entityMap.set('entity-1', { id: 'entity-1', name: 'E01', tasks: [] })
    return mountPage(page, entityParam, production, {}, {}, { section })
  }

  afterEach(() => {
    entityMap.clear()
  })

  test('lays its header, its sections and its task panel out', async () => {
    const { wrapper } = await mountSection()

    expect(wrapper.find('.filters-panel .entity-title').exists()).toBe(true)
    const list = wrapper.find('.list-panel')
    expect(list.findComponent(RouteSectionTabs).exists()).toBe(true)
    expect(list.findComponent(EntityTaskList).exists()).toBe(true)
    const side = wrapper.find('.side-column')
    expect(side.findComponent({ name: 'TaskInfo' }).props('entityType')).toBe(
      name
    )
  })

  test('opens on the tasks, the metadata in the tab after', async () => {
    const { wrapper } = await mountSection('information')

    const tabs = wrapper.findComponent(RouteSectionTabs).props('tabs')
    expect(tabs.slice(0, 2)).toEqual([
      { label: 'main.tasks', name: 'infos' },
      { label: 'main.label.info', name: 'information' }
    ])
    expect(tabs.slice(2).map(tab => tab.name)).toEqual(sections)
    expect(wrapper.find('.infos .metadata-infos').exists()).toBe(false)
    expect(wrapper.find('.information .metadata-infos').exists()).toBe(true)
    expect(wrapper.find('.side-column').exists()).toBe(false)
  })

  test('keeps the side panel for the sections that have one', async () => {
    const { wrapper } = await mountSection('chat')

    expect(wrapper.find('.side-column').exists()).toBe(false)
    expect(wrapper.find('.drawer-backdrop').exists()).toBe(false)
  })

  if (sections.includes('working-files')) {
    test('lists the working files of its entity on their section', async () => {
      const { wrapper } = await mountSection('working-files')

      expect(
        wrapper.findComponent({ name: 'EntityWorkingFiles' }).props('entity')
      ).toMatchObject({ id: 'entity-1' })
    })
  }
})

describe('Asset page, panel of the concepts', () => {
  afterEach(() => {
    assetStore.cache.assetMap.clear()
  })

  test('shows the panel of the concepts on their section', async () => {
    assetStore.cache.assetMap.set('entity-1', {
      id: 'entity-1',
      name: 'Tree',
      tasks: []
    })
    const { wrapper } = await mountPage(Asset, 'asset_id', production, {}, {}, {
      section: 'concepts'
    })

    const panels = wrapper
      .find('.side-column')
      .findAllComponents({ name: 'TaskInfo' })
    expect(panels.map(panel => panel.props('entityType'))).toEqual(['Concept'])
  })
})

describe('Asset page, concepts', () => {
  afterEach(() => {
    assetStore.cache.assetMap.clear()
  })

  // A concept whose creation stopped after the entity has no task.
  test('leaves a concept without task out of a status filter', async () => {
    assetStore.cache.assetMap.set('entity-1', {
      id: 'entity-1',
      name: 'Tree',
      tasks: []
    })
    const buildConcept = (id, tasks) => ({
      id,
      entity_concept_links: [],
      tasks
    })
    const { wrapper } = await mountPage(
      Asset,
      'asset_id',
      production,
      {},
      {
        linkedConcepts: () => [
          buildConcept('concept-0', []),
          buildConcept('concept-1', [
            { id: 'task-1', task_status_id: 'status-todo' }
          ])
        ]
      }
    )
    const concepts = wrapper.find('.concepts')

    await concepts
      .findComponent(ComboboxStatus)
      .vm.$emit('update:modelValue', 'status-todo')

    expect(
      concepts
        .findAllComponents(ConceptCard)
        .map(card => card.props('concept').id)
    ).toEqual(['concept-1'])
  })
})

describe('Asset page, casting', () => {
  afterEach(() => {
    assetStore.cache.assetMap.clear()
  })

  test('lists only the tasks of the asset type workflow', async () => {
    assetStore.cache.assetMap.set('entity-1', {
      id: 'entity-1',
      name: 'Tree',
      asset_type_id: 'props',
      tasks: ['task-1', 'task-2']
    })
    const { wrapper } = await mountPage(
      Asset,
      'asset_id',
      production,
      {},
      {
        isInAssetTypeWorkflow: () => (assetTypeId, taskTypeId) =>
          assetTypeId === 'props' && taskTypeId === 'modeling',
        taskMap: () =>
          new Map([
            ['task-1', { id: 'task-1', task_type_id: 'modeling' }],
            ['task-2', { id: 'task-2', task_type_id: 'rigging' }]
          ])
      }
    )

    const entries = wrapper.findComponent(EntityTaskList).props('entries')
    expect(entries.map(({ id }) => id)).toEqual(['task-1'])
  })

  test.each([
    ['Cast in 1 shot', 1],
    ['Cast in 3 shots', 3]
  ])('titles its casting "%s"', async (title, nbShots) => {
    assetStore.cache.assetMap.set('entity-1', {
      id: 'entity-1',
      name: 'Tree',
      tasks: [],
      castInShotsBySequence: [
        Array.from({ length: nbShots }, (_, index) => ({ id: `shot-${index}` }))
      ]
    })
    const { wrapper } = await mountPage(
      Asset,
      'asset_id',
      production,
      {},
      {},
      { section: 'casting' },
      (key, named) => i18n.global.t(key, named)
    )

    expect(
      wrapper.find('.casting-title').findComponent(PageSubtitle).props('text')
    ).toBe(title)
  })
})
