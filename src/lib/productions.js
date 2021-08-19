export const PRODUCTION_TYPE_OPTIONS = [
  {
    label: 'short',
    value: 'short'
  },
  {
    label: 'tvshow',
    value: 'tvshow'
  },
  {
    label: 'featurefilm',
    value: 'featurefilm'
  }
]

export function getTaskTypePriorityOfProd (taskType, production) {
  if (!taskType) {
    return 1
  } else if (production && production.task_types_priority[taskType.id]) {
    return production.task_types_priority[taskType.id]
  } else {
    return taskType.priority
  }
}
