import { flushPromises, shallowMount } from '@vue/test-utils'
import process from 'node:process'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineAsyncComponent, h, markRaw, reactive, ref } from 'vue'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// The real one draws into a laid out container and fetches the movie.
const waveSurfer = vi.hoisted(() => ({
  create: vi.fn(() => ({
    destroy: vi.fn(),
    load: vi.fn(() => Promise.resolve()),
    on: vi.fn()
  }))
}))
vi.mock('wavesurfer.js', () => ({ default: waveSurfer }))

// Pre-load the real store to avoid a circular-import race from child components.
import '@/lib/auth'
import { useModal } from '@/composables/modal'
import clipboard from '@/lib/clipboard'

import PlaylistPlayer from '@/components/players/players/PlaylistPlayer.vue'

import { resetFullScreen, setFullScreenElement } from '../fixtures/full-screen'

const playlist = {
  id: 'playlist-1',
  build_jobs: [
    { id: 'job-1', status: 'succeeded', created_at: '2026-01-01T10:00:00' }
  ]
}

// A preview no viewer handles: the player offers the file instead.
const entity = {
  id: 'shot-1',
  preview_file_id: 'preview-1',
  preview_file_extension: 'blend'
}

// A shot with a preview for two task types: Layout sorts first, so it is
// the one compared, and it is a movie.
const comparedEntity = (id, extension = 'mp4') => ({
  id,
  preview_file_id: `${id}-anim`,
  preview_file_extension: extension,
  preview_files: {
    'tt-anim': [{ id: `${id}-anim`, revision: 1, extension }],
    'tt-layout': [{ id: `${id}-layout`, revision: 1, extension: 'mp4' }]
  }
})
const comparedTaskTypeMap = new Map([
  ['tt-anim', { id: 'tt-anim', name: 'Animation' }],
  ['tt-layout', { id: 'tt-layout', name: 'Layout' }]
])

const withMethods = (names, values = {}) => ({
  template: '<div />',
  methods: {
    ...Object.fromEntries(names.map(name => [name, () => {}])),
    ...values
  }
})

// Without previewFileStatusMap, the store keeps no preview status.
const mountPlayer = ({
  playlistProp = playlist,
  entities = [entity],
  canEditShotTrim = () => true,
  isArtist = false,
  isClient = false,
  organisation = {},
  props = {},
  previewFileStatusMap,
  shotMap = new Map(),
  taskMap = new Map(),
  taskTypeMap = new Map(),
  stubs = {}
} = {}) => {
  const store = createStore({
    getters: {
      canEditShotTrim: () => canEditShotTrim,
      currentProduction: () => ({ id: 'production-1', fps: '25' }),
      currentUserRoleForProduction: () => () => 'manager',
      dateFormat: () => 'yyyy-MM-dd',
      editMap: () => new Map(),
      episodeMap: () => new Map(),
      isCurrentUserAdmin: () => false,
      isCurrentUserArtist: () => isArtist,
      isCurrentUserClient: () => isClient,
      isCurrentUserManager: () => true,
      isCurrentUserSupervisor: () => false,
      organisation: () => organisation,
      personMap: () => new Map(),
      previewFileMap: () => new Map(),
      previewFileStatusMap: () => previewFileStatusMap,
      productionAssetTaskTypes: () => [],
      productionBackgrounds: () => [],
      productionEditTaskTypes: () => [],
      productionEpisodeTaskTypes: () => [],
      productionSequenceTaskTypes: () => [],
      productionShotTaskTypes: () => [],
      shotMap: () => shotMap,
      taskMap: () => taskMap,
      taskStatusMap: () => new Map(),
      taskTypeMap: () => taskTypeMap,
      use12HourClock: () => false,
      user: () => ({ id: 'user-1', timezone: 'Europe/Paris' })
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  store.commit = vi.fn()
  store.$socket = { on: vi.fn(), off: vi.fn(), emit: vi.fn() }

  return shallowMount(PlaylistPlayer, {
    props: { playlist: playlistProp, entities, ...props },
    global: {
      plugins: [store],
      // The mount hooks drive the viewers through their template refs; the
      // default stubs have none of their methods.
      stubs: {
        MultiVideoViewer: {
          ...withMethods(
            [
              'clear',
              'goNextFrame',
              'goPreviousFrame',
              'loadEntity',
              'pause',
              'play',
              'playNext',
              'reloadCurrentEntity',
              'resetHeight',
              'resetPanZoom',
              'resumePanZoom',
              'setCurrentFrame',
              'setCurrentTimeRaw',
              'setPanZoom',
              'setSpeed',
              'setVolume'
            ],
            {
              getCurrentFrame: () => 0,
              getCurrentTime: () => 0,
              getCurrentTimeRaw: () => 0,
              getNaturalDimensions: () => ({ width: 1920, height: 1080 }),
              getVideoRatio: () => 1
            }
          ),
          props: { entities: Array }
        },
        MultiPictureViewer: {
          ...withMethods(['resetPanZoom', 'resumePanZoom', 'setPanZoom'], {
            getNaturalDimensions: () => ({ width: 1920, height: 1080 }),
            getPictureElement: () => null
          }),
          props: { previews: Array }
        },
        ObjectViewer: withMethods(['pause', 'play'], {
          getAnimations: () => []
        }),
        PictureViewer: withMethods(['setPanZoom']),
        SoundViewer: withMethods(['pause', 'play']),
        TaskInfo: withMethods(['focusCommentTextarea']),
        VideoProgress: {
          ...withMethods(['updateProgressBar']),
          props: { handleIn: Number, handleOut: Number, readOnly: Boolean }
        },
        ...stubs
      }
    }
  })
}

// Enough of a fabric canvas for the annotation composable, which wires its
// handlers with on() and off().
const createFakeCanvas = () => {
  const handlers = {}
  return {
    width: 800,
    height: 600,
    contextContainer: {},
    freeDrawingBrush: { pressureManager: {} },
    add: vi.fn(),
    clear: vi.fn(),
    discardActiveObject: vi.fn(),
    fire: (event, options) =>
      (handlers[event] || []).forEach(handler => handler(options)),
    getActiveObject: vi.fn(),
    getObjects: () => [],
    off: (event, handler) => {
      handlers[event] = (handlers[event] || []).filter(h => h !== handler)
    },
    on: (event, handler) => {
      handlers[event] = [...(handlers[event] || []), handler]
    },
    remove: vi.fn(),
    renderAll: vi.fn(),
    requestRenderAll: vi.fn()
  }
}

// The canvas raw, as AnnotationCanvas exposes it, and the overlay the
// fingers land on.
const annotationCanvasStub = canvas => ({
  name: 'AnnotationCanvas',
  template: '<div ref="overlay"><canvas /></div>',
  setup: () => ({ canvas: markRaw(canvas), overlay: ref(null) })
})

const pointer = (target, type, { id, x, y }) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: id,
      pointerType: 'touch',
      isPrimary: true
    })
  )

