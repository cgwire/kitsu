import {
  formatFrame,
  formatTime,
  frameToSeconds,
  roundToFrame
} from '@/lib/video'

describe('video', () => {
  it('roundToFrame', () => {
    expect(roundToFrame(1, 24)).toBe(1.0008)
    expect(roundToFrame(0.95, 24)).toBe(0.9591)
    expect(roundToFrame(2, 24)).toBe(2.0016)
    expect(roundToFrame(60, 24)).toBe(60.0063)
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
    expect(frameToSeconds(1, { fps: 24 })).toBe(0.042)
    expect(frameToSeconds(10, { fps: 24 })).toBe(0.417)
    expect(frameToSeconds(24, { fps: 24 })).toBe(1)
    expect(frameToSeconds(48, { fps: 24 })).toBe(2)
    expect(frameToSeconds(32, { fps: 24 })).toBe(1.333)
    expect(frameToSeconds(47, { fps: 24 })).toBe(1.958)
    expect(frameToSeconds(1, { fps: 25 })).toBe(0.04)
    expect(frameToSeconds(10, { fps: 25 })).toBe(0.4)
    expect(frameToSeconds(25, { fps: 25 })).toBe(1)
    expect(frameToSeconds(50, { fps: 25 })).toBe(2)
    expect(frameToSeconds(32, { fps: 25 })).toBe(1.28)
    expect(frameToSeconds(47, { fps: 25 })).toBe(1.88)
  })

  it('formatFrame', () => {
    expect(formatFrame(1)).toBe('001')
    expect(formatFrame(123)).toBe('123')
  })

  it('formatTime', () => {
    expect(formatTime(0.091, 25)).toBe('00:00:00:02')
    expect(formatTime(0.001, 25)).toBe('00:00:00:00')
    expect(formatTime(0.9, 25)).toBe('00:00:00:23')
    expect(formatTime(0.96, 25)).toBe('00:00:00:24')
    expect(formatTime(0.966, 25)).toBe('00:00:00:24')
    expect(formatTime(2.416, 25)).toBe('00:00:02:10')
    expect(formatTime(2.016, 25)).toBe('00:00:02:00')
    expect(formatTime(60.018, 25)).toBe('00:01:00:00')
    expect(formatTime(362.018, 25)).toBe('00:06:02:00')
  })
})
