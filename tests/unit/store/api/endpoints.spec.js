// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store/api/client', () => ({
  default: { pdel: vi.fn(), pget: vi.fn(), ppost: vi.fn() }
}))

import client from '@/store/api/client'
import entitiesApi from '@/store/api/entities'
import newsApi from '@/store/api/news'
import taskTypesApi from '@/store/api/tasktypes'

describe('store/api endpoints', () => {
  beforeEach(() => {
    client.pdel.mockClear()
    client.pget.mockClear()
    client.ppost.mockClear()
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
})