describe('PlaylistPlayer.vue', () => {
  let wrapper = null

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
    // The player keeps its volume and its mute for the next visit.
    localStorage.removeItem('player:muted')
    localStorage.removeItem('player:volume')
  })

  // The comment box waits for the snapshots, and each of them waits 500 ms
  // for its frame or picture: the player can close in between.
  describe('annotation snapshots', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it.each([
      [
        'video',
        {
          ...entity,
          preview_file_extension: 'mp4',
          preview_file_annotations: [{ time: 1, drawing: { objects: [] } }]
        }
      ],
      ['picture', { ...entity, preview_file_extension: 'png' }]
    ])('drops the %s snapshots of a closed player', async (_, shown) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      wrapper = mountPlayer({ entities: [shown] })
      await flushPromises()

      const snapshots = wrapper.vm.extractAnnotationSnapshots()
      wrapper.unmount()
      wrapper = null
      await vi.advanceTimersByTimeAsync(500)

      await expect(snapshots).resolves.toEqual([])
    })

    // After its frame is read, a snapshot is composited and encoded: the
    // next frame, or the restore of the user's frame, comes after.
    it.each([1, 2])(
      'drops the video snapshots of a player closed after frame 1 of %i',
      async count => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        // jsdom draws and encodes nothing
        const snapshotCanvas = document.createElement('canvas')
        snapshotCanvas.toBlob = callback => callback(new Blob())
        vi.spyOn(document, 'getElementById').mockReturnValue(snapshotCanvas)
        const getContext = vi
          .spyOn(HTMLCanvasElement.prototype, 'getContext')
          .mockReturnValue({ clearRect: () => {}, drawImage: () => {} })
        const annotations = Array.from({ length: count }, (_, index) => ({
          time: index + 1,
          drawing: { objects: [] }
        }))
        wrapper = mountPlayer({
          entities: [
            {
              ...entity,
              preview_file_extension: 'mp4',
              preview_file_annotations: annotations
            }
          ]
        })
        await flushPromises()

        const snapshots = wrapper.vm.extractAnnotationSnapshots()
        await vi.advanceTimersByTimeAsync(550)
        expect(getContext).toHaveBeenCalled()
        wrapper.unmount()
        wrapper = null
        await vi.advanceTimersByTimeAsync(600)

        await expect(snapshots).resolves.toEqual([])
      }
    )
  })

  // The waveform loads 100 ms after it is set up for the movie on screen:
  // the player can close, or move on to a picture, in between.
  describe('waveform', () => {
    const movie = { ...entity, preview_file_extension: 'mp4' }
    const picture = {
      id: 'shot-2',
      preview_file_id: 'preview-2',
      preview_file_extension: 'png'
    }
    const otherMovie = { ...movie, id: 'shot-3', preview_file_id: 'preview-3' }

    afterEach(() => {
      vi.useRealTimers()
    })

    const showWaveform = async entities => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      // The player sets the waveform up only in a container it finds.
      vi.spyOn(document, 'getElementById').mockReturnValue(
        document.createElement('div')
      )
      wrapper = mountPlayer({ entities })
      await flushPromises()
      wrapper.findComponent({ ref: 'raw-player' }).vm.currentPlayer = {
        src: '/movie.mp4'
      }
      wrapper
        .findComponent({ name: 'PlayerPlaybackBar' })
        .vm.$emit('update:isWaveformDisplayed', true)
      await flushPromises()
      return waveSurfer.create.mock.results.at(-1).value
    }

    const goToNextShot = async () => {
      wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .find(
          button => button.attributes('title') === 'playlists.actions.next_shot'
        )
        .vm.$emit('click')
      await flushPromises()
    }

    it('loads the waveform of the movie on screen', async () => {
      const waveform = await showWaveform([movie])
      await vi.advanceTimersByTimeAsync(100)
      expect(waveform.load).toHaveBeenCalledWith('/movie.mp4')
    })

    it('drops the waveform load of a closed player', async () => {
      const waveform = await showWaveform([movie])
      wrapper.unmount()
      wrapper = null
      await vi.advanceTimersByTimeAsync(100)
      expect(waveform.load).not.toHaveBeenCalled()
    })

    it('drops the waveform load of a movie left for a picture', async () => {
      const waveform = await showWaveform([movie, picture])
      await goToNextShot()
      await vi.advanceTimersByTimeAsync(100)
      expect(waveform.load).not.toHaveBeenCalled()
    })

    // Each switch sets a new waveform up: the load still pending from the
    // previous one fetched the movie a second time, into the new waveform.
    it('loads the movie once on two quick switches', async () => {
      const created = waveSurfer.create.mock.results.length
      await showWaveform([movie, otherMovie])
      await goToNextShot()
      await vi.advanceTimersByTimeAsync(100)
      const loads = waveSurfer.create.mock.results
        .slice(created)
        .flatMap(({ value }) => value.load.mock.calls)
      expect(loads).toEqual([['/movie.mp4']])
    })

    it('loads nothing into the waveform it destroyed', async () => {
      const waveform = await showWaveform([movie, otherMovie])
      await vi.advanceTimersByTimeAsync(100)
      // No container left: no new waveform is set up.
      document.getElementById.mockReturnValue(null)
      await goToNextShot()
      await vi.advanceTimersByTimeAsync(100)
      expect(waveform.destroy).toHaveBeenCalled()
      expect(waveform.load).toHaveBeenCalledTimes(1)
    })

    // wavesurfer.js 8 sends 'interaction' from a click handler that only
    // logs what throws, which Sentry keeps as a mere breadcrumb.
    it('throws the error of a waveform click outside wavesurfer', async () => {
      const waveform = await showWaveform([movie])
      const [, onInteraction] = waveform.on.mock.calls.find(
        ([event]) => event === 'interaction'
      )
      const failure = new Error('No frame')
      vi.spyOn(
        wrapper.findComponent({ ref: 'raw-player' }).vm,
        'setCurrentFrame'
      ).mockImplementation(() => {
        throw failure
      })

      expect(() => onInteraction(1.5)).not.toThrow()
      expect(() => vi.advanceTimersByTime(1)).toThrow(failure)
    })
  })

  describe('sound', () => {
    const sound = { ...entity, preview_file_extension: 'mp3' }
    const otherSound = {
      id: 'shot-2',
      preview_file_id: 'preview-2',
      preview_file_extension: 'wav'
    }
    const picture = {
      id: 'shot-3',
      preview_file_id: 'preview-3',
      preview_file_extension: 'png'
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    const mountWithSound = async (entities, stubs = {}) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
      const soundViewer = { play: vi.fn(), setCurrentTime: vi.fn() }
      wrapper = mountPlayer({
        entities,
        stubs: {
          SoundViewer: {
            ...withMethods(['pause'], soundViewer),
            name: 'SoundViewer',
            props: { isMuted: Boolean, volume: Number }
          },
          ...stubs
        }
      })
      await flushPromises()
      return soundViewer
    }

    const playbackBar = () => wrapper.findComponent({ name: 'PlayerPlaybackBar' })
    const soundViewer = () => wrapper.findComponent({ name: 'SoundViewer' })
    const entityBar = () => wrapper.findComponent({ ref: 'video-progress' })
    const playlistBar = () => wrapper.findComponent({ name: 'PlaylistProgress' })

    const endSound = async () => {
      soundViewer().vm.$emit('play-ended')
      await flushPromises()
    }

    it('moves on to the next entity at the end of a sound', async () => {
      await mountWithSound([sound, picture])
      playbackBar().vm.$emit('play-pause-clicked')
      await flushPromises()
      await endSound()
      expect(soundViewer().exists()).toBe(false)
      expect(playbackBar().props('isPlaying')).toBe(true)
    })

    it('replays a sound at its end with repeat on', async () => {
      const { play } = await mountWithSound([sound, picture])
      playbackBar().vm.$emit('repeat-clicked')
      playbackBar().vm.$emit('play-pause-clicked')
      await flushPromises()
      await endSound()
      expect(play).toHaveBeenCalledTimes(2)
      expect(playbackBar().props('isPlaying')).toBe(true)
    })

    // The volume of the movies, the one kept between visits included.
    it('plays a sound at the volume and the mute of the movies', async () => {
      localStorage.setItem('player:volume', '30')
      await mountWithSound([sound, picture])
      expect(soundViewer().props('volume')).toBe(30)
      expect(soundViewer().props('isMuted')).toBe(false)

      playbackBar().vm.$emit('update:volume', 0)
      playbackBar().vm.$emit('update:isMuted', true)
      await flushPromises()
      expect(soundViewer().props('volume')).toBe(0)
      expect(soundViewer().props('isMuted')).toBe(true)
      localStorage.removeItem('player:volume')
    })

    // Like an entity without preview, it keeps its slot, 2 s here.
    it('moves on from a sound that cannot be read', async () => {
      await mountWithSound([sound, picture])
      playbackBar().vm.$emit('play-pause-clicked')
      await flushPromises()
      soundViewer().vm.$emit('play-failed')
      await vi.advanceTimersByTimeAsync(1900)
      expect(soundViewer().exists()).toBe(true)
      await vi.advanceTimersByTimeAsync(200)
      expect(soundViewer().exists()).toBe(false)
      expect(playbackBar().props('isPlaying')).toBe(true)
    })

    // A build holds the movies only, and plays its own sound.
    it('starts no sound under the movie of a build', async () => {
      const { play } = await mountWithSound([picture, sound])
      wrapper.vm.isFullMode = true
      await flushPromises()
      wrapper.vm.isPlaying = true
      playlistBar().vm.$emit('progress-playlist-changed', 75)
      await flushPromises()
      expect(play).not.toHaveBeenCalled()
    })

    it('starts the sound that playback reaches', async () => {
      const { play } = await mountWithSound([sound, otherSound])
      playbackBar().vm.$emit('play-pause-clicked')
      await flushPromises()
      wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .find(
          button => button.attributes('title') === 'playlists.actions.next_shot'
        )
        .vm.$emit('click')
      await flushPromises()
      expect(play).toHaveBeenCalledTimes(2)
    })

    // Zou keeps no duration for a sound: the entity bar takes the decoded
    // one, and the playlist bar spreads the sound over the slot it has.
    it('seeks the sound from the entity bar', async () => {
      const { setCurrentTime } = await mountWithSound([sound, picture])
      const setCurrentFrame = vi.spyOn(
        wrapper.findComponent({ ref: 'raw-player' }).vm,
        'setCurrentFrame'
      )
      soundViewer().vm.$emit('duration-changed', 3)
      await flushPromises()
      expect(entityBar().attributes('nb-frames')).toBe('75')

      entityBar().vm.$emit('progress-changed', 37)
      expect(setCurrentTime).toHaveBeenCalledTimes(1)
      expect(setCurrentTime.mock.calls[0][0]).toBeCloseTo(1.48)
      expect(setCurrentFrame).not.toHaveBeenCalled()
    })

    it('moves both bars with the sound', async () => {
      await mountWithSound([sound, picture])
      const updateProgressBar = vi.spyOn(entityBar().vm, 'updateProgressBar')
      soundViewer().vm.$emit('duration-changed', 3)
      soundViewer().vm.$emit('time-update', 1.5)
      await flushPromises()
      expect(updateProgressBar).toHaveBeenCalledWith(37.5)
      // Half of the sound, half of its 2 s slot, which starts at frame 1.
      expect(playlistBar().props('playlistProgress')).toBeCloseTo(1.04)
    })

    it('seeks the sound from its slot of the playlist bar', async () => {
      const { setCurrentTime } = await mountWithSound([sound, picture])
      soundViewer().vm.$emit('duration-changed', 3)
      await flushPromises()
      playlistBar().vm.$emit('progress-playlist-changed', 25)
      await flushPromises()
      expect(setCurrentTime).toHaveBeenCalledTimes(1)
      expect(setCurrentTime.mock.calls[0][0]).toBeCloseTo(1.5)
    })

    it('seeks a sound reached from the playlist bar once decoded', async () => {
      const { setCurrentTime } = await mountWithSound([picture, sound])
      playlistBar().vm.$emit('progress-playlist-changed', 75)
      await flushPromises()
      expect(setCurrentTime).not.toHaveBeenCalled()

      soundViewer().vm.$emit('duration-changed', 3)
      expect(setCurrentTime).toHaveBeenCalledTimes(1)
      expect(setCurrentTime.mock.calls[0][0]).toBeCloseTo(1.5)
    })

    it('seeks a sound being decoded to the last frame clicked', async () => {
      const { setCurrentTime } = await mountWithSound([picture, sound])
      playlistBar().vm.$emit('progress-playlist-changed', 75)
      await flushPromises()
      playlistBar().vm.$emit('progress-playlist-changed', 90)
      await flushPromises()
      expect(setCurrentTime).not.toHaveBeenCalled()

      soundViewer().vm.$emit('duration-changed', 3)
      expect(setCurrentTime).toHaveBeenCalledTimes(1)
      expect(setCurrentTime.mock.calls[0][0]).toBeCloseTo(2.4)
    })

    describe('frame waiting for a sound', () => {
      const twoFiles = {
        ...sound,
        preview_file_previews: [{ id: 'preview-1b', extension: 'wav' }]
      }

      // Next goes through the files of a revision first.
      it('is dropped on a move to another file', async () => {
        const { setCurrentTime } = await mountWithSound([picture, twoFiles])
        playlistBar().vm.$emit('progress-playlist-changed', 75)
        await flushPromises()
        wrapper
          .findAllComponents({ name: 'ButtonSimple' })
          .find(
            button => button.attributes('title') === 'playlists.actions.next_shot'
          )
          .vm.$emit('click')
        await flushPromises()
        expect(wrapper.vm.currentPreviewIndex).toBe(1)

        soundViewer().vm.$emit('duration-changed', 3)
        expect(setCurrentTime).not.toHaveBeenCalled()
      })

      // The hold of a sound that cannot be read moves on to the next file.
      it('is dropped when playback moves on to another file', async () => {
        const { setCurrentTime } = await mountWithSound([picture, twoFiles])
        playlistBar().vm.$emit('progress-playlist-changed', 75)
        await flushPromises()
        playbackBar().vm.$emit('play-pause-clicked')
        await flushPromises()
        soundViewer().vm.$emit('play-failed')
        await vi.advanceTimersByTimeAsync(2100)
        expect(wrapper.vm.currentPreviewIndex).toBe(1)

        soundViewer().vm.$emit('duration-changed', 3)
        expect(setCurrentTime).not.toHaveBeenCalled()
      })
    })

    // Like the shared playlist, by a frame of the playlist, up to its last
    // frame.
    describe('keys', () => {
      const press = async code => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code }))
        await flushPromises()
      }

      it('steps a playing sound, not the hidden movie', async () => {
        const { setCurrentTime } = await mountWithSound([sound, picture])
        const pause = vi.spyOn(soundViewer().vm, 'pause')
        const rawPlayer = wrapper.findComponent({ ref: 'raw-player' }).vm
        const goNextFrame = vi.spyOn(rawPlayer, 'goNextFrame')
        const goPreviousFrame = vi.spyOn(rawPlayer, 'goPreviousFrame')
        const setCurrentFrame = vi.spyOn(rawPlayer, 'setCurrentFrame')
        playbackBar().vm.$emit('play-pause-clicked')
        soundViewer().vm.$emit('duration-changed', 3)
        soundViewer().vm.$emit('time-update', 1.5)
        await flushPromises()

        await press('ArrowRight')
        await press('ArrowLeft')
        await press('Home')
        await press('End')
        const times = setCurrentTime.mock.calls.map(([time]) => time)
        expect(times).toHaveLength(4)
        expect(times[0]).toBeCloseTo(1.52)
        expect(times[1]).toBeCloseTo(1.44)
        expect(times[2]).toBe(0)
        expect(times[3]).toBeCloseTo(2.96)
        expect(goNextFrame).not.toHaveBeenCalled()
        expect(goPreviousFrame).not.toHaveBeenCalled()
        expect(setCurrentFrame).not.toHaveBeenCalled()
        expect(pause).not.toHaveBeenCalled()
        expect(playbackBar().props('isPlaying')).toBe(true)
      })

      it('keeps the sound between its first and last frames', async () => {
        const { setCurrentTime } = await mountWithSound([sound, picture])
        soundViewer().vm.$emit('duration-changed', 3)
        soundViewer().vm.$emit('time-update', 2.96)
        await flushPromises()
        await press('ArrowRight')
        soundViewer().vm.$emit('time-update', 0)
        await press('ArrowLeft')
        expect(setCurrentTime.mock.calls.map(([time]) => time)).toEqual([
          2.96, 0
        ])
      })

      it('leaves a sound being decoded where it is', async () => {
        const { setCurrentTime } = await mountWithSound([sound, picture])
        await press('ArrowRight')
        await press('End')
        expect(setCurrentTime).not.toHaveBeenCalled()
      })
    })

    describe('time', () => {
      const movie = {
        id: 'shot-4',
        preview_file_id: 'preview-4',
        preview_file_extension: 'mp4'
      }
      const rawPlayer = () => wrapper.findComponent({ ref: 'raw-player' })
      const goTo = async direction => {
        wrapper
          .findAllComponents({ name: 'ButtonSimple' })
          .find(
            button =>
              button.attributes('title') === `playlists.actions.${direction}_shot`
          )
          .vm.$emit('click')
        await flushPromises()
      }
      // A movie two seconds in, four seconds long.
      const mountOnMovie = async () => {
        await mountWithSound([movie, sound])
        rawPlayer().vm.$emit('max-duration-update', 4)
        rawPlayer().vm.$emit('frame-update', 50)
        await flushPromises()
        expect(playbackBar().props('currentTime')).toBe('00:00:02:00')
        expect(playbackBar().props('maxDuration')).toBe('00:00:04:00')
      }

      it('shows the time and the decoded duration of a sound', async () => {
        await mountWithSound([sound, picture])
        soundViewer().vm.$emit('duration-changed', 3)
        soundViewer().vm.$emit('time-update', 1.48)
        await flushPromises()
        expect(playbackBar().props('currentTime')).toBe('00:00:01:12')
        expect(playbackBar().props('maxDuration')).toBe('00:00:03:00')
      })

      // The sound viewer sends a duration of 0 as it starts each load.
      it('restarts the time on a move from a movie to a sound', async () => {
        await mountOnMovie()
        await goTo('next')
        soundViewer().vm.$emit('duration-changed', 0)
        await flushPromises()
        expect(playbackBar().props('currentTime')).toBe('00:00:00:00')
        expect(playbackBar().props('maxDuration')).toBe('00:00:00:00')

        soundViewer().vm.$emit('duration-changed', 3)
        await flushPromises()
        expect(playbackBar().props('maxDuration')).toBe('00:00:03:00')
      })

      // The decoder that holds the movie already knows its duration: it
      // sends it no more on the way back.
      it('gives a movie its own duration back after a sound', async () => {
        await mountOnMovie()
        await goTo('next')
        soundViewer().vm.$emit('duration-changed', 3)
        await goTo('previous')
        expect(playbackBar().props('maxDuration')).toBe('00:00:04:00')
      })

      // SMPTE: the frames field stays under 30 at 30 fps.
      it('labels the time of a movie as a timecode', async () => {
        await mountWithSound([
          { ...movie, fps: '30', preview_file_duration: 60 },
          sound
        ])
        rawPlayer().vm.$emit('max-duration-update', 60)
        rawPlayer().vm.$emit('frame-update', 30)
        await flushPromises()
        expect(playbackBar().props('currentTime')).toBe('00:00:01:00')
        expect(playbackBar().props('maxDuration')).toBe('00:01:00:00')
      })

      // A frame with a float error reads as its counter does.
      it('labels a stepped frame as its counter does', async () => {
        await mountOnMovie()
        rawPlayer().vm.$emit('frame-update', 28.999999999999996)
        await flushPromises()
        expect(playbackBar().props('currentFrameLabel')).toBe('030')
        expect(playbackBar().props('currentTime')).toBe('00:00:01:04')
      })

      // The label reads the frame the viewer numbers, as the counter does,
      // 10 minutes into a 30 fps movie.
      it('labels the frame the viewer sends', async () => {
        await mountWithSound([
          { ...movie, fps: '30', preview_file_duration: 1200 },
          sound
        ])
        rawPlayer().vm.$emit('max-duration-update', 1200)
        rawPlayer().vm.$emit('frame-update', 18000)
        await flushPromises()
        expect(playbackBar().props('currentFrameLabel')).toBe('18001')
        expect(playbackBar().props('currentTime')).toBe('00:10:00:00')
      })
    })

    // The waveform follows the width the comments panel leaves on its own.
    it('shows the comments of a sound', async () => {
      wrapper = mountPlayer({ entities: [sound] })
      await flushPromises()
      wrapper
        .findComponent({ name: 'PlayerAnnotationBar' })
        .vm.$emit('comment-clicked')
      await flushPromises()
      expect(
        wrapper.findComponent({ name: 'PlayerAnnotationBar' }).props()
          .isCommentsHidden
      ).toBe(false)
    })

    // Annotations go on movies and pictures only, as in the task panel: a
    // tool left on by a movie drew over the waveform, and nothing showed the
    // drawing again.
    describe('annotations', () => {
      const movie = {
        id: 'shot-0',
        preview_file_id: 'preview-0',
        preview_file_extension: 'mp4'
      }

      // As in the real one, the overlay sits in the element the player
      // shows or hides.
      const canvasStub = canvas => ({
        name: 'AnnotationCanvas',
        template: '<div><div ref="overlay"><canvas /></div></div>',
        setup: () => ({ canvas: markRaw(canvas), overlay: ref(null) })
      })

      const annotationBar = () =>
        wrapper.findComponent({ name: 'PlayerAnnotationBar' })
      const mainCanvas = () =>
        wrapper.findComponent({ ref: 'main-annotation-canvas' })
      const press = init =>
        window.dispatchEvent(new KeyboardEvent('keydown', init))

      const clickButton = title =>
        wrapper
          .findAllComponents({ name: 'ButtonSimple' })
          .find(button => button.attributes('title') === title)
          .vm.$emit('click')

      const goToNextShot = async () => {
        clickButton('playlists.actions.next_shot')
        // The pencil of the previous entity comes back after 100 ms.
        await vi.advanceTimersByTimeAsync(100)
      }

      afterEach(() => {
        clipboard.copyAnnotations([])
      })

      it.each([
        ['pencil', 'pencil-annotate-clicked', 'isDrawing'],
        ['eraser', 'erase-clicked', 'isEraserModeOn'],
        ['shape', 'shape-mode-clicked', 'isShapeMode'],
        ['text', 'type-clicked', 'isTyping']
      ])('turns the %s of a movie off on a sound', async (_, click, prop) => {
        await mountWithSound([movie, sound], {
          AnnotationCanvas: canvasStub(createFakeCanvas())
        })
        annotationBar().vm.$emit(click)
        await flushPromises()
        expect(annotationBar().props(prop)).toBe(true)

        await goToNextShot()

        expect(annotationBar().props(prop)).toBe(false)
      })

      // The next entity shows the file of the previous index until the index
      // goes back to 0: a movie read as no file for a moment.
      it('keeps the pencil from the last file of a revision to a movie', async () => {
        const twoFiles = {
          ...movie,
          preview_file_previews: [
            { id: 'preview-0b', extension: 'mp4', revision: 1, annotations: [] }
          ]
        }
        const nextMovie = { ...movie, id: 'shot-9', preview_file_id: 'preview-9' }
        await mountWithSound([twoFiles, nextMovie], {
          AnnotationCanvas: canvasStub(createFakeCanvas())
        })
        // Alt+K moves to the next file, then to the next entity.
        const pressNext = async () => {
          press({ key: 'k', code: 'KeyK', altKey: true })
          await vi.advanceTimersByTimeAsync(100)
        }
        await pressNext()
        annotationBar().vm.$emit('pencil-annotate-clicked')
        await flushPromises()
        expect(annotationBar().props('isDrawing')).toBe(true)

        await pressNext()

        expect(wrapper.vm.playingEntityIndex).toBe(1)
        expect(annotationBar().props('isDrawing')).toBe(true)
      })

      it('keeps the pencil off past a sound to a picture', async () => {
        await mountWithSound([movie, sound, picture], {
          AnnotationCanvas: canvasStub(createFakeCanvas())
        })
        annotationBar().vm.$emit('pencil-annotate-clicked')
        await flushPromises()

        // On to the picture before the 100 ms of the sound are over.
        clickButton('playlists.actions.next_shot')
        await flushPromises()
        await goToNextShot()

        expect(annotationBar().props('isDrawing')).toBe(false)
      })

      it('hides the annotations over a sound', async () => {
        await mountWithSound([movie, sound], {
          AnnotationCanvas: canvasStub(createFakeCanvas())
        })
        expect(mainCanvas().element.style.display).not.toBe('none')

        await goToNextShot()

        expect(mainCanvas().element.style.display).toBe('none')
      })

      it.each([
        ['d', 'isDrawing'],
        ['e', 'isEraserModeOn']
      ])('turns no tool on with the %s key on a sound', async (key, prop) => {
        await mountWithSound([sound], {
          AnnotationCanvas: canvasStub(createFakeCanvas())
        })
        press({ key })
        await flushPromises()
        expect(annotationBar().props(prop)).toBe(false)
      })

      it('pastes no annotation on a sound', async () => {
        const canvas = { ...createFakeCanvas(), setActiveObject: vi.fn() }
        await mountWithSound([sound], { AnnotationCanvas: canvasStub(canvas) })
        clipboard.copyAnnotations({
          mainObject: { clone: async () => ({ left: 0, top: 0, set: vi.fn() }) },
          subObjects: []
        })
        press({ key: 'v', ctrlKey: true })
        await flushPromises()
        expect(canvas.add).not.toHaveBeenCalled()
      })
    })

    it('offers the comments toggle on a sound in full screen', async () => {
      await mountWithSound([sound], { PlayerAnnotationBar: false })
      // jsdom has no full screen
      Object.defineProperty(document, 'fullscreen', {
        configurable: true,
        value: true
      })
      wrapper.element.dispatchEvent(new Event('fullscreenchange'))
      await flushPromises()
      delete document.fullscreen
      const toggle = () =>
        wrapper
          .findAllComponents({ name: 'ButtonSimple' })
          .find(button => button.attributes('icon') === 'comment')
      expect(toggle()).toBeDefined()

      toggle().vm.$emit('click')
      await flushPromises()

      expect(toggle().attributes('active')).toBe('true')
    })
  })

  it.each(['glb', 'pdf', 'blend'])(
    'offers the comments toggle on a %s file',
    async extension => {
      wrapper = mountPlayer({
        entities: [{ ...entity, preview_file_extension: extension }],
        stubs: { PlayerAnnotationBar: false }
      })
      await flushPromises()
      const toggle = () =>
        wrapper
          .findAllComponents({ name: 'ButtonSimple' })
          .find(button => button.attributes('icon') === 'comment')
      expect(toggle()).toBeDefined()

      toggle().vm.$emit('click')
      await flushPromises()

      expect(toggle().attributes('active')).toBe('true')
    }
  )

  // A picture holds its slot of 50 frames on a timer, like the shared
  // playlist.
  describe('picture progress', () => {
    const picture = {
      id: 'shot-3',
      preview_file_id: 'preview-3',
      preview_file_extension: 'png'
    }
    const sound = {
      id: 'shot-4',
      preview_file_id: 'preview-4',
      preview_file_extension: 'mp3'
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    const mountOnPicture = async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
      wrapper = mountPlayer({
        entities: [picture, sound],
        stubs: {
          SoundViewer: { ...withMethods(['pause', 'play']), name: 'SoundViewer' }
        }
      })
      await flushPromises()
      const entityBar = wrapper.findComponent({ ref: 'video-progress' })
      const updateProgressBar = vi.spyOn(entityBar.vm, 'updateProgressBar')
      return {
        click: frame => entityBar.vm.$emit('progress-changed', frame),
        play: () =>
          wrapper
            .findComponent({ name: 'PlayerPlaybackBar' })
            .vm.$emit('play-pause-clicked'),
        lastFrame: () => updateProgressBar.mock.lastCall[0]
      }
    }

    const soundShown = () =>
      wrapper.findComponent({ name: 'SoundViewer' }).exists()

    it('plays a picture on from the frame clicked', async () => {
      const { click, play, lastFrame } = await mountOnPicture()
      play()
      await vi.advanceTimersByTimeAsync(200)
      expect(lastFrame()).toBeLessThanOrEqual(6)

      click(30)
      await vi.advanceTimersByTimeAsync(200)
      expect(lastFrame()).toBeGreaterThanOrEqual(33)
      await vi.advanceTimersByTimeAsync(500)
      expect(soundShown()).toBe(false)
      await vi.advanceTimersByTimeAsync(300)
      expect(soundShown()).toBe(true)
    })

    it('resumes a picture from the frame clicked while paused', async () => {
      const { click, play, lastFrame } = await mountOnPicture()
      click(30)
      play()
      await vi.advanceTimersByTimeAsync(200)
      expect(lastFrame()).toBeGreaterThanOrEqual(33)
      expect(lastFrame()).toBeLessThanOrEqual(37)
    })

    it('restarts a picture paused on its last frame', async () => {
      const { click, play, lastFrame } = await mountOnPicture()
      click(49)
      play()
      await vi.advanceTimersByTimeAsync(200)
      expect(lastFrame()).toBeLessThanOrEqual(6)
      expect(soundShown()).toBe(false)
    })
  })

  // Like an entity without preview, it keeps its slot on the strip, 3 s
  // here, then the playlist moves on, repeat on or not.
  describe('movie that cannot be read', () => {
    const movie = {
      ...entity,
      preview_file_extension: 'mp4',
      preview_file_duration: 3
    }
    const sound = {
      id: 'shot-2',
      preview_file_id: 'preview-2',
      preview_file_extension: 'mp3'
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    const mountOnMovie = async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
      wrapper = mountPlayer({
        entities: [movie, sound],
        stubs: {
          SoundViewer: { ...withMethods(['pause', 'play']), name: 'SoundViewer' }
        }
      })
      await flushPromises()
    }

    const playbackBar = () => wrapper.findComponent({ name: 'PlayerPlaybackBar' })
    const soundShown = () =>
      wrapper.findComponent({ name: 'SoundViewer' }).exists()

    const failMovie = async () => {
      wrapper.findComponent({ ref: 'raw-player' }).vm.$emit('play-failed')
      await flushPromises()
    }

    it('moves on from a movie that cannot be read', async () => {
      await mountOnMovie()
      playbackBar().vm.$emit('play-pause-clicked')
      await flushPromises()
      await failMovie()
      await vi.advanceTimersByTimeAsync(2900)
      expect(soundShown()).toBe(false)
      expect(playbackBar().props('isPlaying')).toBe(true)
      await vi.advanceTimersByTimeAsync(200)
      expect(soundShown()).toBe(true)
      expect(playbackBar().props('isPlaying')).toBe(true)
    })

    it('moves on from it with repeat on', async () => {
      await mountOnMovie()
      playbackBar().vm.$emit('repeat-clicked')
      playbackBar().vm.$emit('play-pause-clicked')
      await flushPromises()
      await failMovie()
      await vi.advanceTimersByTimeAsync(3100)
      expect(soundShown()).toBe(true)
    })

    // The viewer sends the frame it pauses on before the playlist knows it
    // is paused: a movie of no length must not end on it.
    it('stays on a movie of no length paused during its slot', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
      wrapper = mountPlayer({
        entities: [{ ...movie, preview_file_duration: 0 }, sound],
        stubs: {
          SoundViewer: { ...withMethods(['pause', 'play']), name: 'SoundViewer' }
        }
      })
      await flushPromises()
      const rawPlayer = wrapper.findComponent({ ref: 'raw-player' }).vm
      rawPlayer.pause = () => rawPlayer.$emit('frame-update', 0)
      playbackBar().vm.$emit('play-pause-clicked')
      await flushPromises()
      await failMovie()
      await vi.advanceTimersByTimeAsync(1000)

      playbackBar().vm.$emit('play-pause-clicked')
      await flushPromises()

      expect(soundShown()).toBe(false)
      expect(playbackBar().props('isPlaying')).toBe(false)
    })
  })

  // The comparison viewer shows movies only: on a picture, a comparison
  // movie still playing went on decoding, hidden.
  it('stops the comparison movie on a move to a picture', async () => {
    wrapper = mountPlayer({
      entities: [
        { ...entity, preview_file_extension: 'mp4' },
        { id: 'shot-2', preview_file_id: 'preview-2', preview_file_extension: 'png' }
      ]
    })
    await flushPromises()
    const pause = vi.spyOn(
      wrapper.findComponent({ ref: 'raw-player-comparison' }).vm,
      'pause'
    )

    wrapper
      .findAllComponents({ name: 'ButtonSimple' })
      .find(button => button.attributes('title') === 'playlists.actions.next_shot')
      .vm.$emit('click')
    await flushPromises()

    expect(pause).toHaveBeenCalled()
  })

  // Once closed, the comparison viewer kept its movies: it went on
  // downloading them, and loaded others on an HD switch or in the next
  // playlist, hidden.
  it('gives the comparison viewer no movie while the comparison is closed', async () => {
    wrapper = mountPlayer({
      entities: [comparedEntity('shot-1'), comparedEntity('shot-2')],
      taskTypeMap: comparedTaskTypeMap
    })
    await flushPromises()
    const comparisonViewer = wrapper.findComponent({ ref: 'raw-player-comparison' })
    const comparisonBar = wrapper.findComponent({ name: 'PlayerComparisonBar' })

    comparisonBar.vm.$emit('compare-clicked')
    await flushPromises()
    expect(comparisonViewer.props('entities')).toHaveLength(2)

    comparisonBar.vm.$emit('compare-clicked')
    await flushPromises()
    expect(comparisonViewer.props('entities')).toEqual([])

    await wrapper.setProps({ entities: [comparedEntity('shot-3')] })
    await flushPromises()
    expect(comparisonViewer.props('entities')).toEqual([])
  })

  // Firefox paints no frame for a second seek right after a first one: the
  // comparison movie, paused on its own frame then sent to the frame of the
  // main one, stayed a frame or two ahead.
  it('pauses the comparison movie on the frame of the main one', async () => {
    wrapper = mountPlayer({
      entities: [comparedEntity('shot-1')],
      taskTypeMap: comparedTaskTypeMap
    })
    await flushPromises()
    wrapper
      .findComponent({ name: 'PlayerComparisonBar' })
      .vm.$emit('compare-clicked')
    await flushPromises()
    const playPause = () =>
      window.dispatchEvent(
        new KeyboardEvent('keydown', { code: 'Space', key: ' ' })
      )
    const main = wrapper.findComponent({ ref: 'raw-player' }).vm
    main.isPlaying = true
    playPause()
    await flushPromises()
    const comparison = wrapper.findComponent({ ref: 'raw-player-comparison' }).vm
    main.getCurrentFrame = () => 627
    comparison.pause = vi.fn()
    comparison.setCurrentTimeRaw = vi.fn()

    playPause()
    await flushPromises()

    expect(comparison.pause).toHaveBeenCalledWith(627)
    expect(comparison.setCurrentTimeRaw).not.toHaveBeenCalled()
  })

  describe('comparison movie of a picture', () => {
    const openComparison = async entities => {
      wrapper = mountPlayer({ entities, taskTypeMap: comparedTaskTypeMap })
      await flushPromises()
      wrapper
        .findComponent({ name: 'PlayerComparisonBar' })
        .vm.$emit('compare-clicked')
      await flushPromises()
      return wrapper.find({ ref: 'picture-video-player-comparison' })
    }

    it('plays in its video next to a picture', async () => {
      const video = await openComparison([comparedEntity('shot-1', 'png')])

      expect(video.attributes('src')).toBe(
        '/api/movies/originals/preview-files/shot-1-layout.mp4'
      )
    })

    // Next to a movie, the comparison viewer plays the compared movie: this
    // video also loaded its original, hidden, on every entity.
    it('is not loaded next to a movie', async () => {
      const video = await openComparison([comparedEntity('shot-1')])

      expect(video.exists()).toBe(false)
    })

    // The comparison stays open on a file no viewer shows, and so does
    // nothing of it.
    it('is not loaded next to a file', async () => {
      await openComparison([
        comparedEntity('shot-1'),
        comparedEntity('shot-2', 'blend')
      ])

      wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .find(button => button.attributes('title') === 'playlists.actions.next_shot')
        .vm.$emit('click')
      await flushPromises()

      expect(
        wrapper.find({ ref: 'picture-video-player-comparison' }).exists()
      ).toBe(false)
    })
  })

  describe('movie warm-up', () => {
    const movie = id => ({
      id,
      preview_file_id: `${id}-movie`,
      preview_file_extension: 'mp4'
    })
    const original = id =>
      `/api/movies/originals/preview-files/${id}-movie.mp4`
    const stubFetch = () =>
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
      })
    const warmedUrls = fetch => fetch.mock.calls.map(([url]) => url)

    // The originals an HD switch plays were never asked for: the server had
    // to fetch them from its storage while the playback waited.
    it('warms the originals from the entity on screen on an HD switch', async () => {
      const fetch = stubFetch()
      wrapper = mountPlayer({
        entities: [movie('shot-1'), movie('shot-2'), movie('shot-3')]
      })
      await flushPromises()
      wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .find(button => button.attributes('title') === 'playlists.actions.next_shot')
        .vm.$emit('click')
      await flushPromises()
      fetch.mockClear()

      wrapper
        .findComponent({ name: 'PlayerPlaybackBar' })
        .vm.$emit('update:isHd', true)
      await flushPromises()

      expect(warmedUrls(fetch)).toEqual([
        original('shot-2'),
        original('shot-3'),
        original('shot-1')
      ])
    })

    it('warms each movie once in a playlist opening in HD', async () => {
      const fetch = stubFetch()
      wrapper = mountPlayer({
        entities: [movie('shot-1'), movie('shot-2'), movie('shot-3')],
        organisation: { hd_by_default: true }
      })
      await flushPromises()

      expect(warmedUrls(fetch)).toEqual([
        original('shot-1'),
        original('shot-2'),
        original('shot-3')
      ])
    })
  })

  // The player lays itself out, or turns the pencil back on, a little after
  // what asked for it: once closed, it has nothing left to work on.
  describe('timers of a closed player', () => {
    const picture = {
      id: 'shot-2',
      preview_file_id: 'preview-2',
      preview_file_extension: 'png'
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    const mountWithFakeTimers = async (entities, stubs) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      wrapper = mountPlayer({ entities, stubs })
      await flushPromises()
      return vi.getTimerCount()
    }

    const findButton = title =>
      wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .find(button => button.attributes('title') === title)

    // Checks that a timer was set, then that the closing cleared it.
    const expectClearedOnClose = pending => {
      expect(vi.getTimerCount()).toBeGreaterThan(pending)
      wrapper.unmount()
      wrapper = null
      expect(vi.getTimerCount()).toBe(0)
    }

    it('clears the layout after a window resize', async () => {
      const pending = await mountWithFakeTimers()
      window.dispatchEvent(new Event('resize'))
      expectClearedOnClose(pending)
    })

    it('clears the layout after a full screen change', async () => {
      const pending = await mountWithFakeTimers([picture])
      // jsdom has no full screen
      Object.defineProperty(document, 'fullscreen', {
        configurable: true,
        value: true
      })
      wrapper.element.dispatchEvent(new Event('fullscreenchange'))
      await flushPromises()
      delete document.fullscreen
      expectClearedOnClose(pending)
    })

    it('clears the layout after the shot list toggle', async () => {
      const pending = await mountWithFakeTimers()
      findButton('playlists.actions.entity_list').vm.$emit('click')
      await flushPromises()
      expectClearedOnClose(pending)
    })

    // Enough of a fabric canvas for the pencil: the annotation composable
    // wires its handlers with on() and off().
    const AnnotationCanvas = {
      name: 'AnnotationCanvas',
      template: '<div />',
      setup: () => ({
        canvas: markRaw({
          contextContainer: {},
          freeDrawingBrush: { pressureManager: {} },
          add: () => {},
          clear: () => {},
          discardActiveObject: () => {},
          getActiveObject: () => null,
          getObjects: () => [],
          off: () => {},
          on: () => {},
          remove: () => {},
          renderAll: () => {},
          requestRenderAll: () => {}
        }),
        overlay: ref(null)
      })
    }

    it('clears the pencil restore after a move to a picture', async () => {
      await mountWithFakeTimers(
        [picture, { ...picture, id: 'shot-3', preview_file_id: 'preview-3' }],
        { AnnotationCanvas }
      )
      wrapper
        .findComponent({ name: 'PlayerAnnotationBar' })
        .vm.$emit('pencil-annotate-clicked')
      await flushPromises()
      const pending = vi.getTimerCount()
      findButton('playlists.actions.next_shot').vm.$emit('click')
      await flushPromises()
      expectClearedOnClose(pending)
    })

    it('clears the frame jump of a clicked timecode', async () => {
      const shot = {
        ...entity,
        preview_file_task_id: 'task-1',
        preview_files: {
          'task-type-1': [{ id: 'preview-1', revision: 2, extension: 'mp4' }]
        }
      }
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      wrapper = mountPlayer({
        entities: [shot],
        taskMap: new Map([['task-1', { id: 'task-1', task_type_id: 'task-type-1' }]]),
        stubs: {
          TaskInfo: { name: 'TaskInfo', ...withMethods(['focusCommentTextarea']) }
        }
      })
      await flushPromises()
      const pending = vi.getTimerCount()

      wrapper
        .findComponent({ name: 'TaskInfo' })
        .vm.$emit('time-code-clicked', { versionRevision: '2', frame: 12 })
      await flushPromises()

      expectClearedOnClose(pending)
    })
  })

  // The built movie keeps loading once the player is closed, and its end can
  // be queued right before the close.
  it('ignores the end of the built movie once closed', async () => {
    // jsdom plays no media
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    wrapper = mountPlayer()
    await flushPromises()
    wrapper.vm.isFullMode = true
    await flushPromises()
    const builtMovie = wrapper.find('video').element
    const errors = []
    const onError = event => {
      errors.push(event.error)
      event.preventDefault()
    }
    window.addEventListener('error', onError)
    wrapper.unmount()
    wrapper = null

    builtMovie.dispatchEvent(new Event('ended'))
    window.removeEventListener('error', onError)

    expect(errors).toEqual([])
  })

  // The mount hook adds its window and document listeners a tick later:
  // a player closed within that tick kept them, its Shift+Tab one included.
  it('adds no page listener once closed in the tick it opened', async () => {
    wrapper = mountPlayer()
    const onWindow = vi.spyOn(window, 'addEventListener')
    const onDocument = vi.spyOn(document, 'addEventListener')
    wrapper.unmount()
    wrapper = null

    await flushPromises()

    expect(onWindow).not.toHaveBeenCalled()
    expect(onDocument).not.toHaveBeenCalled()
  })

  // As the task panel does: a next visit comes back muted, and the volume
  // kept is not the 0 the mute set.
  describe('mute', () => {
    const movie = { ...entity, preview_file_extension: 'mp4' }
    const playbackBar = () =>
      wrapper.findComponent({ name: 'PlayerPlaybackBar' })

    it('keeps the mute for the next visit', async () => {
      wrapper = mountPlayer({ entities: [movie] })
      await flushPromises()

      playbackBar().vm.$emit('update:isMuted', true)
      await flushPromises()

      expect(localStorage.getItem('player:muted')).toBe('true')
    })

    it('comes back muted from the previous visit', async () => {
      localStorage.setItem('player:muted', 'true')
      localStorage.setItem('player:volume', '0')
      wrapper = mountPlayer({ entities: [movie] })
      await flushPromises()

      expect(playbackBar().props('isMuted')).toBe(true)
      expect(playbackBar().props('volume')).toBe(50)
    })

    // ButtonSound gives back 50 on an unmute, the volume the page already
    // has after a muted visit: no volume change follows.
    it('keeps the volume of an unmute for the next visit', async () => {
      localStorage.setItem('player:muted', 'true')
      localStorage.setItem('player:volume', '0')
      wrapper = mountPlayer({ entities: [movie] })
      await flushPromises()

      playbackBar().vm.$emit('update:isMuted', false)
      await flushPromises()

      expect(localStorage.getItem('player:muted')).toBe('false')
      expect(localStorage.getItem('player:volume')).toBe('50')
    })

    // The task panel shares both keys: a mute stored by another player must
    // not outlive a volume set here.
    it('stores the mute with the volume', async () => {
      wrapper = mountPlayer({ entities: [movie] })
      await flushPromises()
      localStorage.setItem('player:muted', 'true')

      playbackBar().vm.$emit('update:volume', 70)
      await flushPromises()

      expect(localStorage.getItem('player:volume')).toBe('70')
      expect(localStorage.getItem('player:muted')).toBe('false')
    })

    // Unmuted, a stored 0 can only be what an unmute left before it stored
    // its volume.
    it('reads an unmuted volume of 0 as the default', async () => {
      localStorage.setItem('player:muted', 'false')
      localStorage.setItem('player:volume', '0')
      wrapper = mountPlayer({ entities: [movie] })
      await flushPromises()

      expect(playbackBar().props('isMuted')).toBe(false)
      expect(playbackBar().props('volume')).toBe(50)
    })
  })

  // A plain link navigates the tab: the browser fires beforeunload, which
  // closes the socket in Firefox and asks about unsaved annotations.
  describe('downloads', () => {
    it.each([
      ['the current file', '/api/pictures/originals/preview-files/preview-1/download'],
      ['the playlist CSV', '/api/export/csv/playlists/playlist-1'],
      ['a built movie', '/api/data/playlists/playlist-1/jobs/job-1/build/mp4']
    ])('downloads %s without leaving the page', async (_, href) => {
      wrapper = mountPlayer()
      await flushPromises()
      expect(wrapper.get(`a[href="${href}"]`).attributes('download')).toBe('')
    })

    // Zou builds the zip while it answers: a new tab shows the wait and
    // keeps the player tab out of the navigation.
    it('opens the playlist zip in a new tab', async () => {
      wrapper = mountPlayer()
      await flushPromises()
      const zip = wrapper.get(
        'a[href="/api/data/playlists/playlist-1/download/zip"]'
      )
      expect(zip.attributes('target')).toBe('_blank')
      expect(zip.attributes('rel')).toBe('noopener noreferrer')
      expect(zip.attributes('download')).toBeUndefined()
    })
  })

  // The trim belongs to the shot, not to a revision: an end handle left at
  // the clip end must not pin the length of the revision on screen, or a
  // longer revision would stop at that length.
  describe('trim handles', () => {
    // 69 frames at 25 fps.
    const movie = {
      id: 'shot-1',
      preview_file_id: 'preview-1',
      preview_file_extension: 'mp4',
      preview_file_duration: 2.76,
      preview_file_task_id: 'task-1'
    }

    // The handles are set once the movie metadata gives the duration.
    const mountShotPlayer = async (data, options = {}) => {
      wrapper = mountPlayer({
        playlistProp: { ...playlist, for_entity: 'shot' },
        entities: [movie],
        shotMap: new Map([['shot-1', { id: 'shot-1', data }]]),
        ...options
      })
      await flushPromises()
      wrapper
        .findComponent({ ref: 'raw-player' })
        .vm.$emit('max-duration-update', movie.preview_file_duration)
      await flushPromises()
    }

    const savedData = () =>
      wrapper.vm.$store.dispatch.mock.calls.find(
        ([action]) => action === 'editShot'
      )?.[1].data

    const progressBar = () => wrapper.findComponent({ ref: 'video-progress' })

    const dragHandle = (event, frameNumber) =>
      progressBar().vm.$emit(event, { frameNumber, save: true })

    it('leaves the end untrimmed when only the start handle moves', async () => {
      await mountShotPlayer({ fps: 25 })
      dragHandle('handle-in-changed', 5)
      expect(savedData()).toEqual({ fps: 25, handle_in: 5 })
    })

    it('clears the end trim when its handle goes back to the clip end', async () => {
      await mountShotPlayer({ handle_in: 5, handle_out: 60 })
      dragHandle('handle-out-changed', 69)
      expect(savedData()).toEqual({ handle_in: 5, handle_out: null })
    })

    it('saves an end handle moved inside the clip', async () => {
      await mountShotPlayer({})
      dragHandle('handle-out-changed', 60)
      expect(savedData()).toEqual({ handle_out: 60 })
    })

    it('keeps an end trim when the start handle moves', async () => {
      await mountShotPlayer({ handle_out: 60 })
      dragHandle('handle-in-changed', 5)
      expect(savedData()).toEqual({ handle_in: 5, handle_out: 60 })
    })

    // A trim set on a longer revision lies past the end of this one.
    it('keeps an end trim set on a longer revision when the start handle moves', async () => {
      await mountShotPlayer({ handle_out: 80 })
      dragHandle('handle-in-changed', 5)
      expect(savedData()).toEqual({ handle_in: 5, handle_out: 80 })
    })

    // Zou lets admins, and the managers and department-less supervisors of
    // the production team, trim a shot.
    it.each([
      ['editable for a user who may trim the shot', true],
      ['frozen for a user Zou refuses the trim to', false]
    ])('keeps the handles %s', async (_, isAllowed) => {
      await mountShotPlayer({}, { canEditShotTrim: () => isAllowed })
      expect(progressBar().props('readOnly')).toBe(!isAllowed)
    })

    // The bar still ends a drag started before the handles froze.
    it.each([
      ['start', 'handle-in-changed', 5, 'handleIn', 0],
      ['end', 'handle-out-changed', 60, 'handleOut', 69]
    ])(
      'ignores the %s handle moved by a user Zou refuses the trim to',
      async (_, event, frameNumber, prop, value) => {
        await mountShotPlayer({}, { canEditShotTrim: () => false })
        dragHandle(event, frameNumber)
        await flushPromises()
        expect(savedData()).toBeUndefined()
        expect(progressBar().props(prop)).toBe(value)
      }
    )

    // A temporary playlist can mix shots of several productions.
    it('checks the trim right on the task of the shot on screen', async () => {
      const task = { id: 'task-1', project_id: 'production-2' }
      const canEditShotTrim = vi.fn(() => true)
      await mountShotPlayer(
        {},
        { canEditShotTrim, taskMap: new Map([[task.id, task]]) }
      )
      expect(canEditShotTrim).toHaveBeenCalledWith(task)
    })

    it('keeps a failed save from going unhandled', async () => {
      const rejections = []
      const onRejection = reason => rejections.push(reason)
      process.on('unhandledRejection', onRejection)
      vi.spyOn(console, 'error').mockImplementation(() => {})
      await mountShotPlayer({})
      // Not a vi.fn: it handles the promises it returns, to record how they
      // settle, so a rejection from it never counts as unhandled.
      wrapper.vm.$store.dispatch = action =>
        action === 'editShot'
          ? Promise.reject(new Error('forbidden'))
          : Promise.resolve()

      dragHandle('handle-in-changed', 5)
      // Node reports a rejected promise once the microtask queue drained.
      await new Promise(resolve => setTimeout(resolve))
      process.off('unhandledRejection', onRejection)

      expect(rejections).toEqual([])
    })
  })

  // Zou builds the files of an uploaded preview in a job, and its picture
  // routes answer 404 until the preview file is ready.
  describe('previews being processed', () => {
    const picture = {
      id: 'shot-2',
      preview_file_id: 'preview-2',
      preview_file_extension: 'png'
    }

    const pictureWithExtra = {
      ...picture,
      preview_file_previews: [{ id: 'preview-3', extension: 'png' }]
    }

    const viewerStatuses = () =>
      wrapper
        .findComponent({ ref: 'picture-player' })
        .props('previews')
        .map(({ status }) => status)

    it('registers the statuses of the revisions its entries can play', async () => {
      const subPreview = { id: 'preview-3', status: 'processing' }
      const revision = {
        id: 'preview-2',
        status: 'processing',
        previews: [subPreview]
      }
      const olderRevision = { id: 'preview-4', status: 'ready', previews: [] }
      const otherTaskRevision = { id: 'preview-5', status: 'broken' }
      wrapper = mountPlayer({
        entities: [
          {
            ...picture,
            preview_files: {
              'task-type-1': [revision, olderRevision],
              'task-type-2': [otherTaskRevision]
            }
          },
          entity
        ]
      })
      await flushPromises()
      expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith(
        'registerPreviewFileStatuses',
        [revision, subPreview, olderRevision, otherTaskRevision]
      )
    })

    // The playlist page pushes an added entry into the list it handed over.
    it('registers the revisions of an entry added to the playlist', async () => {
      const entities = reactive([entity])
      wrapper = mountPlayer({ entities })
      await flushPromises()
      const revision = { id: 'preview-2', status: 'processing', previews: [] }
      entities.push({ ...picture, preview_files: { 'task-type-1': [revision] } })
      await flushPromises()
      expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith(
        'registerPreviewFileStatuses',
        [revision]
      )
    })

    it('gives the picture viewers the status the registry knows', async () => {
      const previewFileStatusMap = reactive(
        new Map([
          ['preview-2', 'processing'],
          ['preview-3', 'processing']
        ])
      )
      wrapper = mountPlayer({
        entities: [pictureWithExtra],
        previewFileStatusMap
      })
      await flushPromises()
      expect(viewerStatuses()).toEqual(['processing', 'processing'])

      previewFileStatusMap.set('preview-2', 'ready')
      await flushPromises()
      expect(viewerStatuses()).toEqual(['ready', 'processing'])
    })

    // The viewers take a preview without a status as ready.
    it('gives the picture viewers no status without a registry', async () => {
      wrapper = mountPlayer({ entities: [pictureWithExtra] })
      await flushPromises()
      expect(viewerStatuses()).toEqual([undefined, undefined])
    })
  })

  describe('finger gestures', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it.each([
      ['pencil', 'pencil-annotate-clicked'],
      ['eraser', 'erase-clicked'],
      ['shape', 'shape-mode-clicked'],
      ['text', 'type-clicked']
    ])('hands a finger on the annotations to the %s', async (tool, click) => {
      wrapper = mountPlayer({
        entities: [{ ...entity, preview_file_extension: 'mp4' }],
        stubs: { AnnotationCanvas: annotationCanvasStub(createFakeCanvas()) }
      })
      await flushPromises()
      wrapper.findComponent({ name: 'PlayerAnnotationBar' }).vm.$emit(click)
      await flushPromises()
      const upper = wrapper
        .findComponent({ ref: 'main-annotation-canvas' })
        .find('canvas').element
      const heard = []
      upper.addEventListener('pointerdown', event =>
        heard.push(event.pointerType)
      )

      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      pointer(upper, 'pointerdown', { id: 1, x: 100, y: 100 })
      pointer(upper, 'pointermove', { id: 1, x: 105, y: 100 })
      vi.advanceTimersByTime(300)

      expect(heard).toEqual(['touch'])
    })
  })

  // On a phone the keyboard resizes the player as it opens: the canvas
  // reset ended the typing of the note at once.
  // The right arrow wipes the canvas, then the frame the movie steps to
  // reloads its drawing. The movie stops at its last frame: nothing reloaded
  // the drawing there.
  describe('right arrow', () => {
    // 69 frames at 25 fps.
    const mountOnFrame = async frame => {
      const canvas = createFakeCanvas()
      wrapper = mountPlayer({
        entities: [
          {
            ...entity,
            preview_file_extension: 'mp4',
            preview_file_duration: 2.76
          }
        ],
        stubs: { AnnotationCanvas: annotationCanvasStub(canvas) }
      })
      await flushPromises()
      const rawPlayer = wrapper.findComponent({ ref: 'raw-player' })
      rawPlayer.vm.getCurrentTimeRaw = () => frame * 0.04
      canvas.clear.mockClear()
      return { canvas, rawPlayer }
    }

    const press = () =>
      window.dispatchEvent(
        new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight' })
      )

    it('keeps the drawing of the last frame', async () => {
      const { canvas } = await mountOnFrame(68)

      press()

      expect(canvas.clear).not.toHaveBeenCalled()
    })

    it('steps a movie one frame', async () => {
      const { canvas, rawPlayer } = await mountOnFrame(10)
      const goNextFrame = vi.fn()
      rawPlayer.vm.goNextFrame = goNextFrame

      press()

      expect(goNextFrame).toHaveBeenCalledTimes(1)
      expect(canvas.clear).toHaveBeenCalled()
    })
  })

  // Home and End moved the movie without its annotations: the drawing of
  // the frame left stayed on the one reached. The drawing keys (, and .)
  // wiped the canvas even with no drawing to go to.
  describe('frame keys', () => {
    const drawingAt = (time, id) => ({
      time,
      drawing: {
        objects: [
          {
            id,
            type: 'path',
            path: 'M 0 0 L 10 10',
            left: 100,
            top: 50,
            scaleX: 1,
            scaleY: 1,
            stroke: '#ff0000',
            strokeWidth: 2,
            canvasWidth: 800,
            canvasHeight: 600
          }
        ]
      }
    })

    // 69 frames at 25 fps, drawn on the first and on the last one.
    const movie = {
      ...entity,
      preview_file_extension: 'mp4',
      preview_file_duration: 2.76,
      preview_file_annotations: [drawingAt(0, 'first'), drawingAt(2.72, 'last')]
    }

    const mountShowing = async shown => {
      const canvas = createFakeCanvas()
      wrapper = mountPlayer({
        entities: [shown],
        stubs: { AnnotationCanvas: annotationCanvasStub(canvas) }
      })
      await flushPromises()
      return canvas
    }

    const press = async code => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code }))
      await flushPromises()
    }

    const drawnIds = canvas => canvas.add.mock.calls.map(([object]) => object.id)

    it('shows the drawing of the last frame on End', async () => {
      const canvas = await mountShowing(movie)
      canvas.add.mockClear()
      canvas.clear.mockClear()

      await press('End')

      expect(canvas.clear).toHaveBeenCalled()
      expect(drawnIds(canvas)).toEqual(['last'])
    })

    it('shows the drawing of the first frame on Home', async () => {
      const canvas = await mountShowing(movie)
      await press('End')
      canvas.add.mockClear()
      canvas.clear.mockClear()

      await press('Home')

      expect(canvas.clear).toHaveBeenCalled()
      expect(drawnIds(canvas)).toEqual(['first'])
    })

    it.each([
      [',', 'Home'],
      ['.', 'End']
    ])('keeps the drawing with no other one to go to on %s', async (key, start) => {
      const canvas = await mountShowing(movie)
      await press(start)
      canvas.clear.mockClear()

      await press(key)

      expect(canvas.clear).not.toHaveBeenCalled()
    })

    it('takes a movie to its next drawing on .', async () => {
      const canvas = await mountShowing(movie)
      canvas.add.mockClear()

      await press('.')

      expect(drawnIds(canvas)).toEqual(['last'])
    })

    // Chromium can land an exact seek on the start of the last frame at the
    // very end of the movie, whose ended event started the next entry.
    it.each([
      ['.', '.', 68],
      [',', 'End', 30]
    ])('seeks a drawing like the progress bar on %s', async (key, start, frame) => {
      await mountShowing({
        ...movie,
        preview_file_annotations: [
          drawingAt(0, 'first'),
          drawingAt(1.2, 'middle'),
          drawingAt(2.72, 'last')
        ]
      })
      await press(start)
      const rawPlayer = wrapper.findComponent({ ref: 'raw-player' }).vm
      rawPlayer.setCurrentFrame = vi.fn()
      rawPlayer.setCurrentTimeRaw = vi.fn()

      await press(key)

      expect(rawPlayer.setCurrentFrame).toHaveBeenCalledWith(frame)
      expect(rawPlayer.setCurrentTimeRaw).not.toHaveBeenCalledWith(frame / 25)
    })

    // A drawing is saved on frame * frameDuration, 0.0333 at 30 fps, which
    // runs 0.001 s a frame behind the movie time: 50 s in, a step showed
    // the drawing of 2 frames before.
    it.each(['ArrowRight', 'ArrowLeft'])(
      'shows the drawing of the frame reached on %s far into a movie',
      async key => {
        const canvas = await mountShowing({
          ...movie,
          fps: '30',
          preview_file_duration: 60,
          preview_file_annotations: [
            drawingAt(1498 * 0.0333, 'before'),
            drawingAt(1500 * 0.0333, 'reached')
          ]
        })
        const rawPlayer = wrapper.findComponent({ ref: 'raw-player' }).vm
        const step = () => rawPlayer.$emit('frame-update', 1500)
        rawPlayer.goNextFrame = step
        rawPlayer.goPreviousFrame = step
        rawPlayer.getCurrentTime = () => 1500 / 30 + 0.001
        canvas.add.mockClear()

        await press(key)

        expect(drawnIds(canvas)).toEqual(['reached'])
      }
    )

    const togglePlayback = () =>
      window.dispatchEvent(
        new KeyboardEvent('keydown', { code: 'Space', key: ' ' })
      )

    // The viewer pauses on the frame on screen and sends it: the movie
    // time can still read the frame before.
    it('shows the drawing of the frame the movie pauses on', async () => {
      const canvas = await mountShowing(movie)
      const rawPlayer = wrapper.findComponent({ ref: 'raw-player' }).vm
      rawPlayer.getCurrentTime = () => 2.69
      rawPlayer.getCurrentTimeRaw = () => 2.69
      rawPlayer.pause = () => rawPlayer.$emit('frame-update', 68)
      rawPlayer.isPlaying = true
      togglePlayback()
      await flushPromises()
      canvas.add.mockClear()

      togglePlayback()
      await flushPromises()

      expect(drawnIds(canvas)).toEqual(['last'])
    })

    // A second seek, to the next frame boundary, landed after the one of
    // the viewer: the picture moved off the frame on the counter.
    it('leaves the pause of the movie to its viewer', async () => {
      await mountShowing(movie)
      const rawPlayer = wrapper.findComponent({ ref: 'raw-player' }).vm
      rawPlayer.pause = vi.fn()
      rawPlayer.setCurrentTimeRaw = vi.fn()
      rawPlayer.isPlaying = true
      togglePlayback()
      await flushPromises()

      togglePlayback()
      await flushPromises()

      expect(rawPlayer.pause).toHaveBeenCalled()
      expect(rawPlayer.setCurrentTimeRaw).not.toHaveBeenCalled()
    })

    // As in the preview player: loading the drawing would pause the movie.
    it.each([
      ['Home', 0],
      ['End', 68]
    ])('keeps a movie playing on %s', async (key, frame) => {
      await mountShowing(movie)
      const rawPlayer = wrapper.findComponent({ ref: 'raw-player' }).vm
      rawPlayer.isPlaying = true
      rawPlayer.pause = vi.fn()
      rawPlayer.setCurrentFrame = vi.fn()
      window.dispatchEvent(
        new KeyboardEvent('keydown', { code: 'Space', key: ' ' })
      )
      await flushPromises()

      await press(key)

      expect(rawPlayer.setCurrentFrame).toHaveBeenCalledWith(frame)
      expect(rawPlayer.pause).not.toHaveBeenCalled()
    })

    it.each(['Home', 'End'])('leaves a picture as it is on %s', async key => {
      const canvas = await mountShowing({
        ...entity,
        preview_file_extension: 'png',
        preview_file_annotations: [drawingAt(0, 'picture')]
      })
      canvas.clear.mockClear()

      await press(key)

      expect(canvas.clear).not.toHaveBeenCalled()
    })

    // The built movie of the playlist plays instead of the one of the entry.
    it.each(['Home', 'End'])('leaves the full mode as it is on %s', async key => {
      // jsdom plays no media
      vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
      const canvas = await mountShowing(movie)
      wrapper.vm.isFullMode = true
      await flushPromises()
      canvas.clear.mockClear()

      await press(key)

      expect(canvas.clear).not.toHaveBeenCalled()
    })
  })

  describe('client', () => {
    const zipLink = () =>
      wrapper.find(
        '.playlist-header a[href="/api/data/playlists/playlist-1/download/zip"]'
      )

    it('keeps the task type change and the download menu from a client', async () => {
      wrapper = mountPlayer({ isClient: true })
      await flushPromises()
      expect(
        wrapper.find('[title="playlists.actions.change_task_type"]').exists()
      ).toBe(false)
      expect(wrapper.find('[title="playlists.actions.download"]').exists()).toBe(
        false
      )
    })

    it('keeps the onion skin from a client', async () => {
      wrapper = mountPlayer({ isClient: true })
      await flushPromises()
      const bar = wrapper.findComponent({ name: 'PlayerAnnotationBar' })
      expect(bar.props('isOnionSkinOn')).toBeUndefined()
    })

    it('keeps the comparison bar from a client', async () => {
      wrapper = mountPlayer({
        entities: [{ ...entity, preview_file_extension: 'png' }],
        isClient: true
      })
      await flushPromises()
      expect(
        wrapper.findComponent({ name: 'PlayerComparisonBar' }).exists()
      ).toBe(false)
    })

    it('keeps the waveform and annotation toggles from a client', async () => {
      wrapper = mountPlayer({ isClient: true })
      await flushPromises()
      expect(
        wrapper
          .findComponent({ name: 'PlayerPlaybackBar' })
          .props('isWaveformDisplayed')
      ).toBeUndefined()
      expect(
        wrapper
          .findComponent({ name: 'PlayerAnnotationBar' })
          .props('isAnnotationsDisplayed')
      ).toBeUndefined()
    })

    it('offers the playlist zip in the header to a client only', async () => {
      wrapper = mountPlayer({ isClient: true })
      await flushPromises()
      expect(zipLink().attributes('target')).toBe('_blank')
      wrapper.unmount()

      wrapper = mountPlayer()
      await flushPromises()
      expect(zipLink().exists()).toBe(false)
    })
  })

  describe('comment panel height', () => {
    // The panel is an async component: it mounts after the player has
    // sized its media once, as for a client, who gets it open on load.
    it('sizes a panel that mounts after the media', async () => {
      wrapper = mountPlayer({
        isClient: true,
        stubs: {
          TaskInfo: defineAsyncComponent(() =>
            Promise.resolve(withMethods(['focusCommentTextarea']))
          )
        }
      })
      // The first sizing reads the player root on the next tick.
      Object.defineProperty(wrapper.element, 'offsetHeight', {
        get: () => 600
      })
      await flushPromises()
      await flushPromises()

      expect(wrapper.find('.video-container').element.style.height).toBe(
        '600px'
      )
      expect(wrapper.find('.task-info-column').element.style.height).toBe(
        '600px'
      )
    })
  })

  describe('window resize', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    const mountPicture = async () => {
      const canvas = createFakeCanvas()
      wrapper = mountPlayer({
        entities: [{ ...entity, preview_file_extension: 'png' }],
        stubs: { AnnotationCanvas: annotationCanvasStub(canvas) }
      })
      await flushPromises()
      // A 1920 x 1080 picture in an 800 x 450 player.
      const videoContainer = wrapper.find('.video-container').element
      const size = { width: 800, height: 450 }
      Object.defineProperties(videoContainer, {
        offsetWidth: { get: () => size.width },
        offsetHeight: { get: () => size.height }
      })
      const anchor = wrapper.find('.main-content-anchor').element
      return { canvas, size, anchor }
    }

    // The player handles one resize per 100 ms.
    const resize = async () => {
      window.dispatchEvent(new Event('resize'))
      await vi.advanceTimersByTimeAsync(200)
      await flushPromises()
    }

    it('leaves a note being typed', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
      const { canvas } = await mountPicture()
      canvas.getActiveObject.mockReturnValue({ isEditing: true })
      canvas.clear.mockClear()

      await resize()

      expect(canvas.clear).not.toHaveBeenCalled()
    })

    it('keeps the overlay on the picture while a note is typed', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
      const { canvas, size, anchor } = await mountPicture()
      await resize()
      const before = anchor.style.width
      canvas.getActiveObject.mockReturnValue({ isEditing: true })
      size.height = 225

      await vi.advanceTimersByTimeAsync(200)
      await resize()

      expect([before, anchor.style.width]).toEqual(['800px', '400px'])
    })
  })

  describe('on a phone', () => {
    const PORTRAIT = '(max-width: 768px)'
    const LANDSCAPE = '(max-height: 500px) and (orientation: landscape)'
    let mediaLists = {}

    const stubPhone = ({ portrait = false, landscape = false } = {}) => {
      const matches = { [PORTRAIT]: portrait, [LANDSCAPE]: landscape }
      mediaLists = {}
      window.matchMedia = query => {
        const listeners = []
        mediaLists[query] = {
          matches: Boolean(matches[query]),
          listeners,
          addEventListener: (name, listener) => listeners.push(listener),
          removeEventListener: () => {}
        }
        return mediaLists[query]
      }
    }

    const movie = { ...entity, preview_file_extension: 'mp4' }
    const mountTemp = (options = {}) =>
      mountPlayer({
        entities: [movie],
        ...options,
        props: { tempMode: true, ...options.props }
      })

    // The file controls live in the extra-controls slot of the bar.
    const PlaybackBarWithSlot = {
      name: 'PlayerPlaybackBar',
      template: '<div><slot name="extra-controls" /></div>',
      props: { isHd: Boolean, phone: Boolean }
    }

    afterEach(() => {
      delete window.matchMedia
      vi.useRealTimers()
    })

    it('shows the comments and plays the low definition', async () => {
      stubPhone({ portrait: true })
      wrapper = mountTemp({ organisation: { hd_by_default: true } })
      await flushPromises()
      expect(wrapper.find('.task-info-column').isVisible()).toBe(true)
      expect(
        wrapper.findComponent({ name: 'PlayerPlaybackBar' }).props('isHd')
      ).toBe(false)
    })

    it('passes the phone mode to the bars', async () => {
      stubPhone({ portrait: true })
      wrapper = mountTemp()
      await flushPromises()
      expect(
        wrapper.findComponent({ name: 'PlayerPlaybackBar' }).props('phone')
      ).toBe(true)
      expect(
        wrapper.findComponent({ name: 'PlayerAnnotationBar' }).props('phone')
      ).toBe(true)
      expect(wrapper.classes()).toContain('phone')
    })

    it('drops the comparison and the save', async () => {
      stubPhone({ portrait: true })
      wrapper = mountTemp({ props: { canSave: true } })
      await flushPromises()
      expect(wrapper.findComponent({ name: 'PlayerComparisonBar' }).exists()).toBe(
        false
      )
      expect(wrapper.find('[icon="save"]').exists()).toBe(false)
    })

    it('keeps the file controls of a multi-file version', async () => {
      stubPhone({ portrait: true })
      wrapper = mountTemp({
        entities: [{ ...movie, preview_file_previews: [{ id: 'preview-2' }] }],
        stubs: { PlayerPlaybackBar: PlaybackBarWithSlot }
      })
      await flushPromises()
      expect(wrapper.find('[icon="left"]').exists()).toBe(true)
      expect(wrapper.find('[icon="right"]').exists()).toBe(true)
    })

    it('drops the separators of the bar on a phone', async () => {
      stubPhone({ portrait: true })
      wrapper = mountTemp({
        stubs: { PlayerPlaybackBar: PlaybackBarWithSlot }
      })
      await flushPromises()
      expect(wrapper.find('.playlist-footer .separator').exists()).toBe(false)
    })

    it('hides the entity strip in landscape', async () => {
      stubPhone({ landscape: true })
      wrapper = mountTemp()
      await flushPromises()
      expect(wrapper.find('.playlisted-entities').classes()).toContain('hidden')
      expect(wrapper.classes()).toEqual(
        expect.arrayContaining(['phone', 'phone-landscape'])
      )
    })

    describe('media height', () => {
      const mediaHeight = () =>
        wrapper.find('.video-container').element.style.height
      const RESIZE_WAIT = 350

      beforeEach(() => {
        vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(
          360
        )
      })

      it('sizes the media from the width in portrait', async () => {
        stubPhone({ portrait: true })
        wrapper = mountTemp()
        await flushPromises()
        expect(mediaHeight()).toBe('203px')
      })

      it('keeps the media height when the keyboard opens', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        stubPhone({ portrait: true })
        wrapper = mountTemp()
        await flushPromises()
        vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(
          720
        )
        window.dispatchEvent(new Event('resize'))
        await vi.advanceTimersByTimeAsync(RESIZE_WAIT)
        await flushPromises()
        expect(mediaHeight()).toBe('203px')
      })

      it('resizes the media when the strip opens in landscape', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        stubPhone({ landscape: true })
        wrapper = mountTemp()
        await flushPromises()
        const innerHeight = window.innerHeight
        window.innerHeight = 500
        await wrapper.find('[icon="film"]').trigger('click')
        await vi.advanceTimersByTimeAsync(RESIZE_WAIT)
        await flushPromises()
        expect(mediaHeight()).toBe('500px')
        window.innerHeight = innerHeight
      })

      it('resizes the media and folds the strip on a rotation', async () => {
        stubPhone({ portrait: true })
        wrapper = mountTemp()
        await flushPromises()
        mediaLists[LANDSCAPE].matches = true
        mediaLists[LANDSCAPE].listeners.forEach(listener =>
          listener({ matches: true })
        )
        await flushPromises()
        expect(mediaHeight()).toBe(`${window.innerHeight}px`)
        expect(wrapper.find('.playlisted-entities').classes()).toContain(
          'hidden'
        )
      })
    })

    describe('full screen', () => {
      const fullScreenButton = () =>
        wrapper.find('[title="playlists.actions.fullscreen"]')
      // v-show writes the inline display: jsdom computes a detached
      // element as hidden after a toggle
      const isPanelShown = () =>
        wrapper.find('.task-info-column').element.style.display !== 'none'

      it('offers the full screen in both orientations', async () => {
        stubPhone({ portrait: true })
        wrapper = mountTemp()
        await flushPromises()
        expect(fullScreenButton().exists()).toBe(true)
        wrapper.unmount()

        stubPhone({ landscape: true })
        wrapper = mountTemp()
        await flushPromises()
        expect(fullScreenButton().exists()).toBe(true)
      })

      it('gives the media the whole height in portrait', async () => {
        stubPhone({ portrait: true })
        vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(
          360
        )
        wrapper = mountTemp()
        await flushPromises()
        await fullScreenButton().trigger('click')
        await flushPromises()
        expect(wrapper.classes()).toContain('phone-full-screen')
        expect(isPanelShown()).toBe(false)
        expect(wrapper.find('.video-container').element.style.height).toBe(
          `${window.innerHeight}px`
        )
      })

      it('goes full screen in the page', async () => {
        stubPhone({ landscape: true })
        wrapper = mountTemp()
        await flushPromises()

        await fullScreenButton().trigger('click')
        expect(wrapper.classes()).toContain('phone-full-screen')
        expect(isPanelShown()).toBe(false)

        await fullScreenButton().trigger('click')
        expect(wrapper.classes()).not.toContain('phone-full-screen')
        expect(isPanelShown()).toBe(true)
      })

      it('leaves the full screen on a rotation to portrait', async () => {
        stubPhone({ landscape: true })
        wrapper = mountTemp()
        await flushPromises()
        await fullScreenButton().trigger('click')

        mediaLists[LANDSCAPE].matches = false
        mediaLists[LANDSCAPE].listeners.forEach(listener =>
          listener({ matches: false })
        )
        mediaLists[PORTRAIT].matches = true
        mediaLists[PORTRAIT].listeners.forEach(listener =>
          listener({ matches: true })
        )
        await flushPromises()
        expect(wrapper.classes()).not.toContain('phone-full-screen')
        expect(isPanelShown()).toBe(true)
      })
    })

    it('hides the entity counter on a phone', async () => {
      stubPhone({ portrait: true })
      wrapper = mountTemp()
      await flushPromises()
      expect(
        wrapper.find('[title="playlists.actions.entity_index"]').exists()
      ).toBe(false)
      expect(
        wrapper.find('[title="playlists.actions.next_shot"]').exists()
      ).toBe(true)
    })

    it('hides the assignees of the comment panel on a phone', async () => {
      stubPhone({ portrait: true })
      wrapper = mountTemp()
      await flushPromises()
      expect(
        wrapper.find('.task-info-column').attributes('show-assignees')
      ).toBe('false')
    })

    it('leaves the playlist page alone on a phone', async () => {
      stubPhone({ portrait: true })
      wrapper = mountPlayer({ entities: [movie] })
      await flushPromises()
      expect(wrapper.classes()).not.toContain('phone')
      expect(
        wrapper.findComponent({ name: 'PlayerPlaybackBar' }).props('phone')
      ).toBe(false)
    })

    // resetHeight clears the canvas: a resize must load the drawings again
    it('reloads the annotations after a resize on a phone', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      stubPhone({ portrait: true })
      const canvas = createFakeCanvas()
      wrapper = mountTemp({
        stubs: { AnnotationCanvas: annotationCanvasStub(canvas) }
      })
      await flushPromises()
      await vi.advanceTimersByTimeAsync(350)
      canvas.clear.mockClear()
      window.dispatchEvent(new Event('resize'))
      await vi.advanceTimersByTimeAsync(350)
      await flushPromises()
      expect(canvas.clear).toHaveBeenCalled()
    })

    it('lays the player out again when the window turns into a phone', async () => {
      stubPhone()
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(360)
      wrapper = mountTemp()
      await flushPromises()
      mediaLists[PORTRAIT].matches = true
      mediaLists[PORTRAIT].listeners.forEach(listener =>
        listener({ matches: true })
      )
      await flushPromises()
      expect(wrapper.find('.video-container').element.style.height).toBe(
        '203px'
      )
    })

    // detached v-show toggles fool isVisible: read the bound flags instead
    it('opens the comments when the window turns into a phone', async () => {
      stubPhone()
      wrapper = mountTemp()
      await flushPromises()
      const panel = () => wrapper.find('.task-info-column')
      expect(panel().attributes('silent')).toBe('true')
      mediaLists[PORTRAIT].matches = true
      mediaLists[PORTRAIT].listeners.forEach(listener =>
        listener({ matches: true })
      )
      await flushPromises()
      expect(panel().attributes('silent')).toBe('false')
      expect(panel().attributes('style') || '').not.toContain('display: none')
    })

    it('renders as today off a phone', async () => {
      stubPhone()
      wrapper = mountPlayer({
        entities: [movie],
        props: { canSave: true, tempMode: true }
      })
      await flushPromises()
      expect(wrapper.classes()).not.toContain('phone')
      expect(wrapper.findComponent({ name: 'PlayerComparisonBar' }).exists()).toBe(
        true
      )
      expect(
        wrapper.findComponent({ name: 'PlayerPlaybackBar' }).props('phone')
      ).toBe(false)
    })
  })

  // The panel to add entities belongs to the page, outside the full screen:
  // the button leaves the full screen to show it.
  describe('add button in full screen', () => {
    afterEach(() => {
      delete document.fullscreen
      delete document.exitFullscreen
    })

    it.each([
      [false, true],
      [true, false]
    ])(
      'leaves the full screen, panel already open %s, asks the panel %s',
      async (isAddingEntity, isAsked) => {
        document.exitFullscreen = vi.fn(() => Promise.resolve())
        wrapper = mountPlayer({ props: { isAddingEntity } })
        await flushPromises()
        // jsdom has no full screen
        Object.defineProperty(document, 'fullscreen', {
          configurable: true,
          value: true
        })
        wrapper.element.dispatchEvent(new Event('fullscreenchange'))
        await flushPromises()

        wrapper
          .findAllComponents({ name: 'ButtonSimple' })
          .find(button => button.attributes('icon') === 'plus')
          .vm.$emit('click')

        expect(document.exitFullscreen).toHaveBeenCalled()
        expect(Boolean(wrapper.emitted('show-add-entities'))).toBe(isAsked)
      }
    )

    // The full screen ends once the panel shows: the media gets sized while
    // the panel hides it.
    it('sizes the media again as the panel closes', async () => {
      wrapper = mountPlayer({ props: { isAddingEntity: true } })
      await flushPromises()
      const resetHeight = vi.spyOn(
        wrapper.findComponent({ ref: 'raw-player' }).vm,
        'resetHeight'
      )

      await wrapper.setProps({ isAddingEntity: false })
      await flushPromises()

      expect(resetHeight).toHaveBeenCalled()
    })
  })

  // Shift+Tab goes from the player to a comment box. The browser shows the
  // player alone in full screen: a box of the page behind it, like the task
  // panel under a temporary playlist, would take the keys out of sight.
  describe('Shift+Tab', () => {
    let pageForm = null

    const goFullScreen = async () => {
      // jsdom has no full screen
      Object.defineProperty(document, 'fullscreen', {
        configurable: true,
        value: true
      })
      setFullScreenElement(wrapper.element)
      wrapper.element.dispatchEvent(new Event('fullscreenchange'))
      await flushPromises()
    }

    const pressShiftTab = () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true
      })
      document.dispatchEvent(event)
      return event
    }

    const isPanelShown = () =>
      wrapper.find('.task-info-column').element.style.display !== 'none'

    // A comment box of the page, shown: jsdom lays nothing out.
    const addPageBox = ({ disabled = false } = {}) => {
      if (!pageForm) {
        pageForm = document.body.appendChild(document.createElement('div'))
        pageForm.className = 'add-comment'
      }
      const box = pageForm.appendChild(document.createElement('textarea'))
      box.disabled = disabled
      Object.defineProperty(box, 'offsetParent', { value: document.body })
      return box
    }

    // A modal registered with useModal, which the player yields to. In an
    // app of its own: a second mount would swap the stubs of the player. Its
    // container tells what it holds: one holding the player stands for the
    // temporary playlist modal. Its parent is the player in full screen, the
    // page out of it.
    let closeModal = null
    const openModalHost = ({ container = null, parent = document.body } = {}) => {
      const element = parent.appendChild(document.createElement('div'))
      const app = createApp({
        setup: () => {
          useModal(ref(true), vi.fn(), container)
          return () => h('div', { class: 'modal' }, [h('button', 'Cancel')])
        }
      })
      app.mount(element)
      closeModal = () => {
        app.unmount()
        element.remove()
      }
      return flushPromises()
    }

    afterEach(() => {
      delete document.fullscreen
      resetFullScreen()
      pageForm?.remove()
      pageForm = null
      wrapper?.unmount()
      wrapper = null
      closeModal?.()
      closeModal = null
    })

    // The closed panel still holds its box, hidden.
    it('opens its comments in full screen, not a box of the page', async () => {
      const pageBox = addPageBox()
      wrapper = mountPlayer({
        stubs: {
          TaskInfo: {
            ...withMethods(['focusCommentTextarea']),
            template: '<div><div class="add-comment"><textarea /></div></div>'
          }
        }
      })
      await flushPromises()
      const focusCommentTextarea = vi.spyOn(
        wrapper.findComponent({ ref: 'task-info' }).vm,
        'focusCommentTextarea'
      )
      await goFullScreen()

      const event = pressShiftTab()
      await flushPromises()

      expect(event.defaultPrevented).toBe(true)
      expect(document.activeElement).not.toBe(pageBox)
      expect(isPanelShown()).toBe(true)
      expect(focusCommentTextarea).toHaveBeenCalled()
    })

    it('focuses the box of its open comments in full screen', async () => {
      const pageBox = addPageBox()
      wrapper = mountPlayer({
        stubs: {
          TaskInfo: {
            ...withMethods(['focusCommentTextarea']),
            template: '<div><div class="add-comment"><textarea /></div></div>'
          }
        }
      })
      await flushPromises()
      await goFullScreen()
      pressShiftTab()
      await flushPromises()
      expect(isPanelShown()).toBe(true)
      const panelBox = wrapper
        .findComponent({ ref: 'task-info' })
        .find('textarea').element
      // Shown with its comments: jsdom lays nothing out.
      Object.defineProperty(panelBox, 'offsetParent', { value: wrapper.element })
      const focus = vi.spyOn(panelBox, 'focus')

      const event = pressShiftTab()

      expect(event.defaultPrevented).toBe(true)
      expect(document.activeElement).not.toBe(pageBox)
      expect(focus).toHaveBeenCalled()
    })

    // In full screen, a modal over the player sits in it, like the save form
    // of a temporary playlist, and keeps its own Shift+Tab.
    it('leaves Shift+Tab to a modal over it', async () => {
      wrapper = mountPlayer()
      await flushPromises()
      await goFullScreen()
      await openModalHost({ parent: wrapper.element })

      pressShiftTab()
      await flushPromises()

      expect(isPanelShown()).toBe(false)
    })

    // A modal of the page keeps its own Shift+Tab too: its trap wraps the key
    // to its last button.
    it('leaves Shift+Tab to a modal of the page out of full screen', async () => {
      const pageBox = addPageBox()
      wrapper = mountPlayer()
      await flushPromises()
      await openModalHost()

      pressShiftTab()
      await flushPromises()

      expect(document.activeElement).not.toBe(pageBox)
      expect(document.activeElement).toBe(
        document.querySelector('.modal button')
      )
    })

    it('keeps Shift+Tab in a modal holding it, in full screen', async () => {
      wrapper = mountPlayer()
      await flushPromises()
      await goFullScreen()
      await openModalHost({ container: ref(wrapper.element.parentElement) })

      const event = pressShiftTab()
      await flushPromises()

      expect(event.defaultPrevented).toBe(true)
      expect(isPanelShown()).toBe(true)
    })

    // Like the comments button, which an artist does not get.
    it('leaves the comments closed for an artist', async () => {
      wrapper = mountPlayer({ isArtist: true })
      await flushPromises()
      await goFullScreen()

      const event = pressShiftTab()
      await flushPromises()

      expect(event.defaultPrevented).toBe(false)
      expect(isPanelShown()).toBe(false)
    })

    // Like the comments button, which the full mode of a build hides.
    it('leaves the comments closed in full mode', async () => {
      wrapper = mountPlayer()
      await flushPromises()
      wrapper.vm.isFullMode = true
      await goFullScreen()

      const event = pressShiftTab()
      await flushPromises()

      expect(event.defaultPrevented).toBe(false)
      expect(isPanelShown()).toBe(false)
    })

    // A box posting its comment is disabled: Shift+Tab goes past it.
    it('focuses the comment box of the page out of full screen', async () => {
      addPageBox({ disabled: true })
      const pageBox = addPageBox()
      wrapper = mountPlayer()
      await flushPromises()

      const event = pressShiftTab()
      await flushPromises()

      expect(event.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(pageBox)
    })

    it('leaves the comments closed out of full screen', async () => {
      wrapper = mountPlayer()
      await flushPromises()

      const event = pressShiftTab()
      await flushPromises()

      expect(event.defaultPrevented).toBe(false)
      expect(isPanelShown()).toBe(false)
    })

    // Like the panel of an entity without a task, the stub holds no box.
    it('keeps the comments open when they hold no box', async () => {
      wrapper = mountPlayer()
      await flushPromises()
      await goFullScreen()
      pressShiftTab()
      await flushPromises()

      const event = pressShiftTab()
      await flushPromises()

      expect(event.defaultPrevented).toBe(false)
      expect(isPanelShown()).toBe(true)
    })
  })
})
