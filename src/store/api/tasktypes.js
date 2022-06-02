import client from './client'

export default {
  getTaskTypes () {
    return client.pget('/api/data/task-types')
  },

  newTaskType (taskType) {
    const data = {
      name: taskType.name,
      color: taskType.color,
      priority: Number(taskType.priority),
      for_entity: taskType.for_entity,
      allow_timelog: Boolean(taskType.allow_timelog === 'true'),
      department_id: taskType.department_id
    }
    return client.ppost('/api/data/task-types/', data)
  },

  updateTaskType (taskType) {
    const data = {
      name: taskType.name,
      color: taskType.color,
      department_id: taskType.department_id
    }
    if (taskType.priority && taskType.priority > 0) {
      data.priority = Number(taskType.priority)
    }
    if (taskType.allow_timelog !== undefined) {
      data.allow_timelog = Boolean(taskType.allow_timelog === 'true')
    }
    return client.pput(`/api/data/task-types/${taskType.id}`, data)
  },

  async updateTaskTypeLink (taskTypeLink) {
    const data = {
      project_id: taskTypeLink.projectId,
      task_type_id: taskTypeLink.taskTypeId,
      priority: taskTypeLink.priority
    }
    return await client.ppost('/api/data/task-type-links', data)
  },

  deleteTaskType (taskType) {
    return client.pdel(`/api/data/task-types/${taskType.id}`)
  },

  getTaskType (taskTypeId) {
    return client.pget(`/api/data/task-types/${taskTypeId}`)
  },

  postTaskTypeEstimations (production, episode, taskType, formData) {
    const episodePath = episode ? `episodes/${episode.id}/` : ''
    const path = `/api/import/csv/projects/${production.id}/${episodePath}task-types/${taskType.id}/estimations`
    return client.ppost(path, formData)
  }
}
