import { mount } from '@vue/test-utils'

import AttachmentAudioPlayer from '@/components/players/viewers/AttachmentAudioPlayer.vue'

const mountPlayer = (props = {}) =>
  mount(AttachmentAudioPlayer, {
    props: { src: 'blob:audio', name: 'note.wav', downloadHref: '/dl/note.wav', ...props },
    global: { mocks: { $t: key => key } }
  })

describe('players/AttachmentAudioPlayer', () => {
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

  it('shows an unavailable chip (no player, no link) when the media errors', async () => {
    const wrapper = mountPlayer()
    await wrapper.find('audio').trigger('error')
    expect(wrapper.find('.play-button').exists()).toBe(false)
    const chip = wrapper.find('.attachment-error')
    expect(chip.exists()).toBe(true)
    // The unavailable state is informational: no download link (the file is gone).
    expect(wrapper.find('a').exists()).toBe(false)
    expect(chip.find('.attachment-error-name').text()).toBe('note.wav')
  })
})
