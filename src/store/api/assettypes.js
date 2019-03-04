import client from './client'

export default {
  getAssetTypes (callback) {
    client.get('/api/data/asset-types', callback)
  },

  getAssetType (assetTypeId, callback) {
    client.get(`/api/data/entity-types/${assetTypeId}`, callback)
  },

  newAssetType (assetType, callback) {
    const data = {
      name: assetType.name
    }
    client.post('/api/data/entity-types', data, callback)
  },

  updateAssetType (assetType, callback) {
    const data = {
      name: assetType.name
    }
    client.put(`/api/data/entity-types/${assetType.id}`, data, callback)
  },

  deleteAssetType (assetType, callback) {
    client.del(`/api/data/entity-types/${assetType.id}`, callback)
  }
}
