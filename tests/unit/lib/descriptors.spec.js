import { getMetadataFieldValue } from '@/lib/descriptors'

describe('lib/descriptors', () => {
  describe('getMetadataFieldValue', () => {
    test('returns the value from the entity own data', () => {
      const descriptor = { field_name: 'reviewer', entity_type: 'Shot' }
      const entity = { data: { reviewer: 'shot-value' } }
      expect(getMetadataFieldValue(descriptor, entity)).toBe('shot-value')
    })

    test('entity descriptor falls back to the linked entity_data', () => {
      const descriptor = { field_name: 'reviewer', entity_type: 'Shot' }
      const entity = { data: {}, entity_data: { reviewer: 'shot-value' } }
      expect(getMetadataFieldValue(descriptor, entity)).toBe('shot-value')
    })

    test('task descriptor never leaks a same-named entity_data value', () => {
      // A "reviewer" descriptor exists on both Shot and the task type: the
      // task column must stay empty, not show the shot's reviewer.
      const descriptor = { field_name: 'reviewer', entity_type: 'Task' }
      const task = { data: {}, entity_data: { reviewer: 'shot-value' } }
      expect(getMetadataFieldValue(descriptor, task)).toBe('')
    })

    test('task descriptor reads its own data', () => {
      const descriptor = { field_name: 'reviewer', entity_type: 'Task' }
      const task = { data: { reviewer: 'task-value' }, entity_data: { reviewer: 'shot-value' } }
      expect(getMetadataFieldValue(descriptor, task)).toBe('task-value')
    })
  })
})
