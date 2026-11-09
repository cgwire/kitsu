import {
  flushPromises,
  mount,
  RouterLinkStub,
  shallowMount
} from '@vue/test-utils'
import { h, nextTick, reactive } from 'vue'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import EditSearchFilterGroupModal from '@/components/modals/EditSearchFilterGroupModal.vue'
import EditSearchFilterModal from '@/components/modals/EditSearchFilterModal.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'

// Labels render as their locale keys.
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const search = {
  id: 'search-1',
  name: 'wip',
  person_id: 'me',
  search_query: 'wip',
  search_filter_group_id: null,
  is_shared: false
}
const sharedSearch = { ...search, id: 'search-2', name: 'zz', is_shared: true }
const group = {
  id: 'group-1',
  name: 'Mine',
  color: '#ff3860',
  person_id: 'me',
  is_shared: false
}
const sharedGroup = { ...group, id: 'group-2', name: 'Team', is_shared: true }

const mountList = async ({
  type = 'shot',
  actions = {},
  entityType,
  groups = [group],
  isAdmin = false,
  isClient = false,
  productionId,
  queries = [search],
  role = 'manager',
  throughRef = false,
  url = '/'
} = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  await router.push(url)
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1' }),
      currentUserRoleForProduction: () => () => role,
      departmentMap: () => new Map(),
      isCurrentUserAdmin: () => isAdmin,
      isCurrentUserClient: () => isClient,
      isCurrentUserManager: () => isAdmin || role === 'manager',
      personMap: () => new Map(),
      user: () => ({ id: 'me' })
    },
    actions
  })
  const props = {
    type,
    queries,
    groups,
    isGroupEnabled: true,
    entityType,
    productionId
  }
  const stubs = { RouterLink: RouterLinkStub }
  if (throughRef) {
    // A page holds the list by a template ref, which reaches only what the
    // list exposes.
    const page = { render: () => h(SearchQueryList, { ...props, ref: 'list' }) }
    return mount(page, {
      global: {
        plugins: [store, router, i18n],
        stubs: { ...stubs, EditSearchFilterModal: true }
      }
    })
  }
  return shallowMount(SearchQueryList, {
    props,
    global: { plugins: [store, router, i18n], stubs }
  })
}

const confirmation = wrapper => wrapper.findComponent(ConfirmModal)
const removeSearch = wrapper =>
  wrapper.find('.tag:not(.folder):not(.group) button.del').trigger('click')
const removeGroup = wrapper =>
  wrapper.find('.tag.group button.del').trigger('click')

describe('SearchQueryList, removals', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('keeps the confirmation open until the search is removed', async () => {
    let endRemoval
    const removeShotSearch = vi.fn(
      () =>
        new Promise(resolve => {
          endRemoval = resolve
        })
    )
    const wrapper = await mountList({ actions: { removeShotSearch } })

    await removeSearch(wrapper)
    await confirmation(wrapper).vm.$emit('confirm')
    await nextTick()

    expect(removeShotSearch).toHaveBeenCalledWith(expect.anything(), search)
    expect(confirmation(wrapper).props('isLoading')).toBe(true)
    endRemoval()
    await flushPromises()
    expect(confirmation(wrapper).exists()).toBe(false)
  })

  test('keeps the confirmation of a failed search removal open', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountList({
      actions: { removeShotSearch: () => Promise.reject(new Error('down')) }
    })

    await removeSearch(wrapper)
    await confirmation(wrapper).vm.$emit('confirm')
    await flushPromises()

    expect(confirmation(wrapper).props()).toMatchObject({
      isError: true,
      isLoading: false,
      errorText: 'main.remove_search_query_error'
    })
    expect(console.error).toHaveBeenCalledWith(new Error('down'))
  })

  test('keeps the confirmation of a failed group removal open', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountList({
      actions: {
        removeShotSearchFilterGroup: () => Promise.reject(new Error('down'))
      }
    })

    await removeGroup(wrapper)
    await confirmation(wrapper).vm.$emit('confirm')
    await flushPromises()

    expect(confirmation(wrapper).props()).toMatchObject({
      isError: true,
      isLoading: false,
      errorText: 'main.remove_search_filter_group_error'
    })
  })

  test('opens a confirmation without the error of a failed one', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountList({
      actions: {
        removeShotSearchFilterGroup: () => Promise.reject(new Error('down'))
      }
    })
    await removeGroup(wrapper)
    await confirmation(wrapper).vm.$emit('confirm')
    await flushPromises()
    if (confirmation(wrapper).exists()) {
      await confirmation(wrapper).vm.$emit('cancel')
    }

    await removeSearch(wrapper)

    expect(confirmation(wrapper).props('isError')).toBe(false)
  })
})

