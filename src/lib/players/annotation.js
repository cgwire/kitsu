/*
 * Pure, stateless annotation helpers shared across every annotation
 * surface: the editable studio canvas (useAnnotation), the shared playlist
 * player and the read-only overlays.
 *
 * Covers canvas creation, brush/pencil configuration, freehand and shape
 * drawing, (de)serialization of saved annotations, the read-only shape
 * builder and the additions/deletions diff helpers. Holds no reactive
 * state — consumers own that.
 *
 * On import it registers the custom Arrow shape and patches
 * fabric.Object.prototype with eraser-mask support (both idempotent).
 */

import { fabric } from 'fabric'
import { PSBrush, PSStroke } from 'fabricjs-psbrush'
import { v4 as uuidv4 } from 'uuid'

import { normalizeSerializedType } from './annotationTypes'
import { Arrow, registerArrowFabricShape } from './arrowshape'
import { installEraserObjectSupport, reviveObjectEraser } from './eraserbrush'

// Make sure fabric.Arrow is reachable from the global fabric namespace
// (the deserialiser branches on `obj.type === 'arrow'`).
registerArrowFabricShape()
// Patch fabric.Object.prototype with eraser-mask support (idempotent).
installEraserObjectSupport()

/* -------------------------------------------------------------------------
 * PSBrush prototype patches (idempotent — safe to import from many places)
 * -----------------------------------------------------------------------*/

if (PSStroke) {
  if (!PSStroke.prototype.getAncestors) {
    PSStroke.prototype.getAncestors = function () {
      return []
    }
  }
  if (!PSStroke.prototype.contextTop) {
    PSStroke.prototype.contextTop = function () {
      return null
    }
  }
  if (!PSStroke.prototype.dispose) {
    PSStroke.prototype.dispose = function () {}
  }
  if (!PSStroke.prototype.getRelativeCenterPoint) {
    PSStroke.prototype.getRelativeCenterPoint = function () {
      return new fabric.Point(0, 0)
    }
  }
}

/**
 * Lock a PSBrush instance to the pointer type that opens each stroke.
 *
 * PSBrush honours `disableTouch` but doesn't separate mouse vs pen, so
 * a tablet user drawing with the stylus while the mouse cursor still
 * hovers the canvas gets hover pointermoves interleaved between the
 * pen events and the path zigzags between the two positions.
 *
 * Must be applied per-instance: PSBrush is built with fabric's
 * createClass, which copies methods onto each instance via
 * Object.assign — they shadow the prototype, so patching
 * PSBrush.prototype.onMouseMove has no effect on real strokes.
 *
 * Idempotent — calling it twice on the same brush is a no-op.
 */
export const lockBrushToFirstPointer = brush => {
  if (!brush || brush._pointerTypeLocked) return brush
  brush._pointerTypeLocked = true
  const origDown = brush.onMouseDown.bind(brush)
  const origMove = brush.onMouseMove.bind(brush)
  const origUp = brush.onMouseUp.bind(brush)
  const eventPointerType = ev => (ev?.e || ev?.pointer?.e)?.pointerType
  brush.onMouseDown = function (pointer, ev) {
    this._activePointerType =
      eventPointerType(ev) || pointer?.e?.pointerType || null
    return origDown(pointer, ev)
  }
  brush.onMouseMove = function (pointer, ev) {
    const type = eventPointerType(ev) || pointer?.e?.pointerType
    if (this._activePointerType && type && type !== this._activePointerType) {
      return
    }
    return origMove(pointer, ev)
  }
  brush.onMouseUp = function (ev) {
    const type = eventPointerType(ev)
    if (this._activePointerType && type && type !== this._activePointerType) {
      return
    }
    const result = origUp(ev)
    this._activePointerType = null
    return result
  }
  return brush
}

/* -------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------*/

export const PENCIL_WIDTHS = {
  big: 10,
  medium: 5,
  small: 2
}

export const DEFAULT_PENCIL_WIDTH = 'big'
export const DEFAULT_PENCIL_COLOR = '#ff3860'

// Shapes don't get pressure modulation so the same px value as the pen
// (10) looks heavy. 4 lines up nicely with what the studio uses for
// other UI strokes.
export const SHAPE_STROKE_WIDTH = 4

