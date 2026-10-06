import { mount } from '@vue/test-utils'
import { h, withDirectives } from 'vue'

import vNumberValue from '@/directives/number-value'

import { useNumberField } from '../fixtures/number-input'

// A number field saving each valid key, the way the list cells do: each save
// renders the field again, even with an unchanged value ("2.0" after "2"). An
// invalid entry is not saved.
const mountField = (value = null) => {
  const wrapper = mount(
    {
      props: {
        saves: { type: Number, default: 0 },
        value: { type: [Number, String], default: null }
      },
      render() {
        return withDirectives(
          h('input', {
            'data-saves': this.saves,
            type: 'number',
            step: 'any',
            onInput: event => {
              const input = event.target
              if (!input.validity.valid) return
              const number = input.valueAsNumber
              wrapper.setProps({
                saves: wrapper.props('saves') + 1,
                value: Number.isNaN(number) ? null : number
              })
            }
          }),
          [[vNumberValue, this.value]]
        )
      }
    },
    { attachTo: document.body, props: { value } }
  )
  return wrapper
}

describe('directives/number-value', () => {
  test('shows the value', () => {
    const wrapper = mountField(24)

    expect(wrapper.find('input').element.value).toBe('24')

    wrapper.unmount()
  })

  // Written back from the number, "2.0" turned into "2": typing 2.05 key by
  // key gave 25.
  test('keeps the text typed while it reads as the value', async () => {
    const wrapper = mountField()
    const field = useNumberField(wrapper.find('input').element)

    expect(await field.type('2.05')).toEqual(['2', '2.', '2.0', '2.05'])
    expect(wrapper.props('value')).toBe(2.05)

    wrapper.unmount()
  })

  test('drops a leading zero typed', async () => {
    const wrapper = mountField()
    const field = useNumberField(wrapper.find('input').element)

    expect(await field.type('05')).toEqual(['0', '5'])

    wrapper.unmount()
  })

  test('shows a value set elsewhere in place of the one typed', async () => {
    const wrapper = mountField()
    const field = useNumberField(wrapper.find('input').element)
    await field.type('2.0')

    await wrapper.setProps({ value: 3 })
    expect(field.text()).toBe('3')
    await wrapper.setProps({ value: '' })
    expect(field.text()).toBe('')

    wrapper.unmount()
  })

  // "2." is no number yet: a render while it is typed must not take it away.
  test('keeps an invalid entry while the field has the focus', async () => {
    const wrapper = mountField(2)
    const input = wrapper.find('input').element
    const field = useNumberField(input)
    await field.clear()
    await field.type('2.')

    await wrapper.setProps({ value: '2' })
    expect(field.text()).toBe('2.')

    input.blur()
    await wrapper.setProps({ value: 2 })
    expect(field.text()).toBe('2')

    wrapper.unmount()
  })
})
