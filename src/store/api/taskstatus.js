import client from './client'

const sanitizeTaskStatus = (taskStatus) => {
  return {
    name: taskStatus.name,
    short_name: taskStatus.short_name,
    is_reviewable: Boolean(taskStatus.is_reviewable === 'true'),
    is_done: Boolean(taskStatus.is_done === 'true'),
    is_retake: Boolean(taskStatus.is_retake === 'true'),
    is_artist_allowed: Boolean(taskStatus.is_artist_allowed === 'true'),
    color: taskStatus.color
  }
}

export default {
  getTaskStatuses (callback) {
    client.get('/api/data/task-status', callback)
  },

  getTaskStatus (taskStatusId, callback) {
    client.get(`/api/data/task-status/${taskStatusId}`, callback)
  },

  newTaskStatus (taskStatus, callback) {
    const data = sanitizeTaskStatus(taskStatus)
    client.post('/api/data/task-status/', data, callback)
  },

  updateTaskStatus (taskStatus, callback) {
    const data = sanitizeTaskStatus(taskStatus)
    client.put(`/api/data/task-status/${taskStatus.id}`, data, callback)
  },

  deleteTaskStatus (taskStatus, callback) {
    client.del(`/api/data/task-status/${taskStatus.id}`, callback)
  }
}
