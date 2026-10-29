import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EventLogs from '@/components/pages/logs/EventLogs.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))

const mountPage = () => {
  const store = createStore({
    getters: {
      dateFormat: () => 'YYYY-MM-DD',
      people: () => [],
      personMap: () => new Map(),
      productionMap: () => new Map(),
      productions: () => [],
      use12HourClock: () => false,
      user: () => ({ timezone: 'UTC' })
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve([]))
  return shallowMount(EventLogs, { global: { plugins: [store] } })
}

describe('pages/logs/EventLogs', () => {
  test('marks the export button for the read-only phone layout', () => {
    const wrapper = mountPage()
    const exportButton = wrapper
      .findAllComponents({ name: 'ButtonSimple' })
      .find(button => button.props('icon') === 'download')
    expect(exportButton.classes()).toContain('export-button')
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
      wrapper
        .findAllComponents({ name: 'MultiselectField' })
        .forEach(field => expect(field.classes()).toContain('collapsible'))
      expect(wrapper.findComponent({ name: 'Checkbox' }).classes()).toContain(
        'collapsible'
      )
    })

    test('folds the other filters behind the funnel', async () => {
      const wrapper = mountPage()
      const filters = wrapper.find('.filters')
      expect(filters.classes()).toContain('collapsed')

      await wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .find(button => button.classes('filters-toggle'))
        .vm.$emit('click')
      expect(filters.classes()).not.toContain('collapsed')
    })
  })
})
