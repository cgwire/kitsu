import { flushPromises, shallowMount } from '@vue/test-utils'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('@/store', () => ({ default: {} }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

import errors from '@/lib/errors'

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

// A failed request, as the API client rejects it.
const buildRequestFailure = fields => {
  const err = Object.assign(new Error('Bad Request'), fields)
  errors.markRequestFailure(err)
  return err
}

// A template only asks for a name.
const fillForm = async wrapper => {
  await wrapper
    .findComponent({ name: 'ComboboxStyled' })
    .vm.$emit('update:modelValue', 'template-1')
  await wrapper
    .findComponent({ name: 'TextField' })
    .vm.$emit('update:modelValue', 'Movie')
}

describe('New production page, creation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    push.mockClear()
  })

  test('opens the production once created', async () => {
    const wrapper = await mountPage({
      actions: { newProduction: () => ({ id: 'production-1' }) }
    })
    await fillForm(wrapper)

    await wrapper.find('.big-button').trigger('click')
    await flushPromises()

    expect(push).toHaveBeenCalledWith({
      name: 'assets',
      params: { production_id: 'production-1' }
    })
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  test('says that the creation failed when Zou refuses it', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountPage({
      actions: {
        newProduction: () =>
          Promise.reject(
            buildRequestFailure({ status: 400, body: { message: 'Name taken' } })
          )
      }
    })
    await fillForm(wrapper)

    await wrapper.find('.big-button').trigger('click')
    await flushPromises()

    const error = wrapper.find('.error').text()
    expect(error).toContain('Name taken')
    expect(error).not.toContain('productions.creation.error_setup')
    expect(consoleError).toHaveBeenCalled()
  })

  // Regression: once Zou had created the production, a failure of its setup
  // still read as a failed creation, next to the button that opens it.
  test('says that the production exists when its setup fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountPage({
      actions: {
        newProduction: () => ({ id: 'production-1' }),
        loadContext: () =>
          Promise.reject(buildRequestFailure({ status: 502, body: {} }))
      }
    })
    await fillForm(wrapper)

    await wrapper.find('.big-button').trigger('click')
    await flushPromises()

    expect(push).not.toHaveBeenCalled()
    expect(wrapper.find('.error').text()).toContain(
      'productions.creation.error_setup'
    )
    expect(wrapper.find('.big-button').text()).toBe(
      'productions.creation.open_production'
    )
    expect(consoleError).toHaveBeenCalled()
  })

  test.each([
    ['23.976', false],
    ['0.5', false],
    ['60.5', true]
  ])('flags a %s fps as errored: %s', async (fps, errored) => {
    const wrapper = await mountPage()
    const fpsField = wrapper
      .findAllComponents({ name: 'TextField' })
      .find(
        field =>
          field.attributes('placeholder') ===
          'productions.creation.placeholder_fps'
      )
    await fpsField.vm.$emit('update:modelValue', fps)
    expect(fpsField.attributes('errored')).toBe(String(errored))
  })

  // Zou gives the production the type of its template.
  test.each([
    ['tvshow', 'episode-assets', { episode_id: 'all' }],
    ['shots', 'shots', {}]
  ])(
    'opens a %s production made from a template on its page',
    async (productionType, name, params) => {
      const wrapper = await mountPage({
        actions: {
          newProduction: () => ({
            id: 'production-1',
            production_type: productionType
          })
        }
      })
      await fillForm(wrapper)

      await wrapper.find('.big-button').trigger('click')
      await flushPromises()

      expect(push).toHaveBeenCalledWith({
        name,
        params: { production_id: 'production-1', ...params }
      })
    }
  )

  // The type hides the import step of the other entity: what was imported
  // there before the switch stays out of the production.
  test.each([
    ['assets', 1, 'uploadShotFile', [['Sequence', 'Name'], ['SQ01', 'SH01']]],
    ['shots', 0, 'uploadAssetFile', [['Type', 'Name'], ['Character', 'Hero']]]
  ])(
    'leaves out the hidden import when the production holds %s only',
    async (type, renderIndex, uploadAction, lines) => {
      const upload = vi.fn()
      const wrapper = await mountPage({
        actions: {
          newProduction: () => ({ id: 'production-1' }),
          [uploadAction]: upload
        }
      })
      await wrapper
        .findAllComponents(ImportRenderModal)
        [renderIndex].vm.$emit('confirm', lines)
      await wrapper
        .findAllComponents({ name: 'ComboboxStyled' })
        .find(combo => combo.props('localeKeyPrefix') === 'productions.type.')
        .vm.$emit('update:modelValue', type)
      await fillForm(wrapper)

      await wrapper.find('.big-button').trigger('click')
      await flushPromises()

      expect(upload).not.toHaveBeenCalled()
      expect(push).toHaveBeenCalled()
    }
  )
})

