/*
 * Composition API counterpart of the pure helpers in
 * `src/components/mixins/descriptors.js`. Import these named exports
 * directly from `<script setup>` components; the legacy mixin delegates
 * to them so its Options API consumers keep working.
 */

// Descriptor choices are static per descriptor — no need to reparse them
// for every row. Cache keyed by descriptor.id.
const _checklistValuesCache = new Map()

export const getDescriptorChecklistValues = descriptor => {
  const cached = _checklistValuesCache.get(descriptor.id)
  if (cached) return cached
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
  const result = values.length === descriptor.choices.length ? values : []
  _checklistValuesCache.set(descriptor.id, result)
  return result
}

export const getMetadataFieldValue = (descriptor, entity) => {
  if (
    entity.data &&
    descriptor.field_name in entity.data &&
    entity.data[descriptor.field_name] != null
  ) {
    return entity.data[descriptor.field_name]
  }
  if (
    entity.entity_data &&
    descriptor.field_name in entity.entity_data &&
    entity.entity_data[descriptor.field_name] != null
  ) {
    return entity.entity_data[descriptor.field_name]
  }
  return ''
}

export const getMetadataChecklistValues = (descriptor, entity) => {
  let values
  try {
    values = JSON.parse(getMetadataFieldValue(descriptor, entity))
  } catch {
    values = {}
  }
  getDescriptorChecklistValues(descriptor).forEach(option => {
    if (!(option.text in values)) {
      values[option.text] = option.checked
    }
  })
  return values
}

export const getDescriptorChoicesOptions = (descriptor, emptyChoice = true) => {
  const values = descriptor.choices.map(c => ({ label: c, value: c }))
  return emptyChoice ? [{ label: '', value: '' }, ...values] : values
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
