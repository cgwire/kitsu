import { flushPromises, shallowMount } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import NewProduction from '@/components/pages/production/NewProduction.vue'

import { BrokenFileReader, GoneFileReader } from '../fixtures/file-reader'

const mountPage = async ({ config = {}, actions = {} } = {}) => {
  const store = {
    getters: {
      assetsCsvFormData: {},
      assetTaskTypes: [],
      assetTypes: [],
      productionStatus: [{ id: 'status-open' }],
      projectTemplates: [],
      shotsCsvFormData: {},
      shotTaskTypes: [],
      taskStatus: []
    },
    commit: vi.fn(),
    dispatch: vi.fn((name, payload) =>
      Promise.resolve(actions[name] ? actions[name](payload) : undefined)
    )
  }
  const wrapper = shallowMount(NewProduction, {
    global: {
      config,
      provide: { store },
      stubs: {
        TextField: {
          name: 'TextField',
          template: '<input />',
          methods: { focus: () => {} }
        },
        // The import buttons sit in the steps of the timeline.
        TimelineItem: { template: '<div><slot /></div>' }
      }
    }
  })
  await flushPromises()
  return wrapper
}

const buildFormData = () => {
  const formData = new FormData()
  formData.append('file', new File(['Type,Name'], 'import.csv'))
  return formData
}

describe('New production page, CSV import', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe.each([
    ['assets', 0, 'import-assets-modal', 'uploadAssetFile'],
    ['shots', 1, 'import-shots-modal', 'uploadShotFile']
  ])('of the %s', (kind, buttonIndex, ref, uploadAction) => {
    const openImportModal = async wrapper => {
      await wrapper.findAll('.import-button')[buttonIndex].trigger('click')
      return () => wrapper.findComponent({ ref })
    }

    test('shows the error of a file the browser cannot read', async () => {
      vi.stubGlobal('FileReader', GoneFileReader)
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = await mountPage()
      const modal = await openImportModal(wrapper)

      await modal().vm.$emit('confirm', buildFormData(), 'file')
      await flushPromises()

      expect(modal().props()).toMatchObject({
        active: true,
        isError: true,
        isLoading: false
      })
      // The page's own errors say the production was created.
      expect(wrapper.find('.error').exists()).toBe(false)
      expect(console.error).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'NotFoundError' })
      )
    })

    test('opens again without the error of an unreadable file', async () => {
      vi.stubGlobal('FileReader', GoneFileReader)
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = await mountPage()
      const modal = await openImportModal(wrapper)
      await modal().vm.$emit('confirm', buildFormData(), 'file')
      await flushPromises()

      await modal().vm.$emit('cancel')
      await openImportModal(wrapper)

      expect(modal().props()).toMatchObject({ active: true, isError: false })
    })

    // The page tells the failed upload of a creation on its own: the import
    // modal says that the file could not be read.
    test('opens again without the error of a failed upload', async () => {
      const wrapper = await mountPage({
        actions: {
          newProduction: () => ({ id: 'production-1' }),
          [uploadAction]: () => Promise.reject(new Error('down'))
        }
      })
      // A template only asks for a name.
      await wrapper
        .findComponent({ name: 'ComboboxStyled' })
        .vm.$emit('update:modelValue', 'template-1')
      await wrapper
        .findComponent({ name: 'TextField' })
        .vm.$emit('update:modelValue', 'Movie')
      await wrapper
        .findAllComponents(ImportRenderModal)
        [buttonIndex].vm.$emit('confirm', [['Name'], ['Hero']])
      await wrapper.find('.big-button').trigger('click')
      await flushPromises()
      expect(wrapper.find('.error').exists()).toBe(true)

      const modal = await openImportModal(wrapper)

      expect(modal().props()).toMatchObject({ active: true, isError: false })
    })

    test('releases the modal on a bug, left to the error handler', async () => {
      vi.stubGlobal('FileReader', BrokenFileReader)
      const errorHandler = vi.fn()
      const wrapper = await mountPage({ config: { errorHandler } })
      const modal = await openImportModal(wrapper)

      await modal().vm.$emit('confirm', buildFormData(), 'file')
      await flushPromises()

      expect(modal().props()).toMatchObject({ isError: true, isLoading: false })
      expect(errorHandler).toHaveBeenCalledWith(
        expect.any(TypeError),
        expect.anything(),
        expect.anything()
      )
    })
  })
})
