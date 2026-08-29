import { vi } from 'vitest'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/lib/auth', () => ({ default: { logIn: vi.fn(), logOut: vi.fn() } }))
vi.mock('@/store/api/people', () => ({
  default: {
    loadDone: vi.fn(),
    loadTasksToCheck: vi.fn(),
    loadTimeSpents: vi.fn()
  }
}))

import peopleApi from '@/store/api/people'
import store from '@/store/modules/user'

describe('User store', () => {
  describe('Getters', () => {
    const stateFor = (role, projectRoles = {}) => ({
      user: role ? { id: 'person-1', role } : null,
      projectRoles
    })
    const rootStateFor = productionId => ({
      productions: {
        currentProduction: productionId ? { id: productionId } : null
      }
    })

    describe('currentUserEffectiveRole', () => {
      const call = (state, rootState) =>
        store.getters.currentUserEffectiveRole(
          state,
          {
            currentUserRoleForProduction:
              store.getters.currentUserRoleForProduction(state)
          },
          rootState
        )

      test('project role wins on the current production', () => {
        expect(
          call(
            stateFor('user', { 'production-1': 'supervisor' }),
            rootStateFor('production-1')
          )
        ).toEqual('supervisor')
      })

      test('falls back to the global role', () => {
        expect(
          call(stateFor('supervisor'), rootStateFor('production-1'))
        ).toEqual('supervisor')
        expect(
          call(
            stateFor('supervisor', { 'production-2': 'user' }),
            rootStateFor('production-1')
          )
        ).toEqual('supervisor')
      })

      test('global role outside any production', () => {
        expect(
          call(stateFor('manager', { 'production-1': 'user' }), rootStateFor(null))
        ).toEqual('manager')
      })

      test('null when not authenticated', () => {
        expect(call(stateFor(null), rootStateFor(null))).toBeNull()
      })
    })

    describe('currentUserRoleForProduction', () => {
      const getter = store.getters.currentUserRoleForProduction

      test('resolves per production id', () => {
        const roleFor = getter(
          stateFor('user', { 'production-1': 'manager' })
        )
        expect(roleFor('production-1')).toEqual('manager')
        expect(roleFor('production-2')).toEqual('user')
        expect(roleFor(null)).toEqual('user')
      })
    })

    describe('isCurrentUserProductionManager', () => {
      const getter = store.getters.isCurrentUserProductionManager
      const call = (role, projectRoles, effectiveRole) =>
        getter(stateFor(role, projectRoles), {
          currentUserEffectiveRole: effectiveRole
        })

      test('admin always manages, whatever the project role says', () => {
        expect(call('admin', { 'production-1': 'user' }, 'user')).toBe(true)
      })

      test('effective manager manages', () => {
        expect(call('user', { 'production-1': 'manager' }, 'manager')).toBe(
          true
        )
        expect(call('manager', {}, 'manager')).toBe(true)
      })

      test('demoted manager does not manage', () => {
        expect(call('manager', { 'production-1': 'user' }, 'user')).toBe(false)
      })
    })

    describe('isCurrentUserProductionSupervisor', () => {
      const getter = store.getters.isCurrentUserProductionSupervisor

      test('follows the effective role', () => {
        expect(
          getter(stateFor('user'), { currentUserEffectiveRole: 'supervisor' })
        ).toBe(true)
        expect(
          getter(stateFor('supervisor'), { currentUserEffectiveRole: 'user' })
        ).toBe(false)
      })
    })
  })

  describe('Mutations', () => {
    test('SET_USER_PROJECT_ROLES', () => {
      const state = { projectRoles: {} }
      store.mutations.SET_USER_PROJECT_ROLES(state, {
        'production-1': 'manager'
      })
      expect(state.projectRoles).toEqual({ 'production-1': 'manager' })
      store.mutations.SET_USER_PROJECT_ROLES(state, undefined)
      expect(state.projectRoles).toEqual({})
    })

    test('SET_USER_PROJECT_ROLE', () => {
      const state = { projectRoles: { 'production-1': 'supervisor' } }
      store.mutations.SET_USER_PROJECT_ROLE(state, {
        projectId: 'production-1',
        role: 'manager'
      })
      expect(state.projectRoles['production-1']).toEqual('manager')
      store.mutations.SET_USER_PROJECT_ROLE(state, {
        projectId: 'production-1',
        role: null
      })
      expect(state.projectRoles['production-1']).toBeUndefined()
    })

    test('USER_LOGOUT clears project roles', () => {
      const state = {
        user: { id: 'person-1' },
        isAuthenticated: true,
        projectRoles: { 'production-1': 'manager' }
      }
      store.mutations.USER_LOGOUT(state)
      expect(state.projectRoles).toEqual({})
    })
  })

  describe('Actions', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    // A 2xx response without a JSON body (proxy maintenance page) makes pget
    // resolve null; the actions must hand arrays to the forEach mutations.
    describe('loadDoneTasks', () => {
      test('commits an empty list when the API resolves null', async () => {
        peopleApi.loadDone.mockResolvedValue(null)
        const commit = vi.fn()

        const doneTasks = await store.actions.loadDoneTasks({ commit })

        expect(doneTasks).toEqual([])
        expect(commit).toHaveBeenCalledWith('USER_LOAD_DONE_TASKS_END', [])
        expect(commit).toHaveBeenCalledWith('REGISTER_USER_TASKS', {
          tasks: []
        })
      })

      test('passes the loaded tasks through', async () => {
        const tasks = [{ id: 'task-1' }]
        peopleApi.loadDone.mockResolvedValue(tasks)
        const commit = vi.fn()

        const doneTasks = await store.actions.loadDoneTasks({ commit })

        expect(doneTasks).toEqual(tasks)
        expect(commit).toHaveBeenCalledWith('USER_LOAD_DONE_TASKS_END', tasks)
      })
    })

    describe('loadUserTimeSpents', () => {
      test('commits an empty list when the API resolves null', async () => {
        peopleApi.loadTimeSpents.mockResolvedValue(null)
        const commit = vi.fn()

        await store.actions.loadUserTimeSpents(
          { commit },
          { date: '2026-08-06' }
        )

        expect(peopleApi.loadTimeSpents).toHaveBeenCalledWith('2026-08-06')
        expect(commit).toHaveBeenCalledWith('USER_LOAD_TIME_SPENTS_END', [])
      })
    })

    describe('loadTasksToCheck', () => {
      test('requests page 1 by default and commits the page data', async () => {
        const result = {
          data: [{ id: 'task-1' }],
          stats: { total: 1 },
          page: 1,
          limit: 100,
          is_more: false
        }
        peopleApi.loadTasksToCheck.mockResolvedValue(result)
        const commit = vi.fn()

        const returned = await store.actions.loadTasksToCheck(
          { commit },
          { project_id: 'project-1' }
        )

        expect(peopleApi.loadTasksToCheck).toHaveBeenCalledWith({
          project_id: 'project-1',
          page: 1
        })
        expect(returned).toBe(result)
        expect(commit).toHaveBeenCalledWith('REGISTER_USER_TASKS', {
          tasks: result.data
        })
      })

      test('commits an empty page when the API resolves null', async () => {
        peopleApi.loadTasksToCheck.mockResolvedValue(null)
        const commit = vi.fn()

        const result = await store.actions.loadTasksToCheck({ commit })

        expect(result.data).toEqual([])
        expect(result.is_more).toBe(false)
        expect(commit).toHaveBeenCalledWith('REGISTER_USER_TASKS', {
          tasks: []
        })
      })
    })
  })
})
