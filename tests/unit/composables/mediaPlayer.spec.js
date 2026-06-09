import { ref } from 'vue'

import { useMediaPlayer } from '@/composables/players/mediaPlayer'

const makeEl = (overrides = {}) => {
  const handlers = {}
  return {
    paused: true,
    muted: false,
    currentTime: 0,
    duration: 60,
    readyState: 1,
    play: vi.fn(function () {
      this.paused = false
      return Promise.resolve()
    }),
    pause: vi.fn(function () {
      this.paused = true
    }),
    addEventListener: vi.fn((name, fn) => {
      handlers[name] = fn
    }),
    removeEventListener: vi.fn(),
    _handlers: handlers,
    ...overrides
  }
}

describe('composables/players/mediaPlayer', () => {
  it('togglePlay plays when paused and pauses when playing', () => {
    const el = makeEl()
    const { togglePlay } = useMediaPlayer(ref(el))
    togglePlay()
    expect(el.play).toHaveBeenCalled()
    togglePlay()
    expect(el.pause).toHaveBeenCalled()
  })

  it('seek sets currentTime to the ratio of duration', () => {
    const el = makeEl({ duration: 120 })
    const { bind, seek } = useMediaPlayer(ref(el))
    bind()
    seek(0.25)
    expect(el.currentTime).toBe(30)
  })

  it('toggleMute flips the element muted flag', () => {
    const el = makeEl()
    const { toggleMute, isMuted } = useMediaPlayer(ref(el))
    toggleMute()
    expect(el.muted).toBe(true)
    expect(isMuted.value).toBe(true)
  })

  it('reflects timeupdate / loadedmetadata events into refs', () => {
    const el = makeEl({ duration: 0 })
    const { bind, currentTime, duration, formattedTime } = useMediaPlayer(
      ref(el)
    )
    bind()
    el.duration = 90
    el._handlers.loadedmetadata()
    el.currentTime = 30
    el._handlers.timeupdate()
    expect(duration.value).toBe(90)
    expect(currentTime.value).toBe(30)
    expect(formattedTime.value).toBe('0:30 / 1:30')
  })

  it('seek ignores a non-finite ratio', () => {
    const el = makeEl({ duration: 100, currentTime: 7 })
    const { bind, seek } = useMediaPlayer(ref(el))
    bind()
    seek(NaN)
    expect(el.currentTime).toBe(7)
  })

  it('unbind removes the listeners it added', () => {
    const el = makeEl()
    const { bind, unbind } = useMediaPlayer(ref(el))
    bind()
    unbind()
    expect(el.removeEventListener).toHaveBeenCalledTimes(5)
  })
})
