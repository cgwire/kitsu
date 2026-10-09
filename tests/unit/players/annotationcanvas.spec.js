import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import AnnotationCanvas from '@/components/players/annotations/AnnotationCanvas.vue'

const mountCanvas = (props = {}) =>
  mount(AnnotationCanvas, {
    props: { canvasId: 'annotation-canvas', ...props },
    global: {
      plugins: [createStore({ getters: { personMap: () => new Map() } })]
    },
    attachTo: document.body
  })

const touch = (target, type, x) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: 20,
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      pressure: 0.5
    })
  )

describe('AnnotationCanvas.vue', () => {
  let wrapper = null

  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}

        unobserve() {}

        disconnect() {}
      }
    )
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  // The player hands the pencil a finger once no pinch can come.
  it('draws the stroke of a finger', () => {
    wrapper = mountCanvas()
    const canvas = wrapper.vm.canvas
    canvas.isDrawingMode = true

    touch(canvas.upperCanvasEl, 'pointerdown', 10)
    touch(canvas.upperCanvasEl, 'pointermove', 30)
    touch(canvas.upperCanvasEl, 'pointermove', 60)
    touch(canvas.upperCanvasEl, 'pointerup', 60)

    expect(canvas.getObjects().map(object => object.type)).toEqual([
      'PSStroke'
    ])
  })
})
