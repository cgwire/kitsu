import { flushPromises, shallowMount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

// Importing the panel transitively pulls in the root store
// (assets module → lib/models → timezone → @/store); stub it so no Vuex
// store is built.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

const playlistModal = vi.hoisted(() => ({ loaded: false }))

vi.mock('@/components/modals/ViewPlaylistModal.vue', async () => {
  const { defineComponent, h } = await import('vue')
  playlistModal.loaded = true
  return {
    default: defineComponent({
      name: 'ViewPlaylistModal',
      props: {
        active: { type: Boolean, default: false },
        sort: { type: Boolean, default: false },
        taskIds: { type: Array, default: () => [] }
      },
      emits: ['cancel'],
      setup: () => () => h('div')
    })
  }
})

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

const toSelection = items => new Map(items.map(item => [item.id, item]))

const folders = [
  { id: 'folder-1', name: 'Characters' },
  { id: 'folder-2', name: 'Sets' }
]

// A panel listens to the window keys: unmount every panel after its test.
const mountedPanels = []

afterEach(() => {
  mountedPanels
    .splice(0)
    .filter(wrapper => wrapper.exists())
    .forEach(wrapper => wrapper.unmount())
})

const mountPanel = async (
  concepts,
  {
    path = '/productions/production-1/concepts',
    role = 'manager',
    tasks = [],
    validations = 0,
    // Lines selected in the list of the page: assets, shots or edits.
    lines = [],
    customActions = []
  } = {}
) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/productions/:production_id/assets',
        name: 'assets',
        component: { template: '<div />' }
      },
      {
        path: '/productions/:production_id/concepts',
        name: 'concepts',
        component: { template: '<div />' }
      },
      {
        path: '/productions/:production_id/edits',
        name: 'edits',
        component: { template: '<div />' }
      },
      {
        path: '/productions/:production_id/sequences',
        name: 'sequences',
        component: { template: '<div />' }
      },
      {
        path: '/productions/:production_id/shots',
        name: 'shots',
        component: { template: '<div />' }
      },
      {
        path: '/productions/:production_id/shots/:shot_id',
        name: 'shot',
        component: { template: '<div />' }
      },
      {
        path: '/productions/:production_id/edits/:edit_id',
        name: 'edit',
        component: { template: '<div />' }
      }
    ]
  })
  await router.push(path)
  await router.isReady()

  const store = createStore({
    state: {
      // A concept selected alone comes with its task.
      nbSelectedTasks: concepts.length === 1 ? 1 : tasks.length,
      // Empty cells: the cells of an entity list without a task.
      nbSelectedValidations: validations,
      selectedConcepts: toSelection(concepts),
      selectedLines: toSelection(lines),
      selectedTasks: toSelection(tasks)
    },
    getters: {
      assetsByType: () => [assets],
      currentProduction: () => ({ id: 'production-1' }),
      conceptFolders: () => folders,
      currentUserRoleForProduction: () => () => role,
      getCustomActionsByType: () => () => customActions,
      isCurrentUserAdmin: () => false,
      isCurrentUserArtist: () => false,
      isCurrentUserClient: () => false,
      isShowAssignations: () => true,
      nbSelectedTasks: state => state.nbSelectedTasks,
      nbSelectedValidations: state => state.nbSelectedValidations,
      productionMap: () => new Map(),
      selectedAssets: state => state.selectedLines,
      selectedConcepts: state => state.selectedConcepts,
      selectedEdits: state => state.selectedLines,
      selectedShots: state => state.selectedLines,
      selectedTasks: state => state.selectedTasks,
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

const pressEscape = target =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      keyCode: 27,
      bubbles: true,
      cancelable: true
    })
  )

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
  let wrapper

  const addToPage = (tag, className = '') => {
    const element = document.createElement(tag)
    element.className = className
    document.body.appendChild(element)
    pageElements.push(element)
    return element
  }

  beforeEach(async () => {
    localStorage.clear()
    ;({ store, wrapper } = await mountPanel([concept]))
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

  test('clears the selection once per Escape after selection changes', async () => {
    store.state.selectedConcepts = toSelection([
      concept,
      buildConcept('concept-2')
    ])
    await flushPromises()
    store.state.selectedConcepts = toSelection([concept])
    await flushPromises()

    pressEscape(document.body)

    expect(store.commit).toHaveBeenCalledTimes(1)
  })

  test('stops listening once the selection is gone', async () => {
    store.state.nbSelectedTasks = 0
    store.state.selectedConcepts = toSelection([])
    await flushPromises()

    pressEscape(document.body)

    expect(store.commit).not.toHaveBeenCalled()
  })

  test('stops listening once closed', () => {
    wrapper.unmount()

    pressEscape(document.body)

    expect(store.commit).not.toHaveBeenCalled()
  })
})

