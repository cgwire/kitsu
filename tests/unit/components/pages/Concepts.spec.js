import {
  enableAutoUnmount,
  flushPromises,
  shallowMount
} from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

// Importing the page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import assetsStore from '@/store/modules/assets'

import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditConceptFolderModal from '@/components/modals/EditConceptFolderModal.vue'
import Concepts from '@/components/pages/Concepts.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ConceptCard from '@/components/widgets/ConceptCard.vue'
import ConceptFolderTile from '@/components/widgets/ConceptFolderTile.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/productions/:production_id/concepts',
      name: 'concepts',
      component: Concepts
    }
  ]
})

const buildConcept = (id, createdBy = 'person-1', links = []) => ({
  id,
  created_at: '2026-09-01',
  created_by: createdBy,
  entity_concept_links: links,
  tasks: [{ id: `task-${id}`, task_status_id: 'status-todo' }]
})

const mountPage = async ({
  concepts = [],
  dispatch = vi.fn(() => Promise.resolve()),
  folders = [],
  isManager = true,
  people = [],
  query = {},
  selection = [],
  stubs = {}
} = {}) => {
  const handlers = {}
  const socket = {
    on: vi.fn((event, handler) => {
      handlers[event] = handler
    }),
    off: vi.fn()
  }
  const store = createStore({
    state: {
      production: { id: 'production-1', name: 'Wing It' },
      selection,
      shownPreview: ''
    },
    getters: {
      concepts: () => concepts,
      conceptFolders: () => folders,
      isCurrentUserManager: () => isManager,
      isCurrentUserSupervisor: () => false,
      currentProduction: state => state.production,
      isTVShow: () => true,
      personMap: () => new Map(people.map(person => [person.id, person])),
      previewFileIdToShow: state => state.shownPreview,
      selectedConcepts: state =>
        new Map(state.selection.map(concept => [concept.id, concept])),
      taskStatusMap: () => new Map()
    }
  })
  store.dispatch = dispatch
  store.commit = vi.fn()
  await router.push({ path: '/productions/production-1/concepts', query })
  await router.isReady()
  const wrapper = shallowMount(Concepts, {
    global: {
      plugins: [store, router],
      mocks: { $t: key => key },
      config: { globalProperties: { $socket: socket } },
      stubs
    }
  })
  await flushPromises()
  return { dispatch, handlers, store, wrapper }
}

// The page follows the query and writes to it: pages left mounted by the
// previous tests would fight the one under test over the shared router.
enableAutoUnmount(afterEach)

