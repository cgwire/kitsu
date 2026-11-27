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
  },

  getEntityWorkingFiles(entityId) {
    return client.pget(`/api/data/entities/${entityId}/working-files`)
  },

  getPreviewFileText(previewFileId, extension, urlPrefix) {
    const base = urlPrefix || '/api'
    return client.getText(
      `${base}/pictures/originals/preview-files/${previewFileId}.${extension}`
    )
  },

  getAttachmentFileBlob(attachment) {
    return client.getBlob(
      `/api/data/attachment-files/${attachment.id}/file/${attachment.name}`
    )
  }
}
