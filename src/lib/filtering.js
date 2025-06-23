import {
  buildTaskTypeIndex,
  buildTaskStatusIndex,
  buildNameIndex,
  indexSearch
} from '@/lib/indexing'

const UNION_REGEX = /\+\(.*\)/
const EQUAL_REGEX =
  /\[([^[]*)\]=\[([^[]*)\]|([^ ]*)=\[([^[]*)\]|([^ ]*)=([^ ]*)|\[([^[]*)\]=([^ ]*)/g
const EQUAL_ASSET_TYPE_REGEX = /type=\[([^[]*)\]|type=([^ ]*)|type=([^ ]*)/g
const EQUAL_PEOPLE_DEPARTMENT_REGEX =
  /department=\[([^[]*)\]|department=([^ ]*)|department=([^ ]*)/g
const EQUAL_READY_FOR_REGEX =
  /readyfor=\[([^[]*)\]|readyfor=([^ ]*)|readyfor=([^ ]*)/g
const EQUAL_PRIORITY_REGEX = /priority-\[([^[]*)\]=\d|priority-([^ ]*)=\d/g
const EQUAL_ASSETS_READY_REGEX =
  /assetsready=\[([^[]*)\]|assetsready=([^ ]*)|assetsready=([^ ]*)/g
const MULTIPLE_REGEX = /\[([^[]*)\]/g
const EQUAL_ASSIGNATION_REGEX = /assignedto\[([^[]*)\]=\[([^[]*)\]/g

/*
 * Look in the search query for task type filter like anim=wip.
 * Then apply filters found on result list.
 */
export const applyFilters = (entries, filters, taskMap) => {
  if (filters && filters.length > 0) {
    const result = entries.filter(entry => {
      let isOk = null
      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i]
        if (isOk === false && !filters.union) break
        if (isOk === true && filters.union) break
        isOk =
          applyFiltersFunctions[filter.type](entry, filter, taskMap) || false
      }
      return isOk
    })
    return result
  } else {
    return entries
  }
}

/*
 * Private function for filtering on names
 * Simple hash to compare user name
 * It removes spaces and lowercases the name
 */
const hashName = name => {
  return name.toLowerCase().replace(/ /g, '')
}

const applyFiltersFunctions = {
  assettype(entry, filter, taskMap) {
    let isOk = true
    isOk = filter.assetType && entry.asset_type_id === filter.assetType.id
    if (filter.excluding) isOk = !isOk
    return isOk
  },

  assignation(entry, filter, taskMap) {
    const task = taskMap.get(entry.validations.get(filter.taskType.id))
    if (filter.assigned) {
      return task && task.assignees && task.assignees.length > 0
    } else {
      return !task || (task && task.assignees && task.assignees.length === 0)
    }
  },

  assignedto(entry, filter, taskMap) {
    let isOk = false
    if (filter.taskType) {
      const taskId = entry.validations.get(filter.taskType.id)
      const task = taskMap.get(taskId)
      filter.personIds.forEach(personId => {
        isOk = task?.assignees.includes(personId) || isOk
      })
    } else {
      isOk =
        entry.tasks?.some(taskId => {
          const task = taskMap.get(taskId)
          return task?.assignees.includes(filter.personId)
        }) ?? false
    }
    return filter.excluding ? !isOk : isOk
  },

  descriptor(entry, filter, taskMap) {
    let isOk = false
    let dataValue = entry.data?.[filter.descriptor.field_name]
    if ((dataValue || dataValue === 0) && filter.values) {
      if (typeof dataValue === 'string') dataValue = dataValue.toLowerCase()

      // Checklist case
      if (
        filter.values.length === 1 &&
        filter.values[0].match(new RegExp('(:true)|(:false)$'))
      ) {
        const isTrue = Boolean(filter.values[0].match(new RegExp(':true$')))
        let value = filter.values[0].replace(
          new RegExp('(:true)|(:false)$'),
          ''
        )
        value = value.toLowerCase()
        try {
          dataValue = JSON.parse(dataValue)
          isOk =
            (dataValue[value] === undefined && !isTrue) ||
            dataValue[value] === isTrue
        } catch {
          isOk = false
        }

        // Number case
      } else if (filter.descriptor.data_type === 'number') {
        try {
          dataValue = parseFloat(dataValue)
          filter.values.forEach(value => {
            const val = parseFloat(value)
            isOk = isOk || dataValue === val
          })
        } catch {
          isOk = false
        }

        // String case
      } else {
        filter.values.forEach(value => {
          dataValue = `${dataValue}`
          isOk = isOk || dataValue.includes(value.toLowerCase())
        })
      }
    } else {
      isOk = false
    }
    if (filter.excluding) isOk = !isOk
    return isOk
  },

  exclusion(entry, filter, taskMap) {
    return !filter.excludedIds[entry.id]
  },

  taskunion(entry, filter, taskMap) {
    return filter.unionIds.get(entry.id)
  },

  status(entry, filter, taskMap) {
    const task = taskMap.get(entry.validations.get(filter.taskType.id))
    let isOk = true
    isOk = task && filter.taskStatuses.includes(task.task_status_id)
    isOk = isOk || false
    if (filter.excluding) isOk = !isOk
    return isOk
  },

  thumbnail(entry, filter, taskMap) {
    const hasAvatar =
      entry.preview_file_id !== '' &&
      entry.preview_file_id !== undefined &&
      entry.preview_file_id !== null
    return filter.excluding ? !hasAvatar : hasAvatar
  },

  department(entry, filter, taskMap) {
    if (!entry.departments) return false
    let hasDepartment = false
    filter.values.forEach(value => {
      hasDepartment =
        hasDepartment || entry.departments.indexOf(value.id) !== -1
    })
    return filter.excluding ? !hasDepartment : hasDepartment
  },

  priority(entry, filter, taskMap) {
    const task = taskMap.get(entry.validations.get(filter.taskTypeId))
    return task && task.priority === filter.value
  },

  readyfor(entry, filter, taskMap) {
    return entry.ready_for === filter.value
  },

  assetsready(entry, filter, taskMap) {
    if (entry.nb_entities_out <= 0) {
      return filter.excluding
    }
    const isOk =
      entry.tasks?.some(taskId => {
        const task = taskMap.get(taskId)
        return (
          task &&
          task.task_type_id === filter.value &&
          entry.nb_entities_out === task.nb_assets_ready
        )
      }) ?? false
    return filter.excluding ? !isOk : isOk
  }
}

/**
 * Extract keywords from a given text. Remove equality and exclusion
 * expressions.
 * Replace spaces inside quotes with '\u00A0' to allow searching for names containing spaces
 *    (e.g., "my sequence" becomes "my\u00A0sequence")
 * The '\u00A0' will be removed after splitting on spaces
 */
export const getKeyWords = queryText => {
  if (!queryText) {
    return []
  } else {
    queryText = queryText.trim()
    queryText = queryText.replace(/"([^"]*)"/g, (match, p1) => {
      return '"' + p1.replace(/ /g, '\u00A0') + '"'
    })

    return queryText
      .replace(UNION_REGEX, '')
      .replace(EQUAL_PRIORITY_REGEX, '')
      .replace(EQUAL_ASSIGNATION_REGEX, '')
      .replace(EQUAL_REGEX, '')
      .replace(MULTIPLE_REGEX, '')
      .split(' ')
      .map(query => query.replace(/\u00A0/g, ' '))
      .map(query => {
        if (query[0] === '"') {
          query = query.substring(1)
        }
        if (query[query.length - 1] === '"') {
          query = query.substring(0, query.length - 1)
        }
        return query.trim()
      })
      .filter(query => {
        return query.length > 0 && query[0] !== '-' && query !== 'withthumbnail'
      })
  }
}

/**
 * Extract multiple keywords from a given text. Remove equality and exclusion
 * expressions.
 */
export const getMultipleKeyWords = queryText => {
  if (!queryText) {
    return []
  } else {
    const rgxMatches = queryText.match(MULTIPLE_REGEX)
    if (rgxMatches) {
      let keywords = []
      rgxMatches.forEach(rgxMatch => {
        rgxMatch = cleanParenthesis(rgxMatch)
        keywords = keywords.concat(rgxMatch.split(','))
      })
      return keywords
    } else {
      return []
    }
  }
}

/**
 * Extract excluding keywords from a given text. Remove equality expresions
 * and tradition keywords.
 */
export const getExcludingKeyWords = queryText => {
  return queryText
    .replace(UNION_REGEX, '')
    .replace(EQUAL_REGEX, '')
    .split(' ')
    .filter(keyword => {
      return (
        keyword.length > 0 && keyword[0] === '-' && keyword !== '-withthumbnail'
      )
    })
    .map(keyword => keyword.substring(1))
}

/*
 * Build all filters data struct generated by a query and return them as
 * an array. It includes:
 * * status filters
 * * assignation filters
 * * exclusion filters
 */
export const getFilters = ({
  entryIndex,
  assetTypes = [],
  taskTypes = [],
  taskStatuses = [],
  descriptors = [],
  departments = [],
  persons,
  query
}) => {
  const unionExtraction = getUnion(query)
  query = unionExtraction.query
  const filters = [
    ...getAssetTypeFilters(assetTypes, query),
    ...getTaskTypeFilters(taskTypes, taskStatuses, query),
    ...getDescFilters(descriptors, taskTypes, query),
    ...getAssignedToFilters(persons, taskTypes, query),
    ...getDepartmentFilters(departments, query),
    ...(getThumbnailFilters(query) || []),
    ...getPriorityFilter(taskTypes, query),
    ...getReadyForFilter(taskTypes, query),
    ...getAssetsReadyFilter(taskTypes, query),
    ...getExcludingFilters(entryIndex, query)
  ]
  filters.union = unionExtraction.union
  return filters
}

const getUnion = (query = '') => {
  const rgxMatches = query.match(UNION_REGEX)
  let union = false
  if (rgxMatches) {
    union = true
    query = rgxMatches[0].substring(2, rgxMatches[0].length - 1)
  }
  return {
    query,
    union
  }
}

/*
 *  Extract filters excluding entities based on their name.
 */
const getExcludingFilters = (entryIndex, query) => {
  const filters = []
  const excludingKeywords = getExcludingKeyWords(query) || []
  excludingKeywords.forEach(keyword => {
    const excludedMap = {}
    const excludedEntries = indexSearch(entryIndex, [keyword]) || []
    excludedEntries.forEach(entry => {
      excludedMap[entry.id] = true
    })
    filters.push({
      type: 'exclusion',
      excludedIds: excludedMap
    })
  })
  return filters
}

/*
 *  Extract filters from a query dedicated to task list.
 */
export const getTaskFilters = (entryIndex, query) => {
  const filters = []
  const multipleKeywords = getMultipleKeyWords(query) || []
  const excludingKeywords = getExcludingKeyWords(query) || []
  excludingKeywords.forEach(keyword => {
    const excludedMap = {}
    const excludedEntries = indexSearch(entryIndex, [keyword]) || []
    excludedEntries.forEach(entry => {
      excludedMap[entry.id] = true
    })
    filters.push({
      type: 'exclusion',
      excludedIds: excludedMap
    })
  })
  const unionMap = new Map()
  multipleKeywords.forEach(keyword => {
    const unionEntries = indexSearch(entryIndex, [keyword]) || []
    unionEntries.forEach(entry => {
      unionMap.set(entry.id, true)
    })
  })
  if (unionMap.size > 0) {
    filters.push({
      type: 'taskunion',
      unionIds: unionMap
    })
  }
  return filters
}

const cleanParenthesis = value => {
  if (value[0] === '[') {
    return value.substring(1, value.length - 1)
  } else {
    return value
  }
}

/*
 * Extract asset type filters (like type=characters from given query.
 */
export const getAssetTypeFilters = (assetTypes, queryText) => {
  if (!queryText) return []

  const results = []
  const rgxMatches = queryText.match(EQUAL_ASSET_TYPE_REGEX)

  if (rgxMatches) {
    rgxMatches.forEach(rgxMatch => {
      const pattern = rgxMatch.split('=')
      let value = cleanParenthesis(pattern[1])
      const excluding = value.startsWith('-')
      if (excluding) value = value.substring(1)
      const assetType = assetTypes.find(t => t.name === value)
      results.push({
        assetType,
        excluding,
        type: 'assettype'
      })
    })
  }
  return results
}
/*
 * Extract task type filters (like anim=wip or [mode facial]=wip) from given
 * query.
 */
export const getTaskTypeFilters = (taskTypes, taskStatuses, queryText) => {
  if (!queryText) return []

  const results = []
  const rgxMatches = queryText.match(EQUAL_REGEX)

  if (rgxMatches) {
    const taskTypeNameIndex = buildTaskTypeIndex(taskTypes)
    const taskStatusShortNameIndex = buildTaskStatusIndex(taskStatuses)
    rgxMatches.forEach(rgxMatch => {
      const pattern = rgxMatch.split('=')
      let value = cleanParenthesis(pattern[1])
      const excluding = value.startsWith('-')
      if (excluding) value = value.substring(1)
      const taskTypeName = cleanParenthesis(pattern[0])
      const taskTypes = taskTypeNameIndex[taskTypeName.toLowerCase()]
      if (taskTypes) {
        if (value === 'unassigned') {
          results.push({
            taskType: taskTypes[0],
            assigned: false,
            type: 'assignation'
          })
        } else if (value === 'assigned') {
          results.push({
            taskType: taskTypes[0],
            assigned: true,
            type: 'assignation'
          })
        } else if (value) {
          const values = value
            .split(',')
            .map(shortName => shortName.toLowerCase())
            .filter(shortName => taskStatusShortNameIndex[shortName])
            .map(shortName => taskStatusShortNameIndex[shortName].id)
          if (values.length > 0) {
            results.push({
              taskType: taskTypes[0],
              taskStatuses: values,
              type: 'status',
              excluding
            })
          }
        }
      }
    })
  }
  return results
}

/*
 * Extract metadata filters (like size=big or size=small) from given
 * query.
 */
export const getDescFilters = (descriptors, taskTypes, queryText) => {
  if (!queryText) return []

  const results = []
  const rgxMatches = queryText.match(EQUAL_REGEX)

  if (rgxMatches) {
    const descriptorNameIndex = buildNameIndex(descriptors, false)
    rgxMatches.forEach(rgxMatch => {
      const pattern = rgxMatch.split('=')
      const descriptorName = cleanParenthesis(pattern[0])
      if (
        descriptorName === 'type' ||
        descriptorName === 'department' ||
        taskTypes.find(
          t => t.name.toLowerCase() === descriptorName.toLowerCase()
        )
      ) {
        return
      }

      const matchedDescriptors =
        descriptorNameIndex[descriptorName.toLowerCase()]
      let value = cleanParenthesis(pattern[1])
      const excluding = value.startsWith('-')
      if (excluding) value = value.substring(1)
      const values = value.split(',')
      if (matchedDescriptors) {
        results.push({
          descriptor: matchedDescriptors[0],
          values,
          type: 'descriptor',
          excluding
        })
      }
    })
  }
  return results
}

/*
 * Extract department filters (like department=Modeling) from given
 * query.
 */
export const getDepartmentFilters = (departments, queryText) => {
  if (!queryText) return []

  const results = []
  const rgxMatches = queryText.match(EQUAL_PEOPLE_DEPARTMENT_REGEX)

  if (rgxMatches) {
    const departmentNameIndex = buildNameIndex(departments, false)

    rgxMatches.forEach(rgxMatch => {
      const pattern = rgxMatch.split('=')
      let departmentName = cleanParenthesis(pattern[1])
      const excluding = departmentName.startsWith('-')
      if (excluding) departmentName = departmentName.substring(1)
      const departmentNames = departmentName.split(',')

      const departments = departmentNames
        .map(departmentName => {
          const department = departmentNameIndex[departmentName.toLowerCase()]
          if (department) return department[0]
          else return null
        })
        .filter(department => department !== null)

      if (departments.length > 0) {
        results.push({
          values: departments,
          type: 'department',
          excluding
        })
      }
    })
  }
  return results
}

/*
 * Extract person filters (like size=big or size=small) from given
 * query.
 */
export const getAssignedToFilters = (persons, taskTypes, queryText) => {
  if (!queryText) return []

  // create a deep copy of persons with slugified names to avoid reference issues
  const shallowPersons = persons.map(person => ({
    ...JSON.parse(JSON.stringify(person)),
    name: hashName(person.name)
  }))

  const results = []
  const rgxMatches = queryText.match(EQUAL_ASSIGNATION_REGEX)
  if (rgxMatches) {
    const taskTypeNameIndex = buildTaskTypeIndex(taskTypes)
    const personIndex = {}
    shallowPersons.forEach(person => {
      if (!personIndex[person.name]) {
        personIndex[person.name] = []
      }
      personIndex[person.name].push(person.id)
    })

    rgxMatches.forEach(rgxMatch => {
      const pattern = rgxMatch.split('=')
      let taskTypeName = pattern[0].substring('assignedto'.length)
      taskTypeName = cleanParenthesis(taskTypeName)
      const taskType = taskTypeName
        ? taskTypeNameIndex[taskTypeName.toLowerCase()]?.[0]
        : null
      let value = pattern[1]
      value = cleanParenthesis(value)
      const excluding = value.startsWith('-')
      if (excluding) value = value.substring(1)
      const simplifiedValue = hashName(value)

      if (personIndex[simplifiedValue]) {
        results.push({
          personIds: personIndex[simplifiedValue],
          taskType,
          value,
          type: 'assignedto',
          excluding
        })
      }
    })
  }
  return results
}

export const getThumbnailFilters = queryText => {
  const results = []
  if (queryText.indexOf('-withthumbnail') > -1) {
    results.push({
      type: 'thumbnail',
      excluding: true
    })
  } else if (queryText.indexOf('withthumbnail') > -1) {
    results.push({
      type: 'thumbnail',
      excluding: false
    })
  }
  return results
}

export const getPriorityFilter = (taskTypes, queryText) => {
  if (!queryText) return []

  const results = []
  const rgxMatches = queryText.match(EQUAL_PRIORITY_REGEX)

  if (rgxMatches) {
    const taskTypeNameIndex = buildTaskTypeIndex(taskTypes)
    rgxMatches.forEach(rgxMatch => {
      const pattern = rgxMatch.split('=')
      const taskTypeName = cleanParenthesis(pattern[0].substring(9))
      const value = cleanParenthesis(pattern[1])
      const taskTypes = taskTypeNameIndex[taskTypeName.toLowerCase()]
      if (taskTypes && taskTypes.length > 0) {
        results.push({
          taskTypeId: taskTypes[0].id,
          value: parseInt(value),
          type: 'priority'
        })
      }
    })
  }
  return results
}

export const getReadyForFilter = (taskTypes, queryText) => {
  if (!queryText) return []

  const results = []
  const rgxMatches = queryText.match(EQUAL_READY_FOR_REGEX)

  if (rgxMatches) {
    const taskTypeNameIndex = buildTaskTypeIndex(taskTypes)
    rgxMatches.forEach(rgxMatch => {
      const pattern = rgxMatch.split('=')
      const taskTypeName = cleanParenthesis(pattern[1])
      const taskTypes = taskTypeNameIndex[taskTypeName.toLowerCase()]
      if (taskTypes && taskTypes.length > 0) {
        results.push({
          value: taskTypes[0].id,
          type: 'readyfor'
        })
      }
    })
  }
  return results
}

export const getAssetsReadyFilter = (taskTypes, queryText) => {
  if (!queryText) return []

  const results = []
  const rgxMatches = queryText.match(EQUAL_ASSETS_READY_REGEX)

  if (rgxMatches) {
    const taskTypeNameIndex = buildTaskTypeIndex(taskTypes)

    rgxMatches.forEach(rgxMatch => {
      const pattern = rgxMatch.split('=')
      let taskTypeName = cleanParenthesis(pattern[1])
      const excluding = taskTypeName.startsWith('-')
      if (excluding) taskTypeName = taskTypeName.substring(1)
      const taskTypes = taskTypeNameIndex[taskTypeName.toLowerCase()]
      if (taskTypes && taskTypes.length > 0) {
        results.push({
          value: taskTypes[0].id,
          type: 'assetsready',
          excluding
        })
      }
    })
  }
  return results
}
