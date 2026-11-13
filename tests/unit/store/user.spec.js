// @vitest-environment node

import { vi } from 'vitest'
import { computed } from 'vue'
import { createStore } from 'vuex'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/lib/auth', () => ({ default: { logIn: vi.fn(), logOut: vi.fn() } }))
vi.mock('@/store/api/people', () => ({
  default: {
    enableEmailOTP: vi.fn(),
    enableTOTP: vi.fn(),
    loadDone: vi.fn(),
    loadTasksToCheck: vi.fn(),
    loadTimeSpents: vi.fn(),
    registerFIDO: vi.fn(),
    unregisterFIDO: vi.fn(),
    updatePerson: vi.fn(),
    updatePersonLocale: vi.fn()
  }
}))

import peopleApi from '@/store/api/people'
import peopleStore from '@/store/modules/people'
import store from '@/store/modules/user'
import taskStatusStore from '@/store/modules/taskstatus'

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

    describe('role getters follow the project role on production routes', () => {
      const routeFor = productionId => ({
        route: { params: productionId ? { production_id: productionId } : {} }
      })
      const promoted = stateFor('user', { 'production-1': 'manager' })

      test('artist promoted manager on the production', () => {
        const rootState = routeFor('production-1')
        expect(
          store.getters.isCurrentUserManager(promoted, {}, rootState)
        ).toBe(true)
        expect(store.getters.isCurrentUserArtist(promoted, {}, rootState)).toBe(
          false
        )
      })

      test('global role applies outside of a production route', () => {
        const rootState = routeFor(null)
        expect(
          store.getters.isCurrentUserManager(promoted, {}, rootState)
        ).toBe(false)
        expect(store.getters.isCurrentUserArtist(promoted, {}, rootState)).toBe(
          true
        )
      })

      // The page of an entity hides the assignation bar from vendors through
      // this getter alone: nothing in the bar handles them any more.
      test('vendors count as artists', () => {
        const projectVendor = stateFor('supervisor', {
          'production-1': 'vendor'
        })
        expect(
          store.getters.isCurrentUserArtist(
            stateFor('vendor'),
            {},
            routeFor(null)
          )
        ).toBe(true)
        expect(
          store.getters.isCurrentUserArtist(
            projectVendor,
            {},
            routeFor('production-1')
          )
        ).toBe(true)
      })

      test('admin stays manager whatever the project role says', () => {
        expect(
          store.getters.isCurrentUserManager(
            stateFor('admin', { 'production-1': 'user' }),
            {},
            routeFor('production-1')
          )
        ).toBe(true)
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

  describe('canValidatePreviewFiles', () => {
    const task = { project_id: 'production-1', task_type_id: 'tt-1' }
    const call = (role, departments, projectRoles = {}) => {
      const state = { user: { id: 'person-1', role, departments }, projectRoles }
      return store.getters.canValidatePreviewFiles(
        state,
        {
          currentUserRoleForProduction:
            store.getters.currentUserRoleForProduction(state)
        },
        {},
        { taskTypeMap: new Map([['tt-1', { department_id: 'dep-1' }]]) }
      )(task)
    }

    test('managers and admins validate', () => {
      expect(call('manager', [])).toBe(true)
      expect(call('admin', ['dep-2'])).toBe(true)
    })

    test('supervisors are held to their departments', () => {
      expect(call('supervisor', [])).toBe(true)
      expect(call('supervisor', ['dep-1'])).toBe(true)
      expect(call('supervisor', ['dep-2'])).toBe(false)
      expect(call('user', ['dep-1'], { 'production-1': 'supervisor' })).toBe(
        true
      )
    })
  })

  describe('canEditShotTrim', () => {
    const task = { project_id: 'production-1' }
    const call = (role, departments, options = {}) => {
      const { team = ['person-1'], projectRoles = {} } = options
      const state = { user: { id: 'person-1', role, departments }, projectRoles }
      return store.getters.canEditShotTrim(
        state,
        {
          currentUserRoleForProduction:
            store.getters.currentUserRoleForProduction(state)
        },
        {},
        { productionMap: new Map([['production-1', { team }]]) }
      )(task)
    }

    test('admins edit the trim of any production', () => {
      expect(call('admin', ['dep-1'], { team: [] })).toBe(true)
    })

    test('managers and department-less supervisors edit it from the team', () => {
      expect(call('manager', [])).toBe(true)
      expect(call('supervisor', [])).toBe(true)
      const projectRoles = { 'production-1': 'manager' }
      expect(call('user', [], { projectRoles })).toBe(true)
    })

    // zou only lets a supervisor with departments edit the descriptor keys
    // of those departments, and the trim handles are not descriptors
    test('supervisors with departments, clients and artists do not', () => {
      expect(call('supervisor', ['dep-1'])).toBe(false)
      expect(call('client', [])).toBe(false)
      expect(call('user', [])).toBe(false)
    })

    test('managers outside the production team do not', () => {
      expect(call('manager', [], { team: ['person-2'] })).toBe(false)
    })

    test('nobody edits it without a user', () => {
      const rootGetters = { productionMap: new Map() }
      expect(
        store.getters.canEditShotTrim({ user: null }, {}, {}, rootGetters)(task)
      ).toBe(false)
    })
  })

  describe('canReadDaysOff', () => {
    const colleague = { id: 'person-2', departments: ['dep-1'], is_bot: false }
    const call = (role, departments, options = {}) => {
      const {
        person = colleague,
        projectRoles = {},
        productions = [{ id: 'production-1', team: ['person-1', person.id] }]
      } = options
      const state = { user: { id: 'person-1', role, departments }, projectRoles }
      return store.getters.canReadDaysOff(
        state,
        {
          currentUserRoleForProduction:
            store.getters.currentUserRoleForProduction(state)
        },
        { people: { personMapVersion: 0 } },
        {
          openProductions: productions,
          personMap: new Map([[person.id, person]])
        }
      )(person.id)
    }

    test('admins and the person read them', () => {
      expect(call('admin', [], { productions: [] })).toBe(true)
      const self = { id: 'person-1', departments: [] }
      expect(call('user', [], { person: self, productions: [] })).toBe(true)
    })

    test('managers of a production of the person read them', () => {
      expect(call('manager', ['dep-2'])).toBe(true)
      const projectRoles = { 'production-1': 'manager' }
      expect(call('user', [], { projectRoles })).toBe(true)
    })

    test('supervisors of a production of the person are held to their departments', () => {
      expect(call('supervisor', [])).toBe(true)
      expect(call('supervisor', ['dep-2', 'dep-1'])).toBe(true)
      expect(call('supervisor', ['dep-2'])).toBe(false)
      const newcomer = { id: 'person-2', departments: [] }
      expect(call('supervisor', ['dep-2'], { person: newcomer })).toBe(false)
      const projectRoles = { 'production-1': 'supervisor' }
      expect(call('user', ['dep-1'], { projectRoles })).toBe(true)
    })

    test('a manager role on another production of the person wins', () => {
      const team = ['person-1', 'person-2']
      const productions = [
        { id: 'production-1', team },
        { id: 'production-2', team }
      ]
      const projectRoles = { 'production-2': 'manager' }
      expect(
        call('supervisor', ['dep-2'], { productions, projectRoles })
      ).toBe(true)
    })

    test('artists, clients, and roles outside the productions of the person do not', () => {
      expect(call('user', ['dep-1'])).toBe(false)
      expect(call('client', [])).toBe(false)
      const productions = [{ id: 'production-1', team: ['person-1'] }]
      expect(call('manager', [], { productions })).toBe(false)
      expect(call('supervisor', [], { productions })).toBe(false)
    })

    test('nobody reads the days off of a bot', () => {
      const bot = { id: 'person-2', departments: [], is_bot: true }
      expect(call('admin', [], { person: bot })).toBe(false)
      expect(call('manager', [], { person: bot })).toBe(false)
    })

    // the person map keeps its identity when a person changes
    test('a computed over the rule follows the departments of the person', () => {
      const realStore = createStore({
        modules: {
          people: {
            state: { personMapVersion: 0 },
            getters: peopleStore.getters,
            mutations: peopleStore.mutations
          },
          productions: {
            state: {
              openProductions: [
                { id: 'production-1', team: ['person-1', colleague.id] }
              ]
            },
            getters: { openProductions: state => state.openProductions }
          },
          user: {
            state: {
              user: { id: 'person-1', role: 'supervisor', departments: ['dep-1'] },
              projectRoles: {}
            },
            getters: store.getters
          }
        }
      })
      const person = { ...colleague, first_name: 'Ada' }
      realStore.commit('EDIT_PEOPLE_END', person)
      const canRead = computed(() =>
        realStore.getters.canReadDaysOff(person.id)
      )
      expect(canRead.value).toBe(true)

      realStore.commit('EDIT_PEOPLE_END', { ...person, departments: ['dep-2'] })

      expect(canRead.value).toBe(false)
    })

    test('nobody reads them without a user', () => {
      const rootGetters = { openProductions: [], personMap: new Map() }
      expect(
        store.getters.canReadDaysOff(
          { user: null },
          {},
          {},
          rootGetters
        )('person-2')
      ).toBe(false)
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

    // Zou picks the next preferred method in the same order
    // (TWO_FACTOR_FALLBACKS), so the page matches it until a reload.
    describe('preferred 2FA method once one is turned off', () => {
      const userWith = (preferred, enabled) => ({
        preferred_two_factor_authentication: preferred,
        totp_enabled: enabled.includes('totp'),
        email_otp_enabled: enabled.includes('email_otp'),
        fido_enabled: enabled.includes('fido'),
        fido_devices: enabled.includes('fido') ? ['Yubikey'] : []
      })

      test('moves to FIDO, then email OTP, when TOTP goes', () => {
        const state = { user: userWith('totp', ['totp', 'fido', 'email_otp']) }
        store.mutations.USER_DISABLE_TOTP_SUCCESS(state)
        expect(state.user.preferred_two_factor_authentication).toBe('fido')
      })

      test('moves to TOTP when email OTP goes', () => {
        const state = { user: userWith('email_otp', ['email_otp', 'totp']) }
        store.mutations.USER_DISABLE_EMAIL_OTP_SUCCESS(state)
        expect(state.user.preferred_two_factor_authentication).toBe('totp')
      })

      test('moves to TOTP, then email OTP, when the last key goes', () => {
        const state = { user: userWith('fido', ['fido', 'email_otp', 'totp']) }
        store.mutations.USER_UNREGISTER_FIDO_SUCCESS(state, 'Yubikey')
        expect(state.user.preferred_two_factor_authentication).toBe('totp')

        const onlyTotp = { user: userWith('fido', ['fido', 'totp']) }
        store.mutations.USER_UNREGISTER_FIDO_SUCCESS(onlyTotp, 'Yubikey')
        expect(onlyTotp.user.preferred_two_factor_authentication).toBe('totp')
      })

      test('drops the preference when no method is left', () => {
        const state = { user: userWith('fido', ['fido']) }
        store.mutations.USER_UNREGISTER_FIDO_SUCCESS(state, 'Yubikey')
        expect(state.user.preferred_two_factor_authentication).toBeNull()
        expect(state.user.fido_enabled).toBe(false)
      })
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

    // The asset list rebuilds its saved searches from the asset ones.
    test('SAVE_ASSET_SEARCH_END records the search among the asset ones', () => {
      const searchQuery = { id: 'filter-1', name: 'props', list_type: 'asset' }
      const state = { userFilters: {} }

      store.mutations.SAVE_ASSET_SEARCH_END(state, {
        searchQuery,
        production: { id: 'production-1' }
      })

      expect(state.userFilters).toEqual({
        asset: { 'production-1': [searchQuery] }
      })
    })

    // The Assets page lists the asset searches and groups of the user store.
    test('REMOVE_ASSET_SEARCH_END drops the search from the asset ones', () => {
      const kept = { id: 'filter-1', name: 'props' }
      const removed = { id: 'filter-2', name: 'chars' }
      const state = {
        userFilters: { asset: { 'production-1': [kept, removed] } }
      }
      const production = { id: 'production-1' }

      store.mutations.REMOVE_ASSET_SEARCH_END(state, {
        searchQuery: { id: 'filter-9', name: 'other' },
        production
      })
      store.mutations.REMOVE_ASSET_SEARCH_END(state, {
        searchQuery: removed,
        production
      })

      expect(state.userFilters.asset['production-1']).toEqual([kept])
    })

    test('records then drops an asset filter group among the asset ones', () => {
      const group = { id: 'group-1', name: 'Mine' }
      const state = { userFilterGroups: {} }
      const production = { id: 'production-1' }

      store.mutations.SAVE_ASSET_SEARCH_FILTER_GROUP_END(state, {
        filterGroup: group,
        production
      })
      store.mutations.SAVE_ASSET_SEARCH_FILTER_GROUP_END(state, {
        filterGroup: group,
        production
      })
      expect(state.userFilterGroups).toEqual({
        asset: { 'production-1': [group] }
      })

      store.mutations.REMOVE_ASSET_SEARCH_FILTER_GROUP_END(state, {
        filterGroup: group,
        production
      })
      expect(state.userFilterGroups.asset['production-1']).toEqual([])
    })

    // A group can come before the first search of its production, while
    // another production has searches of the same list.
    test('UPDATE_USER_FILTER_GROUP updates a group of a production without searches', () => {
      const search = { id: 'filter-1', name: 'wip', is_shared: false }
      const group = { id: 'group-1', name: 'Mine', is_shared: false }
      const state = {
        userFilters: { shot: { 'production-2': [search] } },
        userFilterGroups: { shot: { 'production-1': [group] } }
      }

      store.mutations.UPDATE_USER_FILTER_GROUP(state, {
        id: 'group-1',
        name: 'Ours',
        is_shared: true
      })

      expect(group).toMatchObject({ name: 'Ours', is_shared: true })
      expect(search.is_shared).toBe(false)
    })

    // As in Zou: a search left behind would leave its group empty for those
    // the group reaches now.
    describe('UPDATE_USER_FILTER_GROUP, departments of the searches', () => {
      const buildSearch = fields => ({
        id: 'filter-1',
        is_shared: true,
        search_filter_group_id: 'group-1',
        department_id: 'animation',
        ...fields
      })
      const updateGroup = (search, fields) => {
        const group = {
          id: 'group-1',
          is_shared: true,
          department_id: 'animation'
        }
        store.mutations.UPDATE_USER_FILTER_GROUP(
          {
            userFilters: { shot: { 'production-1': [search] } },
            userFilterGroups: { shot: { 'production-1': [group] } }
          },
          { id: 'group-1', is_shared: true, ...fields }
        )
      }

      test('moves a search on the former department of its group', () => {
        const search = buildSearch()

        updateGroup(search, { department_id: 'modeling' })

        expect(search.department_id).toBe('modeling')
      })

      test('takes a search out of the department with its group', () => {
        const search = buildSearch()

        updateGroup(search, { department_id: null })

        expect(search.department_id).toBeNull()
      })

      test('leaves a search on another department', () => {
        const search = buildSearch({ department_id: 'layout' })

        updateGroup(search, { department_id: null })

        expect(search.department_id).toBe('layout')
      })

      test('leaves a search of another group', () => {
        const search = buildSearch({ search_filter_group_id: 'group-2' })

        updateGroup(search, { department_id: null })

        expect(search.department_id).toBe('animation')
      })

      test('leaves a search when the group keeps its department', () => {
        const search = buildSearch()

        updateGroup(search, { name: 'Ours' })

        expect(search.department_id).toBe('animation')
      })
    })

    // NEW_TASK_COMMENT_END no longer rebuilds cache.doneIndex. That rebuild
    // is dead only because the done list comes from its own fetch: the same
    // task sits in both lists as two distinct objects, so commenting the todo
    // one cannot make the done index stale.
    test('NEW_TASK_COMMENT_END leaves the done list and its index alone', () => {
      const statuses = {
        wip: { id: 'status-wip', name: 'Work in progress', short_name: 'wip' },
        done: { id: 'status-done', name: 'Done', short_name: 'done' },
        retake: { id: 'status-retake', name: 'Retake', short_name: 'retake' }
      }
      Object.values(statuses).forEach(status =>
        taskStatusStore.cache.taskStatusMap.set(status.id, status)
      )
      const buildTask = status => ({
        id: 'task-1',
        entity_type_name: 'Asset',
        entity_name: 'Tree',
        entity_id: 'entity-1',
        project_id: 'production-1',
        project_name: 'Big Buck Bunny',
        full_entity_name: 'Asset / Tree',
        task_type_name: 'Modeling',
        task_status_id: status.id,
        task_status_short_name: status.short_name
      })

      const doneTask = buildTask(statuses.done)
      const state = {
        todos: [buildTask(statuses.wip)],
        displayedTodos: [],
        displayedDoneTasks: []
      }
      store.mutations.USER_LOAD_DONE_TASKS_END(state, [doneTask])

      store.mutations.NEW_TASK_COMMENT_END(state, {
        taskId: 'task-1',
        comment: { id: 'comment-1', task_status_id: statuses.retake.id }
      })

      expect(state.todos[0].task_status_short_name).toEqual('retake')
      expect(doneTask.task_status_short_name).toEqual('done')
      store.mutations.SET_TODOS_SEARCH(state, 'done')
      expect(state.displayedDoneTasks).toEqual([doneTask])
    })
  })

  describe('Actions', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    describe('saveUserLocale', () => {
      const context = locale => {
        const state = { user: { id: 'person-1', locale, role: 'user' } }
        const commit = (type, form) => store.mutations[type](state, form)
        return { commit, state }
      }

      test('writes the language to the profile, and only that', async () => {
        peopleApi.updatePersonLocale.mockResolvedValue({})
        const { commit, state } = context('en_US')

        await store.actions.saveUserLocale({ commit, state }, 'fr_FR')

        expect(peopleApi.updatePersonLocale).toHaveBeenCalledExactlyOnceWith(
          'person-1',
          'fr_FR'
        )
        expect(state.user.locale).toBe('fr_FR')
      })

      // The people store updates its list through this id.
      test('names the person in the mutation', async () => {
        peopleApi.updatePersonLocale.mockResolvedValue({})
        const commit = vi.fn()
        const { state } = context('en_US')

        await store.actions.saveUserLocale({ commit, state }, 'fr_FR')

        expect(commit).toHaveBeenCalledExactlyOnceWith(
          'USER_SAVE_PROFILE_SUCCESS',
          { id: 'person-1', locale: 'fr_FR' }
        )
      })

      test('keeps the profile as it is when Zou refuses', async () => {
        const failure = new Error('Forbidden')
        peopleApi.updatePersonLocale.mockRejectedValue(failure)
        const { commit, state } = context('en_US')

        await expect(
          store.actions.saveUserLocale({ commit, state }, 'fr_FR')
        ).rejects.toBe(failure)

        expect(state.user.locale).toBe('en_US')
      })
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

    describe('unregisterFIDO', () => {
      test('sends the 2FA code, then drops the device', async () => {
        peopleApi.unregisterFIDO.mockResolvedValue({ success: true })
        const commit = vi.fn()

        await store.actions.unregisterFIDO(
          { commit },
          { deviceName: 'Yubikey', twoFactorPayload: { totp: '123456' } }
        )

        expect(peopleApi.unregisterFIDO).toHaveBeenCalledWith('Yubikey', {
          totp: '123456'
        })
        expect(commit).toHaveBeenCalledWith(
          'USER_UNREGISTER_FIDO_SUCCESS',
          'Yubikey'
        )
      })
    })

    // Zou asks for a factor already enabled before it adds a method.
    describe('2FA method setup', () => {
      const twoFactorPayload = { recovery_code: 'abcd' }
      const credential = {
        id: 'key',
        rawId: new Uint8Array([1]).buffer,
        type: 'public-key',
        response: { clientDataJSON: new Uint8Array([2]).buffer }
      }

      afterEach(() => vi.unstubAllGlobals())

      test.each([
        { action: 'enableTOTP', payload: { totp: '111111' }, sent: ['111111'] },
        {
          action: 'enableEmailOTP',
          payload: { otp: '222222' },
          sent: ['222222']
        },
        {
          action: 'registerFIDO',
          payload: { registrationResponse: credential, deviceName: 'Yubikey' },
          sent: [expect.objectContaining({ id: 'key' }), 'Yubikey']
        }
      ])(
        '$action sends the code of an enabled factor',
        async ({ action, payload, sent }) => {
          // The credential of a FIDO device is encoded with window.btoa.
          vi.stubGlobal('window', globalThis)
          peopleApi[action].mockResolvedValue(['recovery'])

          await store.actions[action](
            { commit: vi.fn() },
            { ...payload, twoFactorPayload }
          )

          expect(peopleApi[action]).toHaveBeenCalledWith(
            ...sent,
            twoFactorPayload
          )
        }
      )
    })

    // Zou asks for the current password to change one's own email.
    describe('saveProfile', () => {
      const context = () => ({
        commit: vi.fn(),
        state: { user: { id: 'person-1' } }
      })

      test('sends the password and the 2FA code with a new email', async () => {
        peopleApi.updatePerson.mockResolvedValue({})
        const form = { email: 'new@example.com' }

        await store.actions.saveProfile(context(), {
          form,
          currentPassword: 'secret',
          twoFactorPayload: { totp: '123456' }
        })

        expect(peopleApi.updatePerson).toHaveBeenCalledWith(form, {
          current_password: 'secret',
          totp: '123456'
        })
      })

      test('sends no credentials with the rest of the profile', async () => {
        peopleApi.updatePerson.mockResolvedValue({})
        const form = { phone: '0102030405' }

        await store.actions.saveProfile(context(), { form })

        expect(peopleApi.updatePerson).toHaveBeenCalledWith(form, undefined)
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
