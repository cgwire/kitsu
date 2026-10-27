import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The real one draws into a laid out container and fetches the sound.
const waveSurfer = vi.hoisted(() => ({
  create: vi.fn(() => {
    const handlers = {}
    return {
      handlers,
      destroy: vi.fn(),
      getCurrentTime: vi.fn(() => 0),
      getDuration: vi.fn(() => 0),
      load: vi.fn(() => Promise.resolve()),
      on: vi.fn((event, handler) => {
        handlers[event] = handler
      }),
      pause: vi.fn(),
      play: vi.fn(() => Promise.resolve()),
      setMuted: vi.fn(),
      setTime: vi.fn(),
      setVolume: vi.fn()
    }
  })
}))
vi.mock('wavesurfer.js', () => ({ default: waveSurfer }))

import SoundViewer from '@/components/players/viewers/SoundViewer.vue'

const isShown = element => element.style.display !== 'none'

describe('SoundViewer.vue', () => {
  let wrapper = null

  const mountViewer = (previewUrl, props = {}) => {
    wrapper = mount(SoundViewer, {
      props: { fileName: 'take.wav', previewUrl, ...props }
    })
  }

  const lastWaveform = () => waveSurfer.create.mock.results.at(-1)?.value

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  // PreviewViewer keeps a hidden sound viewer under every preview, two per
  // player: pictures and movies need no waveform.
  it('sets up no waveform without a sound', () => {
    mountViewer('')
    expect(waveSurfer.create).not.toHaveBeenCalled()
    expect(isShown(wrapper.find('.loading').element)).toBe(false)
  })

  it('sets up the waveform with the first sound, then reloads it', async () => {
    mountViewer('')
    await wrapper.setProps({ previewUrl: '/sound-1.wav' })
    expect(waveSurfer.create).toHaveBeenCalledTimes(1)
    expect(waveSurfer.create).toHaveBeenCalledWith(
      expect.objectContaining({ container: wrapper.find('.waveform').element })
    )
    expect(lastWaveform().load).toHaveBeenCalledWith('/sound-1.wav')

    await wrapper.setProps({ previewUrl: '/sound-2.wav' })
    expect(waveSurfer.create).toHaveBeenCalledTimes(1)
    expect(lastWaveform().load).toHaveBeenLastCalledWith('/sound-2.wav')
  })

  it('shows the spinner until the sound is ready', async () => {
    mountViewer('/sound-1.wav')
    await flushPromises()
    const loading = wrapper.find('.loading').element
    expect(isShown(loading)).toBe(true)

    lastWaveform().handlers.ready()
    await flushPromises()
    expect(isShown(loading)).toBe(false)
  })

  // A sound the browser cannot decode fails on the media element, and
  // load() never settles.
  it('hides the spinner of a sound that cannot be read', async () => {
    mountViewer('/broken.wav')
    await flushPromises()
    lastWaveform().handlers.error?.(new Error('Media error 4'))
    await flushPromises()
    expect(isShown(wrapper.find('.loading').element)).toBe(false)
  })

  // The media element gets the file only once it is fetched: a play()
  // before that started nothing, or the previous sound.
  it('plays a sound asked for while it loads, once ready', async () => {
    mountViewer('/sound-1.wav')
    await flushPromises()
    wrapper.vm.play()
    expect(lastWaveform().play).not.toHaveBeenCalled()

    lastWaveform().handlers.ready()
    expect(lastWaveform().play).toHaveBeenCalledTimes(1)
  })

  it('drops a play asked for while it loads on pause', async () => {
    mountViewer('/sound-1.wav')
    await flushPromises()
    wrapper.vm.play()
    wrapper.vm.pause()
    lastWaveform().handlers.ready()
    expect(lastWaveform().play).not.toHaveBeenCalled()
  })

  it('drops a play asked for while it loads when another file takes over', async () => {
    mountViewer('/sound-1.wav')
    await flushPromises()
    wrapper.vm.play()
    await wrapper.setProps({ previewUrl: '' })
    lastWaveform().handlers.ready()
    expect(lastWaveform().play).not.toHaveBeenCalled()
  })

  it('drops a play asked for while it loads on a load error', async () => {
    mountViewer('/broken.wav')
    await flushPromises()
    wrapper.vm.play()
    lastWaveform().handlers.error(new Error('Media error 4'))
    await wrapper.setProps({ previewUrl: '/sound-2.wav' })
    lastWaveform().handlers.ready()
    expect(lastWaveform().play).not.toHaveBeenCalled()
  })

  // A sound can also fail past its ready event, while it plays: the players
  // move on as for a sound that cannot be read. Its media element may be
  // paused already when the error comes.
  it('tells that the play failed on an error while it plays', async () => {
    mountViewer('/sound-1.wav')
    await flushPromises()
    const waveform = lastWaveform()
    waveform.handlers.ready()
    wrapper.vm.play()
    waveform.handlers.error(new Error('Media error 3'))
    expect(wrapper.emitted('play-failed')).toHaveLength(1)
  })

  it('tells no failed play on an error once paused', async () => {
    mountViewer('/sound-1.wav')
    await flushPromises()
    const waveform = lastWaveform()
    waveform.handlers.ready()
    wrapper.vm.play()
    wrapper.vm.pause()
    waveform.handlers.error(new Error('Media error 3'))
    expect(wrapper.emitted('play-failed')).toBeUndefined()
  })

  it('tells no failed play on an error past the end', async () => {
    mountViewer('/sound-1.wav')
    await flushPromises()
    const waveform = lastWaveform()
    waveform.handlers.ready()
    wrapper.vm.play()
    waveform.handlers.finish()
    waveform.handlers.error(new Error('Media error 3'))
    expect(wrapper.emitted('play-failed')).toBeUndefined()
  })

  // Web Audio can fail to decode a sound the media element reads: the
  // sound plays without its waveform.
  it('plays a sound whose waveform cannot be decoded', async () => {
    mountViewer('/no-waveform.mp3')
    await flushPromises()
    wrapper.vm.play()
    const waveform = lastWaveform()
    waveform.getDuration.mockReturnValue(3)
    waveform.handlers.error(
      new DOMException('Unable to decode audio data', 'EncodingError')
    )
    expect(waveform.play).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('duration-changed')).toEqual([[0], [3]])
  })

  it('tells the time a seek gave a sound whose waveform cannot be decoded', () => {
    mountViewer('/no-waveform.mp3')
    const waveform = lastWaveform()
    waveform.handlers.timeupdate(1.6)
    waveform.getCurrentTime.mockReturnValue(1.6)
    waveform.handlers.error(
      new DOMException('Unable to decode audio data', 'EncodingError')
    )
    expect(wrapper.emitted('time-update')).toEqual([[0], [1.6]])
  })

  it('shows a sound that cannot be read as broken', async () => {
    mountViewer('/broken.mp3')
    await flushPromises()
    lastWaveform().handlers.error(new Error('Media error 4'))
    await flushPromises()
    expect(wrapper.find('.broken').text()).toBe('preview.broken')

    await wrapper.setProps({ previewUrl: '/sound-2.wav' })
    expect(wrapper.find('.broken').exists()).toBe(false)
  })

  // The parent moves on: no end would ever come.
  it('tells a play it cannot start', async () => {
    mountViewer('/broken.mp3')
    await flushPromises()
    wrapper.vm.play()
    lastWaveform().handlers.error(new Error('Media error 4'))
    expect(wrapper.emitted('play-failed')).toHaveLength(1)
    wrapper.vm.play()
    expect(wrapper.emitted('play-failed')).toHaveLength(2)
    expect(lastWaveform().play).not.toHaveBeenCalled()

    await wrapper.setProps({ previewUrl: '/sound-2.wav' })
    lastWaveform().handlers.ready()
    wrapper.vm.play()
    expect(lastWaveform().play).toHaveBeenCalledTimes(1)
  })

  it('plays a loaded sound at once', async () => {
    mountViewer('/sound-1.wav')
    await flushPromises()
    lastWaveform().handlers.ready()
    wrapper.vm.play()
    expect(lastWaveform().play).toHaveBeenCalledTimes(1)
  })

  it('plays and pauses nothing before a sound', () => {
    mountViewer('')
    expect(() => {
      wrapper.vm.play()
      wrapper.vm.pause()
    }).not.toThrow()
  })

  // The parent blanks the URL when another preview kind takes over.
  it('pauses the sound once the preview is no sound', async () => {
    mountViewer('/sound-1.wav')
    await wrapper.setProps({ previewUrl: '' })
    expect(lastWaveform().pause).toHaveBeenCalled()
  })

  it('seeks the sound', () => {
    mountViewer('/sound-1.wav')
    wrapper.vm.setCurrentTime(1.48)
    expect(lastWaveform().setTime).toHaveBeenCalledWith(1.48)
  })

  // The progress bars of a playlist follow the sound over its decoded
  // length: Zou keeps no duration for a sound.
  it('tells its time and its decoded duration', () => {
    mountViewer('/sound-1.wav')
    lastWaveform().handlers.ready(3)
    lastWaveform().handlers.timeupdate(1.2)
    expect(wrapper.emitted('duration-changed')).toEqual([[0], [3]])
    expect(wrapper.emitted('time-update')).toEqual([[0], [1.2]])
  })

  // A load pauses the sound before, whose time then comes in.
  it('tells a sound that loads at its start', async () => {
    mountViewer('/sound-1.wav')
    const waveform = lastWaveform()
    waveform.handlers.ready(3)
    await wrapper.setProps({ previewUrl: '/sound-2.wav' })
    waveform.handlers.timeupdate(2.4)
    expect(wrapper.emitted('time-update').at(-1)).toEqual([0])
    waveform.handlers.ready(5)
    waveform.handlers.timeupdate(1.2)
    expect(wrapper.emitted('time-update').at(-1)).toEqual([1.2])
  })

  // A seek while the sound decodes moves its media element: its time came in
  // as the start of the sound.
  it('tells once ready the time a seek gave a sound being decoded', () => {
    mountViewer('/sound-1.wav')
    const waveform = lastWaveform()
    waveform.handlers.timeupdate(1.6)
    waveform.getCurrentTime.mockReturnValue(1.6)
    waveform.handlers.ready(5)
    expect(wrapper.emitted('time-update')).toEqual([[0], [1.6]])
  })

  // The players give a sound the volume of their movies, out of 100.
  it('plays the sound at the volume and mute it is given', async () => {
    mountViewer('', { isMuted: true, volume: 30 })
    await wrapper.setProps({ previewUrl: '/sound-1.wav' })
    expect(lastWaveform().setVolume).toHaveBeenCalledWith(0.3)
    expect(lastWaveform().setMuted).toHaveBeenCalledWith(true)
  })

  it('follows a change of volume or mute', async () => {
    mountViewer('/sound-1.wav', { volume: 30 })
    await wrapper.setProps({ volume: 70 })
    expect(lastWaveform().setVolume).toHaveBeenLastCalledWith(0.7)
    await wrapper.setProps({ isMuted: true })
    expect(lastWaveform().setMuted).toHaveBeenLastCalledWith(true)
  })

  it('takes a volume before a sound', async () => {
    mountViewer('')
    await wrapper.setProps({ isMuted: true, volume: 20 })
    expect(waveSurfer.create).not.toHaveBeenCalled()
    await wrapper.setProps({ previewUrl: '/sound-1.wav' })
    expect(lastWaveform().setVolume).toHaveBeenCalledWith(0.2)
    expect(lastWaveform().setMuted).toHaveBeenCalledWith(true)
  })

  it('tells the end of the sound', () => {
    mountViewer('/sound-1.wav')
    lastWaveform().handlers.finish()
    expect(wrapper.emitted('play-ended')).toHaveLength(1)
  })

  it('destroys the waveform on unmount', () => {
    mountViewer('/sound-1.wav')
    const waveform = lastWaveform()
    wrapper.unmount()
    wrapper = null
    expect(waveform.destroy).toHaveBeenCalled()
  })

  // A newer load, or the destroy() of an unmount, aborts the one in flight.
  it('logs a failed load, not an aborted one', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mountViewer('/sound-1.wav')
    const waveform = lastWaveform()

    waveform.load.mockRejectedValueOnce(
      new DOMException('The load was superseded', 'AbortError')
    )
    await wrapper.setProps({ previewUrl: '/sound-2.wav' })
    await flushPromises()
    expect(consoleError).not.toHaveBeenCalled()

    const failure = new Error('Failed to fetch /sound-3.wav: 404 (Not Found)')
    waveform.load.mockRejectedValueOnce(failure)
    await wrapper.setProps({ previewUrl: '/sound-3.wav' })
    await flushPromises()
    expect(consoleError).toHaveBeenCalledWith(
      'Error loading sound preview:',
      failure
    )
    expect(isShown(wrapper.find('.loading').element)).toBe(false)
  })
})
