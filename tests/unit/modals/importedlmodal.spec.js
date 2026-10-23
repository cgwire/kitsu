vi.mock('@/store', () => ({ default: {} }))

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import ImportEdlModal from '@/components/modals/ImportEdlModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import FileUpload from '@/components/widgets/FileUpload.vue'
import TextField from '@/components/widgets/TextField.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const store = createStore({
  getters: {
    currentProduction: () => ({ id: 'p1', name: 'Faune' }),
    isTVShow: () => false
  }
})

const mountModal = importError =>
  mount(ImportEdlModal, {
    props: { active: true, importError, isError: Boolean(importError) },
    global: { plugins: [store, i18n], stubs: { FileUpload: true } }
  })

const errorText = importError =>
  mountModal(importError).findComponent(ModalFooter).props('errorText')

const selectFile = async wrapper => {
  const formData = new FormData()
  formData.append('file', new File(['edl'], 'cut.otio'))
  wrapper.findComponent(FileUpload).vm.$emit('fileselected', formData)
  await nextTick()
}

const timeoutError = () =>
  Object.assign(new Error('Response timeout'), { isTimeout: true })

describe('ImportEdlModal', () => {
  test('a timed out import says it continues in the background', () => {
    expect(errorText(timeoutError())).toBe(
      'main.csv.error_timeout main.csv.error_timeout_hint'
    )
  })

  test('uploads the selected file', async () => {
    const wrapper = mountModal(null)
    await selectFile(wrapper)

    expect(wrapper.findComponent(ModalFooter).props('isDisabled')).toBe(false)
    wrapper.findComponent(TextField).vm.$emit('enter')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  // Importing again right away would race the import still running.
  test('blocks a new upload after a timeout', async () => {
    const wrapper = mountModal(timeoutError())
    await selectFile(wrapper)

    expect(wrapper.findComponent(ModalFooter).props('isDisabled')).toBe(true)
    wrapper.findComponent(TextField).vm.$emit('enter')
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  test('a rejected import appends the server message', () => {
    const importError = Object.assign(new Error('Bad Request'), {
      isTimeout: false,
      status: 400,
      response: { body: { message: 'Unknown clip' } }
    })

    expect(errorText(importError)).toBe('main.edl.error_upload Unknown clip')
  })
})
