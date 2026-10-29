// @vitest-environment node

import { vi } from 'vitest'

const h = vi.hoisted(() => ({
  clientProductionIds: [],
  isAdmin: false,
  isClient: false,
  isManager: false,
  isSupervisor: false,
  managerProductionIds: []
}))

// Stub everything the route guards touch so importing the route table does
// not drag the real store, auth flow or page components into jsdom.
vi.mock('@/lib/auth', () => ({
  default: { popSSORedirect: vi.fn(), requireAuth: () => Promise.resolve() }
}))
vi.mock('bowser', () => ({
  default: { getParser: () => ({ satisfies: () => true }) }
}))
vi.mock('@/lib/init', () => ({ default: vi.fn() }))
vi.mock('@/lib/lang', () => ({ default: { setLocale: vi.fn() } }))
vi.mock('@/lib/sentry', () => ({ default: { setContext: vi.fn() } }))
vi.mock('@/lib/timezone', () => ({ default: { setTimezone: vi.fn() } }))
vi.mock('@/store', () => ({
  default: {
    commit: vi.fn(),
    state: { productions: { openProductions: [] } }
  }
}))
vi.mock('@/store/modules/people', () => ({
  default: { state: { organisation: {} } }
}))
vi.mock('@/store/modules/tasktypes', () => ({
  default: { state: { taskTypes: [] } }
}))
vi.mock('@/store/modules/user', () => ({
  default: {
    state: { user: { locale: 'en' } },
    getters: {
      isCurrentUserAdmin: () => h.isAdmin,
      isCurrentUserArtist: () => false,
      // A project role reads the production of the route it is given.
      isCurrentUserClient: (state, getters, rootState) =>
        h.isClient ||
        h.clientProductionIds.includes(rootState?.route?.params?.production_id),
      isCurrentUserManager: (state, getters, rootState) =>
        h.isAdmin ||
        h.isManager ||
        h.managerProductionIds.includes(
          rootState?.route?.params?.production_id
        ),
      isCurrentUserSupervisor: () => h.isSupervisor
    }
  }
}))
vi.mock('@/components/Main.vue', () => ({ default: {} }))
vi.mock('@/components/pages/Login.vue', () => ({ default: {} }))
vi.mock('@/components/pages/NotFound.vue', () => ({ default: {} }))
vi.mock('@/components/pages/Playlist.vue', () => ({ default: {} }))
vi.mock('@/components/pages/ProductionNewsFeed.vue', () => ({ default: {} }))
vi.mock('@/components/pages/Shot.vue', () => ({ default: {} }))
vi.mock('@/components/pages/Shots.vue', () => ({ default: {} }))
// The app router, on a history that needs no browser.
vi.mock('vue-router', async importOriginal => {
  const original = await importOriginal()
  return { ...original, createWebHistory: original.createMemoryHistory }
})

import auth from '@/lib/auth'
import { markRequestFailure } from '@/lib/errors'
import init from '@/lib/init'
import router from '@/router'
import store from '@/store'
import productionsStore from '@/store/modules/productions'
import taskTypeStore from '@/store/modules/tasktypes'
import { routes } from '@/router/routes'

const appLoginRoute = routes.find(route => route.name === 'app-login')
const homeRoute = routes.find(route => route.name === 'home')
const mainRoute = routes.find(route => route.path === '/')

// The API client marks the failures of its requests.
const buildRequestFailure = () => {
  const failure = new Error('api down')
  markRequestFailure(failure)
  return failure
}

const buildBug = () =>
  new TypeError("Cannot read properties of null (reading 'forEach')")

// The admin-only pages: removing the requiresAdmin flag from any of them
// would silently expose the page to every logged-in user.
const ADMIN_ONLY_ROUTES = [
  'asset-types',
  'backgrounds',
  'bots',
  'custom-actions',
  'departments',
  'logs',
  'main-schedule',
  'people',
  'productions',
  'project-templates',
  'project-template-settings',
  'salary-scale',
  'settings',
  'status-automations',
  'studios',
  'task-status',
  'task-types'
]

// Pages linked from the sidebar for supervisors and production managers:
// their route meta must match that visibility, otherwise a page reload
// sends those roles to not-found (#1933).
const SUPERVISOR_OR_MANAGER_ROUTES = ['team-schedule']

// The entity and task type pages expose the assignees, estimations and
// dates the lists hide from clients.
const CLIENT_FORBIDDEN_ROUTES = [
  'asset',
  'edit',
  'episode-asset',
  'episode-edit',
  'episode-shot',
  'episode-task-type',
  'shot',
  'task-type'
]

