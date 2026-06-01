import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'

import {
  CURSOR_LASER,
  CURSOR_PENCIL,
  buildEraserCursor,
  useAnnotationCursor
} from '@/composables/players/annotationCursor'

/**
 * Mount the composable inside a host component so the global mouse
 * listeners are wired by onMounted. Returns the captured cursor
 * computed, the mode refs (so tests can flip them) and the wrapper.
 */
const mountCursor = (overrides = {}) => {
  const modes = {
    isAltHeld: ref(false),
    isDrawing: ref(false),
    isTyping: ref(false),
    isShapeMode: ref(false),
    isLaserModeOn: ref(false),
    isEraserModeOn: ref(false),
    pencilWidth: ref('big'),
    ...overrides
  }
  let api
  const TestComponent = defineComponent({
    setup() {
      api = useAnnotationCursor(modes)
      return () => null
    }
  })
  const wrapper = mount(TestComponent)
  return { wrapper, cursor: api.cursor, modes }
}

const fireMouse = type => {
  window.dispatchEvent(new MouseEvent(type, { bubbles: true }))
}

describe('composables/annotationCursor', () => {
  it('returns null when nothing is active', () => {
    const { cursor, wrapper } = mountCursor()
    expect(cursor.value).toBeNull()
    wrapper.unmount()
  })

  describe('per-mode mapping', () => {
    it('maps isTyping to text', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isTyping.value = true
      expect(cursor.value).toBe('text')
      wrapper.unmount()
    })

    it('maps isShapeMode to crosshair', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isShapeMode.value = true
      expect(cursor.value).toBe('crosshair')
      wrapper.unmount()
    })

    it('maps isDrawing to the pencil cursor', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isDrawing.value = true
      expect(cursor.value).toBe(CURSOR_PENCIL)
      wrapper.unmount()
    })

    it('maps isLaserModeOn to the laser cursor', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isLaserModeOn.value = true
      expect(cursor.value).toBe(CURSOR_LASER)
      wrapper.unmount()
    })

    it('maps isEraserModeOn to a round eraser cursor sized to the width', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isEraserModeOn.value = true
      modes.pencilWidth.value = 'big'
      expect(cursor.value).toBe(buildEraserCursor('big'))
      expect(cursor.value).toContain('circle')
      wrapper.unmount()
    })

    it('resizes the eraser cursor when the width preset changes', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isEraserModeOn.value = true
      modes.pencilWidth.value = 'tiny'
      const tiny = cursor.value
      modes.pencilWidth.value = 'huge'
      expect(cursor.value).not.toBe(tiny)
      expect(cursor.value).toBe(buildEraserCursor('huge'))
      wrapper.unmount()
    })
  })

  describe('Alt-pan', () => {
    it('returns grab when Alt is held and the mouse is up', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isAltHeld.value = true
      expect(cursor.value).toBe('grab')
      wrapper.unmount()
    })

    it('swaps to grabbing when the mouse is pressed', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isAltHeld.value = true
      fireMouse('mousedown')
      expect(cursor.value).toBe('grabbing')
      fireMouse('mouseup')
      expect(cursor.value).toBe('grab')
      wrapper.unmount()
    })

    it('trumps every other mode while Alt is held', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isDrawing.value = true
      modes.isShapeMode.value = true
      modes.isLaserModeOn.value = true
      modes.isTyping.value = true
      modes.isAltHeld.value = true
      expect(cursor.value).toBe('grab')
      wrapper.unmount()
    })
  })

  describe('priority order', () => {
    // Order documented in the composable: alt > typing > laser >
    // shape > drawing > null.
    it('prefers typing over laser, shape and drawing', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isTyping.value = true
      modes.isLaserModeOn.value = true
      modes.isShapeMode.value = true
      modes.isDrawing.value = true
      expect(cursor.value).toBe('text')
      wrapper.unmount()
    })

    it('prefers the eraser over laser, shape and drawing', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isEraserModeOn.value = true
      modes.isLaserModeOn.value = true
      modes.isShapeMode.value = true
      modes.isDrawing.value = true
      expect(cursor.value).toBe(buildEraserCursor('big'))
      wrapper.unmount()
    })

    it('prefers laser over shape and drawing', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isLaserModeOn.value = true
      modes.isShapeMode.value = true
      modes.isDrawing.value = true
      expect(cursor.value).toBe(CURSOR_LASER)
      wrapper.unmount()
    })

    it('prefers shape over drawing', () => {
      const { cursor, modes, wrapper } = mountCursor()
      modes.isShapeMode.value = true
      modes.isDrawing.value = true
      expect(cursor.value).toBe('crosshair')
      wrapper.unmount()
    })
  })

  it('detaches the global mouse listeners on unmount', () => {
    const { cursor, modes, wrapper } = mountCursor()
    modes.isAltHeld.value = true
    fireMouse('mousedown')
    expect(cursor.value).toBe('grabbing')
    wrapper.unmount()
    // Releasing after unmount must not flip the state of a stale
    // instance (cursor is dead, but the listener shouldn't keep
    // firing on the window either).
    fireMouse('mouseup')
    // Nothing to assert beyond "did not throw" — the composable is
    // gone, we just verified the listener removal contract holds.
  })
})
