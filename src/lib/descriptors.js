/*
 * Pure helpers to read and format metadata descriptors.
 */

import { getOwnValue } from '@/lib/models'
import { sortByName } from '@/lib/sorting'

export const getDescriptorChoicesOptions = (descriptor, emptyChoice = true) => {
  const values = (descriptor?.choices || []).map(c => ({ label: c, value: c }))
  if (emptyChoice) {
    values.unshift({ label: '', value: '' })
  }
  return values
}

export const hasDataValue = (data, fieldName) =>
  getOwnValue(data, fieldName) != null

export const getMetadataFieldValue = (descriptor, entity) => {
  if (hasDataValue(entity.data, descriptor.field_name)) {
    return entity.data[descriptor.field_name]
  }
  // Task descriptors live only in the task's own `data`. Never fall back to
  // the linked entity's metadata (entity_data), or a same-named entity column
  // (e.g. a "reviewer" on both Shot and the task type) would leak its value
  // into the task column.
  if (
    descriptor.entity_type !== 'Task' &&
    hasDataValue(entity.entity_data, descriptor.field_name)
  ) {
    return entity.entity_data[descriptor.field_name]
  }
  return ''
}

// A shared asset keeps the id of its own production. The list loads give the
// other entities the id of the production they show, as some lists come
// without one: a payload replayed before that gets the production it was
// loaded for.
const getEntityProductionId = (entity, productionId) =>
  entity.project_id ?? entity.production_id ?? productionId

// Zou moves the value of a renamed column to its new field name, in the
// production of the column, when there is one. The data changes in place: a
// list row can hold a copy of the entity that shares it.
export const renameMetadataField = (
  entities,
  descriptor,
  oldFieldName,
  productionId
) => {
  entities.forEach(entity => {
    if (
      getEntityProductionId(entity, productionId) === descriptor.project_id &&
      hasDataValue(entity.data, oldFieldName)
    ) {
      entity.data[descriptor.field_name] = entity.data[oldFieldName]
      delete entity.data[oldFieldName]
    }
  })
}

// Zou clears the values of a deleted column in its production.
export const removeMetadataField = (entities, descriptor, productionId) => {
  entities.forEach(entity => {
    if (
      getEntityProductionId(entity, productionId) === descriptor.project_id &&
      entity.data
    ) {
      delete entity.data[descriptor.field_name]
    }
  })
}

// A list load replaces the cached entities with a payload Zou may have built
// before a column was deleted or renamed. Each list store logs these changes,
// and a load replays the ones logged after it started.
const MAX_LOGGED_COLUMN_CHANGES = 100

export const createColumnChangeLog = () => ({ count: 0, changes: [] })

export const logColumnChange = (log, descriptor, previousFieldName) => {
  log.count += 1
  // A copy: the productions store updates its descriptors in place.
  log.changes.push({
    index: log.count,
    descriptor: { ...descriptor },
    previousFieldName
  })
  if (log.changes.length > MAX_LOGGED_COLUMN_CHANGES) log.changes.shift()
}

export const replayColumnChanges = (entities, log, since, productionId) => {
  if (since == null) return
  log.changes
    .filter(({ index }) => index > since)
    .forEach(({ descriptor, previousFieldName }) => {
      if (previousFieldName) {
        renameMetadataField(
          entities,
          descriptor,
          previousFieldName,
          productionId
        )
      } else {
        removeMetadataField(entities, descriptor, productionId)
      }
    })
}

// An edit modal fills its form with a copy of the entity data, and Zou merges
// the data it gets: a value goes out only under the field name of a current
// column or of a built-in field, or a column deleted or renamed while the form
// was open would get it back. A key the form was filled with also needs the
// entity to still hold it: a column deleted and created again starts empty.
export const dropRemovedDataKeys = (
  data,
  openedKeys,
  entityData,
  fieldNames
) => {
  const storedKeys = Object.keys(entityData ?? {})
  return Object.fromEntries(
    Object.entries(data).filter(
      ([key]) =>
        (BUILT_IN_DATA_FIELDS.includes(key) || fieldNames.includes(key)) &&
        (!openedKeys.includes(key) || storedKeys.includes(key))
    )
  )
}

export const getDescriptorChecklistValues = descriptor => {
  const values = descriptor.choices.reduce((result, choice) => {
    if (choice && typeof choice === 'string' && choice.startsWith('[x] ')) {
      result.push({ text: choice.slice(4), checked: true })
    } else if (
      choice &&
      typeof choice === 'string' &&
      choice.startsWith('[ ] ')
    ) {
      result.push({ text: choice.slice(4), checked: false })
    }
    return result
  }, [])
  return values.length === descriptor.choices.length ? values : []
}

