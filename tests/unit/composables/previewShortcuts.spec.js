import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

import {
  usePreviewShortcuts,
  isAltLetter
} from '@/composables/players/previewShortcuts'

/**
 * Mount the composable inside a host component so window listeners are
 * attached/detached via onMounted/onBeforeUnmount. Returns the API
 * (isAltHeld), the captured handlers, and the wrapper so callers can
 * unmount cleanly.
 */
const mountShortcuts = (handlerOverrides = {}) => {
  const handlers = {
    onDelete: vi.fn(),
    onPrevFrame: vi.fn(),
    onNextFrame: vi.fn(),
    onFirstFrame: vi.fn(),
    onLastFrame: vi.fn(),
    onPlayPause: vi.fn(),
    onPrevAnnotation: vi.fn(),
    onNextAnnotation: vi.fn(),
    onAnnotate: vi.fn(),
    onErase: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onPrevPreview: vi.fn(),
    onNextPreview: vi.fn(),
    onCopy: vi.fn(),
    onPaste: vi.fn(),
    onToggleOverlay: vi.fn(),
    ...handlerOverrides
  }
  let api
  const TestComponent = defineComponent({
    setup() {
      api = usePreviewShortcuts(handlers)
      return () => null
    }
  })
  const wrapper = mount(TestComponent)
  return { wrapper, api, handlers }
}

const dispatchKeydown = (overrides = {}) => {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...overrides
  })
  // KeyboardEvent doesn't honour `target` from init, set it manually so
  // the isTypingTarget check sees what we want.
  if (overrides.target) {
    Object.defineProperty(event, 'target', { value: overrides.target })
  }
  window.dispatchEvent(event)
  return event
}

const dispatchKeyup = (overrides = {}) => {
  const event = new KeyboardEvent('keyup', {
    bubbles: true,
    cancelable: true,
    ...overrides
  })
  window.dispatchEvent(event)
  return event
}