describe('Concepts page', () => {
  // The concepts route carries no episode: moving the store to the all
  // pseudo-episode leaked into the topbar and the next section link.
  test('loads every asset without moving the current episode', async () => {
    const { dispatch } = await mountPage()

    expect(dispatch).toHaveBeenCalledWith('loadAssets', { all: true })
    expect(dispatch).toHaveBeenCalledWith('loadConcepts')
    expect(dispatch).not.toHaveBeenCalledWith(
      'setCurrentEpisode',
      expect.anything()
    )
  })

  test('commits a status change received from the server', async () => {
    const concept = buildConcept('concept-1')
    const { handlers, store } = await mountPage({ concepts: [concept] })

    handlers['task:status-changed']({
      task_id: 'task-concept-1',
      new_task_status_id: 'status-done'
    })

    expect(store.commit).toHaveBeenCalledWith('UPDATE_TASK', {
      task: concept.tasks[0],
      taskStatusId: 'status-done'
    })
  })

  test('selects the concept whose card is clicked', async () => {
    const concept = buildConcept('concept-1')
    const { dispatch, wrapper } = await mountPage({ concepts: [concept] })

    wrapper.findComponent(ConceptCard).vm.$emit('click', { ctrlKey: false })
    await flushPromises()

    expect(dispatch).toHaveBeenCalledWith(
      'addSelectedConcepts',
      new Map([[concept.id, concept]])
    )
  })

  // The card is the button: a focusable row around it doubled every stop.
  test('leaves a single tab stop per concept', async () => {
    const { wrapper } = await mountPage({
      concepts: [buildConcept('concept-1')]
    })

    expect(wrapper.find('.item').attributes('tabindex')).toBeUndefined()
  })

  describe('multiple selection', () => {
    const stubs = {
      TaskInfo: { template: '<div class="panel"><slot name="selection" /></div>' }
    }

    test('shows the selected concepts in the side panel', async () => {
      const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
      const { wrapper } = await mountPage({
        concepts,
        selection: concepts,
        stubs
      })

      const cards = wrapper.find('.panel').findAllComponents(ConceptCard)
      expect(cards.map(card => card.props('concept'))).toEqual(concepts)
      expect(cards.every(card => card.props('compact'))).toBe(true)
    })

    test('opens the side drawer on a selection and closes it on demand', async () => {
      const concepts = [buildConcept('concept-1')]
      const closed = await mountPage({ concepts, stubs })
      expect(closed.wrapper.find('.side-column').classes()).not.toContain(
        'is-open'
      )

      const { dispatch, wrapper } = await mountPage({
        concepts,
        selection: concepts,
        stubs
      })
      expect(wrapper.find('.side-column').classes()).toContain('is-open')

      await wrapper.find('.drawer-backdrop').trigger('click')
      expect(dispatch).toHaveBeenCalledWith('clearSelectedConcepts')
    })

    test('marks the selected cards in the list', async () => {
      const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
      const { wrapper } = await mountPage({
        concepts,
        selection: [concepts[1]],
        stubs
      })

      const cards = wrapper.find('.items').findAllComponents(ConceptCard)
      expect(cards.map(card => card.props('selected'))).toEqual([false, true])
    })

    test('drops from the selection the concept clicked in the panel', async () => {
      const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
      const { dispatch, wrapper } = await mountPage({
        concepts,
        selection: concepts,
        stubs
      })

      wrapper
        .find('.panel')
        .findAllComponents(ConceptCard)[0]
        .vm.$emit('click', {})
      await flushPromises()

      expect(dispatch).toHaveBeenCalledWith(
        'addSelectedConcepts',
        new Map([['concept-2', concepts[1]]])
      )
    })
  })

  describe('folders', () => {
    const folders = [{ id: 'folder-1', name: 'Sets' }]
    const buildConcepts = () => [
      buildConcept('concept-root'),
      { ...buildConcept('concept-set', 'person-2'), parent_id: 'folder-1' }
    ]
    const stubs = {
      RouterLink: { props: ['to'], template: '<a><slot /></a>' }
    }
    const openFolder = { query: { folder: 'folder-1' } }

    const shownConcepts = wrapper =>
      wrapper
        .findAllComponents(ConceptCard)
        .map(card => card.props('concept').id)

    test('loads the folders of the production', async () => {
      const { dispatch } = await mountPage()

      expect(dispatch).toHaveBeenCalledWith('loadConceptFolders')
    })

    test('shows the folders and the unsorted concepts at the root', async () => {
      const { wrapper } = await mountPage({
        concepts: buildConcepts(),
        folders,
        stubs
      })

      expect(shownConcepts(wrapper)).toEqual(['concept-root'])
      const tiles = wrapper.findAllComponents(ConceptFolderTile)
      expect(tiles.map(tile => tile.props())).toEqual([
        { count: 1, highlighted: false, name: 'Sets' }
      ])
    })

    test('shows the folders even without any unsorted concept', async () => {
      const { wrapper } = await mountPage({
        concepts: [buildConcepts()[1]],
        folders,
        stubs
      })

      expect(wrapper.findAllComponents(ConceptFolderTile)).toHaveLength(1)
      expect(wrapper.find('.empty-concepts').exists()).toBe(false)
    })

    test('keeps the root of the path on display outside any folder', async () => {
      const { wrapper } = await mountPage({ isManager: false, stubs })

      expect(wrapper.find('.folder-path').text()).toBe('concepts.title/')
    })

    test('shows the concepts of the open folder', async () => {
      const { wrapper } = await mountPage({
        concepts: buildConcepts(),
        folders,
        stubs,
        ...openFolder
      })

      expect(shownConcepts(wrapper)).toEqual(['concept-set'])
      expect(wrapper.findComponent(ConceptFolderTile).exists()).toBe(false)
      expect(wrapper.find('.folder-path').text()).toBe('concepts.title/Sets')
    })

    test('counts in a folder the concepts matching the filters', async () => {
      const people = [{ id: 'person-1' }, { id: 'person-2' }]
      const { wrapper } = await mountPage({
        concepts: buildConcepts(),
        folders,
        people,
        stubs
      })

      wrapper
        .findComponent(PeopleField)
        .vm.$emit('update:modelValue', people[0])
      await flushPromises()

      expect(wrapper.findComponent(ConceptFolderTile).props('count')).toBe(0)
    })

    test('drops the selection when another folder opens', async () => {
      const { dispatch, wrapper } = await mountPage({
        concepts: buildConcepts(),
        folders,
        stubs
      })
      dispatch.mockClear()

      await router.push(openFolder)
      await flushPromises()

      expect(dispatch).toHaveBeenCalledWith('clearSelectedConcepts')
      expect(shownConcepts(wrapper)).toEqual(['concept-set'])
    })

    test('adds the new concepts to the open folder', async () => {
      const { dispatch, wrapper } = await mountPage({
        concepts: buildConcepts(),
        folders,
        stubs,
        ...openFolder
      })
      const forms = [new FormData()]

      wrapper.findComponent(AddPreviewModal).vm.$emit('confirm', forms)
      await flushPromises()

      expect(dispatch).toHaveBeenCalledWith('newConcepts', {
        forms,
        parentId: 'folder-1'
      })
    })

    test('offers the new folder in the folder bar, at the root only', async () => {
      const root = await mountPage({ folders, stubs })
      expect(root.wrapper.find('.folder-bar .new-folder').exists()).toBe(true)
      // The sort sits with the filters: nothing pushes it to the right.
      expect(root.wrapper.find('.filters .right').exists()).toBe(false)

      const folder = await mountPage({ folders, stubs, ...openFolder })
      expect(folder.wrapper.find('.new-folder').exists()).toBe(false)
    })

    test('creates a folder', async () => {
      const { dispatch, wrapper } = await mountPage({ folders, stubs })
      const modal = wrapper.findComponent(EditConceptFolderModal)

      await wrapper.find('.new-folder').trigger('click')
      expect(modal.props('active')).toBe(true)
      modal.vm.$emit('confirm', 'Characters')
      await flushPromises()

      expect(dispatch).toHaveBeenCalledWith('newConceptFolder', 'Characters')
      expect(modal.props('active')).toBe(false)
    })

    test('renames the open folder', async () => {
      const { dispatch, wrapper } = await mountPage({
        folders,
        stubs,
        ...openFolder
      })
      const modal = wrapper.findComponent(EditConceptFolderModal)

      await wrapper.find('.rename-folder').trigger('click')
      expect(modal.props('folderToEdit')).toEqual(folders[0])
      modal.vm.$emit('confirm', 'Environments')
      await flushPromises()

      expect(dispatch).toHaveBeenCalledWith('editConceptFolder', {
        id: 'folder-1',
        name: 'Environments'
      })
    })

    test('keeps the modal open when a folder cannot be saved', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { dispatch, wrapper } = await mountPage({ folders, stubs })
      const modal = wrapper.findComponent(EditConceptFolderModal)
      await wrapper.find('.new-folder').trigger('click')
      dispatch.mockRejectedValueOnce(new Error('network'))

      modal.vm.$emit('confirm', 'Characters')
      await flushPromises()

      expect(modal.props('active')).toBe(true)
      expect(modal.props('isError')).toBe(true)
    })

    test('deletes the open folder and goes back to the root', async () => {
      const { dispatch, wrapper } = await mountPage({
        folders,
        stubs,
        ...openFolder
      })

      await wrapper.find('.delete-folder').trigger('click')
      wrapper.findComponent(DeleteModal).vm.$emit('confirm')
      await flushPromises()

      expect(dispatch).toHaveBeenCalledWith('deleteConceptFolder', folders[0])
      expect(router.currentRoute.value.query.folder).toBeUndefined()
    })

    test('leaves the folder management to managers and supervisors', async () => {
      const root = await mountPage({ folders, isManager: false, stubs })
      expect(root.wrapper.find('.new-folder').exists()).toBe(false)

      const folder = await mountPage({
        folders,
        isManager: false,
        stubs,
        ...openFolder
      })
      expect(folder.wrapper.find('.rename-folder').exists()).toBe(false)
      expect(folder.wrapper.find('.delete-folder').exists()).toBe(false)
    })
  })

  describe('drag and drop to a folder', () => {
    const folders = [{ id: 'folder-1', name: 'Sets' }]
    const stubs = {
      RouterLink: { props: ['to'], template: '<a><slot /></a>' }
    }
    const dataTransfer = () => ({ setData: vi.fn(), types: ['text/plain'] })

    const mountWithCards = (options = {}) =>
      mountPage({
        concepts: [buildConcept('concept-1'), buildConcept('concept-2')],
        folders,
        stubs,
        ...options
      })

    const dragCardTo = async (wrapper, cardIndex, target) => {
      const transfer = dataTransfer()
      await wrapper
        .findAll('.item')
        [cardIndex].trigger('dragstart', { dataTransfer: transfer })
      await target.trigger('dragover', { dataTransfer: transfer })
      await target.trigger('drop', { dataTransfer: transfer })
      await flushPromises()
    }

    test('lets managers drag the cards', async () => {
      const manager = await mountWithCards()
      expect(manager.wrapper.find('.item').attributes('draggable')).toBe(
        'true'
      )

      const artist = await mountWithCards({ isManager: false })
      expect(artist.wrapper.find('.item').attributes('draggable')).toBe(
        'false'
      )
    })

    test('moves the dragged selection to the folder it is dropped on', async () => {
      const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
      const { dispatch, wrapper } = await mountWithCards({
        concepts,
        selection: concepts
      })

      await dragCardTo(wrapper, 0, wrapper.find('.folders li'))

      expect(dispatch).toHaveBeenCalledWith('moveConcepts', {
        conceptIds: ['concept-1', 'concept-2'],
        folderId: 'folder-1'
      })
      expect(dispatch).toHaveBeenCalledWith('clearSelectedConcepts')
    })

    test('drags a card outside the selection on its own', async () => {
      const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
      const { dispatch, wrapper } = await mountWithCards({
        concepts,
        selection: [concepts[1]]
      })

      await dragCardTo(wrapper, 0, wrapper.find('.folders li'))

      expect(dispatch).toHaveBeenCalledWith('moveConcepts', {
        conceptIds: ['concept-1'],
        folderId: 'folder-1'
      })
    })

    test('moves a card dropped on the Concepts root out of its folder', async () => {
      const concept = { ...buildConcept('concept-1'), parent_id: 'folder-1' }
      const { dispatch, wrapper } = await mountWithCards({
        concepts: [concept],
        query: { folder: 'folder-1' }
      })

      await dragCardTo(wrapper, 0, wrapper.find('.folder-path a'))

      expect(dispatch).toHaveBeenCalledWith('moveConcepts', {
        conceptIds: ['concept-1'],
        folderId: null
      })
    })

    test('keeps the file drop zone out of a card drag', async () => {
      const { wrapper } = await mountWithCards()
      const transfer = dataTransfer()

      await wrapper.find('.item').trigger('dragstart', { dataTransfer: transfer })
      await wrapper.find('.concepts').trigger('dragover', { dataTransfer: transfer })

      expect(wrapper.find('.drop-mask').exists()).toBe(false)
    })
  })

  describe('asset filters', () => {
    const buildAsset = (id, name, type) => ({
      id,
      name,
      full_name: `${type} / ${name}`,
      asset_type_id: `type-${type}`,
      asset_type_name: type
    })
    const assets = [
      buildAsset('asset-tree', 'Tree', 'Props'),
      buildAsset('asset-rock', 'Rock', 'Props'),
      buildAsset('asset-hall', 'Hall', 'Sets'),
      buildAsset('asset-unused', 'Unused', 'Characters')
    ]

    // The automatic stub does not carry the props vue-multiselect declares
    // through a mixin.
    const AssetFilter = {
      name: 'AssetFilter',
      props: ['modelValue', 'options'],
      template: '<div />'
    }

    const mountWithLinks = () =>
      mountPage({
        concepts: [
          buildConcept('concept-tree', 'person-1', ['asset-tree']),
          buildConcept('concept-both', 'person-1', ['asset-rock', 'asset-hall']),
          buildConcept('concept-free')
        ],
        stubs: { 'vue-multiselect': AssetFilter }
      })

    const typeFilter = wrapper =>
      wrapper
        .findAllComponents(Combobox)
        .find(
          combobox => combobox.props('label') === 'concepts.fields.asset_type'
        )
    const assetFilter = wrapper => wrapper.findComponent(AssetFilter)

    const pick = async (filter, value) => {
      filter.vm.$emit('update:modelValue', value)
      await flushPromises()
    }
    const shownConcepts = wrapper =>
      wrapper
        .findAllComponents(ConceptCard)
        .map(card => card.props('concept').id)
        .sort()
    const optionNames = filter =>
      filter.props('options').map(option => option.label ?? option.name)

    beforeEach(() => {
      assets.forEach(asset => assetsStore.cache.assetMap.set(asset.id, asset))
    })

    afterEach(() => {
      assetsStore.cache.assetMap.clear()
    })

    test('offers the types and the assets a concept is linked to', async () => {
      const { wrapper } = await mountWithLinks()

      expect(optionNames(typeFilter(wrapper))).toEqual([
        'main.all',
        'Props',
        'Sets'
      ])
      expect(optionNames(assetFilter(wrapper))).toEqual([
        'main.all',
        'concepts.actions.empty',
        'Props / Rock',
        'Props / Tree',
        'Sets / Hall'
      ])
    })

    test('keeps the concepts linked to an asset of the chosen type', async () => {
      const { wrapper } = await mountWithLinks()

      await pick(typeFilter(wrapper), 'type-Sets')

      expect(shownConcepts(wrapper)).toEqual(['concept-both'])
    })

    test('keeps the concepts linked to the chosen asset', async () => {
      const { wrapper } = await mountWithLinks()

      await pick(assetFilter(wrapper), { id: 'asset-tree' })

      expect(shownConcepts(wrapper)).toEqual(['concept-tree'])
    })

    test('keeps the concepts without any link', async () => {
      const { wrapper } = await mountWithLinks()

      await pick(assetFilter(wrapper), { id: 'none' })

      expect(shownConcepts(wrapper)).toEqual(['concept-free'])
    })

    test('narrows the assets to the chosen type', async () => {
      const { wrapper } = await mountWithLinks()

      await pick(typeFilter(wrapper), 'type-Props')

      expect(optionNames(assetFilter(wrapper))).toEqual([
        'main.all',
        'Rock',
        'Tree'
      ])
    })

    test('drops the chosen asset when the type changes to another one', async () => {
      const { wrapper } = await mountWithLinks()
      await pick(assetFilter(wrapper), { id: 'asset-hall' })

      await pick(typeFilter(wrapper), 'type-Props')

      expect(assetFilter(wrapper).props('modelValue').id).toBe('')
      expect(shownConcepts(wrapper)).toEqual(['concept-both', 'concept-tree'])
    })
  })

  test('accepts dropped files when there is no concept yet', async () => {
    const { wrapper } = await mountPage()

    await wrapper.find('.empty-concepts').trigger('dragover')

    expect(wrapper.find('.drop-mask').exists()).toBe(true)
  })

  // A link to the page carries what the user was looking at.
  describe('query', () => {
    const stubs = {
      RouterLink: { props: ['to'], template: '<a><slot /></a>' }
    }
    const people = [{ id: 'person-2', name: 'Ada' }]
    const folders = [{ id: 'folder-1', name: 'Sets' }]
    const query = () => router.currentRoute.value.query
    const sortFilter = wrapper =>
      wrapper
        .findAllComponents(Combobox)
        .find(combobox => combobox.props('label') === 'main.sorted_by')

    test('restores the filters', async () => {
      const { wrapper } = await mountPage({
        concepts: [buildConcept('concept-1', 'person-2')],
        people,
        query: { publisher: 'person-2', sort: 'updated_at', status: 'status-1' }
      })

      expect(wrapper.findComponent(ComboboxStatus).props('modelValue')).toBe(
        'status-1'
      )
      expect(wrapper.findComponent(PeopleField).props('modelValue')).toEqual(
        people[0]
      )
      expect(sortFilter(wrapper).props('modelValue')).toBe('updated_at')
    })

    test('follows the filters, defaults left out', async () => {
      const { wrapper } = await mountPage({
        concepts: [buildConcept('concept-1', 'person-2')],
        people
      })

      wrapper.findComponent(ComboboxStatus).vm.$emit('update:modelValue', 's-1')
      wrapper.findComponent(PeopleField).vm.$emit('update:modelValue', people[0])
      await flushPromises()
      expect(query()).toEqual({ publisher: 'person-2', status: 's-1' })

      sortFilter(wrapper).vm.$emit('update:modelValue', 'updated_at')
      wrapper.findComponent(ComboboxStatus).vm.$emit('update:modelValue', null)
      await flushPromises()
      expect(query()).toEqual({ publisher: 'person-2', sort: 'updated_at' })
    })

    test('keeps the filters but not the concept when opening a folder', async () => {
      const { wrapper } = await mountPage({
        concepts: [buildConcept('concept-1')],
        folders,
        query: { 'concept-id': 'concept-1', status: 'status-1' },
        stubs
      })

      const targets = wrapper
        .findAllComponents(stubs.RouterLink)
        .map(link => link.props('to').query)
      expect(targets).toContainEqual({ folder: 'folder-1', status: 'status-1' })
      expect(targets).toContainEqual({ status: 'status-1' })
    })

    test('follows the single selection', async () => {
      const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
      const { store } = await mountPage({ concepts })

      store.state.selection = [concepts[0]]
      await flushPromises()
      expect(query()['concept-id']).toBe('concept-1')

      store.state.selection = concepts
      await flushPromises()
      expect(query()['concept-id']).toBeUndefined()
    })

    test('selects the concept of a link', async () => {
      const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
      const { dispatch } = await mountPage({
        concepts,
        query: { 'concept-id': 'concept-2' }
      })

      expect(dispatch).toHaveBeenCalledWith(
        'addSelectedConcepts',
        new Map([['concept-2', concepts[1]]])
      )
    })

    test('opens the folder of the concept of a link', async () => {
      await mountPage({
        concepts: [{ ...buildConcept('concept-1'), parent_id: 'folder-1' }],
        folders,
        query: { 'concept-id': 'concept-1' }
      })

      expect(query()).toEqual({ 'concept-id': 'concept-1', folder: 'folder-1' })
    })

    test('forgets a concept that no longer exists', async () => {
      const { dispatch } = await mountPage({
        concepts: [buildConcept('concept-1')],
        query: { 'concept-id': 'gone', 'concept-preview': 'gone' }
      })

      expect(query()).toEqual({})
      expect(dispatch).not.toHaveBeenCalledWith(
        'addSelectedConcepts',
        expect.anything()
      )
    })

    test('shows the concept of a link in full screen and follows the browsing', async () => {
      const concepts = [
        { ...buildConcept('concept-1'), preview_file_id: 'preview-1' },
        { ...buildConcept('concept-2'), preview_file_id: 'preview-2' }
      ]
      const { store } = await mountPage({
        concepts,
        query: { 'concept-preview': 'concept-1' }
      })
      expect(store.commit).toHaveBeenCalledWith('SHOW_PREVIEW_FILE', 'preview-1')

      store.state.shownPreview = 'preview-2'
      await flushPromises()
      expect(query()['concept-preview']).toBe('concept-2')

      store.state.shownPreview = ''
      await flushPromises()
      expect(query()['concept-preview']).toBeUndefined()
    })
  })

  // The full screen preview modal browses these with the arrow keys.
  test('hands the shown previews over to the preview modal, in order', async () => {
    const { store, wrapper } = await mountPage({
      concepts: [
        {
          ...buildConcept('concept-old'),
          created_at: '2026-01-01',
          preview_file_id: 'preview-concept-old'
        },
        {
          ...buildConcept('concept-new'),
          created_at: '2026-02-01',
          preview_file_id: 'preview-concept-new'
        },
        // Movies play in their card: the modal only shows pictures.
        {
          ...buildConcept('concept-movie'),
          preview_file_extension: 'mp4',
          preview_file_id: 'preview-concept-movie'
        }
      ]
    })

    expect(store.commit).toHaveBeenCalledWith('SET_PREVIEW_FILES_TO_BROWSE', [
      'preview-concept-new',
      'preview-concept-old'
    ])

    wrapper.unmount()
    expect(store.commit).toHaveBeenLastCalledWith(
      'SET_PREVIEW_FILES_TO_BROWSE',
      []
    )
  })

  test('folds the extra filters until asked for more', async () => {
    const { wrapper } = await mountPage()
    const filters = wrapper.find('.filters')

    expect(filters.classes()).toContain('folded')
    expect(filters.findAll('.extra-filter')).toHaveLength(3)

    await filters.find('.filters-toggle').trigger('click')
    expect(filters.classes()).not.toContain('folded')
  })

  test('offers the concept upload in the folder bar and in the empty state', async () => {
    const { wrapper } = await mountPage()
    const modal = wrapper.findComponent(AddPreviewModal)

    expect(wrapper.find('.footer').exists()).toBe(false)
    await wrapper.find('.folder-bar .add-concepts').trigger('click')
    expect(modal.props('active')).toBe(true)

    await modal.vm.$emit('cancel')
    await wrapper.find('.empty-concepts').trigger('click')
    expect(modal.props('active')).toBe(true)
  })

  test('clears the loading error when a reload succeeds', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let isOffline = true
    const dispatch = vi.fn(action =>
      isOffline && action === 'loadAssets'
        ? Promise.reject(new Error('network'))
        : Promise.resolve()
    )
    const { store, wrapper } = await mountPage({ dispatch })
    expect(wrapper.findComponent(TableInfo).props('isError')).toBe(true)

    isOffline = false
    store.state.production = { ...store.state.production }
    await flushPromises()

    expect(wrapper.findComponent(TableInfo).exists()).toBe(false)
  })

  test('clears the upload error when a retry succeeds', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { dispatch, wrapper } = await mountPage()
    const modal = wrapper.findComponent({ name: 'AddPreviewModal' })
    dispatch.mockRejectedValueOnce(new Error('network'))
    modal.vm.$emit('confirm', [])
    await flushPromises()
    expect(modal.props('isError')).toBe(true)

    modal.vm.$emit('confirm', [])
    await flushPromises()

    expect(modal.props('isError')).toBe(false)
  })

  test('keeps every publisher selectable once one is picked', async () => {
    const people = [{ id: 'person-1' }, { id: 'person-2' }]
    const { wrapper } = await mountPage({
      concepts: [
        buildConcept('concept-1', 'person-1'),
        buildConcept('concept-2', 'person-2')
      ],
      people
    })
    const field = wrapper.findComponent(PeopleField)

    field.vm.$emit('update:modelValue', people[0])
    await flushPromises()

    expect(wrapper.findAll('.item')).toHaveLength(1)
    expect(field.props('people')).toHaveLength(2)
  })

  test('opens the upload modal with the dropped files', async () => {
    const setFiles = vi.fn()
    const { wrapper } = await mountPage({
      concepts: [buildConcept('concept-1')],
      stubs: {
        AddPreviewModal: {
          name: 'AddPreviewModal',
          props: { active: { type: Boolean, default: false } },
          template: '<div />',
          methods: { setFiles }
        }
      }
    })
    const files = [new File(['x'], 'concept.png')]

    await wrapper.find('.concept-list').trigger('dragover')
    await wrapper.find('.drop-mask').trigger('drop', {
      dataTransfer: { files }
    })
    await flushPromises()

    expect(
      wrapper.findComponent({ name: 'AddPreviewModal' }).props('active')
    ).toBe(true)
    expect(setFiles).toHaveBeenCalledWith(files)
  })
})
