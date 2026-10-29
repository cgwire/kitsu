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

// Sortable starts a native drag on the dragstart that follows the press, and
// reports it after a timer.
export const startDrag = async element => {
  pressOn(element)
  element.dispatchEvent(new Event('dragstart', { bubbles: true }))
  await new Promise(resolve => setTimeout(resolve, 0))
}

// Drops the dragged row where it stands: Sortable reads the new index from
// the DOM.
export const drop = () =>
  document.dispatchEvent(new Event('drop', { bubbles: true }))

// Puts the dragged row before another, as the dragover events of a browser
// do, then drops it.
export const dropBefore = (row, target) => {
  target.before(row)
  drop()
}

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
