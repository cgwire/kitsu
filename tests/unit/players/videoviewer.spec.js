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

const mountViewer = () => {
  const store = createStore({
    getters: { currentProduction: () => ({ fps: '25' }) }
  })
  return mount(VideoViewer, {
    props: {
      preview: { id: 'preview-1', extension: 'mp4' },
      fps: 25,
      nbFrames: 100
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

  it('starts the rVFC loop on loadedmetadata and paints + emits per tick', async () => {
    const wrapper = mountViewer()
    // Wait for the setTimeout(0) in onMounted to complete
    await new Promise(resolve => setTimeout(resolve))
    const video = wrapper.find('video').element
    await video.dispatchEvent(new Event('loadedmetadata'))
    expect(rvfcCallbacks.length).toBeGreaterThan(0)

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
