import { mount } from '@vue/test-utils'

import FileUpload from '@/components/widgets/FileUpload.vue'

describe('FileUpload', () => {
  const mountUpload = () => mount(FileUpload, { props: { label: 'Browse' } })

  test('selects the dropped file', async () => {
    const wrapper = mountUpload()
    const file = new File(['Type,Name'], 'import.csv')

    await wrapper.trigger('drop', { dataTransfer: { files: [file] } })

    const [[formData]] = wrapper.emitted('fileselected')
    expect(formData.get('file').name).toBe('import.csv')
  })

  // A drop of text or of a link holds no file.
  test('ignores a drop without any file', async () => {
    const wrapper = mountUpload()

    await wrapper.trigger('drop', { dataTransfer: { files: [] } })

    expect(wrapper.emitted('fileselected')).toBeUndefined()
  })
})
