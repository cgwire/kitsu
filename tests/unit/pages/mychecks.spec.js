import { flushPromises, shallowMount } from '@vue/test-utils'
import { reactive } from 'vue'
import { createStore } from 'vuex'

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import MyChecks from '@/components/pages/MyChecks.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const route = reactive({ name: 'checks', query: {} })
// The route follows the pushes of the page, as the router would.
const push = vi.fn(location => {
  route.query = location.query
})
vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push })
}))

const mountPage = async ({ query = {}, getters = {} } = {}) => {
  route.query = query
  const store = createStore({
    getters: {
      activePeopleWithoutBot: () => [],
      getProductionTaskStatuses: () => () => [],
      getProductionTaskTypes: () => () => [],
      myChecksSearchFilterGroups: () => [],
      myChecksSearchQueries: () => [],
      nbSelectedTasks: () => 0,
      openProductions: () => [],
      personMap: () => new Map(),
      productionMap: () => new Map(),
      selectedTasks: () => new Map(),
      ...getters
    }
  })
  store.dispatch = vi.fn(action =>
    Promise.resolve(
      action === 'loadTasksToCheck'
        ? { data: [], stats: { total: 0 }, is_more: false }
        : {}
    )
  )
  const wrapper = shallowMount(MyChecks, {
    global: { plugins: [store], stubs: { PanelLayout: false } }
  })
  await flushPromises()
  return wrapper
}

describe('pages/MyChecks', () => {
  const findToggle = wrapper => wrapper.findComponent({ name: 'FiltersToggle' })
  const findCombo = (wrapper, label) =>
    wrapper
      .findAllComponents({ name: 'Combobox' })
      .find(combo => combo.props('label') === label)

  describe('phone header', () => {
    test('keeps the production filter out of the fold', async () => {
      const wrapper = await mountPage()
      expect(
        wrapper.findComponent({ name: 'ComboboxProduction' }).classes()
      ).not.toContain('collapsible')
      expect(
        wrapper.findComponent({ name: 'ComboboxTaskType' }).classes()
      ).toContain('collapsible')
      expect(wrapper.findComponent({ name: 'PeopleField' }).classes()).toContain(
        'collapsible'
      )
    })

    test('folds the other filters behind the toggle', async () => {
      const wrapper = await mountPage()
      expect(wrapper.classes()).toContain('collapsed')

      await findToggle(wrapper).vm.$emit('update:modelValue', true)
      expect(wrapper.classes()).not.toContain('collapsed')
    })

    test('puts the playlist button on its own line', async () => {
      const wrapper = await mountPage()
      const playlistButton = wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .find(button => button.classes('playlist-button'))
      expect(playlistButton).toBeDefined()
    })
  })

  describe('panel layout', () => {
    test('lays its filters and its list out in the two panels', async () => {
      const wrapper = await mountPage()
      const filters = wrapper.find('.filters-panel')
      const list = wrapper.find('.list-panel')

      expect(filters.findComponent({ name: 'ComboboxProduction' }).exists()).toBe(
        true
      )
      expect(list.findComponent({ name: 'SearchQueryList' }).exists()).toBe(true)
      expect(list.findComponent({ name: 'ToCheckList' }).exists()).toBe(true)
      expect(wrapper.find('.side-column').exists()).toBe(false)
    })

    test('shows the selected task in the side panel', async () => {
      const wrapper = await mountPage({
        getters: {
          nbSelectedTasks: () => 1,
          selectedTasks: () => new Map([['task-1', { id: 'task-1' }]])
        }
      })

      expect(
        wrapper.find('.side-column').findComponent({ name: 'TaskInfo' }).exists()
      ).toBe(true)
    })
  })

  describe('saved searches', () => {
    test('saves the filters of the URL', async () => {
      const wrapper = await mountPage()

      expect(
        wrapper.findComponent({ name: 'SearchQueryList' }).props()
      ).toMatchObject({ type: 'myChecks', withRouteQuery: true })
    })

    test('writes the display and the sort to the URL', async () => {
      const wrapper = await mountPage()

      await findCombo(wrapper, 'main.show').vm.$emit(
        'update:modelValue',
        'due_this_week'
      )
      await findCombo(wrapper, 'main.sorted_by').vm.$emit(
        'update:modelValue',
        'due_date'
      )
      await flushPromises()

      expect(route.query).toEqual({ filter: 'due_this_week', sort: 'due_date' })
    })

    // A saved search, or the back button, sets a query the page did not
    // write.
    test('follows the filters of the URL', async () => {
      const wrapper = await mountPage()

      route.query = { task_status_id: 'status-1', sort: 'due_date' }
      await flushPromises()

      expect(
        wrapper.findComponent({ name: 'ComboboxStatus' }).props('modelValue')
      ).toBe('status-1')
      expect(findCombo(wrapper, 'main.sorted_by').props('modelValue')).toBe(
        'due_date'
      )
    })
  })

  describe('filters reset', () => {
    test('counts the folded settings that are not the default ones', async () => {
      const wrapper = await mountPage({ query: { sort: 'due_date' } })

      expect(findToggle(wrapper).props()).toMatchObject({
        count: 1,
        resettable: true
      })
    })

    test('offers no reset without a filter', async () => {
      const wrapper = await mountPage()

      expect(findToggle(wrapper).props()).toMatchObject({
        count: 0,
        resettable: false
      })
    })

    test('clears every filter', async () => {
      const wrapper = await mountPage({
        query: { task_type_id: 'type-1', sort: 'due_date' }
      })

      await findToggle(wrapper).vm.$emit('reset')
      await flushPromises()

      expect(route.query).toEqual({})
      expect(findToggle(wrapper).props('resettable')).toBe(false)
    })
  })
})
