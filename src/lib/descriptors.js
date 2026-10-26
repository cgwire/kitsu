/*
 * Pure helpers to read and format metadata descriptors.
 */

import { sortByName } from '@/lib/sorting'

export const getDescriptorChoicesOptions = (descriptor, emptyChoice = true) => {
  const values = (descriptor?.choices || []).map(c => ({ label: c, value: c }))
  if (emptyChoice) {
    values.unshift({ label: '', value: '' })
  }
  return values
}

export const getMetadataFieldValue = (descriptor, entity) => {
  if (
    entity.data &&
    descriptor.field_name in entity.data &&
    entity.data[descriptor.field_name] != null
  ) {
    return entity.data[descriptor.field_name]
  }
  // Task descriptors live only in the task's own `data`. Never fall back to
  // the linked entity's metadata (entity_data), or a same-named entity column
  // (e.g. a "reviewer" on both Shot and the task type) would leak its value
  // into the task column.
  if (
    descriptor.entity_type !== 'Task' &&
    entity.entity_data &&
    descriptor.field_name in entity.entity_data &&
    entity.entity_data[descriptor.field_name] != null
  ) {
    return entity.entity_data[descriptor.field_name]
  }
  return ''
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

// Project and task columns store their values out of the entity data.
export const isBuiltInFieldName = (entityType, fieldName) =>
  !['Project', 'Task'].includes(entityType) &&
  BUILT_IN_DATA_FIELDS.includes(fieldName)
