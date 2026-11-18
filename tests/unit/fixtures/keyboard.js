// An Enter pressed on the given element, with the key a browser gives it:
// trigger('keydown.enter') names the key "enter".
export const pressEnter = (wrapper, init = {}) =>
  wrapper.trigger('keydown', { key: 'Enter', keyCode: 13, ...init })

// A Space pressed on the given element, likewise: its key is a space.
export const pressSpace = (wrapper, init = {}) =>
  wrapper.trigger('keydown', { key: ' ', keyCode: 32, ...init })
