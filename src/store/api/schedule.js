import client from '@/store/api/client'

export default {
  getMilestones(production) {
    const path = `/api/data/projects/${production.id}/milestones`
    return client.pget(path)
  },

  createMilestone(production, milestone) {
    const data = {
      date: milestone.date.format('YYYY-MM-DD'),
      name: milestone.name,
      task_type_id: milestone.task_type_id,
      project_id: production.id
    }
    return client.ppost('/api/data/milestones', data)
  },

  updateMilestone(milestone) {
    const data = {
      date: milestone.date.format('YYYY-MM-DD'),
      name: milestone.name,
      task_type_id: milestone.task_type_id
    }
    const path = `/api/data/milestones/${milestone.id}`
    return client.pput(path, data)
  },

  deleteMilestone(milestone) {
    const path = `/api/data/milestones/${milestone.id}`
    return client.pdel(path)
  },

  getScheduleItems(production) {
    return client.pget(
      `/api/data/projects/${production.id}/schedule-items/task-types`
    )
  },

  getAllScheduleItems(production) {
    return client.pget(`/api/data/projects/${production.id}/schedule-items/`)
  },

  createScheduleItem(scheduleItem) {
    if (!scheduleItem.endDate) {
      scheduleItem.endDate = scheduleItem.startDate.add(1, 'days').clone()
    }
    const manDays = scheduleItem.man_days
    const data = {
      start_date: scheduleItem.startDate.format('YYYY-MM-DD'),
      end_date: scheduleItem.endDate.format('YYYY-MM-DD'),
      project_id: scheduleItem.project_id,
      task_type_id: scheduleItem.task_type_id
    }
    if (manDays) data.man_days = parseInt(manDays)
    return client.ppost('/api/data/schedule-items/', data)
  },

  deleteScheduleItem(scheduleItem) {
    const path = `/api/data/schedule-items/${scheduleItem.id}`
    return client.pdel(path)
  },

  getAssetTypeScheduleItems(production, taskType) {
    return this.getEntityScheduleItems(production, taskType, 'asset-types')
  },

  getSequenceScheduleItems(production, taskType) {
    return this.getEntityScheduleItems(production, taskType, 'sequences')
  },

  getEpisodeScheduleItems(production, taskType) {
    return this.getEntityScheduleItems(production, taskType, 'episodes')
  },

  getEntityScheduleItems(production, taskType, entity) {
    return client.pget(
      `/api/data/projects/${production.id}/schedule-items/` +
        `${taskType.id}/${entity}`
    )
  },

  updateScheduleItem(scheduleItem) {
    if (!scheduleItem.endDate) {
      scheduleItem.endDate = scheduleItem.startDate.add(1, 'days').clone()
    }
    const manDays = scheduleItem.man_days
    const data = {
      start_date: scheduleItem.startDate.format('YYYY-MM-DD'),
      end_date: scheduleItem.endDate.format('YYYY-MM-DD')
    }
    if (manDays) data.man_days = parseInt(manDays)
    return client.pput(`/api/data/schedule-items/${scheduleItem.id}`, data)
  },

  getScheduleVersions(production) {
    return client.pget(
      `/api/data/production-schedule-versions?project_id=${production.id}`
    )
  },

  getScheduleVersion(version) {
    return client.pget(`/api/data/production-schedule-versions/${version.id}`)
  },

  createScheduleVersion(production, version) {
    const data = {
      project_id: production.id,
      name: version.name,
      from: version.from
    }
    return client.ppost(`/api/data/production-schedule-versions/`, data)
  },

  updateScheduleVersion(version) {
    const data = {
      name: version.name,
      canceled: version.canceled,
      locked: version.locked
    }
    return client.pput(
      `/api/data/production-schedule-versions/${version.id}`,
      data
    )
  },

  deleteScheduleVersion(version) {
    return client.pdel(`/api/data/production-schedule-versions/${version.id}`)
  },

  createTasksFromProduction(version) {
    return client.ppost(
      `/api/actions/production-schedule-versions/${version.id}/set-task-links-from-production`
    )
  },

  createTasksFromScheduleVersion(version, fromVersion) {
    const data = {
      production_schedule_version_id: fromVersion.id
    }
    return client.ppost(
      `/api/actions/production-schedule-versions/${version.id}/set-task-links-from-production-schedule-version`,
      data
    )
  },

  getTasksFromScheduleVersion(version, taskType = null) {
    let url = `/api/data/production-schedule-versions/${version.id}/task-links?relations=true`
    if (taskType?.id) {
      url += `&task_type_id=${taskType.id}`
    }
    return client.pget(url)
  },

  getTaskFromScheduleVersion(taskLink) {
    return client.pget(
      `/api/data/production-schedule-version-task-links/${taskLink.id}`
    )
  },

  createTaskFromScheduleVersion(taskLink) {
    const data = {
      task_id: taskLink.taskId,
      production_schedule_version_id: taskLink.version,
      start_date: taskLink.startDate,
      due_date: taskLink.dueDate,
      estimation: taskLink.estimation,
      assignees: taskLink.assignees
    }
    return client.ppost(
      `/api/data/production-schedule-version-task-links`,
      data
    )
  },

  updateTaskFromScheduleVersion(taskLink) {
    const data = {
      start_date: taskLink.startDate,
      due_date: taskLink.dueDate,
      estimation: taskLink.estimation,
      assignees: taskLink.assignees
    }
    return client.pput(
      `/api/data/production-schedule-version-task-links/${taskLink.id}`,
      data
    )
  },

  deleteTaskFromScheduleVersion(taskLink) {
    return client.pdel(
      `/api/data/production-schedule-version-task-links/${taskLink.id}`
    )
  },

  applyScheduleVersionToProduction(version) {
    return client.ppost(
      `/api/actions/production-schedule-versions/${version.id}/apply-to-production`
    )
  }
}
