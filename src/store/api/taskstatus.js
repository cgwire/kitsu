import client from '@/store/api/client'

const sanitizeTaskStatus = taskStatus => {
  return {
    name: taskStatus.name,
    short_name: taskStatus.short_name,
    for_concept: Boolean(taskStatus.for_concept === 'true'),
    is_default: Boolean(taskStatus.is_default === 'true'),
    is_done: Boolean(taskStatus.is_done === 'true'),
    is_retake: Boolean(taskStatus.is_retake === 'true'),
    is_artist_allowed: Boolean(taskStatus.is_artist_allowed === 'true'),
    is_client_allowed: Boolean(taskStatus.is_client_allowed === 'true'),
    is_feedback_request: Boolean(taskStatus.is_feedback_request === 'true'),
    archived: Boolean(taskStatus.archived === 'true'),
    color: taskStatus.color
  }
}

export default {
  getTaskStatuses(callback) {
    client.get('/api/data/task-status', callback)
  },

  getTaskStatus(taskStatusId, callback) {
    client.get(`/api/data/task-status/${taskStatusId}`, callback)
  },

  newTaskStatus(taskStatus) {
    const data = sanitizeTaskStatus(taskStatus)
    return client.ppost('/api/data/task-status/', data)
  },

  updateTaskStatus(taskStatus) {
    const data = sanitizeTaskStatus(taskStatus)
    return client.pput(`/api/data/task-status/${taskStatus.id}`, data)
  },

  async updateTaskStatusLink(taskStatusLink) {
    const data = {
      project_id: taskStatusLink.projectId,
      task_status_id: taskStatusLink.taskStatusId,
      priority: taskStatusLink.priority
    }
    return await client.ppost('/api/data/task-status-links', data)
  },

  deleteTaskStatus(taskStatus) {
    return client.pdel(`/api/data/task-status/${taskStatus.id}`)
  }
}
