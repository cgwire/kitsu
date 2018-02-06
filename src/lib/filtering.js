export const applyFilters = (taskTypes, result, query) => {
  const taskTypeIndex = buildNameIndex(taskTypes)
  const filter = findFilter(taskTypeIndex, query)

  if (filter.taskType) {
    result = result.filter((entry) => {
      const task = entry.validations[filter.taskType]
      return task && task.task_status_short_name === filter.taskStatus
    })
  }
  return result
}

export const findFilter = (taskTypeIndex, query) => {
  let result = {}
  const words = query.split(' ')
  for (const word of words) {
    const filter = word.split(':')
    if (filter.length === 2) {
      if (taskTypeIndex[filter[0].toLowerCase()]) {
        result = {
          taskType: taskTypeIndex[filter[0]],
          taskStatus: filter[1]
        }
      }
    }
  }
  return result
}

export const extractTaskTypes = (result) => {
  if (result.length > 0) {
    return Object.keys(result[0].validations)
  } else {
    return []
  }
}

export const buildNameIndex = (names) => {
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
