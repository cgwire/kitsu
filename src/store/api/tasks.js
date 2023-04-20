import client from '@/store/api/client'

export default {
  getTask(taskId, callback) {
    return client.pget(`/api/data/tasks/${taskId}/full`)
  },

  updateTask(taskId, data, callback) {
    return client.pput(`/api/data/tasks/${taskId}`, data, callback)
  },

  getTaskStatuses(callback) {
    client.get('/api/data/task-status', callback)
  },

  getTaskSubscribed(taskId, callback) {
    return client.pget(`/api/data/user/tasks/${taskId}/subscribed`)
  },

  subscribeToTask(taskId, callback) {
    return client.ppost(`/api/actions/user/tasks/${taskId}/subscribe`, {})
  },

  unsubscribeFromTask(taskId, callback) {
    return client.pdel(`/api/actions/user/tasks/${taskId}/unsubscribe`)
  },

  getTaskComments(taskId, callback) {
    return client.pget(`/api/data/tasks/${taskId}/comments`)
  },

  getTaskPreviews(taskId, callback) {
    return client.pget(`/api/data/tasks/${taskId}/previews`)
  },

  commentTask(data) {
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

  addAttachmentToComment(comment, files) {
    const attachments = new FormData()
    const taskId = comment.object_id
    let i = 0
    files.forEach(attachment => {
      attachments.append('file-' + i, attachment.get('file'))
      i++
    })
    return client.ppost(
      `/api/actions/tasks/${taskId}/comments/${comment.id}/add-attachment`,
      attachments
    )
  },

  deleteAttachment(comment, attachment) {
    return client.pdel(
      `/api/data/tasks/${comment.object_id}/comments/${comment.id}/` +
        `attachments/${attachment.id}`
    )
  },

  commentTasks(projectId, comments) {
    return client.ppost(
      `/api/actions/projects/${projectId}/tasks/comment-many`,
      comments
    )
  },

  getTaskComment(data) {
    return client.pget(`/api/data/comments/${data.id}`)
  },

  editTaskComment(comment, callback) {
    const commentData = {
      text: comment.text,
      task_status_id: comment.task_status_id,
      checklist: comment.checklist
    }
    return client.pput(`/api/data/comments/${comment.id}`, commentData)
  },

  deleteTaskComment(taskId, commentId, callback) {
    return client.pdel(`/api/data/tasks/${taskId}/comments/${commentId}`)
  },

  createTasks(data) {
    const taskTypeId = data.task_type_id
    const type = data.type
    const projectId = data.project_id
    const entityIds = data.entityIds
    let url =
      `/api/actions/projects/${projectId}/task-types/${taskTypeId}/${type}/` +
      'create-tasks'
    if (['episodes', 'sequences'].includes(data.type)) {
      url =
        `/api/actions/projects/${projectId}/task-types/` +
        `${taskTypeId}/create-tasks/` +
        `${data.type.substring(0, data.type.length - 1)}`
    }
    return client.ppost(url, entityIds)
  },

  createTask(data) {
    const entityId = data.entity_id
    const taskTypeId = data.task_type_id
    const type = data.type
    const projectId = data.project_id
    let url =
      `/api/actions/projects/${projectId}/task-types/${taskTypeId}/${type}/` +
      `create-tasks?id=${entityId}`
    if (['episodes', 'sequences'].includes(data.type)) {
      url =
        `/api/actions/projects/${projectId}/task-types/` +
        `${taskTypeId}/create-tasks/` +
        `${data.type.substring(0, data.type.length - 1)}`
    }
    return client.ppost(url, {})
  },

  deleteTask(task, callback) {
    client.del(`/api/data/tasks/${task.id}?force=true`, callback)
  },

  deleteAllTasks(projectId, taskTypeId, taskIds) {
    if (taskIds && taskIds.length > 0) {
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

  addPreview(data) {
    const taskId = data.taskId
    const commentId = data.commentId
    const revision = data.revision
    return client.ppost(
      `/api/actions/tasks/${taskId}/comments/${commentId}/add-preview`,
      { revision }
    )
  },

  addExtraPreview(previewId, taskId, commentId) {
    return client.ppost(
      `/api/actions/tasks/${taskId}/comments/${commentId}/preview-files/` +
        `${previewId}`,
      {}
    )
  },

  deletePreview(taskId, commentId, previewId) {
    return client.pdel(
      `/api/actions/tasks/${taskId}/comments/${commentId}/preview-files/` +
        `${previewId}`
    )
  },

  setPreview(entityId, previewId) {
    return client.pput(
      `/api/actions/preview-files/${previewId}/set-main-preview`,
      {}
    )
  },

  setLastTaskPreviewAsEntityThumbnail(taskId) {
    return client.pput(`/api/actions/tasks/${taskId}/set-main-preview`, {})
  },

  uploadPreview(previewId, formData) {
    return client.ppostFile(
      `/api/pictures/preview-files/${previewId}`,
      formData
    )
  },

  updatePreviewAnnotation(preview, additions, updates, deletions) {
    return client.pput(
      `/api/actions/preview-files/${preview.id}/update-annotations`,
      { additions, updates, deletions }
    )
  },

  getPreviewFile(previewId) {
    return client.pget(`/api/data/preview-files/${previewId}`)
  },

  assignTasks(personId, selectedTaskIds, callback) {
    client.put(
      `/api/actions/persons/${personId}/assign`,
      { task_ids: selectedTaskIds },
      callback
    )
  },

  unassignTasks(selectedTaskIds) {
    return client.pput('/api/actions/tasks/clear-assignation', {
      task_ids: selectedTaskIds
    })
  },

  unassignPersonFromTask(taskId, personId) {
    return client.pput('/api/actions/tasks/clear-assignation', {
      task_ids: [taskId],
      person_id: personId
    })
  },

  pinComment(comment) {
    const data = {
      pinned: comment.pinned
    }
    return client.pput(`/api/data/comments/${comment.id}`, data)
  },

  ackComment(comment) {
    const path = `/api/data/tasks/${comment.object_id}/comments/${comment.id}/ack`
    return client.ppost(path, {})
  },

  replyToComment(comment, text) {
    const path = `/api/data/tasks/${comment.object_id}/comments/${comment.id}/reply`
    return client.ppost(path, { text })
  },

  deleteReply(comment, reply) {
    const path =
      `/api/data/tasks/${comment.object_id}` +
      `/comments/${comment.id}/reply/${reply.id}`
    return client.pdel(path)
  },

  updateRevisionPreviewPosition(previewId, position) {
    const path = `/api/actions/preview-files/${previewId}/update-position`
    return client.pput(path, { position: position + 1 })
  }
}