// Halved pencil widths — shapes don't get pressure modulation and would
// look heavy at the pencil's 15/10/5/2/1 values.
export const SHAPE_WIDTHS = {
  huge: 8,
  big: 5,
  medium: 3,
  small: 2,
  tiny: 1
}

/* -------------------------------------------------------------------------
 * Object helpers
 * -----------------------------------------------------------------------*/

/**
 * Adds a `serialize()` method to the fabric object that includes the extra
 * fields we persist (id, canvasWidth/Height, angle, scale, createdBy).
 */
export const addSerialization = object => {
  object.serialize = function () {
    const result = object.toJSON()
    result.id = this.id
    result.canvasWidth = this.canvasWidth
    result.canvasHeight = this.canvasHeight
    result.angle = this.angle
    result.scale = this.scale
    result.createdBy = this.createdBy
    // Persist the eraser mask centrally: PSStroke's custom toObject() goes
    // through the psbrush callSuper shim and doesn't reliably reach the patched
    // fabric.Object.prototype.toObject, so relying on that alone loses the mask
    // for freehand strokes. The mask is in the object's LOCAL coordinates;
    // normalizeSerializedAnnotation only rescales left/top/scale, never eraser.
    if (this.eraser && !this.eraser.excludeFromExport) {
      result.eraser = this.eraser.toObject()
    } else {
      delete result.eraser
    }
    // Force every (nested) type to the stored lowercase form so v6's
    // PascalCase toObject() output stays byte-compatible with existing
    // data and the deserializers' lowercase branches keep matching.
    normalizeSerializedType(result)
    return normalizeSerializedAnnotation(this, result)
  }
  return object
}

/**
 * Stamps id / canvas dimensions / createdBy on a freshly created fabric
 * object so subsequent saves include the metadata that the backend uses to
 * apply diffs.
 */
export const setObjectData = (object, canvas, userId) => {
  if (object.set) {
    if (!object.id) object.set('id', uuidv4())
    object.set('canvasWidth', canvas.width)
    object.set('canvasHeight', canvas.height)
  } else {
    if (!object.id) object.id = uuidv4()
    object.canvasWidth = canvas.width
    object.canvasHeight = canvas.height
  }
  if (userId && !object.createdBy) {
    if (object.set) object.set('createdBy', userId)
    else object.createdBy = userId
  }
  addSerialization(object)
  return object
}

/* -------------------------------------------------------------------------
 * Brush configuration
 * -----------------------------------------------------------------------*/

/**
 * Build the same PSBrush-backed `fabric.Canvas` the studio player uses.
 * The pressure-manager fallback is required — without it, mouse strokes ship
 * a low pressure and render way thinner than on the studio side.
 */
export const createAnnotationCanvas = (canvasEl, options = {}) => {
  const canvas = new fabric.Canvas(canvasEl, {
    enableRetinaScaling: true,
    fireRightClick: true,
    selection: false,
    ...options
  })
  const brush = new PSBrush(canvas)
  brush.color = DEFAULT_PENCIL_COLOR
  brush.width = PENCIL_WIDTHS[DEFAULT_PENCIL_WIDTH]
  if (brush.pressureManager) {
    brush.pressureManager.fallback = 0.5
  }
  // PSBrush overrides BaseBrush.initialize without super, losing the round
  // cap/join defaults — restore them so strokes don't render with flat ends.
  brush.strokeLineCap = 'round'
  brush.strokeLineJoin = 'round'
  lockBrushToFirstPointer(brush)
  canvas.freeDrawingBrush = brush
  canvas.isDrawingMode = false
  canvas.skipTargetFind = true
  return canvas
}

/**
 * Accepts either a width name (`'big' | 'medium' | 'small'`) or a numeric
 * pixel value.
 */
export const applyPencilWidth = (canvas, width) => {
  if (!canvas?.freeDrawingBrush) return
  const px = typeof width === 'number' ? width : PENCIL_WIDTHS[width]
  if (typeof px === 'number') {
    canvas.freeDrawingBrush.width = px
  }
}

export const applyPencilColor = (canvas, color) => {
  if (!canvas?.freeDrawingBrush) return
  canvas.freeDrawingBrush.color = color
}

