import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import VideoViewer from '@/components/players/viewers/VideoViewer.vue'

// jsdom has no 2d context nor rVFC: both are stubbed here.
const fakeContext = { drawImage: vi.fn() }

// Collects rVFC callbacks so tests can fire ticks manually.
let rvfcCallbacks
let rvfcCancelled

const installRvfcMock = () => {
  rvfcCallbacks = []
  rvfcCancelled = []
  HTMLVideoElement.prototype.requestVideoFrameCallback = function (cb) {
    rvfcCallbacks.push(cb)
    return rvfcCallbacks.length
  }
  HTMLVideoElement.prototype.cancelVideoFrameCallback = function (handle) {
    rvfcCancelled.push(handle)
  }
}

const removeRvfcMock = () => {
  delete HTMLVideoElement.prototype.requestVideoFrameCallback
  delete HTMLVideoElement.prototype.cancelVideoFrameCallback
}

const mountViewer = (props = {}) => {
  const store = createStore({
    getters: { currentProduction: () => ({ fps: '25' }) }
  })
  return mount(VideoViewer, {
    props: {
      preview: { id: 'preview-1', extension: 'mp4' },
      fps: 25,
      nbFrames: 100,
      ...props
    },
    global: {
      mocks: { $t: key => key },
      plugins: [store]
    }
  })
}

