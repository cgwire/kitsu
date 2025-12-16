import {
  intersection
} from '@/lib/array'

describe('array', () => {
  it('intersection', () => {
    const ids1 = ['asset-1', 'asset-2', 'asset-3']
    const ids2 = ['asset-1', 'asset-2', 'asset-3', 'asset-4']
    const ids3 = ['asset-1', 'asset-2']
    const ids4 = ['asset-2']
    let result = intersection([ids1]) // single array
    expect(result).toEqual(ids1)
    result = intersection([ids1, ids2, ids3]) // multiple arrays
    expect(result).toEqual(['asset-1', 'asset-2'])
    result = intersection([ids1, ids2, ids3, ids4]) // multiple arrays
    expect(result).toEqual(['asset-2'])
    result = intersection([ids4, ['asset-5']]) // no intersection
    expect(result).toEqual([])
    result = intersection([]) // empty array
    expect(result).toEqual([])
    result = intersection([ids1, [], ids3]) // multiple arrays with empty array
    expect(result).toEqual([])
    result = intersection(null) // null input
    expect(result).toEqual([])
  })
})
