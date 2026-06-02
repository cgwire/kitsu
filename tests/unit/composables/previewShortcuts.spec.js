import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

import { usePreviewShortcuts } from '@/composables/players/previewShortcuts'

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
      dispatchKeydown({ key: 'r' })
      expect(handlers.onRedo).not.toHaveBeenCalled()
      dispatchKeydown({ key: 'r', altKey: true })
      expect(handlers.onRedo).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('Alt+J / Alt+K navigate previews; bare keys do nothing', () => {
      const { handlers, wrapper } = mountShortcuts()
      dispatchKeydown({ key: 'j' })
      dispatchKeydown({ key: 'k' })
      expect(handlers.onPrevPreview).not.toHaveBeenCalled()
      expect(handlers.onNextPreview).not.toHaveBeenCalled()
      dispatchKeydown({ key: 'j', altKey: true })
      dispatchKeydown({ key: 'k', altKey: true })
      expect(handlers.onPrevPreview).toHaveBeenCalledTimes(1)
      expect(handlers.onNextPreview).toHaveBeenCalledTimes(1)
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
      dispatchKeydown({ key: 'o' })
      expect(handlers.onToggleOverlay).not.toHaveBeenCalled()
      dispatchKeydown({ key: 'o', altKey: true })
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
      dispatchKeydown({ key: 'p', altKey: true, target: textarea })
      expect(handlers.onPlayPause).toHaveBeenCalledTimes(1)
      // Uppercase P (Shift+Alt+P) also fires — pen layouts vary.
      dispatchKeydown({ key: 'P', altKey: true, target: textarea })
      expect(handlers.onPlayPause).toHaveBeenCalledTimes(2)
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
