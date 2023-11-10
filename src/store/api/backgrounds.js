import client from '@/store/api/client'

export default {
  getBackgrounds() {
    return client.pget('/api/data/preview-background-files')
  },

  getBackground(backgroundId) {
    return client.pget(`/api/data/preview-background-files/${backgroundId}`)
  },

  newBackground(background) {
    return client.ppost('/api/data/preview-background-files/', background)
  },

  updateBackground(background) {
    return client.pput(
      `/api/data/preview-background-files/${background.id}`,
      background
    )
  },

  deleteBackground(background) {
    return client.pdel(`/api/data/preview-background-files/${background.id}`)
  },

  uploadBackgroundImage(background, formData) {
    return client.ppost(
      `/api/pictures/preview-background-files/${background.id}`,
      formData
    )
  }
}