/* -------------------------------------------------------------------------
 * Shape drawing (drag-to-create rectangle / circle / arrow / whiteboard)
 *
 * Adapted from cgwire/kitsu#1830. Uses fabric mouse events instead of raw
 * DOM listeners so the canvas's pointer offset / panzoom transforms are
 * resolved correctly. The caller passes:
 *   - getTool(): 'rectangle' | 'circle' | 'arrow' | 'whiteboard' | null
 *   - getColor(): current stroke color
 *   - getWidth(): current stroke width (px)
 *   - onShapeAdded(shape): callback fired when the user releases mouse,
 *     with the finalised fabric object so the consumer can register it
 *     in its additions list.
 *
 * Returns a detach function.
 * -----------------------------------------------------------------------*/

const PREVIEW_FILL = 'rgba(128, 128, 128, 0.25)'
const WHITEBOARD_FILL = 'rgba(255, 255, 255, 0.7)'

// Fill kept on the shape after mouse-up. Outline shapes go transparent
// (only stroke remains) — the whiteboard is the exception, its fill
// is the whole point.
const FINAL_FILLS = {
  rectangle: 'transparent',
  circle: 'transparent',
  arrow: 'transparent',
  whiteboard: WHITEBOARD_FILL
}

// A shape with an opaque fill (the whiteboard sticker, or any filled shape) is
// a backdrop reviewers draw on top of, so the eraser must not pierce it.
// Outline shapes end up `fill: transparent` and stay erasable, as do strokes.
export const hasOpaqueFill = fill => {
  if (!fill || fill === 'transparent') return false
  // Only an explicit rgba()/hsla() alpha of 0 counts as transparent. rgb()
  // (no alpha) and named/hex colours are always opaque.
  const alpha = /^(?:rgba|hsla)\([^)]*,\s*([\d.]+)\s*\)$/i.exec(
    String(fill).trim()
  )
  if (alpha && parseFloat(alpha[1]) === 0) return false
  return true
}

const buildShape = (tool, startX, startY, color, width) => {
  const base = {
    left: startX,
    top: startY,
    stroke: color,
    fill: PREVIEW_FILL,
    strokeWidth: width
  }
  if (tool === 'rectangle') {
    return new fabric.Rect({ ...base, width: 1, height: 1 })
  }
  if (tool === 'circle') {
    return new fabric.Circle({ ...base, radius: 1 })
  }
  if (tool === 'arrow') {
    return new Arrow([startX, startY, startX, startY], {
      stroke: color,
      strokeWidth: width,
      fill: 'transparent',
      arrowHeadSize: 15,
      arrowHeadWidth: 12
    })
  }
  if (tool === 'whiteboard') {
    // No stroke / strokeWidth: the whiteboard is a fill-only sticker
    // reviewers slap on the image so they can write on top of it.
    return new fabric.Rect({
      left: startX,
      top: startY,
      width: 1,
      height: 1,
      fill: WHITEBOARD_FILL,
      stroke: undefined,
      strokeWidth: 0
    })
  }
  return null
}

const updateShape = (shape, tool, startX, startY, currentX, currentY) => {
  const dx = currentX - startX
  const dy = currentY - startY
  if (tool === 'rectangle' || tool === 'whiteboard') {
    const width = Math.abs(dx)
    const height = Math.abs(dy)
    shape.set({
      left: dx < 0 ? startX - width : startX,
      top: dy < 0 ? startY - height : startY,
      width,
      height
    })
    return
  }
  if (tool === 'circle') {
    const delta = Math.abs(dx) > Math.abs(dy) ? dy : dx
    const radius = Math.abs(delta)
    shape.set({
      left: dx < 0 ? startX - radius : startX,
      top: dy < 0 ? startY - radius : startY,
      radius: radius * 0.5
    })
    return
  }
  if (tool === 'arrow') {
    shape.set({ x1: startX, y1: startY, x2: currentX, y2: currentY })
  }
}

