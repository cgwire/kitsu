// @vitest-environment node

import { getExportDescriptors, getMetadataFieldValue } from '@/lib/descriptors'

describe('lib/descriptors', () => {
  describe('getExportDescriptors', () => {
    test('lists the descriptors of the entity type by name', () => {
      const production = {
        descriptors: [
          { name: 'Zeta', entity_type: 'Shot' },
          { name: 'Other', entity_type: 'Asset' },
          { name: 'Alpha', entity_type: 'Shot' }
        ]
      }

      const descriptors = getExportDescriptors(production, 'Shot')

      expect(descriptors.map(d => d.name)).toEqual(['Alpha', 'Zeta'])
      expect(production.descriptors.map(d => d.name)).toEqual([
        'Zeta',
        'Other',
        'Alpha'
      ])
    })

    test('returns an empty list when the production has no descriptors key', () => {
      expect(getExportDescriptors({ id: 'p1' }, 'Shot')).toEqual([])
    })
  })

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