// The task panel shows the action panel once something is selected: it
// opens with its selection already made.
describe('ActionPanel, opened on a task selection', () => {
  const task = {
    id: 'task-1',
    project_id: 'production-1',
    task_type_id: 'task-type-1'
  }

  const mountOnShots = () =>
    mountPanel([], { path: '/productions/production-1/shots', tasks: [task] })

  beforeEach(() => {
    localStorage.clear()
  })

  test('clears the task selection on an Escape on the page', async () => {
    const { store } = await mountOnShots()
    store.commit = vi.fn()

    pressEscape(document.body)

    expect(store.commit).toHaveBeenCalledWith('CLEAR_SELECTED_TASKS')
  })

  test('opens the bar used last', async () => {
    localStorage.setItem('entities--selected-bar', 'priorities')

    const { wrapper } = await mountOnShots()

    expect(
      wrapper.findAll('.action-bar .confirm-button').map(button => button.text())
    ).toEqual(['tasks.change_priority'])
  })

  // The assets, shots and edits pages share the bar used last, which may
  // also come from a selection of lines or of empty cells.
  test.each(['delete-assets', 'delete-shots', 'create-tasks'])(
    'opens the status bar rather than %s, used last but not offered',
    async lastBar => {
      localStorage.setItem('entities--selected-bar', lastBar)

      const { wrapper } = await mountOnShots()

      expect(
        wrapper
          .findAll('.action-bar .confirm-button')
          .map(button => button.text())
      ).toEqual(['tasks.change_task_status'])
    }
  )

  test('offers no task creation without empty cells', async () => {
    const { wrapper } = await mountPanel([], {
      path: '/productions/production-1/shots',
      tasks: [task, { ...task, id: 'task-2' }]
    })

    expect(wrapper.find('.menu > [title="menu.create_tasks"]').exists()).toBe(
      false
    )
  })

  // The store of these tests offers no status, like a selection of tasks
  // whose productions share none.
  test('changes nothing without a status to apply', async () => {
    const { store, wrapper } = await mountOnShots()
    store.dispatch.mockClear()

    const button = wrapper.find('.action-bar .confirm-button')
    await button.trigger('click')
    await flushPromises()

    expect(store.dispatch.mock.calls).toEqual([])
    expect(button.classes()).not.toContain('is-loading')
  })

  // Without episodes, these pages carry no episode in their route.
  test.each([
    ['shot', '/productions/production-1/shots/shot-1'],
    ['edit', '/productions/production-1/edits/edit-1']
  ])(
    'clears the task selection on an Escape on the %s page',
    async (name, path) => {
      const { store } = await mountPanel([], { path, tasks: [task] })
      store.commit = vi.fn()

      pressEscape(document.body)

      expect(store.commit).toHaveBeenCalledWith('CLEAR_SELECTED_TASKS')
    }
  )
})

