// @vitest-environment node

import {
  aggregateRetakeStats,
  aggregateStats,
  computeStats,
  countEntities,
  getChartData,
  getChartColors,
  getDoneRatio,
  getPercentage,
  getRetakeChartData,
  omitRetakeStatsColumns,
  omitStatsColumns
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
      'task-status-1': { name: 'wip', color: 'blue', count: 4, frames: 29, drawings: 40, is_done: false, is_default: false },
      'task-status-2': { name: 'retake', color: 'red', count: 2, frames: 9, drawings: 20, is_done: false, is_default: false }
    },
    'task-type-1': {
      'task-status-1': { name: 'wip', color: 'blue', count: 2, frames: 14, drawings: 20, is_done: false, is_default: false },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 5, drawings: 10, is_done: false, is_default: false }
    },
    'task-type-2': {
      'task-status-1': { name: 'wip', color: 'blue', count: 2, frames: 15, drawings: 20, is_done: false, is_default: false },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 4, drawings: 10, is_done: false, is_default: false }
    }
  },
  'sequence-1': {
    all: {
      'task-status-1': { name: 'wip', color: 'blue', count: 3, frames: 25, drawings: 30, is_done: false, is_default: false },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 5, drawings: 10, is_done: false, is_default: false }
    },
    'task-type-1': {
      'task-status-1': { name: 'wip', color: 'blue', count: 1, frames: 10, drawings: 10, is_done: false, is_default: false },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 5, drawings: 10, is_done: false, is_default: false }
    },
    'task-type-2': {
      'task-status-1': { name: 'wip', color: 'blue', count: 2, frames: 15, drawings: 20, is_done: false, is_default: false },
    }
  },
  'sequence-2': {
    all: {
      'task-status-1': { name: 'wip', color: 'blue', count: 1, frames: 4, drawings: 10, is_done: false, is_default: false },
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 4, drawings: 10, is_done: false, is_default: false }
    },
    'task-type-1': {
      'task-status-1': { name: 'wip', color: 'blue', count: 1, frames: 4, drawings: 10, is_done: false, is_default: false }
    },
    'task-type-2': {
      'task-status-2': { name: 'retake', color: 'red', count: 1, frames: 4, drawings: 10, is_done: false, is_default: false }
    }
  }
}

