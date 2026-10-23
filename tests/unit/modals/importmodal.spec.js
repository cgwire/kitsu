vi.mock('@/store', () => ({ default: {} }))

import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

import ImportModal from '@/components/modals/ImportModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const mountModal = ({ props = {}, reset = vi.fn() } = {}) =>
  mount(ImportModal, {
    props: { active: true, ...props },
    global: {
      plugins: [i18n],
      stubs: {
        FileUploadZone: {
          name: 'FileUploadZone',
          template: '<div />',
          methods: { reset }
        }
      }
    }
  })

describe('ImportModal', () => {
  // The browser fires no change event for the file its picker still holds:
  // after a file that could not be read, picking it again did nothing.
  test('clears the picker once a file is picked', async () => {
    const reset = vi.fn()
    const wrapper = mountModal({ reset })
    const formData = new FormData()

    await wrapper
      .findComponent({ name: 'FileUploadZone' })
      .vm.$emit('fileselected', formData)

    expect(reset).toHaveBeenCalledOnce()
    expect(wrapper.emitted('confirm')).toEqual([[formData, 'file']])
  })

  test('says that the file could not be read', () => {
    const wrapper = mountModal({ props: { isError: true } })

    expect(wrapper.findComponent(ModalFooter).props()).toMatchObject({
      isError: true,
      errorText: 'main.csv.error_read'
    })
  })

  // Picked again, an empty file fails the same way: asking for it again led
  // nowhere.
  test.each([
    ['could not be read', ['Name;Type'], 'main.csv.error_read'],
    ['is empty', [], 'main.csv.error_empty']
  ])('says that a picked file %s', async (name, content, errorText) => {
    const wrapper = mountModal()
    const formData = new FormData()
    formData.append('file', new File(content, 'import.csv'))

    await wrapper
      .findComponent({ name: 'FileUploadZone' })
      .vm.$emit('fileselected', formData)
    await wrapper.setProps({ isError: true })

    expect(wrapper.findComponent(ModalFooter).props('errorText')).toBe(
      errorText
    )
  })

  // Read again, the picked file fails the same way: only another pick can
  // work.
  test('disables the preview of a file that could not be read', async () => {
    const wrapper = mountModal()
    const formData = new FormData()
    formData.append('file', new File(['Name;Type'], 'import.csv'))
    const footer = () => wrapper.findComponent(ModalFooter)

    await wrapper
      .findComponent({ name: 'FileUploadZone' })
      .vm.$emit('fileselected', formData)
    await wrapper.setProps({ isError: true })
    expect(footer().props('isDisabled')).toBe(true)

    await wrapper.findAll('.tabs a')[1].trigger('click')
    await wrapper.find('textarea').setValue('Name;Type')
    expect(footer().props('isDisabled')).toBe(false)
  })
})
