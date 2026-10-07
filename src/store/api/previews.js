import client from '@/store/api/client'

export default {
  // The list route filters on a JSON list of ids and leaves out the preview
  // files the user cannot read.
  getPreviewFileStatuses(previewFileIds) {
    const ids = encodeURIComponent(JSON.stringify(previewFileIds))
    return client.pget(`/api/data/preview-files?id=${ids}&fields=id,status`)
  }
}
