import client from './client'

export default {
  getAssets (production, episode) {
    let path = '/api/data/assets/with-tasks'
    if (production) {
      path += `?project_id=${production.id}`
    }
    if (episode) {
      path += `&episode_id=${episode.id}`
    }
    return client.pget(path)
  },

  getAsset (assetId) {
    return client.getModel('assets', assetId)
  },

  newAsset (asset, callback) {
    const data = {
      name: asset.name,
      description: asset.description,
      data: asset.data
    }
    if (asset.source_id !== 'null') {
      data.episode_id = asset.source_id
    }

    const path = `/api/data/projects/${asset.project_id}/asset-types/` +
                 `${asset.entity_type_id}/assets/new`
    client.post(path, data, callback)
  },

  updateAsset (asset, callback) {
    const data = {
      name: asset.name,
      description: asset.description,
      entity_type_id: asset.entity_type_id,
      project_id: asset.project_id,
      data: asset.data
    }
    if (asset.source_id === 'null' || asset.source_id) {
      data.source_id = asset.source_id
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

  postCsv (production, formData, toUpdate) {
    let path = `/api/import/csv/projects/${production.id}/assets`
    if (toUpdate) path += '?update=true'
    return client.ppost(path, formData)
  }
}
