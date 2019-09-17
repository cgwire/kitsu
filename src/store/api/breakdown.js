import client from './client'

export default {
  getSequenceCasting (sequenceId) {
    return client.pget(`/api/data/sequences/${sequenceId}/casting`)
  },

  updateCasting (shotId, casting, callback) {
    return client.pput(`/api/data/shots/${shotId}/casting`, casting)
  },

  postCastingCsv (production, formData) {
    const path = `/api/import/csv/projects/${production.id}/casting`
    return client.ppost(path, formData)
  }
}
