import client from './client'

export default {
  getTask (taskId, callback) {
    client.get(`/api/data/tasks/${taskId}/full`, callback)
  },

  getTaskStatuses (callback) {
    client.get(`/api/data/task-status`, callback)
  },

  getTaskSubscribed (taskId, callback) {
    client.get(`/api/data/user/tasks/${taskId}/subscribed`, callback)
  },

  subscribeToTask (taskId, callback) {
    client.post(`/api/actions/user/tasks/${taskId}/subscribe`, {}, callback)
  },

  unsubscribeFromTask (taskId, callback) {
    client.del(`/api/actions/user/tasks/${taskId}/unsubscribe`, callback)
  },

  getTaskComments (taskId, callback) {
    client.get(`/api/data/tasks/${taskId}/comments`, callback)
  },

  getTaskPreviews (taskId, callback) {
    client.get(`/api/data/tasks/${taskId}/previews`, callback)
  },

  commentTask (data, callback) {
    const commentData = {
      task_status_id: data.taskStatusId,
      comment: data.comment
    }
    client.post(
      `/api/actions/tasks/${data.taskId}/comment`,
      commentData,
      callback
    )
  },

  getTaskComment (data, callback) {
    client.get(`/api/data/comments/${data.id}`, callback)
  },

  editTaskComment (comment, callback) {
    const commentData = {
      text: comment.text
    }
    client.put(`/api/data/comments/${comment.id}`, commentData, callback)
  },

  deleteTaskComment (taskId, commentId, callback) {
    client.del(`/api/data/tasks/${taskId}/comments/${commentId}`, callback)
  },

  createTasks (data, callback) {
    const taskTypeId = data.task_type_id
    const type = data.type
    const projectId = data.project_id
    client.post(
      `/api/actions/task-types/${taskTypeId}/${type}/create-tasks?project_id=${projectId}`,
      {},
      callback
    )
  },

  createTask (data, callback) {
    const entityId = data.entity_id
    const taskTypeId = data.task_type_id
    const type = data.type
    const projectId = data.project_id
    client.post(
      `/api/actions/task-types/${taskTypeId}/${type}/create-tasks?project_id=${projectId}&id=${entityId}`,
      {},
      callback
    )
  },

  deleteTask (task, callback) {
    client.del(`/api/data/tasks/${task.id}`, callback)
  },

  addPreview (data, callback) {
    const taskId = data.taskId
    const commentId = data.commentId
    client.post(
      `/api/actions/tasks/${taskId}/comments/${commentId}/add-preview`,
      {is_movie: data.isMovie},
      callback
    )
  },

  setPreview (entityId, previewId, callback) {
    client.put(
      `/api/actions/entities/${entityId}/set-main-preview/${previewId}`,
      {},
      callback
    )
  },

  uploadPreview (previewId, formData, callback) {
    client.post(
      `/api/pictures/preview-files/${previewId}`,
      formData,
      callback
    )
  },

  assignTasks (personId, selectedTaskIds, callback) {
    client.put(
      `/api/actions/persons/${personId}/assign`,
      {task_ids: selectedTaskIds},
      callback
    )
  },

  unassignTasks (selectedTaskIds, callback) {
    client.put(
      `/api/actions/tasks/clear-assignation`,
      {task_ids: selectedTaskIds},
      callback
    )
  }

}
