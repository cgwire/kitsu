import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import SharedAnnotationOverlay from '@/components/players/annotations/SharedAnnotationOverlay.vue'

const STROKE = [
  [10, 20],
  [30, 40],
  [50, 60]
]

// Once a pointer is down, fabric listens on the document: the events bubble
// there since the overlay is attached.
const pointer = (target, type, kind, [x, y]) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
      clientX: x,
      clientY: y,
      isPrimary: true,
      pointerId: 1,
      pointerType: kind,
      pressure: type === 'pointerup' ? 0 : 0.5
    })
  )

const draw = (canvas, kind) => {
  pointer(canvas, 'pointerdown', kind, STROKE[0])
  STROKE.slice(1).forEach(point =>
    pointer(canvas, 'pointermove', kind, point)
  )
  pointer(canvas, 'pointerup', kind, STROKE.at(-1))
}

describe('players/SharedAnnotationOverlay', () => {
  let wrapper = null

  // The canvas is found by its id: the overlay must be in the document.
  const mountOverlay = () => {
    wrapper = mount(SharedAnnotationOverlay, {
      attachTo: document.body,
      props: {
        guestId: 'guest-1',
        isEditable: true,
        isPicture: true,
        movieDimensions: { width: 400, height: 300 },
        previewFileId: 'preview-1',
        token: 'token'
      },
      global: { plugins: [createStore({})] }
    })
    return wrapper
  }

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  // The player hands this surface to the finger gestures: the toolbar
  // buttons stay out of it and keep their taps.
  it('exposes the surface it draws on, its toolbar aside', () => {
    mountOverlay()
    const { overlay } = wrapper.vm
    expect(overlay).toBe(wrapper.find('.annotation-surface').element)
    expect(overlay.contains(wrapper.find('.annotation-tool').element)).toBe(
      false
    )
  })

  // The gestures hand a finger over to the tool as pointer events: the
  // canvas listens to those, as the studio one does.
  it.each(['mouse', 'pen', 'touch'])('draws with a %s pointer', kind => {
    mountOverlay()
    draw(wrapper.find('.upper-canvas').element, kind)
    expect(wrapper.vm.hasChanges()).toBe(true)
  })
})
