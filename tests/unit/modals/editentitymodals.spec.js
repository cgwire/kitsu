import { createStore } from 'vuex'

import { shallowMountWithI18n } from '../fixtures/i18n'

import EditAssetModal from '@/components/modals/EditAssetModal.vue'
import EditEditModal from '@/components/modals/EditEditModal.vue'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal.vue'
import EditSequenceModal from '@/components/modals/EditSequenceModal.vue'
import EditShotModal from '@/components/modals/EditShotModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'

const store = createStore({
  getters: {
    assetCreated: () => '',
    assetMetadataDescriptors: () => [],
    currentEpisode: () => null,
    currentProduction: () => ({ id: 'p1' }),
    editMetadataDescriptors: () => [],
    episodeMetadataDescriptors: () => [],
    episodes: () => [],
    isPaperProduction: () => false,
    isTVShow: () => false,
    openProductions: () => [{ id: 'p1' }],
    productionAssetTypeOptions: () => [],
    sequenceMetadataDescriptors: () => [],
    sequenceOptions: () => [],
    shotMetadataDescriptors: () => []
  }
})

const footerError = wrapper => wrapper.findComponent(ModalFooter).props('errorText')

const modals = [
  {
    name: 'EditAssetModal',
    modal: EditAssetModal,
    entityProp: 'assetToEdit',
    errorText: wrapper => wrapper.find('p.error').text()
  },
  {
    name: 'EditEditModal',
    modal: EditEditModal,
    entityProp: 'editToEdit',
    errorText: footerError
  },
  {
    name: 'EditEpisodeModal',
    modal: EditEpisodeModal,
    entityProp: 'episodeToEdit',
    errorText: footerError
  },
  {
    name: 'EditSequenceModal',
    modal: EditSequenceModal,
    entityProp: 'sequenceToEdit',
    errorText: footerError
  },
  {
    name: 'EditShotModal',
    modal: EditShotModal,
    entityProp: 'shotToEdit',
    errorText: footerError
  }
]

// The page tells the modal when the save failed on an entity deleted in the
// meantime, from another session for instance.
describe.each(modals)('modals/$name, failed save', ({ modal, entityProp, errorText }) => {
  test('tells a deleted entity from the other failures', async () => {
    const wrapper = shallowMountWithI18n(modal, {
      global: { plugins: [store], renderStubDefaultSlot: true },
      props: {
        active: true,
        isError: true,
        [entityProp]: { id: 'entity-1', name: 'Tree', data: {} }
      }
    })
    const otherFailure = errorText(wrapper)

    await wrapper.setProps({ isDeleted: true })

    expect(errorText(wrapper)).toBe(
      '"Tree" could not be saved: it was deleted in the meantime.'
    )
    expect(otherFailure).not.toBe(errorText(wrapper))
  })

  // The same modal creates the entities, which have no id yet, and a detail
  // page hands it null when its entity is gone.
  test.each([
    ['a creation', { name: '' }],
    ['no entity', null]
  ])('keeps its own message for %s', async (_, entity) => {
    const wrapper = shallowMountWithI18n(modal, {
      global: { plugins: [store], renderStubDefaultSlot: true },
      props: { active: true, isError: true, [entityProp]: entity }
    })
    const otherFailure = errorText(wrapper)

    await wrapper.setProps({ isDeleted: true })

    expect(errorText(wrapper)).toBe(otherFailure)
  })
})
