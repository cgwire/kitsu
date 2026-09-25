import { mount } from '@vue/test-utils'

import LightEntityThumbnail from '@/components/widgets/LightEntityThumbnail.vue'

const mountThumbnail = props =>
  mount(LightEntityThumbnail, {
    props: { previewFileId: 'preview-1', extension: 'png', ...props }
  })

describe('LightEntityThumbnail', () => {
  test('requests the picture when the preview status is not given', () => {
    const wrapper = mountThumbnail()
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain(
      '/api/pictures/thumbnails/preview-files/preview-1.png'
    )
  })

  test('requests the picture when the preview is ready', () => {
    const wrapper = mountThumbnail({ previewFileStatus: 'ready' })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain(
      '/api/pictures/thumbnails/preview-files/preview-1.png'
    )
  })

  test('requests nothing while the preview is processing', () => {
    const wrapper = mountThumbnail({ previewFileStatus: 'processing' })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.thumbnail-processing').exists()).toBe(true)
  })
})
