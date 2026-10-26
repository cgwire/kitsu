import { shallowMount } from '@vue/test-utils'
import { nextTick, reactive, ref } from 'vue'
import { createStore } from 'vuex'

import VideoViewer from '@/components/players/viewers/VideoViewer.vue'
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

// The socket keeps in the store the statuses Zou announces.
const mountWithStatuses = (statuses, props) => {
  const statusMap = reactive(new Map(statuses))
  const store = createStore({
    getters: { previewFileStatusMap: () => statusMap }
  })
  store.commit = vi.fn()
  const wrapper = shallowMount(EntityPreview, {
    props: { entity, ...props },
    global: { plugins: [store] }
  })
  return { statusMap, wrapper }
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

  test('waits for a processing movie instead of playing it', () => {
    const { wrapper } = mountWithStatuses([['preview-1', 'processing']], {
      entity: { ...entity, preview_file_extension: 'mp4' }
    })
    expect(wrapper.findComponent(VideoViewer).exists()).toBe(false)
    expect(wrapper.find('.thumbnail-processing').exists()).toBe(true)
  })

  // The movie viewer says when it cannot read the movie: a play would start
  // nothing.
  test('offers no play on a movie that cannot be read', async () => {
    const play = vi.fn()
    const wrapper = shallowMount(EntityPreview, {
      props: { entity: { ...entity, preview_file_extension: 'mp4' } },
      global: {
        plugins: [createStore({})],
        stubs: {
          VideoViewer: {
            name: 'VideoViewer',
            template: '<div class="video-stub" />',
            setup: () => ({ isBroken: ref(false), pause: vi.fn(), play })
          }
        }
      }
    })
    expect(wrapper.find('.button-play').exists()).toBe(true)
    expect(wrapper.find('.video-stub').attributes('role')).toBe('button')

    wrapper.findComponent({ name: 'VideoViewer' }).vm.isBroken = true
    await nextTick()
    await wrapper.find('.video-stub').trigger('click')

    expect(wrapper.find('.button-play').exists()).toBe(false)
    expect(play).not.toHaveBeenCalled()
    expect(wrapper.find('.video-stub').attributes('role')).toBeUndefined()
    expect(wrapper.find('.video-stub').attributes('tabindex')).toBeUndefined()
  })

  test('paints no cover while the preview is processing', () => {
    const { wrapper } = mountWithStatuses([['preview-1', 'processing']], {
      cover: true
    })
    expect(
      wrapper.find('.preview-wrapper').element.style.backgroundImage
    ).toBe('')
  })
})
