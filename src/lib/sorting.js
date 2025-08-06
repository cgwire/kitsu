import { firstBy } from 'thenby'

import {
  getTaskStatusPriorityOfProd,
  getTaskTypePriorityOfProd
} from '@/lib/productions'

export const sortAssets = assets => {
  return assets.sort(
    firstBy('canceled')
      .thenBy((a, b) =>
        a.asset_type_name.localeCompare(b.asset_type_name, undefined, {
          numeric: true
        })
      )
      .thenBy('shared')
      .thenBy((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      )
  )
}

export const sortShots = shots => {
  return shots.sort(
    firstBy('canceled')
      .thenBy(sortByEpisode)
      .thenBy((a, b) =>
        a.sequence_name.localeCompare(b.sequence_name, undefined, {
          numeric: true
        })
      )
      .thenBy((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      )
  )
}

export const sortEdits = edits => {
  return edits.sort(
    firstBy('canceled')
      .thenBy(sortByEpisode)
      .thenBy((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      )
  )
}

export const sortSequences = sequences => {
  return sequences.sort(
    firstBy((a, b) => {
      if (a.episode_name) {
        return a.episode_name.localeCompare(b.episode_name, undefined, {
          numeric: true
        })
      }
      return 0
    }).thenBy((a, b) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true })
    })
  )
}

export const sortProductions = productions => {
  return productions.sort((a, b) => {
    if (a.project_status_name === b.project_status_name) {
      return a.name.localeCompare(b.name, undefined, { numeric: true })
    }
    return (
      -1 *
      a.project_status_name.localeCompare(b.project_status_name, undefined, {
        numeric: true
      })
    )
  })
}

export const sortTaskNames = (tasks, taskTypeMap) => {
  return tasks.sort(
    firstBy((a, b) => {
      const taskTypeA = taskTypeMap.get(a.task_type_id)
      const taskTypeB = taskTypeMap.get(b.task_type_id)
      return taskTypeA.name.localeCompare(taskTypeB.name, undefined, {
        numeric: true
      })
    }).thenBy((a, b) => {
      if (a.full_entity_name) {
        return a.full_entity_name.localeCompare(b.full_entity_name, undefined, {
          numeric: true
        })
      }
      return a.entity_name.localeCompare(b.entity_name, undefined, {
        numeric: true
      })
    })
  )
}
export const sortTasks = (tasks, taskTypeMap) => {
  return tasks.sort(
    firstBy('priority', -1)
      .thenBy((a, b) => {
        if (a.project_name) {
          return a.project_name.localeCompare(b.project_name, undefined, {
            numeric: true
          })
        }
        return 0
      })
      .thenBy((a, b) => {
        const taskTypeA = taskTypeMap.get(a.task_type_id)
        const taskTypeB = taskTypeMap.get(b.task_type_id)
        return taskTypeA.name.localeCompare(taskTypeB.name, undefined, {
          numeric: true
        })
      })
      .thenBy((a, b) => {
        if (a.full_entity_name) {
          return a.full_entity_name.localeCompare(
            b.full_entity_name,
            undefined,
            { numeric: true }
          )
        }
        return a.entity_name.localeCompare(b.entity_name, undefined, {
          numeric: true
        })
      })
  )
}

export const sortComments = comments => {
  return comments.sort(firstBy('pinned', -1).thenBy('created_at', -1))
}

export const sortRevisionPreviewFiles = previewFiles => {
  return previewFiles.sort(firstBy('position').thenBy('created_at'))
}

export const sortTaskStatuses = (taskStatuses, currentProduction) => {
  return taskStatuses.sort(
    firstBy((taskStatusA, taskStatusB) => {
      const taskStatusAPriority = getTaskStatusPriorityOfProd(
        taskStatusA,
        currentProduction
      )
      const taskStatusBPriority = getTaskStatusPriorityOfProd(
        taskStatusB,
        currentProduction
      )
      return taskStatusAPriority - taskStatusBPriority
    }).thenBy('name')
  )
}

