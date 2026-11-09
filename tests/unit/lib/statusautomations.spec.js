// @vitest-environment node

import {
  automationToForm,
  formatTaskStatuses,
  formatTrigger,
  formToPayload,
  getEntityTypeName,
  getGuardStatusIds,
  getTrigger,
  isFormValid,
  isGuardChanged,
  isTriggerChanged,
  isTriggerOrOutputChanged,
  MAX_CONDITIONS,
  validateConditions
} from '@/lib/statusautomations'

const LIGHTING = 'task-type-lighting'
const FX = 'task-type-fx'
const COMPOSITING = 'task-type-compositing'
const DONE = 'task-status-done'
const NA = 'task-status-na'
const TODO = 'task-status-todo'
const READY = 'task-status-ready'

const automation = {
  id: 'automation-1',
  entity_type: 'shot',
  in_conditions: {
    operator: 'and',
    conditions: [
      { task_type_id: LIGHTING, task_status_ids: [DONE] },
      { task_type_id: FX, task_status_ids: [DONE, NA] }
    ]
  },
  in_task_type_id: null,
  in_task_status_id: null,
  out_field_type: 'status',
  out_task_type_id: COMPOSITING,
  out_task_status_id: READY,
  out_only_if_task_status_ids: [TODO],
  import_last_revision: true,
  archived: false
}

const form = fields => ({
  entityType: 'shot',
  operator: 'and',
  conditions: [
    { taskTypeId: LIGHTING, taskStatusIds: [DONE] },
    { taskTypeId: FX, taskStatusIds: [DONE, NA] }
  ],
  outFieldType: 'status',
  outTaskTypeId: COMPOSITING,
  outTaskStatusId: READY,
  outOnlyIfTaskStatusIds: [],
  importLastRevision: 'false',
  archived: 'false',
  ...fields
})

