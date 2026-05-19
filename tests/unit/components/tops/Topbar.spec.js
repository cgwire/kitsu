import { nextTick, ref } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@/composables/desktopNotifications', () => ({
  useDesktopNotifications: vi.fn()
}))

// Pre-load real store to avoid circular-import issues
import '@/lib/auth'

import { useDesktopNotifications } from '@/composables/desktopNotifications'
import Topbar from '@/components/tops/Topbar.vue'

const makeStore = () => {
  const actions = {
    loadNotification: vi.fn(notificationId =>
      Promise.resolve({
        id: notificationId,
        author_id: 'author-1',
        project_id: 'project-1',
        project_name: 'Test Project',
        full_entity_name: 'Shot 001',
        task_id: 'task-1',
        task_type_id: 'task-type-1'
      })
    ),
    clearEpisodes: vi.fn(),
    logout: vi.fn(),
    clearSelectedTasks: vi.fn(),
    loadEpisodes: vi.fn(() => Promise.resolve([])),
    saveLastProductionRoute: vi.fn(),
    setProduction: vi.fn(),
    setCurrentEpisode: vi.fn(),
    setSupportChat: vi.fn(),
    toggleDarkTheme: vi.fn(),
    toggleSidebar: vi.fn(),
    toggleUserMenu: vi.fn(),
    decrementNotificationCounter: vi.fn(),
    incrementNotificationCounter: vi.fn(),
    markAllNotificationsAsReadLocal: vi.fn(),
    resetNotificationCounter: vi.fn(),
    toggleNotificationReadStatusLocal: vi.fn()
  }
  const store = createStore({
    state: () => ({}),
    getters: {
      currentEpisode: () => null,
      currentProduction: () => null,
      episodes: () => [],
      episodeOptionGroups: () => [],
      isCurrentUserAdmin: () => false,
      isCurrentUserClient: () => false,
      isCurrentUserManager: () => false,
      isCurrentUserSupervisor: () => false,
      isCurrentUserVendor: () => false,
      isDarkTheme: () => false,
      isSupportChat: () => false,
      isUserMenuHidden: () => true,
      isTVShow: () => false,
      lastProductionRoute: () => ({ name: 'open-productions' }),
      lastProductionViewed: () => null,
      mainConfig: () => ({ indexer_configured: false }),
      notifications: () => [],
      openProductions: () => [],
      organisation: () => ({ id: 'org-1', name: 'Test Studio' }),
      personMap: () => new Map(),
      productionMap: () => new Map(),
      projectPlugins: () => [],
      taskTypeMap: () =>
        new Map([['task-type-1', { for_entity: 'Shot', name: 'Animation' }]]),
      user: () => ({ id: 'user-1' })
    },
    actions
  })
  return { store, actions }
}

