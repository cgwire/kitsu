import client from '@/store/api/client'

export default {
  getTaskWorkingFiles(taskId) {
    return client.pget(`/api/data/tasks/${taskId}/working-files`)
  },

  getWorkingSoftwares() {
    return client.pget('/api/data/softwares')
  },

  createTaskWorkingFile(taskId, data) {
    return client.ppost(`/api/data/tasks/${taskId}/working-files/new`, data)
  },

  uploadWorkingFile(workingFileId, formData) {
    return client.ppostFile(
      `/api/data/working-files/${workingFileId}/file`,
      formData
    )
  },

  getWorkingFileBlob(workingFileId) {
    return client.getBlob(`/api/data/working-files/${workingFileId}/file`)
  },

  getFileStatuses() {
    return client.pget('/api/data/file-status')
  },

  getOutputTypes() {
    return client.pget('/api/data/output-types')
  },

  getEntityOutputFiles(entityId) {
    return client.pget(`/api/data/entities/${entityId}/output-files`)
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
