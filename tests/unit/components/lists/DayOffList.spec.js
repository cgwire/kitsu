import { mount } from '@vue/test-utils'
import moment from 'moment-timezone'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

import DayOffList from '@/components/lists/DayOffList.vue'
import DayOffModal from '@/components/modals/DayOffModal.vue'
import DateField from '@/components/widgets/DateField.vue'

const mountList = props =>
  mount(DayOffList, {
    props,
    global: { stubs: { DayOffModal: true, DeleteModal: true } }
  })

// The real form, its fields stubbed
const mountListWithForm = props =>
  mount(DayOffList, {
    props,
    global: { stubs: { DateField: true, DeleteModal: true, TextField: true } }
  })

const clickAdd = wrapper => wrapper.find('.header button').trigger('click')

const fieldDates = wrapper =>
  wrapper.findAllComponents(DateField).map(field => field.props('modelValue'))

describe('DayOffList', () => {
  it('says there is no day off when the list loaded empty', () => {
    const wrapper = mountList({ daysOff: [] })

    expect(wrapper.text()).toContain('days_off.no_days_off')
    expect(wrapper.find('.footer-info').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('main.loading_error')
  })

  it('shows the loading error instead of an empty list', () => {
    const wrapper = mountList({ daysOff: [], isError: true })

    expect(wrapper.text()).toContain('main.loading_error')
    expect(wrapper.text()).not.toContain('days_off.no_days_off')
    expect(wrapper.find('.footer-info').exists()).toBe(false)
  })

  it('opens the edit form on the day off of the row', async () => {
    const wrapper = mountList({
      daysOff: [{ id: 'day-off-1', date: '2026-08-03', end_date: '2026-08-05' }]
    })

    await wrapper.find('.actions button').trigger('click')

    expect(wrapper.findComponent(DayOffModal).props('dayOffToEdit')).toEqual({
      id: 'day-off-1',
      period: '2026-08-03 - 2026-08-05',
      date: new Date('2026-08-03T00:00:00.000Z'),
      end_date: new Date('2026-08-05T00:00:00.000Z')
    })
  })

  // The form has utc date fields: they hold a day at UTC midnight. Kitsu
  // makes the time zone of the user profile the moment default one: at
  // 00:30 in Tokyo, the UTC day is still the day before.
  describe('add button', () => {
    const today = new Date('2026-10-06T00:00:00.000Z')

    beforeEach(() => {
      moment.tz.setDefault('Asia/Tokyo')
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2026-10-06T00:30:00+09:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
      moment.tz.setDefault()
    })

    it('opens the add form on the local day', async () => {
      const wrapper = mountList({ daysOff: [] })

      await clickAdd(wrapper)

      const modal = wrapper.findComponent(DayOffModal)
      expect(modal.props('active')).toBe(true)
      expect(modal.props('dayOffToEdit')).toStrictEqual({ date: today })
    })

    it('sends the day off fields only', async () => {
      const wrapper = mountListWithForm({ daysOff: [] })

      await clickAdd(wrapper)
      await wrapper.findComponent(DayOffModal).find('form').trigger('submit')

      expect(wrapper.emitted('set-day-off')).toStrictEqual([
        [{ date: today, end_date: today, description: null }]
      ])
    })

    it('resets the add form on each opening', async () => {
      const wrapper = mountListWithForm({ daysOff: [] })
      const modal = wrapper.findComponent(DayOffModal)

      await clickAdd(wrapper)
      await modal
        .findComponent(DateField)
        .vm.$emit('update:model-value', new Date('2026-10-08T00:00:00.000Z'))
      await modal.find('.button.is-link').trigger('click')
      expect(modal.props('active')).toBe(false)
      await clickAdd(wrapper)

      expect(fieldDates(modal)).toEqual([today, today])
    })
  })
})
