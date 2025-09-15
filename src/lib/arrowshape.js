import { fabric } from 'fabric'

/**
 * Custom Fabric.js Arrow object
 * Creates an arrow with a line body and triangular arrowhead
 */
export class Arrow extends fabric.Line {
  constructor(points, options = {}) {
    // Set default values
    super(points, options)

    // Apply options
    this.setOptions(options)
    // this._setWidthHeight()
    // this._setLeftTop()

    // Set the type
    this.type = 'arrow'

    // Setup custom controls
    this._setupControls()

    // Store the initial center position for relative calculations
    // this._lastLeft = this.left
    // this._lastTop = this.top

    // this.on("mousedown:before", this._onMouseDown.bind(this))
    this.on('moving', e => {
      console.log(e)
      if (e.transform.action !== 'drag') {
        return
      }
      console.log('Dragging from to', this.left, e.transform.ex)
      const diffX = e.transform.ex - this.left
      const diffY = e.transform.ey - this.top
      console.log('  Diff', diffX, diffY)
      this.set({
        x1: this.x1 + e.e.movementX,
        y1: this.y1 + e.e.movementY,
        x2: this.x2 + e.e.movementX,
        y2: this.y2 + e.e.movementY
      })
    })
  }

  _onMouseDown(event) {
    console.log('Mouse down on arrow:', this, event)
  }

  /**
   * Setup custom controls for start and end points
   */
  _setupControls() {
    const controls = (this.controls = {})

    // Start point control
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

    // End point control
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

    // Hide default controls except for rotation
    this.setControlsVisibility({
      tl: false,
      tr: false,
      br: false,
      bl: false,
      ml: false,
      mr: false,
      mb: false,
      mt: false,
      mtr: false // Keep rotation control
    })
  }

  /**
   * Position handler for start control
   */
  _startControlPosition(dim, finalMatrix, fabricObject) {
    // Calculate start point relative to object center

    return new fabric.Point(this.x1, this.y1)
  }

  /**
   * Position handler for end control
   */
  _endControlPosition(dim, finalMatrix, fabricObject) {
    // Calculate end point relative to object center

    // return new fabric.Point(this.x2, this.y2)
    const x = this.x1 > this.x2 ? this.left : this.left + this.width
    const y = this.y1 > this.y2 ? this.top : this.top + this.height
    return new fabric.Point(x, y)
  }