export const sortTaskTypes = (taskTypes, currentProduction) => {
  return taskTypes.sort(
    firstBy('for_entity')
      .thenBy((taskTypeA, taskTypeB) => {
        const taskTypeAPriority = getTaskTypePriorityOfProd(
          taskTypeA,
          currentProduction
        )
        const taskTypeBPriority = getTaskTypePriorityOfProd(
          taskTypeB,
          currentProduction
        )
        return taskTypeAPriority - taskTypeBPriority
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
        taskTypeA,
        currentProduction
      )
      const taskTypeBPriority = getTaskTypePriorityOfProd(
        taskTypeB,
        currentProduction
      )
      return taskTypeAPriority - taskTypeBPriority
    })
    .thenBy('name')
  return items.sort(sortFunc)
}

export const sortPlaylists = playlists => {
  return playlists.sort(
    firstBy('created_at', -1).thenBy((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    )
  )
}

export const sortPeople = people => {
  return [...people].sort(
    firstBy('active', -1)
      .thenBy((a, b) =>
        a.first_name ? a.first_name.localeCompare(b.first_name) : -1
      )
      .thenBy((a, b) =>
        a.last_name ? a.last_name.localeCompare(b.last_name) : -1
      )
  )
}

export const sortByName = entries => {
  return entries.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })
  )
}

export const sortByValue = entries => {
  return entries.sort((a, b) =>
    a.value.localeCompare(b.value, undefined, { numeric: true })
  )
}

export const sortByDate = entries => {
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
      taskTypeA,
      currentProduction
    )
    const taskTypeBPriority = getTaskTypePriorityOfProd(
      taskTypeB,
      currentProduction
    )
    if (taskTypeAPriority === taskTypeBPriority) {
      return taskTypeA.name.localeCompare(taskTypeB.name, undefined, {
        numeric: true
      })
    } else if (taskTypeAPriority > taskTypeBPriority) {
      return 1
    }
    return -1
  })
}

