import { shallowMount } from '@vue/test-utils'
import moment from 'moment-timezone'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import TimesheetList from '@/components/lists/TimesheetList.vue'
import DayOffModal from '@/components/modals/DayOffModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import DateField from '@/components/widgets/DateField.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

const mountList = props =>
  shallowMount(TimesheetList, {
    global: {
      plugins: [
        createStore({
          getters: {
            isCurrentUserArtist: () => false,
            organisation: () => ({ hours_by_day: 8 }),
            productionMap: () => new Map(),
            taskTypeMap: () => new Map()
          }
        })
      ],
      stubs: { RouterLink: true }
    },
    props: { hideDayOff: false, ...props }
  })

const openDayOffModal = async wrapper => {
  await wrapper
    .findAllComponents(ButtonSimple)
    .find(button => button.props('text') === 'timesheets.day_off')
    .vm.$emit('click')
}

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
})
