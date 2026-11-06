import {
  flushPromises,
  mount,
  RouterLinkStub,
  shallowMount
} from '@vue/test-utils'
import { h, nextTick } from 'vue'
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
  search_query: 'wip',
  search_filter_group_id: null,
  is_shared: false
}
const sharedSearch = { ...search, id: 'search-2', name: 'zz', is_shared: true }
const group = { id: 'group-1', name: 'Mine', color: '#ff3860', is_shared: false }
const sharedGroup = { ...group, id: 'group-2', name: 'Team', is_shared: true }

const mountList = async ({
  type = 'shot',
  actions = {},
  entityType,
  groups = [group],
  isClient = false,
  productionId,
  queries = [search],
  throughRef = false
} = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  await router.push('/')
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1' }),
      currentUserRoleForProduction: () => () => 'manager',
      departmentMap: () => new Map(),
      isCurrentUserAdmin: () => false,
      isCurrentUserClient: () => isClient,
      isCurrentUserManager: () => true,
      personMap: () => new Map()
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
