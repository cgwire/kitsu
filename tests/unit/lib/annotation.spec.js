import {
  PENCIL_WIDTHS,
  addSerialization,
  applyPencilColor,
  applyPencilWidth,
  findAnnotationAtTime,
  pushAddition,
  removeAddition,
  setObjectData
} from '@/lib/annotation'

const createCanvas = () => ({
  width: 800,
  height: 600,
  freeDrawingBrush: { color: '#ff3860', width: 4 }
})

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
      ...obj,
      set: undefined,
      toJSON: undefined,
      serialize: undefined
    })),
    ...props
  }
  return obj
}

describe('lib/annotation', () => {
  describe('findAnnotationAtTime', () => {
    it('finds annotation at matching time', () => {
      const list = [
        { time: 1.0, drawing: {} },
        { time: 2.0, drawing: {} }
      ]
      expect(findAnnotationAtTime(list, 1.0, 0.04)).toBe(list[0])
      expect(findAnnotationAtTime(list, 2.0, 0.04)).toBe(list[1])
    })

    it('finds annotation within frame tolerance', () => {
      const list = [{ time: 1.0, drawing: {} }]
      // half-frame tolerance of 0.04 => 0.02 either side
      expect(findAnnotationAtTime(list, 1.01, 0.04)).toBe(list[0])
      expect(findAnnotationAtTime(list, 0.99, 0.04)).toBe(list[0])
    })

    it('returns null when no match', () => {
      const list = [{ time: 1.0, drawing: {} }]
      expect(findAnnotationAtTime(list, 5.0, 0.04)).toBeNull()
    })

    it('returns null for empty list', () => {
      expect(findAnnotationAtTime([], 1.0, 0.04)).toBeNull()
    })

    it('returns null for null/undefined list', () => {
      expect(findAnnotationAtTime(null, 1.0, 0.04)).toBeNull()
      expect(findAnnotationAtTime(undefined, 1.0, 0.04)).toBeNull()
    })

    it('matches the time-0 entry for pictures regardless of requested time', () => {
      const list = [
        { time: 0, drawing: {} },
        { time: 5, drawing: {} }
      ]
      expect(findAnnotationAtTime(list, 3.0, 0.04, true)).toBe(list[0])
    })

    it('returns null for pictures when there is no time-0 entry', () => {
      const list = [{ time: 5, drawing: {} }]
      expect(findAnnotationAtTime(list, 0, 0.04, true)).toBeNull()
    })
  })

  describe('addSerialization', () => {
    it('adds a serialize method to the object', () => {
      const obj = {
        id: 'obj-1',
        canvasWidth: 800,
        canvasHeight: 600,
        angle: 0,
        scale: 1,
        createdBy: 'user-1',
        toJSON: () => ({ type: 'path' })
      }
      addSerialization(obj)
      expect(typeof obj.serialize).toBe('function')
      const result = obj.serialize()
      expect(result.id).toBe('obj-1')
      expect(result.canvasWidth).toBe(800)
      expect(result.canvasHeight).toBe(600)
      expect(result.createdBy).toBe('user-1')
    })

    it('returns the object so it can be chained', () => {
      const obj = { toJSON: () => ({}) }
      expect(addSerialization(obj)).toBe(obj)
    })
  })

  describe('setObjectData', () => {
    it('sets id, canvas dimensions and createdBy on fabric-like objects', () => {
      const canvas = createCanvas()
      const obj = createSerializableObject({ id: null })
      setObjectData(obj, canvas, 'user-1')
      expect(obj.set).toHaveBeenCalledWith('id', expect.any(String))
      expect(obj.set).toHaveBeenCalledWith('canvasWidth', 800)
      expect(obj.set).toHaveBeenCalledWith('canvasHeight', 600)
      expect(obj.set).toHaveBeenCalledWith('createdBy', 'user-1')
    })

    it('handles plain objects without a set method', () => {
      const canvas = createCanvas()
      const obj = { toJSON: () => ({}) }
      setObjectData(obj, canvas, 'user-1')
      expect(obj.id).toBeDefined()
      expect(obj.canvasWidth).toBe(800)
      expect(obj.canvasHeight).toBe(600)
      expect(obj.createdBy).toBe('user-1')
    })

    it('preserves an existing id', () => {
      const canvas = createCanvas()
      const obj = createSerializableObject({ id: 'existing-id' })
      setObjectData(obj, canvas, 'user-1')
      expect(obj.id).toBe('existing-id')
    })

    it('preserves an existing createdBy', () => {
      const canvas = createCanvas()
      const obj = createSerializableObject({ createdBy: 'other-user' })
      setObjectData(obj, canvas, 'user-1')
      expect(obj.createdBy).toBe('other-user')
    })

    it('attaches a serialize method', () => {
      const canvas = createCanvas()
      const obj = createSerializableObject()
      setObjectData(obj, canvas, 'user-1')
      expect(typeof obj.serialize).toBe('function')
    })
  })

  describe('pushAddition', () => {
    it('creates a new addition entry when the slot is empty', () => {
      const obj = createSerializableObject()
      addSerialization(obj)
      const result = pushAddition([], {
        time: 1.0,
        frame: 24,
        canvasWidth: 800,
        canvasHeight: 600,
        object: obj
      })
      expect(result).toHaveLength(1)
      expect(result[0].time).toBe(1.0)
      expect(result[0].frame).toBe(24)
      expect(result[0].width).toBe(800)
      expect(result[0].height).toBe(600)
      expect(result[0].drawing.objects).toHaveLength(1)
    })

    it('appends to an existing entry at the same time', () => {
      const obj1 = createSerializableObject({ id: 'obj-1' })
      const obj2 = createSerializableObject({ id: 'obj-2' })
      addSerialization(obj1)
      addSerialization(obj2)
      let additions = []
      additions = pushAddition(additions, {
        time: 1.0,
        frame: 24,
        canvasWidth: 800,
        canvasHeight: 600,
        object: obj1
      })
      additions = pushAddition(additions, {
        time: 1.0,
        frame: 24,
        canvasWidth: 800,
        canvasHeight: 600,
        object: obj2
      })
      expect(additions).toHaveLength(1)
      expect(additions[0].drawing.objects).toHaveLength(2)
    })

    it('falls back to toJSON when serialize is not provided', () => {
      const obj = { id: 'obj-x', toJSON: () => ({ id: 'obj-x', type: 'path' }) }
      const result = pushAddition([], {
        time: 0,
        frame: 0,
        canvasWidth: 800,
        canvasHeight: 600,
        object: obj
      })
      expect(result[0].drawing.objects[0]).toEqual({
        id: 'obj-x',
        type: 'path'
      })
    })
  })

  describe('removeAddition', () => {
    it('removes the matching object id from every entry', () => {
      const obj1 = createSerializableObject({ id: 'obj-1' })
      const obj2 = createSerializableObject({ id: 'obj-2' })
      addSerialization(obj1)
      addSerialization(obj2)
      let additions = []
      additions = pushAddition(additions, {
        time: 1.0,
        frame: 24,
        canvasWidth: 800,
        canvasHeight: 600,
        object: obj1
      })
      additions = pushAddition(additions, {
        time: 1.0,
        frame: 24,
        canvasWidth: 800,
        canvasHeight: 600,
        object: obj2
      })
      const result = removeAddition(additions, 'obj-1')
      expect(result).toHaveLength(1)
      expect(result[0].drawing.objects).toHaveLength(1)
      expect(result[0].drawing.objects[0].id).toBe('obj-2')
    })

    it('drops the entry once its last object is removed', () => {
      const obj = createSerializableObject({ id: 'only' })
      addSerialization(obj)
      const additions = pushAddition([], {
        time: 1.0,
        frame: 24,
        canvasWidth: 800,
        canvasHeight: 600,
        object: obj
      })
      const result = removeAddition(additions, 'only')
      expect(result).toEqual([])
    })

    it('returns an empty array when there are no additions to start with', () => {
      expect(removeAddition([], 'whatever')).toEqual([])
    })
  })

  describe('applyPencilWidth', () => {
    it('converts pencil width names to pixel values', () => {
      const canvas = createCanvas()
      applyPencilWidth(canvas, 'big')
      expect(canvas.freeDrawingBrush.width).toBe(PENCIL_WIDTHS.big)
      applyPencilWidth(canvas, 'medium')
      expect(canvas.freeDrawingBrush.width).toBe(PENCIL_WIDTHS.medium)
      applyPencilWidth(canvas, 'small')
      expect(canvas.freeDrawingBrush.width).toBe(PENCIL_WIDTHS.small)
    })

    it('accepts a raw numeric value', () => {
      const canvas = createCanvas()
      applyPencilWidth(canvas, 7)
      expect(canvas.freeDrawingBrush.width).toBe(7)
    })

    it('does nothing when no canvas is provided', () => {
      expect(() => applyPencilWidth(null, 'big')).not.toThrow()
      expect(() => applyPencilWidth(undefined, 'big')).not.toThrow()
    })

    it('does nothing when the canvas has no freeDrawingBrush', () => {
      const canvas = { width: 0, height: 0 }
      expect(() => applyPencilWidth(canvas, 'big')).not.toThrow()
    })

    it('does nothing for unknown width names', () => {
      const canvas = createCanvas()
      const before = canvas.freeDrawingBrush.width
      applyPencilWidth(canvas, 'huge')
      expect(canvas.freeDrawingBrush.width).toBe(before)
    })
  })

  describe('applyPencilColor', () => {
    it('updates the brush color', () => {
      const canvas = createCanvas()
      applyPencilColor(canvas, '#00ff00')
      expect(canvas.freeDrawingBrush.color).toBe('#00ff00')
    })

    it('does nothing when no canvas is provided', () => {
      expect(() => applyPencilColor(null, '#000')).not.toThrow()
    })

    it('does nothing when the canvas has no freeDrawingBrush', () => {
      const canvas = { width: 0, height: 0 }
      expect(() => applyPencilColor(canvas, '#000')).not.toThrow()
    })
  })
})
