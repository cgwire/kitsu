/* eslint-disable no-undef */
import { describe, it, expect, vi } from 'vitest'

import { annotationMixin } from '@/components/mixins/annotation'

/*
 * Create a mock context simulating a Vue component using the annotation mixin.
 * Methods from the mixin are bound to the context so they can access `this`.
 */
const createContext = (overrides = {}) => {
  const objects = []
  const ctx = {
    ...annotationMixin.data(),
    fabricCanvas: {
      getObjects: () => objects,
      _objects: objects,
      width: 800,
      height: 600,
      add: vi.fn((obj) => objects.push(obj)),
      remove: vi.fn((obj) => {
        const idx = objects.indexOf(obj)
        if (idx !== -1) objects.splice(idx, 1)
      }),
      clear: vi.fn(() => objects.splice(0, objects.length)),
      renderAll: vi.fn(),
      getActiveObject: vi.fn(),
      setActiveObject: vi.fn(),
      discardActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
      freeDrawingBrush: {
        color: '#ff3860',
        width: 4,
        pressureManager: { fallback: 0.5 }
      },
      isDrawingMode: false,
      setDimensions: vi.fn(),
      getPointer: vi.fn(() => ({ x: 0, y: 0 }))
    },
    $options: {
      doneActionStack: [],
      undoneActionStack: [],
      silentAnnotation: false
    },
    $store: {
      commit: vi.fn()
    },
    $emit: vi.fn(),
    $refs: {},
    annotations: [],
    preview: {},
    userId: 'user-1',
    isCurrentUserArtist: false,
    isDrawing: false,
    isTyping: false,
    isLaserModeOn: false,
    getCurrentTime: () => 1.0,
    getCurrentFrame: () => 24,
    ...overrides
  }

  Object.keys(annotationMixin.methods).forEach(key => {
    ctx[key] = annotationMixin.methods[key].bind(ctx)
  })

  return ctx
}

const createSerializableObject = (props = {}) => {
  const obj = {
    id: props.id || 'obj-1',
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
    toJSON: vi.fn(() => ({ ...obj, set: undefined, toJSON: undefined, serialize: undefined })),
    ...props
  }
  return obj
}

