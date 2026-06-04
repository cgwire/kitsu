import { describe, it, expect, vi, beforeAll } from 'vitest'

vi.mock('fabric', () => {
  class FakeLayoutManager {
    constructor(strategy) { this.strategy = strategy }
    subscribeTargets() {}
  }
  class FakeFixedLayout {}
  class FakeGroup {
    constructor(objects = [], opts = {}) {
      this._objects = objects
      Object.assign(this, opts)
    }
    getObjects() { return this._objects }
    add(o) { this._objects.push(o); return this }
    set(props) { Object.assign(this, props); return this }
    drawObject() {}
  }
  class FakePath {
    constructor(pathData, opts = {}) { this.path = pathData; Object.assign(this, opts) }
    set(props) { Object.assign(this, props); return this }
    calcTransformMatrix() { return [1, 0, 0, 1, 0, 0] }
    clone() { return Promise.resolve(new FakePath(this.path, { ...this })) }
    setCoords() {}
  }
  class FakePencilBrush {
    constructor(canvas) { this.canvas = canvas; this.color = '#000'; this.width = 4 }
    createPath(d) { return new FakePath(d, { fill: null, stroke: this.color, strokeWidth: this.width }) }
    onMouseUp() { return false }
    // eslint-disable-next-line no-unused-vars
    convertPointsToSVGPath(points) { return 'M 0 0 L 10 10' }
    decimatePoints(points) { return points }
  }
  const ObjectProto = {
    _drawClipPath(ctx, clipPath) { this._lastClip = clipPath },
    needsItsOwnCache() { return false },
    toObject(extra = []) { return { type: 'mock', extra } },
    _getNonTransformedDimensions() { return { x: 10, y: 20 } },
    cacheProperties: [],
    stateProperties: []
  }
  function FakeObject() {}
  FakeObject.prototype = ObjectProto
  const fakeUtil = {
    joinPath: d => d,
    invertTransform: (m) => m,
    multiplyTransformMatrices: () => [1, 0, 0, 1, 0, 0],
    applyTransformToObject: () => {}
  }
  const fakeClassRegistry = {
    setClass: () => {}
  }
  return {
    // Named exports (v6 style)
    FabricObject: FakeObject,
    Group: FakeGroup,
    Path: FakePath,
    PencilBrush: FakePencilBrush,
    FixedLayout: FakeFixedLayout,
    LayoutManager: FakeLayoutManager,
    util: fakeUtil,
    classRegistry: fakeClassRegistry
  }
})

const { Eraser, EraserBrush, installEraserObjectSupport } = await import('@/lib/players/eraserbrush')
import { FabricObject } from 'fabric'

describe('Eraser — class contract', () => {
  it('exposes a static type so Fabric v6 toObject serializes it as "eraser"', () => {
    // Without a static type, v6's toObject() would read the parent Group's
    // static type and serialize the mask as "group".
    expect(Eraser.type).toBe('eraser')
  })
})

describe('EraserBrush — core', () => {
  it('createPath produces a destination-out path', () => {
    const brush = new EraserBrush({})
    const path = brush.createPath('M 0 0 L 10 10')
    expect(path.globalCompositeOperation).toBe('destination-out')
    expect(path.stroke).toBe('#000')
  })

  it('needsFullRender returns true (live destination-out preview)', () => {
    expect(new EraserBrush({}).needsFullRender()).toBe(true)
  })

  it('exposes a PSBrush-shaped pressureManager stub', () => {
    const b = new EraserBrush({})
    expect(typeof b.pressureManager.fallback).toBe('number')
    expect(typeof b.pressureManager.onMouseDown).toBe('function')
    expect(typeof b.pressureManager.onMouseMove).toBe('function')
    expect(typeof b.pressureManager.onMouseUp).toBe('function')
  })

  it('onMouseUp returns the parent boolean unchanged on the happy path', () => {
    const b = new EraserBrush({})
    expect(b.onMouseUp({ e: {} })).toBe(false)
  })

  it('onMouseUp swallows downstream exceptions and returns false', () => {
    const b = new EraserBrush({})
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    // Force the parent onMouseUp to throw for this one call.
    const ParentProto = Object.getPrototypeOf(EraserBrush.prototype)
    const orig = ParentProto.onMouseUp
    ParentProto.onMouseUp = () => { throw new Error('boom') }
    expect(b.onMouseUp({ e: {} })).toBe(false)
    expect(spy).toHaveBeenCalled()
    ParentProto.onMouseUp = orig
    spy.mockRestore()
  })
})

