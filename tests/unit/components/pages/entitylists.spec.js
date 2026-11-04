import { enableAutoUnmount, flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import { mountEntityPage } from '../../fixtures/entity-page'
import { buildRefusal } from '../../fixtures/refusal'

import shotStore from '@/store/modules/shots'

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
import ErrorText from '@/components/widgets/ErrorText.vue'

// A page left mounted renders again with the stubs of the next mount: once
// its first load settles, its list lacks the methods the page calls.
enableAutoUnmount(afterEach)

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

// A cell of a list saves its row at once, without a modal to tell a failure.
describe.each(pages)(
  '$name page, cell save',
  ({ editAction, listName, name, page }) => {
    // The cells of the shots list merge their keystrokes into one request.
    const cellAction = name === 'Shots' ? 'editShotDebounced' : editAction
    const messages = {
      main: {
        cell_save_error: '"{name}" not saved.',
        cells_save_error: 'Some changes not saved.',
        edit_deleted_error: '"{name}" deleted meanwhile.'
      }
    }
    const entry = { id: 'entity-1', name: 'E01', full_name: 'Group / E01' }
    const otherEntry = { id: 'entity-2', name: 'E02', full_name: 'Group / E02' }

    const mount = save =>
      mountEntityPage(page, {
        listName,
        messages,
        actions: { [cellAction]: save }
      })
    const list = wrapper => wrapper.findComponent({ name: listName })
    const changeField = (wrapper, changed = entry) =>
      list(wrapper).vm.$emit('field-changed', {
        entry: changed,
        fieldName: 'description',
        value: 'Wide'
      })
    const message = wrapper => wrapper.findComponent(ErrorText)

    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
      shotStore.cache.shotMap.clear()
    })

    test('tells a cell save Zou refuses', async () => {
      const { wrapper } = await mount(() => Promise.reject(buildRefusal()))

      await changeField(wrapper)
      await flushPromises()

      expect(message(wrapper).props('text')).toBe('"Group / E01" not saved.')
      expect(console.error).toHaveBeenCalledWith(buildRefusal())
    })

    test('tells a metadata cell save Zou refuses', async () => {
      // The shots page reads the shot for its frame count.
      shotStore.cache.shotMap.set(entry.id, { ...entry, data: {} })
      const { wrapper } = await mount(() => Promise.reject(buildRefusal()))

      await list(wrapper).vm.$emit('metadata-changed', {
        entry,
        descriptor: { field_name: 'mood' },
        value: 'calm'
      })
      await flushPromises()

      expect(message(wrapper).props('text')).toBe('"Group / E01" not saved.')
    })

    test('tells a cell save on an entity deleted meanwhile', async () => {
      const { wrapper } = await mount(() => Promise.reject(buildRefusal(404)))

      await changeField(wrapper)
      await flushPromises()

      expect(message(wrapper).props('text')).toBe(
        '"Group / E01" deleted meanwhile.'
      )
    })

    // A change on selected rows applies to each of them.
    test('tells the refusal of several rows at once', async () => {
      const { wrapper } = await mount(() => Promise.reject(buildRefusal()))

      changeField(wrapper, entry)
      changeField(wrapper, otherEntry)
      await flushPromises()

      expect(message(wrapper).props('text')).toBe('Some changes not saved.')
    })

    test('clears the message once a cell save goes through', async () => {
      let isRefused = true
      const { wrapper } = await mount(() =>
        isRefused ? Promise.reject(buildRefusal()) : Promise.resolve({})
      )
      await changeField(wrapper)
      await flushPromises()
      expect(message(wrapper).exists()).toBe(true)

      isRefused = false
      await changeField(wrapper)
      await flushPromises()

      expect(message(wrapper).exists()).toBe(false)
    })
  }
)

// The ready for column of the assets list saves a partial asset.
describe('Assets page, ready for cell', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('tells a ready for save Zou refuses, with the name of the asset', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const asset = { id: 'asset-1', name: 'Rock', full_name: 'Props / Rock' }
    const { wrapper } = await mountEntityPage(Assets, {
      listName: 'AssetList',
      messages: { main: { cell_save_error: '"{name}" not saved.' } },
      getters: { assetMap: new Map([[asset.id, asset]]) },
      actions: {
        editAsset: () =>
          Promise.reject(buildRefusal())
      }
    })

    await wrapper
      .findComponent({ name: 'AssetList' })
      .vm.$emit('asset-changed', { id: asset.id, ready_for: 'tt-1' })
    await flushPromises()

    expect(wrapper.findComponent(ErrorText).props('text')).toBe(
      '"Props / Rock" not saved.'
    )
  })
})
