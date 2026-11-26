// @vitest-environment node

import {
  panPanzoomBy,
  pointOnMainMedia,
  zoomPanzoomAt
} from '@/lib/players/panzoom'

const panzoomInstance = ({ isPaused = false } = {}) => ({
  getTransform: () => ({ x: 0, y: 0, scale: 1 }),
  isPaused: () => isPaused,
  moveBy: vi.fn(),
  zoomTo: vi.fn()
})

const media = {
  style: { transform: '' },
  getBoundingClientRect: () => ({ left: 100, top: 50 })
}

// A movie centered in a taller player: panzoom moves it from its own
// top-left corner, 274 pixels below the one of its parent. Like panzoom,
// the fake writes its transform on the movie at the next frame only.
const centeredMovie = () => {
  const transform = { x: 10, y: -20, scale: 1.5 }
  const corner = { x: 0, y: 274 }
  const movie = { style: { transform: '' } }
  const frame = () => {
    const { x, y, scale } = transform
    movie.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`
  }
  const applied = () => {
    const [, , , , x = 0, y = 0] = (
      movie.style.transform.match(/-?[\d.]+/g) || []
    ).map(Number)
    return { x, y }
  }
  movie.parentElement = {
    getBoundingClientRect: () => ({ left: 0, top: 0 })
  }
  movie.getBoundingClientRect = () => ({
    left: corner.x + applied().x,
    top: corner.y + applied().y
  })
  const instance = {
    getTransform: () => transform,
    isPaused: () => false,
    moveBy: (dx, dy) => {
      transform.x += dx
      transform.y += dy
    },
    // The zoom of panzoom, its bounds left out.
    zoomTo: (x, y, ratio) => {
      transform.x = x - ratio * (x - transform.x)
      transform.y = y - ratio * (y - transform.y)
      transform.scale *= ratio
    }
  }
  const toScreen = ({ x, y }) => ({
    x: corner.x + transform.x + x * transform.scale,
    y: corner.y + transform.y + y * transform.scale
  })
  const fromScreen = ({ x, y }) => ({
    x: (x - corner.x - transform.x) / transform.scale,
    y: (y - corner.y - transform.y) / transform.scale
  })
  frame()
  return { instance, movie, toScreen, fromScreen }
}

describe('lib/players/panzoom', () => {
  describe('panPanzoomBy', () => {
    it('moves the media by the given screen pixels', () => {
      const instance = panzoomInstance()

      panPanzoomBy(instance, 12, -4)

      expect(instance.moveBy.mock.calls).toEqual([[12, -4]])
    })

    it('leaves a paused media still', () => {
      const instance = panzoomInstance({ isPaused: true })

      panPanzoomBy(instance, 12, -4)

      expect(instance.moveBy).not.toHaveBeenCalled()
    })

    it('does nothing before panzoom is set up', () => {
      expect(() => panPanzoomBy(null, 12, -4)).not.toThrow()
    })
  })

  describe('zoomPanzoomAt', () => {
    it('keeps the point under the fingers in place', () => {
      const { instance, movie, toScreen, fromScreen } = centeredMovie()
      const fingers = { x: 220, y: 400 }
      const point = fromScreen(fingers)

      zoomPanzoomAt(instance, movie, fingers.x, fingers.y, 1.2)

      expect(toScreen(point).x).toBeCloseTo(fingers.x)
      expect(toScreen(point).y).toBeCloseTo(fingers.y)
      expect(instance.getTransform().scale).toBeCloseTo(1.8)
    })

    // panzoom writes no transform before the first move.
    it('zooms a media panzoom never moved', () => {
      const instance = panzoomInstance()

      zoomPanzoomAt(instance, media, 300, 150, 1.5)

      expect(instance.zoomTo.mock.calls).toEqual([[200, 100, 1.5]])
    })

    // A pinch pans then zooms at each move of the fingers.
    it('keeps the point under the fingers in place right after a pan', () => {
      const { instance, movie, toScreen, fromScreen } = centeredMovie()
      const fingers = { x: 220, y: 400 }
      instance.moveBy(15, 10)
      const point = fromScreen(fingers)

      zoomPanzoomAt(instance, movie, fingers.x, fingers.y, 1.2)

      expect(toScreen(point).x).toBeCloseTo(fingers.x)
      expect(toScreen(point).y).toBeCloseTo(fingers.y)
    })

    it('leaves a paused media still', () => {
      const instance = panzoomInstance({ isPaused: true })

      zoomPanzoomAt(instance, media, 300, 150, 1.5)

      expect(instance.zoomTo).not.toHaveBeenCalled()
    })

    it('does nothing without a media or before panzoom is set up', () => {
      const instance = panzoomInstance()

      zoomPanzoomAt(instance, null, 300, 150, 1.5)
      zoomPanzoomAt(null, media, 300, 150, 1.5)

      expect(instance.zoomTo).not.toHaveBeenCalled()
    })
  })

  // Side by side: the comparison viewer starts 500 px to the right of the
  // main one. The main media sits 20 px into its viewer, the compared one
  // 40 px, both 40 px down.
  describe('pointOnMainMedia', () => {
    const box = (left, top = 0, width = 400, height = 300) => ({
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height
    })
    const sides = {
      mainArea: box(0),
      comparisonArea: box(500),
      main: box(20, 40),
      compared: box(540, 40)
    }

    it('moves a point over the comparison to the same spot of the main media', () => {
      expect(pointOnMainMedia(620, 100, sides)).toEqual({ x: 100, y: 100 })
    })

    it('keeps a point over the main viewer', () => {
      expect(pointOnMainMedia(300, 100, sides)).toEqual({ x: 300, y: 100 })
    })

    // Laid over, the viewers share a box, and the compared media may sit
    // elsewhere in it than the main one.
    it('keeps a point over a comparison laid over the main viewer', () => {
      const over = { ...sides, comparisonArea: box(0), compared: box(70, 40) }
      expect(pointOnMainMedia(120, 100, over)).toEqual({ x: 120, y: 100 })
    })

    // A closed comparison has an empty box at the corner of the page.
    it('keeps a point while the comparison is hidden', () => {
      const comparisonArea = box(0, 0, 0, 0)
      const mainArea = box(10)
      expect(pointOnMainMedia(0, 0, { ...sides, mainArea, comparisonArea })).toEqual({
        x: 0,
        y: 0
      })
    })

    it('keeps a point while a media is missing', () => {
      expect(
        pointOnMainMedia(620, 100, { ...sides, compared: undefined })
      ).toEqual({ x: 620, y: 100 })
      expect(pointOnMainMedia(620, 100, { ...sides, main: undefined })).toEqual(
        { x: 620, y: 100 }
      )
    })
  })
})
