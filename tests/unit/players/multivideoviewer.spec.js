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
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
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
      'panBy',
      'zoomAt',
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

  // A closed viewer keeps its decoders loading: their metadata restarted the
  // render loop, which never stops on a detached video without rVFC.
  it('starts no render loop for the metadata of a closed viewer', async () => {
    const wrapper = mountViewer()
    wrapper.vm.loadEntity(0)
    await wrapper.vm.$nextTick()
    const decoder = wrapper.find('video.playlist-movie-decoder').element
    wrapper.unmount()
    const registered = rvfcCallbacks.length

    decoder.dispatchEvent(new Event('loadedmetadata'))

    expect(rvfcCallbacks.length).toBe(registered)
  })

  // A closed comparison empties its viewer: decoders left with their movies
  // went on downloading them, or playing one, hidden.
  it('releases its movies when its entities go', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    const wrapper = mountViewer()
    wrapper.vm.loadEntity(0)
    await wrapper.vm.$nextTick()
    const player = wrapper.vm.currentPlayer
    wrapper.vm.play()
    HTMLMediaElement.prototype.pause.mockClear()

    await wrapper.setProps({ entities: [] })

    wrapper.findAll('video.playlist-movie-decoder').forEach(({ element }) => {
      expect(element.hasAttribute('src')).toBe(false)
      expect(HTMLMediaElement.prototype.load.mock.contexts).toContain(element)
    })
    expect(HTMLMediaElement.prototype.pause.mock.contexts).toContain(player)
    expect(wrapper.vm.isPlaying).toBe(false)
    expect(rvfcCancelled).toHaveLength(1)
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
      // The load already paused the preloading decoder.
      player.pause.mockClear()
      wrapper.vm.pause()
      expect(player.pause).toHaveBeenCalledOnce()
      expect(player.pause.mock.contexts[0]).toBe(player)
      expect(player.currentTime).toBeCloseTo(20 / 25)
      player.currentTime = 0.4
      player.seeking = false
      player.dispatchEvent(new Event('seeked'))
      expect(player.currentTime).toBe(0.4)
      wrapper.unmount()
    })
  })

  it('holds a raw seek issued while the decoder is still seeking', async () => {
    // The comparison viewer is re-synced through setCurrentTimeRaw on every
    // scrub move: each direct seek aborted the in-flight one, so its frame
    // only landed once the cursor stopped.
    const wrapper = mountViewer()
    wrapper.vm.loadEntity(0)
    await wrapper.vm.$nextTick()
    const player = wrapper.vm.currentPlayer
    player.currentTime = 1
    Object.defineProperty(player, 'seeking', {
      value: true,
      configurable: true
    })
    wrapper.vm.setCurrentTimeRaw(2)
    expect(player.currentTime).toBe(1)
    Object.defineProperty(player, 'seeking', {
      value: false,
      configurable: true
    })
    player.dispatchEvent(new Event('seeked'))
    expect(player.currentTime).toBe(2)
    wrapper.unmount()
  })

  it('loops on the handle-in frame with the seek nudge, not on its boundary', async () => {
    // 120 * 0.0333 (rounded frame duration) is 3.996 s, frame 119.88 at
    // 30 fps: the loop restarted one frame before the handle-in. An exact
    // boundary can also truncate to the previous frame.
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    const wrapper = mountViewer({
      entities: [
        { id: 'e1', preview_file_id: 'p1', preview_file_extension: 'mp4', fps: 30 }
      ],
      handleIn: 120,
      handleOut: 200,
      isRepeating: true
    })
    wrapper.vm.loadEntity(0)
    await wrapper.vm.$nextTick()
    wrapper.vm.play()
    const player = wrapper.vm.currentPlayer
    const { cb: tick } = rvfcCallbacks.at(-1)
    tick(performance.now(), { mediaTime: 200 / 30 })
    expect(player.currentTime).toBeCloseTo(120 / 30 + 0.001, 6)
    expect(wrapper.emitted('repeat')).toHaveLength(1)
    wrapper.unmount()
  })

  describe('end of a movie', () => {
    const mountLoaded = async () => {
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
      const wrapper = mountViewer()
      wrapper.vm.loadEntity(0)
      await wrapper.vm.$nextTick()
      return { wrapper, player: wrapper.vm.currentPlayer }
    }

    it('plays the next entry when the playback ends', async () => {
      const { wrapper, player } = await mountLoaded()
      wrapper.vm.play()

      player.dispatchEvent(new Event('ended'))

      expect(wrapper.emitted('play-next')).toHaveLength(1)
      wrapper.unmount()
    })

    // A seek can land a paused movie on its very end, and the browser then
    // fires ended: the playlist started the next entry.
    it('stays on a paused movie that ends', async () => {
      const { wrapper, player } = await mountLoaded()

      player.dispatchEvent(new Event('ended'))

      expect(wrapper.emitted('play-next')).toBeUndefined()
      wrapper.unmount()
    })

    // The playlist moves to a 3D model while its movie plays. The movie
    // comes next again, so its decoder stays loaded: it played on, hidden,
    // and its end moved the playlist away from the model.
    it('stops the movie when the playlist moves to an entity without one', async () => {
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
      const wrapper = mountViewer({
        entities: [
          { id: 'e1', preview_file_id: 'p1', preview_file_extension: 'mp4', fps: 25 },
          { id: 'e2', preview_file_id: 'p2', preview_file_extension: 'glb', fps: 25 }
        ]
      })
      // Back from the model, the movie plays in the decoder that preloaded it.
      wrapper.vm.loadEntity(1, 0, true)
      wrapper.vm.loadEntity(0)
      await wrapper.vm.$nextTick()
      const player = wrapper.vm.currentPlayer
      wrapper.vm.play()

      wrapper.vm.loadEntity(1, 0, true)
      player.dispatchEvent(new Event('ended'))

      expect(HTMLMediaElement.prototype.pause.mock.contexts).toContain(player)
      expect(wrapper.emitted('play-next')).toBeUndefined()
      wrapper.unmount()
    })

    // In a playlist of two movies, the one after the next is the one left:
    // its decoder preloaded it again and played on, hidden, until its end
    // cut the next movie short.
    it('stops the movie it leaves for another one', async () => {
      const { wrapper, player } = await mountLoaded()
      wrapper.vm.play()

      wrapper.vm.loadEntity(1)

      expect(HTMLMediaElement.prototype.pause.mock.contexts).toContain(player)
      wrapper.unmount()
    })

    // With a single movie in the playlist, both decoders hold it. A reload,
    // on an element change, took the idle one and left the other playing.
    it('reloads a movie in the decoder that plays it', async () => {
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
      const wrapper = mountViewer({
        entities: [
          { id: 'e1', preview_file_id: 'p1', preview_file_extension: 'mp4', fps: 25 },
          { id: 'e2', preview_file_id: 'p2', preview_file_extension: 'png', fps: 25 }
        ]
      })
      wrapper.vm.loadEntity(1, 0, true)
      wrapper.vm.loadEntity(0)
      await wrapper.vm.$nextTick()
      const player = wrapper.vm.currentPlayer
      wrapper.vm.play()

      wrapper.vm.reloadCurrentEntity(true)

      expect(wrapper.vm.currentPlayer).toBe(player)
      wrapper.unmount()
    })
  })

  // A missing file or a file that is no movie fails on its decoder, which
  // keeps the error, and never ends.
  describe('movie that cannot be read', () => {
    const fail = player => {
      Object.defineProperty(player, 'error', {
        configurable: true,
        value: { code: 4 }
      })
      player.dispatchEvent(new Event('error'))
    }

    const mountLoaded = async (props = {}) => {
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
      const wrapper = mountViewer(props)
      wrapper.vm.loadEntity(0)
      await wrapper.vm.$nextTick()
      const player = wrapper.vm.currentPlayer
      const otherPlayer = wrapper
        .findAll('video')
        .map(({ element }) => element)
        .find(element => element !== player)
      return { wrapper, player, otherPlayer }
    }

    const isShownBroken = wrapper =>
      wrapper.find('.broken').exists() &&
      wrapper.find('canvas').element.style.visibility === 'hidden'

    it('says the movie is broken, without its spinner', async () => {
      const { wrapper, player } = await mountLoaded()

      fail(player)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.broken').text()).toBe('preview.broken')
      expect(isShownBroken(wrapper)).toBe(true)
      expect(wrapper.find('.video-loader').isVisible()).toBe(false)
      expect(wrapper.emitted('play-failed')).toBeUndefined()
      wrapper.unmount()
    })

    // The other decoder starts preloading the next movie: the spinner came
    // over the label.
    it('keeps the spinner off while the next movie loads', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const { wrapper, player, otherPlayer } = await mountLoaded()
      fail(player)

      otherPlayer.dispatchEvent(new Event('loadstart'))
      vi.advanceTimersByTime(200)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.video-loader').isVisible()).toBe(false)
      vi.useRealTimers()
      wrapper.unmount()
    })

    it('tells that a play on it failed', async () => {
      const { wrapper, player } = await mountLoaded()
      fail(player)

      wrapper.vm.play()

      expect(wrapper.emitted('play-failed')).toHaveLength(1)
      expect(wrapper.vm.isPlaying).toBe(true)
      wrapper.unmount()
    })

    it('tells that the movie it plays failed', async () => {
      const { wrapper, player } = await mountLoaded()
      wrapper.vm.play()

      fail(player)

      expect(wrapper.emitted('play-failed')).toHaveLength(1)
      wrapper.unmount()
    })

    it('leaves the movie on screen when the next one fails to preload', async () => {
      const { wrapper, otherPlayer } = await mountLoaded()
      wrapper.vm.play()

      fail(otherPlayer)
      await wrapper.vm.$nextTick()

      expect(isShownBroken(wrapper)).toBe(false)
      expect(wrapper.emitted('play-failed')).toBeUndefined()
      wrapper.unmount()
    })

    it('tells that the preloaded movie playback reaches failed', async () => {
      const { wrapper, otherPlayer } = await mountLoaded()
      fail(otherPlayer)
      wrapper.vm.play()

      wrapper.vm.playNext()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentIndex).toBe(1)
      expect(isShownBroken(wrapper)).toBe(true)
      expect(wrapper.emitted('play-failed')).toHaveLength(1)
      wrapper.unmount()
    })

    it('shows the preloaded movie a click reaches as broken', async () => {
      const { wrapper, player, otherPlayer } = await mountLoaded()
      fail(otherPlayer)

      wrapper.vm.loadEntity(1)
      await wrapper.vm.$nextTick()
      expect(isShownBroken(wrapper)).toBe(true)

      wrapper.vm.loadEntity(0)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentPlayer).toBe(player)
      expect(isShownBroken(wrapper)).toBe(false)
      wrapper.unmount()
    })

    // An entity without a movie empties the source of its decoder, which
    // fails in a browser.
    it('sees no broken movie on an entity without one', async () => {
      const { wrapper } = await mountLoaded({
        entities: [
          { id: 'e1', preview_file_id: 'p1', preview_file_extension: 'png', fps: 25 },
          { id: 'e2', preview_file_id: 'p2', preview_file_extension: 'mp4', fps: 25 }
        ]
      })

      fail(wrapper.vm.currentPlayer)
      wrapper.vm.play()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.broken').exists()).toBe(false)
      expect(wrapper.emitted('play-failed')).toBeUndefined()
      wrapper.unmount()
    })
  })

  // Zou answers 404 for the movie of a preview file until a job has built
  // its files.
  describe('movie still processed', () => {
    const fail = player => {
      Object.defineProperty(player, 'error', {
        configurable: true,
        value: { code: 4 }
      })
      player.dispatchEvent(new Event('error'))
    }

    // The statuses the socket keeps, as the previews store module does.
    const mountWithStatuses = async (statuses = {}, props = {}) => {
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
      const store = createStore({
        state: { previewFileStatusMap: new Map(Object.entries(statuses)) },
        getters: {
          currentProduction: () => ({ fps: '25' }),
          previewFileStatusMap: state => state.previewFileStatusMap
        },
        mutations: {
          SET_PREVIEW_FILE_STATUS(state, { previewFileId, status }) {
            state.previewFileStatusMap.set(previewFileId, status)
          },
          FORGET_PREVIEW_FILE_STATUSES(state, previewFileIds) {
            previewFileIds.forEach(id => state.previewFileStatusMap.delete(id))
          }
        }
      })
      const wrapper = mount(MultiVideoViewer, {
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
      wrapper.vm.loadEntity(0)
      await wrapper.vm.$nextTick()
      const player = wrapper.vm.currentPlayer
      const otherPlayer = wrapper
        .findAll('video')
        .map(({ element }) => element)
        .find(element => element !== player)
      return { wrapper, store, player, otherPlayer }
    }

    const isShownProcessing = wrapper =>
      wrapper.find('.processing').exists() &&
      !wrapper.find('.broken').exists() &&
      wrapper.find('canvas').element.style.visibility === 'hidden'

    it('says a movie of the registry is being processed', async () => {
      const { wrapper, player } = await mountWithStatuses({ p1: 'processing' })

      fail(player)
      await wrapper.vm.$nextTick()

      expect(isShownProcessing(wrapper)).toBe(true)
      expect(wrapper.find('.processing').text()).toBe('preview.processing')
      const spinner = wrapper
        .findAllComponents({ name: 'Spinner' })
        .find(component => component.props('isProcessing'))
      expect(spinner?.isVisible()).toBe(true)
      expect(wrapper.find('.video-loader').isVisible()).toBe(false)
      wrapper.unmount()
    })

    // The shared playlist has no socket: its payload alone tells.
    it('reads the status the entity carries', async () => {
      const { wrapper, player } = await mountWithStatuses(
        {},
        {
          entities: [
            {
              id: 'e1',
              preview_file_id: 'p1',
              preview_file_extension: 'mp4',
              preview_file_status: 'processing',
              fps: 25
            }
          ]
        }
      )

      fail(player)
      await wrapper.vm.$nextTick()

      expect(isShownProcessing(wrapper)).toBe(true)
      wrapper.unmount()
    })

    it('reads the status of the other movie of a revision', async () => {
      const { wrapper, player } = await mountWithStatuses(
        {},
        {
          currentPreviewIndex: 1,
          entities: [
            {
              id: 'e1',
              preview_file_id: 'p1',
              preview_file_extension: 'mp4',
              preview_file_previews: [
                { id: 'p1b', extension: 'mp4', status: 'processing' }
              ],
              fps: 25
            }
          ]
        }
      )
      expect(player.getAttribute('src')).toContain('p1b')

      fail(player)
      await wrapper.vm.$nextTick()

      expect(isShownProcessing(wrapper)).toBe(true)
      wrapper.unmount()
    })

    it('holds its slot like a movie that cannot be read', async () => {
      const { wrapper, player } = await mountWithStatuses({ p1: 'processing' })
      fail(player)

      wrapper.vm.play()

      expect(wrapper.emitted('play-failed')).toHaveLength(1)
      expect(wrapper.vm.isBroken).toBe(true)
      wrapper.unmount()
    })

    it('says a movie whose processing failed is broken', async () => {
      const { wrapper, player } = await mountWithStatuses({ p1: 'broken' })

      fail(player)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.broken').text()).toBe('preview.broken')
      expect(wrapper.find('.processing').exists()).toBe(false)
      wrapper.unmount()
    })

    it('shows a processing movie that loads', async () => {
      const { wrapper } = await mountWithStatuses({ p1: 'processing' })

      expect(wrapper.find('.processing').exists()).toBe(false)
      expect(wrapper.find('canvas').element.style.visibility).toBe('')
      wrapper.unmount()
    })

    // The decoder keeps the 404 it got: load() asks for the movie again and,
    // as in a browser, drops the error.
    describe('once processed', () => {
      beforeEach(() => {
        HTMLMediaElement.prototype.load = vi.fn(function () {
          delete this.error
        })
      })

      const loadedPlayers = () => HTMLMediaElement.prototype.load.mock.contexts

      const setReady = (store, previewFileId) =>
        store.commit('SET_PREVIEW_FILE_STATUS', {
          previewFileId,
          status: 'ready'
        })

      it('loads the movie shown again', async () => {
        const { wrapper, store, player } = await mountWithStatuses({
          p1: 'processing'
        })
        fail(player)
        await wrapper.vm.$nextTick()

        setReady(store, 'p1')
        await wrapper.vm.$nextTick()

        expect(loadedPlayers()).toEqual([player])
        expect(wrapper.find('.processing').exists()).toBe(false)
        expect(wrapper.find('.broken').exists()).toBe(false)
        expect(wrapper.find('canvas').element.style.visibility).toBe('')
        wrapper.unmount()
      })

      it('loads the movie preloaded next again', async () => {
        const { wrapper, store, otherPlayer } = await mountWithStatuses({
          p2: 'processing'
        })
        fail(otherPlayer)

        setReady(store, 'p2')
        await wrapper.vm.$nextTick()

        expect(loadedPlayers()).toEqual([otherPlayer])
        wrapper.unmount()
      })

      // A movie that starts loading ends the slot the playlist holds for it.
      it('loads the movie whose slot is held once paused', async () => {
        const { wrapper, store, player } = await mountWithStatuses({
          p1: 'processing'
        })
        fail(player)
        wrapper.vm.play()

        setReady(store, 'p1')
        await wrapper.vm.$nextTick()
        expect(loadedPlayers()).toEqual([])
        expect(wrapper.find('.processing').exists()).toBe(true)

        wrapper.vm.pause()
        await wrapper.vm.$nextTick()
        expect(loadedPlayers()).toEqual([player])
        expect(wrapper.find('.processing').exists()).toBe(false)
        wrapper.unmount()
      })

      // Loading the movie again, as a browser does on load(), forgets that
      // it was processed.
      it('shows as broken a movie whose file still fails once processed', async () => {
        const { wrapper, store, player } = await mountWithStatuses({
          p1: 'processing'
        })
        fail(player)
        await wrapper.vm.$nextTick()

        setReady(store, 'p1')
        await wrapper.vm.$nextTick()
        player.dispatchEvent(new Event('loadstart'))
        fail(player)
        await wrapper.vm.$nextTick()

        expect(wrapper.find('.processing').exists()).toBe(false)
        expect(wrapper.find('.broken').exists()).toBe(true)
        wrapper.unmount()
      })

      // The store may never have heard that the movie was processing: the
      // socket still says when it is ready.
      it('loads again a failed movie the socket says is ready', async () => {
        const { wrapper, store, player } = await mountWithStatuses()
        fail(player)
        await wrapper.vm.$nextTick()

        setReady(store, 'p1')
        await wrapper.vm.$nextTick()

        expect(loadedPlayers()).toEqual([player])
        wrapper.unmount()
      })

      // A deleted preview leaves the store: nothing says it is ready.
      it('leaves a movie whose status is forgotten', async () => {
        const { wrapper, store, player } = await mountWithStatuses({
          p1: 'processing'
        })
        fail(player)
        await wrapper.vm.$nextTick()

        store.commit('FORGET_PREVIEW_FILE_STATUSES', ['p1'])
        await wrapper.vm.$nextTick()

        expect(loadedPlayers()).toEqual([])
        expect(wrapper.find('.broken').exists()).toBe(true)
        wrapper.unmount()
      })

      // A playlist of one movie preloads it on the other decoder too: the
      // reload of the preloading decoder leaves the one shown to reload.
      it('loads the movie shown on pause after the preloaded one', async () => {
        const { wrapper, store, player, otherPlayer } = await mountWithStatuses(
          { p1: 'processing' },
          {
            entities: [
              { id: 'e1', preview_file_id: 'p1', preview_file_extension: 'mp4', fps: 25 }
            ]
          }
        )
        fail(player)
        fail(otherPlayer)
        wrapper.vm.play()

        setReady(store, 'p1')
        await wrapper.vm.$nextTick()
        otherPlayer.dispatchEvent(new Event('loadstart'))
        wrapper.vm.pause()
        await wrapper.vm.$nextTick()

        expect(loadedPlayers()).toEqual([otherPlayer, player])
        wrapper.unmount()
      })

      it('leaves a movie that loaded in the meantime', async () => {
        const { wrapper, store, player } = await mountWithStatuses({
          p1: 'processing'
        })
        Object.defineProperty(player, 'readyState', {
          configurable: true,
          value: HTMLMediaElement.HAVE_ENOUGH_DATA
        })

        setReady(store, 'p1')
        await wrapper.vm.$nextTick()

        expect(loadedPlayers()).toEqual([])
        wrapper.unmount()
      })

      it('leaves a movie whose file fails once ready', async () => {
        const { wrapper, store, player } = await mountWithStatuses({
          p1: 'ready',
          p2: 'processing'
        })
        fail(player)

        setReady(store, 'p2')
        await wrapper.vm.$nextTick()

        expect(loadedPlayers()).not.toContain(player)
        expect(wrapper.find('.broken').exists()).toBe(true)
        wrapper.unmount()
      })

      // The shared playlist has no socket to hear of it.
      it('asks again for a movie still processed it comes back to', async () => {
        const { wrapper, player } = await mountWithStatuses(
          {},
          {
            entities: [
              {
                id: 'e1',
                preview_file_id: 'p1',
                preview_file_extension: 'mp4',
                preview_file_status: 'processing',
                fps: 25
              },
              { id: 'e2', preview_file_id: 'p2', preview_file_extension: 'mp4', fps: 25 }
            ]
          }
        )
        fail(player)
        wrapper.vm.loadEntity(1)

        wrapper.vm.loadEntity(0)
        await wrapper.vm.$nextTick()

        expect(loadedPlayers()).toEqual([player])
        expect(wrapper.vm.currentPlayer).toBe(player)
        expect(wrapper.find('.processing').exists()).toBe(false)
        expect(wrapper.find('canvas').element.style.visibility).toBe('')
        wrapper.unmount()
      })

      it('leaves a broken movie it comes back to', async () => {
        const { wrapper, player } = await mountWithStatuses({ p1: 'broken' })
        fail(player)
        wrapper.vm.loadEntity(1)

        wrapper.vm.loadEntity(0)
        await wrapper.vm.$nextTick()

        expect(loadedPlayers()).toEqual([])
        expect(wrapper.find('.broken').exists()).toBe(true)
        wrapper.unmount()
      })
    })
  })
})
