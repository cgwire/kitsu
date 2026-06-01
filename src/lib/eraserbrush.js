import { fabric } from 'fabric'

// Signature of an "empty" SVG path produced by convertPointsToSVGPath when the
// gesture is degenerate (a single point). Matches fabric's own internal check.
const EMPTY_SVG_PATH = 'M 0 0 Q 0 0 0 0 L 0 0'

// An object's eraser: a group of paths in the object's LOCAL coordinates.
// layout 'fixed' + center origin: its dimensions don't change when paths are
// added; they're realigned onto the object by `_drawClipPath`.
export class Eraser extends fabric.Group {
  // `objectsRelativeToGroup` must reach the Group constructor: when true the
  // layout strategy keeps the child paths where they are instead of shifting
  // them to a freshly-computed centre. fromObject() passes true on revival —
  // without it the mask drifts by the centre delta, which scales with the
  // object and shows up after a resize (fullscreen). origin/layout go through
  // the options so they're already set when super() runs its initial layout.
  constructor(objects = [], options = {}, objectsRelativeToGroup) {
    super(
      objects,
      { originX: 'center', originY: 'center', layout: 'fixed', ...options },
      objectsRelativeToGroup
    )
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
  // Paths), so we rebuild them directly without enlivenObjects (whose
  // callback/Promise signature is uncertain on the snapshot).
  static fromObject(object) {
    const children = (object.objects || []).map(p => new fabric.Path(p.path, p))
    const options = { ...object }
    delete options.objects
    // true → the children are already in the group's coordinate plane; don't
    // let the layout re-centre (and thus offset) them.
    return Promise.resolve(new Eraser(children, options, true))
  }
}

// Register the class on the fabric namespace (like `fabric.Arrow` in
// arrowshape.js), for consistency and type-based revival if needed.
fabric.Eraser = Eraser

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

// Patches fabric.Object.prototype to support the `eraser` mask.
// Idempotent: a second call is a no-op.
export function installEraserObjectSupport() {
  if (eraserSupportInstalled) return
  eraserSupportInstalled = true

  const proto = fabric.Object.prototype
  const baseDrawClipPath = proto._drawClipPath
  const baseNeedsCache = proto.needsItsOwnCache
  const baseToObject = proto.toObject

  if (proto.cacheProperties && !proto.cacheProperties.includes('eraser')) {
    proto.cacheProperties.push('eraser')
  }
  if (proto.stateProperties && !proto.stateProperties.includes('eraser')) {
    proto.stateProperties.push('eraser')
  }

  fabric.util.object.extend(proto, {
    erasable: true,
    eraser: undefined,

    needsItsOwnCache() {
      return baseNeedsCache.call(this) || !!this.eraser
    },

    // Draws the normal clipPath THEN the eraser as a second clip-mask: that's
    // what "punches" the object on screen. Called by drawObject().
    _drawClipPath(ctx, clipPath) {
      baseDrawClipPath.call(this, ctx, clipPath)
      if (this.eraser) {
        const size = this._getNonTransformedDimensions()
        if (this.eraser.type === 'eraser') {
          this.eraser.set({ width: size.x, height: size.y })
        }
        baseDrawClipPath.call(this, ctx, this.eraser)
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

export class EraserBrush extends fabric.PencilBrush {
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
    const desiredTransform = fabric.util.multiplyTransformMatrices(
      fabric.util.invertTransform(obj.calcTransformMatrix()),
      clone.calcTransformMatrix()
    )
    fabric.util.applyTransformToObject(clone, desiredTransform)
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
    if (!pathData || fabric.util.joinPath(pathData) === EMPTY_SVG_PATH) {
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
