import client from './client'

export default {
  getTaskTypes (callback) {
    client.get('/api/data/task-types', callback)
  },

  newTaskType (taskType, callback) {
    const data = {
      name: taskType.name,
      color: taskType.color,
      priority: Number(taskType.priority),
      for_shots: Boolean(taskType.for_shots === 'true'),
      allow_timelog: Boolean(taskType.allow_timelog === 'true')
    }
    client.post('/api/data/task-types/', data, callback)
  },

  updateTaskType (taskType, callback) {
    const data = {
      name: taskType.name,
      color: taskType.color,
      priority: Number(taskType.priority),
      for_shots: Boolean(taskType.for_shots === 'true'),
      allow_timelog: Boolean(taskType.allow_timelog === 'true')
    }
    client.put(`/api/data/task-types/${taskType.id}`, data, callback)
  },

  deleteTaskType (taskType, callback) {
    client.del(`/api/data/task-types/${taskType.id}`, callback)
  },

  getTaskType (taskTypeId, callback) {
    client.get(`/api/data/task-types/${taskTypeId}`, callback)
  },

  getSequenceSubscriptions (projectId, taskTypeId, callback) {
    client.get(
      `/api/data/user/projects/${projectId}/task-types/${taskTypeId}/` +
      `sequence-subscriptions`,
      callback
    )
  }
}
