// @vitest-environment node

import { vi } from 'vitest'
import { computed, effectScope } from 'vue'
import { createStore } from 'vuex'

// Importing the people module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

vi.mock('@/store/api/people', () => ({
  default: {
    deleteOrganisationLogo: vi.fn(),
    deletePerson: vi.fn(),
    disableTwoFactorAuthenticationPerson: vi.fn(),
    getDaysOff: vi.fn(),
    getDayTable: vi.fn(),
    getMonthTable: vi.fn(),
    getPersonQuotaShots: vi.fn(),
    getPersonTasks: vi.fn(),
    getTimeSpents: vi.fn(),
    getWeekTable: vi.fn(),
    getYearTable: vi.fn(),
    postOrganisationLogo: vi.fn(),
    setTimeSpent: vi.fn()
  }
}))

import store from '@/store/modules/people'
import taskStatusStore from '@/store/modules/taskstatus'
import peopleApi from '@/store/api/people'
import { buildTaskIndex } from '@/lib/indexing'

describe('People store', () => {
  describe('Mutations', () => {
    let state

    beforeEach(() => {
      store.cache.people = [
        { id: 'person-1', name: 'John Doe', email: 'john.doe@example.com' },
        { id: 'person-2', name: 'Jane Roe', email: 'jane.roe@example.com' }
      ]
      store.cache.peopleIndex = {}
      store.cache.personMap = new Map()
      store.cache.guests = []
      state = {
        displayedPeople: [],
        guests: [],
        peopleSearchText: '',
        personMapVersion: 0
      }
    })

    // A filter-only search (e.g. `department=animation`) reduces to zero
    // keywords, so indexSearch returns null. The mutation must fall back to
    // the full list rather than leave displayedPeople null.
    test('DELETE_PEOPLE_END keeps displayedPeople an array with a filter search', () => {
      state.peopleSearchText = 'department=animation'
      store.mutations.DELETE_PEOPLE_END(state)
      expect(Array.isArray(state.displayedPeople)).toBe(true)
      expect(state.displayedPeople).toEqual(store.cache.people)
    })

    test('EDIT_PEOPLE_END keeps displayedPeople an array with a filter search', () => {
      state.peopleSearchText = 'department=animation'
      store.mutations.EDIT_PEOPLE_END(state, {
        id: 'person-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com'
      })
      expect(Array.isArray(state.displayedPeople)).toBe(true)
      expect(state.displayedPeople).toEqual(store.cache.people)
    })

    // Person.vue's unmount reset commits no personId; state.person must fall
    // back to an object so a later SET_TIME_SPENT can read .id safely.
    test('LOAD_PERSON_TASKS_END keeps person an object when personId is absent', () => {
      state.personTasksSearchText = ''
      store.mutations.LOAD_PERSON_TASKS_END(state, {
        tasks: [],
        userFilters: {},
        taskTypeMap: new Map()
      })
      expect(state.person).toEqual({})
    })

    // A My Tasks timesheet save landing after the person page unmount must
    // skip the person-page cache without throwing.
    test('SET_TIME_SPENT skips the person cache when no person is displayed', () => {
      state.person = undefined
      state.personTimeSpentMap = { 'task-9': { duration: 60 } }
      store.mutations.SET_TIME_SPENT(state, {
        task_id: 'task-1',
        person_id: 'person-1',
        duration: 120
      })
      expect(state.personTimeSpentMap['task-1']).toBeUndefined()
      expect(state.personTimeSpentTotal).toEqual(1)
    })

    test('SET_TIME_SPENT stores the entry for the displayed person', () => {
      state.person = { id: 'person-1' }
      state.personTimeSpentKey = 'person-1/2026-11-02'
      state.personTimeSpentMap = {}
      store.mutations.SET_TIME_SPENT(state, {
        task_id: 'task-1',
        person_id: 'person-1',
        date: '2026-11-02',
        duration: 120
      })
      expect(state.personTimeSpentMap['task-1'].duration).toEqual(120)
      expect(state.personTimeSpentTotal).toEqual(2)
    })

    // A save answered once the timesheet shows another day belongs to the
    // day left.
    test('SET_TIME_SPENT leaves out the time of another day or person', () => {
      state.person = { id: 'person-1' }
      state.personTimeSpentKey = 'person-1/2026-11-03'
      state.personTimeSpentMap = {}
      const save = (personId, date) =>
        store.mutations.SET_TIME_SPENT(state, {
          task_id: 'task-1',
          person_id: personId,
          date,
          duration: 120
        })

      save('person-1', '2026-11-02')
      save('person-2', '2026-11-03')

      expect(state.personTimeSpentMap).toEqual({})
      expect(state.personTimeSpentTotal).toEqual(0)

      save('person-1', '2026-11-03')

      expect(state.personTimeSpentMap['task-1'].duration).toEqual(120)
      expect(state.personTimeSpentTotal).toEqual(2)
    })

    test('PERSON_LOAD_TIME_SPENTS_END keeps the person and day of the time spents', () => {
      store.mutations.PERSON_LOAD_TIME_SPENTS_END(state, {
        personId: 'person-1',
        date: '2026-11-02',
        timeSpents: [{ task_id: 'task-1', duration: 90 }]
      })
      expect(state.personTimeSpentKey).toBe('person-1/2026-11-02')
      expect(state.personTimeSpentMap).toEqual({
        'task-1': { task_id: 'task-1', duration: 90 }
      })
      expect(state.personTimeSpentTotal).toBe(1.5)
    })

    // The key names the time spents held: a list that cannot be read changes
    // neither.
    test('PERSON_LOAD_TIME_SPENTS_END keeps the key held on an answer with no list', () => {
      store.mutations.PERSON_LOAD_TIME_SPENTS_END(state, {
        personId: 'person-1',
        date: '2026-11-02',
        timeSpents: [{ task_id: 'task-1', duration: 90 }]
      })

      expect(() =>
        store.mutations.PERSON_LOAD_TIME_SPENTS_END(state, {
          personId: 'person-1',
          date: '2026-11-03',
          timeSpents: null
        })
      ).toThrow()

      expect(state.personTimeSpentKey).toBe('person-1/2026-11-02')
      expect(state.personTimeSpentTotal).toBe(1.5)
    })

    // The done tasks of the person page never reach the tasks module map,
    // unlike the todo ones registered on LOAD_PERSON_TASKS_END.
    test('SET_PREVIEW refreshes the person done list', () => {
      const done = { id: 'task-1', entity_id: 'entity-1' }
      const other = { id: 'task-2', entity_id: 'entity-2' }
      state.displayedPersonDoneTasks = [done, other]

      store.mutations.SET_PREVIEW(state, {
        entityId: 'entity-1',
        previewId: 'preview-1'
      })

      expect(done.entity_preview_file_id).toEqual('preview-1')
      expect(other.entity_preview_file_id).toBeUndefined()
    })

    // Same reason: a done task moved on the person schedule gets its dates
    // here, its metadata merged as the tasks module does.
    test('EDIT_TASK_DATES moves a task of the person done list', () => {
      const done = {
        id: 'task-1',
        start_date: '2026-08-03',
        due_date: '2026-08-05',
        data: { mood: 'calm' }
      }
      const other = { id: 'task-2', start_date: '2026-08-03' }
      state.displayedPersonDoneTasks = [done, other]

      store.mutations.EDIT_TASK_DATES(state, {
        taskId: 'task-1',
        data: {
          start_date: '2026-08-10',
          due_date: '2026-08-12',
          data: { note: 'moved' }
        }
      })

      expect(done).toEqual({
        id: 'task-1',
        start_date: '2026-08-10',
        due_date: '2026-08-12',
        data: { mood: 'calm', note: 'moved' }
      })
      expect(other.start_date).toEqual('2026-08-03')
    })

    // NEW_TASK_COMMENT_END no longer rebuilds personDoneTasksIndex. That
    // rebuild is dead only because the done list comes from its own fetch:
    // the same task sits in both lists as two distinct objects, so commenting
    // the todo one cannot make the done index stale.
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
        full_entity_name: 'Asset / Tree',
        project_name: 'Big Buck Bunny',
        task_type_name: 'Modeling',
        task_status_id: status.id,
        task_status_short_name: status.short_name
      })

      const doneTask = buildTask(statuses.done)
      store.cache.personDoneTasks = [doneTask]
      store.cache.personDoneTasksIndex = buildTaskIndex([doneTask])
      state.personTasks = [buildTask(statuses.wip)]
      state.displayedPersonTasks = []
      state.displayedPersonDoneTasks = []

      store.mutations.NEW_TASK_COMMENT_END(state, {
        taskId: 'task-1',
        comment: { id: 'comment-1', task_status_id: statuses.retake.id }
      })

      expect(state.personTasks[0].task_status_short_name).toEqual('retake')
      expect(doneTask.task_status_short_name).toEqual('done')
      store.mutations.SET_PERSON_TASKS_SEARCH(state, 'done')
      expect(state.displayedPersonDoneTasks).toEqual([doneTask])
    })
  })

  // Vuex keeps a getter's value until one of its reactive reads changes, and
  // the people list lives out of the state: a mutation-only test cannot see
  // a getter stuck on its first read.
  describe('List getters', () => {
    const person = (id, extra = {}) => ({
      id,
      first_name: id,
      last_name: 'Doe',
      email: `${id}@example.com`,
      active: true,
      is_bot: false,
      ...extra
    })

    let vuexStore
    let scope

    beforeEach(() => {
      store.cache.people = []
      store.cache.peopleIndex = {}
      store.cache.personMap = new Map()
      store.cache.guests = []
      vuexStore = createStore({
        state: { ...store.state },
        getters: store.getters,
        mutations: store.mutations
      })
      vuexStore.commit('LOAD_PEOPLE_END', {
        people: [
          person('alice'),
          person('bob'),
          person('robot', { is_bot: true })
        ],
        userFilters: {}
      })
      scope = effectScope()
    })

    afterEach(() => {
      scope.stop()
    })

    // The Team page offers the active people out of the team: a person
    // created on the People page after a first visit has to be offered too.
    test('activePeople follows a person created after a first read', () => {
      scope.run(() => {
        const team = ['alice']
        const activePeople = computed(() => vuexStore.getters.activePeople)
        const unlisted = computed(() =>
          activePeople.value
            .filter(({ id }) => !team.includes(id))
            .map(({ id }) => id)
        )
        expect(unlisted.value).toEqual(['bob', 'robot'])

        vuexStore.commit('EDIT_PEOPLE_END', person('carol'))

        expect(unlisted.value).toEqual(['bob', 'carol', 'robot'])
      })
    })

    test('the list getters follow a creation, an archive, a deletion, and a reload', () => {
      scope.run(() => {
        const ids = getter =>
          computed(() => vuexStore.getters[getter].map(({ id }) => id))
        const people = ids('people')
        const peopleWithoutBot = ids('peopleWithoutBot')
        const activePeople = ids('activePeople')
        const activePeopleWithoutBot = ids('activePeopleWithoutBot')
        expect(people.value).toEqual(['alice', 'bob', 'robot'])
        expect(peopleWithoutBot.value).toEqual(['alice', 'bob'])
        expect(activePeople.value).toEqual(['alice', 'bob', 'robot'])
        expect(activePeopleWithoutBot.value).toEqual(['alice', 'bob'])

        vuexStore.commit('EDIT_PEOPLE_END', person('carol'))
        expect(people.value).toEqual(['alice', 'bob', 'carol', 'robot'])
        expect(peopleWithoutBot.value).toEqual(['alice', 'bob', 'carol'])
        expect(activePeopleWithoutBot.value).toEqual(['alice', 'bob', 'carol'])

        vuexStore.commit('EDIT_PEOPLE_END', person('bob', { active: false }))
        expect(people.value).toEqual(['alice', 'carol', 'robot', 'bob'])
        expect(activePeople.value).toEqual(['alice', 'carol', 'robot'])
        expect(activePeopleWithoutBot.value).toEqual(['alice', 'carol'])

        vuexStore.commit('DELETE_PEOPLE_END', person('carol'))
        expect(people.value).toEqual(['alice', 'robot', 'bob'])
        expect(peopleWithoutBot.value).toEqual(['alice', 'bob'])
        expect(activePeopleWithoutBot.value).toEqual(['alice'])

        vuexStore.commit('LOAD_PEOPLE_END', {
          people: [person('alice'), person('dan')],
          userFilters: {}
        })
        expect(people.value).toEqual(['alice', 'dan'])
        expect(activePeople.value).toEqual(['alice', 'dan'])
      })
    })

    // The People, Bots and Team Schedule pages list the displayed people.
    test('displayedPeople follows a deletion', () => {
      scope.run(() => {
        const displayedPeople = computed(() =>
          vuexStore.getters.displayedPeople.map(({ id }) => id)
        )
        expect(displayedPeople.value).toEqual(['alice', 'bob', 'robot'])

        vuexStore.commit('DELETE_PEOPLE_END', person('bob'))

        expect(displayedPeople.value).toEqual(['alice', 'robot'])
      })
    })

    // The person cells of the lists look their person up.
    test('getPerson follows a rename, the guests, and a deletion', () => {
      scope.run(() => {
        const name = id => computed(() => vuexStore.getters.getPerson(id)?.name)
        const bob = name('bob')
        const guest = name('guest')
        expect(bob.value).toBe('bob Doe')
        expect(guest.value).toBeUndefined()

        vuexStore.commit(
          'EDIT_PEOPLE_END',
          person('bob', { first_name: 'Robert' })
        )
        expect(bob.value).toBe('Robert Doe')

        vuexStore.commit('LOAD_GUESTS_END', {
          guests: [person('guest', { is_guest: true })]
        })
        expect(guest.value).toBe('guest Doe')
        vuexStore.commit(
          'EDIT_PEOPLE_END',
          person('guest', { first_name: 'Gwen', is_guest: true })
        )
        expect(guest.value).toBe('Gwen Doe')

        vuexStore.commit('DELETE_PEOPLE_END', person('bob'))
        expect(bob.value).toBeUndefined()
      })
    })

    // The People and Bots pages delete through this action: the person leaves
    // the lists without waiting for the server to send the deletion back.
    test('deletePeople takes the person out of the lists at once', async () => {
      peopleApi.deletePerson.mockResolvedValue({})
      const { bob, displayedPeople, people } = scope.run(() => ({
        bob: computed(() => vuexStore.getters.getPerson('bob')?.name),
        displayedPeople: computed(() =>
          vuexStore.getters.displayedPeople.map(({ id }) => id)
        ),
        people: computed(() => vuexStore.getters.people.map(({ id }) => id))
      }))
      expect(bob.value).toBe('bob Doe')

      await store.actions.deletePeople(
        { commit: vuexStore.commit },
        person('bob')
      )

      expect(peopleApi.deletePerson).toHaveBeenCalledWith(person('bob'))
      expect(people.value).toEqual(['alice', 'robot'])
      expect(displayedPeople.value).toEqual(['alice', 'robot'])
      expect(bob.value).toBeUndefined()
    })

    // The People page lists copies of the displayed people: the row has to
    // drop its 2FA tag once the password modal closes. The person lookups
    // follow too.
    test('disableTwoFactorAuthenticationPerson turns the 2FA off in the displayed people', async () => {
      peopleApi.disableTwoFactorAuthenticationPerson.mockResolvedValue({})
      vuexStore.commit('LOAD_PEOPLE_END', {
        people: [
          person('alice'),
          person('bob', {
            totp_enabled: true,
            preferred_two_factor_authentication: 'totp'
          })
        ],
        userFilters: {}
      })
      const { row, lookup } = scope.run(() => ({
        row: computed(() => ({
          ...vuexStore.getters.displayedPeople.find(({ id }) => id === 'bob')
        })),
        lookup: computed(() => vuexStore.getters.getPerson('bob').totp_enabled)
      }))
      expect(row.value.totp_enabled).toBe(true)
      expect(lookup.value).toBe(true)

      await store.actions.disableTwoFactorAuthenticationPerson(
        { commit: vuexStore.commit },
        row.value
      )

      expect(
        peopleApi.disableTwoFactorAuthenticationPerson
      ).toHaveBeenCalledWith(expect.objectContaining({ id: 'bob' }))
      expect(row.value).toMatchObject({
        totp_enabled: false,
        preferred_two_factor_authentication: null
      })
      expect(lookup.value).toBe(false)
    })

    // Unlike an edit, the page does not search again once the modal closes.
    test('disableTwoFactorAuthenticationPerson keeps the people of a filtered search', async () => {
      peopleApi.disableTwoFactorAuthenticationPerson.mockResolvedValue({})
      vuexStore.commit('LOAD_PEOPLE_END', {
        people: [
          person('alice', { departments: ['d-model'] }),
          person('bob', { departments: ['d-anim'], totp_enabled: true }),
          person('carl', { departments: ['d-anim'] })
        ],
        userFilters: {}
      })
      vuexStore.commit('PEOPLE_SEARCH_CHANGE', {
        peopleSearch: 'department=Animation',
        persons: vuexStore.getters.people,
        departments: [
          { id: 'd-anim', name: 'Animation' },
          { id: 'd-model', name: 'Modeling' }
        ]
      })
      const { displayed, row } = scope.run(() => ({
        displayed: computed(() =>
          vuexStore.getters.displayedPeople.map(({ id }) => id)
        ),
        row: computed(() => ({
          ...vuexStore.getters.displayedPeople.find(({ id }) => id === 'bob')
        }))
      }))
      expect(displayed.value).toEqual(['bob', 'carl'])
      expect(row.value.totp_enabled).toBe(true)

      await store.actions.disableTwoFactorAuthenticationPerson(
        { commit: vuexStore.commit },
        person('bob')
      )

      expect(displayed.value).toEqual(['bob', 'carl'])
      expect(row.value.totp_enabled).toBe(false)
    })

    // The browser's Back button can bring a search that hides the person
    // while the modal is open: the row shows the change once listed again.
    test('disableTwoFactorAuthenticationPerson turns the 2FA off for a person the search hides', async () => {
      peopleApi.disableTwoFactorAuthenticationPerson.mockResolvedValue({})
      vuexStore.commit('LOAD_PEOPLE_END', {
        people: [person('alice'), person('bob', { totp_enabled: true })],
        userFilters: {}
      })
      const search = peopleSearch =>
        vuexStore.commit('PEOPLE_SEARCH_CHANGE', {
          peopleSearch,
          persons: vuexStore.getters.people,
          departments: []
        })
      const row = scope.run(() =>
        computed(() => ({
          ...vuexStore.getters.displayedPeople.find(({ id }) => id === 'bob')
        }))
      )
      search('alice')
      expect(row.value.id).toBeUndefined()

      await store.actions.disableTwoFactorAuthenticationPerson(
        { commit: vuexStore.commit },
        person('bob')
      )
      search('')

      expect(row.value).toMatchObject({ id: 'bob', totp_enabled: false })
    })

    // Zou disabled the 2FA: a person missing from the loaded people is no
    // reason to show an error.
    test('disableTwoFactorAuthenticationPerson resolves for a person out of the loaded people', async () => {
      peopleApi.disableTwoFactorAuthenticationPerson.mockResolvedValue({})

      await expect(
        store.actions.disableTwoFactorAuthenticationPerson(
          { commit: vuexStore.commit },
          person('gone')
        )
      ).resolves.toBeUndefined()
    })

    // The People page lists the guests in their own tabs, where an archived
    // guest can be deleted.
    test('deletePeople takes a deleted guest out of the guests', async () => {
      peopleApi.deletePerson.mockResolvedValue({})
      const guest = id => person(id, { is_guest: true })
      vuexStore.commit('LOAD_GUESTS_END', {
        guests: [guest('gina'), guest('gus')]
      })
      const guests = scope.run(() =>
        computed(() => vuexStore.getters.guests.map(({ id }) => id))
      )
      expect(guests.value).toEqual(['gina', 'gus'])

      await store.actions.deletePeople(
        { commit: vuexStore.commit },
        guest('gina')
      )

      expect(guests.value).toEqual(['gus'])
      expect(vuexStore.getters.getPerson('gina')).toBeUndefined()
    })
  })

  describe('Organisation logo', () => {
    const stateWith = organisation => ({ organisation })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    const updatedAt = '2026-09-08T10:00:00'

    test('organisationLogoPath is null while there is no logo', () => {
      expect(
        store.getters.organisationLogoPath(
          stateWith({ id: 'org-1', has_avatar: false })
        )
      ).toBeNull()
    })

    // The topbar keeps the same <img> src across an upload, so without a fresh
    // token the browser serves the logo it already has in cache. The upload
    // stamps the store without reloading the organisation, so the timestamp
    // has to win over the update date it has not caught up with yet.
    test('organisationLogoPath carries the logo timestamp when there is one', () => {
      expect(
        store.getters.organisationLogoPath(
          stateWith({
            id: 'org-1',
            has_avatar: true,
            logoTimestamp: 1234,
            updated_at: updatedAt
          })
        )
      ).toEqual('/api/pictures/thumbnails/organisations/org-1.png?t=1234')
    })

    // The logo timestamp only lives in memory, so after a reload the update
    // date is the only thing left to bust the week-long browser cache the API
    // asks for.
    test('organisationLogoPath survives a reload without a logo timestamp', () => {
      expect(
        store.getters.organisationLogoPath(
          stateWith({
            id: 'org-1',
            has_avatar: true,
            created_at: '2026-01-01T08:00:00',
            updated_at: updatedAt
          })
        )
      ).toEqual(
        `/api/pictures/thumbnails/organisations/org-1.png?t=${Date.parse(updatedAt)}`
      )
    })

    test('organisationLogoPath falls back to the creation date', () => {
      const createdAt = '2026-01-01T08:00:00'
      expect(
        store.getters.organisationLogoPath(
          stateWith({ id: 'org-1', has_avatar: true, created_at: createdAt })
        )
      ).toEqual(
        `/api/pictures/thumbnails/organisations/org-1.png?t=${Date.parse(createdAt)}`
      )
    })

    test('uploadOrganisationLogo stamps the organisation', async () => {
      vi.spyOn(Date, 'now').mockReturnValue(1234)
      const commit = vi.fn()

      await store.actions.uploadOrganisationLogo(
        { commit, state: stateWith({ id: 'org-1' }) },
        'form-data'
      )

      expect(peopleApi.postOrganisationLogo).toHaveBeenCalledWith(
        'org-1',
        'form-data'
      )
      expect(commit).toHaveBeenCalledWith('SET_ORGANISATION', {
        has_avatar: true,
        logoTimestamp: 1234
      })
    })

    test('deleteOrganisationLogo stamps the organisation too', async () => {
      vi.spyOn(Date, 'now').mockReturnValue(5678)
      const commit = vi.fn()

      await store.actions.deleteOrganisationLogo({
        commit,
        state: stateWith({ id: 'org-1' })
      })

      expect(commit).toHaveBeenCalledWith('SET_ORGANISATION', {
        has_avatar: false,
        logoTimestamp: 5678
      })
    })
  })
})