export const attachShapeDrawing = (
  canvas,
  { getTool, getColor, getWidth, onShapeAdded, onShapeStart }
) => {
  let drawing = null
  let startX = 0
  let startY = 0

  let drawingTool = null

  const onMouseDown = e => {
    const tool = getTool?.()
    if (!tool || tool === 'pen') return
    const pointer = canvas.getPointer(e.e)
    startX = pointer.x
    startY = pointer.y
    drawing = buildShape(tool, startX, startY, getColor(), getWidth())
    if (!drawing) return
    drawingTool = tool
    drawing.set({ selectable: false, evented: false })
    onShapeStart?.()
    canvas.add(drawing)
    canvas.requestRenderAll()
  }

  const onMouseMove = e => {
    if (!drawing) return
    const tool = getTool?.()
    if (!tool || tool === 'pen') return
    const pointer = canvas.getPointer(e.e)
    updateShape(drawing, tool, startX, startY, pointer.x, pointer.y)
    drawing.setCoords()
    canvas.requestRenderAll()
  }

  const onMouseUp = () => {
    if (!drawing) return
    const finalFill = FINAL_FILLS[drawingTool] ?? 'transparent'
    drawing.set({ fill: finalFill, erasable: !hasOpaqueFill(finalFill) })
    drawing.setCoords()
    canvas.requestRenderAll()
    onShapeAdded?.(drawing)
    drawing = null
    drawingTool = null
  }

  canvas.on('mouse:down', onMouseDown)
  canvas.on('mouse:move', onMouseMove)
  canvas.on('mouse:up', onMouseUp)

  return () => {
    canvas.off('mouse:down', onMouseDown)
    canvas.off('mouse:move', onMouseMove)
    canvas.off('mouse:up', onMouseUp)
  }
}

/* -------------------------------------------------------------------------
 * Mouse pressure simulation
 *
 * Makes mouse-drawn strokes vary in width with cursor speed (the
 * `'distance'` mode the studio uses by default). PSBrush still honours
 * actual stylus pressure from PointerEvents — the fallback we tweak here
 * only kicks in when no real pressure is reported, so real pen pressure
 * keeps working on tablets.
 *
 * Returns a detach function.
 */
export const attachMousePressureSimulation = (canvas, options = {}) => {
  const cfg = {
    pressureMode: 'distance', // 'fade' | 'distance' | null
    minPressure: 0.4,
    maxPressure: 0.8,
    fadeTime: 100,
    distanceFalloff: 2,
    maxChangeRate: 0.03,
    ...options
  }
  let mouseIsDrawing = false
  let startTime = null
  let prevPoint = null
  let prevPressure = null
  let dynamicDistanceMult = null

  const onMouseDown = () => {
    if (!canvas?.isDrawingMode || !canvas.freeDrawingBrush) return
    mouseIsDrawing = true
    startTime = Date.now()
    prevPoint = canvas.getPointer()
    prevPressure = canvas.freeDrawingBrush.pressureManager
      ? canvas.freeDrawingBrush.pressureManager.fallback
      : cfg.maxPressure
    dynamicDistanceMult = null
  }

  const onMouseMove = () => {
    if (
      !mouseIsDrawing ||
      !canvas.freeDrawingBrush?.pressureManager ||
      !cfg.pressureMode
    ) {
      return
    }
    let pressure
    if (cfg.pressureMode === 'fade') {
      const dt = Date.now() - startTime
      const t = dt / cfg.fadeTime
      pressure = Math.max(
        (1 - t) * cfg.maxPressure + t * cfg.minPressure,
        cfg.minPressure
      )
    } else if (cfg.pressureMode === 'distance' && prevPoint) {
      const dim = new fabric.Point(canvas.getWidth(), canvas.getHeight())
      const p1 = prevPoint.divide(dim)
      const p2 = canvas.getPointer().divide(dim)
      let delta = Math.sqrt(
        Math.pow(Math.abs(p1.x - p2.x), 1) + Math.pow(Math.abs(p1.y - p2.y), 1)
      )
      delta *= 50
      if (dynamicDistanceMult === null) {
        dynamicDistanceMult = delta < 1.8 ? Math.min(delta * delta, 1.5) : 1
      }
      delta *= dynamicDistanceMult
      pressure = Math.min(cfg.distanceFalloff / delta, cfg.maxPressure)
    } else {
      pressure = 0.5
    }
    const clamped = Math.max(
      prevPressure - cfg.maxChangeRate,
      Math.min(pressure, prevPressure + cfg.maxChangeRate)
    )
    prevPoint = canvas.getPointer()
    prevPressure = clamped
    canvas.freeDrawingBrush.pressureManager.fallback = clamped
  }

  const onMouseUp = () => {
    if (!mouseIsDrawing) return
    mouseIsDrawing = false
    startTime = null
    prevPoint = null
    dynamicDistanceMult = null
    if (canvas.freeDrawingBrush?.pressureManager) {
      canvas.freeDrawingBrush.pressureManager.fallback = cfg.maxPressure
    }
  }

  canvas.on('mouse:down', onMouseDown)
  canvas.on('mouse:move', onMouseMove)
  canvas.on('mouse:up', onMouseUp)

  return () => {
    canvas.off('mouse:down', onMouseDown)
    canvas.off('mouse:move', onMouseMove)
    canvas.off('mouse:up', onMouseUp)
  }
}

