import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import MultiVideoViewer from '@/components/players/viewers/MultiVideoViewer.vue'

// jsdom has no 2d context nor rVFC: both are stubbed here.
const fakeContext = { drawImage: vi.fn() }

// Collects rVFC callbacks per video so tests can fire ticks manually.
let rvfcCallbacks
let rvfcCancelled

const installRvfcMock = () => {
  rvfcCallbacks = []
  rvfcCancelled = []
  HTMLVideoElement.prototype.requestVideoFrameCallback = function (cb) {
    rvfcCallbacks.push({ video: this, cb })
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
  return mount(MultiVideoViewer, {
    props: {
      entities: [
        { id: 'e1', preview_file_id: 'p1', preview_file_extension: 'mp4', fps: 25 },
        { id: 'e2', preview_file_id: 'p2', preview_file_extension: 'mp4', fps: 25 }
      ],
      name: 'main'
    },
    global: {
      mocks: { $t: key => key },
      plugins: [store]
    }
  })
}

describe('players/MultiVideoViewer (canvas pipeline)', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeContext
    )
    fakeContext.drawImage.mockClear()
    HTMLMediaElement.prototype.load = vi.fn()
    installRvfcMock()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    removeRvfcMock()
    delete HTMLMediaElement.prototype.load
  })

  it('renders one visible canvas and two hidden decoder videos', () => {
    const wrapper = mountViewer()
    const canvas = wrapper.find('canvas.playlist-movie')
    const videos = wrapper.findAll('video.playlist-movie-decoder')
    expect(canvas.exists()).toBe(true)
    expect(videos.length).toBe(2)
    wrapper.unmount()
  })

  it('keeps the full exposed surface plus getDisplaySurface', () => {
    const wrapper = mountViewer()
    const exposed = [
      'currentIndex',
      'currentPlayer',
      'isPlaying',
      'loadEntity',
      'loadNextEntity',
      'reloadCurrentEntity',
      'pause',
      'play',
      'playNext',
      'getCurrentFrame',
      'getCurrentTime',
      'getCurrentTimeRaw',
      'goNextFrame',
      'goPreviousFrame',
      'setCurrentFrame',
      'setCurrentTimeRaw',
      'setSpeed',
      'setVolume',
      'getNaturalDimensions',
      'getVideoRatio',
      'clear',
      'resetHeight',
      'pausePanZoom',
      'resetPanZoom',
      'resumePanZoom',
      'setPanZoom',
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

  it('paints from the active player and re-arms the loop on switch', async () => {
    const wrapper = mountViewer()
    wrapper.vm.loadEntity(0)
    await wrapper.vm.$nextTick()

    // Fire the latest rVFC tick for the current active player
    const firstCallCount = rvfcCallbacks.length
    expect(firstCallCount).toBeGreaterThan(0)

    const { cb: tick1 } = rvfcCallbacks[firstCallCount - 1]
    tick1()
    expect(fakeContext.drawImage).toHaveBeenCalled()

    fakeContext.drawImage.mockClear()

    // Load entity 1 — re-arms on a new registration
    wrapper.vm.loadEntity(1)
    await wrapper.vm.$nextTick()

    // A NEW rVFC registration should have happened
    expect(rvfcCallbacks.length).toBeGreaterThan(firstCallCount)

    // Firing the stale old tick must NOT paint (stale-player guard)
    const staleCount = rvfcCallbacks.length
    tick1()
    expect(fakeContext.drawImage).not.toHaveBeenCalled()

    // Firing the new tick DOES paint
    const { cb: tick2 } = rvfcCallbacks[staleCount - 1]
    tick2()
    expect(fakeContext.drawImage).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('does not emit frame-update from ticks while paused', async () => {
    const wrapper = mountViewer()
    wrapper.vm.loadEntity(0)
    await wrapper.vm.$nextTick()

    expect(rvfcCallbacks.length).toBeGreaterThan(0)
    const countBefore = (wrapper.emitted('frame-update') || []).length

    const { cb: tick } = rvfcCallbacks[rvfcCallbacks.length - 1]
    tick()

    const countAfter = (wrapper.emitted('frame-update') || []).length
    expect(countAfter).toBe(countBefore)

    wrapper.unmount()
  })
})
