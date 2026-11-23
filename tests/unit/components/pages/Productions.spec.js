import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import errors from '@/lib/errors'

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import Productions from '@/components/pages/Productions.vue'

import { mountEntityPage } from '../../fixtures/entity-page'

const descriptor = {
  id: 'descriptor-1',
  entity_type: 'Project',
  field_name: 'budget',
  name: 'Budget'
}
const production = {
  id: 'production-1',
  name: 'Production',
  descriptors: [descriptor]
}

// The page listens to the column events of the socket, and to the
// reconnections its manager announces: the stubs keep the handlers bound.
const buildEmitter = () => {
  const handlers = new Map()
  return {
    on: vi.fn((event, handler) => handlers.set(event, handler)),
    off: vi.fn(),
    emit: (event, eventData) => handlers.get(event)?.(eventData)
  }
}
const buildSocket = () => ({ ...buildEmitter(), io: buildEmitter() })

const mountPage = ({
  actions = {},
  socket = buildSocket(),
  errorHandler
} = {}) =>
  mountEntityPage(Productions, {
    listName: 'ProductionList',
    config: { globalProperties: { $socket: socket }, errorHandler },
    getters: { productions: [production] },
    actions
  })

// Zou refuses a column named like another one: a close keeps the error, the
// next opening drops it.
describe('Productions page, metadata column modal', () => {
  afterEach(() => vi.restoreAllMocks())

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
      const { wrapper } = await mountPage({
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

  // The page passes no columns: Zou creates a Project column only where no
  // column holds its field name, and refuses a rename to a taken name.
  test.each([
    ['a new column', 'add-metadata', undefined, { name: 'Cost' }],
    [
      'a column edit',
      'edit-metadata',
      descriptor.field_name,
      { id: descriptor.id, name: 'Cost' }
    ]
  ])(
    'tells a name Zou says is taken on %s, until the next opening',
    async (_, event, fieldName, form) => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const refusal = Object.assign(new Error('Bad Request'), {
        status: 400,
        body: { message: 'Metadata descriptor already exists.' }
      })
      const refuseName = () => Promise.reject(refusal)
      const { wrapper } = await mountPage({
        actions: {
          addProjectMetadataDescriptorToAllProductions: refuseName,
          updateProjectMetadataOnAll: refuseName
        }
      })
      const list = wrapper.findComponent({ name: 'ProductionList' })
      const modal = () => wrapper.findComponent(AddMetadataModal)

      await list.vm.$emit(event, fieldName)
      await modal().vm.$emit('confirm', form)
      await flushPromises()
      expect(modal().props('takenName')).toBe('Cost')
      expect(modal().props('isError')).toBe(false)
      expect(consoleError).not.toHaveBeenCalled()

      await modal().vm.$emit('cancel')
      await list.vm.$emit(event, fieldName)

      expect(modal().props('active')).toBe(true)
      expect(modal().props('takenName')).toBe('')
    }
  )
})

// The name field stays open to typing while the save runs, and the modal may
// close and open on another column before Zou answers.
describe('Productions page, late column refusals', () => {
  afterEach(() => vi.restoreAllMocks())

  test('tells the name sent, and leaves a later opening alone', async () => {
    const refusal = Object.assign(new Error('Bad Request'), {
      status: 400,
      body: { message: 'Metadata descriptor already exists.' }
    })
    let refuse
    const refuseLater = () =>
      new Promise((resolve, reject) => {
        refuse = () => reject(refusal)
      })
    const { wrapper } = await mountPage({
      actions: {
        addProjectMetadataDescriptorToAllProductions: refuseLater,
        updateProjectMetadataOnAll: refuseLater
      }
    })
    const list = wrapper.findComponent({ name: 'ProductionList' })
    const modal = () => wrapper.findComponent(AddMetadataModal)

    await list.vm.$emit('add-metadata')
    const form = { name: 'Cost' }
    await modal().vm.$emit('confirm', form)
    form.name = 'Cost 2'
    refuse()
    await flushPromises()
    expect(modal().props('takenName')).toBe('Cost')

    await modal().vm.$emit('confirm', { name: 'Budget' })
    await modal().vm.$emit('cancel')
    await list.vm.$emit('edit-metadata', descriptor.field_name)
    refuse()
    await flushPromises()
    expect(modal().props('active')).toBe(true)
    expect(modal().props('takenName')).toBe('')
  })
})

// The store gives the column the production owns once it read the columns
// of a production changed elsewhere: a rename may have moved its values.
describe('Productions page, values of the Project columns', () => {
  test.each([
    [
      'the column the production owns',
      { ...descriptor, field_name: 'budget_2025' },
      'budget_2025'
    ],
    ['the cell when Zou already held the column', null, 'budget']
  ])('saves a value under the field name of %s', async (_, owned, key) => {
    const ensureProjectMetadataDescriptor = vi.fn(() => owned)
    const editProduction = vi.fn()
    const { wrapper } = await mountPage({
      actions: { ensureProjectMetadataDescriptor, editProduction }
    })
    const list = wrapper.findComponent({ name: 'ProductionList' })

    await list.vm.$emit('metadata-changed', {
      entry: production,
      descriptor,
      value: 12
    })
    await flushPromises()

    expect(ensureProjectMetadataDescriptor).toHaveBeenCalledWith({
      production,
      descriptor
    })
    expect(editProduction).toHaveBeenCalledWith({
      id: 'production-1',
      data: { [key]: 12 }
    })
  })

  // The API client reports a failed request: anything else is a bug.
  test('leaves a bug of a save to Sentry, and logs a failed request', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('Bad Gateway')
    errors.markRequestFailure(failure)
    const bug = new TypeError('Cannot read properties of undefined')
    const errorHandler = vi.fn()
    const ensureProjectMetadataDescriptor = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockRejectedValueOnce(bug)
    const { wrapper } = await mountPage({
      actions: { ensureProjectMetadataDescriptor },
      errorHandler
    })
    const list = wrapper.findComponent({ name: 'ProductionList' })
    const change = { entry: production, descriptor, value: 12 }

    await list.vm.$emit('metadata-changed', change)
    await flushPromises()
    expect(consoleError).toHaveBeenCalledWith(failure)
    expect(errorHandler).not.toHaveBeenCalled()

    await list.vm.$emit('metadata-changed', change)
    await flushPromises()
    expect(errorHandler).toHaveBeenCalledWith(
      bug,
      expect.anything(),
      expect.anything()
    )
    expect(consoleError).not.toHaveBeenCalledWith(bug)
    consoleError.mockRestore()
  })
})

