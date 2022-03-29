import taskTypeStore from '../store/modules/tasktypes'

export function getTaskType (taskTypeId) {
  if (!taskTypeId) {
    return 1
  } else {
    return taskTypeStore.state.taskTypeMap.get(taskTypeId)
  }
}
