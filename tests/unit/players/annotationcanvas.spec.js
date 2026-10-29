import { flushPromises, mount } from '@vue/test-utils'
import { IText } from 'fabric'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import AnnotationCanvas from '@/components/players/annotations/AnnotationCanvas.vue'

// A media element whose box the test sets.
const createMedia = (width, height) => {
  const media = document.createElement('div')
  media.box = { width, height }
  media.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    x: 0,
    y: 0,
    right: media.box.width,
    bottom: media.box.height,
    ...media.box
  })
  return media
}

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

  // On a phone the keyboard resizes the player as it opens: a note ending
  // there closed the keyboard at once.
  it('keeps a note being typed through a resize', async () => {
    const media = createMedia(400, 300)
    wrapper = mountCanvas({ mediaElement: media })
    const canvas = wrapper.vm.canvas
    const overlay = wrapper.find('.annotation-canvas').element
    const note = new IText('Type...', { left: 100, top: 100 })
    canvas.add(note)
    canvas.setActiveObject(note)
    note.enterEditing()
    const resizes = wrapper.emitted('resized').length

    media.box = { width: 200, height: 150 }
    wrapper.vm.updateBounds()
    await nextTick()

    expect(note.isEditing).toBe(true)
    expect([canvas.width, canvas.height]).toEqual([400, 300])
    expect(wrapper.emitted('resized')).toHaveLength(resizes)
    expect(overlay.style.transform).toBe(
      'translate(0px, 0px) scale(1) scale(0.5, 0.5)'
    )
  })

  // The note is saved with the coordinates of the box it was typed in.
  it('resizes the canvas once the typed note is saved', async () => {
    const media = createMedia(400, 300)
    wrapper = mountCanvas({ mediaElement: media })
    const canvas = wrapper.vm.canvas
    const overlay = wrapper.find('.annotation-canvas').element
    const note = new IText('Type...', { left: 100, top: 100 })
    canvas.add(note)
    canvas.setActiveObject(note)
    note.enterEditing()
    media.box = { width: 200, height: 150 }
    wrapper.vm.updateBounds()
    let savedBox = null
    canvas.on('object:modified', () => {
      savedBox = [canvas.width, canvas.height]
    })

    note.set('text', 'Fix the hand')
    note.exitEditing()
    await flushPromises()

    expect(savedBox).toEqual([400, 300])
    expect([canvas.width, canvas.height]).toEqual([200, 150])
    expect(wrapper.emitted('resized').at(-1)).toEqual([
      { width: 200, height: 150 }
    ])
    expect(overlay.style.transform).toBe('translate(0px, 0px) scale(1)')
  })
})
