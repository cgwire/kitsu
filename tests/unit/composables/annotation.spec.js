import { mount } from '@vue/test-utils'
import { computed, defineComponent, ref } from 'vue'

import { useAnnotation } from '@/composables/players/annotation'

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
    isLaserModeOn
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

  describe('palette toggles', () => {
    it('onPickPencilWidth toggles the pencil palette flag', () => {
      const { api, wrapper } = mountAnnotation()
      expect(api.isShowingPencilPalette.value).toBe(false)
      api.onPickPencilWidth()
      expect(api.isShowingPencilPalette.value).toBe(true)
      api.onPickPencilWidth()
      expect(api.isShowingPencilPalette.value).toBe(false)
      wrapper.unmount()
    })

    it('onPickPencilColor toggles the palette flag', () => {
      const { api, wrapper } = mountAnnotation()
      expect(api.isShowingPalette.value).toBe(false)
      api.onPickPencilColor()
      expect(api.isShowingPalette.value).toBe(true)
      wrapper.unmount()
    })

    it('onPickTextColor toggles the palette flag', () => {
      const { api, wrapper } = mountAnnotation()
      api.onPickTextColor()
      expect(api.isShowingPalette.value).toBe(true)
      wrapper.unmount()
    })
  })

  describe('color and pencil changes', () => {
    it('onChangePencilColor updates the color and closes the palette', () => {
      const { api, canvas, wrapper } = mountAnnotation()
      api.isShowingPalette.value = true
      api.onChangePencilColor('#00ff00')
      expect(api.pencilColor.value).toBe('#00ff00')
      expect(api.isShowingPalette.value).toBe(false)
      expect(canvas.freeDrawingBrush.color).toBe('#00ff00')
      wrapper.unmount()
    })

    it('onChangePencilWidth updates the width and closes the palette', () => {
      const { api, canvas, wrapper } = mountAnnotation()
      api.isShowingPalette.value = true
      api.onChangePencilWidth('small')
      expect(api.pencilWidth.value).toBe('small')
      expect(api.isShowingPalette.value).toBe(false)
      expect(canvas.freeDrawingBrush.width).toBe(2)
      wrapper.unmount()
    })

    it('onChangeTextColor updates the text color and closes the palette', () => {
      const { api, wrapper } = mountAnnotation()
      api.isShowingPalette.value = true
      api.onChangeTextColor('#0000ff')
      expect(api.textColor.value).toBe('#0000ff')
      expect(api.isShowingPalette.value).toBe(false)
      wrapper.unmount()
    })
  })

  describe('_resetPencil', () => {
    it('converts pencil width names to pixel values', () => {
      const { api, canvas, wrapper } = mountAnnotation()
      api.pencilWidth.value = 'big'
      api._resetPencil()
      expect(canvas.freeDrawingBrush.width).toBe(10)
      api.pencilWidth.value = 'medium'
      api._resetPencil()
      expect(canvas.freeDrawingBrush.width).toBe(5)
      api.pencilWidth.value = 'small'
      api._resetPencil()
      expect(canvas.freeDrawingBrush.width).toBe(2)
      wrapper.unmount()
    })

    it('does nothing when there is no canvas', () => {
      const { api, wrapper } = mountAnnotation({ skipCanvas: true })
      expect(() => api._resetPencil()).not.toThrow()
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
})
