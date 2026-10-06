import { nextTick } from 'vue'
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
import Todos from '@/components/pages/Todos.vue'

const feedbackStatus = { id: 'status-1', is_feedback_request: true }
const wipStatus = { id: 'status-2', is_feedback_request: false }

// Distinct due dates keep the priority sort deterministic.
const pendingTask = {
  id: 'task-1',
  task_status_id: feedbackStatus.id,
  priority: 0,
  due_date: '2026-01-01'
}
const wipTask = {
  id: 'task-2',
  task_status_id: wipStatus.id,
  priority: 0,
  due_date: '2026-01-02'
}
// A status created after the context load is missing from the map.
const unknownStatusTask = {
  id: 'task-3',
  task_status_id: 'status-3',
  priority: 0,
  due_date: '2026-01-03'
}

const taskStatusMap = new Map([
  [feedbackStatus.id, feedbackStatus],
  [wipStatus.id, wipStatus]
])

const SearchFieldStub = {
  template: '<div />',
  methods: {
    getValue: () => '',
    setValue: () => {}
  }
}

const TodosListStub = {
  template: '<div />',
  methods: {
    resizeHeaders: () => {},
    setScrollPosition: () => {}
  }
}

const DayOffListStub = {
  props: ['daysOff', 'dayOffError', 'isError'],
  template: '<div />',
  methods: {
    closeSetDayOffModal: () => {},
    closeUnsetDayOffModal: () => {}
  }
}

const mountPage = async (
  todos,
  { actions = {}, errorHandler, query = {} } = {}
) => {
  const store = createStore({
    getters: {
      displayedDoneTasks: () => [],
      displayedTodos: () => todos,
      doneSelectionGrid: () => ({}),
      getProductionTaskStatuses: () => () => [],
      isTodosLoading: () => false,
      isTodosLoadingError: () => false,
      nbSelectedTasks: () => 0,
      openProductions: () => [],
      productionMap: () => new Map(),
      selectedTasks: () => new Map(),
      taskStatuses: () => [],
      taskStatusMap: () => taskStatusMap,
      taskTypeMap: () => new Map(),
      timeSpentMap: () => new Map(),
      timeSpentTotal: () => 0,
      todoListScrollPosition: () => 0,
      todoSearchQueries: () => [],
      todoSelectionGrid: () => ({}),
      user: () => ({ id: 'user-1' })
    },
    actions: {
      clearSelectedTasks: vi.fn(),
      loadAggregatedPersonDaysOff: vi.fn(() => []),
      loadDoneTasks: vi.fn(),
      loadTodos: vi.fn(),
      setTodosSearch: vi.fn(),
      ...actions
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  await router.push({ path: '/', query })
  const wrapper = shallowMount(Todos, {
    global: {
      config: { errorHandler },
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
      stubs: {
        DayOffList: DayOffListStub,
        SearchField: SearchFieldStub,
        TodosList: TodosListStub
      }
    }
  })
  await nextTick()
  return wrapper
}

describe('Todos page', () => {
  describe('pendingTasks', () => {
    it('keeps the tasks waiting for a feedback', async () => {
      const wrapper = await mountPage([pendingTask, wipTask])
      expect(wrapper.vm.pendingTasks).toEqual([pendingTask])
      wrapper.unmount()
    })

    it('ignores a task whose status is missing from the map', async () => {
      const wrapper = await mountPage([pendingTask, unknownStatusTask])
      expect(wrapper.vm.pendingTasks).toEqual([pendingTask])
      wrapper.unmount()
    })
  })

  describe('notPendingTasks', () => {
    it('keeps the tasks not waiting for a feedback', async () => {
      const wrapper = await mountPage([pendingTask, wipTask])
      expect(wrapper.vm.notPendingTasks).toEqual([wipTask])
      wrapper.unmount()
    })

    it('keeps a task whose status is missing from the map', async () => {
      const wrapper = await mountPage([wipTask, unknownStatusTask])
      expect(wrapper.vm.notPendingTasks).toEqual([wipTask, unknownStatusTask])
      wrapper.unmount()
    })
  })

  describe('days off', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    // The Vue error handler reports to Sentry, and the search setup of the
    // page runs after the days off load.
    it('finishes its setup when the days off are refused', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const error = new Error('403 Forbidden')
      const errorHandler = vi.fn()
      const setTodosSearch = vi.fn()
      const wrapper = await mountPage([], {
        actions: {
          loadAggregatedPersonDaysOff: () => Promise.reject(error),
          setTodosSearch
        },
        errorHandler
      })
      await flushPromises()

      expect(errorHandler).not.toHaveBeenCalled()
      expect(consoleError).toHaveBeenCalledWith(error)
      expect(setTodosSearch).toHaveBeenCalled()
      expect(wrapper.vm.daysOff).toEqual([])
      wrapper.unmount()
    })

    it('shows the load error in the day off tab', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = await mountPage([], {
        actions: {
          loadAggregatedPersonDaysOff: () =>
            Promise.reject(new Error('403 Forbidden'))
        },
        query: { section: 'daysoff' }
      })
      await flushPromises()

      expect(wrapper.findComponent(DayOffListStub).props('isError')).toBe(true)
      wrapper.unmount()
    })

    it('clears the load error once the days off load again', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const dayOff = {
        id: 'day-off-1',
        date: '2026-10-01',
        end_date: '2026-10-01'
      }
      const loadAggregatedPersonDaysOff = vi
        .fn()
        .mockRejectedValueOnce(new Error('403 Forbidden'))
        .mockResolvedValue([dayOff])
      const wrapper = await mountPage([], {
        actions: { loadAggregatedPersonDaysOff, setDayOff: vi.fn() },
        query: { section: 'daysoff' }
      })
      await flushPromises()
      const dayOffList = wrapper.findComponent(DayOffListStub)

      dayOffList.vm.$emit('set-day-off', dayOff)
      await flushPromises()

      expect(dayOffList.props('isError')).toBe(false)
      expect(dayOffList.props('daysOff')).toEqual([dayOff])
      wrapper.unmount()
    })

    // The lists clear the error of a refused confirm each time they open a
    // day-off form
    it.each([
      ['daysoff', DayOffListStub],
      ['timesheets', TimesheetList]
    ])(
      'lets the %s list clear a refused day off error',
      async (section, list) => {
        const message = 'Day off already exists for this period'
        const wrapper = await mountPage([], {
          actions: { setDayOff: () => Promise.reject({ body: { message } }) },
          query: { section }
        })
        await flushPromises()
        const dayOffList = wrapper.findComponent(list)

        dayOffList.vm.$emit('set-day-off', { date: '2026-10-01' })
        await flushPromises()
        expect(dayOffList.props('dayOffError')).toBe(message)
        dayOffList.vm.$emit('update:day-off-error', false)
        await nextTick()

        expect(dayOffList.props('dayOffError')).toBe(false)
        wrapper.unmount()
      }
    )
  })

  describe('time spent', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('logs a time spent that fails to save', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const error = new Error('404 Not Found')
      const wrapper = await mountPage([], {
        actions: { setTimeSpent: () => Promise.reject(error) },
        query: { section: 'timesheets' }
      })
      await flushPromises()

      wrapper
        .findComponent(TimesheetList)
        .vm.$emit('time-spent-change', { taskId: 'task-1', duration: 2 })
      await flushPromises()

      expect(consoleError).toHaveBeenCalledWith(error)
      wrapper.unmount()
    })
  })
})
