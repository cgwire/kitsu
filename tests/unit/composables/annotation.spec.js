import { mount } from '@vue/test-utils'
import { computed, defineComponent, ref } from 'vue'

import { useAnnotation } from '@/composables/players/annotation'
import { Eraser, EraserBrush } from '@/lib/eraserbrush'

/**
 * Build a fake fabric.Canvas-like object good enough for the composable's
 * non-rendering branches (modifications bookkeeping, palette toggles,
 * pencil reset, …). The real canvas is created against a DOM element and
 * pulls in fabric.js / PSBrush which we don't exercise here.
 */
const createFakeCanvas = (overrides = {}) => {
  const objects = []
  const canvas = {
    width: 800,
    height: 600,
    _objects: objects,
    getObjects: () => objects,
    add: vi.fn(obj => objects.push(obj)),
    remove: vi.fn(obj => {
      const idx = objects.indexOf(obj)
      if (idx !== -1) objects.splice(idx, 1)
    }),
    clear: vi.fn(() => objects.splice(0, objects.length)),
    renderAll: vi.fn(),
    requestRenderAll: vi.fn(),
    getActiveObject: vi.fn(),
    setActiveObject: vi.fn(),
    discardActiveObject: vi.fn(),
    setDimensions: vi.fn(),
    getPointer: vi.fn(() => ({ x: 0, y: 0 })),
    getWidth: () => 800,
    getHeight: () => 600,
    on: vi.fn(),
    off: vi.fn(),
    isDrawingMode: false,
    skipTargetFind: true,
    freeDrawingBrush: {
      color: '#ff3860',
      width: 4,
      pressureManager: { fallback: 0.5 }
    },
    // contextContainer makes isFabricReady() truthy so clearCanvas() will
    // actually call canvas.clear() — only useful for the clearCanvas-flavoured
    // tests, but harmless to expose by default.
    contextContainer: {},
    ...overrides
  }
  return canvas
}

const createSerializableObject = (props = {}) => {
  const obj = {
    id: props.id ?? 'obj-1',
    left: 10,
    top: 20,
    stroke: '#ff0000',
    strokeWidth: 2,
    width: 50,
    height: 30,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    canvasWidth: 800,
    canvasHeight: 600,
    set: vi.fn((key, value) => {
      obj[key] = value
    }),
    toJSON: vi.fn(() => ({
      id: obj.id,
      type: 'path',
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth
    })),
    ...props
  }
  obj.serialize = function () {
    const result = obj.toJSON()
    result.id = obj.id
    result.canvasWidth = obj.canvasWidth
    result.canvasHeight = obj.canvasHeight
    return result
  }
  return obj
}

/**
 * Mount the composable inside a tiny host component so watchers and the
 * canvas mirroring run. Returns the wrapper, the captured composable API
 * and a couple of writable refs for tweaking the inputs from tests.
 */
const mountAnnotation = (options = {}) => {
  const {
    canvas = createFakeCanvas(),
    annotations = ref([]),
    isCurrentUserArtist = computed(() => false),
    userId = computed(() => 'user-1'),
    currentTime = 1.0,
    currentFrame = 24,
    isLaserModeOn = ref(false),
    isEraserModeOn = ref(false),
    storeOverrides = {},
    emitSpy = vi.fn(),
    saveAnnotationsCb = vi.fn(),
    onCanvasMouseMovedCb = vi.fn(),
    onCanvasReleasedCb = vi.fn(),
    postAnnotationAddition = vi.fn(),
    postAnnotationDeletion = vi.fn(),
    postAnnotationUpdate = vi.fn(),
    skipCanvas = false
  } = options

  // Defer wiring the canvas until after useAnnotation has finished
  // initialising. The composable's immediate watcher on
  // mainCanvasComponent calls configureCanvas synchronously, and
  // configureCanvas is a `const` declared further down in the same
  // composable — populating the ref before useAnnotation returns would
  // hit a TDZ ReferenceError. Real components don't see this because
  // the template ref starts null and only resolves after onMounted.
  const mainCanvasComponent = ref(null)
  const comparisonCanvasComponent = ref(null)
  const canvasWrapper = ref(null)
  const store = {
    commit: vi.fn(),
    ...storeOverrides
  }

  let api
  const TestComponent = defineComponent({
    setup() {
      api = useAnnotation({
        mainCanvasComponent,
        comparisonCanvasComponent,
        canvasWrapper,
        annotations,
        isCurrentUserArtist,
        userId,
        store,
        emit: emitSpy,
        getCurrentTime: () => currentTime,
        getCurrentFrame: () => currentFrame,
        saveAnnotationsCb,
        onCanvasMouseMovedCb,
        onCanvasReleasedCb,
        isLaserModeOn,
        isEraserModeOn,
        postAnnotationAddition,
        postAnnotationDeletion,
        postAnnotationUpdate
      })
      return () => null
    }
  })
  const wrapper = mount(TestComponent)
  if (!skipCanvas) {
    mainCanvasComponent.value = { canvas }
  }

  return {
    wrapper,
    api,
    canvas,
    annotations,
    emitSpy,
    saveAnnotationsCb,
    postAnnotationAddition,
    postAnnotationDeletion,
    postAnnotationUpdate,
    store,
    mainCanvasComponent,
    isLaserModeOn,
    isEraserModeOn
  }
}

