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
  },

  getTaskComments (taskId, callback) {
    superagent
      .get(`/api/data/tasks/${taskId}/comments`)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  commentTask (data, callback) {
    const commentData = {
      task_status_id: data.taskStatusId,
      comment: data.comment
    }
    superagent
      .post(`/api/project/tasks/${data.taskId}/comment`)
      .send(commentData)
      .end((err, res) => {
        callback(err, res.body)
      })
  }

}
