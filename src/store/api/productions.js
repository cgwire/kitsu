import client from './client'

export default {
  getProductions (callback) {
    client.get('/api/data/projects/all', callback)
  },

  getOpenProductions (callback) {
    client.get('/api/data/projects/open', callback)
  },

  getProductionStatus (callback) {
    client.get('/api/data/project-status', callback)
  },

  newProduction (production, callback) {
    const data = {
      name: production.name,
      project_status_id: production.project_status_id
    }
    client.post(`/api/data/projects/`, data, callback)
  },

  updateProduction (production, callback) {
    const data = {
      name: production.name,
      project_status_id: production.project_status_id
    }
    client.put(`/api/data/projects/${production.id}`, data, callback)
  },

  postAvatar (productionId, formData, callback) {
    client.post(
      `/api/pictures/thumbnails/projects/${productionId}`,
      formData,
      callback
    )
  },

  deleteProduction (production, callback) {
    client.del(`/api/data/projects/${production.id}`, callback)
  },

  addPersonToTeam (productionId, personId) {
    return new Promise((resolve, reject) => {
      const data = {
        person_id: personId
      }
      client.post(
        `/api/data/projects/${productionId}/team`,
        data,
        (err, production) => {
          if (err) reject(err)
          else resolve(production)
        }
      )
    })
  }
}