describe('composables/annotation', () => {
  describe('findAnnotation', () => {
    it('finds annotation at the matching time', () => {
      const { api, wrapper } = mountAnnotation()
      const list = [
        { time: 1.0, drawing: {} },
        { time: 2.0, drawing: {} }
      ]
      expect(api.findAnnotation(list, 1.0)).toBe(list[0])
      expect(api.findAnnotation(list, 2.0)).toBe(list[1])
      wrapper.unmount()
    })

    it('finds annotation within tolerance', () => {
      const { api, wrapper } = mountAnnotation()
      const list = [{ time: 1.0, drawing: {} }]
      expect(api.findAnnotation(list, 1.00005)).toBe(list[0])
      expect(api.findAnnotation(list, 0.99995)).toBe(list[0])
      wrapper.unmount()
    })

    it('returns undefined when no match', () => {
      const { api, wrapper } = mountAnnotation()
      const list = [{ time: 1.0, drawing: {} }]
      expect(api.findAnnotation(list, 5.0)).toBeUndefined()
      wrapper.unmount()
    })

    it('returns undefined for an empty list', () => {
      const { api, wrapper } = mountAnnotation()
      expect(api.findAnnotation([], 1.0)).toBeUndefined()
      wrapper.unmount()
    })
  })

  describe('getObjectById', () => {
    it('finds an object by id', () => {
      const { api, canvas, wrapper } = mountAnnotation()
      const obj = { id: 'abc-123' }
      canvas._objects.push(obj)
      expect(api.getObjectById('abc-123')).toBe(obj)
      wrapper.unmount()
    })

    it('returns undefined for an unknown id', () => {
      const { api, wrapper } = mountAnnotation()
      expect(api.getObjectById('unknown')).toBeUndefined()
      wrapper.unmount()
    })

    it('returns null when there is no canvas', () => {
      const { api, wrapper } = mountAnnotation({ skipCanvas: true })
      expect(api.getObjectById('anything')).toBeNull()
      wrapper.unmount()
    })
  })

  describe('addSerialization', () => {
    it('persists the eraser mask even when toJSON omits it (PSStroke case)', () => {
      const { api, wrapper } = mountAnnotation()
      const obj = {
        id: 'stroke-1',
        canvasWidth: 800,
        canvasHeight: 600,
        // toJSON drops the eraser (mirrors PSStroke's custom toObject).
        toJSON: () => ({ type: 'PSStroke' }),
        eraser: { toObject: () => ({ type: 'eraser', objects: [{ path: 'M 0 0' }] }) }
      }
      api.addSerialization(obj)
      const result = obj.serialize()
      expect(result.eraser).toEqual({
        type: 'eraser',
        objects: [{ path: 'M 0 0' }]
      })
      wrapper.unmount()
    })
  })

  describe('clearModifications', () => {
    it('clears additions, updates and deletions', () => {
      const { api, wrapper } = mountAnnotation()
      api.additions.value = [{ time: 1.0 }]
      api.updates.value = [{ time: 2.0 }]
      api.deletions.value = [{ time: 3.0 }]
      api.clearModifications()
      expect(api.additions.value).toEqual([])
      expect(api.updates.value).toEqual([])
      expect(api.deletions.value).toEqual([])
      wrapper.unmount()
    })
  })

  describe('addToAdditions', () => {
    it('creates a new addition entry', () => {
      const { api, postAnnotationAddition, wrapper } = mountAnnotation()
      const obj = createSerializableObject()
      api.addToAdditions(obj)
      expect(api.additions.value).toHaveLength(1)
      expect(api.additions.value[0].time).toBe(1.0)
      expect(api.additions.value[0].frame).toBe(24)
      expect(api.additions.value[0].drawing.objects).toHaveLength(1)
      expect(postAnnotationAddition).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('appends to an existing addition at the same time', () => {
      const { api, wrapper } = mountAnnotation()
      const obj1 = createSerializableObject({ id: 'obj-1' })
      const obj2 = createSerializableObject({ id: 'obj-2' })
      api.addToAdditions(obj1)
      api.addToAdditions(obj2)
      expect(api.additions.value).toHaveLength(1)
      expect(api.additions.value[0].drawing.objects).toHaveLength(2)
      wrapper.unmount()
    })
  })

  describe('removeFromAdditions', () => {
    it('removes an object from additions by id', () => {
      const { api, wrapper } = mountAnnotation()
      const obj = createSerializableObject({ id: 'obj-1' })
      api.addToAdditions(obj)
      expect(api.additions.value[0].drawing.objects).toHaveLength(1)
      api.removeFromAdditions(obj)
      expect(api.additions.value[0].drawing.objects).toHaveLength(0)
      wrapper.unmount()
    })

    it('does nothing if there are no additions at the current time', () => {
      const { api, wrapper } = mountAnnotation()
      const obj = createSerializableObject()
      api.removeFromAdditions(obj)
      expect(api.additions.value).toHaveLength(0)
      wrapper.unmount()
    })
  })

  describe('addToDeletions', () => {
    it('creates a new deletion entry', () => {
      const { api, postAnnotationDeletion, wrapper } = mountAnnotation()
      const obj = createSerializableObject()
      api.addToDeletions(obj)
      expect(api.deletions.value).toHaveLength(1)
      expect(api.deletions.value[0].time).toBe(1.0)
      expect(api.deletions.value[0].objects).toEqual(['obj-1'])
      expect(postAnnotationDeletion).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('appends to an existing deletion at the same time', () => {
      const { api, wrapper } = mountAnnotation()
      const obj1 = createSerializableObject({ id: 'obj-1' })
      const obj2 = createSerializableObject({ id: 'obj-2' })
      api.addToDeletions(obj1)
      api.addToDeletions(obj2)
      expect(api.deletions.value).toHaveLength(1)
      expect(api.deletions.value[0].objects).toEqual(['obj-1', 'obj-2'])
      wrapper.unmount()
    })

    it('adds a serialize method to objects without one', () => {
      const { api, wrapper } = mountAnnotation()
      const obj = { id: 'obj-1', toJSON: () => ({ id: 'obj-1' }) }
      api.addToDeletions(obj)
      expect(typeof obj.serialize).toBe('function')
      wrapper.unmount()
    })
  })

  describe('removeFromDeletions', () => {
    it('removes an object id from deletions', () => {
      const { api, wrapper } = mountAnnotation()
      const obj = createSerializableObject({ id: 'obj-1' })
      api.addToDeletions(obj)
      expect(api.deletions.value[0].objects).toHaveLength(1)
      api.removeFromDeletions(obj)
      expect(api.deletions.value[0].objects).toHaveLength(0)
      wrapper.unmount()
    })
  })

  describe('addToUpdates', () => {
    it('creates an update entry', () => {
      const { api, postAnnotationUpdate, wrapper } = mountAnnotation()
      const obj = createSerializableObject()
      api.addToUpdates(obj)
      expect(api.updates.value).toHaveLength(1)
      expect(api.updates.value[0].time).toBe(1.0)
      expect(api.updates.value[0].drawing.objects).toHaveLength(1)
      expect(postAnnotationUpdate).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('replaces the existing update for the same object id', () => {
      const { api, wrapper } = mountAnnotation()
      const obj = createSerializableObject({ id: 'obj-1' })
      api.addToUpdates(obj)
      api.addToUpdates(obj)
      expect(api.updates.value).toHaveLength(1)
      expect(api.updates.value[0].drawing.objects).toHaveLength(1)
      wrapper.unmount()
    })
  })

  describe('onErasingEnd', () => {
    it('routes erased objects to updates, not additions', () => {
      const { api, postAnnotationUpdate, saveAnnotationsCb, wrapper } =
        mountAnnotation()
      const objA = createSerializableObject({ id: 'a' })
      const objB = createSerializableObject({ id: 'b' })
      api.onErasingEnd({ targets: [objA, objB], path: {} })
      expect(api.updates.value).toHaveLength(1)
      expect(api.updates.value[0].drawing.objects).toHaveLength(2)
      expect(api.additions.value).toHaveLength(0)
      expect(postAnnotationUpdate).toHaveBeenCalledTimes(2)
      expect(saveAnnotationsCb).toHaveBeenCalled()
      wrapper.unmount()
    })

    it('ignores an erasing:end that touched no object', () => {
      const { api, saveAnnotationsCb, wrapper } = mountAnnotation()
      api.onErasingEnd({ targets: [], subTargets: [] })
      expect(api.updates.value).toHaveLength(0)
      expect(saveAnnotationsCb).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('isWriting', () => {
    it('returns true when last annotation time is after the given date', () => {
      const { api, wrapper } = mountAnnotation()
      api.lastAnnotationTime.value = '2030-01-01T12:00:00'
      expect(api.isWriting('2025-01-01T00:00:00')).toBe(true)
      wrapper.unmount()
    })

    it('returns false when last annotation time is before the given date', () => {
      const { api, wrapper } = mountAnnotation()
      api.lastAnnotationTime.value = '2020-01-01T12:00:00'
      expect(api.isWriting('2025-01-01T00:00:00')).toBe(false)
      wrapper.unmount()
    })

    it('returns false when no annotation time is set', () => {
      const { api, wrapper } = mountAnnotation()
      expect(api.isWriting('2025-01-01T00:00:00')).toBe(false)
      wrapper.unmount()
    })
  })

  describe('isEmptyCanvas', () => {
    it('returns true when the canvas has no objects', () => {
      const { api, wrapper } = mountAnnotation()
      expect(api.isEmptyCanvas()).toBe(true)
      wrapper.unmount()
    })

    it('returns false when the canvas has objects', () => {
      const { api, canvas, wrapper } = mountAnnotation()
      canvas._objects.push({ id: 'obj-1' })
      expect(api.isEmptyCanvas()).toBe(false)
      wrapper.unmount()
    })

    it('returns true when there is no canvas', () => {
      const { api, wrapper } = mountAnnotation({ skipCanvas: true })
      expect(api.isEmptyCanvas()).toBe(true)
      wrapper.unmount()
    })
  })

  describe('resetUndoStacks', () => {
    it('runs without throwing', () => {
      const { api, wrapper } = mountAnnotation()
      expect(() => api.resetUndoStacks()).not.toThrow()
      wrapper.unmount()
    })
  })

  describe('color and pencil changes', () => {
    it('onChangePencilColor updates the color', () => {
      const { api, canvas, wrapper } = mountAnnotation()
      api.onChangePencilColor('#00ff00')
      expect(api.pencilColor.value).toBe('#00ff00')
      expect(canvas.freeDrawingBrush.color).toBe('#00ff00')
      wrapper.unmount()
    })

    it('onChangePencilWidth updates the width', () => {
      const { api, canvas, wrapper } = mountAnnotation()
      api.onChangePencilWidth('small')
      expect(api.pencilWidth.value).toBe('small')
      expect(canvas.freeDrawingBrush.width).toBe(4)
      wrapper.unmount()
    })

    it('onChangeTextColor updates the text color', () => {
      const { api, wrapper } = mountAnnotation()
      api.onChangeTextColor('#0000ff')
      expect(api.textColor.value).toBe('#0000ff')
      wrapper.unmount()
    })
  })

  describe('_resetPencil', () => {
    it('converts pencil width names to pixel values', () => {
      const { api, canvas, wrapper } = mountAnnotation()
      api.pencilWidth.value = 'big'
      api._resetPencil()
      expect(canvas.freeDrawingBrush.width).toBe(20)
      api.pencilWidth.value = 'medium'
      api._resetPencil()
      expect(canvas.freeDrawingBrush.width).toBe(10)
      api.pencilWidth.value = 'small'
      api._resetPencil()
      expect(canvas.freeDrawingBrush.width).toBe(4)
      wrapper.unmount()
    })

    it('does nothing when there is no canvas', () => {
      const { api, wrapper } = mountAnnotation({ skipCanvas: true })
      expect(() => api._resetPencil()).not.toThrow()
      wrapper.unmount()
    })
  })

  describe('onEraseClicked', () => {
    it('installs an EraserBrush, enables drawing, exits shape mode', () => {
      const isEraserModeOn = ref(false)
      const { api, canvas, wrapper } = mountAnnotation({ isEraserModeOn })
      api.isShapeMode.value = true
      api.onEraseClicked()
      expect(isEraserModeOn.value).toBe(true)
      expect(canvas.isDrawingMode).toBe(true)
      expect(api.isShapeMode.value).toBe(false)
      expect(canvas.freeDrawingBrush).toBeInstanceOf(EraserBrush)
      wrapper.unmount()
    })

    it('toggles the eraser off on a second click', () => {
      const isEraserModeOn = ref(false)
      const { api, canvas, wrapper } = mountAnnotation({ isEraserModeOn })
      api.onEraseClicked()
      api.onEraseClicked()
      expect(isEraserModeOn.value).toBe(false)
      expect(canvas.isDrawingMode).toBe(false)
      wrapper.unmount()
    })

    it('leaving the pencil mode turns the eraser off', () => {
      const isEraserModeOn = ref(false)
      const { api, canvas, wrapper } = mountAnnotation({ isEraserModeOn })
      api.onEraseClicked()
      expect(isEraserModeOn.value).toBe(true)
      api.onAnnotateClicked()
      expect(isEraserModeOn.value).toBe(false)
      expect(canvas.isDrawingMode).toBe(true)
      wrapper.unmount()
    })

    it('keeps drawing mode on when the eraser owns it (stray leave-drawing)', () => {
      const isEraserModeOn = ref(false)
      const { api, canvas, wrapper } = mountAnnotation({ isEraserModeOn })
      api.onEraseClicked()
      expect(canvas.isDrawingMode).toBe(true)
      // Mirrors the isDrawing watcher firing async after pencil→eraser.
      api.setAnnotationDrawingMode(false)
      expect(canvas.isDrawingMode).toBe(true)
      wrapper.unmount()
    })
  })

  describe('applyGroupChanges', () => {
    it('returns the object unchanged when it is not in a group', () => {
      const { api, wrapper } = mountAnnotation()
      const obj = { left: 10, top: 20, angle: 0, scaleX: 1, scaleY: 1 }
      const result = api.applyGroupChanges({}, obj)
      expect(result.left).toBe(10)
      expect(result.top).toBe(20)
      wrapper.unmount()
    })
  })

  describe('deleteSelection', () => {
    it('deletes the active object from the canvas', () => {
      const { api, canvas, saveAnnotationsCb, wrapper } = mountAnnotation()
      const obj = createSerializableObject({ id: 'to-delete' })
      canvas.getActiveObject.mockReturnValue(obj)
      api.deleteSelection()
      expect(canvas.remove).toHaveBeenCalledWith(obj)
      expect(saveAnnotationsCb).toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('addObjectToCanvas — eraser selectivity', () => {
    // fabric.IText internally calls getContext('2d') to measure text.
    // jsdom returns null for canvas 2D contexts, so we install a minimal stub.
    let originalGetContext
    beforeAll(() => {
      originalGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (type) {
        if (type !== '2d') return originalGetContext.call(this, type)
        return {
          textBaseline: '',
          font: '',
          fillStyle: '',
          fillText: () => {},
          measureText: () => ({ width: 10 }),
          save: () => {},
          restore: () => {},
          scale: () => {},
          setTransform: () => {}
        }
      }
    })
    afterAll(() => {
      HTMLCanvasElement.prototype.getContext = originalGetContext
    })

    it('text object loaded via addObjectToCanvas has erasable === false', async () => {
      const canvas = createFakeCanvas()
      const { api, wrapper } = mountAnnotation({ canvas })
      const annotation = { width: 800, height: 600 }
      const obj = {
        id: 'txt-load-1',
        type: 'i-text',
        text: 'hello',
        left: 10,
        top: 20,
        width: 100,
        height: 30,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        fill: '#ff0000',
        fontFamily: 'Arial',
        fontSize: 16,
        textAlign: 'left',
        canvasWidth: 800,
        canvasHeight: 600
      }
      await api.addObjectToCanvas(annotation, obj, canvas)
      const added = canvas._objects.find(o => o.id === 'txt-load-1')
      expect(added).toBeDefined()
      expect(added.erasable).toBe(false)
      wrapper.unmount()
    })

    it('textbox object is loaded as text (kept in sync with the lib deserializer)', async () => {
      const canvas = createFakeCanvas()
      const { api, wrapper } = mountAnnotation({ canvas })
      const annotation = { width: 800, height: 600 }
      const obj = {
        id: 'txt-box-1',
        type: 'textbox',
        text: 'boxed',
        left: 10,
        top: 20,
        width: 100,
        height: 30,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        fill: '#00ff00',
        fontFamily: 'Arial',
        fontSize: 16,
        canvasWidth: 800,
        canvasHeight: 600
      }
      await api.addObjectToCanvas(annotation, obj, canvas)
      const added = canvas._objects.find(o => o.id === 'txt-box-1')
      expect(added).toBeDefined()
      expect(added.text).toBe('boxed')
      wrapper.unmount()
    })

    it('path object loaded via addObjectToCanvas does NOT have erasable === false', async () => {
      const canvas = createFakeCanvas()
      const { api, wrapper } = mountAnnotation({ canvas })
      const annotation = { width: 800, height: 600 }
      const obj = {
        id: 'path-load-1',
        type: 'path',
        path: 'M 0 0 L 10 10',
        left: 0,
        top: 0,
        width: 10,
        height: 10,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        stroke: '#ff0000',
        strokeWidth: 2,
        canvasWidth: 800,
        canvasHeight: 600
      }
      await api.addObjectToCanvas(annotation, obj, canvas)
      const added = canvas._objects.find(o => o.id === 'path-load-1')
      expect(added).toBeDefined()
      expect(added.erasable).not.toBe(false)
      wrapper.unmount()
    })

    it('revives a serialized eraser mask on a reloaded path', async () => {
      const canvas = createFakeCanvas()
      const { api, wrapper } = mountAnnotation({ canvas })
      const annotation = { width: 800, height: 600 }
      const obj = {
        id: 'path-erased',
        type: 'path',
        path: 'M 0 0 L 10 10',
        left: 0,
        top: 0,
        width: 10,
        height: 10,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        stroke: '#ff0000',
        strokeWidth: 2,
        canvasWidth: 800,
        canvasHeight: 600,
        eraser: { type: 'eraser', objects: [{ path: 'M 0 0 L 5 5' }] }
      }
      await api.addObjectToCanvas(annotation, obj, canvas)
      const added = canvas._objects.find(o => o.id === 'path-erased')
      expect(added.eraser).toBeInstanceOf(Eraser)
      expect(added.eraser.getObjects()).toHaveLength(1)
      wrapper.unmount()
    })
  })

  describe('printModificationStats', () => {
    it('does not throw with empty modifications', () => {
      const { api, wrapper } = mountAnnotation()
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      expect(() => api.printModificationStats('test')).not.toThrow()
      expect(spy).toHaveBeenCalledWith('test', 0, 0, 0)
      spy.mockRestore()
      wrapper.unmount()
    })

    it('counts objects across the modification buckets', () => {
      const { api, wrapper } = mountAnnotation()
      api.additions.value = [{ drawing: { objects: [{}, {}] } }]
      api.updates.value = [{ drawing: { objects: [{}] } }]
      api.deletions.value = [{ objects: ['id1', 'id2', 'id3'] }]
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      api.printModificationStats('prefix')
      expect(spy).toHaveBeenCalledWith('prefix', 2, 1, 3)
      spy.mockRestore()
      wrapper.unmount()
    })
  })

  describe('endAnnotationSaving', () => {
    it('emits annotation-changed with the buffered modifications', () => {
      const { api, emitSpy, wrapper } = mountAnnotation()
      const preview = { id: 'p-1' }
      api.startAnnotationSaving(preview, [])
      api.additions.value = [{ time: 1.0 }]
      api.updates.value = [{ time: 2.0 }]
      api.deletions.value = [{ time: 3.0 }]
      api.endAnnotationSaving()
      expect(emitSpy).toHaveBeenCalledWith('annotation-changed', {
        preview,
        additions: [{ time: 1.0 }],
        updates: [{ time: 2.0 }],
        deletions: [{ time: 3.0 }]
      })
      expect(api.notSaved.value).toBe(false)
      expect(api.additions.value).toEqual([])
      wrapper.unmount()
    })

    it('does nothing when notSaved is false', () => {
      const { api, emitSpy, wrapper } = mountAnnotation()
      api.notSaved.value = false
      api.endAnnotationSaving()
      expect(emitSpy).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('startAnnotationSaving', () => {
    it('flips notSaved on', () => {
      const { api, wrapper } = mountAnnotation()
      api.startAnnotationSaving({ id: 'p-1' }, [])
      expect(api.notSaved.value).toBe(true)
      // Reset the auto-save timeout: endAnnotationSaving consumes the buffer
      // and clears the pending setTimeout to avoid leaking into other tests.
      api.endAnnotationSaving()
      wrapper.unmount()
    })
  })

  describe('onWindowsClosed', () => {
    it('returns the warning message when annotations are not saved', () => {
      const { api, wrapper } = mountAnnotation()
      api.notSaved.value = true
      const event = {}
      const result = api.onWindowsClosed(event)
      expect(result).toBe('Your annotations are not saved yet.')
      expect(event.returnValue).toBe('Your annotations are not saved yet.')
      wrapper.unmount()
    })

    it('returns undefined when annotations are saved', () => {
      const { api, wrapper } = mountAnnotation()
      api.notSaved.value = false
      const result = api.onWindowsClosed({})
      expect(result).toBeUndefined()
      wrapper.unmount()
    })
  })

  describe('deleteObject', () => {
    it('removes a lone object, records the deletion and saves', () => {
      const obj = createSerializableObject({ id: 'a' })
      const canvas = createFakeCanvas()
      canvas._objects.push(obj)
      const { api, wrapper, saveAnnotationsCb } = mountAnnotation({ canvas })

      api.deleteObject(obj)

      expect(canvas.remove).toHaveBeenCalledWith(obj)
      expect(canvas._objects).not.toContain(obj)
      expect(saveAnnotationsCb).toHaveBeenCalled()
      // The deletion is now tracked at the current annotation time.
      const deletion = api.deletions.value.find(d => d.time === 1)
      expect(deletion?.objects).toEqual(['a'])
      wrapper.unmount()
    })

    it('discards the ActiveSelection before iterating its children', () => {
      // Mirror real fabric: discardActiveObject() clears _objects on the
      // selection. If deleteObject didn't snapshot _objects up-front the
      // iteration would skip every child after the first.
      const child1 = createSerializableObject({ id: 'a' })
      const child2 = createSerializableObject({ id: 'b' })
      const selection = { _objects: [child1, child2] }
      const canvas = createFakeCanvas()
      canvas._objects.push(child1, child2)
      canvas.discardActiveObject = vi.fn(() => {
        selection._objects.length = 0
      })
      const { api, wrapper } = mountAnnotation({ canvas })

      api.deleteObject(selection)

      expect(canvas.discardActiveObject).toHaveBeenCalled()
      expect(canvas.remove).toHaveBeenCalledTimes(2)
      expect(canvas.remove).toHaveBeenNthCalledWith(1, child1)
      expect(canvas.remove).toHaveBeenNthCalledWith(2, child2)
      wrapper.unmount()
    })
  })

  describe('undoLastAction', () => {
    it('no-ops on an empty done stack', () => {
      const { api, wrapper, saveAnnotationsCb } = mountAnnotation()
      api.undoLastAction()
      expect(saveAnnotationsCb).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it("undoes an 'add' by removing the live object and moving it to the undone stack", () => {
      const obj = createSerializableObject({ id: 'a' })
      const canvas = createFakeCanvas()
      const { api, wrapper } = mountAnnotation({ canvas })

      api.addObject(obj) // pushes { type: 'add', obj } onto done
      api.undoLastAction()

      expect(canvas.remove).toHaveBeenCalledWith(obj)
      // Redoing now should re-add it — proves the action landed on the
      // undone stack and that doing it twice is idempotent.
      api.redoLastAction()
      expect(canvas.add).toHaveBeenCalledWith(obj)
      wrapper.unmount()
    })

    it("undoes a 'remove' by re-adding the object and clearing the deletion", () => {
      const obj = createSerializableObject({ id: 'a' })
      const canvas = createFakeCanvas()
      canvas._objects.push(obj)
      const { api, wrapper } = mountAnnotation({ canvas })

      api.deleteObject(obj) // pushes { type: 'remove', obj } onto done
      canvas.add.mockClear()
      api.undoLastAction()

      expect(canvas.add).toHaveBeenCalledWith(obj)
      // The id is removed from the deletion entry — the entry itself
      // stays around with an empty objects array (we only undo one
      // object, not the whole entry, since a stroke and a delete can
      // share the same time bucket).
      const deletion = api.deletions.value[0]
      expect(deletion?.objects).toEqual([])
      wrapper.unmount()
    })

    it('resolves the live canvas instance when the stack holds a stale ref', () => {
      // Esc-exit fullscreen and similar canvas reloads rebuild every
      // fabric.Object; the stack still holds the previous instance.
      // resolveActionObject() looks the id up on the live canvas.
      const stale = createSerializableObject({ id: 'a' })
      const live = createSerializableObject({ id: 'a' })
      const canvas = createFakeCanvas()
      const { api, wrapper } = mountAnnotation({ canvas })

      api.addObject(stale) // done stack now holds the stale ref
      // Simulate a canvas reload: stale isn't on the canvas any more,
      // a fresh instance with the same id is.
      canvas._objects.length = 0
      canvas._objects.push(live)
      api.undoLastAction()

      expect(canvas.remove).toHaveBeenCalledWith(live)
      expect(canvas.remove).not.toHaveBeenCalledWith(stale)
      wrapper.unmount()
    })
  })

  describe('redoLastAction', () => {
    it('no-ops on an empty undone stack', () => {
      const { api, wrapper, saveAnnotationsCb } = mountAnnotation()
      api.redoLastAction()
      expect(saveAnnotationsCb).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it("redoes an 'add' and puts the action back on the done stack", () => {
      // Regression: addObject for a single object pushes onto done as
      // a side effect. The snapshot pattern must drop that push before
      // re-pushing the action, otherwise the done stack grows by two
      // entries per redo.
      const obj = createSerializableObject({ id: 'a' })
      const canvas = createFakeCanvas()
      const { api, wrapper } = mountAnnotation({ canvas })

      api.addObject(obj)
      api.undoLastAction()
      canvas.add.mockClear()
      canvas.remove.mockClear()

      api.redoLastAction()

      expect(canvas.add).toHaveBeenCalledWith(obj)
      // Calling undo again must put us back to the post-undo state in
      // a single step (one entry on done, not two).
      api.undoLastAction()
      expect(canvas.remove).toHaveBeenCalledWith(obj)
      // Empty done stack now — another undo is a no-op.
      const removeCallsBefore = canvas.remove.mock.calls.length
      api.undoLastAction()
      expect(canvas.remove.mock.calls.length).toBe(removeCallsBefore)
      wrapper.unmount()
    })
  })

  describe('eraser undo/redo', () => {
    // Mask paths model real fabric children: serialize() now reaches the
    // eraser, and a real Eraser.toObject() recurses into each child's
    // toObject() — so the fake children must expose one too.
    const makeMaskPath = (pathData = 'M 0 0 L 5 5') => ({
      path: pathData,
      toObject() {
        return { path: this.path }
      }
    })

    const makeErasable = (id, pathData = 'M 0 0 L 5 5') => {
      const eraser = {
        _objects: [makeMaskPath(pathData)],
        getObjects() {
          return this._objects
        },
        // The real Eraser (a fabric.Group subclass) exposes toObject();
        // serialize() now persists the mask through it, so the fake must
        // honour the same contract.
        toObject() {
          return {
            type: 'eraser',
            objects: this._objects.map(o => o.toObject())
          }
        }
      }
      return createSerializableObject({ id, eraser })
    }

    it("undoes an 'erase' by removing the last eraser path", () => {
      const { api, wrapper } = mountAnnotation()
      const obj = makeErasable('e1')
      api.onErasingEnd({ targets: [obj], path: {} })
      api.undoLastAction()
      // Single path popped → eraser emptied → dropped from the object.
      expect(obj.eraser).toBeUndefined()
      expect(obj.set).toHaveBeenCalledWith('dirty', true)
      wrapper.unmount()
    })

    it('redo restores the removed eraser path exactly', () => {
      const { api, wrapper } = mountAnnotation()
      const obj = makeErasable('e1')
      api.onErasingEnd({ targets: [obj], path: {} })
      api.undoLastAction()
      api.redoLastAction()
      expect(obj.eraser).toBeDefined()
      expect(obj.eraser.getObjects()).toHaveLength(1)
      expect(obj.eraser.getObjects()[0].path).toBe('M 0 0 L 5 5')
      wrapper.unmount()
    })

    it('redo targets the live object after a reload (fresh instance, same id)', () => {
      const canvas = createFakeCanvas()
      const { api, wrapper } = mountAnnotation({ canvas })
      const obj = makeErasable('e1')
      canvas._objects.push(obj)
      api.onErasingEnd({ targets: [obj], path: {} })
      api.undoLastAction()
      // Simulate a save/reload: the original object is swapped for a fresh
      // instance carrying the same id (and, post-undo, no eraser).
      const fresh = createSerializableObject({ id: 'e1' })
      canvas._objects.length = 0
      canvas._objects.push(fresh)
      api.redoLastAction()
      expect(fresh.eraser).toBeDefined()
      expect(fresh.eraser.getObjects()).toHaveLength(1)
      expect(obj.eraser).toBeUndefined() // the stale instance is untouched
      wrapper.unmount()
    })
  })
})
