import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditAssetModal from '@/components/modals/EditAssetModal.vue'
import Assets from '@/components/pages/Assets.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'

import {
  buildAddThumbnailsModalStub,
  mountEntityPage,
  production
} from '../../fixtures/entity-page'

// Two assets with their tasks in the store: the page decides on mount
// whether their scope (episode) is the displayed one.
const asset = id => ({
  id,
  project_id: production.id,
  validations: new Map([['task-type-1', 'task-1']])
})
const assetMap = new Map([
  ['asset-1', asset('asset-1')],
  ['asset-2', asset('asset-2')]
])

const mountPage = async getters => {
  const page = await mountEntityPage(Assets, {
    listName: 'AssetList',
    getters: { assetMap, assetValidationColumns: ['task-type-1'], ...getters }
  })
  await flushPromises()
  return page.dispatched('loadAssets')
}

describe('Assets page, reload of another episode', () => {
  test('reloads when the store holds another episode', async () => {
    const loads = await mountPage({
      isTVShow: true,
      currentEpisode: { id: 'ep-b' },
      assetsLoadingKey: `${production.id}/ep-a`
    })

    expect(loads).toHaveLength(1)
  })

  test('reloads when the store holds the production-wide dataset', async () => {
    const loads = await mountPage({
      isTVShow: true,
      currentEpisode: { id: 'ep-a' },
      assetsLoadingKey: `${production.id}/all`
    })

    expect(loads).toHaveLength(1)
  })

  test('does not reload when the store holds the displayed episode', async () => {
    const loads = await mountPage({
      isTVShow: true,
      currentEpisode: { id: 'ep-a' },
      assetsLoadingKey: `${production.id}/ep-a`
    })

    expect(loads).toHaveLength(0)
  })

  test.each(['all', 'main'])(
    'does not reload the %s pseudo-episode already loaded',
    async episodeId => {
      const loads = await mountPage({
        isTVShow: true,
        currentEpisode: { id: episodeId },
        assetsLoadingKey: `${production.id}/${episodeId}`
      })

      expect(loads).toHaveLength(0)
    }
  )

  test('does not reload on a production without episodes', async () => {
    const loads = await mountPage({
      currentEpisode: { id: 'ep-a' },
      assetsLoadingKey: `${production.id}/`
    })

    expect(loads).toHaveLength(0)
  })
})

describe('Assets page, restore', () => {
  test('shows the error of a failed restore in its modal', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountEntityPage(Assets, {
      listName: 'AssetList',
      actions: { restoreAsset: () => Promise.reject(new Error('down')) }
    })
    await flushPromises()
    await wrapper
      .findComponent({ name: 'AssetList' })
      .vm.$emit('restore-clicked', { id: 'asset-1', name: 'Tree' })
    const modal = () =>
      wrapper.findAllComponents(DeleteModal).find(modal => modal.props('active'))

    await modal().vm.$emit('confirm')
    await flushPromises()

    expect(modal().props('isError')).toBe(true)
  })
})

describe('Assets page, thumbnails import', () => {
  test('opens the modal and marks each asset while its preview uploads', async () => {
    const modalStub = buildAddThumbnailsModalStub()
    const { wrapper } = await mountEntityPage(Assets, {
      listName: 'AssetList',
      getters: { isCurrentUserProductionManager: true },
      actions: {
        commentTaskWithPreview: () => ({ preview: { id: 'preview-1' } })
      },
      stubs: { AddThumbnailsModal: modalStub }
    })
    const modal = () => wrapper.findComponent({ name: 'AddThumbnailsModal' })

    await wrapper
      .findAllComponents(ButtonSimple)
      .find(button => button.props('icon') === 'import-files')
      .vm.$emit('click')
    expect(modal().exists()).toBe(true)

    await modal().vm.$emit('confirm', [
      { task: { id: 'task-1', entity_id: 'asset-1' } }
    ])
    await flushPromises()

    expect(modalStub.methods.markLoading).toHaveBeenCalledWith('asset-1')
    expect(modalStub.methods.markUploaded).toHaveBeenCalledWith('asset-1')
  })
})

describe('Assets page, department filter', () => {
  // The page saves the selected department as a preference.
  afterEach(() => localStorage.clear())

  test('hands the selected department to the list', async () => {
    const { wrapper } = await mountEntityPage(Assets, {
      listName: 'AssetList',
      getters: { departments: [{ id: 'department-1', name: 'Modeling' }] }
    })

    await wrapper
      .findComponent(ComboboxDepartment)
      .vm.$emit('update:modelValue', 'department-1')
    await flushPromises()

    expect(
      wrapper.findComponent({ name: 'AssetList' }).props('departmentFilter')
    ).toEqual(['department-1'])
  })
})

describe('Assets page, edit modal messages', () => {
  afterEach(() => vi.restoreAllMocks())

  // The real modal: a confirm and stay calls its focusName.
  const mountModal = async actions => {
    const { wrapper } = await mountEntityPage(Assets, {
      listName: 'AssetList',
      getters: { isCurrentUserProductionManager: true },
      actions,
      stubs: { EditAssetModal: false }
    })
    const newButton = wrapper
      .findAllComponents(ButtonSimple)
      .find(button => button.props('icon') === 'plus')
    return { newButton, modal: () => wrapper.findComponent(EditAssetModal) }
  }

  // Close keeps the messages of the last save: opening drops them.
  test('opens without the error of a past failed creation', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { newButton, modal } = await mountModal({
      newAsset: () => Promise.reject(new Error('down'))
    })

    await newButton.vm.$emit('click')
    await modal().vm.$emit('confirm', { name: 'Hero' })
    await flushPromises()
    expect(modal().props('isError')).toBe(true)

    await modal().vm.$emit('cancel')
    await newButton.vm.$emit('click')

    expect(modal().props('active')).toBe(true)
    expect(modal().props('isError')).toBe(false)
  })

  test('opens without the success of a past confirm and stay', async () => {
    const { newButton, modal } = await mountModal()

    await newButton.vm.$emit('click')
    await modal().vm.$emit('confirm-and-stay', { name: 'Hero' })
    await flushPromises()
    expect(modal().props('isSuccess')).toBe(true)

    await modal().vm.$emit('cancel')
    await newButton.vm.$emit('click')

    expect(modal().props('active')).toBe(true)
    expect(modal().props('isSuccess')).toBe(false)
  })
})
