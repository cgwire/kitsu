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
      project_status_id: production.project_status_id,
      production_type: production.production_type
    }
    client.post(`/api/data/projects/`, data, callback)
  },

  updateProduction (production, callback) {
    const data = {
      name: production.name,
      project_status_id: production.project_status_id,
      production_type: production.production_type,
      fps: production.fps,
      ratio: production.ratio,
      resolution: production.resolution
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
  },

  removePersonFromTeam (productionId, personId) {
    return new Promise((resolve, reject) => {
      client.del(
        `/api/data/projects/${productionId}/team/${personId}`,
        (err, production) => {
          if (err) reject(err)
          else resolve(production)
        }
      )
    })
  },

  addMetadataDescriptor (productionId, descriptor) {
    return new Promise((resolve, reject) => {
      const data = {
        name: descriptor.name,
        choices: descriptor.values,
        entity_type: descriptor.entity_type
      }
      client.post(
        `/api/data/projects/${productionId}/metadata-descriptors`,
        data,
        (err, descriptor) => {
          if (err) reject(err)
          else resolve(descriptor)
        }
      )
    })
  },

  getMetadataDescriptor (productionId, descriptorId) {
    return new Promise((resolve, reject) => {
      client.get(
        `/api/data/projects/${productionId}/metadata-descriptors/${descriptorId}`,
        (err, descriptor) => {
          if (err) reject(err)
          else resolve(descriptor)
        }
      )
    })
  },

  updateMetadataDescriptor (productionId, descriptor) {
    return new Promise((resolve, reject) => {
      const data = {
        id: descriptor.id,
        name: descriptor.name,
        choices: descriptor.values,
        entity_type: descriptor.entity_type
      }
      client.put(
        `/api/data/projects/${productionId}/metadata-descriptors/${descriptor.id}`,
        data,
        (err, descriptor) => {
          if (err) reject(err)
          else resolve(descriptor)
        }
      )
    })
  },

  deleteMetadataDescriptor (productionId, descriptorId) {
    return new Promise((resolve, reject) => {
      client.del(
        `/api/data/projects/${productionId}/metadata-descriptors/${descriptorId}`,
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })
  }
}
