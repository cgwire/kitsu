import client from './client'

export default {
  getTask (taskId, callback) {
    return client.pget(`/api/data/tasks/${taskId}/full`)
  },

  updateTask (taskId, data, callback) {
    return client.pput(`/api/data/tasks/${taskId}`, data, callback)
  },

  getTaskStatuses (callback) {
    client.get('/api/data/task-status', callback)
  },

  getTaskSubscribed (taskId, callback) {
    return client.pget(`/api/data/user/tasks/${taskId}/subscribed`)
  },

  subscribeToTask (taskId, callback) {
    return client.ppost(`/api/actions/user/tasks/${taskId}/subscribe`, {})
  },

  unsubscribeFromTask (taskId, callback) {
    return client.pdel(`/api/actions/user/tasks/${taskId}/unsubscribe`)
  },

  getTaskComments (taskId, callback) {
    return client.pget(`/api/data/tasks/${taskId}/comments`)
  },

  getTaskPreviews (taskId, callback) {
    return client.pget(`/api/data/tasks/${taskId}/previews`)
  },

  commentTask (data) {
    let commentData = {
      task_status_id: data.taskStatusId,
      comment: data.comment,
      checklist: data.checklist || []
    }
    if (data.attachment && data.attachment.length > 0) {
      commentData = new FormData()
      let i = 0
      data.attachment.forEach(attachment => {
        commentData.append('file-' + i, attachment.get('file'))
        i++
      })
      commentData.set('task_status_id', data.taskStatusId)
      commentData.set('comment', data.comment)
      commentData.set('checklist', JSON.stringify(data.checklist || []))
    }
    return client.ppost(
      `/api/actions/tasks/${data.taskId}/comment`,
      commentData
    )
  },

  commentTasks (projectId, comments) {
    return client.ppost(
      `/api/actions/projects/${projectId}/tasks/comment-many`,
      comments
    )
  },

  getTaskComment (data, callback) {
    return client.pget(`/api/data/comments/${data.id}`)
  },

  editTaskComment (comment, callback) {
    const commentData = {
      text: comment.text,
      task_status_id: comment.task_status_id,
      checklist: comment.checklist
    }
    return client.pput(`/api/data/comments/${comment.id}`, commentData)
  },

  deleteTaskComment (taskId, commentId, callback) {
    return client.pdel(`/api/data/tasks/${taskId}/comments/${commentId}`)
  },

  createTasks (data) {
    const taskTypeId = data.task_type_id
    const type = data.type
    const projectId = data.project_id
    const entityIds = data.entityIds
    return client.ppost(
      `/api/actions/projects/${projectId}/task-types/${taskTypeId}/${type}/` +
      'create-tasks',
      entityIds
    )
  },

  createTask (data, callback) {
    const entityId = data.entity_id
    const taskTypeId = data.task_type_id
    const type = data.type
    const projectId = data.project_id
    client.post(
      `/api/actions/projects/${projectId}/task-types/${taskTypeId}/${type}/` +
      `create-tasks?id=${entityId}`,
      {},
      callback
    )
  },

  deleteTask (task, callback) {
    client.del(`/api/data/tasks/${task.id}?force=true`, callback)
  },

  deleteAllTasks (projectId, taskTypeId, taskIds) {
    if (taskIds.length > 0) {
      return client.ppost(
        `/api/actions/projects/${projectId}/delete-tasks`,
        taskIds
      )
    } else {
      return client.pdel(
        `/api/actions/projects/${projectId}/task-types/${taskTypeId}/delete-tasks`
      )
    }
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
    return client.pput(
      `/api/data/preview-files/${preview.id}`,
      { annotations }
    )
  },

  getPreviewFile (previewId) {
    return client.pget(`/api/data/preview-files/${previewId}`)
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
      '/api/actions/tasks/clear-assignation',
      { task_ids: selectedTaskIds },
      callback
    )
  },

  pinComment (comment) {
    const data = {
      pinned: comment.pinned
    }
    return client.pput(`/api/data/comments/${comment.id}`, data)
  },

  ackComment (comment) {
    const path =
      `/api/data/tasks/${comment.object_id}/comments/${comment.id}/ack`
    return client.ppost(path, {})
  },

  updateRevisionPreviewPosition (previewId, position) {
    const path =
      `/api/actions/preview-files/${previewId}/update-position`
    console.log('request', position + 1)
    return client.pput(path, { position: position + 1 })
  }
}
