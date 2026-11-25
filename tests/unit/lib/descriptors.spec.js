// @vitest-environment node

import {
  createColumnChangeLog,
  dropRemovedDataKeys,
  getDescriptorChoicesOptions,
  getDescriptorFieldName,
  getExportDescriptors,
  getMetadataChecklistValues,
  getMetadataFieldValue,
  isBuiltInFieldName,
  isPlainDescriptorName,
  isTakenDescriptorNameError,
  logColumnChange,
  removeMetadataField,
  renameMetadataField,
  replayColumnChanges
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

    // A column named "Constructor" has the field name of a property every
    // object inherits.
    test('reads no value an entity only inherits', () => {
      const descriptor = { field_name: 'constructor', entity_type: 'Shot' }
      expect(getMetadataFieldValue(descriptor, { data: {} })).toBe('')
      expect(
        getMetadataFieldValue(descriptor, { data: {}, entity_data: {} })
      ).toBe('')
      expect(
        getMetadataFieldValue(descriptor, {
          data: {},
          entity_data: { constructor: 'Unit 2' }
        })
      ).toBe('Unit 2')
      expect(
        getMetadataFieldValue(descriptor, { data: { constructor: 'Unit 1' } })
      ).toBe('Unit 1')
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

  describe('getDescriptorFieldName', () => {
    test('makes the field name Zou makes from a column name', () => {
      expect(getDescriptorFieldName('Frame In')).toBe('frame_in')
      expect(getDescriptorFieldName(' Résolution ')).toBe('resolution')
      expect(getDescriptorFieldName('frame-out')).toBe('frame_out')
      expect(getDescriptorFieldName("Max  Retakes'!")).toBe('max_retakes')
      expect(getDescriptorFieldName('F.P.S.')).toBe('f_p_s')
    })

    // Zou spells these words in Latin letters: dropping them here turned
    // the name into a built-in key that Zou does not see in it.
    test('keeps the letters of other scripts', () => {
      expect(getDescriptorFieldName('Разрешение (Resolution)')).toBe(
        'разрешение_resolution'
      )
      expect(getDescriptorFieldName('解像度 Resolution')).toBe('解像度_resolution')
    })
  })

  // python-slugify spells other characters in Latin letters, drops a comma
  // between two digits, and decodes HTML entities.
  describe('isPlainDescriptorName', () => {
    test('accepts a name of Latin letters, accented or not, digits, spaces, and punctuation', () => {
      ;['Frame In', ' Résolution ', "Max  Retakes'!", 'Câmera 2'].forEach(
        name => expect(isPlainDescriptorName(name)).toBe(true)
      )
    })

    test('turns down a name Zou spells otherwise', () => {
      ;['Budget (€)', 'Größe', 'Камера', '1,000 frames', 'R&amp;D'].forEach(
        name => expect(isPlainDescriptorName(name)).toBe(false)
      )
    })

    // python-slugify drops the combining marks from U+0300 to U+034E and from
    // U+0360 to U+0362, turns those in between (U+034F, the grapheme joiner,
    // to U+035F) into a separator, spells the combining letters after them
    // (U+0363 for "a"), and drops a fullwidth apostrophe.
    test('accepts the combining marks Zou drops, not the others or a fullwidth apostrophe', () => {
      ;['Ca\u0303mera', 'Ca\u0362mera'].forEach(name =>
        expect(isPlainDescriptorName(name)).toBe(true)
      )
      ;[
        'Ca\u0363mera',
        'Ca\u034fmera',
        'Ca\u035fmera',
        'Director\uff07s cut'
      ].forEach(name => expect(isPlainDescriptorName(name)).toBe(false))
    })
  })

  describe('isBuiltInFieldName', () => {
    test('flags the key of a built-in field for an entity column', () => {
      const entityTypes = ['Asset', 'Shot', 'Sequence', 'Episode', 'Edit']
      entityTypes.forEach(entityType => {
        expect(isBuiltInFieldName(entityType, 'resolution')).toBe(true)
      })
      expect(isBuiltInFieldName('Shot', 'fps')).toBe(true)
      expect(isBuiltInFieldName('Shot', 'frame_in')).toBe(true)
      expect(isBuiltInFieldName('Shot', 'frame_out')).toBe(true)
      expect(isBuiltInFieldName('Shot', 'handle_in')).toBe(true)
      expect(isBuiltInFieldName('Shot', 'handle_out')).toBe(true)
      expect(isBuiltInFieldName('Shot', 'max_retakes')).toBe(true)
      expect(isBuiltInFieldName('Shot', 'shot_resolution')).toBe(false)
    })

    // Their values live in the project or the task data.
    test('leaves the project and task columns free', () => {
      expect(isBuiltInFieldName('Project', 'resolution')).toBe(false)
      expect(isBuiltInFieldName('Task', 'fps')).toBe(false)
    })
  })

  describe('isTakenDescriptorNameError', () => {
    const refusal = message =>
      Object.assign(new Error('Bad Request'), {
        status: 400,
        body: { error: true, message }
      })

    test('flags the refusal of a name another column holds', () => {
      expect(
        isTakenDescriptorNameError(
          refusal('Metadata descriptor already exists.')
        )
      ).toBe(true)
    })

    test('leaves the other failures out', () => {
      expect(
        isTakenDescriptorNameError(
          refusal('Metadata descriptor name is too long.')
        )
      ).toBe(false)
      expect(isTakenDescriptorNameError(new Error('Bad Gateway'))).toBe(false)
      expect(isTakenDescriptorNameError(undefined)).toBe(false)
    })
  })

  describe('renameMetadataField', () => {
    const style = { field_name: 'style', project_id: 'p1' }

    test('moves a value to the new field name in its production', () => {
      const shots = [
        { id: 's1', production_id: 'p1', data: { look: 'warm', mood: 'calm' } },
        { id: 's2', production_id: 'p1', data: { mood: 'dark' } },
        { id: 's3', production_id: 'p1', data: { look: null } },
        { id: 's4', production_id: 'p1' },
        { id: 's5', production_id: 'p1', data: null }
      ]
      renameMetadataField(shots, style, 'look')
      expect(shots.map(({ data }) => data)).toEqual([
        { style: 'warm', mood: 'calm' },
        { mood: 'dark' },
        { look: null },
        undefined,
        null
      ])
    })

    // A shared asset of another production shows in the list of this one.
    test('leaves the entities of another production', () => {
      const assets = [
        { id: 'a1', production_id: 'p1', data: { look: 'warm' } },
        {
          id: 'a2',
          project_id: 'p2',
          production_id: 'p1',
          data: { look: 'wild' }
        }
      ]
      renameMetadataField(assets, style, 'look')
      expect(assets.map(({ data }) => data)).toEqual([
        { style: 'warm' },
        { look: 'wild' }
      ])
    })

    // Zou moves every value but null.
    test('moves an empty text, 0, and false', () => {
      const shots = [
        { id: 's1', production_id: 'p1', data: { look: '' } },
        { id: 's2', production_id: 'p1', data: { look: 0 } },
        { id: 's3', production_id: 'p1', data: { look: false } }
      ]
      renameMetadataField(shots, style, 'look')
      expect(shots.map(({ data }) => data)).toEqual([
        { style: '' },
        { style: 0 },
        { style: false }
      ])
    })

    // A column named "Constructor" has the field name of a property every
    // object inherits.
    test('moves no value the data does not hold', () => {
      const builder = { field_name: 'builder', project_id: 'p1' }
      const shots = [
        { id: 's1', production_id: 'p1', data: {} },
        { id: 's2', production_id: 'p1', data: { constructor: 'Ann' } }
      ]
      renameMetadataField(shots, builder, 'constructor')
      expect(shots.map(({ data }) => data)).toEqual([{}, { builder: 'Ann' }])
    })

    // The live update of a rename made in this tab can come before the
    // answer to the rename.
    test('moves a value once for the same rename', () => {
      const shots = [{ id: 's1', production_id: 'p1', data: { look: 'warm' } }]
      renameMetadataField(shots, style, 'look')
      renameMetadataField(shots, style, 'look')
      expect(shots[0].data).toEqual({ style: 'warm' })
    })

    // The rows of a list can hold a copy of an entity that shares its data.
    test('changes the data the copies of an entity share', () => {
      const shot = { id: 's1', production_id: 'p1', data: { look: 'warm' } }
      const copy = { ...shot }
      renameMetadataField([shot], style, 'look')
      expect(copy.data).toEqual({ style: 'warm' })
    })
  })

  describe('removeMetadataField', () => {
    const notes = { field_name: 'notes', project_id: 'p1' }

    test('removes the value of the column in its production', () => {
      const assets = [
        { id: 'a1', production_id: 'p1', data: { notes: 'a', mood: 'calm' } },
        {
          id: 'a2',
          project_id: 'p2',
          production_id: 'p1',
          data: { notes: 'b' }
        },
        { id: 'a3', production_id: 'p1' }
      ]
      removeMetadataField(assets, notes)
      expect(assets.map(({ data }) => data)).toEqual([
        { mood: 'calm' },
        { notes: 'b' },
        undefined
      ])
    })

    test('changes the data the copies of an entity share', () => {
      const shot = { id: 's1', production_id: 'p1', data: { notes: 'a' } }
      const copy = { ...shot }
      removeMetadataField([shot], notes)
      expect(copy.data).toEqual({})
    })
  })
  // A list load replaces the cached entities with a payload Zou may have
  // built before a column was deleted or renamed.
  describe('replayColumnChanges', () => {
    const notes = { field_name: 'notes', project_id: 'p1' }
    const tone = { field_name: 'tone', project_id: 'p1' }

    test('replays the changes logged since the load started', () => {
      const log = createColumnChangeLog()
      logColumnChange(log, { field_name: 'size', project_id: 'p1' })
      const since = log.count
      logColumnChange(log, tone, 'mood')
      logColumnChange(log, notes)
      // Zou lists some entities without their production.
      const shots = [{ id: 's1', data: { mood: 'calm', notes: 'n', size: 'big' } }]
      replayColumnChanges(shots, log, since, 'p1')
      expect(shots[0].data).toEqual({ tone: 'calm', size: 'big' })
    })

    // A shared asset of another production shows in the list of this one.
    test('leaves the entities of another production', () => {
      const log = createColumnChangeLog()
      logColumnChange(log, notes)
      const assets = [{ id: 'a2', project_id: 'p2', data: { notes: 'n' } }]
      replayColumnChanges(assets, log, 0, 'p1')
      expect(assets[0].data).toEqual({ notes: 'n' })
    })

    // The productions store updates its descriptors in place.
    test('replays a change as it was logged', () => {
      const log = createColumnChangeLog()
      const descriptor = { field_name: 'tone', project_id: 'p1' }
      logColumnChange(log, descriptor, 'mood')
      descriptor.field_name = 'feel'
      const shots = [{ id: 's1', production_id: 'p1', data: { mood: 'calm' } }]
      replayColumnChanges(shots, log, 0)
      expect(shots[0].data).toEqual({ tone: 'calm' })
    })

    test('keeps the last hundred changes only', () => {
      const log = createColumnChangeLog()
      logColumnChange(log, { field_name: 'size', project_id: 'p1' })
      Array.from({ length: 100 }, (_, index) =>
        logColumnChange(log, { field_name: `extra${index}`, project_id: 'p1' })
      )
      const shots = [{ id: 's1', production_id: 'p1', data: { size: 'big' } }]
      replayColumnChanges(shots, log, 0)
      expect(shots[0].data).toEqual({ size: 'big' })
      expect(log.changes).toHaveLength(100)
    })

    test('replays nothing for a load that did not mark its start', () => {
      const log = createColumnChangeLog()
      logColumnChange(log, notes)
      const shots = [{ id: 's1', production_id: 'p1', data: { notes: 'n' } }]
      replayColumnChanges(shots, log, undefined)
      expect(shots[0].data).toEqual({ notes: 'n' })
    })
  })

  // An edit modal sends a copy of the entity data made when it opened, and
  // Zou merges the data it gets.
  describe('dropRemovedDataKeys', () => {
    test('drops the keys the entity lost since the form was filled', () => {
      // Since then, mood was renamed to tone, and notes deleted, then created
      // again.
      const entityData = { tone: 'calm', size: 'big' }
      const formData = { mood: 'calm', notes: 'n', size: 'huge', look: '' }
      expect(
        dropRemovedDataKeys(formData, ['mood', 'notes', 'size'], entityData, [
          'tone',
          'notes',
          'size',
          'look'
        ])
      ).toEqual({ size: 'huge', look: '' })
    })

    // Zou moves no null value on a rename: the entity keeps the old key.
    test('drops a key the entity kept for a column renamed since', () => {
      expect(
        dropRemovedDataKeys(
          { notes: 'n', size: 'big' },
          ['notes', 'size'],
          { notes: null, size: 'big' },
          ['remarks', 'size']
        )
      ).toEqual({ size: 'big' })
    })

    test('keeps a key the entity holds with no value', () => {
      expect(
        dropRemovedDataKeys({ notes: 'n' }, ['notes'], { notes: null }, [
          'notes'
        ])
      ).toEqual({ notes: 'n' })
    })

    // A column named "Constructor" gets the field name of a property every
    // object inherits: here it was deleted, then created again.
    test('drops a lost key named after an inherited property', () => {
      expect(
        dropRemovedDataKeys({ constructor: 'c' }, ['constructor'], {}, [
          'constructor'
        ])
      ).toEqual({})
    })

    // A field empty at opening has no key in the entity data, and a creation
    // has no entity yet.
    test('keeps a value typed for a column', () => {
      expect(dropRemovedDataKeys({ look: 'warm' }, [], undefined, ['look'])).toEqual(
        { look: 'warm' }
      )
    })

    test('drops a value typed for a column deleted or renamed since', () => {
      // look was renamed to style, and notes deleted.
      expect(
        dropRemovedDataKeys({ look: 'warm', notes: 'n', mood: 'calm' }, [], {}, [
          'style',
          'mood'
        ])
      ).toEqual({ mood: 'calm' })
    })

    // The edit modals write the resolution in the data, which is no column.
    test('keeps a built-in field typed', () => {
      expect(dropRemovedDataKeys({ resolution: '4K' }, [], {}, [])).toEqual({
        resolution: '4K'
      })
    })
  })
})
