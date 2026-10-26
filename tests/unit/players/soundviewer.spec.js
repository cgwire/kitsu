import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The real one draws into a laid out container and fetches the sound.
const waveSurfer = vi.hoisted(() => ({
  create: vi.fn(() => {
    const handlers = {}
    return {
      handlers,
      destroy: vi.fn(),
      load: vi.fn(() => Promise.resolve()),
      on: vi.fn((event, handler) => {
        handlers[event] = handler
      }),
      pause: vi.fn(),
      play: vi.fn(() => Promise.resolve())
    }
  })
}))
vi.mock('wavesurfer.js', () => ({ default: waveSurfer }))

import SoundViewer from '@/components/players/viewers/SoundViewer.vue'

const isShown = element => element.style.display !== 'none'

describe('SoundViewer.vue', () => {
  let wrapper = null

  const mountViewer = previewUrl => {
    wrapper = mount(SoundViewer, {
      props: { fileName: 'take.wav', previewUrl }
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
