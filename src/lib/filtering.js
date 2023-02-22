import {
  buildTaskTypeIndex,
  buildTaskStatusIndex,
  buildNameIndex,
  indexSearch
} from '@/lib/indexing'
import string from '@/lib/string'

const UNION_REGEX = /\+\(.*\)/
const EQUAL_REGEX = /\[([^[]*)\]=\[([^[]*)\]|([^ ]*)=\[([^[]*)\]|([^ ]*)=([^ ]*)|\[([^[]*)\]=([^ ]*)/g
const EQUAL_ASSET_TYPE_REGEX = /type=\[([^[]*)\]|type=([^ ]*)|type=([^ ]*)/g
const EQUAL_PEOPLE_DEPARTMENT_REGEX = /department=\[([^[]*)\]|department=([^ ]*)|department=([^ ]*)/g
const EQUAL_ASSETS_READY_REGEX = /assetsready=\[([^[]*)\]|assetsready=([^ ]*)|assetsready=([^ ]*)/g
const MULTIPLE_REGEX = /\[([^[]*)\]/g

/*
 * Look in the search query for task type filter like anim=wip.
 * Then apply filters found on result list.
 */
export const applyFilters = (entries, filters, taskMap) => {
  if (filters && filters.length > 0) {
    const result = entries.filter((entry) => {
      let isOk = null
      filters.forEach((filter) => {
        if (isOk === false && !filters.union) return false
        if (isOk === true && filters.union) return true
        isOk = applyFiltersFunctions[filter.type](entry, filter, taskMap)
      })
      return isOk
    })
    return result
  } else {
    return entries
  }
}

const applyFiltersFunctions = {
  assettype (entry, filter, taskMap) {
    let isOk = true
    isOk = filter.assetType && entry.asset_type_id === filter.assetType.id
    if (filter.excluding) isOk = !isOk
    return isOk
  },

  assignation (entry, filter, taskMap) {
    const task = taskMap.get(entry.validations.get(filter.taskType.id))
    if (filter.assigned) {
      return task && task.assignees && task.assignees.length > 0
    } else {
      return !task ||
        (task && task.assignees && task.assignees.length === 0)
    }
  },

  assignedto (entry, filter, taskMap) {
    let isOk = false
    if (entry.tasks) {
      entry.tasks.forEach(taskId => {
        const task = taskMap.get(taskId)
        isOk = isOk || task.assignees.includes(filter.personId)
      })
    }
    if (filter.excluding) isOk = !isOk
    return isOk
  },

  descriptor (entry, filter, taskMap) {
    let isOk = false
    if (
      entry.data &&
      entry.data[filter.descriptor.field_name] &&
      filter.values
    ) {
      let dataValue = entry.data[filter.descriptor.field_name]
      dataValue = dataValue.toLowerCase()
      if (filter.values.length === 1 && filter.values[0].match(new RegExp('(:true)|(:false)$'))) {
        const isTrue = Boolean(filter.values[0].match(new RegExp(':true$')))
        let value = filter.values[0].replace(new RegExp('(:true)|(:false)$'), '')
        value = value.toLowerCase()
        try {
          dataValue = JSON.parse(dataValue)
          isOk = isOk || ((dataValue[value] === undefined && !isTrue) || (dataValue[value] === isTrue))
        } catch {
          isOk = false
        }
      } else {
        filter.values.forEach(value => {
          isOk = isOk || dataValue.indexOf(value.toLowerCase()) >= 0
        })
      }
    } else {
      isOk = false
    }
    if (filter.excluding) isOk = !isOk
    return isOk
  },

  exclusion (entry, filter, taskMap) {
    return !filter.excludedIds[entry.id]
  },

  taskunion (entry, filter, taskMap) {
    return filter.unionIds.get(entry.id)
  },

  status (entry, filter, taskMap) {
    const task = taskMap.get(entry.validations.get(filter.taskType.id))
    let isOk = true
    isOk = task && filter.taskStatuses.includes(task.task_status_id)
    if (filter.excluding) isOk = !isOk
    return isOk
  },

  thumbnail (entry, filter, taskMap) {
    const hasAvatar =
      entry.preview_file_id !== '' &&
      entry.preview_file_id !== undefined &&
      entry.preview_file_id !== null
    return filter.excluding ? !hasAvatar : hasAvatar
  },

  department (entry, filter, taskMap) {
    if (!entry.departments) return false
    let hasDepartment = false
    filter.values.forEach(value => {
      hasDepartment = hasDepartment ||
                      entry.departments.indexOf(value.id) !== -1
    })
    return filter.excluding ? !hasDepartment : hasDepartment
  },

  assetsready (entry, filter, taskMap) {
    let isOk = false
    if (entry.tasks) {
      entry.tasks.forEach(taskId => {
        const task = taskMap.get(taskId)
        if (task.task_type_id === filter.value) {
          isOk = entry.nb_entities_out > 0 &&
            entry.nb_entities_out === task.nb_assets_ready
        }
      })
    }
    if (filter.excluding) isOk = !isOk
    return isOk
  }
}

/**
 * Extract keywords from a given text. Remove equality and exclusion
 * expressions.
 */
export const getKeyWords = (queryText) => {
  if (!queryText) {
    return []
  } else {
    return queryText
      .replace(UNION_REGEX, '')
      .replace(EQUAL_REGEX, '')
      .replace(MULTIPLE_REGEX, '')
      .split(' ')
      .filter(query => {
        return query.length > 0 && query[0] !== '-' && query !== 'withthumbnail'
      })
  }
}

/**
 * Extract multiple keywords from a given text. Remove equality and exclusion
 * expressions.
 */
export const getMultipleKeyWords = (queryText) => {
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
export const getExcludingKeyWords = (queryText) => {
  return queryText
    .replace(UNION_REGEX, '')
    .replace(EQUAL_REGEX, '')
    .split(' ')
    .filter((keyword) => {
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
export const getFilters = (
  {
    entryIndex,
    assetTypes = [],
    taskTypes = [],
    taskStatuses = [],
    descriptors = [],
    departments = [],
    persons,
    query
  }
) => {
  const unionExtraction = getUnion(query)
  query = unionExtraction.query
  const filters = [
    ...getAssetTypeFilters(assetTypes, query),
    ...getTaskTypeFilters(taskTypes, taskStatuses, query),
    ...getDescFilters(descriptors, query),
    ...getAssignedToFilters(persons, query),
    ...getDepartmentFilters(departments, query),
    ...getThumbnailFilters(query) || [],
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

const cleanParenthesis = (value) => {
  if (value[0] === '[') {
    return value.substring(1, value.length - 1)
  } else {
    return value
  }
}

/*
 * Extract asset type filters (like type=characters from given query.
 */
export const getAssetTypeFilters = (
  assetTypes,
  queryText
) => {
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
export const getTaskTypeFilters = (
  taskTypes,
  taskStatuses,
  queryText
) => {
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
          const values = value.split(',')
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
export const getDescFilters = (descriptors, queryText) => {
  if (!queryText) return []

  const results = []
  const rgxMatches = queryText.match(EQUAL_REGEX)

  if (rgxMatches) {
    const descriptorNameIndex = buildNameIndex(descriptors, false)
    rgxMatches.forEach(rgxMatch => {
      const pattern = rgxMatch.split('=')
      const descriptorName = cleanParenthesis(pattern[0])
      if (descriptorName === 'type' || descriptorName === 'department') return
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
export const getAssignedToFilters = (persons, queryText) => {
  if (!queryText) return []

  const results = []
  const rgxMatches = queryText.match(EQUAL_REGEX)
  if (rgxMatches) {
    rgxMatches.forEach(rgxMatch => {
      const personIndex = new Map()
      persons
        .forEach(person => {
          const name = string.slugify(person.name.toLowerCase())
          personIndex.set(name, person)
        })
      const pattern = rgxMatch.split('=')
      if (pattern[0] === 'assignedto') {
        let value = pattern[1]
        value = cleanParenthesis(value)
        const excluding = value.startsWith('-')
        if (excluding) value = value.substring(1)
        const simplifiedValue = string.slugify(value.toLowerCase())
        const person = personIndex.get(simplifiedValue)
        if (person) {
          results.push({
            personId: person.id,
            value,
            type: 'assignedto',
            excluding
          })
        }
      }
    })
  }
  return results
}

export const getThumbnailFilters = (queryText) => {
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
