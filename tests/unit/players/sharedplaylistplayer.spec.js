import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import SharedPlaylistButtonBar from '@/components/players/bars/SharedPlaylistButtonBar.vue'
import SharedPlaylistHeader from '@/components/players/headers/SharedPlaylistHeader.vue'
import SharedPlaylistPlayer from '@/components/players/players/SharedPlaylistPlayer.vue'
import SharedCommentsPanel from '@/components/players/sides/SharedCommentsPanel.vue'

const entity = {
  id: 'entity-1',
  name: 'SH01',
  parent_name: 'SQ01',
  preview_file_id: 'preview-1',
  preview_file_extension: 'mp4',
  preview_file_duration: 4,
  preview_file_width: 1920,
  preview_file_height: 1080
}

const shot = {
  id: 'shot-1',
  name: 'SH010',
  preview_file_id: 'preview-v2',
  preview_file_extension: 'mp4',
  preview_file_duration: 30,
  preview_file_revision: 2,
  preview_file_task_id: 'task-1'
}

const sound = (id, extension) => ({
  id,
  name: id,
  parent_name: 'SQ01',
  preview_file_id: `preview-${id}`,
  preview_file_extension: extension
})

const picture = {
  id: 'picture-1',
  name: 'picture-1',
  preview_file_id: 'preview-picture-1',
  preview_file_extension: 'png'
}

const mountPlayer = ({
  entities = [entity],
  getCurrentFrame = () => 0,
  goNextFrame = () => {},
  goPreviousFrame = () => {},
  loadEntity = () => {},
  setCurrentFrame = () => {},
  playSound = () => {},
  setSoundTime = () => {},
  updateProgressBar = () => {}
} = {}) => {
  const store = createStore({
    getters: { user: () => ({ id: 'guest-1', is_guest: true }) }
  })
  return shallowMount(SharedPlaylistPlayer, {
    props: {
      entities,
      playlist: { name: 'Dailies', project_fps: 25 },
      token: 'token'
    },
    global: {
      mocks: { $t: key => key },
      plugins: [store],
      stubs: {
        // The player drives these through refs; the default stubs have none
        // of their methods.
        MultiVideoViewer: {
          name: 'MultiVideoViewer',
          template: '<div />',
          methods: {
            getCurrentFrame,
            getNaturalDimensions: () => ({ width: 1920, height: 1080 }),
            goNextFrame,
            goPreviousFrame,
            loadEntity,
            pause: () => {},
            resetHeight: () => {},
            resetPanZoom: () => {},
            resumePanZoom: () => {},
            setCurrentFrame,
            setVolume: () => {}
          }
        },
        SoundViewer: {
          name: 'SoundViewer',
          template: '<div />',
          props: { previewUrl: String },
          methods: {
            pause: () => {},
            play: playSound,
            setCurrentTime: setSoundTime
          }
        },
        VideoProgress: {
          name: 'VideoProgress',
          template: '<div />',
          methods: { updateProgressBar }
        }
      }
    }
  })
}

