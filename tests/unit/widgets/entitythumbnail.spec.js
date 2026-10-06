import { shallowMount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
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

// The socket keeps in the store the statuses Zou announces.
const mountWithStatuses = (statuses, props) => {
  const statusMap = reactive(new Map(statuses))
  const store = createStore({
    getters: { previewFileStatusMap: () => statusMap }
  })
  store.commit = vi.fn()
  const wrapper = shallowMount(EntityThumbnail, {
    props: { entity, ...props },
    global: { plugins: [store] }
  })
  return { statusMap, wrapper }
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
    const placeholder = wrapper.find('.thumbnail-processing')
    expect(placeholder.exists()).toBe(true)
    // The placeholder is styled like a thumbnail, so it keeps the size
    // and the rounded corners of the picture it stands for.
    expect(placeholder.classes()).toContain('thumbnail-picture')
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

  test('waits for a preview the store knows processing', () => {
    const { wrapper } = mountWithStatuses([['preview-1', 'processing']])
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.thumbnail-processing').exists()).toBe(true)
  })

  // The picture may have been asked for before the store knew the preview.
  test('asks again for the picture once the store knows it ready', async () => {
    const { statusMap, wrapper } = mountWithStatuses([])
    expect(wrapper.find('img').attributes('src')).not.toContain('?t=')

    statusMap.set('preview-1', 'ready')
    await nextTick()

    expect(wrapper.find('img').attributes('src')).toContain('?t=')
  })

  test('takes the ready status the store knows over a processing one given', () => {
    const { wrapper } = mountWithStatuses([['preview-1', 'ready']], {
      previewFileStatus: 'processing'
    })
    expect(wrapper.find('img').exists()).toBe(true)
  })

  test('leaves a broken preview empty, its reason in the title', () => {
    const { wrapper } = mountWithStatuses([['preview-1', 'broken']])
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.thumbnail-empty').attributes('title')).toBe(
      'preview.broken'
    )
  })
})
