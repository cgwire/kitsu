import { flushPromises, mount } from '@vue/test-utils'
import { createStore } from 'vuex'

const playlistModal = vi.hoisted(() => ({ loaded: false }))

vi.mock('@/components/modals/ViewPlaylistModal.vue', () => {
  playlistModal.loaded = true
  return { default: { template: '<div />' } }
})
vi.mock('@/components/sides/Sidebar.vue', () => ({
  default: { template: '<div />' }
}))
vi.mock('@/components/tops/Topbar.vue', () => ({
  default: { template: '<div />' }
}))

import Main from '@/components/Main.vue'

const mountMain = (user, socket = { connect: vi.fn() }) =>
  mount(Main, {
    global: {
      plugins: [createStore({ getters: { user: () => user } })],
      mocks: { $t: key => key },
      config: { globalProperties: { $socket: socket } },
      stubs: { XyzTransition: { template: '<div><slot /></div>' }, 'router-view': true }
    }
  })

describe('Main', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('connects the socket once mounted', () => {
    const socket = { connect: vi.fn() }
    mountMain({ preview_project_id: null }, socket)
    expect(socket.connect).toHaveBeenCalledOnce()
  })

  it('shows read-only banner for preview account', () => {
    const wrapper = mountMain({ preview_project_id: 'project-1' })
    expect(wrapper.find('.preview-banner').exists()).toBe(true)
  })

  it('no banner for regular user', () => {
    const wrapper = mountMain({ preview_project_id: null })
    expect(wrapper.find('.preview-banner').exists()).toBe(false)
  })

  // Keep these two tests in this order: the player stays loaded once a test
  // loads it.
  it('leaves the playlist player to the first playlist when offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    mountMain({ preview_project_id: null })

    await vi.runAllTimersAsync()
    await vi.dynamicImportSettled()

    expect(playlistModal.loaded).toBe(false)
  })

  it('loads the playlist player once the first page had time to show', async () => {
    mountMain({ preview_project_id: null })
    await flushPromises()
    expect(playlistModal.loaded).toBe(false)

    await vi.runAllTimersAsync()
    await vi.dynamicImportSettled()

    expect(playlistModal.loaded).toBe(true)
  })
})
