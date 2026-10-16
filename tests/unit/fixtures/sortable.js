// Drives the SortableJS behind vuedraggable the way a mouse does: Sortable
// arms a drag on the pointerdown of a row and settles it on the mouseup of
// the document.
export const pressOn = element =>
  element.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      cancelable: true,
      pointerType: 'mouse'
    })
  )

export const release = () =>
  document.dispatchEvent(
    new MouseEvent('mouseup', { bubbles: true, button: 0, cancelable: true })
  )

// The class Sortable gives the row it armed a drag on.
export const isArmed = row => row.classes().includes('sortable-chosen')

// jsdom reports what a DOM listener throws on window, not to the caller of
// dispatchEvent.
export const recordListenerErrors = async run => {
  const errors = []
  const onError = event => {
    errors.push(event.error)
    event.preventDefault()
  }
  window.addEventListener('error', onError)
  try {
    await run()
  } finally {
    window.removeEventListener('error', onError)
  }
  return errors
}