// The lists whose removal action does not follow remove<Type>Search.
describe.each([
  ['asset', 'removeAssetSearch'],
  ['person', 'removePersonTasksSearch'],
  ['sequenceStat', 'removeSequenceSearch'],
  ['taskType', 'removeTaskSearch'],
  ['todo', 'removeTodoSearch']
])('SearchQueryList of type %s', (type, action) => {
  test(`removes a search through ${action}`, async () => {
    const remove = vi.fn(() => Promise.resolve())
    const wrapper = await mountList({ type, actions: { [action]: remove } })

    await removeSearch(wrapper)
    await confirmation(wrapper).vm.$emit('confirm')
    await flushPromises()

    expect(remove).toHaveBeenCalledWith(expect.anything(), search)
  })
})

// The lists whose action does not follow save<Type>Search are listed too.
describe.each([
  ['asset', 'saveAssetSearch'],
  ['breakdown', 'saveBreakdownSearch'],
  ['edit', 'saveEditSearch'],
  ['episode', 'saveEpisodeSearch'],
  ['people', 'savePeopleSearch'],
  ['person', 'savePersonTasksSearch'],
  ['sequence', 'saveSequenceSearch'],
  ['sequenceStat', 'saveSequenceSearch'],
  ['shot', 'saveShotSearch'],
  ['taskType', 'saveTaskSearch'],
  ['todo', 'saveTodoSearch']
])('SearchQueryList of type %s', (type, action) => {
  test(`saves a new search through ${action}`, async () => {
    const save = vi.fn(() => Promise.resolve())
    const wrapper = await mountList({ type, actions: { [action]: save } })

    wrapper.vm.addSearch('anim=wip')
    await nextTick()
    wrapper
      .findComponent(EditSearchFilterModal)
      .vm.$emit('confirm', { id: null, name: 'mine' })
    await flushPromises()

    expect(save.mock.calls[0][1]).toEqual({
      id: null,
      name: 'mine',
      entity_type: null
    })
  })
})

