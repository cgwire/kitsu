import { flushPromises, shallowMount } from '@vue/test-utils'
import { reactive } from 'vue'
import { createStore } from 'vuex'

import EntityChats from '@/components/pages/EntityChats.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const route = reactive({ query: {} })
vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({
    push: ({ query }) => {
      route.query = query
    }
  })
}))

const chats = [
  { id: 'chat-1', object_id: 'asset-1', entity_name: 'Asset 1' },
  { id: 'chat-2', object_id: 'asset-2', entity_name: 'Asset 2' }
]

const mountPage = async () => {
  const store = createStore({
    getters: {
      dateFormat: () => 'YYYY-MM-DD',
      productionMap: () => new Map(),
      use12HourClock: () => false,
      user: () => ({ id: 'person-1' })
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve(chats))
  const focusMessageBox = vi.fn()
  const wrapper = shallowMount(EntityChats, {
    global: {
      plugins: [store],
      config: {
        globalProperties: { $socket: { on: vi.fn(), off: vi.fn() } }
      },
      stubs: {
        PageLeftSideLayout: {
          template: '<div><slot name="side" /><slot name="main" /></div>'
        },
        EntityChat: { template: '<div />', methods: { focusMessageBox } }
      }
    }
  })
  await flushPromises()
  return wrapper
}

describe('pages/EntityChats', () => {
  beforeEach(() => {
    route.query = {}
  })

  test('opens on the chat list when no chat is asked for', async () => {
    const wrapper = await mountPage()
    expect(wrapper.classes()).not.toContain('chat-open')
  })

  test('opens on the chat the URL asks for', async () => {
    route.query = { entity_id: 'asset-2' }
    const wrapper = await mountPage()
    expect(wrapper.classes()).toContain('chat-open')
  })

  test('shows the chat once one is picked, the list again on back', async () => {
    const wrapper = await mountPage()
    await wrapper.findAll('.chat-item')[1].trigger('click')
    await flushPromises()
    expect(wrapper.classes()).toContain('chat-open')

    await wrapper.find('.back-button').trigger('click')
    expect(wrapper.classes()).not.toContain('chat-open')
  })
})
