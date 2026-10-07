import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import Productions from '@/components/pages/Productions.vue'

import { mountEntityPage } from '../../fixtures/entity-page'

// Zou refuses a column named like another one: a close keeps the error, the
// next opening drops it.
describe('Productions page, metadata column modal', () => {
  afterEach(() => vi.restoreAllMocks())

  const descriptor = {
    id: 'descriptor-1',
    entity_type: 'Project',
    field_name: 'budget',
    name: 'Budget'
  }
  const refuse = () => Promise.reject(new Error('taken'))

  test.each([
    ['a new column', 'add-metadata', undefined, { name: 'Cost' }],
    [
      'a column edit',
      'edit-metadata',
      descriptor.field_name,
      { id: descriptor.id, name: 'Cost' }
    ]
  ])(
    'opens %s without the error of a refused column',
    async (_, event, fieldName, form) => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { wrapper } = await mountEntityPage(Productions, {
        listName: 'ProductionList',
        getters: {
          productions: [
            {
              id: 'production-1',
              name: 'Production',
              descriptors: [descriptor]
            }
          ]
        },
        actions: {
          addProjectMetadataDescriptorToAllProductions: refuse,
          updateProjectMetadataOnAll: refuse
        }
      })
      const list = wrapper.findComponent({ name: 'ProductionList' })
      const modal = () => wrapper.findComponent(AddMetadataModal)

      await list.vm.$emit(event, fieldName)
      await modal().vm.$emit('confirm', form)
      await flushPromises()
      expect(modal().props('isError')).toBe(true)

      await modal().vm.$emit('cancel')
      await list.vm.$emit(event, fieldName)

      expect(modal().props('active')).toBe(true)
      expect(modal().props('isError')).toBe(false)
    }
  )
})
