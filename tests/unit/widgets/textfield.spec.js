import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import TextField from '@/components/widgets/TextField.vue'

// A page holding the value with v-model, through toModel when it clamps the
// value typed
const mountNumberField = (toModel = value => value) => {
  const wrapper = mount(TextField, {
    props: {
      type: 'number',
      modelValue: null,
      'onUpdate:modelValue': value =>
        wrapper.setProps({ modelValue: toModel(value) })
    }
  })
  return wrapper
}

// Types into a number field key by key the way a browser does: the field
// keeps the text typed, which reads as an empty value while it is no number
// yet ("2."), and a value the page writes replaces that text.
const typeKeys = async (wrapper, keys) => {
  const field = wrapper.find('input').element
  const { get, set } = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )
  let text = get.call(field)
  let written
  Object.defineProperty(field, 'value', {
    configurable: true,
    get: () => get.call(field),
    set: value => {
      written = String(value)
      set.call(field, value)
    }
  })
  for (const key of keys) {
    text += key
    set.call(field, text)
    written = null
    field.dispatchEvent(new Event('input'))
    await nextTick()
    if (written !== null) text = written
  }
  delete field.value
  return text
}

const typedValues = wrapper =>
  wrapper.emitted('update:model-value').map(([value]) => value)

describe('TextField', () => {
  describe('number', () => {
    // Written back from the number, "2.0" turned into "2": typing 2.05 key
    // by key gave 25.
    it.each([
      ['2.05', [2, null, 2, 2.05]],
      ['0.05', [0, null, 0, 0.05]]
    ])(
      'keeps the zero typed after the decimal point of %s',
      async (keys, values) => {
        const wrapper = mountNumberField()

        expect(await typeKeys(wrapper, keys)).toBe(keys)
        expect(typedValues(wrapper)).toEqual(values)
        expect(wrapper.props('modelValue')).toBe(values[3])
        wrapper.unmount()
      }
    )

    it('drops a leading zero typed', async () => {
      const wrapper = mountNumberField()

      expect(await typeKeys(wrapper, '05')).toBe('5')
      expect(typedValues(wrapper)).toEqual([0, 5])
      wrapper.unmount()
    })

    it('shows the value the page sets in place of the one typed', async () => {
      const wrapper = mountNumberField(value => Math.min(value, 10))

      expect(await typeKeys(wrapper, '12')).toBe('10')
      wrapper.unmount()
    })

    it('clears the field when the page resets the value', async () => {
      const wrapper = mountNumberField()
      await typeKeys(wrapper, '2.0')

      await wrapper.setProps({ modelValue: null })

      expect(wrapper.find('input').element.value).toBe('')
      wrapper.unmount()
    })
  })

  describe('description', () => {
    it('shows the description under the field and reads it with the field', () => {
      const wrapper = mount(TextField, {
        props: { label: 'Bitrate', description: 'Full-resolution version.' }
      })
      const description = wrapper.find('.help')

      expect(description.text()).toBe('Full-resolution version.')
      expect(wrapper.find('input').attributes('aria-describedby')).toBe(
        description.attributes('id')
      )
      wrapper.unmount()
    })

    it('reads both the description and the error of an errored field', () => {
      const wrapper = mount(TextField, {
        props: {
          description: 'Full-resolution version.',
          errored: true,
          errorText: 'Too high'
        }
      })

      expect(
        wrapper.find('input').attributes('aria-describedby').split(' ')
      ).toEqual([
        wrapper.find('.help').attributes('id'),
        wrapper.find('.error').attributes('id')
      ])
      wrapper.unmount()
    })

    it('describes nothing without a description or an error', () => {
      const wrapper = mount(TextField)

      expect(wrapper.find('.help').exists()).toBe(false)
      expect(
        wrapper.find('input').attributes('aria-describedby')
      ).toBeUndefined()
      wrapper.unmount()
    })
  })
})
