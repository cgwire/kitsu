import client from '@/store/api/client'

export default {
  getFileStatuses() {
    return client.pget('/api/data/file-status')
  },

  getOutputTypes() {
    return client.pget('/api/data/output-types')
  },

  getEntityOutputFiles(entityId) {
    return client.pget(`/api/data/entities/${entityId}/output-files`)
  }
}
