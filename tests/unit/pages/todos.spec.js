import moment from 'moment-timezone'
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

import { today } from '@/lib/timesheet'

import TimesheetList from '@/components/lists/TimesheetList.vue'
import PeopleTimesheetInfo from '@/components/sides/PeopleTimesheetInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ProductivityChart from '@/components/widgets/ProductivityChart.vue'
import UserCalendar from '@/components/widgets/UserCalendar.vue'
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
  { actions = {}, errorHandler, getters = {}, query = {} } = {}
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
      user: () => ({ id: 'user-1' }),
      ...getters
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
  // The filters and the header of the tab below form one panel
  it.each(['timesheets', 'calendar', 'productivity'])(
    'attaches the filters to the header of the %s tab',
    async section => {
      const wrapper = await mountPage([], { query: { section } })
      expect(wrapper.find('.todos-filters').classes()).toContain('is-attached')
      wrapper.unmount()
    }
  )

  describe('on a phone', () => {
    const mockPhone = matches =>
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
          matches,
          addEventListener: () => {},
          removeEventListener: () => {}
        }))
      )

    afterEach(() => vi.unstubAllGlobals())

    it('hides the pending and validated tabs', async () => {
      mockPhone(true)
      const wrapper = await mountPage([])
      const names = wrapper
        .findComponent(RouteSectionTabs)
        .props('tabs')
        .map(tab => tab.name)
      expect(names).not.toContain('pending')
      expect(names).not.toContain('done')
      expect(names).toContain('timesheets')
      wrapper.unmount()
    })

    it('keeps every tab on a large screen', async () => {
      mockPhone(false)
      const wrapper = await mountPage([])
      const names = wrapper
        .findComponent(RouteSectionTabs)
        .props('tabs')
        .map(tab => tab.name)
      expect(names).toContain('pending')
      expect(names).toContain('done')
      wrapper.unmount()
    })

    // the funnel toggle of the other pages, next to the search
    it('folds the filters until the funnel opens them', async () => {
      mockPhone(true)
      const wrapper = await mountPage([])
      const filters = wrapper.find('.todos-filters')
      const toggle = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.classes('filters-toggle'))
      expect(filters.classes()).toContain('collapsed')
      expect(toggle.props('icon')).toBe('funnel')
      await toggle.vm.$emit('click')
      expect(filters.classes()).not.toContain('collapsed')
      wrapper.unmount()
    })
  })

  // The page keeps the picked filters in the local storage
  afterEach(() => localStorage.removeItem('todos:filters'))

  describe('filters in the URL', () => {
    const combo = (wrapper, label) =>
      wrapper
        .findAllComponents(ComboboxStyled)
        .find(c => c.props('label') === label)

    it('reads the filters from the URL', async () => {
      const wrapper = await mountPage([], {
        query: { taskTypeId: 'type-2', due: 'due_previous_week', sort: 'due_date' }
      })
      expect(wrapper.findComponent(ComboboxTaskType).props('modelValue')).toBe(
        'type-2'
      )
      expect(combo(wrapper, 'tasks.fields.due_date').props('modelValue')).toBe(
        'due_previous_week'
      )
      expect(combo(wrapper, 'main.sorted_by').props('modelValue')).toBe(
        'due_date'
      )
      wrapper.unmount()
    })

    it('falls back on the filters picked last time', async () => {
      localStorage.setItem(
        'todos:filters',
        JSON.stringify({ taskTypeId: 'type-3', due: 'due_this_week' })
      )
      const wrapper = await mountPage([], { query: { due: 'all_tasks' } })
      expect(wrapper.findComponent(ComboboxTaskType).props('modelValue')).toBe(
        'type-3'
      )
      expect(combo(wrapper, 'tasks.fields.due_date').props('modelValue')).toBe(
        'all_tasks'
      )
      wrapper.unmount()
    })

    it('writes the picked filters in the URL', async () => {
      const wrapper = await mountPage([])
      // the page ends its setup with a search navigation
      await flushPromises()
      await wrapper
        .findComponent(ComboboxTaskType)
        .vm.$emit('update:modelValue', 'type-1')
      await combo(wrapper, 'tasks.fields.due_date').vm.$emit(
        'update:modelValue',
        'due_this_week'
      )
      await combo(wrapper, 'main.sorted_by').vm.$emit(
        'update:modelValue',
        'entity_name'
      )
      await flushPromises()
      expect(wrapper.vm.$route.query).toMatchObject({
        taskTypeId: 'type-1',
        due: 'due_this_week',
        sort: 'entity_name'
      })
      expect(JSON.parse(localStorage.getItem('todos:filters'))).toMatchObject({
        taskTypeId: 'type-1',
        due: 'due_this_week',
        sort: 'entity_name'
      })
      wrapper.unmount()
    })
  })

  describe('due date filter', () => {
    const dueOn = (id, date) => ({
      ...wipTask,
      id,
      due_date: date.format('YYYY-MM-DD')
    })
    const thisWeekTask = dueOn('task-6', moment().startOf('week').add(1, 'day'))
    const lastWeekTask = dueOn(
      'task-7',
      moment().startOf('week').subtract(1, 'week').add(1, 'day')
    )

    it('keeps the tasks due last week', async () => {
      const wrapper = await mountPage([thisWeekTask, lastWeekTask])
      const combo = wrapper
        .findAllComponents(ComboboxStyled)
        .find(c => c.props('label') === 'tasks.fields.due_date')
      expect(combo.props('options').map(option => option.value)).toContain(
        'due_previous_week'
      )
      await combo.vm.$emit('update:modelValue', 'due_previous_week')
      expect(wrapper.vm.notPendingTasks).toEqual([lastWeekTask])
      wrapper.unmount()
    })
  })

  describe('task type filter', () => {
    const modeling = { id: 'type-1', name: 'Modeling' }
    const rigging = { id: 'type-2', name: 'Rigging' }
    const layout = { id: 'type-3', name: 'Layout' }
    const modelingTask = { ...wipTask, id: 'task-4', task_type_id: 'type-1' }
    const riggingTask = { ...wipTask, id: 'task-5', task_type_id: 'type-2' }
    const taskTypeMap = new Map(
      [modeling, rigging, layout].map(taskType => [taskType.id, taskType])
    )

    it('offers the task types of the tasks only', async () => {
      const wrapper = await mountPage([modelingTask, riggingTask], {
        getters: { taskTypeMap: () => taskTypeMap }
      })
      const ids = wrapper
        .findComponent(ComboboxTaskType)
        .props('taskTypeList')
        .map(taskType => taskType.id)
      expect(ids).toEqual(['', 'type-1', 'type-2'])
      wrapper.unmount()
    })

    it('keeps the tasks of the picked task type', async () => {
      const wrapper = await mountPage([modelingTask, riggingTask], {
        getters: { taskTypeMap: () => taskTypeMap }
      })
      await wrapper
        .findComponent(ComboboxTaskType)
        .vm.$emit('update:modelValue', 'type-2')
      expect(wrapper.vm.notPendingTasks).toEqual([riggingTask])
      wrapper.unmount()
    })
  })

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

  it('loads the calendar time spents from the user route', async () => {
    const loadUserTimeSpentsByPeriod = vi.fn(() => [])
    const wrapper = await mountPage([], {
      actions: { loadUserTimeSpentsByPeriod },
      query: { section: 'calendar' }
    })
    wrapper
      .findComponent(UserCalendar)
      .vm.$emit('dates-changed', { start: '2026-10-01', end: '2026-10-31' })
    await flushPromises()
    expect(loadUserTimeSpentsByPeriod.mock.calls[0][1]).toEqual({
      startDate: '2026-10-01',
      endDate: '2026-10-31'
    })
    wrapper.unmount()
  })

  describe('productivity tab', () => {
    const mountProductivity = (query = {}, options = {}) =>
      mountPage([], {
        ...options,
        actions: {
          loadAggregatedPersonTimeSpents: vi.fn(() => []),
          loadUserTimeSpentsByPeriod: vi.fn(() => []),
          ...options.actions
        },
        query: { section: 'productivity', ...query }
      })

    it('is a tab of the page', async () => {
      const wrapper = await mountProductivity()
      const names = wrapper
        .findComponent(RouteSectionTabs)
        .props('tabs')
        .map(tab => tab.name)
      expect(names).toContain('productivity')
      expect(wrapper.vm.currentSection).toBe('productivity')
      expect(wrapper.findComponent(ProductivityChart).exists()).toBe(true)
      wrapper.unmount()
    })

    it('loads the time spents of the period of the URL', async () => {
      const loadUserTimeSpentsByPeriod = vi.fn(() => [{ duration: 60 }])
      const wrapper = await mountProductivity(
        { view: 'day', year: '2026', month: '2' },
        { actions: { loadUserTimeSpentsByPeriod } }
      )
      await flushPromises()
      expect(loadUserTimeSpentsByPeriod.mock.calls[0][1]).toEqual({
        startDate: '2026-02-01',
        endDate: '2026-02-28'
      })
      const chart = wrapper.findComponent(ProductivityChart)
      expect(chart.props()).toMatchObject({
        level: 'day',
        year: 2026,
        month: 2,
        timeSpents: [{ duration: 60 }]
      })
      wrapper.unmount()
    })

    it('hides the filters that do not apply', async () => {
      const wrapper = await mountProductivity()
      expect(wrapper.find('.search-field-column').isVisible()).toBe(false)
      expect(wrapper.find('.query-list').isVisible()).toBe(false)
      const combos = wrapper.findAllComponents(ComboboxStyled)
      expect(combos.every(combo => !combo.isVisible())).toBe(true)
      expect(wrapper.findComponent(ComboboxTaskType).isVisible()).toBe(true)
      wrapper.unmount()
    })

    it('drops the selected period when the view changes', async () => {
      const wrapper = await mountProductivity({ view: 'day', period: '5' })
      await flushPromises()
      wrapper.findComponent(ProductivityChart).vm.$emit('level-changed', 'week')
      await flushPromises()
      expect(wrapper.vm.$route.query.view).toBe('week')
      expect(wrapper.vm.$route.query.period).toBeUndefined()
      wrapper.unmount()
    })

    it('keeps the month up to today in the current year', async () => {
      const wrapper = await mountProductivity({
        year: String(today.year - 1),
        month: '12',
        period: '3'
      })
      await flushPromises()
      wrapper
        .findComponent(ProductivityChart)
        .vm.$emit('period-changed', { year: today.year, month: 12 })
      await flushPromises()
      expect(wrapper.vm.$route.query).toMatchObject({
        year: String(today.year),
        month: String(today.month)
      })
      expect(wrapper.vm.$route.query.period).toBeUndefined()
      wrapper.unmount()
    })

    it('opens the person panel on the clicked column', async () => {
      const loadAggregatedPersonTimeSpents = vi.fn(() => [
        { id: 'task-1', duration: 60, task_type_id: 'type-1' },
        { id: 'task-2', duration: 0, task_type_id: 'type-1' },
        { id: 'task-3', duration: 30, task_type_id: 'type-2' }
      ])
      const wrapper = await mountProductivity(
        { view: 'day', year: '2026', month: '2', taskTypeId: 'type-1' },
        { actions: { loadAggregatedPersonTimeSpents } }
      )
      await flushPromises()
      expect(wrapper.findComponent(PeopleTimesheetInfo).exists()).toBe(false)

      wrapper.findComponent(ProductivityChart).vm.$emit('column-selected', 5)
      await flushPromises()

      expect(wrapper.vm.$route.query.period).toBe('5')
      expect(loadAggregatedPersonTimeSpents.mock.calls[0][1]).toMatchObject({
        personId: 'user-1',
        detailLevel: 'day',
        year: 2026,
        month: 2,
        day: 5
      })
      const panel = wrapper.findComponent(PeopleTimesheetInfo)
      expect(panel.props()).toMatchObject({
        level: 'day',
        year: 2026,
        month: 2,
        day: 5,
        tasks: [{ id: 'task-1', duration: 60, task_type_id: 'type-1' }]
      })
      expect(wrapper.findComponent(ProductivityChart).props('selectedIndex')).toBe(
        5
      )
      wrapper.unmount()
    })

    it('passes the week of a week column to the panel', async () => {
      const loadAggregatedPersonDaysOff = vi.fn(() => [])
      const wrapper = await mountProductivity(
        { view: 'week', year: '2026', period: '12' },
        { actions: { loadAggregatedPersonDaysOff } }
      )
      await flushPromises()
      expect(wrapper.findComponent(PeopleTimesheetInfo).props()).toMatchObject(
        { level: 'week', year: 2026, week: 12 }
      )
      expect(loadAggregatedPersonDaysOff).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ detailLevel: 'week', year: 2026, week: 12 })
      )
      wrapper.unmount()
    })

    // the phone stacking of the side column applies to this tab only
    it.each([
      ['productivity', true],
      ['todos', false],
      ['calendar', false]
    ])('marks the page of the %s tab: %s', async (section, expected) => {
      const wrapper = await mountProductivity({ section })
      expect(wrapper.find('.columns').classes('is-productivity')).toBe(
        expected
      )
      wrapper.unmount()
    })

    it('keeps the rows of the latest load', async () => {
      let resolveFirst
      const loadUserTimeSpentsByPeriod = vi
        .fn()
        .mockImplementationOnce(
          () => new Promise(resolve => (resolveFirst = resolve))
        )
        .mockResolvedValue([{ duration: 120 }])
      const wrapper = await mountProductivity(
        { view: 'day', year: '2026', month: '2' },
        { actions: { loadUserTimeSpentsByPeriod } }
      )
      await flushPromises()
      wrapper.findComponent(ProductivityChart).vm.$emit('level-changed', 'week')
      await flushPromises()
      resolveFirst([{ duration: 60 }])
      await flushPromises()
      const chart = wrapper.findComponent(ProductivityChart)
      expect(chart.props('timeSpents')).toEqual([{ duration: 120 }])
      expect(chart.props('isLoading')).toBe(false)
      wrapper.unmount()
    })

    it('keeps the panel tasks of the latest period', async () => {
      let resolveFirst
      const loadAggregatedPersonTimeSpents = vi
        .fn()
        .mockImplementationOnce(
          () => new Promise(resolve => (resolveFirst = resolve))
        )
        .mockResolvedValue([{ id: 'task-2', duration: 30 }])
      const wrapper = await mountProductivity(
        { view: 'day', year: '2026', month: '2', period: '3' },
        { actions: { loadAggregatedPersonTimeSpents } }
      )
      await flushPromises()
      wrapper.findComponent(ProductivityChart).vm.$emit('column-selected', 4)
      await flushPromises()
      resolveFirst([{ id: 'task-1', duration: 60 }])
      await flushPromises()
      const panel = wrapper.findComponent(PeopleTimesheetInfo)
      expect(panel.props('tasks')).toEqual([{ id: 'task-2', duration: 30 }])
      expect(panel.props('isLoading')).toBe(false)
      wrapper.unmount()
    })

    it('closes the panel by dropping the period', async () => {
      const wrapper = await mountProductivity({
        view: 'month',
        year: '2026',
        period: '4'
      })
      await flushPromises()
      const panel = wrapper.findComponent(PeopleTimesheetInfo)
      expect(panel.props('month')).toBe(4)
      const closeRoute = panel.props('closeRoute')
      expect(closeRoute.query.period).toBeUndefined()
      expect(closeRoute.query).toMatchObject({
        section: 'productivity',
        view: 'month',
        year: '2026'
      })
      wrapper.unmount()
    })
  })
})
