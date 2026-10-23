import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('@/composables/format', () => ({
  useFormat: () => ({ formatDate: () => '' })
}))

import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'

const mountPreviewFiles = (previewFiles, { register = vi.fn() } = {}) => {
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1' }),
      isCurrentUserArtist: () => false,
      personMap: () => new Map([['person-1', { id: 'person-1' }]]),
      taskMap: () => new Map([['task-1', { task_type_id: 'task-type-1' }]]),
      taskTypeMap: () =>
        new Map([['task-type-1', { id: 'task-type-1', priority: 1 }]])
    },
    actions: {
      getEntityPreviewFiles: () =>
        previewFiles.map((previewFile, index) => ({
          id: `preview-${index + 1}`,
          task_id: 'task-1',
          person_id: 'person-1',
          ...previewFile
        })),
      registerPreviewFileStatuses: register
    }
  })
  return shallowMount(EntityPreviewFiles, {
    props: { entity: { id: 'entity-1' } },
    global: { plugins: [store] }
  })
}

describe('EntityPreviewFiles', () => {
  it('downloads the originals without leaving the page', async () => {
    const wrapper = mountPreviewFiles([
      { extension: 'mp4' },
      { extension: 'png' }
    ])
    await flushPromises()

    const links = wrapper.findAll('td.download a')
    expect(links.map(link => link.attributes('href')).sort()).toEqual([
      '/api/movies/originals/preview-files/preview-1/download',
      '/api/pictures/originals/preview-files/preview-2/download'
    ])
    expect(links.map(link => link.attributes('download'))).toEqual(['', ''])
  })

  it('hands each preview status over to its thumbnail', async () => {
    const wrapper = mountPreviewFiles([
      { extension: 'png', status: 'processing' },
      { extension: 'png', status: 'broken' }
    ])
    await flushPromises()

    const thumbnails = wrapper.findAllComponents(EntityThumbnail)
    expect(
      thumbnails.map(thumbnail => [
        thumbnail.props('previewFileId'),
        thumbnail.props('previewFileStatus')
      ])
    ).toEqual([
      ['preview-1', 'processing'],
      ['preview-2', 'broken']
    ])
  })

  // The store reads again the previews still processing when the socket
  // reconnects: a ready event missed meanwhile does not leave them waiting.
  it('hands the preview statuses over to the store', async () => {
    const register = vi.fn()
    mountPreviewFiles([{ extension: 'png', status: 'processing' }], {
      register
    })
    await flushPromises()

    expect(register).toHaveBeenCalledWith(expect.anything(), [
      expect.objectContaining({ id: 'preview-1', status: 'processing' })
    ])
  })
})
