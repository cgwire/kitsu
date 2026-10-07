// Inputs whose value is no typed text, like the 'on' of a checkbox.
const TEXTLESS_INPUT_TYPES = [
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit'
]

// Open layers that close on Escape after the page listener ran (window
// listeners run in the order they were added) or not at all: modals, lists
// and pickers behind their click mask, expanded comboboxes of any library.
const OPEN_LAYER_SELECTOR = [
  '.modal.is-active',
  '.c-mask.is-active',
  '[role="combobox"][aria-expanded="true"]'
].join(', ')

const isTextField = element =>
  element.tagName === 'TEXTAREA' ||
  (element.tagName === 'INPUT' && !TEXTLESS_INPUT_TYPES.includes(element.type))

// A field keeps the Escape while it holds text that the page acting on the
// key could drop, like a comment draft. An empty field does not (the
// comment box of the task panel takes the focus by itself), nor does a
// read-only one.
const isHoldingText = element =>
  element.isContentEditable
    ? element.textContent !== ''
    : isTextField(element) && !element.readOnly && element.value !== ''

// An Escape the page may act on, like clearing a selection: no handler took
// it (a layer that closes on Escape before the page listener runs is gone by
// then, so it calls preventDefault), it is neither repeated by a held key
// nor typed in a field holding text, and no layer is left to close first.
export const isFreeEscape = event =>
  event.key === 'Escape' &&
  !event.repeat &&
  !event.defaultPrevented &&
  !isHoldingText(event.target) &&
  !document.querySelector(OPEN_LAYER_SELECTOR)
