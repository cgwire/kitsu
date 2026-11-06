export const populateTask = task => {
  const type = task.entity_type_name
  const parts = []

  if (type === 'Shot') {
    if (task.episode_name) parts.push(task.episode_name)
    parts.push(task.sequence_name, task.entity_name)
  } else if (['Sequence', 'Edit'].includes(type)) {
    if (task.episode_name) parts.push(task.episode_name)
    parts.push(task.entity_name)
  } else if (type === 'Episode') {
    parts.push(task.entity_name)
  } else {
    parts.push(task.entity_type_name, task.entity_name)
  }

  task.full_entity_name = parts.join(' / ')
  task.entity_path = {
    name: type.toLowerCase(),
    params: {
      production_id: task.project_id
    }
  }
  task.entity_path.params[`${type.toLowerCase()}_id`] = task.entity_id
  if (!task.entity && task.entity_id) {
    task.entity = {
      id: task.entity_id,
      preview_file_id: task.entity_preview_file_id
    }
  }
  return task
}

// The task centric lists (todos, kanban, timesheets) render the flat
// entity_preview_file_id they got from the API, so a new main preview has to
// be pushed onto every task of the entity for the thumbnail to follow.
// Takes any task collection exposing forEach, list or map alike.
export const setTasksEntityPreview = (tasks, entityId, previewId) => {
  if (!entityId) return
  tasks.forEach(task => {
    if (task.entity_id === entityId) {
      task.entity_preview_file_id = previewId
      if (task.entity) task.entity.preview_file_id = previewId
    }
  })
}

export const updateModelFromList = (items, modelToUpdate) => {
  const item = items.find(item => item.id === modelToUpdate.id)
  if (item) Object.assign(item, modelToUpdate)
  return item
}

export const removeModelFromList = (items, valueToRemove) => {
  return items.filter(item => item.id !== valueToRemove.id)
}

// The rows render the entries of the displayed list, the cached entities or
// copies of them. The cached entities are raw objects: flagged through them
// only, no row would see the change.
export const setCanceled = (displayedEntries, entities, canceled) => {
  const ids = new Set(entities.map(({ id }) => id))
  displayedEntries.forEach(entry => {
    if (ids.has(entry.id)) entry.canceled = canceled
  })
  entities.forEach(entity => {
    entity.canceled = canceled
  })
}

export const remove = (items, modelToRemove) => {
  return items.filter(item => item !== modelToRemove)
}

export const getFilledColumns = entries => {
  const filledColumns = {}
  entries.forEach(entry => {
    if (entry.validations) {
      Array.from(entry.validations.keys()).forEach(taskTypeId => {
        filledColumns[taskTypeId] = true
      })
      Object.assign(filledColumns, entry.validations)
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
  if (!production[field]) {
    production[field] = []
  }
  if (!production[field].find(mid => mid === id)) {
    production[field].push(id)
  }
}

export const removeFromIdList = (production, field, id) => {
  const index = production[field].findIndex(mid => mid === id)
  if (index !== -1) production[field].splice(index, 1)
}

export const arrayMove = (array, fromIndex, toIndex) => {
  const arr = [...array]
  const element = arr[fromIndex]
  arr.splice(fromIndex, 1)
  arr.splice(toIndex, 0, element)
  return arr
}

// The fields of an entity, its data copied: an edit gives it a new data
// object.
const copyFields = ({ data, ...fields }) => ({ fields, data: { ...data } })

const getChangedKeys = (before, after) =>
  [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    key => before[key] !== after[key]
  )

// The edits of each cached entity still waiting for their save, oldest first.
const pendingEdits = new WeakMap()

/*
 * Applies the edit of a cached entity and follows it until its save settles:
 * keep() once Zou saved it, undo() once Zou refused it. undo() gives the edit
 * putting back the former value of each field the edit changed. A field
 * changed again since keeps its new value, and the edit that changed it gets
 * the former one, should Zou refuse it too. undo() gives null when nothing is
 * left to undo, or when the cache no longer holds the entity (removed, or
 * replaced by a reload).
 */
export const trackEdit = (getEntity, applyEdit) => {
  const entity = getEntity()
  if (!entity) {
    applyEdit()
    return { keep: () => {}, undo: () => null }
  }
  const before = copyFields(entity)
  applyEdit()
  const edit = { before, after: copyFields(entity) }
  const edits = pendingEdits.get(entity) || []
  edits.push(edit)
  pendingEdits.set(entity, edits)

  // Returns the edits made after this one.
  const settle = () => {
    const index = edits.indexOf(edit)
    if (index < 0) return []
    edits.splice(index, 1)
    return edits.slice(index)
  }

  const undo = () => {
    const laterEdits = settle()
    if (getEntity() !== entity) return null
    const current = copyFields(entity)
    const formerValues = { fields: {}, data: {} }
    Object.keys(formerValues).forEach(part => {
      const valuesBefore = edit.before[part]
      const valuesAfter = edit.after[part]
      getChangedKeys(valuesBefore, valuesAfter).forEach(key => {
        if (current[part][key] === valuesAfter[key]) {
          formerValues[part][key] = valuesBefore[key]
        } else {
          const nextEdit = laterEdits.find(
            later =>
              later.before[part][key] === valuesAfter[key] &&
              later.after[part][key] !== valuesAfter[key]
          )
          if (nextEdit) nextEdit.before[part][key] = valuesBefore[key]
        }
      })
    })
    const { fields, data } = formerValues
    const hasData = Object.keys(data).length > 0
    if (!hasData && Object.keys(fields).length === 0) return null
    return { id: entity.id, ...fields, ...(hasData ? { data } : {}) }
  }

  return {
    keep: () => {
      settle()
    },
    undo
  }
}
