import {
  addToIdList,
  arrayMove,
  removeFromIdList,
  getFilledColumns,
  groupEntitiesByParents,
  findModelInList,
  populateTask,
  updateModelFromList,
  removeModelFromList
} from '@/lib/models'

describe('lib/helpers', () => {
  it('populateTask', () => {
    let task = {
      entity_name: 'Agent 327',
      entity_type_name: 'Characters'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('Characters / Agent 327')

    task = {
      entity_name: 'SH01',
      entity_type_name: 'Shot',
      sequence_name: 'SQ01',
      episode_name: 'E01'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('E01 / SQ01 / SH01')

    task = {
      entity_name: 'SH01',
      entity_type_name: 'Shot',
      sequence_name: 'SQ01'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('SQ01 / SH01')
  })

  it('getFilledColumns', () => {
    const assets = [
      {
        id: 'asset-1',
        validations: new Map(Object.entries({
          'task-type-1': 'task-1'
        }))
      },
      {
        id: 'asset-2',
        validations: new Map(Object.entries({
          'task-type-2': 'task-2'
        }))
      },
      {
        id: 'asset-3',
        tasks: [{
          id: 'task-3',
          task_type_id: 'task-type-3'
        }]
      }
    ]
    const filledColumns = getFilledColumns(assets)
    expect(filledColumns['task-type-1']).toBeTruthy()
    expect(filledColumns['task-type-2']).toBeTruthy()
    expect(filledColumns['task-type-3']).toBeTruthy()
  })

  it('groupEntitiesByParents', () => {
    const assets = [
      {
        id: 'asset-1',
        asset_type_id: 'asset-type-1'
      },
      {
        id: 'asset-2',
        asset_type_id: 'asset-type-2'
      },
      {
        id: 'asset-3',
        asset_type_id: 'asset-type-2'
      }
    ]
    const groups = groupEntitiesByParents(assets, 'asset_type_id')
    expect(groups).toEqual([
      [
        {
          id: 'asset-1',
          asset_type_id: 'asset-type-1'
        }
      ],
      [
        {
          id: 'asset-2',
          asset_type_id: 'asset-type-2'
        },
        {
          id: 'asset-3',
          asset_type_id: 'asset-type-2'
        }
      ]
    ])
  })

  it('findModelInList', () => {
    const items = [
      { id: '1', name: 'item-1' },
      { id: '2', name: 'item-2' },
      { id: '3', name: 'item-3' }
    ]
    const model = { id: '2', name: 'item-2' }
    expect(findModelInList(items, model)).toEqual(items[1])
    expect(findModelInList(items, { id: '5' })).toEqual(undefined)
  })

  it('updateModeFromList', () => {
    const items = [
      { id: '1', name: 'item-1' },
      { id: '2', name: 'item-2' },
      { id: '3', name: 'item-3' }
    ]
    const model = { id: '2', name: 'item-changed' }
    updateModelFromList(items, model)
    expect(items[1].name).toEqual('item-changed')
  })

  it('removeModelFromList', () => {
    let items = [
      { id: '1', name: 'item-1' },
      { id: '2', name: 'item-2' },
      { id: '3', name: 'item-3' }
    ]
    const model = { id: '2', name: 'item-2' }
    items = removeModelFromList(items, model)
    expect(items).toHaveLength(2)
    expect(items[1].name).toEqual('item-3')
  })

  it('addToIdList', () => {
    const production = { id: '1', name: 'Caminandes' }
    addToIdList(production, 'asset_types', 'type-1')
    expect(production.asset_types).toEqual(['type-1'])
    addToIdList(production, 'asset_types', 'type-2')
    expect(production.asset_types).toEqual(['type-1', 'type-2'])
    addToIdList(production, 'asset_types', 'type-2')
    expect(production.asset_types).toEqual(['type-1', 'type-2'])
  })

  it('removeFromIdList', () => {
    const production = {
      id: '1',
      name: 'Caminandes',
      asset_types: ['type-1', 'type-2', 'type-3']
    }
    removeFromIdList(production, 'asset_types', 'type-2')
    expect(production.asset_types).toEqual(['type-1', 'type-3'])
  })

  it('populateTask - Episode', () => {
    const task = {
      entity_name: 'E01',
      entity_type_name: 'Episode',
      project_id: 'prod-1',
      entity_id: 'ep-1'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('E01')
  })

  it('populateTask - Sequence with episode', () => {
    const task = {
      entity_name: 'SQ01',
      entity_type_name: 'Sequence',
      episode_name: 'E01',
      project_id: 'prod-1',
      entity_id: 'seq-1'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('E01 / SQ01')
  })

  it('populateTask - Edit without episode', () => {
    const task = {
      entity_name: 'ED01',
      entity_type_name: 'Edit',
      project_id: 'prod-1',
      entity_id: 'edit-1'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('ED01')
  })

  it('removeFromIdList - id not found', () => {
    const production = {
      id: '1',
      asset_types: ['type-1', 'type-2']
    }
    removeFromIdList(production, 'asset_types', 'type-999')
    expect(production.asset_types).toEqual(['type-1', 'type-2'])
  })

  it('arrayMove', () => {
    const arr = ['a', 'b', 'c', 'd']
    expect(arrayMove(arr, 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(arr).toEqual(['a', 'b', 'c', 'd']) // original unchanged
  })
})
