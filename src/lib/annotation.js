/*
 * Pure helpers extracted from `src/components/mixins/annotation.js` so they
 * can be reused outside of the Options-API mixin (composables, shared
 * playlist player, …). The mixin can be refactored to delegate here
 * without behavioural change so the studio-side and guest-side drawings
 * stay byte-for-byte compatible.
 */

import { fabric } from 'fabric'
import { PSBrush, PSStroke } from 'fabricjs-psbrush'
import { v4 as uuidv4 } from 'uuid'

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

/* -------------------------------------------------------------------------
 * Object helpers
 * -----------------------------------------------------------------------*/

/**
 * Mirrors `annotationMixin.addSerialization`. Adds a `serialize()` method
 * to the fabric object that includes the extra fields we persist (id,
 * canvasWidth/Height, angle, scale, createdBy).
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
    return result
  }
  return object
}

/**
 * Mirrors `annotationMixin.setObjectData`. Stamps id / canvas dimensions /
 * createdBy on a freshly created fabric object so subsequent saves include
 * the metadata that the backend uses to apply diffs.
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
 * The pressure-manager fallback mirrors `annotationMixin.onAnnotateClicked`
 * — without it, mouse strokes ship a low pressure and render way thinner
 * than on the studio side.
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
  canvas.freeDrawingBrush = brush
  canvas.isDrawingMode = false
  canvas.skipTargetFind = true
  return canvas
}

/**
 * Mirrors `annotationMixin._resetPencil`. Accepts either a width name
 * (`'big' | 'medium' | 'small'`) or a numeric pixel value.
 */
export const applyPencilWidth = (canvas, width) => {
  if (!canvas?.freeDrawingBrush) return
  const px = typeof width === 'number' ? width : PENCIL_WIDTHS[width]
  if (typeof px === 'number') {
    canvas.freeDrawingBrush.width = px
  }
}

/**
 * Mirrors `annotationMixin._resetColor`.
 */
export const applyPencilColor = (canvas, color) => {
  if (!canvas?.freeDrawingBrush) return
  canvas.freeDrawingBrush.color = color
}

/* -------------------------------------------------------------------------
 * Mouse pressure simulation
 *
 * Ports `annotationMixin.initalizeMouseDrawing / updateMousePressure /
 * endDrawing` so mouse-drawn strokes vary in width with cursor speed (the
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
 * Mirrors `annotationMixin.addToAdditions` for read-only consumers that
 * just need to push a new object into the additions list at the right
 * time slot.
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
 * Mirrors `annotationMixin.removeFromAdditions`. Drops empty annotation
 * entries once their last object is removed.
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
 * Lighter-weight version of `annotationMixin.addObjectToCanvas`: produces
 * a non-interactive shape ready to be `canvas.add()`-ed. Returns a Promise
 * because PSStroke deserialisation is async.
 * -----------------------------------------------------------------------*/

export const buildReadOnlyShape = async (annotation, obj, canvas) => {
  if (!obj || !obj.type) return null

  let scaleMultiplierX = 1
  let scaleMultiplierY = 1
  if (annotation?.width) {
    scaleMultiplierX = canvas.width / annotation.width
    scaleMultiplierY = canvas.width / annotation.width
  }
  if (annotation?.height) {
    scaleMultiplierY = canvas.height / annotation.height
  }
  const canvasWidth = obj.canvasWidth || annotation.width
  const canvasHeight = obj.canvasHeight
  if (canvasWidth) {
    scaleMultiplierX = canvas.width / canvasWidth
    scaleMultiplierY = canvas.width / canvasWidth
  }
  if (canvasHeight) {
    scaleMultiplierY = canvas.height / canvasHeight
  }

  const base = {
    angle: obj.angle || 0,
    evented: false,
    fill: obj.fill || 'transparent',
    height: obj.height,
    hoverCursor: 'default',
    left: (obj.left || 0) * scaleMultiplierX,
    radius: obj.radius,
    scaleX: (obj.scaleX || 1) * scaleMultiplierX,
    scaleY: (obj.scaleY || 1) * scaleMultiplierY,
    selectable: false,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth || 1,
    top: (obj.top || 0) * scaleMultiplierY,
    width: obj.width
  }

  if (obj.type === 'path') {
    let strokeMultiplier = 1
    if (obj.canvasWidth) strokeMultiplier = canvasWidth / canvas.width
    if (canvas.width < 420) strokeMultiplier /= 2
    const path = new fabric.Path(obj.path, base)
    path.set('id', obj.id)
    path.set('strokeWidth', obj.strokeWidth * strokeMultiplier)
    path.set('canvasWidth', canvasWidth)
    path.set('canvasHeight', canvasHeight)
    addSerialization(path)
    return path
  }

  if (obj.type === 'PSStroke') {
    const stroke = await deserializePSStroke(obj)
    if (!stroke) return null
    let strokeMultiplier = 1
    if (obj.canvasWidth) strokeMultiplier = canvasWidth / canvas.width
    if (canvas.width < 420) strokeMultiplier /= 2
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
      strokeWidth: (obj.strokeWidth || 1) * strokeMultiplier,
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
