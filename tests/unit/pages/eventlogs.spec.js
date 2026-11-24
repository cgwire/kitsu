import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EventLogs from '@/components/pages/logs/EventLogs.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const routing = vi.hoisted(() => ({ query: {}, push: vi.fn() }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routing.query }),
  useRouter: () => ({ push: routing.push })
}))

const mountPage = (query = {}) => {
  routing.query = query
  routing.push.mockClear()
  const store = createStore({
    getters: {
      dateFormat: () => 'YYYY-MM-DD',
      eventLogsSearchFilterGroups: () => [],
      eventLogsSearchQueries: () => [],
      people: () => [],
      personMap: () => new Map(),
      productionMap: () => new Map(),
      productions: () => [],
      use12HourClock: () => false,
      user: () => ({ timezone: 'UTC' })
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve([]))
  return shallowMount(EventLogs, {
    global: { plugins: [store], stubs: { PanelLayout: false } },
    slots: { default: '<nav class="page-tabs" />' }
  })
}

describe('pages/logs/EventLogs', () => {
  const findToggle = wrapper => wrapper.findComponent({ name: 'FiltersToggle' })

  test('marks the export button for the read-only phone layout', () => {
    const wrapper = mountPage()
    const exportButton = wrapper
      .findAllComponents({ name: 'ButtonSimple' })
      .find(button => button.props('icon') === 'download')
    expect(exportButton.classes()).toContain('export-button')
  })

  describe('panel layout', () => {
    test('shows the tabs of the page above its filters', () => {
      const wrapper = mountPage()
      const filters = wrapper.find('.filters-panel')

      expect(filters.find('.page-tabs').exists()).toBe(true)
      expect(filters.findComponent({ name: 'DateField' }).exists()).toBe(true)
    })

    test('saves the filters of the URL, whatever the tab', () => {
      const wrapper = mountPage()

      expect(
        wrapper
          .find('.list-panel')
          .findComponent({ name: 'SearchQueryList' })
          .props()
      ).toMatchObject({
        keptQueryKeys: ['tab'],
        type: 'eventLogs',
        withRouteQuery: true
      })
    })

    test('folds the objects, the actions and the files in a second row', () => {
      const wrapper = mountPage()
      const secondRow = wrapper.find('.filters.collapsible')

      expect(
        secondRow.findAllComponents({ name: 'MultiselectField' })
      ).toHaveLength(2)
      expect(secondRow.findComponent({ name: 'Checkbox' }).exists()).toBe(true)
    })

    test('counts the folded filters that are set', () => {
      const wrapper = mountPage({ objects: ['task'], only_files: 'true' })

      expect(findToggle(wrapper).props()).toMatchObject({
        count: 2,
        resettable: true
      })
    })

    test('offers no reset without a filter', () => {
      const wrapper = mountPage({ tab: 'events' })

      expect(findToggle(wrapper).props()).toMatchObject({
        count: 0,
        resettable: false
      })
    })

    test('clears the filters and keeps the tab', async () => {
      const wrapper = mountPage({ tab: 'events', project_id: 'production-1' })

      await findToggle(wrapper).vm.$emit('reset')

      expect(routing.push).toHaveBeenCalledWith({ query: { tab: 'events' } })
    })
  })

  describe('phone header', () => {
    test('keeps the date range out of the fold', () => {
      const wrapper = mountPage()
      expect(wrapper.findComponent({ name: 'DateField' }).classes()).not.toContain(
        'collapsible'
      )
      expect(wrapper.findComponent({ name: 'PeopleField' }).classes()).toContain(
        'collapsible'
      )
      expect(
        wrapper.findComponent({ name: 'ComboboxProduction' }).classes()
      ).toContain('collapsible')
    })

    test('folds the other filters behind the toggle', async () => {
      const wrapper = mountPage()
      expect(wrapper.classes()).toContain('collapsed')

      await findToggle(wrapper).vm.$emit('update:modelValue', true)
      expect(wrapper.classes()).not.toContain('collapsed')
    })
  })
})
