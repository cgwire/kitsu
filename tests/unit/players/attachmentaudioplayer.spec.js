import { mount } from '@vue/test-utils'

import AttachmentAudioPlayer from '@/components/players/viewers/AttachmentAudioPlayer.vue'

const mountPlayer = (props = {}) =>
  mount(AttachmentAudioPlayer, {
    props: { src: 'blob:audio', name: 'note.wav', downloadHref: '/dl/note.wav', ...props },
    global: { mocks: { $t: key => key } }
  })

describe('players/AttachmentAudioPlayer', () => {
  it('renders an audio element and a play button', () => {
    const wrapper = mountPlayer()
    expect(wrapper.find('audio').exists()).toBe(true)
    expect(wrapper.find('.play-button').exists()).toBe(true)
  })

  it('clicking play calls the audio element play()', async () => {
    const wrapper = mountPlayer()
    const audio = wrapper.find('audio').element
    audio.play = vi.fn(() => Promise.resolve())
    audio.pause = vi.fn()
    Object.defineProperty(audio, 'paused', { value: true, configurable: true })
    await wrapper.find('.play-button').trigger('click')
    expect(audio.play).toHaveBeenCalled()
  })

  it('exposes a download link to downloadHref', () => {
    const wrapper = mountPlayer()
    const link = wrapper.find('a.download-button')
    expect(link.attributes('href')).toBe('/dl/note.wav')
  })

  it('falls back to a download link when the media errors', async () => {
    const wrapper = mountPlayer()
    await wrapper.find('audio').trigger('error')
    expect(wrapper.find('.play-button').exists()).toBe(false)
    expect(wrapper.find('a.attachment-fallback').exists()).toBe(true)
  })
})
