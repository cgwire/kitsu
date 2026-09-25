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

// Shows the parameters too, so the line numbers handed to $t are checked.
const $t = (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key)

const rows = wrapper => wrapper.findAll('tbody tr')
const isConfirmDisabled = wrapper =>
  wrapper.findComponent(ModalFooter).props('isDisabled')

describe('ImportRenderModal', () => {
  describe('required values', () => {
    test('flags the lines missing a required value and blocks the import', () => {
      const wrapper = mountModal({ requiredValues: ['Sequence', 'Name'] })

      const flagged = rows(wrapper).map(row => row.classes('incomplete'))
      expect(flagged).toEqual([false, true, false, true])
      expect(wrapper.text()).toContain('main.csv.missing_values')
      expect(isConfirmDisabled(wrapper)).toBe(true)
    })

    test('lets the import through when every line has its values', () => {
      const wrapper = mountModal({
        parsedCsv: parsedCsv().slice(0, 2),
        requiredValues: ['Sequence', 'Name']
      })

      expect(wrapper.find('tr.incomplete').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('main.csv.missing_values')
      expect(isConfirmDisabled(wrapper)).toBe(false)
    })

    // The user fixes their own file: lines are counted as in it, empty
    // ones included.
    test('gives the line numbers of the file', () => {
      const wrapper = mount(ImportRenderModal, {
        props: {
          active: true,
          columns: ['Sequence', 'Name', 'Frames'],
          dataMatchers: ['Sequence', 'Name'],
          requiredValues: ['Sequence', 'Name'],
          parsedCsv: [
            ['Sequence', 'Name', 'Frames'],
            ['0010', '00010', '198'],
            [''],
            ['0040', '', ''],
            ['', '', '113443']
          ]
        },
        global: { plugins: [store, i18n], mocks: { $t } }
      })

      const flagged = rows(wrapper).map(row => row.classes('incomplete'))
      expect(flagged).toEqual([false, true, true])
      expect(wrapper.text()).toContain('"count":2')
      expect(wrapper.text()).toContain('"lines":"4, 5"')
    })

    // A line without separator is uploaded too, and Zou rejects it.
    test('flags a line holding a single cell', () => {
      const wrapper = mountModal({
        parsedCsv: [['Sequence', 'Name'], ['SQ01', 'SH01'], ['Total']],
        requiredValues: ['Sequence', 'Name']
      })

      const flagged = rows(wrapper).map(row => row.classes('incomplete'))
      expect(flagged).toEqual([false, true])
      expect(isConfirmDisabled(wrapper)).toBe(true)
    })

    test('checks nothing when the import requires no value', () => {
      const wrapper = mountModal()

      expect(wrapper.find('tr.incomplete').exists()).toBe(false)
      expect(isConfirmDisabled(wrapper)).toBe(false)
    })
  })

  describe('existing entries', () => {
    test('match the right line after an empty one', () => {
      const wrapper = mountModal({
        parsedCsv: [['Sequence', 'Name'], ['SQ01', 'SH01'], [''], ['SQ01', 'SH02']],
        database: { SQ01SH02: true }
      })

      const disabled = rows(wrapper).map(row => row.classes('disabled'))
      expect(disabled).toEqual([false, true])
    })
  })

  describe('upload errors', () => {
    // Kitsu uploads the lines without the empty ones: Zou counts the lines
    // of that file.
    test('highlights the line Zou rejected, with its number in the file', () => {
      const importError = Object.assign(new Error('Bad Request'), {
        isTimeout: false,
        status: 400,
        response: { body: { message: 'Name cannot be empty', line_number: 3 } }
      })
      const wrapper = mount(ImportRenderModal, {
        props: {
          active: true,
          columns: ['Sequence', 'Name'],
          dataMatchers: ['Sequence', 'Name'],
          importError,
          isError: true,
          parsedCsv: [
            ['Sequence', 'Name'],
            ['SQ01', 'SH01'],
            [''],
            ['SQ02', ''],
            ['SQ03', 'SH03']
          ]
        },
        global: { plugins: [store, i18n], mocks: { $t } }
      })

      const highlighted = rows(wrapper).map(row => row.classes('error-row'))
      expect(highlighted).toEqual([false, true, false])
      expect(wrapper.text()).toContain('main.csv.error_line {"line":4}')
    })

    // Zou numbers the physical lines of the upload: a quoted cell holding
    // line breaks spans several, the rejected line comes further down.
    test('finds the rejected line after a cell holding line breaks', () => {
      const importError = Object.assign(new Error('Bad Request'), {
        isTimeout: false,
        status: 400,
        response: { body: { message: 'Name cannot be empty', line_number: 6 } }
      })
      const wrapper = mount(ImportRenderModal, {
        props: {
          active: true,
          columns: ['Sequence', 'Name', 'Description'],
          dataMatchers: ['Sequence', 'Name'],
          importError,
          isError: true,
          parsedCsv: [
            ['Sequence', 'Name', 'Description'],
            ['SQ01', 'SH01', 'Wide shot\r\nthen a pan\nto the left\rand back'],
            ['SQ02', '', 'Rejected'],
            ['SQ03', 'SH03', '']
          ]
        },
        global: { plugins: [store, i18n], mocks: { $t } }
      })

      const highlighted = rows(wrapper).map(row => row.classes('error-row'))
      expect(highlighted).toEqual([false, true, false])
      expect(wrapper.text()).toContain('main.csv.error_line {"line":3}')
    })

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
