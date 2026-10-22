import { mount } from '@vue/test-utils'
import { h } from 'vue'

import i18n, { loadLocaleMessages } from '@/lib/i18n'

import { mountWithI18n } from '../fixtures/i18n'

import FileUpload from '@/components/widgets/FileUpload.vue'

describe('FileUpload', () => {
  const mountUpload = () => mount(FileUpload, { props: { label: 'Browse' } })

  afterEach(() => {
    i18n.global.locale.value = 'en'
  })

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

  // Korean puts the count after the noun, with a counter.
  test('lets the language place the number of selected files', async () => {
    await loadLocaleMessages('ko')
    i18n.global.locale.value = 'ko'
    const wrapper = mountWithI18n({
      render: () => h(FileUpload, { label: 'Browse', multiple: true })
    })
    const files = [new File([''], 'a.png'), new File([''], 'b.png')]

    await wrapper.trigger('drop', { dataTransfer: { files } })

    expect(wrapper.find('.file-upload-status').text()).toBe('파일 2개 선택됨')
  })
})
