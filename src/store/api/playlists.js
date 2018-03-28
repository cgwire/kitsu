import client from './client'

export default {
  getPlaylists (production, callback) {
    client.get(`/api/data/projects/${production.id}/playlists`, callback)
  },

  getPlaylist (production, playlist, callback) {
    const path = `/api/data/projects/${production.id}/playlists/${playlist.id}`
    client.get(path, callback)
  },

  getShotPreviewFiles (shot, callback) {
    const path = `/api/data/shots/${shot.id}/preview-files`
    client.get(path, callback)
  },

  newPlaylist (playlist, callback) {
    const data = {
      name: playlist.name,
      project_id: playlist.production_id
    }
    client.post('/api/data/playlists/', data, callback)
  },

  updatePlaylist (playlist, callback) {
    const data = {
      name: playlist.name
    }
    if (playlist.shots) {
      data.shots = playlist.shots
    }

    client.put(`/api/data/playlists/${playlist.id}`, data, callback)
  },

  deletePlaylist (playlist, callback) {
    client.del(`/api/data/playlists/${playlist.id}`, callback)
  }
}
