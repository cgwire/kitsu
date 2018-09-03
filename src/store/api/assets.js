import client from './client'

export default {
  getAssets (currentProduction, callback) {
    let path = '/api/data/assets/with-tasks'
    if (currentProduction) {
      path += `?project_id=${currentProduction.id}`
    }
    client.get(path, callback)
  },

  getAsset (assetId, callback) {
    const path = `/api/data/assets/${assetId}`
    client.get(path, callback)
  },

  getCastIn (asset, callback) {
    client.get(`/api/data/assets/${asset.id}/cast-in`, callback)
  },

  newAsset (asset, callback) {
    const data = {
      name: asset.name,
      description: asset.description,
      entity_type_id: asset.entity_type_id,
      project_id: asset.project_id
    }
    client.post(`/api/data/entities/`, data, callback)
  },

  updateAsset (asset, callback) {
    const data = {
      name: asset.name,
      description: asset.description,
      entity_type_id: asset.entity_type_id,
      project_id: asset.project_id
    }
    client.put(`/api/data/entities/${asset.id}`, data, callback)
  },

  deleteAsset (asset, callback) {
    if (asset.canceled) {
      client.del(`/api/data/assets/${asset.id}?force=true`, callback)
    } else {
      client.del(`/api/data/assets/${asset.id}`, callback)
    }
  },

  restoreAsset (asset, callback) {
    const data = { canceled: false }
    client.put(`/api/data/entities/${asset.id}`, data, callback)
  },

  postCsv (production, formData, callback) {
    client.post(
      `/api/import/csv/projects/${production.id}/assets`, formData, callback
    )
  }
}
