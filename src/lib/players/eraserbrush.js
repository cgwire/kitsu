import {
  FabricObject,
  FixedLayout,
  Group,
  LayoutManager,
  Path,
  PencilBrush,
  classRegistry,
  util
} from 'fabric'

// Signature of an "empty" SVG path produced by convertPointsToSVGPath when the
// gesture is degenerate (a single point). Matches fabric's own internal check.
const EMPTY_SVG_PATH = 'M 0 0 Q 0 0 0 0 L 0 0'

// An object's eraser: a group of paths in the object's LOCAL coordinates.
// FixedLayout + center origin: its dimensions don't change when paths are
// added; they're realigned onto the object by `_drawClipPath`.
export class Eraser extends Group {
  // In v6, Group no longer takes an `objectsRelativeToGroup` third argument.
  // The fixed-layout intent (no recompute on add) is achieved via
  // `layoutManager: new LayoutManager(new FixedLayout())`. Children passed to
  // fromObject() are already in group-local coords; FixedLayout preserves them.
  constructor(objects = [], options = {}) {
    super(objects, {
      originX: 'center',
      originY: 'center',
      ...options,
      // Always build a fresh FixedLayout: a serialized eraser carries a plain
      // layoutManager (no performLayout()), and spreading it over ours crashed
      // groupInit. Ours must win, so it comes AFTER ...options.
      layoutManager: new LayoutManager(new FixedLayout())
    })
    this.type = 'eraser'
  }

  // Draws a solid black rect (the "all visible" mask) then the destination-out
  // paths on top (the holes). Used as a clip-mask.
  drawObject(ctx) {
    ctx.save()
    ctx.fillStyle = 'black'
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
    ctx.restore()
    super.drawObject(ctx)
  }

  // Revival: the children are ALWAYS plain Paths (the eraser only ever adds
  // Paths), so we rebuild them directly. FixedLayout keeps them where they
  // are (group-local coords) without recomputing the centre.
  static fromObject(object) {
    const children = (object.objects || []).map(p => new Path(p.path, p))
    const options = { ...object }
    delete options.objects
    return Promise.resolve(new Eraser(children, options))
  }
}

// Fabric v6's toObject() serializes `this.constructor.type`; without a static
// type the mask would be saved as its parent's type ('group'). Assigned on the
// class (not as a class field — the project's eslint parser rejects those).
Eraser.type = 'eraser'

// Register Eraser in the classRegistry so deserialisation (revival) works.
classRegistry.setClass(Eraser, 'eraser')

// Rebuilds the serialized `eraser` mask and attaches it to the reloaded object.
// No-op if the object has no eraser. The mask is in the object's LOCAL
// coordinates: it must NEVER go through normalizeSerializedAnnotation, or it
// would drift.
export async function reviveObjectEraser(target, serialized) {
  if (target && serialized && serialized.eraser) {
    target.eraser = await Eraser.fromObject(serialized.eraser)
    // The object may already be on the canvas (the editable pipeline adds it
    // before reviving), so invalidate its cache or the clip won't show until
    // something else dirties it.
    target.set?.('dirty', true)
  }
  return target
}

let eraserSupportInstalled = false

// Patches FabricObject.prototype to support the `eraser` mask.
// Idempotent: a second call is a no-op.
export function installEraserObjectSupport() {
  if (eraserSupportInstalled) return
  eraserSupportInstalled = true

  const proto = FabricObject.prototype
  const baseDrawClipPath = proto._drawClipPath
  const baseNeedsCache = proto.needsItsOwnCache
  const baseToObject = proto.toObject

  // v6 removed cacheProperties / stateProperties arrays from the prototype;
  // guard the push so it doesn't throw on undefined.
  if (proto.cacheProperties && !proto.cacheProperties.includes('eraser')) {
    proto.cacheProperties.push('eraser')
  }
  if (proto.stateProperties && !proto.stateProperties.includes('eraser')) {
    proto.stateProperties.push('eraser')
  }

  Object.assign(proto, {
    erasable: true,
    eraser: undefined,

    needsItsOwnCache() {
      return baseNeedsCache.call(this) || !!this.eraser
    },

    // Draws the normal clipPath THEN the eraser as a second clip-mask: that's
    // what "punches" the object on screen. Called by drawObject(ctx, forClipping,
    // context). v6's _drawClipPath(ctx, clipPath, context) needs that third
    // `context` (the cache layer): createClipPathLayer(clipPath, context) reads
    // context.width — dropping it crashes rendering. Forward it to both calls.
    _drawClipPath(ctx, clipPath, context) {
      baseDrawClipPath.call(this, ctx, clipPath, context)
      // Only a revived Eraser (a real fabric object) is renderable as a clip.
      // A reloaded object can briefly carry the plain serialized mask before
      // reviveObjectEraser swaps in a real Eraser; skip it (no .set) — it
      // re-renders once revived — instead of crashing.
      if (this.eraser && typeof this.eraser.set === 'function') {
        const size = this._getNonTransformedDimensions()
        this.eraser.set({ width: size.x, height: size.y })
        baseDrawClipPath.call(this, ctx, this.eraser, context)
      }
    },

    toObject(propertiesToInclude) {
      const object = baseToObject.call(
        this,
        ['erasable'].concat(propertiesToInclude || [])
      )
      if (this.eraser && !this.eraser.excludeFromExport) {
        object.eraser = this.eraser.toObject(propertiesToInclude)
      }
      return object
    }
  })
}

