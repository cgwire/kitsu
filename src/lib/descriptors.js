/*
 * Pure helpers to read and format metadata descriptors.
 *
 * The legacy `descriptorMixin` in `src/components/mixins/descriptors.js`
 * still exists for components that haven't been migrated to
 * `<script setup>` yet. New code should import from here.
 */

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
