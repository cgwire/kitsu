import superagent from 'superagent'

export default {
  getTaskTypes (callback) {
    superagent
      .get('/api/data/task_types')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  newTaskType (taskType, callback) {
    const data = {
      name: taskType.name,
      color: taskType.color
    }
    superagent
      .post('/api/data/task_types/')
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  updateTaskType (taskType, callback) {
    const data = {
      name: taskType.name,
      color: taskType.color
    }
    superagent
      .put(`/api/data/task_types/${taskType.id}`)
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  deleteTaskType (taskType, callback) {
    superagent
      .del(`/api/data/task_types/${taskType.id}`)
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}
