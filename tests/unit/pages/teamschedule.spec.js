import { nextTick } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import TeamSchedule from '@/components/pages/TeamSchedule.vue'

const ScheduleStub = {
  template: '<div />',
  props: ['assignRule'],
  methods: {
    scrollToToday: () => {}
  }
}

const animationType = {
  id: 'tt-1',
  name: 'Animation',
  color: '#111',
  department_id: 'dep-1',
  for_entity: 'Shot'
}
const lightingType = {
  id: 'tt-2',
  name: 'Lighting',
  color: '#222',
  department_id: 'dep-2',
  for_entity: 'Shot'
}
const taskTypes = [animationType, lightingType]

const emptyPage = { data: [], is_more: false, stats: { total: 0 } }

const mountPage = async ({
  getters = {},
  actions = {},
  mutations = {},
  state = {},
  query = null,
  renderStubDefaultSlot = false
} = {}) => {
  const socket = { on: vi.fn(), off: vi.fn() }
  const store = createStore({
    state,
    mutations,
    getters: {
      currentUserRoleForProduction: () => () => 'manager',
      daysOff: () => [],
      departmentMap: () => new Map(),
      displayedPeople: () => [],
      getProductionTaskTypes: () => () => [],
      isCurrentUserAdmin: () => false,
      isCurrentUserManager: () => true,
      openProductions: () => [],
      organisation: () => ({}),
      productionMap: () => new Map(),
      taskTypeMap: () => new Map(),
      user: () => ({ id: 'user-1', departments: [] }),
      ...getters
    },
    actions: {
      getPersonsTasksDates: vi.fn(() => []),
      loadDaysOff: vi.fn(),
      loadOpenTasks: vi.fn(() => emptyPage),
      loadPeople: vi.fn(),
      ...actions
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  if (query) {
    await router.push({ path: '/', query })
  }
  const wrapper = shallowMount(TeamSchedule, {
    global: {
      plugins: [
        store,
        router,
        {
          install: app => {
            app.config.globalProperties.$socket = socket
            app.config.globalProperties.$t = key => key
          }
        }
      ],
      renderStubDefaultSlot,
      stubs: { Schedule: ScheduleStub }
    }
  })
  await nextTick()
  const handler = socket.on.mock.calls.find(
    ([event]) => event === 'preview-file:set-main'
  )[1]
  return { wrapper, socket, handler }
}

const supervisorGetters = {
  currentUserRoleForProduction: () => () => 'supervisor',
  isCurrentUserManager: () => false,
  user: () => ({ id: 'user-1', departments: ['dep-1'] })
}

describe('TeamSchedule page', () => {
  describe('initial load', () => {
    const people = [
      { id: 'person-1', name: 'Ann', departments: ['dep-1'], is_bot: false }
    ]
    const personDates = [
      {
        person_id: 'person-1',
        min_date: '2026-09-01',
        max_date: '2026-09-30',
        busy_periods: []
      }
    ]
    const scheduleStarts = wrapper =>
      wrapper.vm.scheduleItems.map(item => item.startDate.format('YYYY-MM-DD'))

    // The window ends at today plus three months: freeze the clock so the
    // expectations stay literal, and silence the errors the failure paths log.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2026-09-09T12:00:00Z'))
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    // Zou serves GET /data/day-offs to admins only: the refusal used to
    // abort init() before the person dates reached the schedule, which then
    // stayed blank until a filter change rebuilt it.
    it('fills the schedule of a supervisor when the days off are refused', async () => {
      const { wrapper } = await mountPage({
        getters: { ...supervisorGetters, displayedPeople: () => people },
        actions: {
          getPersonsTasksDates: vi.fn(() => personDates),
          loadDaysOff: vi.fn(() => Promise.reject(new Error('403')))
        }
      })
      await flushPromises()

      expect(wrapper.vm.errors.schedule).toBe(false)
      expect(wrapper.vm.loading.schedule).toBe(false)
      expect(scheduleStarts(wrapper)).toEqual(['2026-09-01'])
      wrapper.unmount()
    })

    it('fills the schedule of a manager when the days off are refused', async () => {
      const { wrapper } = await mountPage({
        getters: { displayedPeople: () => people },
        actions: {
          getPersonsTasksDates: vi.fn(() => personDates),
          loadDaysOff: vi.fn(() => Promise.reject(new Error('403')))
        }
      })
      await flushPromises()

      expect(scheduleStarts(wrapper)).toEqual(['2026-09-01'])
      wrapper.unmount()
    })

    // The mount-time filter watchers fire before the person dates exist:
    // on a warm store the timeline flashed one-day bars at today.
    it('waits for the person dates before building the schedule', async () => {
      let resolveDates
      const { wrapper } = await mountPage({
        getters: { ...supervisorGetters, displayedPeople: () => people },
        actions: {
          getPersonsTasksDates: vi.fn(
            () =>
              new Promise(resolve => {
                resolveDates = resolve
              })
          )
        }
      })
      await flushPromises()

      expect(wrapper.vm.scheduleItems).toEqual([])

      resolveDates(personDates)
      await flushPromises()

      expect(scheduleStarts(wrapper)).toEqual(['2026-09-01'])
      wrapper.unmount()
    })

    // Zou scopes the studio-wide month route to the persons the caller may
    // read: the page asks for the months of its window rather than the
    // admin-only listing.
    it('loads the days off of the displayed window', async () => {
      const loadDaysOff = vi.fn()
      const { wrapper } = await mountPage({
        getters: { displayedPeople: () => people },
        actions: {
          getPersonsTasksDates: vi.fn(() => personDates),
          loadDaysOff
        }
      })
      await flushPromises()

      const [, { startDate, endDate }] = loadDaysOff.mock.calls[0]
      expect(startDate.format('YYYY-MM-DD')).toBe('2026-09-01')
      expect(endDate.format('YYYY-MM-DD')).toBe('2026-12-09')
      wrapper.unmount()
    })

    // The root items carry the days off of their person and are patched in
    // place: a rebuild would collapse the expanded rows.
    it('reloads the days off when the window changes', async () => {
      const dayOff = {
        id: 'off-1',
        person_id: 'person-1',
        date: '2027-01-04',
        end_date: '2027-01-05'
      }
      // the initial window ends on 2026-12-09
      const loadDaysOff = vi.fn(({ commit }, { endDate }) => {
        commit('PEOPLE_SET_DAYS_OFF', endDate.isAfter('2026-12-31') ? [dayOff] : [])
      })
      const { wrapper } = await mountPage({
        state: { daysOff: [] },
        mutations: {
          PEOPLE_SET_DAYS_OFF: (state, daysOff) => {
            state.daysOff = daysOff
          }
        },
        getters: {
          daysOff: state => state.daysOff,
          displayedPeople: () => people
        },
        actions: {
          getPersonsTasksDates: vi.fn(() => personDates),
          loadDaysOff
        }
      })
      await flushPromises()
      const row = wrapper.vm.scheduleItems[0]
      expect(row.daysOff).toBeUndefined()
      row.expanded = true

      wrapper.vm.onUpdateSelectedEndDate('2027-01-15')
      await flushPromises()

      expect(loadDaysOff).toHaveBeenCalledTimes(2)
      expect(wrapper.vm.scheduleItems[0]).toBe(row)
      expect(row.expanded).toBe(true)
      expect(row.daysOff).toEqual([dayOff])

      wrapper.vm.onUpdateSelectedStartDate('2026-08-01')
      await flushPromises()

      const [, window] = loadDaysOff.mock.calls[2]
      expect(window.startDate.format('YYYY-MM-DD')).toBe('2026-08-01')
      expect(window.endDate.format('YYYY-MM-DD')).toBe('2027-01-15')
      wrapper.unmount()
    })

    it('shows an error state with a reload when the person dates fail', async () => {
      const getPersonsTasksDates = vi
        .fn()
        .mockRejectedValueOnce(new Error('500'))
        .mockResolvedValue(personDates)
      const { wrapper } = await mountPage({
        getters: { displayedPeople: () => people },
        actions: { getPersonsTasksDates }
      })
      await flushPromises()

      expect(wrapper.vm.errors.schedule).toBe(true)
      expect(wrapper.vm.loading.schedule).toBe(false)
      expect(wrapper.findComponent(ScheduleStub).exists()).toBe(false)
      expect(wrapper.find('.schedule-error').exists()).toBe(true)

      await wrapper.find('.schedule-error button-simple-stub').trigger('click')
      await flushPromises()

      expect(wrapper.vm.errors.schedule).toBe(false)
      expect(scheduleStarts(wrapper)).toEqual(['2026-09-01'])
      expect(wrapper.find('.schedule-error').exists()).toBe(false)
      wrapper.unmount()
    })
  })

  describe('department filter', () => {
    const departmentCombo = wrapper =>
      wrapper.findComponent({ name: 'ComboboxDepartment' })

    it('restricts the combobox to the supervisor departments', async () => {
      const { wrapper } = await mountPage({ getters: supervisorGetters })

      expect(departmentCombo(wrapper).props('myDepartmentsOnly')).toBe(true)
      expect(wrapper.vm.selectedDepartment).toBe('MY_DEPARTMENTS')
      wrapper.unmount()
    })

    it('keeps every department for a manager', async () => {
      const { wrapper } = await mountPage({ query: { department: 'dep-2' } })

      expect(departmentCombo(wrapper).props('myDepartmentsOnly')).toBe(false)
      expect(wrapper.vm.selectedDepartment).toBe('dep-2')
      wrapper.unmount()
    })

    it('keeps a bookmarked department of the supervisor', async () => {
      const { wrapper } = await mountPage({
        getters: supervisorGetters,
        query: { department: 'dep-1' }
      })

      expect(wrapper.vm.selectedDepartment).toBe('dep-1')
      wrapper.unmount()
    })

    it('ignores a bookmarked department outside the supervisor scope', async () => {
      const { wrapper } = await mountPage({
        getters: supervisorGetters,
        query: { department: 'dep-2' }
      })

      expect(wrapper.vm.selectedDepartment).toBe('MY_DEPARTMENTS')
      wrapper.unmount()
    })

    it('falls back to my departments from a bookmarked all entry', async () => {
      const { wrapper } = await mountPage({
        getters: supervisorGetters,
        query: { department: 'ALL' }
      })

      expect(wrapper.vm.selectedDepartment).toBe('MY_DEPARTMENTS')
      wrapper.unmount()
    })

    // The scope follows the production filter: a supervisor promoted to
    // manager on a production browses every department there.
    it('follows the role held on the production filter', async () => {
      const { wrapper } = await mountPage({
        getters: {
          ...supervisorGetters,
          currentUserRoleForProduction: () => productionId =>
            productionId === 'prod-managed' ? 'manager' : 'supervisor'
        },
        query: { department: 'dep-2', production: 'prod-managed' }
      })

      expect(departmentCombo(wrapper).props('myDepartmentsOnly')).toBe(false)
      expect(wrapper.vm.selectedDepartment).toBe('dep-2')

      wrapper.vm.selectedProduction = 'prod-1'
      await nextTick()

      expect(departmentCombo(wrapper).props('myDepartmentsOnly')).toBe(true)
      expect(wrapper.vm.selectedDepartment).toBe('MY_DEPARTMENTS')
      wrapper.unmount()
    })

    it('scopes a manager supervising the production filter', async () => {
      const { wrapper } = await mountPage({
        getters: {
          currentUserRoleForProduction: () => productionId =>
            productionId === 'prod-1' ? 'supervisor' : 'manager',
          user: () => ({ id: 'user-1', departments: ['dep-1'] })
        },
        query: { production: 'prod-1' }
      })

      expect(departmentCombo(wrapper).props('myDepartmentsOnly')).toBe(true)
      expect(wrapper.vm.selectedDepartment).toBe('MY_DEPARTMENTS')

      // the unscoped list of a global manager has no "My departments" entry
      wrapper.vm.selectedProduction = undefined
      await nextTick()

      expect(departmentCombo(wrapper).props('myDepartmentsOnly')).toBe(false)
      expect(wrapper.vm.selectedDepartment).toBe('ALL')
      wrapper.unmount()
    })
  })

  describe('supervisor department scope', () => {
    const scopedGetters = {
      ...supervisorGetters,
      getProductionTaskTypes: () => () => taskTypes,
      taskTypeMap: () => new Map(taskTypes.map(type => [type.id, type]))
    }

    it('lists only the task types of the supervisor departments', async () => {
      const { wrapper } = await mountPage({ getters: scopedGetters })

      expect(wrapper.vm.taskTypeList.map(({ id }) => id)).toEqual(['tt-1'])
      wrapper.unmount()
    })

    it('keeps every task type and the all entry for a manager', async () => {
      const { wrapper } = await mountPage({
        getters: { getProductionTaskTypes: () => () => taskTypes }
      })

      expect(wrapper.vm.taskTypeList.map(({ id }) => id)).toEqual([
        '',
        'tt-1',
        'tt-2'
      ])
      wrapper.unmount()
    })

    it('keeps every task type for a supervisor without department', async () => {
      const { wrapper } = await mountPage({
        getters: {
          ...scopedGetters,
          user: () => ({ id: 'user-1', departments: [] })
        }
      })

      expect(wrapper.vm.taskTypeList.map(({ id }) => id)).toEqual([
        '',
        'tt-1',
        'tt-2'
      ])
      wrapper.unmount()
    })

    // The role can differ per production: a supervisor promoted to manager
    // on a production gets the full list there.
    it('follows the role held on the filtered production', async () => {
      const { wrapper } = await mountPage({
        getters: {
          ...scopedGetters,
          currentUserRoleForProduction: () => productionId =>
            productionId === 'prod-managed' ? 'manager' : 'supervisor'
        }
      })
      wrapper.vm.filters.productionId = 'prod-managed'

      expect(wrapper.vm.taskTypeList.map(({ id }) => id)).toEqual([
        '',
        'tt-1',
        'tt-2'
      ])
      wrapper.unmount()
    })

    it('requests the unassigned tasks of a department task type', async () => {
      const loadOpenTasks = vi.fn(() => emptyPage)
      const { wrapper } = await mountPage({
        getters: scopedGetters,
        actions: { loadOpenTasks }
      })

      await wrapper.vm.loadUnassignedTasks()

      expect(wrapper.vm.filters.taskTypeId).toBe('tt-1')
      expect(loadOpenTasks).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ task_type_id: 'tt-1' })
      )
      wrapper.unmount()
    })

    it('drops a task type filter that left the department scope', async () => {
      const loadOpenTasks = vi.fn(() => emptyPage)
      const { wrapper } = await mountPage({
        getters: scopedGetters,
        actions: { loadOpenTasks }
      })
      wrapper.vm.filters.taskTypeId = 'tt-2'

      await wrapper.vm.loadUnassignedTasks()

      expect(wrapper.vm.filters.taskTypeId).toBe('tt-1')
      expect(loadOpenTasks).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ task_type_id: 'tt-1' })
      )
      wrapper.unmount()
    })

    it('restarts the pagination when the filter is re-pointed', async () => {
      const loadOpenTasks = vi.fn(() => emptyPage)
      const { wrapper } = await mountPage({
        getters: scopedGetters,
        actions: { loadOpenTasks }
      })
      wrapper.vm.filters.taskTypeId = 'tt-2'
      wrapper.vm.unassignedTasksPage = 3

      await wrapper.vm.loadUnassignedTasks(true)

      expect(loadOpenTasks).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ page: 1, task_type_id: 'tt-1' })
      )
      wrapper.unmount()
    })

    it('skips the request when no task type is in scope', async () => {
      const loadOpenTasks = vi.fn()
      const { wrapper } = await mountPage({
        getters: {
          ...scopedGetters,
          getProductionTaskTypes: () => () => [lightingType]
        },
        actions: { loadOpenTasks }
      })
      wrapper.vm.unassignedTasks = [{ id: 'task-1' }]
      wrapper.vm.totalUnassignedTasks = 1
      wrapper.vm.selectedTaskIds = new Set(['task-1'])
      wrapper.vm.loading.hasMoreUnassignedTasks = true

      await wrapper.vm.loadUnassignedTasks()

      expect(loadOpenTasks).not.toHaveBeenCalled()
      expect(wrapper.vm.unassignedTasks).toEqual([])
      expect(wrapper.vm.totalUnassignedTasks).toBe(0)
      expect(wrapper.vm.selectedTaskIds.size).toBe(0)
      expect(wrapper.vm.loading.unassignedTasks).toBe(false)
      expect(wrapper.vm.loading.hasMoreUnassignedTasks).toBe(false)
      wrapper.unmount()
    })

    it('explains an empty scope in the panel', async () => {
      const { wrapper } = await mountPage({
        getters: {
          ...scopedGetters,
          getProductionTaskTypes: () => () => [lightingType]
        },
        renderStubDefaultSlot: true
      })
      wrapper.vm.isTaskSidePanelOpen = true
      await flushPromises()

      expect(wrapper.text()).toContain(
        'team_schedule.no_department_task_type'
      )
      expect(wrapper.text()).not.toContain('main.no_results')
      expect(
        wrapper.findComponent({ name: 'ComboboxTaskType' }).props('disabled')
      ).toBe(true)
      wrapper.unmount()
    })

    it('explains the missing role in the panel', async () => {
      const { wrapper } = await mountPage({
        getters: {
          ...scopedGetters,
          currentUserRoleForProduction: () => () => 'user'
        },
        renderStubDefaultSlot: true
      })
      wrapper.vm.isTaskSidePanelOpen = true
      await flushPromises()

      expect(wrapper.text()).toContain('team_schedule.no_assignment_role')
      expect(wrapper.text()).not.toContain(
        'team_schedule.no_department_task_type'
      )
      wrapper.unmount()
    })

    it('keeps a manager request unscoped', async () => {
      const loadOpenTasks = vi.fn(() => emptyPage)
      const { wrapper } = await mountPage({
        getters: { getProductionTaskTypes: () => () => taskTypes },
        actions: { loadOpenTasks }
      })

      await wrapper.vm.loadUnassignedTasks()

      expect(wrapper.vm.filters.taskTypeId).toBe(null)
      expect(loadOpenTasks).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ task_type_id: null })
      )
      wrapper.unmount()
    })

    it('falls back to all task types when the manager filter left the production', async () => {
      const loadOpenTasks = vi.fn(() => emptyPage)
      const { wrapper } = await mountPage({
        getters: { getProductionTaskTypes: () => () => taskTypes },
        actions: { loadOpenTasks }
      })
      wrapper.vm.filters.taskTypeId = 'tt-9'

      await wrapper.vm.loadUnassignedTasks()

      expect(wrapper.vm.filters.taskTypeId).toBe('')
      expect(loadOpenTasks).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ task_type_id: '' })
      )
      wrapper.unmount()
    })

    const buildItems = async (getters, projectId = 'prod-1') => {
      const { wrapper } = await mountPage({ getters })
      const person = { id: 'person-1', children: [] }
      const items = taskTypes.map(type =>
        wrapper.vm.buildTaskScheduleItem(person, {
          id: `task-${type.id}`,
          project_id: projectId,
          task_type_id: type.id,
          full_entity_name: 'SH01',
          start_date: '2026-09-01',
          due_date: '2026-09-05'
        })
      )
      wrapper.unmount()
      return items
    }

    it('keeps the bars of the other departments inert for a supervisor', async () => {
      const items = await buildItems(scopedGetters)

      expect(items.map(item => item.editable)).toEqual([true, false])
    })

    it('keeps every bar editable for a manager', async () => {
      const items = await buildItems({
        taskTypeMap: () => new Map(taskTypes.map(type => [type.id, type]))
      })

      expect(items.map(item => item.editable)).toEqual([true, true])
    })

    it('keeps every bar editable on a production the supervisor manages', async () => {
      const items = await buildItems(
        {
          ...scopedGetters,
          currentUserRoleForProduction: () => productionId =>
            productionId === 'prod-managed' ? 'manager' : 'supervisor'
        },
        'prod-managed'
      )

      expect(items.map(item => item.editable)).toEqual([true, true])
    })

    // Zou refuses an artist every reschedule and every assignment but a
    // self-assignment in their own department: the page keeps such a
    // production inert.
    it('keeps everything inert on a production where the supervisor is an artist', async () => {
      const artistGetters = {
        ...scopedGetters,
        currentUserRoleForProduction: () => productionId =>
          productionId === 'prod-artist' ? 'user' : 'supervisor'
      }
      const items = await buildItems(artistGetters, 'prod-artist')
      const { wrapper } = await mountPage({ getters: artistGetters })
      wrapper.vm.filters.productionId = 'prod-artist'

      expect(items.map(item => item.editable)).toEqual([false, false])
      expect(wrapper.vm.taskTypeList).toEqual([])
      expect(
        wrapper.vm.assignRule(
          { id: 'task-1', project_id: 'prod-artist', task_type_id: 'tt-1' },
          { id: 'person-1', departments: ['dep-1'] }
        )
      ).toBe('role')
      wrapper.unmount()
    })

    // Zou ignores the production role of an admin.
    it('never scopes an admin', async () => {
      const adminGetters = {
        ...scopedGetters,
        isCurrentUserAdmin: () => true,
        isCurrentUserManager: () => true,
        user: () => ({ id: 'user-1', role: 'admin', departments: ['dep-1'] })
      }
      const items = await buildItems(adminGetters)
      const { wrapper } = await mountPage({ getters: adminGetters })

      expect(items.map(item => item.editable)).toEqual([true, true])
      expect(wrapper.vm.taskTypeList.map(({ id }) => id)).toEqual([
        '',
        'tt-1',
        'tt-2'
      ])
      expect(
        wrapper.vm.assignRule(
          { id: 'task-1', project_id: 'prod-1', task_type_id: 'tt-2' },
          { id: 'person-1', departments: ['dep-2'] }
        )
      ).toBe(null)
      wrapper.unmount()
    })

    // Zou also wants the assignee to share a department with the supervisor.
    it('refuses a drop on a person outside the supervisor departments', async () => {
      const { wrapper } = await mountPage({ getters: scopedGetters })
      const task = { id: 'task-1', project_id: 'prod-1', task_type_id: 'tt-1' }

      expect(
        [['dep-1'], ['dep-1', 'dep-2'], ['dep-2'], []].map(departments =>
          wrapper.vm.assignRule(task, { id: 'person-1', departments })
        )
      ).toEqual([null, null, 'person', 'person'])
      wrapper.unmount()
    })

    // The panel list is scoped by its own production filter, so a task
    // outside the departments can still be dragged from an "All" listing.
    it('refuses a drop of a task outside the supervisor departments', async () => {
      const { wrapper } = await mountPage({ getters: scopedGetters })
      const task = { id: 'task-1', project_id: 'prod-1', task_type_id: 'tt-2' }

      expect(
        wrapper.vm.assignRule(task, {
          id: 'person-1',
          departments: ['dep-1', 'dep-2']
        })
      ).toBe('task_type')
      wrapper.unmount()
    })

    it('lets a manager drop on anyone', async () => {
      const { wrapper } = await mountPage()
      const task = { id: 'task-1', project_id: 'prod-1', task_type_id: 'tt-1' }

      expect(
        [['dep-2'], []].map(departments =>
          wrapper.vm.assignRule(task, { id: 'person-1', departments })
        )
      ).toEqual([null, null])
      wrapper.unmount()
    })

    it('hands the schedule its assign rule', async () => {
      const { wrapper } = await mountPage({
        getters: {
          ...scopedGetters,
          displayedPeople: () => [
            { id: 'person-1', name: 'Ann', departments: ['dep-1'], is_bot: false }
          ]
        }
      })
      await flushPromises()

      const rule = wrapper.findComponent(ScheduleStub).props('assignRule')
      expect(typeof rule).toBe('function')
      expect(rule).toBe(wrapper.vm.assignRule)
      wrapper.unmount()
    })
  })

  describe('preview-file:set-main socket handler', () => {
    // The unassigned tasks are enriched copies kept in component state, so
    // no store mutation can refresh their thumbnail.
    it('refreshes the thumbnail of the tasks of the entity', async () => {
      const { wrapper, handler } = await mountPage()
      wrapper.vm.unassignedTasks = [
        { id: 'task-1', entity_id: 'entity-1', entity_preview_file_id: '' },
        { id: 'task-2', entity_id: 'entity-1', entity_preview_file_id: 'old' },
        { id: 'task-3', entity_id: 'entity-2', entity_preview_file_id: 'old' }
      ]

      handler({ entity_id: 'entity-1', preview_file_id: 'preview-1' })

      expect(
        wrapper.vm.unassignedTasks.map(task => task.entity_preview_file_id)
      ).toEqual(['preview-1', 'preview-1', 'old'])
      wrapper.unmount()
    })

    it('is unregistered on unmount', async () => {
      const { wrapper, socket, handler } = await mountPage()
      wrapper.unmount()
      expect(socket.off).toHaveBeenCalledWith('preview-file:set-main', handler)
    })
  })
})
