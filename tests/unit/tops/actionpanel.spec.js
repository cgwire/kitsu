import { flushPromises, shallowMount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

// Importing the panel transitively pulls in the root store
// (assets module → lib/models → timezone → @/store); stub it so no Vuex
// store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import ActionPanel from '@/components/tops/ActionPanel.vue'
import ConceptFolderTile from '@/components/widgets/ConceptFolderTile.vue'
import assetsStore from '@/store/modules/assets'

const assets = [
  { id: 'asset-1', name: 'Tree', asset_type_name: 'Props' },
  { id: 'asset-2', name: 'Rock', asset_type_name: 'Props' }
]

const buildConcept = (id, links = []) => ({
  id,
  created_by: 'user-1',
  entity_concept_links: links
})

const toSelection = concepts =>
  new Map(concepts.map(concept => [concept.id, concept]))

const folders = [
  { id: 'folder-1', name: 'Characters' },
  { id: 'folder-2', name: 'Sets' }
]

// A panel listens to the window keys: unmount every panel after its test.
const mountedPanels = []

afterEach(() => {
  mountedPanels.splice(0).forEach(wrapper => wrapper.unmount())
})

const mountPanel = async (concepts, { role = 'manager' } = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/productions/:production_id/concepts',
        name: 'concepts',
        component: { template: '<div />' }
      }
    ]
  })
  await router.push('/productions/production-1/concepts')
  await router.isReady()

  const store = createStore({
    state: {
      nbSelectedTasks: concepts.length === 1 ? 1 : 0,
      selectedConcepts: toSelection(concepts)
    },
    getters: {
      assetsByType: () => [assets],
      currentProduction: () => ({ id: 'production-1' }),
      conceptFolders: () => folders,
      currentUserRoleForProduction: () => () => role,
      getCustomActionsByType: () => () => [],
      isCurrentUserAdmin: () => false,
      isCurrentUserArtist: () => false,
      isCurrentUserClient: () => false,
      isShowAssignations: () => true,
      nbSelectedTasks: state => state.nbSelectedTasks,
      nbSelectedValidations: () => 0,
      productionMap: () => new Map(),
      selectedAssets: () => new Map(),
      selectedConcepts: state => state.selectedConcepts,
      selectedEdits: () => new Map(),
      selectedShots: () => new Map(),
      selectedTasks: () => new Map(),
      taskMap: () => new Map(),
      taskStatusForCurrentUser: () => [],
      taskTypeMap: () => new Map(),
      user: () => ({ id: 'user-1', departments: [] })
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())

  const wrapper = shallowMount(ActionPanel, {
    props: { productionId: 'production-1' },
    global: { plugins: [router, store] }
  })
  await flushPromises()
  mountedPanels.push(wrapper)
  return { store, wrapper }
}

const openLinks = wrapper =>
  wrapper.find('[title="menu.edit_concepts"]').trigger('click')

const linkedTags = wrapper =>
  wrapper.findAll('.action-bar .tag').map(tag => tag.text())

const clickTag = (wrapper, selector, name) =>
  wrapper
    .findAll(selector)
    .find(tag => tag.text().startsWith(name))
    .trigger('click')

describe('ActionPanel, concept links', () => {
  beforeEach(() => {
    localStorage.clear()
    assets.forEach(asset => assetsStore.cache.assetMap.set(asset.id, asset))
  })

  afterEach(() => {
    assetsStore.cache.assetMap.clear()
  })

  test('offers the links on a selection of several concepts', async () => {
    const { wrapper } = await mountPanel([
      buildConcept('concept-1'),
      buildConcept('concept-2')
    ])

    expect(wrapper.find('[title="menu.edit_concepts"]').exists()).toBe(true)
  })

  test('tells the assets linked to a part of the selection', async () => {
    const { wrapper } = await mountPanel([
      buildConcept('concept-1', ['asset-1', 'asset-2']),
      buildConcept('concept-2', ['asset-2'])
    ])
    await openLinks(wrapper)

    expect(linkedTags(wrapper)).toEqual(['Tree (1/2)', 'Rock'])
    expect(
      wrapper.find('.action-bar .tag').attributes('title')
    ).toBe('concepts.actions.remove_link')
  })

  test('links an asset to every selected concept missing it', async () => {
    const { store, wrapper } = await mountPanel([
      buildConcept('concept-1', ['asset-1']),
      buildConcept('concept-2'),
      buildConcept('concept-3')
    ])
    await openLinks(wrapper)
    store.dispatch.mockClear()

    await clickTag(wrapper, '.concept-links .tag', 'Tree')
    await flushPromises()

    expect(store.dispatch.mock.calls).toEqual([
      ['editConcept', { id: 'concept-2', entity_concept_links: ['asset-1'] }],
      ['editConcept', { id: 'concept-3', entity_concept_links: ['asset-1'] }]
    ])
  })

  test('stops offering an asset every selected concept is linked to', async () => {
    const { wrapper } = await mountPanel([
      buildConcept('concept-1', ['asset-1']),
      buildConcept('concept-2', ['asset-1'])
    ])
    await openLinks(wrapper)

    expect(
      wrapper.findAll('.concept-links .tag').map(tag => tag.text())
    ).toEqual(['Rock'])
  })

  test('unlinks an asset from every selected concept carrying it', async () => {
    const { store, wrapper } = await mountPanel([
      buildConcept('concept-1', ['asset-1', 'asset-2']),
      buildConcept('concept-2', ['asset-2']),
      buildConcept('concept-3', ['asset-1'])
    ])
    await openLinks(wrapper)
    store.dispatch.mockClear()

    await clickTag(wrapper, '.action-bar .tag', 'Rock')
    await flushPromises()

    expect(store.dispatch.mock.calls).toEqual([
      ['editConcept', { id: 'concept-1', entity_concept_links: ['asset-1'] }],
      ['editConcept', { id: 'concept-2', entity_concept_links: [] }]
    ])
  })

  // Each request sends the whole link list of a concept: a second click
  // must wait for the answer to the first one, or it erases its link.
  test('keeps both links when two assets are picked back to back', async () => {
    const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
    const { store, wrapper } = await mountPanel(concepts)
    await openLinks(wrapper)
    store.dispatch.mockImplementation(
      (type, { id, entity_concept_links: links }) =>
        new Promise(resolve => {
          setTimeout(() => {
            store.state.selectedConcepts.get(id).entity_concept_links = links
            resolve()
          })
        })
    )

    await clickTag(wrapper, '.concept-links .tag', 'Tree')
    await clickTag(wrapper, '.concept-links .tag', 'Rock')

    await vi.waitFor(() =>
      expect(
        concepts.map(concept =>
          store.state.selectedConcepts.get(concept.id).entity_concept_links
        )
      ).toEqual([
        ['asset-1', 'asset-2'],
        ['asset-1', 'asset-2']
      ])
    )
  })

  test('keeps the links open while the selection grows', async () => {
    const concepts = [buildConcept('concept-1'), buildConcept('concept-2')]
    const { store, wrapper } = await mountPanel([concepts[0]])
    await openLinks(wrapper)

    store.state.nbSelectedTasks = 0
    store.state.selectedConcepts = toSelection(concepts)
    await flushPromises()

    expect(wrapper.find('.concept-links').exists()).toBe(true)
  })
})

describe('ActionPanel, Escape', () => {
  const concept = buildConcept('concept-1')
  const pageElements = []
  let store

  const addToPage = (tag, className = '') => {
    const element = document.createElement(tag)
    element.className = className
    document.body.appendChild(element)
    pageElements.push(element)
    return element
  }

  const pressEscape = target =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        keyCode: 27,
        bubbles: true,
        cancelable: true
      })
    )

  beforeEach(async () => {
    localStorage.clear()
    ;({ store } = await mountPanel([concept]))
    // The panel listens to Escape once its selection changed under it.
    store.state.selectedConcepts = toSelection([
      concept,
      buildConcept('concept-2')
    ])
    await flushPromises()
    store.state.selectedConcepts = toSelection([concept])
    await flushPromises()
    store.commit = vi.fn()
  })

  afterEach(() => {
    pageElements.splice(0).forEach(element => element.remove())
  })

  test('clears the task selection on an Escape on the page', () => {
    pressEscape(addToPage('a'))

    expect(store.commit).toHaveBeenCalledWith('CLEAR_SELECTED_TASKS')
  })

  test('clears the task selection on an Escape from an empty field', () => {
    // The comment box of the task panel takes the focus by itself.
    pressEscape(addToPage('textarea'))

    expect(store.commit).toHaveBeenCalledWith('CLEAR_SELECTED_TASKS')
  })

  test('clears the task selection on an Escape from a checkbox', () => {
    const checkbox = addToPage('input')
    checkbox.type = 'checkbox'

    pressEscape(checkbox)

    expect(store.commit).toHaveBeenCalledWith('CLEAR_SELECTED_TASKS')
  })

  test('keeps the selection on an Escape typed in a field holding text', () => {
    const textarea = addToPage('textarea')
    textarea.value = 'Draft comment'

    pressEscape(textarea)

    expect(store.commit).not.toHaveBeenCalled()
  })

  test('keeps the selection on an Escape a list took to close', () => {
    const combobox = addToPage('div')
    combobox.addEventListener('keydown', event => event.preventDefault())

    pressEscape(combobox)

    expect(store.commit).not.toHaveBeenCalled()
  })

  test('keeps the selection on an Escape that closes a modal', () => {
    addToPage('div', 'modal is-active')

    pressEscape(document.body)

    expect(store.commit).not.toHaveBeenCalled()
  })
})

