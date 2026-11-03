import { RouterLinkStub, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import Sidebar from '@/components/sides/Sidebar.vue'

// isManagerHere is the role on the page shown, which a project role sets.
const mountSidebar = ({ role, isManagerHere = false }) =>
  shallowMount(Sidebar, {
    global: {
      plugins: [
        createStore({
          getters: {
            isCurrentUserAdmin: () => role === 'admin',
            isCurrentUserClient: () => false,
            isCurrentUserManager: () => isManagerHere,
            isCurrentUserSupervisor: () => false,
            isCurrentUserVendor: () => false,
            isDarkTheme: () => false,
            isSidebarHidden: () => false,
            mainConfig: () => ({}),
            organisation: () => ({ name: 'Studio' }),
            organisationLogoPath: () => '',
            studioPlugins: () => [],
            user: () => ({ id: 'user-1', role })
          }
        })
      ],
      stubs: { Icon: true, KitsuIcon: true, RouterLink: RouterLinkStub }
    }
  })

const linksToStudioFeed = wrapper =>
  wrapper
    .findAllComponents(RouterLinkStub)
    .some(link => link.props('to')?.name === 'newsfeed')

describe('Sidebar', () => {
  test.each([
    ['an admin', 'admin'],
    ['a production manager', 'manager']
  ])('links %s to the studio feed', (_, role) => {
    const wrapper = mountSidebar({ role, isManagerHere: true })
    expect(linksToStudioFeed(wrapper)).toBe(true)
  })

  // The studio feed spans the productions: a manager role held on the
  // production shown does not open it.
  test('does not link a manager of the production shown only', () => {
    const wrapper = mountSidebar({ role: 'user', isManagerHere: true })
    expect(linksToStudioFeed(wrapper)).toBe(false)
  })

  test('does not link an artist', () => {
    const wrapper = mountSidebar({ role: 'user' })
    expect(linksToStudioFeed(wrapper)).toBe(false)
  })
})