describe('ActionPanel, opened on empty cells', () => {
  const task = {
    id: 'task-1',
    project_id: 'production-1',
    task_type_id: 'task-type-1'
  }

  const mountOnShots = options =>
    mountPanel([], { path: '/productions/production-1/shots', ...options })

  const confirmButtons = wrapper =>
    wrapper.findAll('.action-bar .confirm-button').map(button => button.text())

  beforeEach(() => {
    localStorage.clear()
  })

  test.each([
    ['the status bar', null],
    ['the bar used last', 'priorities']
  ])('opens the task creation rather than %s', async (name, lastBar) => {
    if (lastBar) localStorage.setItem('entities--selected-bar', lastBar)

    const { wrapper } = await mountOnShots({ validations: 2 })

    expect(confirmButtons(wrapper)).toEqual(['tasks.create_for_selection'])
  })

  test('offers the task creation beside selected tasks', async () => {
    const { wrapper } = await mountOnShots({
      tasks: [task, { ...task, id: 'task-2' }],
      validations: 2
    })

    expect(wrapper.find('.menu > [title="menu.create_tasks"]').exists()).toBe(
      true
    )
  })

  test('opens no bar to a user who cannot create tasks', async () => {
    const { wrapper } = await mountOnShots({
      role: 'supervisor',
      validations: 2
    })

    expect(wrapper.find('.menu').exists()).toBe(true)
    expect(wrapper.find('.action-bar').exists()).toBe(false)
  })

  test('leaves the status bar once the last task is unselected', async () => {
    const { store, wrapper } = await mountOnShots({
      tasks: [task],
      validations: 2
    })
    expect(confirmButtons(wrapper)).toEqual(['tasks.change_task_status'])

    store.state.nbSelectedTasks = 0
    store.state.selectedTasks = toSelection([])
    await flushPromises()

    expect(confirmButtons(wrapper)).toEqual(['tasks.create_for_selection'])
  })

  // The created tasks take the place of the empty cells in the selection.
  test('leaves the task creation once its cells hold tasks', async () => {
    const tasks = [task, { ...task, id: 'task-2' }]
    const { store, wrapper } = await mountOnShots({ tasks, validations: 1 })
    await wrapper.find('.menu > [title="menu.create_tasks"]').trigger('click')
    expect(confirmButtons(wrapper)).toEqual(['tasks.create_for_selection'])

    store.state.nbSelectedValidations = 0
    store.state.nbSelectedTasks = 3
    store.state.selectedTasks = toSelection([...tasks, { ...task, id: 'task-3' }])
    await flushPromises()

    expect(confirmButtons(wrapper)).toEqual(['tasks.change_task_status'])
  })

  test('closes the task creation of the sequences once its cells hold tasks', async () => {
    const { store, wrapper } = await mountPanel([], {
      path: '/productions/production-1/sequences',
      validations: 2
    })
    expect(confirmButtons(wrapper)).toEqual(['tasks.create_for_selection'])

    store.state.nbSelectedValidations = 0
    store.state.nbSelectedTasks = 2
    store.state.selectedTasks = toSelection([task, { ...task, id: 'task-2' }])
    await flushPromises()

    expect(wrapper.find('.menu').exists()).toBe(true)
    expect(wrapper.find('.action-bar').exists()).toBe(false)
  })

  // Regression: the bar was chosen before the custom actions of the tasks
  // joining the selection were listed, so the status bar opened instead.
  test('reopens the custom actions used last once tasks join the cells', async () => {
    localStorage.setItem('entities--selected-bar', 'custom-actions')
    const { store, wrapper } = await mountOnShots({
      customActions: [{ id: 'action-1', name: 'Render', url: 'https://a.test' }],
      validations: 1
    })

    store.state.nbSelectedValidations = 0
    store.state.nbSelectedTasks = 1
    store.state.selectedTasks = toSelection([task])
    await flushPromises()

    expect(wrapper.find('.custom-action-combobox').exists()).toBe(true)
  })
})

describe('ActionPanel, entity deletion', () => {
  const deletions = [
    ['assets', 'menu.delete_assets'],
    ['shots', 'menu.delete_shots'],
    ['edits', 'menu.delete_edits']
  ]

  beforeEach(() => {
    localStorage.clear()
  })

  test.each(deletions)(
    'offers the deletion of the %s selected in the list',
    async (page, title) => {
      const { wrapper } = await mountPanel([], {
        path: `/productions/production-1/${page}`,
        lines: [{ id: 'line-1', canceled: false }]
      })

      expect(wrapper.find(`.menu > [title="${title}"]`).exists()).toBe(true)
    }
  )

  test.each(deletions)(
    'offers no deletion of %s on empty cells only',
    async (page, title) => {
      const { wrapper } = await mountPanel([], {
        path: `/productions/production-1/${page}`,
        validations: 2
      })

      expect(wrapper.find(`.menu > [title="${title}"]`).exists()).toBe(false)
    }
  )
})

describe('ActionPanel, more actions menu', () => {
  const task = {
    id: 'task-1',
    project_id: 'production-1',
    task_type_id: 'task-type-1'
  }

  const mountOnShots = role =>
    mountPanel([], {
      path: '/productions/production-1/shots',
      role,
      tasks: [task]
    })

  const moreButton = wrapper => wrapper.find('[title="menu.more_actions"]')

  const openMoreActions = async wrapper => {
    await moreButton(wrapper).trigger('click')
    return wrapper.findAll('.more-actions-list [role="option"]')
  }

  beforeEach(() => {
    localStorage.clear()
  })

  test('moves the secondary actions out of the bar', async () => {
    const { wrapper } = await mountOnShots('manager')

    expect(wrapper.find('.menu > [title="menu.subscribe"]').exists()).toBe(
      false
    )
    expect(wrapper.find('.menu > [title="menu.delete_tasks"]').exists()).toBe(
      false
    )
    const items = await openMoreActions(wrapper)
    expect(items.map(item => item.text())).toEqual([
      'menu.subscribe',
      'menu.delete_tasks'
    ])
  })

  test('keeps the manager actions for managers', async () => {
    const { wrapper } = await mountOnShots('supervisor')

    const items = await openMoreActions(wrapper)
    expect(items.map(item => item.text())).toEqual(['menu.subscribe'])
  })

  test('opens the bar of the chosen action', async () => {
    const { wrapper } = await mountOnShots('manager')

    const items = await openMoreActions(wrapper)
    await items[0].trigger('click')

    expect(wrapper.find('.more-actions-list').exists()).toBe(false)
    expect(moreButton(wrapper).classes()).toContain('active')
    expect(
      wrapper.findAll('.action-bar .confirm-button').map(button => button.text())
    ).toEqual(['tasks.subscribe_to_tasks'])
  })

  test('hides the menu without any secondary action', async () => {
    const { wrapper } = await mountPanel([buildConcept('concept-1')])

    expect(moreButton(wrapper).exists()).toBe(false)
  })
})