describe('annotationMixin', () => {
  describe('findAnnotation', () => {
    it('finds annotation at matching time', () => {
      const ctx = createContext()
      const list = [
        { time: 1.0, drawing: {} },
        { time: 2.0, drawing: {} }
      ]
      expect(ctx.findAnnotation(list, 1.0)).toBe(list[0])
      expect(ctx.findAnnotation(list, 2.0)).toBe(list[1])
    })

    it('finds annotation within tolerance', () => {
      const ctx = createContext()
      const list = [{ time: 1.0, drawing: {} }]
      expect(ctx.findAnnotation(list, 1.00005)).toBe(list[0])
      expect(ctx.findAnnotation(list, 0.99995)).toBe(list[0])
    })

    it('returns undefined when no match', () => {
      const ctx = createContext()
      const list = [{ time: 1.0, drawing: {} }]
      expect(ctx.findAnnotation(list, 5.0)).toBeUndefined()
    })

    it('returns undefined for empty list', () => {
      const ctx = createContext()
      expect(ctx.findAnnotation([], 1.0)).toBeUndefined()
    })
  })

  describe('getObjectById', () => {
    it('finds object by id', () => {
      const ctx = createContext()
      const obj = { id: 'abc-123' }
      ctx.fabricCanvas._objects.push(obj)
      expect(ctx.getObjectById('abc-123')).toBe(obj)
    })

    it('returns undefined for unknown id', () => {
      const ctx = createContext()
      expect(ctx.getObjectById('unknown')).toBeUndefined()
    })
  })

  describe('addSerialization', () => {
    it('adds serialize method to object', () => {
      const ctx = createContext()
      const obj = {
        id: 'obj-1',
        canvasWidth: 800,
        canvasHeight: 600,
        angle: 0,
        scale: 1,
        createdBy: 'user-1',
        toJSON: () => ({ type: 'path' })
      }
      ctx.addSerialization(obj)
      expect(typeof obj.serialize).toBe('function')
      const result = obj.serialize()
      expect(result.id).toBe('obj-1')
      expect(result.canvasWidth).toBe(800)
      expect(result.createdBy).toBe('user-1')
    })
  })

  describe('setObjectData', () => {
    it('sets id, canvas dimensions, and createdBy on fabric object', () => {
      const ctx = createContext()
      const obj = createSerializableObject({ id: null })
      ctx.setObjectData(obj)
      expect(obj.set).toHaveBeenCalledWith('id', expect.any(String))
      expect(obj.set).toHaveBeenCalledWith('canvasWidth', 800)
      expect(obj.set).toHaveBeenCalledWith('canvasHeight', 600)
      expect(obj.set).toHaveBeenCalledWith('createdBy', 'user-1')
    })

    it('handles plain objects without set method', () => {
      const ctx = createContext()
      const obj = { toJSON: () => ({}) }
      ctx.setObjectData(obj)
      expect(obj.id).toBeDefined()
      expect(obj.canvasWidth).toBe(800)
      expect(obj.canvasHeight).toBe(600)
      expect(obj.createdBy).toBe('user-1')
    })

    it('preserves existing id', () => {
      const ctx = createContext()
      const obj = createSerializableObject({ id: 'existing-id' })
      ctx.setObjectData(obj)
      expect(obj.id).toBe('existing-id')
    })

    it('preserves existing createdBy', () => {
      const ctx = createContext()
      const obj = createSerializableObject({ createdBy: 'other-user' })
      ctx.setObjectData(obj)
      expect(obj.createdBy).toBe('other-user')
    })
  })

  describe('clearModifications', () => {
    it('clears additions, updates and deletions', () => {
      const ctx = createContext()
      ctx.additions = [{ time: 1.0 }]
      ctx.updates = [{ time: 2.0 }]
      ctx.deletions = [{ time: 3.0 }]
      ctx.clearModifications()
      expect(ctx.additions).toEqual([])
      expect(ctx.updates).toEqual([])
      expect(ctx.deletions).toEqual([])
    })
  })

  describe('addToAdditions', () => {
    it('creates a new addition entry', () => {
      const ctx = createContext()
      const obj = createSerializableObject()
      ctx.addSerialization(obj)
      ctx.addToAdditions(obj)
      expect(ctx.additions).toHaveLength(1)
      expect(ctx.additions[0].time).toBe(1.0)
      expect(ctx.additions[0].frame).toBe(24)
      expect(ctx.additions[0].drawing.objects).toHaveLength(1)
    })

    it('appends to existing addition at same time', () => {
      const ctx = createContext()
      const obj1 = createSerializableObject({ id: 'obj-1' })
      const obj2 = createSerializableObject({ id: 'obj-2' })
      ctx.addSerialization(obj1)
      ctx.addSerialization(obj2)
      ctx.addToAdditions(obj1)
      ctx.addToAdditions(obj2)
      expect(ctx.additions).toHaveLength(1)
      expect(ctx.additions[0].drawing.objects).toHaveLength(2)
    })
  })

  describe('removeFromAdditions', () => {
    it('removes object from additions by id', () => {
      const ctx = createContext()
      const obj = createSerializableObject({ id: 'obj-1' })
      ctx.addSerialization(obj)
      ctx.addToAdditions(obj)
      expect(ctx.additions[0].drawing.objects).toHaveLength(1)
      ctx.removeFromAdditions(obj)
      expect(ctx.additions[0].drawing.objects).toHaveLength(0)
    })

    it('does nothing if no additions at current time', () => {
      const ctx = createContext({
        getCurrentTime: () => 99.0
      })
      const obj = createSerializableObject()
      ctx.removeFromAdditions(obj)
      expect(ctx.additions).toHaveLength(0)
    })
  })

  describe('addToDeletions', () => {
    it('creates a new deletion entry', () => {
      const ctx = createContext()
      const obj = createSerializableObject()
      ctx.addSerialization(obj)
      ctx.addToDeletions(obj)
      expect(ctx.deletions).toHaveLength(1)
      expect(ctx.deletions[0].time).toBe(1.0)
      expect(ctx.deletions[0].objects).toEqual(['obj-1'])
    })

    it('appends to existing deletion at same time', () => {
      const ctx = createContext()
      const obj1 = createSerializableObject({ id: 'obj-1' })
      const obj2 = createSerializableObject({ id: 'obj-2' })
      ctx.addSerialization(obj1)
      ctx.addSerialization(obj2)
      ctx.addToDeletions(obj1)
      ctx.addToDeletions(obj2)
      expect(ctx.deletions).toHaveLength(1)
      expect(ctx.deletions[0].objects).toEqual(['obj-1', 'obj-2'])
    })

    it('adds serialize to object without it', () => {
      const ctx = createContext()
      const obj = { id: 'obj-1', toJSON: () => ({ id: 'obj-1' }) }
      ctx.addToDeletions(obj)
      expect(typeof obj.serialize).toBe('function')
    })
  })

  describe('removeFromDeletions', () => {
    it('removes object id from deletions', () => {
      const ctx = createContext()
      const obj = createSerializableObject({ id: 'obj-1' })
      ctx.addSerialization(obj)
      ctx.addToDeletions(obj)
      expect(ctx.deletions[0].objects).toHaveLength(1)
      ctx.removeFromDeletions(obj)
      expect(ctx.deletions[0].objects).toHaveLength(0)
    })
  })

  describe('addToUpdates', () => {
    it('creates an update entry', () => {
      const ctx = createContext()
      const obj = createSerializableObject()
      ctx.addToUpdates(obj)
      expect(ctx.updates).toHaveLength(1)
      expect(ctx.updates[0].time).toBe(1.0)
      expect(ctx.updates[0].drawing.objects).toHaveLength(1)
    })

    it('replaces existing update for same object', () => {
      const ctx = createContext()
      const obj = createSerializableObject({ id: 'obj-1' })
      ctx.addToUpdates(obj)
      ctx.addToUpdates(obj)
      expect(ctx.updates).toHaveLength(1)
      expect(ctx.updates[0].drawing.objects).toHaveLength(1)
    })
  })

  describe('isWriting', () => {
    it('returns true when last annotation time is after the given date', () => {
      const ctx = createContext()
      ctx.lastAnnotationTime = '2030-01-01T12:00:00'
      expect(ctx.isWriting('2025-01-01T00:00:00')).toBe(true)
    })

    it('returns false when last annotation time is before the given date', () => {
      const ctx = createContext()
      ctx.lastAnnotationTime = '2020-01-01T12:00:00'
      expect(ctx.isWriting('2025-01-01T00:00:00')).toBe(false)
    })

    it('returns false when no annotation time set', () => {
      const ctx = createContext()
      expect(ctx.isWriting('2025-01-01T00:00:00')).toBe(false)
    })
  })

  describe('isEmptyCanvas', () => {
    it('returns true when canvas has no objects', () => {
      const ctx = createContext()
      expect(ctx.isEmptyCanvas()).toBe(true)
    })

    it('returns false when canvas has objects', () => {
      const ctx = createContext()
      ctx.fabricCanvas._objects.push({ id: 'obj-1' })
      expect(ctx.isEmptyCanvas()).toBe(false)
    })

    it('returns true when no canvas', () => {
      const ctx = createContext({ fabricCanvas: null })
      expect(ctx.isEmptyCanvas()).toBe(true)
    })
  })

  describe('resetUndoStacks', () => {
    it('empties both action stacks', () => {
      const ctx = createContext()
      ctx.$options.doneActionStack = [{ type: 'add' }]
      ctx.$options.undoneActionStack = [{ type: 'remove' }]
      ctx.resetUndoStacks()
      expect(ctx.$options.doneActionStack).toEqual([])
      expect(ctx.$options.undoneActionStack).toEqual([])
    })
  })

  describe('reloadAnnotations', () => {
    it('sorts annotations by time ascending', () => {
      const ctx = createContext({
        preview: {
          annotations: [
            { time: 3.0, drawing: {} },
            { time: 1.0, drawing: {} },
            { time: 2.0, drawing: {} }
          ]
        }
      })
      const result = ctx.reloadAnnotations()
      expect(result[0].time).toBe(1.0)
      expect(result[1].time).toBe(2.0)
      expect(result[2].time).toBe(3.0)
    })

    it('returns empty array when no annotations', () => {
      const ctx = createContext({ preview: {} })
      const result = ctx.reloadAnnotations()
      expect(result).toEqual([])
    })

    it('returns empty array when preview has empty annotations', () => {
      const ctx = createContext({ preview: { annotations: [] } })
      const result = ctx.reloadAnnotations()
      expect(result).toEqual([])
    })
  })

  describe('palette toggles', () => {
    it('onPickPencilWidth toggles pencil palette', () => {
      const ctx = createContext()
      expect(ctx.isShowingPencilPalette).toBe(false)
      ctx.onPickPencilWidth()
      expect(ctx.isShowingPencilPalette).toBe(true)
      ctx.onPickPencilWidth()
      expect(ctx.isShowingPencilPalette).toBe(false)
    })

    it('onPickPencilColor toggles palette', () => {
      const ctx = createContext()
      expect(ctx.isShowingPalette).toBe(false)
      ctx.onPickPencilColor()
      expect(ctx.isShowingPalette).toBe(true)
    })

    it('onPickTextColor toggles palette', () => {
      const ctx = createContext()
      ctx.onPickTextColor()
      expect(ctx.isShowingPalette).toBe(true)
    })
  })

  describe('color and pencil changes', () => {
    it('onChangePencilColor updates color and closes palette', () => {
      const ctx = createContext()
      ctx.isShowingPalette = true
      ctx.onChangePencilColor('#00ff00')
      expect(ctx.pencilColor).toBe('#00ff00')
      expect(ctx.isShowingPalette).toBe(false)
      expect(ctx.fabricCanvas.freeDrawingBrush.color).toBe('#00ff00')
    })

    it('onChangePencilWidth updates width and closes palette', () => {
      const ctx = createContext()
      ctx.isShowingPalette = true
      ctx.onChangePencilWidth('small')
      expect(ctx.pencilWidth).toBe('small')
      expect(ctx.isShowingPalette).toBe(false)
      expect(ctx.fabricCanvas.freeDrawingBrush.width).toBe(2)
    })

    it('onChangeTextColor updates text color and closes palette', () => {
      const ctx = createContext()
      ctx.isShowingPalette = true
      ctx.onChangeTextColor('#0000ff')
      expect(ctx.textColor).toBe('#0000ff')
      expect(ctx.isShowingPalette).toBe(false)
    })
  })

  describe('_resetPencil', () => {
    it('converts pencil width names to pixel values', () => {
      const ctx = createContext()
      ctx.pencilWidth = 'big'
      ctx._resetPencil()
      expect(ctx.fabricCanvas.freeDrawingBrush.width).toBe(10)

      ctx.pencilWidth = 'medium'
      ctx._resetPencil()
      expect(ctx.fabricCanvas.freeDrawingBrush.width).toBe(5)

      ctx.pencilWidth = 'small'
      ctx._resetPencil()
      expect(ctx.fabricCanvas.freeDrawingBrush.width).toBe(2)
    })

    it('does nothing when no canvas', () => {
      const ctx = createContext({ fabricCanvas: null })
      expect(() => ctx._resetPencil()).not.toThrow()
    })
  })

  describe('applyGroupChanges', () => {
    it('returns object unchanged when not in a group', () => {
      const obj = { left: 10, top: 20, angle: 0, scaleX: 1, scaleY: 1 }
      const ctx = createContext()
      const result = ctx.applyGroupChanges({}, obj)
      expect(result.left).toBe(10)
      expect(result.top).toBe(20)
    })
  })

  describe('deleteSelection', () => {
    it('deletes the active object', () => {
      const ctx = createContext({ saveAnnotations: vi.fn() })
      const obj = createSerializableObject({ id: 'to-delete' })
      ctx.addSerialization(obj)
      ctx.fabricCanvas.getActiveObject.mockReturnValue(obj)
      ctx.deleteSelection()
      expect(ctx.fabricCanvas.remove).toHaveBeenCalledWith(obj)
    })
  })

  describe('printModificationStats', () => {
    it('does not throw with empty modifications', () => {
      const ctx = createContext()
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      expect(() => ctx.printModificationStats('test')).not.toThrow()
      expect(spy).toHaveBeenCalledWith('test', 0, 0, 0)
      spy.mockRestore()
    })

    it('counts objects in modifications', () => {
      const ctx = createContext()
      ctx.additions = [{ drawing: { objects: [{}, {}] } }]
      ctx.updates = [{ drawing: { objects: [{}] } }]
      ctx.deletions = [{ objects: ['id1', 'id2', 'id3'] }]
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      ctx.printModificationStats('prefix')
      expect(spy).toHaveBeenCalledWith('prefix', 2, 1, 3)
      spy.mockRestore()
    })
  })

  describe('endAnnotationSaving', () => {
    it('emits annotation-changed with modifications', () => {
      const ctx = createContext()
      const preview = { id: 'p-1' }
      ctx.notSaved = true
      ctx.$options.annotatedPreview = preview
      ctx.additions = [{ time: 1.0 }]
      ctx.updates = [{ time: 2.0 }]
      ctx.deletions = [{ time: 3.0 }]
      ctx.endAnnotationSaving()
      expect(ctx.$emit).toHaveBeenCalledWith('annotation-changed', {
        preview,
        additions: [{ time: 1.0 }],
        updates: [{ time: 2.0 }],
        deletions: [{ time: 3.0 }]
      })
      expect(ctx.notSaved).toBe(false)
      expect(ctx.additions).toEqual([])
    })

    it('does nothing when not saved', () => {
      const ctx = createContext()
      ctx.notSaved = false
      ctx.endAnnotationSaving()
      expect(ctx.$emit).not.toHaveBeenCalled()
    })
  })

  describe('startAnnotationSaving', () => {
    it('sets notSaved flag', () => {
      const ctx = createContext()
      ctx.startAnnotationSaving({ id: 'p-1' }, [])
      expect(ctx.notSaved).toBe(true)
      expect(ctx.$options.annotatedPreview).toEqual({ id: 'p-1' })
      clearTimeout(ctx.$options.annotationToSave)
    })
  })

  describe('onWindowsClosed', () => {
    it('returns confirmation when annotations not saved', () => {
      const ctx = createContext()
      ctx.notSaved = true
      const event = {}
      const result = ctx.onWindowsClosed(event)
      expect(result).toBe('Your annotations are not saved yet.')
      expect(event.returnValue).toBe('Your annotations are not saved yet.')
    })

    it('returns undefined when annotations are saved', () => {
      const ctx = createContext()
      ctx.notSaved = false
      const result = ctx.onWindowsClosed({})
      expect(result).toBeUndefined()
    })
  })
})
