import {
  getTileCellIndex,
  getTileGeometry,
  TILE_CELL_HEIGHT,
  TILE_COLUMNS
} from '@/lib/players/tiles'

describe('lib/players/tiles', () => {
  describe('getTileCellIndex', () => {
    it('maps frames one-to-one when the sprite holds every frame', () => {
      expect(getTileCellIndex(0, 100, 3840)).toBe(0)
      expect(getTileCellIndex(41, 100, 3840)).toBe(41)
    })

    it('mirrors ffmpeg subsampling (floor, not ceil) on long movies', () => {
      // 7000 frames in a 3840-cell sprite: k = ceil(7000/3840) = 2,
      // ffmpeg keeps frames 0, 2, 4… so frame 11 lives in cell 5.
      expect(getTileCellIndex(11, 7000, 3840)).toBe(5)
      expect(getTileCellIndex(10, 7000, 3840)).toBe(5)
      expect(getTileCellIndex(12, 7000, 3840)).toBe(6)
    })

    it('clamps to the sprite bounds', () => {
      expect(getTileCellIndex(-3, 100, 3840)).toBe(0)
      expect(getTileCellIndex(99999, 7000, 3840)).toBe(3839)
    })
  })

  describe('getTileGeometry', () => {
    let originalImage

    beforeEach(() => {
      originalImage = globalThis.Image
    })

    afterEach(() => {
      globalThis.Image = originalImage
    })

    const installImageMock = ({ width, height, fail = false }) => {
      globalThis.Image = class {
        set src(_) {
          this.naturalWidth = width
          this.naturalHeight = height
          setTimeout(() => (fail ? this.onerror?.() : this.onload?.()))
        }
      }
    }

    it('measures the sprite cells from the natural image size', async () => {
      installImageMock({ width: 1424, height: 4200 })
      const geometry = await getTileGeometry('/tiles/measured.png')
      expect(geometry.cellWidth).toBe(1424 / TILE_COLUMNS)
      expect(geometry.rows).toBe(4200 / TILE_CELL_HEIGHT)
      expect(geometry.cellCount).toBe((4200 / TILE_CELL_HEIGHT) * 8)
    })

    it('memoizes per URL', async () => {
      installImageMock({ width: 800, height: 100 })
      const first = await getTileGeometry('/tiles/cached.png')
      installImageMock({ width: 1600, height: 200 })
      const second = await getTileGeometry('/tiles/cached.png')
      expect(second).toBe(first)
    })

    it('resolves null on load failure and allows a retry', async () => {
      installImageMock({ width: 0, height: 0, fail: true })
      expect(await getTileGeometry('/tiles/broken.png')).toBeNull()
      installImageMock({ width: 800, height: 100 })
      const retried = await getTileGeometry('/tiles/broken.png')
      expect(retried).not.toBeNull()
      expect(retried.cellWidth).toBe(100)
    })
  })
})
