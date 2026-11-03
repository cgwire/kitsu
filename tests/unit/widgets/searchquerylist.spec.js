import { flushPromises, RouterLinkStub, shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

import ConfirmModal from '@/components/modals/ConfirmModal.vue'
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
const group = { id: 'group-1', name: 'Mine', color: '#ff3860', is_shared: false }

const mountList = async ({ type = 'shot', actions = {} } = {}) => {
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
      isCurrentUserClient: () => false,
      isCurrentUserManager: () => true,
      personMap: () => new Map()
    },
    actions
  })
  return shallowMount(SearchQueryList, {
    props: { type, queries: [search], groups: [group], isGroupEnabled: true },
    global: {
      plugins: [store, router, i18n],
      stubs: { RouterLink: RouterLinkStub }
    }
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
