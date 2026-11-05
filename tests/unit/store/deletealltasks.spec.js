// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

// The store modules pull in the root store: no Vuex store is needed here.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/store/api/client', () => ({
  default: { pdel: vi.fn(), ppost: vi.fn() }
}))

import client from '@/store/api/client'
import assetsStore from '@/store/modules/assets'
import editsStore from '@/store/modules/edits'
import episodesStore from '@/store/modules/episodes'
import sequencesStore from '@/store/modules/sequences'
import shotsStore from '@/store/modules/shots'
import tasksStore from '@/store/modules/tasks'

const ROUTE = '/api/actions/projects/production-1'

const deleteTasks = ({ store, action }, selectionOnly) =>
  store.actions[action](
    { dispatch: (name, payload) => tasksStore.actions[name]({}, payload) },
    { projectId: 'production-1', taskTypeId: 'task-type-1', selectionOnly }
  )

describe.each([
  ['asset', { store: assetsStore, action: 'deleteAllAssetTasks' }],
  ['edit', { store: editsStore, action: 'deleteAllEditTasks' }],
  ['episode', { store: episodesStore, action: 'deleteAllEpisodeTasks' }],
  ['sequence', { store: sequencesStore, action: 'deleteAllSequenceTasks' }],
  ['shot', { store: shotsStore, action: 'deleteAllShotTasks' }]
])('Deleting the tasks of a column of the %s list', (_, list) => {
  beforeEach(() => {
    vi.clearAllMocks()
    list.store.cache.result = [
      { validations: new Map([['task-type-1', 'task-1']]) },
      { validations: new Map([['task-type-2', 'task-2']]) }
    ]
  })

  it('deletes the tasks of the list only', async () => {
    await deleteTasks(list, true)

    expect(client.ppost).toHaveBeenCalledExactlyOnceWith(
      `${ROUTE}/delete-tasks`,
      ['task-1']
    )
    expect(client.pdel).not.toHaveBeenCalled()
  })

  // An empty id list took the route of the whole production. Reachable: the
  // column of a list stays displayed once its tasks are deleted.
  it('sends nothing when the list holds no task of the column', async () => {
    list.store.cache.result = [
      { validations: new Map([['task-type-2', 'task-2']]) }
    ]

    await deleteTasks(list, true)

    expect(client.ppost).not.toHaveBeenCalled()
    expect(client.pdel).not.toHaveBeenCalled()
  })

  it('deletes across the production when asked to', async () => {
    await deleteTasks(list, false)

    expect(client.pdel).toHaveBeenCalledExactlyOnceWith(
      `${ROUTE}/task-types/task-type-1/delete-tasks`
    )
    expect(client.ppost).not.toHaveBeenCalled()
  })
})
