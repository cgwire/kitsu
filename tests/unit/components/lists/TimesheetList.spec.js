import { mount, shallowMount } from '@vue/test-utils'
import moment from 'moment-timezone'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import TimesheetList from '@/components/lists/TimesheetList.vue'
import DayOffModal from '@/components/modals/DayOffModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DateField from '@/components/widgets/DateField.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

const createListStore = () =>
  createStore({
    getters: {
      isCurrentUserArtist: () => false,
      organisation: () => ({ hours_by_day: 8 }),
      productionMap: () => new Map(),
      taskTypeMap: () => new Map()
    }
  })

const mountList = props =>
  shallowMount(TimesheetList, {
    global: {
      plugins: [createListStore()],
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
})
