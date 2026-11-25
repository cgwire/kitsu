import { shallowMount } from '@vue/test-utils'

import Logs from '@/components/pages/Logs.vue'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const routing = vi.hoisted(() => ({ query: {} }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: routing.query })
}))

// each tab is a page of its own, which shows the tabs above its panels
const tabStub = name => ({ name, template: '<div><slot /></div>' })

const mountPage = query => {
  routing.query = query
  return shallowMount(Logs, {
    global: {
      stubs: {
        EventLogs: tabStub('EventLogs'),
        LoginLogs: tabStub('LoginLogs'),
        PreviewFiles: tabStub('PreviewFiles')
      }
    }
  })
}

describe('pages/Logs', () => {
  test.each([
    [{}, 'EventLogs', 'events'],
    [{ tab: 'logins' }, 'LoginLogs', 'logins'],
    [{ tab: 'preview_files' }, 'PreviewFiles', 'preview_files'],
    [{ tab: 'unknown' }, 'EventLogs', 'events']
  ])('hands its tabs to the page of the tab %o', (query, name, activeTab) => {
    const wrapper = mountPage(query)

    expect(
      wrapper
        .findComponent({ name })
        .findComponent({ name: 'RouteTabs' })
        .props('activeTab')
    ).toBe(activeTab)
  })
})