describe('lib/statusautomations', () => {
  describe('getTrigger', () => {
    it('returns the stored trigger', () => {
      expect(getTrigger(automation)).toEqual(automation.in_conditions)
    })

    it('derives a trigger from the legacy single condition', () => {
      expect(
        getTrigger({
          in_conditions: null,
          in_task_type_id: LIGHTING,
          in_task_status_id: DONE
        })
      ).toEqual({
        operator: 'and',
        conditions: [{ task_type_id: LIGHTING, task_status_ids: [DONE] }]
      })
    })

    it('returns an empty trigger when there is none to read', () => {
      const empty = { operator: 'and', conditions: [] }
      expect(getTrigger({})).toEqual(empty)
      expect(getTrigger({ in_conditions: { conditions: 'broken' } })).toEqual(
        empty
      )
      expect(getTrigger(null)).toEqual(empty)
    })

    // Only a sync or a direct write stores such a trigger.
    it('reads a malformed trigger as far as it goes', () => {
      expect(
        getTrigger({
          in_conditions: {
            operator: 'xor',
            conditions: [{ task_type_id: LIGHTING }, null, 'broken']
          }
        })
      ).toEqual({
        operator: 'and',
        conditions: [{ task_type_id: LIGHTING, task_status_ids: [] }]
      })
    })

    // Zou ignores such a row: the legacy pair stands for a missing trigger
    // only.
    it('reads no legacy condition next to a malformed trigger', () => {
      const legacy = { in_task_type_id: LIGHTING, in_task_status_id: DONE }
      const empty = { operator: 'and', conditions: [] }
      expect(
        getTrigger({ ...legacy, in_conditions: { conditions: 'broken' } })
      ).toEqual(empty)
      expect(getTrigger({ ...legacy, in_conditions: 'broken' })).toEqual(empty)
    })
  })

  describe('getGuardStatusIds', () => {
    it('returns the stored guard', () => {
      expect(getGuardStatusIds(automation)).toEqual([TODO])
    })

    // Only a direct write stores a guard that is not a list.
    it('reads a missing or malformed guard as empty', () => {
      const guards = [null, undefined, {}, 5, TODO]
      guards.forEach(guard => {
        expect(
          getGuardStatusIds({ out_only_if_task_status_ids: guard })
        ).toEqual([])
      })
      expect(getGuardStatusIds(null)).toEqual([])
    })
  })

  describe('automationToForm', () => {
    it('maps an automation to the modal form', () => {
      expect(automationToForm(automation)).toEqual({
        entityType: 'shot',
        operator: 'and',
        conditions: [
          { taskTypeId: LIGHTING, taskStatusIds: [DONE] },
          { taskTypeId: FX, taskStatusIds: [DONE, NA] }
        ],
        outFieldType: 'status',
        outTaskTypeId: COMPOSITING,
        outTaskStatusId: READY,
        outOnlyIfTaskStatusIds: [TODO],
        importLastRevision: 'true',
        archived: 'false'
      })
    })

    it('shares no array with the automation', () => {
      const result = automationToForm(automation)
      result.conditions.push({ taskTypeId: COMPOSITING, taskStatusIds: [] })
      result.conditions[0].taskStatusIds.push(NA)
      result.outOnlyIfTaskStatusIds.push(READY)

      expect(automation.in_conditions.conditions).toHaveLength(2)
      expect(automation.in_conditions.conditions[0].task_status_ids).toEqual([
        DONE
      ])
      expect(automation.out_only_if_task_status_ids).toEqual([TODO])
    })

    // Older clients wrote "Asset", which Zou reads as "asset".
    it('reads the entity type in lowercase', () => {
      expect(
        automationToForm({ ...automation, entity_type: 'Asset' }).entityType
      ).toBe('asset')
    })

    it('reads a row without an entity type as an asset one', () => {
      expect(
        automationToForm({ ...automation, entity_type: null }).entityType
      ).toBe('asset')
    })

    it('reads an automation without a guard', () => {
      expect(
        automationToForm({ ...automation, out_only_if_task_status_ids: null })
          .outOnlyIfTaskStatusIds
      ).toEqual([])
    })

    it('reads a malformed guard as empty', () => {
      expect(
        automationToForm({ ...automation, out_only_if_task_status_ids: {} })
          .outOnlyIfTaskStatusIds
      ).toEqual([])
    })
  })

  describe('formToPayload', () => {
    it('sends the trigger conditions and the output', () => {
      expect(
        formToPayload(form({ outOnlyIfTaskStatusIds: [TODO, READY] }))
      ).toEqual({
        entity_type: 'shot',
        in_conditions: {
          operator: 'and',
          conditions: [
            { task_type_id: LIGHTING, task_status_ids: [DONE] },
            { task_type_id: FX, task_status_ids: [DONE, NA] }
          ]
        },
        out_field_type: 'status',
        out_task_type_id: COMPOSITING,
        out_task_status_id: READY,
        out_only_if_task_status_ids: [TODO, READY],
        import_last_revision: false
      })
    })

    it('never sends the legacy trigger fields', () => {
      const payload = formToPayload(form(), { isEditing: true })
      expect(payload).not.toHaveProperty('in_task_type_id')
      expect(payload).not.toHaveProperty('in_task_status_id')
      expect(payload).not.toHaveProperty('in_field_type')
    })

    it('sends the archived flag of an edited automation only', () => {
      expect(formToPayload(form({ archived: 'true' }))).not.toHaveProperty(
        'archived'
      )
      expect(
        formToPayload(form({ archived: 'true' }), { isEditing: true }).archived
      ).toBe(true)
    })

    it('converts the boolean fields of the combobox', () => {
      expect(
        formToPayload(form({ importLastRevision: 'true' })).import_last_revision
      ).toBe(true)
    })

    it('sends no status and no guard for a ready for output', () => {
      const payload = formToPayload(
        form({
          outFieldType: 'ready_for',
          outOnlyIfTaskStatusIds: [TODO]
        })
      )
      expect(payload.out_task_status_id).toBeNull()
      expect(payload.out_only_if_task_status_ids).toEqual([])
    })

    // An edited ready for row may still hold a flag the form no longer shows.
    it('sends no revision import for a ready for output', () => {
      const payload = formToPayload(
        form({ outFieldType: 'ready_for', importLastRevision: 'true' }),
        { isEditing: true }
      )
      expect(payload.import_last_revision).toBe(false)
    })

    it('shares no array with the form', () => {
      const source = form()
      const payload = formToPayload(source)
      payload.in_conditions.conditions[0].task_status_ids.push(NA)
      expect(source.conditions[0].taskStatusIds).toEqual([DONE])
    })

    // Zou keeps the stored trigger when a write leaves it out, even a
    // malformed one that the form reads as far as it goes.
    it('leaves out the trigger of an edit that keeps it', () => {
      const payload = formToPayload(form({ isTriggerChanged: false }), {
        isEditing: true
      })
      expect(payload).not.toHaveProperty('in_conditions')
      expect(payload.out_task_type_id).toBe(COMPOSITING)
      expect(payload.archived).toBe(false)
      expect(
        formToPayload(form({ isTriggerChanged: true }), { isEditing: true })
          .in_conditions.conditions
      ).toHaveLength(2)
    })

    it('sends the trigger of a new automation', () => {
      expect(
        formToPayload(form({ isTriggerChanged: false })).in_conditions.operator
      ).toBe('and')
    })

    // As for the trigger: a malformed guard reads as empty, and an edit
    // that keeps it does not overwrite it.
    it('leaves out the guard of an edit that keeps it', () => {
      const guarded = fields =>
        form({ outOnlyIfTaskStatusIds: [TODO], ...fields })
      expect(
        formToPayload(guarded({ isGuardChanged: false }), { isEditing: true })
      ).not.toHaveProperty('out_only_if_task_status_ids')
      expect(
        formToPayload(guarded({ isGuardChanged: true }), { isEditing: true })
          .out_only_if_task_status_ids
      ).toEqual([TODO])
      expect(
        formToPayload(guarded({ isGuardChanged: false }))
          .out_only_if_task_status_ids
      ).toEqual([TODO])
    })
  })

  describe('validateConditions', () => {
    it('accepts a valid form', () => {
      expect(validateConditions(form())).toEqual([null, null])
      expect(isFormValid(form())).toBe(true)
    })

    it('asks for a task type and a status', () => {
      const result = validateConditions(
        form({
          conditions: [
            { taskTypeId: LIGHTING, taskStatusIds: [] },
            { taskTypeId: null, taskStatusIds: [DONE] }
          ]
        })
      )
      expect(result).toEqual([
        'status_automations.errors.missing_value',
        'status_automations.errors.missing_value'
      ])
    })

    it('flags a task type used by an earlier condition', () => {
      expect(
        validateConditions(
          form({
            operator: 'or',
            conditions: [
              { taskTypeId: LIGHTING, taskStatusIds: [DONE] },
              { taskTypeId: LIGHTING, taskStatusIds: [NA] }
            ]
          })
        )
      ).toEqual([null, 'status_automations.errors.same_task_type'])
    })

    it('flags the applied task type used as a condition', () => {
      const conditions = [
        { taskTypeId: COMPOSITING, taskStatusIds: [DONE] },
        { taskTypeId: FX, taskStatusIds: [DONE] }
      ]
      expect(validateConditions(form({ conditions }))).toEqual([
        'status_automations.errors.output_in_conditions',
        null
      ])
      expect(
        validateConditions(form({ conditions, outFieldType: 'ready_for' }))
      ).toEqual([null, null])
    })

    it('flags the conditions past the maximum', () => {
      const conditions = Array.from(
        { length: MAX_CONDITIONS + 1 },
        (_, index) => ({ taskTypeId: `task-type-${index}`, taskStatusIds: [DONE] })
      )
      const result = validateConditions(form({ conditions }))
      expect(result.slice(0, MAX_CONDITIONS)).toEqual(
        Array(MAX_CONDITIONS).fill(null)
      )
      expect(result[MAX_CONDITIONS]).toBe(
        'status_automations.errors.max_conditions'
      )
    })

    it('refuses a form without a condition', () => {
      expect(isFormValid(form({ conditions: [] }))).toBe(false)
    })

    // Zou checks the stored conditions against a new output, and asks for
    // one only in a trigger the write sends.
    it('asks for a condition only when the write sends the trigger', () => {
      const empty = form({ conditions: [] })
      expect(isFormValid(empty, { isTriggerSent: false })).toBe(true)
      expect(isFormValid(empty, { isTriggerSent: true })).toBe(false)
      const conditions = [{ taskTypeId: COMPOSITING, taskStatusIds: [DONE] }]
      expect(isFormValid(form({ conditions }), { isTriggerSent: false })).toBe(
        false
      )
    })
  })

  describe('getEntityTypeName', () => {
    const i18n = {
      t: key => `[${key}]`,
      te: key =>
        [
          'status_automations.entity_types.asset',
          'status_automations.entity_types.shot'
        ].includes(key)
    }

    it('names an entity type in the locale, whatever its case', () => {
      expect(getEntityTypeName('shot', i18n)).toBe(
        '[status_automations.entity_types.shot]'
      )
      expect(getEntityTypeName('Asset', i18n)).toBe(
        '[status_automations.entity_types.asset]'
      )
    })

    it('names a row without an entity type as an asset one', () => {
      expect(getEntityTypeName(null, i18n)).toBe(
        '[status_automations.entity_types.asset]'
      )
    })

    // Zou reads a row naming an asset type, which only a direct API write
    // stores, as an asset one.
    it('names a row naming an asset type after it', () => {
      expect(getEntityTypeName('Props', i18n)).toBe('Props')
    })
  })

  // Zou checks a write only when it changes the trigger, the entity type or
  // the output.
  describe('isTriggerChanged', () => {
    it('ignores the order of the statuses and the other fields', () => {
      expect(
        isTriggerChanged(
          form({
            conditions: [
              { taskTypeId: LIGHTING, taskStatusIds: [DONE] },
              { taskTypeId: FX, taskStatusIds: [NA, DONE] }
            ],
            outTaskTypeId: FX,
            outOnlyIfTaskStatusIds: [TODO],
            importLastRevision: 'true'
          }),
          form()
        )
      ).toBe(false)
    })

    it('tells a change of the operator or of the conditions', () => {
      const changes = [
        { operator: 'or' },
        { conditions: [{ taskTypeId: LIGHTING, taskStatusIds: [DONE] }] },
        {
          conditions: [
            { taskTypeId: FX, taskStatusIds: [DONE, NA] },
            { taskTypeId: LIGHTING, taskStatusIds: [DONE] }
          ]
        },
        {
          conditions: [
            { taskTypeId: LIGHTING, taskStatusIds: [DONE, NA] },
            { taskTypeId: FX, taskStatusIds: [DONE, NA] }
          ]
        }
      ]
      changes.forEach(fields => {
        expect(isTriggerChanged(form(fields), form())).toBe(true)
      })
    })
  })

  describe('isGuardChanged', () => {
    it('ignores the order of the statuses and the other fields', () => {
      expect(
        isGuardChanged(
          form({ outOnlyIfTaskStatusIds: [READY, TODO], operator: 'or' }),
          form({ outOnlyIfTaskStatusIds: [TODO, READY] })
        )
      ).toBe(false)
    })

    it('tells an added or a removed status', () => {
      const guarded = form({ outOnlyIfTaskStatusIds: [TODO] })
      expect(isGuardChanged(guarded, form())).toBe(true)
      expect(isGuardChanged(form(), guarded)).toBe(true)
    })

    // Only a direct write stores a guard on a ready for output. The write
    // sends none, as Zou reads it, which clears it.
    it('compares the guard the write sends with the stored one', () => {
      const readyFor = fields => form({ outFieldType: 'ready_for', ...fields })
      const stored = readyFor({ outOnlyIfTaskStatusIds: [TODO] })
      expect(isGuardChanged({ ...stored }, stored)).toBe(true)
      expect(isGuardChanged(readyFor(), readyFor())).toBe(false)
    })
  })

  describe('isTriggerOrOutputChanged', () => {
    it('ignores the fields Zou does not check a write on', () => {
      const stored = form({ outOnlyIfTaskStatusIds: [TODO, READY] })
      expect(
        isTriggerOrOutputChanged(
          form({
            conditions: [
              { taskTypeId: LIGHTING, taskStatusIds: [DONE] },
              { taskTypeId: FX, taskStatusIds: [NA, DONE] }
            ],
            outTaskStatusId: TODO,
            outOnlyIfTaskStatusIds: [READY, TODO],
            importLastRevision: 'true',
            archived: 'true'
          }),
          stored
        )
      ).toBe(false)
    })

    it('tells a change of the trigger, the entity type or the output', () => {
      const changes = [
        { entityType: 'asset' },
        { operator: 'or' },
        { conditions: [{ taskTypeId: LIGHTING, taskStatusIds: [DONE] }] },
        {
          conditions: [
            { taskTypeId: FX, taskStatusIds: [DONE, NA] },
            { taskTypeId: LIGHTING, taskStatusIds: [DONE] }
          ]
        },
        {
          conditions: [
            { taskTypeId: LIGHTING, taskStatusIds: [DONE, NA] },
            { taskTypeId: FX, taskStatusIds: [DONE, NA] }
          ]
        },
        { outFieldType: 'ready_for' },
        { outTaskTypeId: FX },
        { outOnlyIfTaskStatusIds: [TODO] }
      ]
      changes.forEach(fields => {
        expect(isTriggerOrOutputChanged(form(fields), form())).toBe(true)
      })
    })

    it('tells a guard the write clears', () => {
      const stored = form({
        outFieldType: 'ready_for',
        outOnlyIfTaskStatusIds: [TODO]
      })
      expect(isTriggerOrOutputChanged({ ...stored }, stored)).toBe(true)
    })
  })

  describe('formatTrigger', () => {
    const taskTypeMap = new Map([
      [LIGHTING, { id: LIGHTING, name: 'Lighting' }],
      [FX, { id: FX, name: 'FX' }]
    ])
    const taskStatusMap = new Map([
      [DONE, { id: DONE, short_name: 'done' }],
      [NA, { id: NA, short_name: 'na' }],
      [TODO, { id: TODO, short_name: 'todo' }]
    ])

    it('lists every condition with its statuses', () => {
      expect(formatTrigger(automation, { taskTypeMap, taskStatusMap })).toBe(
        'Lighting: done; FX: done, na'
      )
    })

    it('skips the values the maps do not hold', () => {
      const unknown = {
        in_conditions: {
          operator: 'or',
          conditions: [
            { task_type_id: 'task-type-gone', task_status_ids: [DONE] },
            { task_type_id: FX, task_status_ids: ['task-status-gone', NA] }
          ]
        }
      }
      expect(formatTrigger(unknown, { taskTypeMap, taskStatusMap })).toBe(
        ': done; FX: na'
      )
    })

    it('formats a list of statuses', () => {
      expect(formatTaskStatuses([TODO, DONE], taskStatusMap)).toBe(
        'todo, done'
      )
      expect(formatTaskStatuses(null, taskStatusMap)).toBe('')
    })
  })
})
