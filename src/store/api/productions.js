import client from './client'

export default {
  getProductions (callback) {
    client.get('/api/data/projects/all', callback)
  },

  getProduction (productionId) {
    return client.getModel('projects', productionId)
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
    client.post('/api/data/projects/', data, callback)
  },

  updateProduction (production, callback) {
    const data = {
      name: production.name,
      project_status_id: production.project_status_id,
      production_type: production.production_type,
      fps: production.fps,
      ratio: production.ratio,
      resolution: production.resolution,
      start_date: production.start_date,
      end_date: production.end_date,
      man_days: production.man_days
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
    client.del(`/api/data/projects/${production.id}?force=true`, callback)
  },

  addPersonToTeam (productionId, personId) {
    const data = { person_id: personId }
    return client.ppost(`/api/data/projects/${productionId}/team`, data)
  },

  removePersonFromTeam (productionId, personId) {
    return client.pdel(`/api/data/projects/${productionId}/team/${personId}`)
  },

  addAssetTypeToProduction (productionId, assetTypeId) {
    const data = { asset_type_id: assetTypeId }
    const path = `/api/data/projects/${productionId}/settings/asset-types`
    return client.ppost(path, data)
  },

  removeAssetTypeFromProduction (productionId, assetTypeId) {
    const path =
      `/api/data/projects/${productionId}/settings/asset-types/${assetTypeId}`
    return client.pdel(path)
  },

  addTaskTypeToProduction (productionId, taskTypeId) {
    const data = { task_type_id: taskTypeId }
    const path = `/api/data/projects/${productionId}/settings/task-types`
    return client.ppost(path, data)
  },

  removeTaskTypeFromProduction (productionId, taskTypeId) {
    const path =
      `/api/data/projects/${productionId}/settings/task-types/${taskTypeId}`
    return client.pdel(path)
  },

  addTaskStatusToProduction (productionId, taskStatusId) {
    const data = { task_status_id: taskStatusId }
    const path = `/api/data/projects/${productionId}/settings/task-status`
    return client.ppost(path, data)
  },

  removeTaskStatusFromProduction (productionId, taskStatusId) {
    const path =
      `/api/data/projects/${productionId}/settings/task-status/${taskStatusId}`
    return client.pdel(path)
  },

  addMetadataDescriptor (productionId, descriptor) {
    return new Promise((resolve, reject) => {
      const data = {
        name: descriptor.name,
        choices: descriptor.values,
        for_client: descriptor.for_client === 'true',
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
        for_client: descriptor.for_client === 'true',
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
