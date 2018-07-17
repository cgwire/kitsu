/*
 * Look in the search query for task type filter like anim=wip.
 * Then apply filters found on result list.
 */
export const applyFilters = (taskTypes, result, query) => {
  const taskTypeIndex = buildIndex(taskTypes)
  const filter = findFilter(taskTypeIndex, query)

  if (filter.taskType) {
    result = result.filter((entry) => {
      const task = entry.validations[filter.taskType]
      return task && task.task_status_short_name === filter.taskStatus
    })
  }
  return result
}

/*
 * Extract task type filters (like anim=wip or [mode facial]=wip) from given
 * query.
 */
export const findFilter = (taskTypeNameIndex, query) => {
  let result = {}
  const regex = /([^ ]*)=([^ ]*)|\[(.*)\]=([^ ]*)/
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
export const extractTaskTypes = (result) => {
  if (result.length > 0) {
    return Object.keys(result[0].validations)
  } else {
    return []
  }
}

/*
 * For given list of names, build an index that return names as result
 * of a query that matches the beginning of this string.
 */
export const buildIndex = (names) => {
  const index = {}
  names.forEach((name) => {
    let currentString = ''
    for (let character of name) {
      currentString += character.toLowerCase()
      if (index[currentString] === undefined) index[currentString] = []
      index[currentString].push(name)
    }
  })
  return index
}
