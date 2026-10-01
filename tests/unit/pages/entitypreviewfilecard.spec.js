import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createStore } from 'vuex'

import EntityPreviewFileCard from '@/components/pages/entities/EntityPreviewFileCard.vue'

describe('EntityPreviewFileCard', () => {
  it('downloads the original without leaving the page', () => {
    const store = createStore({
      getters: {
        isCurrentUserArtist: () => false,
        personMap: () => new Map([['person-1', { id: 'person-1' }]])
      }
    })
    const wrapper = shallowMount(EntityPreviewFileCard, {
      props: {
        previewFile: {
          id: 'preview-1',
          extension: 'mp4',
          revision: 2,
          person_id: 'person-1'
        }
      },
      global: { plugins: [store] }
    })
    const link = wrapper.get('a.download-button')
    expect(link.attributes('href')).toBe(
      '/api/movies/originals/preview-files/preview-1/download'
    )
    expect(link.attributes('download')).toBe('')
  })
})
