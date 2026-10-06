import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import EntityPreview from '@/components/widgets/EntityPreview.vue'

const entity = {
  id: 'asset-1',
  preview_file_id: 'preview-1',
  preview_file_extension: 'png'
}

const mountPreview = props => {
  const commit = vi.fn()
  const store = createStore({})
  store.commit = commit
  const wrapper = shallowMount(EntityPreview, {
    props: { entity, ...props },
    global: { plugins: [store] }
  })
  return { wrapper, commit }
}

describe('EntityPreview', () => {
  test('opens the preview when clicking the view icon', async () => {
    const { wrapper, commit } = mountPreview()
    await wrapper.find('.view-icon').trigger('click')
    expect(commit).toHaveBeenCalledWith('SHOW_PREVIEW_FILE', 'preview-1')
  })

  test('hides the view icon when previewing is disabled', () => {
    const { wrapper } = mountPreview({ noPreview: true })
    expect(wrapper.find('.view-icon').exists()).toBe(false)
  })

  // Zou builds the variants of an uploaded picture in the background, and
  // its picture routes answer 404 until they are stored.
  test('waits for the variants of a processing preview', () => {
    const { wrapper } = mountPreview({ previewFileStatus: 'processing' })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.thumbnail-processing').exists()).toBe(true)
    expect(wrapper.find('.view-icon').exists()).toBe(false)
  })

  test('shows the picture once the preview is ready', async () => {
    const { wrapper } = mountPreview({ previewFileStatus: 'processing' })
    expect(wrapper.find('img').exists()).toBe(false)

    await wrapper.setProps({ previewFileStatus: 'ready' })

    expect(wrapper.find('.thumbnail-processing').exists()).toBe(false)
    expect(wrapper.find('img').attributes('src')).toBe(
      '/api/pictures/previews/preview-files/preview-1.png'
    )
    expect(wrapper.find('.view-icon').exists()).toBe(true)
  })

  test.each(['broken', 'missing'])('tells a %s preview apart', status => {
    const { wrapper } = mountPreview({ previewFileStatus: status })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.view-icon').exists()).toBe(false)
    expect(wrapper.find('.preview-broken').text()).toBe('preview.broken')
  })
})
