import client from './client'

export default {
  getTask (taskId, callback) {
    client.get(`/api/data/tasks/${taskId}/full`, callback)
  },

  updateTask (taskId, data, callback) {
    client.put(`/api/data/tasks/${taskId}`, data, callback)
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

  subscribeToSequence (sequenceId, taskTypeId, callback) {
    client.post(
      `/api/actions/user/sequences/${sequenceId}/task-types/` +
      `${taskTypeId}/subscribe`,
      {},
      callback
    )
  },

  unsubscribeFromSequence (sequenceId, taskTypeId, callback) {
    client.del(
      `/api/actions/user/sequences/${sequenceId}/task-types/` +
      `${taskTypeId}/unsubscribe`,
      callback
    )
  },

  getTaskComments (taskId, callback) {
    client.get(`/api/data/tasks/${taskId}/comments`, callback)
  },

  getTaskPreviews (taskId, callback) {
    client.get(`/api/data/tasks/${taskId}/previews`, callback)
  },

  commentTask (data) {
    const commentData = {
      task_status_id: data.taskStatusId,
      comment: data.comment
    }
    return client.ppost(
      `/api/actions/tasks/${data.taskId}/comment`,
      commentData
    )
  },

  getTaskComment (data, callback) {
    client.get(`/api/data/comments/${data.id}`, callback)
  },

  editTaskComment (comment, callback) {
    const commentData = {
      text: comment.text,
      checklist: comment.checklist
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
    client.del(`/api/data/tasks/${task.id}?force=true`, callback)
  },

  deleteAllTasks (projectId, taskTypeId, callback) {
    client.del(
      `/api/data/projects/${projectId}/task-types/${taskTypeId}/tasks`,
      callback
    )
  },

  addPreview (data) {
    const taskId = data.taskId
    const commentId = data.commentId
    return client.ppost(
      `/api/actions/tasks/${taskId}/comments/${commentId}/add-preview`,
      {}
    )
  },

  addExtraPreview (previewId, taskId, commentId) {
    return client.ppost(
      `/api/actions/tasks/${taskId}/comments/${commentId}/preview-files/` +
      `${previewId}`,
      {}
    )
  },

  deletePreview (taskId, commentId, previewId) {
    return client.pdel(
      `/api/actions/tasks/${taskId}/comments/${commentId}/preview-files/` +
      `${previewId}`
    )
  },

  setPreview (entityId, previewId, callback) {
    return client.pput(
      `/api/actions/entities/${entityId}/set-main-preview/${previewId}`,
      {}
    )
  },

  uploadPreview (previewId, formData) {
    return client.ppost(
      `/api/pictures/preview-files/${previewId}`,
      formData
    )
  },

  updatePreviewAnnotation (preview, annotations) {
    return new Promise((resolve, reject) => {
      client.put(
        `/api/data/preview-files/${preview.id}`,
        { annotations },
        (err, preview) => {
          if (err) reject(err)
          else resolve(preview)
        }
      )
    })
  },

  getPreviewFile (previewId) {
    return new Promise((resolve, reject) => {
      client.get(
        `/api/data/preview-files/${previewId}`,
        (err, preview) => {
          if (err) reject(err)
          else resolve(preview)
        }
      )
    })
  },

  assignTasks (personId, selectedTaskIds, callback) {
    client.put(
      `/api/actions/persons/${personId}/assign`,
      { task_ids: selectedTaskIds },
      callback
    )
  },

  unassignTasks (selectedTaskIds, callback) {
    client.put(
      `/api/actions/tasks/clear-assignation`,
      { task_ids: selectedTaskIds },
      callback
    )
  },

  pinComment (comment) {
    return new Promise((resolve, reject) => {
      const data = {
        pinned: comment.pinned
      }
      client.put(
        `/api/data/comments/${comment.id}`,
        data,
        (err, comment) => {
          if (err) reject(err)
          else resolve(comment)
        }
      )
    })
  }
}
