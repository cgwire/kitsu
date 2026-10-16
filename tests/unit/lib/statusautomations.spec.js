// @vitest-environment node

import {
  automationToForm,
  formatTaskStatuses,
  formatTrigger,
  formToPayload,
  getGuardStatusIds,
  getTrigger,
  isFormValid,
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

    it('shares no array with the form', () => {
      const source = form()
      const payload = formToPayload(source)
      payload.in_conditions.conditions[0].task_status_ids.push(NA)
      expect(source.conditions[0].taskStatusIds).toEqual([DONE])
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
  })

  // Zou checks a write only when it changes the trigger, the entity type or
  // the output.
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
