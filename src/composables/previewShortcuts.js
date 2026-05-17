/*
 * Keyboard shortcuts for the preview player.
 *
 * Registers global keydown / keyup listeners and dispatches to the
 * handlers passed in. Also tracks whether Shift is currently held so
 * consumers can use it as a temporary pan-mode modifier (Shift+drag
 * lets pointer events reach the underlying media instead of the
 * annotation overlay).
 *
 * Shortcuts are skipped while the user is typing in an <input> or
 * <textarea>.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

const pauseEvent = e => {
  e.stopPropagation?.()
  e.preventDefault?.()
}

const isTypingTarget = target => ['INPUT', 'TEXTAREA'].includes(target?.tagName)

/**
 * @param {Object} handlers
 * @param {Function} [handlers.onDelete]
 * @param {Function} [handlers.onPrevFrame]
 * @param {Function} [handlers.onNextFrame]
 * @param {Function} [handlers.onPlayPause]
 * @param {Function} [handlers.onPrevAnnotation]
 * @param {Function} [handlers.onNextAnnotation]
 * @param {Function} [handlers.onAnnotate]
 * @param {Function} [handlers.onUndo]
 * @param {Function} [handlers.onRedo]
 * @param {Function} [handlers.onPrevPreview]
 * @param {Function} [handlers.onNextPreview]
 * @param {Function} [handlers.onCopy]
 * @param {Function} [handlers.onPaste]
 * @param {Function} [handlers.onToggleOverlay]
 */
export const usePreviewShortcuts = handlers => {
  const isShiftHeld = ref(false)

  const onKeyDown = event => {
    if (isTypingTarget(event.target)) return
    if (event.key === 'Shift') {
      isShiftHeld.value = true
      return
    }
    const mod = event.ctrlKey || event.metaKey
    const alt = event.altKey

    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        handlers.onDelete?.()
        break
      case 'ArrowLeft':
        handlers.onPrevFrame?.()
        break
      case 'ArrowRight':
        handlers.onNextFrame?.()
        break
      case ' ':
        pauseEvent(event)
        handlers.onPlayPause?.()
        break
      case ',':
        handlers.onPrevAnnotation?.()
        break
      case '.':
        handlers.onNextAnnotation?.()
        break
      case 'd':
        pauseEvent(event)
        handlers.onAnnotate?.()
        break
      case 'z':
        if (mod) handlers.onUndo?.()
        break
      case 'r':
        if (alt) handlers.onRedo?.()
        break
      case 'j':
        if (alt) handlers.onPrevPreview?.()
        break
      case 'k':
        if (alt) handlers.onNextPreview?.()
        break
      case 'c':
        if (mod) handlers.onCopy?.()
        break
      case 'v':
        if (mod) handlers.onPaste?.()
        break
      case 'o':
        if (alt) {
          pauseEvent(event)
          handlers.onToggleOverlay?.()
        }
        break
    }
  }

  const onKeyUp = event => {
    if (event.key === 'Shift') isShiftHeld.value = false
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('keyup', onKeyUp, false)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  })

  return { isShiftHeld }
}
