const RETAKE_CHART_COLORS = {
  done: '#22d160',
  retake: '#ff3860',
  other: '#6f727a'
}

const DEFAULT_STATUS_COLOR = '#6F727A'

// Out of the box the default status is near white, unreadable on a light
// background: it is drawn grey.
export const getStatusColor = taskStatus =>
  taskStatus.is_default ? DEFAULT_STATUS_COLOR : taskStatus.color

const createStatusEntry = taskStatus => ({
  name: taskStatus.short_name,
  color: taskStatus.color,
  count: 0,
  frames: 0,
  drawings: 0,
  is_done: !!taskStatus.is_done,
  is_default: !!taskStatus.is_default
})

// Get all data displayed in statistics (needed by the stat cell widget).
// Data follow this format: [[task-status-1-name, value, color, isDone], ...]
// Set count data or frames data depending on data type.
// The stats computed by the server carry no done or default flag: give the
// task status map to read them from the statuses.
export const getChartData = (
  mainStats,
  entryId,
  columnId,
  dataType = 'count',
  taskStatusMap = null
) => {
  if (!mainStats[entryId] || !mainStats[entryId][columnId]) return []
  const statusData = mainStats[entryId][columnId]
  const valueField = dataType
  return Object.keys(statusData)
    .map(taskStatusId => {
      const data = statusData[taskStatusId]
      const taskStatus = taskStatusMap?.get(taskStatusId)
      const isDefault = data.is_default ?? taskStatus?.is_default
      const color = isDefault ? DEFAULT_STATUS_COLOR : data.color
      const isDone = data.is_done ?? taskStatus?.is_done
      return [data.name, data[valueField], color, !!isDone]
    })
    .sort(_sortData)
}

const _sortData = (a, b) => {
  if (a[0] && b[0]) {
    return a[0].localeCompare(b[0], undefined, { numeric: true })
  } else if (!a[0] && b[0]) {
    return -1
  } else if (a[0] && !b[0]) {
    return 1
  } else {
    return 1
  }
}

// Give a take number to read the stats the column had at that take instead
// of its current ones.
export const getRetakeChartData = (
  mainStats,
  entryId,
  columnId,
  dataType = 'count',
  takeNumber = null
) => {
  const column = mainStats[entryId]?.[columnId]
  if (!column) return []
  const statusData = takeNumber ? column.evolution[takeNumber] : column
  return ['retake', 'other', 'done'].map(name => [
    name,
    statusData[name]?.[dataType] || 0,
    RETAKE_CHART_COLORS[name],
    name === 'done'
  ])
}

// Share of the chart data value held by the done statuses, between 0 and 1.
export const getDoneRatio = chartData => {
  const total = chartData.reduce((sum, row) => sum + (row[1] || 0), 0)
  const done = chartData
    .filter(row => row[3])
    .reduce((sum, row) => sum + (row[1] || 0), 0)
  return total > 0 ? done / total : 0
}

// Share as a whole percentage, where only an empty share reads 0 and only a
// full one 100: a single shot left in retake must not show as complete.
export const roundPercent = ratio => {
  const percent = Math.round(ratio * 100)
  if (ratio > 0 && percent === 0) return 1
  if (ratio < 1 && percent === 100) return 99
  return percent
}

// Get all colors displayed in statistics (needed by the stat cell widget).
export const getChartColors = (mainStats, entry, column) => {
  return getChartData(mainStats, entry, column).map(entry => entry[2])
}

// Extract max retake count info from retake statistics. A column rebuilt
// from no visible task type is empty: it counts as a missing one.
export const getChartRetakeCount = (mainStats, entryId, columnId) =>
  mainStats[entryId]?.[columnId]?.max_retake_count ?? -1

// Build a map containing all stats of a production or episode:
//
// {
//    all: {
//      all {
//        task-status-id-1: { count: 0, frames: 0 }
//         ...
//      },
//      task-type-id-1: {
//        task-status-id-1: { count: 0, frames: 0 }
//        ...
//      }
//      ...
//    },
//    entity-id-1: {
//      all {
//        task-status-id-1: { count: 0, frames: 0 }
//         ...
//      },
//      ...
//      task-type-id-1: {
//        task-status-id-1: { count: 0, frames: 0 }
//        ...
//      }
//      ...
//    }
//    ...
// }
export const computeStats = (entities, idField, taskStatusMap, taskMap) => {
  const results = { all: { all: {} } }
  entities.forEach(entity => {
    if (!entity.canceled) {
      const sequenceId = entity[idField]
      if (!results[sequenceId]) {
        results[sequenceId] = { all: {} }
      }

      entity.tasks.forEach(taskId => {
        const task = taskMap.get(taskId)
        computeTaskResult(taskStatusMap, results, sequenceId, entity, task)
      })
    }
  })
  return results
}

// Count the entities of each group. Canceled ones are left out, as in
// computeStats.
export const countEntities = (entities, idField) =>
  entities.reduce((counts, entity) => {
    if (!entity.canceled) {
      counts[entity[idField]] = (counts[entity[idField]] || 0) + 1
    }
    return counts
  }, {})

