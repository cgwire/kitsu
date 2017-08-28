import superagent from 'superagent'

export default {
  getTaskTypes (callback) {
    superagent
      .get('/api/data/task-types')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  newTaskType (taskType, callback) {
    const data = {
      name: taskType.name,
      color: taskType.color,
      priority: Number(taskType.priority),
      for_shots: Boolean(taskType.for_shots)
    }
    superagent
      .post('/api/data/task-types/')
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  updateTaskType (taskType, callback) {
    const data = {
      name: taskType.name,
      color: taskType.color,
      priority: Number(taskType.priority),
      for_shots: Boolean(taskType.for_shots === 'true')
    }
    superagent
      .put(`/api/data/task-types/${taskType.id}`)
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  deleteTaskType (taskType, callback) {
    superagent
      .del(`/api/data/task-types/${taskType.id}`)
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}
