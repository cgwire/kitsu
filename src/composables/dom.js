/*
 * Helpers to access the DOM through vanilla javascript. Every helper is a
 * pure function, so there is no `useDom()` to instantiate: import the
 * named exports directly.
 */

export const isFocusTextArea = () =>
  document.activeElement.nodeName === 'TEXTAREA'

export const clearFocus = () => document.activeElement.blur()

export const focusInput = inputEl => {
  inputEl.focus()
  inputEl.select()
  inputEl.className = 'input'
}

export const onInputBlur = event => {
  event.target.className = 'input stylehidden'
}

export const onInputMouseOut = event => {
  if (document.activeElement !== event.target) {
    event.target.className = 'input stylehidden'
  }
}

export const onInputMouseOver = event => {
  event.target.className = 'input'
}

export const pauseEvent = e => {
  if (e.stopPropagation) e.stopPropagation()
  if (e.preventDefault) e.preventDefault()
  e.cancelBubble = true
  e.returnValue = false
  return false
}

export const addEvents = events => {
  events.forEach(([type, listener]) => {
    document.addEventListener(type, listener)
  })
}

export const removeEvents = events => {
  events.forEach(([type, listener]) => {
    document.removeEventListener(type, listener)
  })
}

export const getClientX = event =>
  event.touches?.[0]?.clientX ??
  event.changedTouches?.[0]?.clientX ??
  event.clientX

export const getClientY = event =>
  event.touches?.[0]?.clientY ??
  event.changedTouches?.[0]?.clientY ??
  event.clientY
