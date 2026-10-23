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

const route = reactive({ query: {} })
vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push: vi.fn() })
}))

const mountPage = async () => {
  const store = createStore({
    getters: {
      activePeopleWithoutBot: () => [],
      getProductionTaskStatuses: () => () => [],
      getProductionTaskTypes: () => () => [],
      nbSelectedTasks: () => 0,
      openProductions: () => [],
      personMap: () => new Map(),
      productionMap: () => new Map(),
      selectedTasks: () => new Map()
    }
  })
  store.dispatch = vi.fn(action =>
    Promise.resolve(
      action === 'loadTasksToCheck'
        ? { data: [], stats: { total: 0 }, is_more: false }
        : {}
    )
  )
  const wrapper = shallowMount(MyChecks, { global: { plugins: [store] } })
  await flushPromises()
  return wrapper
}

describe('pages/MyChecks', () => {
  describe('phone header', () => {
    const findToggle = wrapper =>
      wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .find(button => button.classes('filters-toggle'))

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

    test('folds the other filters behind the funnel', async () => {
      const wrapper = await mountPage()
      const filters = wrapper.find('.filters')
      expect(filters.classes()).toContain('collapsed')

      await findToggle(wrapper).vm.$emit('click')
      expect(filters.classes()).not.toContain('collapsed')
    })

    test('puts the playlist button on its own line', async () => {
      const wrapper = await mountPage()
      const playlistButton = wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .find(button => button.classes('playlist-button'))
      expect(playlistButton).toBeDefined()
    })
  })
})
