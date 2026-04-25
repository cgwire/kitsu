import { fabric } from 'fabric'

/**
 * Custom Fabric.js Arrow object — line body + triangular arrowhead.
 *
 * Adapted from https://github.com/cgwire/kitsu/pull/1830 (improve_annotation
 * branch). The PR draft included a fair amount of dead/commented-out code;
 * this version keeps the rendering, serialisation, custom controls and
 * SVG export and drops the unused bits.
 */
export class Arrow extends fabric.Line {
  constructor(points, options = {}) {
    super(points, options)
    this.setOptions(options)
    this.type = 'arrow'
    this.arrowHeadSize = options.arrowHeadSize || 15
    this.arrowHeadWidth = options.arrowHeadWidth || 12
    this._setupControls()

    // Keep x1/y1/x2/y2 in sync when the user drags the whole shape.
    this.on('moving', e => {
      if (e.transform?.action !== 'drag') return
      this.set({
        x1: this.x1 + e.e.movementX,
        y1: this.y1 + e.e.movementY,
        x2: this.x2 + e.e.movementX,
        y2: this.y2 + e.e.movementY
      })
    })
  }

  /**
   * Hide default scale controls and expose two endpoint controls (start /
   * end) so the user can reshape the arrow by dragging its tips.
   */
  _setupControls() {
    const controls = (this.controls = {})
    controls.start = new fabric.Control({
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      cursorStyle: 'pointer',
      mouseUpHandler: this._startPointHandler.bind(this),
      actionHandler: this._startPointHandler.bind(this),
      actionName: 'startPoint',
      render: this._renderStartControl.bind(this),
      positionHandler: this._startControlPosition.bind(this)
    })
    controls.end = new fabric.Control({
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      cursorStyle: 'pointer',
      mouseUpHandler: this._endPointHandler.bind(this),
      actionHandler: this._endPointHandler.bind(this),
      actionName: 'endPoint',
      render: this._renderEndControl.bind(this),
      positionHandler: this._endControlPosition.bind(this)
    })
    this.setControlsVisibility({
      tl: false,
      tr: false,
      br: false,
      bl: false,
      ml: false,
      mr: false,
      mb: false,
      mt: false,
      mtr: false
    })
  }

  _startControlPosition() {
    return new fabric.Point(this.x1, this.y1)
  }

  _endControlPosition() {
    const x = this.x1 > this.x2 ? this.left : this.left + this.width
    const y = this.y1 > this.y2 ? this.top : this.top + this.height
    return new fabric.Point(x, y)
  }

  _renderStartControl(ctx, left, top) {
    const size = 8
    ctx.save()
    ctx.fillStyle = '#4CAF50'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(left, top, size / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  _renderEndControl(ctx, left, top) {
    const size = 8
    ctx.save()
    ctx.fillStyle = '#f44336'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(left, top, size / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  _startPointHandler(eventData) {
    const pointer = this.canvas.getPointer(eventData.e)
    this.set({ x1: pointer.x, y1: pointer.y })
    this.setCoords()
    this.canvas.renderAll()
    return true
  }

  _endPointHandler(eventData) {
    const pointer = this.canvas.getPointer(eventData.e)
    this.set({ x2: pointer.x, y2: pointer.y })
    this.setCoords()
    this.canvas.renderAll()
    return true
  }

  /**
   * Render the arrow body (handled by Line) plus a triangular head at
   * (x2, y2). Coordinates are computed relative to the object's centre
   * because fabric.Line stores its coordinates that way.
   */
  _render(ctx) {
    super._render(ctx)
    const xDiff = this.x2 - this.x1
    const yDiff = this.y2 - this.y1
    const x2 = -this.width / 2 + (this.x2 - Math.min(this.x1, this.x2))
    const y2 = -this.height / 2 + (this.y2 - Math.min(this.y1, this.y2))
    const angle = Math.atan2(yDiff, xDiff)
    const arrowLength = this.arrowHeadSize
    const arrowAngle = Math.PI / 6
    const arrowX1 = x2 - arrowLength * Math.cos(angle - arrowAngle)
    const arrowY1 = y2 - arrowLength * Math.sin(angle - arrowAngle)
    const arrowX2 = x2 - arrowLength * Math.cos(angle + arrowAngle)
    const arrowY2 = y2 - arrowLength * Math.sin(angle + arrowAngle)
    ctx.beginPath()
    ctx.moveTo(arrowX1, arrowY1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(arrowX2, arrowY2)
    ctx.closePath()
    this._setStrokeStyles(ctx, this)
    ctx.stroke()
    if (this.fill && this.fill !== 'transparent') {
      ctx.fillStyle = this.fill
      ctx.fill()
    }
  }

  toObject(propertiesToInclude = []) {
    return fabric.util.object.extend(super.toObject(propertiesToInclude), {
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      arrowHeadSize: this.arrowHeadSize,
      arrowHeadWidth: this.arrowHeadWidth
    })
  }

  _toSVG() {
    const xDiff = this.x2 - this.x1
    const yDiff = this.y2 - this.y1
    const x1 = -this.width / 2 + (this.x1 - Math.min(this.x1, this.x2))
    const y1 = -this.height / 2 + (this.y1 - Math.min(this.y1, this.y2))
    const x2 = -this.width / 2 + (this.x2 - Math.min(this.x1, this.x2))
    const y2 = -this.height / 2 + (this.y2 - Math.min(this.y1, this.y2))
    const angle = Math.atan2(yDiff, xDiff)
    const arrowLength = this.arrowHeadSize
    const arrowAngle = Math.PI / 6
    const arrowX1 = x2 - arrowLength * Math.cos(angle - arrowAngle)
    const arrowY1 = y2 - arrowLength * Math.sin(angle - arrowAngle)
    const arrowX2 = x2 - arrowLength * Math.cos(angle + arrowAngle)
    const arrowY2 = y2 - arrowLength * Math.sin(angle + arrowAngle)
    const bodyEndOffset = arrowLength * 0.7
    const bodyEndX = x2 - bodyEndOffset * Math.cos(angle)
    const bodyEndY = y2 - bodyEndOffset * Math.sin(angle)
    const fillAttr =
      this.fill && this.fill !== 'transparent'
        ? `fill="${this.fill}"`
        : 'fill="none"'
    return [
      '<g>',
      `<line x1="${x1}" y1="${y1}" x2="${bodyEndX}" y2="${bodyEndY}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" />`,
      `<polygon points="${arrowX1},${arrowY1} ${x2},${y2} ${arrowX2},${arrowY2}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" ${fillAttr} />`,
      '</g>'
    ].join('')
  }

  static fromObject(object, callback) {
    const arrow = new Arrow(
      [object.x1 || 0, object.y1 || 0, object.x2 || 0, object.y2 || 0],
      object
    )
    if (callback) callback(arrow)
    return arrow
  }
}

fabric.Arrow = Arrow

export const registerArrowFabricShape = () => {
  if (!fabric.Arrow) {
    fabric.Arrow = Arrow
  }
}

export default Arrow