describe('composables/previewShortcuts', () => {
  describe('isAltHeld', () => {
    it('starts false', () => {
      const { api, wrapper } = mountShortcuts()
      expect(api.isAltHeld.value).toBe(false)
      wrapper.unmount()
    })

    it('flips true on Alt keydown and back on keyup', () => {
      const { api, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'Alt' })
      expect(api.isAltHeld.value).toBe(true)
      dispatchKeyup({ key: 'Alt' })
      expect(api.isAltHeld.value).toBe(false)
      wrapper.unmount()
    })
  })

  describe('plain keys', () => {
    it('Space triggers onPlayPause', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: ' ' })
      expect(handlers.onPlayPause).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('Delete and Backspace both trigger onDelete', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'Delete' })
      dispatchKeydown({ key: 'Backspace' })
      expect(handlers.onDelete).toHaveBeenCalledTimes(2)
      wrapper.unmount()
    })

    it('ArrowLeft and ArrowRight step through frames', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'ArrowLeft' })
      dispatchKeydown({ key: 'ArrowRight' })
      expect(handlers.onPrevFrame).toHaveBeenCalledTimes(1)
      expect(handlers.onNextFrame).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('ignores modified arrows — Alt/Ctrl combos belong to surface handlers', () => {
      // PlaylistPlayer binds Alt+Arrow (entity navigation) and
      // Ctrl+Shift+Arrow (entity reorder) on the same window target;
      // stepping a frame on top of those overwrote their seek.
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'ArrowLeft', altKey: true })
      dispatchKeydown({ key: 'ArrowRight', altKey: true })
      dispatchKeydown({ key: 'ArrowLeft', ctrlKey: true, shiftKey: true })
      dispatchKeydown({ key: 'ArrowRight', metaKey: true })
      expect(handlers.onPrevFrame).not.toHaveBeenCalled()
      expect(handlers.onNextFrame).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('keeps stepping frames on auto-repeat so holding an arrow scrubs the video', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'ArrowRight', repeat: true })
      dispatchKeydown({ key: 'ArrowRight', repeat: true })
      dispatchKeydown({ key: 'ArrowLeft', repeat: true })
      expect(handlers.onNextFrame).toHaveBeenCalledTimes(2)
      expect(handlers.onPrevFrame).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('Home and End jump to the first / last frame and suppress page scroll', () => {
      const { handlers, wrapper } = mountShortcuts()
      const home = dispatchKeydown({ key: 'Home' })
      const end = dispatchKeydown({ key: 'End' })
      expect(handlers.onFirstFrame).toHaveBeenCalledTimes(1)
      expect(handlers.onLastFrame).toHaveBeenCalledTimes(1)
      expect(home.defaultPrevented).toBe(true)
      expect(end.defaultPrevented).toBe(true)
      wrapper.unmount()
    })

    it('`,` and `.` step through annotations', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: ',' })
      dispatchKeydown({ key: '.' })
      expect(handlers.onPrevAnnotation).toHaveBeenCalledTimes(1)
      expect(handlers.onNextAnnotation).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('`d` triggers onAnnotate', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'd' })
      expect(handlers.onAnnotate).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('`e` triggers onErase', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'e' })
      expect(handlers.onErase).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('matches on the typed character, not the physical key, so `d`/`e` work on non-QWERTY layouts', () => {
      // On BÉPO/Dvorak the key that types `e` reports event.code `KeyF`
      // (and `d` reports something other than `KeyD`). Matching on
      // event.code would break draw/eraser there; we match on event.key.
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'd', code: 'KeyH' })
      dispatchKeydown({ key: 'e', code: 'KeyF' })
      expect(handlers.onAnnotate).toHaveBeenCalledTimes(1)
      expect(handlers.onErase).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('ignores auto-repeat keydowns so a held key does not double-toggle', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'e', repeat: true })
      dispatchKeydown({ key: 'd', repeat: true })
      expect(handlers.onErase).not.toHaveBeenCalled()
      expect(handlers.onAnnotate).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('modifier-gated keys', () => {
    it('Ctrl+Z triggers onUndo (and bare `z` does not)', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'z' })
      expect(handlers.onUndo).not.toHaveBeenCalled()
      dispatchKeydown({ key: 'z', ctrlKey: true })
      expect(handlers.onUndo).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('Alt+R triggers onRedo, bare `r` does not', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'r', code: 'KeyR' })
      expect(handlers.onRedo).not.toHaveBeenCalled()
      dispatchKeydown({ key: 'r', code: 'KeyR', altKey: true })
      expect(handlers.onRedo).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('Alt+J / Alt+K navigate previews; bare keys do nothing', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'j', code: 'KeyJ' })
      dispatchKeydown({ key: 'k', code: 'KeyK' })
      expect(handlers.onPrevPreview).not.toHaveBeenCalled()
      expect(handlers.onNextPreview).not.toHaveBeenCalled()
      dispatchKeydown({ key: 'j', code: 'KeyJ', altKey: true })
      dispatchKeydown({ key: 'k', code: 'KeyK', altKey: true })
      expect(handlers.onPrevPreview).toHaveBeenCalledTimes(1)
      expect(handlers.onNextPreview).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('matches Alt+letter shortcuts on event.code so they survive macOS Option key', () => {
      // On macOS the Option/Alt modifier rewrites the typed character
      // (Option+K → '˚', Option+J → '∆', Option+R → '®', Option+O → 'ø',
      // Option+P → 'π'). event.key is therefore never the bare letter, so
      // matching on event.key left these shortcuts dead on a Mac. We match
      // event.code (the physical key) here; the typed-character path below
      // keeps non-QWERTY layouts working too.
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: '˚', code: 'KeyK', altKey: true })
      dispatchKeydown({ key: '∆', code: 'KeyJ', altKey: true })
      dispatchKeydown({ key: '®', code: 'KeyR', altKey: true })
      dispatchKeydown({ key: 'ø', code: 'KeyO', altKey: true })
      dispatchKeydown({ key: 'π', code: 'KeyP', altKey: true })
      expect(handlers.onNextPreview).toHaveBeenCalledTimes(1)
      expect(handlers.onPrevPreview).toHaveBeenCalledTimes(1)
      expect(handlers.onRedo).toHaveBeenCalledTimes(1)
      expect(handlers.onToggleOverlay).toHaveBeenCalledTimes(1)
      expect(handlers.onPlayPause).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('matches Alt+letter shortcuts on the typed character too, so they survive non-QWERTY layouts', () => {
      // On BÉPO/Dvorak (Windows/Linux) Alt does not rewrite the character,
      // but the letter sits on a different physical key, so event.code
      // diverges from the QWERTY position while event.key stays the bare
      // letter. event.key takes precedence whenever it is a plain letter,
      // so the shortcut stays on the user's key-cap letter regardless of
      // physical position — what commit 9572c64 fixed and this preserves.
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'r', code: 'KeyB', altKey: true })
      dispatchKeydown({ key: 'j', code: 'KeyN', altKey: true })
      dispatchKeydown({ key: 'k', code: 'KeyM', altKey: true })
      dispatchKeydown({ key: 'o', code: 'KeyV', altKey: true })
      dispatchKeydown({ key: 'p', code: 'KeyG', altKey: true })
      expect(handlers.onRedo).toHaveBeenCalledTimes(1)
      expect(handlers.onPrevPreview).toHaveBeenCalledTimes(1)
      expect(handlers.onNextPreview).toHaveBeenCalledTimes(1)
      expect(handlers.onToggleOverlay).toHaveBeenCalledTimes(1)
      expect(handlers.onPlayPause).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('keeps BÉPO Alt+J / Alt+O on their key-cap letter even when the physical key collides with another shortcut', () => {
      // Regression guard. On BÉPO the 'J' key is physically KeyP and the
      // 'O' key is physically KeyR. With a plain event.code match the
      // earlier-checked Alt+P / Alt+R would steal these events (Alt+J →
      // play/pause, Alt+O → redo). event.key ('j' / 'o') must win so the
      // intended navigation / overlay toggle fires and nothing else does.
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'j', code: 'KeyP', altKey: true })
      expect(handlers.onPrevPreview).toHaveBeenCalledTimes(1)
      expect(handlers.onPlayPause).not.toHaveBeenCalled()
      dispatchKeydown({ key: 'o', code: 'KeyR', altKey: true })
      expect(handlers.onToggleOverlay).toHaveBeenCalledTimes(1)
      expect(handlers.onRedo).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('does not fire a shortcut from the physical position when the typed letter is not a shortcut (non-QWERTY)', () => {
      // The flip side of preferring event.key: a Dvorak user pressing
      // Alt+T (physically KeyK) types a plain 't', which is no shortcut, so
      // event.code must NOT back-door it into onNextPreview. Same for Alt+H
      // (physically KeyJ) and Alt+L (physically KeyP).
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 't', code: 'KeyK', altKey: true })
      dispatchKeydown({ key: 'h', code: 'KeyJ', altKey: true })
      dispatchKeydown({ key: 'l', code: 'KeyP', altKey: true })
      expect(handlers.onNextPreview).not.toHaveBeenCalled()
      expect(handlers.onPrevPreview).not.toHaveBeenCalled()
      expect(handlers.onPlayPause).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('documents the known macOS + non-QWERTY limitation: BÉPO Alt+J / Alt+O misfire because the Option glyph forces the physical-position fallback', () => {
      // The Win/Linux BÉPO case above works because Alt leaves event.key a
      // plain letter. On macOS the Option modifier rewrites event.key to a
      // glyph on EVERY layout, so the match always falls back to event.code
      // (physical QWERTY position). BÉPO's 'J' cap is physical KeyP and its
      // 'O' cap is physical KeyR, so Option+J / Option+O fire the
      // *neighbouring* shortcut (play/pause / redo), not prev-preview /
      // overlay. Unavoidable without navigator.keyboard.getLayoutMap()
      // (absent in Safari/Firefox). This test pins the trade-off so it is
      // explicit rather than a silent surprise. The exact glyph is
      // layout-defined; only "not a plain a-z letter" matters here.
      const { handlers, wrapper } = mountShortcuts()
      // Option + BÉPO 'J' cap (physical KeyP) → misfires as Alt+P.
      dispatchKeydown({ key: '≤', code: 'KeyP', altKey: true })
      expect(handlers.onPlayPause).toHaveBeenCalledTimes(1)
      expect(handlers.onPrevPreview).not.toHaveBeenCalled()
      // Option + BÉPO 'O' cap (physical KeyR) → misfires as Alt+R (redo).
      dispatchKeydown({ key: '∞', code: 'KeyR', altKey: true })
      expect(handlers.onRedo).toHaveBeenCalledTimes(1)
      expect(handlers.onToggleOverlay).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('does not fire Alt shortcuts on Windows AltGr (Ctrl+Alt), which types characters', () => {
      // Windows reports AltGr as Ctrl+Alt (event.ctrlKey && event.altKey).
      // On international layouts AltGr+letter types a character, so it must
      // not hijack the player shortcuts. event.code is identical to a plain
      // Alt press, so the ctrlKey flag is the only discriminator.
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: '®', code: 'KeyR', altKey: true, ctrlKey: true })
      dispatchKeydown({ key: '∆', code: 'KeyJ', altKey: true, ctrlKey: true })
      dispatchKeydown({ key: '˚', code: 'KeyK', altKey: true, ctrlKey: true })
      dispatchKeydown({ key: 'ø', code: 'KeyO', altKey: true, ctrlKey: true })
      dispatchKeydown({ key: 'π', code: 'KeyP', altKey: true, ctrlKey: true })
      expect(handlers.onRedo).not.toHaveBeenCalled()
      expect(handlers.onPrevPreview).not.toHaveBeenCalled()
      expect(handlers.onNextPreview).not.toHaveBeenCalled()
      expect(handlers.onToggleOverlay).not.toHaveBeenCalled()
      expect(handlers.onPlayPause).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('does not fire Alt shortcuts on macOS Cmd+Option chords (metaKey), which the user did not aim at the player', () => {
      // Cmd+Option+letter is reported as metaKey && altKey (ctrlKey false).
      // It is never the intended bare-Option shortcut and often an OS /
      // browser chord (e.g. Cmd+Option+J opens devtools), so isAltLetter
      // excludes ctrl/meta — only a plain Option/Alt press should trigger
      // these.
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: '®', code: 'KeyR', altKey: true, metaKey: true })
      dispatchKeydown({ key: '∆', code: 'KeyJ', altKey: true, metaKey: true })
      dispatchKeydown({ key: '˚', code: 'KeyK', altKey: true, metaKey: true })
      dispatchKeydown({ key: 'ø', code: 'KeyO', altKey: true, metaKey: true })
      dispatchKeydown({ key: 'π', code: 'KeyP', altKey: true, metaKey: true })
      expect(handlers.onRedo).not.toHaveBeenCalled()
      expect(handlers.onPrevPreview).not.toHaveBeenCalled()
      expect(handlers.onNextPreview).not.toHaveBeenCalled()
      expect(handlers.onToggleOverlay).not.toHaveBeenCalled()
      expect(handlers.onPlayPause).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('Ctrl+C / Ctrl+V trigger copy / paste', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'c', ctrlKey: true })
      dispatchKeydown({ key: 'v', metaKey: true })
      expect(handlers.onCopy).toHaveBeenCalledTimes(1)
      expect(handlers.onPaste).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('Alt+O toggles the comparison overlay', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'o', code: 'KeyO' })
      expect(handlers.onToggleOverlay).not.toHaveBeenCalled()
      dispatchKeydown({ key: 'o', code: 'KeyO', altKey: true })
      expect(handlers.onToggleOverlay).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })
  })

  describe('typing-target guard', () => {
    it('skips shortcuts when the event target is an <input>', () => {
      const { handlers, wrapper } = mountShortcuts()
      const input = document.createElement('input')
      dispatchKeydown({ key: ' ', target: input })
      dispatchKeydown({ key: 'd', target: input })
      expect(handlers.onPlayPause).not.toHaveBeenCalled()
      expect(handlers.onAnnotate).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('skips shortcuts when the event target is a <textarea>', () => {
      const { handlers, wrapper } = mountShortcuts()
      const textarea = document.createElement('textarea')
      dispatchKeydown({ key: 'ArrowRight', target: textarea })
      expect(handlers.onNextFrame).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('still fires Alt+P from inside a <textarea> so users can pause while typing a comment', () => {
      const { handlers, wrapper } = mountShortcuts()
      const textarea = document.createElement('textarea')
      dispatchKeydown({ key: 'p', code: 'KeyP', altKey: true, target: textarea })
      expect(handlers.onPlayPause).toHaveBeenCalledTimes(1)
      // Matching is physical (event.code), so the macOS Option+P glyph 'π'
      // — where event.key is never 'p' — triggers it just the same.
      dispatchKeydown({ key: 'π', code: 'KeyP', altKey: true, target: textarea })
      expect(handlers.onPlayPause).toHaveBeenCalledTimes(2)
      // Shift+Alt+P (uppercase P, pen layouts vary) still fires: Shift
      // leaves event.code as 'KeyP' and adds no ctrl/meta modifier.
      dispatchKeydown({
        key: 'P',
        code: 'KeyP',
        altKey: true,
        shiftKey: true,
        target: textarea
      })
      expect(handlers.onPlayPause).toHaveBeenCalledTimes(3)
      wrapper.unmount()
    })
  })

  describe('cleanup', () => {
    it('detaches its listeners on unmount', () => {
      const { handlers, wrapper } = mountShortcuts()
      wrapper.unmount()
      dispatchKeydown({ key: ' ' })
      expect(handlers.onPlayPause).not.toHaveBeenCalled()
    })
  })
})

describe('isAltLetter', () => {
  // Shared matching primitive used by usePreviewShortcuts and by players
  // with their own keydown handler (SharedPlaylistPlayer). A plain typed
  // letter (event.key) takes precedence; event.code is the fallback only
  // when the OS rewrote the character (macOS Option). Ctrl/Cmd excluded.
  const ev = overrides => ({
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    ...overrides
  })

  it('falls back to the physical key (event.code) when event.key is a non-letter glyph (macOS Option)', () => {
    expect(isAltLetter(ev({ altKey: true, code: 'KeyR', key: '®' }), 'KeyR', 'r')).toBe(true)
  })

  it('matches the typed letter (event.key) when the code diverges (BÉPO/Dvorak)', () => {
    expect(isAltLetter(ev({ altKey: true, code: 'KeyB', key: 'r' }), 'KeyR', 'r')).toBe(true)
  })

  it('prefers the typed letter over the physical key when they point to different shortcuts (BÉPO J on KeyP)', () => {
    // BÉPO 'J' is physically KeyP. It must match Alt+J, never Alt+P.
    const bepoAltJ = ev({ altKey: true, code: 'KeyP', key: 'j' })
    expect(isAltLetter(bepoAltJ, 'KeyJ', 'j')).toBe(true)
    expect(isAltLetter(bepoAltJ, 'KeyP', 'p')).toBe(false)
  })

  it('known limitation: on macOS the Option glyph forces the event.code path, so a relocated BÉPO cap matches its PHYSICAL position, not the printed letter', () => {
    // The case above is Win/Linux BÉPO, where event.key stays 'j'. On macOS
    // Option rewrites event.key to a glyph on every layout, so the
    // typed-letter branch never applies and we fall back to event.code.
    // BÉPO's 'J' cap is physical KeyP, and the event carries no clue it is
    // 'J', so it matches Alt+P and never Alt+J. Pins the macOS+non-QWERTY
    // trade-off; see the isAltLetter doc-comment.
    const macBepoAltJ = ev({ altKey: true, code: 'KeyP', key: '≤' })
    expect(isAltLetter(macBepoAltJ, 'KeyP', 'p')).toBe(true)
    expect(isAltLetter(macBepoAltJ, 'KeyJ', 'j')).toBe(false)
  })

  it('falls back to physical position on non-Latin layouts (Cyrillic), where event.key is a non-ASCII letter', () => {
    // On a Russian layout the physical KeyR types 'к': a length-1 letter, but
    // outside a-z, so the typed-letter branch is skipped and we key off
    // event.code. The Latin 'r' is untypable there, so physical position is
    // the only usable match — the same fallback macOS Option triggers.
    expect(isAltLetter(ev({ altKey: true, code: 'KeyR', key: 'к' }), 'KeyR', 'r')).toBe(true)
    // And it does not spuriously match a different shortcut's code.
    expect(isAltLetter(ev({ altKey: true, code: 'KeyR', key: 'к' }), 'KeyJ', 'j')).toBe(false)
  })

  it('is case-insensitive on the typed letter (Shift)', () => {
    expect(isAltLetter(ev({ altKey: true, code: 'KeyP', key: 'P' }), 'KeyP', 'p')).toBe(true)
  })

  it('requires Alt', () => {
    expect(isAltLetter(ev({ code: 'KeyR', key: 'r' }), 'KeyR', 'r')).toBe(false)
  })

  it('excludes Ctrl (Windows AltGr) and Cmd (macOS chords)', () => {
    expect(
      isAltLetter(ev({ altKey: true, ctrlKey: true, code: 'KeyR', key: 'r' }), 'KeyR', 'r')
    ).toBe(false)
    expect(
      isAltLetter(ev({ altKey: true, metaKey: true, code: 'KeyR', key: 'r' }), 'KeyR', 'r')
    ).toBe(false)
  })

  it('does not match an unrelated key', () => {
    expect(isAltLetter(ev({ altKey: true, code: 'KeyA', key: 'a' }), 'KeyR', 'r')).toBe(false)
  })
})
