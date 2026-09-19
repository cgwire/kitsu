import { nextTick, reactive, ref } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@/composables/desktopNotifications', () => ({
  useDesktopNotifications: vi.fn()
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

// The component reads the route of useRoute(): each mount hands it the same
// object as the $route mock, which tests move to simulate navigations.
const routeHolder = vi.hoisted(() => ({ current: null }))
vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () => routeHolder.current
}))
const mockRoute = route => (routeHolder.current = reactive(route))
const socketMock = { on: vi.fn(), off: vi.fn() }

// Pre-load real store to avoid circular-import issues
import '@/lib/auth'

import { useDesktopNotifications } from '@/composables/desktopNotifications'
import Topbar from '@/components/tops/Topbar.vue'

// A memory history keeps each test's navigation out of the jsdom URL shared by
// the whole file: with a hash history, installing the next router replays the
// previous test's location and warns about the routes this one does not declare.
const makeRouter = (routes = []) =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'open-productions',
        component: { template: '<div />' }
      },
      ...routes
    ]
  })

const makeStore = (getterOverrides = {}) => {
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
    loadProduction: vi.fn(() => Promise.resolve()),
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
      isEpisodeListLoaded: () => true,
      isSupportChat: () => false,
      isUserMenuHidden: () => true,
      isTVShow: () => false,
      lastProductionRoute: () => ({ name: 'open-productions' }),
      lastProductionViewed: () => null,
      mainConfig: () => ({ indexer_configured: false }),
      notifications: () => [],
      openProductions: () => [],
      organisation: () => ({ id: 'org-1', name: 'Test Studio' }),
      // Mirrors the real getter, which returns null while the organisation
      // carries no avatar, as the one mocked above does not.
      organisationLogoPath: () => null,
      personMap: () => new Map(),
      productionMap: () => new Map(),
      projectPlugins: () => [],
      taskTypeMap: () =>
        new Map([['task-type-1', { for_entity: 'Shot', name: 'Animation' }]]),
      user: () => ({ id: 'user-1' }),
      ...getterOverrides
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

    const router = makeRouter()

    wrapper = shallowMount(Topbar, {
      global: {
        config: { globalProperties: { $socket: socketMock } },
        plugins: [store, router],
        mocks: {
          $t: key => key,
          $route: mockRoute({
            path: '/',
            name: 'open-productions',
            params: {},
            query: {},
            fullPath: '/'
          })
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

  // Artists land on pages without production: the fallback production of the
  // store must not be configured for them.
  it('configures no production on a page without one', () => {
    expect(wrapper.vm.hasConfiguredProduction).toBe(false)
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

  describe('schedule episode selector', () => {
    // The schedule offers 'all' (production-wide planning) and 'main' (main
    // pack) on top of the real episodes, and coerces neither.
    const mountForSchedule = (episodeId, episodes = []) => {
      const production = { id: 'production-1', production_type: 'tvshow' }
      const { store: scheduleStore } = makeStore({
        currentProduction: () => production,
        episodes: () => episodes,
        isTVShow: () => true,
        productionEditTaskTypes: () => [],
        productionMap: () => new Map([[production.id, production]])
      })
      const router = makeRouter([
        {
          path: '/productions/:production_id/episodes/:episode_id/schedule',
          name: 'episode-schedule',
          component: { template: '<div />' }
        }
      ])
      return shallowMount(Topbar, {
        global: {
          config: { globalProperties: { $socket: socketMock } },
          plugins: [scheduleStore, router],
          mocks: {
            $t: key => key,
            $route: mockRoute({
              path: `/productions/production-1/episodes/${episodeId}/schedule`,
              name: 'episode-schedule',
              params: { production_id: 'production-1', episode_id: episodeId },
              query: {},
              fullPath: '/'
            })
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
    }

    it('offers an all option and the main pack', async () => {
      const scheduleWrapper = mountForSchedule('all')
      scheduleWrapper.vm.currentProjectSection = 'schedule'
      await nextTick()
      expect(scheduleWrapper.vm.currentEpisodeOptionGroups).toEqual([
        {
          name: '',
          episodeList: [
            { label: 'episodes.all_episodes', value: 'all' },
            { label: 'main.main_pack', value: 'main' }
          ]
        }
      ])
      scheduleWrapper.unmount()
    })

    it('keeps the all pseudo-episode instead of coercing it to the first one', () => {
      const scheduleWrapper = mountForSchedule('all', [{ id: 'episode-1' }])
      scheduleWrapper.vm.updateCombosFromRoute()
      expect(scheduleWrapper.vm.currentEpisodeId).toBe('all')
      scheduleWrapper.unmount()
    })

    it('keeps the main pack instead of coercing it to the first one', () => {
      const scheduleWrapper = mountForSchedule('main', [{ id: 'episode-1' }])
      scheduleWrapper.vm.updateCombosFromRoute()
      expect(scheduleWrapper.vm.currentEpisodeId).toBe('main')
      scheduleWrapper.unmount()
    })
  })

  describe('shots episode selector', () => {
    // The Shots page offers 'all' (every shot of the production) on top of
    // the real episodes. There is no main pack for shots, so 'main' is still
    // coerced to the first episode.
    const mountForShots = (episodeId, episodes = []) => {
      const production = { id: 'production-1', production_type: 'tvshow' }
      const { store: shotsStore, actions } = makeStore({
        currentProduction: () => production,
        episodes: () => episodes,
        isTVShow: () => true,
        productionEditTaskTypes: () => [],
        productionMap: () => new Map([[production.id, production]])
      })
      // configureProduction resolves episodes from the loadEpisodes action,
      // not from the episodes getter: keep both in sync for the fixture.
      actions.loadEpisodes.mockResolvedValue(episodes)
      const router = makeRouter([
        {
          path: '/productions/:production_id/episodes/:episode_id/shots',
          name: 'episode-shots',
          component: { template: '<div />' }
        }
      ])
      return shallowMount(Topbar, {
        global: {
          config: { globalProperties: { $socket: socketMock } },
          plugins: [shotsStore, router],
          mocks: {
            $t: key => key,
            $route: mockRoute({
              path: `/productions/production-1/episodes/${episodeId}/shots`,
              name: 'episode-shots',
              params: { production_id: 'production-1', episode_id: episodeId },
              query: {},
              fullPath: '/'
            })
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
    }

    it('offers an all shots option and no main pack', async () => {
      const shotsWrapper = mountForShots('all')
      shotsWrapper.vm.currentProjectSection = 'shots'
      await nextTick()
      expect(shotsWrapper.vm.currentEpisodeOptionGroups).toEqual([
        {
          name: '',
          episodeList: [{ label: 'main.all_shots', value: 'all' }]
        }
      ])
      shotsWrapper.unmount()
    })

    it('keeps the all pseudo-episode instead of coercing it to the first one', () => {
      const shotsWrapper = mountForShots('all', [{ id: 'episode-1' }])
      shotsWrapper.vm.updateCombosFromRoute()
      expect(shotsWrapper.vm.currentEpisodeId).toBe('all')
      shotsWrapper.unmount()
    })

    it('still coerces the main pack to the first episode', () => {
      const shotsWrapper = mountForShots('main', [{ id: 'episode-1' }])
      shotsWrapper.vm.updateCombosFromRoute()
      expect(shotsWrapper.vm.currentEpisodeId).toBe('episode-1')
      shotsWrapper.unmount()
    })

    // Direct link / F5: configureProduction resolves the episode itself,
    // before updateCombosFromRoute ever runs. Without the shots branch it
    // falls into the generic else and picks the running episode instead.
    it('keeps the all pseudo-episode when resolved from a direct link', async () => {
      const shotsWrapper = mountForShots('all', [
        { id: 'episode-1', status: 'running' }
      ])
      const routerSpy = vi
        .spyOn(shotsWrapper.vm.$router, 'replace')
        .mockResolvedValue({})
      shotsWrapper.vm.hasConfiguredProduction = false
      await shotsWrapper.vm.configureProduction('production-1')
      await flushPromises()
      expect(shotsWrapper.vm.currentEpisodeId).toBe('all')
      expect(routerSpy).toHaveBeenCalledWith({
        params: { production_id: 'production-1', episode_id: 'all' },
        query: {}
      })
      shotsWrapper.unmount()
    })

    // A ghost id on a direct link resolves like an in-session one: 'all'
    // wherever the section offers it, and the query survives.
    it('resolves an unknown episode to all on a direct link', async () => {
      const shotsWrapper = mountForShots('ghost', [
        { id: 'episode-1', status: 'running' }
      ])
      const routerSpy = vi
        .spyOn(shotsWrapper.vm.$router, 'replace')
        .mockResolvedValue({})
      shotsWrapper.vm.hasConfiguredProduction = false
      await shotsWrapper.vm.configureProduction('production-1')
      await flushPromises()
      expect(routerSpy).toHaveBeenCalledWith({
        params: { production_id: 'production-1', episode_id: 'all' },
        query: {}
      })
      shotsWrapper.unmount()
    })

    // A production switch carries the previous production's episode in the
    // URL: that is no stale link, the new production opens on its running
    // episode as before.
    it('opens the running episode after a production switch', async () => {
      const shotsWrapper = mountForShots('ghost', [
        { id: 'episode-1', status: 'running' }
      ])
      shotsWrapper.vm.hasConfiguredProduction = true
      const routerSpy = vi
        .spyOn(shotsWrapper.vm.$router, 'replace')
        .mockResolvedValue({})
      await shotsWrapper.vm.configureProduction('production-1')
      await flushPromises()
      expect(routerSpy).toHaveBeenCalledWith({
        params: { production_id: 'production-1', episode_id: 'episode-1' },
        query: {}
      })
      shotsWrapper.unmount()
    })

    // The direct link tests above simulate a first load by resetting the flag
    // the mount sets: F5 on the production the store fell back to runs no
    // configuration, yet that production counts as configured.
    it('counts the production of the store as configured on mount', () => {
      const shotsWrapper = mountForShots('episode-1', [
        { id: 'episode-1', status: 'running' }
      ])
      expect(shotsWrapper.vm.hasConfiguredProduction).toBe(true)
      shotsWrapper.unmount()
    })

    it('still resolves the main pack to the running episode on a direct link', async () => {
      const shotsWrapper = mountForShots('main', [
        { id: 'episode-1', status: 'running' }
      ])
      shotsWrapper.vm.hasConfiguredProduction = false
      await shotsWrapper.vm.configureProduction('production-1')
      await flushPromises()
      expect(shotsWrapper.vm.currentEpisodeId).toBe('episode-1')
      shotsWrapper.unmount()
    })
  })

  describe('route episode validation', () => {
    // A stale link (deleted episode, URL copied from another production)
    // used to reach the store as is: SET_CURRENT_EPISODE could not resolve
    // the id, the combobox went blank and a mounted page kept its list.
    const defaultEpisodes = () => [
      { id: 'episode-1', status: 'complete' },
      { id: 'episode-2', status: 'running' }
    ]
    const mountFor = (
      section,
      episodeId,
      {
        episodes = defaultEpisodes(),
        currentEpisode = null,
        productionStyle = undefined,
        holdEpisodes = false
      } = {}
    ) => {
      const production = {
        id: 'production-1',
        production_type: 'tvshow',
        production_style: productionStyle
      }
      const { store: sectionStore, actions } = makeStore({
        currentEpisode: () => currentEpisode,
        currentProduction: () => production,
        // The same array every time: tests prune it to simulate a deletion.
        episodes: () => episodes,
        isEpisodeListLoaded: () => !holdEpisodes,
        isTVShow: () => true,
        productionEditTaskTypes: () => [],
        productionMap: () => new Map([[production.id, production]])
      })
      actions.loadEpisodes.mockResolvedValue(episodes)
      let releaseEpisodes = () => {}
      if (holdEpisodes) {
        actions.loadEpisodes.mockReturnValueOnce(
          new Promise(resolve => {
            releaseEpisodes = () => resolve(episodes)
          })
        )
      }
      const router = makeRouter([
        {
          path: `/productions/:production_id/episodes/:episode_id/${section}`,
          name: `episode-${section}`,
          component: { template: '<div />' }
        },
        {
          path: '/productions/:production_id/episodes/:episode_id',
          name: 'episode',
          component: { template: '<div />' }
        }
      ])
      const replaceSpy = vi.spyOn(router, 'replace').mockResolvedValue({})
      // The component reads this object, not the router's route: tests move
      // it to simulate a navigation during a fetch.
      const route = {
        path: `/productions/production-1/episodes/${episodeId}/${section}`,
        name: `episode-${section}`,
        params: { production_id: 'production-1', episode_id: episodeId },
        query: { search: 'hero' },
        fullPath: '/'
      }
      const wrapper = shallowMount(Topbar, {
        global: {
          config: { globalProperties: { $socket: socketMock } },
          plugins: [sectionStore, router],
          mocks: { $t: key => key, $route: mockRoute(route) },
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
      return {
        wrapper,
        actions,
        replaceSpy,
        route,
        episodes,
        releaseEpisodes: () => releaseEpisodes()
      }
    }

    // An episode change before the list is loaded fetches it: that fetch
    // may outlive a production switch too.
    describe('episode refetch outliving a production switch', () => {
      const singleEpisode = () => [{ id: 'episode-1', status: 'running' }]

      it('resolves the route episode once the refetch is in', async () => {
        const { wrapper, actions, releaseEpisodes } = mountFor(
          'sequences',
          'episode-1',
          { episodes: singleEpisode(), holdEpisodes: true }
        )
        expect(actions.setCurrentEpisode).not.toHaveBeenCalled()

        releaseEpisodes()
        await flushPromises()

        expect(actions.setCurrentEpisode).toHaveBeenCalledWith(
          expect.anything(),
          'episode-1'
        )
        wrapper.unmount()
      })

      it('gives up when the production changed during the refetch', async () => {
        const { wrapper, actions, replaceSpy, route, releaseEpisodes } =
          mountFor('sequences', 'episode-1', {
            episodes: singleEpisode(),
            holdEpisodes: true
          })

        route.params.production_id = 'production-2'
        releaseEpisodes()
        await flushPromises()

        expect(actions.setCurrentEpisode).not.toHaveBeenCalled()
        expect(replaceSpy).not.toHaveBeenCalled()
        wrapper.unmount()
      })
    })

    // A direct link keeps a pseudo-episode wherever the selector offers it.
    describe('pseudo-episodes on a direct link', () => {
      // The last navigation is the one the user lands on: a coercion made on
      // the route of before the push would silently move the episode again.
      const pushedEpisodeId = async (section, episodeId, options) => {
        const { wrapper, replaceSpy } = mountFor(section, episodeId, options)
        // The mount itself may coerce through replace: only the resolution
        // is under test here.
        replaceSpy.mockClear()
        const pushSpy = vi
          .spyOn(wrapper.vm.$router, 'push')
          .mockResolvedValue({})
        wrapper.vm.hasConfiguredProduction = false
        await wrapper.vm.configureProduction('production-1')
        await flushPromises()
        wrapper.unmount()
        expect(replaceSpy).toHaveBeenCalledTimes(1)
        expect(pushSpy).not.toHaveBeenCalled()
        return replaceSpy.mock.calls.at(-1)[0].params.episode_id
      }

      it.each([
        ['edits', 'all'],
        ['breakdown', 'all'],
        ['breakdown', 'main'],
        ['asset-types', 'main'],
        ['shots', 'all']
      ])('keeps %s on %s', async (section, episodeId) => {
        expect(await pushedEpisodeId(section, episodeId)).toBe(episodeId)
      })

      it.each([
        ['edits', 'main'],
        ['shots', 'main'],
        ['sequences', 'all']
      ])(
        'opens the running episode where %s has no %s',
        async (section, episodeId) => {
          expect(await pushedEpisodeId(section, episodeId)).toBe('episode-2')
        }
      )

      // A video-game production has no main pack, whatever the section.
      it('opens the running episode of a video-game production on main', async () => {
        const episodeId = await pushedEpisodeId('breakdown', 'main', {
          productionStyle: 'video-game'
        })
        expect(episodeId).toBe('episode-2')
      })

      it('opens the assets of a video-game production under all on main', async () => {
        const episodeId = await pushedEpisodeId('assets', 'main', {
          productionStyle: 'video-game'
        })
        expect(episodeId).toBe('all')
      })
    })

    // The section names of the topbar differ from the route names for the
    // asset types page: the coerced route must use the router's name.
    it('coerces the asset types page through its route name', () => {
      const { wrapper, replaceSpy } = mountFor('asset-types', 'main', {
        productionStyle: 'video-game'
      })
      replaceSpy.mockClear()
      wrapper.vm.updateCombosFromRoute()
      expect(replaceSpy).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'episode-production-asset-types' })
      )
      wrapper.unmount()
    })

    // A plugin page is named after its plugin in the topbar sections and
    // after the plugin route in the router: coercing it under the plugin
    // id builds a route name the router does not know, and throws.
    it('coerces a plugin page through its route name', () => {
      const { wrapper, replaceSpy, route } = mountFor('production-plugin', 'main', {
        productionStyle: 'video-game'
      })
      route.params.plugin_id = 'plugin-1'
      replaceSpy.mockClear()
      wrapper.vm.updateCombosFromRoute()
      expect(replaceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'episode-production-plugin',
          params: expect.objectContaining({ plugin_id: 'plugin-1' })
        })
      )
      wrapper.unmount()
    })

    // The coerced URL must not stay in the history: the back button would
    // land on it and be coerced again, trapping the user on the page.
    it('coerces the main pack to the running episode where the section has no main pack', () => {
      const { wrapper, replaceSpy } = mountFor('edits', 'main')
      const pushSpy = vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue({})
      wrapper.vm.updateCombosFromRoute()
      expect(wrapper.vm.currentEpisodeId).toBe('episode-2')
      expect(replaceSpy).toHaveBeenCalled()
      expect(pushSpy).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    // A closed production is missing from the open ones the store holds: it
    // is loaded, rather than the first open production standing in for it.
    it('loads a production missing from the open ones before configuring it', () => {
      const { wrapper, actions, route } = mountFor('shots', 'episode-1')
      actions.setProduction.mockClear()
      route.params.production_id = 'production-closed'

      wrapper.vm.setProductionFromRoute()

      expect(actions.loadProduction).toHaveBeenCalledWith(
        expect.anything(),
        'production-closed'
      )
      expect(actions.setProduction).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    // Back to the assets page of another production, a search result or a
    // production card: a valid episode of the production survives a switch.
    it('keeps an episode of the production on the assets page after a switch', async () => {
      const { wrapper, replaceSpy } = mountFor('assets', 'episode-2')
      replaceSpy.mockClear()
      wrapper.vm.hasConfiguredProduction = true

      await wrapper.vm.configureProduction('production-1')
      await flushPromises()

      expect(replaceSpy).toHaveBeenCalledWith({
        params: { production_id: 'production-1', episode_id: 'episode-2' },
        query: { search: 'hero' }
      })
      wrapper.unmount()
    })

    // A params-only replace keeps a param the route does not declare: an
    // episode forced onto a page without episode showed the selector there
    // after a reload or a production switch, never after a section link.
    describe('page without episode', () => {
      it.each([
        ['news-feed', 'a first load', false],
        ['news-feed', 'a production switch', true],
        ['team', 'a first load', false]
      ])(
        'adds no episode to the %s route on %s',
        async (routeName, _, hasConfiguredProduction) => {
          const { wrapper, replaceSpy, route } = mountFor('shots', 'episode-1')
          route.name = routeName
          route.path = `/productions/production-1/${routeName}`
          delete route.params.episode_id
          replaceSpy.mockClear()
          wrapper.vm.hasConfiguredProduction = hasConfiguredProduction

          await wrapper.vm.configureProduction('production-1')
          await flushPromises()

          expect(replaceSpy).not.toHaveBeenCalled()
          // The section links still reopen the running episode.
          expect(wrapper.vm.currentEpisodeId).toBe('episode-2')
          wrapper.unmount()
        }
      )
    })

    // The team page has no episode: the section links reopen the episode of
    // the store instead of all.
    it('keeps the episode of the store on a page without episode', () => {
      const { wrapper, route } = mountFor('shots', 'episode-2', {
        currentEpisode: { id: 'episode-2' }
      })
      route.name = 'team'
      route.path = '/productions/production-1/team'
      delete route.params.episode_id

      wrapper.vm.updateCombosFromRoute()

      expect(wrapper.vm.currentEpisodeId).toBe('episode-2')
      wrapper.unmount()
    })

    // A live deletion of the displayed episode leaves the route, the store
    // and the selector on an id the production no longer has.
    describe('displayed episode deleted live', () => {
      // The watcher runs on the instance, whose $route is the router's one,
      // not the mock: the router must hold the route.
      const mountOnRoute = async currentEpisode => {
        const mounted = mountFor('shots', 'episode-1', { currentEpisode })
        await mounted.wrapper.vm.$router.push({
          path: '/productions/production-1/episodes/episode-1/shots',
          query: { search: 'hero' }
        })
        return mounted
      }

      it('redirects once the episode leaves the list', async () => {
        const { wrapper, replaceSpy, episodes } = await mountOnRoute({
          id: 'episode-1'
        })
        expect(replaceSpy).not.toHaveBeenCalled()

        episodes.splice(0, 1)
        wrapper.vm.onEpisodesChanged()

        expect(replaceSpy).toHaveBeenCalledWith({
          name: 'episode-shots',
          params: { production_id: 'production-1', episode_id: 'all' },
          query: { search: 'hero' }
        })
        wrapper.unmount()
      })

      // The detail page has no stand-in episode: another episode's casting
      // under the same URL shape would mislead.
      it('leaves the detail page of the deleted episode for the list', async () => {
        const { wrapper, replaceSpy, route, episodes } = mountFor(
          'shots',
          'episode-1',
          { currentEpisode: { id: 'episode-1' } }
        )
        // Both the mocked route and the router's one are read on the way.
        route.name = 'episode'
        route.path = '/productions/production-1/episodes/episode-1'
        await wrapper.vm.$router.push({
          name: 'episode',
          params: { production_id: 'production-1', episode_id: 'episode-1' }
        })

        episodes.splice(0, 1)
        wrapper.vm.onEpisodesChanged()

        expect(replaceSpy).toHaveBeenCalledWith({
          name: 'episodes',
          params: { production_id: 'production-1' }
        })
        wrapper.unmount()
      })

      // A direct link to a task of an episode the production does not have
      // lands through configureProduction: no stand-in episode there either.
      it('leaves a stale episode task link for the list', async () => {
        const { wrapper, replaceSpy, route } = mountFor('shots', 'episode-1')
        replaceSpy.mockClear()
        route.name = 'episode-episode-task'
        route.path = '/productions/production-1/episodes/ghost/tasks/task-1'
        route.params.episode_id = 'ghost'

        wrapper.vm.hasConfiguredProduction = false
        await wrapper.vm.configureProduction('production-1')
        await flushPromises()

        expect(replaceSpy).toHaveBeenCalledWith({
          name: 'episodes',
          params: { production_id: 'production-1' }
        })
        wrapper.unmount()
      })

      // Deleted while the user was on a page without production: the watcher
      // had no route episode to check, and coming back must resolve it.
      it('redirects on return to a route whose episode left the list', () => {
        const { wrapper, replaceSpy, episodes } = mountFor(
          'shots',
          'episode-1',
          { currentEpisode: { id: 'episode-1' } }
        )
        replaceSpy.mockClear()
        episodes.splice(0, 1)

        wrapper.vm.setProductionFromRoute()

        expect(replaceSpy).toHaveBeenCalledWith({
          name: 'episode-shots',
          params: { production_id: 'production-1', episode_id: 'all' },
          query: { search: 'hero' }
        })
        wrapper.unmount()
      })

      // The list also changes on a production switch, while the route still
      // carries the episode of the production left: the store resolves
      // another episode then, and configureProduction moves the route.
      it('leaves a list change alone while the store resolved another episode', async () => {
        const { wrapper, replaceSpy, episodes } = await mountOnRoute({
          id: 'episode-2'
        })

        episodes.splice(0, 1)
        wrapper.vm.onEpisodesChanged()

        expect(replaceSpy).not.toHaveBeenCalled()
        wrapper.unmount()
      })
    })

    it('commits a route episode the production knows', () => {
      const { wrapper, actions, replaceSpy } = mountFor('shots', 'episode-1')
      expect(actions.setCurrentEpisode).toHaveBeenCalledWith(
        expect.anything(),
        'episode-1'
      )
      expect(replaceSpy).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('redirects to the all pseudo-episode where the section offers it', () => {
      const { wrapper, actions, replaceSpy } = mountFor('shots', 'ghost')
      expect(actions.setCurrentEpisode).not.toHaveBeenCalled()
      expect(replaceSpy).toHaveBeenCalledWith({
        name: 'episode-shots',
        params: { production_id: 'production-1', episode_id: 'all' },
        query: { search: 'hero' }
      })
      wrapper.unmount()
    })

    it('resolves an unknown episode to the running one on a direct link where the section has no all', async () => {
      const { wrapper, replaceSpy } = mountFor('sequences', 'ghost')
      replaceSpy.mockClear()
      wrapper.vm.hasConfiguredProduction = false
      await wrapper.vm.configureProduction('production-1')
      await flushPromises()
      expect(replaceSpy).toHaveBeenCalledWith({
        params: { production_id: 'production-1', episode_id: 'episode-2' },
        query: { search: 'hero' }
      })
      wrapper.unmount()
    })

    // The episodes fetch may outlive a navigation: the route at response
    // time decides, and a production change since gives up the push.
    it('resolves the episode from the route at response time', async () => {
      const { wrapper, route, replaceSpy } = mountFor('sequences', 'ghost')
      replaceSpy.mockClear()
      wrapper.vm.hasConfiguredProduction = false
      wrapper.vm.configureProduction('production-1')
      route.params.episode_id = 'episode-1'
      await flushPromises()
      expect(replaceSpy).toHaveBeenCalledWith({
        params: { production_id: 'production-1', episode_id: 'episode-1' },
        query: { search: 'hero' }
      })
      wrapper.unmount()
    })

    it('gives up when the production changed during the episodes fetch', async () => {
      const { wrapper, route, replaceSpy } = mountFor('sequences', 'ghost')
      replaceSpy.mockClear()
      wrapper.vm.hasConfiguredProduction = false
      wrapper.vm.configureProduction('production-1')
      route.params.production_id = 'production-2'
      await flushPromises()
      expect(replaceSpy).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('redirects to the running episode where the section has no all', () => {
      const { wrapper, replaceSpy } = mountFor('sequences', 'ghost')
      expect(replaceSpy).toHaveBeenCalledWith({
        name: 'episode-sequences',
        params: { production_id: 'production-1', episode_id: 'episode-2' },
        query: { search: 'hero' }
      })
      wrapper.unmount()
    })

    it('redirects the assets page to the all pseudo-episode', () => {
      const { wrapper, actions, replaceSpy } = mountFor('assets', 'ghost')
      expect(actions.setCurrentEpisode).not.toHaveBeenCalled()
      expect(replaceSpy).toHaveBeenCalledWith({
        name: 'episode-assets',
        params: { production_id: 'production-1', episode_id: 'all' },
        query: { search: 'hero' }
      })
      wrapper.unmount()
    })
  })

  describe('playlists episode selector', () => {
    // The playlists page splits the all pseudo-episode by entity type: All
    // assets (default) and All shots (?for_entity=shot), plus the main pack.
    it('offers all assets, all shots and the main pack', async () => {
      const production = { id: 'production-1', production_type: 'tvshow' }
      const { store: playlistsStore } = makeStore({
        currentProduction: () => production,
        episodes: () => [],
        isTVShow: () => true,
        productionEditTaskTypes: () => [],
        productionMap: () => new Map([[production.id, production]])
      })
      const router = makeRouter([
        {
          path: '/productions/:production_id/episodes/:episode_id/playlists',
          name: 'episode-playlists',
          component: { template: '<div />' }
        }
      ])
      const playlistsWrapper = shallowMount(Topbar, {
        global: {
          config: { globalProperties: { $socket: socketMock } },
          plugins: [playlistsStore, router],
          mocks: {
            $t: key => key,
            $route: mockRoute({
              path: '/productions/production-1/episodes/all/playlists',
              name: 'episode-playlists',
              params: { production_id: 'production-1', episode_id: 'all' },
              query: {},
              fullPath: '/'
            })
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
      playlistsWrapper.vm.currentProjectSection = 'playlists'
      await nextTick()
      expect(playlistsWrapper.vm.currentEpisodeOptionGroups).toEqual([
        {
          name: '',
          episodeList: [
            { label: 'main.all_assets', value: 'all' },
            {
              label: 'main.all_shots',
              value: 'all',
              query: { for_entity: 'shot' }
            },
            { label: 'main.main_pack', value: 'main' }
          ]
        }
      ])
      playlistsWrapper.unmount()
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

    // The handler calls showDesktopNotificationForNew through its closure, out
    // of reach of a spy: the multi-tab lock is its first observable step.
    const fire = eventData => {
      isActive.value = true
      wrapper.vm.onNotificationNew(eventData)
    }

    it('skips desktop notification on /notifications page when foregrounded', async () => {
      wrapper.vm.$route.name = 'notifications'
      setVisibility('visible')
      fire({ person_id: 'user-1', notification_id: 'notification-1' })
      expect(wrapper.vm.withDesktopNotificationLock).not.toHaveBeenCalled()
    })

    it('fires desktop notification on /notifications when tab is backgrounded', async () => {
      wrapper.vm.$route.name = 'notifications'
      setVisibility('hidden')
      fire({ person_id: 'user-1', notification_id: 'notification-1' })
      expect(wrapper.vm.withDesktopNotificationLock).toHaveBeenCalledWith(
        'notification-1',
        expect.any(Function)
      )
    })
  })
})
