import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PreviewModal from '@/components/modals/PreviewModal.vue'

describe('PreviewModal', () => {
  it('downloads the preview without leaving the page', () => {
    const wrapper = mount(PreviewModal, {
      props: { active: true, previewFileId: 'preview-1' }
    })
    const link = wrapper.get(
      'a[href="/api/pictures/originals/preview-files/preview-1/download"]'
    )
    expect(link.attributes('download')).toBe('')
    wrapper.unmount()
  })
})