// Reads a checklist value, stored or typed in a form, over the defaults of
// the descriptor options.
export const parseMetadataChecklistValues = (descriptor, value) => {
  let parsed = value
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      parsed = null
    }
  }
  // A value written for another type of column ("true" left by a boolean
  // one, a number from a CSV import) reads as an empty checklist. Callers
  // tick an option on the result: an object is copied, so the stored value
  // stays as it is until the save.
  const values =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? { ...parsed }
      : {}
  getDescriptorChecklistValues(descriptor).forEach(option => {
    if (!(option.text in values)) {
      values[option.text] = option.checked
    }
  })
  return values
}

export const getMetadataChecklistValues = (descriptor, entity) =>
  parseMetadataChecklistValues(
    descriptor,
    getMetadataFieldValue(descriptor, entity)
  )

export const isSupervisorInDepartments = (
  user,
  isCurrentUserSupervisor,
  departments = []
) => {
  if (!Array.isArray(departments)) {
    departments = [departments]
  }
  return (
    isCurrentUserSupervisor &&
    (user.departments.length === 0 ||
      user.departments.some(department => departments.includes(department)))
  )
}

/*
 * Value an input event sets on a metadata field, undefined when the event
 * must be ignored: an invalid input, or a browser undo / redo, which is
 * reverted to the stored value.
 */
export const getMetadataEventValue = (descriptor, entry, event) => {
  if (typeof event === 'string') return event
  if (['historyUndo', 'historyRedo'].includes(event.inputType)) {
    // The browser rewrote the field on its own: its undo stack belongs to
    // the frame, not to the focused element, so Ctrl+Z anywhere on the
    // page replays the last edited cell. Put the stored value back instead
    // of pushing this one onto every selected entry.
    event.target.value = getMetadataFieldValue(descriptor, entry)
    return undefined
  }
  if (!event.target.validity.valid) return undefined
  if (descriptor.data_type === 'boolean') {
    return event.target.checked ? 'true' : 'false'
  }
  if (descriptor.data_type === 'number') {
    return !isNaN(event.target.valueAsNumber)
      ? event.target.valueAsNumber
      : null
  }
  return event.target.value
}

// CSV exports list the descriptor columns by name, in the header and in the
// lines alike. A production stored from the single-project payload has no
// descriptors key.
export const getExportDescriptors = (production, entityType) =>
  sortByName(
    (production.descriptors || []).filter(d => d.entity_type === entityType)
  )

// Keys the built-in fields of an entity use in its data: frame range, trim
// handles, frame rate, resolution, and retake cap. Zou refuses a column whose
// field name is one of them, since both would share their values. Zou keeps
// the same list in BUILT_IN_ENTITY_DATA_FIELDS.
const BUILT_IN_DATA_FIELDS = [
  'fps',
  'frame_in',
  'frame_out',
  'handle_in',
  'handle_out',
  'max_retakes',
  'resolution'
]

// The field name Zou makes from a column name (python-slugify with "_"):
// accents dropped, any run of other characters turned into one "_". Zou
// spells the letters of other scripts in Latin ones, which are kept as
// they are here: a Russian word followed by "(Resolution)" stays off the
// built-in keys on both sides.
export const getDescriptorFieldName = name =>
  name
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_|_$/g, '')

// python-slugify also spells other characters in Latin letters (€ as "eur",
// ß as "ss", Cyrillic letters, the combining ones after U+0362), turns the
// combining marks from U+034F to U+035F into a separator, drops a comma
// between two digits and a fullwidth apostrophe, and decodes HTML entities:
// getDescriptorFieldName gives the field name of Zou only for a name with
// none of them.
export const isPlainDescriptorName = name => {
  const text = name
    .normalize('NFKD')
    .replace(/[\u0300-\u034e\u0360-\u0362]/g, '')
  return (
    /^[\x20-\x7e]*$/.test(text) &&
    !name.includes('\uff07') &&
    !/\d,\d/.test(text) &&
    !/&#?\w+;/.test(text)
  )
}

// Project and task columns store their values out of the entity data.
export const isBuiltInFieldName = (entityType, fieldName) =>
  !['Project', 'Task'].includes(entityType) &&
  BUILT_IN_DATA_FIELDS.includes(fieldName)

// Zou answers "Metadata descriptor already exists." to a name another column
// holds, as its name or as its field name.
export const isTakenDescriptorNameError = err =>
  /already exists/i.test(err?.body?.message ?? '')

// Zou answers "Metadata descriptor name is used by a built-in field." to a
// name whose field name is the key of a built-in field of the entity data.
export const isBuiltInDescriptorNameError = err =>
  /built-in field/i.test(err?.body?.message ?? '')
