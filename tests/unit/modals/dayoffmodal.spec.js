import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import DayOffModal from '@/components/modals/DayOffModal.vue'
import DateField from '@/components/widgets/DateField.vue'
import TextField from '@/components/widgets/TextField.vue'

const mountModal = props =>
  mount(DayOffModal, {
    props: { active: true, ...props },
    global: { stubs: { DateField: true, TextField: true } }
  })

const fieldDates = wrapper =>
  wrapper.findAllComponents(DateField).map(field => field.props('modelValue'))

// A utc date field emits the picked day at UTC midnight
const utcDay = day => new Date(`${day}T00:00:00.000Z`)

const pickDate = (wrapper, fieldIndex, day) =>
  wrapper
    .findAllComponents(DateField)
    .at(fieldIndex)
    .vm.$emit('update:model-value', utcDay(day))

describe('DayOffModal', () => {
  // 00:30 local: east of UTC, the UTC day is still the day before
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 6, 0, 30))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // The date fields are utc ones: they hold a day at UTC midnight
  it('defaults to the local day', async () => {
    const wrapper = mountModal()
    const today = new Date('2026-10-06T00:00:00.000Z')

    expect(fieldDates(wrapper)).toEqual([today, today])

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('confirm')).toEqual([
      [{ date: today, end_date: today, description: null }]
    ])
  })

  it('keeps the dates of the day off to edit', () => {
    const date = new Date('2026-08-03T00:00:00.000Z')
    const endDate = new Date('2026-08-05T00:00:00.000Z')
    const wrapper = mountModal({
      dayOffToEdit: { id: 'day-off-1', date, end_date: endDate }
    })

    expect(fieldDates(wrapper)).toEqual([date, endDate])
  })

  // The Days off tab hands the same day off again when the edit of a row
  // opens after a cancel
  it('resets the form each time it opens', async () => {
    const date = utcDay('2026-08-03')
    const endDate = utcDay('2026-08-05')
    const wrapper = mountModal({
      dayOffToEdit: {
        id: 'day-off-1',
        date,
        end_date: endDate,
        description: 'Holidays'
      }
    })

    await pickDate(wrapper, 0, '2026-08-10')
    await wrapper.findComponent(TextField).vm.$emit('update:model-value', 'Trip')
    await wrapper.setProps({ active: false })
    await wrapper.setProps({ active: true })

    expect(fieldDates(wrapper)).toEqual([date, endDate])
    expect(wrapper.findComponent(TextField).props('modelValue')).toBe(
      'Holidays'
    )
  })

  describe('picked dates', () => {
    it('moves the end to a start picked after it', async () => {
      const wrapper = mountModal({
        dayOffToEdit: { date: utcDay('2026-10-06') }
      })

      await pickDate(wrapper, 0, '2026-10-08')

      const day = utcDay('2026-10-08')
      expect(fieldDates(wrapper)).toEqual([day, day])
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted('confirm')).toEqual([
        [{ date: day, end_date: day, description: null }]
      ])
    })

    // Like a task due date picked before its start date
    it('moves the start to an end picked before it', async () => {
      const wrapper = mountModal({
        dayOffToEdit: { date: utcDay('2026-10-06') }
      })

      await pickDate(wrapper, 1, '2026-10-02')

      const day = utcDay('2026-10-02')
      expect(fieldDates(wrapper)).toEqual([day, day])
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted('confirm')).toEqual([
        [{ date: day, end_date: day, description: null }]
      ])
    })

    it('keeps the dates of a valid range as picked', async () => {
      const wrapper = mountModal({
        dayOffToEdit: { date: utcDay('2026-10-06') }
      })

      await pickDate(wrapper, 0, '2026-10-12')
      await pickDate(wrapper, 1, '2026-10-16')
      expect(fieldDates(wrapper)).toEqual([
        utcDay('2026-10-12'),
        utcDay('2026-10-16')
      ])

      await pickDate(wrapper, 0, '2026-10-14')
      expect(fieldDates(wrapper)).toEqual([
        utcDay('2026-10-14'),
        utcDay('2026-10-16')
      ])
    })

    it('compares a picked start with an end given as a string', async () => {
      const wrapper = mountModal({
        dayOffToEdit: {
          id: 'day-off-1',
          date: '2026-10-05',
          end_date: '2026-10-07'
        }
      })

      await pickDate(wrapper, 0, '2026-10-09')
      expect(fieldDates(wrapper)).toEqual([
        utcDay('2026-10-09'),
        utcDay('2026-10-09')
      ])
    })

    it('compares a picked end with a start given as a string', async () => {
      const wrapper = mountModal({
        dayOffToEdit: {
          id: 'day-off-1',
          date: '2026-10-05',
          end_date: '2026-10-07'
        }
      })

      await pickDate(wrapper, 1, '2026-10-01')
      expect(fieldDates(wrapper)).toEqual([
        utcDay('2026-10-01'),
        utcDay('2026-10-01')
      ])
    })
  })
})
