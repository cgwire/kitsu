/*
 * Look in the search query for task type filter like anim=wip.
 * Then apply filters found on result list.
 */
export const applyFilters = (
  taskTypes, result, query, taskStatusMap, taskMap
) => {
  const taskTypeIndex = buildIndex(taskTypes)
  const filter = findFilter(taskTypeIndex, query)
  if (filter.taskType) {
    return result.filter((entry) => {
      let task = null
      if (entry.validations[filter.taskType]) {
        task = taskMap[entry.validations[filter.taskType]]
      }
      return task &&
        taskStatusMap[task.task_status_id].short_name === filter.taskStatus
    })
  } else {
    return result
  }
}

/*
 * Extract task type filters (like anim=wip or [mode facial]=wip) from given
 * query.
 */
export const findFilter = (taskTypeNameIndex, query) => {
  const regex = /([^ ]*)=([^ ]*)|\[(.*)\]=([^ ]*)/
  let result = {}
  let rgxMatch = query.match(regex)

  if (rgxMatch && rgxMatch[0]) {
    const pattern = rgxMatch[0][0]
    const taskType = pattern[0] === '[' ? rgxMatch[3] : rgxMatch[1]
    const taskStatus = pattern[0] === '[' ? rgxMatch[4] : rgxMatch[2]

    if (taskTypeNameIndex[taskType.toLowerCase()]) {
      result = {
        taskType: taskTypeNameIndex[taskType.toLowerCase()][0],
        taskStatus: taskStatus
      }
    }
  }
  return result
}

/*
 * Extract available task types from given result of an entity and task
 * list.
 */
export const extractTaskTypes = (result, taskTypeMap) => {
  if (result.length > 0) {
    return Object.keys(result[0].validations).map((taskTypeId) => {
      return taskTypeMap[taskTypeId]
    })
  } else {
    return []
  }
}

/*
 * For given list of names, build an index that return names as result
 * of a query that matches the beginning of this string.
 */
export const buildIndex = (taskTypes) => {
  const index = {}
  taskTypes.forEach((taskType) => {
    let currentString = ''
    for (let character of taskType.name) {
      currentString += character.toLowerCase()
      if (index[currentString] === undefined) index[currentString] = []
      index[currentString].push(taskType.id)
    }
  })
  return index
}
