import Vue from 'vue'

export const populateTask = (task) => {
  if (task.entity_type_name === 'Shot') {
    if (task.episode_name) {
      task.full_entity_name =
        `${task.episode_name} / ${task.sequence_name} / ${task.entity_name}`
    } else {
      task.full_entity_name = `${task.sequence_name} / ${task.entity_name}`
    }
  } else if (task.entity_type_name === 'Episode') {
    task.full_entity_name = `${task.entity_name}`
  } else if (['Sequence', 'Edit'].includes(task.entity_type_name)) {
    if (task.episode_name) {
      task.full_entity_name =
        `${task.episode_name} / ${task.entity_name}`
    } else {
      task.full_entity_name = `${task.entity_name}`
    }
  } else {
    task.full_entity_name = `${task.entity_type_name} / ${task.entity_name}`
  }
  const type = task.entity_type_name.toLowerCase()
  task.entity_path = {
    name: type,
    params: {
      production_id: task.project_id
    }
  }
  task.entity_path.params[`${type}_id`] = task.entity_id
  return task
}

export const findModelInList = (items, modelToFind) => {
  return items.find(item => item.id === modelToFind.id)
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
      Array.from(entry.validations.keys()).forEach(taskTypeId => {
        filledColumns[taskTypeId] = true
      })
      Object.assign(
        filledColumns,
        entry.validations
      )
    } else {
      const tasks = entry.tasks || []
      tasks.forEach(task => {
        filledColumns[task.task_type_id] = true
      })
    }
  })
  return filledColumns
}

export const groupEntitiesByParents = (entities, parentNameField) => {
  const entitiesByParents = []
  let parentEntities = []
  let previousEntity = null

  for (const entity of entities) {
    if (
      previousEntity &&
      entity[parentNameField] !== previousEntity[parentNameField]
    ) {
      entitiesByParents.push(parentEntities.slice(0))
      parentEntities = []
    }
    parentEntities.push(entity)
    previousEntity = entity
  }
  entitiesByParents.push(parentEntities)

  return entitiesByParents
}

export const addToIdList = (production, field, id) => {
  if (!production[field]) Vue.set(production, field, [])
  if (!production[field].find((mid) => mid === id)) {
    production[field].push(id)
  }
}

export const removeFromIdList = (production, field, id) => {
  const index = production[field].findIndex((mid) => mid === id)
  if (index !== null) production[field].splice(index, 1)
}

export const arrayMove = (array, fromIndex, toIndex) => {
  const arr = [...array]
  const element = arr[fromIndex]
  arr.splice(fromIndex, 1)
  arr.splice(toIndex, 0, element)
  return arr
}
