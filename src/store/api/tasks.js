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

  getTaskPreviews (taskId, callback) {
    superagent
      .get(`/api/data/tasks/${taskId}/previews`)
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
  },

  createTasks (data, callback) {
    const taskTypeId = data.task_type_id
    const type = data.type
    superagent
      .post(`/api/project/${type}/task-types/${taskTypeId}/create-tasks`)
      .send({})
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  deleteTask (task, callback) {
    superagent
      .del(`/api/data/tasks/${task.id}`)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  addPreview (data, callback) {
    const taskId = data.taskId
    const commentId = data.commentId
    superagent
      .post(`/api/project/tasks/${taskId}/comments/${commentId}/add-preview`)
      .send({})
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  uploadPreview (previewId, formData, callback) {
    superagent
      .post(`/api/thumbnails/preview-files/${previewId}`)
      .send(formData)
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}
