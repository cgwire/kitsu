import client from './client'

export default {
  getTaskStatus (callback) {
    client.get('/api/data/task-status', callback)
  },

  newTaskStatus (taskStatus, callback) {
    const data = {
      name: taskStatus.name,
      color: taskStatus.color
    }
    client.post('/api/data/task-status/', data, callback)
  },

  updateTaskStatus (taskStatus, callback) {
    const data = {
      name: taskStatus.name,
      color: taskStatus.color
    }
    client.put(`/api/data/task-status/${taskStatus.id}`, data, callback)
  },

  deleteTaskStatus (taskStatus, callback) {
    client.del(`/api/data/task-status/${taskStatus.id}`, callback)
  }
}