describe('lib/stats', () => {
  it('omitStatsColumns - drops the columns and rebuilds the all column', () => {
    const entry = (count, frames) => ({
      done: { name: 'done', color: 'green', count, frames, drawings: 0 }
    })
    const entryStats = {
      all: entry(3, 30),
      'task-type-1': entry(1, 10),
      'task-type-2': entry(2, 20)
    }
    expect(omitStatsColumns(entryStats, ['task-type-2'])).toEqual({
      all: entry(1, 10),
      'task-type-1': entry(1, 10)
    })
    expect(omitStatsColumns(entryStats, [])).toEqual(entryStats)
    expect(omitStatsColumns(entryStats, ['task-type-1', 'task-type-2'])).toEqual(
      { all: {} }
    )
    expect(entryStats.all.done.count).toBe(3)
  })

  it('countEntities - counts the entities of each group, canceled ones aside', () => {
    const assets = [
      { id: 'asset-1', asset_type_id: 'chars' },
      { id: 'asset-2', asset_type_id: 'chars' },
      { id: 'asset-3', asset_type_id: 'chars', canceled: true },
      { id: 'asset-4', asset_type_id: 'props' }
    ]
    expect(countEntities(assets, 'asset_type_id')).toEqual({
      chars: 2,
      props: 1
    })
  })

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
    const taskType = taskTypeMap.get('task-type-1')
    let data = getChartData(expectedStatResult, sequence.id, taskType.id)
    expect(data).toEqual([
      ['retake', 1, 'red', false],
      ['wip', 1, 'blue', false]
    ])
    data = getChartData(expectedStatResult, 'all', 'all')
    expect(data).toEqual([
      ['retake', 2, 'red', false],
      ['wip', 4, 'blue', false]
    ])
  })

  it('getChartData - flags the rows of done statuses', () => {
    const shots = [{ id: 'shot-1', sequence_id: 'sequence-1', tasks: ['t1', 't2'] }]
    const tasks = new Map([
      ['t1', { task_status_id: 'task-status-3', task_type_id: 'task-type-1' }],
      ['t2', { task_status_id: 'task-status-1', task_type_id: 'task-type-1' }]
    ])
    const stats = computeStats(shots, 'sequence_id', taskStatusMap, tasks)
    expect(getChartData(stats, 'sequence-1', 'all')).toEqual([
      ['done', 1, 'green', true],
      ['wip', 1, 'blue', false]
    ])
  })

  // The flag decides, not the name: a studio names its final status freely.
  it('getChartData - trusts the is_done flag over the status name', () => {
    const statuses = new Map([
      ['s1', { id: 's1', short_name: 'approved', color: 'green', is_done: true }],
      ['s2', { id: 's2', short_name: 'done', color: 'grey', is_done: false }]
    ])
    const shots = [{ id: 'shot-1', sequence_id: 'sequence-1', tasks: ['t1', 't2'] }]
    const tasks = new Map([
      ['t1', { task_status_id: 's1', task_type_id: 'task-type-1' }],
      ['t2', { task_status_id: 's2', task_type_id: 'task-type-1' }]
    ])
    const data = getChartData(
      computeStats(shots, 'sequence_id', statuses, tasks),
      'sequence-1',
      'all'
    )
    expect(data).toEqual([
      ['approved', 1, 'green', true],
      ['done', 1, 'grey', false]
    ])
    expect(getDoneRatio(data)).toBe(0.5)
  })

  // The stats computed by the server carry no flag: the statuses do.
  it('getChartData - reads the done flag from the statuses when the stats lack it', () => {
    const stats = {
      'episode-1': {
        all: {
          'task-status-3': { name: 'done', color: 'green', count: 2 },
          'task-status-1': { name: 'wip', color: 'blue', count: 1 }
        }
      }
    }
    expect(
      getChartData(stats, 'episode-1', 'all', 'count', taskStatusMap)
    ).toEqual([
      ['done', 2, 'green', true],
      ['wip', 1, 'blue', false]
    ])
  })

  // Out of the box the default status is near white, unreadable on a light
  // background.
  it('getChartData - draws the default status in grey', () => {
    const statuses = new Map([
      ['s1', { id: 's1', short_name: 'todo', color: '#f5f5f5', is_default: true }],
      ['s2', { id: 's2', short_name: 'wip', color: 'blue' }]
    ])
    const shots = [{ id: 'shot-1', sequence_id: 'sequence-1', tasks: ['t1', 't2'] }]
    const tasks = new Map([
      ['t1', { task_status_id: 's1', task_type_id: 'task-type-1' }],
      ['t2', { task_status_id: 's2', task_type_id: 'task-type-1' }]
    ])
    const stats = computeStats(shots, 'sequence_id', statuses, tasks)
    expect(getChartData(stats, 'sequence-1', 'task-type-1')).toEqual([
      ['todo', 1, '#6F727A', false],
      ['wip', 1, 'blue', false]
    ])
    expect(getChartColors(stats, 'all', 'all')).toEqual(['#6F727A', 'blue'])
  })

  it('getChartData - reads the default flag from the statuses when the stats lack it', () => {
    const statuses = new Map([
      ['s1', { id: 's1', short_name: 'todo', color: '#f5f5f5', is_default: true }]
    ])
    const stats = {
      'episode-1': { all: { s1: { name: 'todo', color: '#f5f5f5', count: 2 } } }
    }
    expect(getChartData(stats, 'episode-1', 'all', 'count', statuses)).toEqual([
      ['todo', 2, '#6F727A', false]
    ])
  })

  it('getRetakeChartData - reads the stats of a take when given its number', () => {
    const stats = {
      'episode-1': {
        layout: {
          max_retake_count: 1,
          evolution: {
            1: { retake: { count: 4 }, other: { count: 5 }, done: { count: 6 } }
          },
          retake: { count: 1 },
          other: { count: 2 },
          done: { count: 3 }
        }
      }
    }
    const data = getRetakeChartData(stats, 'episode-1', 'layout', 'count', 1)
    expect(data.map(row => [row[0], row[1], row[3]])).toEqual([
      ['retake', 4, false],
      ['other', 5, false],
      ['done', 6, true]
    ])
  })

  it('getRetakeChartData - flags the done row', () => {
    const stats = {
      'episode-1': {
        all: {
          max_retake_count: 1,
          retake: { count: 1 },
          other: { count: 2 },
          done: { count: 3 }
        }
      }
    }
    const data = getRetakeChartData(stats, 'episode-1', 'all')
    expect(data.map(row => [row[0], row[1], row[3]])).toEqual([
      ['retake', 1, false],
      ['other', 2, false],
      ['done', 3, true]
    ])
    expect(getDoneRatio(data)).toBe(0.5)
  })

  it('omitRetakeStatsColumns - drops the columns and rebuilds the all column', () => {
    const column = (retake, done, max) => ({
      max_retake_count: max,
      evolution: {},
      retake: { count: retake, frames: 0, drawings: 0 },
      done: { count: done, frames: 0, drawings: 0 },
      other: { count: 0, frames: 0, drawings: 0 }
    })
    const entryStats = {
      all: column(9, 9, 3),
      layout: column(1, 2, 1),
      anim: column(3, 4, 2),
      compo: column(5, 6, 3)
    }
    const result = omitRetakeStatsColumns(entryStats, ['compo'])
    expect(Object.keys(result).sort()).toEqual(['all', 'anim', 'layout'])
    expect(result.layout).toBe(entryStats.layout)
    expect(result.all).toMatchObject({
      max_retake_count: 2,
      retake: { count: 4 },
      done: { count: 6 }
    })
  })

  it('getDoneRatio', () => {
    const rows = [
      ['done', 3, 'green', true],
      ['wip', 1, 'blue', false]
    ]
    expect(getDoneRatio(rows)).toBe(0.75)
    expect(getDoneRatio([['wip', 2, 'blue', false]])).toBe(0)
    expect(getDoneRatio([])).toBe(0)
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
