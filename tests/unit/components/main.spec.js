import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('@/components/sides/Sidebar.vue', () => ({
  default: { template: '<div />' }
}))
vi.mock('@/components/tops/Topbar.vue', () => ({
  default: { template: '<div />' }
}))

import Main from '@/components/Main.vue'

const mountMain = user =>
  mount(Main, {
    global: {
      plugins: [createStore({ getters: { user: () => user } })],
      mocks: { $t: key => key },
      config: { globalProperties: { $socket: { connect: vi.fn() } } },
      stubs: { XyzTransition: { template: '<div><slot /></div>' }, 'router-view': true }
    }
  })

describe('Main', () => {
  it('shows read-only banner for preview account', () => {
    const wrapper = mountMain({ preview_project_id: 'project-1' })
    expect(wrapper.find('.preview-banner').exists()).toBe(true)
  })

  it('no banner for regular user', () => {
    const wrapper = mountMain({ preview_project_id: null })
    expect(wrapper.find('.preview-banner').exists()).toBe(false)
  })
})
