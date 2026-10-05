/*
 * Helpers of the production schedule page: the query params it reads and
 * writes, the task type filter, the bar dates and the task save payloads.
 * refreshRawDates and widenParents update the bars they are given.
 */

export const DEFAULT_MODE = 'prev'
export const DEFAULT_VERSION = 'ref'
export const DEFAULT_ZOOM = 1

// Query params
// --------------------------------------------------------------------------

// A query param repeated in the URL reaches the page as an array of values.
export const parseHiddenTaskTypeIds = (queryValue, taskTypeMap) =>
  [queryValue]
    .flat()
    .filter(Boolean)
    .flatMap(value => value.split(','))
    .filter(id => taskTypeMap.has(id))

export const formatHiddenTaskTypeIds = hiddenTaskTypeIds =>
  hiddenTaskTypeIds.join(',') || null

// Return the query to navigate to, and whether it replaces the history
// entry, or null when nothing changes.
export const getScheduleRouteChange = (
  currentQuery,
  { mode, type, version, zoom, hiddenTypes }
) => {
  const query = { ...currentQuery }
  if (mode !== undefined) {
    query.mode = mode || undefined
  }
  if (type !== undefined) {
    query.type = type || undefined
  }
  if (version !== undefined) {
    query.version = version || undefined
  }
  if (zoom !== undefined) {
    query.zoom = String(zoom)
  }
  if (hiddenTypes !== undefined) {
    query.hiddenTypes = hiddenTypes || undefined
  }
  if (JSON.stringify(query) === JSON.stringify(currentQuery)) {
    return null
  }
  // the page never reads the history back, and the task type checkboxes
  // stay open: one entry per click would take as many Back presses
  return { query, isReplace: hiddenTypes !== undefined }
}

// Task type filter
// --------------------------------------------------------------------------

// Named and ordered like the rows they toggle: two entities can share a task
// type name, the bare name would list two identical options.
export const getTaskTypeFilterOptions = scheduleItems =>
  scheduleItems.map(item => ({
    label: item.name,
    value: item.task_type_id
  }))

// A single option is nothing to choose from, unless it is the hidden one:
// dropping the filter there would leave no way to bring the row back.
export const isTaskTypeFilterShown = (optionCount, visibleCount, scopedCount) =>
  optionCount > 1 || visibleCount < scopedCount

export const getTaskTypeFilterTitle = (visibleCount, optionCount, allLabel) =>
  visibleCount === optionCount ? allLabel : `(${visibleCount}/${optionCount})`

export const getTaskTypeVisibilityMap = (options, hiddenTaskTypeIds) =>
  options.reduce((map, option) => {
    map[option.value] = !hiddenTaskTypeIds.includes(option.value)
    return map
  }, {})

export const removeHiddenTaskTypes = (scheduleItems, hiddenTaskTypeIds) =>
  hiddenTaskTypeIds.length
    ? scheduleItems.filter(
        item => !hiddenTaskTypeIds.includes(item.task_type_id)
      )
    : scheduleItems

// One id at a time: the options only cover the current entity filter, and
// rebuilding the list from them would show the types hidden in the others.
export const setTaskTypeVisibility = (
  hiddenTaskTypeIds,
  taskTypeId,
  visible
) =>
  visible
    ? hiddenTaskTypeIds.filter(id => id !== taskTypeId)
    : [...hiddenTaskTypeIds, taskTypeId]

// Bar dates
// --------------------------------------------------------------------------

// The raw strings feed the Excel export and the side panel ranges, while a
// drag moves the startDate / endDate moments.
export const refreshRawDates = item => {
  item.start_date = item.startDate.format('YYYY-MM-DD')
  item.end_date = item.endDate.format('YYYY-MM-DD')
}

export const getMinDate = (parentElement, fallbackDate) => {
  let minDate = fallbackDate.clone()
  parentElement.children.forEach(item => {
    if (item.startDate && item.startDate.isBefore(minDate)) {
      minDate = item.startDate
    }
  })
  return minDate.clone()
}

export const getMaxDate = (parentElement, fallbackDate) => {
  let maxDate = fallbackDate.clone()
  parentElement.children.forEach(item => {
    if (item.endDate && item.endDate.isAfter(maxDate)) {
      maxDate = item.endDate
    }
  })
  return maxDate.clone()
}

// Widen the bars above a moved one so they still enclose it. Return each
// widened bar once, to be saved with both its dates.
export const widenParents = item => {
  const widenedParents = []
  let child = item
  let parent = item.parentElement
  let isWidened = true
  while (parent && isWidened) {
    isWidened = false
    if (child.startDate.isBefore(parent.startDate)) {
      parent.startDate = child.startDate.clone()
      isWidened = true
    }
    if (child.endDate.isAfter(parent.endDate)) {
      parent.endDate = child.endDate.clone()
      isWidened = true
    }
    if (isWidened) {
      widenedParents.push(parent)
    }
    child = parent
    parent = parent.parentElement
  }
  return widenedParents
}

// Task saves
// --------------------------------------------------------------------------

export const getVersionedTaskUpdate = task => ({
  id: task.versionedTaskId,
  estimation: task.estimation,
  startDate: task.startDate.format('YYYY-MM-DD'),
  dueDate: task.endDate.format('YYYY-MM-DD'),
  // 'unassigned' is the local row placeholder, not a person id: the API
  // rejects it and drops the whole update
  assignees: task.assignees.filter(id => id !== 'unassigned')
})

export const getTaskUpdate = task => ({
  taskId: task.id,
  data: {
    estimation: task.estimation,
    start_date: task.startDate.format('YYYY-MM-DD'),
    due_date: task.endDate.format('YYYY-MM-DD')
  }
})
