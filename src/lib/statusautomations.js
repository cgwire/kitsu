// The trigger of a status automation is a group: an operator ("and" or "or")
// and conditions, each a task type with the statuses that meet it.

export const MAX_CONDITIONS = 10

const OPERATORS = ['and', 'or']

const ERRORS = {
  maxConditions: 'status_automations.errors.max_conditions',
  missingValue: 'status_automations.errors.missing_value',
  outputInConditions: 'status_automations.errors.output_in_conditions',
  sameTaskType: 'status_automations.errors.same_task_type'
}

// The legacy single condition stands for a missing trigger only, as in Zou. A
// malformed trigger, which only a sync or a direct write stores, reads as far
// as it goes.
export const getTrigger = automation => {
  const group = automation?.in_conditions
  if (group != null) {
    const conditions = Array.isArray(group.conditions) ? group.conditions : []
    return {
      operator: OPERATORS.includes(group.operator) ? group.operator : 'and',
      conditions: conditions
        .filter(condition => condition && typeof condition === 'object')
        .map(condition => ({
          task_type_id: condition.task_type_id,
          task_status_ids: Array.isArray(condition.task_status_ids)
            ? condition.task_status_ids
            : []
        }))
    }
  }
  if (automation?.in_task_type_id && automation?.in_task_status_id) {
    return {
      operator: 'and',
      conditions: [
        {
          task_type_id: automation.in_task_type_id,
          task_status_ids: [automation.in_task_status_id]
        }
      ]
    }
  }
  return { operator: 'and', conditions: [] }
}

// A guard that is not a list, which only a direct write stores, reads as
// empty.
export const getGuardStatusIds = automation =>
  Array.isArray(automation?.out_only_if_task_status_ids)
    ? automation.out_only_if_task_status_ids
    : []

export const automationToForm = automation => {
  const trigger = getTrigger(automation)
  return {
    // Older clients wrote "Asset", which Zou reads as "asset".
    entityType: (automation.entity_type ?? 'asset').toLowerCase(),
    operator: trigger.operator,
    conditions: trigger.conditions.map(condition => ({
      taskTypeId: condition.task_type_id,
      taskStatusIds: [...(condition.task_status_ids ?? [])]
    })),
    outFieldType: automation.out_field_type,
    outTaskTypeId: automation.out_task_type_id,
    outTaskStatusId: automation.out_task_status_id,
    outOnlyIfTaskStatusIds: [...getGuardStatusIds(automation)],
    importLastRevision: String(automation.import_last_revision === true),
    archived: String(automation.archived === true)
  }
}

export const formToPayload = (form, { isEditing = false } = {}) => {
  const isStatusOutput = form.outFieldType === 'status'
  const payload = {
    entity_type: form.entityType,
    in_conditions: {
      operator: form.operator,
      conditions: form.conditions.map(condition => ({
        task_type_id: condition.taskTypeId,
        task_status_ids: [...condition.taskStatusIds]
      }))
    },
    out_field_type: form.outFieldType,
    out_task_type_id: form.outTaskTypeId,
    out_task_status_id: isStatusOutput ? form.outTaskStatusId : null,
    out_only_if_task_status_ids: isStatusOutput
      ? [...form.outOnlyIfTaskStatusIds]
      : [],
    import_last_revision: form.importLastRevision === 'true'
  }
  if (isEditing) {
    payload.archived = form.archived === 'true'
  }
  return payload
}

// Mirrors the Zou rules, which stay the authority: one error key per row,
// null for a valid row.
export const validateConditions = form =>
  form.conditions.map((condition, index) => {
    if (index >= MAX_CONDITIONS) return ERRORS.maxConditions
    if (!condition.taskTypeId || condition.taskStatusIds.length === 0) {
      return ERRORS.missingValue
    }
    if (
      form.outFieldType === 'status' &&
      condition.taskTypeId === form.outTaskTypeId
    ) {
      return ERRORS.outputInConditions
    }
    const firstIndex = form.conditions.findIndex(
      other => other.taskTypeId === condition.taskTypeId
    )
    return firstIndex === index ? null : ERRORS.sameTaskType
  })

export const isFormValid = form =>
  form.conditions.length > 0 &&
  validateConditions(form).every(error => error === null)

// Zou checks a write only when it changes the trigger, the entity type or the
// output, so that a row saved before a rule existed stays editable. The order
// of the conditions counts, not the order of the statuses.
const getCheckedFields = form => ({
  entityType: form.entityType,
  operator: form.operator,
  conditions: form.conditions.map(condition => [
    condition.taskTypeId,
    [...condition.taskStatusIds].sort()
  ]),
  outFieldType: form.outFieldType,
  outTaskTypeId: form.outTaskTypeId,
  outOnlyIfTaskStatusIds: [...form.outOnlyIfTaskStatusIds].sort()
})

export const isTriggerOrOutputChanged = (form, storedForm) =>
  JSON.stringify(getCheckedFields(form)) !==
  JSON.stringify(getCheckedFields(storedForm))

export const formatTaskStatuses = (taskStatusIds, taskStatusMap) =>
  (taskStatusIds ?? [])
    .map(taskStatusId => taskStatusMap.get(taskStatusId)?.short_name)
    .filter(Boolean)
    .join(', ')

export const formatTrigger = (automation, { taskTypeMap, taskStatusMap }) =>
  getTrigger(automation)
    .conditions.map(condition => {
      const taskTypeName = taskTypeMap.get(condition.task_type_id)?.name ?? ''
      const statuses = formatTaskStatuses(
        condition.task_status_ids,
        taskStatusMap
      )
      return `${taskTypeName}: ${statuses}`
    })
    .join('; ')
