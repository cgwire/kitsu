import marked from 'marked'
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
  const result = { ...grid }
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
    return range(1, currentMonth)
  } else {
    return range(1, 12)
  }
}

export const getDayRange = (year, month, currentYear, currentMonth) => {
  if (currentYear === year &&
      currentMonth === month) {
    return range(1, moment().date() + 1)
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

export const updateModelFromList = (items, modelToUpdate) => {
  const item = items.find(item => item.id === modelToUpdate.id)
  if (item) Object.assign(item, modelToUpdate)
  return item
}

export const removeModelFromList = (items, valueToRemove) => {
  return items.filter(item => item.id !== valueToRemove.id)
}

export const remove = (items, modelToRemove) => {
  return items.filter(item => item !== modelToRemove)
}

export const getFilledColumns = (entries) => {
  const filledColumns = {}
  entries.forEach((entry) => {
    if (entry.validations) {
      Object.assign(
        filledColumns,
        entry.validations
      )
    } else {
      entry.tasks.forEach((task) => {
        filledColumns[task.task_type_id] = task.id
      })
    }
  })
  return filledColumns
}

export const getTaskTypeStyle = (task) => {
  let border = 'transparent'
  if (task) border = task.task_type_color
  return {
    'border-left': `4px solid ${border}`
  }
}

export const getTaskPath = (
  task,
  production,
  isTVShow,
  episode,
  taskTypeMap
) => {
  const productionId =
    task.project_id ? task.project_id : production.id
  let route = {
    name: 'task',
    params: {
      production_id: productionId,
      task_id: task.id
    }
  }
  if (isTVShow && episode) {
    route.name = 'episode-task'
    route.params.episode_id = task.episode_id || episode.id
  }
  const taskType = taskTypeMap[task.task_type_id]
  route.params.type = taskType.for_shots ? 'shots' : 'assets'
  return route
}

export const getTaskEntityPath = (task, episodeId) => {
  if (task) {
    const type = task.entity_type_name
    const entityId = task.entity ? task.entity.id : task.entity_id
    const route = {
      name: type === 'Shot' ? 'shot' : 'asset',
      params: {
        production_id: task.project_id
      }
    }

    if (type === 'Shot') {
      route.params.shot_id = entityId
    } else {
      route.params.asset_id = entityId
    }

    if (episodeId) {
      route.name = `episode-${route.name}`
      route.params.episode_id = episodeId
    }

    return route
  } else {
    return {
      name: 'open-productions'
    }
  }
}

export const getEntityPath = (entityId, productionId, section, episodeId) => {
  let route = {
    name: section,
    params: {
      production_id: productionId
    }
  }

  if (episodeId) {
    route.name = `episode-${section}`
    route.params.episode_id = episodeId
  }

  if (section === 'shot') {
    route.params.shot_id = entityId
  } else if (section === 'asset') {
    route.params.asset_id = entityId
  }

  return route
}

export const slugify = (str) => {
  str = str.replace(/^\s+|\s+$/g, '')
    .toLowerCase()

  const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:'
  const to = 'aaaaeeeeiiiioooouuuunc------'
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  return str.replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
}

export const renderComment = (input, mentions, personMap) => {
  let compiled = marked(input || '')
  if (mentions) {
    mentions.forEach((personId) => {
      const person = personMap[personId]
      compiled = compiled.replace(
        `@${person.full_name}`,
        `<a class="mention" href="/people/${person.id}">@${person.full_name}</a>`
      )
    })
  }
  return compiled
}