describe('SearchQueryList, additions', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const addSearch = async (wrapper, searchQuery = 'anim=wip') => {
    wrapper.vm.addSearch(searchQuery)
    await nextTick()
    return wrapper.findComponent(EditSearchFilterModal)
  }

  test('opens the search filter modal for a page holding the list', async () => {
    const wrapper = await mountList({ throughRef: true })

    wrapper.vm.$refs.list.addSearch('anim=wip')
    await nextTick()

    expect(
      wrapper.findComponent(EditSearchFilterModal).props('searchQueryToEdit')
    ).toEqual({ name: 'anim=wip', search_query: 'anim=wip' })
  })

  test('opens the search filter modal on the search', async () => {
    const wrapper = await mountList()

    const modal = await addSearch(wrapper)

    expect(modal.props('searchQueryToEdit')).toEqual({
      name: 'anim=wip',
      search_query: 'anim=wip'
    })
  })

  test('closes the modal once the search is saved', async () => {
    let endSave
    const saveShotSearch = vi.fn(
      () =>
        new Promise(resolve => {
          endSave = resolve
        })
    )
    const wrapper = await mountList({ actions: { saveShotSearch } })

    const modal = await addSearch(wrapper)
    modal.vm.$emit('confirm', { name: 'mine' })
    await nextTick()

    expect(modal.props('isLoading')).toBe(true)
    endSave()
    await flushPromises()
    expect(wrapper.findComponent(EditSearchFilterModal).exists()).toBe(false)
  })

  test('keeps the modal open on a failed save', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountList({
      actions: { saveShotSearch: () => Promise.reject(new Error('down')) }
    })

    const modal = await addSearch(wrapper)
    modal.vm.$emit('confirm', { name: 'mine' })
    await flushPromises()

    expect(modal.props('isError')).toBe(true)
    expect(console.error).toHaveBeenCalledWith(new Error('down'))
  })

  test('opens without the error of a failed save', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountList({
      actions: { saveShotSearch: () => Promise.reject(new Error('down')) }
    })
    const modal = await addSearch(wrapper)
    modal.vm.$emit('confirm', { name: 'mine' })
    await flushPromises()
    await modal.vm.$emit('cancel')

    const reopened = await addSearch(wrapper)

    expect(reopened.props('isError')).toBe(false)
    expect(console.error).toHaveBeenCalledWith(new Error('down'))
  })

  test('tells the modal the searches of the list', async () => {
    const wrapper = await mountList({ queries: [search, sharedSearch] })

    const modal = await addSearch(wrapper)

    expect(modal.props('queries').map(({ id }) => id)).toEqual([
      'search-1',
      'search-2'
    ])
  })

  // A client does not see the shared ones: their names stay free.
  test('tells the modal only the searches a client sees', async () => {
    const wrapper = await mountList({
      isClient: true,
      queries: [search, sharedSearch]
    })

    const modal = await addSearch(wrapper)

    expect(modal.props('queries').map(({ id }) => id)).toEqual(['search-1'])
  })

  test('tells the group modal the groups of the list', async () => {
    const wrapper = await mountList({ groups: [group, sharedGroup] })

    await wrapper.find('.tag.folder').trigger('click')

    expect(
      wrapper
        .findComponent(EditSearchFilterGroupModal)
        .props('groups')
        .map(({ id }) => id)
    ).toEqual(['group-1', 'group-2'])
  })

  test('saves a search with the entity type of its list', async () => {
    const saveTaskSearch = vi.fn(() => Promise.resolve())
    const wrapper = await mountList({
      type: 'taskType',
      actions: { saveTaskSearch },
      entityType: 'Asset'
    })

    const modal = await addSearch(wrapper)
    modal.vm.$emit('confirm', { name: 'mine' })
    await flushPromises()

    expect(saveTaskSearch.mock.calls[0][1].entity_type).toBe('Asset')
  })
})

