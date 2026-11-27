// @vitest-environment node

import { buildQueryString, toSortedQueryString } from '@/lib/query'

describe('query', () => {
  describe('Mount', () => {
    test('buildQueryString', () => {
      const path = buildQueryString('/data', {
        page: 2,
        id: 'entity-id'
      })
      expect(path).toEqual('/data?page=2&id=entity-id')
    })

    test('buildQueryString with special characters', () => {
      const path = buildQueryString('/data', { name: 'hello world', tag: 'a&b' })
      expect(path).toEqual('/data?name=hello%20world&tag=a%26b')
    })

    test('buildQueryString with boolean false', () => {
      const path = buildQueryString('/data', { active: false })
      expect(path).toEqual('/data?active=false')
    })

    test('buildQueryString with empty params', () => {
      const path = buildQueryString('/data', {})
      expect(path).toEqual('/data?')
    })
  })
})

describe('toSortedQueryString', () => {
  it('gives the same string to a route query and a saved one, in any order', () => {
    expect(toSortedQueryString({ zoom: '2', hiddenTypes: 'a,b' })).toBe(
      toSortedQueryString('hiddenTypes=a%2Cb&zoom=2')
    )
  })

  it('tells two queries apart', () => {
    expect(toSortedQueryString({ zoom: '2' })).not.toBe(
      toSortedQueryString({ zoom: '3' })
    )
  })
})
