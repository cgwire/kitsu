// @vitest-environment node

import {
  getDescriptorChoicesOptions,
  getExportDescriptors,
  getMetadataChecklistValues,
  getMetadataFieldValue
} from '@/lib/descriptors'

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

  describe('getMetadataChecklistValues', () => {
    const descriptor = {
      field_name: 'checks',
      entity_type: 'Asset',
      data_type: 'checklist',
      choices: ['[x] Model', '[ ] Rig']
    }

    test('merges the stored checks over the option defaults', () => {
      const asset = { data: { checks: '{"Rig":true}' } }
      expect(getMetadataChecklistValues(descriptor, asset)).toEqual({
        Model: true,
        Rig: true
      })
    })

    // Left by a boolean column switched to a checklist, by a shared asset
    // whose production has a same-named boolean column, or by a CSV import.
    test.each([
      ['a boolean column "true"', 'true'],
      ['a boolean column "false"', 'false'],
      ['a JSON boolean', true],
      ['a number', 42],
      ['a number string', '42'],
      ['a "null" string', 'null'],
      ['a JSON string', '"done"'],
      ['an array', '[true]']
    ])('reads %s as the option defaults', (_, value) => {
      const asset = { data: { checks: value } }
      expect(getMetadataChecklistValues(descriptor, asset)).toEqual({
        Model: true,
        Rig: false
      })
    })

    test('reads a checklist stored as an object without changing it', () => {
      const asset = { data: { checks: { Model: false } } }

      const values = getMetadataChecklistValues(descriptor, asset)
      // The cell editors tick the option on the result before saving it.
      values.Rig = true

      expect(values).toEqual({ Model: false, Rig: true })
      expect(asset.data.checks).toEqual({ Model: false })
    })
  })

  describe('getDescriptorChoicesOptions', () => {
    test('prepends an empty choice', () => {
      const descriptor = {
        field_name: 'difficulty',
        choices: ['easy', 'medium', 'difficult']
      }
      expect(getDescriptorChoicesOptions(descriptor)).toEqual([
        { label: '', value: '' },
        { label: 'easy', value: 'easy' },
        { label: 'medium', value: 'medium' },
        { label: 'difficult', value: 'difficult' }
      ])
    })

    test('keeps the empty choice alone when choices are missing', () => {
      expect(getDescriptorChoicesOptions({})).toEqual([{ label: '', value: '' }])
      expect(getDescriptorChoicesOptions(null)).toEqual([
        { label: '', value: '' }
      ])
    })

    test('omits the empty choice on request', () => {
      const descriptor = { choices: ['a', 'b'] }
      expect(getDescriptorChoicesOptions(descriptor, false)).toEqual([
        { label: 'a', value: 'a' },
        { label: 'b', value: 'b' }
      ])
    })
  })
})
