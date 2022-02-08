import firstBy from 'thenby'
import { getTaskTypePriorityOfProd } from './productions'

export const sortAssets = (assets) => {
  return assets.sort(
    firstBy('canceled')
      .thenBy((a, b) => a.asset_type_name.localeCompare(b.asset_type_name))
      .thenBy((a, b) => a.name.localeCompare(b.name))
  )
}

export const sortShots = (shots) => {
  return shots.sort(
    firstBy('canceled')
      .thenBy(sortByEpisode)
      .thenBy((a, b) => a.sequence_name.localeCompare(b.sequence_name))
      .thenBy((a, b) => a.name.localeCompare(b.name))
  )
}

export const sortEdits = (shots) => {
  return shots.sort(
    firstBy('canceled')
      .thenBy(sortByEpisode)
      .thenBy((a, b) => a.name.localeCompare(b.name))
  )
}

export const sortSequences = (sequences) => {
  return sequences.sort(
    firstBy('canceled')
      .thenBy((a, b) => {
        if (a.episode_name) {
          return a.episode_name.localeCompare(b.episode_name)
        } else {
          return 0
        }
      })
      .thenBy((a, b) => a.name.localeCompare(b.name))
  )
}

export const sortProductions = (productions) => {
  return productions.sort((a, b) => {
    if (a.project_status_name === b.project_status_name) {
      return a.name.localeCompare(b.name)
    } else {
      return -1 * a.project_status_name.localeCompare(b.project_status_name)
    }
  })
}

export const sortTasks = (tasks, taskTypeMap) => {
  return tasks.sort(
    firstBy('priority', -1)
      .thenBy((a, b) => {
        if (a.project_name) {
          return a.project_name.localeCompare(b.project_name)
        } else {
          return 0
        }
      })
      .thenBy((a, b) => {
        const taskTypeA = taskTypeMap.get(a.task_type_id)
        const taskTypeB = taskTypeMap.get(b.task_type_id)
        return taskTypeA.name.localeCompare(taskTypeB.name)
      })
      .thenBy((a, b) => {
        if (a.full_entity_name) {
          return a.full_entity_name.localeCompare(b.full_entity_name)
        } else {
          return a.entity_name.localeCompare(b.entity_name)
        }
      })
  )
}

export const sortComments = (comments) => {
  return comments.sort(
    firstBy('pinned', -1)
      .thenBy('created_at', -1)
  )
}

export const sortRevisionPreviewFiles = (previewFiles) => {
  return previewFiles.sort(
    firstBy('position')
      .thenBy('created_at')
  )
}

export const sortTaskTypes = (taskTypes, currentProduction) => {
  return taskTypes.sort(
    firstBy('for_entity')
      .thenBy((taskTypeA, taskTypeB) => {
        const taskTypeAPriority = getTaskTypePriorityOfProd(
          taskTypeA, currentProduction
        )
        const taskTypeBPriority = getTaskTypePriorityOfProd(
          taskTypeB, currentProduction
        )
        if (taskTypeAPriority > taskTypeBPriority) {
          return 1
        } else if (taskTypeAPriority < taskTypeBPriority) {
          return -1
        }
        return 0
      })
      .thenBy('name')
  )
}

export const sortTaskTypeScheduleItems = (
  items,
  currentProduction,
  taskTypeMap
) => {
  const sortFunc = firstBy('for_entity')
    .thenBy((itemA, itemB) => {
      const taskTypeA = taskTypeMap.get(itemA.task_type_id)
      const taskTypeB = taskTypeMap.get(itemB.task_type_id)
      const taskTypeAPriority = getTaskTypePriorityOfProd(
        taskTypeA, currentProduction
      )
      const taskTypeBPriority = getTaskTypePriorityOfProd(
        taskTypeB, currentProduction
      )
      if (taskTypeAPriority > taskTypeBPriority) {
        return 1
      } else if (taskTypeAPriority < taskTypeBPriority) {
        return -1
      }
      return 0
    })
    .thenBy('name')
  return items.sort(sortFunc)
}

export const sortPlaylists = (playlists) => {
  return playlists.sort(
    firstBy('created_at', -1)
      .thenBy((a, b) => a.name.localeCompare(b.name))
  )
}

