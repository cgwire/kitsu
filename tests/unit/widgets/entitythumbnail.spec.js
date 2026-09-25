import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'

const entity = { id: 'asset-1', preview_file_id: 'preview-1' }

const mountThumbnail = props => {
  const store = createStore({})
  store.commit = vi.fn()
  return shallowMount(EntityThumbnail, {
    props: { entity, ...props },
    global: { plugins: [store] }
  })
}

describe('EntityThumbnail', () => {
  test('requests the picture when the preview is ready', () => {
    const wrapper = mountThumbnail()
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

  test('requests the picture again once the preview turns ready', async () => {
    const wrapper = mountThumbnail({ previewFileStatus: 'processing' })
    expect(wrapper.find('img').exists()).toBe(false)

    await wrapper.setProps({ previewFileStatus: 'ready' })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    // A picture the browser tried while it was missing must not be
    // served from the cache.
    expect(img.attributes('src')).toContain('?t=')
  })
})
