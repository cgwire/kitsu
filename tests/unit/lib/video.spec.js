import {
  formatFrame,
  formatTime,
  frameToSeconds,
  roundToFrame
} from '../../../src/lib/video'

describe('video', () => {

  describe('Mount', () => {
    it('roundToFrame', () => {
      expect(roundToFrame(1, 24)).toBe(1.008)
      expect(roundToFrame(0.95, 24)).toBe(0.966)
      expect(roundToFrame(2, 24)).toBe(2.016)
      expect(roundToFrame(60, 24)).toBe(60.018)
      expect(roundToFrame(60, 25)).toBe(60)
      expect(roundToFrame(50, 25)).toBe(50)
      expect(roundToFrame(49.1, 25)).toBe(49.12)
      expect(roundToFrame(49.13, 25)).toBe(49.12)
      expect(roundToFrame(49.14, 25)).toBe(49.16)
      expect(roundToFrame(49.15, 25)).toBe(49.16)
      expect(roundToFrame(49.2, 25)).toBe(49.2)
      expect(roundToFrame(49.3, 25)).toBe(49.32)
      expect(roundToFrame(49.4, 25)).toBe(49.4)
    })

    it('frameToSeconds', () => {
      expect(frameToSeconds(1, {fps: 24})).toBe(0.042)
      expect(frameToSeconds(10, {fps: 24})).toBe(0.417)
      expect(frameToSeconds(24, {fps: 24})).toBe(1)
      expect(frameToSeconds(48, {fps: 24})).toBe(2)
      expect(frameToSeconds(32, {fps: 24})).toBe(1.333)
      expect(frameToSeconds(47, {fps: 24})).toBe(1.958)
      expect(frameToSeconds(1, {fps: 25})).toBe(0.04)
      expect(frameToSeconds(10, {fps: 25})).toBe(0.4)
      expect(frameToSeconds(25, {fps: 25})).toBe(1)
      expect(frameToSeconds(50, {fps: 25})).toBe(2)
      expect(frameToSeconds(32, {fps: 25})).toBe(1.28)
      expect(frameToSeconds(47, {fps: 25})).toBe(1.88)
    })

    it('formatFrame', () => {
      expect(formatFrame(1, 24)).toBe('024')
      expect(formatFrame(1, 25)).toBe('025')
      expect(formatFrame(0, 24)).toBe('001')
      expect(formatFrame(0.68, 24)).toBe('017')
      expect(formatFrame(4.83, 24)).toBe('116')
      expect(formatFrame(4.83, 25)).toBe('121')
      expect(formatFrame(5, 25)).toBe('125')
    })

    it('formatTime', () => {
      expect(formatTime(0.091)).toBe('00:00.091')
      expect(formatTime(0.001)).toBe('00:00.001')
      expect(formatTime(0.900)).toBe('00:00.900')
      expect(formatTime(0.960)).toBe('00:00.960')
      expect(formatTime(0.966)).toBe('00:00.966')
      expect(formatTime(2.416)).toBe('00:02.416')
      expect(formatTime(2.016)).toBe('00:02.016')
      expect(formatTime(60.018)).toBe('01:00.018')
      expect(formatTime(362.018)).toBe('06:02.018')
    })
  })
})
