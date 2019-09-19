import client from './client'

export default {
  getSequenceCasting (productionId, sequenceId) {
    const path =
      `/api/data/projects/${productionId}/sequences/${sequenceId}/casting`
    return client.pget(path)
  },

  getAssetTypeCasting (productionId, assetTypeId) {
    const path =
      `/api/data/projects/${productionId}/asset-types/${assetTypeId}/casting`
    return client.pget(path)
  },

  updateCasting (productionId, shotId, casting, callback) {
    const path =
      `/api/data/projects/${productionId}/entities/${shotId}/casting`
    return client.pput(path, casting)
  },

  postCastingCsv (production, formData) {
    const path = `/api/import/csv/projects/${production.id}/casting`
    return client.ppost(path, formData)
  }
}
