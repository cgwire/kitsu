import client from './client'

export default {
  getShot (shotId, callback) {
    const path = `/api/data/shots/${shotId}`
    client.get(path, callback)
  },

  getShots (currentProduction, callback) {
    let path = '/api/data/shots/with-tasks'
    if (currentProduction) path += `?project_id=${currentProduction.id}`
    client.get(path, callback)
  },

  getSequences (currentProduction, callback) {
    let path = `/api/data/projects/${currentProduction.id}/sequences`
    client.get(path, callback)
  },

  getEpisodes (currentProduction, callback) {
    let path = `/api/data/projects/${currentProduction.id}/episodes`
    client.get(path, callback)
  },

  getShotType (callback) {
    client.get('/api/data/shot-type', callback)
  },

  newShot (shot, callback) {
    const data = {
      name: shot.name,
      sequence_id: shot.sequence_id
    }
    client.post(`/api/data/projects/${shot.project_id}/shots`, data, callback)
  },

  newSequence (sequence, callback) {
    const data = {
      name: sequence.name,
      episode_id: sequence.episode_id
    }
    client.post(
      `/api/data/projects/${sequence.project_id}/sequences`,
      data,
      callback
    )
  },

  newEpisode (episode, callback) {
    const data = {
      name: episode.name
    }
    client.post(
      `/api/data/projects/${episode.project_id}/episodes`,
      data,
      callback
    )
  },

  updateShot (shot, callback) {
    const data = {
      name: shot.name,
      parent_id: shot.sequence_id,
      description: shot.description
    }
    if (shot.frameIn || shot.frameOut) {
      data.data = {
        frame_in: shot.frameIn,
        frame_out: shot.frameOut
      }
    }
    client.put(`/api/data/entities/${shot.id}`, data, callback)
  },

  deleteShot (shot, callback) {
    client.del(`/api/data/shots/${shot.id}`, callback)
  },

  restoreShot (shot, callback) {
    const data = { canceled: false }
    client.put(`/api/data/entities/${shot.id}`, data, callback)
  },

  getCasting (shot, callback) {
    client.get(`/api/data/shots/${shot.id}/casting`, callback)
  },

  updateCasting (shot, casting, callback) {
    client.put(`/api/data/shots/${shot.id}/casting`, casting, callback)
  },

  postCsv (production, formData, callback) {
    client.post(
      `/api/import/csv/projects/${production.id}/shots`,
      formData,
      callback
    )
  }
}
