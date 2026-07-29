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
const MIN_VISIBLE_ALPHA = 16

export function hasVisiblePixels(obj) {
  if (!obj.toCanvasElement) return true
  try {
    const canvas = obj.toCanvasElement({
      enableRetinaScaling: false,
      withoutShadow: true
    })
    const context = canvas.getContext('2d')
    if (!context) return true
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] > MIN_VISIBLE_ALPHA) return true
    }
    return false
  } catch {
    return true
  }
}

// Mask paths live in the erased object's local frame and must never be
// repositioned by group layout.
class NoLayout extends FixedLayout {
  shouldPerformLayout() {
    return false
  }
}

// An object's eraser: a group of paths in the object's LOCAL coordinates.
// NoLayout + center origin keeps paths fixed; the mask is realigned onto the
// object by `_drawClipPath`.
export class Eraser extends Group {
  // In v6, Group no longer takes an `objectsRelativeToGroup` third argument.
  // FixedLayout still recenters children during initialization, so disable
  // layout entirely to preserve paths already stored in the object's frame.
  constructor(objects = [], options = {}) {
    // Drop a serialized `type`: passing it through super()/setOptions hits v6's
    // deprecated no-op type setter, which warns on every revival. The static
    // Eraser.type governs.
    const opts = { ...options }
    delete opts.type
    super(objects, {
      originX: 'center',
      originY: 'center',
      ...opts,
      // Always build a fresh layout manager: a serialized eraser carries a plain
      // layoutManager (no performLayout()), and spreading it over ours crashed
      // groupInit. Ours must win, so it comes AFTER ...options.
      layoutManager: new LayoutManager(new NoLayout())
    })
    // No instance `this.type =` : v6's type setter is a no-op that logs a
    // deprecation warning; the static `Eraser.type` governs serialization.
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
  // Paths), so we rebuild them directly. NoLayout keeps their stored coords.
  static fromObject(object) {
    // Nothing sanitizes a stored mask before it gets here, and a malformed one
    // used to throw and leave the object carrying its unrevived mask for good.
    const serialized = Array.isArray(object.objects)
      ? object.objects.filter(Boolean)
      : []
    const children = serialized.map(p => {
      // Drop the serialized `type` ('path'): passing it to the Path ctor hits
      // v6's no-op type setter and logs a deprecation warning per child.
      const opts = { ...p }
      delete opts.type
      delete opts.path
      return new Path(p.path, opts)
    })
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

// Serializes an object's eraser mask.
//
// A cloned or freshly deserialized object can carry the PLAIN serialized mask
// instead of a revived Eraser: the `fromObject` overrides that bypass fabric's
// generic revival (psbrush's PSStroke, our Arrow) spread the whole serialized
// object onto the new instance, mask included. That form is already the
// persisted shape, so emit it rather than crashing on the missing toObject().
//
// The copy is not optional: normalizeSerializedType() rewrites the emitted
// subtree in place and the same payload is pushed into the additions/updates
// stacks, so handing out the live object's own mask would let a save mutate it.
export const serializeEraserMask = (eraser, propertiesToInclude) =>
  typeof eraser.toObject === 'function'
    ? eraser.toObject(propertiesToInclude)
    : structuredClone(eraser)

let eraserSupportInstalled = false

// Patches FabricObject.prototype to support the `eraser` mask.
// Idempotent: a second call is a no-op.
export function installEraserObjectSupport() {
  if (eraserSupportInstalled) return
  eraserSupportInstalled = true

  const proto = FabricObject.prototype
  const baseDrawClipPath = proto._drawClipPath
  const baseGetCacheCanvasDimensions = proto._getCacheCanvasDimensions
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

    // Destination-out masks leave visible fragments when Fabric rasterizes the
    // object cache below 1x. Keep erased-object caches at authored resolution;
    // Fabric scales the finished cache down when drawing it on the canvas.
    _getCacheCanvasDimensions() {
      const dimensions = baseGetCacheCanvasDimensions.call(this)
      if (!this.eraser) return dimensions
      if (dimensions.zoomX < 1) {
        const padding = dimensions.width - Math.ceil(dimensions.x)
        dimensions.x /= dimensions.zoomX
        dimensions.width = Math.ceil(dimensions.x) + padding
        dimensions.zoomX = 1
      }
      if (dimensions.zoomY < 1) {
        const padding = dimensions.height - Math.ceil(dimensions.y)
        dimensions.y /= dimensions.zoomY
        dimensions.height = Math.ceil(dimensions.y) + padding
        dimensions.zoomY = 1
      }
      return dimensions
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
        object.eraser = serializeEraserMask(this.eraser, propertiesToInclude)
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
    // The object may still carry the plain serialized mask rather than a
    // revived Eraser (see serializeEraserMask); add() would throw on it, and
    // the throw escapes onMouseUp's net because fabric does not await
    // _finalizeAndAddPath, cancelling erasing:end for every other target.
    if (eraser && typeof eraser.add !== 'function') {
      eraser = await Eraser.fromObject(eraser)
    }
    if (!eraser) eraser = new Eraser()
    obj.eraser = eraser
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