// The production settings can hide these pages from the clients.
const CLIENT_TASK_LIST_ROUTES = [
  'asset',
  'assets',
  'edit',
  'edits',
  'episode-asset',
  'episode-assets',
  'episode-edit',
  'episode-edits',
  'episode-episode-task',
  'episode-shot',
  'episode-shots',
  'episode-task',
  'episode-task-type',
  'episodes-task-type',
  'shot',
  'shots',
  'task',
  'task-type'
]
const CLIENT_STATS_ROUTES = [
  'episode-production-asset-types',
  'episode-sequence-stats',
  'episode-stats',
  'production-asset-types',
  'sequence-stats'
]

describe('router/routes', () => {
  beforeEach(() => {
    h.clientProductionIds = []
    h.managerProductionIds = []
    productionsStore.state.productionMap = new Map()
    h.isAdmin = false
    h.isClient = false
    h.isManager = false
    h.isSupervisor = false
    taskTypeStore.state.taskTypes = [{ id: 'task-type-1' }]
    vi.clearAllMocks()
  })

  describe('admin route table', () => {
    test.each(ADMIN_ONLY_ROUTES)('%s requires admin', name => {
      const route = mainRoute.children.find(child => child.name === name)
      expect(route).toBeDefined()
      expect(route.meta?.requiresAdmin).toBe(true)
    })
  })

  describe('supervisor or manager route table', () => {
    test.each(SUPERVISOR_OR_MANAGER_ROUTES)(
      '%s requires supervisor or manager',
      name => {
        const route = mainRoute.children.find(child => child.name === name)
        expect(route).toBeDefined()
        expect(route.meta?.requiresSupervisorOrManager).toBe(true)
        expect(route.meta?.requiresAdmin).toBeUndefined()
      }
    )
  })

  describe('client-forbidden route table', () => {
    test.each(CLIENT_FORBIDDEN_ROUTES)('%s is forbidden for clients', name => {
      const route = mainRoute.children.find(child => child.name === name)
      expect(route).toBeDefined()
      expect(route.meta?.forbiddenForClient).toBe(true)
    })
  })

  describe('client access route table', () => {
    test.each(CLIENT_TASK_LIST_ROUTES)('%s follows the task list setting', name => {
      const route = mainRoute.children.find(child => child.name === name)
      expect(route).toBeDefined()
      expect(route.meta?.clientAccess).toBe('taskList')
    })

    test.each(CLIENT_STATS_ROUTES)('%s follows the stats setting', name => {
      const route = mainRoute.children.find(child => child.name === name)
      expect(route).toBeDefined()
      expect(route.meta?.clientAccess).toBe('stats')
    })
  })

  describe('main guard client access', () => {
    const setProduction = flags => {
      productionsStore.state.productionMap = new Map([
        ['production-1', { id: 'production-1', ...flags }]
      ])
    }
    const playlists = {
      name: 'playlists',
      params: { production_id: 'production-1' }
    }
    const runGuardOn = (name, params = {}) => {
      const route = mainRoute.children.find(child => child.name === name)
      return mainRoute.beforeEnter(
        {
          name,
          params: { production_id: 'production-1', ...params },
          matched: [{ meta: route.meta || {} }]
        },
        {}
      )
    }

    test.each(CLIENT_TASK_LIST_ROUTES)(
      'sends a client to the playlists on %s when the task list is off',
      async name => {
        h.isClient = true
        setProduction({ is_client_task_list_visible: false })
        const forbidden = mainRoute.children.find(
          child => child.name === name
        ).meta?.forbiddenForClient
        expect(await runGuardOn(name)).toEqual(
          forbidden ? { name: 'not-found' } : playlists
        )
      }
    )

    test.each(CLIENT_STATS_ROUTES)(
      'sends a client to the playlists on %s when the stats are off',
      async name => {
        h.isClient = true
        setProduction({ is_client_stats_visible: false })
        expect(await runGuardOn(name)).toEqual(playlists)
      }
    )

    test('keeps the episode when sending a client to the playlists', async () => {
      h.isClient = true
      setProduction({ is_client_task_list_visible: false })
      expect(await runGuardOn('episode-shots', { episode_id: 'ep-1' })).toEqual(
        {
          name: 'episode-playlists',
          params: { production_id: 'production-1', episode_id: 'ep-1' }
        }
      )
    })

    test('keeps the playlists reachable for a client with everything off', async () => {
      h.isClient = true
      setProduction({
        is_client_stats_visible: false,
        is_client_task_list_visible: false
      })
      expect(await runGuardOn('playlists')).toBeUndefined()
    })

    test('lets a client through when the flags are null', async () => {
      h.isClient = true
      setProduction({
        is_client_stats_visible: null,
        is_client_task_list_visible: null
      })
      expect(await runGuardOn('shots')).toBeUndefined()
      expect(await runGuardOn('sequence-stats')).toBeUndefined()
    })

    test('never redirects a manager', async () => {
      h.isManager = true
      setProduction({
        is_client_stats_visible: false,
        is_client_task_list_visible: false
      })
      expect(await runGuardOn('shots')).toBeUndefined()
      expect(await runGuardOn('sequence-stats')).toBeUndefined()
    })

    // A deep link on a fresh page load: the production and the project
    // roles arrive with the initial load, after the guard starts.
    test('decides with the data of the initial load', async () => {
      taskTypeStore.state.taskTypes = []
      init.mockImplementationOnce(async () => {
        h.clientProductionIds = ['production-1']
        setProduction({ is_client_task_list_visible: false })
        return true
      })
      expect(await runGuardOn('shots')).toEqual(playlists)
    })
  })

  describe('client access on in-app navigation', () => {
    // The guard of the main route does not run again between its
    // children: the switch to another production keeps the section.
    test('sends a client to the playlists when switching to a production with the task list off', async () => {
      productionsStore.state.productionMap = new Map([
        ['production-1', { id: 'production-1' }],
        [
          'production-2',
          { id: 'production-2', is_client_task_list_visible: false }
        ]
      ])
      h.clientProductionIds = ['production-1', 'production-2']
      await router.push('/productions/production-1/shots')
      expect(router.currentRoute.value.name).toBe('shots')
      await router.push('/productions/production-2/shots')
      expect(router.currentRoute.value.name).toBe('playlists')
      expect(router.currentRoute.value.params.production_id).toBe(
        'production-2'
      )
    })

    test('sends a per-project client to not-found when switching to a client-forbidden page', async () => {
      productionsStore.state.productionMap = new Map([
        ['production-1', { id: 'production-1' }],
        ['production-2', { id: 'production-2' }]
      ])
      h.clientProductionIds = ['production-2']
      await router.push('/productions/production-1/shots/shot-1')
      expect(router.currentRoute.value.name).toBe('shot')
      await router.push('/productions/production-2/shots/shot-1')
      expect(router.currentRoute.value.name).toBe('not-found')
    })
  })

  // The guard of the main route runs once, on the way in: the studio feed
  // checks the role on every entry, a move from another page too.
  describe('studio feed', () => {
    const loadPage = async path => {
      await router.push('/login')
      await router.push(path)
    }

    test('opens to a manager on a page load', async () => {
      h.isManager = true
      await loadPage('/news-feed')
      expect(router.currentRoute.value.name).toBe('newsfeed')
    })

    test('opens to a manager from another page', async () => {
      h.isManager = true
      await router.push('/productions/production-1/shots')
      await router.push('/news-feed')
      expect(router.currentRoute.value.name).toBe('newsfeed')
    })

    test('sends any other role to not-found on a page load', async () => {
      await loadPage('/news-feed')
      expect(router.currentRoute.value.name).toBe('not-found')
    })

    test('sends a manager of the production left only to not-found', async () => {
      h.managerProductionIds = ['production-1']
      await router.push('/productions/production-1/shots')
      await router.push('/news-feed')
      expect(router.currentRoute.value.name).toBe('not-found')
    })

    test('sends any other role to not-found from another page', async () => {
      await router.push('/productions/production-1/shots')
      await router.push('/news-feed')
      expect(router.currentRoute.value.name).toBe('not-found')
    })
  })

  describe('main guard', () => {
    const runGuard = to => mainRoute.beforeEnter(to, {})

    test('redirects a non-admin to not-found on an admin route', async () => {
      const result = await runGuard({
        matched: [{ meta: { requiresAdmin: true } }]
      })
      expect(result).toEqual({ name: 'not-found' })
    })

    test('lets an admin through on an admin route', async () => {
      h.isAdmin = true
      const result = await runGuard({
        matched: [{ meta: { requiresAdmin: true } }]
      })
      expect(result).toBeUndefined()
    })

    test('lets a non-admin through on a regular route', async () => {
      const result = await runGuard({ matched: [{ meta: {} }] })
      expect(result).toBeUndefined()
    })

    test.each([
      ['production manager', 'isManager'],
      ['supervisor', 'isSupervisor'],
      ['admin', 'isAdmin']
    ])(
      'lets a %s through on a supervisor-or-manager route',
      async (role, flag) => {
        h[flag] = true
        const result = await runGuard({
          matched: [{ meta: { requiresSupervisorOrManager: true } }]
        })
        expect(result).toBeUndefined()
      }
    )

    test('redirects an artist to not-found on a supervisor-or-manager route', async () => {
      const result = await runGuard({
        matched: [{ meta: { requiresSupervisorOrManager: true } }]
      })
      expect(result).toEqual({ name: 'not-found' })
    })

    test('redirects a client to not-found on a client-forbidden route', async () => {
      h.isClient = true
      const result = await runGuard({
        matched: [{ meta: { forbiddenForClient: true } }]
      })
      expect(result).toEqual({ name: 'not-found' })
    })

    test('lets a non-client through on a client-forbidden route', async () => {
      const result = await runGuard({
        matched: [{ meta: { forbiddenForClient: true } }]
      })
      expect(result).toBeUndefined()
    })

    test('still blocks admin routes when data loads first', async () => {
      taskTypeStore.state.taskTypes = []
      init.mockResolvedValue(true)
      const result = await runGuard({
        matched: [{ meta: { requiresAdmin: true } }]
      })
      expect(result).toEqual({ name: 'not-found' })
    })

    // The server-down page opens the requested page once the server answers.
    test('redirects to server-down with the requested page when the initial load fails', async () => {
      taskTypeStore.state.taskTypes = []
      init.mockRejectedValue(buildRequestFailure())
      const result = await runGuard({
        fullPath: '/productions/production-1/assets?search=hero',
        matched: [{ meta: {} }]
      })
      expect(result).toEqual({
        name: 'server-down',
        query: { redirect: '/productions/production-1/assets?search=hero' }
      })
    })

    // Sentry reports the errors of the guards. The server-down page would
    // load the app again on each of its checks, and fail again.
    test('leaves a bug of the initial load to Sentry', async () => {
      taskTypeStore.state.taskTypes = []
      const bug = buildBug()
      init.mockRejectedValue(bug)
      await expect(
        runGuard({ fullPath: '/productions', matched: [{ meta: {} }] })
      ).rejects.toBe(bug)
      expect(store.commit).toHaveBeenCalledWith('DATA_LOADING_END')
    })

    test('aborts the navigation when the initial load ends on the 2FA redirect', async () => {
      // init() resolves false after pushing login-2fa itself: the guard must
      // abort the superseded navigation, not proceed nor redirect.
      taskTypeStore.state.taskTypes = []
      init.mockResolvedValue(false)
      const result = await runGuard({ matched: [{ meta: {} }] })
      expect(result).toBe(false)
    })
  })

  describe('home guard', () => {
    beforeEach(() => {
      vi.stubGlobal('window', { navigator: { userAgent: '' } })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    test('goes to the page saved before an SSO login', async () => {
      auth.popSSORedirect.mockReturnValueOnce('/app-login?port=1234')
      const result = await homeRoute.beforeEnter({}, {})
      expect(result).toBe('/app-login?port=1234')
      expect(init).not.toHaveBeenCalled()
    })

    test('goes to the default page without a saved redirect', async () => {
      init.mockResolvedValue(true)
      const result = await homeRoute.beforeEnter({}, {})
      expect(result).toEqual({ name: 'open-productions' })
    })

    test('redirects to server-down when the initial load fails', async () => {
      init.mockRejectedValue(buildRequestFailure())
      const result = await homeRoute.beforeEnter({}, {})
      expect(result).toEqual({ name: 'server-down' })
    })

    test('leaves a bug of the initial load to Sentry', async () => {
      const bug = buildBug()
      init.mockRejectedValue(bug)
      await expect(homeRoute.beforeEnter({}, {})).rejects.toBe(bug)
    })
  })

  describe('app login guard', () => {
    test('shows the page without loading the app data', async () => {
      const result = await appLoginRoute.beforeEnter({}, {})
      expect(result).toBeUndefined()
      expect(init).not.toHaveBeenCalled()
      expect(store.commit).toHaveBeenCalledWith('DATA_LOADING_END')
    })
  })
})
