import { flushPromises, shallowMount } from '@vue/test-utils'

vi.mock('@/composables/modal', () => ({ useModal: () => {} }))

import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'
import FileUploadZone from '@/components/widgets/FileUploadZone.vue'

const mountModal = (props = {}) =>
  shallowMount(AddPreviewModal, { props: { active: true, ...props } })

const selectFile = async wrapper => {
  const form = new FormData()
  form.append('file', new File(['x'], 'concept.png', { type: 'image/png' }))
  wrapper.findComponent(FileUploadZone).vm.$emit('fileselected', [form])
  await flushPromises()
  return form
}

describe('modals/AddPreviewModal', () => {
  beforeEach(() => {
    window.URL.createObjectURL = vi.fn(() => 'blob:fake')
  })

  it('does not confirm while no file is selected', async () => {
    const wrapper = mountModal()

    await wrapper.find('a.button').trigger('click')
    await wrapper.find('a.button').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('confirms with the selected files', async () => {
    const wrapper = mountModal()
    const form = await selectFile(wrapper)

    await wrapper.find('a.button').trigger('click')

    expect(wrapper.emitted('confirm')[0]).toEqual([[form]])
  })

  it('translates the title of the selected files', async () => {
    const wrapper = mountModal()
    await selectFile(wrapper)

    expect(wrapper.find('h3').text()).toBe('comments.selected_files')
  })

  // The extra preview modal is the only place showing its uploads.
  describe('upload progress', () => {
    const uploadProgress = { 'concept.png': 40 }

    it('shows the progress of each file while it uploads', async () => {
      const wrapper = mountModal({ uploadProgress })
      await selectFile(wrapper)
      await wrapper.setProps({ isLoading: true })

      expect(wrapper.find('.progress').attributes('style')).toContain(
        'width: 40%'
      )
    })

    it('shows no progress before the upload starts', async () => {
      const wrapper = mountModal({ uploadProgress })
      await selectFile(wrapper)

      expect(wrapper.find('.progress').exists()).toBe(false)
    })
  })
})
