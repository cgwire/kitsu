import moment from 'moment-timezone'

export const populateTask = (task) => {
  if (task.entity_type_name === 'Shot') {
    if (task.episode_name) {
      task.full_entity_name = `${task.episode_name} / ${task.sequence_name} / ${task.entity_name}`
    } else {
      task.full_entity_name = `${task.sequence_name} / ${task.entity_name}`
    }
    task.entity_path = {
      name: 'shot',
      params: {
        production_id: task.project_id,
        shot_id: task.entity_id
      }
    }
  } else {
    task.full_entity_name = `${task.entity_type_name} / ${task.entity_name}`
    task.entity_path = {
      name: 'asset',
      params: {
        production_id: task.project_id,
        asset_id: task.entity_id
      }
    }
  }
}

export const buildSelectionGrid = (maxX, maxY) => {
  const result = {}
  for (let i = 0; i < maxX; i++) {
    if (!result[i]) result[i] = {}
    for (let j = 0; j < maxY; j++) {
      result[i][j] = false
    }
  }
  return result
}

export const appendSelectionGrid = (grid, previousX, maxX, maxY) => {
  const result = {...grid}
  for (let i = previousX; i < maxX; i++) {
    if (!result[i]) result[i] = {}
    for (let j = 0; j < maxY; j++) {
      result[i][j] = false
    }
  }
  return result
}

export const clearSelectionGrid = (selectionGrid) => {
  const maxX = Object.keys(selectionGrid).length
  const maxY = selectionGrid[0] ? Object.keys(selectionGrid[0]).length : 0
  for (let i = 0; i < maxX; i++) {
    for (let j = 0; j < maxY; j++) {
      if (selectionGrid[i][j]) selectionGrid[i][j] = false
    }
  }
  return selectionGrid
}

export const computeStats = (entities, idField, taskStatusMap, taskMap) => {
  const results = {}
  entities.forEach((entity) => {
    if (!entity.canceled) {
      const sequenceId = entity[idField]
      if (!results[sequenceId]) results[sequenceId] = {}

      entity.tasks.forEach((taskId) => {
        const task = taskMap[taskId]
        if (task) {
          const taskTypeId = task.task_type_id
          const taskStatus = taskStatusMap[task.task_status_id]

          if (taskStatus) {
            const taskStatusId = taskStatus.color
            if (!results[sequenceId][taskTypeId]) {
              results[sequenceId][taskTypeId] = {}
            }
            if (!results[sequenceId][taskTypeId][taskStatusId]) {
              results[sequenceId][taskTypeId][taskStatusId] = {
                name: taskStatus.short_name,
                color: taskStatus.color,
                value: 0
              }
            }
            results[sequenceId][taskTypeId][taskStatusId].value++
          }
        }
      })
    }
  })

  return results
}

export const range = (start, end) => {
  return [...Array(end - start + 1).keys()]
    .map(i => i + start)
}

export const monthToString = (month) => {
  const currentYear = moment().year()
  return moment(`${currentYear}-${month}`, 'YYYY-M').format('MMM')
}

export const getMonthRange = (year, currentYear, currentMonth) => {
  if (currentYear === year) {
    return range(1, currentMonth + 1)
  } else {
    return range(1, 12)
  }
}

export const getDayRange = (year, month, currentYear, currentMonth) => {
  if (currentYear === year &&
      currentMonth === month) {
    return range(1, moment().date())
  } else {
    const currentDate = moment(
      `${year}-${Number(month)}`, 'YYYY-M'
    )
    return range(1, currentDate.endOf('month').date())
  }
}

export const getWeekRange = (year, currentYear) => {
  if (currentYear === year) {
    return range(1, moment().week())
  } else {
    return range(1, 52)
  }
}

export const remove = (items, valueToRemove) => {
  return items.filter(item => item !== valueToRemove)
}
