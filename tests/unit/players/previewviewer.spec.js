import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PreviewViewer from '@/components/players/viewers/PreviewViewer.vue'

describe('PreviewViewer', () => {
  // No viewer handles this extension: the panel offers the file instead.
  it('downloads a file it cannot show without leaving the page', () => {
    const wrapper = shallowMount(PreviewViewer, {
      props: {
        preview: {
          id: 'preview-1',
          extension: 'zip',
          original_name: 'scene',
          status: 'ready'
        }
      }
    })
    const link = wrapper.get('a.button')
    expect(link.attributes('href')).toBe(
      '/api/pictures/originals/preview-files/preview-1/download'
    )
    expect(link.attributes('download')).toBe('')
  })
})
