import client from '@/store/api/client'

export default {
  getEntityNews (entityId) {
    return client.pget(`/api/data/entities/${entityId}/news`)
  },

  getEntityPreviewFiles (entityId) {
    return client.pget(`/api/data/entities/${entityId}/preview-files`)
  },

  getEntityTimeLogs (entityId) {
    return client.pget(`/api/data/entities/${entityId}/time-spents`)
  }
}
