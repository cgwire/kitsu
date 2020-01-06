import client from './client'

export default {
  getTaskTypes () {
    return client.pget('/api/data/task-types')
  },

  newTaskType (taskType) {
    const data = {
      name: taskType.name,
      color: taskType.color,
      priority: Number(taskType.priority),
      for_shots: Boolean(taskType.for_shots === 'true'),
      allow_timelog: Boolean(taskType.allow_timelog === 'true')
    }
    return client.ppost('/api/data/task-types/', data)
  },

  updateTaskType (taskType) {
    const data = {
      name: taskType.name,
      color: taskType.color,
      priority: Number(taskType.priority),
      for_shots: Boolean(taskType.for_shots === 'true'),
      allow_timelog: Boolean(taskType.allow_timelog === 'true')
    }
    return client.pput(`/api/data/task-types/${taskType.id}`, data)
  },

  deleteTaskType (taskType) {
    return client.pdel(`/api/data/task-types/${taskType.id}`)
  },

  getTaskType (taskTypeId) {
    return client.pget(`/api/data/task-types/${taskTypeId}`)
  }
}
