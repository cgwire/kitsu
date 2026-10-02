import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import Edits from '@/components/pages/Edits.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

import {
  buildAddThumbnailsModalStub,
  mountEntityPage,
  production
} from '../../fixtures/entity-page'

// Two edits with their tasks in the store: the page decides on mount
// whether their scope (episode) is the displayed one.
const editMap = new Map([
  ['edit-1', { id: 'edit-1', project_id: production.id, validations: new Map() }],
  ['edit-2', { id: 'edit-2', project_id: production.id, validations: new Map() }]
])

const mountPage = async ({ getters = {}, actions = {}, stubs = {} } = {}) => {
  const page = await mountEntityPage(Edits, {
    listName: 'EditList',
    getters: { editMap, editValidationColumns: ['task-type-1'], ...getters },
    actions,
    stubs
  })
  await flushPromises()
  return page
}

describe('Edits page, reload of another episode', () => {
  test('reloads when the store holds another episode', async () => {
    const { dispatched } = await mountPage({
      getters: {
        isTVShow: true,
        currentEpisode: { id: 'ep-b' },
        editsLoadingKey: `${production.id}/ep-a`
      }
    })

    expect(dispatched('loadEdits')).toHaveLength(1)
  })

  test('reloads when the store holds the production-wide dataset', async () => {
    const { dispatched } = await mountPage({
      getters: {
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        editsLoadingKey: `${production.id}/all`
      }
    })

    expect(dispatched('loadEdits')).toHaveLength(1)
  })

  test('does not reload when the store holds the displayed episode', async () => {
    const { dispatched, list } = await mountPage({
      getters: {
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        editsLoadingKey: `${production.id}/ep-a`
      }
    })

    expect(dispatched('loadEdits')).toHaveLength(0)
    expect(list.selectTaskFromQuery).toHaveBeenCalled()
  })

  // A stale currentEpisode left by a previous TV show must not make an
  // episode-less production look out of scope.
  test('does not reload on a production without episodes', async () => {
    const { dispatched } = await mountPage({
      getters: {
        currentEpisode: { id: 'ep-a' },
        editsLoadingKey: `${production.id}/`
      }
    })

    expect(dispatched('loadEdits')).toHaveLength(0)
  })
})

describe('Edits page, CSV import', () => {
  const lines = [
    ['Name', 'Description'],
    ['E01', 'intro']
  ]

  const upload = async wrapper => {
    await wrapper
      .findComponent(ImportRenderModal)
      .vm.$emit('confirm', lines, false)
    await flushPromises()
    return wrapper.findComponent(ImportRenderModal).props()
  }

  // The modal reads the import error to show the rejected line or the
  // timeout message.
  test('hands the failure to the import modal', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = Object.assign(new Error('Bad Request'), { status: 400 })
    const { wrapper } = await mountPage({
      actions: { uploadEditFile: () => Promise.reject(error) }
    })

    const modal = await upload(wrapper)

    expect(modal.isError).toBe(true)
    expect(modal.importError).toBe(error)
    expect(modal.isLoading).toBe(false)
  })

  test('clears the previous failure and closes the modal on success', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const uploadEditFile = vi
      .fn(() => Promise.resolve())
      .mockImplementationOnce(() => Promise.reject(new Error('previous')))
    const { wrapper, dispatched } = await mountPage({
      actions: { uploadEditFile }
    })
    await upload(wrapper)

    const modal = await upload(wrapper)

    expect(modal.importError).toBe(null)
    expect(modal.active).toBe(false)
    expect(dispatched('loadEdits')).toHaveLength(1)
  })
})

describe('Edits page, thumbnails import', () => {
  test('opens the modal and marks each edit while its preview uploads', async () => {
    const modalStub = buildAddThumbnailsModalStub()
    const { wrapper } = await mountPage({
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
      { task: { id: 'task-1', entity_id: 'edit-1' } }
    ])
    await flushPromises()

    expect(modalStub.methods.markLoading).toHaveBeenCalledWith('edit-1')
    expect(modalStub.methods.markUploaded).toHaveBeenCalledWith('edit-1')
  })
})