describe('players/SharedPlaylistPlayer', () => {
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
    // jsdom has no Element.scrollTo: the strip follows the playing entity.
    Element.prototype.scrollTo = () => {}
  })

  afterAll(() => {
    vi.unstubAllGlobals()
    delete Element.prototype.scrollTo
  })

  it('counts the frames from the preview duration, like the studio player', async () => {
    // The decoder duration floored to the frame plus the Chromium offset
    // read one frame more than the studio player on the same clip.
    vi.stubGlobal('chrome', {})
    const wrapper = mountPlayer()
    await nextTick()
    wrapper.findComponent({ name: 'MultiVideoViewer' }).vm.$emit(
      'max-duration-update',
      4.02
    )
    await nextTick()
    const bar = wrapper.findComponent({ name: 'SharedPlaylistButtonBar' })
    expect(bar.props('nbFramesDisplay')).toBe('100')
    wrapper.unmount()
  })

  // Like the movie, by a frame of the playlist, up to its last frame.
  describe('sound keys', () => {
    const press = async code => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code }))
      await nextTick()
    }

    it('steps the sound, not the hidden movie', async () => {
      const goNextFrame = vi.fn()
      const goPreviousFrame = vi.fn()
      const setCurrentFrame = vi.fn()
      const setSoundTime = vi.fn()
      const wrapper = mountPlayer({
        entities: [sound('sound-1', 'mp3'), picture],
        goNextFrame,
        goPreviousFrame,
        setCurrentFrame,
        setSoundTime
      })
      const soundViewer = wrapper.findComponent({ name: 'SoundViewer' })
      soundViewer.vm.$emit('duration-changed', 3)
      soundViewer.vm.$emit('time-update', 1.5)
      await nextTick()

      await press('ArrowRight')
      await press('ArrowLeft')
      await press('Home')
      await press('End')
      const times = setSoundTime.mock.calls.map(([time]) => time)
      expect(times).toHaveLength(4)
      expect(times[0]).toBeCloseTo(1.52)
      expect(times[1]).toBeCloseTo(1.44)
      expect(times[2]).toBe(0)
      expect(times[3]).toBeCloseTo(2.96)
      expect(goNextFrame).not.toHaveBeenCalled()
      expect(goPreviousFrame).not.toHaveBeenCalled()
      expect(setCurrentFrame).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('keeps the sound between its first and last frames', async () => {
      const setSoundTime = vi.fn()
      const wrapper = mountPlayer({
        entities: [sound('sound-1', 'mp3'), picture],
        setSoundTime
      })
      const soundViewer = wrapper.findComponent({ name: 'SoundViewer' })
      soundViewer.vm.$emit('duration-changed', 3)
      soundViewer.vm.$emit('time-update', 2.96)
      await nextTick()
      await press('ArrowRight')
      soundViewer.vm.$emit('time-update', 0)
      await press('ArrowLeft')
      expect(setSoundTime.mock.calls.map(([time]) => time)).toEqual([2.96, 0])
      wrapper.unmount()
    })

    it('still steps a movie', async () => {
      const goNextFrame = vi.fn()
      const setCurrentFrame = vi.fn()
      const setSoundTime = vi.fn()
      const wrapper = mountPlayer({ goNextFrame, setCurrentFrame, setSoundTime })
      await press('ArrowRight')
      await press('End')
      expect(goNextFrame).toHaveBeenCalledTimes(1)
      expect(setCurrentFrame).toHaveBeenCalledWith(99)
      expect(setSoundTime).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('sound', () => {
    const entities = [sound('sound-1', 'mp3'), sound('sound-2', 'wav')]

    afterEach(() => {
      vi.useRealTimers()
    })

    const startPlaying = async wrapper => {
      wrapper.findComponent(SharedPlaylistButtonBar).vm.$emit('play')
      await nextTick()
    }

    const endSound = async wrapper => {
      wrapper.findComponent({ name: 'SoundViewer' }).vm.$emit('play-ended')
      await nextTick()
      await nextTick()
    }

    it('moves on to the next entity at the end of a sound', async () => {
      const playSound = vi.fn()
      const wrapper = mountPlayer({ entities, playSound })
      await startPlaying(wrapper)
      await endSound(wrapper)
      expect(
        wrapper.findComponent({ name: 'SoundViewer' }).props('previewUrl')
      ).toContain('preview-sound-2')
      expect(playSound).toHaveBeenCalledTimes(2)
      expect(
        wrapper.findComponent(SharedPlaylistButtonBar).props('isPlaying')
      ).toBe(true)
      wrapper.unmount()
    })

    // Like a picture, it keeps its slot, 2 s.
    it('moves on from a sound that cannot be read', async () => {
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] })
      const playSound = vi.fn()
      const wrapper = mountPlayer({ entities, playSound })
      await startPlaying(wrapper)
      wrapper.findComponent({ name: 'SoundViewer' }).vm.$emit('play-failed')
      await vi.advanceTimersByTimeAsync(1900)
      expect(
        wrapper.findComponent({ name: 'SoundViewer' }).props('previewUrl')
      ).toContain('preview-sound-1')
      await vi.advanceTimersByTimeAsync(200)
      await nextTick()
      expect(
        wrapper.findComponent({ name: 'SoundViewer' }).props('previewUrl')
      ).toContain('preview-sound-2')
      expect(playSound).toHaveBeenCalledTimes(2)
      wrapper.unmount()
    })

    it('replays a sound at its end with repeat on', async () => {
      const playSound = vi.fn()
      const wrapper = mountPlayer({ entities, playSound })
      wrapper
        .findComponent(SharedPlaylistButtonBar)
        .vm.$emit('update:isRepeating', true)
      await startPlaying(wrapper)
      await endSound(wrapper)
      expect(
        wrapper.findComponent({ name: 'SoundViewer' }).props('previewUrl')
      ).toContain('preview-sound-1')
      expect(playSound).toHaveBeenCalledTimes(2)
      wrapper.unmount()
    })
  })

  // The stub declares no fileName prop: the name lands on its root element.
  describe('sound file name', () => {
    const fileName = wrapper =>
      wrapper.findComponent({ name: 'SoundViewer' }).attributes('file-name')

    it('names the sound on the waveform, like the task panel', async () => {
      const wrapper = mountPlayer({
        entities: [
          { ...sound('sound-1', 'mp3'), preview_file_original_name: 'tone_a' }
        ]
      })
      await nextTick()
      expect(fileName(wrapper)).toBe('tone_a.mp3')
      wrapper.unmount()
    })

    it('names the other files of the revision', async () => {
      const wrapper = mountPlayer({
        entities: [
          {
            ...sound('sound-1', 'mp3'),
            preview_file_original_name: 'tone_a',
            preview_file_previews: [
              { id: 'preview-sound-1b', extension: 'wav', original_name: 'tone_b' }
            ]
          }
        ]
      })
      await nextTick()
      wrapper.findComponent(SharedPlaylistButtonBar).vm.$emit('next-preview')
      await nextTick()
      expect(fileName(wrapper)).toBe('tone_b.wav')
      wrapper.unmount()
    })

    it('shows no name when Zou sends none', async () => {
      const wrapper = mountPlayer({ entities: [sound('sound-1', 'mp3')] })
      await nextTick()
      expect(fileName(wrapper)).toBeFalsy()
      wrapper.unmount()
    })
  })

  // Zou keeps no duration for a sound: the entity bar takes the decoded one,
  // and the playlist bar spreads the sound over the 2 s slot it gives it.
  describe('sound progress', () => {
    const soundViewer = wrapper => wrapper.findComponent({ name: 'SoundViewer' })
    const entityBar = wrapper => wrapper.findComponent({ name: 'VideoProgress' })
    const playlistBar = wrapper =>
      wrapper.findComponent({ name: 'PlaylistProgress' })

    const decodeSound = async (wrapper, duration) => {
      soundViewer(wrapper).vm.$emit('duration-changed', duration)
      await nextTick()
    }

    it('seeks the sound from the entity bar', async () => {
      const setCurrentFrame = vi.fn()
      const setSoundTime = vi.fn()
      const wrapper = mountPlayer({
        entities: [sound('sound-1', 'mp3'), picture],
        setCurrentFrame,
        setSoundTime
      })
      await decodeSound(wrapper, 3)
      expect(entityBar(wrapper).attributes('nb-frames')).toBe('75')

      entityBar(wrapper).vm.$emit('progress-changed', 37)
      expect(setSoundTime).toHaveBeenCalledTimes(1)
      expect(setSoundTime.mock.calls[0][0]).toBeCloseTo(1.48)
      expect(setCurrentFrame).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('moves both bars with the sound', async () => {
      const updateProgressBar = vi.fn()
      const wrapper = mountPlayer({
        entities: [sound('sound-1', 'mp3'), picture],
        updateProgressBar
      })
      await decodeSound(wrapper, 3)
      soundViewer(wrapper).vm.$emit('time-update', 1.5)
      await nextTick()
      expect(updateProgressBar).toHaveBeenLastCalledWith(37.5)
      // Half of the sound, half of its 2 s slot, which starts at frame 1.
      expect(playlistBar(wrapper).props('playlistProgress')).toBeCloseTo(1.04)
      wrapper.unmount()
    })

    it('seeks the sound from its slot of the playlist bar', async () => {
      const setCurrentFrame = vi.fn()
      const setSoundTime = vi.fn()
      const wrapper = mountPlayer({
        entities: [sound('sound-1', 'mp3'), picture],
        setCurrentFrame,
        setSoundTime
      })
      await decodeSound(wrapper, 3)
      playlistBar(wrapper).vm.$emit('progress-playlist-changed', 25)
      await nextTick()
      expect(setSoundTime).toHaveBeenCalledTimes(1)
      expect(setSoundTime.mock.calls[0][0]).toBeCloseTo(1.5)
      expect(setCurrentFrame).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('seeks a sound reached from the playlist bar once decoded', async () => {
      const setCurrentFrame = vi.fn()
      const setSoundTime = vi.fn()
      const wrapper = mountPlayer({
        entities: [entity, sound('sound-1', 'mp3')],
        setCurrentFrame,
        setSoundTime
      })
      await nextTick()
      // The movie takes 100 frames, the sound the next 50.
      playlistBar(wrapper).vm.$emit('progress-playlist-changed', 125)
      await nextTick()
      await nextTick()
      expect(setSoundTime).not.toHaveBeenCalled()

      await decodeSound(wrapper, 3)
      expect(setSoundTime).toHaveBeenCalledTimes(1)
      expect(setSoundTime.mock.calls[0][0]).toBeCloseTo(1.5)
      expect(setCurrentFrame).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    // A frame clicked on a sound not decoded yet is no frame of another file.
    describe('frame waiting for a sound', () => {
      const twoFiles = {
        ...sound('sound-1', 'mp3'),
        preview_file_previews: [{ id: 'preview-sound-1b', extension: 'wav' }]
      }

      afterEach(() => {
        vi.useRealTimers()
      })

      it('is dropped on a move to another file', async () => {
        const setSoundTime = vi.fn()
        const wrapper = mountPlayer({
          entities: [twoFiles, picture],
          setSoundTime
        })
        await nextTick()
        playlistBar(wrapper).vm.$emit('progress-playlist-changed', 25)
        await nextTick()
        wrapper.findComponent(SharedPlaylistButtonBar).vm.$emit('next-preview')
        await nextTick()

        await decodeSound(wrapper, 3)
        expect(setSoundTime).not.toHaveBeenCalled()
        wrapper.unmount()
      })

      // The hold of a sound that cannot be read moves on to the next file.
      it('is dropped when playback moves on to another file', async () => {
        vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] })
        const setSoundTime = vi.fn()
        const wrapper = mountPlayer({
          entities: [twoFiles, picture],
          setSoundTime
        })
        await nextTick()
        playlistBar(wrapper).vm.$emit('progress-playlist-changed', 25)
        await nextTick()
        wrapper.findComponent(SharedPlaylistButtonBar).vm.$emit('play')
        await nextTick()
        soundViewer(wrapper).vm.$emit('play-failed')
        await vi.advanceTimersByTimeAsync(2100)
        expect(soundViewer(wrapper).props('previewUrl')).toContain(
          'preview-sound-1b'
        )

        await decodeSound(wrapper, 3)
        expect(setSoundTime).not.toHaveBeenCalled()
        wrapper.unmount()
      })
    })

    it('restarts the sound on screen when its card is clicked', async () => {
      const setSoundTime = vi.fn()
      const wrapper = mountPlayer({
        entities: [sound('sound-1', 'mp3'), picture],
        setSoundTime
      })
      await decodeSound(wrapper, 3)
      expect(entityBar(wrapper).attributes('nb-frames')).toBe('75')

      // Same entity, same file: the viewer neither reloads nor sends its
      // duration again.
      wrapper
        .findAllComponents({ name: 'PlaylistedEntity' })[0]
        .vm.$emit('play-click', 0)
      await nextTick()
      expect(entityBar(wrapper).attributes('nb-frames')).toBe('75')
      expect(setSoundTime).toHaveBeenLastCalledWith(0)
      wrapper.unmount()
    })

    it('times a sound from 00:00 to its decoded duration', async () => {
      const wrapper = mountPlayer({ entities: [entity, sound('sound-1', 'mp3')] })
      const bar = () => wrapper.findComponent(SharedPlaylistButtonBar)
      const movie = wrapper.findComponent({ name: 'MultiVideoViewer' })
      movie.vm.$emit('max-duration-update', 4)
      movie.vm.$emit('frame-update', 50)
      await nextTick()
      expect(bar().props('currentTimeFormatted')).toBe('00:00:02:00')
      expect(bar().props('maxDurationFormatted')).toBe('00:00:04:00')

      wrapper.findComponent(SharedPlaylistHeader).vm.$emit('next-entity')
      await nextTick()
      expect(bar().props('currentTimeFormatted')).toBe('00:00:00:00')
      expect(bar().props('maxDurationFormatted')).toBe('00:00:00:00')

      await decodeSound(wrapper, 3)
      soundViewer(wrapper).vm.$emit('time-update', 1.2)
      await nextTick()
      expect(bar().props('currentTimeFormatted')).toBe('00:00:01:05')
      expect(bar().props('maxDurationFormatted')).toBe('00:00:03:00')
      wrapper.unmount()
    })

    // A fake of the movie viewer: the frame it was sought to.
    const movieViewer = () => {
      let frame = 0
      return {
        getCurrentFrame: () => frame,
        loadEntity: () => {
          frame = 0
        },
        setCurrentFrame: vi.fn(f => {
          frame = f
        })
      }
    }

    // The movie loads after the seek, and the other decoder preloading the
    // next movie sends the event again.
    it('shows the frame of a movie reached from the playlist bar', async () => {
      const viewer = movieViewer()
      const updateProgressBar = vi.fn()
      const wrapper = mountPlayer({
        entities: [sound('sound-1', 'mp3'), entity],
        ...viewer,
        updateProgressBar
      })
      await decodeSound(wrapper, 3)
      // The sound takes 50 frames, the movie the next 100.
      playlistBar(wrapper).vm.$emit('progress-playlist-changed', 90)
      await nextTick()
      await nextTick()
      const movie = wrapper.findComponent({ name: 'MultiVideoViewer' })
      movie.vm.$emit('video-loaded')
      movie.vm.$emit('video-loaded')
      await nextTick()
      expect(viewer.setCurrentFrame).toHaveBeenLastCalledWith(40)
      expect(updateProgressBar).toHaveBeenLastCalledWith(40)
      expect(
        wrapper
          .findComponent(SharedPlaylistButtonBar)
          .props('currentFrameDisplay')
      ).toBe('041')
      expect(playlistBar(wrapper).props('playlistProgress')).toBeCloseTo(3.64)
      wrapper.unmount()
    })

    it('still opens a movie on its first frame', async () => {
      const updateProgressBar = vi.fn()
      const wrapper = mountPlayer({
        entities: [sound('sound-1', 'mp3'), entity],
        ...movieViewer(),
        updateProgressBar
      })
      await decodeSound(wrapper, 3)
      playlistBar(wrapper).vm.$emit('progress-playlist-changed', 90)
      await nextTick()
      wrapper.findComponent(SharedPlaylistHeader).vm.$emit('previous-entity')
      wrapper.findComponent(SharedPlaylistHeader).vm.$emit('next-entity')
      await nextTick()
      wrapper
        .findComponent({ name: 'MultiVideoViewer' })
        .vm.$emit('video-loaded')
      await nextTick()
      expect(updateProgressBar).toHaveBeenLastCalledWith(0)
      expect(
        wrapper
          .findComponent(SharedPlaylistButtonBar)
          .props('currentFrameDisplay')
      ).toBe('001')
      wrapper.unmount()
    })

    it('still seeks a movie from both bars', async () => {
      const setCurrentFrame = vi.fn()
      const setSoundTime = vi.fn()
      const wrapper = mountPlayer({
        entities: [entity, sound('sound-1', 'mp3')],
        setCurrentFrame,
        setSoundTime
      })
      await nextTick()
      entityBar(wrapper).vm.$emit('progress-changed', 40)
      playlistBar(wrapper).vm.$emit('progress-playlist-changed', 60)
      await nextTick()
      expect(setCurrentFrame.mock.calls).toEqual([[40], [60]])
      expect(setSoundTime).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  // A picture keeps its slot of the playlist bar, 2 s by default.
  describe('picture progress', () => {
    const entityBar = wrapper => wrapper.findComponent({ name: 'VideoProgress' })
    const playlistBar = wrapper =>
      wrapper.findComponent({ name: 'PlaylistProgress' })
    const nextEntity = async wrapper => {
      wrapper.findComponent(SharedPlaylistHeader).vm.$emit('next-entity')
      await nextTick()
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    it('spans the slot of a picture from its start', async () => {
      const updateProgressBar = vi.fn()
      const wrapper = mountPlayer({
        entities: [
          entity,
          picture,
          { ...picture, id: 'picture-2', preview_nb_frames: 30 }
        ],
        updateProgressBar
      })
      const movie = wrapper.findComponent({ name: 'MultiVideoViewer' })
      movie.vm.$emit('max-duration-update', 4.02)
      movie.vm.$emit('frame-update', 60)
      await nextTick()

      await nextEntity(wrapper)
      expect(entityBar(wrapper).attributes('nb-frames')).toBe('50')
      expect(updateProgressBar).toHaveBeenLastCalledWith(0)

      entityBar(wrapper).vm.$emit('progress-changed', 20)
      await nextTick()
      await nextEntity(wrapper)
      expect(entityBar(wrapper).attributes('nb-frames')).toBe('30')
      expect(updateProgressBar).toHaveBeenLastCalledWith(0)
      wrapper.unmount()
    })

    it('seeks a picture from the entity bar', async () => {
      const setCurrentFrame = vi.fn()
      const updateProgressBar = vi.fn()
      const wrapper = mountPlayer({
        entities: [picture, sound('sound-1', 'mp3')],
        setCurrentFrame,
        updateProgressBar
      })
      await nextTick()
      entityBar(wrapper).vm.$emit('progress-changed', 25)
      await nextTick()
      expect(updateProgressBar).toHaveBeenLastCalledWith(25)
      // Half of the 2 s slot, which starts at frame 1.
      expect(playlistBar(wrapper).props('playlistProgress')).toBeCloseTo(1.04)
      expect(setCurrentFrame).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('plays a picture on from the frame clicked', async () => {
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] })
      const updateProgressBar = vi.fn()
      const wrapper = mountPlayer({
        entities: [picture, sound('sound-1', 'mp3')],
        updateProgressBar
      })
      const lastFrame = () => updateProgressBar.mock.lastCall[0]
      wrapper.findComponent(SharedPlaylistButtonBar).vm.$emit('play')
      await vi.advanceTimersByTimeAsync(200)
      expect(lastFrame()).toBeLessThanOrEqual(5)

      entityBar(wrapper).vm.$emit('progress-changed', 40)
      await vi.advanceTimersByTimeAsync(200)
      expect(lastFrame()).toBeGreaterThanOrEqual(44)
      await vi.advanceTimersByTimeAsync(250)
      await nextTick()
      expect(
        wrapper.findComponent({ name: 'SoundViewer' }).props('previewUrl')
      ).toContain('preview-sound-1')
      wrapper.unmount()
    })
  })

  describe('timecode navigation', () => {
    const clickTimeCode = async (wrapper, versionRevision) => {
      wrapper
        .findComponent(SharedCommentsPanel)
        .vm.$emit('time-code-clicked', { versionRevision, frame: 420 })
      await nextTick()
    }
    const frameDisplay = wrapper =>
      wrapper.findComponent(SharedPlaylistButtonBar).props('currentFrameDisplay')

    it('seeks to a timecode of the shared version', async () => {
      const setCurrentFrame = vi.fn()
      const wrapper = mountPlayer({ entities: [shot], setCurrentFrame })
      await clickTimeCode(wrapper, '2')
      expect(setCurrentFrame).toHaveBeenCalledWith(420)
      expect(frameDisplay(wrapper)).toBe('421')
      wrapper.unmount()
    })

    it('ignores a timecode of a version the link does not share', async () => {
      const setCurrentFrame = vi.fn()
      const wrapper = mountPlayer({ entities: [shot], setCurrentFrame })
      await clickTimeCode(wrapper, '1')
      expect(setCurrentFrame).not.toHaveBeenCalledWith(420)
      expect(frameDisplay(wrapper)).toBe('001')
      wrapper.unmount()
    })
  })
})
