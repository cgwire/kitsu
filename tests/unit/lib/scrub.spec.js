import { scrubFrame } from '@/lib/players/scrub'

describe('lib/players/scrub', () => {
  describe('scrubFrame', () => {
    // Positional-relative scrub: the full reference width spans the whole
    // clip (0 → last frame), anchored on the frame where the drag began.
    const base = { startFrame: 0, width: 1000, frameCount: 101 }

    it('maps a full-width drag from the first frame to the last frame', () => {
      expect(scrubFrame({ ...base, deltaPx: 1000 })).toBe(100)
    })

    it('maps a half-width drag to the middle of the clip', () => {
      expect(scrubFrame({ ...base, deltaPx: 500 })).toBe(50)
    })

    it('is anchored on the start frame, not the current frame', () => {
      expect(scrubFrame({ ...base, startFrame: 40, deltaPx: 100 })).toBe(50)
    })

    it('clamps at the last frame when the drag overshoots', () => {
      expect(scrubFrame({ ...base, startFrame: 80, deltaPx: 1000 })).toBe(100)
    })

    it('clamps at zero when dragging back past the start', () => {
      expect(scrubFrame({ ...base, startFrame: 10, deltaPx: -1000 })).toBe(0)
    })

    it('returns to the start frame on a symmetric back-and-forth drag', () => {
      const startFrame = 30
      const forward = scrubFrame({ ...base, startFrame, deltaPx: 200 })
      expect(forward).toBe(50)
      // The same gesture reversed is computed from the original anchor,
      // so it lands exactly back on the start frame (no drift).
      expect(scrubFrame({ ...base, startFrame, deltaPx: 0 })).toBe(startFrame)
    })

    it('does not move when the reference width is zero (guard)', () => {
      expect(scrubFrame({ startFrame: 25, deltaPx: 500, width: 0, frameCount: 101 })).toBe(25)
    })

    it('does not move for a single-frame clip', () => {
      expect(scrubFrame({ startFrame: 0, deltaPx: 500, width: 1000, frameCount: 1 })).toBe(0)
    })
  })
})
