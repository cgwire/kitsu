import { flushPromises, shallowMount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import TimesheetList from '@/components/lists/TimesheetList.vue'
import Person from '@/components/pages/Person.vue'

const person = { id: 'person-1', name: 'Jane Doe', is_bot: false }

const SearchFieldStub = {
  template: '<div />',
  methods: {
    getValue: () => '',
    setValue: () => {}
  }
}

const mountPage = async ({ actions = {}, query = {} } = {}) => {
  const store = createStore({
    getters: {
      displayedPersonDoneTasks: () => [],
      displayedPersonTasks: () => [],
      getProductionTaskStatuses: () => () => [],
      isCurrentUserAdmin: () => false,
      isCurrentUserClient: () => false,
      isCurrentUserManager: () => false,
      isCurrentUserSupervisor: () => false,
      isCurrentUserVendor: () => false,
      nbSelectedTasks: () => 0,
      openProductions: () => [],
      organisation: () => ({}),
      personMap: () => new Map([[person.id, person]]),
      personTaskSearchQueries: () => [],
      personTaskSelectionGrid: () => ({}),
      personTasksScrollPosition: () => 0,
      personTimeSpentMap: () => ({}),
      personTimeSpentTotal: () => 0,
      productionMap: () => new Map(),
      selectedTasks: () => new Map(),
      taskStatuses: () => [],
      taskTypeMap: () => new Map(),
      user: () => person
    },
    actions: {
      clearSelectedTasks: vi.fn(),
      loadAggregatedPersonDaysOff: vi.fn(() => []),
      loadPersonDoneTasks: vi.fn(),
      loadPersonTasks: vi.fn(),
      setPersonTasksSearch: vi.fn(),
      ...actions
    },
    mutations: {
      LOAD_PERSON_TASKS_END: () => {}
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/people/:person_id', component: { template: '<div />' } }]
  })
  await router.push({ path: `/people/${person.id}`, query })
  const wrapper = shallowMount(Person, {
    global: {
      plugins: [
        store,
        router,
        {
          install: app => {
            app.config.globalProperties.$socket = { on: vi.fn(), off: vi.fn() }
            app.config.globalProperties.$t = key => key
          }
        }
      ],
      stubs: { SearchField: SearchFieldStub }
    }
  })
  await flushPromises()
  return wrapper
}

describe('Person page', () => {
  describe('time spent', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('logs a time spent that fails to save', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const error = new Error('404 Not Found')
      const wrapper = await mountPage({
        actions: { setTimeSpent: () => Promise.reject(error) },
        query: { section: 'timesheets' }
      })

      wrapper
        .findComponent(TimesheetList)
        .vm.$emit('time-spent-change', { taskId: 'task-1', duration: 2 })
      await flushPromises()

      expect(consoleError).toHaveBeenCalledWith(error)
      wrapper.unmount()
    })
  })

  describe('days off', () => {
    // The timesheet clears the error of a refused confirm each time it opens
    // a day-off form
    it('lets the timesheet clear a refused day off error', async () => {
      const message = 'Day off already exists for this period'
      const wrapper = await mountPage({
        actions: { setDayOff: () => Promise.reject({ body: { message } }) },
        query: { section: 'timesheets' }
      })
      const timesheetList = wrapper.findComponent(TimesheetList)

      timesheetList.vm.$emit('set-day-off', { date: '2026-10-01' })
      await flushPromises()
      expect(timesheetList.props('dayOffError')).toBe(message)
      timesheetList.vm.$emit('update:day-off-error', false)
      await flushPromises()

      expect(timesheetList.props('dayOffError')).toBe(false)
      wrapper.unmount()
    })
  })
})