/* -------------------------------------------------------------------------
 * Annotation lookup / time matching
 * -----------------------------------------------------------------------*/

/**
 * Match an annotation against the current playback time using the same
 * tolerance the manager-facing `loadAnnotation` flow uses (one frame).
 */
export const findAnnotationAtTime = (
  annotations,
  time,
  frameDuration,
  isPicture
) => {
  if (!annotations?.length) return null
  if (isPicture) {
    return annotations.find(a => a.time === 0) || null
  }
  const halfFrame = frameDuration / 2
  return (
    annotations.find(a => Math.abs((a.time || 0) - time) < halfFrame) || null
  )
}

/* -------------------------------------------------------------------------
 * Diff bookkeeping (additions list)
 * -----------------------------------------------------------------------*/

/**
 * Pushes a new object into the additions list at the right time slot.
 * Returns the same additions array (mutated).
 */
export const pushAddition = (
  additions,
  { time, frame, canvasWidth, canvasHeight, object }
) => {
  const serialized = object.serialize ? object.serialize() : object.toJSON()
  const existing = additions.find(a => a.time === time)
  if (existing) {
    existing.drawing.objects.push(serialized)
    return additions
  }
  additions.push({
    time,
    frame,
    width: canvasWidth,
    height: canvasHeight,
    drawing: { objects: [serialized] }
  })
  return additions
}

/**
 * Drops empty annotation entries once their last object is removed.
 */
export const removeAddition = (additions, objectId) =>
  additions
    .map(a => ({
      ...a,
      drawing: {
        ...a.drawing,
        objects: a.drawing.objects.filter(o => o.id !== objectId)
      }
    }))
    .filter(a => a.drawing.objects.length > 0)

/* -------------------------------------------------------------------------
 * PSStroke deserialisation
 * -----------------------------------------------------------------------*/

export const deserializePSStroke = obj =>
  new Promise(resolve => {
    PSStroke.fromObject(obj, stroke => resolve(stroke || null))
  })

/* -------------------------------------------------------------------------
 * Read-only object rendering
 *
 * Produces a non-interactive shape ready to be `canvas.add()`-ed. Returns a
 * Promise because PSStroke deserialisation is async.
 * -----------------------------------------------------------------------*/

// Maps coordinates authored on a canvas of `refWidth × refHeight` onto the
// current `canvas` the way object-fit:contain lays media out: one uniform scale
// plus centering. The media element is always sized to its natural aspect
// ratio, so the authoring canvas shares that aspect — a single factor (rather
// than separate X/Y) keeps annotations aligned and undistorted even when the
// current box aspect differs (comparison halves the width, fullscreen enlarges
// it). Falls back to a width-only scale when the reference height is unknown.
export const getAnnotationContainMapping = (canvas, refWidth, refHeight) => {
  if (refWidth && refHeight) {
    const scale = Math.min(canvas.width / refWidth, canvas.height / refHeight)
    return {
      scale,
      offsetX: (canvas.width - refWidth * scale) / 2,
      offsetY: (canvas.height - refHeight * scale) / 2
    }
  }
  if (refWidth) {
    return { scale: canvas.width / refWidth, offsetX: 0, offsetY: 0 }
  }
  return { scale: 1, offsetX: 0, offsetY: 0 }
}

// serialize() reads the fabric object's live left/top/scale, which the load
// transform scaled to the *current* canvas. Persisting those against the
// stored canvasWidth/Height — a different frame — made every resize+save cycle
// re-multiply the coordinates (annotations drifting badly after drawing in
// fullscreen). Invert the load transform on the object's own canvas so the
// stored form is always expressed in its canvasWidth reference frame and
// round-trips stably. No-op for objects drawn at the current size (scale 1) and
// for objects not attached to a canvas.
export const normalizeSerializedAnnotation = (object, result) => {
  const canvas = object.canvas
  if (!canvas || !object.canvasWidth) return result
  const { scale, offsetX, offsetY } = getAnnotationContainMapping(
    canvas,
    object.canvasWidth,
    object.canvasHeight
  )
  if (!scale) return result
  result.left = (result.left - offsetX) / scale
  result.top = (result.top - offsetY) / scale
  result.scaleX = result.scaleX / scale
  result.scaleY = result.scaleY / scale
  return result
}

