import test from '../../../src/lib/string'
import {
  buildNameIndex,
  buildAssetIndex,
  buildShotIndex,
  buildTaskIndex,
  indexSearch
} from '../../../src/lib/indexing'

describe('lib/indexing', () => {

  it('buildNameIndex', () => {
    const entries = [
      {name: 'Agent327', id: 1},
      {name: 'Arnold', id: 2},
      {name: 'Bunny', id: 3},
      {name: 'Test', id: 4}
    ]
    const index = buildNameIndex(entries)
    expect(index['A']).toBeUndefined()
    expect(index['Ca']).toBeUndefined()
    expect(index['a'].length).toEqual(2)
    expect(index['bunny'].length).toEqual(1)
    expect(index['bunny'][0].id).toEqual(3)
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
    expect(index['A']).toBeUndefined()
    expect(index['cs']).toBeUndefined()
    expect(index['ch'].length).toEqual(3)
    expect(index['a'].length).toEqual(2)
    expect(index['bunny'].length).toEqual(1)
    expect(index['bunny'][0].id).toEqual(3)
    expect(index['o'][0].id).toEqual(5)
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
    expect(index['e01'].length).toEqual(3)
    expect(index['s01'].length).toEqual(4)
    expect(index['sh01'].length).toEqual(3)
  })

  it('buildTaskIndex', () => {
    const entries = [
      {
        full_entity_name: 'E01 / SQ01 / SH01',
        task_status_short_name: 'wfa',
        task_type_name: 'Animation',
        project_name: 'Caminandes',
        id: 1
      },
      {
        full_entity_name: 'E01 / SQ01 / SH02',
        task_status_short_name: 'wip',
        task_type_name: 'Animation',
        project_name: 'Caminandes',
        id: 2
      },
      {
        full_entity_name: 'Characters / Agent327',
        task_status_short_name: 'wip',
        task_type_name: 'Modeling',
        project_name: 'Agent327',
        id: 3
      },
      {
        full_entity_name: 'Characters / SuperEvil',
        task_status_short_name: 'todo',
        task_type_name: 'Modeling',
        project_name: 'Caminandes',
        id: 4
      },
      {
        full_entity_name: 'Props / Tree',
        task_status_short_name: 'wip',
        task_type_name: 'Modeling',
        project_name: 'Caminandes',
        id: 5
      }
    ]
    const index = buildTaskIndex(entries)
    expect(index['e01'].length).toEqual(2)
    expect(index['wip'].length).toEqual(3)
    expect(index['caminandes'].length).toEqual(4)
    expect(index['agent327'].length).toEqual(1)
  })

  it('indexSearch', () => {
    const entries = [
      {name: 'Agent327', id: 1},
      {name: 'Arnold', id: 2},
      {name: 'Bunny', id: 3},
      {name: 'Test', id: 4}
    ]
    const index = buildNameIndex(entries)
    expect(indexSearch(index, ['A']).length).toEqual(2)
    expect(indexSearch(index, ['Ca']).length).toEqual(0)
    expect(indexSearch(index, ['a']).length).toEqual(2)
    expect(indexSearch(index, ['bunny']).length).toEqual(1)
    expect(indexSearch(index, ['bunny'])[0].id).toEqual(3)
  })
})