export const sortAssetResult = (result, sorting, taskTypeMap, taskMap) => {
  if (sorting && sorting.length > 0) {
    const sortInfo = sorting[0]
    let sortEntities = []
    if (sortInfo.type === 'metadata') {
      sortEntities = sortByMetadata(sortInfo)
    } else {
      sortEntities = sortByTaskType(taskMap, sortInfo)
    }
    result = result.sort(
      firstBy('canceled')
        .thenBy(sortEntities)
        .thenBy((a, b) =>
          a.asset_type_name.localeCompare(b.asset_type_name, undefined, {
            numeric: true
          })
        )
        .thenBy((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        )
    )
  } else {
    result = sortAssets(result)
  }
  return result
}

export const sortShotResult = (result, sorting, taskTypeMap, taskMap) => {
  if (sorting && sorting.length > 0) {
    const sortInfo = sorting[0]
    let sortEntities = sortByTaskType(taskMap, sortInfo)
    if (sortInfo.type === 'metadata') sortEntities = sortByMetadata(sortInfo)
    result = result.sort(
      firstBy('canceled')
        .thenBy(sortEntities)
        .thenBy(sortByEpisode)
        .thenBy((a, b) =>
          a.sequence_name.localeCompare(b.sequence_name, undefined, {
            numeric: true
          })
        )
        .thenBy((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        )
    )
  } else {
    result = sortShots(result)
  }
  return result
}

export const sortSequenceResult = (result, sorting, taskTypeMap, taskMap) => {
  if (sorting && sorting.length > 0) {
    const sortInfo = sorting[0]
    let sortEntities = sortByTaskType(taskMap, sortInfo)
    if (sortInfo.type === 'metadata') sortEntities = sortByMetadata(sortInfo)
    result = result.sort(
      firstBy('canceled')
        .thenBy(sortEntities)
        .thenBy(sortByEpisode)
        .thenBy((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        )
    )
  } else {
    result = sortByName(result)
  }
  return result
}

export const sortEpisodeResult = (result, sorting, taskTypeMap, taskMap) => {
  if (sorting && sorting.length > 0) {
    const sortInfo = sorting[0]
    let sortEntities = sortByTaskType(taskMap, sortInfo)
    if (sortInfo.type === 'metadata') sortEntities = sortByMetadata(sortInfo)
    result = result.sort(
      firstBy('canceled')
        .thenBy(sortEntities)
        .thenBy((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        )
    )
  } else {
    result = sortByName(result)
  }
  return result
}

export const sortEditResult = (result, sorting, taskTypeMap, taskMap) => {
  if (sorting && sorting.length > 0) {
    const sortInfo = sorting[0]
    let sortEntities = sortByTaskType(taskMap, sortInfo)
    if (sortInfo.type === 'metadata') sortEntities = sortByMetadata(sortInfo)
    result = result.sort(
      firstBy('canceled')
        .thenBy(sortEntities)
        .thenBy(sortByEpisode)
        .thenBy((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        )
    )
  } else {
    result = sortEdits(result)
  }
  return result
}

const getMetadataValues = (sortInfo, a, b, defaultValue = '') => {
  let dataA = a.data?.[sortInfo.column] ?? defaultValue
  let dataB = b.data?.[sortInfo.column] ?? defaultValue

  if (typeof dataA === 'number') dataA = String(dataA)
  if (typeof dataB === 'number') dataB = String(dataB)

  return { dataA, dataB }
}

const sortByMetadata = sortInfo => {
  if (sortInfo.data_type === 'number') {
    return (a, b) => {
      const { dataA, dataB } = getMetadataValues(sortInfo, a, b)
      if (dataA === dataB) return 0
      if (dataB === '') return -1
      if (dataA === '') return 1
      return dataA.localeCompare(dataB, undefined, { numeric: true })
    }
  } else if (sortInfo.data_type === 'boolean') {
    return (a, b) => {
      const { dataA, dataB } = getMetadataValues(sortInfo, a, b, 'false')
      if (dataA === dataB) return 0
      return dataA === 'true' ? 1 : -1
    }
  } else if (sortInfo.data_type === 'checklist') {
    return (a, b) => {
      const { dataA, dataB } = getMetadataValues(sortInfo, a, b)
      if (dataA === dataB) return 0
      if (!dataB) return -1
      if (!dataA) return 1
      const checklistA = JSON.parse(dataA)
      const checklistB = JSON.parse(dataB)
      let resultA = 0
      let resultB = 0
      const length = Object.keys(checklistA).length
      Object.keys(checklistA).forEach((key, index) => {
        const points = length - index
        resultA += checklistA[key] ? points : 0
        resultB += checklistB[key] ? points : 0
      })
      return resultA <= resultB ? 1 : -1
    }
  } else if (sortInfo.data_type === 'taglist') {
    return (a, b) => {
      const { dataA, dataB } = getMetadataValues(sortInfo, a, b)
      if (dataA === dataB) return 0
      if (!dataB) return -1
      if (!dataA) return 1
      return dataA.localeCompare(dataB, undefined, { numeric: true })
    }
  } else {
    return (a, b) => {
      const { dataA, dataB } = getMetadataValues(sortInfo, a, b)
      if (dataA === dataB) return 0
      if (!dataB) return -1
      if (!dataA) return 1
      return dataA.localeCompare(dataB, undefined, { numeric: true })
    }
  }
}

const sortByTaskType = (taskMap, sortInfo) => (a, b) => {
  const taskA = a.validations.get(sortInfo.column)
  const taskB = b.validations.get(sortInfo.column)
  if (!taskA) return -1
  if (!taskB) return 1
  const taskStatusA = taskMap.get(taskA).task_status_short_name
  const taskStatusB = taskMap.get(taskB).task_status_short_name
  return taskStatusA.localeCompare(taskStatusB, undefined, { numeric: true })
}

const sortByEpisode = (a, b) => {
  if (a.episode_name) {
    return a.episode_name.localeCompare(b.episode_name, undefined, {
      numeric: true
    })
  }
  return 0
}
