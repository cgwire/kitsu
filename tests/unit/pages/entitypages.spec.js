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

const production = { id: 'production-1' }

const pages = [
  {
    name: 'Asset',
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
// URL is found nowhere: the page loads nothing and shows its empty state.
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
      loadEdits: loadAction,
      loadEpisodeCasting: loadAction,
      loadEpisodesWithTasks: loadAction,
      loadLinkedConcepts: loadAction,
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
      stubs: { RouterLink: RouterLinkStub }
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
