import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import EntityChat from '@/components/pages/entities/EntityChat.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'

const entity = { id: 'asset-1' }
const currentUser = { id: 'person-1' }

// reset() runs on mount, so every case needs the two loading dispatches to
// settle before the action under test runs.
const mountChat = async ({ participants = [], failing = {} } = {}) => {
  const dispatch = vi.fn(action => {
    if (failing[action]) return Promise.reject(new Error(action))
    if (action === 'getEntityChat') return Promise.resolve({ participants })
    if (action === 'getEntityChatMessages') return Promise.resolve([])
    return Promise.resolve({ id: 'message-1', participants })
  })
  const store = createStore({
    getters: {
      mainConfig: () => ({ indexer_configured: false }),
      personMap: () => new Map([[currentUser.id, currentUser]]),
      user: () => currentUser
    }
  })
  store.dispatch = dispatch
  const wrapper = shallowMount(EntityChat, {
    props: { entity, name: 'Asset' },
    global: {
      plugins: [store],
      mocks: { $t: key => key },
      config: {
        globalProperties: { $socket: { on: vi.fn(), off: vi.fn() } }
      }
    }
  })
  await flushPromises()
  return { wrapper, dispatch }
}

const errorShown = (wrapper, key) =>
  wrapper
    .findAllComponents(ErrorText)
    .some(stub => stub.props('text') === key && !stub.props('hidden'))

describe('EntityChat errors', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('reports a chat that fails to load', async () => {
    const { wrapper } = await mountChat({ failing: { getEntityChat: true } })
    expect(errorShown(wrapper, 'chats.loading_error')).toBe(true)
  })

  test('reports a failed join', async () => {
    const { wrapper } = await mountChat({ failing: { joinEntityChat: true } })
    await wrapper.find('.join-chat button').trigger('click')
    await flushPromises()
    expect(errorShown(wrapper, 'chats.join_error')).toBe(true)
  })

  test('reports a failed leave', async () => {
    const { wrapper } = await mountChat({
      participants: [currentUser.id],
      failing: { leaveEntityChat: true }
    })
    await wrapper.findComponent(ButtonSimple).vm.$emit('click')
    await flushPromises()
    expect(errorShown(wrapper, 'chats.leave_error')).toBe(true)
  })

  // The panel stays mounted when the selected entity changes, so an error
  // raised on the previous chat must not survive the reset.
  test('clears the errors of the previous chat', async () => {
    const { wrapper } = await mountChat({
      participants: [currentUser.id],
      failing: { sendChatMessage: true }
    })
    await wrapper.find('#message-box').setValue('Hello')
    await wrapper.find('#message-box').trigger('keydown.enter')
    await flushPromises()
    expect(errorShown(wrapper, 'chats.send_error')).toBe(true)

    await wrapper.setProps({ entity: { id: 'asset-2' } })
    await flushPromises()
    expect(errorShown(wrapper, 'chats.send_error')).toBe(false)
  })

  test('keeps every error hidden on a healthy chat', async () => {
    const { wrapper } = await mountChat({ participants: [currentUser.id] })
    expect(errorShown(wrapper, 'chats.loading_error')).toBe(false)
    expect(errorShown(wrapper, 'chats.leave_error')).toBe(false)
    expect(errorShown(wrapper, 'chats.send_error')).toBe(false)
  })
})
