import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { createStore } from 'vuex'

import DateField from '@/components/widgets/DateField.vue'

import { resetFullScreen, setFullScreenElement } from '../fixtures/full-screen'

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
  // A field can sit in an area that stays dark in the light theme, such as
  // the share modal of the Playlists page.
  describe('theme', () => {
    it('shows a light calendar in the light theme', () => {
      const wrapper = mountField({})

      expect(findPicker(wrapper).props('dark')).toBe(false)
    })

    it('shows a dark calendar with isDark, in the light theme', () => {
      const wrapper = mountField({ isDark: true })

      expect(findPicker(wrapper).props('dark')).toBe(true)
    })
  })

  // The browser shows the element in full screen alone, like a player
  // holding the share modal: the calendar opens in place there, fixed on the
  // screen, instead of in <body>.
  describe('in full screen', () => {
    let player = null
    let wrapper = null

    const openCalendar = async () => {
      wrapper = mount(DateField, {
        attachTo: player.appendChild(document.createElement('div')),
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
      await flushPromises()
      findPicker(wrapper).vm.openMenu()
      await flushPromises()
      return document.querySelector('.dp--menu-wrapper')
    }

    beforeEach(() => {
      player = document.body.appendChild(document.createElement('div'))
    })

    afterEach(() => {
      wrapper.unmount()
      resetFullScreen()
      player.remove()
    })

    it('opens its calendar in the element in full screen', async () => {
      setFullScreenElement(player)

      const calendar = await openCalendar()

      expect(player.contains(calendar)).toBe(true)
      expect(calendar.style.position).toBe('fixed')
    })

    it('opens its calendar in <body> out of full screen', async () => {
      const calendar = await openCalendar()

      expect(player.contains(calendar)).toBe(false)
      expect(calendar.style.position).toBe('absolute')
    })
  })

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

  // The picker clears its value when Tab leaves its empty input, and a list
  // applies a clear to all its selected rows, the ones holding a date too.
  describe('clear', () => {
    it.each([
      ['a day', {}],
      ['a range', { range: true }]
    ])('sends none when Tab leaves an empty field of %s', async (_, props) => {
      const wrapper = mount(DateField, {
        props: { ...props, modelValue: null },
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
      await flushPromises()

      await wrapper.find('input').trigger('keydown', { key: 'Tab' })

      expect(wrapper.emitted('update:model-value')).toBeUndefined()
      expect(wrapper.emitted('change')).toBeUndefined()
      wrapper.unmount()
    })

    it.each([
      ['a day', { modelValue: new Date(2026, 7, 5) }],
      [
        'a range',
        {
          range: true,
          modelValue: [new Date(2026, 7, 4), new Date(2026, 7, 6)]
        }
      ]
    ])('sends the clear of %s', (_, props) => {
      const wrapper = mountField(props)

      pick(wrapper, null)

      expect(wrapper.emitted('update:model-value')).toEqual([[null]])
      expect(wrapper.emitted('change')).toEqual([[null]])
    })
  })

  // A list can show a date field on each of a thousand selected rows: a
  // lazy one shows the input alone, and loads its calendar when used.
  describe('lazy', () => {
    let container = null
    let onPageEvent = null
    let wrapper = null

    const mountInPage = (props, { locale = 'en_US' } = {}) => {
      wrapper = mount(DateField, {
        props,
        attachTo: container,
        global: {
          plugins: [
            createStore({
              getters: {
                isDarkTheme: () => false,
                user: () => ({ locale })
              }
            })
          ]
        }
      })
      return wrapper
    }
    const findInput = () => wrapper.find('input')
    const menu = () => document.querySelector('.dp--menu-wrapper')

    // The elements of the field and what the styles can address in them.
    // Vue and the picker mark their elements for themselves, data-dp-mobile
    // shapes the calendar only, and an input keeps its text in a property.
    const outline = element => ({
      tag: element.tagName,
      attributes: Object.fromEntries(
        [...element.attributes]
          .filter(
            ({ name }) => !/^data-(v-|test-id|datepicker|dp-mobile)/.test(name)
          )
          .map(({ name, value }) => [
            name,
            name === 'class' ? value.split(' ').sort() : value
          ])
      ),
      children: [...element.children].map(outline)
    })
    // The picker fills its input once mounted.
    const looks = async (props, locale) => {
      mountInPage(props, { locale })
      await flushPromises()
      const element = wrapper.find('.datepicker').element
      const look = {
        elements: outline(element),
        text: element.querySelector('input').value
      }
      wrapper.unmount()
      wrapper = null
      return look
    }

    beforeEach(() => {
      container = document.body.appendChild(document.createElement('div'))
      onPageEvent = vi.fn()
      container.addEventListener('click', onPageEvent)
      container.addEventListener('keydown', onPageEvent)
    })

    afterEach(() => {
      wrapper?.unmount()
      wrapper = null
      container.remove()
    })

    it('shows the date with no calendar loaded', () => {
      mountInPage({ lazy: true, modelValue: new Date(2026, 7, 5) })

      expect(findPicker(wrapper).exists()).toBe(false)
      expect(findInput().element.value).toBe('2026-08-05')
    })

    it.each([
      ['a click', input => input.trigger('click')],
      ['Enter', input => input.trigger('keydown', { key: 'Enter' })]
    ])('opens its calendar on %s', async (_, use) => {
      mountInPage({ lazy: true, modelValue: new Date(2026, 7, 5) })

      await use(findInput())
      await flushPromises()

      expect(findPicker(wrapper).exists()).toBe(true)
      expect(menu()).not.toBe(null)
      expect(findInput().attributes('aria-expanded')).toBe('true')
      expect(document.activeElement).toBe(findInput().element)
      // as the picker, which keeps its clicks and keys away from the row
      expect(onPageEvent).not.toHaveBeenCalled()
    })

    it('leaves the other keys out of its input', () => {
      mountInPage({ lazy: true, modelValue: new Date(2026, 7, 5) })
      const digit = new KeyboardEvent('keydown', {
        key: '1',
        code: 'Digit1',
        cancelable: true
      })
      const tab = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        cancelable: true
      })

      findInput().element.dispatchEvent(digit)
      findInput().element.dispatchEvent(tab)

      expect(digit.defaultPrevented).toBe(true)
      expect(tab.defaultPrevented).toBe(false)
      expect(findPicker(wrapper).exists()).toBe(false)
    })

    it.each([
      ['a click', button => button.trigger('click')],
      ['Enter', button => button.trigger('keydown', { key: 'Enter' })],
      ['Space', button => button.trigger('keydown', { key: ' ' })]
    ])('clears the date on %s without loading its calendar', async (_, use) => {
      mountInPage({ lazy: true, modelValue: new Date(2026, 7, 5) })

      await use(wrapper.find('.dp--clear-btn'))

      expect(wrapper.emitted('update:model-value')).toEqual([[null]])
      expect(wrapper.emitted('change')).toEqual([[null]])
      expect(findPicker(wrapper).exists()).toBe(false)
      expect(onPageEvent).not.toHaveBeenCalled()
    })

    // Cut or Delete from the context menu, or a drop, change the text with
    // no key: the picker takes an emptied input for a clear.
    it.each([
      ['the picker', false],
      ['a lazy field', true]
    ])('clears the date of %s emptied with no key', async (_, lazy) => {
      mountInPage({ lazy, modelValue: new Date(2026, 7, 5) })
      await flushPromises()

      await findInput().setValue('')

      expect(wrapper.emitted('update:model-value')).toEqual([[null]])
      expect(wrapper.emitted('change')).toEqual([[null]])
    })

    it.each([
      ['the picker', false],
      ['a lazy field', true]
    ])('reads a date given to %s with no key', async (_, lazy) => {
      mountInPage({ lazy, modelValue: new Date(2026, 7, 5) })
      await flushPromises()

      await findInput().setValue('2026-08-09')
      await flushPromises()

      expect(wrapper.emitted('update:model-value')).toEqual([
        [new Date(2026, 7, 9)]
      ])
      expect(findInput().attributes('aria-expanded')).toBe('true')
    })

    // A click on a disabled input reaches no listener: the one around it
    // must open nothing either.
    it('opens nothing when disabled', async () => {
      mountInPage({
        lazy: true,
        disabled: true,
        modelValue: new Date(2026, 7, 5)
      })

      await wrapper.find('.dp--input-wrap').trigger('click')
      await flushPromises()

      expect(findPicker(wrapper).exists()).toBe(false)
    })

    // Its look comes from the classes of the picker, which the styles of the
    // app address: an upgrade of the picker that changes its markup must
    // change this one too.
    it.each([
      ['a date', { modelValue: new Date(2026, 7, 5) }],
      ['no date', { modelValue: null, placeholder: 'Due date' }],
      ['a date it cannot clear', { canDelete: false, modelValue: new Date() }],
      ['a disabled date', { disabled: true, modelValue: new Date(2026, 7, 5) }],
      ['the dark theme', { isDark: true, modelValue: new Date(2026, 7, 5) }],
      ['a utc day', { utc: true, modelValue: '2026-08-05' }],
      ['a date string', { modelValue: '2026-08-05T09:30:00' }],
      ['a model type', { modelType: 'dd/MM/yyyy', modelValue: '05/08/2026' }],
      [
        'a range',
        {
          range: true,
          modelValue: [new Date(2026, 7, 3), new Date(2026, 7, 7)]
        }
      ],
      [
        'a range of one day',
        {
          range: true,
          modelValue: [new Date(2026, 7, 3), new Date(2026, 7, 3)]
        }
      ],
      [
        'a localized format',
        { format: 'd MMM yyyy', modelValue: new Date(2026, 7, 5) },
        'fr_FR'
      ],
      ['a date it cannot read', { modelValue: new Date(NaN) }],
      ['a model value it cannot read', { modelType: 'yyyy-MM-dd', modelValue: 'soon' }],
      ['an empty range', { range: true, modelValue: [] }]
    ])('looks like the picker with %s', async (_, props, locale) => {
      const picker = await looks(props, locale)

      expect(await looks({ ...props, lazy: true }, locale)).toEqual(picker)
    })
  })
})