describe('Eraser', () => {
  it('is a fixed-layout, center-origin group of type eraser', () => {
    const eraser = new Eraser()
    expect(eraser.type).toBe('eraser')
    expect(eraser.originX).toBe('center')
    expect(eraser.originY).toBe('center')
    // In v6 the layout is encoded in layoutManager, not a `layout` string
    expect(eraser.layoutManager).toBeDefined()
  })

  it('fromObject revives child paths directly as Path (no enlivenObjects)', async () => {
    const obj = { width: 100, height: 50, objects: [{ path: 'M 0 0 L 5 5', stroke: '#000' }] }
    const eraser = await Eraser.fromObject(obj)
    expect(eraser.getObjects()).toHaveLength(1)
    expect(eraser.getObjects()[0].path).toBe('M 0 0 L 5 5')
    expect(eraser.width).toBe(100)
  })

  it('fromObject passes children with FixedLayout so they stay in group coords', async () => {
    // FixedLayout preserves child positions (no re-centring), replacing the
    // v5 objectsRelativeToGroup=true mechanism.
    const eraser = await Eraser.fromObject({
      width: 100,
      height: 50,
      objects: [{ path: 'M 0 0 L 5 5' }]
    })
    // FixedLayout is set on the layoutManager
    expect(eraser.layoutManager).toBeDefined()
    expect(eraser.getObjects()).toHaveLength(1)
  })

  it('drawObject fills a centered black rect covering the eraser bounds', () => {
    const eraser = new Eraser([], { width: 100, height: 50 })
    const calls = []
    const ctx = {
      save: () => calls.push('save'),
      restore: () => calls.push('restore'),
      fillRect: (...args) => calls.push(['fillRect', ...args]),
      fillStyle: null
    }
    eraser.drawObject(ctx)
    expect(calls).toContainEqual(['fillRect', -50, -25, 100, 50])
    expect(calls[0]).toBe('save')
    expect(calls[calls.length - 1]).toBe('restore')
  })
})

describe('EraserBrush._addPathToObjectEraser', () => {
  const makeObj = () => ({
    erasable: true,
    eraser: undefined,
    group: undefined,
    calcTransformMatrix: () => [1, 0, 0, 1, 0, 0],
    set: vi.fn(),
    fire: vi.fn()
  })

  it('creates an Eraser on the object and adds the (cloned, local-space) path', async () => {
    const brush = new EraserBrush({})
    const obj = makeObj()
    const path = brush.createPath('M 0 0 L 10 0')
    const context = { targets: [], subTargets: [] }
    await brush._addPathToObjectEraser(obj, path, context)
    expect(obj.eraser).toBeDefined()
    expect(obj.eraser.getObjects()).toHaveLength(1)
    expect(obj.set).toHaveBeenCalledWith('dirty', true)
    expect(obj.fire).toHaveBeenCalledWith('erasing:end', expect.any(Object))
    expect(context.targets).toContain(obj)
  })

  it('reuses an existing eraser on a second pass', async () => {
    const brush = new EraserBrush({})
    const obj = makeObj()
    const p1 = brush.createPath('M 0 0 L 1 0')
    const p2 = brush.createPath('M 0 0 L 2 0')
    const ctx = { targets: [], subTargets: [] }
    await brush._addPathToObjectEraser(obj, p1, ctx)
    await brush._addPathToObjectEraser(obj, p2, ctx)
    expect(obj.eraser.getObjects()).toHaveLength(2)
  })

  it('routes grouped objects to subTargets', async () => {
    const brush = new EraserBrush({})
    const obj = makeObj()
    obj.group = {}
    const path = brush.createPath('M 0 0 L 1 0')
    const ctx = { targets: [], subTargets: [] }
    await brush._addPathToObjectEraser(obj, path, ctx)
    expect(ctx.subTargets).toContain(obj)
    expect(ctx.targets).not.toContain(obj)
  })

  it('still erases when no context is provided', async () => {
    const brush = new EraserBrush({})
    const obj = makeObj()
    const path = brush.createPath('M 0 0 L 1 0')
    await brush._addPathToObjectEraser(obj, path)
    expect(obj.eraser.getObjects()).toHaveLength(1)
    expect(obj.set).toHaveBeenCalledWith('dirty', true)
  })
})