describe('SearchQueryList, links', () => {
  const lastLink = wrapper =>
    wrapper.findAllComponents(RouterLinkStub).at(-1).props('to')
  const pageSearch = wrapper =>
    wrapper.vm.$router.currentRoute.value.query.search

  // The store edits a search in place, as UPDATE_USER_FILTER does: neither the
  // number of searches nor the route changes.
  const mountEditableList = async url => {
    const queries = reactive([{ ...search, search_query: 'old' }])
    const wrapper = await mountList({
      queries,
      url,
      actions: {
        updateSearchFilter: (_, searchFilter) => {
          Object.assign(queries[0], searchFilter)
        }
      }
    })
    await flushPromises()
    return wrapper
  }
  const editQuery = async (wrapper, searchQuery) => {
    await wrapper
      .find('.tag:not(.folder):not(.group) button.edit')
      .trigger('click')
    wrapper
      .findComponent(EditSearchFilterModal)
      .vm.$emit('confirm', { id: search.id, search_query: searchQuery })
    await flushPromises()
  }
  const clickTag = async wrapper => {
    await wrapper.find('.tag:not(.folder):not(.group)').trigger('click')
    await flushPromises()
  }

  test('links a search to its query', async () => {
    const wrapper = await mountEditableList('/')

    expect(lastLink(wrapper).query.search).toBe('old')
  })

  test('links a search added to the list', async () => {
    const queries = reactive([search])
    const wrapper = await mountList({ queries })
    await flushPromises()

    queries.push({
      ...search,
      id: 'search-3',
      name: 'zz',
      search_query: 'added'
    })
    await flushPromises()

    expect(lastLink(wrapper).query.search).toBe('added')
  })

  test('links an edited search to its new query', async () => {
    const wrapper = await mountEditableList('/')

    await editQuery(wrapper, 'new')

    expect(lastLink(wrapper).query.search).toBe('new')
  })

  test('runs the new query of an edited search', async () => {
    const wrapper = await mountEditableList('/?search=other')
    await editQuery(wrapper, 'new')

    await clickTag(wrapper)

    expect(pageSearch(wrapper)).toBe('new')
  })

  // The old link leads to the page as it is: the click would do nothing.
  test('runs the new query of a search edited on its old one', async () => {
    const wrapper = await mountEditableList('/?search=old')
    await editQuery(wrapper, 'new')

    await clickTag(wrapper)

    expect(pageSearch(wrapper)).toBe('new')
  })
})

// The list cuts a long name.
describe('SearchQueryList, tooltips', () => {
  const tag = wrapper => wrapper.find('.tag:not(.folder):not(.group)')

  test('gives the whole name of a search', async () => {
    const wrapper = await mountList()

    expect(tag(wrapper).attributes('title')).toBe('wip')
  })

  test('adds who shared a search', async () => {
    const wrapper = await mountList({ queries: [sharedSearch] })

    expect(tag(wrapper).attributes('title')).toBe('zz\nmain.shared_by')
  })

  test('gives the whole name of a group', async () => {
    const wrapper = await mountList()

    expect(wrapper.find('.tag.group .filter-label').attributes('title')).toBe(
      'Mine'
    )
  })
})

