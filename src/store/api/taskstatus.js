import client from './client'

const sanitizeTaskStatus = (taskStatus) => {
  return {
    name: taskStatus.name,
    short_name: taskStatus.short_name,
    is_reviewable: Boolean(taskStatus.is_reviewable === 'true'),
    is_done: Boolean(taskStatus.is_done === 'true'),
    color: taskStatus.color
  }
}

export default {
  getTaskStatus (callback) {
    client.get('/api/data/task-status', callback)
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
