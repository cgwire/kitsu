/*
 * Keyboard shortcuts for the preview player.
 *
 * Registers global keydown / keyup listeners and dispatches to the
 * handlers passed in. Also tracks whether Alt is currently held so
 * consumers can use it as a temporary pan-mode modifier (Alt+drag
 * lets pointer events reach the underlying media instead of the
 * annotation overlay). Shift is reserved for fabric.js's
 * straight-line drawing constraint, so it can't be used here.
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
 * @param {Function} [handlers.onFirstFrame]
 * @param {Function} [handlers.onLastFrame]
 * @param {Function} [handlers.onPlayPause]
 * @param {Function} [handlers.onPrevAnnotation]
 * @param {Function} [handlers.onNextAnnotation]
 * @param {Function} [handlers.onAnnotate]
 * @param {Function} [handlers.onErase]
 * @param {Function} [handlers.onUndo]
 * @param {Function} [handlers.onRedo]
 * @param {Function} [handlers.onPrevPreview]
 * @param {Function} [handlers.onNextPreview]
 * @param {Function} [handlers.onCopy]
 * @param {Function} [handlers.onPaste]
 * @param {Function} [handlers.onToggleOverlay]
 */
// Keys that should keep firing while held: stepping arrows scrub the video
// frame by frame. Every other shortcut is a one-shot toggle (draw `d`,
// eraser `e`, undo, …) that would flip twice on a held key, so their
// auto-repeat keydowns are ignored.
const REPEATABLE_KEYS = ['ArrowLeft', 'ArrowRight']

export const usePreviewShortcuts = handlers => {
  const isAltHeld = ref(false)

  const onKeyDown = event => {
    if (event.repeat && !REPEATABLE_KEYS.includes(event.key)) return
    // Alt+P plays/pauses even when an <input> / <textarea> has focus,
    // so users can pause / resume while typing a comment without
    // leaving the field. All other shortcuts stay blocked inside text
    // inputs to avoid accidental triggers.
    if (event.altKey && (event.key === 'p' || event.key === 'P')) {
      pauseEvent(event)
      handlers.onPlayPause?.()
      return
    }
    if (isTypingTarget(event.target)) return
    if (event.key === 'Alt') {
      isAltHeld.value = true
      // Suppress the browser menu-bar focus that some browsers
      // trigger on Alt; the gesture is "Alt + drag to pan".
      pauseEvent(event)
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
        // Modified arrows belong to surface-specific handlers bound on
        // the same window target (playlist entity navigation on Alt,
        // entity reorder on Ctrl+Shift) — stepping a frame on top of
        // them overwrote their seek.
        if (!alt && !mod) handlers.onPrevFrame?.()
        break
      case 'ArrowRight':
        if (!alt && !mod) handlers.onNextFrame?.()
        break
      case 'Home':
        pauseEvent(event)
        handlers.onFirstFrame?.()
        break
      case 'End':
        pauseEvent(event)
        handlers.onLastFrame?.()
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
      case 'e':
        pauseEvent(event)
        handlers.onErase?.()
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
    if (event.key === 'Alt') {
      isAltHeld.value = false
      pauseEvent(event)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('keyup', onKeyUp, false)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  })

  return { isAltHeld }
}
