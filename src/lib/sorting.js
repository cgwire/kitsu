import { firstBy } from 'thenby'

import {
  getTaskStatusPriorityOfProd,
  getTaskTypePriorityOfProd
} from '@/lib/productions'

const sortByEpisode = (a, b) => {
  if (a.episode_name) {
    return a.episode_name.localeCompare(b.episode_name, undefined, {
      numeric: true
    })
  }
  return 0
}

const assetComparator = firstBy('canceled')
  .thenBy((a, b) =>
    a.asset_type_name.localeCompare(b.asset_type_name, undefined, {
      numeric: true
    })
  )
  .thenBy('shared')
  .thenBy((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

export const sortAssets = assets => {
  return assets.sort(assetComparator)
}

const shotComparator = firstBy('canceled')
  .thenBy(sortByEpisode)
  .thenBy((a, b) =>
    a.sequence_name.localeCompare(b.sequence_name, undefined, {
      numeric: true
    })
  )
  .thenBy((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

export const sortShots = shots => {
  return shots.sort(shotComparator)
}

// Insert one entity into an already-sorted list (binary search) instead of
// re-sorting the whole array on every unit add.
const insertSorted = (items, item, comparator) => {
  let low = 0
  let high = items.length
  while (low < high) {
    const middle = (low + high) >> 1
    if (comparator(items[middle], item) <= 0) {
      low = middle + 1
    } else {
      high = middle
    }
  }
  items.splice(low, 0, item)
  return items
}

export const insertSortedAsset = (assets, asset) =>
  insertSorted(assets, asset, assetComparator)

export const insertSortedShot = (shots, shot) =>
  insertSorted(shots, shot, shotComparator)

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
  const priorityCache = new Map()
  for (const item of items) {
    if (!priorityCache.has(item.task_type_id)) {
      const taskType = taskTypeMap.get(item.task_type_id)
      priorityCache.set(
        item.task_type_id,
        getTaskTypePriorityOfProd(taskType, currentProduction)
      )
    }
  }
  const sortFunc = firstBy('for_entity')
    .thenBy((itemA, itemB) => {
      return (
        priorityCache.get(itemA.task_type_id) -
        priorityCache.get(itemB.task_type_id)
      )
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
      .thenBy((a, b) => (a.first_name || '').localeCompare(b.first_name || ''))
      .thenBy((a, b) => (a.last_name || '').localeCompare(b.last_name || ''))
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
  const priorityCache = new Map()
  for (const id of columns) {
    if (!priorityCache.has(id)) {
      priorityCache.set(
        id,
        getTaskTypePriorityOfProd(taskTypeMap.get(id), currentProduction)
      )
    }
  }
  return columns.sort((a, b) => {
    const taskTypeAPriority = priorityCache.get(a)
    const taskTypeBPriority = priorityCache.get(b)
    if (taskTypeAPriority === taskTypeBPriority) {
      const taskTypeA = taskTypeMap.get(a)
      const taskTypeB = taskTypeMap.get(b)
      return taskTypeA.name.localeCompare(taskTypeB.name, undefined, {
        numeric: true
      })
    } else if (taskTypeAPriority > taskTypeBPriority) {
      return 1
    }
    return -1
  })
}

const compareByName = (a, b) =>
  a.name.localeCompare(b.name, undefined, { numeric: true })

const NUMERIC_FIELDS = new Set(['estimation', 'timeSpent'])

const getFieldValue = (entry, sortInfo, taskTypeMap, episodeMap) => {
  const value = entry[sortInfo.column]
  if (sortInfo.column === 'episode_id') {
    return episodeMap.get(value)?.name || ''
  }
  if (sortInfo.column === 'ready_for') {
    return taskTypeMap.get(value)?.name || ''
  }
  if (sortInfo.column === 'resolution') {
    return entry.data?.resolution || ''
  }
  return value || ''
}

const sortByField = (sortInfo, taskTypeMap, episodeMap) => (a, b) => {
  const dataA = getFieldValue(a, sortInfo, taskTypeMap, episodeMap)
  const dataB = getFieldValue(b, sortInfo, taskTypeMap, episodeMap)
  if (dataA === dataB) return 0
  if (NUMERIC_FIELDS.has(sortInfo.column)) return dataA - dataB
  if (!dataB) return -1
  if (!dataA) return 1
  return String(dataA).localeCompare(String(dataB), undefined, {
    numeric: true
  })
}

const sortEntityResult = (
  result,
  sorting,
  taskTypeMap,
  episodeMap,
  taskMap,
  thenBySteps,
  defaultSort
) => {
  if (sorting && sorting.length > 0) {
    const sortInfo = sorting[0]
    const sortEntities =
      sortInfo.type === 'metadata'
        ? sortByMetadata(sortInfo)
        : sortInfo.type === 'field'
          ? sortByField(sortInfo, taskTypeMap, episodeMap)
          : sortByTaskType(taskMap, sortInfo)
    // ponytail: descending reverses the whole comparator, so empty values
    // land first instead of last. Special-case empties per direction if that
    // ordering matters.
    const direction = sortInfo.ascending === false ? -1 : 1
    let sorter = firstBy('canceled').thenBy(sortEntities, direction)
    for (const step of thenBySteps) {
      sorter = sorter.thenBy(step)
    }
    result = result.sort(sorter)
  } else {
    result = defaultSort(result)
  }
  return result
}

export const sortAssetResult = (
  result,
  sorting,
  taskTypeMap,
  taskMap,
  episodeMap
) => {
  return sortEntityResult(
    result,
    sorting,
    taskTypeMap,
    episodeMap,
    taskMap,
    [
      (a, b) =>
        a.asset_type_name.localeCompare(b.asset_type_name, undefined, {
          numeric: true
        }),
      compareByName
    ],
    sortAssets
  )
}

export const sortShotResult = (result, sorting, taskTypeMap, taskMap) => {
  return sortEntityResult(
    result,
    sorting,
    taskTypeMap,
    new Map(),
    taskMap,
    [
      sortByEpisode,
      (a, b) =>
        a.sequence_name.localeCompare(b.sequence_name, undefined, {
          numeric: true
        }),
      compareByName
    ],
    sortShots
  )
}

export const sortSequenceResult = (result, sorting, taskTypeMap, taskMap) => {
  return sortEntityResult(
    result,
    sorting,
    taskTypeMap,
    new Map(),
    taskMap,
    [sortByEpisode, compareByName],
    sortByName
  )
}

export const sortEpisodeResult = (result, sorting, taskTypeMap, taskMap) => {
  return sortEntityResult(
    result,
    sorting,
    taskTypeMap,
    new Map(),
    taskMap,
    [compareByName],
    sortByName
  )
}

export const sortEditResult = (result, sorting, taskTypeMap, taskMap) => {
  return sortEntityResult(
    result,
    sorting,
    taskTypeMap,
    new Map(),
    taskMap,
    [sortByEpisode, compareByName],
    sortEdits
  )
}

const getMetadataValues = (sortInfo, a, b, defaultValue = '') => {
  let dataA = a.data?.[sortInfo.column] ?? defaultValue
  let dataB = b.data?.[sortInfo.column] ?? defaultValue

  if (typeof dataA === 'number') dataA = String(dataA)
  if (typeof dataB === 'number') dataB = String(dataB)

  return { dataA, dataB }
}

export const sortByMetadata = sortInfo => {
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
      let checklistA, checklistB
      try {
        checklistA = JSON.parse(dataA)
        checklistB = JSON.parse(dataB)
      } catch {
        // Malformed checklist metadata must not break the whole sort.
        return 0
      }
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
  const taskStatusA = taskMap.get(taskA)?.task_status_short_name || ''
  const taskStatusB = taskMap.get(taskB)?.task_status_short_name || ''
  return taskStatusA.localeCompare(taskStatusB, undefined, { numeric: true })
}
