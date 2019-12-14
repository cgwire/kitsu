import client from './client'

export default {
  getShot (shotId, callback) {
    return client.getModel('shots', shotId)
  },

  getShots (production, episode, callback) {
    let path = '/api/data/shots/with-tasks'
    if (production) path += `?project_id=${production.id}`
    if (episode) path += `&episode_id=${episode.id}`
    client.get(path, callback)
  },

  getSequence (sequenceId) {
    return client.getModel('sequences', sequenceId)
  },

  getSequences (production, episode, callback) {
    let path = `/api/data/projects/${production.id}/sequences`
    if (episode) path = `/api/data/episodes/${episode.id}/sequences`
    client.get(path, callback)
  },

  getEpisode (episodeId) {
    return client.getModel('episodes', episodeId)
  },

  getEpisodes (production, callback) {
    let path = `/api/data/projects/${production.id}/episodes`
    client.get(path, callback)
  },

  getShotType (callback) {
    client.get('/api/data/shot-type', callback)
  },

  newShot (shot, callback) {
    const data = {
      name: shot.name,
      description: shot.description,
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
      description: shot.description,
      nb_frames: parseInt(shot.nb_frames),
      data: shot.data
    }
    if (
      shot.frameOut !== undefined ||
      shot.frameIn !== undefined ||
      shot.fps !== undefined
    ) {
      Object.assign(data.data, {
        frame_in: shot.frameIn,
        frame_out: shot.frameOut,
        fps: shot.fps
      })
    }
    client.put(`/api/data/entities/${shot.id}`, data, callback)
  },

  updateSequence (sequence, callback) {
    const data = {
      name: sequence.name,
      description: sequence.description
    }
    client.put(`/api/data/entities/${sequence.id}`, data, callback)
  },

  updateEpisode (episode, callback) {
    const data = {
      name: episode.name,
      description: episode.description
    }
    client.put(`/api/data/entities/${episode.id}`, data, callback)
  },

  deleteShot (shot, callback) {
    if (shot.canceled) {
      client.del(`/api/data/shots/${shot.id}?force=true`, callback)
    } else {
      client.del(`/api/data/shots/${shot.id}`, callback)
    }
  },

  deleteSequence (sequence, callback) {
    client.del(`/api/data/sequences/${sequence.id}?force=true`, callback)
  },

  deleteEpisode (episode, callback) {
    client.del(`/api/data/episodes/${episode.id}?force=true`, callback)
  },

  restoreShot (shot, callback) {
    const data = { canceled: false }
    client.put(`/api/data/entities/${shot.id}`, data, callback)
  },

  postCsv (production, formData, callback) {
    client.post(
      `/api/import/csv/projects/${production.id}/shots`,
      formData,
      callback
    )
  },

  getEpisodeStats (productionId) {
    return client.pget(`/api/data/projects/${productionId}/episodes/stats`)
  },

  loadShotHistory (shotId) {
    return client.pget(`/api/data/shots/${shotId}/versions`)
  }

}
