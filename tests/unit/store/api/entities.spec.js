// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store/api/client', () => ({
  default: { ppost: vi.fn() }
}))

import client from '@/store/api/client'
import entitiesApi from '@/store/api/entities'

describe('store/api/entities', () => {
  beforeEach(() => {
    client.ppost.mockClear()
  })

  describe('deleteEntities', () => {
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
})
