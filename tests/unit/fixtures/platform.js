import { onTestFinished, vi } from 'vitest'

// Makes the browser report the given platform until the test ends: jsdom
// reports none.
export const onPlatform = platform => {
  const spy = vi
    .spyOn(window.navigator, 'platform', 'get')
    .mockReturnValue(platform)
  onTestFinished(() => spy.mockRestore())
}

// A keydown of Alt and an arrow, sent from the given element up to the window.
export const pressAltArrow = (element, keyCode) => {
  const event = new KeyboardEvent('keydown', {
    altKey: true,
    bubbles: true,
    cancelable: true
  })
  Object.defineProperty(event, 'keyCode', { value: keyCode })
  element.dispatchEvent(event)
  return event
}

// A text field out of any list, holding the given text, removed when the test
// ends.
export const addTextField = (tag, text) => {
  const field = document.createElement(tag)
  field.value = text
  document.body.append(field)
  onTestFinished(() => field.remove())
  return field
}