describe('People store loadDaysOff action', () => {
  // The studio-wide listing stays admin-only on Zou: the action reads the
  // scoped month route once per month of the window.
  test('reads every month of the window and merges the days off', async () => {
    const spanning = { id: 'off-2', date: '2026-09-28', end_date: '2026-10-02' }
    peopleApi.getDaysOff.mockImplementation((year, month) =>
      Promise.resolve(
        {
          '08': [{ id: 'off-1', date: '2026-08-12', end_date: '2026-08-12' }],
          '09': [spanning],
          10: [spanning, { id: 'off-3', date: '2026-10-20', end_date: '2026-10-21' }]
        }[month] || []
      )
    )
    const commit = vi.fn()

    await store.actions.loadDaysOff(
      { commit },
      { startDate: '2026-08-20', endDate: '2026-10-03' }
    )

    expect(peopleApi.getDaysOff.mock.calls).toEqual([
      [2026, '08'],
      [2026, '09'],
      [2026, '10']
    ])
    expect(commit).toHaveBeenCalledWith('PEOPLE_SET_DAYS_OFF', [
      { id: 'off-1', date: '2026-08-12', end_date: '2026-08-12' },
      spanning,
      { id: 'off-3', date: '2026-10-20', end_date: '2026-10-21' }
    ])
  })

  test('keeps the months that answered when one fails', async () => {
    const error = new Error('500')
    const dayOff = month => ({
      id: `off-${month}`,
      date: `2026-${month}-12`,
      end_date: `2026-${month}-12`
    })
    peopleApi.getDaysOff.mockImplementation((year, month) =>
      month === '09' ? Promise.reject(error) : Promise.resolve([dayOff(month)])
    )
    const commit = vi.fn()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    await store.actions.loadDaysOff(
      { commit },
      { startDate: '2026-08-20', endDate: '2026-10-03' }
    )

    expect(commit).toHaveBeenCalledWith('PEOPLE_SET_DAYS_OFF', [
      dayOff('08'),
      dayOff('10')
    ])
    expect(consoleError).toHaveBeenCalledWith(error)
    consoleError.mockRestore()
  })

  test('rejects when every month fails', async () => {
    peopleApi.getDaysOff.mockRejectedValue(new Error('403'))
    const commit = vi.fn()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      store.actions.loadDaysOff(
        { commit },
        { startDate: '2026-08-20', endDate: '2026-10-03' }
      )
    ).rejects.toThrow('403')
    expect(commit).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledTimes(3)
    consoleError.mockRestore()
  })
})