const buildReadOnlyShapeInner = async (annotation, obj, canvas) => {
  if (!obj || !obj.type) return null

  const canvasWidth = obj.canvasWidth || annotation?.width
  const canvasHeight = obj.canvasHeight || annotation?.height
  const { scale, offsetX, offsetY } = getAnnotationContainMapping(
    canvas,
    canvasWidth,
    canvasHeight
  )

  const base = {
    angle: obj.angle || 0,
    erasable: !hasOpaqueFill(obj.fill),
    evented: false,
    fill: obj.fill || 'transparent',
    height: obj.height,
    hoverCursor: 'default',
    left: (obj.left || 0) * scale + offsetX,
    radius: obj.radius,
    scaleX: (obj.scaleX || 1) * scale,
    scaleY: (obj.scaleY || 1) * scale,
    selectable: false,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth || 1,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    top: (obj.top || 0) * scale + offsetY,
    width: obj.width
  }

  if (obj.type === 'path') {
    const path = new fabric.Path(obj.path, base)
    path.set('id', obj.id)
    path.set('canvasWidth', canvasWidth)
    path.set('canvasHeight', canvasHeight)
    addSerialization(path)
    return path
  }

  if (obj.type === 'PSStroke') {
    const stroke = await deserializePSStroke(obj)
    if (!stroke) return null
    stroke.set({
      id: obj.id,
      angle: base.angle,
      evented: false,
      fill: base.fill,
      hoverCursor: 'default',
      left: base.left,
      scaleX: base.scaleX,
      scaleY: base.scaleY,
      selectable: false,
      stroke: base.stroke,
      strokeWidth: obj.strokeWidth || 1,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      top: base.top,
      canvasWidth,
      canvasHeight
    })
    addSerialization(stroke)
    return stroke
  }

  if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
    const text = new fabric.Text(obj.text || '', {
      ...base,
      backgroundColor: obj.backgroundColor || 'rgba(255, 255, 255, 0.8)',
      erasable: false,
      fontFamily: obj.fontFamily || 'Arial',
      fontSize: obj.fontSize || 16,
      fontWeight: obj.fontWeight,
      padding: obj.padding,
      textAlign: obj.textAlign
    })
    text.set('id', obj.id)
    addSerialization(text)
    return text
  }

  if (obj.type === 'circle') return new fabric.Circle(base)
  if (obj.type === 'rect') return new fabric.Rect(base)
  if (obj.type === 'ellipse') {
    return new fabric.Ellipse({ ...base, rx: obj.rx, ry: obj.ry })
  }
  if (obj.type === 'line') {
    return new fabric.Line(
      [obj.x1 || 0, obj.y1 || 0, obj.x2 || 0, obj.y2 || 0],
      base
    )
  }

  if (obj.type === 'arrow') {
    const arrow = new Arrow(
      [obj.x1 || 0, obj.y1 || 0, obj.x2 || 0, obj.y2 || 0],
      {
        ...base,
        arrowHeadSize: obj.arrowHeadSize || 15,
        arrowHeadWidth: obj.arrowHeadWidth || 12
      }
    )
    addSerialization(arrow)
    return arrow
  }

  if (obj.type === 'group' && Array.isArray(obj.objects)) {
    const children = (
      await Promise.all(
        obj.objects.map(child => buildReadOnlyShape(annotation, child, canvas))
      )
    ).filter(Boolean)
    return new fabric.Group(children, base)
  }

  return null
}

// Public builder: build the read-only shape, then revive its serialized eraser
// mask (kept in the shape's LOCAL coordinates — never normalized). Recurses via
// the inner builder so group children get their masks revived too.
export const buildReadOnlyShape = async (annotation, obj, canvas) => {
  const shape = await buildReadOnlyShapeInner(annotation, obj, canvas)
  return reviveObjectEraser(shape, obj)
}
