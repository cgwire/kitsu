import { shallowMount } from '@vue/test-utils'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { createStore } from 'vuex'

import DateField from '@/components/widgets/DateField.vue'

const mountField = props =>
  shallowMount(DateField, {
    props,
    global: {
      plugins: [
        createStore({
          getters: {
            isDarkTheme: () => false,
            user: () => ({ locale: 'en_US' })
          }
        })
      ]
    }
  })

const findPicker = wrapper => wrapper.findComponent(VueDatePicker)

// The calendar day and hour a date shows in the local time zone
const localDay = date => [
  date.getFullYear(),
  date.getMonth() + 1,
  date.getDate(),
  date.getHours()
]

const pick = (wrapper, value) =>
  findPicker(wrapper).vm.$emit('update:model-value', value)

// A utc field holds a day as the Date at UTC midnight of that day, which
// the consumers read back in UTC. The picker works in the local time zone:
// east of UTC, a local midnight is still the previous UTC day. A runner in
// UTC cannot tell them apart, so timezones.spec.js checks the conversions
// this field uses in other time zones.
describe('DateField', () => {
  describe('utc', () => {
    it('shows the UTC day of the value', async () => {
      const wrapper = mountField({ utc: true, modelValue: '2026-08-05' })
      expect(localDay(findPicker(wrapper).props('modelValue'))).toEqual([
        2026, 8, 5, 0
      ])

      await wrapper.setProps({ modelValue: new Date('2026-08-05T23:30:00Z') })
      expect(localDay(findPicker(wrapper).props('modelValue'))).toEqual([
        2026, 8, 5, 0
      ])
    })

    it('sends the picked day at UTC midnight', () => {
      const wrapper = mountField({ utc: true, modelValue: '2026-08-05' })

      pick(wrapper, new Date(2026, 7, 6, 13, 45))

      const day = new Date('2026-08-06T00:00:00.000Z')
      expect(wrapper.emitted('update:model-value')).toEqual([[day]])
      expect(wrapper.emitted('change')).toEqual([[day]])
    })

    it('bounds the calendar to the UTC days of the limits', () => {
      const wrapper = mountField({
        utc: true,
        minDate: new Date('2026-03-09T00:00:00Z'),
        maxDate: '2026-12-31'
      })

      const picker = findPicker(wrapper)
      expect(localDay(picker.props('minDate'))).toEqual([2026, 3, 9, 0])
      expect(localDay(picker.props('maxDate'))).toEqual([2026, 12, 31, 0])
    })

    it('sends a picked range as UTC midnights', () => {
      const wrapper = mountField({
        utc: true,
        range: true,
        modelValue: ['2026-08-03', '2026-08-07']
      })
      expect(findPicker(wrapper).props('modelValue').map(localDay)).toEqual([
        [2026, 8, 3, 0],
        [2026, 8, 7, 0]
      ])

      pick(wrapper, [new Date(2026, 7, 4, 10), new Date(2026, 7, 6, 18)])

      expect(wrapper.emitted('update:model-value')).toEqual([
        [[new Date('2026-08-04T00:00:00Z'), new Date('2026-08-06T00:00:00Z')]]
      ])
    })
  })

  describe('local', () => {
    it('hands the value over as it is', () => {
      const value = new Date(2026, 7, 5, 9, 30)
      const wrapper = mountField({ modelValue: value })

      expect(findPicker(wrapper).props('modelValue')).toBe(value)
    })

    it('sends the picked day at local midnight', () => {
      const wrapper = mountField({ modelValue: new Date(2026, 7, 5) })
      const picked = new Date(2026, 7, 6, 13, 45)

      pick(wrapper, picked)

      const [[sent]] = wrapper.emitted('update:model-value')
      expect(sent).toBe(picked)
      expect(localDay(sent)).toEqual([2026, 8, 6, 0])
    })

    it('sends a picked range at local midnights', () => {
      const wrapper = mountField({ range: true, modelValue: null })

      pick(wrapper, [new Date(2026, 7, 4, 10), new Date(2026, 7, 6, 18)])

      const [[sent]] = wrapper.emitted('update:model-value')
      expect(sent.map(localDay)).toEqual([
        [2026, 8, 4, 0],
        [2026, 8, 6, 0]
      ])
    })
  })
})
