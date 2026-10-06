import { flushPromises, mount } from '@vue/test-utils'

vi.mock('@/composables/modal', () => ({ useModal: () => {} }))

import EditConceptFolderModal from '@/components/modals/EditConceptFolderModal.vue'

const openModal = async (props = {}) => {
  const wrapper = mount(EditConceptFolderModal, { props })
  await wrapper.setProps({ active: true })
  await flushPromises()
  return wrapper
}

const confirm = wrapper => wrapper.find('.modal-footer a.button').trigger('click')

describe('modals/EditConceptFolderModal', () => {
  it('confirms with the typed name, trimmed', async () => {
    const wrapper = await openModal()

    await wrapper.find('input').setValue('  Characters ')
    await confirm(wrapper)

    expect(wrapper.emitted('confirm')).toEqual([['Characters']])
  })

  it('starts from the name of the folder to rename', async () => {
    const wrapper = await openModal({
      folderToEdit: { id: 'folder-1', name: 'Sets' }
    })

    expect(wrapper.find('input').element.value).toBe('Sets')
  })

  it('does not confirm an empty name', async () => {
    const wrapper = await openModal()

    await wrapper.find('input').setValue('   ')
    await confirm(wrapper)

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})
