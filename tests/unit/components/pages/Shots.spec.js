import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import ImportEdlModal from '@/components/modals/ImportEdlModal.vue'
import Shots from '@/components/pages/Shots.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import shotStore from '@/store/modules/shots'

import {
  buildAddThumbnailsModalStub,
  mountEntityPage,
  production
} from '../../fixtures/entity-page'

// Two shots with their tasks in the cache: the page decides on mount
// whether their scope (episode) is the displayed one.
const shot = id => ({ id, validations: new Map([['task-type-1', 'task-1']]) })

beforeEach(() => {
  shotStore.cache.shotMap.set('shot-1', shot('shot-1'))
  shotStore.cache.shotMap.set('shot-2', shot('shot-2'))
})

afterEach(() => {
  shotStore.cache.shotMap.clear()
  vi.restoreAllMocks()
})

const mountPage = async ({ getters = {}, actions = {}, stubs = {} } = {}) => {
  const page = await mountEntityPage(Shots, {
    listName: 'ShotList',
    getters: {
      shotValidationColumns: ['task-type-1'],
      isCurrentUserProductionManager: true,
      ...getters
    },
    actions,
    stubs
  })
  await flushPromises()
  return page
}

const loadsOnMount = async getters =>
  (await mountPage({ getters })).dispatched('loadShots')

describe('Shots page, reload of another episode', () => {
  const episodeA = { id: 'ep-a' }
  const rows = {
    displayedSequences: [
      { id: 'sq-1', episode_id: 'ep-a' },
      { id: 'sq-2', episode_id: 'ep-b' }
    ],
    displayedShots: [
      { id: 's1', episode_id: 'ep-a' },
      { id: 's2', episode_id: 'ep-b' }
    ]
  }

  // Episodes and rows are sorted by episode name, so the first rows of a
  // production-wide dataset belong to the first episode: the per-episode
  // checks pass by construction and only the scope tells them apart.
  test('reloads when a coerced episode switch left the All dataset in the store', async () => {
    const loads = await loadsOnMount({
      isTVShow: true,
      currentEpisode: episodeA,
      shotsLoadingKey: `${production.id}/all`,
      ...rows
    })

    expect(loads).toHaveLength(1)
  })

  test('does not reload when the store holds the displayed episode', async () => {
    const loads = await loadsOnMount({
      isTVShow: true,
      currentEpisode: episodeA,
      shotsLoadingKey: `${production.id}/ep-a`,
      displayedSequences: [{ id: 'sq-1', episode_id: 'ep-a' }],
      displayedShots: [{ id: 's1', episode_id: 'ep-a' }]
    })

    expect(loads).toHaveLength(0)
  })

  test('does not reload when the store already holds the production-wide dataset', async () => {
    const loads = await loadsOnMount({
      isTVShow: true,
      currentEpisode: { id: 'all' },
      shotsLoadingKey: `${production.id}/all`,
      ...rows
    })

    expect(loads).toHaveLength(0)
  })

  test('reloads in All mode when the store only holds one episode', async () => {
    const loads = await loadsOnMount({
      isTVShow: true,
      currentEpisode: { id: 'all' },
      shotsLoadingKey: `${production.id}/ep-a`,
      displayedSequences: [{ id: 'sq-1', episode_id: 'ep-a' }],
      displayedShots: [{ id: 's1', episode_id: 'ep-a' }]
    })

    expect(loads).toHaveLength(1)
  })

  test('does not reload a non-TV-show production loaded under the empty scope', async () => {
    const loads = await loadsOnMount({ shotsLoadingKey: `${production.id}/` })

    expect(loads).toHaveLength(0)
  })

  test('reloads when the store holds another production', async () => {
    const loads = await loadsOnMount({ shotsLoadingKey: 'other-production/' })

    expect(loads).toHaveLength(1)
  })
})

describe('Shots page, EDL import', () => {
  // A timed out import disables the upload of the EDL modal: reopening
  // it must not keep the previous failure.
  test('clears the previous failure when the modal opens again', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = Object.assign(new Error('timeout'), { isTimeout: true })
    const { wrapper } = await mountPage({
      actions: { uploadEdlFile: () => Promise.reject(error) }
    })
    const modal = () => wrapper.findComponent(ImportEdlModal)
    const importButton = wrapper
      .findAllComponents(ButtonSimple)
      .find(button => button.props('icon') === 'import-edl')

    await importButton.vm.$emit('click')
    await modal().vm.$emit('confirm', new File([], 'edit.edl'), 'name', false)
    await flushPromises()
    expect(modal().props('importError')).toBe(error)

    await modal().vm.$emit('cancel')
    await importButton.vm.$emit('click')

    expect(modal().props('active')).toBe(true)
    expect(modal().props('isError')).toBe(false)
    expect(modal().props('importError')).toBe(null)
  })
})

describe('Shots page, thumbnails import', () => {
  test('opens the modal and marks each shot while its preview uploads', async () => {
    const modalStub = buildAddThumbnailsModalStub()
    const { wrapper } = await mountPage({
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
      { task: { id: 'task-1', entity_id: 'shot-1' } }
    ])
    await flushPromises()

    expect(modalStub.methods.markLoading).toHaveBeenCalledWith('shot-1')
    expect(modalStub.methods.markUploaded).toHaveBeenCalledWith('shot-1')
  })
})
