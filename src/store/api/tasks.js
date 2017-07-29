import superagent from 'superagent'

export default {
  getTask (taskId, callback) {
    superagent
      .get(`/api/data/tasks/${taskId}/full`)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  getTaskStatuses (callback) {
    superagent
      .get(`/api/data/task_status`)
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}