describe('People store loadPersonTasks action', () => {
  const rootGetters = { taskTypeMap: new Map(), userFilters: {} }

  beforeEach(() => {
    peopleApi.getPersonTasks.mockResolvedValue([])
    peopleApi.getTimeSpents.mockClear()
    peopleApi.getTimeSpents.mockResolvedValue([])
  })

  test('reads the time spents of the day along with the tasks', async () => {
    const timeSpent = { id: 'time-1', task_id: 'task-1', duration: 60 }
    peopleApi.getTimeSpents.mockResolvedValue([timeSpent])
    const commit = vi.fn()

    await store.actions.loadPersonTasks(
      { commit, rootGetters },
      { personId: 'person-1', date: '2026-11-02', withTimeSpents: true }
    )

    expect(peopleApi.getTimeSpents).toHaveBeenCalledWith(
      'person-1',
      '2026-11-02'
    )
    expect(commit).toHaveBeenCalledWith('PERSON_LOAD_TIME_SPENTS_END', {
      personId: 'person-1',
      date: '2026-11-02',
      timeSpents: [timeSpent]
    })
  })

  test('leaves the time spents out when not asked', async () => {
    const commit = vi.fn()

    await store.actions.loadPersonTasks(
      { commit, rootGetters },
      { personId: 'person-1', date: '2026-11-02', withTimeSpents: false }
    )

    expect(peopleApi.getTimeSpents).not.toHaveBeenCalled()
    expect(commit).toHaveBeenCalledWith('PERSON_LOAD_TIME_SPENTS_END', {
      personId: 'person-1',
      date: '2026-11-02',
      timeSpents: []
    })
  })
})

