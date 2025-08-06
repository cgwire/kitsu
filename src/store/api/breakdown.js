import client from '@/store/api/client'

export default {
  getProductionEpisodesCasting(productionId) {
    const path = `/api/data/projects/${productionId}/episodes/casting`
    return client.pget(path)
  },

  getSequenceCasting(productionId, sequenceId, episodeId) {
    let path = `/api/data/projects/${productionId}/sequences/${sequenceId}/casting`
    if (episodeId && episodeId !== 'all') {
      path = `/api/data/projects/${productionId}/episodes/${episodeId}/sequences/all/casting`
    }
    return client.pget(path)
  },

  getAssetTypeCasting(productionId, assetTypeId) {
    const path = `/api/data/projects/${productionId}/asset-types/${assetTypeId}/casting`
    return client.pget(path)
  },

  updateCasting(productionId, entityId, casting) {
    const path = `/api/data/projects/${productionId}/entities/${entityId}/casting`
    return client.pput(path, casting)
  },

  postCastingCsv(production, formData) {
    const path = `/api/import/csv/projects/${production.id}/casting`
    return client.ppost(path, formData)
  },

  getAssetCastIn(asset) {
    return client.pget(`/api/data/assets/${asset.id}/cast-in`)
  },

  getEpisodeCasting(episode) {
    const path = `/api/data/projects/${episode.project_id}/entities/${episode.id}/casting`
    return client.pget(path)
  },

  getShotCasting(shot) {
    const path = `/api/data/projects/${shot.project_id}/entities/${shot.id}/casting`
    return client.pget(path)
  },

  getAssetCasting(asset) {
    const projectId = asset.project_id || asset.production_id
    const path = `/api/data/projects/${projectId}/entities/${asset.id}/casting`
    return client.pget(path)
  }
}