describe('ActionPanel, concept folders', () => {
  const openFolders = wrapper =>
    wrapper.find('[title="concepts.folders.move"]').trigger('click')

  // The targets wear the folder tile of the concepts page, not the tag of
  // the linked assets.
  const folderTiles = wrapper =>
    wrapper
      .find('.concept-folders')
      .findAllComponents(ConceptFolderTile)
      .map(tile => tile.props('name'))

  const clickFolder = (wrapper, name) =>
    wrapper
      .findAll('.concept-folders [role="button"]')
      [folderTiles(wrapper).indexOf(name)].trigger('click')

  beforeEach(() => {
    localStorage.clear()
  })

  test('moves the selected concepts to the picked folder', async () => {
    const { store, wrapper } = await mountPanel([
      buildConcept('concept-1'),
      buildConcept('concept-2')
    ])
    await openFolders(wrapper)

    await clickFolder(wrapper, 'Sets')
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('moveConcepts', {
      conceptIds: ['concept-1', 'concept-2'],
      folderId: 'folder-2'
    })
    expect(store.dispatch).toHaveBeenCalledWith('clearSelectedConcepts')
  })

  test('offers the way out of a folder to the concepts sorted in one', async () => {
    const sorted = { ...buildConcept('concept-1'), parent_id: 'folder-1' }
    const { store, wrapper } = await mountPanel([sorted])
    await openFolders(wrapper)
    expect(folderTiles(wrapper)).toEqual(['concepts.folders.none', 'Sets'])

    await clickFolder(wrapper, 'concepts.folders.none')
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('moveConcepts', {
      conceptIds: ['concept-1'],
      folderId: null
    })
  })

  test('offers only the folders to the unsorted concepts', async () => {
    const { wrapper } = await mountPanel([buildConcept('concept-1')])
    await openFolders(wrapper)

    expect(folderTiles(wrapper)).toEqual(['Characters', 'Sets'])
  })

  test('keeps the folders away from a publisher', async () => {
    const { wrapper } = await mountPanel([buildConcept('concept-1')], {
      role: 'user'
    })

    expect(wrapper.find('[title="concepts.folders.move"]').exists()).toBe(false)
    expect(wrapper.find('[title="menu.edit_concepts"]').exists()).toBe(true)
  })
})
