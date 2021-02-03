import client from './client'

export default {
  getMilestones (production) {
    return new Promise((resolve, reject) => {
      if (production) {
        const path = `/api/data/projects/${production.id}/milestones`
        client.get(path, (err, milestones) => {
          if (err) reject(err)
          else resolve(milestones)
        })
      } else {
        resolve([])
      }
    })
  },

  createMilestone (production, milestone) {
    const data = {
      date: milestone.date.format('YYYY-MM-DD'),
      name: milestone.name,
      task_type_id: milestone.task_type_id,
      project_id: production.id
    }
    return client.ppost('/api/data/milestones', data)
  },

  updateMilestone (milestone) {
    const data = {
      date: milestone.date.format('YYYY-MM-DD'),
      name: milestone.name,
      task_type_id: milestone.task_type_id
    }
    const path = `/api/data/milestones/${milestone.id}`
    return client.pput(path, data)
  },

  deleteMilestone (milestone) {
    const path = `/api/data/milestones/${milestone.id}`
    return client.pdel(path)
  },

  getScheduleItems (production) {
    return client.pget(
      `/api/data/projects/${production.id}/schedule-items/task-types`)
  },

  getAllScheduleItems (production) {
    return client.pget(`/api/data/projects/${production.id}/schedule-items/`)
  },

  createScheduleItem (scheduleItem) {
    if (!scheduleItem.endDate) {
      scheduleItem.endDate = scheduleItem.startDate.add('days', 1).clone()
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

  deleteScheduleItem (scheduleItem) {
    const path = `/api/data/schedule-items/${scheduleItem.id}`
    return client.pdel(path)
  },

  getAssetTypeScheduleItems (production, taskType) {
    return this.getEntityScheduleItems(
      production, taskType, 'asset-types'
    )
  },

  getSequenceScheduleItems (production, taskType) {
    return this.getEntityScheduleItems(
      production, taskType, 'sequences'
    )
  },

  getEpisodeScheduleItems (production, taskType) {
    return this.getEntityScheduleItems(
      production, taskType, 'episodes'
    )
  },

  getEntityScheduleItems (production, taskType, entity) {
    return client.pget(
        `/api/data/projects/${production.id}/schedule-items/` +
        `${taskType.id}/${entity}`)
  },

  updateScheduleItem (scheduleItem) {
    if (!scheduleItem.endDate) {
      scheduleItem.endDate = scheduleItem.startDate.add('days', 1).clone()
    }
    const manDays = scheduleItem.man_days
    const data = {
      start_date: scheduleItem.startDate.format('YYYY-MM-DD'),
      end_date: scheduleItem.endDate.format('YYYY-MM-DD')
    }
    if (manDays) data.man_days = parseInt(manDays)
    return client.pput(`/api/data/schedule-items/${scheduleItem.id}`, data)
  }
}
