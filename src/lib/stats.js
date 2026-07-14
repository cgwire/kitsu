const RETAKE_CHART_COLORS = {
  done: '#22d160',
  retake: '#ff3860',
  other: '#6f727a'
}

const DEFAULT_STATUS_COLOR = '#6F727A'

const createStatusEntry = taskStatus => ({
  name: taskStatus.short_name,
  color: taskStatus.color,
  count: 0,
  frames: 0,
  drawings: 0
})

// Get all data displayed in statistics (needed by the stat cell widget).
// Data follow this format: [[task-status-1-name, value], ...]
// Set count data or frames data depending on data type.
export const getChartData = (
  mainStats,
  entryId,
  columnId,
  dataType = 'count'
) => {
  if (!mainStats[entryId] || !mainStats[entryId][columnId]) return []
  const statusData = mainStats[entryId][columnId]
  const valueField = dataType
  return Object.keys(statusData)
    .map(taskStatusId => {
      const data = statusData[taskStatusId]
      const color = data.is_default ? DEFAULT_STATUS_COLOR : data.color
      return [data.name, data[valueField], color]
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

export const getRetakeChartData = (
  mainStats,
  entryId,
  columnId,
  dataType = 'count'
) => {
  if (!mainStats[entryId] || !mainStats[entryId][columnId]) return []
  const statusData = { ...mainStats[entryId][columnId] }
  delete statusData.evolution
  delete statusData.max_retake_count
  const valueField = dataType
  return [
    [
      'retake',
      statusData.retake?.[valueField] || 0,
      RETAKE_CHART_COLORS.retake
    ],
    ['other', statusData.other?.[valueField] || 0, RETAKE_CHART_COLORS.other],
    ['done', statusData.done?.[valueField] || 0, RETAKE_CHART_COLORS.done]
  ]
}

// Get all colors displayed in statistics (needed by the stat cell widget).
export const getChartColors = (mainStats, entry, column) => {
  return getChartData(mainStats, entry, column).map(entry => entry[2])
}

// Extract max retake count info from retake statistics.
export const getChartRetakeCount = (mainStats, entryId, columnId) => {
  if (!mainStats[entryId] || !mainStats[entryId][columnId]) return -1
  return mainStats[entryId][columnId].max_retake_count
}

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

// Summarize a group of entities (e.g. the shots of a sequence): totals for
// time spent, estimation, frames and drawings, plus, for each task type, the
// number of entities per task status (sorted by descending count).
export const computeGroupSummary = (entities, taskMap, taskStatusMap) => {
  const summary = {
    timeSpent: 0,
    estimation: 0,
    frames: 0,
    drawings: 0,
    statusCounts: {}
  }
  entities
    .filter(entity => !entity.canceled)
    .forEach(entity => {
      summary.timeSpent += entity.timeSpent || 0
      summary.estimation += entity.estimation || 0
      summary.frames += entity.nb_frames || 0
      summary.drawings += entity.nb_drawings || 0
      ;(entity.tasks || []).forEach(taskId => {
        const task = taskMap.get(taskId)
        const taskStatus = task ? taskStatusMap.get(task.task_status_id) : null
        if (taskStatus) {
          if (!summary.statusCounts[task.task_type_id]) {
            summary.statusCounts[task.task_type_id] = {}
          }
          const columnCounts = summary.statusCounts[task.task_type_id]
          if (!columnCounts[taskStatus.id]) {
            columnCounts[taskStatus.id] = { taskStatus, count: 0 }
          }
          columnCounts[taskStatus.id].count++
        }
      })
    })
  Object.keys(summary.statusCounts).forEach(taskTypeId => {
    summary.statusCounts[taskTypeId] = Object.values(
      summary.statusCounts[taskTypeId]
    ).sort(
      (a, b) =>
        b.count - a.count ||
        a.taskStatus.short_name.localeCompare(b.taskStatus.short_name)
    )
  })
  return summary
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
