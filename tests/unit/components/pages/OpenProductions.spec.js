import { flushPromises, shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

import OpenProductions from '@/components/pages/OpenProductions.vue'
import ProductionOverview from '@/components/widgets/ProductionOverview.vue'

const page = { template: '<div />' }
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: page },
    { name: 'new-production', path: '/productions/new', component: page },
    { name: 'playlists', path: '/productions/:production_id/playlists', component: page },
    { name: 'assets', path: '/productions/:production_id/assets', component: page }
  ]
})

const productions = [
  { id: 'production-1', name: 'Wing It', production_type: 'featurefilm' },
  { id: 'production-2', name: 'Agent 327', production_type: 'featurefilm' }
]

const mountPage = async ({
  isClient = false,
  openProductions = ref(productions),
  failing = []
} = {}) => {
  const store = createStore({
    getters: {
      isCurrentUserAdmin: () => false,
      isCurrentUserClient: () => isClient,
      isCurrentUserManager: () => !isClient,
      lastProductionScreen: () => 'assets',
      mainConfig: () => ({ is_self_hosted: false }),
      openProductions: () => openProductions.value,
      organisation: () => ({ name: 'Doudou Corp' })
    }
  })
  store.dispatch = vi.fn((type, production) =>
    failing.includes(production.id)
      ? Promise.reject(new Error('down'))
      : Promise.resolve({
          entities: [{ id: `shot-of-${production.id}` }],
          playlists: [{ id: `playlist-of-${production.id}` }]
        })
  )
  const wrapper = shallowMount(OpenProductions, {
    global: {
      plugins: [router, store],
      mocks: { $t: key => key },
      directives: { focus: () => {} }
    }
  })
  await flushPromises()
  return { store, wrapper }
}

describe('OpenProductions', () => {
  it('gives a client one overview per production, with its data', async () => {
    const { store, wrapper } = await mountPage({ isClient: true })

    expect(store.dispatch.mock.calls).toEqual([
      ['loadProductionOverview', productions[0]],
      ['loadProductionOverview', productions[1]]
    ])
    const overviews = wrapper.findAllComponents(ProductionOverview)
    expect(overviews).toHaveLength(2)
    expect(overviews[1].props()).toMatchObject({
      production: productions[1],
      entities: [{ id: 'shot-of-production-2' }],
      playlists: [{ id: 'playlist-of-production-2' }],
      isLoading: false
    })
    expect(wrapper.find('.open-productions-list').exists()).toBe(false)
  })

  it('shows an empty overview when its load fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountPage({
      isClient: true,
      failing: ['production-2']
    })
    expect(consoleError).toHaveBeenCalledWith(new Error('down'))
    consoleError.mockRestore()
    const overviews = wrapper.findAllComponents(ProductionOverview)
    expect(overviews[0].props('isLoading')).toBe(false)
    expect(overviews[1].props()).toMatchObject({
      entities: [],
      playlists: [],
      isLoading: false
    })
  })

  it('loads an overview once per production and drops the gone ones', async () => {
    const openProductions = ref(productions)
    const { store, wrapper } = await mountPage({ isClient: true, openProductions })
    const added = { id: 'production-3', name: 'Caminandes', production_type: 'shots' }
    openProductions.value = [productions[1], added]
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledTimes(3)
    expect(store.dispatch).toHaveBeenLastCalledWith('loadProductionOverview', added)
    expect(
      wrapper.findAllComponents(ProductionOverview).map(overview => overview.props('production').id)
    ).toEqual(['production-2', 'production-3'])
    expect(wrapper.vm.overviews).toEqual({
      'production-2': expect.objectContaining({ entities: [{ id: 'shot-of-production-2' }] }),
      'production-3': expect.objectContaining({ entities: [{ id: 'shot-of-production-3' }] })
    })
  })

  it('welcomes a client until the message is closed', async () => {
    localStorage.removeItem('open-productions:client-welcome')
    const { wrapper } = await mountPage({ isClient: true })
    const welcome = wrapper.find('.client-welcome')
    expect(welcome.text()).toContain('productions.home.welcome_text')
    await welcome.find('.close-welcome').trigger('click')
    expect(wrapper.find('.client-welcome').exists()).toBe(false)
    const again = await mountPage({ isClient: true })
    expect(again.wrapper.find('.client-welcome').exists()).toBe(false)
    const studio = await mountPage()
    expect(studio.wrapper.find('.client-welcome').exists()).toBe(false)
  })

  it('keeps the production grid for the studio', async () => {
    const { store, wrapper } = await mountPage()

    expect(store.dispatch).not.toHaveBeenCalled()
    expect(wrapper.findAllComponents(ProductionOverview)).toHaveLength(0)
    expect(wrapper.findAll('.open-production')).toHaveLength(2)
  })
})
