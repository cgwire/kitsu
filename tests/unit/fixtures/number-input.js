import { flushPromises } from '@vue/test-utils'

const valueProperty = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'value'
)
const validityProperty = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'validity'
)

// A number input the way Chrome runs it: the field keeps the text typed,
// which reads as an empty value with a bad input while it is no number yet
// ("2."), and a value the page writes replaces that text. jsdom only keeps
// the value, and never reports a bad input.
export const useNumberField = input => {
  const getValue = () => valueProperty.get.call(input)
  const setValue = value => valueProperty.set.call(input, value)
  let text = getValue()
  let isSelected = false

  Object.defineProperty(input, 'value', {
    configurable: true,
    get: getValue,
    set: value => {
      setValue(value)
      text = getValue()
    }
  })
  Object.defineProperty(input, 'validity', {
    configurable: true,
    get: () => {
      const validity = validityProperty.get.call(input)
      const badInput = text !== '' && getValue() === ''
      return {
        badInput,
        rangeOverflow: validity.rangeOverflow,
        rangeUnderflow: validity.rangeUnderflow,
        stepMismatch: validity.stepMismatch,
        valid: validity.valid && !badInput
      }
    }
  })

  const enter = async nextText => {
    text = nextText
    setValue(text)
    input.dispatchEvent(new Event('input'))
    await flushPromises()
  }

  return {
    text: () => text,
    // The next key typed replaces the text.
    select: () => {
      isSelected = true
    },
    // Types the keys one by one, the field focused, and returns the text
    // shown after each key.
    type: async keys => {
      input.focus()
      const steps = []
      for (const key of keys) {
        await enter(isSelected ? key : text + key)
        isSelected = false
        steps.push(text)
      }
      return steps
    },
    clear: () => enter('')
  }
}
