import { flushPromises, RouterLinkStub, shallowMount } from '@vue/test-utils'
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
  mainConfig = ref({ is_self_hosted: false }),
  openProductions = ref(productions),
  accessError = ref(null),
  failing = []
} = {}) => {
  const store = createStore({
    getters: {
      isCurrentUserAdmin: () => false,
      isCurrentUserClient: () => isClient,
      isCurrentUserManager: () => !isClient,
      lastProductionScreen: () => 'assets',
      mainConfig: () => mainConfig.value,
      openProductions: () => openProductions.value,
      organisation: () => ({ name: 'Doudou Corp' }),
      productionAccessError: () => accessError.value
    }
  })
  store.dispatch = vi.fn((type, payload) => {
    if (type === 'setProductionAccessError') {
      accessError.value = payload
      return Promise.resolve()
    }
    return failing.includes(payload.id)
      ? Promise.reject(new Error('down'))
      : Promise.resolve({
          entities: [{ id: `shot-of-${payload.id}` }],
          playlists: [{ id: `playlist-of-${payload.id}` }]
        })
  })
  const wrapper = shallowMount(OpenProductions, {
    global: {
      plugins: [router, store],
      directives: { focus: () => {} },
      stubs: { RouterLink: RouterLinkStub }
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

  // A production page whose production cannot be loaded sends the user
  // here: the page tells why.
  describe('production access error', () => {
    const path = '/productions/production-3/playlists'
    const accessError = reason => ref({ reason, path })

    it.each([
      ['forbidden', 'productions.home.access_forbidden'],
      ['missing', 'productions.home.access_missing']
    ])('tells why a production page sent the user home, %s', async (reason, text) => {
      const { store, wrapper } = await mountPage({
        accessError: accessError(reason)
      })

      expect(wrapper.find('[role="alert"]').text()).toBe(text)
      expect(wrapper.find('.access-error a').exists()).toBe(false)
      expect(store.dispatch).toHaveBeenCalledWith('setProductionAccessError', null)
    })

    // The way home replaced the production page in the history: Back does
    // not lead there any more.
    it('offers the page again after a failed load', async () => {
      const { wrapper } = await mountPage({
        openProductions: ref([]),
        accessError: accessError('failed')
      })

      const alert = wrapper.find('[role="alert"]')
      expect(alert.text()).toContain('productions.home.access_failed')
      const reload = wrapper.findComponent(RouterLinkStub)
      expect(reload.element.closest('[role="alert"]')).toBe(alert.element)
      expect(reload.props('to')).toBe(path)
      expect(reload.text()).toBe('main.reload')
    })

    // A screen reader announces the message alone, not the close control.
    it('keeps the close control out of the announced message', async () => {
      const { wrapper } = await mountPage({ accessError: accessError('forbidden') })

      expect(wrapper.find('.access-error .close-access-error').exists()).toBe(true)
      expect(wrapper.find('[role="alert"] .close-access-error').exists()).toBe(false)
    })

    it('tells it to a client too', async () => {
      const { wrapper } = await mountPage({
        isClient: true,
        accessError: accessError('forbidden')
      })

      expect(wrapper.find('[role="alert"]').text()).toBe(
        'productions.home.access_forbidden'
      )
    })

    it('tells it once', async () => {
      const error = accessError('forbidden')
      await mountPage({ accessError: error })

      const again = await mountPage({ accessError: error })

      expect(again.wrapper.find('.access-error').exists()).toBe(false)
    })

    it.each([
      ['Enter', 'Enter'],
      ['Space', ' ']
    ])('hides the message once closed with %s', async (name, key) => {
      const { wrapper } = await mountPage({ accessError: accessError('missing') })

      await wrapper.find('.close-access-error').trigger('keydown', { key })

      expect(wrapper.find('.access-error').exists()).toBe(false)
    })

    it('hides the message once closed', async () => {
      const { wrapper } = await mountPage({ accessError: accessError('missing') })

      await wrapper.find('.close-access-error').trigger('click')

      expect(wrapper.find('.access-error').exists()).toBe(false)
    })

    it('tells nothing on a plain visit', async () => {
      const { wrapper } = await mountPage()

      expect(wrapper.find('.access-error').exists()).toBe(false)
    })
  })

  describe('contributions', () => {
    const selfHosted = () => ref({ is_self_hosted: true })

    afterEach(() => {
      localStorage.removeItem('open-productions:contributions')
    })

    it('leaves them out of the hosted version', async () => {
      const { wrapper } = await mountPage()

      expect(wrapper.find('.social-contributions').exists()).toBe(false)
    })

    it('shows them on a self-hosted instance', async () => {
      const { wrapper } = await mountPage({ mainConfig: selfHosted() })

      expect(wrapper.find('.social-contributions').exists()).toBe(true)
    })

    it('shows them when the config comes after the page', async () => {
      const mainConfig = ref({})
      const { wrapper } = await mountPage({ mainConfig })
      expect(wrapper.find('.social-contributions').exists()).toBe(false)

      mainConfig.value = { is_self_hosted: true }
      await flushPromises()

      expect(wrapper.find('.social-contributions').exists()).toBe(true)
    })

    it('hides them for good once closed', async () => {
      const { wrapper } = await mountPage({ mainConfig: selfHosted() })

      await wrapper.find('.close-contributions').trigger('click')

      expect(wrapper.find('.social-contributions').exists()).toBe(false)
      const again = await mountPage({ mainConfig: selfHosted() })
      expect(again.wrapper.find('.social-contributions').exists()).toBe(false)
    })
  })

  it('keeps the production grid for the studio', async () => {
    const { store, wrapper } = await mountPage()

    expect(store.dispatch).not.toHaveBeenCalled()
    expect(wrapper.findAllComponents(ProductionOverview)).toHaveLength(0)
    expect(wrapper.findAll('.open-production')).toHaveLength(2)
  })
})
