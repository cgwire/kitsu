import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import moment from 'moment-timezone'
import { vi } from 'vitest'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import TimesheetList from '@/components/lists/TimesheetList.vue'
import DayOffModal from '@/components/modals/DayOffModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DateField from '@/components/widgets/DateField.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

const createListStore = (actions = {}, getters = {}) =>
  createStore({
    actions,
    getters: {
      isCurrentUserArtist: () => false,
      organisation: () => ({ hours_by_day: 8 }),
      productionMap: () => new Map(),
      taskTypeMap: () => new Map(),
      ...getters
    }
  })

const mountList = (props, getters) =>
  shallowMount(TimesheetList, {
    global: {
      plugins: [createListStore({}, getters)],
      stubs: { RouterLink: true }
    },
    props: { hideDayOff: false, ...props }
  })

// The real day off form, its fields stubbed
const mountListWithForm = props =>
  mount(TimesheetList, {
    global: {
      plugins: [createListStore()],
      stubs: { DateField: true, RouterLink: true, TextField: true }
    },
    props: { hideDayOff: false, ...props }
  })

const openDayOffModal = async wrapper => {
  await wrapper
    .findAllComponents(ButtonSimple)
    .find(button => button.props('text') === 'timesheets.day_off')
    .vm.$emit('click')
}

const fieldDates = wrapper =>
  wrapper.findAllComponents(DateField).map(field => field.props('modelValue'))

