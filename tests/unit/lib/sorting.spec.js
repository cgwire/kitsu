import {
  sortAssets,
  sortByName,
  sortByDate,
  sortPeople,
  sortPlaylists,
  sortProductions,
  sortTaskTypeScheduleItems,
  sortSequences,
  sortShots,
  sortTaskTypes,
  sortTasks,
  sortValidationColumns, sortComments, sortRevisionPreviewFiles, sortAssetResult, sortShotResult
} from '@/lib/sorting'

const taskTypeMap = new Map(Object.entries({
  'task-type-1': { id: 'task-type-1', priority: 1, name: 'Modeling' },
  'task-type-2': { id: 'task-type-2', priority: 1, name: 'Setup' },
  'task-type-3': { id: 'task-type-3', priority: 2, name: 'Texture' }
}))

describe('lib/sorting', () => {
  beforeEach(() => {
  })

  it('sortByName', () => {
    const entries = [
      { name: 'Zou', id: 3 },
      { name: 'Kitsu', id: 2 },
      { name: 'Gazu', id: 1 }
    ]
    let results = sortByName(entries)
    expect(results).toHaveLength(3)
    expect(results[0].id).toEqual(1)
    expect(results[1].id).toEqual(2)
    expect(results[2].id).toEqual(3)

    results = sortByName([])
    expect(results).toHaveLength(0)
  })

  it('sortAssets', () => {
    const entries = [
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        asset_type_name: 'Props',
        name: 'Tree',
        id: 4
      },
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        asset_type_name: 'Props',
        name: 'Table',
        id: 3
      },
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        asset_type_name: 'Props',
        name: 'Chair',
        id: 2
      },
      {
        canceled: false,
        project_name: 'Big Buck Bunny',
        asset_type_name: 'Characters',
        name: 'Bunny',
        id: 1
      }
    ]
    let results = sortAssets(entries)
    expect(results).toHaveLength(4)
    expect(results[0].id).toEqual(1)
    expect(results[1].id).toEqual(2)
    expect(results[2].id).toEqual(3)
    expect(results[3].id).toEqual(4)

    results = sortAssets([])
    expect(results).toHaveLength(0)
  })

  it('sortShots', () => {
    const entries = [
      {
        canceled: false,
        episode_name: 'E01',
        sequence_name: 'SE02',
        name: 'SH03',
        id: 4
      },
      {
        canceled: false,
        episode_name: 'E01',
        sequence_name: 'SE02',
        name: 'SH02',
        id: 3
      },
      {
        canceled: false,
        episode_name: 'E01',
        sequence_name: 'SE02',
        name: 'SH01',
        id: 2
      },
      {
        canceled: true,
        episode_name: 'E01',
        sequence_name: 'SE03',
        name: 'SH01',
        id: 6
      },
      {
        canceled: false,
        episode_name: 'E01',
        sequence_name: 'SE01',
        name: 'SH01',
        id: 1
      },
      {
        canceled: false,
        episode_name: 'E02',
        sequence_name: 'SE01',
        name: 'SH01',
        id: 5
      }
    ]
    let results = sortShots(entries)

    expect(results).toHaveLength(6)
    expect(results[0].id).toEqual(1)
    expect(results[1].id).toEqual(2)
    expect(results[2].id).toEqual(3)
    expect(results[3].id).toEqual(4)
    expect(results[4].id).toEqual(5)
    expect(results[5].id).toEqual(6)

    results = sortShots([])
    expect(results).toHaveLength(0)
  })

  it('sortShots - without episodes', () => {
    const entries = [
      {
        canceled: false,
        sequence_name: 'SE02',
        name: 'SH01',
        id: 4
      },
      {
        canceled: false,
        sequence_name: 'SE03',
        name: 'SH02',
        id: 6
      },
      {
        canceled: false,
        sequence_name: 'SE01',
        name: 'SH01',
        id: 1
      },
      {
        canceled: false,
        sequence_name: 'SE03',
        name: 'SH01',
        id: 5
      },
      {
        canceled: true,
        sequence_name: 'SE01',
        name: 'SH04',
        id: 7
      },
      {
        canceled: false,
        sequence_name: 'SE01',
        name: 'SH02',
        id: 2
      },
      {
        canceled: false,
        sequence_name: 'SE01',
        name: 'SH03',
        id: 3
      }
    ]
    let results = sortShots(entries)

    expect(results).toHaveLength(7)
    expect(results[0].id).toEqual(1)
    expect(results[1].id).toEqual(2)
    expect(results[2].id).toEqual(3)
    expect(results[3].id).toEqual(4)
    expect(results[4].id).toEqual(5)
    expect(results[5].id).toEqual(6)
    expect(results[6].id).toEqual(7)

    results = sortShots([])
    expect(results).toHaveLength(0)
  })

  it('sortSequences', () => {
    const entries = [
      {
        canceled: false,
        episode_name: 'E02',
        name: 'SE02',
        id: 4
      },
      {
        canceled: false,
        episode_name: 'E02',
        name: 'SE01',
        id: 3
      },
      {
        canceled: true,
        episode_name: 'E01',
        name: 'SE03',
        id: 5
      },
      {
        canceled: false,
        episode_name: 'E01',
        name: 'SE01',
        id: 1
      },
      {
        canceled: false,
        episode_name: 'E01',
        name: 'SE02',
        id: 2
      }
    ]
    let results = sortSequences(entries)

    expect(results).toHaveLength(5)
    expect(results[0].id).toEqual(1)
    expect(results[1].id).toEqual(2)
    expect(results[2].id).toEqual(5)
    expect(results[3].id).toEqual(3)
    expect(results[4].id).toEqual(4)

    results = sortSequences([])
    expect(results).toHaveLength(0)
  })

  it('sortProductions', () => {
    const entries = [
      { project_status_name: 'closed', name: 'Big Buck Bunny', id: 3 },
      { project_status_name: 'open', name: 'Cosmos Landromat', id: 2 },
      { project_status_name: 'open', name: 'Agent 327', id: 1 }
    ]
    let results = sortProductions(entries)
    expect(results).toHaveLength(3)
    expect(results[0].id).toEqual(1)
    expect(results[1].id).toEqual(2)
    expect(results[2].id).toEqual(3)

    results = sortProductions([])
    expect(results).toHaveLength(0)
  })

  it('sortTaskTypes', () => {
    const entries = [
      { for_entity: 'Asset', priority: 1, name: 'Modeling', id: 'task-type-2' },
      { for_entity: 'Asset', priority: 2, name: 'Setup', id: 'task-type-5' },
      { for_entity: 'Asset', priority: 1, name: 'Modeling Low', id: 'task-type-4' },
      { for_entity: 'Asset', priority: 1, name: 'Modeling Hi', id: 'task-type-3' },
      { for_entity: 'Shot', priority: 1, name: 'Animation', id: 'task-type-1' }
    ]
    const production = {
      task_types_priority: {
        'task-type-5': 5,
        'task-type-4': 1,
        'task-type-3': 4,
        'task-type-2': 3,
        'task-type-1': 2
      }
    }
    let results = sortTaskTypes(entries, production)
    expect(results).toHaveLength(5)
    expect(results[0].id).toEqual('task-type-4')
    expect(results[1].id).toEqual('task-type-2')
    expect(results[2].id).toEqual('task-type-3')
    expect(results[3].id).toEqual('task-type-5')
    expect(results[4].id).toEqual('task-type-1')

    results = sortProductions([])
    expect(results).toHaveLength(0)
  })

  it('sortTasks', () => {
    const entries = [
      {
        project_name: 'Big Buck Bunny',
        task_type_id: 'task-type-1',
        entity_name: 'Chair',
        full_entity_name: 'Props / Tree',
        priority: 3,
        id: 5
      },
      {
        project_name: 'Big Buck Bunny',
        task_type_id: 'task-type-1',
        entity_name: 'Tree',
        full_entity_name: 'Props / Tree',
        id: 4
      },
      {
        project_name: 'Agent 327',
        task_type_id: 'task-type-1',
        entity_name: 'Agent327',
        full_entity_name: 'Characters / Agent327',
        id: 1
      },
      {
        project_name: 'Agent 327',
        task_type_id: 'task-type-2',
        entity_name: 'Agent327',
        full_entity_name: 'Characters / Agent327',
        id: 3
      },
      {
        project_name: 'Agent 327',
        task_type_id: 'task-type-1',
        entity_name: 'SuperVilain',
        full_entity_name: 'Characters / SuperVilain',
        id: 2
      }
    ]
    let results = sortTasks(entries, taskTypeMap)
    expect(results).toHaveLength(5)
    expect(results[0].id).toEqual(5)
    expect(results[1].id).toEqual(1)
    expect(results[2].id).toEqual(2)
    expect(results[3].id).toEqual(3)
    expect(results[4].id).toEqual(4)

    results = sortProductions([])
    expect(results).toHaveLength(0)
  })

  it('sortValidationColumns', () => {
    const production = {
      project_status_name: 'open',
      name: 'Big Buck Bunny',
      id: 3,
      task_types_priority: {
        'task-type-3': 1,
        'task-type-2': 3,
        'task-type-1': 2
      }
    }
    const entries = ['task-type-3', 'task-type-2', 'task-type-1']
    let results = sortValidationColumns(entries, taskTypeMap, production)
    expect(results).toHaveLength(3)
    expect(results[0]).toEqual('task-type-3')
    expect(results[1]).toEqual('task-type-1')
    expect(results[2]).toEqual('task-type-2')

    results = sortValidationColumns([])
    expect(results).toHaveLength(0)
  })

  it('sortPlaylists', () => {
    const entries = [
      { id: 1, created_at: '2018-09-12-12:18:30', name: 'Playlist1' },
      { id: 2, created_at: '2018-09-18-18:19:00', name: 'Playlist2' },
      { id: 3, created_at: '2018-09-18-18:19:00', name: 'Playlist3' }
    ]
    const results = sortPlaylists(entries)
    expect(results).toHaveLength(3)
    expect(results[0].id).toEqual(2)
    expect(results[1].id).toEqual(3)
    expect(results[2].id).toEqual(1)
  })

  it('sortPeople', () => {
    const people = [
      { id: 1, first_name: 'Allen', last_name: 'Beard', active: false },
      { id: 2, first_name: 'John', last_name: 'Doe', active: false },
      { id: 3, first_name: 'Emma', last_name: 'Doe', active: false },
      { id: 4, first_name: 'John', last_name: 'Doe', active: true }
    ]

    const results = sortPeople(people)
    expect(results).toHaveLength(4)
    expect(results[0].id).toEqual(4)
    expect(results[1].id).toEqual(1)
    expect(results[2].id).toEqual(3)
    expect(results[3].id).toEqual(2)
  })

  it('sortTaskTypeScheduleTime', () => {
    const scheduleItems = [
      {
        id: 1,
        task_type_id: 'task-type-1',
        for_entity: 'Asset',
        priority: 2,
        name: 'Modeling',
        start_date: '2019-08-01'
      },
      {
        id: 2,
        task_type_id: 'task-type-2',
        for_entity: 'Shot',
        priority: 2,
        name: 'Animation',
        start_date: '2019-08-01'
      },
      {
        id: 3,
        task_type_id: 'task-type-3',
        for_entity: 'Asset',
        priority: 1,
        name: 'Concept',
        start_date: '2019-08-01'
      },
      {
        id: 4,
        task_type_id: 'task-type-4',
        for_entity: 'Shot',
        priority: 1,
        name: 'Layout',
        start_date: '2019-08-01'
      }
    ]

    const taskTypeMap = new Map()
    taskTypeMap.set('task-type-1', { priority: 2, for_entity: 'Asset' })
    taskTypeMap.set('task-type-2', { priority: 2, for_entity: 'Shot' })
    taskTypeMap.set('task-type-3', { priority: 1, for_entity: 'Asset' })
    taskTypeMap.set('task-type-4', { priority: 1, for_entity: 'Shot' })

    const production = {
      id: 'production-1',
      task_types_priority: {
        'task-type-1': 1,
        'task-type-2': 2,
        'task-type-3': 2,
        'task-type-4': 1
      }
    }
    const results = sortTaskTypeScheduleItems(
      scheduleItems, production, taskTypeMap
    )
    expect(results).toHaveLength(4)
    expect(results[0].id).toEqual(3)
    expect(results[1].id).toEqual(1)
    expect(results[2].id).toEqual(4)
    expect(results[3].id).toEqual(2)
  })

  it('sortByDate', () => {
    const entries = [
      { id: 1, created_at: '2018-09-12-12:18:30' },
      { id: 2, created_at: '2018-09-18-16:22:00' },
      { id: 3, created_at: '2018-09-18-18:19:00' }
    ]
    const results = sortByDate(entries)
    expect(results).toHaveLength(3)
    expect(results[0].id).toEqual(3)
    expect(results[1].id).toEqual(2)
    expect(results[2].id).toEqual(1)
  })

  it('sortComments', () => {
    const entries = [
      { id: 1, created_at: '2018-09-12-12:18:30', pinned: false },
      { id: 2, created_at: '2018-09-18-16:22:00', pinned: false },
      { id: 3, created_at: '2018-09-18-18:18:00', pinned: true },
      { id: 4, created_at: '2018-09-18-18:19:00', pinned: true }
    ]
    const results = sortComments(entries)
    expect(results).toHaveLength(4)
    expect(results[0].id).toEqual(4)
    expect(results[1].id).toEqual(3)
    expect(results[2].id).toEqual(2)
    expect(results[3].id).toEqual(1)
  })

  it('sortRevisionPreviewFiles', () => {
    const entries = [
      { id: 1, created_at: '2018-09-18-16:22:00', position: 2 },
      { id: 2, created_at: '2018-09-12-12:18:30', position: 2 },
      { id: 3, created_at: '2018-09-18-18:19:00', position: 1 },
      { id: 4, created_at: '2018-09-18-18:18:00', position: 1 }
    ]
    const results = sortRevisionPreviewFiles(entries)
    expect(results).toHaveLength(4)
    expect(results[0].id).toEqual(4)
    expect(results[1].id).toEqual(3)
    expect(results[2].id).toEqual(2)
    expect(results[3].id).toEqual(1)
  })

  it('sortAssetResult', () => {
    const entries = [
      {
        id: 1,
        canceled: true,
        name: 'asset 2',
        asset_type_name: 'asset_type_name 2',
        data: { metadata1: '2' },
        validations: new Map([['valid', 'task2']])
      },
      {
        id: 2,
        canceled: true,
        name: 'asset 1',
        asset_type_name: 'asset_type_name 2',
        data: { metadata1: '2' },
        validations: new Map([['valid', 'task2']])
      },
      {
        id: 3,
        canceled: true,
        name: 'asset 2',
        asset_type_name: 'asset_type_name 1',
        data: { metadata1: '2' },
        validations: new Map([['valid', 'task2']])
      },
      {
        id: 4,
        canceled: true,
        name: 'asset 2',
        asset_type_name: 'asset_type_name 2',
        data: { metadata1: '1' },
        validations: new Map([['valid', 'task1']])
      },
      {
        id: 5,
        canceled: false,
        name: 'asset 2',
        asset_type_name: 'asset_type_name 2',
        data: { metadata1: '2' },
        validations: new Map([['valid', 'task2']])
      }
    ]
    const sortingMetadata = [
      { type: 'metadata', column: 'valid' }
    ]
    const sortingTaskType = [
      { type: 'task_type', column: 'metadata1' }
    ]
    const taskMap = new Map()
    taskMap.set('task1', { task_status_short_name: 'status A' })
    taskMap.set('task2', { task_status_short_name: 'status B' })
    const resultsMetadata =
      sortAssetResult(entries, sortingMetadata, taskTypeMap, taskMap)
    const resultsTaskTypes =
      sortAssetResult(entries, sortingTaskType, taskTypeMap, taskMap)
    expect(resultsMetadata).toHaveLength(5)
    expect(resultsMetadata[0].id).toEqual(5)
    expect(resultsMetadata[1].id).toEqual(4)
    expect(resultsMetadata[2].id).toEqual(3)
    expect(resultsMetadata[3].id).toEqual(2)
    expect(resultsMetadata[4].id).toEqual(1)

    expect(resultsTaskTypes).toHaveLength(5)
    expect(resultsTaskTypes[0].id).toEqual(5)
    expect(resultsTaskTypes[1].id).toEqual(4)
    expect(resultsTaskTypes[2].id).toEqual(3)
    expect(resultsTaskTypes[3].id).toEqual(2)
    expect(resultsTaskTypes[4].id).toEqual(1)
  })

  it('sortShotResult', () => {
    const entries = [
      {
        id: 1,
        canceled: true,
        name: 'asset 2',
        sequence_name: 'sequence_name 2',
        data: { metadata1: '2' },
        validations: new Map([['valid', 'task2']]),
        episode_name: 'episode 2'
      },
      {
        id: 2,
        canceled: true,
        name: 'asset 1',
        sequence_name: 'sequence_name 2',
        data: { metadata1: '2' },
        validations: new Map([['valid', 'task2']]),
        episode_name: 'episode 2'
      },
      {
        id: 3,
        canceled: true,
        name: 'asset 2',
        sequence_name: 'sequence_name 1',
        data: { metadata1: '3' },
        validations: new Map([['valid', 'task2']]),
        episode_name: 'episode 2'
      },
      {
        id: 4,
        canceled: true,
        name: 'asset 2',
        sequence_name: 'sequence_name 1',
        data: { metadata1: '2' },
        validations: new Map([['valid', 'task2']]),
        episode_name: 'episode 1'
      },
      {
        id: 5,
        canceled: true,
        name: 'asset 2',
        sequence_name: 'sequence_name 2',
        data: { metadata1: '1' },
        validations: new Map([['valid', 'task1']]),
        episode_name: 'episode 2'
      },
      {
        id: 6,
        canceled: false,
        name: 'asset 2',
        sequence_name: 'sequence_name 2',
        data: { metadata1: '2' },
        validations: new Map([['valid', 'task2']]),
        episode_name: 'episode 2'
      }
    ]
    const sortingMetadata = [
      { type: 'metadata', column: 'valid' }
    ]
    const sortingTaskType = [
      { type: 'task_type', column: 'metadata1' }
    ]
    const taskMap = new Map([
      ['task1', { task_status_short_name: 'status A' }],
      ['task2', { task_status_short_name: 'status B' }]
    ])
    const resultsMetadata =
      sortShotResult(entries, sortingMetadata, taskTypeMap, taskMap)
    const resultsTaskTypes =
      sortShotResult(entries, sortingTaskType, taskTypeMap, taskMap)
    expect(resultsMetadata).toHaveLength(6)
    expect(resultsMetadata[0].id).toEqual(6)
    expect(resultsMetadata[1].id).toEqual(5)
    expect(resultsMetadata[2].id).toEqual(4)
    expect(resultsMetadata[3].id).toEqual(3)
    expect(resultsMetadata[4].id).toEqual(2)
    expect(resultsMetadata[5].id).toEqual(1)

    expect(resultsTaskTypes).toHaveLength(6)
    expect(resultsTaskTypes[0].id).toEqual(6)
    expect(resultsTaskTypes[1].id).toEqual(5)
    expect(resultsTaskTypes[2].id).toEqual(4)
    expect(resultsTaskTypes[3].id).toEqual(3)
    expect(resultsTaskTypes[4].id).toEqual(2)
    expect(resultsTaskTypes[5].id).toEqual(1)
  })
})