export class EraserBrush extends PencilBrush {
  constructor(canvas) {
    super(canvas)
    // The annotation pipeline (PSBrush) reads freeDrawingBrush.pressureManager.
    // The EraserBrush has no pressure: a minimal PSBrush-shaped stub keeps it
    // drop-in.
    this.pressureManager = {
      fallback: 0.5,
      onMouseDown: () => 0.5,
      onMouseMove: () => 0.5,
      onMouseUp: () => {}
    }
  }

  // The eraser path clears (destination-out) the pixels composited BEFORE it.
  // It ends up in each intersected object's `eraser` mask (see
  // _addPathToObjectEraser), so it is never added to the canvas as-is.
  createPath(pathData) {
    const path = super.createPath(pathData)
    path.set({
      fill: null,
      stroke: '#000',
      globalCompositeOperation: 'destination-out'
    })
    return path
  }

  // Full re-render on every move for the live destination-out preview.
  needsFullRender() {
    return true
  }

  // Adds the eraser path to the object's `eraser` mask, in local coordinates.
  // The path (in canvas coords) is transformed into the object's local frame
  // via invertTransform(obj) × path, so the erosion follows the object.
  // (The legacy mixin's `erasable: 'deep'` groups aren't ported: a group is
  // erased as a single unit, its mask lives on the group.)
  async _addPathToObjectEraser(obj, path, context) {
    let eraser = obj.eraser
    if (!eraser) {
      eraser = new Eraser()
      obj.eraser = eraser
    }
    const clone = await path.clone()
    const desiredTransform = util.multiplyTransformMatrices(
      util.invertTransform(obj.calcTransformMatrix()),
      clone.calcTransformMatrix()
    )
    util.applyTransformToObject(clone, desiredTransform)
    eraser.add(clone)
    obj.set('dirty', true)
    obj.fire('erasing:end', { path: clone })
    if (context) {
      const bucket = obj.group ? context.subTargets : context.targets
      bucket.push(obj)
    }
    return clone
  }

  // On mouseup: build the eraser path, apply it to each intersected ERASABLE
  // object's `eraser` mask, then emit `erasing:end` with the targets. No
  // drawables (bg/overlay): the Kitsu video is not a fabric object.
  async _finalizeAndAddPath() {
    const ctx = this.canvas.contextTop
    ctx.closePath()
    if (this.decimate) {
      this._points = this.decimatePoints(this._points, this.decimate)
    }
    this.canvas.clearContext(this.canvas.contextTop)
    const pathData =
      this._points && this._points.length > 1
        ? this.convertPointsToSVGPath(this._points)
        : null
    // The snapshot's PencilBrush has no `_isEmptySVGPath` method (that was a
    // v5-era prototype method); it now uses a private `isEmptySVGPath` helper
    // = `joinPath(pathData) === 'M 0 0 Q 0 0 0 0 L 0 0'`. We mirror it via the
    // exported `fabric.util.joinPath`.
    if (!pathData || util.joinPath(pathData) === EMPTY_SVG_PATH) {
      this.canvas.fire('erasing:end')
      this.canvas.requestRenderAll()
      return
    }
    const path = this.createPath(pathData)
    path.setCoords && path.setCoords()
    this.canvas.fire('before:path:created', { path })
    const context = { targets: [], subTargets: [] }
    const tasks = this.canvas._objects.map(
      obj =>
        obj.erasable &&
        obj.intersectsWithObject(path, true, true) &&
        this._addPathToObjectEraser(obj, path, context)
    )
    await Promise.all(tasks)
    this.canvas.fire('erasing:end', { ...context, path })
    this.canvas.requestRenderAll()
    if (this._resetShadow) this._resetShadow()
  }

  // Safety net: fabric reads onMouseUp's return as _isCurrentlyDrawing. If the
  // finalize path throws, we still return false so we don't stay "erasing".
  onMouseUp(ev) {
    try {
      return super.onMouseUp(ev)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[EraserBrush] onMouseUp threw:', err)
      return false
    }
  }
}
