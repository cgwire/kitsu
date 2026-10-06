import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import DayOffModal from '@/components/modals/DayOffModal.vue'
import DateField from '@/components/widgets/DateField.vue'

const mountModal = props =>
  mount(DayOffModal, {
    props: { active: true, ...props },
    global: { stubs: { DateField: true, TextField: true } }
  })

const fieldDates = wrapper =>
  wrapper.findAllComponents(DateField).map(field => field.props('modelValue'))

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
})