// The timesheet steps from a day to the next faster than Zou answers
describe('People store time spents of a day left since', () => {
  const rootGetters = { taskTypeMap: new Map(), userFilters: {} }
  const deferred = () => {
    const handlers = {}
    const promise = new Promise(resolve => {
      handlers.resolve = resolve
    })
    return { promise, ...handlers }
  }
  const firstTime = { task_id: 'task-1', duration: 60 }
  const secondTime = { task_id: 'task-2', duration: 120 }
  const timeSpentCommits = commit =>
    commit.mock.calls.filter(([type]) => type === 'PERSON_LOAD_TIME_SPENTS_END')

  beforeEach(() => {
    peopleApi.getPersonTasks.mockResolvedValue([])
    peopleApi.getTimeSpents.mockReset()
  })

  test('keeps the time spents of the day asked last', async () => {
    const firstDay = deferred()
    peopleApi.getTimeSpents
      .mockReturnValueOnce(firstDay.promise)
      .mockResolvedValueOnce([secondTime])
    const commit = vi.fn()

    const firstLoad = store.actions.loadPersonTimeSpents(
      { commit },
      { personId: 'person-1', date: '2026-11-02' }
    )
    await store.actions.loadPersonTimeSpents(
      { commit },
      { personId: 'person-1', date: '2026-11-03' }
    )
    firstDay.resolve([firstTime])
    await firstLoad

    expect(timeSpentCommits(commit)).toEqual([
      [
        'PERSON_LOAD_TIME_SPENTS_END',
        { personId: 'person-1', date: '2026-11-03', timeSpents: [secondTime] }
      ]
    ])
  })

  test('keeps the time spents of the person shown next', async () => {
    const firstPerson = deferred()
    peopleApi.getTimeSpents
      .mockReturnValueOnce(firstPerson.promise)
      .mockResolvedValueOnce([secondTime])
    const commit = vi.fn()

    const firstLoad = store.actions.loadPersonTimeSpents(
      { commit },
      { personId: 'person-1', date: '2026-11-02' }
    )
    await store.actions.loadPersonTasks(
      { commit, rootGetters },
      { personId: 'person-2', date: '2026-11-02', withTimeSpents: true }
    )
    firstPerson.resolve([firstTime])
    await firstLoad

    expect(timeSpentCommits(commit)).toEqual([
      [
        'PERSON_LOAD_TIME_SPENTS_END',
        { personId: 'person-2', date: '2026-11-02', timeSpents: [secondTime] }
      ]
    ])
  })

  test('keeps the time spents of a day picked during the task load', async () => {
    const tasks = deferred()
    peopleApi.getPersonTasks.mockReturnValueOnce(tasks.promise)
    peopleApi.getTimeSpents.mockImplementation(async (personId, date) =>
      date === '2026-11-02' ? [firstTime] : [secondTime]
    )
    const commit = vi.fn()

    const taskLoad = store.actions.loadPersonTasks(
      { commit, rootGetters },
      { personId: 'person-1', date: '2026-11-02', withTimeSpents: true }
    )
    await store.actions.loadPersonTimeSpents(
      { commit },
      { personId: 'person-1', date: '2026-11-03' }
    )
    tasks.resolve([{ id: 'task-1' }])
    await taskLoad

    expect(commit).toHaveBeenCalledWith('LOAD_PERSON_TASKS_END', {
      personId: 'person-1',
      tasks: [{ id: 'task-1' }],
      userFilters: {},
      taskTypeMap: new Map()
    })
    expect(timeSpentCommits(commit)).toEqual([
      [
        'PERSON_LOAD_TIME_SPENTS_END',
        { personId: 'person-1', date: '2026-11-03', timeSpents: [secondTime] }
      ]
    ])
  })

  // pget answers null to a 2xx without a JSON body, as loadUserTimeSpents
  // expects
  test('reads no time spent from an answer with no list', async () => {
    peopleApi.getTimeSpents.mockResolvedValueOnce(null)
    const commit = vi.fn()

    await store.actions.loadPersonTimeSpents(
      { commit },
      { personId: 'person-1', date: '2026-11-03' }
    )

    expect(timeSpentCommits(commit)).toEqual([
      [
        'PERSON_LOAD_TIME_SPENTS_END',
        { personId: 'person-1', date: '2026-11-03', timeSpents: [] }
      ]
    ])
  })
})

