import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createStore } from 'vuex'

import EntityPreviewFileCard from '@/components/pages/entities/EntityPreviewFileCard.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'

const mountCard = (previewFile = {}) => {
  const store = createStore({
    getters: {
      isCurrentUserArtist: () => false,
      personMap: () => new Map([['person-1', { id: 'person-1' }]])
    }
  })
  return shallowMount(EntityPreviewFileCard, {
    props: {
      previewFile: {
        id: 'preview-1',
        extension: 'mp4',
        revision: 2,
        person_id: 'person-1',
        ...previewFile
      }
    },
    global: { plugins: [store] }
  })
}

describe('EntityPreviewFileCard', () => {
  it('downloads the original without leaving the page', () => {
    const link = mountCard().get('a.download-button')
    expect(link.attributes('href')).toBe(
      '/api/movies/originals/preview-files/preview-1/download'
    )
    expect(link.attributes('download')).toBe('')
  })

  it('hands the preview status over to its preview', () => {
    const preview = mountCard({ status: 'processing' }).getComponent(
      EntityPreview
    )
    expect(preview.props('previewFileStatus')).toBe('processing')
  })
})