describe('SearchQueryList, buttons of a row', () => {
  const buttonsOf = node => [
    node.find('button.edit').exists(),
    node.find('button.del').exists()
  ]

  // A filter alone, a filter in a group, a group holding it, and an empty
  // group, all of the given owner.
  const mountRows = async (personId, isShared, who) => {
    const row = { is_shared: isShared, person_id: personId }
    const wrapper = await mountList({
      ...who,
      productionId: 'production-1',
      queries: [
        { ...search, ...row, id: 'alone', name: 'alone' },
        {
          ...search,
          ...row,
          id: 'held',
          name: 'held',
          search_filter_group_id: 'holding'
        }
      ],
      groups: [
        { ...group, ...row, id: 'holding', name: 'A' },
        { ...group, ...row, id: 'empty', name: 'B' }
      ]
    })
    const [holding, empty] = wrapper.findAll('.tag.group')
    await holding.trigger('click')
    return {
      alone: buttonsOf(
        wrapper.find('.search-queries > .tag:not(.folder):not(.group)')
      ),
      held: buttonsOf(holding.find('.group-list .tag')),
      holding: buttonsOf(holding.find('.group-header')),
      empty: buttonsOf(empty.find('.group-header'))
    }
  }

  const visible = {
    alone: [true, true],
    held: [true, true],
    // A group holding filters cannot be removed.
    holding: [true, false],
    empty: [true, true]
  }
  const hidden = {
    alone: [false, false],
    held: [false, false],
    holding: [false, false],
    empty: [false, false]
  }

  test.each([
    ['its owner, a manager', 'me', { role: 'manager' }, visible],
    ['a manager who does not own it', 'other', { role: 'manager' }, hidden],
    ['an admin who does not own it', 'other', { isAdmin: true }, visible],
    ['its owner, no longer a manager', 'me', { role: 'user' }, hidden],
    ['an artist who does not own it', 'other', { role: 'user' }, hidden]
  ])('on a shared row, for %s', async (_, personId, who, expected) => {
    expect(await mountRows(personId, true, who)).toEqual(expected)
  })

  test('on a private row, for an artist', async () => {
    expect(await mountRows('me', false, { role: 'user' })).toEqual(visible)
  })

  // A filter of someone else in a shared group turns private with the group,
  // and stays in the list of its owner until a reload.
  test.each([
    ['a manager', { role: 'manager' }, hidden],
    ['an admin', { isAdmin: true }, visible]
  ])('on a private row of someone else, for %s', async (_, who, expected) => {
    expect(await mountRows('other', false, who)).toEqual(expected)
  })

  const theirs = { is_shared: true, person_id: 'other' }
  const held = { search_filter_group_id: sharedGroup.id }

  test.each([
    ['nothing in the list', [], [], {}, false],
    ['a filter of their own', [sharedSearch], [], {}, true],
    ['a group of their own', [], [sharedGroup], {}, true],
    ['only the filter of a colleague', [{ ...sharedSearch, ...theirs }], [], {}, false],
    ['only the group of a colleague', [], [{ ...sharedGroup, ...theirs }], {}, false],
    [
      'their filter in the group of a colleague',
      [{ ...sharedSearch, ...held }],
      [{ ...sharedGroup, ...theirs }],
      {},
      true
    ],
    [
      'an admin, on the rows of others',
      [{ ...sharedSearch, ...theirs }],
      [],
      { isAdmin: true },
      true
    ],
    ['an artist, on a shared row', [{ ...sharedSearch, ...theirs }], [], { role: 'user' }, false]
  ])('the edit mode, with %s', async (_, queries, groups, who, expected) => {
    const wrapper = await mountList({
      ...who,
      groups,
      productionId: 'production-1',
      queries
    })

    expect(
      wrapper.find('.tag.folder[title="main.edit_mode_on"]').exists()
    ).toBe(expected)
  })

  test('leaves the edit mode with the last row it can change', async () => {
    const pencil = wrapper =>
      wrapper.find('.tag.folder[title="main.edit_mode_on"]')
    const theirs = { ...sharedSearch, person_id: 'other' }
    const wrapper = await mountList({ groups: [], queries: [search, theirs] })
    await pencil(wrapper).trigger('click')
    expect(pencil(wrapper).classes()).toContain('active')

    await wrapper.setProps({ queries: [theirs] })
    expect(pencil(wrapper).exists()).toBe(false)

    const saved = { ...search, id: 'search-3', name: 'new' }
    await wrapper.setProps({ queries: [saved, theirs] })
    expect(pencil(wrapper).classes()).not.toContain('active')
    expect(wrapper.find('.tag.is-editing').exists()).toBe(false)
  })
})

