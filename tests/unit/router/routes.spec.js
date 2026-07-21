import { vi } from 'vitest'

const h = vi.hoisted(() => ({
  isAdmin: false,
  isManager: false,
  isSupervisor: false
}))

// Stub everything the route guards touch so importing the route table does
// not drag the real store, auth flow or page components into jsdom.
vi.mock('@/lib/auth', () => ({
  default: { requireAuth: () => Promise.resolve() }
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
      isCurrentUserManager: () => h.isAdmin || h.isManager,
      isCurrentUserSupervisor: () => h.isSupervisor
    }
  }
}))
vi.mock('@/components/Main.vue', () => ({ default: {} }))
vi.mock('@/components/pages/Login.vue', () => ({ default: {} }))

import init from '@/lib/init'
import taskTypeStore from '@/store/modules/tasktypes'
import { routes } from '@/router/routes'

const mainRoute = routes.find(route => route.path === '/')

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
  'newsfeed',
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

describe('router/routes', () => {
  beforeEach(() => {
    h.isAdmin = false
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

    test('still blocks admin routes when data loads first', async () => {
      taskTypeStore.state.taskTypes = []
      init.mockResolvedValue(true)
      const result = await runGuard({
        matched: [{ meta: { requiresAdmin: true } }]
      })
      expect(result).toEqual({ name: 'not-found' })
    })

    test('redirects to server-down when the initial load fails', async () => {
      taskTypeStore.state.taskTypes = []
      init.mockRejectedValue(new Error('api down'))
      const result = await runGuard({ matched: [{ meta: {} }] })
      expect(result).toEqual({ name: 'server-down' })
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
})
