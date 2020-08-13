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
    return client.ppost('/api/data/entity-types', data)
  },

  updateAssetType (assetType, callback) {
    const data = {
      name: assetType.name
    }
    return client.pput(`/api/data/entity-types/${assetType.id}`, data)
  },

  deleteAssetType (assetType, callback) {
    return client.pdel(`/api/data/entity-types/${assetType.id}`)
  }
}
