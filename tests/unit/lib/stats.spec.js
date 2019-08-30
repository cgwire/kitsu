import {
  computeStats,
  getChartData,
  getChartColors
} from '../../../src/lib/stats'


const taskMap = {
  'task-1': {
    id: 'task-1',
    entity_id: 'shot-1',
    task_status_id: 'task-status-1',
    task_type_id: 'task-type-1'
  },
  'task-2': {
    id: 'task-2',
    entity_id: 'shot-1',
    task_status_id: 'task-status-1',
    task_type_id: 'task-type-2'
  },
  'task-3': {
    id: 'task-3',
    entity_id: 'shot-2',
    task_status_id: 'task-status-2',
    task_type_id: 'task-type-1'
  },
  'task-4': {
    id: 'task-4',
    entity_id: 'shot-2',
    task_status_id: 'task-status-1',
    task_type_id: 'task-type-2'
  },
  'task-5': {
    id: 'task-5',
    entity_id: 'shot-3',
    task_status_id: 'task-status-1',
    task_type_id: 'task-type-1'
  },
  'task-6': {
    id: 'task-6',
    entity_id: 'shot-3',
    task_status_id: 'task-status-2',
    task_type_id: 'task-type-2'
  }
}
const taskTypeMap = {
  'task-type-1': {
    id: 'task-type-1',
    name: 'Layout'
  },
  'task-type-2': {
    id: 'task-type-2',
    name: 'Animation'
  }
}
const taskStatusMap = {
  'task-status-1': {
    id: 'task-status-1',
    name: 'WIP',
    short_name: 'wip',
    color: 'blue',
    is_retake: false,
    is_done: false
  },
  'task-status-2': {
    id: 'task-status-2',
    name: 'Retake',
    short_name: 'retake',
    color: 'red',
    is_retake: true,
    is_done: false
  },
  'task-status-3': {
    id: 'task-status-3',
    name: 'Done',
    short_name: 'done',
    color: 'green',
    is_retake: false,
    is_done: true
  }
}
const expectedStatResult = {
  all: {
    all: {
      'task-status-1': { name: 'wip', color: 'blue', count: 4, frames: 29 },
      'task-status-2': { name: 'retake', color: 'red', count: 2, frames: 9 },
    },
    'task-type-1': {
      'task-status-1': { name: 'wip', color: 'blue', count: 2, frames: 14 },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 5 }
    },
    'task-type-2': {
      'task-status-1': { name: 'wip', color: 'blue', count: 2, frames: 15 },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 4 }
    },
  },
  'sequence-1': {
    all: {
      'task-status-1': { name: 'wip', color: 'blue', count: 3, frames: 25 },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 5 }
    },
    'task-type-1': {
      'task-status-1': { name: 'wip', color: 'blue', count: 1, frames: 10 },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 5 }
    },
    'task-type-2': {
      'task-status-1': { name: 'wip', color: 'blue', count: 2, frames: 15 }
    }
  },
  'sequence-2': {
    all: {
      'task-status-1': { name: 'wip', color: 'blue', count: 1, frames: 4 },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 4 }
    },
    'task-type-1': {
      'task-status-1': { name: 'wip', color: 'blue', count: 1, frames: 4 }
    },
    'task-type-2': {
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 4 }
    }
  }
}


describe('lib/stats', () => {

  it('computeStats - empty list', () => {
    const shots = []
    const stats = computeStats(shots, 'sequence_id', taskStatusMap, taskMap)
    expect(stats).toEqual({ all: { all: {} } })
  })

  it('computeStats - full list', () => {
    const shots = [
      {
        id: 'shot-1',
        sequence_id: 'sequence-1',
        tasks: ['task-1', 'task-2'],
        nb_frames: 10
      },
      {
        id: 'shot-2',
        sequence_id: 'sequence-1',
        tasks: ['task-3', 'task-4'],
        nb_frames: 5
      },
      {
        id: 'shot-3',
        sequence_id: 'sequence-2',
        tasks: ['task-5', 'task-6'],
        nb_frames: 4
      }
    ]
    const stats = computeStats(shots, 'sequence_id', taskStatusMap, taskMap)
    expect(stats).toEqual(expectedStatResult)
  })

  it('getChartData', () => {
    const sequence = { id: 'sequence-1' }
    const taskType = taskTypeMap['task-type-1']
    let data = getChartData(expectedStatResult, sequence.id, taskType.id)
    expect(data).toEqual([ [ 'retake', 1, 'red' ], [ 'wip', 1, 'blue' ] ])
    data = getChartData(expectedStatResult, 'all', 'all')
    expect(data).toEqual([ [ 'retake', 2, 'red' ], [ 'wip', 4, 'blue' ] ])
  })

  it('getChartColors', () => {
    const sequence = { id: 'sequence-1' }
    const taskType = taskTypeMap['task-type-1']
    let data = getChartColors(expectedStatResult, sequence.id, taskType.id)
    expect(data).toEqual([ 'red' , 'blue' ])
    data = getChartColors(expectedStatResult, 'all', 'all')
    expect(data).toEqual([ 'red', 'blue' ])
  })
})