describe('People store setTimeSpent action', () => {
  const deferred = () => {
    const handlers = {}
    const promise = new Promise((resolve, reject) => {
      handlers.resolve = resolve
      handlers.reject = reject
    })
    return { promise, ...handlers }
  }

  const settle = () => new Promise(resolve => setTimeout(resolve))

  const setTimeSpent = (commit, taskId, duration) =>
    store.actions.setTimeSpent(
      { commit },
      { personId: 'person-1', taskId, date: '2026-09-29', duration }
    )

  beforeEach(() => {
    peopleApi.setTimeSpent.mockReset()
  })

  // The sliders save on every wheel notch: concurrent writes of one day could
  // land out of order, and Zou answers 404 to a write whose row a concurrent
  // delete removed.
  test('sends one write at a time, with the last value set meanwhile', async () => {
    const first = deferred()
    const second = deferred()
    peopleApi.setTimeSpent
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const commit = vi.fn()

    const writes = [setTimeSpent(commit, 'task-1', 1)]
    await settle()
    writes.push(
      setTimeSpent(commit, 'task-1', 0.5),
      setTimeSpent(commit, 'task-1', 0)
    )
    await settle()

    expect(peopleApi.setTimeSpent.mock.calls).toEqual([
      ['task-1', 'person-1', '2026-09-29', 1]
    ])

    first.resolve({ task_id: 'task-1', duration: 60 })
    await settle()

    expect(peopleApi.setTimeSpent.mock.calls).toEqual([
      ['task-1', 'person-1', '2026-09-29', 1],
      ['task-1', 'person-1', '2026-09-29', 0]
    ])

    second.resolve({ task_id: 'task-1', duration: 0 })
    await Promise.all(writes)

    expect(commit.mock.calls).toEqual([
      ['SET_TIME_SPENT', { task_id: 'task-1', duration: 60 }],
      ['SET_TIME_SPENT', { task_id: 'task-1', duration: 0 }]
    ])
  })

  test('sends the next value after a failed write', async () => {
    const failure = deferred()
    const error = new Error('404')
    peopleApi.setTimeSpent
      .mockReturnValueOnce(failure.promise)
      .mockResolvedValueOnce({ task_id: 'task-2', duration: 30 })
    const commit = vi.fn()

    const failed = setTimeSpent(commit, 'task-2', 1)
    await settle()
    const next = setTimeSpent(commit, 'task-2', 0.5)
    failure.reject(error)

    await expect(failed).rejects.toBe(error)
    await next
    expect(peopleApi.setTimeSpent).toHaveBeenLastCalledWith(
      'task-2',
      'person-1',
      '2026-09-29',
      0.5
    )
    expect(commit.mock.calls).toEqual([
      ['SET_TIME_SPENT', { task_id: 'task-2', duration: 30 }]
    ])
  })

  test('writes the time of two tasks at the same time', async () => {
    const first = deferred()
    const second = deferred()
    peopleApi.setTimeSpent
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const commit = vi.fn()

    const writes = [
      setTimeSpent(commit, 'task-3', 1),
      setTimeSpent(commit, 'task-4', 2)
    ]
    await settle()

    expect(peopleApi.setTimeSpent.mock.calls).toEqual([
      ['task-3', 'person-1', '2026-09-29', 1],
      ['task-4', 'person-1', '2026-09-29', 2]
    ])

    first.resolve({ task_id: 'task-3', duration: 60 })
    second.resolve({ task_id: 'task-4', duration: 120 })
    await Promise.all(writes)
  })
})

