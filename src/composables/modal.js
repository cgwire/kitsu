import {
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  unref,
  watch
} from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]'
]
  .map(selector => `${selector}:not([tabindex^="-"])`)
  .join(', ')

// The open modals, the top one last: only that one answers the keyboard.
const openModals = []

// v-show panels and closed nested modals keep their fields in the DOM, where
// focus() does nothing.
const isRendered = (element, container) =>
  element === container ||
  (getComputedStyle(element).display !== 'none' &&
    isRendered(element.parentElement, container))

const isTabbable = (element, container) =>
  getComputedStyle(element).visibility !== 'hidden' &&
  isRendered(element, container)

// A popup that is a dialog of its own, like the date picker menu teleported
// to <body>, handles its own Tab.
const isInOtherDialog = (element, container) => {
  const dialog = element?.closest?.('[aria-modal="true"]')
  return (
    Boolean(dialog) &&
    !container.contains(dialog) &&
    !dialog.contains(container)
  )
}

// Where Tab must go to stay in the dialog, null when the browser's own move
// stays in it.
const getWrapTarget = (container, isBackward) => {
  const current = document.activeElement
  const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
  const first = elements.find(element => isTabbable(element, container))
  if (!first) return container
  const last = [...elements]
    .reverse()
    .find(element => isTabbable(element, container))
  if (current === container || !container.contains(current)) {
    return isBackward ? last : first
  }
  // Compared by position, as the focus can sit on an element out of the Tab
  // order, like the playlist player.
  const following = Node.DOCUMENT_POSITION_FOLLOWING
  if (isBackward) {
    return first.compareDocumentPosition(current) & following ? null : last
  }
  return current === last || last.compareDocumentPosition(current) & following
    ? first
    : null
}

export const useModal = (active, emit, containerRef = null) => {
  const instance = getCurrentInstance()
  const modal = {}
  // Where keyboard focus was before the modal opened, restored on close.
  let previouslyFocused = null

  // Without a ref, the component root: PreviewModal keeps its buttons out of
  // .modal-content.
  const getContainer = () => {
    const container = unref(containerRef) ?? instance?.proxy?.$el
    return container instanceof Element ? container : null
  }

  const isTop = () => openModals[openModals.length - 1] === modal

  const focusDialog = () => {
    const container = getContainer()
    if (container) {
      if (!container.hasAttribute('tabindex')) container.tabIndex = -1
      // A field the modal focused itself keeps the focus.
      if (!container.contains(document.activeElement)) container.focus()
    }
  }

  const trapFocus = event => {
    const container = getContainer()
    if (
      container &&
      !event.defaultPrevented &&
      !isInOtherDialog(document.activeElement, container)
    ) {
      const target = getWrapTarget(container, event.shiftKey)
      if (target) {
        event.preventDefault()
        target.focus()
      }
    }
  }

  const onKeyDown = event => {
    if (!isTop()) return
    if (event.key === 'Escape') {
      emit('cancel')
    } else if (event.key === 'Tab') {
      trapFocus(event)
    }
  }

  const open = () => {
    previouslyFocused = document.activeElement
    openModals.push(modal)
    window.addEventListener('keydown', onKeyDown, false)
    // After the render that shows the dialog: focus() skips hidden elements.
    nextTick(focusDialog)
  }

  const close = () => {
    window.removeEventListener('keydown', onKeyDown)
    const index = openModals.indexOf(modal)
    if (index > -1) {
      openModals.splice(index, 1)
      if (previouslyFocused?.focus) previouslyFocused.focus()
    }
    previouslyFocused = null
  }

  watch(active, isActive => (isActive ? open() : close()), { immediate: true })

  // An open modal unmounted by a v-if gives the focus back too.
  onBeforeUnmount(close)
}
