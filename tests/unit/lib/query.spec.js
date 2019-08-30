import { buildQueryString } from '../../../src/lib/query'

describe('query', () => {

  describe('Mount', () => {
    test('buildQueryString', () => {
      const path = buildQueryString('/data', {
        page: 2,
        id: 'entity-id'
      })
      expect(path).toEqual('/data?page=2&id=entity-id')
    })
  })
})
