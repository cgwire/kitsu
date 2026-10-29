// @vitest-environment node

vi.mock('@/store/api/untracked', () => ({
  default: {
    getUntracked: vi.fn(),
    newUntracked: vi.fn(),
    updateUntracked: vi.fn()
  }
}))

import untrackedApi from '@/store/api/untracked'
import store from '@/store/modules/untracked'
import { LOAD_UNTRACKED_END, NEW_TASK_END } from '@/store/mutation-types'

const foley = {
  id: 'untracked-1',
  name: 'Foley',
  project_id: 'production-1',
  parent_id: null
}

describe('Untracked store', () => {
  afterEach(() => vi.clearAllMocks())

  test('sorts the untracked items by name', () => {
    const state = { untrackedMap: new Map() }
    store.mutations[LOAD_UNTRACKED_END](state, [
      { ...foley, id: 'untracked-2', name: 'Music' },
      foley
    ])

    expect(
      store.getters.untrackedItems(state).map(item => item.name)
    ).toEqual(['Foley', 'Music'])
  })

  test('adds the task created along to the task list', async () => {
    const task = { id: 'task-1', entity_id: foley.id, task_type_id: 'tt-1' }
    untrackedApi.newUntracked.mockResolvedValue({ ...foley, tasks: [task] })
    untrackedApi.getUntracked.mockResolvedValue([foley])
    const commit = vi.fn()
    const dispatch = vi.fn()

    const untracked = await store.actions.newUntracked(
      { commit, dispatch },
      { name: 'Foley', project_id: 'production-1', create_task: true }
    )

    expect(untracked.tasks).toEqual([task])
    expect(commit).toHaveBeenCalledWith(NEW_TASK_END, { task })
    expect(dispatch).toHaveBeenCalledWith('loadUntracked', {
      id: 'production-1'
    })
  })
})