describe('Topbar.vue', () => {
  let wrapper, store
  let setPreferenceEnabledMock, showNotificationMock
  let permission, isActive, preferenceEnabled

  beforeEach(async () => {
    permission = ref('default')
    isActive = ref(false)
    preferenceEnabled = ref(false)

    useDesktopNotifications.mockReturnValue({
      isSupported: true,
      isActive,
      permission,
      preferenceEnabled,
      setPreferenceEnabled: setPreferenceEnabledMock = vi.fn(
        () => Promise.resolve(false)
      ),
      showNotification: showNotificationMock = vi.fn(),
      // Pass-through by default so existing assertions on showNotification still run.
      withDesktopNotificationLock: vi.fn((_id, work) => work())
    })

    ;({ store } = makeStore())

    const router = createRouter({
      history: createWebHashHistory(),
      routes: [
        { path: '/', name: 'open-productions', component: { template: '<div />' } }
      ]
    })

    wrapper = shallowMount(Topbar, {
      global: {
        plugins: [store, router],
        mocks: {
          $t: key => key,
          $route: {
            path: '/',
            name: 'open-productions',
            params: {},
            query: {},
            fullPath: '/'
          }
        },
        stubs: {
          TopbarProductionList: true,
          TopbarSectionList: true,
          TopbarEpisodeList: true,
          GlobalSearchField: true,
          NotificationBell: true,
          PeopleAvatar: true,
          ShortcutModal: true
        }
      }
    })
    await nextTick()
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
    vi.clearAllMocks()
  })

  describe('toggleDesktopNotifications', () => {
    it('toggles setPreferenceEnabled based on current state', async () => {
      permission.value = 'default'
      await nextTick()
      await wrapper.vm.toggleDesktopNotifications()
      expect(setPreferenceEnabledMock).toHaveBeenLastCalledWith(true, expect.any(Object))

      permission.value = 'granted'
      preferenceEnabled.value = true
      await nextTick()
      await wrapper.vm.toggleDesktopNotifications()
      expect(setPreferenceEnabledMock).toHaveBeenLastCalledWith(false, expect.any(Object))
    })

    it('does nothing when permission is denied', async () => {
      permission.value = 'denied'
      await nextTick()
      await wrapper.vm.toggleDesktopNotifications()
      expect(setPreferenceEnabledMock).not.toHaveBeenCalled()
    })

  })

  describe('showDesktopNotificationForNew', () => {
    it('does nothing when notifications are not active', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch')
      isActive.value = false
      await wrapper.vm.showDesktopNotificationForNew('notification-1')
      expect(dispatchSpy).not.toHaveBeenCalledWith('loadNotification', expect.anything())
    })

    it('loads notification and shows desktop notification', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch')
      isActive.value = true
      permission.value = 'granted'
      preferenceEnabled.value = true
      await wrapper.vm.showDesktopNotificationForNew('notification-1')
      await nextTick()
      expect(dispatchSpy).toHaveBeenCalledWith('loadNotification', 'notification-1')
      expect(showNotificationMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.any(String),
          body: expect.any(String),
          icon: expect.any(String),
          onClick: expect.any(Function)
        })
      )
    })

    // Exercises the post-await guard: active at call time, then disabled
    // (e.g. user toggled off, or permission revoked) before the fetch resolves.
    it('does not show notification when desktop notifications are disabled during dispatch', async () => {
      isActive.value = true
      permission.value = 'granted'
      preferenceEnabled.value = true
      vi.spyOn(store, 'dispatch').mockImplementation(async action => {
        if (action === 'loadNotification') {
          isActive.value = false
          return {
            id: 'notification-1',
            author_id: 'author-1',
            project_id: 'project-1',
            task_type_id: 'task-type-1'
          }
        }
      })
      await wrapper.vm.showDesktopNotificationForNew('notification-1')
      await nextTick()
      expect(showNotificationMock).not.toHaveBeenCalled()
    })

    it('click handler navigates to the notification entity route', async () => {
      isActive.value = true
      permission.value = 'granted'
      preferenceEnabled.value = true
      const routerSpy = vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue({})
      await wrapper.vm.showDesktopNotificationForNew('notification-1')
      await nextTick()
      const clickHandler = showNotificationMock.mock.calls[0][0].onClick
      clickHandler()
      expect(routerSpy).toHaveBeenCalledWith({
        name: 'task',
        params: {
          production_id: 'project-1',
          task_id: 'task-1',
          type: 'shots'
        }
      })
    })

    // Non-leader tab: lock helper skips the inner work, no fetch and no popup.
    it('skips fetch and popup when the multi-tab lock is held elsewhere', async () => {
      isActive.value = true
      permission.value = 'granted'
      preferenceEnabled.value = true
      wrapper.vm.withDesktopNotificationLock.mockImplementation(async () => {})
      const dispatchSpy = vi.spyOn(store, 'dispatch')
      await wrapper.vm.showDesktopNotificationForNew('notification-1')
      await nextTick()
      expect(dispatchSpy).not.toHaveBeenCalledWith(
        'loadNotification',
        expect.anything()
      )
      expect(showNotificationMock).not.toHaveBeenCalled()
    })
  })

  describe('notification:new socket handler', () => {
    const originalVisibility = Object.getOwnPropertyDescriptor(
      document,
      'visibilityState'
    )
    const setVisibility = value => {
      Object.defineProperty(document, 'visibilityState', {
        value,
        configurable: true
      })
    }
    afterEach(() => {
      if (originalVisibility) {
        Object.defineProperty(document, 'visibilityState', originalVisibility)
      }
    })

    const fire = eventData =>
      wrapper.vm.$options.socket.events['notification:new'].call(
        wrapper.vm,
        eventData
      )

    it('skips desktop notification on /notifications page when foregrounded', async () => {
      wrapper.vm.$route.name = 'notifications'
      setVisibility('visible')
      const spy = vi
        .spyOn(wrapper.vm, 'showDesktopNotificationForNew')
        .mockImplementation(() => {})
      fire({ person_id: 'user-1', notification_id: 'notification-1' })
      expect(spy).not.toHaveBeenCalled()
    })

    it('fires desktop notification on /notifications when tab is backgrounded', async () => {
      wrapper.vm.$route.name = 'notifications'
      setVisibility('hidden')
      const spy = vi
        .spyOn(wrapper.vm, 'showDesktopNotificationForNew')
        .mockImplementation(() => {})
      fire({ person_id: 'user-1', notification_id: 'notification-1' })
      expect(spy).toHaveBeenCalledWith('notification-1')
    })
  })
})
