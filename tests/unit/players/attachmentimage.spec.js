import { mount } from '@vue/test-utils'

import AttachmentImage from '@/components/players/viewers/AttachmentImage.vue'

const mountImage = (props = {}) =>
  mount(AttachmentImage, {
    props: { src: '/dl/frame.png', name: 'frame.png', ...props }
  })

describe('players/AttachmentImage', () => {
  it('renders the image inside a link to the source', () => {
    const wrapper = mountImage()
    expect(wrapper.find('img.attachment-image').attributes('src')).toBe(
      '/dl/frame.png'
    )
    expect(wrapper.find('a').attributes('href')).toBe('/dl/frame.png')
  })

  it('shows an unavailable chip (no image, no link) when the image errors', async () => {
    const wrapper = mountImage()
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    const chip = wrapper.find('.attachment-error')
    expect(chip.exists()).toBe(true)
    // Informational only: no download link once the file is gone.
    expect(wrapper.find('a').exists()).toBe(false)
    expect(chip.find('.attachment-error-name').text()).toBe('frame.png')
  })
})