// The day off modal has utc date fields: they hold a day at UTC midnight,
// while the timesheet day is a local date. Kitsu makes the time zone of the
// user profile the moment default one: east of UTC, a local midnight is
// still the previous UTC day, whatever the zone of the test runner.
describe('lists/TimesheetList', () => {
  beforeEach(() => moment.tz.setDefault('Asia/Tokyo'))
  afterEach(() => moment.tz.setDefault())

  it('offers a day off on the day of the timesheet', async () => {
    const wrapper = mountList({ initialDate: '2026-08-04' })

    await openDayOffModal(wrapper)

    const modal = wrapper.findComponent(DayOffModal)
    expect(modal.props('active')).toBe(true)
    expect(modal.props('dayOffToEdit')).toEqual({
      date: new Date('2026-08-04T00:00:00.000Z')
    })
  })

  it('offers a day off on the picked day', async () => {
    const wrapper = mountList({ initialDate: '2026-08-04' })

    await wrapper
      .findComponent(DateField)
      .vm.$emit('update:model-value', moment('2026-08-06').toDate())
    await openDayOffModal(wrapper)

    expect(wrapper.findComponent(DayOffModal).props('dayOffToEdit')).toEqual({
      date: new Date('2026-08-06T00:00:00.000Z')
    })
  })

  describe('day steps', () => {
    // Midday in Tokyo, the profile zone of these tests
    const now = new Date('2026-08-05T12:00:00+09:00')
    const lockedArtist = {
      isCurrentUserArtist: () => true,
      organisation: () => ({ hours_by_day: 8, timesheets_locked: true })
    }

    const stepButton = (wrapper, name) =>
      wrapper
        .findAllComponents(ButtonSimple)
        .find(button => button.classes(name))
    const isStepDisabled = (wrapper, name) =>
      stepButton(wrapper, name).props('disabled')
    const step = async (wrapper, name) => {
      stepButton(wrapper, name).vm.$emit('click')
      await nextTick()
    }
    const day = date => moment(date).format('YYYY-MM-DD')

    beforeEach(() => {
      vi.useFakeTimers({
        now,
        toFake: ['Date', 'setInterval', 'clearInterval']
      })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('steps to the day before and the day after', async () => {
      const wrapper = mountList({ initialDate: '2026-08-04' })

      await step(wrapper, 'previous-day')
      await step(wrapper, 'next-day')
      await step(wrapper, 'next-day')

      expect(wrapper.emitted('date-changed').map(([date]) => day(date))).toEqual(
        ['2026-08-03', '2026-08-04', '2026-08-05']
      )
      expect(day(wrapper.findComponent(DateField).props('modelValue'))).toBe(
        '2026-08-05'
      )
    })

    it('stops at today', () => {
      const wrapper = mountList({ initialDate: '2026-08-05' })

      expect(isStepDisabled(wrapper, 'next-day')).toBe(true)
      expect(isStepDisabled(wrapper, 'previous-day')).toBe(false)
    })

    // Zou does not check the lock: the timesheet is its only guard
    it('stops one week back for an artist when the studio locks the timesheets', () => {
      const lockedDay = mountList({ initialDate: '2026-07-29' }, lockedArtist)
      const nextDay = mountList({ initialDate: '2026-07-30' }, lockedArtist)
      const unlockedArtist = mountList(
        { initialDate: '2026-07-29' },
        { isCurrentUserArtist: () => true }
      )
      const manager = mountList(
        { initialDate: '2026-07-29' },
        { organisation: lockedArtist.organisation }
      )

      expect(isStepDisabled(lockedDay, 'previous-day')).toBe(true)
      expect(isStepDisabled(lockedDay, 'next-day')).toBe(false)
      expect(isStepDisabled(nextDay, 'previous-day')).toBe(false)
      expect(isStepDisabled(unlockedArtist, 'previous-day')).toBe(false)
      expect(isStepDisabled(manager, 'previous-day')).toBe(false)
    })

    it('moves the bounds to the new day while the page stays open', async () => {
      vi.setSystemTime(new Date('2026-08-05T23:59:30+09:00'))
      const wrapper = mountList({ initialDate: '2026-08-05' }, lockedArtist)
      const field = wrapper.findComponent(DateField)
      expect(isStepDisabled(wrapper, 'next-day')).toBe(true)

      vi.advanceTimersByTime(60 * 1000)
      await nextTick()

      expect(isStepDisabled(wrapper, 'next-day')).toBe(false)
      expect(day(field.props('maxDate'))).toBe('2026-08-06')
      expect(day(field.props('minDate'))).toBe('2026-07-30')

      wrapper.unmount()
      expect(vi.getTimerCount()).toBe(0)
    })
  })

  describe('day off form', () => {
    const day = new Date('2026-08-04T00:00:00.000Z')
    const picked = new Date('2026-08-10T00:00:00.000Z')

    const pickStart = (modal, date) =>
      modal.findComponent(DateField).vm.$emit('update:model-value', date)

    // A time spent update, a socket event, or a store change renders the
    // list again while the form is open
    it('keeps the picks when the list renders again', async () => {
      const wrapper = mountListWithForm({ initialDate: '2026-08-04' })
      await openDayOffModal(wrapper)
      const modal = wrapper.findComponent(DayOffModal)
      const dayOff = modal.props('dayOffToEdit')

      await pickStart(modal, picked)
      await wrapper.setProps({ timeSpentTotal: 2 })

      expect(fieldDates(modal)).toEqual([picked, picked])
      expect(modal.props('dayOffToEdit')).toBe(dayOff)
    })

    it('resets the form on each opening', async () => {
      const wrapper = mountListWithForm({ initialDate: '2026-08-04' })
      await openDayOffModal(wrapper)
      const modal = wrapper.findComponent(DayOffModal)

      await pickStart(modal, picked)
      await modal.find('.button.is-link').trigger('click')
      expect(modal.props('active')).toBe(false)
      await openDayOffModal(wrapper)

      expect(modal.props('active')).toBe(true)
      expect(fieldDates(modal)).toEqual([day, day])
    })
  })

  // The page keeps the error of a refused confirm until a new confirm:
  // every form opened after a cancel showed it.
  describe('day-off error', () => {
    const error = 'Day off already exists for this period'

    // Bound with v-model, as the pages do. The day off covers 2026-08-05.
    const mountListWithError = dayOffError => {
      const wrapper = mountListWithForm({
        initialDate: '2026-08-04',
        daysOff: [
          { id: 'day-off-1', date: '2026-08-05', end_date: '2026-08-05' }
        ],
        dayOffError,
        'onUpdate:dayOffError': value =>
          wrapper.setProps({ dayOffError: value })
      })
      return wrapper
    }

    it('opens the day off form again without the error', async () => {
      const wrapper = mountListWithError(false)
      const modal = wrapper.findComponent(DayOffModal)

      await openDayOffModal(wrapper)
      await modal.find('form').trigger('submit')
      await wrapper.setProps({ dayOffError: error })
      expect(modal.find('.is-danger').text()).toBe(error)
      await modal.find('.button.is-link').trigger('click')
      expect(modal.props('active')).toBe(false)
      await openDayOffModal(wrapper)

      expect(modal.props('active')).toBe(true)
      expect(modal.find('.is-danger').exists()).toBe(false)
    })

    it('opens the delete confirmation without the error', async () => {
      const wrapper = mountListWithError(error)

      await wrapper
        .findComponent(DateField)
        .vm.$emit('update:model-value', moment('2026-08-05').toDate())
      await openDayOffModal(wrapper)

      const modal = wrapper.findComponent(DeleteModal)
      expect(modal.props('active')).toBe(true)
      expect(modal.find('p.is-danger').exists()).toBe(false)
    })
  })

  describe('task order', () => {
    const tasks = ['task-1', 'task-2', 'task-3'].map(id => ({
      id,
      project_id: 'production-1'
    }))
    const rowTaskIds = wrapper =>
      wrapper
        .findAllComponents({ name: 'TimeSliderCell' })
        .map(cell => cell.props('taskId'))

    it('puts the tasks with time spent first', () => {
      const wrapper = mountList({
        tasks,
        timeSpentMap: { 'task-3': { duration: 120 }, 'task-2': { duration: 0 } }
      })
      expect(rowTaskIds(wrapper)).toEqual(['task-3', 'task-1', 'task-2'])
    })

    it('keeps the order while the time is being logged', async () => {
      const timeSpentMap = {}
      const wrapper = mountList({ tasks, timeSpentMap })
      timeSpentMap['task-2'] = { duration: 60 }
      await wrapper.setProps({ timeSpentTotal: 1 })
      expect(rowTaskIds(wrapper)).toEqual(['task-1', 'task-2', 'task-3'])

      await wrapper.setProps({ timeSpentMap: { ...timeSpentMap } })
      expect(rowTaskIds(wrapper)).toEqual(['task-2', 'task-1', 'task-3'])
    })
  })

  describe('week total', () => {
    const timeSpents = [
      { date: '2026-08-03', duration: 120 },
      { date: '2026-08-04', duration: 180 },
      { date: '2026-08-05', duration: 60 }
    ]

    const mountWeekList = () => {
      const loadPersonTimeSpentsByPeriod = vi.fn(() => timeSpents)
      const store = createListStore({ loadPersonTimeSpentsByPeriod })
      const wrapper = shallowMount(TimesheetList, {
        global: {
          mocks: {
            $t: (key, params) => (params ? `${key}:${params.hours}` : key)
          },
          plugins: [store],
          stubs: { RouterLink: true }
        },
        props: {
          initialDate: '2026-08-05',
          personId: 'person-1',
          timeSpentTotal: 2
        }
      })
      return { loadPersonTimeSpentsByPeriod, wrapper }
    }

    const weekTotal = wrapper => wrapper.find('.week-time-spent-total').text()

    it('adds the live day total to the other days of the week', async () => {
      const { loadPersonTimeSpentsByPeriod, wrapper } = mountWeekList()
      await flushPromises()

      expect(loadPersonTimeSpentsByPeriod.mock.calls[0][1]).toEqual({
        personId: 'person-1',
        startDate: '2026-08-03',
        endDate: '2026-08-09'
      })
      expect(weekTotal(wrapper)).toBe('timesheets.week_total:7')

      await wrapper.setProps({ timeSpentTotal: 4 })
      expect(weekTotal(wrapper)).toBe('timesheets.week_total:9')
    })
  })

  // Phones get read-only cards from the global datatable--cards rule
  describe('cards on mobile', () => {
    const tasks = [{ id: 'task-1', project_id: 'production-1' }]
    const cell = (wrapper, name) =>
      wrapper.find(`.datatable-body tr.datatable-row > .${name}`)

    it('opts the table into the card layout', () => {
      const wrapper = mountList({ tasks, timeSpentMap: {} })
      expect(wrapper.find('table').classes()).toContain('datatable--cards')
      expect(cell(wrapper, 'name').classes()).toContain('card-head')
    })

    it('labels the production, task type and time spent lines', () => {
      const wrapper = mountList({ tasks, timeSpentMap: {} })
      expect(cell(wrapper, 'production').attributes('data-label')).toBe(
        'main.production'
      )
      expect(cell(wrapper, 'type').attributes('data-label')).toBe(
        'tasks.fields.task_type'
      )
      expect(cell(wrapper, 'time-spent').attributes('data-label')).toBe(
        'timesheets.time_spents'
      )
    })

  })
})
