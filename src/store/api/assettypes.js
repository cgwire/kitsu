import client from '@/store/api/client'

export default {
  getAssetTypes (callback) {
    client.get('/api/data/asset-types', callback)
  },

  getAssetType (assetTypeId, callback) {
    client.get(`/api/data/entity-types/${assetTypeId}`, callback)
  },

  newAssetType (assetType) {
    const data = {
      name: assetType.name,
      task_types: assetType.task_types
    }
    return client.ppost('/api/data/entity-types', data)
  },

  updateAssetType (assetType) {
    const data = {
      name: assetType.name,
      task_types: assetType.task_types
    }
    return client.pput(`/api/data/entity-types/${assetType.id}`, data)
  },

  deleteAssetType (assetType) {
    return client.pdel(`/api/data/entity-types/${assetType.id}`)
  }
}