// Add to result map, statistic for given task (add 1 for task status matching
// given task).
// Increment: all stats, task type stats, entity stats, and task type for
// entity stats.
// Perform the same operation for the frames number.
const computeTaskResult = (
  taskStatusMap,
  results,
  sequenceId,
  entity,
  task
) => {
  if (task) {
    const taskTypeId = task.task_type_id
    const taskStatus = taskStatusMap.get(task.task_status_id)

    if (taskStatus) {
      const taskStatusId = taskStatus.id
      if (!results[sequenceId][taskTypeId]) {
        results[sequenceId][taskTypeId] = {}
      }

      if (!results.all.all[taskStatusId]) {
        results.all.all[taskStatusId] = createStatusEntry(taskStatus)
      }
      if (!results.all[taskTypeId]) {
        results.all[taskTypeId] = {}
      }
      if (!results.all[taskTypeId][taskStatusId]) {
        results.all[taskTypeId][taskStatusId] = createStatusEntry(taskStatus)
      }
      if (!results[sequenceId].all[taskStatusId]) {
        results[sequenceId].all[taskStatusId] = createStatusEntry(taskStatus)
      }
      if (!results[sequenceId][taskTypeId][taskStatusId]) {
        results[sequenceId][taskTypeId][taskStatusId] =
          createStatusEntry(taskStatus)
      }

      // Slice count
      results[sequenceId][taskTypeId][taskStatusId].count++
      results[sequenceId].all[taskStatusId].count++
      results.all[taskTypeId][taskStatusId].count++
      results.all.all[taskStatusId].count++

      if (entity.nb_frames) {
        // Slice count
        results[sequenceId][taskTypeId][taskStatusId].frames += entity.nb_frames
        results[sequenceId].all[taskStatusId].frames += entity.nb_frames
        results.all[taskTypeId][taskStatusId].frames += entity.nb_frames
        results.all.all[taskStatusId].frames += entity.nb_frames
      }

      if (task.nb_drawings) {
        const nbDrawings = task.nb_drawings || 0
        results[sequenceId][taskTypeId][taskStatusId].drawings += nbDrawings
        results[sequenceId].all[taskStatusId].drawings += nbDrawings
        results.all[taskTypeId][taskStatusId].drawings += nbDrawings
        results.all.all[taskStatusId].drawings += nbDrawings
      }
    }
  }
}

// Aggregate the per-entry stats of the given entries into a single bucket
// shaped like an entry (used for the "all" row when entries are filtered).
export const aggregateStats = (mainStats, entryIds) => {
  const result = {}
  entryIds.forEach(entryId => {
    const entryStats = mainStats[entryId]
    if (!entryStats) return
    Object.keys(entryStats).forEach(columnId => {
      if (!result[columnId]) result[columnId] = {}
      const columnStats = entryStats[columnId]
      Object.keys(columnStats).forEach(taskStatusId => {
        const data = columnStats[taskStatusId]
        const target = result[columnId][taskStatusId]
        if (!target) {
          result[columnId][taskStatusId] = { ...data }
        } else {
          target.count += data.count || 0
          target.frames += data.frames || 0
          target.drawings += data.drawings || 0
        }
      })
    })
  })
  return result
}

// Drop the given columns of an entry and rebuild its "all" column from the
// remaining ones.
export const omitStatsColumns = (
  entryStats,
  hiddenColumnIds,
  aggregate = aggregateStats
) => {
  const columnIds = Object.keys(entryStats).filter(
    id => id !== 'all' && !hiddenColumnIds.includes(id)
  )
  // The aggregate sums entries: each kept column is given to it as an entry
  // holding a single "all" column.
  const columns = Object.fromEntries(
    columnIds.map(id => [id, { all: entryStats[id] }])
  )
  return {
    ...Object.fromEntries(columnIds.map(id => [id, entryStats[id]])),
    all: aggregate(columns, columnIds).all || {}
  }
}

// Same as omitStatsColumns for retake stats.
export const omitRetakeStatsColumns = (entryStats, hiddenColumnIds) =>
  omitStatsColumns(entryStats, hiddenColumnIds, aggregateRetakeStats)

// Same as aggregateStats for retake stats (retake / done / other buckets).
export const aggregateRetakeStats = (retakeStats, entryIds) => {
  const result = {}
  entryIds.forEach(entryId => {
    const entryStats = retakeStats[entryId]
    if (!entryStats) return
    Object.keys(entryStats).forEach(columnId => {
      if (!result[columnId]) {
        result[columnId] = {
          max_retake_count: 0,
          retake: { count: 0, frames: 0, drawings: 0 },
          done: { count: 0, frames: 0, drawings: 0 },
          other: { count: 0, frames: 0, drawings: 0 }
        }
      }
      const columnStats = entryStats[columnId]
      const target = result[columnId]
      target.max_retake_count = Math.max(
        target.max_retake_count,
        columnStats.max_retake_count || 0
      )
      ;['retake', 'done', 'other'].forEach(key => {
        ;['count', 'frames', 'drawings'].forEach(field => {
          target[key][field] += columnStats[key]?.[field] || 0
        })
      })
    })
  })
  return result
}

export const getPercentage = (value, total) => {
  let percent = 0
  if (total > 0) {
    percent = (value / total) * 100
  }
  return percent.toFixed(2)
}
