// Get all data displayed in statistics (needed by the stat cell widget).
// Data follow this format: [[task-status-1-name, value], ...]
// Set count data or frames data depending on data type.
export const getChartData = (mainStats, entryId, columnId, dataType = 'count') => {
  if (!mainStats[entryId] || !mainStats[entryId][columnId]) return []
  const statusData = mainStats[entryId][columnId]
  const valueField = dataType === 'count' ? 'count' : 'frames'
  return Object.keys(statusData)
    .map((taskStatusId) => {
      const data = statusData[taskStatusId]
      const color = data.name === 'todo' ? '#6F727A' : data.color
      return [data.name, data[valueField], color]
    })
    .sort((a, b) => {
      if (a[0] && b[0]) {
        return a[0].localeCompare(b[0])
      } else if (!a[0] && b[0]) {
        return -1
      } else if (a[0] && !b[0]) {
        return 1
      } else {
        return 1
      }
    })
}

// Get all colors displayed in statistics (needed by the stat cell widget).
export const getChartColors = (mainStats, entry, column) => {
  return getChartData(mainStats, entry, column).map(entry => entry[2])
}

// Build a map containing all stats of a production or episode:
//
// {
//    all: {
//      task-status-id-1: { count: 0, frames: 0 }
//      ...
//      task-type-id-1: {
//        task-status-id-1: { count: 0, frames: 0 }
//        ...
//      }
//      ...
//    },
//    entity-id-1: {
//      task-status-id-1: { count: 0, frames: 0 }
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
  entities.forEach((entity) => {
    if (!entity.canceled) {
      const sequenceId = entity[idField]
      if (!results[sequenceId]) {
        results[sequenceId] = { all: {} }
      }

      entity.tasks.forEach((taskId) => {
        const task = taskMap[taskId]
        computeTaskResult(
          taskStatusMap,
          results,
          sequenceId,
          entity,
          task
        )
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
    const taskStatus = taskStatusMap[task.task_status_id]

    if (taskStatus) {
      const taskStatusId = taskStatus.id
      if (!results[sequenceId][taskTypeId]) {
        results[sequenceId][taskTypeId] = {}
      }

      // All / all intersections
      if (!results.all.all[taskStatusId]) {
        results.all.all[taskStatusId] = {
          name: taskStatus.short_name,
          color: taskStatus.color,
          count: 0,
          frames: 0
        }
      }

      // All line
      if (!results.all[taskTypeId]) {
        results.all[taskTypeId] = {}
      }
      if (!results.all[taskTypeId][taskStatusId]) {
        results.all[taskTypeId][taskStatusId] = {
          name: taskStatus.short_name,
          color: taskStatus.color,
          count: 0,
          frames: 0
        }
      }

      // All column
      if (!results[sequenceId].all[taskStatusId]) {
        results[sequenceId].all[taskStatusId] = {
          name: taskStatus.short_name,
          color: taskStatus.color,
          count: 0,
          frames: 0
        }
      }

      // Columns
      if (!results[sequenceId][taskTypeId][taskStatusId]) {
        results[sequenceId][taskTypeId][taskStatusId] = {
          name: taskStatus.short_name,
          color: taskStatus.color,
          count: 0,
          frames: 0
        }
      }

      // Slice count
      results[sequenceId][taskTypeId][taskStatusId].count++
      results[sequenceId].all[taskStatusId].count++
      results.all[taskTypeId][taskStatusId].count++
      results.all.all[taskStatusId].count++

      if (entity.nb_frames) {
        // Slice count
        results[sequenceId][taskTypeId][taskStatusId].frames +=
          entity.nb_frames
        results[sequenceId].all[taskStatusId].frames += entity.nb_frames
        results.all[taskTypeId][taskStatusId].frames += entity.nb_frames
        results.all.all[taskStatusId].frames += entity.nb_frames
      }
    }
  }
}

export const getPercentage = (value, total) => {
  let percent = 0
  if (total > 0) {
    percent = (value / total) * 100
  }
  return percent.toFixed(2)
}
