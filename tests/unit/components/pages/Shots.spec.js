import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import ImportEdlModal from '@/components/modals/ImportEdlModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import Shots from '@/components/pages/Shots.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import en from '@/locales/en'
import enVideoGame from '@/locales/en_video-game'
import fr from '@/locales/fr.json'
import shotStore from '@/store/modules/shots'

import {
  buildAddThumbnailsModalStub,
  mountEntityPage,
  production,
  reimportExport
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

const mountPage = async ({
  getters = {},
  actions = {},
  stubs = {},
  ...options
} = {}) => {
  const page = await mountEntityPage(Shots, {
    listName: 'ShotList',
    getters: {
      shotValidationColumns: ['task-type-1'],
      isCurrentUserProductionManager: true,
      ...getters
    },
    actions,
    stubs,
    ...options
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

// A bound typed in the list sets the frame count when the shot holds the
// other one, and a frame in of 0 is held like any other.
describe('Shots page, frame range edit', () => {
  const typeFrameOut = async (data, value = 99) => {
    shotStore.cache.shotMap.set('shot-1', { ...shot('shot-1'), data })
    const page = await mountPage()
    await page.wrapper.findComponent({ name: 'ShotList' }).vm.$emit(
      'metadata-changed',
      {
        entry: { id: 'shot-1' },
        descriptor: { field_name: 'frame_out' },
        value
      }
    )
    await flushPromises()
    return page.dispatched('editShotDebounced')[0][1]
  }

  test('counts the frames of a range starting at 0', async () => {
    expect(await typeFrameOut({ frame_in: 0 })).toMatchObject({
      id: 'shot-1',
      data: { frame_out: 99 },
      nb_frames: 100
    })
  })

  test('counts one frame when the frame out meets the frame in', async () => {
    const range = { frame_in: 1, frame_out: 100 }
    expect(await typeFrameOut(range, 1)).toMatchObject({ nb_frames: 1 })
  })

  test('leaves the frame count alone for a frame out before the frame in', async () => {
    const range = { frame_in: 1, frame_out: 100 }
    expect(await typeFrameOut(range, 0)).not.toHaveProperty('nb_frames')
  })

  test('leaves the frame count alone without a frame in', async () => {
    expect(await typeFrameOut({})).not.toHaveProperty('nb_frames')
    expect(await typeFrameOut({ frame_in: '' })).not.toHaveProperty('nb_frames')
  })
})

// Zou reads the English names only: it drops a translated column without a
// word.
describe('Shots page, CSV import', () => {
  const optionalColumns = wrapper =>
    wrapper.findComponent(ImportModal).props('optionalColumns')

  test('offers the optional columns under the names Zou reads', async () => {
    const { wrapper } = await mountPage()

    expect(optionalColumns(wrapper)).toEqual([
      'Description',
      'Frames',
      'Frame In',
      'Frame Out',
      'FPS',
      'Resolution'
    ])
    expect(wrapper.findComponent(ImportRenderModal).props('columns')).toEqual(
      expect.arrayContaining(optionalColumns(wrapper))
    )
  })

  test('leaves the frame count out of a paper production', async () => {
    const { wrapper } = await mountPage({
      getters: { isPaperProduction: true }
    })

    expect(optionalColumns(wrapper)).toEqual([
      'Description',
      'Frame In',
      'Frame Out',
      'FPS',
      'Resolution'
    ])
  })

  // The export writes the labels of the language of the user.
  const { main, shots } = fr.default
  const mountInFrench = getters =>
    mountPage({
      getters: { shotValidationColumns: [], ...getters },
      actions: { getShotsCsvLines: () => [] },
      locale: 'fr',
      messages: fr.default
    })

  const descriptor = entityType => ({
    id: 'descriptor-1',
    entity_type: entityType,
    name: shots.fields.resolution,
    field_name: 'resolution',
    departments: []
  })

  test('imports back a file exported in the language of the user', async () => {
    const { wrapper } = await mountInFrench({
      isFps: true,
      isFrameIn: true,
      isFrameOut: true,
      isFrames: true,
      isResolution: true
    })

    const { exported, imported } = await reimportExport(wrapper)

    expect(exported).toEqual([
      shots.fields.sequence,
      shots.fields.name,
      shots.fields.description,
      main.frames,
      main.frame_in,
      main.frame_out,
      main.fps,
      shots.fields.resolution
    ])
    expect(imported).toEqual([
      'Sequence',
      'Name',
      'Description',
      'Frames',
      'Frame In',
      'Frame Out',
      'FPS',
      'Resolution'
    ])
  })

  test('keeps the header of a descriptor named like a label', async () => {
    const { wrapper } = await mountInFrench({
      currentProduction: { ...production, descriptors: [descriptor('Shot')] }
    })

    const { imported } = await reimportExport(wrapper)

    expect(imported).toEqual([
      'Sequence',
      'Name',
      'Description',
      shots.fields.resolution
    ])
  })

  test('renames a label that only an asset descriptor uses', async () => {
    const { wrapper } = await mountInFrench({
      currentProduction: { ...production, descriptors: [descriptor('Asset')] },
      isResolution: true
    })

    const { imported } = await reimportExport(wrapper)

    expect(imported).toEqual(['Sequence', 'Name', 'Description', 'Resolution'])
  })

  test('keeps the header of a task type named like a label', async () => {
    const taskType = { id: 'task-type-1', name: shots.fields.resolution }
    const { wrapper } = await mountInFrench({
      productionShotTaskTypes: [taskType],
      shotValidationColumns: [taskType.id],
      taskTypeMap: new Map([[taskType.id, taskType]])
    })

    const { imported } = await reimportExport(wrapper)

    expect(imported).toEqual([
      'Sequence',
      'Name',
      'Description',
      taskType.name,
      `${taskType.name} assignations`
    ])
  })

  test('imports back a file exported in a video game production', async () => {
    // An English user of a video game production gets the overlay over en.js.
    const { wrapper } = await mountPage({
      getters: { shotValidationColumns: [] },
      actions: { getShotsCsvLines: () => [] },
      locale: 'en_video-game',
      messages: {
        ...en,
        shots: {
          ...en.shots,
          fields: { ...en.shots.fields, ...enVideoGame.shots.fields }
        }
      }
    })

    const { exported, imported } = await reimportExport(wrapper)

    expect(exported).toEqual(['Level', 'Name', 'Description'])
    expect(imported).toEqual(['Sequence', 'Name', 'Description'])
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

  test('shows a failed upload and clears it when the modal opens again', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountPage({
      actions: {
        commentTaskWithPreview: () => Promise.reject(new Error('down'))
      },
      stubs: { AddThumbnailsModal: buildAddThumbnailsModalStub() }
    })
    const modal = () => wrapper.findComponent({ name: 'AddThumbnailsModal' })
    const importButton = wrapper
      .findAllComponents(ButtonSimple)
      .find(button => button.props('icon') === 'import-files')

    await importButton.vm.$emit('click')
    await modal().vm.$emit('confirm', [
      { task: { id: 'task-1', entity_id: 'shot-1' } }
    ])
    await flushPromises()
    expect(modal().props('isError')).toBe(true)
    expect(modal().props('isLoading')).toBe(false)

    await modal().vm.$emit('cancel')
    await importButton.vm.$emit('click')
    expect(modal().props('isError')).toBe(false)
  })
})
