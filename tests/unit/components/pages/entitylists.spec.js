import { enableAutoUnmount, flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import { mountEntityPage, production } from '../../fixtures/entity-page'
import { buildRefusal } from '../../fixtures/refusal'

import shotStore from '@/store/modules/shots'

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
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
import TaskInfo from '@/components/sides/TaskInfo.vue'
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

// Zou refuses a column named like another column of the production, even
// one hidden from the list.
describe.each(pages)(
  '$name page, metadata column modal',
  ({ listName, page }) => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    // The modal cannot judge every name: € is "eur" for Zou. It says the
    // name is taken once Zou refuses it, until the next opening.
    test.each([
      ['a name Zou says is taken', 'Metadata descriptor already exists.', 'Budget €', false],
      ['another refusal', 'Metadata descriptor name is too long.', '', true]
    ])('tells %s, until the next opening', async (_, message, takenName, isError) => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const refusal = Object.assign(buildRefusal(), { body: { message } })
      const descriptor = { id: 'descriptor-1', name: 'Camera' }
      const { wrapper } = await mountEntityPage(page, {
        listName,
        getters: {
          currentProduction: { ...production, descriptors: [descriptor] }
        },
        actions: { addMetadataDescriptor: () => Promise.reject(refusal) }
      })
      const list = wrapper.findComponent({ name: listName })
      const modal = () => wrapper.findComponent(AddMetadataModal)

      await list.vm.$emit('add-metadata')
      await modal().vm.$emit('confirm', { name: 'Budget €' })
      await flushPromises()
      expect(modal().props('takenName')).toBe(takenName)
      expect(modal().props('isError')).toBe(isError)
      expect(consoleError).toHaveBeenCalledTimes(isError ? 1 : 0)

      await modal().vm.$emit('cancel')
      await list.vm.$emit('add-metadata')
      expect(modal().props('active')).toBe(true)
      expect(modal().props('takenName')).toBe('')
      expect(modal().props('isError')).toBe(false)

      await modal().vm.$emit('confirm', { id: descriptor.id, name: 'Budget €' })
      await flushPromises()
      await modal().vm.$emit('cancel')
      await list.vm.$emit('edit-metadata', descriptor.id)
      expect(modal().props('active')).toBe(true)
      expect(modal().props('takenName')).toBe('')
      expect(modal().props('isError')).toBe(false)
    })

    // Zou drops an emoji from the field name: "FPS 🎬" takes the key of the
    // built-in FPS field, where the modal leaves such a name to Zou.
    test('tells a built-in field uses the name Zou refused as one, until the next opening', async () => {
      const refusal = Object.assign(buildRefusal(), {
        body: {
          message: 'Metadata descriptor name is used by a built-in field.'
        }
      })
      const descriptor = { id: 'descriptor-1', name: 'Camera' }
      const { wrapper } = await mountEntityPage(page, {
        listName,
        getters: {
          currentProduction: { ...production, descriptors: [descriptor] }
        },
        actions: { addMetadataDescriptor: () => Promise.reject(refusal) }
      })
      const list = wrapper.findComponent({ name: listName })
      const modal = () => wrapper.findComponent(AddMetadataModal)

      await list.vm.$emit('add-metadata')
      await modal().vm.$emit('confirm', { name: 'FPS 🎬' })
      await flushPromises()
      expect(modal().props('builtInName')).toBe('FPS 🎬')
      expect(modal().props('takenName')).toBe('')
      expect(modal().props('isError')).toBe(false)

      await modal().vm.$emit('cancel')
      await list.vm.$emit('edit-metadata', descriptor.id)
      expect(modal().props('active')).toBe(true)
      expect(modal().props('builtInName')).toBe('')
    })

    // The name field stays open to typing while the save runs, and the
    // modal may close and open on another column before Zou answers.
    test('tells the name sent, and leaves a later opening alone', async () => {
      const refusal = Object.assign(buildRefusal(), {
        body: { message: 'Metadata descriptor already exists.' }
      })
      let refuse
      const descriptor = { id: 'descriptor-1', name: 'Camera' }
      const { wrapper } = await mountEntityPage(page, {
        listName,
        getters: {
          currentProduction: { ...production, descriptors: [descriptor] }
        },
        actions: {
          addMetadataDescriptor: () =>
            new Promise((resolve, reject) => {
              refuse = () => reject(refusal)
            })
        }
      })
      const list = wrapper.findComponent({ name: listName })
      const modal = () => wrapper.findComponent(AddMetadataModal)

      await list.vm.$emit('add-metadata')
      const form = { name: 'Budget €' }
      await modal().vm.$emit('confirm', form)
      form.name = 'Budget € 2'
      refuse()
      await flushPromises()
      expect(modal().props('takenName')).toBe('Budget €')

      await modal().vm.$emit('confirm', { name: 'Camera' })
      await modal().vm.$emit('cancel')
      await list.vm.$emit('edit-metadata', descriptor.id)
      refuse()
      await flushPromises()
      expect(modal().props('active')).toBe(true)
      expect(modal().props('takenName')).toBe('')
    })

    test('checks a new name against the columns of the production', async () => {
      const descriptor = {
        id: 'descriptor-1',
        name: 'Camera',
        field_name: 'camera'
      }
      const { wrapper } = await mountEntityPage(page, {
        listName,
        getters: {
          currentProduction: { ...production, descriptors: [descriptor] }
        }
      })

      expect(
        wrapper.findComponent(AddMetadataModal).props('descriptors')
      ).toEqual([descriptor])
    })
  }
)

describe.each(pages)('$name page, task panel', ({ listName, page }) => {
  // The x of the panel removes the task from the store selection only.
  test('hands a task removed from the panel to its list', async () => {
    const { wrapper, list } = await mountEntityPage(page, { listName })
    const task = { id: 'task-1', entity_id: 'entity-1', task_type_id: 'tt-1' }

    wrapper.findComponent(TaskInfo).vm.$emit('task-removed', task)

    expect(list.unselectTask).toHaveBeenCalledWith(task)
  })
})

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
