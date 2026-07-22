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
 * Match an Alt+letter shortcut across keyboard layouts and OSes.
 *
 * If event.key is a plain a-z letter we match on it and ignore physical
 * position: this keeps the shortcut on the user's key-cap letter on every
 * Latin Windows/Linux layout (AZERTY/BÉPO/Dvorak, commit 9572c64) and stops
 * a neighbour being hijacked by position. We fall back to event.code only
 * when event.key is NOT a plain a-z letter: the OS rewrote it (macOS Option,
 * Option+R → '®'; a dead key) OR the layout is non-Latin (Cyrillic/Greek/…),
 * where event.key is a non-ASCII letter. On those layouts the shortcut then
 * keys off physical QWERTY position — the same fallback as macOS — which is
 * the only usable behaviour since the Latin letter can't be typed at all.
 *
 * Known limitation — macOS + non-QWERTY: macOS Option rewrites event.key on
 * EVERY layout, so we always hit the event.code (physical QWERTY) branch
 * there. On BÉPO/Dvorak the shortcut then keys off physical position, not
 * the printed cap, so Alt+letter can be dead or fire a neighbour (BÉPO 'J'
 * cap is physical KeyP → Option+J hits Alt+P). Unrecoverable without
 * navigator.keyboard.getLayoutMap(), absent in Safari/Firefox.
 *
 * Ctrl/Cmd are excluded (Windows AltGr, macOS Cmd+Option). Exported so
 * players with their own keydown handler (SharedPlaylistPlayer) match alike.
 *
 * @param {KeyboardEvent} event
 * @param {string} code physical key, e.g. 'KeyR'
 * @param {string} key lowercase typed letter, e.g. 'r'
 */
export const isAltLetter = (event, code, key) => {
  if (!event.altKey || event.ctrlKey || event.metaKey) return false
  const typed = event.key?.length === 1 ? event.key.toLowerCase() : null
  return typed && typed >= 'a' && typed <= 'z'
    ? typed === key
    : event.code === code
}

/**
 * @param {Object} handlers
 * @param {Function} [handlers.isActive] - return false to ignore shortcuts
 *   while another player owns them (two players can be mounted at once:
 *   the playlist modal above a task page's preview player)
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
    // Both players register on window; without this, Ctrl+Z or d/e on
    // the visible player also mutated the hidden one's canvas.
    if (handlers.isActive && !handlers.isActive()) return
    if (event.repeat && !REPEATABLE_KEYS.includes(event.key)) return
    // Alt+P plays/pauses even when an <input> / <textarea> has focus, so
    // users can pause / resume while typing a comment without leaving the
    // field (it runs before the typing-target guard below). All other
    // shortcuts stay blocked inside text inputs to avoid accidental triggers.
    if (isAltLetter(event, 'KeyP', 'p')) {
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
    // Alt + letter shortcuts — matching rules live in isAltLetter.
    if (isAltLetter(event, 'KeyR', 'r')) {
      handlers.onRedo?.()
      return
    }
    if (isAltLetter(event, 'KeyJ', 'j')) {
      handlers.onPrevPreview?.()
      return
    }
    if (isAltLetter(event, 'KeyK', 'k')) {
      handlers.onNextPreview?.()
      return
    }
    if (isAltLetter(event, 'KeyO', 'o')) {
      pauseEvent(event)
      handlers.onToggleOverlay?.()
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
        // Bare-key tool toggles: leave Ctrl+D (bookmark) / Ctrl+E and
        // the Alt combos to the browser and other handlers.
        if (!alt && !mod) {
          pauseEvent(event)
          handlers.onAnnotate?.()
        }
        break
      case 'e':
        if (!alt && !mod) {
          pauseEvent(event)
          handlers.onErase?.()
        }
        break
      case 'z':
        if (mod) handlers.onUndo?.()
        break
      case 'c':
        if (mod) handlers.onCopy?.()
        break
      case 'v':
        if (mod) handlers.onPaste?.()
        break
    }
  }

  const onKeyUp = event => {
    if (event.key === 'Alt') {
      isAltHeld.value = false
      pauseEvent(event)
    }
  }

  // Alt+Tab away swallows the keyup: without this reset the overlay
  // stays pointer-transparent after coming back until Alt is tapped.
  const onWindowBlur = () => {
    isAltHeld.value = false
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('keyup', onKeyUp, false)
    window.addEventListener('blur', onWindowBlur)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onWindowBlur)
  })

  return { isAltHeld }
}
