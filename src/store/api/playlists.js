import client from './client'

export default {
  getPlaylists (production, callback) {
    client.get(`/api/data/projects/${production.id}/playlists`, callback)
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
    client.put(`/api/data/playlists/${playlist.id}`, data, callback)
  },

  deletePlaylist (playlist, callback) {
    client.del(`/api/data/playlists/${playlist.id}`, callback)
  }
}