describe('players/VideoViewer (canvas pipeline)', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeContext
    )
    // jsdom implements neither play() nor pause() on media elements; without
    // these it logs "Not implemented" on every unmount (pause) and play.
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    fakeContext.drawImage.mockClear()
    installRvfcMock()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    removeRvfcMock()
  })

  it('renders a visible canvas and a hidden decoder video', () => {
    const wrapper = mountViewer()
    const canvas = wrapper.find('canvas.annotation-movie')
    const video = wrapper.find('video.annotation-movie-decoder')
    expect(canvas.exists()).toBe(true)
    expect(video.exists()).toBe(true)
    wrapper.unmount()
  })

  it('keeps the full exposed surface plus getDisplaySurface', () => {
    const wrapper = mountViewer()
    const exposed = [
      'currentTimeRaw',
      'video',
      'formatFrame',
      'getNaturalDimensions',
      'getDimensions',
      'getLastPushedCurrentTime',
      'setCurrentFrame',
      'setCurrentTimeRaw',
      'setCurrentTime',
      'configureVideo',
      'mountVideo',
      'getFrameFromPlayer',
      'play',
      'pause',
      'toggleMute',
      'goPreviousFrame',
      'goNextFrame',
      'resetPanZoom',
      'setPanZoom',
      'panBy',
      'zoomAt',
      'pausePanZoom',
      'resumePanZoom',
      'setSpeed',
      'setVolume',
      'resetSize',
      'getDisplaySurface'
    ]
    exposed.forEach(name => {
      expect(wrapper.vm[name], `missing exposed: ${name}`).toBeDefined()
    })
    expect(wrapper.vm.getDisplaySurface()).toBe(
      wrapper.find('canvas').element
    )
    wrapper.unmount()
  })

  it('starts the rVFC loop on loadedmetadata and paints + emits per tick while playing', async () => {
    const wrapper = mountViewer()
    // Wait for the setTimeout(0) in onMounted to complete
    await new Promise(resolve => setTimeout(resolve))
    const video = wrapper.find('video').element
    await video.dispatchEvent(new Event('loadedmetadata'))
    expect(rvfcCallbacks.length).toBeGreaterThan(0)
    // Emissions are playback-only; jsdom videos are paused by default.
    Object.defineProperty(video, 'paused', {
      value: false,
      configurable: true
    })

    // Fire a tick: frame 10 at 25fps starts at mediaTime 0.4.
    const tick = rvfcCallbacks[rvfcCallbacks.length - 1]
    tick(performance.now(), { mediaTime: 0.4 })
    expect(fakeContext.drawImage).toHaveBeenCalled()
    const timeUpdates = wrapper.emitted('time-update')
    const frameUpdates = wrapper.emitted('frame-update')
    expect(timeUpdates.length).toBeGreaterThan(0)
    // mediaTime re-centered to the mid-frame convention: 0.4 + 0.02.
    expect(timeUpdates.at(-1)[0]).toBeCloseTo(0.42, 5)
    expect(frameUpdates.length).toBeGreaterThan(0)
    // Same number the currentTime-based formula produced for this frame.
    expect(frameUpdates.at(-1)[0]).toBe(12)

    // A second tick on the SAME frame must not re-emit frame-update.
    const frameCount = frameUpdates.length
    const tick2 = rvfcCallbacks[rvfcCallbacks.length - 1]
    tick2(performance.now(), { mediaTime: 0.4 })
    expect(wrapper.emitted('frame-update').length).toBe(frameCount)
    wrapper.unmount()
  })

  // 10 minutes in at 30 fps: frame 18000, plus the 2 of the playback
  // convention. The frame duration rounded to 0.0333 drifted it to 18020.
  it('numbers a playing frame on the exact frame rate', async () => {
    const wrapper = mountViewer({ fps: 30, nbFrames: 36000 })
    await new Promise(resolve => setTimeout(resolve))
    const video = wrapper.find('video').element
    await video.dispatchEvent(new Event('loadedmetadata'))
    Object.defineProperty(video, 'paused', {
      value: false,
      configurable: true
    })

    const tick = rvfcCallbacks[rvfcCallbacks.length - 1]
    tick(performance.now(), { mediaTime: 18000 / 30 })

    expect(wrapper.emitted('frame-update').at(-1)[0]).toBe(18002)
    expect(wrapper.emitted('time-update').at(-1)[0]).toBeCloseTo(
      18000.5 / 30,
      6
    )
    wrapper.unmount()
  })

  it('paints but does not emit frames on paused seeks', async () => {
    // Regression: paused frame context is owned by the parent (prop-frame
    // convention). A paused seek emitting playback-convention numbers fed
    // setVideoFrameContext values shifted from the clicked frame, so
    // progress clicks and arrow steps landed on the wrong frame.
    const wrapper = mountViewer()
    await new Promise(resolve => setTimeout(resolve))
    const video = wrapper.find('video').element
    await video.dispatchEvent(new Event('loadedmetadata'))
    // jsdom videos are paused by default.
    const tick = rvfcCallbacks[rvfcCallbacks.length - 1]
    tick(performance.now(), { mediaTime: 0.4 })
    expect(fakeContext.drawImage).toHaveBeenCalled()
    expect(wrapper.emitted('frame-update')).toBeUndefined()
    expect(wrapper.emitted('time-update')).toBeUndefined()
    wrapper.unmount()
  })

  it('keeps the canvas visible when a stalled movie still has enough data', async () => {
    // WebKit fires 'stalled' on a paused movie once its prefetch stops, with
    // readyState still 4. No canplay follows, so the canvas stayed hidden
    // behind the spinner and every arrow step was invisible.
    const wrapper = mountViewer()
    await new Promise(resolve => setTimeout(resolve))
    const video = wrapper.find('video').element
    await video.dispatchEvent(new Event('loadedmetadata'))
    Object.defineProperty(video, 'readyState', {
      value: HTMLMediaElement.HAVE_ENOUGH_DATA,
      configurable: true
    })
    await video.dispatchEvent(new Event('stalled'))
    expect(wrapper.find('canvas').element.style.display).not.toBe('none')
    wrapper.unmount()
  })

  it('shows the loader over the last frame when a stalled movie lacks data', async () => {
    // The loader background is translucent: hiding the canvas turned every
    // buffering hiccup into a black screen instead of a dimmed last frame.
    const wrapper = mountViewer()
    await new Promise(resolve => setTimeout(resolve))
    const video = wrapper.find('video').element
    await video.dispatchEvent(new Event('loadedmetadata'))
    Object.defineProperty(video, 'readyState', {
      value: HTMLMediaElement.HAVE_CURRENT_DATA,
      configurable: true
    })
    await video.dispatchEvent(new Event('stalled'))
    expect(wrapper.find('.loading-background').exists()).toBe(true)
    expect(wrapper.find('canvas').element.style.display).not.toBe('none')
    wrapper.unmount()
  })

  describe('scrub seeks', () => {
    const mountSeekableViewer = async () => {
      const wrapper = mountViewer()
      await new Promise(resolve => setTimeout(resolve))
      const video = wrapper.find('video').element
      await video.dispatchEvent(new Event('loadedmetadata'))
      Object.defineProperty(video, 'currentTime', {
        value: 0,
        writable: true,
        configurable: true
      })
      Object.defineProperty(video, 'seeking', {
        value: true,
        writable: true,
        configurable: true
      })
      return { wrapper, video }
    }

    it('holds the latest target while a seek is in flight', async () => {
      // A seek per mousemove aborts the in-flight one, so no frame lands
      // until the cursor stops. Waiting for 'seeked' lets frames show.
      const { wrapper, video } = await mountSeekableViewer()
      wrapper.vm.setCurrentFrame(10)
      wrapper.vm.setCurrentFrame(20)
      expect(video.currentTime).toBe(0)
      video.seeking = false
      video.dispatchEvent(new Event('seeked'))
      expect(video.currentTime).toBe(20.5 / 25)
      wrapper.unmount()
    })

    it('drops a held target when a frame step seeks directly', async () => {
      const { wrapper, video } = await mountSeekableViewer()
      wrapper.vm.setCurrentFrame(20)
      await wrapper.setProps({ currentFrame: 4 })
      wrapper.vm.goNextFrame()
      video.seeking = false
      video.dispatchEvent(new Event('seeked'))
      expect(video.currentTime).toBe(5.5 / 25)
      wrapper.unmount()
    })
  })

  it('emits video-loaded when the metadata was already there at mount', async () => {
    // Cached movie: loadedmetadata fires before the deferred listeners are
    // attached, with readyState between HAVE_METADATA and HAVE_FUTURE_DATA.
    // Only the HAVE_ENOUGH_DATA case was rescued: the canvas stayed black.
    const wrapper = mountViewer()
    const video = wrapper.find('video').element
    Object.defineProperty(video, 'readyState', {
      value: HTMLMediaElement.HAVE_METADATA,
      configurable: true
    })
    video.dispatchEvent(new Event('loadedmetadata'))
    await new Promise(resolve => setTimeout(resolve))
    expect(wrapper.emitted('video-loaded')).toHaveLength(1)
    wrapper.unmount()
  })

  // A missing file or a file that is no movie: the decoder fails and keeps
  // its error, and a play on it never starts.
  describe('a movie that cannot be read', () => {
    const failMovie = async wrapper => {
      await new Promise(resolve => setTimeout(resolve))
      const video = wrapper.find('video').element
      await video.dispatchEvent(new Event('loadstart'))
      await video.dispatchEvent(new Event('error'))
    }

    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('says the movie is broken, without its spinner', async () => {
      const wrapper = mountViewer()
      await failMovie(wrapper)

      expect(wrapper.find('.broken').text()).toBe('preview.broken')
      expect(wrapper.find('.loading-background').exists()).toBe(false)
      expect(wrapper.find('canvas').element.style.visibility).toBe('hidden')
      expect(wrapper.emitted('play-failed')).toBeUndefined()
      expect(console.error).toHaveBeenCalledWith(
        'An error occurred while loading a video',
        expect.any(Event)
      )
      wrapper.unmount()
    })

    // The entity preview reads it through its template ref.
    it('tells a parent holding its ref that the movie is broken', async () => {
      const store = createStore({
        getters: { currentProduction: () => ({ fps: '25' }) }
      })
      const parent = mount(
        {
          components: { VideoViewer },
          template:
            '<video-viewer ref="viewer" :preview="preview" :fps="25" :nb-frames="100" />',
          data: () => ({ preview: { id: 'preview-1', extension: 'mp4' } })
        },
        { global: { mocks: { $t: key => key }, plugins: [store] } }
      )
      expect(parent.vm.$refs.viewer.isBroken).toBe(false)

      await failMovie(parent)

      expect(parent.vm.$refs.viewer.isBroken).toBe(true)
      parent.unmount()
    })

    it('fails a play on it', async () => {
      const wrapper = mountViewer()
      await failMovie(wrapper)

      wrapper.vm.play()

      expect(wrapper.emitted('play-failed')).toHaveLength(1)
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    // Chrome pauses the decoder before its own error listener runs.
    it('fails the play under way', async () => {
      const wrapper = mountViewer()
      wrapper.vm.play()
      await failMovie(wrapper)

      expect(wrapper.emitted('play-failed')).toHaveLength(1)
      wrapper.unmount()
    })

    it('fails no play after a pause', async () => {
      const wrapper = mountViewer()
      wrapper.vm.play()
      wrapper.vm.pause()
      await failMovie(wrapper)

      expect(wrapper.emitted('play-failed')).toBeUndefined()
      wrapper.unmount()
    })

    it('reads the movie of the next preview', async () => {
      const wrapper = mountViewer()
      await failMovie(wrapper)

      await wrapper.setProps({ preview: { id: 'preview-2', extension: 'mp4' } })
      wrapper.vm.play()

      expect(wrapper.find('.broken').exists()).toBe(false)
      expect(wrapper.find('canvas').element.style.visibility).toBe('')
      expect(wrapper.emitted('play-failed')).toBeUndefined()
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('without rVFC (rAF fallback)', () => {
    let rafCallbacks

    beforeEach(() => {
      removeRvfcMock()
      rafCallbacks = []
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        rafCallbacks.push(cb)
        return rafCallbacks.length
      })
      vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    })

    it('shows the loader on waiting once a playing raw seek has landed', async () => {
      // The seek guard armed by a raw seek during playback was never
      // released on this path: every later 'waiting' was ignored and a
      // buffering movie froze on the canvas without a spinner.
      const wrapper = mountViewer()
      await new Promise(resolve => setTimeout(resolve))
      const video = wrapper.find('video').element
      await video.dispatchEvent(new Event('loadedmetadata'))
      Object.defineProperty(video, 'paused', {
        value: false,
        configurable: true
      })
      wrapper.vm.setCurrentTimeRaw(2)
      // The seek landed: seeking is false and a new frame is painted.
      rafCallbacks.at(-1)()
      await video.dispatchEvent(new Event('waiting'))
      expect(wrapper.find('.loading-background').exists()).toBe(true)
      wrapper.unmount()
    })
  })

  it('cancels the rVFC loop and disposes the renderer on unmount', async () => {
    const wrapper = mountViewer()
    // Wait for the setTimeout(0) in onMounted to complete
    await new Promise(resolve => setTimeout(resolve))
    const video = wrapper.find('video').element
    await video.dispatchEvent(new Event('loadedmetadata'))
    wrapper.unmount()
    // The handle cancelled must be the most recently scheduled one.
    expect(rvfcCancelled).toContain(rvfcCallbacks.length)
  })
})
