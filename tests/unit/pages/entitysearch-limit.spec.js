import { flushPromises, RouterLinkStub, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EntitySearch from '@/components/pages/EntitySearch.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))

describe('pages/EntitySearch number of results', () => {
  let wrapper
  let searches

  const limitField = () => wrapper.find('.search-limit select')
  const chooseLimit = async value => {
    await limitField().setValue(value)
    await flushPromises()
  }

  beforeEach(async () => {
    searches = []
    const store = createStore({
      getters: {
        openProductions: () => [],
        productionMap: () => new Map()
      },
      actions: {
        searchData: (_, payload) => {
          searches.push(payload)
          return Promise.resolve({ assets: [], shots: [], persons: [] })
        }
      }
    })
    wrapper = shallowMount(EntitySearch, {
      global: {
        plugins: [store],
        stubs: { Combobox: false, RouterLink: RouterLinkStub }
      }
    })
    await wrapper.find('.search-field input').setValue('chair')
    await flushPromises()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test('searches again with the number just chosen', async () => {
    await chooseLimit('24')
    await chooseLimit('48')

    expect(searches.map(search => search.limit)).toEqual([12, 24, 48])
  })

  test('shows no blank choice once a number is chosen', async () => {
    await chooseLimit('24')

    expect(limitField().find('option[value=""]').exists()).toBe(false)
  })
})
