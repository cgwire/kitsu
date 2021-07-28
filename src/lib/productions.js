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
  return production.task_types_priority[taskType.id] || taskType.priority
}
