import { mount } from '@vue/test-utils'

import AttachmentVideoPlayer from '@/components/players/viewers/AttachmentVideoPlayer.vue'

const mountPlayer = (props = {}) =>
  mount(AttachmentVideoPlayer, {
    props: { src: 'blob:video', name: 'clip.mp4', downloadHref: '/dl/clip.mp4', ...props },
    global: { mocks: { $t: key => key } }
  })

describe('players/AttachmentVideoPlayer', () => {
  it('renders a video element and play + fullscreen buttons', () => {
    const wrapper = mountPlayer()
    expect(wrapper.find('video').exists()).toBe(true)
    expect(wrapper.find('.play-button').exists()).toBe(true)
    expect(wrapper.find('.fullscreen-button').exists()).toBe(true)
  })

  it('exposes a download link to downloadHref', () => {
    const wrapper = mountPlayer()
    expect(wrapper.find('a.download-button').attributes('href')).toBe('/dl/clip.mp4')
  })

  it('requests fullscreen on the wrapper when clicking fullscreen', async () => {
    const wrapper = mountPlayer()
    const root = wrapper.find('.attachment-video').element
    root.requestFullscreen = vi.fn()
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true
    })
    await wrapper.find('.fullscreen-button').trigger('click')
    expect(root.requestFullscreen).toHaveBeenCalled()
  })
})
