import {
  aggregateRetakeStats,
  aggregateStats,
  computeGroupSummary,
  computeStats,
  getChartData,
  getChartColors,
  getPercentage
} from '@/lib/stats'

const taskMap = new Map(Object.entries({
  'task-1': {
    id: 'task-1',
    entity_id: 'shot-1',
    task_status_id: 'task-status-1',
    task_type_id: 'task-type-1',
    nb_drawings: 10
  },
  'task-2': {
    id: 'task-2',
    entity_id: 'shot-1',
    task_status_id: 'task-status-1',
    task_type_id: 'task-type-2',
    nb_drawings: 10
  },
  'task-3': {
    id: 'task-3',
    entity_id: 'shot-2',
    task_status_id: 'task-status-2',
    task_type_id: 'task-type-1',
    nb_drawings: 10
  },
  'task-4': {
    id: 'task-4',
    entity_id: 'shot-2',
    task_status_id: 'task-status-1',
    task_type_id: 'task-type-2',
    nb_drawings: 10
  },
  'task-5': {
    id: 'task-5',
    entity_id: 'shot-3',
    task_status_id: 'task-status-1',
    task_type_id: 'task-type-1',
    nb_drawings: 10
  },
  'task-6': {
    id: 'task-6',
    entity_id: 'shot-3',
    task_status_id: 'task-status-2',
    task_type_id: 'task-type-2',
    nb_drawings: 10
  }
}))
const taskTypeMap = new Map(Object.entries({
  'task-type-1': {
    id: 'task-type-1',
    name: 'Layout'
  },
  'task-type-2': {
    id: 'task-type-2',
    name: 'Animation'
  }
}))
const taskStatusMap = new Map(Object.entries({
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
}))
const expectedStatResult = {
  all: {
    all: {
      'task-status-1': { name: 'wip', color: 'blue', count: 4, frames: 29, drawings: 40 },
      'task-status-2': { name: 'retake', color: 'red', count: 2, frames: 9, drawings: 20 }
    },
    'task-type-1': {
      'task-status-1': { name: 'wip', color: 'blue', count: 2, frames: 14, drawings: 20 },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 5, drawings: 10 }
    },
    'task-type-2': {
      'task-status-1': { name: 'wip', color: 'blue', count: 2, frames: 15, drawings: 20 },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 4, drawings: 10 }
    }
  },
  'sequence-1': {
    all: {
      'task-status-1': { name: 'wip', color: 'blue', count: 3, frames: 25, drawings: 30 },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 5, drawings: 10 }
    },
    'task-type-1': {
      'task-status-1': { name: 'wip', color: 'blue', count: 1, frames: 10, drawings: 10 },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 5, drawings: 10 }
    },
    'task-type-2': {
      'task-status-1': { name: 'wip', color: 'blue', count: 2, frames: 15, drawings: 20 },
    }
  },
  'sequence-2': {
    all: {
      'task-status-1': { name: 'wip', color: 'blue', count: 1, frames: 4, drawings: 10 },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 4, drawings: 10 }
    },
    'task-type-1': {
      'task-status-1': { name: 'wip', color: 'blue', count: 1, frames: 4, drawings: 10 }
    },
    'task-type-2': {
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 4, drawings: 10  }
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

  it('computeGroupSummary - empty group', () => {
    const summary = computeGroupSummary([], taskMap, taskStatusMap)
    expect(summary).toEqual({
      timeSpent: 0,
      estimation: 0,
      frames: 0,
      drawings: 0,
      statusCounts: {}
    })
  })

  it('computeGroupSummary - totals and status counts', () => {
    const shots = [
      {
        id: 'shot-1',
        tasks: ['task-1', 'task-2'],
        timeSpent: 60,
        estimation: 120,
        nb_frames: 10,
        nb_drawings: 3
      },
      {
        id: 'shot-2',
        tasks: ['task-3', 'task-4'],
        timeSpent: 30,
        nb_frames: 5
      },
      {
        id: 'shot-3',
        tasks: ['task-5', 'task-6'],
        canceled: true,
        timeSpent: 999,
        nb_frames: 999
      },
      {
        id: 'shot-4'
      }
    ]
    const summary = computeGroupSummary(shots, taskMap, taskStatusMap)
    expect(summary.timeSpent).toEqual(90)
    expect(summary.estimation).toEqual(120)
    expect(summary.frames).toEqual(15)
    expect(summary.drawings).toEqual(3)
    expect(summary.statusCounts['task-type-1']).toEqual([
      { taskStatus: taskStatusMap.get('task-status-2'), count: 1 },
      { taskStatus: taskStatusMap.get('task-status-1'), count: 1 }
    ])
    expect(summary.statusCounts['task-type-2']).toEqual([
      { taskStatus: taskStatusMap.get('task-status-1'), count: 2 }
    ])
  })

  it('computeGroupSummary - skips unknown tasks and sorts by count', () => {
    const shots = [
      { id: 'shot-1', tasks: ['task-1', 'unknown-task'] },
      { id: 'shot-2', tasks: ['task-3'] },
      { id: 'shot-3', tasks: ['task-5'] }
    ]
    const summary = computeGroupSummary(shots, taskMap, taskStatusMap)
    expect(summary.statusCounts['task-type-1']).toEqual([
      { taskStatus: taskStatusMap.get('task-status-1'), count: 2 },
      { taskStatus: taskStatusMap.get('task-status-2'), count: 1 }
    ])
    expect(summary.statusCounts['task-type-2']).toBeUndefined()
  })

  it('getChartData', () => {
    const sequence = { id: 'sequence-1' }
    const taskType = taskTypeMap.get('task-type-1')
    let data = getChartData(expectedStatResult, sequence.id, taskType.id)
    expect(data).toEqual([['retake', 1, 'red'], ['wip', 1, 'blue']])
    data = getChartData(expectedStatResult, 'all', 'all')
    expect(data).toEqual([['retake', 2, 'red'], ['wip', 4, 'blue']])
  })

  it('getChartColors', () => {
    const sequence = { id: 'sequence-1' }
    const taskType = taskTypeMap.get('task-type-1')
    let data = getChartColors(expectedStatResult, sequence.id, taskType.id)
    expect(data).toEqual(['red', 'blue'])
    data = getChartColors(expectedStatResult, 'all', 'all')
    expect(data).toEqual(['red', 'blue'])
  })

  it('getPercentage', () => {
    expect(getPercentage(50, 100)).toEqual('50.00')
    expect(getPercentage(1, 3)).toEqual('33.33')
    expect(getPercentage(0, 0)).toEqual('0.00')
    expect(getPercentage(0, 100)).toEqual('0.00')
  })

  it('aggregateStats', () => {
    const aggregated = aggregateStats(expectedStatResult, ['sequence-1'])
    expect(aggregated).toEqual(expectedStatResult['sequence-1'])
    const all = aggregateStats(expectedStatResult, [
      'sequence-1',
      'sequence-2'
    ])
    expect(all.all).toEqual(expectedStatResult.all.all)
    expect(aggregateStats(expectedStatResult, ['missing'])).toEqual({})
  })

  it('aggregateRetakeStats', () => {
    const retakeStats = {
      'episode-1': {
        all: {
          max_retake_count: 2,
          retake: { count: 1, frames: 10, drawings: 0 },
          done: { count: 2, frames: 20, drawings: 0 },
          other: { count: 3, frames: 30, drawings: 0 },
          evolution: {}
        }
      },
      'episode-2': {
        all: {
          max_retake_count: 4,
          retake: { count: 10, frames: 100, drawings: 0 },
          done: { count: 20, frames: 200, drawings: 0 },
          other: { count: 30, frames: 300, drawings: 0 },
          evolution: {}
        }
      }
    }
    const aggregated = aggregateRetakeStats(retakeStats, [
      'episode-1',
      'episode-2'
    ])
    expect(aggregated.all.max_retake_count).toEqual(4)
    expect(aggregated.all.retake).toEqual({ count: 11, frames: 110, drawings: 0 })
    expect(aggregated.all.done).toEqual({ count: 22, frames: 220, drawings: 0 })
    expect(aggregated.all.other).toEqual({ count: 33, frames: 330, drawings: 0 })
    const partial = aggregateRetakeStats(retakeStats, ['episode-1'])
    expect(partial.all.retake.count).toEqual(1)
  })
})
