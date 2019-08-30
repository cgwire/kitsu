import test from '../../../src/lib/string'
import {
  getFilledColumns,
  populateTask
} from '../../../src/lib/models'

describe('lib/helpers', () => {

  it('populateTask', () => {
    let task = {
      'entity_name': 'Agent 327',
      'entity_type_name': 'Characters'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('Characters / Agent 327')

    task = {
      'entity_name': 'SH01',
      'entity_type_name': 'Shot',
      'sequence_name': 'SQ01',
      'episode_name': 'E01'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('E01 / SQ01 / SH01')

    task = {
      'entity_name': 'SH01',
      'entity_type_name': 'Shot',
      'sequence_name': 'SQ01'
    }
    populateTask(task)
    expect(task.full_entity_name).toEqual('SQ01 / SH01')
  })

  it('getFilledColumns', () => {
    const assets = [
      {
        id: 'asset-1',
        validations: {
          'task-type-1': 'task-1'
        }
      },
      {
        id: 'asset-2',
        validations: {
          'task-type-2': 'task-2'
        }
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
})
