// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

// The store modules pull in the root store: no Vuex store is needed here.
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/store/api/client', () => ({ default: { ppost: vi.fn() } }))

import client from '@/store/api/client'
import assetsStore from '@/store/modules/assets'
import editsStore from '@/store/modules/edits'
import episodesStore from '@/store/modules/episodes'
import sequencesStore from '@/store/modules/sequences'
import shotsStore from '@/store/modules/shots'
import tasksStore from '@/store/modules/tasks'

const ROUTE = '/api/actions/projects/production-1/task-types/task-type-1'

const createTasks = (type, selectionOnly) =>
  tasksStore.actions.createTasks(
    { commit: vi.fn(), rootGetters: { currentProduction: {} } },
    {
      type,
      task_type_id: 'task-type-1',
      project_id: 'production-1',
      selectionOnly
    }
  )

describe.each([
  ['assets', assetsStore, `${ROUTE}/assets/create-tasks`],
  ['edits', editsStore, `${ROUTE}/edits/create-tasks`],
  ['episodes', episodesStore, `${ROUTE}/create-tasks/episode`],
  ['sequences', sequencesStore, `${ROUTE}/create-tasks/sequence`],
  ['shots', shotsStore, `${ROUTE}/shots/create-tasks`]
])('Creating the tasks of a type for the %s', (type, store, route) => {
  beforeEach(() => {
    vi.clearAllMocks()
    client.ppost.mockResolvedValue([])
    store.cache.result = [{ id: 'entity-1' }, { id: 'entity-2' }]
  })

  it('creates them for the entities of the list', async () => {
    await createTasks(type, true)

    expect(client.ppost).toHaveBeenCalledExactlyOnceWith(route, [
      'entity-1',
      'entity-2'
    ])
  })

  // Zou takes an empty list for every entity of the production. Reachable: a
  // search that matches nothing keeps the button of the list.
  it('sends nothing for an empty list', async () => {
    store.cache.result = []

    expect(await createTasks(type, true)).toEqual([])
    expect(client.ppost).not.toHaveBeenCalled()
  })

  it('creates them across the production when asked to', async () => {
    await createTasks(type, false)

    expect(client.ppost).toHaveBeenCalledExactlyOnceWith(route, [])
  })
})
