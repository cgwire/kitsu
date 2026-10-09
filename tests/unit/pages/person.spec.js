import moment from 'moment-timezone'
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

import KanbanBoard from '@/components/lists/KanbanBoard.vue'
import TimesheetList from '@/components/lists/TimesheetList.vue'
import Person from '@/components/pages/Person.vue'
import PeopleTimesheetInfo from '@/components/sides/PeopleTimesheetInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ProductivityChart from '@/components/widgets/ProductivityChart.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import UserCalendar from '@/components/widgets/UserCalendar.vue'

const person = { id: 'person-1', name: 'Jane Doe', is_bot: false }
const otherUser = { id: 'user-2', name: 'John Doe' }

const modeling = { id: 'type-1', name: 'Modeling' }
const rigging = { id: 'type-2', name: 'Rigging' }
const taskTypeMap = new Map(
  [modeling, rigging].map(taskType => [taskType.id, taskType])
)

const SearchFieldStub = {
  props: ['focusOptions'],
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

const mountPage = async ({
  actions = {},
  getters = {},
  query = {},
  tasks = []
} = {}) => {
  const store = createStore({
    getters: {
      displayedPersonDoneTasks: () => [],
      displayedPersonTasks: () => tasks,
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
      user: () => person,
      ...getters
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
      stubs: { SearchField: SearchFieldStub, TodosList: TodosListStub }
    }
  })
  await flushPromises()
  return wrapper
}

const tabNames = wrapper =>
  wrapper
    .findComponent(RouteSectionTabs)
    .props('tabs')
    .map(tab => tab.name)

const combo = (wrapper, label) =>
  wrapper.findAllComponents(ComboboxStyled).find(c => c.props('label') === label)

describe('Person page', () => {
  afterEach(() => localStorage.removeItem('person:filters'))

  describe('filters panel', () => {
    it('labels the search and folds the filters behind a funnel', async () => {
      const wrapper = await mountPage()
      const filters = wrapper.find('.todos-filters')
      expect(filters.exists()).toBe(true)
      expect(filters.find('.search-field-column .label').text()).toBe(
        'main.search_query'
      )
      const toggle = wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.classes('filters-toggle'))
      expect(toggle.props('icon')).toBe('funnel')
      wrapper.unmount()
    })

    it('shows the zoom on the schedule tab only', async () => {
      const wrapper = await mountPage()
      expect(wrapper.findComponent(ComboboxNumber).exists()).toBe(false)
      wrapper.unmount()

      const schedule = await mountPage({ query: { section: 'schedule' } })
      const zoom = schedule.findComponent(ComboboxNumber)
      expect(zoom.exists()).toBe(true)
      expect(
        schedule.find('.todos-filters').element.contains(zoom.element)
      ).toBe(true)
      schedule.unmount()
    })

    it('folds the filters on a phone until the funnel opens them', async () => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
          matches: true,
          addEventListener: () => {},
          removeEventListener: () => {}
        }))
      )
      const wrapper = await mountPage()
      const filters = wrapper.find('.todos-filters')
      expect(filters.classes()).toContain('collapsed')
      await wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.classes('filters-toggle'))
        .vm.$emit('click')
      expect(filters.classes()).not.toContain('collapsed')
      wrapper.unmount()
      vi.unstubAllGlobals()
    })

    // the autofocus would scroll the avatar header out of view
    it('focuses the search without scrolling the page', async () => {
      const wrapper = await mountPage()
      expect(
        wrapper.findComponent(SearchFieldStub).props('focusOptions')
      ).toEqual({ preventScroll: true })
      wrapper.unmount()
    })

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

      it('hides the validated tab', async () => {
        mockPhone(true)
        const wrapper = await mountPage()
        expect(tabNames(wrapper)).not.toContain('done')
        expect(tabNames(wrapper)).toContain('timesheets')
        wrapper.unmount()
      })

      it('opens the tasks tab from a validated tab URL', async () => {
        mockPhone(true)
        const wrapper = await mountPage({ query: { section: 'done' } })
        expect(wrapper.vm.activeTab).toBe('todos')
        expect(wrapper.find('.done-list').exists()).toBe(false)
        wrapper.unmount()
      })

      it('leaves the validated tab when the screen shrinks', async () => {
        let onChange
        vi.stubGlobal(
          'matchMedia',
          vi.fn(() => ({
            matches: false,
            addEventListener: (_, listener) => (onChange = listener),
            removeEventListener: () => {}
          }))
        )
        const wrapper = await mountPage({ query: { section: 'done' } })
        expect(wrapper.vm.activeTab).toBe('done')
        onChange({ matches: true })
        await flushPromises()
        expect(wrapper.vm.activeTab).toBe('todos')
        wrapper.unmount()
      })

      it('keeps the validated tab on a large screen', async () => {
        mockPhone(false)
        const wrapper = await mountPage({ query: { section: 'done' } })
        expect(tabNames(wrapper)).toContain('done')
        expect(wrapper.vm.activeTab).toBe('done')
        wrapper.unmount()
      })
    })

    it('restores the stored production the person works on', async () => {
      const production = { id: 'prod-1', name: 'Prod', team: [person.id] }
      localStorage.setItem(
        'person:filters',
        JSON.stringify({ productionId: production.id })
      )
      const wrapper = await mountPage({
        getters: {
          openProductions: () => [production],
          productionMap: () => new Map([[production.id, production]])
        }
      })
      await flushPromises()
      expect(wrapper.vm.$route.query.productionId).toBe(production.id)
      wrapper.unmount()
    })

    it('skips a stored production the person does not work on', async () => {
      localStorage.setItem(
        'person:filters',
        JSON.stringify({ productionId: 'prod-2' })
      )
      const wrapper = await mountPage()
      await flushPromises()
      expect(wrapper.vm.$route.query.productionId).toBeUndefined()
      wrapper.unmount()
    })

    it('keeps the sort options of the page', async () => {
      const wrapper = await mountPage()
      const sort = combo(wrapper, 'main.sorted_by')
      expect(sort.props('modelValue')).toBe('entity_name')
      expect(sort.props('options').map(option => option.value)).toEqual([
        'entity_name',
        'priority',
        'task_status_short_name',
        'start_date',
        'due_date',
        'estimation',
        'last_comment_date'
      ])
      wrapper.unmount()
    })
  })

  describe('task type filter', () => {
    const modelingTask = { id: 'task-1', task_type_id: 'type-1' }
    const riggingTask = { id: 'task-2', task_type_id: 'type-2' }

    it('keeps the tasks of the picked task type', async () => {
      const wrapper = await mountPage({
        getters: { taskTypeMap: () => taskTypeMap },
        tasks: [modelingTask, riggingTask]
      })
      const ids = wrapper
        .findComponent(ComboboxTaskType)
        .props('taskTypeList')
        .map(taskType => taskType.id)
      expect(ids).toEqual(['', 'type-1', 'type-2'])
      await wrapper
        .findComponent(ComboboxTaskType)
        .vm.$emit('update:modelValue', 'type-2')
      expect(wrapper.vm.sortedTasks).toEqual([riggingTask])
      wrapper.unmount()
    })
  })

  describe('due date filter', () => {
    const dueOn = (id, date) => ({ id, due_date: date.format('YYYY-MM-DD') })
    const thisWeekTask = dueOn('task-3', moment().startOf('week').add(1, 'day'))
    const lastWeekTask = dueOn(
      'task-4',
      moment().startOf('week').subtract(1, 'week').add(1, 'day')
    )

    it('keeps the tasks due last week', async () => {
      const wrapper = await mountPage({ tasks: [thisWeekTask, lastWeekTask] })
      await combo(wrapper, 'tasks.fields.due_date').vm.$emit(
        'update:modelValue',
        'due_previous_week'
      )
      expect(wrapper.vm.sortedTasks).toEqual([lastWeekTask])
      wrapper.unmount()
    })
  })

  describe('filters in the URL', () => {
    const typedTasks = [
      { id: 'task-1', task_type_id: 'type-1' },
      { id: 'task-2', task_type_id: 'type-2' }
    ]

    it('reads the filters from the URL', async () => {
      const wrapper = await mountPage({
        getters: { taskTypeMap: () => taskTypeMap },
        query: { taskTypeId: 'type-2', due: 'due_this_week', sort: 'due_date' },
        tasks: typedTasks
      })
      expect(wrapper.findComponent(ComboboxTaskType).props('modelValue')).toBe(
        'type-2'
      )
      expect(combo(wrapper, 'tasks.fields.due_date').props('modelValue')).toBe(
        'due_this_week'
      )
      expect(combo(wrapper, 'main.sorted_by').props('modelValue')).toBe(
        'due_date'
      )
      wrapper.unmount()
    })

    it('falls back on the filters picked last time', async () => {
      localStorage.setItem(
        'person:filters',
        JSON.stringify({ taskTypeId: 'type-1', due: 'due_previous_week' })
      )
      const wrapper = await mountPage({
        getters: { taskTypeMap: () => taskTypeMap },
        tasks: typedTasks
      })
      expect(wrapper.findComponent(ComboboxTaskType).props('modelValue')).toBe(
        'type-1'
      )
      expect(combo(wrapper, 'tasks.fields.due_date').props('modelValue')).toBe(
        'due_previous_week'
      )
      wrapper.unmount()
    })

    // the stored filters are shared by every person page
    it('drops a stored task type the person has no task of', async () => {
      localStorage.setItem(
        'person:filters',
        JSON.stringify({ taskTypeId: 'type-2' })
      )
      const wrapper = await mountPage({
        getters: { taskTypeMap: () => taskTypeMap },
        tasks: [typedTasks[0]]
      })
      await flushPromises()
      expect(wrapper.findComponent(ComboboxTaskType).props('modelValue')).toBe(
        ''
      )
      expect(wrapper.vm.sortedTasks).toEqual([typedTasks[0]])
      wrapper.unmount()
    })

    it('writes the picked filters in the URL and the storage', async () => {
      const wrapper = await mountPage()
      await wrapper
        .findComponent(ComboboxTaskType)
        .vm.$emit('update:modelValue', 'type-1')
      await combo(wrapper, 'tasks.fields.due_date').vm.$emit(
        'update:modelValue',
        'due_this_week'
      )
      await combo(wrapper, 'main.sorted_by').vm.$emit(
        'update:modelValue',
        'priority'
      )
      await flushPromises()
      const filters = {
        taskTypeId: 'type-1',
        due: 'due_this_week',
        sort: 'priority'
      }
      expect(wrapper.vm.$route.query).toMatchObject(filters)
      expect(JSON.parse(localStorage.getItem('person:filters'))).toMatchObject(
        filters
      )
      expect(localStorage.getItem('todos:filters')).toBeNull()
      wrapper.unmount()
    })
  })

  describe('panels', () => {
    it.each([
      ['todos', '.todos-panel'],
      ['done', '.done-list.todos-panel'],
      ['schedule', '.schedule-panel.todos-panel'],
      ['calendar', '.calendar-panel']
    ])('wraps the %s tab in its panel', async (section, selector) => {
      const wrapper = await mountPage({ query: { section } })
      expect(wrapper.find(`.task-page ${selector}`).exists()).toBe(true)
      wrapper.unmount()
    })

    it('wraps the board in its panel', async () => {
      const wrapper = await mountPage({ query: { section: 'board' } })
      const board = wrapper.findComponent(KanbanBoard)
      expect(board.element.parentElement.classList).toContain('board-panel')
      expect(board.element.parentElement.classList).toContain('todos-panel')
      wrapper.unmount()
    })

    it('puts the calendar inside its panel', async () => {
      const wrapper = await mountPage({ query: { section: 'calendar' } })
      const calendar = wrapper.findComponent(UserCalendar)
      expect(calendar.element.parentElement.classList).toContain(
        'calendar-panel'
      )
      wrapper.unmount()
    })

    it('keeps the estimations and dates editable', async () => {
      const wrapper = await mountPage()
      expect(
        wrapper.findComponent(TodosListStub).attributes('editable')
      ).toBeUndefined()
      wrapper.unmount()
    })

    it.each(['timesheets', 'calendar', 'productivity'])(
      'attaches the filters to the header of the %s tab',
      async section => {
        const wrapper = await mountPage({
          actions: { loadPersonTimeSpentsByPeriod: vi.fn(() => []) },
          query: { section }
        })
        expect(wrapper.find('.todos-filters').classes()).toContain(
          'is-attached'
        )
        wrapper.unmount()
      }
    )

    it('leaves the filters apart when the timelog is not shown', async () => {
      const wrapper = await mountPage({
        getters: { user: () => otherUser },
        query: { section: 'timesheets' }
      })
      expect(wrapper.findComponent(TimesheetList).exists()).toBe(false)
      expect(wrapper.find('.todos-filters').classes()).not.toContain(
        'is-attached'
      )
      wrapper.unmount()
    })

    it('leaves the filters apart on the task list', async () => {
      const wrapper = await mountPage()
      expect(wrapper.find('.todos-filters').classes()).not.toContain(
        'is-attached'
      )
      wrapper.unmount()
    })
  })

  describe('productivity tab', () => {
    const roles = {
      admin: { isCurrentUserAdmin: () => true },
      manager: { isCurrentUserManager: () => true },
      supervisor: { isCurrentUserSupervisor: () => true }
    }

    it.each(Object.keys(roles))('shows to a %s', async role => {
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpentsByPeriod: vi.fn(() => []) },
        getters: { ...roles[role], user: () => otherUser }
      })
      expect(tabNames(wrapper)).toContain('productivity')
      wrapper.unmount()
    })

    it('shows to the person', async () => {
      const wrapper = await mountPage()
      expect(tabNames(wrapper)).toContain('productivity')
      wrapper.unmount()
    })

    it('hides from another artist', async () => {
      const loadPersonTimeSpentsByPeriod = vi.fn(() => [])
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpentsByPeriod },
        getters: { user: () => otherUser },
        query: { section: 'productivity' }
      })
      expect(tabNames(wrapper)).not.toContain('productivity')
      expect(wrapper.findComponent(ProductivityChart).exists()).toBe(false)
      expect(loadPersonTimeSpentsByPeriod).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('loads nothing for a bot', async () => {
      const bot = { ...person, is_bot: true }
      const loadPersonTimeSpentsByPeriod = vi.fn(() => [])
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpentsByPeriod },
        getters: {
          isCurrentUserAdmin: () => true,
          personMap: () => new Map([[bot.id, bot]]),
          user: () => otherUser
        },
        query: { section: 'productivity' }
      })
      expect(loadPersonTimeSpentsByPeriod).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('loads nothing for a viewer without access', async () => {
      const loadPersonTimeSpentsByPeriod = vi.fn(() => [])
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpentsByPeriod },
        getters: {
          isCurrentUserClient: () => true,
          isCurrentUserManager: () => true,
          user: () => otherUser
        },
        query: { section: 'productivity' }
      })
      expect(loadPersonTimeSpentsByPeriod).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('charts the quotas of the productions of the person', async () => {
      const own = { id: 'prod-1', name: 'Own', team: [person.id] }
      const other = { id: 'prod-2', name: 'Other', team: [otherUser.id] }
      const loadPersonQuotas = vi.fn(() => ({}))
      const wrapper = await mountPage({
        actions: { loadPersonQuotas },
        getters: {
          isCurrentUserManager: () => true,
          openProductions: () => [own, other],
          productionMap: () => new Map([own, other].map(p => [p.id, p])),
          user: () => otherUser
        },
        query: { section: 'productivity', metric: 'quotas' }
      })
      await flushPromises()
      expect(
        loadPersonQuotas.mock.calls.map(([, payload]) => payload.productionId)
      ).toEqual([own.id])
      wrapper.unmount()
    })

    it('loads the time spents of the person', async () => {
      const loadPersonTimeSpentsByPeriod = vi.fn(() => [{ duration: 60 }])
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpentsByPeriod },
        getters: { isCurrentUserManager: () => true, user: () => otherUser },
        query: { section: 'productivity', view: 'day', year: '2026', month: '2' }
      })
      await flushPromises()
      expect(loadPersonTimeSpentsByPeriod.mock.calls[0][1]).toEqual({
        personId: person.id,
        startDate: '2026-02-01',
        endDate: '2026-02-28'
      })
      expect(
        wrapper.findComponent(ProductivityChart).props('timeSpents')
      ).toEqual([{ duration: 60 }])
      wrapper.unmount()
    })

    it('opens the person panel on the clicked column', async () => {
      const loadAggregatedPersonTimeSpents = vi.fn(() => [
        { id: 'task-1', duration: 60 }
      ])
      const wrapper = await mountPage({
        actions: {
          loadAggregatedPersonTimeSpents,
          loadPersonTimeSpentsByPeriod: vi.fn(() => [])
        },
        getters: { isCurrentUserManager: () => true, user: () => otherUser },
        query: { section: 'productivity', view: 'day', year: '2026', month: '2' }
      })
      expect(wrapper.findComponent(PeopleTimesheetInfo).exists()).toBe(false)

      wrapper.findComponent(ProductivityChart).vm.$emit('column-selected', 5)
      await flushPromises()

      expect(wrapper.vm.$route.query.period).toBe('5')
      expect(loadAggregatedPersonTimeSpents.mock.calls[0][1]).toMatchObject({
        personId: person.id,
        detailLevel: 'day',
        year: 2026,
        month: 2,
        day: 5
      })
      const panel = wrapper.findComponent(PeopleTimesheetInfo)
      expect(panel.props()).toMatchObject({
        person,
        day: 5,
        tasks: [{ id: 'task-1', duration: 60 }]
      })
      wrapper.unmount()
    })
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
