/*
 * Frame-painting backends for the canvas video pipeline.
 *
 * The visible <canvas> in VideoViewer is painted from a hidden <video>
 * on every requestVideoFrameCallback tick. v1 ships a single Canvas2D
 * backend; `createFrameRenderer` is the seam where a WebGL backend
 * (LUTs, scopes) will plug in without re-migrating the component.
 */

export class Canvas2DFrameRenderer {
  constructor(canvas, video) {
    this.canvas = canvas
    this.video = video
    // alpha:false skips per-pixel compositing; desynchronized lets the
    // browser present paints without waiting for the compositor frame,
    // which keeps scrubbing responsive while the pointer is dragging.
    this.context = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    })
  }

  // Internal bitmap resolution (native video size), not the CSS size.
  resize(width, height) {
    if (!this.canvas || !width || !height) return
    // Reassigning canvas.width/height clears the bitmap; skip when unchanged.
    if (this.canvas.width !== width) this.canvas.width = width
    if (this.canvas.height !== height) this.canvas.height = height
  }

  // Paints the current frame of the hidden video — or any drawImage
  // source (the poster <img> before the first decoded frame).
  drawFrame(source = this.video) {
    if (!this.context || !source) return
    this.context.drawImage(source, 0, 0, this.canvas.width, this.canvas.height)
  }

  dispose() {
    if (this.canvas) {
      // Zero the bitmap so the browser can reclaim the backing store
      // right away instead of waiting for GC.
      this.canvas.width = 0
      this.canvas.height = 0
    }
    this.context = null
    this.video = null
    this.canvas = null
  }
}

export const createFrameRenderer = (canvas, video) =>
  new Canvas2DFrameRenderer(canvas, video)

export const supportsVideoFrameCallback = () =>
  typeof HTMLVideoElement !== 'undefined' &&
  'requestVideoFrameCallback' in HTMLVideoElement.prototype
