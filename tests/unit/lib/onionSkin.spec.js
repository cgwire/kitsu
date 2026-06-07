import {
  ONION_MAX_OPACITY,
  ONION_MIN_OPACITY,
  onionOpacity,
  selectOnionNeighbors
} from '@/lib/players/onionSkin'

describe('lib/players/onionSkin', () => {
  describe('onionOpacity', () => {
    it('returns the max opacity for the nearest neighbour', () => {
      expect(onionOpacity(1, 5)).toBe(ONION_MAX_OPACITY)
    })

    it('fades with distance', () => {
      expect(onionOpacity(2, 5)).toBeLessThan(onionOpacity(1, 5))
      expect(onionOpacity(3, 5)).toBeLessThan(onionOpacity(2, 5))
    })

    it('never drops below the min opacity', () => {
      expect(onionOpacity(5, 5)).toBeGreaterThanOrEqual(ONION_MIN_OPACITY)
      expect(onionOpacity(99, 5)).toBe(ONION_MIN_OPACITY)
    })

    it('returns 0 for invalid inputs', () => {
      expect(onionOpacity(0, 5)).toBe(0)
      expect(onionOpacity(1, 0)).toBe(0)
    })
  })

  describe('selectOnionNeighbors', () => {
    // Annotations on frames 8, 9, 11, 13; current frame 10.
    const annotated = { 8: { id: 'a8' }, 9: { id: 'a9' }, 11: { id: 'a11' }, 13: { id: 'a13' } }
    const getAt = frame => annotated[frame] || null

    it('collects annotated frames within n before and after, nearest first', () => {
      const result = selectOnionNeighbors(10, 2, getAt, 100)
      expect(result).toEqual([
        { frame: 9, distance: 1, annotation: { id: 'a9' } },
        { frame: 11, distance: 1, annotation: { id: 'a11' } },
        { frame: 8, distance: 2, annotation: { id: 'a8' } }
      ])
    })

    it('excludes the current frame', () => {
      const result = selectOnionNeighbors(9, 1, getAt, 100)
      expect(result.every(entry => entry.frame !== 9)).toBe(true)
    })

    it('skips frames without an annotation', () => {
      // frame 12 has no annotation, frame 13 does (distance 3)
      const result = selectOnionNeighbors(10, 3, getAt, 100)
      const frames = result.map(entry => entry.frame)
      expect(frames).toContain(13)
      expect(frames).not.toContain(12)
    })

    it('clamps to the lower bound', () => {
      const result = selectOnionNeighbors(0, 5, getAt, 100)
      expect(result.every(entry => entry.frame >= 0)).toBe(true)
    })

    it('clamps to the upper bound (nbFrames)', () => {
      const result = selectOnionNeighbors(13, 5, getAt, 14)
      expect(result.every(entry => entry.frame <= 13)).toBe(true)
    })

    it('returns nothing for n = 0', () => {
      expect(selectOnionNeighbors(10, 0, getAt, 100)).toEqual([])
    })
  })
})
