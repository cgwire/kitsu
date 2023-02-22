import client from '@/store/api/client'

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
    return client.getModel('assets', assetId, true)
  },

  newAsset (asset) {
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
    return client.ppost(path, data)
  },

  updateAsset (asset) {
    const data = {
      name: asset.name,
      description: asset.description,
      entity_type_id: asset.entity_type_id,
      project_id: asset.project_id,
      ready_for: asset.ready_for,
      data: asset.data
    }
    if (asset.is_casting_standby !== undefined) {
      data.is_casting_standby = Boolean(asset.is_casting_standby)
    }
    if (asset.source_id === 'null' || asset.source_id) {
      data.source_id = asset.source_id
    }
    return client.pput(`/api/data/entities/${asset.id}`, data)
  },

  deleteAsset (asset) {
    if (asset.canceled) {
      return client.pdel(`/api/data/assets/${asset.id}?force=true`)
    } else {
      return client.pdel(`/api/data/assets/${asset.id}`)
    }
  },

  restoreAsset (asset) {
    const data = { canceled: false }
    return client.pput(`/api/data/entities/${asset.id}`, data)
  },

  postCsv (production, formData, toUpdate) {
    let path = `/api/import/csv/projects/${production.id}/assets`
    if (toUpdate) path += '?update=true'
    return client.ppost(path, formData)
  }
}
