import moment from 'moment-timezone'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { nextTick, reactive, ref } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
// the parameters of a message show in its text
vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({
    t: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key)
  })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'
import { markRequestFailure } from '@/lib/errors'

import KanbanBoard from '@/components/lists/KanbanBoard.vue'
import TimesheetList from '@/components/lists/TimesheetList.vue'
import Person from '@/components/pages/Person.vue'
import PeopleTimesheetInfo from '@/components/sides/PeopleTimesheetInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'
import ProductivityChart from '@/components/widgets/ProductivityChart.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import UserCalendar from '@/components/widgets/UserCalendar.vue'

import { buildRefusal } from '../fixtures/refusal'
import { buildSearchQueryListStub } from '../fixtures/search-query-list'

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
  onRouter = () => {},
  query = {},
  stubs = {},
  tasks = []
} = {}) => {
  const store = createStore({
    state: () => ({ personTimeSpentKey: null }),
    getters: {
      canReadDaysOff: () => () => true,
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
      personTimeSpentKey: state => state.personTimeSpentKey,
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
      loadPersonTasks: vi.fn(({ commit }, { personId, date }) =>
        commit('PERSON_LOAD_TIME_SPENTS_END', { personId, date, timeSpents: [] })
      ),
      setPersonTasksSearch: vi.fn(),
      ...actions
    },
    mutations: {
      LOAD_PERSON_TASKS_END: () => {},
      PERSON_LOAD_TIME_SPENTS_END: (state, { personId, date }) => {
        state.personTimeSpentKey = `${personId}/${date}`
      }
    }
  })
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/people/:person_id', component: { template: '<div />' } }]
  })
  await router.push({ path: `/people/${person.id}`, query })
  onRouter(router)
  const wrapper = shallowMount(Person, {
    global: {
      plugins: [
        store,
        router,
        {
          install: app => {
            app.config.globalProperties.$socket = { on: vi.fn(), off: vi.fn() }
          }
        }
      ],
      stubs: {
        SearchField: SearchFieldStub,
        TodosList: TodosListStub,
        ...stubs
      }
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
  afterEach(() => {
    localStorage.removeItem('person:filters')
    localStorage.removeItem('person:section')
  })

  describe('saved searches', () => {
    it('opens the search filter modal on Save', async () => {
      const SearchQueryList = buildSearchQueryListStub()
      const wrapper = await mountPage({ stubs: { SearchQueryList } })

      wrapper.findComponent(SearchFieldStub).vm.$emit('save', 'late')

      expect(SearchQueryList.methods.addSearch).toHaveBeenCalledWith('late')
      wrapper.unmount()
    })
  })

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

    // Folded, they hide the list that holds the search filter modal.
    it('unfolds the filters on Save', async () => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
          matches: true,
          addEventListener: () => {},
          removeEventListener: () => {}
        }))
      )
      const wrapper = await mountPage({
        stubs: { SearchQueryList: buildSearchQueryListStub() }
      })

      await wrapper.findComponent(SearchFieldStub).vm.$emit('save', 'late')

      expect(wrapper.find('.todos-filters').classes()).not.toContain(
        'collapsed'
      )
      wrapper.unmount()
      vi.unstubAllGlobals()
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

      // The productivity tab has nothing to fold
      it('keeps the filters shown on the productivity tab', async () => {
        mockPhone(true)
        const wrapper = await mountPage({
          actions: { loadPersonTimeSpentsByPeriod: vi.fn(() => []) },
          query: { section: 'productivity' }
        })
        expect(wrapper.find('.todos-filters').classes()).not.toContain(
          'collapsed'
        )
        expect(wrapper.find('.filters-toggle').exists()).toBe(false)
        wrapper.unmount()
      })

      it('folds the filters of the tasks tab', async () => {
        mockPhone(true)
        const wrapper = await mountPage()
        expect(wrapper.find('.todos-filters').classes()).toContain('collapsed')
        expect(wrapper.find('.filters-toggle').exists()).toBe(true)
        wrapper.unmount()
      })

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

  // The page builds the rows of its schedule from the tasks of the person,
  // and the widget moves a bar by setting the dates of its row.
  describe('schedule tab', () => {
    let rafSpy

    beforeEach(() => {
      rafSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation(callback => {
          callback()
          return 0
        })
    })

    afterEach(() => {
      rafSpy.mockRestore()
    })

    const plannedTask = {
      id: 'task-1',
      project_id: 'production-1',
      task_type_id: 'type-1',
      task_status_id: 'status-1',
      full_entity_name: 'SH01',
      estimation: 0,
      start_date: '2026-08-03',
      due_date: '2026-08-05'
    }

    const mountSchedule = ({
      tasks = [plannedTask],
      updateTask = vi.fn(() => Promise.resolve())
    } = {}) =>
      mountPage({
        actions: { updateTask },
        getters: {
          currentProduction: () => null,
          dateFormat: () => 'YYYY-MM-DD',
          departmentMap: () => new Map(),
          displayedPersonDoneTasks: () => [],
          isCurrentUserManager: () => true,
          isCurrentUserProductionManager: () => true,
          isDarkTheme: () => false,
          milestonesByDate: () => ({}),
          organisation: () => ({ hours_by_day: 8 }),
          productionMap: () =>
            new Map([
              ['production-1', { id: 'production-1', name: 'Production' }]
            ]),
          taskTypeMap: () =>
            new Map([['type-1', { ...modeling, color: '#4a90e2' }]])
        },
        query: { section: 'schedule' },
        stubs: { Schedule: false, ScheduleEntityRow: false },
        tasks
      })

    const taskBar = (wrapper, name = '') =>
      wrapper
        .findAll('.child-line .timebar')
        .find(
          bar =>
            bar.find('.timebar-center').exists() &&
            bar.attributes('title').includes(name)
        )

    // zoom level 1 is 20px a day: a 60px drag is 3 days
    it('moves the dragged bar along with the mouse', async () => {
      const wrapper = await mountSchedule()
      expect(taskBar(wrapper).attributes('title')).toContain('(2026-08-03 - ')

      await taskBar(wrapper)
        .find('.timebar-center')
        .trigger('mousedown', { clientX: 300 })
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 360 })
      )
      await nextTick()

      const title = taskBar(wrapper).attributes('title')
      document.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX: 360 })
      )
      wrapper.unmount()
      expect(title).toContain('(2026-08-06 - ')
    })

    // A bar whose save Zou refuses goes back where the drag found it, and a
    // line above the schedule says so.
    it('puts back a bar whose save Zou refuses, and says so', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = await mountSchedule({
        updateTask: vi.fn(() => Promise.reject(buildRefusal(403)))
      })

      await taskBar(wrapper)
        .find('.timebar-center')
        .trigger('mousedown', { clientX: 300 })
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 360 })
      )
      document.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX: 360 })
      )
      await flushPromises()

      const title = taskBar(wrapper).attributes('title')
      const error = wrapper.findComponent(ErrorText)
      const text = error.exists() ? error.props('text') : null
      const classes = error.exists() ? error.classes() : []
      wrapper.unmount()
      expect(title).toContain('(2026-08-03 - ')
      expect(text).toBe('main.cell_save_error {"name":"SH01 / Modeling"}')
      expect(classes).toContain('has-text-centered')
    })

    // A typed estimation Zou refuses goes back, and the man-days of the row
    // add up its bars again.
    it('recounts the man-days of the row after a refused estimation', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = await mountSchedule({
        updateTask: vi.fn(() => Promise.reject(buildRefusal(403)))
      })
      const [row] = wrapper.findComponent({ name: 'Schedule' }).props('hierarchy')
      // a total only a recount can bring back to that of the bars
      row.man_days = 123

      await wrapper.find('.child-line .man-days-unit-wrapper input').setValue('2')
      await flushPromises()

      const [bar] = row.children
      const values = [bar.estimation, row.man_days]
      wrapper.unmount()
      expect(values).toEqual([0, 0])
    })

    // The range of the schedule frames the first and last tasks: read from
    // the rows the drag changes, it slid the whole timeline under the mouse.
    it('keeps the range of the schedule during a drag', async () => {
      const wrapper = await mountSchedule()
      const rangeStart = () =>
        wrapper
          .findComponent({ name: 'Schedule' })
          .props('startDate')
          .format('YYYY-MM-DD')
      const start = rangeStart()

      await taskBar(wrapper)
        .find('.timebar-center')
        .trigger('mousedown', { clientX: 300 })
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 360 })
      )
      await nextTick()

      const startDuringDrag = rangeStart()
      document.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX: 360 })
      )
      wrapper.unmount()
      expect(startDuringDrag).toBe(start)
    })

    // Each task:update event reloads its task, the echo of the previous save
    // included: rows rebuilt from the store no longer held the bar the widget
    // moves, and the bar jumped back to its dates until the drop.
    it('keeps the dragged bar when a task reloads during the drag', async () => {
      const tasks = reactive([{ ...plannedTask }])
      const wrapper = await mountSchedule({ tasks })

      await taskBar(wrapper)
        .find('.timebar-center')
        .trigger('mousedown', { clientX: 300 })
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 360 })
      )
      // Zou sends the dates as datetimes
      Object.assign(tasks[0], {
        start_date: '2026-08-03T00:00:00',
        due_date: '2026-08-05T00:00:00'
      })
      await nextTick()
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 400 })
      )
      await nextTick()

      const title = taskBar(wrapper).attributes('title')
      document.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX: 400 })
      )
      wrapper.unmount()
      expect(title).toContain('(2026-08-08 - ')
    })

    // a click selects a bar: rebuilding every row for it would lag on people
    // with hundreds of tasks
    it('keeps the rows on a click on a bar', async () => {
      const wrapper = await mountSchedule()
      const rows = () =>
        wrapper.findComponent({ name: 'Schedule' }).props('hierarchy')
      const rowsBefore = rows()

      await taskBar(wrapper)
        .find('.timebar-center')
        .trigger('mousedown', { clientX: 300 })
      document.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX: 300 })
      )
      await nextTick()

      const rowsAfter = rows()
      wrapper.unmount()
      expect(rowsAfter).toBe(rowsBefore)
    })

    // a reload during the drag waits for the drop, and is not lost
    it('shows a task reloaded during the drag once the bar is dropped', async () => {
      const tasks = reactive([
        { ...plannedTask },
        {
          ...plannedTask,
          id: 'task-2',
          full_entity_name: 'SH02',
          start_date: '2026-08-10',
          due_date: '2026-08-12'
        }
      ])
      const wrapper = await mountSchedule({ tasks })

      await taskBar(wrapper, 'SH01')
        .find('.timebar-center')
        .trigger('mousedown', { clientX: 300 })
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 360 })
      )
      await nextTick()
      Object.assign(tasks[1], {
        start_date: '2026-08-17T00:00:00',
        due_date: '2026-08-19T00:00:00'
      })
      await nextTick()
      const titleDuringDrag = taskBar(wrapper, 'SH02').attributes('title')
      document.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX: 360 })
      )
      await nextTick()

      const titleAfterDrop = taskBar(wrapper, 'SH02').attributes('title')
      wrapper.unmount()
      expect(titleDuringDrag).toContain('(2026-08-10 - ')
      expect(titleAfterDrop).toContain('(2026-08-17 - ')
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
        tasks: [{ id: 'task-1', duration: 60 }],
        withDaysOff: true
      })
      wrapper.unmount()
    })

    // Zou refuses the days off of the person to some viewers; the day level
    // reads none
    it('shows the time of the clicked month to a viewer refused the days off', async () => {
      const loadAggregatedPersonDaysOff = vi.fn(() =>
        Promise.reject(new Error('Forbidden'))
      )
      const wrapper = await mountPage({
        actions: {
          loadAggregatedPersonDaysOff,
          loadAggregatedPersonTimeSpents: vi.fn(() => [
            { id: 'task-1', duration: 60 }
          ]),
          loadPersonTimeSpentsByPeriod: vi.fn(() => [])
        },
        getters: {
          canReadDaysOff: () => () => false,
          isCurrentUserSupervisor: () => true,
          user: () => otherUser
        },
        query: { section: 'productivity', view: 'month', year: '2026' }
      })

      wrapper.findComponent(ProductivityChart).vm.$emit('column-selected', 10)
      await flushPromises()

      expect(loadAggregatedPersonDaysOff).not.toHaveBeenCalled()
      expect(wrapper.findComponent(PeopleTimesheetInfo).props()).toMatchObject({
        month: 10,
        dayOffs: [],
        isLoadingError: false,
        tasks: [{ id: 'task-1', duration: 60 }],
        withDaysOff: false
      })
      wrapper.unmount()
    })

    // the rule can change under an open panel, as when the viewer gets a
    // new role: the panel shows the days off count of its own load
    it('shows the days off count once a load reads them', async () => {
      const isAllowed = ref(false)
      const loadAggregatedPersonDaysOff = vi.fn(() => [])
      const wrapper = await mountPage({
        actions: {
          loadAggregatedPersonDaysOff,
          loadAggregatedPersonTimeSpents: vi.fn(() => []),
          loadPersonTimeSpentsByPeriod: vi.fn(() => [])
        },
        getters: {
          canReadDaysOff: () => () => isAllowed.value,
          isCurrentUserSupervisor: () => true,
          user: () => otherUser
        },
        query: { section: 'productivity', view: 'month', year: '2026' }
      })
      const chart = wrapper.findComponent(ProductivityChart)
      chart.vm.$emit('column-selected', 10)
      await flushPromises()
      const panel = wrapper.findComponent(PeopleTimesheetInfo)

      isAllowed.value = true
      await flushPromises()

      expect(panel.props('withDaysOff')).toBe(false)
      expect(loadAggregatedPersonDaysOff).not.toHaveBeenCalled()

      chart.vm.$emit('column-selected', 9)
      await flushPromises()

      expect(panel.props('withDaysOff')).toBe(true)
      expect(loadAggregatedPersonDaysOff.mock.calls[0][1]).toMatchObject({
        personId: person.id,
        month: 9
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

    // Each read answers on demand, and commits its person and day as the
    // store does
    const deferReads = () => {
      const reads = []
      const loadPersonTimeSpents = vi.fn(
        ({ commit }, { personId, date }) =>
          new Promise((resolve, reject) => {
            reads.push({
              answer: () => {
                commit('PERSON_LOAD_TIME_SPENTS_END', {
                  personId,
                  date,
                  timeSpents: []
                })
                resolve()
              },
              fail: reject
            })
          })
      )
      return { loadPersonTimeSpents, reads }
    }

    const manager = {
      isCurrentUserManager: () => true,
      personMap: () =>
        new Map([person, otherUser].map(people => [people.id, people]))
    }

    it('keeps the timesheet loading until the day picked last is read', async () => {
      const { loadPersonTimeSpents, reads } = deferReads()
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpents },
        query: { section: 'timesheets' }
      })
      const list = wrapper.findComponent(TimesheetList)

      list.vm.$emit('date-changed', new Date(2026, 9, 29))
      list.vm.$emit('date-changed', new Date(2026, 9, 28))
      await flushPromises()
      reads[0].answer()
      await flushPromises()

      expect(list.props('isLoading')).toBe(true)

      reads[1].answer()
      await flushPromises()

      expect(list.props('isLoading')).toBe(false)
      wrapper.unmount()
    })

    // The timesheet stays on screen while the tasks of a colleague opened
    // from another page load.
    it('keeps the timesheet loading for a day picked during the task load', async () => {
      let answerTasks = null
      const loadPersonTasks = vi.fn(({ commit }, { personId, date }) => {
        const commitDay = () =>
          commit('PERSON_LOAD_TIME_SPENTS_END', {
            personId,
            date,
            timeSpents: []
          })
        if (personId === person.id) return commitDay()
        return new Promise(resolve => {
          answerTasks = () => {
            commitDay()
            resolve()
          }
        })
      })
      const { loadPersonTimeSpents, reads } = deferReads()
      const wrapper = await mountPage({
        actions: { loadPersonTasks, loadPersonTimeSpents },
        getters: manager,
        query: { section: 'timesheets' }
      })
      await wrapper.vm.$router.push({
        path: `/people/${otherUser.id}`,
        query: { section: 'timesheets' }
      })
      await flushPromises()
      const list = wrapper.findComponent(TimesheetList)

      list.vm.$emit('date-changed', new Date(2026, 9, 29))
      await flushPromises()
      answerTasks()
      await flushPromises()

      expect(list.props('isLoading')).toBe(true)

      reads[0].answer()
      await flushPromises()

      expect(list.props('isLoading')).toBe(false)
      wrapper.unmount()
    })

    // A colleague's page opened on another day while a read for the person
    // left is still on its way
    it('keeps the timesheet loading when a read for the person left lands', async () => {
      const { loadPersonTimeSpents, reads } = deferReads()
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpents },
        getters: manager,
        query: { section: 'timesheets' }
      })
      wrapper
        .findComponent(TimesheetList)
        .vm.$emit('date-changed', new Date(2026, 9, 29))
      await flushPromises()
      await wrapper.vm.$router.push({
        path: `/people/${otherUser.id}`,
        query: { section: 'timesheets', day: '2026-10-28' }
      })
      await flushPromises()
      const list = wrapper.findComponent(TimesheetList)

      expect(list.props('isLoading')).toBe(false)

      list.vm.$emit('date-changed', new Date(2026, 9, 29))
      await flushPromises()
      reads[0].answer()
      await flushPromises()

      expect(list.props('isLoading')).toBe(true)

      reads[1].answer()
      await flushPromises()

      expect(list.props('isLoading')).toBe(false)
      wrapper.unmount()
    })

    // Back on a day before its first read came back: the second one shows it
    it('shows the day when another read of it fails', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const failure = new Error('timeout')
      markRequestFailure(failure)
      const { loadPersonTimeSpents, reads } = deferReads()
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpents },
        query: { section: 'timesheets' }
      })
      const list = wrapper.findComponent(TimesheetList)

      list.vm.$emit('date-changed', new Date(2026, 9, 29))
      list.vm.$emit('date-changed', new Date(2026, 9, 28))
      list.vm.$emit('date-changed', new Date(2026, 9, 29))
      await flushPromises()
      reads[2].answer()
      reads[0].fail(failure)
      await flushPromises()

      expect(consoleError).toHaveBeenCalledWith(failure)
      expect(list.props('isLoading')).toBe(false)
      expect(list.props('isError')).toBe(false)
      wrapper.unmount()
    })

    it('says that the time spents of the day could not be read', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const failure = new Error('timeout')
      markRequestFailure(failure)
      const { loadPersonTimeSpents, reads } = deferReads()
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpents },
        query: { section: 'timesheets' }
      })
      const list = wrapper.findComponent(TimesheetList)

      list.vm.$emit('date-changed', new Date(2026, 9, 29))
      await flushPromises()
      reads[0].fail(failure)
      await flushPromises()

      expect(consoleError).toHaveBeenCalledWith(failure)
      expect(list.props('isLoading')).toBe(true)
      expect(list.props('isError')).toBe(true)

      list.vm.$emit('date-changed', new Date(2026, 9, 28))
      await flushPromises()

      expect(list.props('isError')).toBe(false)

      reads[1].answer()
      await flushPromises()

      expect(list.props('isLoading')).toBe(false)

      // a new read of the day that failed
      list.vm.$emit('date-changed', new Date(2026, 9, 29))
      await flushPromises()

      expect(list.props('isLoading')).toBe(true)
      expect(list.props('isError')).toBe(false)
      wrapper.unmount()
    })

    // Two steps whose reads both fail, the one of the day shown first
    it('keeps saying that the day shown could not be read', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const failure = new Error('timeout')
      markRequestFailure(failure)
      const { loadPersonTimeSpents, reads } = deferReads()
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpents },
        query: { section: 'timesheets' }
      })
      const list = wrapper.findComponent(TimesheetList)

      list.vm.$emit('date-changed', new Date(2026, 9, 29))
      list.vm.$emit('date-changed', new Date(2026, 9, 28))
      await flushPromises()
      reads[1].fail(failure)
      await flushPromises()
      reads[0].fail(failure)
      await flushPromises()

      expect(consoleError).toHaveBeenCalledTimes(2)
      expect(list.props('isLoading')).toBe(true)
      expect(list.props('isError')).toBe(true)
      wrapper.unmount()
    })

    // The same day on a colleague's page, the read for the person left failing
    // last
    it('keeps saying that the day of the person shown could not be read', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const failure = new Error('timeout')
      markRequestFailure(failure)
      const { loadPersonTimeSpents, reads } = deferReads()
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpents },
        getters: manager,
        query: { section: 'timesheets' }
      })
      wrapper
        .findComponent(TimesheetList)
        .vm.$emit('date-changed', new Date(2026, 9, 29))
      await flushPromises()
      await wrapper.vm.$router.push({
        path: `/people/${otherUser.id}`,
        query: { section: 'timesheets', day: '2026-10-28' }
      })
      await flushPromises()
      const list = wrapper.findComponent(TimesheetList)
      list.vm.$emit('date-changed', new Date(2026, 9, 29))
      await flushPromises()
      reads[1].fail(failure)
      await flushPromises()
      reads[0].fail(failure)
      await flushPromises()

      expect(consoleError).toHaveBeenCalledTimes(2)
      expect(list.props('isLoading')).toBe(true)
      expect(list.props('isError')).toBe(true)
      wrapper.unmount()
    })
  })

  // Zou refuses them to an artist: no request for what it would refuse
  describe('time and days off reads', () => {
    const manager = { isCurrentUserManager: () => true, user: () => otherUser }
    const supervisor = {
      isCurrentUserSupervisor: () => true,
      user: () => otherUser
    }
    const artist = { user: () => otherUser }

    const timeOfTheDayRead = async getters => {
      const loadPersonTasks = vi.fn()
      const wrapper = await mountPage({ actions: { loadPersonTasks }, getters })
      wrapper.unmount()
      return loadPersonTasks.mock.calls[0][1]
    }

    it.each([
      ['the person', {}],
      ['a manager', manager]
    ])('reads the time of the day for %s', async (_, getters) => {
      expect(await timeOfTheDayRead(getters)).toMatchObject({
        personId: person.id,
        withTimeSpents: true
      })
    })

    // only the timelog shows it
    it.each([
      ['a supervisor', supervisor],
      ['another artist', artist]
    ])('reads no time of the day for %s', async (_, getters) => {
      expect(await timeOfTheDayRead(getters)).toMatchObject({
        personId: person.id,
        withTimeSpents: false
      })
    })

    const pickDay = async (getters, day) => {
      const loadPersonTimeSpents = vi.fn()
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpents },
        getters
      })
      await wrapper.vm.$router.push({
        query: { ...wrapper.vm.$route.query, day }
      })
      await flushPromises()
      wrapper.unmount()
      return loadPersonTimeSpents
    }

    it('reads the time of a day picked in the URL for the person', async () => {
      const loadPersonTimeSpents = await pickDay({}, '2026-10-30')
      expect(loadPersonTimeSpents.mock.calls[0][1]).toEqual({
        personId: person.id,
        date: '2026-10-30'
      })
    })

    it('reads no time of a day picked in the URL for another artist', async () => {
      const loadPersonTimeSpents = await pickDay(artist, '2026-10-30')
      expect(loadPersonTimeSpents).not.toHaveBeenCalled()
    })

    // Back from a colleague's page: the person and the day change together,
    // and the day is read for the person shown next only.
    it('reads the time of a new day for the person shown next', async () => {
      const loadPersonTasks = vi.fn()
      const loadPersonTimeSpents = vi.fn()
      const wrapper = await mountPage({
        actions: { loadPersonTasks, loadPersonTimeSpents },
        getters: {
          ...artist,
          personMap: () =>
            new Map([person, otherUser].map(people => [people.id, people]))
        },
        query: { day: '2026-10-29' }
      })

      await wrapper.vm.$router.push({
        path: `/people/${otherUser.id}`,
        query: { day: '2026-10-30' }
      })
      await flushPromises()
      wrapper.unmount()

      expect(loadPersonTimeSpents).not.toHaveBeenCalled()
      expect(loadPersonTasks.mock.calls.at(-1)[1]).toEqual({
        personId: otherUser.id,
        date: '2026-10-30',
        withTimeSpents: true
      })
    })

    const showCalendar = async getters => {
      const loadPersonTimeSpentsByPeriod = vi.fn(() => [{ duration: 60 }])
      const wrapper = await mountPage({
        actions: { loadPersonTimeSpentsByPeriod },
        getters,
        query: { section: 'calendar' }
      })
      const calendar = wrapper.findComponent(UserCalendar)
      calendar.vm.$emit('dates-changed', {
        start: '2026-10-26',
        end: '2026-12-06'
      })
      await flushPromises()
      const timeSpents = calendar.props('timeSpents')
      wrapper.unmount()
      return { loadPersonTimeSpentsByPeriod, timeSpents }
    }

    it.each([
      ['the person', {}],
      ['a supervisor', supervisor]
    ])('reads the time of the calendar for %s', async (_, getters) => {
      const { loadPersonTimeSpentsByPeriod, timeSpents } =
        await showCalendar(getters)
      expect(loadPersonTimeSpentsByPeriod.mock.calls[0][1]).toEqual({
        personId: person.id,
        startDate: '2026-10-26',
        endDate: '2026-12-06'
      })
      expect(timeSpents).toEqual([{ duration: 60 }])
    })

    it('reads no time of the calendar for another artist', async () => {
      const { loadPersonTimeSpentsByPeriod, timeSpents } =
        await showCalendar(artist)
      expect(loadPersonTimeSpentsByPeriod).not.toHaveBeenCalled()
      expect(timeSpents).toEqual([])
    })

    const daysOffRead = async getters => {
      const loadAggregatedPersonDaysOff = vi.fn(() => [])
      const wrapper = await mountPage({
        actions: { loadAggregatedPersonDaysOff },
        getters
      })
      wrapper.unmount()
      return loadAggregatedPersonDaysOff
    }

    // the user store holds the rule of Zou
    it('reads the days off of the person for a viewer the rule allows', async () => {
      const canReadDaysOff = vi.fn(personId => personId === person.id)
      const loadAggregatedPersonDaysOff = await daysOffRead({
        canReadDaysOff: () => canReadDaysOff,
        user: () => otherUser
      })
      expect(canReadDaysOff).toHaveBeenCalledWith(person.id)
      expect(loadAggregatedPersonDaysOff.mock.calls[0][1]).toEqual({
        personId: person.id
      })
    })

    // with the role and the team alone, the page would read them: it
    // follows the rule
    it('reads no days off for a supervisor of a production of the person the rule refuses', async () => {
      const loadAggregatedPersonDaysOff = await daysOffRead({
        canReadDaysOff: () => () => false,
        currentUserRoleForProduction: () => () => 'supervisor',
        openProductions: () => [
          { id: 'prod-1', name: 'Prod', team: [person.id, otherUser.id] }
        ],
        user: () => otherUser
      })
      expect(loadAggregatedPersonDaysOff).not.toHaveBeenCalled()
    })
  })

  describe('timelog tab', () => {
    const viewers = [
      ['the person', {}],
      ['a manager', { isCurrentUserManager: () => true, user: () => otherUser }]
    ]
    // the timelog shows them nothing
    const others = [
      [
        'a supervisor',
        { isCurrentUserSupervisor: () => true, user: () => otherUser }
      ],
      ['another artist', { user: () => otherUser }]
    ]

    const dayLinks = wrapper =>
      wrapper.findComponent(UserCalendar).props('withDayLinks')

    it.each(viewers)('shows to %s', async (_, getters) => {
      const wrapper = await mountPage({ getters, query: { section: 'calendar' } })
      expect(tabNames(wrapper)).toContain('timesheets')
      expect(dayLinks(wrapper)).toBe(true)
      wrapper.unmount()
    })

    it.each(others)('hides from %s', async (_, getters) => {
      const wrapper = await mountPage({ getters, query: { section: 'calendar' } })
      expect(tabNames(wrapper)).not.toContain('timesheets')
      expect(dayLinks(wrapper)).toBe(false)
      wrapper.unmount()
    })

    it.each(others)('opens the tasks tab from its URL for %s', async (_, getters) => {
      const wrapper = await mountPage({
        getters,
        query: { section: 'timesheets' }
      })
      expect(
        wrapper.findComponent(RouteSectionTabs).props('activeTab')
      ).toBe('todos')
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

  describe('last tab', () => {
    afterEach(() => vi.unstubAllGlobals())

    const activeTab = wrapper =>
      wrapper.findComponent(RouteSectionTabs).props('activeTab')

    it('opens the tab picked last time', async () => {
      localStorage.setItem('person:section', 'schedule')
      let replace
      const wrapper = await mountPage({
        onRouter: router => {
          replace = vi.spyOn(router, 'replace')
        }
      })
      expect(activeTab(wrapper)).toBe('schedule')
      expect(wrapper.vm.$route.query.section).toBe('schedule')
      expect(
        replace.mock.calls.some(([to]) => to.query?.section === 'schedule')
      ).toBe(true)
      wrapper.unmount()
    })

    it('keeps the restored tab next to the stored production', async () => {
      const production = { id: 'prod-1', name: 'Prod', team: [person.id] }
      localStorage.setItem('person:section', 'calendar')
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
      expect(activeTab(wrapper)).toBe('calendar')
      expect(wrapper.vm.$route.query).toMatchObject({
        productionId: production.id,
        section: 'calendar'
      })
      wrapper.unmount()
    })

    it('lets the URL beat the stored tab', async () => {
      localStorage.setItem('person:section', 'schedule')
      const wrapper = await mountPage({ query: { section: 'calendar' } })
      expect(activeTab(wrapper)).toBe('calendar')
      expect(wrapper.vm.$route.query.section).toBe('calendar')
      wrapper.unmount()
    })

    it('falls back on the tasks tab for a stored productivity tab out of reach', async () => {
      localStorage.setItem('person:section', 'productivity')
      const wrapper = await mountPage({ getters: { user: () => otherUser } })
      expect(activeTab(wrapper)).toBe('todos')
      wrapper.unmount()
    })

    it('falls back on the tasks tab for a stored tab hidden on phones', async () => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
          matches: true,
          addEventListener: () => {},
          removeEventListener: () => {}
        }))
      )
      localStorage.setItem('person:section', 'done')
      const wrapper = await mountPage()
      expect(activeTab(wrapper)).toBe('todos')
      wrapper.unmount()
    })

    it('stores the tab opened from the URL', async () => {
      const wrapper = await mountPage({ query: { section: 'calendar' } })
      expect(localStorage.getItem('person:section')).toBe('calendar')
      expect(localStorage.getItem('todos:section')).toBeNull()
      await wrapper.vm.$router.push({
        query: { ...wrapper.vm.$route.query, section: 'schedule' }
      })
      await flushPromises()
      expect(localStorage.getItem('person:section')).toBe('schedule')
      wrapper.unmount()
    })
  })
})
