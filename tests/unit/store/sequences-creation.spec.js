// @vitest-environment node

vi.mock('@/store/api/shots', () => ({
  default: { newSequence: vi.fn() }
}))

// Pre-load the real store to avoid circular-import race from the modules.
import '@/lib/auth'

import shotsApi from '@/store/api/shots'
import sequencesStore from '@/store/modules/sequences'

const context = () => ({
  commit: vi.fn(),
  dispatch: vi.fn(() => Promise.resolve()),
  state: {},
  rootGetters: {
    episodeMap: new Map(),
    isTVShow: false,
    productionSequenceTaskTypeIds: ['tt-storyboard']
  }
})

describe('Sequences store: newSequence', () => {
  beforeEach(() => {
    sequencesStore.cache.sequences = []
    shotsApi.newSequence.mockResolvedValue({ id: 'seq-1', name: 'SQ01' })
  })

  afterEach(() => vi.clearAllMocks())

  test('creates the tasks of every production sequence task type', async () => {
    const ctx = context()
    await sequencesStore.actions.newSequence(ctx, { name: 'SQ01' })

    expect(ctx.dispatch).toHaveBeenCalledWith('createEntityTasks', {
      entityId: 'seq-1',
      taskTypeIds: ['tt-storyboard']
    })
  })

  // the schedule creates a sequence for a new shot, and only the shot tasks
  test('creates no task when given an empty list', async () => {
    const ctx = context()
    const sequence = await sequencesStore.actions.newSequence(ctx, {
      name: 'SQ01',
      taskTypeIds: []
    })

    expect(sequence.id).toBe('seq-1')
    expect(ctx.dispatch).not.toHaveBeenCalled()
  })
})
