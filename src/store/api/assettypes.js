import client from '@/store/api/client'

export default {
  getAssetTypes() {
    return client.pget('/api/data/asset-types')
  },

  getAssetType(assetTypeId) {
    return client.pget(`/api/data/entity-types/${assetTypeId}`)
  },

  newAssetType(assetType) {
    const data = {
      name: assetType.name,
      short_name: assetType.short_name,
      description: assetType.description,
      task_types: assetType.task_types
    }
    return client.ppost('/api/data/entity-types', data)
  },

  updateAssetType(assetType) {
    const data = {
      name: assetType.name,
      short_name: assetType.short_name,
      description: assetType.description,
      task_types: assetType.task_types,
      archived: assetType.archived === 'true'
    }
    return client.pput(`/api/data/entity-types/${assetType.id}`, data)
  },

  deleteAssetType(assetType) {
    return client.pdel(`/api/data/entity-types/${assetType.id}`)
  }
}
