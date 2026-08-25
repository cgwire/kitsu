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
