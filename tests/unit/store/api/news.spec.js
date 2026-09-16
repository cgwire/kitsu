// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store/api/client', () => ({
  default: { pget: vi.fn() }
}))

import client from '@/store/api/client'
import newsApi from '@/store/api/news'

describe('store/api/news', () => {
  beforeEach(() => {
    client.pget.mockClear()
  })

  describe('getLastNews', () => {
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
})
