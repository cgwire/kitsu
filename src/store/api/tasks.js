import client from '@/store/api/client'

import { buildQueryString } from '../../lib/query'

export default {
  getTask(taskId) {
    return client.pget(`/api/data/tasks/${taskId}/full`)
  },

  getTasks(filters) {
    const path = '/api/data/tasks'
    return client.pget(buildQueryString(path, filters))
  },

  getOpenTasks(filters) {
    const path = '/api/data/tasks/open-tasks'
    return client.pget(buildQueryString(path, filters))
  },

  updateTask(taskId, data) {
    return client.pput(`/api/data/tasks/${taskId}`, data)
  },

  getTaskSubscribed(taskId) {
    return client.pget(`/api/data/user/tasks/${taskId}/subscribed`)
  },

  subscribeToTask(taskId) {
    return client.ppost(`/api/actions/user/tasks/${taskId}/subscribe`, {})
  },

  unsubscribeFromTask(taskId) {
    return client.pdel(`/api/actions/user/tasks/${taskId}/unsubscribe`)
  },

  getTaskComments(taskId) {
    return client.pget(`/api/data/tasks/${taskId}/comments`)
  },

  getTaskPreviews(taskId) {
    return client.pget(`/api/data/tasks/${taskId}/previews`)
  },

  commentTask(data) {
    let commentData = {
      task_status_id: data.taskStatusId,
      comment: data.comment,
      checklist: data.checklist || [],
      links: data.links
    }
    if (data.attachment?.length) {
      commentData = new FormData()
      data.attachment.forEach((attachment, index) => {
        commentData.append(`file-${index}`, attachment.get('file'))
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

  addAttachmentToComment(comment, files, replyId) {
    const attachments = new FormData()
    const taskId = comment.object_id
    if (replyId) {
      attachments.set('reply_id', replyId)
    }
    files.forEach((attachment, index) => {
      attachments.append(`file-${index}`, attachment.get('file'))
    })
    return client.ppost(
      `/api/actions/tasks/${taskId}/comments/${comment.id}/add-attachment`,
      attachments
    )
  },

  deleteAttachment(comment, attachment) {
    return client.pdel(
      `/api/data/tasks/${comment.object_id}/comments/${comment.id}/attachments/${attachment.id}`
    )
  },

  commentTasks(projectId, comments) {
    return client.ppost(
      `/api/actions/projects/${projectId}/tasks/comment-many`,
      comments
    )
  },

  getTaskComment(data) {
    return client.pget(`/api/data/comments/${data.id}?relations=true`)
  },

  editTaskComment(comment) {
    const data = {
      text: comment.text,
      task_status_id: comment.task_status_id,
      checklist: comment.checklist,
      links: comment.links
    }
    return client.pput(`/api/data/comments/${comment.id}`, data)
  },

  deleteTaskComment(taskId, commentId) {
    return client.pdel(`/api/data/tasks/${taskId}/comments/${commentId}`)
  },

  createTasks(data) {
    const taskTypeId = data.task_type_id
    const type = data.type
    const projectId = data.project_id
    const entityIds = data.entityIds
    const url = ['episodes', 'sequences'].includes(type)
      ? `/api/actions/projects/${projectId}/task-types/${taskTypeId}/create-tasks/${type.slice(0, -1)}`
      : `/api/actions/projects/${projectId}/task-types/${taskTypeId}/${type}/create-tasks`
    return client.ppost(url, entityIds)
  },

  createTask(data) {
    const entityId = data.entity_id
    const taskTypeId = data.task_type_id
    const type = data.type
    const projectId = data.project_id
    const url = ['episodes', 'sequences'].includes(type)
      ? `/api/actions/projects/${projectId}/task-types/${taskTypeId}/create-tasks/${type.slice(0, -1)}`
      : `/api/actions/projects/${projectId}/task-types/${taskTypeId}/${type}/create-tasks?id=${entityId}`
    return client.ppost(url, {})
  },

  deleteTask(task) {
    return client.pdel(`/api/data/tasks/${task.id}?force=true`)
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
      `/api/actions/tasks/${taskId}/comments/${commentId}/preview-files/${previewId}`,
      {}
    )
  },

  deletePreview(taskId, commentId, previewId) {
    return client.pdel(
      `/api/actions/tasks/${taskId}/comments/${commentId}/preview-files/${previewId}`
    )
  },

  setPreview(entityId, previewId, frame) {
    const data = frame !== undefined ? { frame_number: frame } : {}
    return client.pput(
      `/api/actions/preview-files/${previewId}/set-main-preview`,
      data
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

  assignTasks(personId, selectedTaskIds) {
    return client.pput(`/api/actions/persons/${personId}/assign`, {
      task_ids: selectedTaskIds
    })
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

  replyToComment(comment, text, attachments) {
    let replyData = { text }
    if (attachments?.length) {
      replyData = new FormData()
      attachments.forEach((attachment, index) => {
        replyData.append(`file-${index}`, attachment.get('file'))
      })
      replyData.set('text', text)
    }
    const path = `/api/data/tasks/${comment.object_id}/comments/${comment.id}/reply`
    return client.ppost(path, replyData)
  },

  deleteReply(comment, reply) {
    const path = `/api/data/tasks/${comment.object_id}/comments/${comment.id}/reply/${reply.id}`
    return client.pdel(path)
  },

  updateRevisionPreviewPosition(previewId, position) {
    const path = `/api/actions/preview-files/${previewId}/update-position`
    return client.pput(path, { position: position + 1 })
  },

  getPersonsTasksDates() {
    return client.pget('/api/data/persons/task-dates')
  }
}