describe('New production page, CSV import', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    push.mockClear()
  })

  describe.each([
    [
      'assets',
      0,
      'import-assets-modal',
      'uploadAssetFile',
      'errorImportingAssets'
    ],
    ['shots', 1, 'import-shots-modal', 'uploadShotFile', 'errorImportingShots']
  ])('of the %s', (kind, buttonIndex, ref, uploadAction, errorKey) => {
    const openImportModal = async wrapper => {
      await wrapper.findAll('.import-button')[buttonIndex].trigger('click')
      return () => wrapper.findComponent({ ref })
    }

    const createWithImport = async wrapper => {
      await fillForm(wrapper)
      await wrapper
        .findAllComponents(ImportRenderModal)
        [buttonIndex].vm.$emit('confirm', [['Name'], ['Hero']])
      await wrapper.find('.big-button').trigger('click')
      await flushPromises()
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

    test('stays on the page with the reason of a refused upload', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const loadContext = vi.fn()
      const wrapper = await mountPage({
        actions: {
          loadContext,
          newProduction: () => ({ id: 'production-1' }),
          [uploadAction]: () =>
            Promise.reject(
              buildRequestFailure({
                status: 400,
                body: {
                  message: "A columns is missing: 'Name'",
                  imported_rows: 2
                }
              })
            )
        }
      })

      await createWithImport(wrapper)

      expect(push).not.toHaveBeenCalled()
      expect(loadContext).toHaveBeenCalled()
      const error = wrapper.find('.error').text()
      expect(error).toContain(`productions.creation.${errorKey}`)
      expect(error).toContain("A columns is missing: 'Name'")
      expect(error).toContain('main.csv.error_imported_rows')
    })

    test('shows no detail of a server failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = await mountPage({
        actions: {
          newProduction: () => ({ id: 'production-1' }),
          [uploadAction]: () =>
            Promise.reject(
              buildRequestFailure({
                status: 500,
                body: { message: 'Internal Server Error' }
              })
            )
        }
      })

      await createWithImport(wrapper)

      const error = wrapper.find('.error').text()
      expect(error).toContain(`productions.creation.${errorKey}`)
      expect(error).not.toContain('Internal Server Error')
    })

    test('says that a timed out upload goes on in the background', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = await mountPage({
        actions: {
          newProduction: () => ({ id: 'production-1' }),
          [uploadAction]: () =>
            Promise.reject(buildRequestFailure({ isTimeout: true, body: '' }))
        }
      })

      await createWithImport(wrapper)

      expect(push).not.toHaveBeenCalled()
      expect(wrapper.find('.error').text()).toContain('main.csv.error_timeout')
    })

    test('keeps the create button while the upload runs', async () => {
      const wrapper = await mountPage({
        actions: {
          newProduction: () => ({ id: 'production-1' }),
          [uploadAction]: () => new Promise(() => {})
        }
      })

      await createWithImport(wrapper)

      expect(wrapper.find('.big-button').text()).toBe(
        'productions.creation.create_button'
      )
    })

    test('opens the created production instead of creating another one', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const newProduction = vi.fn(() => ({ id: 'production-1' }))
      const wrapper = await mountPage({
        actions: {
          newProduction,
          [uploadAction]: () =>
            Promise.reject(buildRequestFailure({ status: 400, body: {} }))
        }
      })
      await createWithImport(wrapper)
      // A file picked now would never be uploaded.
      wrapper
        .findAll('.import-button')
        .forEach(button => expect(button.attributes('disabled')).toBeDefined())

      const button = wrapper.find('.big-button')
      expect(button.text()).toBe('productions.creation.open_production')
      await button.trigger('click')
      await flushPromises()

      expect(newProduction).toHaveBeenCalledTimes(1)
      expect(push).toHaveBeenCalledWith({
        name: 'assets',
        params: { production_id: 'production-1' }
      })
    })

    // The form stays editable once the production exists.
    test('opens the created production on its page whatever the form says since', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = await mountPage({
        actions: {
          newProduction: () => ({
            id: 'production-1',
            production_type: 'tvshow'
          }),
          [uploadAction]: () =>
            Promise.reject(buildRequestFailure({ status: 400, body: {} }))
        }
      })
      await createWithImport(wrapper)
      await wrapper
        .findComponent({ name: 'ComboboxStyled' })
        .vm.$emit('update:modelValue', '')
      await wrapper
        .findAllComponents({ name: 'ComboboxStyled' })
        .find(combo => combo.props('localeKeyPrefix') === 'productions.type.')
        .vm.$emit('update:modelValue', 'shots')

      await wrapper.find('.big-button').trigger('click')
      await flushPromises()

      expect(push).toHaveBeenCalledWith({
        name: 'episode-assets',
        params: { production_id: 'production-1', episode_id: 'all' }
      })
    })

    test('leaves a bug of the upload to the error handler', async () => {
      const errorHandler = vi.fn()
      const wrapper = await mountPage({
        config: { errorHandler },
        actions: {
          newProduction: () => ({ id: 'production-1' }),
          [uploadAction]: () => Promise.reject(new TypeError('boom'))
        }
      })

      await createWithImport(wrapper)

      expect(push).not.toHaveBeenCalled()
      expect(errorHandler).toHaveBeenCalledWith(
        expect.any(TypeError),
        expect.anything(),
        expect.anything()
      )
    })

    // The page tells the failed upload of a creation on its own: the import
    // modal says that the file could not be read.
    test('keeps the error of a failed upload out of the import modal', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = await mountPage({
        actions: {
          newProduction: () => ({ id: 'production-1' }),
          [uploadAction]: () =>
            Promise.reject(buildRequestFailure({ status: 400, body: {} }))
        }
      })

      await createWithImport(wrapper)

      expect(wrapper.find('.error').exists()).toBe(true)
      expect(wrapper.findComponent({ ref }).props('isError')).toBe(false)
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
