import { isNumberTyped } from '@/lib/number'

// An entry the page does not save, "2." on the way to 2.05 or 12.5 in a
// whole number field, stays as typed while the field has the focus.
const isTyping = input =>
  document.activeElement === input && !input.validity.valid

const showValue = (input, { value }) => {
  if (!isNumberTyped(input, value) && !isTyping(input)) {
    input.value = value ?? ''
  }
}

/*
 * Binds the value of a number input saved as it is typed, in place of
 * :value, which Vue writes back at each render: "2.0" read as 2 turned into
 * "2", and typing 5 next gave 25. The text typed stays while it reads as the
 * value.
 */
const vNumberValue = {
  mounted: showValue,
  updated: showValue
}

export default vNumberValue
