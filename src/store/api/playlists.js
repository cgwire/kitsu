import client from './client'

export default {
  getPlaylists (production, episode, callback) {
    let path = `/api/data/projects/${production.id}`
    if (episode) {
      path += `/episodes/${episode.id}/playlists`
    } else {
      path += `/playlists`
    }
    client.get(path, callback)
  },

  getPlaylist (production, playlist, callback) {
    const path = `/api/data/projects/${production.id}/playlists/${playlist.id}`
    client.get(path, callback)
  },

  getShotPreviewFiles (shot) {
    const path = `/api/data/shots/${shot.id}/preview-files`
    return client.pget(path)
  },

  getEntityPreviewFiles (entity, callback) {
    const path = `/api/data/playlists/entities/${entity.id}/preview-files`
    client.get(path, callback)
  },

  newPlaylist (playlist, callback) {
    const data = {
      name: playlist.name,
      project_id: playlist.production_id,
      episode_id: playlist.episode_id
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
  },

  deleteBuildJob (job, callback) {
    return new Promise((resolve, reject) => {
      const path = `/api/data/playlists/${job.playlist_id}/jobs/${job.id}`
      client.del(path, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  },

  runPlaylistBuild (playlist) {
    return new Promise((resolve, reject) => {
      const path = `/api/data/playlists/${playlist.id}/build/mp4`
      client.get(path, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