  /**
   * Render start point control
   */
  _renderStartControl(ctx, left, top, styleOverride, fabricObject) {
    // console.log("start render", left, top)
    // console.log(ctx)
    const size = 8
    ctx.save()
    ctx.fillStyle = '#4CAF50' // Green for start
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(left, top, size / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  /**
   * Render end point control
   */
  _renderEndControl(ctx, left, top, styleOverride, fabricObject) {
    const size = 8
    ctx.save()
    ctx.fillStyle = '#f44336' // Red for end
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(left, top, size / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  /**
   * Handle start point dragging
   */
  _startPointHandler(eventData, transformData, x, y) {
    const pointer = this.canvas.getPointer(eventData.e)
    // console.log("start point handler", pointer)
    // Update x1, y1 to the pointer position
    // console.log("x1, y1", this.x1, this.y1)
    // console.log("left, top", this.left, this.top)
    // console.log("width, height", this.width, this.height)
    this.set({
      x1: pointer.x,
      y1: pointer.y
    })

    // this._updateFromCoordinates()
    this.setCoords()
    this.canvas.renderAll()

    return true
  }

  /**
   * Handle end point dragging
   */
  _endPointHandler(eventData, transformData, x, y) {
    const pointer = this.canvas.getPointer(eventData.e)

    // Update x2, y2 to the pointer position
    this.set({
      x2: pointer.x,
      y2: pointer.y
    })

    // this._updateFromCoordinates()
    this.setCoords()
    this.canvas.renderAll()

    return true
  }

  /**
   * Update object properties when coordinates change
   */
  _updateFromCoordinates() {
    this._setWidthHeight()
    this._setLeftTop()

    // Update object position to center of bounding box
    const centerX = (this.x1 + this.x2) / 2
    const centerY = (this.y1 + this.y2) / 2
    // this.set({
    //   left: centerX,
    //   top: centerY
    // })

    // Update the last known position
    this._lastLeft = centerX
    this._lastTop = centerY
  }

  /**
   * Override the setCoords method to update absolute coordinates
   */
  setCoords() {
    // this._updateAbsoluteCoordinates()
    return super.setCoords()
  }

  /**
   * Calculate and set width/height based on coordinates
   */
  //   _setWidthHeight() {
  //     const width = Math.abs(this.x2 - this.x1)
  //     const height = Math.abs(this.y2 - this.y1)
  //     this.set({
  //       width: width || 1 + this.strokeWidth,
  //       height: height || 1 + this.strokeWidth
  //     })
  //   }

  _setLeftTop() {
    const left = (this.x1 + this.x2) / 2
    const top = (this.y1 + this.y2) / 2
    this.set({
      left: left,
      top: top
    })
  }

  /**
   * Render the arrow on the canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  _render(ctx) {
    // The arrow tail will be drawn by the Line super class
    super._render(ctx)
    // Calculate relative coordinates (relative to object's center)
    const xDiff = this.x2 - this.x1
    const yDiff = this.y2 - this.y1

    // Calculate arrow body coordinates relative to center
    const x2 = -this.width / 2 + (this.x2 - Math.min(this.x1, this.x2))
    const y2 = -this.height / 2 + (this.y2 - Math.min(this.y1, this.y2))

    // Calculate arrow head
    const angle = Math.atan2(yDiff, xDiff)
    const arrowLength = this.arrowHeadSize
    const arrowAngle = Math.PI / 6 // 30 degrees

    // Arrow head coordinates - create a proper triangular tip
    const arrowX1 = x2 - arrowLength * Math.cos(angle - arrowAngle)
    const arrowY1 = y2 - arrowLength * Math.sin(angle - arrowAngle)
    const arrowX2 = x2 - arrowLength * Math.cos(angle + arrowAngle)
    const arrowY2 = y2 - arrowLength * Math.sin(angle + arrowAngle)

    ctx.beginPath()

    // Draw the arrowhead as a closed triangular path
    ctx.moveTo(arrowX1, arrowY1)
    ctx.lineTo(x2, y2) // tip of the arrow
    ctx.lineTo(arrowX2, arrowY2)
    ctx.closePath()

    // Apply stroke styles and stroke
    this._setStrokeStyles(ctx, this)
    ctx.stroke()

    // Optionally fill the arrowhead for a solid tip
    if (this.fill && this.fill !== 'transparent') {
      ctx.fillStyle = this.fill
      ctx.fill()
    }
  }

  /**
   * Convert object to plain object for serialization
   * @param {Array} propertiesToInclude - Properties to include in serialization
   * @returns {Object} Plain object representation
   */
  toObject(propertiesToInclude = []) {
    return fabric.util.object.extend(super.toObject(propertiesToInclude), {
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      arrowHeadSize: this.arrowHeadSize,
      arrowHeadWidth: this.arrowHeadWidth,
      _lastLeft: this._lastLeft,
      _lastTop: this._lastTop
    })
  }

  /**
   * Update arrow coordinates
   * @param {number} x1 - Start X coordinate
   * @param {number} y1 - Start Y coordinate
   * @param {number} x2 - End X coordinate
   * @param {number} y2 - End Y coordinate
   */
  updateCoordinates(x1, y1, x2, y2) {
    this.set({
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2
    })
    this._updateFromCoordinates()
    this.setCoords()
  }

  /**
   * Returns svg representation of an instance
   * @return {string} SVG string representation
   */
  _toSVG() {
    const xDiff = this.x2 - this.x1
    const yDiff = this.y2 - this.y1

    // Calculate relative coordinates
    const x1 = -this.width / 2 + (this.x1 - Math.min(this.x1, this.x2))
    const y1 = -this.height / 2 + (this.y1 - Math.min(this.y1, this.y2))
    const x2 = -this.width / 2 + (this.x2 - Math.min(this.x1, this.x2))
    const y2 = -this.height / 2 + (this.y2 - Math.min(this.y1, this.y2))

    // Arrow head calculations
    const angle = Math.atan2(yDiff, xDiff)
    const arrowLength = this.arrowHeadSize
    const arrowAngle = Math.PI / 6
    const arrowX1 = x2 - arrowLength * Math.cos(angle - arrowAngle)
    const arrowY1 = y2 - arrowLength * Math.sin(angle - arrowAngle)
    const arrowX2 = x2 - arrowLength * Math.cos(angle + arrowAngle)
    const arrowY2 = y2 - arrowLength * Math.sin(angle + arrowAngle)

    // Calculate where the arrow body should end
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

  /**
   * Static method to create Arrow from object (for deserialization)
   * @param {Object} object - Plain object representation
   * @param {Function} callback - Callback function
   */
  static fromObject(object, callback) {
    const arrow = new Arrow(object)
    if (callback) callback(arrow)
    return arrow
  }
}

// Register the Arrow class with Fabric.js for backward compatibility
fabric.Arrow = Arrow

/**
 * Register the Arrow shape with Fabric.js
 * This function should be called to ensure the Arrow class is available in Fabric.js
 */
export function registerArrowFabricShape() {
  if (!fabric.Arrow) {
    fabric.Arrow = Arrow
  }
}

export default Arrow
