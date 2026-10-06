import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import ProjectTemplateSettings from '@/components/pages/ProjectTemplateSettings.vue'

import { mountEntityPage } from '../../fixtures/entity-page'

// A close keeps the error of a refused save: the next opening drops it.
describe('ProjectTemplateSettings page, metadata column modal', () => {
  afterEach(() => vi.restoreAllMocks())

  const template = {
    id: 'template-1',
    name: 'Feature',
    metadata_descriptors: [
      { name: 'Difficulty', data_type: 'string', entity_type: 'Asset' }
    ]
  }

  const mountPage = () =>
    mountEntityPage(ProjectTemplateSettings, {
      query: { tab: 'metadataDescriptors' },
      actions: {
        loadProjectTemplate: () => template,
        loadTemplateTaskTypes: () => [],
        loadTemplateTaskStatuses: () => [],
        loadTemplateAssetTypes: () => [],
        loadTemplateStatusAutomations: () => [],
        loadTemplateBackgrounds: () => [],
        setTemplateMetadataDescriptors: () => Promise.reject(new Error('taken'))
      }
    })

  test.each([
    [
      'a new column',
      wrapper =>
        wrapper
          .findAll('button')
          .find(button => button.text() === 'project_templates.add_metadata')
          .trigger('click')
    ],
    [
      'a column edit',
      wrapper => wrapper.findComponent(RowActionsCell).vm.$emit('edit-clicked')
    ]
  ])('opens %s without the error of a refused column', async (_, open) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountPage()
    const modal = () => wrapper.findComponent(AddMetadataModal)

    await open(wrapper)
    await modal().vm.$emit('confirm', { name: 'Complexity' })
    await flushPromises()
    expect(modal().props('isError')).toBe(true)

    await modal().vm.$emit('cancel')
    await open(wrapper)

    expect(modal().props('active')).toBe(true)
    expect(modal().props('isError')).toBe(false)
  })
})
