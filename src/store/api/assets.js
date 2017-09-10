import client from './client'

export default {
  getAssets (callback) {
    client.get('/api/data/assets/with-tasks', callback)
  },

  getAssetType (callback) {
    client.get('/api/data/asset_type', callback)
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
    client.del(`/api/data/assets/${asset.id}`, callback)
  },

  postCsv (formData, callback) {
    client.post('/api/import/csv/assets', formData, callback)
  }
}