describe('People store loadTimesheets action', () => {
  const table = { 3: { 'person-1': 120 } }
  const load = (detailLevel, getters = {}) => {
    const commit = vi.fn()
    const context = { commit, getters: { firstTimesheetYear: 2024, ...getters } }
    const payload = { detailLevel, year: 2026, month: 3 }
    return store.actions.loadTimesheets(context, payload).then(() => commit)
  }

  beforeEach(() => {
    peopleApi.getDaysOff.mockReset()
    peopleApi.getMonthTable.mockResolvedValue(table)
    peopleApi.getYearTable.mockResolvedValue(table)
  })

  // The studio-wide day off listing is admin-only on Zou: the year route is
  // scoped to the persons the caller may read.
  test('reads the days off of the year at the month level', async () => {
    peopleApi.getDaysOff.mockResolvedValue([])

    await load('month')

    expect(peopleApi.getDaysOff.mock.calls).toEqual([[2026]])
  })

  test('reads the days off of every column year at the year level', async () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-10-01'))
    peopleApi.getDaysOff.mockResolvedValue([])

    await load('year')

    expect(peopleApi.getDaysOff.mock.calls).toEqual([[2024], [2025], [2026]])
    vi.useRealTimers()
  })

  // The days off only tint the overtime cells: the grid stands without them.
  test('shows the grid when the days off are refused', async () => {
    const error = new Error('403')
    peopleApi.getDaysOff.mockRejectedValue(error)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const commit = await load('month')

    expect(commit).toHaveBeenCalledWith('PEOPLE_TIMESHEET_LOADED', table)
    expect(commit).toHaveBeenCalledWith('PEOPLE_SET_DAY_OFFS', [])
    expect(consoleError).toHaveBeenCalledWith(error)
    consoleError.mockRestore()
  })
})

describe('People store getPersonQuotaShots action', () => {
  test('forwards the production of the payload', () => {
    store.actions.getPersonQuotaShots(
      {},
      {
        productionId: 'p1',
        taskTypeId: 'tt1',
        detailLevel: 'month',
        personId: 'u1',
        year: 2026,
        month: 10,
        computeMode: 'raw'
      }
    )
    expect(peopleApi.getPersonQuotaShots).toHaveBeenCalledWith(
      'p1',
      'tt1',
      'u1',
      'month',
      2026,
      10,
      undefined,
      undefined,
      'raw'
    )
  })
})
