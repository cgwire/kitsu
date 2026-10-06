import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { createStore } from 'vuex'

import LightEntityThumbnail from '@/components/widgets/LightEntityThumbnail.vue'

const mountThumbnail = props =>
  mount(LightEntityThumbnail, {
    props: { previewFileId: 'preview-1', extension: 'png', ...props }
  })

// The socket keeps in the store the statuses Zou announces.
const mountWithStatuses = statuses => {
  const statusMap = reactive(new Map(statuses))
  const store = createStore({
    getters: { previewFileStatusMap: () => statusMap }
  })
  const wrapper = mount(LightEntityThumbnail, {
    props: { previewFileId: 'preview-1', extension: 'png' },
    global: { plugins: [store] }
  })
  return { statusMap, wrapper }
}

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

  test('waits for a preview the store knows processing', () => {
    const { wrapper } = mountWithStatuses([['preview-1', 'processing']])
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.thumbnail-processing').exists()).toBe(true)
  })

  test('asks again for the picture once the store knows it ready', async () => {
    const { statusMap, wrapper } = mountWithStatuses([])
    expect(wrapper.find('img').attributes('src')).not.toContain('?t=')

    statusMap.set('preview-1', 'ready')
    await nextTick()

    expect(wrapper.find('img').attributes('src')).toContain('?t=')
  })

  test('leaves a broken preview empty', () => {
    const { wrapper } = mountWithStatuses([['preview-1', 'broken']])
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.thumbnail-empty').exists()).toBe(true)
  })
})