describe('SearchQueryList, edits', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const editSearch = async wrapper => {
    await wrapper
      .find('.tag:not(.folder):not(.group) button.edit')
      .trigger('click')
    return wrapper.findComponent(EditSearchFilterModal)
  }

  test('saves a search in the production of its list', async () => {
    const updateSearchFilter = vi.fn()
    const wrapper = await mountList({
      actions: { updateSearchFilter },
      productionId: 'production-2'
    })

    const modal = await editSearch(wrapper)
    modal.vm.$emit('confirm', { id: search.id, name: 'renamed' })
    await flushPromises()

    expect(updateSearchFilter.mock.calls[0][1]).toEqual({
      id: search.id,
      name: 'renamed',
      project_id: 'production-2'
    })
  })

  // My Tasks, People, and Person read the searches saved out of any
  // production: one sent with the current production leaves their list.
  test('leaves a search out of any production where it is', async () => {
    const updateSearchFilter = vi.fn()
    const wrapper = await mountList({
      type: 'todo',
      actions: { updateSearchFilter }
    })

    const modal = await editSearch(wrapper)
    modal.vm.$emit('confirm', { id: search.id, name: 'renamed' })
    await flushPromises()

    expect(updateSearchFilter.mock.calls[0][1]).toEqual({
      id: search.id,
      name: 'renamed',
      project_id: null
    })
  })

  test('tells the modal the production of the list', async () => {
    const wrapper = await mountList({ productionId: 'production-2' })

    const modal = await editSearch(wrapper)

    expect(modal.props('productionId')).toBe('production-2')
  })

  test('saves a group in the production of its list', async () => {
    const updateSearchFilterGroup = vi.fn()
    const wrapper = await mountList({
      actions: { updateSearchFilterGroup },
      productionId: 'production-2'
    })

    await wrapper.find('.tag.group button.edit').trigger('click')
    wrapper
      .findComponent(EditSearchFilterGroupModal)
      .vm.$emit('confirm', { id: group.id, name: 'renamed' })
    await flushPromises()

    expect(updateSearchFilterGroup.mock.calls[0][1]).toEqual({
      id: group.id,
      name: 'renamed',
      project_id: 'production-2'
    })
  })

  test('opens a search without the error of a failed save', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountList({
      actions: { updateSearchFilter: () => Promise.reject(new Error('down')) }
    })
    const modal = await editSearch(wrapper)
    modal.vm.$emit('confirm', { id: search.id })
    await flushPromises()
    expect(modal.props('isError')).toBe(true)
    await modal.vm.$emit('cancel')

    const reopened = await editSearch(wrapper)

    expect(reopened.props('isError')).toBe(false)
    expect(console.error).toHaveBeenCalledWith(new Error('down'))
  })

  test('opens a group without the error of a failed save', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountList({
      actions: {
        updateSearchFilterGroup: () => Promise.reject(new Error('down'))
      }
    })
    const editGroup = async () => {
      await wrapper.find('.tag.group button.edit').trigger('click')
      return wrapper.findComponent(EditSearchFilterGroupModal)
    }
    const modal = await editGroup()
    modal.vm.$emit('confirm', { id: group.id })
    await flushPromises()
    expect(modal.props('isError')).toBe(true)
    await modal.vm.$emit('cancel')

    const reopened = await editGroup()

    expect(reopened.props('isError')).toBe(false)
    expect(console.error).toHaveBeenCalledWith(new Error('down'))
  })
})

