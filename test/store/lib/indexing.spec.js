import { expect } from 'chai'
import test from '../../../src/lib/string'
import {
  buildNameIndex,
  buildAssetIndex,
  buildShotIndex,
  indexSearch
} from '../../../src/lib/indexing'

describe('lib/string', () => {

  it('buildNameIndex', () => {
    const entries = [
      {name: 'Agent327', id: 1},
      {name: 'Arnold', id: 2},
      {name: 'Bunny', id: 3},
      {name: 'Test', id: 4}
    ]
    const index = buildNameIndex(entries)
    expect(index['A']).to.be.undefined
    expect(index['Ca']).to.be.undefined
    expect(index['a'].length).to.equal(2)
    expect(index['bunny'].length).to.equal(1)
    expect(index['bunny'][0].id).to.equal(3)
  })

  it('buildAssetIndex', () => {
    const entries = [
      {name: 'Agent327', asset_type_name: 'Characters', id: 1},
      {name: 'Arnold', asset_type_name: 'Characters', id: 2},
      {name: 'Bunny', asset_type_name: 'Characters', id: 3},
      {name: 'Test', asset_type_name: 'Props', id: 4},
      {name: 'New object', asset_type_name: 'Props', id: 5}
    ]
    const index = buildAssetIndex(entries)
    expect(index['A']).to.be.undefined
    expect(index['cs']).to.be.undefined
    expect(index['ch'].length).to.equal(3)
    expect(index['a'].length).to.equal(2)
    expect(index['bunny'].length).to.equal(1)
    expect(index['bunny'][0].id).to.equal(3)
    expect(index['o'][0].id).to.equal(5)
  })

  it('buildShotIndex', () => {
    const entries = [
      {name: 'SH01', sequence_name: 'S01', episode_name: 'E01', id: 1},
      {name: 'SH02', sequence_name: 'S01', episode_name: 'E01', id: 2},
      {name: 'SH01', sequence_name: 'S02', episode_name: 'E01', id: 3},
      {name: 'SH01', sequence_name: 'S01', episode_name: 'E02', id: 4},
      {name: 'SH02', sequence_name: 'S01', episode_name: 'E02', id: 5}
    ]
    const index = buildShotIndex(entries)
    expect(index['e01'].length).to.equal(3)
    expect(index['s01'].length).to.equal(4)
    expect(index['sh01'].length).to.equal(3)
  })

  it('indexSearch', () => {
    const entries = [
      {name: 'Agent327', id: 1},
      {name: 'Arnold', id: 2},
      {name: 'Bunny', id: 3},
      {name: 'Test', id: 4}
    ]
    const index = buildNameIndex(entries)
    expect(indexSearch(index, 'A').length).to.equal(2)
    expect(indexSearch(index, 'Ca').length).to.equal(0)
    expect(indexSearch(index, 'a').length).to.equal(2)
    expect(indexSearch(index, 'bunny').length).to.equal(1)
    expect(indexSearch(index, 'bunny')[0].id).to.equal(3)
  })
})
