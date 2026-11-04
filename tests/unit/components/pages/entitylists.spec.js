import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import { mountEntityPage } from '../../fixtures/entity-page'

import EditAssetModal from '@/components/modals/EditAssetModal.vue'
import EditEditModal from '@/components/modals/EditEditModal.vue'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal.vue'
import EditSequenceModal from '@/components/modals/EditSequenceModal.vue'
import EditShotModal from '@/components/modals/EditShotModal.vue'
import Assets from '@/components/pages/Assets.vue'
import Edits from '@/components/pages/Edits.vue'
import Episodes from '@/components/pages/Episodes.vue'
import Sequences from '@/components/pages/Sequences.vue'
import Shots from '@/components/pages/Shots.vue'

const pages = [
  {
    name: 'Assets',
    page: Assets,
    listName: 'AssetList',
    editModal: EditAssetModal,
    editAction: 'editAsset'
  },
  {
    name: 'Edits',
    page: Edits,
    listName: 'EditList',
    editModal: EditEditModal,
    editAction: 'editEdit'
  },
  {
    name: 'Episodes',
    page: Episodes,
    listName: 'EpisodeList',
    editModal: EditEpisodeModal,
    editAction: 'editEpisode'
  },
  {
    name: 'Sequences',
    page: Sequences,
    listName: 'SequenceList',
    editModal: EditSequenceModal,
    editAction: 'editSequence'
  },
  {
    name: 'Shots',
    page: Shots,
    listName: 'ShotList',
    editModal: EditShotModal,
    editAction: 'editShot'
  }
]

describe.each(pages)(
  '$name page, edit modal',
  ({ editAction, editModal, listName, page }) => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    // Zou answers 404 for an entity deleted meanwhile in another session.
    test('tells the modal a save on an entity deleted meanwhile', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      let failure = Object.assign(new Error('Not Found'), { status: 404 })
      const { wrapper } = await mountEntityPage(page, {
        listName,
        actions: { [editAction]: () => Promise.reject(failure) }
      })
      const modal = () => wrapper.findComponent(editModal)
      // The form of the modal carries the id of the entity it edits.
      const form = { id: 'entity-1', name: 'E02', data: {} }

      await wrapper
        .findComponent({ name: listName })
        .vm.$emit('edit-clicked', { id: 'entity-1', name: 'E01', data: {} })
      await modal().vm.$emit('confirm', form)
      await flushPromises()
      expect(modal().props('isError')).toBe(true)
      expect(modal().props('isDeleted')).toBe(true)

      failure = new Error('taken')
      await modal().vm.$emit('confirm', form)
      await flushPromises()
      expect(modal().props('isError')).toBe(true)
      expect(modal().props('isDeleted')).toBe(false)
    })
  }
)