describe('EraserBrush._finalizeAndAddPath', () => {
  const makeErasable = erasable => ({
    erasable,
    eraser: undefined,
    group: undefined,
    intersectsWithObject: () => true,
    calcTransformMatrix: () => [1, 0, 0, 1, 0, 0],
    set: vi.fn(),
    fire: vi.fn()
  })

  const makeCanvas = objects => {
    const fired = []
    return {
      _objects: objects,
      contextTop: { closePath: () => {} },
      clearContext: () => {},
      requestRenderAll: () => {},
      getContext: () => ({}),
      fire: (name, data) => fired.push({ name, data }),
      _fired: fired
    }
  }

  it('erases intersected erasable objects and fires erasing:end with targets', async () => {
    const erasable = makeErasable(true)
    const text = makeErasable(false)
    const canvas = makeCanvas([erasable, text])
    const brush = new EraserBrush(canvas)
    brush._points = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
    await brush._finalizeAndAddPath()
    const end = canvas._fired.find(f => f.name === 'erasing:end')
    expect(end).toBeDefined()
    expect(end.data.targets).toContain(erasable)
    expect(end.data.targets).not.toContain(text)
    expect(erasable.eraser).toBeDefined()
    expect(text.eraser).toBeUndefined()
    expect(end.data.path).toBeDefined()
  })

  it('fires a bare erasing:end and creates no path when there are too few points', async () => {
    const obj = makeErasable(true)
    const canvas = makeCanvas([obj])
    const brush = new EraserBrush(canvas)
    brush._points = [{ x: 0, y: 0 }] // only one point
    await brush._finalizeAndAddPath()
    const end = canvas._fired.find(f => f.name === 'erasing:end')
    expect(end).toBeDefined()
    expect(end.data).toBeUndefined() // bare fire, no context/path
    expect(obj.eraser).toBeUndefined()
  })
})

describe('installEraserObjectSupport', () => {
  beforeAll(() => installEraserObjectSupport())

  it('defaults erasable=true and eraser=undefined on the prototype', () => {
    expect(FabricObject.prototype.erasable).toBe(true)
    expect(FabricObject.prototype.eraser).toBeUndefined()
  })

  it('needsItsOwnCache becomes true when an eraser is present', () => {
    const o = Object.create(FabricObject.prototype)
    expect(o.needsItsOwnCache()).toBe(false)
    o.eraser = {}
    expect(o.needsItsOwnCache()).toBe(true)
  })

  it('toObject includes the serialized eraser when present', () => {
    const o = Object.create(FabricObject.prototype)
    o.eraser = { toObject: () => ({ type: 'eraser', objects: [] }) }
    expect(o.toObject().eraser).toEqual({ type: 'eraser', objects: [] })
  })

  it('toObject omits eraser when absent', () => {
    const o = Object.create(FabricObject.prototype)
    expect(o.toObject().eraser).toBeUndefined()
  })

  it('_drawClipPath syncs eraser dimensions and delegates to base _drawClipPath', () => {
    const o = Object.create(FabricObject.prototype)
    o._getNonTransformedDimensions = () => ({ x: 30, y: 40 })
    o.eraser = { type: 'eraser', set: props => { o._eraserSet = props } }
    o._drawClipPath({ tag: 'ctx' }, { tag: 'normalClip' })
    // eraser dimensions were synced to the object size
    expect(o._eraserSet).toEqual({ width: 30, height: 40 })
    // base _drawClipPath was called twice: last call was for the eraser itself
    expect(o._lastClip).toBe(o.eraser)
  })

  it('is idempotent (double install does not double-wrap)', () => {
    installEraserObjectSupport()
    const o = Object.create(FabricObject.prototype)
    o.eraser = { toObject: () => ({ ok: true }) }
    expect(o.toObject().eraser).toEqual({ ok: true })
    expect(FabricObject.prototype.cacheProperties.filter(p => p === 'eraser')).toHaveLength(1)
  })
})
