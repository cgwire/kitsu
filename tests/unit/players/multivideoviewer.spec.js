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

const mountViewer = (props = {}) => {
  const store = createStore({
    getters: { currentProduction: () => ({ fps: '25' }) }
  })
  return mount(MultiVideoViewer, {
    props: {
      entities: [
        { id: 'e1', preview_file_id: 'p1', preview_file_extension: 'mp4', fps: 25 },
        { id: 'e2', preview_file_id: 'p2', preview_file_extension: 'mp4', fps: 25 }
      ],
      name: 'main',
      ...props
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

  it('loads the video sub-element of a picture-main revision (#2095)', async () => {
    const store = createStore({
      getters: { currentProduction: () => ({ fps: '25' }) }
    })
    const wrapper = mount(MultiVideoViewer, {
      props: {
        currentPreviewIndex: 0,
        entities: [
          {
            id: 'e1',
            preview_file_id: 'p1',
            preview_file_extension: 'png',
            preview_file_previews: [{ id: 'p1b', extension: 'mp4' }],
            fps: 25
          }
        ],
        name: 'main'
      },
      global: {
        mocks: { $t: key => key },
        plugins: [store]
      }
    })

    // Main preview is a picture: no movie source (jsdom resolves an empty
    // src to the document base URL, hence the negative assertion)
    wrapper.vm.loadEntity(0)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.currentPlayer.src).not.toContain('.mp4')

    // Switching to the video sub-element must load its movie path
    await wrapper.setProps({ currentPreviewIndex: 1 })
    expect(wrapper.vm.currentPlayer.src).toContain(
      '/movies/low/preview-files/p1b.mp4'
    )

    wrapper.unmount()
  })

  it('pre-seeks the preloaded decoder to the next entity handle-in (#1019)', async () => {
    const wrapper = mountViewer({ nextHandleIn: 100 })

    wrapper.vm.loadEntity(0)
    await wrapper.vm.$nextTick()

    const current = wrapper.vm.currentPlayer
    const next = wrapper
      .findAll('video.playlist-movie-decoder')
      .map(w => w.element)
      .find(el => el !== current)

    // The decoder preloading e2 must already be parked on its handle-in
    // frame so the slate at frame 0 never flashes when players switch
    expect(next.src).toContain('/movies/low/preview-files/p2.mp4')
    expect(next.currentTime).toBeCloseTo(100 / 25)

    // A handle change on the next entity re-parks the decoder
    await wrapper.setProps({ nextHandleIn: 50 })
    expect(next.currentTime).toBeCloseTo(50 / 25)

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

  describe('scrub seeks', () => {
    const mountSeekingViewer = async () => {
      const wrapper = mountViewer()
      wrapper.vm.loadEntity(0)
      await wrapper.vm.$nextTick()
      const player = wrapper.vm.currentPlayer
      Object.defineProperty(player, 'currentTime', {
        value: 0,
        writable: true,
        configurable: true
      })
      Object.defineProperty(player, 'duration', {
        value: 10,
        configurable: true
      })
      Object.defineProperty(player, 'seeking', {
        value: true,
        writable: true,
        configurable: true
      })
      return { wrapper, player }
    }

    it('holds the latest target while a seek is in flight', async () => {
      // A seek per mousemove aborts the in-flight one, so no frame lands
      // until the cursor stops. Waiting for 'seeked' lets frames show.
      const { wrapper, player } = await mountSeekingViewer()
      wrapper.vm.setCurrentFrame(10)
      wrapper.vm.setCurrentFrame(20)
      expect(player.currentTime).toBe(0)
      expect(wrapper.emitted('frame-update').at(-1)).toEqual([20])
      player.seeking = false
      player.dispatchEvent(new Event('seeked'))
      expect(player.currentTime).toBeCloseTo(20 / 25 + 0.001)
      wrapper.unmount()
    })

    it('reports the held target as the current time', async () => {
      // The comparison player syncs on getCurrentTimeRaw().
      const { wrapper } = await mountSeekingViewer()
      wrapper.vm.setCurrentFrame(20)
      expect(wrapper.vm.getCurrentTimeRaw()).toBeCloseTo(20 / 25 + 0.001)
      wrapper.unmount()
    })

    it('pauses on the held target and drops it', async () => {
      const { wrapper, player } = await mountSeekingViewer()
      wrapper.vm.setCurrentFrame(20)
      wrapper.vm.pause()
      expect(player.currentTime).toBeCloseTo(20 / 25)
      player.currentTime = 0.4
      player.seeking = false
      player.dispatchEvent(new Event('seeked'))
      expect(player.currentTime).toBe(0.4)
      wrapper.unmount()
    })
  })
})
