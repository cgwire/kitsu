import {
  intersection
} from '../../../src/lib/array'

describe('array', () => {
  it('intersection', () => {
    const ids1 = ['asset-1', 'asset-2', 'asset-3']
    const ids2 = ['asset-1', 'asset-2', 'asset-3', 'asset-4']
    const ids3 = ['asset-1', 'asset-2']
    const ids4 = ['asset-2']
    let result = intersection([ids1])
    expect(result).toEqual(ids1)
    result = intersection([ids1, ids2, ids3])
    expect(result).toEqual(['asset-1', 'asset-2'])
    result = intersection([ids1, ids2, ids3, ids4])
    expect(result).toEqual(['asset-2'])
  })
})
