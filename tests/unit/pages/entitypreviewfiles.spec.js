import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('@/composables/format', () => ({
  useFormat: () => ({ formatDate: () => '' })
}))

import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'

describe('EntityPreviewFiles', () => {
  it('downloads the originals without leaving the page', async () => {
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
          ['mp4', 'png'].map((extension, index) => ({
            id: `preview-${index + 1}`,
            extension,
            task_id: 'task-1',
            person_id: 'person-1'
          }))
      }
    })
    const wrapper = shallowMount(EntityPreviewFiles, {
      props: { entity: { id: 'entity-1' } },
      global: { plugins: [store] }
    })
    await flushPromises()

    const links = wrapper.findAll('td.download a')
    expect(links.map(link => link.attributes('href')).sort()).toEqual([
      '/api/movies/originals/preview-files/preview-1/download',
      '/api/pictures/originals/preview-files/preview-2/download'
    ])
    expect(links.map(link => link.attributes('download'))).toEqual(['', ''])
  })
})