describe('SearchQueryList, a request ending after its modal closed', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // An action whose requests end when the test says so.
  const heldAction = () => {
    const requests = []
    const action = vi.fn(
      () =>
        new Promise((resolve, reject) => {
          requests.push({ resolve, reject })
        })
    )
    return { action, requests }
  }

  // Confirms a new search, closes its modal during the request, then opens
  // the modal of another search.
  const saveThenAddAnother = async wrapper => {
    const modal = () => wrapper.findComponent(EditSearchFilterModal)
    wrapper.vm.addSearch('first')
    await nextTick()
    modal().vm.$emit('confirm', { id: null, name: 'first' })
    await nextTick()
    modal().vm.$emit('cancel')
    await nextTick()
    wrapper.vm.addSearch('second')
    await nextTick()
    return modal
  }

  test('holds the next filter modal while it saves, then leaves it open', async () => {
    const save = heldAction()
    const wrapper = await mountList({
      actions: { saveShotSearch: save.action }
    })
    const modal = await saveThenAddAnother(wrapper)
    expect(modal().props('isLoading')).toBe(true)

    save.requests[0].resolve()
    await flushPromises()

    expect(modal().exists()).toBe(true)
    expect(modal().props('searchQueryToEdit').name).toBe('second')
    expect(modal().props('isLoading')).toBe(false)
  })

  // Two saves of a name could cross in Zou and both get in.
  test('saves from the next filter modal only once it ends', async () => {
    const save = heldAction()
    const wrapper = await mountList({
      actions: { saveShotSearch: save.action }
    })
    const modal = await saveThenAddAnother(wrapper)
    modal().vm.$emit('confirm', { id: null, name: 'second' })
    await nextTick()

    expect(save.action).toHaveBeenCalledTimes(1)

    save.requests[0].resolve()
    await flushPromises()
    modal().vm.$emit('confirm', { id: null, name: 'second' })
    await nextTick()

    expect(save.action).toHaveBeenCalledTimes(2)
    expect(modal().props('isLoading')).toBe(true)
    save.requests[1].resolve()
    await flushPromises()
    expect(modal().exists()).toBe(false)
  })

  test('keeps its failure out of the next filter modal', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const save = heldAction()
    const wrapper = await mountList({
      actions: { saveShotSearch: save.action }
    })
    const modal = await saveThenAddAnother(wrapper)

    save.requests[0].reject(new Error('down'))
    await flushPromises()

    expect(modal().props()).toMatchObject({ isError: false, isLoading: false })
    expect(console.error).toHaveBeenCalledWith(new Error('down'))
  })

  test('holds the next group modal while it saves, then leaves it open', async () => {
    const save = heldAction()
    const wrapper = await mountList({
      actions: { saveShotSearchFilterGroup: save.action }
    })
    const modal = () => wrapper.findComponent(EditSearchFilterGroupModal)
    const addGroup = () =>
      wrapper
        .find('.tag.folder[title="main.filter_group_add"]')
        .trigger('click')
    await addGroup()
    modal().vm.$emit('confirm', { name: 'first' })
    await nextTick()
    modal().vm.$emit('cancel')
    await nextTick()
    await addGroup()
    expect(modal().props('isLoading')).toBe(true)

    save.requests[0].resolve()
    await flushPromises()

    expect(modal().exists()).toBe(true)
    expect(modal().props('isLoading')).toBe(false)
  })

  test('holds the next removal confirmation while it removes, then leaves it open', async () => {
    const removal = heldAction()
    const other = { ...search, id: 'search-3', name: 'other' }
    const wrapper = await mountList({
      actions: { removeShotSearch: removal.action },
      queries: [search, other]
    })
    const trashes = () =>
      wrapper.findAll('.tag:not(.folder):not(.group) button.del')
    await trashes()[0].trigger('click')
    confirmation(wrapper).vm.$emit('confirm')
    await nextTick()
    confirmation(wrapper).vm.$emit('cancel')
    await nextTick()
    await trashes()[1].trigger('click')
    expect(confirmation(wrapper).props('isLoading')).toBe(true)

    removal.requests[0].resolve()
    await flushPromises()

    expect(confirmation(wrapper).exists()).toBe(true)
    expect(confirmation(wrapper).props('isLoading')).toBe(false)
  })

  // Removes the first row, closes the confirmation during the request, then
  // opens it again for the same row.
  const removeTwice = async (wrapper, removeRow) => {
    await removeRow(wrapper)
    confirmation(wrapper).vm.$emit('confirm')
    await nextTick()
    confirmation(wrapper).vm.$emit('cancel')
    await nextTick()
    await removeRow(wrapper)
  }

  test('closes the next removal confirmation of the filter it removed', async () => {
    const removal = heldAction()
    const wrapper = await mountList({
      actions: { removeShotSearch: removal.action }
    })
    await removeTwice(wrapper, removeSearch)
    expect(confirmation(wrapper).exists()).toBe(true)

    removal.requests[0].resolve()
    await flushPromises()

    expect(confirmation(wrapper).exists()).toBe(false)
    expect(removal.action).toHaveBeenCalledTimes(1)
  })

  test('closes the next removal confirmation of the group it removed', async () => {
    const removal = heldAction()
    const wrapper = await mountList({
      actions: { removeShotSearchFilterGroup: removal.action }
    })
    await removeTwice(wrapper, removeGroup)
    expect(confirmation(wrapper).exists()).toBe(true)

    removal.requests[0].resolve()
    await flushPromises()

    expect(confirmation(wrapper).exists()).toBe(false)
    expect(removal.action).toHaveBeenCalledTimes(1)
  })

  // Saves the first row, closes its modal during the request, then opens the
  // modal of the row given, which Zou changes in place for the first one, as
  // the store does.
  const editTwice = async ({ modal, buttons, rows, changes, next }) => {
    await buttons()[0].trigger('click')
    modal().vm.$emit('confirm', { ...rows[0], ...changes })
    await nextTick()
    modal().vm.$emit('cancel')
    await nextTick()
    await buttons()[next].trigger('click')
    Object.assign(rows[0], changes)
  }

  // The modal fills its form again when it gets a new row.
  test('shows a filter as saved in its modal opened again during the save', async () => {
    const save = heldAction()
    const rows = [reactive({ ...search })]
    const wrapper = await mountList({
      actions: { updateSearchFilter: save.action },
      queries: rows
    })
    const modal = () => wrapper.findComponent(EditSearchFilterModal)
    await editTwice({
      modal,
      buttons: () => wrapper.findAll('.tag:not(.folder):not(.group) button.edit'),
      rows,
      changes: { name: 'renamed' },
      next: 0
    })

    save.requests[0].resolve()
    await flushPromises()

    expect(modal().props('searchQueryToEdit')).not.toBe(rows[0])
    expect(modal().props('searchQueryToEdit').name).toBe('renamed')
  })

  test('leaves the modal of another filter as it was', async () => {
    const save = heldAction()
    // Sorted by name, the other filter comes second.
    const rows = [
      reactive({ ...search }),
      reactive({ ...search, id: 'search-3', name: 'zz other' })
    ]
    const wrapper = await mountList({
      actions: { updateSearchFilter: save.action },
      queries: rows
    })
    const modal = () => wrapper.findComponent(EditSearchFilterModal)
    await editTwice({
      modal,
      buttons: () => wrapper.findAll('.tag:not(.folder):not(.group) button.edit'),
      rows,
      changes: { name: 'renamed' },
      next: 1
    })

    save.requests[0].resolve()
    await flushPromises()

    expect(modal().props('searchQueryToEdit').name).toBe('zz other')
  })

  test('shows a group as saved in its modal opened again during the save', async () => {
    const save = heldAction()
    const groups = [reactive({ ...group })]
    const wrapper = await mountList({
      actions: { updateSearchFilterGroup: save.action },
      groups
    })
    const modal = () => wrapper.findComponent(EditSearchFilterGroupModal)
    await editTwice({
      modal,
      buttons: () => wrapper.findAll('.tag.group button.edit'),
      rows: groups,
      changes: { name: 'Renamed' },
      next: 0
    })

    save.requests[0].resolve()
    await flushPromises()

    expect(modal().props('groupToEdit').name).toBe('Renamed')
  })

  test('leaves the modal of another group as it was', async () => {
    const save = heldAction()
    const groups = [
      reactive({ ...group }),
      reactive({ ...group, id: 'group-3', name: 'Other' })
    ]
    const wrapper = await mountList({
      actions: { updateSearchFilterGroup: save.action },
      groups
    })
    const modal = () => wrapper.findComponent(EditSearchFilterGroupModal)
    await editTwice({
      modal,
      buttons: () => wrapper.findAll('.tag.group button.edit'),
      rows: groups,
      changes: { name: 'Renamed' },
      next: 1
    })
    const shown = modal().props('groupToEdit')

    save.requests[0].resolve()
    await flushPromises()

    expect(modal().props('groupToEdit')).toBe(shown)
    expect(shown.name).toBe('Other')
  })
})