// Zou sends the column events of every production, and none of those sent
// while the socket was down: the page lists the productions again, with the
// rows shown kept until the answer.
describe('Productions page, columns changed elsewhere', () => {
  const columnEvent = {
    project_id: 'production-1',
    metadata_descriptor_id: 'descriptor-1'
  }
  let socket

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    socket = buildSocket()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test.each(['metadata-descriptor:new', 'metadata-descriptor:update'])(
    'lists the productions again once after %s events',
    async event => {
      const loadProductions = vi.fn()
      await mountPage({ socket, actions: { loadProductions } })

      // one event per production for a column of all of them
      socket.emit(event, columnEvent)
      socket.emit(event, {
        project_id: 'production-2',
        metadata_descriptor_id: 'descriptor-2'
      })
      await vi.advanceTimersByTimeAsync(500)

      expect(loadProductions.mock.calls).toEqual([
        [undefined],
        [{ isQuiet: true }]
      ])
    }
  )

  // The page may open during a drop: the manager of the socket announces
  // each reconnection. The socket announces every connection, a first one
  // made at once included, which has nothing to catch up.
  test('lists the productions again once the socket comes back', async () => {
    const loadProductions = vi.fn()
    await mountPage({ socket, actions: { loadProductions } })

    socket.emit('connect')
    await vi.advanceTimersByTimeAsync(500)
    expect(loadProductions).toHaveBeenCalledTimes(1)

    socket.io.emit('reconnect', 1)
    await vi.advanceTimersByTimeAsync(500)
    expect(loadProductions.mock.calls).toEqual([
      [undefined],
      [{ isQuiet: true }]
    ])
  })

  test('lists them again once the listing in flight answers', async () => {
    let answer
    const loadProductions = vi
      .fn()
      .mockReturnValueOnce(
        new Promise(resolve => {
          answer = resolve
        })
      )
      .mockResolvedValue()
    await mountPage({ socket, actions: { loadProductions } })

    socket.emit('metadata-descriptor:update', columnEvent)
    await vi.advanceTimersByTimeAsync(500)
    expect(loadProductions).toHaveBeenCalledTimes(1)

    answer()
    await flushPromises()
    expect(loadProductions).toHaveBeenCalledTimes(2)
  })

  test('logs a failed listing, and lists them again on the next change', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Bad Gateway')
    errors.markRequestFailure(error)
    const loadProductions = vi
      .fn()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(error)
      .mockResolvedValue()
    await mountPage({ socket, actions: { loadProductions } })

    socket.emit('metadata-descriptor:update', columnEvent)
    await vi.advanceTimersByTimeAsync(500)
    expect(consoleError).toHaveBeenCalledWith(error)

    socket.emit('metadata-descriptor:update', columnEvent)
    await vi.advanceTimersByTimeAsync(500)
    expect(loadProductions).toHaveBeenCalledTimes(3)
  })

  test('stops listening once the page closes', async () => {
    const loadProductions = vi.fn()
    const { wrapper } = await mountPage({
      socket,
      actions: { loadProductions }
    })
    socket.emit('metadata-descriptor:update', columnEvent)

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(500)

    expect(loadProductions).toHaveBeenCalledTimes(1)
    expect(socket.on).toHaveBeenCalled()
    expect(socket.off.mock.calls).toEqual(socket.on.mock.calls)
    expect(socket.io.on).toHaveBeenCalled()
    expect(socket.io.off.mock.calls).toEqual(socket.io.on.mock.calls)
  })
})