describe('ActionPanel, client comments copy', () => {
  const task = {
    id: 'task-1',
    project_id: 'production-1',
    task_type_id: 'task-type-1'
  }

  const mountOnShots = role =>
    mountPanel([], {
      path: '/productions/production-1/shots',
      role,
      tasks: [task]
    })

  const copyButton = wrapper =>
    wrapper.find('.menu [title="menu.copy_client_comments"]')

  const openCopyBar = async wrapper => {
    await copyButton(wrapper).trigger('click')
    return wrapper.find('.copy-client-comments')
  }

  beforeEach(() => {
    localStorage.clear()
  })

  test('is a manager action', async () => {
    const manager = await mountOnShots('manager')
    expect(copyButton(manager.wrapper).exists()).toBe(true)

    const supervisor = await mountOnShots('supervisor')
    expect(copyButton(supervisor.wrapper).exists()).toBe(false)
  })

  test('copies with the typed prefix and tells the result', async () => {
    const { store, wrapper } = await mountOnShots('manager')
    store.dispatch = vi.fn(() => Promise.resolve({ nbCopied: 2, nbSkipped: 1 }))

    const bar = await openCopyBar(wrapper)
    await bar.find('input').setValue('Client:')
    await bar.find('.confirm-button').trigger('click')
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('copyLastClientComments', {
      prefix: 'Client:'
    })
    expect(bar.find('.result').text()).toBe('tasks.client_comments_copied')
    expect(bar.find('.is-danger').exists()).toBe(false)
  })

  test('keeps the last prefix for the next copy', async () => {
    const first = await mountOnShots('manager')
    first.store.dispatch = vi.fn(() =>
      Promise.resolve({ nbCopied: 1, nbSkipped: 0 })
    )
    const bar = await openCopyBar(first.wrapper)
    await bar.find('input').setValue('Client:')
    await bar.find('.confirm-button').trigger('click')
    await flushPromises()

    // the panel opens again on the bar used last
    const second = await mountOnShots('manager')
    const input = second.wrapper.find('.copy-client-comments input')
    expect(input.element.value).toBe('Client:')
  })

  test('tells when the copy fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { store, wrapper } = await mountOnShots('manager')
    store.dispatch = vi.fn(() => Promise.reject(new Error('refused')))

    const bar = await openCopyBar(wrapper)
    await bar.find('.confirm-button').trigger('click')
    await flushPromises()

    expect(bar.find('.is-danger').text()).toBe(
      'tasks.copy_client_comments_error'
    )
    expect(bar.find('.result').exists()).toBe(false)
    vi.restoreAllMocks()
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

// The playlist player weighs more than the rest of the panel.
describe('ActionPanel, playlist of the selection', () => {
  const task = {
    id: 'task-1',
    project_id: 'production-1',
    task_type_id: 'task-type-1'
  }

  beforeEach(() => {
    localStorage.clear()
  })

  // Keep this test last: the modal stays loaded once a test opens a playlist.
  test('loads the playlist when it opens, not with the panel', async () => {
    const { wrapper } = await mountPanel([], {
      path: '/productions/production-1/shots',
      tasks: [task]
    })
    expect(playlistModal.loaded).toBe(false)

    await wrapper
      .find('.menu-item[title="menu.generate_playlist"]')
      .trigger('click')
    await wrapper.find('.confirm-button').trigger('click')
    await vi.dynamicImportSettled()
    await flushPromises()

    expect(playlistModal.loaded).toBe(true)
    expect(wrapper.findComponent({ name: 'ViewPlaylistModal' }).exists()).toBe(
      true
    )
  })
})
