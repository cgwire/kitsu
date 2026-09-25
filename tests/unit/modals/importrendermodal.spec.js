vi.mock('@/store', () => ({ default: {} }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/productions/p1/shots', params: {} })
}))

import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const store = createStore({
  getters: {
    assetMetadataDescriptors: () => [],
    editMetadataDescriptors: () => [],
    shotMetadataDescriptors: () => [],
    taskMetadataDescriptors: () => []
  }
})

// The customer file ended with a spreadsheet total row, and held a
// sequence placeholder line: both have no shot name.
const parsedCsv = () => [
  ['Sequence', 'Name', 'Frames'],
  ['0010', '00010', '198'],
  ['0040', '', ''],
  ['', '', ''],
  ['', '', '113443']
]

const mountModal = (props = {}) =>
  mount(ImportRenderModal, {
    props: {
      active: true,
      columns: ['Sequence', 'Name', 'Frames'],
      dataMatchers: ['Sequence', 'Name'],
      parsedCsv: parsedCsv(),
      ...props
    },
    global: { plugins: [store, i18n] }
  })

const isConfirmDisabled = wrapper =>
  wrapper.findComponent(ModalFooter).props('isDisabled')

describe('ImportRenderModal', () => {
  describe('upload errors', () => {
    test('a timed out import says it continues in the background', () => {
      const importError = Object.assign(new Error('Response timeout'), {
        isTimeout: true
      })
      const wrapper = mountModal({ importError, isError: true })

      expect(wrapper.text()).toContain('main.csv.error_timeout')
      expect(wrapper.text()).toContain('main.csv.error_timeout_hint')
      expect(wrapper.text()).not.toContain('main.csv.error_upload')
      // Importing again right away would race the running import.
      expect(isConfirmDisabled(wrapper)).toBe(true)
    })

    test('a rejected import keeps the upload error', () => {
      const importError = Object.assign(new Error('Bad Request'), {
        isTimeout: false,
        status: 400,
        response: { body: { message: 'Name cannot be empty', line_number: 3 } }
      })
      const wrapper = mountModal({ importError, isError: true })

      expect(wrapper.text()).toContain('main.csv.error_upload')
      expect(wrapper.text()).toContain('Name cannot be empty')
      expect(wrapper.text()).not.toContain('main.csv.error_timeout')
      expect(isConfirmDisabled(wrapper)).toBe(false)
    })
  })
})
