import {
  Canvas2DFrameRenderer,
  createFrameRenderer,
  supportsVideoFrameCallback
} from '@/lib/players/frameRenderer'

const createFakeCanvas = () => {
  const context = {
    drawImage: vi.fn()
  }
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context)
  }
  return { canvas, context }
}

const createFakeVideo = () => ({ videoWidth: 1920, videoHeight: 1080 })

describe('lib/players/frameRenderer', () => {
  describe('Canvas2DFrameRenderer', () => {
    it('acquires an opaque 2d context on construction', () => {
      const { canvas } = createFakeCanvas()
      new Canvas2DFrameRenderer(canvas, createFakeVideo())
      expect(canvas.getContext).toHaveBeenCalledWith('2d', { alpha: false })
    })

    it('resize sets the internal bitmap resolution', () => {
      const { canvas } = createFakeCanvas()
      const renderer = new Canvas2DFrameRenderer(canvas, createFakeVideo())
      renderer.resize(1920, 1080)
      expect(canvas.width).toBe(1920)
      expect(canvas.height).toBe(1080)
    })

    it('resize ignores falsy dimensions (metadata not loaded yet)', () => {
      const { canvas } = createFakeCanvas()
      const renderer = new Canvas2DFrameRenderer(canvas, createFakeVideo())
      canvas.width = 640
      canvas.height = 360
      renderer.resize(0, 0)
      expect(canvas.width).toBe(640)
      expect(canvas.height).toBe(360)
    })

    it('drawFrame paints the video over the full bitmap', () => {
      const { canvas, context } = createFakeCanvas()
      const video = createFakeVideo()
      const renderer = new Canvas2DFrameRenderer(canvas, video)
      renderer.resize(1920, 1080)
      renderer.drawFrame()
      expect(context.drawImage).toHaveBeenCalledWith(video, 0, 0, 1920, 1080)
    })

    it('drawFrame accepts an alternate source (poster image)', () => {
      const { canvas, context } = createFakeCanvas()
      const renderer = new Canvas2DFrameRenderer(canvas, createFakeVideo())
      renderer.resize(1920, 1080)
      const poster = { src: 'poster.png' }
      renderer.drawFrame(poster)
      expect(context.drawImage).toHaveBeenCalledWith(poster, 0, 0, 1920, 1080)
    })

    it('is inert after dispose (no throw, no draw)', () => {
      const { canvas, context } = createFakeCanvas()
      const renderer = new Canvas2DFrameRenderer(canvas, createFakeVideo())
      renderer.dispose()
      expect(() => renderer.drawFrame()).not.toThrow()
      expect(() => renderer.resize(10, 10)).not.toThrow()
      expect(() => renderer.dispose()).not.toThrow()
      expect(context.drawImage).not.toHaveBeenCalled()
    })
  })

  describe('createFrameRenderer', () => {
    it('returns a Canvas2DFrameRenderer (v1 has a single backend)', () => {
      const { canvas } = createFakeCanvas()
      const renderer = createFrameRenderer(canvas, createFakeVideo())
      expect(renderer).toBeInstanceOf(Canvas2DFrameRenderer)
    })
  })

  describe('supportsVideoFrameCallback', () => {
    it('returns a boolean and false under jsdom', () => {
      expect(supportsVideoFrameCallback()).toBe(false)
    })
  })
})
