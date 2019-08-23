import client from './client'

export default {
  getMilestones (production) {
    return new Promise((resolve, reject) => {
      const path =`/api/data/projects/${production.id}/milestones`
      client.get(path, (err, milestones) => {
          if (err) reject(err)
          else resolve(milestones)
        }
      )
    })
  },

  createMilestone (production, milestone) {
    return new Promise((resolve, reject) => {
      const data = {
        date: milestone.startDate.format('YYYY-MM-DD'),
        name: milestone.name,
        task_type_id: milestone.task_type_id,
        project_id: production.id
      }
      client.post(`/api/data/milestones`, data, (err, milestone) => {
          if (err) reject(err)
          else resolve(milestone)
        }
      )
    })
  },

  updateMilestone (milestone) {
    return new Promise((resolve, reject) => {
      const data = {
        date: milestone.startDate.format('YYYY-MM-DD'),
        name: milestone.name,
        task_type_id: milestone.task_type_id
      }
      const path = `/api/data/milestones/${milestone.id}`
      client.put(path, data, (err, milestone) => {
          if (err) reject(err)
          else resolve(milestone)
        }
      )
    })
  },

  deleteMilestone (milestone) {
    return new Promise((resolve, reject) => {
      const path =`/api/data/milestones/${milestone.id}`
      client.del(path, (err) => {
          if (err) reject(err)
          else resolve(milestone)
        }
      )
    })
  }
}
