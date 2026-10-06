// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store/api/client', () => ({
  default: {
    pdel: vi.fn(),
    pget: vi.fn(),
    ppost: vi.fn(),
    ppostImport: vi.fn(),
    pput: vi.fn()
  }
}))

import assetsApi from '@/store/api/assets'
import breakdownApi from '@/store/api/breakdown'
import client from '@/store/api/client'
import editsApi from '@/store/api/edits'
import entitiesApi from '@/store/api/entities'
import newsApi from '@/store/api/news'
import peopleApi from '@/store/api/people'
import playlistsApi from '@/store/api/playlists'
import scheduleApi from '@/store/api/schedule'
import shotsApi from '@/store/api/shots'
import taskTypesApi from '@/store/api/tasktypes'

describe('store/api endpoints', () => {
  beforeEach(() => {
    client.pdel.mockClear()
    client.pget.mockClear()
    client.ppost.mockClear()
    client.ppostImport.mockClear()
    client.pput.mockClear()
  })

  // Zou answers an import only once every row is processed: the imports
  // must not go through the 60s response timeout of regular requests.
  describe('imports', () => {
    const production = { id: 'p1' }
    const formData = { file: 'import.csv' }

    test.each([
      [
        'shots CSV',
        () => shotsApi.postCsv(production, formData, true),
        '/api/import/csv/projects/p1/shots?update=true'
      ],
      [
        'assets CSV',
        () => assetsApi.postCsv(production, formData, false),
        '/api/import/csv/projects/p1/assets'
      ],
      [
        'edits CSV',
        () => editsApi.postCsv(production, formData, true),
        '/api/import/csv/projects/p1/edits?update=true'
      ],
      [
        'people CSV',
        () => peopleApi.postCsv(formData, false),
        '/api/import/csv/persons'
      ],
      [
        'casting CSV',
        () => breakdownApi.postCastingCsv(production, formData),
        '/api/import/csv/projects/p1/casting'
      ],
      [
        'estimations CSV',
        () =>
          taskTypesApi.postTaskTypeEstimations(
            production,
            { id: 'e1' },
            { id: 't1' },
            formData
          ),
        '/api/import/csv/projects/p1/episodes/e1/task-types/t1/estimations'
      ]
    ])('%s posts through ppostImport', (label, post, path) => {
      post()

      expect(client.ppostImport).toHaveBeenCalledWith(path, formData)
      expect(client.ppost).not.toHaveBeenCalled()
    })

    test('the OTIO import posts through ppostImport', () => {
      shotsApi.postEdl(production, 'cut.otio', 'naming', true, { id: 'e1' })

      expect(client.ppostImport).toHaveBeenCalledWith(
        '/api/import/otio/projects/p1/episodes/e1',
        expect.any(FormData)
      )
      expect(client.ppost).not.toHaveBeenCalled()
    })
  })

  describe('entities deleteEntities', () => {
    test('posts the ids alone when the deletion is not forced', () => {
      entitiesApi.deleteEntities('p1', ['asset-1', 'asset-2'])

      expect(client.ppost).toHaveBeenCalledWith(
        '/api/actions/projects/p1/delete-entities',
        ['asset-1', 'asset-2']
      )
    })

    // Same serialization as the unitary routes (`/data/assets/<id>?force=true`):
    // without it the backend only cancels entities that still have tasks.
    test('appends force=true when the deletion is forced', () => {
      entitiesApi.deleteEntities('p1', ['asset-1'], true)

      expect(client.ppost).toHaveBeenCalledWith(
        '/api/actions/projects/p1/delete-entities?force=true',
        ['asset-1']
      )
    })
  })

  describe('news getLastNews', () => {
    // The news feed passes the cached value of a computed, then compares it
    // once the load is over: a key removed here reads as a filter change.
    test('leaves the params of a production feed untouched', () => {
      const params = { isStudio: undefined, productionId: 'p1', page: 1 }

      newsApi.getLastNews(params)

      expect(client.pget).toHaveBeenCalledWith('/api/data/projects/p1/news?page=1')
      expect(params).toEqual({ isStudio: undefined, productionId: 'p1', page: 1 })
    })

    test('leaves the params of the studio feed untouched', () => {
      const params = { isStudio: true, productionId: undefined, page: 1 }

      newsApi.getLastNews(params)

      expect(client.pget).toHaveBeenCalledWith('/api/data/projects/news?page=1')
      expect(params).toEqual({ isStudio: true, productionId: undefined, page: 1 })
    })

    test('resolves an empty feed without a call when no scope is given', async () => {
      const newsList = await newsApi.getLastNews({ page: 1 })

      expect(newsList).toEqual({ data: [], total: 0, stats: [] })
      expect(client.pget).not.toHaveBeenCalled()
    })
  })

  // The end field of the day-off form can be cleared: the day off then ends
  // on its start day
  describe('people day offs', () => {
    test('creates a day off of its start day when the end is empty', () => {
      peopleApi.createDayOff('person-1', '2026-10-22', null, null)

      expect(client.ppost).toHaveBeenCalledWith('/api/data/day-offs', {
        person_id: 'person-1',
        date: '2026-10-22',
        end_date: '2026-10-22',
        description: null
      })
    })

    test('updates a day off to its start day when the end is empty', () => {
      peopleApi.updateDayOff('day-off-1', 'person-1', '2026-10-22', null, null)

      expect(client.pput).toHaveBeenCalledWith('/api/data/day-offs/day-off-1', {
        person_id: 'person-1',
        date: '2026-10-22',
        end_date: '2026-10-22',
        description: null
      })
    })
  })

  describe('people setTimeSpent', () => {
    const path =
      '/api/actions/tasks/task-1/time-spents/2026-10-06/persons/person-1'

    // The hours_by_day preset of 8.2 made 491.99999999999994 minutes
    test('sends the minutes without float noise', () => {
      peopleApi.setTimeSpent('task-1', 'person-1', '2026-10-06', 8.2)

      expect(client.ppost).toHaveBeenCalledWith(path, { duration: 492 })
    })

    // As estimations typed in hours, hours that make no whole number of
    // minutes keep their fraction: the preset of 7.33 hours by day then
    // reads back as 7.33.
    test('keeps a fraction of a minute', () => {
      peopleApi.setTimeSpent('task-1', 'person-1', '2026-10-06', 7.33)

      expect(client.ppost).toHaveBeenCalledWith(path, { duration: 439.8 })
    })

    test('deletes the time spent of zero hours', () => {
      peopleApi.setTimeSpent('task-1', 'person-1', '2026-10-06', 0)

      expect(client.pdel).toHaveBeenCalledWith(path)
      expect(client.ppost).not.toHaveBeenCalled()
    })
  })

  describe('tasktypes deleteTaskType', () => {
    // Without force Zou refuses a task type still attached to schedule
    // items or productions, and says so: that answer drives the second,
    // explicit confirmation.
    test('does not force the deletion by default', () => {
      taskTypesApi.deleteTaskType({ id: 'task-type-1' })

      expect(client.pdel).toHaveBeenCalledWith(
        '/api/data/task-types/task-type-1'
      )
    })

    test('appends force=true when the deletion is forced', () => {
      taskTypesApi.deleteTaskType({ id: 'task-type-1' }, true)

      expect(client.pdel).toHaveBeenCalledWith(
        '/api/data/task-types/task-type-1?force=true'
      )
    })
  })

  // The copy source goes through its own action once the version exists:
  // the creation only carries the production and the name.
  test('creates a schedule version with the production and the name', () => {
    scheduleApi.createScheduleVersion(
      { id: 'p1' },
      { name: 'Plan B', version: 'ref' }
    )

    expect(client.ppost).toHaveBeenCalledTimes(1)
    const [path, data] = client.ppost.mock.calls[0]
    expect(path).toBe('/api/data/production-schedule-versions/')
    expect(data).toStrictEqual({ project_id: 'p1', name: 'Plan B' })
  })

  // Zou serves an entry whose preview is gone without preview_file_id, and
  // keeps only the saved entries that hold the key: a playlist save erased
  // every such entry.
  test('keeps the entries without a preview when saving a playlist', () => {
    playlistsApi.updatePlaylist({
      id: 'pl-1',
      shots: [
        { entity_id: 'shot-1', preview_file_id: 'preview-1' },
        { entity_id: 'shot-2' }
      ]
    })

    const [path, data] = client.pput.mock.calls[0]
    expect(path).toBe('/api/data/playlists/pl-1')
    expect(JSON.parse(JSON.stringify(data)).shots).toEqual([
      { entity_id: 'shot-1', preview_file_id: 'preview-1' },
      { entity_id: 'shot-2', preview_file_id: null }
    ])
  })
})