export const sortPeople = (people) => {
  return people.sort(
    firstBy('active', -1)
      .thenBy((a, b) => (a.first_name ? a.first_name.localeCompare(b.first_name) : -1))
      .thenBy((a, b) => (a.last_name ? a.last_name.localeCompare(b.last_name) : -1))
  )
}

export const sortByName = (entries) => {
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export const sortByDate = (entries) => {
  return entries.sort(firstBy('created_at', -1))
}

export const sortValidationColumns = (
  columns,
  taskTypeMap,
  currentProduction
) => {
  return columns.sort((a, b) => {
    const taskTypeA = taskTypeMap.get(a)
    const taskTypeB = taskTypeMap.get(b)
    const taskTypeAPriority = getTaskTypePriorityOfProd(
      taskTypeA, currentProduction
    )
    const taskTypeBPriority = getTaskTypePriorityOfProd(
      taskTypeB, currentProduction
    )
    if (taskTypeAPriority === taskTypeBPriority) {
      return taskTypeA.name.localeCompare(taskTypeB.name)
    } else if (taskTypeAPriority > taskTypeBPriority) {
      return 1
    } else {
      return -1
    }
  })
}

export const sortAssetResult = (
  result,
  sorting,
  taskTypeMap,
  taskMap
) => {
  if (sorting && sorting.length > 0) {
    const sortInfo = sorting[0]
    let sortEntities = sortByTaskType(taskMap, sortInfo)
    if (sortInfo.type === 'metadata') sortEntities = sortByMetadata(sortInfo)
    result = result.sort(
      firstBy('canceled')
        .thenBy(sortEntities)
        .thenBy((a, b) => a.asset_type_name.localeCompare(b.asset_type_name))
        .thenBy((a, b) => a.name.localeCompare(b.name))
    )
  } else {
    result = sortAssets(result)
  }
  return result
}

export const sortShotResult = (
  result,
  sorting,
  taskTypeMap,
  taskMap
) => {
  if (sorting && sorting.length > 0) {
    const sortInfo = sorting[0]
    let sortEntities = sortByTaskType(taskMap, sortInfo)
    if (sortInfo.type === 'metadata') sortEntities = sortByMetadata(sortInfo)
    result = result.sort(
      firstBy('canceled')
        .thenBy(sortEntities)
        .thenBy(sortByEpisode)
        .thenBy((a, b) => a.sequence_name.localeCompare(b.sequence_name))
        .thenBy((a, b) => a.name.localeCompare(b.name))
    )
  } else {
    result = sortShots(result)
  }
  return result
}

export const sortEditResult = (
  result,
  sorting,
  taskTypeMap,
  taskMap
) => {
  if (sorting && sorting.length > 0) {
    const sortInfo = sorting[0]
    let sortEntities = sortByTaskType(taskMap, sortInfo)
    if (sortInfo.type === 'metadata') sortEntities = sortByMetadata(sortInfo)
    result = result.sort(
      firstBy('canceled')
        .thenBy(sortEntities)
        .thenBy(sortByEpisode)
        .thenBy((a, b) => a.name.localeCompare(b.name))
    )
  } else {
    result = sortEdits(result)
  }
  return result
}

const sortByMetadata = (sortInfo) => (a, b) => {
  const dataA = a.data && a.data[sortInfo.column]
    ? a.data[sortInfo.column]
    : ''
  const dataB = b.data && b.data[sortInfo.column]
    ? b.data[sortInfo.column]
    : ''
  if (!dataA) return 1
  if (!dataB) return -1
  return dataA.localeCompare(dataB)
}

const sortByTaskType = (taskMap, sortInfo) => (a, b) => {
  const taskA = a.validations.get(sortInfo.column)
  const taskB = b.validations.get(sortInfo.column)
  if (!taskA) return -1
  if (!taskB) return 1
  const taskStatusA = taskMap.get(taskA).task_status_short_name
  const taskStatusB = taskMap.get(taskB).task_status_short_name
  return taskStatusA.localeCompare(taskStatusB)
}

const sortByEpisode = (a, b) => {
  if (a.episode_name) {
    return a.episode_name.localeCompare(b.episode_name)
  } else {
    return 0
  }
}
